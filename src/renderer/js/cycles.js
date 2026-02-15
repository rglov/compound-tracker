// ═══════════════════════════════════════
// CYCLE PLANNER
// ═══════════════════════════════════════

let allCycles = [];
let currentBuilderCycle = null; // cycle being created/edited
let currentDetailCycleId = null;
let builderEntryCounter = 0;

const FREQUENCY_LABELS = {
  daily: 'Daily',
  '2x_daily': '2x Daily',
  '3x_weekly': '3x Weekly (M/W/F)',
  eod: 'Every Other Day',
  weekly: 'Weekly',
  every_n_days: 'Every N Days',
  custom_days: 'Specific Days of Week'
};

const FREQUENCY_SHORT = {
  daily: 'Daily',
  '2x_daily': '2x/day',
  '3x_weekly': '3x/wk',
  eod: 'EOD',
  weekly: 'Weekly',
  every_n_days: 'Every N',
  custom_days: 'Custom'
};

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getFreqShortLabel(entry) {
  if (entry.frequency === 'custom_days' && entry.customDays && entry.customDays.length > 0) {
    return entry.customDays.map(d => WEEKDAY_LABELS[d]).join('/');
  }
  if ((entry.frequency === 'every_n_days' || entry.frequency === 'custom') && entry.customFreqDays) {
    return `Every ${entry.customFreqDays}d`;
  }
  return FREQUENCY_SHORT[entry.frequency] || entry.frequency;
}

const CYCLE_STATUS_COLORS = {
  planned: { bg: 'rgba(67,97,238,0.15)', color: '#4361ee', label: 'Planned' },
  active: { bg: 'rgba(0,230,118,0.15)', color: '#00e676', label: 'Active' },
  paused: { bg: 'rgba(255,213,79,0.15)', color: '#ffd54f', label: 'Paused' },
  completed: { bg: 'rgba(160,160,176,0.15)', color: '#a0a0b0', label: 'Completed' }
};

// ═══════════════════════════════════════
// INIT & PERSISTENCE
// ═══════════════════════════════════════

async function initCycles() {
  allCycles = await window.api.getCycles();
}

async function persistCycles() {
  await window.api.saveCycles(allCycles);
}

// ═══════════════════════════════════════
// CYCLES LIST VIEW
// ═══════════════════════════════════════

function refreshCyclesList() {
  const grid = document.getElementById('cycles-grid');
  if (!grid) return;

  if (allCycles.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="1.5">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/>
          <line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>
        </svg>
        <p>No cycles yet. Plan your first peptide cycle to get started.</p>
        <button class="btn btn-primary" onclick="openCycleBuilder()">Create a Cycle</button>
      </div>`;
    return;
  }

  // Sort: active first, then planned, paused, completed
  const order = { active: 0, planned: 1, paused: 2, completed: 3 };
  const sorted = [...allCycles].sort((a, b) => (order[a.status] || 9) - (order[b.status] || 9));

  grid.innerHTML = sorted.map(cycle => {
    const st = CYCLE_STATUS_COLORS[cycle.status] || CYCLE_STATUS_COLORS.planned;
    const entryCount = cycle.entries.length;
    const totalDays = getTotalCycleDays(cycle);
    const startDateObj = cycle.startDate
      ? new Date(cycle.startDate + (cycle.startDate.includes('T') ? '' : 'T00:00:00'))
      : null;
    const startStr = startDateObj
      ? startDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Not scheduled';

    // Adherence for active/completed
    let adherenceHtml = '';
    if (cycle.status === 'active' || cycle.status === 'completed' || cycle.status === 'paused') {
      const stats = getCycleAdherence(cycle);
      const pct = stats.total > 0 ? Math.round((stats.taken / stats.total) * 100) : 0;
      adherenceHtml = `
        <div class="cycle-card-progress">
          <div class="cycle-progress-bar">
            <div class="cycle-progress-fill" style="width:${pct}%; background:${st.color}"></div>
          </div>
          <span class="cycle-progress-label">${stats.taken}/${stats.total} doses (${pct}%)</span>
        </div>`;
    }

    // Compound pills
    const compoundPills = cycle.entries.slice(0, 4).map(e =>
      `<span class="cycle-compound-pill" style="border-color:${e.color || '#888'}">${escapeHtml(e.compoundName)}</span>`
    ).join('') + (entryCount > 4 ? `<span class="cycle-compound-pill more">+${entryCount - 4}</span>` : '');

    // Tags
    const cycleTags = (cycle.tags || []);
    const tagsHtml = cycleTags.length > 0
      ? `<div class="cycle-card-tags">${cycleTags.slice(0, 5).map(t =>
          `<span class="cycle-tag">${escapeHtml(t)}</span>`
        ).join('')}${cycleTags.length > 5 ? `<span class="cycle-tag cycle-tag-more">+${cycleTags.length - 5}</span>` : ''}</div>`
      : '';

    return `
      <div class="cycle-card" onclick="openCycleDetail('${cycle.id}')">
        <div class="cycle-card-header">
          <h3 class="cycle-card-name">${escapeHtml(cycle.name)}</h3>
          <span class="cycle-status-badge" style="background:${st.bg};color:${st.color}">${st.label}</span>
        </div>
        <div class="cycle-card-meta">
          <span>${entryCount} compound${entryCount !== 1 ? 's' : ''}</span>
          <span>${totalDays} days</span>
          <span>${startStr}</span>
        </div>
        <div class="cycle-card-compounds">${compoundPills}</div>
        ${tagsHtml}
        ${adherenceHtml}
      </div>`;
  }).join('');
}

function getTotalCycleDays(cycle) {
  if (cycle.entries.length === 0) return 0;
  const cycleStart = getCycleStartDate(cycle);
  if (!cycleStart) return Math.max(...cycle.entries.map(e => e.durationDays));
  return Math.max(...cycle.entries.map(e => {
    const entryStart = e.startDate ? new Date(e.startDate + 'T00:00:00') : cycleStart;
    const offsetDays = Math.round((entryStart.getTime() - cycleStart.getTime()) / (24 * 60 * 60 * 1000));
    return offsetDays + e.durationDays;
  }));
}

// Get the earliest start date across cycle and its entries
function getCycleStartDate(cycle) {
  if (cycle.startDate) return new Date(cycle.startDate + (cycle.startDate.includes('T') ? '' : 'T00:00:00'));
  // Fallback: find earliest entry startDate
  const dates = cycle.entries.filter(e => e.startDate).map(e => new Date(e.startDate + 'T00:00:00'));
  if (dates.length === 0) return null;
  return new Date(Math.min(...dates.map(d => d.getTime())));
}

// Get the day offset of an entry relative to the cycle start
function getEntryDayOffset(entry, cycleStart) {
  if (!entry.startDate || !cycleStart) return entry.startDay || 0;
  const entryStart = new Date(entry.startDate + (entry.startDate.includes('T') ? '' : 'T00:00:00'));
  return Math.max(0, Math.round((entryStart.getTime() - cycleStart.getTime()) / (24 * 60 * 60 * 1000)));
}

function getCycleAdherence(cycle) {
  const now = Date.now();
  const scheduled = cycle.scheduledDoses || [];
  const past = scheduled.filter(d => new Date(d.scheduledAt).getTime() <= now);
  const taken = past.filter(d => d.status === 'taken').length;
  const skipped = past.filter(d => d.status === 'skipped').length;
  const pending = past.filter(d => d.status === 'pending').length;
  return { total: past.length, taken, skipped, pending, future: scheduled.length - past.length };
}

// ═══════════════════════════════════════
// CYCLE BUILDER
// ═══════════════════════════════════════

function openCycleBuilder(cycleId) {
  builderEntryCounter = 0;

  if (cycleId) {
    const existing = allCycles.find(c => c.id === cycleId);
    if (!existing) return;
    currentBuilderCycle = JSON.parse(JSON.stringify(existing)); // deep clone
    // Ensure tags array exists
    if (!currentBuilderCycle.tags) currentBuilderCycle.tags = [];
    // Migrate old startDay (number offset) to startDate if needed
    for (const entry of currentBuilderCycle.entries) {
      if (entry.startDay !== undefined && !entry.startDate) {
        // Convert day offset to actual date relative to cycle start or today
        const base = currentBuilderCycle.startDate ? new Date(currentBuilderCycle.startDate) : new Date();
        base.setHours(0, 0, 0, 0);
        const d = new Date(base.getTime() + (entry.startDay || 0) * 24 * 60 * 60 * 1000);
        entry.startDate = toLocalDateStr(d);
        delete entry.startDay;
      }
    }
  } else {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    currentBuilderCycle = {
      id: generateId(),
      name: '',
      status: 'planned',
      startDate: toLocalDateStr(today),
      createdAt: new Date().toISOString(),
      notes: '',
      tags: [],
      entries: [],
      scheduledDoses: []
    };
  }

  // Switch to builder view
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-cycle-builder').classList.add('active');
  document.querySelector('.nav-btn[data-view="cycles"]').classList.add('active');

  renderBuilder();
}

// Format a Date object to YYYY-MM-DD local string
function toLocalDateStr(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function closeCycleBuilder() {
  const cycleId = currentBuilderCycle ? currentBuilderCycle.id : null;
  const wasActive = currentBuilderCycle && (currentBuilderCycle.status === 'active' || currentBuilderCycle.status === 'paused');
  currentBuilderCycle = null;

  // Go back to detail if editing an existing active/paused cycle, otherwise go to list
  if (wasActive && cycleId && allCycles.some(c => c.id === cycleId)) {
    openCycleDetail(cycleId);
  } else {
    switchView('cycles');
  }
}

function renderBuilder() {
  if (!currentBuilderCycle) return;
  const isEdit = allCycles.some(c => c.id === currentBuilderCycle.id);
  const isActive = currentBuilderCycle.status === 'active' || currentBuilderCycle.status === 'paused';

  document.getElementById('builder-title').textContent = isEdit ? 'Edit Cycle' : 'New Cycle';
  document.getElementById('builder-cycle-name').value = currentBuilderCycle.name;
  document.getElementById('builder-cycle-notes').value = currentBuilderCycle.notes || '';
  document.getElementById('builder-cycle-start-date').value = currentBuilderCycle.startDate || '';

  // Render tag picker
  renderBuilderTagPicker();

  // Update builder action buttons based on cycle status
  const actionsEl = document.getElementById('builder-actions');
  if (actionsEl) {
    if (isActive) {
      actionsEl.innerHTML = `
        <button class="btn btn-secondary btn-small" onclick="closeCycleBuilder()">Cancel</button>
        <button class="btn btn-primary btn-small" onclick="saveActiveCycleEdits()">Save Changes</button>`;
    } else {
      actionsEl.innerHTML = `
        <button class="btn btn-secondary btn-small" onclick="saveCycleAsPlan()">Save as Planned</button>
        <button class="btn btn-primary btn-small" onclick="startCycleFromBuilder()">Start Cycle</button>`;
    }
  }

  renderBuilderEntries();
  renderBuilderTimeline();
}

function renderBuilderTagPicker() {
  const container = document.getElementById('builder-tags-container');
  if (!container) return;

  // Get all tags from the library
  const allTags = typeof getAllTags === 'function' ? getAllTags() : [];
  if (allTags.length === 0) {
    container.innerHTML = '';
    return;
  }

  const cycleTags = currentBuilderCycle.tags || [];

  container.innerHTML = `
    <div class="form-label">Tags</div>
    <div class="cycle-tag-picker">
      ${allTags.map(tag => {
        const active = cycleTags.includes(tag);
        return `<button type="button" class="cycle-tag-btn ${active ? 'active' : ''}" onclick="toggleBuilderTag('${escapeHtml(tag)}')">${escapeHtml(tag)}</button>`;
      }).join('')}
    </div>`;
}

function toggleBuilderTag(tag) {
  if (!currentBuilderCycle) return;
  if (!currentBuilderCycle.tags) currentBuilderCycle.tags = [];

  const idx = currentBuilderCycle.tags.indexOf(tag);
  if (idx >= 0) {
    currentBuilderCycle.tags.splice(idx, 1);
  } else {
    currentBuilderCycle.tags.push(tag);
  }

  renderBuilderTagPicker();
}

function renderBuilderEntries() {
  const container = document.getElementById('builder-entries');
  if (!container) return;

  if (currentBuilderCycle.entries.length === 0) {
    container.innerHTML = `
      <div class="builder-empty-entries">
        <p>No compounds added yet. Click "Add Compound" to start building your cycle.</p>
      </div>`;
    return;
  }

  container.innerHTML = currentBuilderCycle.entries.map((entry, idx) => {
    const freqLabel = FREQUENCY_LABELS[entry.frequency] || entry.frequency;
    const showEveryN = entry.frequency === 'every_n_days' || entry.frequency === 'custom';
    const showCustomDays = entry.frequency === 'custom_days';
    const showOnOff = entry.onDays !== null && entry.onDays > 0;

    return `
      <div class="builder-entry-card" data-idx="${idx}">
        <div class="builder-entry-header">
          <span class="builder-entry-num">${idx + 1}</span>
          <span class="builder-entry-name" style="color:${entry.color || '#888'}">${escapeHtml(entry.compoundName)}</span>
          <button class="btn btn-danger btn-small" onclick="removeBuilderEntry(${idx})" title="Remove">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div class="builder-entry-fields">
          <div class="builder-field">
            <label class="form-label">Dose</label>
            <div class="builder-dose-row">
              <input type="number" value="${entry.dose}" step="any" min="0" onchange="updateBuilderEntry(${idx},'dose',this.value)">
              <select onchange="updateBuilderEntry(${idx},'unit',this.value)">
                <option value="mg" ${entry.unit === 'mg' ? 'selected' : ''}>mg</option>
                <option value="mcg" ${entry.unit === 'mcg' ? 'selected' : ''}>mcg</option>
                <option value="IU" ${entry.unit === 'IU' ? 'selected' : ''}>IU</option>
              </select>
            </div>
          </div>
          <div class="builder-field">
            <label class="form-label">Route</label>
            <select onchange="updateBuilderEntry(${idx},'route',this.value)">
              <option value="subcutaneous" ${entry.route === 'subcutaneous' ? 'selected' : ''}>SubQ</option>
              <option value="intramuscular" ${entry.route === 'intramuscular' ? 'selected' : ''}>IM</option>
              <option value="oral" ${entry.route === 'oral' ? 'selected' : ''}>Oral</option>
              <option value="topical" ${entry.route === 'topical' ? 'selected' : ''}>Topical</option>
            </select>
          </div>
          <div class="builder-field">
            <label class="form-label">Frequency</label>
            <select onchange="updateBuilderEntry(${idx},'frequency',this.value)">
              ${Object.entries(FREQUENCY_LABELS).map(([k, v]) =>
                `<option value="${k}" ${entry.frequency === k ? 'selected' : ''}>${v}</option>`
              ).join('')}
            </select>
          </div>
          ${showEveryN ? `
          <div class="builder-field">
            <label class="form-label">Every N Days</label>
            <input type="number" value="${entry.customFreqDays || 3}" min="1" onchange="updateBuilderEntry(${idx},'customFreqDays',this.value)">
          </div>` : ''}
          ${showCustomDays ? `
          <div class="builder-field builder-field-wide">
            <label class="form-label">Days</label>
            <div class="weekday-picker">
              ${WEEKDAY_LABELS.map((label, dayIdx) => {
                const selected = (entry.customDays || []).includes(dayIdx);
                return `<button type="button" class="weekday-btn ${selected ? 'active' : ''}" onclick="toggleBuilderWeekday(${idx}, ${dayIdx})">${label}</button>`;
              }).join('')}
            </div>
          </div>` : ''}
          <div class="builder-field">
            <label class="form-label">Start Date</label>
            <input type="date" value="${entry.startDate || ''}" onchange="updateBuilderEntry(${idx},'startDate',this.value)">
          </div>
          <div class="builder-field">
            <label class="form-label">Duration (days)</label>
            <input type="number" value="${entry.durationDays}" min="1" onchange="updateBuilderEntry(${idx},'durationDays',this.value)">
          </div>
        </div>
        <div class="builder-entry-onoff">
          <label class="builder-toggle-label">
            <input type="checkbox" ${showOnOff ? 'checked' : ''} onchange="toggleOnOff(${idx}, this.checked)">
            On/Off Cycling
          </label>
          ${showOnOff ? `
          <div class="builder-onoff-fields">
            <div class="builder-field">
              <label class="form-label">Days On</label>
              <input type="number" value="${entry.onDays}" min="1" onchange="updateBuilderEntry(${idx},'onDays',this.value)">
            </div>
            <div class="builder-field">
              <label class="form-label">Days Off</label>
              <input type="number" value="${entry.offDays}" min="1" onchange="updateBuilderEntry(${idx},'offDays',this.value)">
            </div>
          </div>` : ''}
        </div>
      </div>`;
  }).join('');
}

function renderBuilderTimeline() {
  const container = document.getElementById('builder-timeline');
  if (!container) return;

  const entries = currentBuilderCycle.entries;
  if (entries.length === 0) {
    container.innerHTML = '<div class="builder-timeline-empty">Add compounds to see the timeline preview.</div>';
    return;
  }

  const totalDays = getTotalCycleDays(currentBuilderCycle);
  if (totalDays <= 0) {
    container.innerHTML = '<div class="builder-timeline-empty">Set duration to see timeline.</div>';
    return;
  }

  const cycleStart = getCycleStartDate(currentBuilderCycle);

  // Day markers
  const markerInterval = totalDays <= 30 ? 7 : totalDays <= 90 ? 14 : 30;
  let markers = '';
  for (let d = 0; d <= totalDays; d += markerInterval) {
    const pct = (d / totalDays) * 100;
    let label = `D${d}`;
    if (cycleStart) {
      const markerDate = new Date(cycleStart.getTime() + d * 24 * 60 * 60 * 1000);
      label = markerDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    }
    markers += `<span class="timeline-marker" style="left:${pct}%">${label}</span>`;
  }

  const bars = entries.map((entry, idx) => {
    const dayOffset = cycleStart ? getEntryDayOffset(entry, cycleStart) : 0;
    const startPct = (dayOffset / totalDays) * 100;
    const widthPct = (entry.durationDays / totalDays) * 100;
    return `
      <div class="timeline-row">
        <span class="timeline-label">${escapeHtml(entry.compoundName)}</span>
        <div class="timeline-track">
          <div class="timeline-bar" style="left:${startPct}%;width:${widthPct}%;background:${entry.color || '#4361ee'}">
            <span class="timeline-bar-label">${entry.durationDays}d</span>
          </div>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <h4 class="detail-subsection-title">Timeline Preview</h4>
    <div class="timeline-chart">
      <div class="timeline-markers">${markers}</div>
      ${bars}
    </div>`;
}

function addBuilderEntry() {
  // Open a compound picker — use a simple select modal approach
  document.getElementById('cycle-compound-picker').classList.remove('hidden');
  populateCycleCompoundSelect();
}

function closeCycleCompoundPicker() {
  document.getElementById('cycle-compound-picker').classList.add('hidden');
}

function populateCycleCompoundSelect() {
  const select = document.getElementById('cycle-compound-select');
  select.innerHTML = '<option value="">Select a compound...</option>';

  // Group by type from LIBRARY_DATA
  const groups = {};
  for (const c of LIBRARY_DATA) {
    if (c.type === 'Blend') continue;
    const cat = c.type || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(c);
  }

  // Add COMPOUND_LIBRARY entries not in LIBRARY_DATA
  const libNames = new Set(LIBRARY_DATA.map(c => c.name.toLowerCase()));
  const builtinExtra = COMPOUND_LIBRARY.filter(c => !libNames.has(c.name.toLowerCase()));
  if (builtinExtra.length > 0) {
    if (!groups['Other']) groups['Other'] = [];
    for (const c of builtinExtra) {
      groups['Other'].push({ name: c.name, type: 'Other', halfLifeHours: c.halfLifeHours });
    }
  }

  for (const [type, compounds] of Object.entries(groups)) {
    const grp = document.createElement('optgroup');
    grp.label = type + 's';
    for (const c of compounds) {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      grp.appendChild(opt);
    }
    select.appendChild(grp);
  }
}

function confirmAddCompound() {
  const select = document.getElementById('cycle-compound-select');
  const name = select.value;
  if (!name) return;

  // Find compound data
  const libEntry = LIBRARY_DATA.find(c => c.name === name);
  const builtIn = COMPOUND_LIBRARY.find(c => c.name === name);

  const typeConf = libEntry ? (LIBRARY_TYPE_CONFIG[libEntry.type] || LIBRARY_TYPE_CONFIG['Peptide']) : null;
  const color = typeConf ? typeConf.color : (builtIn ? builtIn.color : '#888');
  const halfLife = libEntry ? (libEntry.halfLifeHours || 0) : (builtIn ? builtIn.halfLifeHours : 0);
  const category = libEntry ? (LIB_TYPE_TO_CATEGORY[libEntry.type] || 'peptide') : (builtIn ? builtIn.category : 'peptide');
  const unit = libEntry ? guessDefaultUnit(libEntry) : (builtIn ? builtIn.defaultUnit : 'mcg');
  const route = libEntry ? guessDefaultRoute(libEntry) : (builtIn ? builtIn.defaultRoute : 'subcutaneous');

  // Use compound name as compoundId (consistent with library-sourced doses)
  const compoundId = builtIn ? builtIn.id : name;

  currentBuilderCycle.entries.push({
    id: generateId(),
    compoundName: name,
    compoundId: compoundId,
    dose: 0,
    unit: unit,
    route: route,
    frequency: 'daily',
    customFreqDays: null,
    customDays: null,
    startDate: currentBuilderCycle.startDate || toLocalDateStr(new Date()),
    durationDays: 30,
    onDays: null,
    offDays: null,
    color: color,
    halfLifeHours: halfLife,
    category: category
  });

  closeCycleCompoundPicker();
  renderBuilderEntries();
  renderBuilderTimeline();
}

function removeBuilderEntry(idx) {
  currentBuilderCycle.entries.splice(idx, 1);
  renderBuilderEntries();
  renderBuilderTimeline();
}

function updateBuilderEntry(idx, field, value) {
  const entry = currentBuilderCycle.entries[idx];
  if (!entry) return;

  if (['dose', 'durationDays', 'customFreqDays', 'onDays', 'offDays'].includes(field)) {
    entry[field] = parseFloat(value) || 0;
  } else {
    entry[field] = value;
  }

  // Clear frequency-specific fields when switching
  if (field === 'frequency') {
    if (value !== 'every_n_days' && value !== 'custom') {
      entry.customFreqDays = null;
    }
    if (value !== 'custom_days') {
      entry.customDays = null;
    }
    // Default customDays to M/W/F when switching to custom_days
    if (value === 'custom_days' && (!entry.customDays || entry.customDays.length === 0)) {
      entry.customDays = [1, 3, 5]; // Mon, Wed, Fri
    }
  }

  renderBuilderEntries();
  renderBuilderTimeline();
}

function toggleBuilderWeekday(idx, dayOfWeek) {
  const entry = currentBuilderCycle.entries[idx];
  if (!entry) return;

  if (!entry.customDays) entry.customDays = [];
  const pos = entry.customDays.indexOf(dayOfWeek);
  if (pos >= 0) {
    entry.customDays.splice(pos, 1);
  } else {
    entry.customDays.push(dayOfWeek);
    entry.customDays.sort((a, b) => a - b);
  }

  renderBuilderEntries();
  renderBuilderTimeline();
}

function toggleOnOff(idx, checked) {
  const entry = currentBuilderCycle.entries[idx];
  if (!entry) return;

  if (checked) {
    entry.onDays = 20;
    entry.offDays = 10;
  } else {
    entry.onDays = null;
    entry.offDays = null;
  }

  renderBuilderEntries();
}

async function saveCycleAsPlan() {
  if (!currentBuilderCycle) return;

  const name = document.getElementById('builder-cycle-name').value.trim();
  if (!name) {
    showToast('Please enter a cycle name', 'error');
    return;
  }

  currentBuilderCycle.name = name;
  currentBuilderCycle.notes = document.getElementById('builder-cycle-notes').value.trim();
  currentBuilderCycle.startDate = document.getElementById('builder-cycle-start-date').value || currentBuilderCycle.startDate;

  if (currentBuilderCycle.entries.length === 0) {
    showToast('Add at least one compound', 'error');
    return;
  }

  // Check doses are set
  for (const entry of currentBuilderCycle.entries) {
    if (!entry.dose || entry.dose <= 0) {
      showToast(`Set a dose for ${entry.compoundName}`, 'error');
      return;
    }
  }

  // Save
  const existingIdx = allCycles.findIndex(c => c.id === currentBuilderCycle.id);
  if (existingIdx >= 0) {
    allCycles[existingIdx] = currentBuilderCycle;
  } else {
    allCycles.push(currentBuilderCycle);
  }

  await persistCycles();
  showToast(`Saved cycle: ${name}`, 'success');
  closeCycleBuilder();
}

async function startCycleFromBuilder() {
  if (!currentBuilderCycle) return;

  const name = document.getElementById('builder-cycle-name').value.trim();
  if (!name) {
    showToast('Please enter a cycle name', 'error');
    return;
  }

  currentBuilderCycle.name = name;
  currentBuilderCycle.notes = document.getElementById('builder-cycle-notes').value.trim();

  if (currentBuilderCycle.entries.length === 0) {
    showToast('Add at least one compound', 'error');
    return;
  }

  for (const entry of currentBuilderCycle.entries) {
    if (!entry.dose || entry.dose <= 0) {
      showToast(`Set a dose for ${entry.compoundName}`, 'error');
      return;
    }
  }

  // Use the builder's start date, or default to today
  const startDateInput = document.getElementById('builder-cycle-start-date').value;
  if (startDateInput) {
    currentBuilderCycle.startDate = startDateInput;
  } else {
    currentBuilderCycle.startDate = toLocalDateStr(new Date());
  }
  currentBuilderCycle.status = 'active';

  // Generate scheduled doses
  currentBuilderCycle.scheduledDoses = generateSchedule(currentBuilderCycle);

  // Save
  const existingIdx = allCycles.findIndex(c => c.id === currentBuilderCycle.id);
  if (existingIdx >= 0) {
    allCycles[existingIdx] = currentBuilderCycle;
  } else {
    allCycles.push(currentBuilderCycle);
  }

  await persistCycles();
  showToast(`Started cycle: ${name}`, 'success');
  currentBuilderCycle = null;
  openCycleDetail(allCycles[allCycles.length - 1].id);
}

async function saveActiveCycleEdits() {
  if (!currentBuilderCycle) return;

  const name = document.getElementById('builder-cycle-name').value.trim();
  if (!name) {
    showToast('Please enter a cycle name', 'error');
    return;
  }

  currentBuilderCycle.name = name;
  currentBuilderCycle.notes = document.getElementById('builder-cycle-notes').value.trim();
  currentBuilderCycle.startDate = document.getElementById('builder-cycle-start-date').value || currentBuilderCycle.startDate;

  if (currentBuilderCycle.entries.length === 0) {
    showToast('Add at least one compound', 'error');
    return;
  }

  for (const entry of currentBuilderCycle.entries) {
    if (!entry.dose || entry.dose <= 0) {
      showToast(`Set a dose for ${entry.compoundName}`, 'error');
      return;
    }
  }

  // Find the original cycle to get existing scheduled doses
  const existingIdx = allCycles.findIndex(c => c.id === currentBuilderCycle.id);
  if (existingIdx < 0) return;

  const oldCycle = allCycles[existingIdx];
  const oldDoses = oldCycle.scheduledDoses || [];

  // Preserve doses that have already been taken or skipped
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const preservedDoses = oldDoses.filter(d => d.status === 'taken' || d.status === 'skipped');

  // Generate a fresh schedule from the updated entries
  const newSchedule = generateSchedule(currentBuilderCycle);

  // Filter new schedule to only include future doses (from today onward)
  const futureDoses = newSchedule.filter(d => {
    const doseDate = new Date(d.scheduledAt);
    doseDate.setHours(0, 0, 0, 0);
    return doseDate >= now;
  });

  // Merge: preserved past doses + new future doses
  currentBuilderCycle.scheduledDoses = [...preservedDoses, ...futureDoses];
  currentBuilderCycle.scheduledDoses.sort((a, b) =>
    new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  // Save
  allCycles[existingIdx] = currentBuilderCycle;
  const cycleId = currentBuilderCycle.id;

  await persistCycles();
  showToast(`Updated cycle: ${name}`, 'success');
  currentBuilderCycle = null;
  openCycleDetail(cycleId);
}

// ═══════════════════════════════════════
// SCHEDULE GENERATION
// ═══════════════════════════════════════

function generateSchedule(cycle) {
  const doses = [];
  const dateStr = cycle.startDate || toLocalDateStr(new Date());
  const startDate = new Date(dateStr + (dateStr.includes('T') ? '' : 'T00:00:00'));
  startDate.setHours(0, 0, 0, 0);

  for (const entry of cycle.entries) {
    const entryDoses = generateEntryDoses(entry, startDate);
    doses.push(...entryDoses);
  }

  // Sort by scheduledAt
  doses.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  return doses;
}

function generateEntryDoses(entry, cycleStart) {
  const doses = [];
  const dayMs = 24 * 60 * 60 * 1000;

  // Calculate the entry's start day offset from cycle start
  const entryDayOffset = getEntryDayOffset(entry, cycleStart);
  const startMs = cycleStart.getTime();

  for (let day = 0; day < entry.durationDays; day++) {
    // Check on/off cycling
    if (entry.onDays && entry.offDays) {
      const cycleLength = entry.onDays + entry.offDays;
      const posInCycle = day % cycleLength;
      if (posInCycle >= entry.onDays) continue; // off day
    }

    // Calculate the absolute date for this day
    const absoluteDayOffset = entryDayOffset + day;
    const absoluteDate = new Date(startMs + absoluteDayOffset * dayMs);

    // Check frequency (pass absolute date for weekday-based frequencies)
    if (!isDoseDay(entry, day, absoluteDate)) continue;

    // Get dose times for this day
    const times = getDoseTimesForDay(entry.frequency);
    for (const [hours, minutes] of times) {
      const doseDate = new Date(startMs + absoluteDayOffset * dayMs);
      doseDate.setHours(hours, minutes, 0, 0);

      doses.push({
        id: generateId(),
        entryId: entry.id,
        compoundName: entry.compoundName,
        compoundId: entry.compoundId,
        dose: entry.dose,
        unit: entry.unit,
        route: entry.route,
        scheduledAt: doseDate.toISOString(),
        status: 'pending',
        loggedDoseId: null,
        halfLifeHours: entry.halfLifeHours,
        color: entry.color,
        category: entry.category
      });
    }
  }

  return doses;
}

function isDoseDay(entry, relativeDayFromEntryStart, absoluteDate) {
  switch (entry.frequency) {
    case 'daily':
    case '2x_daily':
      return true;
    case 'eod':
      return relativeDayFromEntryStart % 2 === 0;
    case 'weekly':
      return relativeDayFromEntryStart % 7 === 0;
    case '3x_weekly': {
      const dayOfWeek = relativeDayFromEntryStart % 7;
      return dayOfWeek === 0 || dayOfWeek === 2 || dayOfWeek === 4;
    }
    case 'custom':
    case 'every_n_days':
      return (entry.customFreqDays && entry.customFreqDays > 0)
        ? relativeDayFromEntryStart % entry.customFreqDays === 0
        : true;
    case 'custom_days': {
      if (!entry.customDays || entry.customDays.length === 0) return false;
      if (!absoluteDate) return true; // fallback if no date provided
      const dow = absoluteDate.getDay(); // 0=Sun, 1=Mon, ...6=Sat
      return entry.customDays.includes(dow);
    }
    default:
      return true;
  }
}

function getDoseTimesForDay(frequency) {
  switch (frequency) {
    case '2x_daily': return [[8, 0], [20, 0]];
    default: return [[8, 0]];
  }
}

// ═══════════════════════════════════════
// CYCLE DETAIL / TIMELINE VIEW
// ═══════════════════════════════════════

function openCycleDetail(cycleId) {
  currentDetailCycleId = cycleId;

  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('view-cycle-detail').classList.add('active');
  document.querySelector('.nav-btn[data-view="cycles"]').classList.add('active');

  renderCycleDetail();
}

function closeCycleDetail() {
  currentDetailCycleId = null;
  switchView('cycles');
}

function renderCycleDetail() {
  const cycle = allCycles.find(c => c.id === currentDetailCycleId);
  if (!cycle) return;

  const st = CYCLE_STATUS_COLORS[cycle.status] || CYCLE_STATUS_COLORS.planned;

  // Header
  document.getElementById('cycle-detail-name').innerHTML = `
    ${escapeHtml(cycle.name)}
    <span class="cycle-status-badge" style="background:${st.bg};color:${st.color}">${st.label}</span>`;

  // Action buttons
  const actionsContainer = document.getElementById('cycle-detail-actions');
  let actionBtns = '';

  if (cycle.status === 'planned') {
    actionBtns = `
      <button class="btn btn-primary btn-small" onclick="startPlannedCycle('${cycle.id}')">Start Cycle</button>
      <button class="btn btn-secondary btn-small" onclick="openCycleBuilder('${cycle.id}')">Edit</button>
      <button class="btn btn-danger btn-small" onclick="deleteCycle('${cycle.id}')">Delete</button>`;
  } else if (cycle.status === 'active') {
    actionBtns = `
      <button class="btn btn-secondary btn-small" onclick="openCycleBuilder('${cycle.id}')">Edit</button>
      <button class="btn btn-secondary btn-small" onclick="pauseCycle('${cycle.id}')">Pause</button>
      <button class="btn btn-secondary btn-small" onclick="completeCycle('${cycle.id}')">Complete</button>`;
  } else if (cycle.status === 'paused') {
    actionBtns = `
      <button class="btn btn-secondary btn-small" onclick="openCycleBuilder('${cycle.id}')">Edit</button>
      <button class="btn btn-primary btn-small" onclick="resumeCycle('${cycle.id}')">Resume</button>
      <button class="btn btn-secondary btn-small" onclick="completeCycle('${cycle.id}')">Complete</button>`;
  } else if (cycle.status === 'completed') {
    actionBtns = `
      <button class="btn btn-danger btn-small" onclick="deleteCycle('${cycle.id}')">Delete</button>`;
  }
  actionsContainer.innerHTML = actionBtns;

  // Content area
  const content = document.getElementById('cycle-detail-content');

  // Tags display
  const detailTags = (cycle.tags || []);
  const detailTagsHtml = detailTags.length > 0
    ? `<div class="cycle-detail-tags">${detailTags.map(t =>
        `<span class="cycle-tag">${escapeHtml(t)}</span>`
      ).join('')}</div>`
    : '';

  if (cycle.status === 'planned') {
    // Show entries summary + timeline preview
    content.innerHTML = detailTagsHtml + renderPlannedCycleContent(cycle);
    return;
  }

  // Active/paused/completed: show adherence + timeline
  const adherence = getCycleAdherence(cycle);
  const pct = adherence.total > 0 ? Math.round((adherence.taken / adherence.total) * 100) : 0;

  content.innerHTML = `
    ${detailTagsHtml}
    <div class="cycle-adherence-stats">
      <div class="detail-stat-card">
        <span class="detail-stat-label">Total Doses</span>
        <span class="detail-stat-value">${(cycle.scheduledDoses || []).length}</span>
      </div>
      <div class="detail-stat-card">
        <span class="detail-stat-label">Taken</span>
        <span class="detail-stat-value accent-green">${adherence.taken}</span>
      </div>
      <div class="detail-stat-card">
        <span class="detail-stat-label">Skipped</span>
        <span class="detail-stat-value" style="color:var(--accent-red)">${adherence.skipped}</span>
      </div>
      <div class="detail-stat-card">
        <span class="detail-stat-label">Pending</span>
        <span class="detail-stat-value">${adherence.pending + adherence.future}</span>
      </div>
      <div class="detail-stat-card">
        <span class="detail-stat-label">Adherence</span>
        <span class="detail-stat-value" style="color:${pct >= 80 ? 'var(--accent-green)' : pct >= 50 ? 'var(--accent-gold)' : 'var(--accent-red)'}">${pct}%</span>
      </div>
    </div>
    ${renderCycleTimeline(cycle)}
    ${renderCycleCompoundSummary(cycle)}`;
}

function renderPlannedCycleContent(cycle) {
  const entries = cycle.entries;
  if (entries.length === 0) return '<div class="empty-state"><p>No compounds in this cycle.</p></div>';

  const totalDays = getTotalCycleDays(cycle);
  const cycleStart = getCycleStartDate(cycle);
  const entryCards = entries.map(e => {
    const freqStr = getFreqShortLabel(e);
    const onOffStr = (e.onDays && e.offDays) ? ` (${e.onDays} on / ${e.offDays} off)` : '';
    let durationStr;
    if (e.startDate) {
      const start = new Date(e.startDate + 'T00:00:00');
      const end = new Date(start.getTime() + e.durationDays * 24 * 60 * 60 * 1000);
      const fmt = { month: 'short', day: 'numeric' };
      durationStr = `${start.toLocaleDateString(undefined, fmt)} – ${end.toLocaleDateString(undefined, fmt)}`;
    } else {
      const offset = e.startDay || 0;
      durationStr = `Day ${offset} – ${offset + e.durationDays}`;
    }
    return `
      <div class="cycle-summary-entry">
        <span class="color-dot" style="background:${e.color}"></span>
        <span class="cycle-summary-name">${escapeHtml(e.compoundName)}</span>
        <span class="cycle-summary-dose">${e.dose} ${e.unit}</span>
        <span class="cycle-summary-freq">${freqStr}${onOffStr}</span>
        <span class="cycle-summary-duration">${durationStr}</span>
      </div>`;
  }).join('');

  // Build timeline bars
  let timelineBars = '';
  if (totalDays > 0) {
    const markerInterval = totalDays <= 30 ? 7 : totalDays <= 90 ? 14 : 30;
    let markers = '';
    for (let d = 0; d <= totalDays; d += markerInterval) {
      const pct = (d / totalDays) * 100;
      let label = `D${d}`;
      if (cycleStart) {
        const markerDate = new Date(cycleStart.getTime() + d * 24 * 60 * 60 * 1000);
        label = markerDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      }
      markers += `<span class="timeline-marker" style="left:${pct}%">${label}</span>`;
    }

    const bars = entries.map(e => {
      const dayOffset = cycleStart ? getEntryDayOffset(e, cycleStart) : (e.startDay || 0);
      const startPct = (dayOffset / totalDays) * 100;
      const widthPct = (e.durationDays / totalDays) * 100;
      return `
        <div class="timeline-row">
          <span class="timeline-label">${escapeHtml(e.compoundName)}</span>
          <div class="timeline-track">
            <div class="timeline-bar" style="left:${startPct}%;width:${widthPct}%;background:${e.color || '#4361ee'}">
              <span class="timeline-bar-label">${e.durationDays}d</span>
            </div>
          </div>
        </div>`;
    }).join('');

    timelineBars = `
      <div class="detail-section" style="margin-top:20px">
        <h3 class="detail-section-title">Timeline</h3>
        <div class="timeline-chart">
          <div class="timeline-markers">${markers}</div>
          ${bars}
        </div>
      </div>`;
  }

  return `
    <div class="detail-section">
      <h3 class="detail-section-title">Compounds</h3>
      <div class="cycle-summary-entries">${entryCards}</div>
    </div>
    ${timelineBars}
    ${cycle.notes ? `<div class="detail-section"><h3 class="detail-section-title">Notes</h3><p class="library-notes-text">${escapeHtml(cycle.notes)}</p></div>` : ''}`;
}

function renderCycleTimeline(cycle) {
  const scheduled = cycle.scheduledDoses || [];
  if (scheduled.length === 0) return '';

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  // Group by date
  const byDate = {};
  for (const dose of scheduled) {
    const d = new Date(dose.scheduledAt);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    if (!byDate[key]) byDate[key] = [];
    byDate[key].push(dose);
  }

  const dateKeys = Object.keys(byDate).sort();

  // Find today's index to scroll to
  const todayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const rows = dateKeys.map(key => {
    const dayDoses = byDate[key];
    const dateObj = new Date(key + 'T00:00:00');
    const isToday = key === todayKey;
    const isPast = dateObj < today;
    const dayLabel = dateObj.toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });

    const pills = dayDoses.map(dose => {
      let pillClass = 'dose-pill';
      if (dose.status === 'taken') pillClass += ' taken';
      else if (dose.status === 'skipped') pillClass += ' skipped';
      else if (isToday) pillClass += ' today';
      else if (isPast) pillClass += ' overdue';

      const timeStr = new Date(dose.scheduledAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });

      let action = '';
      if (dose.status === 'pending' && (isToday || isPast)) {
        action = `
          <button class="btn btn-primary btn-small dose-pill-log" onclick="event.stopPropagation(); logScheduledDose('${cycle.id}','${dose.id}')">Log</button>
          <button class="btn btn-secondary btn-small dose-pill-skip" onclick="event.stopPropagation(); skipScheduledDose('${cycle.id}','${dose.id}')">Skip</button>`;
      }

      return `
        <div class="${pillClass}" style="border-left-color:${dose.color}">
          <span class="dose-pill-name">${escapeHtml(dose.compoundName)}</span>
          <span class="dose-pill-info">${dose.dose} ${dose.unit} @ ${timeStr}</span>
          <span class="dose-pill-status">${dose.status === 'taken' ? 'Logged' : dose.status === 'skipped' ? 'Skipped' : ''}</span>
          ${action}
        </div>`;
    }).join('');

    return `
      <div class="timeline-day ${isToday ? 'is-today' : ''}" ${isToday ? 'id="cycle-today"' : ''}>
        <div class="timeline-day-label">${dayLabel}${isToday ? ' <span class="today-badge">Today</span>' : ''}</div>
        <div class="timeline-day-doses">${pills}</div>
      </div>`;
  }).join('');

  return `
    <div class="detail-section">
      <h3 class="detail-section-title">Schedule</h3>
      <div class="cycle-timeline-scroll" id="cycle-timeline-scroll">
        ${rows}
      </div>
    </div>`;
}

function renderCycleCompoundSummary(cycle) {
  const scheduled = cycle.scheduledDoses || [];
  if (scheduled.length === 0) return '';

  // Group by compound
  const byCompound = {};
  for (const dose of scheduled) {
    if (!byCompound[dose.compoundName]) {
      byCompound[dose.compoundName] = { color: dose.color, total: 0, taken: 0, unit: dose.unit, doseAmount: dose.dose };
    }
    byCompound[dose.compoundName].total++;
    if (dose.status === 'taken') byCompound[dose.compoundName].taken++;
  }

  const cards = Object.entries(byCompound).map(([name, data]) => {
    const pct = data.total > 0 ? Math.round((data.taken / data.total) * 100) : 0;
    return `
      <div class="cycle-compound-stat">
        <span class="color-dot" style="background:${data.color}"></span>
        <span class="cycle-compound-stat-name">${escapeHtml(name)}</span>
        <span class="cycle-compound-stat-dose">${data.doseAmount} ${data.unit}</span>
        <span class="cycle-compound-stat-adherence">${data.taken}/${data.total} (${pct}%)</span>
      </div>`;
  }).join('');

  return `
    <div class="detail-section">
      <h3 class="detail-section-title">Per-Compound Summary</h3>
      <div class="cycle-compound-stats">${cards}</div>
    </div>`;
}

// ═══════════════════════════════════════
// CYCLE ACTIONS
// ═══════════════════════════════════════

async function startPlannedCycle(cycleId) {
  const cycle = allCycles.find(c => c.id === cycleId);
  if (!cycle || cycle.status !== 'planned') return;

  // Use planned start date or today if not set
  if (!cycle.startDate) {
    cycle.startDate = toLocalDateStr(new Date());
  }
  cycle.status = 'active';
  cycle.scheduledDoses = generateSchedule(cycle);

  await persistCycles();
  showToast(`Started: ${cycle.name}`, 'success');
  renderCycleDetail();
}

async function pauseCycle(cycleId) {
  const cycle = allCycles.find(c => c.id === cycleId);
  if (!cycle) return;
  cycle.status = 'paused';
  await persistCycles();
  showToast(`Paused: ${cycle.name}`, 'success');
  renderCycleDetail();
}

async function resumeCycle(cycleId) {
  const cycle = allCycles.find(c => c.id === cycleId);
  if (!cycle) return;
  cycle.status = 'active';
  await persistCycles();
  showToast(`Resumed: ${cycle.name}`, 'success');
  renderCycleDetail();
}

async function completeCycle(cycleId) {
  const cycle = allCycles.find(c => c.id === cycleId);
  if (!cycle) return;

  // Mark remaining pending past doses as skipped
  const now = Date.now();
  for (const dose of (cycle.scheduledDoses || [])) {
    if (dose.status === 'pending' && new Date(dose.scheduledAt).getTime() <= now) {
      dose.status = 'skipped';
    }
  }

  cycle.status = 'completed';
  await persistCycles();
  showToast(`Completed: ${cycle.name}`, 'success');
  renderCycleDetail();
}

async function deleteCycle(cycleId) {
  allCycles = allCycles.filter(c => c.id !== cycleId);
  await persistCycles();
  showToast('Cycle deleted', 'success');
  closeCycleDetail();
}

// ═══════════════════════════════════════
// DOSE LOGGING FROM CYCLE
// ═══════════════════════════════════════

async function logScheduledDose(cycleId, scheduledDoseId) {
  const cycle = allCycles.find(c => c.id === cycleId);
  if (!cycle) return;

  const scheduledDose = (cycle.scheduledDoses || []).find(d => d.id === scheduledDoseId);
  if (!scheduledDose || scheduledDose.status !== 'pending') return;

  // Create actual dose record
  const doseRecord = {
    id: generateId(),
    compoundId: scheduledDose.compoundId,
    compoundName: scheduledDose.compoundName,
    category: scheduledDose.category,
    amount: scheduledDose.dose,
    unit: scheduledDose.unit,
    route: scheduledDose.route,
    location: '',
    administeredAt: new Date().toISOString(),
    halfLifeHours: scheduledDose.halfLifeHours,
    color: scheduledDose.color,
    notes: `[Cycle: ${cycle.name}]`
  };

  await window.api.addDose(doseRecord);

  // Mark scheduled dose as taken
  scheduledDose.status = 'taken';
  scheduledDose.loggedDoseId = doseRecord.id;

  await persistCycles();
  showToast(`Logged ${scheduledDose.dose} ${scheduledDose.unit} ${scheduledDose.compoundName}`, 'success');

  // Re-render
  if (currentDetailCycleId === cycleId) {
    renderCycleDetail();
  }
}

async function skipScheduledDose(cycleId, scheduledDoseId) {
  const cycle = allCycles.find(c => c.id === cycleId);
  if (!cycle) return;

  const scheduledDose = (cycle.scheduledDoses || []).find(d => d.id === scheduledDoseId);
  if (!scheduledDose || scheduledDose.status !== 'pending') return;

  scheduledDose.status = 'skipped';
  await persistCycles();
  showToast('Dose skipped', 'success');

  if (currentDetailCycleId === cycleId) {
    renderCycleDetail();
  }
}

// Mark scheduled dose as taken (used by dose-logger form when logging from cycle)
async function markScheduledDoseTaken(cycleId, scheduledDoseId) {
  const cycle = allCycles.find(c => c.id === cycleId);
  if (!cycle) return;

  const scheduledDose = (cycle.scheduledDoses || []).find(d => d.id === scheduledDoseId);
  if (!scheduledDose || scheduledDose.status !== 'pending') return;

  scheduledDose.status = 'taken';
  await persistCycles();

  if (currentDetailCycleId === cycleId) {
    renderCycleDetail();
  }
}

// ═══════════════════════════════════════
// DASHBOARD INTEGRATION - UPCOMING DOSES
// ═══════════════════════════════════════

function getUpcomingScheduledDoses(limit = 5) {
  const now = Date.now();
  const upcoming = [];

  for (const cycle of allCycles) {
    if (cycle.status !== 'active') continue;

    for (const dose of (cycle.scheduledDoses || [])) {
      if (dose.status !== 'pending') continue;
      const doseTime = new Date(dose.scheduledAt).getTime();
      // Show doses from past 24h (overdue) to next 48h
      if (doseTime >= now - 24 * 60 * 60 * 1000 && doseTime <= now + 48 * 60 * 60 * 1000) {
        upcoming.push({ ...dose, cycleName: cycle.name, cycleId: cycle.id });
      }
    }
  }

  upcoming.sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
  return upcoming.slice(0, limit);
}

function renderUpcomingDoses() {
  const container = document.getElementById('upcoming-doses-panel');
  if (!container) return;

  const upcoming = getUpcomingScheduledDoses();
  const plannedCycles = allCycles.filter(c => c.status === 'planned');
  const hasContent = upcoming.length > 0 || plannedCycles.length > 0;

  if (!hasContent) {
    container.style.display = 'none';
    return;
  }

  container.style.display = '';
  const now = Date.now();

  // Upcoming doses from active cycles
  let upcomingHtml = '';
  if (upcoming.length > 0) {
    const rows = upcoming.map(dose => {
      const doseTime = new Date(dose.scheduledAt).getTime();
      const isOverdue = doseTime < now;
      const timeStr = new Date(dose.scheduledAt).toLocaleString(undefined, {
        month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
      });

      return `
        <div class="upcoming-dose-row ${isOverdue ? 'overdue' : ''}">
          <span class="color-dot" style="background:${dose.color}"></span>
          <div class="upcoming-dose-info">
            <span class="upcoming-dose-name">${escapeHtml(dose.compoundName)}</span>
            <span class="upcoming-dose-meta">${dose.dose} ${dose.unit} &middot; ${timeStr}${isOverdue ? ' (overdue)' : ''}</span>
          </div>
          <button class="btn btn-primary btn-small" onclick="logScheduledDose('${dose.cycleId}','${dose.id}'); refreshDashboard();">Log</button>
        </div>`;
    }).join('');

    upcomingHtml = `
      <h3 class="section-title">Upcoming Doses</h3>
      <div class="upcoming-doses-list">${rows}</div>`;
  }

  // Planned cycles
  let plannedHtml = '';
  if (plannedCycles.length > 0) {
    const cards = plannedCycles.map(cycle => {
      const entryCount = cycle.entries.length;
      const totalDays = getTotalCycleDays(cycle);
      const startDateObj = cycle.startDate
        ? new Date(cycle.startDate + (cycle.startDate.includes('T') ? '' : 'T00:00:00'))
        : null;
      const startStr = startDateObj
        ? startDateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
        : 'No date set';

      // How soon does it start?
      let startsInStr = '';
      if (startDateObj) {
        const daysUntil = Math.ceil((startDateObj.getTime() - now) / (24 * 60 * 60 * 1000));
        if (daysUntil === 0) startsInStr = 'Starts today';
        else if (daysUntil === 1) startsInStr = 'Starts tomorrow';
        else if (daysUntil > 0) startsInStr = `Starts in ${daysUntil} days`;
        else startsInStr = `Start date passed`;
      }

      const pills = cycle.entries.slice(0, 3).map(e =>
        `<span class="cycle-compound-pill" style="border-color:${e.color || '#888'}">${escapeHtml(e.compoundName)}</span>`
      ).join('') + (entryCount > 3 ? `<span class="cycle-compound-pill more">+${entryCount - 3}</span>` : '');

      return `
        <div class="planned-cycle-card" onclick="openCycleDetail('${cycle.id}')">
          <div class="planned-cycle-header">
            <span class="planned-cycle-name">${escapeHtml(cycle.name)}</span>
            <span class="cycle-status-badge" style="background:rgba(67,97,238,0.15);color:#4361ee">Planned</span>
          </div>
          <div class="planned-cycle-meta">
            <span>${startStr}</span>
            <span>${totalDays} days</span>
            ${startsInStr ? `<span class="planned-cycle-countdown">${startsInStr}</span>` : ''}
          </div>
          <div class="planned-cycle-compounds">${pills}</div>
          <button class="btn btn-primary btn-small planned-cycle-start" onclick="event.stopPropagation(); startPlannedCycle('${cycle.id}'); refreshDashboard();">Start Cycle</button>
        </div>`;
    }).join('');

    plannedHtml = `
      ${upcoming.length > 0 ? '<div style="margin-top:16px"></div>' : ''}
      <h3 class="section-title">Planned Cycles</h3>
      <div class="planned-cycles-list">${cards}</div>`;
  }

  container.innerHTML = `
    ${upcomingHtml}
    ${plannedHtml}
    <button class="btn btn-secondary btn-small" style="margin-top:8px" onclick="switchView('cycles')">View All Cycles</button>`;
}

// ═══════════════════════════════════════
// DASHBOARD CYCLES PANEL (NEW 3-COL)
// ═══════════════════════════════════════

function renderDashboardCycles() {
  const cyclesContainer = document.getElementById('dashboard-cycles-panel');
  const dosingContainer = document.getElementById('dashboard-dosing-panel');

  const activeCycles = allCycles.filter(c => c.status === 'active');
  const pausedCycles = allCycles.filter(c => c.status === 'paused');
  const plannedCycles = allCycles.filter(c => c.status === 'planned');
  const runningCycles = [...activeCycles, ...pausedCycles];
  const now = new Date();

  // ── Cycles column ──
  if (cyclesContainer) {
    let cyclesHtml = '';

    if (runningCycles.length === 0 && plannedCycles.length === 0) {
      cyclesHtml = '<div class="empty-state" style="padding:16px;text-align:center">' +
        '<p style="font-size:13px;color:var(--text-muted)">No active or planned cycles.</p>' +
        '<button class="btn btn-secondary btn-small" onclick="switchView(\'cycles\')">Create a Cycle</button></div>';
    } else {
      for (const cycle of runningCycles) {
        const st = CYCLE_STATUS_COLORS[cycle.status];
        const cycleStart = getCycleStartDate(cycle);
        let dayOfCycle = '?';
        if (cycleStart) {
          dayOfCycle = Math.floor((now.getTime() - cycleStart.getTime()) / (24 * 60 * 60 * 1000)) + 1;
          if (dayOfCycle < 1) dayOfCycle = 1;
        }
        const totalDays = getTotalCycleDays(cycle);
        const dayPct = totalDays > 0 ? Math.min(100, Math.round((dayOfCycle / totalDays) * 100)) : 0;

        // Adherence
        const adherence = getCycleAdherence(cycle);
        const compliancePct = adherence.total > 0 ? Math.round((adherence.taken / adherence.total) * 100) : 100;
        const complianceClass = compliancePct >= 80 ? 'green' : compliancePct >= 50 ? 'orange' : 'red';

        // Next dose & overdue count
        const scheduled = cycle.scheduledDoses || [];
        const futurePending = scheduled
          .filter(d => d.status === 'pending' && new Date(d.scheduledAt).getTime() > now.getTime())
          .sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
        const overdueDoses = scheduled.filter(d => d.status === 'pending' && new Date(d.scheduledAt).getTime() <= now.getTime());

        let nextDoseStr = 'None scheduled';
        if (futurePending.length > 0) {
          const next = futurePending[0];
          const diffMs = new Date(next.scheduledAt).getTime() - now.getTime();
          const diffH = Math.round(diffMs / (60 * 60 * 1000));
          const diffM = Math.round(diffMs / (60 * 1000));
          const timeStr = diffH >= 1 ? diffH + 'h' : diffM + 'm';
          nextDoseStr = escapeHtml(next.compoundName) + ' in ' + timeStr;
        }

        // Compound color dots
        let compoundsHtml = '';
        for (const e of cycle.entries) {
          compoundsHtml += '<span class="dash-cycle-compound">';
          compoundsHtml += '<span class="color-dot" style="background:' + (e.color || '#888') + '"></span>';
          compoundsHtml += escapeHtml(e.compoundName);
          compoundsHtml += '</span>';
        }

        // Build card
        cyclesHtml += '<div class="dash-cycle-card" onclick="openCycleDetail(\'' + cycle.id + '\')">';

        // Header
        cyclesHtml += '<div class="dash-cycle-header">';
        cyclesHtml += '<span class="dash-cycle-name">' + escapeHtml(cycle.name) + '</span>';
        cyclesHtml += '<span class="cycle-status-badge" style="background:' + st.bg + ';color:' + st.color + '">' + st.label + '</span>';
        cyclesHtml += '</div>';

        // Stats grid (2x2)
        cyclesHtml += '<div class="dash-cycle-stats">';
        cyclesHtml += '<div class="stat"><span class="stat-label">Progress</span><span class="stat-value">Day ' + dayOfCycle + '/' + totalDays + '</span></div>';
        cyclesHtml += '<div class="stat"><span class="stat-label">Compliance</span><span class="stat-value compliance-value ' + complianceClass + '">' + compliancePct + '%</span></div>';
        cyclesHtml += '<div class="stat"><span class="stat-label">Doses</span><span class="stat-value">' + adherence.taken + ' / ' + adherence.total + '</span></div>';
        cyclesHtml += '<div class="stat"><span class="stat-label">Next Dose</span><span class="stat-value" style="font-size:12px">' + nextDoseStr + '</span></div>';
        cyclesHtml += '</div>';

        // Overdue warning
        if (overdueDoses.length > 0) {
          cyclesHtml += '<span class="dash-cycle-overdue">' + overdueDoses.length + ' overdue</span>';
        }

        // Compound list
        if (compoundsHtml) {
          cyclesHtml += '<div class="dash-cycle-compounds">' + compoundsHtml + '</div>';
        }

        // Progress bar
        cyclesHtml += '<div class="dash-cycle-progress-bar">';
        cyclesHtml += '<div class="dash-cycle-progress-fill" style="width:' + dayPct + '%;background:' + st.color + '"></div>';
        cyclesHtml += '</div>';

        cyclesHtml += '</div>';
      }

      for (const cycle of plannedCycles) {
        const st = CYCLE_STATUS_COLORS[cycle.status];
        const startDateObj = cycle.startDate
          ? new Date(cycle.startDate + (cycle.startDate.includes('T') ? '' : 'T00:00:00'))
          : null;
        let startsInStr = '';
        if (startDateObj) {
          const daysUntil = Math.ceil((startDateObj.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          if (daysUntil === 0) startsInStr = 'Starts today';
          else if (daysUntil === 1) startsInStr = 'Starts tomorrow';
          else if (daysUntil > 0) startsInStr = 'Starts in ' + daysUntil + ' days';
          else startsInStr = 'Start date passed';
        }

        // Compound color dots
        let compoundsHtml = '';
        for (const e of cycle.entries) {
          compoundsHtml += '<span class="dash-cycle-compound">';
          compoundsHtml += '<span class="color-dot" style="background:' + (e.color || '#888') + '"></span>';
          compoundsHtml += escapeHtml(e.compoundName);
          compoundsHtml += '</span>';
        }

        cyclesHtml += '<div class="dash-cycle-card planned" onclick="openCycleDetail(\'' + cycle.id + '\')">';
        cyclesHtml += '<div class="dash-cycle-header">';
        cyclesHtml += '<span class="dash-cycle-name">' + escapeHtml(cycle.name) + '</span>';
        cyclesHtml += '<span class="cycle-status-badge" style="background:' + st.bg + ';color:' + st.color + '">' + st.label + '</span>';
        cyclesHtml += '</div>';
        if (startsInStr) cyclesHtml += '<div class="dash-cycle-countdown">' + startsInStr + '</div>';
        if (compoundsHtml) cyclesHtml += '<div class="dash-cycle-compounds">' + compoundsHtml + '</div>';
        cyclesHtml += '</div>';
      }

      cyclesHtml += '<button class="btn btn-secondary btn-small" style="margin-top:4px;align-self:flex-start" onclick="switchView(\'cycles\')">View All Cycles</button>';
    }

    cyclesContainer.innerHTML = cyclesHtml;
  }

  // ── Dosing column ──
  if (dosingContainer) {
    if (runningCycles.length === 0) {
      dosingContainer.innerHTML = '<div class="empty-state" style="padding:16px;text-align:center">' +
        '<p style="font-size:13px;color:var(--text-muted)">No scheduled doses.</p></div>';
      return;
    }

    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const dayBuckets = { yesterday: [], today: [], tomorrow: [] };
    for (const cycle of runningCycles) {
      for (const dose of (cycle.scheduledDoses || [])) {
        const dt = new Date(dose.scheduledAt);
        const doseDay = new Date(dt.getFullYear(), dt.getMonth(), dt.getDate());
        const bucket = doseDay.getTime() === yesterday.getTime() ? 'yesterday'
          : doseDay.getTime() === today.getTime() ? 'today'
          : doseDay.getTime() === tomorrow.getTime() ? 'tomorrow'
          : null;
        if (bucket) {
          dayBuckets[bucket].push({ ...dose, cycleName: cycle.name, cycleId: cycle.id });
        }
      }
    }

    for (const key of Object.keys(dayBuckets)) {
      dayBuckets[key].sort((a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime());
    }

    let dosingHtml = '';
    const sections = [
      { key: 'yesterday', label: 'Yesterday', date: yesterday },
      { key: 'today', label: 'Today', date: today },
      { key: 'tomorrow', label: 'Tomorrow', date: tomorrow }
    ];

    for (const section of sections) {
      const doses = dayBuckets[section.key];
      const dateStr = section.date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      const isToday = section.key === 'today';

      dosingHtml += '<div class="dose-log-section' + (isToday ? ' dose-log-today' : '') + '">';
      dosingHtml += '<div class="dose-log-day-header">';
      dosingHtml += '<span class="dose-log-day-label">' + section.label + '</span>';
      dosingHtml += '<span class="dose-log-day-date">' + dateStr + '</span>';
      dosingHtml += '</div>';

      if (doses.length === 0) {
        dosingHtml += '<div class="dose-log-empty">No doses scheduled</div>';
      } else {
        for (const dose of doses) {
          const timeStr = new Date(dose.scheduledAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
          const isTaken = dose.status === 'taken';
          const isSkipped = dose.status === 'skipped';
          const isPending = dose.status === 'pending';
          const doseTime = new Date(dose.scheduledAt).getTime();
          const isOverdue = isPending && doseTime < now.getTime();
          const isFuture = section.key === 'tomorrow';

          let statusHtml = '';
          if (isTaken) {
            statusHtml = '<span class="dose-log-badge taken">Logged</span>';
          } else if (isSkipped) {
            statusHtml = '<span class="dose-log-badge skipped">Skipped</span>';
          } else if (isFuture) {
            statusHtml = '<span class="dose-log-badge planned">Planned</span>';
          } else if (isOverdue) {
            statusHtml = '<span class="dose-log-badge overdue">Overdue</span>';
          } else if (isPending) {
            statusHtml = '<span class="dose-log-badge due">Due</span>';
          }

          let actionHtml = '';
          if (isPending && !isFuture) {
            const safeCompound = escapeHtml(dose.compoundName).replace(/'/g, "\\'");
            const safeCycleName = escapeHtml(dose.cycleName).replace(/'/g, "\\'");
            actionHtml = '<button class="btn btn-primary btn-tiny" onclick="event.stopPropagation(); openLogDoseModalFromCycle(\'' + dose.cycleId + '\',\'' + dose.id + '\',\'' + safeCompound + '\',' + dose.dose + ',\'' + dose.unit + '\',\'' + (dose.route || 'subcutaneous') + '\',\'' + dose.scheduledAt + '\',\'' + safeCycleName + '\')">Log</button>';
          }

          dosingHtml += '<div class="dose-log-row' + (isTaken ? ' done' : '') + (isSkipped ? ' skipped' : '') + (isOverdue ? ' overdue' : '') + '">';
          dosingHtml += '<span class="dose-log-dot" style="background:' + (dose.color || '#888') + '"></span>';
          dosingHtml += '<div class="dose-log-info">';
          dosingHtml += '<span class="dose-log-name">' + escapeHtml(dose.compoundName) + '</span>';
          dosingHtml += '<span class="dose-log-detail">' + dose.dose + ' ' + dose.unit + ' &middot; ' + timeStr + '</span>';
          dosingHtml += '</div>';
          dosingHtml += statusHtml;
          dosingHtml += actionHtml;
          dosingHtml += '</div>';
        }
      }

      dosingHtml += '</div>';
    }

    dosingContainer.innerHTML = dosingHtml;
  }
}

// ═══════════════════════════════════════
// SCROLL TO TODAY
// ═══════════════════════════════════════

function scrollCycleToToday() {
  setTimeout(() => {
    const el = document.getElementById('cycle-today');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 100);
}

// ═══════════════════════════════════════
// EXPOSE TO GLOBAL SCOPE
// ═══════════════════════════════════════

function updateCycleStartDate(value) {
  if (!currentBuilderCycle) return;
  currentBuilderCycle.startDate = value;
  renderBuilderTimeline();
}

window.updateCycleStartDate = updateCycleStartDate;
window.toggleBuilderTag = toggleBuilderTag;
window.toggleBuilderWeekday = toggleBuilderWeekday;
window.openCycleBuilder = openCycleBuilder;
window.closeCycleBuilder = closeCycleBuilder;
window.addBuilderEntry = addBuilderEntry;
window.removeBuilderEntry = removeBuilderEntry;
window.updateBuilderEntry = updateBuilderEntry;
window.toggleOnOff = toggleOnOff;
window.confirmAddCompound = confirmAddCompound;
window.closeCycleCompoundPicker = closeCycleCompoundPicker;
window.saveCycleAsPlan = saveCycleAsPlan;
window.startCycleFromBuilder = startCycleFromBuilder;
window.saveActiveCycleEdits = saveActiveCycleEdits;
window.openCycleDetail = openCycleDetail;
window.closeCycleDetail = closeCycleDetail;
window.startPlannedCycle = startPlannedCycle;
window.pauseCycle = pauseCycle;
window.resumeCycle = resumeCycle;
window.completeCycle = completeCycle;
window.deleteCycle = deleteCycle;
window.logScheduledDose = logScheduledDose;
window.skipScheduledDose = skipScheduledDose;
window.markScheduledDoseTaken = markScheduledDoseTaken;
window.renderDashboardCycles = renderDashboardCycles;
