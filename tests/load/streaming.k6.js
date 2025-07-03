# k6 script for streaming endpoint load test
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  vus: 5,
  duration: '10s',
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const JWT = __ENV.JWT || '';

export default function () {
  const headers = JWT ? { Authorization: `Bearer ${JWT}` } : {};
  // Replace with your actual streaming endpoint
  const res = http.get(`${BASE_URL}/v1/tools/stream`, { headers });
  check(res, {
    'status is 200 or 401': (r) => r.status === 200 || r.status === 401,
  });
  sleep(1);
}
