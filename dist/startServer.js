"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startServer = startServer;
const index_1 = require("./index");
function startServer() {
  let app;
  try {
    app = (0, index_1.createApp)();
  } catch (err) {
    console.error("Failed to create app:", err);
    return;
  }
  const port = process.env.PORT || 3000;
  try {
    app.listen(port, () => {
      console.log(`MCP server listening on port ${port}`);
    });
  } catch (err) {
    console.error("Failed to start server:", err);
  }
}
//# sourceMappingURL=startServer.js.map
