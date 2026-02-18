const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');
const { asArray, upsertById, updateById, deleteById, sanitizeImportData } = require('./shared/store-utils');

const store = new Store({
  name: 'compound-tracker-data',
  defaults: {
    doses: [],
    customCompounds: [],
    customBlends: [],
    cycles: [],
    settings: { enabledInjectionSites: null },
    compoundSettings: {},
    bloodwork: [],
    inventory: [],
    libraryOverrides: {},
    supplies: [],
    orders: [],
    supplyUsageConfig: {
      globalDefaults: {
        intramuscular: [
          { category: 'needles', name: 'Drawing Needle', quantityPerDose: 1 },
          { category: 'needles', name: 'Injection Needle', quantityPerDose: 1 },
          { category: 'syringes', name: 'Syringe', quantityPerDose: 1 },
          { category: 'alcohol-swabs', name: 'Alcohol Swab', quantityPerDose: 2 }
        ],
        subcutaneous: [
          { category: 'syringes', name: 'Insulin Syringe', quantityPerDose: 1 },
          { category: 'alcohol-swabs', name: 'Alcohol Swab', quantityPerDose: 2 }
        ],
        oral: [],
        intravenous: [],
        topical: []
      },
      compoundOverrides: {}
    }
  }
});

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 850,
    minWidth: 900,
    minHeight: 600,
    backgroundColor: '#1a1a2e',
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});

// --- IPC Handlers ---

ipcMain.handle('store:get-doses', () => {
  return store.get('doses', []);
});

ipcMain.handle('store:add-dose', (_, dose) => {
  store.set('doses', [...asArray(store.get('doses', [])), dose]);
  return { success: true };
});

ipcMain.handle('store:update-dose', (_, updated) => {
  const result = updateById(store.get('doses', []), updated.id, updated);
  if (!result.found) return { success: false, error: 'Dose not found' };
  store.set('doses', result.items);
  return { success: true };
});

ipcMain.handle('store:delete-dose', (_, id) => {
  store.set('doses', deleteById(store.get('doses', []), id));
  return { success: true };
});

ipcMain.handle('store:get-custom-compounds', () => {
  return store.get('customCompounds', []);
});

ipcMain.handle('store:add-custom-compound', (_, compound) => {
  store.set('customCompounds', [...asArray(store.get('customCompounds', [])), compound]);
  return { success: true };
});

ipcMain.handle('store:delete-custom-compound', (_, id) => {
  store.set('customCompounds', deleteById(store.get('customCompounds', []), id));
  return { success: true };
});

ipcMain.handle('store:get-custom-blends', () => {
  return store.get('customBlends', []);
});

ipcMain.handle('store:add-custom-blend', (_, blend) => {
  store.set('customBlends', [...asArray(store.get('customBlends', [])), blend]);
  return { success: true };
});

ipcMain.handle('store:delete-custom-blend', (_, id) => {
  store.set('customBlends', deleteById(store.get('customBlends', []), id));
  return { success: true };
});

ipcMain.handle('store:get-cycles', () => {
  return store.get('cycles', []);
});

ipcMain.handle('store:save-cycles', (_, cycles) => {
  store.set('cycles', cycles);
  return { success: true };
});

ipcMain.handle('store:get-settings', () => {
  return store.get('settings', { enabledInjectionSites: null });
});

ipcMain.handle('store:save-settings', (_, settings) => {
  store.set('settings', settings);
  return { success: true };
});

// Library overrides
ipcMain.handle('store:get-library-overrides', () => {
  return store.get('libraryOverrides', {});
});

ipcMain.handle('store:save-library-override', (_, { name, data }) => {
  const overrides = store.get('libraryOverrides', {});
  overrides[name] = data;
  store.set('libraryOverrides', overrides);
  return { success: true };
});

// Compound settings (baseline + target)
ipcMain.handle('store:get-compound-settings', () => {
  return store.get('compoundSettings', {});
});

ipcMain.handle('store:save-compound-settings', (_, settings) => {
  const existing = store.get('compoundSettings', {});
  Object.assign(existing, settings);
  store.set('compoundSettings', existing);
  return { success: true };
});

// Bloodwork
ipcMain.handle('store:get-bloodwork', () => {
  return store.get('bloodwork', []);
});

ipcMain.handle('store:add-bloodwork', (_, entry) => {
  store.set('bloodwork', [...asArray(store.get('bloodwork', [])), entry]);
  return { success: true };
});

ipcMain.handle('store:delete-bloodwork', (_, id) => {
  store.set('bloodwork', deleteById(store.get('bloodwork', []), id));
  return { success: true };
});

// Inventory
ipcMain.handle('store:get-inventory', () => {
  return store.get('inventory', []);
});

ipcMain.handle('store:save-inventory', (_, entry) => {
  store.set('inventory', upsertById(store.get('inventory', []), entry));
  return { success: true };
});

ipcMain.handle('store:update-inventory', (_, { id, changes }) => {
  const result = updateById(store.get('inventory', []), id, changes);
  if (!result.found) return { success: false, error: 'Not found' };
  store.set('inventory', result.items);
  return { success: true };
});

ipcMain.handle('store:delete-inventory', (_, id) => {
  store.set('inventory', deleteById(store.get('inventory', []), id));
  return { success: true };
});

// Supplies
ipcMain.handle('store:get-supplies', () => {
  return store.get('supplies', []);
});

ipcMain.handle('store:save-supply', (_, entry) => {
  store.set('supplies', upsertById(store.get('supplies', []), entry));
  return { success: true };
});

ipcMain.handle('store:update-supply', (_, { id, changes }) => {
  const result = updateById(store.get('supplies', []), id, changes);
  if (!result.found) return { success: false, error: 'Not found' };
  store.set('supplies', result.items);
  return { success: true };
});

ipcMain.handle('store:delete-supply', (_, id) => {
  store.set('supplies', deleteById(store.get('supplies', []), id));
  return { success: true };
});

// Orders
ipcMain.handle('store:get-orders', () => {
  return store.get('orders', []);
});

ipcMain.handle('store:save-order', (_, entry) => {
  store.set('orders', upsertById(store.get('orders', []), entry));
  return { success: true };
});

ipcMain.handle('store:delete-order', (_, id) => {
  store.set('orders', deleteById(store.get('orders', []), id));
  return { success: true };
});

// Supply Usage Config
ipcMain.handle('store:get-supply-usage-config', () => {
  return store.get('supplyUsageConfig', { globalDefaults: {}, compoundOverrides: {} });
});

ipcMain.handle('store:save-supply-usage-config', (_, config) => {
  store.set('supplyUsageConfig', config);
  return { success: true };
});

// Test results file handling
ipcMain.handle('pick-test-file', async () => {
  const result = await dialog.showOpenDialog(BrowserWindow.getFocusedWindow(), {
    title: 'Select Test Results File',
    filters: [
      { name: 'Documents', extensions: ['pdf', 'png', 'jpg', 'jpeg', 'gif', 'webp', 'bmp'] },
      { name: 'All Files', extensions: ['*'] }
    ],
    properties: ['openFile']
  });
  if (result.canceled || result.filePaths.length === 0) return null;

  const srcPath = result.filePaths[0];
  const testResultsDir = path.join(app.getPath('userData'), 'test-results');
  if (!fs.existsSync(testResultsDir)) fs.mkdirSync(testResultsDir, { recursive: true });

  const ext = path.extname(srcPath);
  const destName = Date.now() + '-' + path.basename(srcPath);
  const destPath = path.join(testResultsDir, destName);
  fs.copyFileSync(srcPath, destPath);

  return { filePath: destPath, fileName: path.basename(srcPath) };
});

ipcMain.handle('open-test-file', (_, filePath) => {
  if (filePath && fs.existsSync(filePath)) {
    shell.openPath(filePath);
    return true;
  }
  return false;
});

ipcMain.handle('store:export-data', () => {
  return {
    doses: store.get('doses', []),
    customCompounds: store.get('customCompounds', []),
    customBlends: store.get('customBlends', []),
    cycles: store.get('cycles', []),
    settings: store.get('settings', { enabledInjectionSites: null }),
    compoundSettings: store.get('compoundSettings', {}),
    bloodwork: store.get('bloodwork', []),
    inventory: store.get('inventory', []),
    libraryOverrides: store.get('libraryOverrides', {}),
    supplies: store.get('supplies', []),
    orders: store.get('orders', []),
    supplyUsageConfig: store.get('supplyUsageConfig', { globalDefaults: {}, compoundOverrides: {} }),
    exportedAt: new Date().toISOString()
  };
});

ipcMain.handle('store:import-data', (_, data) => {
  const cleaned = sanitizeImportData(data);
  for (const [key, value] of Object.entries(cleaned)) {
    store.set(key, value);
  }
  return { success: true };
});
