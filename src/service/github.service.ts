import {execSync} from 'child_process';
import * as crypto from 'crypto';

import {BadRequestException, Inject, Injectable, Logger, LoggerService} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ClsService} from 'nestjs-cls';

import {EGithubEvent} from '@app/app.enum';
import {IRepositoryConfig, IRepositoryConfigItem, IRequestInfo} from '@app/interface';
import {AppService} from '@app/service/app.service';

@Injectable()
export class GithubService {
  constructor(
    private configService: ConfigService<IRepositoryConfig>,
    private clsService: ClsService,
    private appService: AppService,
    @Inject(Logger)
    private logger: LoggerService
  ) {}

  isPing(): boolean {
    //set vars: 헤더
    const headers = this.getHeaders();

    if (headers['x-github-event'] != EGithubEvent.ping) {
      return false;
    }

    //set vars: payload, signature, config
    const payload = this.appService.getPayload();
    const signature = this.extractSignature(headers['x-hub-signature']);
    const config = <IRepositoryConfigItem>this.appService.getConfig({
      gitServiceName: 'github',
      repositoryName: payload['repository']['name'],
    });

    if (!config) {
      throw new BadRequestException('Config information not found');
    }

    //request content-type 체크
    const contentType = headers['content-type'].toLowerCase();
    if (contentType != 'application/json') {
      throw new BadRequestException('content-type only allows application/json');
    }

    //signature 검증
    if (!this.verifySignature(config.secret, signature, payload)) {
      throw new BadRequestException('Authentication failed');
    }

    return true;
  }

  protected getHeaders(): Record<string, string> {
    //set vars: 헤더
    const headers = this.appService.getHeaders();

    //set vars: 헤더에서 필요 정보만 추출
    const lowercaseHeaders = {};
    for (const headerKey of Object.keys(headers)) {
      lowercaseHeaders[headerKey.toLowerCase()] =
        headers[headerKey] ?? headers[headerKey.toLowerCase()];
    }

    return lowercaseHeaders;
  }

  protected extractSignature(signatureHeader: string): string {
    return signatureHeader.replace('sha1=', '');
  }

  /**
   * request 데이터중 처리에 필요한 정보만 추출하여 반환
   */
  getRequestInfo(): IRequestInfo {
    //set vars: 헤더, payload
    const headers = this.getHeaders();
    const payload = this.appService.getPayload();

    //set vars: 브랜치명, webhook signature
    const branch = payload['ref'].replace('refs/heads/', '');
    const signature = this.extractSignature(headers['x-hub-signature']);

    return {
      gitServiceName: 'github',
      contentType: headers['content-type'],
      userAgent: headers['user-agent'],
      event: headers['x-github-event'],
      repositoryName: payload['repository']['name'],
      branch: branch,
      signature: signature,
      rawHeaders: headers,
      rawPayload: payload,
    };
  }

  /**
   * webhook signature 검증
   * @param secret webhook secret
   * @param signature request header의 signature 값
   * @param rawPayload request payload
   */
  verifySignature(secret: string, signature: string, rawPayload: Record<string, any>) {
    if (typeof secret != 'string') secret = (secret as any).toString();

    const encryptSecret = crypto
      .createHmac('sha1', secret)
      .update(JSON.stringify(rawPayload))
      .digest('hex');

    return signature === encryptSecret;
  }

  /**
   * webhook 이벤트 처리
   */
  eventProcessor() {
    //set vars: request 데이터
    const requestInfo = this.getRequestInfo();

    //set vars: 설정 데이터
    const config = <IRepositoryConfigItem>this.appService.getConfig({
      gitServiceName: requestInfo.gitServiceName,
      repositoryName: requestInfo.repositoryName,
      branch: requestInfo.branch,
    });

    if (!config) {
      throw new BadRequestException('Config information not found');
    }

    //signature 검증
    if (!this.verifySignature(config.secret, requestInfo.signature, requestInfo.rawPayload)) {
      throw new BadRequestException('Authentication failed');
    }

    //request content-type 체크
    const contentType = requestInfo.contentType.toLowerCase();
    if (contentType != 'application/json') {
      throw new BadRequestException('content-type only allows application/json');
    }

    //request webhook event에 관련된 처리 설정 있는지 확인
    if (!config.action[requestInfo.event]) {
      throw new BadRequestException(`config has no ${requestInfo.event} event action`);
    }

    //set vars: event 처리 관련 설정
    const eventActions = <string[]>config.action[requestInfo.event];

    try {
      for (const cmd of eventActions) {
        const stdout = execSync(cmd, {encoding: 'utf8', cwd: config.working_dir});
        this.logger.log(stdout);
      }
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }
}
