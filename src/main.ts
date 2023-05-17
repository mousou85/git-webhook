import path from 'path';
import * as process from 'process';

import {NestFactory} from '@nestjs/core';
import * as dotenv from 'dotenv';

import {AppModule} from '@app/app.module';
import {LoggerService} from '@app/service';

async function bootstrap() {
  dotenv.config({path: path.resolve(__dirname, './config/.env')});

  const app = await NestFactory.create(AppModule, {logger: LoggerService('WEB')});

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
}
bootstrap();
