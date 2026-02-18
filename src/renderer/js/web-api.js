async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      'content-type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });
  if (!response.ok) {
    let message = `Request failed: ${response.status}`;
    try {
      const body = await response.json();
      if (body && body.error) message = body.error;
    } catch {
      // ignore non-json error payloads
    }
    throw new Error(message);
  }
  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return response.json();
  return null;
}

function chooseFileAsDataUrl() {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.png,.jpg,.jpeg,.gif,.webp,.bmp,*/*';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return resolve(null);
      const reader = new FileReader();
      reader.onload = async () => {
        const fileDataUrl = String(reader.result || '');
        const payload = await apiRequest('/api/test-files', {
          method: 'POST',
          body: JSON.stringify({ fileName: file.name, fileDataUrl })
        });
        resolve(payload);
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(file);
    };
    input.click();
  });
}

window.api = {
  getDoses: () => apiRequest('/api/doses'),
  addDose: (dose) => apiRequest('/api/doses', { method: 'POST', body: JSON.stringify(dose) }),
  updateDose: (dose) => apiRequest(`/api/doses/${encodeURIComponent(dose.id)}`, { method: 'PUT', body: JSON.stringify(dose) }),
  deleteDose: (id) => apiRequest(`/api/doses/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getCustomCompounds: () => apiRequest('/api/custom-compounds'),
  addCustomCompound: (compound) => apiRequest('/api/custom-compounds', { method: 'POST', body: JSON.stringify(compound) }),
  deleteCustomCompound: (id) => apiRequest(`/api/custom-compounds/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getCustomBlends: () => apiRequest('/api/custom-blends'),
  addCustomBlend: (blend) => apiRequest('/api/custom-blends', { method: 'POST', body: JSON.stringify(blend) }),
  deleteCustomBlend: (id) => apiRequest(`/api/custom-blends/${encodeURIComponent(id)}`, { method: 'DELETE' }),
  getCycles: () => apiRequest('/api/cycles'),
  saveCycles: (cycles) => apiRequest('/api/cycles', { method: 'PUT', body: JSON.stringify(cycles) }),
  getSettings: () => apiRequest('/api/settings'),
  saveSettings: (settings) => apiRequest('/api/settings', { method: 'PUT', body: JSON.stringify(settings) }),
  exportData: () => apiRequest('/api/export'),
  importData: (data) => apiRequest('/api/import', { method: 'POST', body: JSON.stringify(data) }),

  getLibraryOverrides: () => apiRequest('/api/library-overrides'),
  saveLibraryOverride: (name, data) => apiRequest('/api/library-overrides', { method: 'PUT', body: JSON.stringify({ name, data }) }),

  getCompoundSettings: () => apiRequest('/api/compound-settings'),
  saveCompoundSettings: (settings) => apiRequest('/api/compound-settings', { method: 'PUT', body: JSON.stringify(settings) }),

  getBloodwork: () => apiRequest('/api/bloodwork'),
  addBloodwork: (entry) => apiRequest('/api/bloodwork', { method: 'POST', body: JSON.stringify(entry) }),
  deleteBloodwork: (id) => apiRequest(`/api/bloodwork/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  getInventory: () => apiRequest('/api/inventory'),
  saveInventory: (entry) => apiRequest('/api/inventory', { method: 'POST', body: JSON.stringify(entry) }),
  updateInventory: (id, changes) => apiRequest(`/api/inventory/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(changes) }),
  deleteInventory: (id) => apiRequest(`/api/inventory/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  getSupplies: () => apiRequest('/api/supplies'),
  saveSupply: (entry) => apiRequest('/api/supplies', { method: 'POST', body: JSON.stringify(entry) }),
  updateSupply: (id, changes) => apiRequest(`/api/supplies/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(changes) }),
  deleteSupply: (id) => apiRequest(`/api/supplies/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  getOrders: () => apiRequest('/api/orders'),
  saveOrder: (entry) => apiRequest('/api/orders', { method: 'POST', body: JSON.stringify(entry) }),
  deleteOrder: (id) => apiRequest(`/api/orders/${encodeURIComponent(id)}`, { method: 'DELETE' }),

  getSupplyUsageConfig: () => apiRequest('/api/supply-usage-config'),
  saveSupplyUsageConfig: (config) => apiRequest('/api/supply-usage-config', { method: 'PUT', body: JSON.stringify(config) }),

  pickTestFile: () => chooseFileAsDataUrl(),
  openTestFile: (filePath) => {
    if (!filePath) return false;
    window.open(filePath, '_blank', 'noopener,noreferrer');
    return true;
  }
};
