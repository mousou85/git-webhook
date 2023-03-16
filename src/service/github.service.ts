import {execSync} from 'child_process';
import * as crypto from 'crypto';

import {BadRequestException, Inject, Injectable, Logger, LoggerService} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ClsService} from 'nestjs-cls';

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
      event: headers['x-github-event'],
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
    const config = <IRepositoryConfigItem>this.appService.getConfig({
      gitServiceName: requestInfo.gitServiceName,
      repositoryName: requestInfo.repositoryName,
      branch: requestInfo.branch,
    });

    if (!config) {
      throw new BadRequestException('Config information not found');
    }

    if (!this.verifySignature(config.secret, requestInfo.signature, requestInfo.rawPayload)) {
      throw new BadRequestException('Authentication failed');
    }

    const contentType = requestInfo.contentType.toLowerCase();
    if (contentType != 'application/json') {
      throw new BadRequestException('content-type only allows application/json');
    }

    if (!config.action[requestInfo.event]) {
      throw new BadRequestException(`config has no ${requestInfo.event} event action`);
    }

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
