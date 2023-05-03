import {Module} from '@nestjs/common';

import {CliCommand} from '@app/cli.command';
import {CliService} from '@app/service';

@Module({
  providers: [CliService, CliCommand],
  imports: [],
})
export class CliModule {}
