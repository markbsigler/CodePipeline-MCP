"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.httpLogger = void 0;
const pino_1 = __importDefault(require("pino"));
const pino_http_1 = __importDefault(require("pino-http"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const logDir = process.env.LOG_DIR || "logs";
if (!fs_1.default.existsSync(logDir)) {
  fs_1.default.mkdirSync(logDir);
}
const logger = (0, pino_1.default)(
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
  pino_1.default.destination({
    dest: path_1.default.join(logDir, "app.log"),
    minLength: 4096,
    sync: false,
  }),
);
exports.httpLogger = (0, pino_http_1.default)({ logger });
exports.default = logger;
//# sourceMappingURL=logger.js.map
