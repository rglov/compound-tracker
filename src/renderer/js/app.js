// ═══════════════════════════════════════
// VIEW ROUTING
// ═══════════════════════════════════════

function switchView(viewName) {
  // Hide all views
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));

  // Clear history date filter when navigating away from history
  // (but NOT when navigating TO history, since calendar may have set it)
  if (viewName !== 'history' && typeof historyDateFilter !== 'undefined') {
    historyDateFilter = null;
  }

  // Show selected view
  const view = document.getElementById('view-' + viewName);
  if (view) view.classList.add('active');

  const btn = document.querySelector(`.nav-btn[data-view="${viewName}"]`);
  if (btn) btn.classList.add('active');

  // Refresh view data
  switch (viewName) {
    case 'dashboard':
      refreshDashboard();
      break;
    case 'library':
      renderLibrary();
      break;
    case 'history':
      refreshHistory();
      break;
    case 'cycles':
      refreshCyclesList();
      break;
    case 'settings':
      refreshCustomCompoundsList();
      refreshCustomBlendsList();
      populateBlendCompoundSelects();
      renderInjectionSitesSettings();
      break;
  }
}

// ═══════════════════════════════════════
// TOAST NOTIFICATIONS
// ═══════════════════════════════════════

let toastTimer = null;

function showToast(message, type = 'success') {
  const toast = document.getElementById('toast');
  toast.textContent = message;
  toast.className = `toast ${type}`;

  // Force reflow then show
  void toast.offsetHeight;
  toast.classList.add('visible');

  if (toastTimer) clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove('visible');
  }, 3000);
}

// ═══════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════

document.addEventListener('DOMContentLoaded', async () => {
  // Setup navigation
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      switchView(btn.dataset.view);
    });
  });

  // Load settings first (needed by dropdown population and bodymap)
  await loadEnabledSites();

  // Apply library overrides before any module uses LIBRARY_DATA
  await applyLibraryOverrides();

  // Initialize all modules
  await initDoseLogger();
  await initCustomCompounds();
  await initHistory();
  initCompoundDetail();
  await initLibrary();
  await initCycles();
  await initDashboard();
});
