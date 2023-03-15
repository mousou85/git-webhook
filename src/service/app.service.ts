import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {CLS_REQ, ClsService} from 'nestjs-cls';

import {EGitService} from '@app/app.enum';
import {IRepositoryConfig, IRepositoryConfigItem} from '@app/interface';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService<IRepositoryConfig>,
    private clsService: ClsService
  ) {}

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

  getHeaders(): Record<string, string> {
    const {headers} = this.clsService.get(CLS_REQ);
    return headers;
  }

  getPayload(): Record<string, any> {
    const {body} = this.clsService.get(CLS_REQ);
    return body;
  }

  getConfig(opts?: {
    gitServiceName: EGitService;
    repositoryName: string;
    branch: string;
  }): IRepositoryConfigItem[] | IRepositoryConfigItem {
    const config = this.configService.get('repository', {infer: true});
    if (opts) {
      const {gitServiceName, repositoryName, branch} = opts;

      let configItem: IRepositoryConfigItem;
      for (const item of config) {
        if (
          item.service == gitServiceName &&
          item.repository == repositoryName &&
          item.branch == branch
        ) {
          configItem = item;
        }
      }

      return configItem;
    } else {
      return config;
    }
  }
}
