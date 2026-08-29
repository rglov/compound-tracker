async function initCustomCompounds() {
  setupCustomCompoundForm();
  setupCustomBlendForm();
  setupDataManagement();
  setupInjectionSiteButtons();
  await refreshCustomCompoundsList();
  await refreshCustomBlendsList();
  populateBlendCompoundSelects();
  renderInjectionSitesSettings();
}

// ═══════════════════════════════════════
// CUSTOM COMPOUNDS
// ═══════════════════════════════════════

function setupCustomCompoundForm() {
  document.getElementById('custom-compound-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('cc-name').value.trim();
    const category = document.getElementById('cc-category').value;
    const halfLifeValue = parseFloat(document.getElementById('cc-halflife').value);
    const halfLifeUnit = document.getElementById('cc-halflife-unit').value;
    const defaultUnit = document.getElementById('cc-unit').value;
    const defaultRoute = document.getElementById('cc-route').value;

    if (!name || !halfLifeValue || halfLifeValue <= 0) return;

    const compound = {
      id: 'custom-' + generateId(),
      name: name,
      category: category,
      halfLifeValue: halfLifeValue,
      halfLifeUnit: halfLifeUnit,
      halfLifeHours: halfLifeToHours(halfLifeValue, halfLifeUnit),
      defaultUnit: defaultUnit,
      defaultRoute: defaultRoute
    };

    await window.api.addCustomCompound(compound);
    showToast(`Added custom compound: ${name}`, 'success');

    // Reset form
    document.getElementById('cc-name').value = '';
    document.getElementById('cc-halflife').value = '';

    await refreshCustomCompoundsList();
    populateBlendCompoundSelects();

    // Refresh dose logger if it's been initialized
    if (typeof refreshCompoundSelect === 'function') {
      await refreshCompoundSelect();
    }
  });
}

async function refreshCustomCompoundsList() {
  const compounds = await window.api.getCustomCompounds();
  const list = document.getElementById('custom-compounds-list');

  if (compounds.length === 0) {
    list.innerHTML = '<div class="empty-state" style="padding:16px;font-size:13px;">No custom compounds added yet.</div>';
    return;
  }

  list.innerHTML = compounds.map(c => `
    <div class="item-row">
      <div class="item-row-info">
        <span class="category-badge ${c.category}">${c.category}</span>
        <strong>${escapeHtml(c.name)}</strong>
        <span style="color:#a0a0b0">Half-life: ${c.halfLifeValue} ${c.halfLifeUnit}</span>
        <span style="color:#6b6b7b">${c.defaultUnit} / ${c.defaultRoute}</span>
      </div>
      <button class="btn btn-danger btn-small" onclick="deleteCustomCompound('${c.id}')">Delete</button>
    </div>
  `).join('');
}

async function deleteCustomCompound(id) {
  if (!confirm('Delete this custom compound? (Existing dose entries will not be affected.)')) return;
  await window.api.deleteCustomCompound(id);
  showToast('Custom compound deleted', 'success');
  await refreshCustomCompoundsList();
  populateBlendCompoundSelects();
  if (typeof refreshCompoundSelect === 'function') {
    await refreshCompoundSelect();
  }
}

// ═══════════════════════════════════════
// CUSTOM BLENDS
// ═══════════════════════════════════════

function getAllAvailableCompounds() {
  // Synchronous: returns built-in + whatever custom compounds we've cached
  return [...COMPOUND_LIBRARY];
}

function populateBlendCompoundSelects() {
  const allCompounds = getAllAvailableCompounds();
  document.querySelectorAll('.blend-compound-select').forEach(select => {
    const currentVal = select.value;
    select.innerHTML = '<option value="">Select compound...</option>';
    for (const c of allCompounds) {
      const opt = document.createElement('option');
      opt.value = c.id;
      opt.textContent = `${c.name} (${c.category})`;
      select.appendChild(opt);
    }
    if (currentVal) select.value = currentVal;
  });
}

function setupCustomBlendForm() {
  document.getElementById('add-blend-component').addEventListener('click', () => {
    addBlendComponentRow();
  });

  document.getElementById('custom-blend-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('blend-name').value.trim();
    const category = document.getElementById('blend-category').value;
    const protocols = document.getElementById('blend-protocols').value.trim();
    const notes = document.getElementById('blend-notes').value.trim();
    if (!name) return;

    const components = [];
    const rows = document.querySelectorAll('.blend-component-row');
    const allCompounds = getAllAvailableCompounds();

    for (const row of rows) {
      const compoundId = row.querySelector('.blend-compound-select').value;
      const dose = parseFloat(row.querySelector('.blend-dose').value);
      if (!compoundId || !dose) continue;

      const compound = allCompounds.find(c => c.id === compoundId);
      if (!compound) continue;

      components.push({
        compoundId: compound.id,
        compoundName: compound.name,
        dose: dose,
        unit: compound.defaultUnit,
        halfLifeHours: compound.halfLifeHours
      });
    }

    if (components.length < 2) {
      showToast('A blend needs at least 2 components', 'error');
      return;
    }

    const blend = {
      id: 'blend-' + generateId(),
      name: name,
      category: category,
      components: components,
      protocols: protocols,
      notes: notes
    };

    await window.api.addCustomBlend(blend);
    showToast(`Created blend: ${name}`, 'success');

    // Reset
    document.getElementById('blend-name').value = '';
    document.getElementById('blend-protocols').value = '';
    document.getElementById('blend-notes').value = '';
    resetBlendComponents();
    await refreshCustomBlendsList();
    if (typeof refreshCompoundSelect === 'function') await refreshCompoundSelect();
  });
}

function addBlendComponentRow() {
  const container = document.getElementById('blend-components');
  const row = document.createElement('div');
  row.className = 'blend-component-row';
  row.innerHTML = `
    <select class="blend-compound-select">
      <option value="">Select compound...</option>
    </select>
    <input type="number" class="blend-dose" placeholder="Dose" step="any" min="0">
    <span class="blend-unit-label">mg</span>
    <button type="button" class="btn btn-small btn-remove-component" title="Remove">X</button>
  `;

  row.querySelector('.btn-remove-component').addEventListener('click', () => {
    row.remove();
    updateRemoveButtonVisibility();
  });

  row.querySelector('.blend-compound-select').addEventListener('change', function() {
    const allCompounds = getAllAvailableCompounds();
    const compound = allCompounds.find(c => c.id === this.value);
    if (compound) {
      row.querySelector('.blend-unit-label').textContent = compound.defaultUnit;
    }
  });

  container.appendChild(row);
  populateBlendCompoundSelects();
  updateRemoveButtonVisibility();
}

function updateRemoveButtonVisibility() {
  const rows = document.querySelectorAll('.blend-component-row');
  rows.forEach((row, i) => {
    const btn = row.querySelector('.btn-remove-component');
    btn.style.visibility = rows.length > 1 ? 'visible' : 'hidden';
  });
}

function resetBlendComponents() {
  const container = document.getElementById('blend-components');
  container.innerHTML = `
    <div class="blend-component-row">
      <select class="blend-compound-select">
        <option value="">Select compound...</option>
      </select>
      <input type="number" class="blend-dose" placeholder="Dose" step="any" min="0">
      <span class="blend-unit-label">mg</span>
      <button type="button" class="btn btn-small btn-remove-component" title="Remove" style="visibility:hidden;">X</button>
    </div>
  `;
  populateBlendCompoundSelects();
}

async function refreshCustomBlendsList() {
  const blends = await window.api.getCustomBlends();
  const list = document.getElementById('custom-blends-list');

  if (blends.length === 0) {
    list.innerHTML = '<div class="empty-state" style="padding:16px;font-size:13px;">No custom blends created yet.</div>';
    return;
  }

  list.innerHTML = blends.map(b => {
    const comps = b.components.map(c => `${c.compoundName} ${c.dose}${c.unit}`).join(' + ');
    return `
      <div class="item-row">
        <div class="item-row-info">
          <span class="category-badge ${b.category}">${b.category}</span>
          <strong>${escapeHtml(b.name)}</strong>
          <span style="color:#a0a0b0">${comps}</span>
        </div>
        <button class="btn btn-danger btn-small" onclick="deleteCustomBlend('${b.id}')">Delete</button>
      </div>
    `;
  }).join('');
}

async function deleteCustomBlend(id) {
  if (!confirm('Delete this blend?')) return;
  await window.api.deleteCustomBlend(id);
  showToast('Blend deleted', 'success');
  await refreshCustomBlendsList();
  if (typeof refreshCompoundSelect === 'function') await refreshCompoundSelect();
}

// ═══════════════════════════════════════
// DATA MANAGEMENT
// ═══════════════════════════════════════

// CSV helpers
const DOSE_CSV_COLUMNS = ['id','compoundName','compoundId','category','amount','unit','route','location','administeredAt','halfLifeHours','color','notes'];

function dosesToCsv(doses) {
  const escape = v => {
    if (v == null) return '';
    const s = String(v);
    return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = [DOSE_CSV_COLUMNS.join(',')];
  for (const d of doses) {
    rows.push(DOSE_CSV_COLUMNS.map(col => escape(d[col])).join(','));
  }
  return rows.join('\n');
}

function csvToDoses(text) {
  const lines = text.split(/\r?\n/).filter(l => l.trim());
  if (lines.length < 2) throw new Error('CSV has no data rows');

  const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
  const doses = [];
  for (let i = 1; i < lines.length; i++) {
    // Handle quoted fields
    const cols = [];
    let cur = '', inQ = false;
    for (let j = 0; j < lines[i].length; j++) {
      const ch = lines[i][j];
      if (ch === '"') {
        if (inQ && lines[i][j+1] === '"') { cur += '"'; j++; }
        else inQ = !inQ;
      } else if (ch === ',' && !inQ) {
        cols.push(cur); cur = '';
      } else {
        cur += ch;
      }
    }
    cols.push(cur);
    const dose = {};
    headers.forEach((h, idx) => { dose[h] = cols[idx] ?? ''; });
    if (dose.compoundName) doses.push(dose);
  }
  return doses;
}

function downloadBlob(content, filename, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function setupDataManagement() {
  // JSON export
  document.getElementById('export-data-btn').addEventListener('click', async () => {
    const data = await window.api.exportData();
    downloadBlob(JSON.stringify(data, null, 2), `compound-tracker-backup-${new Date().toISOString().slice(0,10)}.json`, 'application/json');
    showToast('Data exported successfully', 'success');
  });

  // JSON import
  document.getElementById('import-data-btn').addEventListener('click', () => {
    document.getElementById('import-file-input').click();
  });

  document.getElementById('import-file-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.doses || !Array.isArray(data.doses)) {
        showToast('Invalid backup file format', 'error');
        return;
      }
      if (!confirm(`Import ${data.doses.length} doses? This will merge with existing data.`)) return;
      await window.api.importData(data);
      showToast(`Imported ${data.doses.length} doses successfully`, 'success');
      await refreshCustomCompoundsList();
      await refreshCustomBlendsList();
      if (typeof refreshCompoundSelect === 'function') await refreshCompoundSelect();
      if (typeof refreshDashboard === 'function') await refreshDashboard();
      if (typeof refreshHistory === 'function') await refreshHistory();
    } catch (err) {
      showToast('Failed to import: ' + err.message, 'error');
    }
    e.target.value = '';
  });

  // CSV export
  document.getElementById('export-csv-btn').addEventListener('click', async () => {
    const doses = await window.api.getDoses();
    if (!doses.length) { showToast('No doses to export', 'error'); return; }
    downloadBlob(dosesToCsv(doses), `compound-tracker-doses-${new Date().toISOString().slice(0,10)}.csv`, 'text/csv');
    showToast(`Exported ${doses.length} doses to CSV`, 'success');
  });

  // CSV import
  document.getElementById('import-csv-btn').addEventListener('click', () => {
    document.getElementById('import-csv-input').click();
  });

  document.getElementById('import-csv-input').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const doses = csvToDoses(await file.text());
      if (!doses.length) { showToast('No valid rows found in CSV', 'error'); return; }
      if (!confirm(`Import ${doses.length} doses from CSV? This will merge with existing data.`)) return;
      await window.api.importData({ doses });
      showToast(`Imported ${doses.length} doses successfully`, 'success');
      if (typeof refreshDashboard === 'function') await refreshDashboard();
      if (typeof refreshHistory === 'function') await refreshHistory();
    } catch (err) {
      showToast('Failed to import CSV: ' + err.message, 'error');
    }
    e.target.value = '';
  });

  // Sample JSON download
  document.getElementById('sample-json-btn').addEventListener('click', () => {
    const sample = {
      exportedAt: new Date().toISOString(),
      doses: [
        {
          id: "dose-example-1",
          compoundName: "BPC-157",
          compoundId: "BPC-157",
          category: "peptide",
          amount: 250,
          unit: "mcg",
          route: "subcutaneous",
          location: "abdomen",
          administeredAt: new Date().toISOString(),
          halfLifeHours: 4,
          color: "#4fc3f7",
          notes: "Morning dose"
        }
      ],
      cycles: [
        {
          id: "cycle-example-1",
          name: "Example Healing Cycle",
          status: "planned",
          startDate: new Date().toISOString().slice(0,10),
          tags: ["healing", "recovery"],
          entries: [
            {
              id: "entry-example-1",
              compoundName: "BPC-157",
              durationDays: 90,
              frequency: "daily",
              doses: [{ time: "08:00", amount: 250, unit: "mcg" }],
              route: "subcutaneous",
              color: "#4fc3f7"
            }
          ]
        }
      ],
      customCompounds: [
        {
          id: "custom-example-1",
          name: "My Custom Peptide",
          category: "peptide",
          halfLifeHours: 6,
          defaultUnit: "mcg",
          defaultRoute: "subcutaneous",
          color: "#ab47bc"
        }
      ],
      customBlends: [],
      inventory: [],
      orders: []
    };
    downloadBlob(JSON.stringify(sample, null, 2), 'compound-tracker-sample.json', 'application/json');
    showToast('Sample JSON downloaded', 'success');
  });

  // Sample CSV download
  document.getElementById('sample-csv-btn').addEventListener('click', () => {
    const sampleDoses = [
      {
        id: 'dose-example-1',
        compoundName: 'BPC-157',
        compoundId: 'BPC-157',
        category: 'peptide',
        amount: 250,
        unit: 'mcg',
        route: 'subcutaneous',
        location: 'abdomen',
        administeredAt: new Date().toISOString(),
        halfLifeHours: 4,
        color: '#4fc3f7',
        notes: 'Morning dose'
      },
      {
        id: 'dose-example-2',
        compoundName: 'TB-500',
        compoundId: 'TB-500',
        category: 'peptide',
        amount: 5,
        unit: 'mg',
        route: 'subcutaneous',
        location: 'thigh',
        administeredAt: new Date().toISOString(),
        halfLifeHours: 96,
        color: '#66bb6a',
        notes: ''
      }
    ];
    downloadBlob(dosesToCsv(sampleDoses), 'compound-tracker-sample.csv', 'text/csv');
    showToast('Sample CSV downloaded', 'success');
  });
}

// ═══════════════════════════════════════
// INJECTION SITES MANAGEMENT
// ═══════════════════════════════════════

function renderInjectionSitesSettings() {
  const grid = document.getElementById('injection-sites-grid');
  if (!grid) return;

  const enabledIds = getEnabledSiteIds();
  const enabledSet = new Set(enabledIds);

  const groups = {};
  for (const site of MASTER_INJECTION_SITES) {
    if (!groups[site.group]) groups[site.group] = [];
    groups[site.group].push(site);
  }

  let html = '';
  for (const [groupName, sites] of Object.entries(groups)) {
    html += '<div class="injection-sites-group">';
    html += '<div class="injection-sites-group-label">' + escapeHtml(groupName) + '</div>';
    html += '<div class="injection-sites-group-items">';
    for (const site of sites) {
      const checked = enabledSet.has(site.id) ? ' checked' : '';
      html += '<label class="injection-site-toggle">';
      html += '<input type="checkbox" value="' + site.id + '"' + checked + '>';
      html += '<span>' + escapeHtml(site.label) + '</span>';
      html += '<span class="injection-site-route">' + site.route + '</span>';
      html += '</label>';
    }
    html += '</div></div>';
  }
  grid.innerHTML = html;

  grid.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', saveInjectionSiteSettings);
  });
}

async function saveInjectionSiteSettings() {
  const grid = document.getElementById('injection-sites-grid');
  const checkboxes = grid.querySelectorAll('input[type="checkbox"]');
  const enabledIds = [];
  checkboxes.forEach(cb => {
    if (cb.checked) enabledIds.push(cb.value);
  });

  const allEnabled = enabledIds.length === MASTER_INJECTION_SITES.length;
  const valueToStore = allEnabled ? null : enabledIds;

  const settings = await window.api.getSettings();
  settings.enabledInjectionSites = valueToStore;
  await window.api.saveSettings(settings);
  setEnabledSiteIds(valueToStore);
}

function setupInjectionSiteButtons() {
  const selectAll = document.getElementById('sites-select-all');
  const selectNone = document.getElementById('sites-select-none');
  if (!selectAll || !selectNone) return;

  selectAll.addEventListener('click', () => {
    const grid = document.getElementById('injection-sites-grid');
    grid.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = true; });
    saveInjectionSiteSettings();
  });

  selectNone.addEventListener('click', () => {
    const grid = document.getElementById('injection-sites-grid');
    grid.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
    saveInjectionSiteSettings();
  });
}
