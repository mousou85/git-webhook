import {Module} from '@nestjs/common';

import {DefaultCommand} from '@app/command';

@Module({
  providers: [DefaultCommand],
})
export class CliModule {}
