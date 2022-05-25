/**
 * Credit to Maciej Radzikowski
 * @see https://betterdev.blog/aws-lambda-logging-best-practices/
 */

import winston from 'winston';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.Console(),
  ],
});

export {logger}