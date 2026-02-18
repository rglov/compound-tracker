const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { URL } = require('node:url');
const defaults = require('./defaults');
const { JsonStore } = require('./store');
const { asArray, upsertById, updateById, deleteById, sanitizeImportData } = require('../shared/store-utils');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml'
};

function respondJson(res, statusCode, data) {
  const payload = JSON.stringify(data);
  res.writeHead(statusCode, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(payload)
  });
  res.end(payload);
}

function readJson(req) {
  if (req && Object.prototype.hasOwnProperty.call(req, '__body')) {
    return Promise.resolve(req.__body || {});
  }
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 20 * 1024 * 1024) {
        reject(new Error('payload too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('invalid json'));
      }
    });
    req.on('error', reject);
  });
}

function safePathJoin(baseDir, requestedPath) {
  const clean = requestedPath.split('?')[0].replace(/^\/+/, '');
  const resolved = path.resolve(baseDir, clean);
  if (!resolved.startsWith(path.resolve(baseDir))) return null;
  return resolved;
}

function createApp(options = {}) {
  const dataFile = options.dataFile || path.join(process.cwd(), 'data', 'compound-tracker-data.json');
  const staticDir = options.staticDir || path.join(__dirname, '..', 'renderer');
  const store = new JsonStore({ filePath: dataFile, defaults });

  async function handleApi(req, res, pathname) {
    const method = req.method;

    if (method === 'GET' && pathname === '/api/doses') {
      return respondJson(res, 200, asArray(store.get('doses', [])));
    }
    if (method === 'POST' && pathname === '/api/doses') {
      const dose = await readJson(req);
      store.set('doses', [...asArray(store.get('doses', [])), dose]);
      return respondJson(res, 200, { success: true });
    }
    if (pathname.startsWith('/api/doses/')) {
      const id = decodeURIComponent(pathname.slice('/api/doses/'.length));
      if (method === 'PUT') {
        const changes = await readJson(req);
        const result = updateById(store.get('doses', []), id, changes);
        if (!result.found) return respondJson(res, 404, { success: false, error: 'Dose not found' });
        store.set('doses', result.items);
        return respondJson(res, 200, { success: true });
      }
      if (method === 'DELETE') {
        store.set('doses', deleteById(store.get('doses', []), id));
        return respondJson(res, 200, { success: true });
      }
    }

    if (method === 'GET' && pathname === '/api/custom-compounds') {
      return respondJson(res, 200, asArray(store.get('customCompounds', [])));
    }
    if (method === 'POST' && pathname === '/api/custom-compounds') {
      const compound = await readJson(req);
      store.set('customCompounds', [...asArray(store.get('customCompounds', [])), compound]);
      return respondJson(res, 200, { success: true });
    }
    if (pathname.startsWith('/api/custom-compounds/') && method === 'DELETE') {
      const id = decodeURIComponent(pathname.slice('/api/custom-compounds/'.length));
      store.set('customCompounds', deleteById(store.get('customCompounds', []), id));
      return respondJson(res, 200, { success: true });
    }

    if (method === 'GET' && pathname === '/api/custom-blends') {
      return respondJson(res, 200, asArray(store.get('customBlends', [])));
    }
    if (method === 'POST' && pathname === '/api/custom-blends') {
      const blend = await readJson(req);
      store.set('customBlends', [...asArray(store.get('customBlends', [])), blend]);
      return respondJson(res, 200, { success: true });
    }
    if (pathname.startsWith('/api/custom-blends/') && method === 'DELETE') {
      const id = decodeURIComponent(pathname.slice('/api/custom-blends/'.length));
      store.set('customBlends', deleteById(store.get('customBlends', []), id));
      return respondJson(res, 200, { success: true });
    }

    if (method === 'GET' && pathname === '/api/cycles') {
      return respondJson(res, 200, asArray(store.get('cycles', [])));
    }
    if (method === 'PUT' && pathname === '/api/cycles') {
      const cycles = await readJson(req);
      store.set('cycles', asArray(cycles));
      return respondJson(res, 200, { success: true });
    }

    if (method === 'GET' && pathname === '/api/settings') {
      return respondJson(res, 200, store.get('settings', { enabledInjectionSites: null }));
    }
    if (method === 'PUT' && pathname === '/api/settings') {
      const settings = await readJson(req);
      store.set('settings', settings);
      return respondJson(res, 200, { success: true });
    }

    if (method === 'GET' && pathname === '/api/library-overrides') {
      return respondJson(res, 200, store.get('libraryOverrides', {}));
    }
    if (method === 'PUT' && pathname === '/api/library-overrides') {
      const payload = await readJson(req);
      const overrides = store.get('libraryOverrides', {});
      overrides[payload.name] = payload.data;
      store.set('libraryOverrides', overrides);
      return respondJson(res, 200, { success: true });
    }

    if (method === 'GET' && pathname === '/api/compound-settings') {
      return respondJson(res, 200, store.get('compoundSettings', {}));
    }
    if (method === 'PUT' && pathname === '/api/compound-settings') {
      const settings = await readJson(req);
      const existing = store.get('compoundSettings', {});
      Object.assign(existing, settings);
      store.set('compoundSettings', existing);
      return respondJson(res, 200, { success: true });
    }

    if (method === 'GET' && pathname === '/api/bloodwork') {
      return respondJson(res, 200, asArray(store.get('bloodwork', [])));
    }
    if (method === 'POST' && pathname === '/api/bloodwork') {
      const entry = await readJson(req);
      store.set('bloodwork', [...asArray(store.get('bloodwork', [])), entry]);
      return respondJson(res, 200, { success: true });
    }
    if (pathname.startsWith('/api/bloodwork/') && method === 'DELETE') {
      const id = decodeURIComponent(pathname.slice('/api/bloodwork/'.length));
      store.set('bloodwork', deleteById(store.get('bloodwork', []), id));
      return respondJson(res, 200, { success: true });
    }

    if (method === 'GET' && pathname === '/api/inventory') {
      return respondJson(res, 200, asArray(store.get('inventory', [])));
    }
    if (method === 'POST' && pathname === '/api/inventory') {
      const entry = await readJson(req);
      store.set('inventory', upsertById(store.get('inventory', []), entry));
      return respondJson(res, 200, { success: true });
    }
    if (pathname.startsWith('/api/inventory/') && method === 'PUT') {
      const id = decodeURIComponent(pathname.slice('/api/inventory/'.length));
      const changes = await readJson(req);
      const result = updateById(store.get('inventory', []), id, changes);
      if (!result.found) return respondJson(res, 404, { success: false, error: 'Not found' });
      store.set('inventory', result.items);
      return respondJson(res, 200, { success: true });
    }
    if (pathname.startsWith('/api/inventory/') && method === 'DELETE') {
      const id = decodeURIComponent(pathname.slice('/api/inventory/'.length));
      store.set('inventory', deleteById(store.get('inventory', []), id));
      return respondJson(res, 200, { success: true });
    }

    if (method === 'GET' && pathname === '/api/supplies') {
      return respondJson(res, 200, asArray(store.get('supplies', [])));
    }
    if (method === 'POST' && pathname === '/api/supplies') {
      const entry = await readJson(req);
      store.set('supplies', upsertById(store.get('supplies', []), entry));
      return respondJson(res, 200, { success: true });
    }
    if (pathname.startsWith('/api/supplies/') && method === 'PUT') {
      const id = decodeURIComponent(pathname.slice('/api/supplies/'.length));
      const changes = await readJson(req);
      const result = updateById(store.get('supplies', []), id, changes);
      if (!result.found) return respondJson(res, 404, { success: false, error: 'Not found' });
      store.set('supplies', result.items);
      return respondJson(res, 200, { success: true });
    }
    if (pathname.startsWith('/api/supplies/') && method === 'DELETE') {
      const id = decodeURIComponent(pathname.slice('/api/supplies/'.length));
      store.set('supplies', deleteById(store.get('supplies', []), id));
      return respondJson(res, 200, { success: true });
    }

    if (method === 'GET' && pathname === '/api/orders') {
      return respondJson(res, 200, asArray(store.get('orders', [])));
    }
    if (method === 'POST' && pathname === '/api/orders') {
      const entry = await readJson(req);
      store.set('orders', upsertById(store.get('orders', []), entry));
      return respondJson(res, 200, { success: true });
    }
    if (pathname.startsWith('/api/orders/') && method === 'DELETE') {
      const id = decodeURIComponent(pathname.slice('/api/orders/'.length));
      store.set('orders', deleteById(store.get('orders', []), id));
      return respondJson(res, 200, { success: true });
    }

    if (method === 'GET' && pathname === '/api/supply-usage-config') {
      return respondJson(res, 200, store.get('supplyUsageConfig', { globalDefaults: {}, compoundOverrides: {} }));
    }
    if (method === 'PUT' && pathname === '/api/supply-usage-config') {
      const config = await readJson(req);
      store.set('supplyUsageConfig', config);
      return respondJson(res, 200, { success: true });
    }

    if (method === 'GET' && pathname === '/api/export') {
      return respondJson(res, 200, { ...store.dump(), exportedAt: new Date().toISOString() });
    }
    if (method === 'POST' && pathname === '/api/import') {
      const payload = await readJson(req);
      const cleaned = sanitizeImportData(payload);
      store.setMany(cleaned);
      return respondJson(res, 200, { success: true });
    }

    if (method === 'POST' && pathname === '/api/test-files') {
      const payload = await readJson(req);
      return respondJson(res, 200, {
        filePath: payload.fileDataUrl || '',
        fileName: payload.fileName || 'attachment'
      });
    }

    return false;
  }

  async function handler(req, res) {
    try {
      const url = new URL(req.url, 'http://localhost');
      const pathname = url.pathname;

      if (pathname.startsWith('/api/')) {
        const handled = await handleApi(req, res, pathname);
        if (handled === false) respondJson(res, 404, { error: 'Not found' });
        return;
      }

      let requested = pathname === '/' ? '/index.html' : pathname;
      let filePath = safePathJoin(staticDir, requested);
      if (!filePath || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
        filePath = safePathJoin(staticDir, '/index.html');
      }

      const ext = path.extname(filePath).toLowerCase();
      const contentType = MIME_TYPES[ext] || 'application/octet-stream';
      const data = fs.readFileSync(filePath);
      res.writeHead(200, {
        'content-type': contentType,
        'content-length': data.length
      });
      res.end(data);
    } catch (error) {
      respondJson(res, 500, { error: error.message || 'Internal server error' });
    }
  }

  return {
    listen(...args) {
      const server = http.createServer(handler);
      return server.listen(...args);
    },
    async request(method, requestPath, body) {
      const url = new URL(requestPath, 'http://localhost');
      let statusCode = 200;
      let payload = null;
      const req = { method, __body: body };
      const res = {
        writeHead(code) {
          statusCode = code;
        },
        end(content) {
          payload = content;
        }
      };
      const handled = await handleApi(req, res, url.pathname);
      if (handled === false) return { statusCode: 404, body: { error: 'Not found' } };
      return { statusCode, body: payload ? JSON.parse(payload) : null };
    }
  };
}

function startServer() {
  const port = Number(process.env.PORT || 3000);
  const app = createApp();
  app.listen(port, () => {
    console.log(`Compound Tracker web app running on http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer();
}

module.exports = { createApp, startServer };
