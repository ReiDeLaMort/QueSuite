import assert from 'node:assert/strict';
const base = process.env.CMMS_TEST_URL || 'http://localhost:3000';
if (!['localhost', '127.0.0.1'].includes(new URL(base).hostname))
  throw new Error('Smoke test is restricted to local development.');
async function post(path, body) {
  const response = await fetch(base + path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  return { status: response.status, body: await response.json() };
}
const marker = 'QA-' + Date.now();
const asset = await post('/api/assets', {
  id: crypto.randomUUID(),
  tag: marker,
  name: 'Validation pump (test record)',
  location: 'QA / Utility room',
});
assert.equal(asset.status, 200, JSON.stringify(asset.body));
const create = {
  kind: 'create',
  operationId: crypto.randomUUID(),
  id: crypto.randomUUID(),
  assetId: asset.body.id,
  title: 'Validation: inspect pump seal',
  description: 'Synthetic record from local HTTP check.',
  priority: 'high',
  type: 'inspection',
};
let response = await post('/api/work-orders', create);
assert.equal(response.status, 200, JSON.stringify(response.body));
assert.equal(response.body.version, 1);
const transition = (version, status, extra = {}) => ({
  kind: 'transition',
  operationId: crypto.randomUUID(),
  id: create.id,
  expectedVersion: version,
  status,
  ...extra,
});
const raced = await Promise.all([
  post(
    '/api/work-orders',
    transition(1, 'assigned', { assignee: 'Test technician A' }),
  ),
  post(
    '/api/work-orders',
    transition(1, 'assigned', { assignee: 'Test technician B' }),
  ),
]);
assert.deepEqual(
  raced.map((r) => r.status).sort((a, b) => a - b),
  [200, 409],
);
response = await post('/api/work-orders', create);
assert.equal(response.body.version, 1);
response = await post('/api/work-orders', transition(2, 'in_progress'));
assert.equal(response.status, 200);
response = await post(
  '/api/work-orders',
  transition(3, 'completed', {
    completionNote: 'Checked seal; no leak observed (test).',
  }),
);
assert.equal(response.status, 200);
response = await post('/api/work-orders', transition(4, 'closed'));
assert.equal(response.status, 200);
assert.equal(response.body.version, 5);
const snapshot = await (await fetch(base + '/api/snapshot')).json();
assert.equal(
  snapshot.workOrders.find((w) => w.id === create.id).status,
  'closed',
);
console.log(
  JSON.stringify(
    {
      passed: true,
      checks: [
        'create asset',
        'create work order',
        'simultaneous update conflict',
        'original response replay',
        'full lifecycle',
        'persisted snapshot',
      ],
      testAsset: marker,
      testAssetId: asset.body.id,
      testWorkOrderId: create.id,
    },
    null,
    2,
  ),
);
