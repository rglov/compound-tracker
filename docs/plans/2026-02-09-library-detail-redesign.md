# Library + Detail View Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Merge the Library into a unified Compounds view with Active/Planned filters, enrich the compound detail page with baseline/target, bloodwork, reconstitution calculator, and inventory with auto-deduction, and fix the dose logger to use a single data source with persistent library edits.

**Architecture:** Electron app with main process (IPC + electron-store persistence) and renderer (vanilla JS, Chart.js). All new features add IPC handlers in `main.js`, expose them in `preload.js`, and consume them in renderer JS files. No build step — files are loaded directly via `<script>` tags. LIBRARY_DATA in `library.js` is the rich compound reference; COMPOUND_LIBRARY in `compounds.js` is the simpler decay-math list kept for backward compat only.

**Tech Stack:** Electron 33, electron-store, Chart.js 4, Luxon, vanilla JS (no framework)

---

## Task 1: Library Persistence (IPC + Override Merging)

**Goal:** Let users edit library entries and have changes survive app restart. Store edits as overrides layered on top of the built-in LIBRARY_DATA.

**Files:**
- Modify: `src/main.js:1-145` (add store defaults + IPC handlers)
- Modify: `src/preload.js:1-21` (expose new API methods)
- Modify: `src/renderer/js/library.js:1-10` (add override merging at load time)
- Modify: `src/renderer/js/library.js:1322-1373` (update saveLibraryEdits to persist)
- Modify: `src/renderer/js/app.js:71-90` (load overrides at init)

**Step 1: Add new store defaults and IPC handlers in main.js**

In `src/main.js`, update the store defaults (line 6-14) to add new keys:

```js
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
    libraryOverrides: {}
  }
});
```

Then add these IPC handlers after the existing ones (after line 144):

```js
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
```

Also update the export/import handlers to include the new data:

In `store:export-data` (line 126-135), add the new keys:
```js
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
    exportedAt: new Date().toISOString()
  };
});
```

In `store:import-data` (line 137-144), add:
```js
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
  return { success: true };
});
```

**Step 2: Expose new APIs in preload.js**

Replace `src/preload.js` with:

```js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Existing
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
  // New
  getLibraryOverrides: () => ipcRenderer.invoke('store:get-library-overrides'),
  saveLibraryOverride: (name, data) => ipcRenderer.invoke('store:save-library-override', { name, data }),
  getCompoundSettings: () => ipcRenderer.invoke('store:get-compound-settings'),
  saveCompoundSettings: (settings) => ipcRenderer.invoke('store:save-compound-settings', settings),
  getBloodwork: () => ipcRenderer.invoke('store:get-bloodwork'),
  addBloodwork: (entry) => ipcRenderer.invoke('store:add-bloodwork', entry),
  deleteBloodwork: (id) => ipcRenderer.invoke('store:delete-bloodwork', id),
  getInventory: () => ipcRenderer.invoke('store:get-inventory'),
  saveInventory: (entry) => ipcRenderer.invoke('store:save-inventory', entry),
  updateInventory: (id, changes) => ipcRenderer.invoke('store:update-inventory', { id, changes }),
  deleteInventory: (id) => ipcRenderer.invoke('store:delete-inventory', id),
});
```

**Step 3: Add override merging to library.js**

At the top of `src/renderer/js/library.js` (before `const LIBRARY_DATA = [`), add a merging function. After the `LIBRARY_DATA` array and `LIBRARY_TYPE_CONFIG` are defined, add:

```js
// Apply persisted overrides to LIBRARY_DATA entries
async function applyLibraryOverrides() {
  const overrides = await window.api.getLibraryOverrides();
  for (const [name, data] of Object.entries(overrides)) {
    const existing = LIBRARY_DATA.find(c => c.name === name);
    if (existing) {
      Object.assign(existing, data);
    } else {
      // New compound added by user
      LIBRARY_DATA.push({ name, ...data });
    }
  }
}
```

**Step 4: Update saveLibraryEdits to persist**

In `src/renderer/js/library.js`, replace the `saveLibraryEdits` function (line 1322-1373) so it also calls the API:

```js
async function saveLibraryEdits() {
  if (!detailLibraryData) return;
  const compound = detailLibraryData;
  const originalName = compound.name;

  const getVal = (id) => { const el = document.getElementById(id); return el ? el.value : null; };

  const newName = getVal('lib-edit-name');
  if (newName && newName.trim()) compound.name = newName.trim();

  const newType = getVal('lib-edit-type');
  if (newType) compound.type = newType;

  const newHalfLife = getVal('lib-edit-halflife');
  if (newHalfLife !== null && newHalfLife !== '') {
    compound.halfLifeHours = parseFloat(newHalfLife) || null;
  }

  const newBenefits = getVal('lib-edit-benefits');
  if (newBenefits !== null) {
    compound.benefits = newBenefits.split(',').map(s => s.trim()).filter(Boolean);
  }

  const newTags = getVal('lib-edit-tags');
  if (newTags !== null) {
    compound.tags = newTags.split(',').map(s => s.trim()).filter(Boolean);
  }

  const newGoodWith = getVal('lib-edit-goodwith');
  if (newGoodWith !== null) {
    compound.goodWith = newGoodWith.split(',').map(s => s.trim()).filter(Boolean);
  }

  const newNotGoodWith = getVal('lib-edit-notgoodwith');
  if (newNotGoodWith !== null) {
    compound.notGoodWith = newNotGoodWith.split(',').map(s => s.trim()).filter(Boolean);
  }

  const newProtocols = getVal('lib-edit-protocols');
  if (newProtocols !== null) compound.protocols = newProtocols;

  const newSideEffects = getVal('lib-edit-sideeffects');
  if (newSideEffects !== null) {
    compound.sideEffects = newSideEffects.split(',').map(s => s.trim()).filter(Boolean);
  }

  const newNotes = getVal('lib-edit-notes');
  if (newNotes !== null) compound.notes = newNotes;

  // Persist to electron-store
  const overrideData = {
    type: compound.type,
    halfLifeHours: compound.halfLifeHours,
    benefits: compound.benefits,
    tags: compound.tags,
    goodWith: compound.goodWith,
    notGoodWith: compound.notGoodWith,
    protocols: compound.protocols,
    sideEffects: compound.sideEffects,
    notes: compound.notes
  };
  await window.api.saveLibraryOverride(compound.name, overrideData);

  showToast(`Updated ${compound.name}`, 'success');
}
```

**Step 5: Load overrides at app init**

In `src/renderer/js/app.js`, update the DOMContentLoaded handler to load overrides early:

```js
document.addEventListener('DOMContentLoaded', async () => {
  // Setup navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });
  });

  // Load settings first
  await loadEnabledSites();

  // Load library overrides before anything uses LIBRARY_DATA
  await applyLibraryOverrides();

  // Initialize all modules
  await initDoseLogger();
  await initCustomCompounds();
  await initHistory();
  initCompoundDetail();
  initLibrary();
  await initCycles();
  await initDashboard();
});
```

**Step 6: Verify**

Run: `npm start`

Expected: App launches. Navigate to Library, click a compound, click Edit, change a field, click Done. Restart the app. The edit should be preserved.

**Step 7: Commit**

```bash
git add src/main.js src/preload.js src/renderer/js/library.js src/renderer/js/app.js
git commit -m "feat: persist library edits via electron-store overrides"
```

---

## Task 2: Dose Logger Unification

**Goal:** Make LIBRARY_DATA the single source for the dose logger dropdown, eliminating the confusing dual-source.

**Files:**
- Modify: `src/renderer/js/dose-logger.js:38-92` (simplify refreshCompoundSelect)
- Modify: `src/renderer/js/dose-logger.js:93-109` (remove guessDefaultUnit/Route since LIBRARY_DATA has better data)
- Modify: `src/renderer/js/dose-logger.js:111-181` (simplify populateCompoundDropdown)

**Step 1: Simplify refreshCompoundSelect**

Replace `refreshCompoundSelect` in `src/renderer/js/dose-logger.js` (line 38-92):

```js
async function refreshCompoundSelect() {
  const customCompounds = await window.api.getCustomCompounds();
  const customBlends = await window.api.getCustomBlends();

  // Build from LIBRARY_DATA as single source
  const libraryCompounds = LIBRARY_DATA.filter(c => c.type !== 'Blend').map(c => ({
    id: c.name,
    name: c.name,
    category: LIB_TYPE_TO_CATEGORY[c.type] || 'peptide',
    halfLifeHours: c.halfLifeHours || 0,
    defaultUnit: guessDefaultUnit(c),
    defaultRoute: guessDefaultRoute(c),
    color: LIBRARY_TYPE_CONFIG[c.type]?.color || '#888',
    isLibrary: true
  }));

  const libraryBlends = LIBRARY_DATA.filter(c => c.type === 'Blend').map(c => ({
    id: c.name,
    name: c.name,
    category: 'blend',
    halfLifeHours: c.halfLifeHours || 0,
    defaultUnit: 'mcg',
    defaultRoute: 'subcutaneous',
    color: LIBRARY_TYPE_CONFIG['Blend']?.color || '#ffd54f',
    isLibrary: true,
    isLibraryBlend: true
  }));

  allCompoundsForSelect = [
    ...libraryCompounds,
    ...libraryBlends,
    ...customCompounds.map(c => ({
      ...c,
      color: '#888',
      isCustom: true
    }))
  ];

  allBlendsForSelect = customBlends;
  populateCompoundDropdown();
}
```

Note: This removes the `builtinExtra` logic that pulled from `COMPOUND_LIBRARY`. All compounds now come from `LIBRARY_DATA` (which already includes all the important ones) plus custom compounds.

**Step 2: Update dose logging to use compound name as ID consistently**

In `setupDoseForm` (line 276-364), the logic at line 323 already does:
```js
const compoundId = compound.isLibrary ? compound.name : compound.id;
```
This is correct — library compounds use name as ID. No change needed here.

**Step 3: Verify**

Run: `npm start`

Expected: Click "Log Dose" on dashboard. The dropdown should show all compounds from the library, grouped by type, with no duplicates. Selecting a compound should show its half-life and auto-fill unit/route.

**Step 4: Commit**

```bash
git add src/renderer/js/dose-logger.js
git commit -m "feat: unify dose logger dropdown to use LIBRARY_DATA as single source"
```

---

## Task 3: Merged Compounds View

**Goal:** Rename the Library tab to "Compounds" and add Active/Planned status badges and filters.

**Files:**
- Modify: `src/renderer/index.html:22-25` (rename nav button)
- Modify: `src/renderer/index.html:106-128` (add status filter pills to library toolbar)
- Modify: `src/renderer/js/library.js:1167-1169` (add status filter state)
- Modify: `src/renderer/js/library.js:1171-1200` (add status filter init)
- Modify: `src/renderer/js/library.js:1202-1226` (update getFilteredLibrary)
- Modify: `src/renderer/js/library.js:1277-1308` (add status badges to card rendering)
- Modify: `src/renderer/css/styles.css` (add badge + filter pill styles)

**Step 1: Rename Library nav button in index.html**

In `src/renderer/index.html`, change line 22-25:

```html
     <button class="nav-btn" data-view="library">
       <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
       Compounds
     </button>
```

Also update the view header (line 107-109):

```html
      <div class="view-header">
        <h2>Compounds</h2>
        <span id="library-count" class="library-count-badge"></span>
      </div>
```

**Step 2: Add status filter pills to the library toolbar**

In `src/renderer/index.html`, update the library toolbar (line 111-127). Add status pills before the search:

```html
      <div class="library-toolbar">
        <div class="library-status-filters">
          <button class="status-pill active" data-status="all">All</button>
          <button class="status-pill" data-status="active">Active</button>
          <button class="status-pill" data-status="planned">Planned</button>
          <button class="status-pill" data-status="reference">Reference</button>
        </div>
        <div class="library-search-wrap">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input type="text" id="library-search" placeholder="Search compounds, benefits, tags..." autocomplete="off">
        </div>
        <select id="library-type-filter">
          <option value="all">All Types</option>
          <option value="Peptide">Peptides</option>
          <option value="Hormone">Hormones</option>
          <option value="Supplement">Supplements</option>
          <option value="Blend">Blends</option>
        </select>
        <select id="library-tag-filter">
          <option value="all">All Tags</option>
        </select>
      </div>
```

**Step 3: Add status filter state and logic in library.js**

Add new state variable near line 1169:
```js
let libraryStatusFilter = 'all';
```

Add a helper function to compute active/planned status. Place this after `getAllTags()`:

```js
// Compute compound status by cross-referencing doses and cycles
let _activeCompoundNames = new Set();
let _plannedCompoundNames = new Set();

async function refreshCompoundStatuses() {
  const doses = await window.api.getDoses();
  const cycles = await window.api.getCycles();
  const now = Date.now();

  // Active = has non-zero remaining level
  _activeCompoundNames = new Set();
  for (const dose of doses) {
    const remaining = calculateRemainingLevel(dose, now);
    if (remaining > 0) {
      _activeCompoundNames.add(dose.compoundName);
    }
  }

  // Planned = in an active or planned cycle
  _plannedCompoundNames = new Set();
  for (const cycle of cycles) {
    if (cycle.status === 'active' || cycle.status === 'planned') {
      for (const entry of cycle.entries) {
        _plannedCompoundNames.add(entry.compoundName);
      }
    }
  }
}

function getCompoundStatus(compoundName) {
  if (_activeCompoundNames.has(compoundName)) return 'active';
  if (_plannedCompoundNames.has(compoundName)) return 'planned';
  return 'reference';
}
```

**Step 4: Update initLibrary to set up status filters**

In `initLibrary` (line 1171-1200), add status filter setup:

```js
async function initLibrary() {
  await refreshCompoundStatuses();
  renderLibrary();

  // Search input
  const searchInput = document.getElementById('library-search');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      librarySearchTerm = e.target.value.toLowerCase();
      renderLibrary();
    });
  }

  // Type filter
  const typeFilter = document.getElementById('library-type-filter');
  if (typeFilter) {
    typeFilter.addEventListener('change', (e) => {
      libraryTypeFilter = e.target.value;
      renderLibrary();
    });
  }

  // Tag filter
  const tagFilter = document.getElementById('library-tag-filter');
  if (tagFilter) {
    tagFilter.addEventListener('change', (e) => {
      libraryTagFilter = e.target.value;
      renderLibrary();
    });
  }

  // Status filter pills
  document.querySelectorAll('.status-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.status-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      libraryStatusFilter = pill.dataset.status;
      renderLibrary();
    });
  });
}
```

**Step 5: Update getFilteredLibrary to include status filter**

```js
function getFilteredLibrary() {
  return LIBRARY_DATA.filter(compound => {
    // Status filter
    if (libraryStatusFilter !== 'all') {
      const status = getCompoundStatus(compound.name);
      if (libraryStatusFilter === 'reference' && status !== 'reference') return false;
      if (libraryStatusFilter === 'active' && status !== 'active') return false;
      if (libraryStatusFilter === 'planned' && status !== 'planned' && status !== 'active') return false;
    }

    // Search filter
    if (librarySearchTerm) {
      const searchIn = [
        compound.name,
        ...(compound.benefits || []),
        ...(compound.tags || []),
        compound.notes || '',
        compound.type || ''
      ].join(' ').toLowerCase();
      if (!searchIn.includes(librarySearchTerm)) return false;
    }

    // Type filter
    if (libraryTypeFilter !== 'all' && compound.type !== libraryTypeFilter) return false;

    // Tag filter
    if (libraryTagFilter !== 'all') {
      if (!compound.tags || !compound.tags.includes(libraryTagFilter)) return false;
    }

    return true;
  });
}
```

**Step 6: Add status badges to card rendering**

In `renderLibrary`, inside the card template (around line 1280-1306), add a status badge after the type badge:

```js
const status = getCompoundStatus(compound.name);
const statusBadge = status === 'active'
  ? '<span class="compound-status-badge active">Active</span>'
  : status === 'planned'
  ? '<span class="compound-status-badge planned">Planned</span>'
  : '';
```

Add `${statusBadge}` inside the `.library-card-title-row` div, after the type badge.

**Step 7: Update renderLibrary to also refresh statuses**

Wrap `renderLibrary` to be async and refresh statuses:

```js
async function renderLibrary() {
  await refreshCompoundStatuses();
  // ... rest of existing renderLibrary body
}
```

**Step 8: Add CSS for status badges and filter pills**

Append to `src/renderer/css/styles.css`:

```css
/* Status filter pills */
.library-status-filters {
  display: flex;
  gap: 4px;
}

.status-pill {
  padding: 5px 12px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 12px;
  font-family: var(--font);
  border-radius: 16px;
  cursor: pointer;
  transition: all var(--transition);
}

.status-pill:hover {
  background: var(--bg-surface-hover);
  color: var(--text-primary);
}

.status-pill.active {
  background: var(--accent-primary);
  color: #fff;
  border-color: var(--accent-primary);
}

/* Compound status badges */
.compound-status-badge {
  font-size: 10px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.compound-status-badge.active {
  background: rgba(0, 230, 118, 0.15);
  color: var(--accent-green);
}

.compound-status-badge.planned {
  background: rgba(67, 97, 238, 0.15);
  color: var(--accent-primary);
}
```

**Step 9: Verify**

Run: `npm start`

Expected: The nav shows "Compounds" instead of "Library". The toolbar has All/Active/Planned/Reference pills. If you have logged doses, compounds with remaining levels show an "ACTIVE" badge. Compounds in cycles show "PLANNED".

**Step 10: Commit**

```bash
git add src/renderer/index.html src/renderer/js/library.js src/renderer/css/styles.css
git commit -m "feat: merge library into unified Compounds view with status badges and filters"
```

---

## Task 4: Baseline + Target Range

**Goal:** Add per-compound baseline value and target range that display on the chart.

**Files:**
- Modify: `src/renderer/js/compound-detail.js:112-203` (add baseline section to refreshUnifiedDetail)
- Modify: `src/renderer/js/compound-detail.js:284-447` (add baseline/target to chart rendering)
- Modify: `src/renderer/index.html:195-215` (add baseline section HTML placeholder)
- Modify: `src/renderer/css/styles.css` (baseline section styles)

**Step 1: Add baseline HTML placeholder in index.html**

In `src/renderer/index.html`, inside `#detail-dose-section` (line 195-215), add a baseline section before the stats:

```html
      <div id="detail-dose-section">
        <div id="detail-baseline-section" class="detail-baseline-section hidden"></div>
        <div id="detail-stats" class="detail-stats-grid"></div>
        <!-- rest unchanged -->
```

**Step 2: Add baseline rendering in compound-detail.js**

Add a new function after `refreshUnifiedDetail`:

```js
let _compoundSettings = {};

async function loadCompoundSettings() {
  _compoundSettings = await window.api.getCompoundSettings();
}

function getSettingsForCompound(compoundName) {
  return _compoundSettings[compoundName] || null;
}

function renderBaselineSection(compoundName, unit) {
  const container = document.getElementById('detail-baseline-section');
  if (!container) return;

  const settings = getSettingsForCompound(compoundName);
  const hasSettings = settings && (settings.baseline || settings.targetMin || settings.targetMax);

  if (!hasSettings && !detailEditMode) {
    // Show "Set Baseline" button
    container.innerHTML = `
      <div class="baseline-prompt">
        <button class="btn btn-secondary btn-small" onclick="expandBaselineForm('${escapeHtml(compoundName)}', '${escapeHtml(unit)}')">
          Set Baseline & Target Range
        </button>
      </div>`;
    container.classList.remove('hidden');
    return;
  }

  if (hasSettings && !detailEditMode) {
    // Read-only display
    const parts = [];
    if (settings.baseline) parts.push(`Baseline: ${settings.baseline} ${settings.unit || unit}`);
    if (settings.targetMin && settings.targetMax) parts.push(`Target: ${settings.targetMin}-${settings.targetMax} ${settings.unit || unit}`);
    container.innerHTML = `
      <div class="baseline-display" onclick="expandBaselineForm('${escapeHtml(compoundName)}', '${escapeHtml(settings.unit || unit)}')">
        <span class="baseline-text">${parts.join(' | ')}</span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      </div>`;
    container.classList.remove('hidden');
    return;
  }

  // Edit form
  container.innerHTML = `
    <div class="baseline-form">
      <div class="baseline-form-row">
        <div class="baseline-field">
          <label class="form-label">Baseline</label>
          <input type="number" id="baseline-value" step="any" value="${settings?.baseline || ''}" placeholder="e.g. 350">
        </div>
        <div class="baseline-field">
          <label class="form-label">Target Min</label>
          <input type="number" id="baseline-target-min" step="any" value="${settings?.targetMin || ''}" placeholder="e.g. 800">
        </div>
        <div class="baseline-field">
          <label class="form-label">Target Max</label>
          <input type="number" id="baseline-target-max" step="any" value="${settings?.targetMax || ''}" placeholder="e.g. 1000">
        </div>
        <div class="baseline-field">
          <label class="form-label">Unit</label>
          <input type="text" id="baseline-unit" value="${settings?.unit || unit}" placeholder="ng/dL">
        </div>
        <button class="btn btn-primary btn-small" onclick="saveBaselineSettings('${escapeHtml(compoundName)}')">Save</button>
        <button class="btn btn-secondary btn-small" onclick="cancelBaselineEdit()">Cancel</button>
      </div>
    </div>`;
  container.classList.remove('hidden');
}

function expandBaselineForm(compoundName, unit) {
  detailEditMode = true;
  renderBaselineSection(compoundName, unit);
  detailEditMode = false;
  // Force form mode by re-rendering with form
  const container = document.getElementById('detail-baseline-section');
  const settings = getSettingsForCompound(compoundName);
  container.innerHTML = `
    <div class="baseline-form">
      <div class="baseline-form-row">
        <div class="baseline-field">
          <label class="form-label">Baseline</label>
          <input type="number" id="baseline-value" step="any" value="${settings?.baseline || ''}" placeholder="e.g. 350">
        </div>
        <div class="baseline-field">
          <label class="form-label">Target Min</label>
          <input type="number" id="baseline-target-min" step="any" value="${settings?.targetMin || ''}" placeholder="e.g. 800">
        </div>
        <div class="baseline-field">
          <label class="form-label">Target Max</label>
          <input type="number" id="baseline-target-max" step="any" value="${settings?.targetMax || ''}" placeholder="e.g. 1000">
        </div>
        <div class="baseline-field">
          <label class="form-label">Unit</label>
          <input type="text" id="baseline-unit" value="${settings?.unit || unit}" placeholder="ng/dL">
        </div>
        <button class="btn btn-primary btn-small" onclick="saveBaselineSettings('${escapeHtml(compoundName)}')">Save</button>
        <button class="btn btn-secondary btn-small" onclick="cancelBaselineEdit()">Cancel</button>
      </div>
    </div>`;
}

async function saveBaselineSettings(compoundName) {
  const baseline = parseFloat(document.getElementById('baseline-value').value) || null;
  const targetMin = parseFloat(document.getElementById('baseline-target-min').value) || null;
  const targetMax = parseFloat(document.getElementById('baseline-target-max').value) || null;
  const unit = document.getElementById('baseline-unit').value || 'mg';

  const settings = { baseline, targetMin, targetMax, unit };
  _compoundSettings[compoundName] = settings;
  await window.api.saveCompoundSettings({ [compoundName]: settings });

  showToast('Baseline saved', 'success');
  refreshUnifiedDetail();
}

function cancelBaselineEdit() {
  refreshUnifiedDetail();
}

// Expose to global scope
window.expandBaselineForm = expandBaselineForm;
window.saveBaselineSettings = saveBaselineSettings;
window.cancelBaselineEdit = cancelBaselineEdit;
```

**Step 3: Call renderBaselineSection from refreshUnifiedDetail**

In `refreshUnifiedDetail` (around line 158-162), after checking `hasDoses`, add:

```js
  // Render baseline section (for any compound, not just those with doses)
  const displayUnit = sampleDose ? sampleDose.unit : 'mg';
  renderBaselineSection(compoundName, displayUnit);
```

Also, at the top of `refreshUnifiedDetail`, load compound settings:

```js
async function refreshUnifiedDetail() {
  if (!detailCompoundId) return;
  await loadCompoundSettings();
  // ... rest unchanged
```

**Step 4: Add baseline/target lines to detail chart**

In `renderDetailChart` (line 284-447), update the `refBandPlugin` and add a baseline line plugin. After the existing `refBandPlugin` and `nowLinePlugin`, add:

```js
  // Baseline + target band plugin
  const baselinePlugin = {
    id: 'baselineBand',
    beforeDraw(chart) {
      const settings = getSettingsForCompound(detailCompoundMeta?.compoundName || detailCompoundId);
      if (!settings) return;

      const ctx = chart.ctx;
      const yScale = chart.scales.y;
      const xScale = chart.scales.x;

      // Target range band
      if (settings.targetMin && settings.targetMax) {
        const yMin = yScale.getPixelForValue(settings.targetMax);
        const yMax = yScale.getPixelForValue(settings.targetMin);
        const height = yMax - yMin;
        if (height > 0) {
          ctx.save();
          ctx.fillStyle = 'rgba(67, 97, 238, 0.08)';
          ctx.fillRect(xScale.left, yMin, xScale.right - xScale.left, height);
          ctx.strokeStyle = 'rgba(67, 97, 238, 0.3)';
          ctx.lineWidth = 1;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(xScale.left, yMin);
          ctx.lineTo(xScale.right, yMin);
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(xScale.left, yMax);
          ctx.lineTo(xScale.right, yMax);
          ctx.stroke();
          ctx.fillStyle = 'rgba(67, 97, 238, 0.6)';
          ctx.font = '10px -apple-system, sans-serif';
          ctx.textAlign = 'right';
          ctx.fillText('Target Range', xScale.right - 6, yMin + 14);
          ctx.restore();
        }
      }

      // Baseline line
      if (settings.baseline) {
        const yPixel = yScale.getPixelForValue(settings.baseline);
        ctx.save();
        ctx.strokeStyle = 'rgba(255, 213, 79, 0.6)';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([6, 4]);
        ctx.beginPath();
        ctx.moveTo(xScale.left, yPixel);
        ctx.lineTo(xScale.right, yPixel);
        ctx.stroke();
        ctx.fillStyle = 'rgba(255, 213, 79, 0.8)';
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText('Baseline', xScale.left + 6, yPixel - 6);
        ctx.restore();
      }
    }
  };
```

Add `baselinePlugin` to the chart plugins array (line 445): `plugins: [refBandPlugin, baselinePlugin, nowLinePlugin]`

Also update the y-axis max calculation to include baseline/target:

```js
  // Determine y-axis max (include baseline/target)
  let yMax = Math.max(...points.map(p => p.y)) * 1.2;
  if (ranges) {
    const refMax = Math.max(...ranges.map(r => r.max));
    yMax = Math.max(yMax, refMax * 1.1);
  }
  const settings = getSettingsForCompound(name);
  if (settings) {
    if (settings.targetMax) yMax = Math.max(yMax, settings.targetMax * 1.1);
    if (settings.baseline) yMax = Math.max(yMax, settings.baseline * 1.2);
  }
```

**Step 5: Add CSS for baseline section**

Append to `src/renderer/css/styles.css`:

```css
/* Baseline section */
.detail-baseline-section {
  margin-bottom: 12px;
}

.baseline-prompt {
  padding: 8px 0;
}

.baseline-display {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  cursor: pointer;
  transition: background var(--transition);
}

.baseline-display:hover {
  background: var(--bg-surface-hover);
}

.baseline-text {
  font-size: 13px;
  color: var(--text-secondary);
}

.baseline-form {
  padding: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}

.baseline-form-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
}

.baseline-field {
  flex: 1;
  min-width: 80px;
}

.baseline-field input {
  width: 100%;
}
```

**Step 6: Verify**

Run: `npm start`

Expected: Open a compound detail. You see a "Set Baseline & Target Range" button. Click it. Enter values. Save. The chart should show a dashed baseline line and a blue target band. Values persist across restart.

**Step 7: Commit**

```bash
git add src/renderer/index.html src/renderer/js/compound-detail.js src/renderer/css/styles.css
git commit -m "feat: add baseline + target range to compound detail with chart integration"
```

---

## Task 5: Bloodwork Panel

**Goal:** Let users log lab results and see them on the compound detail chart.

**Files:**
- Modify: `src/renderer/js/compound-detail.js` (add bloodwork section)
- Modify: `src/renderer/index.html` (add bloodwork container div)
- Modify: `src/renderer/css/styles.css` (bloodwork styles)

**Step 1: Add predefined marker definitions**

Add at the top of `src/renderer/js/compound-detail.js`, near the existing `REFERENCE_RANGES`:

```js
const BLOODWORK_MARKERS = {
  'Testosterone Cypionate': [
    { name: 'Total Testosterone', unit: 'ng/dL' },
    { name: 'Free Testosterone', unit: 'pg/mL' },
    { name: 'Estradiol', unit: 'pg/mL' },
    { name: 'Hematocrit', unit: '%' },
    { name: 'PSA', unit: 'ng/mL' },
    { name: 'SHBG', unit: 'nmol/L' }
  ],
  'Human Growth Hormone (HGH)': [
    { name: 'IGF-1', unit: 'ng/mL' },
    { name: 'Fasting GH', unit: 'ng/mL' },
    { name: 'Fasting Glucose', unit: 'mg/dL' }
  ]
};

// Also match by compound type for broader coverage
const BLOODWORK_MARKERS_BY_TYPE = {
  'Hormone': BLOODWORK_MARKERS['Testosterone Cypionate']
};

function getBloodworkMarkers(compoundName, compoundType) {
  return BLOODWORK_MARKERS[compoundName] || BLOODWORK_MARKERS_BY_TYPE[compoundType] || null;
}
```

**Step 2: Add bloodwork container in index.html**

In `src/renderer/index.html`, inside `#detail-dose-section`, after the chart section (around line 203), add:

```html
        <div id="detail-bloodwork-section" class="hidden"></div>
```

**Step 3: Add bloodwork rendering functions**

Add to `src/renderer/js/compound-detail.js`:

```js
let _bloodworkData = [];
let _selectedBloodworkMarker = null;

async function loadBloodwork() {
  _bloodworkData = await window.api.getBloodwork();
}

function getBloodworkForCompound(compoundName) {
  return _bloodworkData.filter(b => b.compoundName === compoundName)
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

function renderBloodworkSection(compoundName, compoundType) {
  const container = document.getElementById('detail-bloodwork-section');
  if (!container) return;

  const markers = getBloodworkMarkers(compoundName, compoundType);
  if (!markers) {
    container.innerHTML = '';
    container.classList.add('hidden');
    return;
  }

  const entries = getBloodworkForCompound(compoundName);

  // Marker toggle pills
  if (!_selectedBloodworkMarker && markers.length > 0) {
    _selectedBloodworkMarker = markers[0].name;
  }

  const pills = markers.map(m =>
    `<button class="bw-marker-pill ${m.name === _selectedBloodworkMarker ? 'active' : ''}" onclick="selectBloodworkMarker('${escapeHtml(m.name)}')">${escapeHtml(m.name)}</button>`
  ).join('');

  // Table of entries
  const rows = entries.map(e => `
    <tr>
      <td>${new Date(e.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td>${escapeHtml(e.marker)}</td>
      <td>${e.value} ${e.unit}</td>
      <td>${escapeHtml(e.notes || '')}</td>
      <td><button class="btn btn-danger btn-tiny" onclick="deleteBloodworkEntry('${e.id}')">X</button></td>
    </tr>
  `).join('');

  container.innerHTML = `
    <div class="detail-section">
      <div class="bw-header">
        <h3 class="detail-section-title">Bloodwork</h3>
        <button class="btn btn-secondary btn-small" onclick="showAddBloodworkForm('${escapeHtml(compoundName)}')">Add Result</button>
      </div>
      <div class="bw-marker-pills">${pills}</div>
      ${entries.length > 0 ? `
        <table class="bw-table">
          <thead><tr><th>Date</th><th>Marker</th><th>Value</th><th>Notes</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>` : '<p class="bw-empty">No bloodwork logged yet.</p>'}
      <div id="bw-add-form" class="hidden"></div>
    </div>`;
  container.classList.remove('hidden');
}

function showAddBloodworkForm(compoundName) {
  const formContainer = document.getElementById('bw-add-form');
  if (!formContainer) return;

  const compoundType = detailLibraryData?.type || '';
  const markers = getBloodworkMarkers(compoundName, compoundType) || [];

  const markerOptions = markers.map(m =>
    `<option value="${escapeHtml(m.name)}" data-unit="${escapeHtml(m.unit)}">${escapeHtml(m.name)} (${m.unit})</option>`
  ).join('');

  formContainer.innerHTML = `
    <div class="bw-form">
      <div class="bw-form-row">
        <div class="form-section flex-1">
          <label class="form-label">Date</label>
          <input type="date" id="bw-date" value="${new Date().toISOString().slice(0, 10)}">
        </div>
        <div class="form-section flex-1">
          <label class="form-label">Marker</label>
          <select id="bw-marker" onchange="updateBwUnit()">${markerOptions}</select>
        </div>
        <div class="form-section flex-half">
          <label class="form-label">Value</label>
          <input type="number" id="bw-value" step="any" placeholder="e.g. 850">
        </div>
        <div class="form-section flex-half">
          <label class="form-label">Unit</label>
          <input type="text" id="bw-unit" value="${markers[0]?.unit || ''}" readonly>
        </div>
      </div>
      <div class="bw-form-row">
        <div class="form-section flex-1">
          <label class="form-label">Notes (optional)</label>
          <input type="text" id="bw-notes" placeholder="e.g. Quest Diagnostics, fasted">
        </div>
        <button class="btn btn-primary btn-small" onclick="submitBloodwork('${escapeHtml(compoundName)}')">Add</button>
        <button class="btn btn-secondary btn-small" onclick="hideBloodworkForm()">Cancel</button>
      </div>
    </div>`;
  formContainer.classList.remove('hidden');
}

function updateBwUnit() {
  const select = document.getElementById('bw-marker');
  const option = select.options[select.selectedIndex];
  document.getElementById('bw-unit').value = option.dataset.unit || '';
}

async function submitBloodwork(compoundName) {
  const date = document.getElementById('bw-date').value;
  const marker = document.getElementById('bw-marker').value;
  const value = parseFloat(document.getElementById('bw-value').value);
  const unit = document.getElementById('bw-unit').value;
  const notes = document.getElementById('bw-notes').value;

  if (!date || !marker || isNaN(value)) {
    showToast('Please fill in date, marker, and value', 'error');
    return;
  }

  const entry = {
    id: generateId(),
    compoundName,
    marker,
    value,
    unit,
    date,
    notes
  };

  await window.api.addBloodwork(entry);
  _bloodworkData.push(entry);
  showToast('Bloodwork added', 'success');
  refreshUnifiedDetail();
}

async function deleteBloodworkEntry(id) {
  await window.api.deleteBloodwork(id);
  _bloodworkData = _bloodworkData.filter(b => b.id !== id);
  showToast('Bloodwork entry deleted', 'success');
  refreshUnifiedDetail();
}

function hideBloodworkForm() {
  const formContainer = document.getElementById('bw-add-form');
  if (formContainer) formContainer.classList.add('hidden');
}

function selectBloodworkMarker(markerName) {
  _selectedBloodworkMarker = markerName;
  refreshUnifiedDetail();
}

// Expose
window.showAddBloodworkForm = showAddBloodworkForm;
window.submitBloodwork = submitBloodwork;
window.deleteBloodworkEntry = deleteBloodworkEntry;
window.hideBloodworkForm = hideBloodworkForm;
window.selectBloodworkMarker = selectBloodworkMarker;
window.updateBwUnit = updateBwUnit;
```

**Step 4: Call renderBloodworkSection from refreshUnifiedDetail**

In `refreshUnifiedDetail`, after the dose section rendering, add:

```js
  await loadBloodwork();
  const compoundType = detailLibraryData?.type || '';
  renderBloodworkSection(compoundName, compoundType);
```

**Step 5: Add bloodwork scatter points to detail chart**

In `renderDetailChart`, add a second dataset for bloodwork dots. Before creating the chart, add:

```js
  // Add bloodwork scatter data
  const bwEntries = getBloodworkForCompound(name);
  const selectedEntries = bwEntries.filter(e => e.marker === _selectedBloodworkMarker);

  const datasets = [{
    label: name,
    data: points.map(p => ({ x: p.x, y: p.y })),
    borderColor: color,
    backgroundColor: color + '20',
    borderWidth: 2.5,
    pointRadius: 0,
    pointHitRadius: 8,
    fill: true,
    tension: 0.3,
    yAxisID: 'y'
  }];

  if (selectedEntries.length > 0) {
    datasets.push({
      label: _selectedBloodworkMarker,
      data: selectedEntries.map(e => ({
        x: new Date(e.date).getTime(),
        y: e.value
      })),
      type: 'scatter',
      borderColor: '#ffd54f',
      backgroundColor: '#ffd54faa',
      pointRadius: 6,
      pointHoverRadius: 8,
      yAxisID: 'y2'
    });
  }
```

Add a secondary y-axis (`y2`) to the chart scales:

```js
y2: {
  display: selectedEntries.length > 0,
  position: 'right',
  beginAtZero: false,
  grid: { display: false },
  ticks: {
    color: '#ffd54f',
    font: { size: 11 }
  },
  title: {
    display: true,
    text: _selectedBloodworkMarker ? `${_selectedBloodworkMarker} (${selectedEntries[0]?.unit || ''})` : '',
    color: '#ffd54f',
    font: { size: 12 }
  }
}
```

Update the chart's `data.datasets` to use the `datasets` array instead of the inline single dataset.

**Step 6: Add CSS for bloodwork section**

Append to `src/renderer/css/styles.css`:

```css
/* Bloodwork section */
.bw-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.bw-marker-pills {
  display: flex;
  gap: 4px;
  margin-bottom: 12px;
  flex-wrap: wrap;
}

.bw-marker-pill {
  padding: 4px 10px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-secondary);
  font-size: 11px;
  font-family: var(--font);
  border-radius: 12px;
  cursor: pointer;
  transition: all var(--transition);
}

.bw-marker-pill:hover {
  background: var(--bg-surface-hover);
}

.bw-marker-pill.active {
  background: rgba(255, 213, 79, 0.15);
  color: #ffd54f;
  border-color: #ffd54f;
}

.bw-table {
  width: 100%;
  font-size: 12px;
  border-collapse: collapse;
}

.bw-table th, .bw-table td {
  padding: 6px 8px;
  text-align: left;
  border-bottom: 1px solid var(--border);
}

.bw-table th {
  color: var(--text-muted);
  font-weight: 500;
}

.bw-empty {
  font-size: 13px;
  color: var(--text-muted);
  padding: 12px 0;
}

.bw-form {
  padding: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-top: 8px;
}

.bw-form-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 8px;
}

.btn-tiny {
  padding: 2px 6px;
  font-size: 10px;
}
```

**Step 7: Verify**

Run: `npm start`

Expected: Open a testosterone compound detail. The Bloodwork section appears. Click "Add Result", select a marker, enter a value. The entry shows in the table. The scatter dot appears on the chart with a secondary y-axis.

**Step 8: Commit**

```bash
git add src/renderer/index.html src/renderer/js/compound-detail.js src/renderer/css/styles.css
git commit -m "feat: add bloodwork panel with predefined markers and chart overlay"
```

---

## Task 6: Reconstitution Calculator

**Goal:** Add a collapsible peptide reconstitution calculator to the compound detail page.

**Files:**
- Modify: `src/renderer/index.html` (add container div)
- Modify: `src/renderer/js/compound-detail.js` (add calculator rendering)
- Modify: `src/renderer/css/styles.css` (calculator styles)

**Step 1: Add container in index.html**

In `src/renderer/index.html`, inside `#detail-dose-section`, after the bloodwork section:

```html
        <div id="detail-reconstitution-section" class="hidden"></div>
```

**Step 2: Add calculator rendering**

Add to `src/renderer/js/compound-detail.js`:

```js
function renderReconstitutionSection(compoundName, defaultRoute) {
  const container = document.getElementById('detail-reconstitution-section');
  if (!container) return;

  // Only show for injectable compounds
  if (defaultRoute === 'oral' || defaultRoute === 'topical') {
    container.innerHTML = '';
    container.classList.add('hidden');
    return;
  }

  // Try to guess default dose from protocols
  const libEntry = detailLibraryData;
  let defaultDose = '';
  if (libEntry && libEntry.protocols) {
    const match = libEntry.protocols.match(/(\d+)\s*mcg/i);
    if (match) defaultDose = match[1];
  }

  container.innerHTML = `
    <div class="detail-section reconstitution-section">
      <div class="recon-header" onclick="toggleReconstitution()">
        <h3 class="detail-section-title">Reconstitution Calculator</h3>
        <svg id="recon-chevron" class="recon-chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>
      </div>
      <div id="recon-body" class="recon-body hidden">
        <div class="recon-inputs">
          <div class="recon-field">
            <label class="form-label">Peptide in Vial (mg)</label>
            <input type="number" id="recon-peptide-mg" step="any" min="0" placeholder="e.g. 5" oninput="updateReconResults()">
          </div>
          <div class="recon-field">
            <label class="form-label">BAC Water Added (mL)</label>
            <input type="number" id="recon-water-ml" step="any" min="0" placeholder="e.g. 2" oninput="updateReconResults()">
          </div>
          <div class="recon-field">
            <label class="form-label">Desired Dose (mcg)</label>
            <input type="number" id="recon-dose-mcg" step="any" min="0" placeholder="e.g. 250" value="${defaultDose}" oninput="updateReconResults()">
          </div>
        </div>
        <div id="recon-results" class="recon-results"></div>
      </div>
    </div>`;
  container.classList.remove('hidden');

  // Trigger initial calc if we have a default dose
  if (defaultDose) updateReconResults();
}

function toggleReconstitution() {
  const body = document.getElementById('recon-body');
  const chevron = document.getElementById('recon-chevron');
  if (body) {
    body.classList.toggle('hidden');
    chevron?.classList.toggle('expanded');
  }
}

function updateReconResults() {
  const peptideMg = parseFloat(document.getElementById('recon-peptide-mg')?.value);
  const waterMl = parseFloat(document.getElementById('recon-water-ml')?.value);
  const doseMcg = parseFloat(document.getElementById('recon-dose-mcg')?.value);
  const container = document.getElementById('recon-results');
  if (!container) return;

  if (!peptideMg || !waterMl || peptideMg <= 0 || waterMl <= 0) {
    container.innerHTML = '<p class="recon-hint">Enter peptide amount and water volume to see results.</p>';
    return;
  }

  const concentrationMcg = (peptideMg * 1000) / waterMl;
  const concentrationMg = peptideMg / waterMl;

  let results = `
    <div class="recon-result-row">
      <span class="recon-label">Concentration</span>
      <span class="recon-value">${concentrationMcg.toLocaleString()} mcg/mL (${concentrationMg.toFixed(2)} mg/mL)</span>
    </div>`;

  if (doseMcg && doseMcg > 0) {
    const doseVolume = doseMcg / concentrationMcg;
    const units100 = doseVolume * 100;
    const units50 = doseVolume * 50;
    const dosesPerVial = Math.floor((peptideMg * 1000) / doseMcg);

    results += `
      <div class="recon-result-row">
        <span class="recon-label">Dose Volume</span>
        <span class="recon-value">${doseVolume.toFixed(3)} mL</span>
      </div>
      <div class="recon-result-row">
        <span class="recon-label">100-unit Syringe</span>
        <span class="recon-value accent-green">${units100.toFixed(1)} units</span>
      </div>
      <div class="recon-result-row">
        <span class="recon-label">50-unit Syringe</span>
        <span class="recon-value">${units50.toFixed(1)} units</span>
      </div>
      <div class="recon-result-row">
        <span class="recon-label">Doses per Vial</span>
        <span class="recon-value">${dosesPerVial}</span>
      </div>`;
  }

  container.innerHTML = results;
}

// Expose
window.toggleReconstitution = toggleReconstitution;
window.updateReconResults = updateReconResults;
```

**Step 3: Call from refreshUnifiedDetail**

Add after the bloodwork rendering:

```js
  const route = sampleDose?.route || (detailLibraryData ? guessDefaultRoute(detailLibraryData) : 'subcutaneous');
  renderReconstitutionSection(compoundName, route);
```

**Step 4: Add CSS**

Append to `src/renderer/css/styles.css`:

```css
/* Reconstitution calculator */
.reconstitution-section {
  border: 1px solid var(--border);
  border-radius: var(--radius);
  overflow: hidden;
}

.recon-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  cursor: pointer;
  background: var(--bg-surface);
  transition: background var(--transition);
}

.recon-header:hover {
  background: var(--bg-surface-hover);
}

.recon-header .detail-section-title {
  margin: 0;
}

.recon-chevron {
  transition: transform 200ms ease;
}

.recon-chevron.expanded {
  transform: rotate(180deg);
}

.recon-body {
  padding: 14px;
}

.recon-inputs {
  display: flex;
  gap: 12px;
  margin-bottom: 14px;
}

.recon-field {
  flex: 1;
}

.recon-field input {
  width: 100%;
}

.recon-results {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.recon-result-row {
  display: flex;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid var(--border);
  font-size: 13px;
}

.recon-label {
  color: var(--text-secondary);
}

.recon-value {
  font-weight: 600;
  color: var(--text-primary);
}

.recon-hint {
  font-size: 12px;
  color: var(--text-muted);
}
```

**Step 5: Verify**

Run: `npm start`

Expected: Open BPC-157 detail. The Reconstitution Calculator section appears (collapsed). Click to expand. Enter 5 mg, 2 mL. Results update live showing concentration and syringe units. Not shown for oral compounds like Anavar.

**Step 6: Commit**

```bash
git add src/renderer/index.html src/renderer/js/compound-detail.js src/renderer/css/styles.css
git commit -m "feat: add reconstitution calculator to compound detail page"
```

---

## Task 7: Inventory with Auto-Deduction

**Goal:** Track compound stock, auto-deduct on dose logging, and show supply warnings.

**Files:**
- Modify: `src/renderer/index.html` (add container div)
- Modify: `src/renderer/js/compound-detail.js` (add inventory rendering)
- Modify: `src/renderer/js/dose-logger.js:276-364` (add inventory deduction hook)
- Modify: `src/renderer/css/styles.css` (inventory styles)

**Step 1: Add container in index.html**

In `src/renderer/index.html`, inside `#detail-dose-section`, after the reconstitution section:

```html
        <div id="detail-inventory-section" class="hidden"></div>
```

**Step 2: Add inventory rendering to compound-detail.js**

```js
let _inventoryData = [];

async function loadInventory() {
  _inventoryData = await window.api.getInventory();
}

function getInventoryForCompound(compoundName) {
  return _inventoryData.filter(i => i.compoundName === compoundName);
}

function renderInventorySection(compoundName) {
  const container = document.getElementById('detail-inventory-section');
  if (!container) return;

  const items = getInventoryForCompound(compoundName);

  let content = '';
  if (items.length === 0) {
    content = `
      <div class="inv-empty">
        <p>No inventory tracked.</p>
        <button class="btn btn-secondary btn-small" onclick="showAddInventoryForm('${escapeHtml(compoundName)}')">Add Stock</button>
      </div>`;
  } else {
    const cards = items.map(item => {
      const pct = item.amountPerUnit > 0 ? Math.round((item.remainingAmount / (item.amountPerUnit * item.quantity)) * 100) : 0;
      const isLow = item.remainingAmount < item.amountPerUnit * 0.2;
      const expiryStr = item.expiryDate
        ? new Date(item.expiryDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
        : '';
      const isExpired = item.expiryDate && new Date(item.expiryDate) < new Date();

      return `
        <div class="inv-card ${isLow ? 'low' : ''} ${isExpired ? 'expired' : ''}">
          <div class="inv-card-header">
            <span class="inv-card-qty">${item.quantity} ${item.format}${item.quantity !== 1 ? 's' : ''}</span>
            ${item.concentration ? `<span class="inv-card-conc">${item.concentration} mg/mL</span>` : ''}
            <span class="inv-card-amount">${item.amountPerUnit} mg each</span>
            ${expiryStr ? `<span class="inv-card-expiry ${isExpired ? 'expired' : ''}">Exp: ${expiryStr}</span>` : ''}
          </div>
          <div class="inv-progress-bar">
            <div class="inv-progress-fill ${isLow ? 'low' : ''}" style="width:${Math.min(pct, 100)}%"></div>
          </div>
          <div class="inv-card-footer">
            <span class="inv-remaining">${item.remainingAmount.toFixed(1)} mg remaining</span>
            ${isLow ? '<span class="inv-warning">Low Supply</span>' : ''}
            <button class="btn btn-secondary btn-tiny" onclick="showAdjustInventory('${item.id}')">Adjust</button>
            <button class="btn btn-danger btn-tiny" onclick="deleteInventoryItem('${item.id}')">Delete</button>
          </div>
          ${item.notes ? `<div class="inv-notes">${escapeHtml(item.notes)}</div>` : ''}
        </div>`;
    }).join('');

    content = `
      ${cards}
      <button class="btn btn-secondary btn-small" style="margin-top:8px" onclick="showAddInventoryForm('${escapeHtml(compoundName)}')">Add Stock</button>`;
  }

  container.innerHTML = `
    <div class="detail-section">
      <h3 class="detail-section-title">Inventory</h3>
      ${content}
      <div id="inv-form-container" class="hidden"></div>
    </div>`;
  container.classList.remove('hidden');
}

function showAddInventoryForm(compoundName) {
  const formContainer = document.getElementById('inv-form-container');
  if (!formContainer) return;

  formContainer.innerHTML = `
    <div class="inv-form">
      <div class="inv-form-row">
        <div class="form-section flex-half">
          <label class="form-label">Format</label>
          <select id="inv-format">
            <option value="vial">Vial</option>
            <option value="bottle">Bottle</option>
            <option value="box">Box</option>
            <option value="pouch">Pouch</option>
          </select>
        </div>
        <div class="form-section flex-half">
          <label class="form-label">Quantity</label>
          <input type="number" id="inv-quantity" min="1" value="1">
        </div>
        <div class="form-section flex-half">
          <label class="form-label">Amount Each (mg)</label>
          <input type="number" id="inv-amount-per-unit" step="any" placeholder="e.g. 5">
        </div>
        <div class="form-section flex-half">
          <label class="form-label">Concentration (mg/mL)</label>
          <input type="number" id="inv-concentration" step="any" placeholder="e.g. 200">
        </div>
      </div>
      <div class="inv-form-row">
        <div class="form-section flex-half">
          <label class="form-label">Volume/Unit (mL)</label>
          <input type="number" id="inv-volume" step="any" placeholder="e.g. 10">
        </div>
        <div class="form-section flex-half">
          <label class="form-label">Expiry Date</label>
          <input type="date" id="inv-expiry">
        </div>
        <div class="form-section flex-1">
          <label class="form-label">Notes</label>
          <input type="text" id="inv-notes" placeholder="e.g. supplier, lot #">
        </div>
      </div>
      <div class="inv-form-actions">
        <button class="btn btn-primary btn-small" onclick="submitInventory('${escapeHtml(compoundName)}')">Save</button>
        <button class="btn btn-secondary btn-small" onclick="hideInventoryForm()">Cancel</button>
      </div>
    </div>`;
  formContainer.classList.remove('hidden');
}

async function submitInventory(compoundName) {
  const quantity = parseInt(document.getElementById('inv-quantity').value) || 1;
  const amountPerUnit = parseFloat(document.getElementById('inv-amount-per-unit').value) || 0;

  if (amountPerUnit <= 0) {
    showToast('Please enter amount per unit', 'error');
    return;
  }

  const entry = {
    id: generateId(),
    compoundName,
    format: document.getElementById('inv-format').value,
    quantity,
    amountPerUnit,
    concentration: parseFloat(document.getElementById('inv-concentration').value) || null,
    volumePerUnit: parseFloat(document.getElementById('inv-volume').value) || null,
    expiryDate: document.getElementById('inv-expiry').value || null,
    remainingAmount: amountPerUnit * quantity,
    notes: document.getElementById('inv-notes').value
  };

  await window.api.saveInventory(entry);
  _inventoryData.push(entry);
  showToast('Inventory added', 'success');
  refreshUnifiedDetail();
}

function showAdjustInventory(id) {
  const item = _inventoryData.find(i => i.id === id);
  if (!item) return;

  const newAmount = prompt(`Adjust remaining amount for ${item.compoundName}\nCurrent: ${item.remainingAmount.toFixed(1)} mg\nEnter new amount:`, item.remainingAmount.toFixed(1));
  if (newAmount === null) return;

  const parsed = parseFloat(newAmount);
  if (isNaN(parsed) || parsed < 0) {
    showToast('Invalid amount', 'error');
    return;
  }

  adjustInventory(id, parsed);
}

async function adjustInventory(id, newAmount) {
  await window.api.updateInventory(id, { remainingAmount: newAmount });
  const item = _inventoryData.find(i => i.id === id);
  if (item) item.remainingAmount = newAmount;
  showToast('Inventory adjusted', 'success');
  refreshUnifiedDetail();
}

async function deleteInventoryItem(id) {
  if (!confirm('Delete this inventory entry?')) return;
  await window.api.deleteInventory(id);
  _inventoryData = _inventoryData.filter(i => i.id !== id);
  showToast('Inventory deleted', 'success');
  refreshUnifiedDetail();
}

function hideInventoryForm() {
  const formContainer = document.getElementById('inv-form-container');
  if (formContainer) formContainer.classList.add('hidden');
}

// Expose
window.showAddInventoryForm = showAddInventoryForm;
window.submitInventory = submitInventory;
window.showAdjustInventory = showAdjustInventory;
window.deleteInventoryItem = deleteInventoryItem;
window.hideInventoryForm = hideInventoryForm;
```

**Step 3: Call from refreshUnifiedDetail**

Add after the reconstitution rendering:

```js
  await loadInventory();
  renderInventorySection(compoundName);
```

**Step 4: Add auto-deduction to dose logger**

In `src/renderer/js/dose-logger.js`, inside `setupDoseForm` (the submit handler, around line 340-342 after `await window.api.addDose(dose)`), add an inventory deduction call:

```js
      await window.api.addDose(dose);

      // Auto-deduct from inventory
      await deductFromInventory(compound.name, amount);

      showToast(`Logged ${amount} ${unit} of ${compound.name}`, 'success');
```

Also add the deduction function at the bottom of `dose-logger.js`:

```js
async function deductFromInventory(compoundName, amount) {
  const inventory = await window.api.getInventory();
  const items = inventory.filter(i => i.compoundName === compoundName && i.remainingAmount > 0);
  if (items.length === 0) return; // No inventory tracked, skip silently

  // Deduct from first available item
  const item = items[0];
  let newRemaining = item.remainingAmount - amount;
  if (newRemaining < 0) newRemaining = 0;

  await window.api.updateInventory(item.id, { remainingAmount: newRemaining });
}
```

Similarly, for blend dose logging (around line 315 inside the for-loop after `await window.api.addDose(dose)`):

```js
        await window.api.addDose(dose);
        await deductFromInventory(component.compoundName, component.dose);
```

**Step 5: Add CSS for inventory**

Append to `src/renderer/css/styles.css`:

```css
/* Inventory section */
.inv-empty {
  padding: 12px 0;
  color: var(--text-muted);
  font-size: 13px;
}

.inv-card {
  padding: 10px 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-bottom: 8px;
}

.inv-card.low {
  border-color: rgba(255, 165, 0, 0.4);
}

.inv-card.expired {
  border-color: rgba(255, 82, 82, 0.4);
}

.inv-card-header {
  display: flex;
  gap: 12px;
  align-items: center;
  font-size: 13px;
  margin-bottom: 8px;
  flex-wrap: wrap;
}

.inv-card-qty {
  font-weight: 600;
  color: var(--text-primary);
}

.inv-card-conc, .inv-card-amount {
  color: var(--text-secondary);
}

.inv-card-expiry {
  color: var(--text-muted);
  font-size: 11px;
}

.inv-card-expiry.expired {
  color: var(--accent-red);
}

.inv-progress-bar {
  height: 4px;
  background: var(--bg-input);
  border-radius: 2px;
  margin-bottom: 6px;
}

.inv-progress-fill {
  height: 100%;
  background: var(--accent-green);
  border-radius: 2px;
  transition: width 300ms ease;
}

.inv-progress-fill.low {
  background: orange;
}

.inv-card-footer {
  display: flex;
  gap: 8px;
  align-items: center;
  font-size: 12px;
}

.inv-remaining {
  color: var(--text-secondary);
  flex: 1;
}

.inv-warning {
  color: orange;
  font-weight: 600;
  font-size: 11px;
}

.inv-notes {
  font-size: 11px;
  color: var(--text-muted);
  margin-top: 4px;
}

.inv-form {
  padding: 12px;
  background: var(--bg-surface);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  margin-top: 8px;
}

.inv-form-row {
  display: flex;
  gap: 8px;
  align-items: flex-end;
  margin-bottom: 8px;
}

.inv-form-actions {
  display: flex;
  gap: 8px;
}
```

**Step 6: Verify**

Run: `npm start`

Expected: Open a compound detail. The Inventory section shows "No inventory tracked" with an "Add Stock" button. Add stock (e.g. 3 vials, 5mg each). Progress bar shows full. Log a dose. Re-open the compound detail — remaining amount should be decremented.

**Step 7: Commit**

```bash
git add src/renderer/index.html src/renderer/js/compound-detail.js src/renderer/js/dose-logger.js src/renderer/css/styles.css
git commit -m "feat: add inventory tracking with auto-deduction on dose logging"
```

---

## Summary

| Task | Feature | Dependencies |
|------|---------|-------------|
| 1 | Library persistence (IPC + overrides) | None |
| 2 | Dose logger unification | Task 1 |
| 3 | Merged Compounds view | Task 1 |
| 4 | Baseline + Target Range | Task 1 |
| 5 | Bloodwork panel | Task 1, Task 4 |
| 6 | Reconstitution calculator | None |
| 7 | Inventory with auto-deduction | Task 1 |

Tasks 2, 3, 4, 6 can be parallelized after Task 1 completes. Task 5 depends on Task 4 (chart integration). Task 7 depends on Task 1 but is otherwise independent.
