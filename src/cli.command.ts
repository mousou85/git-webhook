import {CommandRunner, DefaultCommand as DefaultCommandDecorator, Option} from 'nest-commander';

import {CliService} from '@app/service';

@DefaultCommandDecorator({
  description: '큐 파일에 있는 명령을 실행합니다.',
  // options: {isDefault: true},
})
export class CliCommand extends CommandRunner {
  constructor(private cliService: CliService) {
    super();
  }

  async run(inputs: string[], options: {file?: string}): Promise<void> {
    //set vars: options
    let {file} = options;

    //set vars: queue data
    const queue = await this.cliService.readQueFile(file);

    console.log(queue);
    return;
  }

  @Option({flags: '-F, --file <file>', description: '큐 파일'})
  parseFile(val: string) {
    return val;
  }
}
