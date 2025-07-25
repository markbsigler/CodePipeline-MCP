"use strict";
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = authenticateJWT;
const jsonwebtoken_1 = require("jsonwebtoken");
const logger_1 = __importDefault(require("../utils/logger"));
const JWT_SECRET = process.env.JWT_SECRET ?? "changeme";
const JWT_ISSUER = process.env.JWT_ISSUER ?? "codepipeline-mcp-server";
function authenticateJWT(req, res, next) {
  const authHeader = req.headers["authorization"];
  if (!authHeader?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Missing or invalid Authorization header" });
    return;
  }
  const token = authHeader.substring(7);
  try {
    const payload = (0, jsonwebtoken_1.verify)(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
    });
    req.user = payload;
    next();
  } catch (err) {
    if (process.env.NODE_ENV !== "test") {
      logger_1.default.error("JWT authentication error", err);
    }
    res.status(401).json({ error: "Invalid, expired, or unauthorized token" });
  }
}
//# sourceMappingURL=auth.js.map
