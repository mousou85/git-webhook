import {BadRequestException, Controller, Post} from '@nestjs/common';

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
      this.githubService.eventProcessor();
    }
  }
}
