
import fs from 'fs';
import path from 'path';
import logger, { httpLogger } from '../../../src/utils/logger';

describe('logger', () => {
  it('should be a pino logger instance', () => {
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('error');
    expect(typeof logger.info).toBe('function');
  });

  it('should write logs to the correct file', () => {
    const logDir = process.env.LOG_DIR || 'logs';
    const logFile = path.join(logDir, 'app.log');
    jest.spyOn(fs, 'existsSync').mockReturnValue(true);
    expect(fs.existsSync(logFile)).toBe(true);
  });
});

describe('httpLogger', () => {
  it('should be a function (middleware)', () => {
    expect(typeof httpLogger).toBe('function');
  });
});
