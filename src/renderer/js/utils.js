function generateId() {
  return crypto.randomUUID();
}

function formatRelativeTime(timestamp) {
  const now = Date.now();
  const diff = now - timestamp;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 30) return `${days}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function formatDuration(hours) {
  if (hours < 1) {
    const mins = Math.round(hours * 60);
    return `${mins} min`;
  }
  if (hours < 48) {
    return `${Math.round(hours * 10) / 10} hrs`;
  }
  const days = Math.round((hours / 24) * 10) / 10;
  return `${days} days`;
}

function halfLifeToHours(value, unit) {
  switch (unit) {
    case 'minutes': return value / 60;
    case 'hours': return value;
    case 'days': return value * 24;
    default: return value;
  }
}

function formatDateTime(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
}

function formatDateTimeShort(isoString) {
  const d = new Date(isoString);
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric',
    hour: 'numeric', minute: '2-digit'
  });
}

function toLocalDatetimeValue(date) {
  const d = date || new Date();
  const offset = d.getTimezoneOffset();
  const local = new Date(d.getTime() - offset * 60000);
  return local.toISOString().slice(0, 16);
}

function escapeHtml(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

// ═══════════════════════════════════════
// INJECTION SITES — MASTER LIST
// ═══════════════════════════════════════

const MASTER_INJECTION_SITES = [
  { id: 'left-delt',        label: 'L Delt',        group: 'Upper Body',    route: 'IM' },
  { id: 'right-delt',       label: 'R Delt',        group: 'Upper Body',    route: 'IM' },
  { id: 'left-pec',         label: 'L Pec',         group: 'Upper Body',    route: 'IM' },
  { id: 'right-pec',        label: 'R Pec',         group: 'Upper Body',    route: 'IM' },
  { id: 'left-tricep',      label: 'L Tricep',      group: 'Upper Body',    route: 'IM' },
  { id: 'right-tricep',     label: 'R Tricep',      group: 'Upper Body',    route: 'IM' },
  { id: 'left-bicep',       label: 'L Bicep',       group: 'Upper Body',    route: 'IM' },
  { id: 'right-bicep',      label: 'R Bicep',       group: 'Upper Body',    route: 'IM' },
  { id: 'abdomen-left',     label: 'Abdomen L',     group: 'Core / Torso',  route: 'SubQ' },
  { id: 'abdomen-right',    label: 'Abdomen R',     group: 'Core / Torso',  route: 'SubQ' },
  { id: 'love-handle-left', label: 'Love Handle L', group: 'Core / Torso',  route: 'SubQ' },
  { id: 'love-handle-right',label: 'Love Handle R', group: 'Core / Torso',  route: 'SubQ' },
  { id: 'lower-back',       label: 'Lower Back',    group: 'Core / Torso',  route: 'SubQ' },
  { id: 'left-glute',       label: 'L Glute',       group: 'Lower Body',    route: 'IM' },
  { id: 'right-glute',      label: 'R Glute',       group: 'Lower Body',    route: 'IM' },
  { id: 'left-vg',          label: 'L VG',          group: 'Lower Body',    route: 'IM' },
  { id: 'right-vg',         label: 'R VG',          group: 'Lower Body',    route: 'IM' },
  { id: 'left-quad',        label: 'L Quad',        group: 'Lower Body',    route: 'IM' },
  { id: 'right-quad',       label: 'R Quad',        group: 'Lower Body',    route: 'IM' },
  { id: 'left-lat',         label: 'L Lat',         group: 'Lower Body',    route: 'IM' },
  { id: 'right-lat',        label: 'R Lat',         group: 'Lower Body',    route: 'IM' },
  { id: 'left-calf',        label: 'L Calf',        group: 'Lower Body',    route: 'SubQ' },
  { id: 'right-calf',       label: 'R Calf',        group: 'Lower Body',    route: 'SubQ' },
];

let _enabledSiteIds = null; // null = all enabled

async function loadEnabledSites() {
  const settings = await window.api.getSettings();
  _enabledSiteIds = settings.enabledInjectionSites;
}

function getEnabledSites() {
  if (_enabledSiteIds === null) return MASTER_INJECTION_SITES;
  const enabledSet = new Set(_enabledSiteIds);
  return MASTER_INJECTION_SITES.filter(s => enabledSet.has(s.id));
}

function getEnabledSiteIds() {
  if (_enabledSiteIds === null) return MASTER_INJECTION_SITES.map(s => s.id);
  return _enabledSiteIds;
}

function setEnabledSiteIds(ids) {
  _enabledSiteIds = ids;
}

function populateLocationDropdown(selectElement, currentValue) {
  selectElement.innerHTML = '<option value="">N/A</option>';
  const enabledSites = getEnabledSites();
  const groups = {};
  for (const site of enabledSites) {
    if (!groups[site.group]) groups[site.group] = [];
    groups[site.group].push(site);
  }
  // If current value is a disabled site, add it as a special option
  const enabledIds = new Set(enabledSites.map(s => s.id));
  if (currentValue && !enabledIds.has(currentValue)) {
    const opt = document.createElement('option');
    opt.value = currentValue;
    opt.textContent = formatLocationName(currentValue) + ' (disabled)';
    selectElement.appendChild(opt);
  }
  for (const [groupName, sites] of Object.entries(groups)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = groupName;
    for (const site of sites) {
      const opt = document.createElement('option');
      opt.value = site.id;
      opt.textContent = site.label;
      optgroup.appendChild(opt);
    }
    selectElement.appendChild(optgroup);
  }
  if (currentValue) selectElement.value = currentValue;
}

// ═══════════════════════════════════════
// LOCATION LABELS (kept for historical dose display)
// ═══════════════════════════════════════

const LOCATION_LABELS = {
  'left-delt': 'L Delt',
  'right-delt': 'R Delt',
  'left-pec': 'L Pec',
  'right-pec': 'R Pec',
  'left-tricep': 'L Tricep',
  'right-tricep': 'R Tricep',
  'left-bicep': 'L Bicep',
  'right-bicep': 'R Bicep',
  'abdomen-left': 'Abdomen L',
  'abdomen-right': 'Abdomen R',
  'love-handle-left': 'Love Handle L',
  'love-handle-right': 'Love Handle R',
  'lower-back': 'Lower Back',
  'left-glute': 'L Glute',
  'right-glute': 'R Glute',
  'left-vg': 'L VG',
  'right-vg': 'R VG',
  'left-quad': 'L Quad',
  'right-quad': 'R Quad',
  'left-lat': 'L Lat',
  'right-lat': 'R Lat',
  'left-calf': 'L Calf',
  'right-calf': 'R Calf'
};

function formatLocationName(locationId) {
  return LOCATION_LABELS[locationId] || locationId;
}
