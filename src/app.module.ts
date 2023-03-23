import {Logger, Module} from '@nestjs/common';
import {ClsModule} from 'nestjs-cls';

import {AppController} from '@app/app.controller';
import {AppService, GithubService} from '@app/service';

@Module({
  imports: [ClsModule.forRoot({global: true, middleware: {mount: true}})],
  controllers: [AppController],
  providers: [Logger, AppService, GithubService],
})
export class AppModule {}
