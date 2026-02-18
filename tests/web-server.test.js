const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');

const { createApp } = require('../src/web/server');

test('web API supports reading and writing doses', async () => {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'compound-tracker-web-'));
  const dataFile = path.join(tmpDir, 'data.json');

  const app = createApp({ dataFile });

  const get1 = await app.request('GET', '/api/doses');
  assert.equal(get1.statusCode, 200);
  const doses1 = get1.body;
  assert.ok(Array.isArray(doses1));
  assert.equal(doses1.length, 0);

  const add = await app.request('POST', '/api/doses', { id: 'd1', compoundName: 'Test', amount: 100 });
  assert.equal(add.statusCode, 200);

  const get2 = await app.request('GET', '/api/doses');
  const doses2 = get2.body;
  assert.equal(doses2.length, 1);
  assert.equal(doses2[0].id, 'd1');
});
