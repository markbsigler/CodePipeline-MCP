import { createApp } from './index';

export function startServer() {
  const app = createApp();
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`MCP server listening on port ${port}`);
  });
}
