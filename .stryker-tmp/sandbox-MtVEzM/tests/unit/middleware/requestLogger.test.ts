// @ts-nocheck
import { requestLogger } from 'middleware/requestLogger';
import logger from 'utils/logger';

describe('requestLogger middleware', () => {
  let req: any, res: any, next: jest.Mock;

  beforeEach(() => {
    req = { method: 'GET', originalUrl: '/test', user: { sub: 'user1' }, sessionId: 'sess', headers: {} };
    res = { statusCode: 200, on: jest.fn((event, cb) => { if (event === 'finish') cb(); }) };
    next = jest.fn();
    jest.spyOn(logger, 'info').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should call next()', () => {
    requestLogger(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should log request info on finish', () => {
    requestLogger(req, res, next);
    expect(logger.info).toHaveBeenCalledWith(
      expect.objectContaining({
        method: 'GET',
        url: '/test',
        status: 200,
        user: 'user1',
        sessionId: 'sess'
      }),
      'Request completed'
    );
  });
});
