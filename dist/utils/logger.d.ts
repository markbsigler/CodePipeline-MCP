declare const logger: import("pino").Logger<never, boolean>;
export declare const httpLogger: import("pino-http").HttpLogger<
  import("http").IncomingMessage,
  import("http").ServerResponse<import("http").IncomingMessage>,
  never
>;
export default logger;
