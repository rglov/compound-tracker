// ═══════════════════════════════════════
// COMPOUND DETAIL VIEW
// ═══════════════════════════════════════

let detailChart = null;
let detailCompoundId = null;
let detailRangeHours = 336; // default 14d
let hypotheticalDoses = [];
let detailCompoundMeta = null; // cached compound metadata for current detail view

// Unified detail view state
let detailOrigin = 'dashboard'; // 'dashboard' or 'library'
let detailLibraryData = null;   // matched LIBRARY_DATA entry (or null)
let detailEditMode = false;     // library edit mode

// Baseline & target range settings
let _compoundSettings = {};

async function loadCompoundSettings() {
  _compoundSettings = await window.api.getCompoundSettings();
}

function getSettingsForCompound(compoundName) {
  return _compoundSettings[compoundName] || null;
}

// Reference ranges (ng/dL for testosterone-based, generic for others)
const REFERENCE_RANGES = {
  'test-cyp': [
    { label: 'Hypogonadal Male', min: 0, max: 250, color: 'rgba(255,82,82,0.08)', border: 'rgba(255,82,82,0.3)' },
    { label: 'Male Standard Range', min: 250, max: 950, color: 'rgba(0,230,118,0.08)', border: 'rgba(0,230,118,0.3)' },
    { label: 'Supraphysiological', min: 1000, max: 3000, color: 'rgba(255,165,0,0.08)', border: 'rgba(255,165,0,0.3)' }
  ],
  'test-e': [
    { label: 'Hypogonadal Male', min: 0, max: 250, color: 'rgba(255,82,82,0.08)', border: 'rgba(255,82,82,0.3)' },
    { label: 'Male Standard Range', min: 250, max: 950, color: 'rgba(0,230,118,0.08)', border: 'rgba(0,230,118,0.3)' },
    { label: 'Supraphysiological', min: 1000, max: 3000, color: 'rgba(255,165,0,0.08)', border: 'rgba(255,165,0,0.3)' }
  ],
  'test-prop': [
    { label: 'Hypogonadal Male', min: 0, max: 250, color: 'rgba(255,82,82,0.08)', border: 'rgba(255,82,82,0.3)' },
    { label: 'Male Standard Range', min: 250, max: 950, color: 'rgba(0,230,118,0.08)', border: 'rgba(0,230,118,0.3)' },
    { label: 'Supraphysiological', min: 1000, max: 3000, color: 'rgba(255,165,0,0.08)', border: 'rgba(255,165,0,0.3)' }
  ],
  'test-u': [
    { label: 'Hypogonadal Male', min: 0, max: 250, color: 'rgba(255,82,82,0.08)', border: 'rgba(255,82,82,0.3)' },
    { label: 'Male Standard Range', min: 250, max: 950, color: 'rgba(0,230,118,0.08)', border: 'rgba(0,230,118,0.3)' },
    { label: 'Supraphysiological', min: 1000, max: 3000, color: 'rgba(255,165,0,0.08)', border: 'rgba(255,165,0,0.3)' }
  ]
};

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

const BLOODWORK_MARKERS_BY_TYPE = {
  'Hormone': BLOODWORK_MARKERS['Testosterone Cypionate']
};

function getBloodworkMarkers(compoundName, compoundType) {
  return BLOODWORK_MARKERS[compoundName] || BLOODWORK_MARKERS_BY_TYPE[compoundType] || null;
}

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

  if (!_selectedBloodworkMarker && markers.length > 0) {
    _selectedBloodworkMarker = markers[0].name;
  }

  const pills = markers.map(m =>
    `<button class="bw-marker-pill ${m.name === _selectedBloodworkMarker ? 'active' : ''}" onclick="selectBloodworkMarker('${escapeHtml(m.name)}')">${escapeHtml(m.name)}</button>`
  ).join('');

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

// Expose bloodwork functions
window.showAddBloodworkForm = showAddBloodworkForm;
window.submitBloodwork = submitBloodwork;
window.deleteBloodworkEntry = deleteBloodworkEntry;
window.hideBloodworkForm = hideBloodworkForm;
window.selectBloodworkMarker = selectBloodworkMarker;
window.updateBwUnit = updateBwUnit;

// Bridge: find LIBRARY_DATA entry for a given compoundId/name
function findLibraryDataForCompound(compoundId, compoundName) {
  // 1. Try by compoundName (dose records carry the display name)
  if (compoundName) {
    const byName = LIBRARY_DATA.find(c => c.name === compoundName);
    if (byName) return byName;
  }
  // 2. Try by compoundId as name (library-sourced doses use name as ID)
  if (compoundId) {
    const byId = LIBRARY_DATA.find(c => c.name === compoundId);
    if (byId) return byId;
  }
  // 3. Try COMPOUND_LIBRARY slug → name → LIBRARY_DATA
  if (compoundId && typeof getCompoundById === 'function') {
    const builtIn = getCompoundById(compoundId);
    if (builtIn) {
      const byBuiltInName = LIBRARY_DATA.find(c => c.name === builtIn.name);
      if (byBuiltInName) return byBuiltInName;
    }
  }
  return null;
}

function openCompoundDetail(compoundId, options = {}) {
  detailCompoundId = compoundId;
  hypotheticalDoses = [];
  detailRangeHours = 336;
  detailOrigin = options.origin || 'dashboard';
  detailEditMode = false;

  // Find matching library data
  const compoundName = options.compoundName || compoundId; // Library opens pass name as compoundId
  detailLibraryData = findLibraryDataForCompound(compoundId, compoundName);

  // Update back button label
  const backLabel = document.getElementById('detail-back-label');
  if (backLabel) {
    backLabel.textContent = detailOrigin === 'library' ? 'Back to Library' : 'Back';
  }

  // Show the detail view
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-compound-detail').classList.add('active');

  // Highlight correct nav button
  const navView = detailOrigin === 'library' ? 'library' : 'dashboard';
  const navBtn = document.querySelector(`.nav-btn[data-view="${navView}"]`);
  if (navBtn) navBtn.classList.add('active');

  // Set range button active state
  document.querySelectorAll('.detail-range-btn').forEach(b => {
    b.classList.toggle('active', parseInt(b.dataset.range) === detailRangeHours);
  });

  // Reset edit button
  const editBtn = document.getElementById('detail-edit-btn');
  if (editBtn) {
    editBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit`;
  }

  refreshUnifiedDetail();
}

function closeCompoundDetail() {
  destroyDetailChart();
  hypotheticalDoses = [];
  detailLibraryData = null;
  detailEditMode = false;
  switchView(detailOrigin === 'library' ? 'library' : 'dashboard');
}

async function refreshUnifiedDetail() {
  if (!detailCompoundId) return;

  await loadCompoundSettings();

  const allDoses = await window.api.getDoses();
  const compoundDoses = allDoses.filter(d => d.compoundId === detailCompoundId || d.compoundName === detailCompoundId);
  const hasDoses = compoundDoses.length > 0 || hypotheticalDoses.length > 0;
  const hasLibrary = !!detailLibraryData;

  // Update header with compound name
  const sampleDose = compoundDoses[0] || hypotheticalDoses[0];
  let compoundName, compoundColor, category;

  if (sampleDose) {
    compoundName = sampleDose.compoundName;
    compoundColor = sampleDose.color || '#888';
    category = sampleDose.category;
  } else if (hasLibrary) {
    compoundName = detailLibraryData.name;
    const typeConf = LIBRARY_TYPE_CONFIG[detailLibraryData.type] || LIBRARY_TYPE_CONFIG['Peptide'];
    compoundColor = typeConf.color;
    category = (detailLibraryData.type || '').toLowerCase();
  } else {
    compoundName = detailCompoundId;
    compoundColor = '#888';
    category = '';
  }

  document.getElementById('detail-compound-name').innerHTML = `
    <span class="color-dot" style="background:${compoundColor}"></span>
    ${escapeHtml(compoundName)}
    ${category ? `<span class="category-badge ${category}">${category}</span>` : ''}`;

  // Render compound info bar
  const infoBar = document.getElementById('detail-info-bar');
  if (infoBar) {
    if (hasLibrary) {
      const typeConf = LIBRARY_TYPE_CONFIG[detailLibraryData.type] || LIBRARY_TYPE_CONFIG['Peptide'];
      infoBar.innerHTML = `
        <div class="lib-detail-info-row">
          <div class="lib-detail-info-card">
            <span class="lib-detail-info-label">Half-Life</span>
            <span class="lib-detail-info-value">${formatHalfLife(detailLibraryData.halfLifeHours)}</span>
          </div>
          <div class="lib-detail-info-card">
            <span class="lib-detail-info-label">Type</span>
            <span class="lib-detail-info-value" style="color:${typeConf.color}">${detailLibraryData.type}</span>
          </div>
          <div class="lib-detail-info-card">
            <span class="lib-detail-info-label">Benefits</span>
            <span class="lib-detail-info-value">${detailLibraryData.benefits.length}</span>
          </div>
          <div class="lib-detail-info-card">
            <span class="lib-detail-info-label">Side Effects</span>
            <span class="lib-detail-info-value">${detailLibraryData.sideEffects.length}</span>
          </div>
        </div>`;
      infoBar.classList.remove('hidden');
    } else {
      infoBar.innerHTML = '';
      infoBar.classList.add('hidden');
    }
  }

  // Render baseline & target range section
  const displayUnit = sampleDose ? sampleDose.unit : 'mg';
  renderBaselineSection(compoundName, displayUnit);

  // Load and render bloodwork section
  await loadBloodwork();
  const compoundType = detailLibraryData?.type || '';
  renderBloodworkSection(compoundName, compoundType);

  // Show/hide dose controls and hypothetical button (show for library compounds too)
  const doseControls = document.getElementById('detail-dose-controls');
  const hypoBtn = document.getElementById('detail-hypo-btn');
  if (doseControls) doseControls.style.display = (hasDoses || hasLibrary) ? '' : 'none';
  if (hypoBtn) hypoBtn.style.display = (hasDoses || hasLibrary) ? '' : 'none';

  // Show/hide edit button (only if library data exists)
  const editBtn = document.getElementById('detail-edit-btn');
  if (editBtn) editBtn.style.display = hasLibrary ? '' : 'none';

  // Dose section — always show for library compounds (chart, inventory, reconstitution live here)
  const doseSection = document.getElementById('detail-dose-section');
  if (doseSection) doseSection.style.display = (hasDoses || hasLibrary) ? '' : 'none';

  if (hasDoses) {
    // Delegate to existing dose rendering
    await refreshCompoundDetail();
  } else if (hasLibrary) {
    // Set compound meta for hypothetical dose creation from library data
    detailCompoundMeta = {
      compoundName: detailLibraryData.name,
      color: compoundColor,
      unit: 'mg',
      halfLifeHours: detailLibraryData.halfLifeHours,
      category: (detailLibraryData.type || '').toLowerCase(),
      route: guessDefaultRoute(detailLibraryData)
    };
    // Show empty chart with half-life stats
    renderEmptyForecast(detailLibraryData);
  }

  // Inventory section
  await loadInventory();
  renderInventorySection(compoundName);

  // Library section
  const libSection = document.getElementById('detail-library-section');
  if (libSection) {
    if (hasLibrary && !detailEditMode) {
      const typeConf = LIBRARY_TYPE_CONFIG[detailLibraryData.type] || LIBRARY_TYPE_CONFIG['Peptide'];
      libSection.innerHTML = `
        <div class="detail-library-divider">
          <span>Library Reference</span>
        </div>
        <div class="lib-detail-body">
          ${renderLibraryReadView(detailLibraryData, typeConf)}
        </div>`;
      libSection.style.display = '';
    } else if (hasLibrary && detailEditMode) {
      const typeConf = LIBRARY_TYPE_CONFIG[detailLibraryData.type] || LIBRARY_TYPE_CONFIG['Peptide'];
      libSection.innerHTML = `
        <div class="detail-library-divider">
          <span>Library Reference (Editing)</span>
        </div>
        <div class="lib-detail-body">
          ${renderLibraryEditForm(detailLibraryData)}
        </div>`;
      libSection.style.display = '';
    } else {
      libSection.innerHTML = '';
      libSection.style.display = 'none';
    }
  }

  // Handle empty state: no doses AND no library
  if (!hasDoses && !hasLibrary) {
    if (doseSection) {
      doseSection.style.display = '';
      doseSection.innerHTML = `
        <div class="empty-state">
          <p>No data available for this compound.</p>
          <button class="btn btn-primary" onclick="closeCompoundDetail()">Go Back</button>
        </div>`;
    }
  }
}

function toggleUnifiedEdit() {
  if (!detailLibraryData) return;

  detailEditMode = !detailEditMode;
  const btn = document.getElementById('detail-edit-btn');

  if (detailEditMode) {
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"/></svg> Done`;
  } else {
    // Save edits
    saveLibraryEdits();
    btn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> Edit`;
  }

  refreshUnifiedDetail();
}

async function refreshCompoundDetail() {
  if (!detailCompoundId) return;

  const allDoses = await window.api.getDoses();
  const compoundDoses = allDoses.filter(d => d.compoundId === detailCompoundId || d.compoundName === detailCompoundId);

  if (compoundDoses.length === 0 && hypotheticalDoses.length === 0) {
    return; // No doses - refreshUnifiedDetail handles empty/library-only state
  }

  // Get compound info
  const sampleDose = compoundDoses[0] || hypotheticalDoses[0];
  const compoundName = sampleDose.compoundName;
  const compoundColor = sampleDose.color || '#888';
  const unit = sampleDose.unit;
  const halfLifeHours = sampleDose.halfLifeHours;
  const category = sampleDose.category;

  // Cache compound meta for hypothetical dose creation
  detailCompoundMeta = {
    compoundName, color: compoundColor, unit, halfLifeHours, category,
    route: sampleDose.route || 'intramuscular'
  };

  // Build chart
  const now = Date.now();
  const rangeMs = detailRangeHours * 60 * 60 * 1000;
  const startTime = now - rangeMs * 0.2;
  const endTime = now + rangeMs * 0.8;

  // Combine real + hypothetical doses
  const allCompoundDoses = [...compoundDoses, ...hypotheticalDoses];

  // Generate time series for this compound
  const intervalHours = getAdaptiveInterval(endTime - startTime, halfLifeHours);
  const intervalMs = intervalHours * 60 * 60 * 1000;
  const chartPoints = [];

  for (let t = startTime; t <= endTime; t += intervalMs) {
    let totalLevel = 0;
    for (const dose of allCompoundDoses) {
      totalLevel += calculateRemainingLevel(dose, t);
    }
    chartPoints.push({ x: t, y: Math.round(totalLevel * 1000) / 1000 });
  }

  // Render chart
  renderDetailChart(chartPoints, compoundName, compoundColor, unit);

  // Render recent doses
  renderRecentDoses(compoundDoses, now, unit);

  // Render hypothetical doses
  renderHypotheticalDoses(unit);

  // Render reference ranges section
  renderReferenceRanges();

  // Render compound stats
  renderDetailStats(allCompoundDoses, now, halfLifeHours, unit);
}

function renderEmptyForecast(libraryData) {
  const halfLifeHours = libraryData.halfLifeHours || 24;

  // Destroy any existing chart
  if (detailChart) {
    detailChart.destroy();
    detailChart = null;
  }

  // Hide the chart canvas, show empty message instead
  const canvas = document.getElementById('detail-chart');
  if (canvas) canvas.style.display = 'none';

  // Add empty overlay to chart container
  const chartContainer = canvas?.parentElement;
  if (chartContainer) {
    let overlay = chartContainer.querySelector('.chart-empty-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.className = 'chart-empty-overlay';
      chartContainer.appendChild(overlay);
    }
    overlay.innerHTML = '<p>No doses logged yet. Log a dose or add a hypothetical to see the level forecast.</p>';
  }

  // Show half-life stats
  const statsEl = document.getElementById('detail-stats');
  if (statsEl) {
    statsEl.innerHTML = `
      <div class="detail-stat-card">
        <span class="detail-stat-label">Half-Life</span>
        <span class="detail-stat-value">${formatHalfLife(halfLifeHours)}</span>
      </div>
      <div class="detail-stat-card">
        <span class="detail-stat-label">50% at</span>
        <span class="detail-stat-value">${formatDuration(halfLifeHours)}</span>
      </div>
      <div class="detail-stat-card">
        <span class="detail-stat-label">25% at</span>
        <span class="detail-stat-value">${formatDuration(halfLifeHours * 2)}</span>
      </div>
      <div class="detail-stat-card">
        <span class="detail-stat-label">~Clears</span>
        <span class="detail-stat-value">${formatDuration(halfLifeHours * 5)}</span>
      </div>`;
  }

  // Clear dose-dependent sections
  const recentDosesEl = document.getElementById('detail-recent-doses');
  if (recentDosesEl) recentDosesEl.innerHTML = '<div class="detail-empty-msg">No doses logged yet.</div>';

  const hypoEl = document.getElementById('detail-hypothetical-doses');
  if (hypoEl) hypoEl.innerHTML = '';

  const refEl = document.getElementById('detail-reference-ranges');
  if (refEl) refEl.innerHTML = '';

  const baselineEl = document.getElementById('detail-baseline-section');
  if (baselineEl) baselineEl.classList.add('hidden');
}

function renderDetailChart(points, name, color, unit, isTheoretical) {
  const canvas = document.getElementById('detail-chart');
  if (!canvas) return;

  // Restore canvas visibility (may have been hidden by renderEmptyForecast)
  canvas.style.display = '';
  const overlay = canvas.parentElement?.querySelector('.chart-empty-overlay');
  if (overlay) overlay.remove();

  const Chart = window.Chart;
  const { DateTime } = window.luxon;

  if (detailChart) {
    detailChart.destroy();
    detailChart = null;
  }

  const ranges = REFERENCE_RANGES[detailCompoundId];
  const annotations = [];

  // Reference range band plugins
  const refBandPlugin = {
    id: 'refBands',
    beforeDraw(chart) {
      if (!ranges) return;
      const ctx = chart.ctx;
      const yScale = chart.scales.y;
      const xScale = chart.scales.x;

      for (const range of ranges) {
        const yMin = yScale.getPixelForValue(range.max);
        const yMax = yScale.getPixelForValue(range.min);
        const height = yMax - yMin;
        if (height <= 0) continue;

        ctx.save();
        ctx.fillStyle = range.color;
        ctx.fillRect(xScale.left, yMin, xScale.right - xScale.left, height);

        // Draw top border line
        ctx.strokeStyle = range.border;
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(xScale.left, yMin);
        ctx.lineTo(xScale.right, yMin);
        ctx.stroke();

        // Label on the right
        ctx.fillStyle = range.border;
        ctx.font = '10px -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(range.label, xScale.right - 6, yMin + 14);
        ctx.restore();
      }
    }
  };

  // "Now" line plugin
  const nowLinePlugin = {
    id: 'detailNowLine',
    afterDraw(chart) {
      const now = Date.now();
      const xScale = chart.scales.x;
      const yScale = chart.scales.y;
      const xPixel = xScale.getPixelForValue(now);
      if (xPixel < xScale.left || xPixel > xScale.right) return;

      const ctx = chart.ctx;
      ctx.save();
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.strokeStyle = 'rgba(67, 97, 238, 0.6)';
      ctx.lineWidth = 1;
      ctx.moveTo(xPixel, yScale.top);
      ctx.lineTo(xPixel, yScale.bottom);
      ctx.stroke();

      ctx.fillStyle = 'rgba(67, 97, 238, 0.8)';
      ctx.font = '10px -apple-system, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('now', xPixel, yScale.top - 4);
      ctx.restore();
    }
  };

  // Baseline & target range plugin
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

  // Bloodwork scatter data for selected marker
  const bwEntries = getBloodworkForCompound(name);
  const selectedEntries = bwEntries.filter(e => e.marker === _selectedBloodworkMarker);

  // Determine y-axis max
  let yMax = Math.max(...points.map(p => p.y)) * 1.2;
  if (ranges) {
    const refMax = Math.max(...ranges.map(r => r.max));
    yMax = Math.max(yMax, refMax * 1.1);
  }
  const bSettings = getSettingsForCompound(name);
  if (bSettings) {
    if (bSettings.targetMax) yMax = Math.max(yMax, bSettings.targetMax * 1.1);
    if (bSettings.baseline) yMax = Math.max(yMax, bSettings.baseline * 1.2);
  }

  // Build datasets array
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

  detailChart = new Chart(canvas, {
    type: 'line',
    data: {
      datasets: datasets
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 300 },
      interaction: {
        mode: 'index',
        intersect: false
      },
      scales: {
        x: {
          type: 'time',
          adapters: {
            date: { zone: DateTime.local().zoneName }
          },
          time: {
            unit: 'day',
            displayFormats: {
              day: 'MMM d'
            },
            tooltipFormat: 'MMM d, yyyy HH:mm'
          },
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#a0a0b0',
            font: { size: 11 },
            maxTicksLimit: 10
          }
        },
        y: {
          beginAtZero: true,
          max: yMax,
          grid: { color: 'rgba(255,255,255,0.05)' },
          ticks: {
            color: '#a0a0b0',
            font: { size: 11 }
          },
          title: {
            display: true,
            text: `Level (${unit})`,
            color: '#a0a0b0',
            font: { size: 12 }
          }
        },
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
            text: _selectedBloodworkMarker ? (_selectedBloodworkMarker + ' (' + (selectedEntries[0]?.unit || '') + ')') : '',
            color: '#ffd54f',
            font: { size: 12 }
          }
        }
      },
      plugins: {
        legend: { display: selectedEntries.length > 0 },
        tooltip: {
          backgroundColor: '#2a2a3e',
          titleColor: '#fff',
          bodyColor: '#ccc',
          borderColor: '#3a3a5a',
          borderWidth: 1,
          padding: 10,
          callbacks: {
            label: function(ctx) {
              const ds = ctx.dataset;
              if (ds.yAxisID === 'y2') {
                return `${ds.label}: ${ctx.parsed.y} ${selectedEntries[0]?.unit || ''}`;
              }
              return `${ctx.parsed.y.toFixed(2)} ${unit}`;
            }
          }
        }
      }
    },
    plugins: [refBandPlugin, nowLinePlugin, baselinePlugin]
  });
}

function renderDetailStats(doses, now, halfLifeHours, unit) {
  const container = document.getElementById('detail-stats');
  if (!container) return;

  let totalRemaining = 0;
  let totalDosed = 0;
  let lastDoseTime = 0;
  let doseCount = 0;

  for (const dose of doses) {
    if (dose.isHypothetical) continue;
    const remaining = calculateRemainingLevel(dose, now);
    totalRemaining += remaining;
    totalDosed += dose.amount;
    const doseTime = new Date(dose.administeredAt).getTime();
    if (doseTime > lastDoseTime && doseTime <= now) lastDoseTime = doseTime;
    if (doseTime <= now) doseCount++;
  }

  const pct = totalDosed > 0 ? Math.round((totalRemaining / totalDosed) * 100 * 10) / 10 : 0;
  const lastDoseAgo = lastDoseTime > 0 ? formatRelativeTime(lastDoseTime) : 'N/A';
  const clearTimeHours = halfLifeHours * 10;
  const timeSinceLastHours = lastDoseTime > 0 ? (now - lastDoseTime) / (1000 * 60 * 60) : 0;
  const eta = clearTimeHours - timeSinceLastHours;
  const etaStr = lastDoseTime > 0 ? (eta > 0 ? `~${formatDuration(eta)}` : 'Cleared') : 'N/A';

  container.innerHTML = `
    <div class="detail-stat-card">
      <span class="detail-stat-label">Current Level</span>
      <span class="detail-stat-value accent-green">${totalRemaining.toFixed(2)} ${unit}</span>
    </div>
    <div class="detail-stat-card">
      <span class="detail-stat-label">% Active</span>
      <span class="detail-stat-value">${pct}%</span>
    </div>
    <div class="detail-stat-card">
      <span class="detail-stat-label">Last Dose</span>
      <span class="detail-stat-value">${lastDoseAgo}</span>
    </div>
    <div class="detail-stat-card">
      <span class="detail-stat-label">Clears In</span>
      <span class="detail-stat-value">${etaStr}</span>
    </div>
    <div class="detail-stat-card">
      <span class="detail-stat-label">Half-Life</span>
      <span class="detail-stat-value">${formatDuration(halfLifeHours)}</span>
    </div>
    <div class="detail-stat-card">
      <span class="detail-stat-label">Total Doses</span>
      <span class="detail-stat-value">${doseCount}</span>
    </div>`;
}

function renderRecentDoses(doses, now, unit) {
  const container = document.getElementById('detail-recent-doses');
  if (!container) return;

  // Sort by date descending, show last 10
  const sorted = [...doses]
    .sort((a, b) => new Date(b.administeredAt).getTime() - new Date(a.administeredAt).getTime())
    .slice(0, 10);

  if (sorted.length === 0) {
    container.innerHTML = '<div class="detail-empty-msg">No doses logged yet.</div>';
    return;
  }

  container.innerHTML = sorted.map(dose => {
    const doseTime = new Date(dose.administeredAt).getTime();
    const remaining = calculateRemainingLevel(dose, now);
    const pct = dose.amount > 0 ? Math.round((remaining / dose.amount) * 100) : 0;
    const isFuture = doseTime > now;
    const locationLabel = dose.location ? formatLocationName(dose.location) : '';

    return `
      <div class="detail-dose-row ${isFuture ? 'future' : ''}">
        <div class="detail-dose-left">
          <span class="detail-dose-date">${formatDateTimeShort(dose.administeredAt)}</span>
          ${locationLabel ? `<span class="detail-dose-site">${locationLabel}</span>` : ''}
        </div>
        <div class="detail-dose-right">
          <span class="detail-dose-amount">${dose.amount} ${unit}</span>
          <span class="detail-dose-remaining ${pct === 0 ? 'cleared' : ''}">${pct > 0 ? pct + '% active' : 'Cleared'}</span>
        </div>
      </div>`;
  }).join('');
}

function renderHypotheticalDoses(unit) {
  const container = document.getElementById('detail-hypothetical-doses');
  if (!container) return;

  if (hypotheticalDoses.length === 0) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <h4 class="detail-subsection-title">Hypothetical Doses</h4>
    ${hypotheticalDoses.map((dose, idx) => `
      <div class="detail-dose-row hypothetical">
        <div class="detail-dose-left">
          <span class="detail-dose-date">${formatDateTimeShort(dose.administeredAt)}</span>
          <span class="detail-dose-tag">hypothetical</span>
        </div>
        <div class="detail-dose-right">
          <span class="detail-dose-amount">${dose.amount} ${unit}</span>
          <button class="btn btn-danger btn-small" onclick="removeHypotheticalDose(${idx})">Remove</button>
        </div>
      </div>`).join('')}`;
}

function renderReferenceRanges() {
  const container = document.getElementById('detail-reference-ranges');
  if (!container) return;

  const ranges = REFERENCE_RANGES[detailCompoundId];
  if (!ranges) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <h4 class="detail-subsection-title">Reference Ranges</h4>
    <div class="ref-range-list">
      ${ranges.map(r => `
        <div class="ref-range-row">
          <div class="ref-range-color" style="background:${r.border}"></div>
          <div class="ref-range-info">
            <span class="ref-range-label">${r.label}</span>
            <span class="ref-range-values">${r.min.toLocaleString()} – ${r.max.toLocaleString()} ${r.label.includes('Male') ? 'ng/dL' : ''}</span>
          </div>
        </div>`).join('')}
    </div>`;
}

function showAddHypotheticalModal() {
  if (!detailCompoundId || !detailCompoundMeta) return;

  const defaultUnit = detailCompoundMeta.unit || 'mg';

  // Pre-fill with a date 7 days from now
  const futureDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const futureDateStr = toLocalDatetimeValue(futureDate);

  document.getElementById('hypo-amount').value = '';
  document.getElementById('hypo-unit-label').textContent = defaultUnit;
  document.getElementById('hypo-datetime').value = futureDateStr;
  document.getElementById('hypothetical-modal').classList.remove('hidden');
}

function closeHypotheticalModal() {
  document.getElementById('hypothetical-modal').classList.add('hidden');
}

function addHypotheticalDose() {
  const amount = parseFloat(document.getElementById('hypo-amount').value);
  const datetime = document.getElementById('hypo-datetime').value;

  if (!amount || amount <= 0 || !datetime) {
    showToast('Please enter a valid amount and date', 'error');
    return;
  }

  if (!detailCompoundMeta) {
    showToast('Could not find compound info', 'error');
    return;
  }

  const m = detailCompoundMeta;
  hypotheticalDoses.push({
    id: 'hypo-' + generateId(),
    compoundId: detailCompoundId,
    compoundName: m.compoundName,
    amount,
    unit: m.unit,
    halfLifeHours: m.halfLifeHours,
    color: m.color,
    category: m.category,
    route: m.route,
    administeredAt: new Date(datetime).toISOString(),
    isHypothetical: true
  });

  closeHypotheticalModal();
  refreshUnifiedDetail();
}

function removeHypotheticalDose(idx) {
  hypotheticalDoses.splice(idx, 1);
  refreshUnifiedDetail();
}

function destroyDetailChart() {
  if (detailChart) {
    detailChart.destroy();
    detailChart = null;
  }
}

function setupDetailRangeButtons() {
  document.querySelectorAll('.detail-range-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.detail-range-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      detailRangeHours = parseInt(btn.dataset.range);
      refreshUnifiedDetail();
    });
  });
}

function setupHypotheticalForm() {
  document.getElementById('hypo-form').addEventListener('submit', (e) => {
    e.preventDefault();
    addHypotheticalDose();
  });

  document.getElementById('hypothetical-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeHypotheticalModal();
  });
}

function initCompoundDetail() {
  setupDetailRangeButtons();
  setupHypotheticalForm();
}

// ═══════════════════════════════════════
// INVENTORY TRACKING
// ═══════════════════════════════════════

let _inventoryData = [];

async function loadInventory() {
  _inventoryData = await window.api.getInventory();
}

function getInventoryForCompound(compoundName) {
  return _inventoryData.filter(i => i.compoundName === compoundName);
}

async function renderInventorySection(compoundName) {
  const container = document.getElementById('detail-inventory-section');
  if (!container) return;

  // Gather ALL order line items for this compound (source of truth)
  const orders = await window.api.getOrders();
  const allOrderItems = [];
  for (const order of orders) {
    for (const li of (order.lineItems || [])) {
      if (li.type === 'compound' && li.compoundName === compoundName) {
        allOrderItems.push({
          ...li,
          supplier: order.supplier || '',
          orderDate: order.orderDate || '',
          orderStatus: order.status || 'ordered'
        });
      }
    }
  }

  // Gather inventory store entries (for remainingAmount tracking on delivered items)
  const invItems = getInventoryForCompound(compoundName);

  if (allOrderItems.length === 0 && invItems.length === 0) {
    container.innerHTML = `
      <div class="detail-section">
        <h3 class="detail-section-title">Inventory</h3>
        <p class="text-muted" style="font-size:13px">No inventory tracked for this compound.</p>
      </div>`;
    return;
  }

  // Group order items by mg per vial
  const mgGroups = {};
  for (const item of allOrderItems) {
    const mg = item.amountPerUnit || 0;
    if (!mgGroups[mg]) mgGroups[mg] = { orderItems: [], invItems: [] };
    mgGroups[mg].orderItems.push(item);
  }
  // Attach inventory entries to matching mg groups for remainingAmount
  for (const item of invItems) {
    const mg = item.amountPerUnit || 0;
    if (!mgGroups[mg]) mgGroups[mg] = { orderItems: [], invItems: [] };
    mgGroups[mg].invItems.push(item);
  }

  let cardsHtml = '';
  for (const [mg, group] of Object.entries(mgGroups)) {
    const mgNum = parseFloat(mg);
    // Use order items for vials/cost/tested/batch (source of truth)
    const totalVials = group.orderItems.reduce((s, e) => s + (e.quantity || 0), 0);
    const totalMg = mgNum * totalVials;
    // Use inventory entries for remainingAmount if available
    const totalRemaining = group.invItems.reduce((s, e) => s + (e.remainingAmount || 0), 0);
    const hasStock = group.invItems.length > 0;

    const allItems = [...group.orderItems, ...group.invItems];
    const capColors = [...new Set(allItems.map(e => e.capColor).filter(c => c && c !== '#000000'))];
    const capDots = capColors.map(c => `<span class="inv-cap-dot" style="background:${c}"></span>`).join('');

    const batches = [...new Set(group.orderItems.map(e => e.batchNumber).filter(Boolean))];
    const batchTags = batches.map(b => '<span class="inv-batch-tag">' + escapeHtml(b) + '</span>').join('');

    const totalCost = group.orderItems.reduce((s, e) => s + (e.cost || 0), 0);
    const costPerVial = totalVials > 0 && totalCost > 0 ? (totalCost / totalVials) : 0;

    const pct = totalMg > 0 && hasStock ? Math.round((totalRemaining / totalMg) * 100) : 0;
    const isLow = hasStock && pct < 20;

    cardsHtml += `
      <div class="compound-inv-card ${isLow ? 'low' : ''}">
        <div class="compound-inv-card-header">
          ${capDots}
          <span class="compound-inv-card-name">${escapeHtml(compoundName)}</span>
          ${group.orderItems.some(e => e.tested) ? '<span class="inv-tested-badge" title="Tested">&#10003;</span>' : ''}
          ${batchTags}
          ${isLow ? '<span class="inv-low-badge">Low</span>' : ''}
        </div>
        <div class="compound-inv-card-qty">
          <span class="compound-inv-qty-value">${totalVials}</span>
          <span class="compound-inv-qty-unit">vials</span>
          ${mgNum ? '<span class="compound-inv-qty-x">x</span><span class="compound-inv-qty-value">' + mgNum + '</span><span class="compound-inv-qty-unit">mg</span>' : ''}
        </div>
        <div class="compound-inv-card-detail">
          <span>${totalMg.toFixed(0)} mg total</span>
          ${hasStock ? '<span>' + totalRemaining.toFixed(0) + ' mg remaining</span>' : ''}
          ${totalCost > 0 ? '<span class="compound-inv-cost">$' + totalCost.toFixed(2) + (costPerVial > 0 ? ' ($' + costPerVial.toFixed(2) + '/vial)' : '') + '</span>' : ''}
        </div>
        ${hasStock ? `
          <div class="inv-progress-bar-sm">
            <div class="inv-progress-fill ${isLow ? 'low' : ''}" style="width:${Math.min(pct, 100)}%"></div>
          </div>` : ''}
      </div>`;
  }

  container.innerHTML = `
    <div class="detail-section">
      <h3 class="detail-section-title">Inventory</h3>
      <div class="compound-inv-cards-grid">${cardsHtml}</div>
    </div>`;
}

// ═══════════════════════════════════════
// BASELINE & TARGET RANGE
// ═══════════════════════════════════════

function renderBaselineSection(compoundName, unit) {
  const container = document.getElementById('detail-baseline-section');
  if (!container) return;

  const settings = getSettingsForCompound(compoundName);
  const hasSettings = settings && (settings.baseline || settings.targetMin || settings.targetMax);

  if (!hasSettings) {
    container.innerHTML = `
      <div class="baseline-prompt">
        <button class="btn btn-secondary btn-small" onclick="expandBaselineForm('${escapeHtml(compoundName)}', '${escapeHtml(unit)}')">
          Set Baseline & Target Range
        </button>
      </div>`;
    container.classList.remove('hidden');
    return;
  }

  // Read-only display with click to edit
  const parts = [];
  if (settings.baseline) parts.push('Baseline: ' + settings.baseline + ' ' + (settings.unit || unit));
  if (settings.targetMin && settings.targetMax) parts.push('Target: ' + settings.targetMin + '-' + settings.targetMax + ' ' + (settings.unit || unit));
  container.innerHTML = `
    <div class="baseline-display" onclick="expandBaselineForm('${escapeHtml(compoundName)}', '${escapeHtml(settings.unit || unit)}')">
      <span class="baseline-text">${parts.join(' | ')}</span>
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
    </div>`;
  container.classList.remove('hidden');
}

function expandBaselineForm(compoundName, unit) {
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
  container.classList.remove('hidden');
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

// Expose to global scope for onclick handlers
window.expandBaselineForm = expandBaselineForm;
window.saveBaselineSettings = saveBaselineSettings;
window.cancelBaselineEdit = cancelBaselineEdit;

// Log Dose from detail page - opens modal pre-selected to current compound
async function logDoseFromDetail() {
  const compoundName = detailLibraryData ? detailLibraryData.name : (detailCompoundMeta ? detailCompoundMeta.compoundName : detailCompoundId);
  if (!compoundName) return;

  await refreshCompoundSelect();

  // Find compound in the select list
  const compoundMatch = allCompoundsForSelect.find(c => c.name === compoundName);
  if (compoundMatch) {
    const category = compoundMatch.isLibraryBlend ? 'blend' : (compoundMatch.category || 'all');
    const catTab = document.querySelector('.cat-tab[data-category="' + category + '"]') ||
                   document.querySelector('.cat-tab[data-category="all"]');
    if (catTab) {
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      catTab.classList.add('active');
      currentLogCategory = catTab.dataset.category;
      populateCompoundDropdown();
    }
    document.getElementById('compound-select').value = compoundMatch.id;
    document.getElementById('compound-select').dispatchEvent(new Event('change'));
  }

  populateLocationDropdown(document.getElementById('dose-location'), '');
  document.getElementById('dose-datetime').value = toLocalDatetimeValue();
  document.getElementById('log-dose-modal').classList.remove('hidden');
}

window.logDoseFromDetail = logDoseFromDetail;

// Expose to global scope for onclick handlers
window.openCompoundDetail = openCompoundDetail;
window.closeCompoundDetail = closeCompoundDetail;
window.showAddHypotheticalModal = showAddHypotheticalModal;
window.closeHypotheticalModal = closeHypotheticalModal;
window.removeHypotheticalDose = removeHypotheticalDose;
window.toggleUnifiedEdit = toggleUnifiedEdit;
