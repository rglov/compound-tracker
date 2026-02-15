let dashboardRefreshTimer = null;
let currentRangeHours = 168; // default 7 days

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
      currentRangeHours = range === 'all' ? 'all' : parseInt(range);
      refreshDashboard();
    });
  });
}

async function refreshDashboard() {
  const doses = await window.api.getDoses();
  const now = Date.now();

  // Calculate chart time range
  let startTime, endTime;
  if (currentRangeHours === 'all') {
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
    const rangeMs = currentRangeHours * 60 * 60 * 1000;
    startTime = now - rangeMs;
    endTime = now + rangeMs * 0.3;
  }

  // Generate chart data
  const seriesData = generateTimeSeriesData(doses, startTime, endTime);
  updateChart(seriesData, currentRangeHours);

  // Active compound cards
  const summaries = getActiveCompoundSummaries(doses, now);
  renderActiveCompounds(summaries);

  // Update body map heatmap
  updateBodyMapHeatmap(doses);

  // Calendar
  renderCalendar(doses);

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

function navigateCalendar(delta) {
  calendarMonth += delta;
  if (calendarMonth < 0) {
    calendarMonth = 11;
    calendarYear--;
  }
  if (calendarMonth > 11) {
    calendarMonth = 0;
    calendarYear++;
  }
  renderCalendar(); // re-render without dose data (will show calendar without dots until next refresh)
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

function cleanupDashboard() {
  if (dashboardRefreshTimer) {
    clearInterval(dashboardRefreshTimer);
    dashboardRefreshTimer = null;
  }
}
