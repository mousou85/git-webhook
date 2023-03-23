import * as process from 'process';

import {NestFactory} from '@nestjs/core';
import * as dotenv from 'dotenv';

import {AppModule} from '@app/app.module';

async function bootstrap() {
  dotenv.config();

  const app = await NestFactory.create(AppModule);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
