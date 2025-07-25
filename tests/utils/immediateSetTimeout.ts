// Test utility to immediately invoke a setTimeout callback (for streaming tests)
/* eslint-disable no-unused-vars */
export function immediateSetTimeout(
  fn: () => void,
 
  _ms: number,
): { unref: () => void } {
  fn();
  return { unref: (): void => {} };
}
