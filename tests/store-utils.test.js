const test = require('node:test');
const assert = require('node:assert/strict');

const {
  asArray,
  deleteById,
  updateById,
  upsertById,
  sanitizeImportData
} = require('../src/shared/store-utils');

test('asArray returns [] for non-array values', () => {
  assert.deepEqual(asArray(undefined), []);
  assert.deepEqual(asArray(null), []);
  assert.deepEqual(asArray({}), []);
});

test('upsertById updates existing entries and appends new entries', () => {
  const existing = [{ id: 'a', value: 1 }];
  assert.deepEqual(upsertById(existing, { id: 'a', value: 2 }), [{ id: 'a', value: 2 }]);
  assert.deepEqual(upsertById(existing, { id: 'b', value: 3 }), [
    { id: 'a', value: 1 },
    { id: 'b', value: 3 }
  ]);
});

test('updateById merges the matching entry', () => {
  const result = updateById([{ id: 'a', value: 1 }], 'a', { value: 4, extra: true });
  assert.equal(result.found, true);
  assert.deepEqual(result.items, [{ id: 'a', value: 4, extra: true }]);
});

test('deleteById removes matching entries', () => {
  const result = deleteById([{ id: 'a' }, { id: 'b' }], 'a');
  assert.deepEqual(result, [{ id: 'b' }]);
});

test('sanitizeImportData ignores invalid list/object shapes', () => {
  const cleaned = sanitizeImportData({
    doses: 'not-an-array',
    customCompounds: [{ id: '1' }],
    settings: [],
    compoundSettings: { a: 1 },
    inventory: [{ id: 'x' }],
    supplyUsageConfig: { globalDefaults: {}, compoundOverrides: {} }
  });

  assert.equal('doses' in cleaned, false);
  assert.deepEqual(cleaned.customCompounds, [{ id: '1' }]);
  assert.equal('settings' in cleaned, false);
  assert.deepEqual(cleaned.compoundSettings, { a: 1 });
  assert.deepEqual(cleaned.inventory, [{ id: 'x' }]);
  assert.deepEqual(cleaned.supplyUsageConfig, { globalDefaults: {}, compoundOverrides: {} });
});
