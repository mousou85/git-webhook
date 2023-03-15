import {BadRequestException, Controller, Post} from '@nestjs/common';

import {IRepositoryConfigItem} from '@app/interface';
import {AppService, GithubService} from '@app/service';

@Controller()
export class AppController {
  constructor(private appService: AppService, private githubService: GithubService) {}

  @Post('/')
  webhook() {
    const gitServiceName = this.appService.getGitServiceName();
    if (!gitServiceName) {
      throw new BadRequestException('Invalid request');
    }

    if (gitServiceName == 'github') {
      const requestInfo = this.githubService.getRequestInfo();
      const config = <IRepositoryConfigItem>this.appService.getConfig({
        gitServiceName: requestInfo.gitServiceName,
        repositoryName: requestInfo.repositoryName,
        branch: requestInfo.branch,
      });

      if (!config) {
        throw new BadRequestException('Config information not found');
      }

      if (
        !this.githubService.verifySignature(
          config.secret,
          requestInfo.signature,
          requestInfo.rawPayload
        )
      ) {
        throw new BadRequestException('Authentication failed');
      }
    }
  }
}
