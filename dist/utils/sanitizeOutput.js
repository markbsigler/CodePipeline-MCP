"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeOutput = sanitizeOutput;
/**
 * Recursively sanitize output by removing dangerous fields and escaping strings.
 * For production, use a library like xss or DOMPurify for HTML.
 * This version also removes more sensitive fields, escapes more characters, prevents prototype pollution, and limits recursion depth.
 */
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'ssn', 'apikey', 'api_key'];
const POLLUTION_KEYS = ['__proto__', 'constructor', 'prototype'];
const MAX_DEPTH = 20;
function sanitizeOutput(obj, depth = 0) {
    if (depth > MAX_DEPTH)
        return undefined;
    if (Array.isArray(obj))
        return obj.map(item => sanitizeOutput(item, depth + 1));
    if (obj && typeof obj === 'object') {
        const clean = {};
        for (const [k, v] of Object.entries(obj)) {
            const keyLower = k.toLowerCase();
            if (SENSITIVE_KEYS.some(s => keyLower.includes(s)))
                continue;
            if (POLLUTION_KEYS.includes(k))
                continue;
            clean[k] = sanitizeOutput(v, depth + 1);
        }
        return clean;
    }
    if (typeof obj === 'string') {
        // Escape <, >, &, ", ', ` (basic XSS prevention)
        return obj.replace(/[<>&"'`]/g, c => ({
            '<': '&lt;',
            '>': '&gt;',
            '&': '&amp;',
            '"': '&quot;',
            "'": '&#39;',
            '`': '&#96;'
        }[c] ?? c));
    }
    return obj;
}
//# sourceMappingURL=sanitizeOutput.js.map