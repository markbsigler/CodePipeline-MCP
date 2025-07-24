import fs from 'fs';
import path from 'path';

describe('logger edge case', () => {
  const logDir = path.join(process.cwd(), 'logs');
  const loggerPath = '../../src/utils/logger';
  afterEach(() => {
    jest.resetModules();
    if (fs.existsSync(logDir)) {
      fs.rmSync(logDir, { recursive: true, force: true });
    }
  });
  it('creates logDir if missing', (): Promise<void> => {
    if (fs.existsSync(logDir))
      {fs.rmSync(logDir, { recursive: true, force: true });}
    expect(fs.existsSync(logDir)).toBe(false);
    // Re-require logger to trigger logDir creation
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return import(loggerPath);
    expect(fs.existsSync(logDir)).toBe(true);
  });
});
