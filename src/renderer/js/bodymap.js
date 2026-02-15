// Injection Site Rotation Tracker
// Shows all injection sites with usage counts and rotation status

// Status thresholds based on days since last use and 7-day count
// PRIME = never used or 7+ days since last use, 0 uses in 7d
// READY = 3-7 days since last use, <=1 use in 7d
// RESTING = 1-3 days since last use, 2-3 uses in 7d
// AVOID = used in last 24h or 4+ uses in 7d
function getSiteStatus(daysSinceLast, count7d) {
  if (count7d === 0) return 'prime';
  if (count7d >= 4) return 'avoid';
  if (daysSinceLast !== null && daysSinceLast < 1) return 'avoid';
  if (count7d >= 2 || (daysSinceLast !== null && daysSinceLast < 3)) return 'resting';
  return 'ready';
}

const SITE_STATUS_CONFIG = {
  prime:   { label: 'PRIME',   color: '#00e676', bg: 'rgba(0, 230, 118, 0.15)' },
  ready:   { label: 'READY',   color: '#ffd54f', bg: 'rgba(255, 213, 79, 0.15)' },
  resting: { label: 'RESTING', color: '#ff9800', bg: 'rgba(255, 152, 0, 0.15)' },
  avoid:   { label: 'AVOID',   color: '#ff5252', bg: 'rgba(255, 82, 82, 0.15)' }
};

function createBodyMapSVG() {
  // Return an empty container - content will be populated by updateBodyMapHeatmap
  return '<div id="site-rotation-table" class="site-rotation-table"></div>';
}

function updateBodyMapHeatmap(doses) {
  const container = document.getElementById('site-rotation-table');
  if (!container) return;

  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;

  // Calculate per-site stats (only enabled sites)
  const activeSites = getEnabledSiteIds();
  const siteData = {};
  for (const siteId of activeSites) {
    siteData[siteId] = { count7d: 0, lastUsed: null };
  }

  for (const dose of doses) {
    if (!dose.location) continue;
    if (!siteData[dose.location]) continue;
    const doseTime = new Date(dose.administeredAt).getTime();

    // 7-day count
    if (doseTime >= sevenDaysAgo) {
      siteData[dose.location].count7d++;
    }

    // Track most recent use (all time)
    if (siteData[dose.location].lastUsed === null || doseTime > siteData[dose.location].lastUsed) {
      siteData[dose.location].lastUsed = doseTime;
    }
  }

  // Build sorted site list: sort by status priority (prime first), then by name
  const statusPriority = { prime: 0, ready: 1, resting: 2, avoid: 3 };

  const masterLookup = {};
  for (const s of MASTER_INJECTION_SITES) masterLookup[s.id] = s;

  const sites = activeSites.map(siteId => {
    const data = siteData[siteId];
    const daysSinceLast = data.lastUsed !== null
      ? (now - data.lastUsed) / (24 * 60 * 60 * 1000)
      : null;
    const status = getSiteStatus(daysSinceLast, data.count7d);
    const label = formatLocationName(siteId);
    const route = masterLookup[siteId] ? masterLookup[siteId].route : '';

    return {
      siteId: siteId,
      label: label,
      route: route,
      count7d: data.count7d,
      daysSinceLast: daysSinceLast,
      status: status,
      lastUsed: data.lastUsed
    };
  });

  // Sort: avoid first (most important to know), then resting, ready, prime
  // Within same status, sort by count descending
  sites.sort((a, b) => {
    const pa = statusPriority[a.status];
    const pb = statusPriority[b.status];
    if (pa !== pb) return pa - pb;
    return b.count7d - a.count7d;
  });

  // Status summary counts
  const statusCounts = { prime: 0, ready: 0, resting: 0, avoid: 0 };
  for (const site of sites) {
    statusCounts[site.status]++;
  }

  let html = '';

  // Summary bar
  html += '<div class="site-summary-bar">';
  Object.entries(SITE_STATUS_CONFIG).forEach(function(entry) {
    var key = entry[0];
    var cfg = entry[1];
    html += '<span class="site-summary-item" style="color:' + cfg.color + '">';
    html += '<span class="site-summary-count">' + statusCounts[key] + '</span>';
    html += '<span class="site-summary-label">' + cfg.label + '</span>';
    html += '</span>';
  });
  html += '</div>';

  // Group sites by body region
  const REGION_ORDER = ['Upper Body', 'Core / Torso', 'Lower Body'];
  const grouped = {};
  for (const site of sites) {
    const masterSite = masterLookup[site.siteId];
    const group = masterSite ? masterSite.group : 'Other';
    if (!grouped[group]) grouped[group] = [];
    grouped[group].push(site);
  }

  html += '<div class="site-rotation-header">';
  html += '<span class="site-rotation-col-name">Site Location</span>';
  html += '<span class="site-rotation-col-usage">7D</span>';
  html += '<span class="site-rotation-col-status">Status</span>';
  html += '</div>';

  html += '<div class="site-rotation-body">';
  for (const regionName of REGION_ORDER) {
    const regionSites = grouped[regionName];
    if (!regionSites || regionSites.length === 0) continue;

    const hasAvoid = regionSites.some(s => s.status === 'avoid');

    html += '<div class="site-region-group">';
    html += '<div class="site-region-header" onclick="toggleSiteRegion(this)">';
    html += '<span class="site-region-name">' + regionName + ' <span class="site-region-count">(' + regionSites.length + ')</span>';
    if (hasAvoid) html += ' <span class="site-region-avoid-badge">AVOID</span>';
    html += '</span>';
    html += '<svg class="site-region-chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg>';
    html += '</div>';
    html += '<div class="site-region-body">';

    for (const site of regionSites) {
      const cfg = SITE_STATUS_CONFIG[site.status];

      html += '<div class="site-rotation-row">';
      html += '<span class="site-rotation-col-name">' + site.label + ' <span class="injection-site-route">' + site.route + '</span></span>';
      html += '<span class="site-rotation-col-usage">' + site.count7d + '</span>';
      html += '<span class="site-rotation-col-status">';
      html += '<span class="site-status-dot" style="background:' + cfg.color + '"></span>';
      html += '<span class="site-status-label" style="color:' + cfg.color + '">' + cfg.label + '</span>';
      html += '</span>';
      html += '</div>';
    }

    html += '</div>'; // site-region-body
    html += '</div>'; // site-region-group
  }
  html += '</div>';

  // Legend
  html += '<div class="site-rotation-legend">';
  Object.entries(SITE_STATUS_CONFIG).forEach(function(entry) {
    var key = entry[0];
    var cfg = entry[1];
    html += '<span class="site-rotation-legend-item">';
    html += '<span class="site-status-dot" style="background:' + cfg.color + '"></span>';
    html += cfg.label;
    html += '</span>';
  });
  html += '</div>';

  container.innerHTML = html;
}

function toggleSiteRegion(headerEl) {
  const group = headerEl.parentElement;
  group.classList.toggle('collapsed');
}

window.toggleSiteRegion = toggleSiteRegion;

// Keep these for backward compat (no longer needed for SVG body map)
function getHeatColor(intensity) {
  if (intensity < 0.25) return 'rgba(0, 230, 118, ' + (0.15 + intensity * 0.8) + ')';
  if (intensity < 0.5) return 'rgba(180, 230, 0, ' + (0.2 + intensity * 0.6) + ')';
  if (intensity < 0.75) return 'rgba(255, 165, 0, ' + (0.25 + intensity * 0.5) + ')';
  return 'rgba(255, 60, 60, ' + (0.3 + intensity * 0.5) + ')';
}

function showMapTooltip() {}
function hideMapTooltip() {}
