import fs from "fs";
import path from "path";

import pino, { destination } from "pino";
import pinoHttp from "pino-http";

const logDir = process.env.LOG_DIR || "logs";
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const logger = pino(
  {
    level: process.env.LOG_LEVEL || "info",
    transport:
      process.env.NODE_ENV === "development"
        ? {
            target: "pino-pretty",
            options: { colorize: true },
          }
        : undefined,
  },
  destination({
    dest: path.join(logDir, "app.log"),
    minLength: 4096,
    sync: false,
  }),
);

export const httpLogger = pinoHttp({ logger });
export default logger;
