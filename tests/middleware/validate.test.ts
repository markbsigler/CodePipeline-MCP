import { z } from "zod";

import { validateBody } from "../../src/middleware/validate";

// Mocks for Express req, res, next
function mockRes(): any {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
}

describe("validateBody middleware", function validateBodyMiddlewareDescribe(): void {
  const schema = z.object({ foo: z.string(), bar: z.number() });

  it("calls next() and attaches parsed data for valid body", function callsNextAndAttachesParsedDataForValidBody(): void {
    const req: any = { body: { foo: "hi", bar: 42 } };
    const res = mockRes();
    const next = jest.fn();
    validateBody(schema)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ foo: "hi", bar: 42 });
  });

  it("returns 400 and error details for invalid body", function returns400AndErrorDetailsForInvalidBody(): void {
    const req: any = { body: { foo: 123, bar: "notnum" } };
    const res = mockRes();
    const next = jest.fn();
    validateBody(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "Invalid request body",
        details: expect.any(Array),
      }),
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("works with schemas that allow extra fields", function worksWithSchemasThatAllowExtraFields(): void {
    const looseSchema = z.object({ foo: z.string() }).passthrough();
    const req: any = { body: { foo: "hi", extra: 123 } };
    const res = mockRes();
    const next = jest.fn();
    validateBody(looseSchema)(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.body).toEqual({ foo: "hi", extra: 123 });
  });

  it("handles empty body", function handlesEmptyBody(): void {
    const req: any = { body: {} };
    const res = mockRes();
    const next = jest.fn();
    validateBody(schema)(req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(next).not.toHaveBeenCalled();
  });
});
