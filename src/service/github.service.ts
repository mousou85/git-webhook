import * as crypto from 'crypto';
import fs from 'fs';

import {BadRequestException, Injectable} from '@nestjs/common';
import {ClsService} from 'nestjs-cls';

import {EGithubEvent} from '@app/app.enum';
import {IRepositoryConfigItem, IRequestInfo} from '@app/interface';
import {AppService} from '@app/service/app.service';

@Injectable()
export class GithubService {
  constructor(private clsService: ClsService, private appService: AppService) {}

  /**
   * webhook ping 이벤트 처리
   */
  isPing(): boolean {
    //set vars: 헤더
    const headers = this.appService.getHeaders();

    //ping 이벤트 확인
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

  /**
   * signature 헤더에서 값만 추출
   * @param signatureHeader
   * @protected
   */
  protected extractSignature(signatureHeader: string): string {
    return signatureHeader.replace('sha1=', '');
  }

  /**
   * request 데이터중 처리에 필요한 정보만 추출하여 반환
   */
  getRequestInfo(): IRequestInfo {
    //set vars: 헤더, payload
    const headers = this.appService.getHeaders();
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
  async eventProcessor() {
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

    //working dir 유무 확인
    if (!fs.existsSync(config.working_dir)) {
      throw new BadRequestException('working dir does not exist');
    }

    //request webhook event에 관련된 처리 설정 있는지 확인
    if (!config.action[requestInfo.event]) {
      throw new BadRequestException(`config has no ${requestInfo.event} event action`);
    }

    //set vars: event 처리 관련 설정
    const eventActions = <string[]>config.action[requestInfo.event];

    //명령어 실행
    this.appService.execCmd(config.working_dir, eventActions);
  }
}
