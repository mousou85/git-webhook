import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {CLS_REQ, ClsService} from 'nestjs-cls';

import {EGitService} from '@app/app.enum';
import {IRepositoryConfig} from '@app/interface';
import {githubHeaderKeys, TGithubHeaders} from '@app/type';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService<IRepositoryConfig>,
    private clsService: ClsService
  ) {}

  getHeaders(gitServiceName?: EGitService): Record<string, string> | TGithubHeaders {
    const {headers} = this.clsService.get(CLS_REQ);
    if (!gitServiceName) return headers;

    let extractHeaders = {};
    if (gitServiceName == 'github') {
      for (const key of githubHeaderKeys) {
        extractHeaders[key] = headers[key] ?? headers[key.toLowerCase()];
      }
    }

    return extractHeaders;
  }

  getBody(): Record<string, any> {
    const {body} = this.clsService.get(CLS_REQ);
    return body;
  }

  getConfig(): IRepositoryConfig {
    return this.configService.get('repository', {infer: true});
  }

  requestFrom(): EGitService | null {
    const headers = this.getHeaders();
    for (const key of Object.keys(headers)) {
      if (/^x-github-.*/i.test(key)) {
        return 'github';
      } else if (/^x-gitlab-.*/i.test(key)) {
        return 'gitlab';
      }
    }

    return null;
  }
}
