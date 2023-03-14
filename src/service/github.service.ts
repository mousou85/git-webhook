import {BadRequestException, Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {ClsService} from 'nestjs-cls';

import {IGithubPayload, IRepositoryConfig} from '@app/interface';
import {AppService} from '@app/service/app.service';
import {githubHeaderKeys, TGithubHeaders} from '@app/type';

@Injectable()
export class GithubService {
  constructor(
    private configService: ConfigService<IRepositoryConfig>,
    private clsService: ClsService,
    private appService: AppService
  ) {}

  getHeaders() {
    const headers = this.appService.getHeaders();

    let extractHeaders = {} as TGithubHeaders;
    for (const key of githubHeaderKeys) {
      extractHeaders[key] = headers[key] ?? headers[key.toLowerCase()];
    }

    return extractHeaders;
  }

  getPayload(): IGithubPayload {
    const headers = this.getHeaders();
    const body = this.appService.getPayload();

    return {
      repositoryName: body['repository']['name'],
      repositoryFullName: body['repository']['full_name'],
      ref: body['ref'],
      action: headers['X-GitHub-Event'],
      rawPayload: body,
    };
  }

  verifySignature(secret: string, signature: string) {}

  eventProcessor() {
    const headers = this.getHeaders();
    const payload = this.getPayload();

    const contentType = headers['content-type'].toLowerCase();
    if (contentType != 'application/json') {
      throw new BadRequestException('content-type only allows application/json');
    }
  }
}
