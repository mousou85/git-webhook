import fs from 'fs';
import path from 'path';

import {BadRequestException, Injectable, Logger} from '@nestjs/common';
import * as yaml from 'js-yaml';
import {CLS_REQ, ClsService} from 'nestjs-cls';

import {EGitService} from '@app/app.enum';
import {IRepositoryConfig, IRepositoryConfigItem} from '@app/interface';

@Injectable()
export class AppService {
  protected static queFileName = 'queue.ndjson';
  protected readonly logger = new Logger('AppService');

  constructor(private clsService: ClsService) {
    if (process.env.QUEUE_FILE_NAME) {
      AppService.queFileName = process.env.QUEUE_FILE_NAME;
    }
  }

  /**
   * 깃 서비스 이름 반환
   */
  getGitServiceName(): EGitService {
    const headers = this.getHeaders();

    for (const key of Object.keys(headers)) {
      if (/^x-github-.*/i.test(key)) {
        return 'github';
      } else if (/^x-gitlab-.*/i.test(key)) {
        return 'gitlab';
      }
    }

    return undefined;
  }

  /**
   * request 헤더 데이터 반환
   * - key는 lowercase 처리
   */
  getHeaders(): Record<string, string> {
    const {headers} = this.clsService.get(CLS_REQ);
    const lowercaseHeaders = {};
    for (const headerKey of Object.keys(headers)) {
      lowercaseHeaders[headerKey.toLowerCase()] = headers[headerKey];
    }
    return lowercaseHeaders;
  }

  /**
   * request payload 반환
   */
  getPayload(): Record<string, any> {
    const {body} = this.clsService.get(CLS_REQ);
    return body;
  }
  /**
   * 설정 파일 내용 반환
   */
  getConfig(): IRepositoryConfig | undefined {
    const configPath = path.resolve(__dirname, './config/app.config.yaml');
    if (!fs.existsSync(configPath)) {
      const errorMsg = 'config file does not exists';
      this.logger.error(`${configPath} ${errorMsg}`);
      throw new BadRequestException(errorMsg);
    }
    return <IRepositoryConfig>yaml.load(fs.readFileSync(configPath, 'utf8'));
  }

  /**
   * 설정 파일에서 해당 repository 정보 반환
   * @param gitServiceName
   * @param repositoryName
   */
  getConfigItem(
    gitServiceName: EGitService,
    repositoryName: string
  ): IRepositoryConfigItem | undefined {
    const config = this.getConfig();

    let configItem: IRepositoryConfigItem;

    for (const item of config.repository) {
      if (item.service == gitServiceName && item.repository == repositoryName) {
        configItem = item;
        break;
      }
    }

    return configItem;
  }

  /**
   * que 파일에 webhook으로 처리할 내용 기록
   * @param data
   */
  writeQueueFile(data: {
    service: EGitService;
    repository: string;
    branch: string;
    workingDir: string;
    event: string;
    actions: string[];
  }) {
    //set vars: que 파일 경로
    const queFilePath = path.resolve(__dirname, `./${AppService.queFileName}`);

    //set vars: que 파일에 기록할 내용
    const {service, repository, branch, workingDir, event, actions} = data;

    try {
      fs.appendFileSync(
        queFilePath,
        JSON.stringify({service, repository, branch, workingDir, event, actions}),
        {encoding: 'utf8'}
      );
    } catch (err) {
      this.logger.error(err.message, err.stack);
      throw new BadRequestException(err);
    }
  }
}
