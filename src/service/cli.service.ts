import {execSync} from 'child_process';
import fs from 'fs';
import path from 'path';
import * as process from 'process';
import * as readline from 'readline';

import {Injectable, Logger} from '@nestjs/common';

import {IQueue} from '@app/interface';

@Injectable()
export class CliService {
  protected static queFileName = 'queue.ndjson';
  protected readonly logger = new Logger('CliService');

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
      return;
    }

    //한줄씩 읽어드림
    const fileStream = fs.createReadStream(file);
    const queue: IQueue[] = [];
    try {
      for await (const line of readline.createInterface(fileStream)) {
        if (line) {
          queue.push(JSON.parse(line));
        }
      }
    } finally {
      fileStream.destroy();
    }

    //큐 파일 비우기
    fs.writeFileSync(file, '', {encoding: 'utf8'});

    return queue;
  }

  /**
   * 명령어 목록 실행
   * @param queueItem
   */
  execCmd(queueItem: IQueue) {
    try {
      //queue 정보 출력
      this.logger.log(`target repository: ${queueItem.repository}`);
      this.logger.log(`target branch:event: ${queueItem.branch}:${queueItem.event}`);
      this.logger.log(`working dir: ${queueItem.workingDir}`);

      //명령어 목록 실행
      for (const cmd of queueItem.actions) {
        this.logger.log(`execute cmd: "${cmd}"`);
        const stdout = execSync(cmd, {encoding: 'utf8', cwd: queueItem.workingDir});
        this.logger.log(`execute output: ${stdout}`);
      }
    } catch (err) {
      this.logger.error(err.message, err.stack);
    }
  }
}
