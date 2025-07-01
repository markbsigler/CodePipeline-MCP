/**
 * Recursively sanitize output by removing dangerous fields and escaping strings.
 * This is a simple example; for production, use a library like xss or DOMPurify for HTML.
 */
export function sanitizeOutput(obj: any): any {
  if (Array.isArray(obj)) return obj.map(sanitizeOutput);
  if (obj && typeof obj === 'object') {
    const clean: Record<string, any> = {};
    for (const [k, v] of Object.entries(obj)) {
      if (k.toLowerCase().includes('password') || k.toLowerCase().includes('token')) continue;
      clean[k] = sanitizeOutput(v);
    }
    return clean;
  }
  if (typeof obj === 'string') {
    // Escape <, >, &, etc. (basic)
    return obj.replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c] ?? c));
  }
  return obj;
}
