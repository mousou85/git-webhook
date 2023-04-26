import {Module} from '@nestjs/common';

import {TestCommand} from '@app/command';

@Module({
  providers: [TestCommand],
})
export class CliModule {}
