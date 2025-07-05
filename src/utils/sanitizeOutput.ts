/**
 * Recursively sanitize output by removing dangerous fields and escaping strings.
 * For production, use a library like xss or DOMPurify for HTML.
 * This version also removes more sensitive fields, escapes more characters, prevents prototype pollution, and limits recursion depth.
 */
const SENSITIVE_KEYS = ['password', 'token', 'secret', 'ssn', 'apikey', 'api_key'];
const POLLUTION_KEYS = ['__proto__', 'constructor', 'prototype'];
const MAX_DEPTH = 20;

export function sanitizeOutput(obj: any, depth = 0): any {
  if (depth >= MAX_DEPTH) return undefined;
  if (Array.isArray(obj)) return obj.map(item => sanitizeOutput(item, depth + 1));
  if (obj && typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      const keyLower = k.toLowerCase();
      if (SENSITIVE_KEYS.some(s => keyLower.includes(s))) continue;
      if (POLLUTION_KEYS.includes(k)) continue;
      // Only recurse if depth + 1 < MAX_DEPTH, else skip
      if (depth + 1 > MAX_DEPTH) continue;
      const sanitized = sanitizeOutput(v, depth + 1);
      if (sanitized !== undefined) {
        clean[k] = sanitized;
      }
    }
    if (Object.keys(clean).length === 0) return undefined;
    return clean;
  }
  if (typeof obj === 'string') {
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
