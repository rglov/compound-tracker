let dashboardRefreshTimer = null;
let currentRangeDays = 7;

// Calendar state
let calendarMonth = new Date().getMonth();
let calendarYear = new Date().getFullYear();

async function initDashboard() {
  initChart();
  setupRangeButtons();
  initBodyMap();
  await refreshDashboard();
  dashboardRefreshTimer = setInterval(refreshDashboard, 60000);
}

function initBodyMap() {
  const container = document.getElementById('body-map-container');
  if (container) {
    container.innerHTML = createBodyMapSVG();
  }
}

function setupRangeButtons() {
  document.querySelectorAll('.range-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const range = btn.dataset.range;
      currentRangeDays = range === 'all' ? 'all' : parseInt(range, 10);
      refreshDashboard();
    });
  });
}

async function refreshDashboard() {
  const doses = await window.api.getDoses();
  const now = Date.now();

  // Calculate chart time range
  let startTime, endTime;
  if (currentRangeDays === 'all') {
    if (doses.length === 0) {
      startTime = now - 7 * 24 * 60 * 60 * 1000;
      endTime = now + 24 * 60 * 60 * 1000;
    } else {
      const earliest = Math.min(...doses.map(d => new Date(d.administeredAt).getTime()));
      startTime = earliest - 12 * 60 * 60 * 1000;
      let latestActive = now;
      for (const dose of doses) {
        const clearTime = new Date(dose.administeredAt).getTime() + dose.halfLifeHours * 10 * 60 * 60 * 1000;
        if (clearTime > latestActive) latestActive = clearTime;
      }
      endTime = Math.min(latestActive, now + 30 * 24 * 60 * 60 * 1000);
    }
  } else {
    const rangeMs = currentRangeDays * 24 * 60 * 60 * 1000;
    startTime = now - rangeMs;
    endTime = now + rangeMs * 0.3;
  }

  // Generate chart data
  const seriesData = generateTimeSeriesData(doses, startTime, endTime);
  updateChart(seriesData, { min: startTime, max: endTime, rangeDays: currentRangeDays });
  renderChartToggles(seriesData);

  // Active compound cards
  const summaries = getActiveCompoundSummaries(doses, now);
  renderActiveCompounds(summaries);

  // Update body map heatmap
  updateBodyMapHeatmap(doses);

  // Calendar
  renderCalendar(doses);

  // Dashboard stats row
  renderDashboardStats(doses, summaries, now);

  // Dashboard cycles panel
  if (typeof renderDashboardCycles === 'function') {
    renderDashboardCycles();
  }
}

function renderActiveCompounds(summaries) {
  const grid = document.getElementById('active-compounds-grid');
  const empty = document.getElementById('dashboard-empty');

  if (summaries.length === 0) {
    if (empty) {
      grid.innerHTML = '';
      grid.appendChild(empty);
      empty.classList.remove('hidden');
    } else {
      grid.innerHTML = '<div class="empty-state"><p>No active compounds. Log your first dose to get started.</p></div>';
    }
    return;
  }

  if (empty) empty.classList.add('hidden');
  grid.innerHTML = summaries.map(s => {
    const lastDoseAgo = formatRelativeTime(s.lastDoseTime);
    const halfLifeStr = formatDuration(s.halfLifeHours);
    const clearTimeHours = s.halfLifeHours * 10;
    const timeSinceLastMs = Date.now() - s.lastDoseTime;
    const timeSinceLastHours = timeSinceLastMs / (1000 * 60 * 60);
    const eta = clearTimeHours - timeSinceLastHours;
    const etaStr = eta > 0 ? `~${formatDuration(eta)}` : 'Cleared';

    // Protocol frequency hint from LIBRARY_DATA
    let protocolHint = '';
    if (typeof findLibraryDataForCompound === 'function') {
      const libData = findLibraryDataForCompound(null, s.compoundName);
      if (libData && libData.protocols) {
        const pText = libData.protocols.toLowerCase();
        if (pText.includes('twice daily') || pText.includes('2x daily')) protocolHint = '2x Daily';
        else if (pText.includes('daily') || pText.includes('every day')) protocolHint = 'Daily';
        else if (pText.includes('every other day') || pText.includes('eod')) protocolHint = 'Every Other Day';
        else if (pText.includes('3x weekly') || pText.includes('three times weekly')) protocolHint = '3x Weekly';
        else if (pText.includes('twice weekly') || pText.includes('2x weekly') || pText.includes('two times weekly')) protocolHint = '2x Weekly';
        else if (pText.includes('once weekly') || pText.includes('weekly')) protocolHint = 'Weekly';
      }
    }

    return `
      <div class="compound-card clickable" onclick="openCompoundDetail('${escapeHtml(s.compoundName)}')">
        <div class="compound-card-header">
          <div class="compound-card-name">
            <span class="color-dot" style="background:${s.color}"></span>
            ${escapeHtml(s.compoundName)}
          </div>
          <span class="category-badge ${s.category}">${s.category}</span>
        </div>
        <div class="compound-card-stats">
          <div class="stat">
            <span class="stat-label">Remaining</span>
            <span class="stat-value level">${s.totalRemaining} ${s.unit}</span>
          </div>
          <div class="stat">
            <span class="stat-label">% Active</span>
            <span class="stat-value">${s.percentRemaining}%</span>
          </div>
          <div class="stat">
            <span class="stat-label">Last Dose</span>
            <span class="stat-value">${lastDoseAgo}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Clears In</span>
            <span class="stat-value">${etaStr}</span>
          </div>
        </div>
        <div class="level-bar-container">
          <div class="level-bar" style="width:${Math.min(s.percentRemaining, 100)}%; background:${s.color}"></div>
        </div>
        ${protocolHint ? `<div class="compound-card-protocol">Protocol: ${protocolHint}</div>` : ''}
      </div>
    `;
  }).join('');
}

// ═══════════════════════════════════════
// CALENDAR WIDGET
// ═══════════════════════════════════════

function renderCalendar(doses) {
  const container = document.getElementById('dashboard-calendar');
  if (!container) return;

  // Build set of date strings that have doses (YYYY-MM-DD)
  const doseDates = new Set();
  if (doses && doses.length > 0) {
    for (const dose of doses) {
      const d = new Date(dose.administeredAt);
      const key = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
      doseDates.add(key);
    }
  }

  const today = new Date();
  const firstDay = new Date(calendarYear, calendarMonth, 1);
  const lastDay = new Date(calendarYear, calendarMonth + 1, 0);
  const startDow = firstDay.getDay(); // 0=Sun
  const daysInMonth = lastDay.getDate();

  const monthName = firstDay.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  let html = '<div class="calendar-header">';
  html += '<button class="calendar-nav" onclick="navigateCalendar(-1)">&#8249;</button>';
  html += '<span class="calendar-title">' + monthName + '</span>';
  html += '<button class="calendar-nav" onclick="navigateCalendar(1)">&#8250;</button>';
  html += '</div>';
  html += '<div class="calendar-grid">';

  // Weekday headers
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (const wd of weekdays) {
    html += '<div class="calendar-weekday">' + wd + '</div>';
  }

  // Previous month trailing days
  const prevMonthLast = new Date(calendarYear, calendarMonth, 0);
  for (let i = startDow - 1; i >= 0; i--) {
    const day = prevMonthLast.getDate() - i;
    html += '<div class="calendar-day other-month">' + day + '</div>';
  }

  // Current month days
  for (let d = 1; d <= daysInMonth; d++) {
    const isToday = (d === today.getDate() && calendarMonth === today.getMonth() && calendarYear === today.getFullYear());
    const dateKey = calendarYear + '-' + String(calendarMonth + 1).padStart(2, '0') + '-' + String(d).padStart(2, '0');
    const hasDose = doseDates.has(dateKey);
    const classes = ['calendar-day'];
    if (isToday) classes.push('today');
    if (hasDose) classes.push('has-dose');

    const onclick = hasDose ? ' onclick="calendarClickDay(\'' + dateKey + '\')"' : '';
    html += '<div class="' + classes.join(' ') + '"' + onclick + '>' + d;
    if (hasDose) html += '<span class="dose-dot"></span>';
    html += '</div>';
  }

  // Next month leading days to fill grid to a full row
  const totalCells = startDow + daysInMonth;
  const remaining = (7 - (totalCells % 7)) % 7;
  for (let d = 1; d <= remaining; d++) {
    html += '<div class="calendar-day other-month">' + d + '</div>';
  }

  html += '</div>';
  container.innerHTML = html;
}

async function navigateCalendar(delta) {
  calendarMonth += delta;
  if (calendarMonth < 0) {
    calendarMonth = 11;
    calendarYear--;
  }
  if (calendarMonth > 11) {
    calendarMonth = 0;
    calendarYear++;
  }
  const doses = await window.api.getDoses();
  renderCalendar(doses);
}

window.navigateCalendar = navigateCalendar;

// Click a calendar day → navigate to History filtered to that date
function calendarClickDay(dateKey) {
  // dateKey is 'YYYY-MM-DD'
  if (typeof setHistoryDateFilter === 'function') {
    setHistoryDateFilter(dateKey);
  }
  switchView('history');
}

window.calendarClickDay = calendarClickDay;

function renderDashboardStats(doses, summaries, now) {
  const container = document.getElementById('dashboard-stats-row');
  if (!container) return;

  // Active compounds count
  const activeCount = summaries.length;

  // Doses this week
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
  const dosesThisWeek = doses.filter(d => new Date(d.administeredAt).getTime() >= weekAgo && new Date(d.administeredAt).getTime() <= now).length;

  // Active cycles
  let activeCycleCount = 0;
  if (typeof allCycles !== 'undefined') {
    activeCycleCount = allCycles.filter(c => c.status === 'active').length;
  }

  // Upcoming doses in 24h (from cycle schedules)
  let upcomingCount = 0;
  if (typeof allCycles !== 'undefined') {
    const in24h = now + 24 * 60 * 60 * 1000;
    for (const cycle of allCycles) {
      if (cycle.status !== 'active') continue;
      if (cycle.scheduledDoses) {
        for (const sd of cycle.scheduledDoses) {
          if (sd.taken) continue;
          const sdTime = new Date(sd.date).getTime();
          if (sdTime >= now && sdTime <= in24h) upcomingCount++;
        }
      }
    }
  }

  container.innerHTML = `
    <div class="dash-stat-card">
      <span class="dash-stat-value accent-green">${activeCount}</span>
      <span class="dash-stat-label">Active Compounds</span>
    </div>
    <div class="dash-stat-card">
      <span class="dash-stat-value">${dosesThisWeek}</span>
      <span class="dash-stat-label">Doses This Week</span>
    </div>
    <div class="dash-stat-card">
      <span class="dash-stat-value">${activeCycleCount}</span>
      <span class="dash-stat-label">Active Cycles</span>
    </div>
    <div class="dash-stat-card">
      <span class="dash-stat-value">${upcomingCount}</span>
      <span class="dash-stat-label">Upcoming (24h)</span>
    </div>`;
}

function renderChartToggles(seriesData) {
  const hormonesContainer = document.getElementById('chart-toggles-hormones');
  const peptidesContainer = document.getElementById('chart-toggles-peptides');
  if (!hormonesContainer || !peptidesContainer) return;

  const hormonesEntries = [];
  const peptidesEntries = [];

  for (const [compoundId, series] of Object.entries(seriesData)) {
    const entry = { name: series.compoundName, color: series.color };
    if (PEPTIDE_CATEGORIES.has(series.category)) {
      peptidesEntries.push(entry);
    } else {
      hormonesEntries.push(entry);
    }
  }

  function buildPills(entries, chartName, container) {
    if (entries.length === 0) {
      container.innerHTML = '';
      return;
    }
    const chart = chartName === 'hormones' ? hormonesChart : peptidesChart;
    container.innerHTML = entries.map((e, i) => {
      const hidden = chart && chart.data.datasets[i] && chart.data.datasets[i].hidden;
      const cls = 'chart-toggle-pill' + (hidden ? ' inactive' : '');
      return `<button class="${cls}" style="--pill-color:${e.color}" onclick="toggleChartPill('${chartName}', ${i}, this)">${escapeHtml(e.name)}</button>`;
    }).join('');
  }

  buildPills(hormonesEntries, 'hormones', hormonesContainer);
  buildPills(peptidesEntries, 'peptides', peptidesContainer);
}

function toggleChartPill(chartName, index, btn) {
  toggleChartDataset(chartName, index);
  btn.classList.toggle('inactive');
}

window.toggleChartPill = toggleChartPill;

function cleanupDashboard() {
  if (dashboardRefreshTimer) {
    clearInterval(dashboardRefreshTimer);
    dashboardRefreshTimer = null;
  }
}
