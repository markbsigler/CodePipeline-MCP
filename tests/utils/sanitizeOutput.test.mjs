"use strict";
import { sanitizeOutput } from '../../src/utils/sanitizeOutput';
describe('sanitizeOutput', () => {
    it('removes password and token fields', () => {
        const input = { username: 'user', password: 'secret', accessToken: 'abc', nested: { refreshToken: 'def' } };
        const result = sanitizeOutput(input);
        expect(result).toEqual({ username: 'user', nested: {} });
    });
    it('removes all sensitive fields (secret, ssn, apikey, api_key)', () => {
        const input = {
            secret: 'shouldRemove',
            ssn: 'shouldRemove',
            apikey: 'shouldRemove',
            api_key: 'shouldRemove',
            keep: 'ok',
            nested: { apiKey: 'shouldRemove', value: 'ok' }
        };
        const result = sanitizeOutput(input);
        expect(result).toEqual({ keep: 'ok', nested: { value: 'ok' } });
    });
    it('skips prototype pollution keys', () => {
        const input = {
            __proto__: 'bad',
            constructor: 'bad',
            prototype: 'bad',
            safe: 'ok',
            nested: { __proto__: 'bad', safe: 'ok' }
        };
        const result = sanitizeOutput(input);
        expect(result).toEqual({ safe: 'ok', nested: { safe: 'ok' } });
        expect(Object.prototype.hasOwnProperty.call(result, '__proto__')).toBe(false);
    });
    it('escapes dangerous characters in strings', () => {
        const input = { html: '<script>alert(1)</script>', safe: 'ok' };
        const result = sanitizeOutput(input);
        expect(result.html).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
        expect(result.safe).toBe('ok');
    });
    it('escapes quotes and backticks in strings', () => {
        const input = { str: `a"b'c\`d` };
        const result = sanitizeOutput(input);
        expect(result.str).toBe('a&amp;quot;b&amp;#39;c&amp;#96;d'.replace(/&amp;/g, '&'));
    });
    it('handles arrays and primitives', () => {
        const input = [
            { value: '<b>bold</b>', password: 'x' },
            'plain',
            42
        ];
        const result = sanitizeOutput(input);
        expect(result).toEqual([
            { value: '&lt;b&gt;bold&lt;/b&gt;' },
            'plain',
            42
        ]);
    });
    it('returns input unchanged if no dangerous chars in sanitizeOutput', () => {
        const input = 'safe string';
        const result = sanitizeOutput(input);
        expect(result).toBe('safe string');
    });
    it('limits recursion depth', () => {
        let deep = { a: 1 };
        let curr = deep;
        for (let i = 0; i < 25; i++) {
            curr.nested = { a: 1 };
            curr = curr.nested;
        }
        const result = sanitizeOutput(deep);
        // At depth 21, nested should be undefined
        let d = result;
        let count = 0;
        while (d && d.nested) {
            d = d.nested;
            count++;
        }
        expect(count).toBeLessThanOrEqual(20);
    });
});
//# sourceMappingURL=sanitizeOutput.test.mjs.map