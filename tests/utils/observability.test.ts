import express from 'express';
import request from 'supertest';

import * as observability from '../../src/utils/observability';

describe('observability', function observabilityDescribe(): void {
  let app: express.Express;

  beforeAll(function beforeAllHook(): void {
    app = express();
    observability.exposePrometheusMetrics(app);
    app.use(observability.metricsMiddleware);
    app.get('/test', function testRoute(_req: express.Request, res: express.Response): void { res.status(200).send('ok'); });
  });

  function getCounterValue(metricsText: string, labels: string): number {
    // Find the line for http_requests_total with the given labels
    // eslint-disable-next-line no-useless-escape
    const fixedRegex = new RegExp(
      `^http_requests_total{${labels}} (\\d+)`,
      'm',
    );
    const match = fixedRegex.exec(metricsText);
    return match ? parseInt(match[1], 10) : 0;
  }

  it('should increment httpRequestCounter on request', async function shouldIncrementHttpRequestCounter(): Promise<void> {
    // Get initial value from /metrics
    let res = await request(app).get('/metrics');
    const labels = 'method="GET",route="/test",status="200"';
    const initial = getCounterValue(res.text, labels);
    await request(app).get('/test');
    res = await request(app).get('/metrics');
    const after = getCounterValue(res.text, labels);
    expect(after).toBe(initial + 1);
  });

  it('should expose /metrics endpoint with prom-client metrics', async function shouldExposeMetricsEndpoint(): Promise<void> {
    await request(app).get('/test'); // ensure at least one metric
    const res = await request(app).get('/metrics');
    expect(res.status).toBe(200);
    expect(res.text).toContain('http_requests_total');
    expect(res.headers['content-type']).toContain('text/plain');
  });
});
