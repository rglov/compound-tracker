let historySortKey = 'administeredAt';
let historySortDir = -1; // -1 = descending (newest first)
let historyFilter = 'all';
let historyDateFilter = null; // null = no filter, 'YYYY-MM-DD' = filter to that day
let allDosesCache = [];

async function initHistory() {
  setupHistorySort();
  setupHistoryFilter();
  setupEditForm();
  await refreshHistory();
}

function setupHistorySort() {
  document.querySelectorAll('.history-table th[data-sort]').forEach(th => {
    th.addEventListener('click', () => {
      const key = th.dataset.sort;
      if (historySortKey === key) {
        historySortDir *= -1;
      } else {
        historySortKey = key;
        historySortDir = key === 'administeredAt' ? -1 : 1;
      }
      refreshHistory();
    });
  });
}

function setupHistoryFilter() {
  document.getElementById('history-category-filter').addEventListener('change', (e) => {
    historyFilter = e.target.value;
    refreshHistory();
  });
}

function setupEditForm() {
  document.getElementById('edit-dose-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    await saveEditedDose();
  });

  // Close modal on overlay click
  document.getElementById('edit-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeEditModal();
  });
}

// ═══════════════════════════════════════
// DATE FILTER (from calendar click)
// ═══════════════════════════════════════

function setHistoryDateFilter(dateKey) {
  // dateKey is 'YYYY-MM-DD'
  historyDateFilter = dateKey;
}

function clearHistoryDateFilter() {
  historyDateFilter = null;
  refreshHistory();
}

function renderDateFilterBadge() {
  const container = document.getElementById('history-date-filter-container');
  if (!container) return;

  if (!historyDateFilter) {
    container.innerHTML = '';
    return;
  }

  // Format date nicely
  const parts = historyDateFilter.split('-');
  const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
  const formatted = dateObj.toLocaleDateString(undefined, {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  container.innerHTML = '<div class="history-date-filter">' +
    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' +
    '<span>' + formatted + '</span>' +
    '<button class="clear-date-filter" onclick="clearHistoryDateFilter()" title="Clear date filter">&times;</button>' +
    '</div>';
}

// ═══════════════════════════════════════
// MAIN REFRESH
// ═══════════════════════════════════════

async function refreshHistory() {
  const doses = await window.api.getDoses();
  allDosesCache = doses;
  const now = Date.now();

  let filtered = historyFilter === 'all'
    ? doses
    : doses.filter(d => d.category === historyFilter);

  // Apply date filter if active
  if (historyDateFilter) {
    const parts = historyDateFilter.split('-');
    const filterYear = parseInt(parts[0]);
    const filterMonth = parseInt(parts[1]) - 1;
    const filterDay = parseInt(parts[2]);

    filtered = filtered.filter(d => {
      const dt = new Date(d.administeredAt);
      return dt.getFullYear() === filterYear &&
             dt.getMonth() === filterMonth &&
             dt.getDate() === filterDay;
    });
  }

  // Render date filter badge
  renderDateFilterBadge();

  filtered.sort((a, b) => {
    let aVal = a[historySortKey];
    let bVal = b[historySortKey];
    if (typeof aVal === 'string') aVal = aVal.toLowerCase();
    if (typeof bVal === 'string') bVal = bVal.toLowerCase();
    if (aVal < bVal) return -1 * historySortDir;
    if (aVal > bVal) return 1 * historySortDir;
    return 0;
  });

  const tbody = document.getElementById('history-tbody');
  const empty = document.getElementById('history-empty');

  if (filtered.length === 0) {
    tbody.innerHTML = '';
    empty.classList.remove('hidden');
    if (historyDateFilter) {
      empty.querySelector('p').textContent = 'No doses logged on this date.';
    } else {
      empty.querySelector('p').textContent = 'No doses logged yet.';
    }
    return;
  }

  empty.classList.add('hidden');
  tbody.innerHTML = filtered.map(dose => {
    const remaining = calculateRemainingLevel(dose, now);
    const pct = dose.amount > 0 ? Math.round((remaining / dose.amount) * 100) : 0;
    const remainStr = remaining > 0
      ? `${remaining.toFixed(2)} ${dose.unit} (${pct}%)`
      : '<span style="color:#6b6b7b">Cleared</span>';

    const routeMap = {
      intramuscular: 'IM',
      subcutaneous: 'SubQ',
      oral: 'Oral',
      intravenous: 'IV',
      topical: 'Topical'
    };

    const locationLabel = dose.location ? formatLocationName(dose.location) : '-';

    return `
      <tr>
        <td>${formatDateTime(dose.administeredAt)}</td>
        <td>
          <span style="display:inline-flex;align-items:center;gap:6px">
            <span class="color-dot" style="background:${dose.color || '#888'};width:8px;height:8px;border-radius:50%;display:inline-block"></span>
            ${escapeHtml(dose.compoundName)}
          </span>
        </td>
        <td><span class="category-badge ${dose.category}">${dose.category}</span></td>
        <td>${dose.amount} ${dose.unit}</td>
        <td>${routeMap[dose.route] || dose.route}</td>
        <td>${locationLabel}</td>
        <td>${remainStr}</td>
        <td>
          <div class="action-btns">
            <button class="btn btn-secondary btn-small" onclick="openEditModal('${dose.id}')">Edit</button>
            <button class="btn btn-danger btn-small" onclick="deleteDose('${dose.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// ═══════════════════════════════════════
// EDIT MODAL
// ═══════════════════════════════════════

function openEditModal(doseId) {
  const dose = allDosesCache.find(d => d.id === doseId);
  if (!dose) return;

  document.getElementById('edit-dose-id').value = dose.id;
  document.getElementById('edit-compound-name').textContent = dose.compoundName;
  document.getElementById('edit-amount').value = dose.amount;
  document.getElementById('edit-unit').value = dose.unit;
  document.getElementById('edit-route').value = dose.route || 'intramuscular';
  populateLocationDropdown(document.getElementById('edit-location'), dose.location || '');
  document.getElementById('edit-datetime').value = toLocalDatetimeValue(new Date(dose.administeredAt));
  document.getElementById('edit-notes').value = dose.notes || '';

  document.getElementById('edit-modal').classList.remove('hidden');
}

function closeEditModal() {
  document.getElementById('edit-modal').classList.add('hidden');
}

async function saveEditedDose() {
  const id = document.getElementById('edit-dose-id').value;

  const updated = {
    id: id,
    amount: parseFloat(document.getElementById('edit-amount').value),
    unit: document.getElementById('edit-unit').value,
    route: document.getElementById('edit-route').value,
    location: document.getElementById('edit-location').value,
    administeredAt: new Date(document.getElementById('edit-datetime').value).toISOString(),
    notes: document.getElementById('edit-notes').value
  };

  await window.api.updateDose(updated);
  closeEditModal();
  showToast('Dose updated', 'success');
  await refreshHistory();
}

async function deleteDose(id) {
  if (!confirm('Delete this dose entry?')) return;
  await window.api.deleteDose(id);
  showToast('Dose deleted', 'success');
  await refreshHistory();
}

// Expose to global scope for onclick handlers in innerHTML
window.openEditModal = openEditModal;
window.closeEditModal = closeEditModal;
window.deleteDose = deleteDose;
window.setHistoryDateFilter = setHistoryDateFilter;
window.clearHistoryDateFilter = clearHistoryDateFilter;
