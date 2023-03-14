import {Module} from '@nestjs/common';
import {ConfigModule} from '@nestjs/config';
import {ClsModule} from 'nestjs-cls';

import appConfig from '@app/app.config';
import {AppController} from '@app/app.controller';
import {AppService} from '@app/app.service';

@Module({
  imports: [
    ConfigModule.forRoot({isGlobal: true, load: [appConfig]}),
    ClsModule.forRoot({global: true, middleware: {mount: true}}),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
