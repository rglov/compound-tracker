const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const Store = require('electron-store');

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
  const doses = store.get('doses', []);
  doses.push(dose);
  store.set('doses', doses);
  return { success: true };
});

ipcMain.handle('store:update-dose', (_, updated) => {
  const doses = store.get('doses', []);
  const idx = doses.findIndex(d => d.id === updated.id);
  if (idx === -1) return { success: false, error: 'Dose not found' };
  doses[idx] = { ...doses[idx], ...updated };
  store.set('doses', doses);
  return { success: true };
});

ipcMain.handle('store:delete-dose', (_, id) => {
  const doses = store.get('doses', []);
  store.set('doses', doses.filter(d => d.id !== id));
  return { success: true };
});

ipcMain.handle('store:get-custom-compounds', () => {
  return store.get('customCompounds', []);
});

ipcMain.handle('store:add-custom-compound', (_, compound) => {
  const compounds = store.get('customCompounds', []);
  compounds.push(compound);
  store.set('customCompounds', compounds);
  return { success: true };
});

ipcMain.handle('store:delete-custom-compound', (_, id) => {
  const compounds = store.get('customCompounds', []);
  store.set('customCompounds', compounds.filter(c => c.id !== id));
  return { success: true };
});

ipcMain.handle('store:get-custom-blends', () => {
  return store.get('customBlends', []);
});

ipcMain.handle('store:add-custom-blend', (_, blend) => {
  const blends = store.get('customBlends', []);
  blends.push(blend);
  store.set('customBlends', blends);
  return { success: true };
});

ipcMain.handle('store:delete-custom-blend', (_, id) => {
  const blends = store.get('customBlends', []);
  store.set('customBlends', blends.filter(b => b.id !== id));
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
  const bloodwork = store.get('bloodwork', []);
  bloodwork.push(entry);
  store.set('bloodwork', bloodwork);
  return { success: true };
});

ipcMain.handle('store:delete-bloodwork', (_, id) => {
  const bloodwork = store.get('bloodwork', []);
  store.set('bloodwork', bloodwork.filter(b => b.id !== id));
  return { success: true };
});

// Inventory
ipcMain.handle('store:get-inventory', () => {
  return store.get('inventory', []);
});

ipcMain.handle('store:save-inventory', (_, entry) => {
  const inventory = store.get('inventory', []);
  const idx = inventory.findIndex(i => i.id === entry.id);
  if (idx >= 0) {
    inventory[idx] = entry;
  } else {
    inventory.push(entry);
  }
  store.set('inventory', inventory);
  return { success: true };
});

ipcMain.handle('store:update-inventory', (_, { id, changes }) => {
  const inventory = store.get('inventory', []);
  const idx = inventory.findIndex(i => i.id === id);
  if (idx === -1) return { success: false, error: 'Not found' };
  Object.assign(inventory[idx], changes);
  store.set('inventory', inventory);
  return { success: true };
});

ipcMain.handle('store:delete-inventory', (_, id) => {
  const inventory = store.get('inventory', []);
  store.set('inventory', inventory.filter(i => i.id !== id));
  return { success: true };
});

// Supplies
ipcMain.handle('store:get-supplies', () => {
  return store.get('supplies', []);
});

ipcMain.handle('store:save-supply', (_, entry) => {
  const supplies = store.get('supplies', []);
  const idx = supplies.findIndex(s => s.id === entry.id);
  if (idx >= 0) {
    supplies[idx] = entry;
  } else {
    supplies.push(entry);
  }
  store.set('supplies', supplies);
  return { success: true };
});

ipcMain.handle('store:update-supply', (_, { id, changes }) => {
  const supplies = store.get('supplies', []);
  const idx = supplies.findIndex(s => s.id === id);
  if (idx === -1) return { success: false, error: 'Not found' };
  Object.assign(supplies[idx], changes);
  store.set('supplies', supplies);
  return { success: true };
});

ipcMain.handle('store:delete-supply', (_, id) => {
  const supplies = store.get('supplies', []);
  store.set('supplies', supplies.filter(s => s.id !== id));
  return { success: true };
});

// Orders
ipcMain.handle('store:get-orders', () => {
  return store.get('orders', []);
});

ipcMain.handle('store:save-order', (_, entry) => {
  const orders = store.get('orders', []);
  const idx = orders.findIndex(o => o.id === entry.id);
  if (idx >= 0) {
    orders[idx] = entry;
  } else {
    orders.push(entry);
  }
  store.set('orders', orders);
  return { success: true };
});

ipcMain.handle('store:delete-order', (_, id) => {
  const orders = store.get('orders', []);
  store.set('orders', orders.filter(o => o.id !== id));
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
  if (data.doses) store.set('doses', data.doses);
  if (data.customCompounds) store.set('customCompounds', data.customCompounds);
  if (data.customBlends) store.set('customBlends', data.customBlends);
  if (data.cycles) store.set('cycles', data.cycles);
  if (data.settings) store.set('settings', data.settings);
  if (data.compoundSettings) store.set('compoundSettings', data.compoundSettings);
  if (data.bloodwork) store.set('bloodwork', data.bloodwork);
  if (data.inventory) store.set('inventory', data.inventory);
  if (data.libraryOverrides) store.set('libraryOverrides', data.libraryOverrides);
  if (data.supplies) store.set('supplies', data.supplies);
  if (data.orders) store.set('orders', data.orders);
  if (data.supplyUsageConfig) store.set('supplyUsageConfig', data.supplyUsageConfig);
  return { success: true };
});
