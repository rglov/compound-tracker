// ═══════════════════════════════════════
// RECONSTITUTION CALCULATOR MODULE
// ═══════════════════════════════════════

let _reconSelectedCompound = null;

function initReconstitution() {
  populateReconCompoundSelect();
}

function populateReconCompoundSelect() {
  const select = document.getElementById('recon-compound-select');
  if (!select) return;

  select.innerHTML = '<option value="">Select a compound...</option>';

  // Group LIBRARY_DATA by type — only injectable compounds
  const groups = {};
  for (const c of LIBRARY_DATA) {
    const route = guessDefaultRoute(c);
    if (route === 'oral' || route === 'topical') continue;
    const cat = c.type || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(c);
  }

  for (const [type, compounds] of Object.entries(groups)) {
    const optgroup = document.createElement('optgroup');
    optgroup.label = type + 's';
    for (const c of compounds) {
      const opt = document.createElement('option');
      opt.value = c.name;
      opt.textContent = c.name;
      optgroup.appendChild(opt);
    }
    select.appendChild(optgroup);
  }
}

function onReconCompoundChange() {
  const select = document.getElementById('recon-compound-select');
  const compoundName = select.value;

  if (!compoundName) {
    _reconSelectedCompound = null;
    document.getElementById('recon-mod-peptide-mg').value = '';
    document.getElementById('recon-mod-dose-mcg').value = '';
    clearReconModResults();
    return;
  }

  const compound = LIBRARY_DATA.find(c => c.name === compoundName);
  _reconSelectedCompound = compound || null;

  // Try to guess default dose from protocols
  let defaultDose = '';
  if (compound && compound.protocols) {
    const match = compound.protocols.match(/(\d+)\s*mcg/i);
    if (match) defaultDose = match[1];
  }

  if (defaultDose) {
    document.getElementById('recon-mod-dose-mcg').value = defaultDose;
  }

  updateReconModResults();
}

function updateReconModResults() {
  const rawPeptide = parseFloat(document.getElementById('recon-mod-peptide-mg')?.value);
  const vialUnit = document.getElementById('recon-mod-vial-unit')?.value || 'mg';
  const waterMl = parseFloat(document.getElementById('recon-mod-water-ml')?.value);
  const rawDose = parseFloat(document.getElementById('recon-mod-dose-mcg')?.value);
  const doseUnit = document.getElementById('recon-mod-dose-unit')?.value || 'mcg';
  const container = document.getElementById('recon-mod-results');
  if (!container) return;

  if (!rawPeptide || !waterMl || rawPeptide <= 0 || waterMl <= 0) {
    container.innerHTML = '<p class="recon-hint">Enter peptide amount and water volume to see results.</p>';
    return;
  }

  // Normalize to mg
  const peptideMg = vialUnit === 'mcg' ? rawPeptide / 1000 : rawPeptide;
  // Normalize dose to mcg
  const doseMcg = doseUnit === 'mg' ? rawDose * 1000 : rawDose;

  const concentrationMcg = (peptideMg * 1000) / waterMl;
  const concentrationMg = peptideMg / waterMl;

  let html = `
    <div class="recon-result-row">
      <span class="recon-label">Concentration</span>
      <span class="recon-value">${concentrationMcg.toLocaleString()} mcg/mL (${concentrationMg.toFixed(2)} mg/mL)</span>
    </div>`;

  if (doseMcg && doseMcg > 0) {
    const doseVolume = doseMcg / concentrationMcg;
    const units100 = doseVolume * 100;
    const units50 = doseVolume * 50;
    const dosesPerVial = Math.floor((peptideMg * 1000) / doseMcg);

    html += `
      <div class="recon-result-row">
        <span class="recon-label">Dose Volume</span>
        <span class="recon-value">${doseVolume.toFixed(3)} mL</span>
      </div>
      <div class="recon-result-row">
        <span class="recon-label">Insulin Syringe (100u)</span>
        <span class="recon-value accent-green">${units100.toFixed(1)} units</span>
      </div>
      <div class="recon-result-row">
        <span class="recon-label">Insulin Syringe (50u)</span>
        <span class="recon-value">${units50.toFixed(1)} units</span>
      </div>
      <div class="recon-result-row">
        <span class="recon-label">Doses per Vial</span>
        <span class="recon-value">${dosesPerVial}</span>
      </div>`;

    const totalVolumeMl = peptideMg / concentrationMg;
    html += `
      <div class="recon-result-row">
        <span class="recon-label">Total Volume in Vial</span>
        <span class="recon-value">${totalVolumeMl.toFixed(2)} mL</span>
      </div>`;
  }

  container.innerHTML = html;
}

function clearReconModResults() {
  const container = document.getElementById('recon-mod-results');
  if (container) container.innerHTML = '<p class="recon-hint">Select a compound and enter values to calculate.</p>';
}

function refreshReconstitutionView() {
  populateReconCompoundSelect();

  // Restore selection if we had one
  if (_reconSelectedCompound) {
    const select = document.getElementById('recon-compound-select');
    if (select) select.value = _reconSelectedCompound.name;
  }

  updateReconModResults();
}

// Navigate to reconstitution tab with a compound pre-selected
function openReconstitutionFor(compoundName) {
  switchView('reconstitution');
  const select = document.getElementById('recon-compound-select');
  if (select) {
    select.value = compoundName;
    onReconCompoundChange();
  }
}

// Expose to global scope
window.initReconstitution = initReconstitution;
window.refreshReconstitutionView = refreshReconstitutionView;
window.onReconCompoundChange = onReconCompoundChange;
window.updateReconModResults = updateReconModResults;
window.openReconstitutionFor = openReconstitutionFor;
