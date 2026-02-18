const fs = require('node:fs');
const path = require('node:path');

class JsonStore {
  constructor({ filePath, defaults }) {
    this.filePath = filePath;
    this.defaults = defaults;
    this.data = this.load();
  }

  load() {
    try {
      if (!fs.existsSync(this.filePath)) {
        this.ensureDir();
        const initial = structuredClone(this.defaults);
        fs.writeFileSync(this.filePath, JSON.stringify(initial, null, 2), 'utf8');
        return initial;
      }
      const raw = fs.readFileSync(this.filePath, 'utf8');
      const parsed = raw.trim() ? JSON.parse(raw) : {};
      return { ...structuredClone(this.defaults), ...parsed };
    } catch {
      return structuredClone(this.defaults);
    }
  }

  ensureDir() {
    const dir = path.dirname(this.filePath);
    fs.mkdirSync(dir, { recursive: true });
  }

  save() {
    this.ensureDir();
    fs.writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf8');
  }

  get(key, fallback) {
    const value = this.data[key];
    return value === undefined ? fallback : value;
  }

  set(key, value) {
    this.data[key] = value;
    this.save();
  }

  setMany(entries) {
    for (const [key, value] of Object.entries(entries)) {
      this.data[key] = value;
    }
    this.save();
  }

  dump() {
    return structuredClone(this.data);
  }
}

module.exports = { JsonStore };
