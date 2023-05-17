import {Logger} from '@nestjs/common';
import {CommandRunner, DefaultCommand as DefaultCommandDecorator, Option} from 'nest-commander';

import {CliService} from '@app/service';
import {Helper} from '@app/shared';

@DefaultCommandDecorator({
  description: '큐 파일에 있는 명령을 실행합니다.',
  // options: {isDefault: true},
})
export class CliCommand extends CommandRunner {
  protected readonly logger = new Logger();

  constructor(private cliService: CliService) {
    super();
  }

  async run(inputs: string[], options: {file?: string}): Promise<void> {
    //set vars: options
    let {file} = options;

    while (true) {
      //set vars: queue data
      const queue = await this.cliService.readQueFile(file);
      if (queue.length) {
        //명령어 실행
        for (const item of queue) {
          this.cliService.execCmd(item);
        }
      }

      await Helper.sleep(5000);
    }
  }

  @Option({flags: '-F, --file <file>', description: '큐 파일'})
  parseFile(val: string) {
    return val;
  }
}
