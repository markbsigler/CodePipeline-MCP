"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestLogger = requestLogger;
const logger_1 = __importDefault(require("../utils/logger"));
function requestLogger(req, res, next) {
  const start = Date.now();
  res.on("finish", () => {
    logger_1.default.info(
      {
        method: req.method,
        url: req.originalUrl,
        status: res.statusCode,
        duration: Date.now() - start,
        user: req.user?.sub || "anon",
        sessionId: req.sessionId || null,
      },
      "Request completed",
    );
  });
  next();
}
//# sourceMappingURL=requestLogger.js.map
