import {Command, CommandRunner} from 'nest-commander';

@Command({name: 'test', description: 'Test command'})
export class TestCommand extends CommandRunner {
  constructor() {
    super();
  }

  async run(): Promise<void> {
    console.log('test command');
  }
}
