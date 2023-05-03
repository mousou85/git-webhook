import * as crypto from 'crypto';
import fs from 'fs';

import {BadRequestException, Injectable} from '@nestjs/common';
import {ClsService} from 'nestjs-cls';

import {EGithubEvent} from '@app/app.enum';
import {IRepositoryConfigWebhook, IRequestInfo} from '@app/interface';
import {AppService} from '@app/service/app.service';

@Injectable()
export class GithubService {
  constructor(private clsService: ClsService, private appService: AppService) {}

  /**
   * webhook ping 이벤트 인지 여부
   */
  isPing(): boolean {
    //set vars: 헤더
    const headers = this.appService.getHeaders();
    return headers['x-github-event'] == EGithubEvent.ping;
  }

  /**
   * webhook ping 이벤트 처리
   */
  pingProcessor(): string {
    //set vars: 헤더
    const headers = this.appService.getHeaders();

    //set vars: payload, signature, config
    const payload = this.appService.getPayload();
    const signature = this.extractSignature(headers['x-hub-signature']);

    //request content-type 체크
    const contentType = headers['content-type'].toLowerCase();
    if (contentType != 'application/json') {
      throw new BadRequestException('content-type only allows application/json');
    }

    //set vars: config
    const configItem = this.appService.getConfigItem('github', payload['repository']['name']);

    if (!configItem) {
      throw new BadRequestException('Config information not found');
    }

    //signature에 맞는 webhook 가져옴
    let isVerifyWebhook = false;
    for (const webhook of configItem.webhooks) {
      if (this.verifySignature(webhook.secret, signature, payload)) {
        isVerifyWebhook = true;
        break;
      }
    }
    if (!isVerifyWebhook) {
      throw new BadRequestException('Authentication failed');
    }

    return 'ping success';
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
  eventProcessor() {
    //set vars: request 데이터
    const requestInfo = this.getRequestInfo();

    //request content-type 체크
    const contentType = requestInfo.contentType.toLowerCase();
    if (contentType != 'application/json') {
      throw new BadRequestException('content-type only allows application/json');
    }

    //set vars: 설정 데이터
    const configItem = this.appService.getConfigItem('github', requestInfo.repositoryName);
    let webhook: IRepositoryConfigWebhook;
    for (const item of configItem.webhooks) {
      if (
        item.branch == requestInfo.branch &&
        this.verifySignature(item.secret, requestInfo.signature, requestInfo.rawPayload)
      ) {
        webhook = item;
        break;
      }
    }

    if (!webhook) {
      throw new BadRequestException('Config information not found or authentication failed');
    }

    //working dir 유무 확인
    if (!fs.existsSync(webhook.working_dir)) {
      throw new BadRequestException('working dir does not exist');
    }

    //request webhook event에 관련된 처리 설정 있는지 확인
    if (!webhook.action[requestInfo.event] || !webhook.action[requestInfo.event].length) {
      throw new BadRequestException(`config has no ${requestInfo.event} event action`);
    }

    //set vars: event 처리 관련 설정
    const eventActions = <string[]>webhook.action[requestInfo.event];

    //que 파일에 기록
    this.appService.writeQueueFile({
      service: configItem.service,
      repository: configItem.repository,
      branch: webhook.branch,
      workingDir: webhook.working_dir,
      event: requestInfo.event,
      actions: eventActions,
    });
  }
}
