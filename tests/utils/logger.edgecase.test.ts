import fs from "fs";
import path from "path";

describe("logger edge case", () => {
  const logDir = path.join(process.cwd(), "logs");
  const loggerPath = "../../src/utils/logger";
  afterEach(() => {
    jest.resetModules();
    if (fs.existsSync(logDir)) {
      try {
        fs.rmSync(logDir, { recursive: true, force: true });
      } catch (err) {
        // Ignore ENOTEMPTY errors, which can occur if files are locked or in use
        if (err && (err as NodeJS.ErrnoException).code !== "ENOTEMPTY") {
          throw err;
        }
      }
    }
  });
  it("creates logDir if missing", async () => {
    if (fs.existsSync(logDir)) {
      try {
        fs.rmSync(logDir, { recursive: true, force: true });
      } catch (err) {
        if (err && (err as NodeJS.ErrnoException).code !== "ENOTEMPTY") {
          throw err;
        }
      }
    }
    expect(fs.existsSync(logDir)).toBe(false);
    // Re-require logger to trigger logDir creation
    await import(loggerPath);
    expect(fs.existsSync(logDir)).toBe(true);
  });
});
