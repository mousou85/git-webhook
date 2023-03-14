import {Injectable} from '@nestjs/common';
import {ConfigService} from '@nestjs/config';
import {CLS_REQ, ClsService} from 'nestjs-cls';

import {IRepositoryConfig} from '@app/interface';

@Injectable()
export class AppService {
  constructor(
    private configService: ConfigService<IRepositoryConfig>,
    private clsService: ClsService
  ) {}

  getHeaders(): Record<string, string> {
    const {headers} = this.clsService.get(CLS_REQ);
    return headers;
  }

  getPayload(): Record<string, any> {
    const {body} = this.clsService.get(CLS_REQ);
    return body;
  }

  getConfig(): IRepositoryConfig {
    return this.configService.get('repository', {infer: true});
  }
}
