import { createApp } from "./index";

export function startServer(): void {
  let app;
  try {
    app = createApp();
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
