import {Module} from '@nestjs/common';

import {AppController} from '@app/app.controller';
import {AppService} from '@app/app.service';

@Module({
  imports: [
    // ConfigModule.forRoot({isGlobal: true, load: [appConfig]})
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
