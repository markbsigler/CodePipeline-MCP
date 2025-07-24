import { toolZodSchemas } from 'types/toolZodSchemas';

describe('toolZodSchemas', () => {
  it('should be an object', () => {
    expect(typeof toolZodSchemas).toBe('object');
    expect(toolZodSchemas).not.toBeNull();
  });

  it('should have input and output schemas for each tool', () => {
    for (const key of Object.keys(toolZodSchemas)) {
      expect(toolZodSchemas[key]).toHaveProperty('input');
      expect(toolZodSchemas[key]).toHaveProperty('output');
    }
  });
});
