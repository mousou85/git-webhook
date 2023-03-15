import * as crypto from 'crypto';

import {BadRequestException, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ClsService} from 'nestjs-cls';

import {IRepositoryConfig, IRequestInfo} from '@app/interface';
import {AppService} from '@app/service/app.service';

@Injectable()
export class GithubService {
  constructor(
    private configService: ConfigService<IRepositoryConfig>,
    private clsService: ClsService,
    private appService: AppService
  ) {}

  getRequestInfo(): IRequestInfo {
    const headers = this.appService.getHeaders();
    const payload = this.appService.getPayload();

    const lowercaseHeaders = {};
    for (const headerKey of Object.keys(headers)) {
      lowercaseHeaders[headerKey.toLowerCase()] = headers[headerKey];
    }
    const branch = payload['ref'].replace('refs/heads/', '');
    const signature = headers['x-hub-signature'].replace('sha1=', '');

    return {
      gitServiceName: 'github',
      contentType: headers['content-type'],
      userAgent: headers['user-agent'],
      action: headers['x-github-event'],
      repositoryName: payload['repository']['name'],
      branch: branch,
      signature: signature,
      rawHeaders: lowercaseHeaders,
      rawPayload: payload,
    };
  }

  verifySignature(secret: string, signature: string, rawPayload: Record<string, any>) {
    if (typeof secret != 'string') secret = (secret as any).toString();

    const encryptSecret = crypto
      .createHmac('sha1', secret)
      .update(JSON.stringify(rawPayload))
      .digest('hex');

    return signature === encryptSecret;
  }

  eventProcessor() {
    const requestInfo = this.getRequestInfo();

    const contentType = requestInfo.contentType.toLowerCase();
    if (contentType != 'application/json') {
      throw new BadRequestException('content-type only allows application/json');
    }
  }
}
