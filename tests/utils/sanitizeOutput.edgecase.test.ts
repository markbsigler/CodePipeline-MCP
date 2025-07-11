import { sanitizeOutput } from '../../src/utils/sanitizeOutput';

describe('sanitizeOutput string fallback', () => {
  it('should return the original character if not in the replacement map', () => {
    // \u2603 is a snowman, not in the map
    expect(sanitizeOutput('\u2603')).toBe('\u2603');
  });
});
