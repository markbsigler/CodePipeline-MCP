jest.mock('../../src/utils/logger', () => ({
  __esModule: true,
  default: { error: jest.fn() }
}));

import { errorHandler } from '../../src/middleware/errorHandler';

const logger = require('../../src/utils/logger').default;

describe('errorHandler', () => {
  let req: any, res: any, next: any;
  beforeEach(() => {
    req = { originalUrl: '/fail', method: 'GET', user: { sub: 'user1' }, sessionId: 'sess' };
    res = { status: jest.fn().mockReturnThis(), json: jest.fn(), headersSent: false };
    next = jest.fn();
    logger.error.mockClear();
  });

  it('logs and returns error response', () => {
    errorHandler({ message: 'fail', status: 400 }, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'fail' });
    expect(logger.error).toHaveBeenCalled();
  });

  it('handles missing message/status', () => {
    errorHandler({}, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error' });
  });

  it('calls next if headersSent', () => {
    res.headersSent = true;
    errorHandler({ message: 'fail' }, req, res, next);
    expect(next).toHaveBeenCalled();
  });
});
