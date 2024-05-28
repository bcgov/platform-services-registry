import { createLogger, format, transports } from 'winston';
import { LOG_LEVEL } from '@/config';

const { combine, timestamp, errors, json, uncolorize } = format;

export const logger = createLogger({
  level: LOG_LEVEL,
  format: combine(timestamp(), errors({ stack: true }), uncolorize(), json()),
  transports: [new transports.Console()],
});
