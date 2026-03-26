/**
 * Server-side logger for PrototypeBD frontend (Next.js).
 *
 * • Console  — coloured, human-readable (always on)
 * • File     — daily rotating JSON-lines in logs/frontend-YYYY-MM-DD.log (kept 30 days)
 *
 * IMPORTANT: This module is Node.js-only. Never import it in Client Components.
 * Guard every call site with `if (typeof window === 'undefined')` or use
 * it only inside server components / route handlers / middleware.
 */

import path from "path";
import { createLogger, format, transports } from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

const LOG_DIR = path.resolve(process.cwd(), "..", "logs");

const jsonFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DDTHH:mm:ss.SSSZ" }),
  format.errors({ stack: true }),
  format.json()
);

const consoleFormat = format.combine(
  format.colorize(),
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ timestamp, level, message, ...meta }) => {
    const extras = Object.keys(meta).length ? " " + JSON.stringify(meta) : "";
    return `${timestamp} [${level}] next: ${message}${extras}`;
  })
);

const logger = createLogger({
  level: process.env.NODE_ENV === "production" ? "info" : "debug",
  transports: [
    new transports.Console({ format: consoleFormat }),
    new DailyRotateFile({
      dirname: LOG_DIR,
      filename: "frontend-%DATE%.log",
      datePattern: "YYYY-MM-DD",
      maxFiles: "30d",
      zippedArchive: false,
      format: jsonFormat,
    }),
  ],
});

export default logger;
