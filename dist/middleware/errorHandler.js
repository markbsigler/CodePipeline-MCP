"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
const logger_1 = __importDefault(require("../utils/logger"));
function errorHandler(err, req, res, next) {
  logger_1.default.error(
    {
      err,
      url: req.originalUrl,
      method: req.method,
      user: req.user?.sub || "anon",
      sessionId: req.sessionId || null,
      stack: err.stack,
    },
    "Error occurred",
  );
  if (res.headersSent) {
    return next(err);
  }
  res.setHeader("Content-Type", "application/json");
  const status = err.status || 500;
  const isProd = process.env.NODE_ENV === "production";
  res.status(status).json({
    error: err.message || "Internal Server Error",
    code: err.code || "ERR_INTERNAL",
    ...(err.details && !isProd ? { details: err.details } : {}),
    ...(isProd ? {} : { stack: err.stack }),
  });
}
//# sourceMappingURL=errorHandler.js.map
