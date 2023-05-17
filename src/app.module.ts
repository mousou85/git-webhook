import {Logger, MiddlewareConsumer, Module, NestModule} from '@nestjs/common';
import {ClsModule} from 'nestjs-cls';

import {AppController} from '@app/app.controller';
import {HttpLoggerMiddleware} from '@app/httpLogger.middleware';
import {AppService, GithubService} from '@app/service';

@Module({
  imports: [ClsModule.forRoot({global: true, middleware: {mount: true}})],
  controllers: [AppController],
  providers: [Logger, AppService, GithubService],
  exports: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(HttpLoggerMiddleware).forRoutes('*');
  }
}
