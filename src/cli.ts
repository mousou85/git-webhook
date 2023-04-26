import {CommandFactory} from 'nest-commander';

import {CliModule} from '@app/cli.module';

async function bootstrap() {
  await CommandFactory.run(CliModule);
}
bootstrap();
