import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const { combine, timestamp, printf, errors, colorize } = format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}] : ${stack || message}`;
});

export const logger = createLogger({
  level: "info",
  format: combine(
    colorize(),
    timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    errors({ stack: true }), // log error stack
    logFormat
  ),
  transports: [
    new transports.Console(),
    new DailyRotateFile({
      filename: "logs/app-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "14d", // keep 2 weeks of logs
    }),
  ],
});