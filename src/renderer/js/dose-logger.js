let allCompoundsForSelect = [];
let allBlendsForSelect = [];
let currentLogCategory = 'all';
let pendingCycleDose = null; // { cycleId, scheduledDoseId } when logging from cycle

// Map LIBRARY_DATA type → dose logger category
const LIB_TYPE_TO_CATEGORY = {
  'Peptide': 'peptide',
  'Hormone': 'aas',
  'Supplement': 'supplement',
  'Blend': 'blend'
};

async function initDoseLogger() {
  setupCategoryTabs();
  setupCompoundSelect();
  setupDoseForm();
  setupLogDoseModal();

  // Set default datetime to now
  document.getElementById('dose-datetime').value = toLocalDatetimeValue();

  // Load custom compounds and blends
  await refreshCompoundSelect();
}

function setupCategoryTabs() {
  document.querySelectorAll('.cat-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentLogCategory = tab.dataset.category;
      populateCompoundDropdown();
    });
  });
}

async function refreshCompoundSelect() {
  const customCompounds = await window.api.getCustomCompounds();
  const customBlends = await window.api.getCustomBlends();

  // Build compound list from LIBRARY_DATA as single source + custom compounds
  const libraryCompounds = LIBRARY_DATA.filter(c => c.type !== 'Blend').map(c => ({
    id: 'lib:' + c.name,
    name: c.name,
    category: LIB_TYPE_TO_CATEGORY[c.type] || 'peptide',
    halfLifeHours: c.halfLifeHours || 0,
    halfLifeValue: c.halfLifeHours || 0,
    halfLifeUnit: 'hours',
    defaultUnit: guessDefaultUnit(c),
    defaultRoute: guessDefaultRoute(c),
    color: LIBRARY_TYPE_CONFIG[c.type]?.color || '#888',
    isLibrary: true
  }));

  // Library blends
  const libraryBlends = LIBRARY_DATA.filter(c => c.type === 'Blend').map(c => ({
    id: 'lib:' + c.name,
    name: c.name,
    category: 'blend',
    halfLifeHours: c.halfLifeHours || 0,
    halfLifeValue: c.halfLifeHours || 0,
    halfLifeUnit: 'hours',
    defaultUnit: 'mcg',
    defaultRoute: 'subcutaneous',
    color: LIBRARY_TYPE_CONFIG['Blend']?.color || '#ffd54f',
    isLibrary: true,
    isLibraryBlend: true
  }));

  allCompoundsForSelect = [
    ...libraryCompounds,
    ...libraryBlends,
    ...customCompounds.map(c => ({
      ...c,
      color: '#888',
      isCustom: true
    }))
  ];

  allBlendsForSelect = customBlends;
  populateCompoundDropdown();
}

function guessDefaultUnit(libraryEntry) {
  // Try to guess from protocols text
  const p = (libraryEntry.protocols || '').toLowerCase();
  if (p.includes('iu ') || p.includes('iu/')) return 'IU';
  if (p.includes('mcg') || p.includes('µg')) return 'mcg';
  return 'mg';
}

function guessDefaultRoute(libraryEntry) {
  const p = (libraryEntry.protocols || '').toLowerCase();
  if (p.includes('topical')) return 'topical';
  if (p.includes('oral') || p.includes('capsule') || p.includes('troche')) return 'oral';
  if (p.includes('intranasal')) return 'subcutaneous';
  if (p.includes('\nim') || p.includes('intramuscular')) return 'intramuscular';
  return 'subcutaneous';
}

function populateCompoundDropdown() {
  const select = document.getElementById('compound-select');
  select.innerHTML = '<option value="">Select a compound...</option>';

  if (currentLogCategory === 'blend') {
    // Library blends
    const libBlends = allCompoundsForSelect.filter(c => c.isLibraryBlend);
    if (libBlends.length > 0) {
      const grp = document.createElement('optgroup');
      grp.label = 'Library Blends';
      for (const blend of libBlends) {
        const opt = document.createElement('option');
        opt.value = blend.id;
        opt.textContent = blend.name;
        grp.appendChild(opt);
      }
      select.appendChild(grp);
    }
    // Custom blends
    if (allBlendsForSelect.length > 0) {
      const grp = document.createElement('optgroup');
      grp.label = 'Custom Blends';
      for (const blend of allBlendsForSelect) {
        const opt = document.createElement('option');
        opt.value = 'blend:' + blend.id;
        opt.textContent = blend.name;
        grp.appendChild(opt);
      }
      select.appendChild(grp);
    }
    if (libBlends.length === 0 && allBlendsForSelect.length === 0) {
      const opt = document.createElement('option');
      opt.value = '';
      opt.disabled = true;
      opt.textContent = 'No blends available';
      select.appendChild(opt);
    }
  } else if (currentLogCategory === 'all') {
    // Show all compounds grouped by type
    const groups = {};
    const filtered = allCompoundsForSelect.filter(c => !c.isLibraryBlend);
    for (const compound of filtered) {
      const cat = compound.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(compound);
    }
    const catLabels = { peptide: 'Peptides', aas: 'AAS / Hormones', hgh: 'HGH', supplement: 'Supplements', other: 'Other' };
    for (const [cat, compounds] of Object.entries(groups)) {
      const grp = document.createElement('optgroup');
      grp.label = catLabels[cat] || cat;
      for (const compound of compounds) {
        const opt = document.createElement('option');
        opt.value = compound.id;
        opt.textContent = compound.name + (compound.isCustom ? ' (Custom)' : '');
        grp.appendChild(opt);
      }
      select.appendChild(grp);
    }
  } else {
    const filtered = allCompoundsForSelect.filter(c => c.category === currentLogCategory && !c.isLibraryBlend);
    for (const compound of filtered) {
      const opt = document.createElement('option');
      opt.value = compound.id;
      opt.textContent = compound.name + (compound.isCustom ? ' (Custom)' : '');
      select.appendChild(opt);
    }
  }

  // Reset info
  document.getElementById('compound-info').classList.add('hidden');
}

function setupCompoundSelect() {
  const select = document.getElementById('compound-select');
  select.addEventListener('change', () => {
    const val = select.value;
    const info = document.getElementById('compound-info');

    if (val.startsWith('blend:')) {
      const blendId = val.replace('blend:', '');
      const blend = allBlendsForSelect.find(b => b.id === blendId);
      if (blend) {
        const components = blend.components.map(c => `${c.compoundName}: ${c.dose} ${c.unit}`).join(', ');
        info.textContent = `Blend components: ${components}`;
        info.classList.remove('hidden');
      }
    } else if (val) {
      const compound = allCompoundsForSelect.find(c => c.id === val);
      if (compound) {
        const hlDisplay = compound.halfLifeHours ? formatHalfLife(compound.halfLifeHours) : 'N/A';
        info.textContent = `Half-life: ${hlDisplay}`;
        info.classList.remove('hidden');
        if (compound.defaultUnit) document.getElementById('dose-unit').value = compound.defaultUnit;
        if (compound.defaultRoute) document.getElementById('dose-route').value = compound.defaultRoute;
      }
    } else {
      info.classList.add('hidden');
    }
  });
}

function setupLogDoseModal() {
  // Close modal on overlay click
  document.getElementById('log-dose-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeLogDoseModal();
  });
}

function openLogDoseModal() {
  refreshCompoundSelect();
  populateLocationDropdown(document.getElementById('dose-location'), '');
  document.getElementById('dose-datetime').value = toLocalDatetimeValue();
  document.getElementById('log-dose-modal').classList.remove('hidden');
}

async function openLogDoseModalFromCycle(cycleId, scheduledDoseId, compoundName, doseAmount, unit, route, scheduledAt, cycleName) {
  await refreshCompoundSelect();

  // Store pending cycle dose info
  pendingCycleDose = { cycleId, scheduledDoseId };

  // Find the compound in the select list by name
  const compoundMatch = allCompoundsForSelect.find(c =>
    c.name.toLowerCase() === compoundName.toLowerCase()
  );

  if (compoundMatch) {
    // Switch to the right category tab
    const category = compoundMatch.isLibraryBlend ? 'blend' : (compoundMatch.category || 'all');
    const catTab = document.querySelector('.cat-tab[data-category="' + category + '"]') ||
                   document.querySelector('.cat-tab[data-category="all"]');
    if (catTab) {
      document.querySelectorAll('.cat-tab').forEach(t => t.classList.remove('active'));
      catTab.classList.add('active');
      currentLogCategory = catTab.dataset.category;
      populateCompoundDropdown();
    }

    // Select the compound
    document.getElementById('compound-select').value = compoundMatch.id;
    // Trigger change event to show compound info
    document.getElementById('compound-select').dispatchEvent(new Event('change'));
  }

  // Pre-fill dose amount, unit, and populate location dropdown
  document.getElementById('dose-amount').value = doseAmount || '';
  document.getElementById('dose-unit').value = unit || 'mg';
  document.getElementById('dose-route').value = route || 'subcutaneous';
  populateLocationDropdown(document.getElementById('dose-location'), '');

  // Set datetime to now (actual time of administration)
  document.getElementById('dose-datetime').value = toLocalDatetimeValue();

  // Pre-fill notes with cycle name
  document.getElementById('dose-notes').value = '[Cycle: ' + (cycleName || '') + ']';

  // Open modal
  document.getElementById('log-dose-modal').classList.remove('hidden');
}

function closeLogDoseModal() {
  document.getElementById('log-dose-modal').classList.add('hidden');
  pendingCycleDose = null;
}

function setupDoseForm() {
  document.getElementById('dose-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const compoundVal = document.getElementById('compound-select').value;
    if (!compoundVal) return;

    const amount = parseFloat(document.getElementById('dose-amount').value);
    const unit = document.getElementById('dose-unit').value;
    const route = document.getElementById('dose-route').value;
    const location = document.getElementById('dose-location').value;
    const datetime = document.getElementById('dose-datetime').value;
    const notes = document.getElementById('dose-notes').value;
    const administeredAt = new Date(datetime).toISOString();

    if (compoundVal.startsWith('blend:')) {
      // Custom blend - Log each component separately
      const blendId = compoundVal.replace('blend:', '');
      const blend = allBlendsForSelect.find(b => b.id === blendId);
      if (!blend) return;

      for (const component of blend.components) {
        const compound = allCompoundsForSelect.find(c => c.id === component.compoundId);
        const dose = {
          id: generateId(),
          compoundId: component.compoundId,
          compoundName: component.compoundName,
          category: compound ? compound.category : blend.category,
          amount: component.dose,
          unit: component.unit,
          route: route,
          location: location,
          administeredAt: administeredAt,
          halfLifeHours: compound ? compound.halfLifeHours : component.halfLifeHours,
          color: compound ? compound.color : '#888',
          notes: `[${blend.name}] ${notes}`,
          blendId: blend.id,
          blendName: blend.name
        };
        await window.api.addDose(dose);
        await deductFromInventory(component.compoundName, component.dose);
      }
      showToast(`Logged blend: ${blend.name} (${blend.components.length} components)`, 'success');
    } else {
      const compound = allCompoundsForSelect.find(c => c.id === compoundVal);
      if (!compound) return;

      // For library compounds, use name-based ID for consistency
      const compoundId = compound.isLibrary ? compound.name : compound.id;

      const dose = {
        id: generateId(),
        compoundId: compoundId,
        compoundName: compound.name,
        category: compound.category === 'supplement' ? 'peptide' : compound.category,
        amount: amount,
        unit: unit,
        route: route,
        location: location,
        administeredAt: administeredAt,
        halfLifeHours: compound.halfLifeHours,
        color: compound.color || '#888',
        notes: notes
      };

      // Library blends logged as single dose (they're pre-mixed)
      await window.api.addDose(dose);
      await deductFromInventory(compound.name, amount);
      showToast(`Logged ${amount} ${unit} of ${compound.name}`, 'success');
    }

    // Capture cycle dose info before closeLogDoseModal clears it
    const cycleDoseInfo = pendingCycleDose ? { ...pendingCycleDose } : null;

    // Reset form
    document.getElementById('dose-amount').value = '';
    document.getElementById('dose-notes').value = '';
    document.getElementById('dose-location').value = '';
    document.getElementById('dose-datetime').value = toLocalDatetimeValue();

    // Close modal
    closeLogDoseModal();

    // If logging from a cycle, mark the scheduled dose as taken
    if (cycleDoseInfo && window.markScheduledDoseTaken) {
      await window.markScheduledDoseTaken(cycleDoseInfo.cycleId, cycleDoseInfo.scheduledDoseId);
    }

    refreshDashboard();
  });
}

async function deductFromInventory(compoundName, amount) {
  const inventory = await window.api.getInventory();
  const items = inventory.filter(i => i.compoundName === compoundName && i.remainingAmount > 0);
  if (items.length === 0) return; // No inventory tracked, skip silently

  // Deduct from first available item
  const item = items[0];
  let newRemaining = item.remainingAmount - amount;
  if (newRemaining < 0) newRemaining = 0;

  await window.api.updateInventory(item.id, { remainingAmount: newRemaining });
}

// Expose to global scope for onclick handlers
window.openLogDoseModal = openLogDoseModal;
window.openLogDoseModalFromCycle = openLogDoseModalFromCycle;
window.closeLogDoseModal = closeLogDoseModal;
