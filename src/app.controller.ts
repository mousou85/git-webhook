import {BadRequestException, Controller, Post} from '@nestjs/common';

import {EGitService} from '@app/app.enum';
import {GitServiceName} from '@app/decorator';
import {GithubService} from '@app/service';

@Controller()
export class AppController {
  constructor(private githubService: GithubService) {}

  @Post('/')
  webhook(@GitServiceName() gitServiceName: EGitService) {
    if (!gitServiceName) {
      throw new BadRequestException('Invalid request');
    }

    if (gitServiceName == 'github') {
      this.githubService.eventProcessor();
    }
    // const headers = this.appService.getRequestHeaders(gitServiceName);
    // console.log(headers);
  }
}
