const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  getDoses: () => ipcRenderer.invoke('store:get-doses'),
  addDose: (dose) => ipcRenderer.invoke('store:add-dose', dose),
  updateDose: (dose) => ipcRenderer.invoke('store:update-dose', dose),
  deleteDose: (id) => ipcRenderer.invoke('store:delete-dose', id),
  getCustomCompounds: () => ipcRenderer.invoke('store:get-custom-compounds'),
  addCustomCompound: (compound) => ipcRenderer.invoke('store:add-custom-compound', compound),
  deleteCustomCompound: (id) => ipcRenderer.invoke('store:delete-custom-compound', id),
  getCustomBlends: () => ipcRenderer.invoke('store:get-custom-blends'),
  addCustomBlend: (blend) => ipcRenderer.invoke('store:add-custom-blend', blend),
  deleteCustomBlend: (id) => ipcRenderer.invoke('store:delete-custom-blend', id),
  getCycles: () => ipcRenderer.invoke('store:get-cycles'),
  saveCycles: (cycles) => ipcRenderer.invoke('store:save-cycles', cycles),
  getSettings: () => ipcRenderer.invoke('store:get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('store:save-settings', settings),
  exportData: () => ipcRenderer.invoke('store:export-data'),
  importData: (data) => ipcRenderer.invoke('store:import-data', data),

  // Library overrides
  getLibraryOverrides: () => ipcRenderer.invoke('store:get-library-overrides'),
  saveLibraryOverride: (name, data) => ipcRenderer.invoke('store:save-library-override', { name, data }),

  // Compound settings
  getCompoundSettings: () => ipcRenderer.invoke('store:get-compound-settings'),
  saveCompoundSettings: (settings) => ipcRenderer.invoke('store:save-compound-settings', settings),

  // Bloodwork
  getBloodwork: () => ipcRenderer.invoke('store:get-bloodwork'),
  addBloodwork: (entry) => ipcRenderer.invoke('store:add-bloodwork', entry),
  deleteBloodwork: (id) => ipcRenderer.invoke('store:delete-bloodwork', id),

  // Inventory
  getInventory: () => ipcRenderer.invoke('store:get-inventory'),
  saveInventory: (entry) => ipcRenderer.invoke('store:save-inventory', entry),
  updateInventory: (id, changes) => ipcRenderer.invoke('store:update-inventory', { id, changes }),
  deleteInventory: (id) => ipcRenderer.invoke('store:delete-inventory', id),
});
