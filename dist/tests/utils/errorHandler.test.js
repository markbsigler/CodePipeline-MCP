"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
jest.mock('../../src/utils/logger', () => ({
    __esModule: true,
    default: { error: jest.fn() }
}));
const errorHandler_1 = require("../../src/middleware/errorHandler");
const logger = require('../../src/utils/logger').default;
const OLD_ENV = process.env;
describe('errorHandler', () => {
    let req, res, next;
    beforeEach(() => {
        req = { originalUrl: '/fail', method: 'GET', user: { sub: 'user1' }, sessionId: 'sess' };
        res = { status: jest.fn().mockReturnThis(), json: jest.fn(), headersSent: false, setHeader: jest.fn() };
        next = jest.fn();
        logger.error.mockClear();
        process.env = { ...OLD_ENV };
    });
    afterAll(() => {
        process.env = OLD_ENV;
    });
    it('logs and returns error response with code and stack (non-prod)', () => {
        (0, errorHandler_1.errorHandler)({ message: 'fail', status: 400, code: 'ERR_TEST', stack: 'STACK' }, req, res, next);
        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/json');
        expect(res.json).toHaveBeenCalledWith({ error: 'fail', code: 'ERR_TEST', stack: 'STACK' });
        expect(logger.error).toHaveBeenCalled();
    });
    it('omits stack/details in production', () => {
        process.env.NODE_ENV = 'production';
        (0, errorHandler_1.errorHandler)({ message: 'fail', status: 400, code: 'ERR_TEST', stack: 'STACK', details: { foo: 1 } }, req, res, next);
        expect(res.json).toHaveBeenCalledWith({ error: 'fail', code: 'ERR_TEST' });
    });
    it('omits details in production even if present', () => {
        process.env.NODE_ENV = 'production';
        (0, errorHandler_1.errorHandler)({ message: 'fail', status: 400, code: 'ERR_TEST', details: { foo: 1 } }, req, res, next);
        expect(res.json).toHaveBeenCalledWith({ error: 'fail', code: 'ERR_TEST' });
    });
    it('includes details in non-prod if present', () => {
        process.env.NODE_ENV = 'development';
        (0, errorHandler_1.errorHandler)({ message: 'fail', status: 400, code: 'ERR_TEST', details: { foo: 1 } }, req, res, next);
        expect(res.json).toHaveBeenCalledWith({ error: 'fail', code: 'ERR_TEST', details: { foo: 1 }, stack: undefined });
    });
    it('omits stack if missing in non-prod', () => {
        (0, errorHandler_1.errorHandler)({ message: 'fail', status: 400, code: 'ERR_TEST' }, req, res, next);
        expect(res.json).toHaveBeenCalledWith({ error: 'fail', code: 'ERR_TEST', stack: undefined });
    });
    it('defaults code to ERR_INTERNAL if missing', () => {
        (0, errorHandler_1.errorHandler)({ message: 'fail', status: 400 }, req, res, next);
        expect(res.json).toHaveBeenCalledWith({ error: 'fail', code: 'ERR_INTERNAL', stack: undefined });
    });
    it('handles missing message/status/code', () => {
        (0, errorHandler_1.errorHandler)({}, req, res, next);
        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.json).toHaveBeenCalledWith({ error: 'Internal Server Error', code: 'ERR_INTERNAL', stack: undefined });
    });
    it('calls next if headersSent', () => {
        res.headersSent = true;
        (0, errorHandler_1.errorHandler)({ message: 'fail' }, req, res, next);
        expect(next).toHaveBeenCalled();
    });
});
//# sourceMappingURL=errorHandler.test.js.map