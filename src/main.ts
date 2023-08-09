import path from 'path';
import * as process from 'process';

import {NestFactory} from '@nestjs/core';
import * as dotenv from 'dotenv';

import {AppModule} from '@app/app.module';
import {LoggerService} from '@app/service';

async function bootstrap() {
  dotenv.config({path: path.resolve(__dirname, './config/.env')});

  const logger = LoggerService('WEB');

  const app = await NestFactory.create(AppModule, {logger: logger});

  await app.listen(process.env.PORT || 3000, '0.0.0.0');
  logger.log(`Application is running on: ${process.env.PORT || 3000} PORT`, 'ROOT');
}
bootstrap();
