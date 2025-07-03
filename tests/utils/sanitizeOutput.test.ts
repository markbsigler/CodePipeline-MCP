import { sanitizeOutput } from '../../src/utils/sanitizeOutput';

describe('sanitizeOutput', () => {
  it('removes password and token fields', () => {
    const input = { username: 'user', password: 'secret', accessToken: 'abc', nested: { refreshToken: 'def' } };
    const result = sanitizeOutput(input);
    expect(result).toEqual({ username: 'user', nested: {} });
  });

  it('escapes dangerous characters in strings', () => {
    const input = { html: '<script>alert(1)</script>', safe: 'ok' };
    const result = sanitizeOutput(input);
    expect(result.html).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');
    expect(result.safe).toBe('ok');
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
});
