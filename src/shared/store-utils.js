function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function upsertById(items, entry) {
  const list = asArray(items);
  const index = list.findIndex((item) => item && item.id === entry.id);
  if (index >= 0) {
    const next = [...list];
    next[index] = entry;
    return next;
  }
  return [...list, entry];
}

function updateById(items, id, changes) {
  const list = asArray(items);
  const index = list.findIndex((item) => item && item.id === id);
  if (index < 0) return { found: false, items: list };
  const next = [...list];
  next[index] = { ...next[index], ...changes };
  return { found: true, items: next };
}

function deleteById(items, id) {
  return asArray(items).filter((item) => item && item.id !== id);
}

function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function sanitizeImportData(data) {
  if (!isPlainObject(data)) return {};

  const listKeys = [
    'doses',
    'customCompounds',
    'customBlends',
    'cycles',
    'bloodwork',
    'inventory',
    'supplies',
    'orders'
  ];

  const objectKeys = ['settings', 'compoundSettings', 'libraryOverrides', 'supplyUsageConfig'];
  const cleaned = {};

  for (const key of listKeys) {
    if (Array.isArray(data[key])) cleaned[key] = data[key];
  }

  for (const key of objectKeys) {
    if (isPlainObject(data[key])) cleaned[key] = data[key];
  }

  return cleaned;
}

module.exports = {
  asArray,
  upsertById,
  updateById,
  deleteById,
  sanitizeImportData
};
