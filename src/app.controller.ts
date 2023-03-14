import {BadRequestException, Controller, Post} from '@nestjs/common';

import {AppService} from '@app/app.service';

@Controller()
export class AppController {
  constructor(private appService: AppService) {}

  @Post('/')
  webhook() {
    // @Body() body: object // @Headers() headers: object,
    const gitServiceName = this.appService.requestFrom();
    if (!gitServiceName) {
      throw new BadRequestException('Invalid request');
    }

    const headers = this.appService.getHeaders(gitServiceName);
    console.log(headers);
  }
}
