import fs from 'fs';
import path from 'path';
import * as process from 'process';
import * as readline from 'readline';

import {CommandRunner, DefaultCommand as DefaultCommandDecorator, Option} from 'nest-commander';

@DefaultCommandDecorator({
  description: '큐 파일에 있는 명령을 실행합니다.',
  // options: {isDefault: true},
})
export class DefaultCommand extends CommandRunner {
  constructor() {
    super();
  }

  async run(inputs: string[], options: {file?: string}): Promise<void> {
    //set vars: options
    let {file} = options;

    //set vars: file full path
    if (file) {
      file = path.resolve(process.cwd(), file);
    } else {
      file = path.resolve(process.cwd(), './queue.ndjson');
    }

    if (!fs.existsSync(file)) {
      console.error('file does not exists');
      console.error(`Is the file path ${file} correct?`);
      return;
    }

    const fileStream = fs.createReadStream(file);
    const queue = [];
    try {
      for await (const line of readline.createInterface(fileStream)) {
        queue.push(line);
      }
    } finally {
      fileStream.destroy();
    }

    console.log(queue);
  }

  @Option({flags: '-F, --file <file>', description: '큐 파일'})
  parseFile(val: string) {
    return val;
  }
}
