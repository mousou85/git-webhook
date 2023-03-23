import {BadRequestException, Controller, Post} from '@nestjs/common';

import {AppService, GithubService} from '@app/service';

@Controller()
export class AppController {
  constructor(private appService: AppService, private githubService: GithubService) {}

  @Post('/')
  webhook() {
    //set vars: 깃 서비스 이름
    const gitServiceName = this.appService.getGitServiceName();
    if (!gitServiceName) {
      throw new BadRequestException('Invalid request');
    }

    //서비스별 이벤트 처리 분리
    if (gitServiceName == 'github') {
      if (this.githubService.isPing()) {
        return 'ping success';
      } else {
        this.githubService.eventProcessor().then();
      }
    }
    return 'response success';
  }
}
