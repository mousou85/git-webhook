import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';

import {Inject, Injectable, Logger, LoggerService} from '@nestjs/common';
import * as yaml from 'js-yaml';
import {CLS_REQ, ClsService} from 'nestjs-cls';

import {EGitService} from '@app/app.enum';
import {IRepositoryConfigItem} from '@app/interface';

@Injectable()
export class AppService {
  constructor(
    private clsService: ClsService,
    @Inject(Logger)
    private logger: LoggerService
  ) {}

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
   * 설정 반환
   * - config.yaml에 정의된 설정 반환
   * - opts 지정되지 않으면 전체 설정 반환
   * - opts 지정되어 있으면 해당 설정만 반환
   * @param opts
   */
  getConfig(opts?: {
    gitServiceName: EGitService;
    repositoryName: string;
    branch?: string;
  }): IRepositoryConfigItem[] | IRepositoryConfigItem {
    const configPath = path.resolve(__dirname, './config/app.config.yaml');
    console.log(configPath);
    const config = yaml.load(fs.readFileSync(configPath, 'utf8'))['repository'];
    console.log(config);

    //set vars: 전체 설정 데이터
    if (opts) {
      const {gitServiceName, repositoryName, branch} = opts;

      let configItem: IRepositoryConfigItem;
      for (const item of config) {
        if (branch) {
          if (
            item.service == gitServiceName &&
            item.repository == repositoryName &&
            item.branch == branch
          ) {
            configItem = item;
            break;
          }
        } else {
          if (item.service == gitServiceName && item.repository == repositoryName) {
            configItem = item;
            break;
          }
        }
      }

      return configItem;
    } else {
      return config;
    }
  }

  /**
   * 명령어 목록 실행
   * @param workingDir 작업 dir
   * @param cmdList 명령어 목록
   */
  execCmd(workingDir: string, cmdList: string[]): void {
    try {
      this.logger.debug(`cmd working dir: ${workingDir}`);
      for (const cmd of cmdList) {
        this.logger.debug(`execute cmd: "${cmd}"`);
        const stdout = execSync(cmd, {encoding: 'utf8', cwd: workingDir});
        this.logger.debug(`execute output: ${stdout}`);
      }
    } catch (err) {
      this.logger.error(err);
    }
  }
}
