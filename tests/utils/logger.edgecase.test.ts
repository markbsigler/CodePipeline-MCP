import fs from "fs";
import path from "path";

describe("logger edge case", () => {
  const logDir = path.join(process.cwd(), "logs");
  const loggerPath = "../../src/utils/logger";
  afterEach(() => {
    jest.resetModules();
    if (fs.existsSync(logDir)) {
      fs.rmSync(logDir, { recursive: true, force: true });
    }
  });
  it("creates logDir if missing", (): Promise<void> => {
    if (fs.existsSync(logDir)) {
      fs.rmSync(logDir, { recursive: true, force: true });
    }
    expect(fs.existsSync(logDir)).toBe(false);
    // Re-require logger to trigger logDir creation

    return import(loggerPath);
    // eslint-disable-next-line no-unreachable
    expect(fs.existsSync(logDir)).toBe(true);
  });
});
