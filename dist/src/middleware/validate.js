"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateBody = validateBody;
function validateBody(schema) {
    return (req, res, next) => {
        const result = schema.safeParse(req.body);
        if (!result.success) {
            return res.status(400).json({ error: 'Invalid request body', details: result.error.errors });
        }
        req.body = result.data;
        next();
    };
}
//# sourceMappingURL=validate.js.map