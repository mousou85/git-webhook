import {LoggerService as DefaultLoggerService} from '@nestjs/common';
import dayjs from 'dayjs';
import {utilities, WinstonModule} from 'nest-winston';
import * as winston from 'winston';

/**
 * date format 변경
 */
const timestampFormat = winston.format((info) => {
  info.timestamp = dayjs().format('YYYY-MM-DD HH:mm:ss');
  return info;
});
/**
 * log level 변조
 */
const levelFormat = winston.format((info) => {
  info.level = info.level.toUpperCase();
  return info;
});

/**
 * logger service
 * @param appName
 * @constructor
 */
export const LoggerService = (appName: string): DefaultLoggerService => {
  return WinstonModule.createLogger({
    transports: [
      new winston.transports.Console({
        format: winston.format.combine(
          timestampFormat(),
          levelFormat(),
          winston.format.colorize({all: true}),
          utilities.format.nestLike(appName, {prettyPrint: true, colors: true})
        ),
      }),
    ],
  });
};
