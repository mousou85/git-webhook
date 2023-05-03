import path from 'path';

import * as dotenv from 'dotenv';
import {CommandFactory} from 'nest-commander';

import {CliModule} from '@app/cli.module';

async function bootstrap() {
  dotenv.config({path: path.resolve(__dirname, './config/.env')});

  await CommandFactory.run(CliModule);
}
bootstrap();
