import fs from 'fs';
import path from 'path';
import * as process from 'process';
import * as readline from 'readline';

import {Injectable} from '@nestjs/common';

import {IQueue} from '@app/interface';

@Injectable()
export class CliService {
  protected static queFileName = 'queue.ndjson';

  constructor() {
    if (process.env.QUEUE_FILE_NAME) {
      CliService.queFileName = process.env.QUEUE_FILE_NAME;
    }
  }

  /**
   * 큐 파일 읽기
   * @param file
   */
  async readQueFile(file?: string): Promise<IQueue[]> {
    //set vars: file full path
    file = file || CliService.queFileName;
    file = path.resolve(process.cwd(), file);

    if (!fs.existsSync(file)) {
      console.error('file does not exists');
      console.error(`Is the file path ${file} correct?`);
      return;
    }

    //한줄씩 읽어드림
    const fileStream = fs.createReadStream(file);
    const queue: IQueue[] = [];
    try {
      for await (const line of readline.createInterface(fileStream)) {
        queue.push(JSON.parse(line));
      }
    } finally {
      fileStream.destroy();
    }

    return queue;
  }
}
