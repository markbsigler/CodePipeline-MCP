"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res
        .status(400)
        .json({ error: "Invalid request body", details: result.error.errors });
      return;
    }
    req.body = result.data;
    next();
  };
}
//# sourceMappingURL=validate.js.map
