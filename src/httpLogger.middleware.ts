import {Injectable, Logger, NestMiddleware} from '@nestjs/common';
import {Request, Response} from 'express';

@Injectable()
export class HttpLoggerMiddleware implements NestMiddleware {
  private readonly logger = new Logger('HTTP');

  use(req: Request, res: Response, next: (error?: any) => void): any {
    const {ip, method, originalUrl} = req;

    const userAgent = req.get('user-agent') || '';

    res.on('finish', () => {
      const {statusCode} = res;

      this.logger.log(`${ip} - "${method} ${originalUrl}" - ${statusCode} - "${userAgent}"`);
    });

    next();
  }
}
