// ═══════════════════════════════════════
// INVENTORY & ORDER MANAGEMENT
// ═══════════════════════════════════════

let _invInventoryData = [];
let _invSuppliesData = [];
let _invOrdersData = [];
let _invUsageConfig = { globalDefaults: {}, compoundOverrides: {} };
let _invCurrentTab = 'compounds';
let _invOrderFilter = 'all';
let _orderLineItemCounter = 0;

const SUPPLY_CATEGORIES = {
  needles: { label: 'Needles', icon: '&#9657;' },
  syringes: { label: 'Syringes', icon: '&#9671;' },
  filters: { label: 'Filters', icon: '&#9675;' },
  vials: { label: 'Vials', icon: '&#9633;' },
  'bac-water': { label: 'BAC Water', icon: '&#9679;' },
  'alcohol-swabs': { label: 'Alcohol Swabs', icon: '&#9632;' },
  other: { label: 'Other', icon: '&#8226;' }
};

const ORDER_STATUS_CONFIG = {
  ordered: { label: 'Ordered', color: '#4361ee', bg: 'rgba(67,97,238,0.15)' },
  shipped: { label: 'Shipped', color: '#ffd54f', bg: 'rgba(255,213,79,0.15)' },
  delivered: { label: 'Delivered', color: '#00e676', bg: 'rgba(0,230,118,0.15)' },
  cancelled: { label: 'Cancelled', color: '#a0a0b0', bg: 'rgba(160,160,176,0.15)' }
};

// ═══════════════════════════════════════
// INIT & DATA LOADING
// ═══════════════════════════════════════

async function initInventory() {
  await migrateMultiVialEntries();
  setupInventorySubNav();
  setupSupplyForm();
  setupOrderForm();
}

// One-time migration: convert legacy multi-vial and synthetic entries to per-vial model
async function migrateMultiVialEntries() {
  const inventory = await window.api.getInventory();
  let changed = false;

  for (const item of inventory) {
    // Remove synthetic cycle-allocation entries
    if (item.format === 'cycle-allocation') {
      await window.api.deleteInventory(item.id);
      changed = true;
      continue;
    }

    // Convert returned entries to normal vials
    if (item.format === 'returned') {
      await window.api.updateInventory(item.id, {
        format: 'vial',
        status: 'in-stock',
        quantity: 1
      });
      changed = true;
      continue;
    }

    // Set explicit status on entries missing it
    if (!item.status) {
      await window.api.updateInventory(item.id, { status: 'in-stock' });
      changed = true;
    }

    // Split multi-vial entries into individual vials
    if ((item.quantity || 0) > 1) {
      const qty = item.quantity;
      const perVial = item.amountPerUnit || 0;
      let pool = item.remainingAmount || 0;

      // Update original entry to be first vial
      const firstVialRemaining = Math.min(pool, perVial);
      await window.api.updateInventory(item.id, {
        quantity: 1,
        remainingAmount: firstVialRemaining,
        status: item.status || 'in-stock'
      });
      pool -= firstVialRemaining;

      // Create additional individual vials
      for (let i = 1; i < qty; i++) {
        const vialRemaining = Math.min(pool, perVial);
        const entry = {
          id: generateId(),
          compoundName: item.compoundName,
          format: item.format || 'vial',
          quantity: 1,
          amountPerUnit: perVial,
          volumePerUnit: item.volumePerUnit || null,
          expiryDate: item.expiryDate || null,
          remainingAmount: vialRemaining,
          batchNumber: item.batchNumber || null,
          capColor: item.capColor || null,
          notes: item.notes || '',
          status: item.status || 'in-stock',
          createdAt: item.createdAt || new Date().toISOString()
        };
        await window.api.saveInventory(entry);
        pool -= vialRemaining;
      }
      changed = true;
    }
  }

  if (changed) {
    console.log('[inventory] Migration: converted to per-vial model');
  }
}

async function loadInventoryData() {
  _invInventoryData = await window.api.getInventory();
  _invSuppliesData = await window.api.getSupplies();
  _invOrdersData = await window.api.getOrders();
  _invUsageConfig = await window.api.getSupplyUsageConfig();
}

function setupInventorySubNav() {
  document.querySelectorAll('.inv-sub-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.inv-sub-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _invCurrentTab = btn.dataset.subtab;
      document.querySelectorAll('.inv-tab-content').forEach(t => t.classList.remove('active'));
      const tab = document.getElementById('inv-tab-' + _invCurrentTab);
      if (tab) tab.classList.add('active');
      renderCurrentInventoryTab();
    });
  });
}

async function refreshInventoryView() {
  await loadInventoryData();
  renderCurrentInventoryTab();
}

function renderCurrentInventoryTab() {
  switch (_invCurrentTab) {
    case 'compounds': renderCompoundsTab(); break;
    case 'supplies': renderSuppliesTab(); break;
    case 'orders': renderOrdersTab(); break;
  }
}

// ═══════════════════════════════════════
// COMPOUNDS SUB-TAB
// ═══════════════════════════════════════

function renderCompoundsTab() {
  const container = document.getElementById('inv-tab-compounds');
  if (!container) return;

  // Orders are the source of truth — gather ALL order line items
  const compoundMap = {};
  for (const order of _invOrdersData) {
    const lineItems = order.lineItems || [];
    for (const li of lineItems) {
      if (li.type !== 'compound' || !li.compoundName) continue;
      const mg = li.amountPerUnit || 0;
      const key = li.compoundName + '||' + mg;
      if (!compoundMap[key]) compoundMap[key] = { compoundName: li.compoundName, amountPerUnit: mg, orderItems: [], invItems: [] };
      compoundMap[key].orderItems.push({
        ...li,
        orderId: order.id,
        supplier: order.supplier || '',
        orderDate: order.orderDate || order.createdAt || '',
        orderStatus: order.status || 'ordered'
      });
    }
  }

  // Attach inventory entries for remainingAmount tracking only
  for (const item of _invInventoryData) {
    if (item.status === 'in-use') continue; // Skip in-use allocations from grouping
    const name = item.compoundName || 'Unknown';
    const mg = item.amountPerUnit || 0;
    const key = name + '||' + mg;
    if (!compoundMap[key]) compoundMap[key] = { compoundName: name, amountPerUnit: mg, orderItems: [], invItems: [] };
    compoundMap[key].invItems.push(item);
  }

  // Gather in-use vials separately, grouped by compound+mg then by cycleId
  const inUseByKey = {};
  for (const item of _invInventoryData) {
    if (item.status !== 'in-use') continue;
    const name = item.compoundName || 'Unknown';
    const mg = item.amountPerUnit || 0;
    const key = name + '||' + mg;
    if (!inUseByKey[key]) inUseByKey[key] = {};
    const cId = item.cycleId || 'unknown';
    if (!inUseByKey[key][cId]) inUseByKey[key][cId] = [];
    inUseByKey[key][cId].push(item);
  }

  const groupKeys = Object.keys(compoundMap).sort();

  if (groupKeys.length === 0) {
    container.innerHTML = `
      <div class="inv-empty-state">
        <p>No compounds in inventory.</p>
        <p class="inv-empty-hint">Create an order with compounds to start tracking inventory.</p>
        <button class="btn btn-primary btn-small" onclick="openOrderModal()">New Order</button>
      </div>`;
    return;
  }

  // Build cards grouped by compound + mg
  let html = '';

  for (const key of groupKeys) {
    const { compoundName, amountPerUnit, orderItems, invItems } = compoundMap[key];

    // Use order items for vials/cost/tested/batch (source of truth)
    const totalVials = orderItems.reduce((sum, e) => sum + (e.quantity || 0), 0);
    const totalMg = amountPerUnit * totalVials;
    // Use inventory entries for remainingAmount (in-stock only)
    const inStockRemaining = invItems.reduce((sum, e) => sum + (e.remainingAmount || 0), 0);

    // Count in-stock vials and in-use vials for this compound+mg
    const inStockVialCount = invItems.length;
    const inUseCycles = inUseByKey[key] || {};
    const inUseVials = Object.values(inUseCycles).flat();
    const inUseVialCount = inUseVials.length;
    const inUseRemaining = inUseVials.reduce((sum, v) => sum + (v.remainingAmount || 0), 0);

    // Total remaining = in-stock + in-use
    const totalRemaining = inStockRemaining + inUseRemaining;
    const hasStock = invItems.length > 0 || inUseVialCount > 0;

    // Collect cap colors from both sources
    const allItems = [...orderItems, ...invItems];
    const capColors = [...new Set(
      allItems.map(e => e.capColor).filter(c => c && c !== '#000000')
    )];
    const capDots = capColors.map(c => `<span class="inv-cap-dot" style="background:${c}"></span>`).join('');

    // Collect batch numbers as tags
    const batches = [...new Set(orderItems.map(e => e.batchNumber).filter(Boolean))];
    const batchTags = batches.map(b => '<span class="inv-batch-tag">' + escapeHtml(b) + '</span>').join('');

    // Cost calculations from order items
    const totalCost = orderItems.reduce((sum, e) => sum + (e.cost || 0), 0);
    const costPerVial = totalVials > 0 && totalCost > 0 ? (totalCost / totalVials) : 0;

    const pct = totalMg > 0 && hasStock ? Math.round((totalRemaining / totalMg) * 100) : 0;
    const isLow = hasStock && pct < 20;

    html += `
      <div class="compound-inv-card ${isLow ? 'low' : ''}">
        <div class="compound-inv-card-header">
          ${capDots}
          <span class="compound-inv-card-name">${escapeHtml(compoundName)}</span>
          ${orderItems.some(e => e.tested) ? '<span class="inv-tested-badge" title="Tested">&#10003;</span>' : ''}
          ${batchTags}
          ${isLow ? '<span class="inv-low-badge">Low</span>' : ''}
        </div>
        <div class="compound-inv-card-qty">
          <span class="compound-inv-qty-value">${totalVials}</span>
          <span class="compound-inv-qty-unit">vials</span>
          ${amountPerUnit ? '<span class="compound-inv-qty-x">x</span><span class="compound-inv-qty-value">' + amountPerUnit + '</span><span class="compound-inv-qty-unit">mg</span>' : ''}
        </div>
        <div class="compound-inv-card-detail">
          <span>${totalMg.toFixed(0)} mg total</span>
          ${hasStock ? '<span>' + totalRemaining.toFixed(0) + ' mg remaining</span>' : ''}
          ${(inStockVialCount > 0 || inUseVialCount > 0) ? '<span>' + inStockVialCount + ' in stock' + (inUseVialCount > 0 ? ', ' + inUseVialCount + ' in use' : '') + '</span>' : ''}
          ${totalCost > 0 ? '<span class="compound-inv-cost">$' + totalCost.toFixed(2) + (costPerVial > 0 ? ' ($' + costPerVial.toFixed(2) + '/vial)' : '') + '</span>' : ''}
        </div>
        ${hasStock ? `
          <div class="inv-progress-bar-sm">
            <div class="inv-progress-fill ${isLow ? 'low' : ''}" style="width:${Math.min(pct, 100)}%"></div>
          </div>` : ''}
        ${invItems.length > 0 ? `
        <div class="compound-inv-card-actions">
          <button class="btn btn-secondary btn-tiny" onclick="invAdjustCompoundStockPicker('${escapeHtml(compoundName)}', ${amountPerUnit})">Adjust</button>
        </div>` : ''}
        ${Object.entries(inUseCycles).map(([cId, vials]) => {
          const vialCt = vials.length;
          const totalAllocated = vials.reduce((s, v) => s + (v.amountPerUnit || 0), 0);
          const totalRem = vials.reduce((s, v) => s + (v.remainingAmount || 0), 0);
          return `<div class="inv-in-use-badge">In Use: ${vialCt} vial${vialCt !== 1 ? 's' : ''} &mdash; ${totalRem.toFixed(1)}/${totalAllocated.toFixed(1)} mg</div>`;
        }).join('')}
      </div>`;
  }

  container.innerHTML = `<div class="compound-inv-cards-grid">${html}</div>`;
}

function invAdjustCompoundStockPicker(compoundName, amountPerUnit) {
  const vials = _invInventoryData.filter(i =>
    i.compoundName === compoundName &&
    (i.amountPerUnit || 0) === amountPerUnit &&
    i.status !== 'in-use'
  );
  if (vials.length === 0) {
    showToast('No in-stock vials to adjust', 'error');
    return;
  }
  if (vials.length === 1) {
    invAdjustCompoundStock(vials[0].id);
    return;
  }
  // Multiple vials — let user pick by number
  const lines = vials.map((v, i) => {
    const remaining = Number(v.remainingAmount || 0);
    const perVial = Number(v.amountPerUnit || 0);
    const cap = v.capColor && v.capColor !== '#000000' ? ` [${v.capColor}]` : '';
    const batch = v.batchNumber ? ` batch:${v.batchNumber}` : '';
    return `${i + 1}. ${remaining.toFixed(1)}/${perVial} mg${cap}${batch}`;
  });
  const choice = prompt('Which vial to adjust?\n' + lines.join('\n') + '\n\nEnter number:');
  if (choice === null) return;
  const idx = parseInt(choice) - 1;
  if (isNaN(idx) || idx < 0 || idx >= vials.length) {
    showToast('Invalid selection', 'error');
    return;
  }
  invAdjustCompoundStock(vials[idx].id);
}

async function invAdjustCompoundStock(id) {
  const item = _invInventoryData.find(i => i.id === id);
  if (!item) return;

  const current = Number(item.remainingAmount || 0);
  const newAmount = prompt(
    'Adjust remaining amount for ' + item.compoundName +
    '\nCurrent: ' + current.toFixed(1) + ' mg\nEnter new amount:',
    current.toFixed(1)
  );
  if (newAmount === null) return;

  const parsed = parseFloat(newAmount);
  if (isNaN(parsed) || parsed < 0) {
    showToast('Invalid amount', 'error');
    return;
  }

  await window.api.updateInventory(id, { remainingAmount: parsed });
  showToast('Inventory adjusted', 'success');
  await refreshInventoryView();
}

// ═══════════════════════════════════════
// SUPPLIES SUB-TAB
// ═══════════════════════════════════════

function renderSuppliesTab() {
  const container = document.getElementById('inv-tab-supplies');
  if (!container) return;

  if (_invSuppliesData.length === 0) {
    container.innerHTML = `
      <div class="inv-empty-state">
        <p>No supplies tracked yet.</p>
        <p class="inv-empty-hint">Track needles, syringes, filters, vials, BAC water, and more.</p>
        <button class="btn btn-primary btn-small" onclick="openSupplyModal()">Add Supply</button>
      </div>`;
    return;
  }

  // Group by category
  const groups = {};
  for (const supply of _invSuppliesData) {
    const cat = supply.category || 'other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(supply);
  }

  let html = '<div class="inv-supplies-header">' +
    '<button class="btn btn-primary btn-small" onclick="openSupplyModal()">Add Supply</button>' +
    '<button class="btn btn-secondary btn-small" onclick="openUsageConfigModal()">Usage Config</button>' +
    '</div>';

  for (const [category, supplies] of Object.entries(groups)) {
    const catConfig = SUPPLY_CATEGORIES[category] || SUPPLY_CATEGORIES.other;

    const cards = supplies.map(supply => {
      const isLow = supply.quantity <= (supply.lowStockThreshold || 0);
      return `
        <div class="supply-card ${isLow ? 'low' : ''}">
          <div class="supply-card-header">
            <span class="supply-card-name">${escapeHtml(supply.name)}</span>
            ${isLow ? '<span class="inv-low-badge">Low</span>' : ''}
          </div>
          ${supply.specs ? '<div class="supply-card-specs">' + escapeHtml(supply.specs) + '</div>' : ''}
          <div class="supply-card-qty">
            <span class="supply-qty-value">${supply.quantity}</span>
            <span class="supply-qty-unit">${supply.unit || 'pcs'}</span>
          </div>
          <div class="supply-card-actions">
            <button class="btn btn-secondary btn-tiny" onclick="invAdjustSupply('${supply.id}')">Adjust</button>
            <button class="btn btn-secondary btn-tiny" onclick="openSupplyModal('${supply.id}')">Edit</button>
            <button class="btn btn-danger btn-tiny" onclick="invDeleteSupply('${supply.id}')">Del</button>
          </div>
        </div>`;
    }).join('');

    html += `
      <div class="inv-supply-category">
        <h3 class="inv-supply-cat-title">${catConfig.label}</h3>
        <div class="supply-cards-grid">${cards}</div>
      </div>`;
  }

  container.innerHTML = html;
}

function setupSupplyForm() {
  const form = document.getElementById('supply-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitSupply();
  });

  document.getElementById('supply-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeSupplyModal();
  });
}

function openSupplyModal(editId) {
  const modal = document.getElementById('supply-modal');
  const title = document.getElementById('supply-modal-title');

  if (editId) {
    const supply = _invSuppliesData.find(s => s.id === editId);
    if (!supply) return;
    title.textContent = 'Edit Supply';
    document.getElementById('supply-edit-id').value = editId;
    document.getElementById('supply-category').value = supply.category || 'other';
    document.getElementById('supply-name').value = supply.name || '';
    document.getElementById('supply-specs').value = supply.specs || '';
    document.getElementById('supply-quantity').value = supply.quantity || 0;
    document.getElementById('supply-unit').value = supply.unit || 'pcs';
    document.getElementById('supply-low-threshold').value = supply.lowStockThreshold || 10;
    document.getElementById('supply-notes').value = supply.notes || '';
  } else {
    title.textContent = 'Add Supply';
    document.getElementById('supply-edit-id').value = '';
    document.getElementById('supply-form').reset();
    document.getElementById('supply-quantity').value = 0;
    document.getElementById('supply-unit').value = 'pcs';
    document.getElementById('supply-low-threshold').value = 10;
  }

  modal.classList.remove('hidden');
}

function closeSupplyModal() {
  document.getElementById('supply-modal').classList.add('hidden');
}

async function submitSupply() {
  const editId = document.getElementById('supply-edit-id').value;
  const name = document.getElementById('supply-name').value.trim();
  if (!name) {
    showToast('Please enter a name', 'error');
    return;
  }

  const entry = {
    id: editId || generateId(),
    category: document.getElementById('supply-category').value,
    name,
    specs: document.getElementById('supply-specs').value.trim(),
    quantity: parseInt(document.getElementById('supply-quantity').value) || 0,
    unit: document.getElementById('supply-unit').value || 'pcs',
    lowStockThreshold: parseInt(document.getElementById('supply-low-threshold').value) || 0,
    notes: document.getElementById('supply-notes').value.trim(),
    updatedAt: new Date().toISOString()
  };

  if (!editId) {
    entry.createdAt = new Date().toISOString();
  }

  await window.api.saveSupply(entry);
  closeSupplyModal();
  showToast(editId ? 'Supply updated' : 'Supply added', 'success');
  await refreshInventoryView();
}

async function invAdjustSupply(id) {
  const supply = _invSuppliesData.find(s => s.id === id);
  if (!supply) return;

  const newQty = prompt(
    'Adjust quantity for ' + supply.name +
    '\nCurrent: ' + supply.quantity + ' ' + (supply.unit || 'pcs') +
    '\nEnter new quantity:',
    supply.quantity
  );
  if (newQty === null) return;

  const parsed = parseInt(newQty);
  if (isNaN(parsed) || parsed < 0) {
    showToast('Invalid quantity', 'error');
    return;
  }

  await window.api.updateSupply(id, { quantity: parsed, updatedAt: new Date().toISOString() });
  showToast('Supply adjusted', 'success');
  await refreshInventoryView();
}

async function invDeleteSupply(id) {
  if (!confirm('Delete this supply?')) return;
  await window.api.deleteSupply(id);
  showToast('Supply deleted', 'success');
  await refreshInventoryView();
}

// ═══════════════════════════════════════
// ORDERS SUB-TAB
// ═══════════════════════════════════════

function renderOrdersTab() {
  const container = document.getElementById('inv-tab-orders');
  if (!container) return;

  // Status filter pills
  const filterPills = ['all', 'ordered', 'shipped', 'delivered', 'cancelled'].map(status => {
    const label = status === 'all' ? 'All' : (ORDER_STATUS_CONFIG[status]?.label || status);
    return `<button class="inv-order-filter ${_invOrderFilter === status ? 'active' : ''}" onclick="setOrderFilter('${status}')">${label}</button>`;
  }).join('');

  const filtered = _invOrderFilter === 'all'
    ? _invOrdersData
    : _invOrdersData.filter(o => o.status === _invOrderFilter);

  // Sort by date descending
  const sorted = [...filtered].sort((a, b) =>
    new Date(b.orderDate || b.createdAt).getTime() - new Date(a.orderDate || a.createdAt).getTime()
  );

  if (_invOrdersData.length === 0) {
    container.innerHTML = `
      <div class="inv-empty-state">
        <p>No orders tracked yet.</p>
        <p class="inv-empty-hint">Track your compound and supply orders with shipping status.</p>
        <button class="btn btn-primary btn-small" onclick="openOrderModal()">New Order</button>
      </div>`;
    return;
  }

  const orderCards = sorted.map(order => {
    const st = ORDER_STATUS_CONFIG[order.status] || ORDER_STATUS_CONFIG.ordered;
    const dateStr = order.orderDate
      ? new Date(order.orderDate + 'T00:00:00').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : '';
    const lineCount = (order.lineItems || []).length;
    const costStr = order.totalCost
      ? new Intl.NumberFormat(undefined, { style: 'currency', currency: order.currency || 'USD' }).format(order.totalCost)
      : '';

    const lineItemsHtml = (order.lineItems || []).map(li => {
      if (li.type === 'compound') {
        const capDot = li.capColor ? `<span class="oli-cap-dot" style="background:${li.capColor}"></span>` : '';
        const batchStr = li.batchNumber ? ` <span class="order-li-batch">[${escapeHtml(li.batchNumber)}]</span>` : '';
        return `<div class="order-line-item">${capDot}<span class="order-li-type compound">Compound</span> ${escapeHtml(li.compoundName || '')} - ${li.quantity || 1} vial${(li.quantity || 1) !== 1 ? 's' : ''} x ${li.amountPerUnit || '?'} mg${batchStr}</div>`;
      } else {
        return `<div class="order-line-item"><span class="order-li-type supply">Supply</span> ${escapeHtml(li.name || '')} x${li.quantity || 1}</div>`;
      }
    }).join('');

    let actionBtns = '';
    if (order.status === 'ordered') {
      actionBtns = `<button class="btn btn-secondary btn-tiny" onclick="event.stopPropagation(); markOrderShipped('${order.id}')">Mark Shipped</button>`;
    } else if (order.status === 'shipped') {
      actionBtns = `<button class="btn btn-primary btn-tiny" onclick="event.stopPropagation(); markOrderDelivered('${order.id}')">Mark Delivered</button>`;
    }

    return `
      <div class="order-card" onclick="this.classList.toggle('expanded')">
        <div class="order-card-header">
          <div class="order-card-left">
            <span class="order-supplier">${escapeHtml(order.supplier || 'Unknown')}</span>
            <span class="order-date">${dateStr}</span>
            ${order.trackingNumber ? '<span class="order-tracking">#' + escapeHtml(order.trackingNumber) + '</span>' : ''}
          </div>
          <div class="order-card-right">
            ${costStr ? '<span class="order-cost">' + costStr + '</span>' : ''}
            <span class="order-status-badge" style="background:${st.bg};color:${st.color}">${st.label}</span>
            ${actionBtns}
            <button class="btn btn-secondary btn-tiny" onclick="event.stopPropagation(); openOrderModal('${order.id}')">Edit</button>
            <button class="btn btn-danger btn-tiny" onclick="event.stopPropagation(); invDeleteOrder('${order.id}')">Del</button>
          </div>
        </div>
        <div class="order-card-body">
          <div class="order-line-items">${lineItemsHtml || '<span class="text-muted">No line items</span>'}</div>
          ${order.notes ? '<div class="order-notes">' + escapeHtml(order.notes) + '</div>' : ''}
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="inv-orders-header">
      <div class="inv-order-filters">${filterPills}</div>
      <button class="btn btn-primary btn-small" onclick="openOrderModal()">New Order</button>
    </div>
    <div class="order-cards-list">${orderCards}</div>`;
}

function setOrderFilter(status) {
  _invOrderFilter = status;
  renderOrdersTab();
}

// ═══════════════════════════════════════
// ORDER MODAL & FORM
// ═══════════════════════════════════════

function setupOrderForm() {
  const form = document.getElementById('order-form');
  if (!form) return;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    await submitOrder();
  });

  document.getElementById('order-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeOrderModal();
  });
}

function openOrderModal(editId) {
  const modal = document.getElementById('order-modal');
  const title = document.getElementById('order-modal-title');
  _orderLineItemCounter = 0;

  if (editId) {
    const order = _invOrdersData.find(o => o.id === editId);
    if (!order) return;
    title.textContent = 'Edit Order';
    document.getElementById('order-edit-id').value = editId;
    document.getElementById('order-supplier').value = order.supplier || '';
    document.getElementById('order-date').value = order.orderDate || '';
    document.getElementById('order-status').value = order.status || 'ordered';
    document.getElementById('order-tracking').value = order.trackingNumber || '';
    document.getElementById('order-total-cost').value = order.totalCost || '';
    document.getElementById('order-currency').value = order.currency || 'USD';
    document.getElementById('order-notes').value = order.notes || '';

    // Render existing line items
    const lineContainer = document.getElementById('order-line-items');
    lineContainer.innerHTML = '';
    for (const li of (order.lineItems || [])) {
      addOrderLineItem(li.type, li);
    }
  } else {
    title.textContent = 'New Order';
    document.getElementById('order-edit-id').value = '';
    document.getElementById('order-form').reset();
    document.getElementById('order-date').value = new Date().toISOString().slice(0, 10);
    document.getElementById('order-status').value = 'ordered';
    document.getElementById('order-currency').value = 'USD';
    document.getElementById('order-line-items').innerHTML = '';
  }

  modal.classList.remove('hidden');
}

function closeOrderModal() {
  document.getElementById('order-modal').classList.add('hidden');
}

function buildCompoundSelectOptions(selectedName) {
  // Group LIBRARY_DATA by type, plus custom compounds
  const groups = {};
  for (const c of LIBRARY_DATA) {
    const cat = c.type || 'Other';
    if (!groups[cat]) groups[cat] = [];
    groups[cat].push(c);
  }

  let html = '<option value="">Select compound...</option>';
  for (const [type, compounds] of Object.entries(groups)) {
    html += `<optgroup label="${type}s">`;
    for (const c of compounds) {
      const sel = (selectedName && c.name === selectedName) ? ' selected' : '';
      html += `<option value="${escapeHtml(c.name)}"${sel}>${escapeHtml(c.name)}</option>`;
    }
    html += '</optgroup>';
  }
  return html;
}

function addOrderLineItem(type, existing) {
  const container = document.getElementById('order-line-items');
  const idx = _orderLineItemCounter++;
  const div = document.createElement('div');
  div.className = 'order-line-item-row';
  div.dataset.idx = idx;
  div.dataset.type = type;

  if (type === 'compound') {
    const capColor = (existing && existing.capColor) || '#000000';
    const isTested = existing && existing.tested;
    div.innerHTML = `
      <div class="oli-main-row">
        <input type="color" class="oli-cap-color" value="${capColor}" title="Cap color">
        <select class="oli-compound-name">${buildCompoundSelectOptions(existing && existing.compoundName)}</select>
        <div class="oli-field">
          <span class="oli-label">Vials</span>
          <input type="number" class="oli-quantity" min="1" value="${(existing && existing.quantity) || 1}" placeholder="1">
        </div>
        <div class="oli-field">
          <span class="oli-label">mg/vial</span>
          <input type="number" class="oli-amount" step="any" value="${(existing && existing.amountPerUnit) || ''}" placeholder="0">
        </div>
        <div class="oli-field">
          <span class="oli-label">Batch #</span>
          <input type="text" class="oli-batch" value="${escapeHtml((existing && existing.batchNumber) || '')}" placeholder="—">
        </div>
        <div class="oli-field">
          <span class="oli-label">Cost</span>
          <input type="number" class="oli-cost" step="0.01" min="0" value="${(existing && existing.cost) || ''}" placeholder="0.00" oninput="updateOrderTotalCost()">
        </div>
        <div class="oli-field">
          <span class="oli-label">Tested</span>
          <input type="checkbox" class="oli-tested" ${isTested ? 'checked' : ''}>
        </div>
        <button type="button" class="btn btn-danger btn-tiny" onclick="this.closest('.order-line-item-row').remove()">X</button>
      </div>
      <div class="oli-test-file-row ${isTested ? '' : 'hidden'}">
        <span class="oli-label">Test Results</span>
        <button type="button" class="btn btn-secondary btn-tiny oli-upload-btn">${existing && existing.testFile ? escapeHtml(existing.testFileName || 'File uploaded') : 'Upload File'}</button>
        <input type="hidden" class="oli-test-file" value="${escapeHtml((existing && existing.testFile) || '')}">
        <input type="hidden" class="oli-test-file-name" value="${escapeHtml((existing && existing.testFileName) || '')}">
        ${existing && existing.testFile ? '<button type="button" class="btn btn-secondary btn-tiny oli-view-btn">View</button>' : ''}
      </div>`;
    // Toggle test file row visibility on checkbox change
    const checkbox = div.querySelector('.oli-tested');
    const fileRow = div.querySelector('.oli-test-file-row');
    checkbox.addEventListener('change', () => {
      fileRow.classList.toggle('hidden', !checkbox.checked);
    });
    // Upload button handler
    div.querySelector('.oli-upload-btn').addEventListener('click', async () => {
      const result = await window.api.pickTestFile();
      if (result) {
        div.querySelector('.oli-test-file').value = result.filePath;
        div.querySelector('.oli-test-file-name').value = result.fileName;
        div.querySelector('.oli-upload-btn').textContent = result.fileName;
        // Add view button if not present
        if (!div.querySelector('.oli-view-btn')) {
          const viewBtn = document.createElement('button');
          viewBtn.type = 'button';
          viewBtn.className = 'btn btn-secondary btn-tiny oli-view-btn';
          viewBtn.textContent = 'View';
          viewBtn.addEventListener('click', () => {
            window.api.openTestFile(div.querySelector('.oli-test-file').value);
          });
          fileRow.appendChild(viewBtn);
        }
      }
    });
    // View button handler (for existing files)
    const viewBtn = div.querySelector('.oli-view-btn');
    if (viewBtn) {
      viewBtn.addEventListener('click', () => {
        window.api.openTestFile(div.querySelector('.oli-test-file').value);
      });
    }
  } else {
    div.innerHTML = `
      <span class="order-li-badge supply">Supply</span>
      <input type="text" class="oli-name" placeholder="Supply name" value="${escapeHtml((existing && existing.name) || '')}">
      <select class="oli-category">
        ${Object.entries(SUPPLY_CATEGORIES).map(([k, v]) =>
          `<option value="${k}" ${(existing && existing.category) === k ? 'selected' : ''}>${v.label}</option>`
        ).join('')}
      </select>
      <input type="number" class="oli-quantity" placeholder="Qty" min="1" value="${(existing && existing.quantity) || 1}" style="width:60px">
      <input type="text" class="oli-specs" placeholder="Specs" value="${escapeHtml((existing && existing.specs) || '')}" style="width:100px">
      <input type="number" class="oli-cost" step="0.01" min="0" placeholder="Cost" value="${(existing && existing.cost) || ''}" style="width:70px" oninput="updateOrderTotalCost()">
      <button type="button" class="btn btn-danger btn-tiny" onclick="this.parentElement.remove()">X</button>`;
  }

  container.appendChild(div);
}

function collectOrderLineItems() {
  const items = [];
  document.querySelectorAll('.order-line-item-row').forEach(row => {
    const type = row.dataset.type;
    if (type === 'compound') {
      const tested = row.querySelector('.oli-tested') ? row.querySelector('.oli-tested').checked : false;
      items.push({
        type: 'compound',
        compoundName: row.querySelector('.oli-compound-name').value,
        quantity: parseInt(row.querySelector('.oli-quantity').value) || 1,
        amountPerUnit: parseFloat(row.querySelector('.oli-amount').value) || 0,
        format: 'vial',
        batchNumber: row.querySelector('.oli-batch').value.trim(),
        capColor: row.querySelector('.oli-cap-color').value || '#000000',
        cost: parseFloat(row.querySelector('.oli-cost').value) || 0,
        tested,
        testFile: tested && row.querySelector('.oli-test-file') ? row.querySelector('.oli-test-file').value.trim() : '',
        testFileName: tested && row.querySelector('.oli-test-file-name') ? row.querySelector('.oli-test-file-name').value.trim() : ''
      });
    } else {
      items.push({
        type: 'supply',
        name: row.querySelector('.oli-name').value.trim(),
        category: row.querySelector('.oli-category').value,
        quantity: parseInt(row.querySelector('.oli-quantity').value) || 1,
        specs: row.querySelector('.oli-specs').value.trim(),
        cost: parseFloat(row.querySelector('.oli-cost').value) || 0
      });
    }
  });
  return items;
}

function updateOrderTotalCost() {
  let total = 0;
  document.querySelectorAll('.order-line-item-row .oli-cost').forEach(input => {
    total += parseFloat(input.value) || 0;
  });
  document.getElementById('order-total-cost').value = total > 0 ? total.toFixed(2) : '';
}

async function submitOrder() {
  const editId = document.getElementById('order-edit-id').value;
  const supplier = document.getElementById('order-supplier').value.trim();
  if (!supplier) {
    showToast('Please enter a supplier', 'error');
    return;
  }

  const now = new Date().toISOString();
  const status = document.getElementById('order-status').value;

  const entry = {
    id: editId || generateId(),
    orderDate: document.getElementById('order-date').value,
    supplier,
    status,
    trackingNumber: document.getElementById('order-tracking').value.trim(),
    shippedDate: status === 'shipped' || status === 'delivered' ? now : null,
    deliveredDate: status === 'delivered' ? now : null,
    totalCost: parseFloat(document.getElementById('order-total-cost').value) || null,
    currency: document.getElementById('order-currency').value,
    notes: document.getElementById('order-notes').value.trim(),
    lineItems: collectOrderLineItems(),
    statusHistory: [],
    updatedAt: now
  };

  if (!editId) {
    entry.createdAt = now;
    entry.statusHistory = [{ status, date: now }];
  } else {
    // Preserve existing history
    const existing = _invOrdersData.find(o => o.id === editId);
    entry.statusHistory = existing ? [...(existing.statusHistory || []), { status, date: now }] : [{ status, date: now }];
    entry.createdAt = existing ? existing.createdAt : now;
    entry.shippedDate = existing ? existing.shippedDate : entry.shippedDate;
    entry.deliveredDate = existing ? existing.deliveredDate : entry.deliveredDate;
  }

  await window.api.saveOrder(entry);
  closeOrderModal();
  showToast(editId ? 'Order updated' : 'Order created', 'success');
  await refreshInventoryView();
}

async function invDeleteOrder(id) {
  if (!confirm('Delete this order?')) return;
  await window.api.deleteOrder(id);
  showToast('Order deleted', 'success');
  await refreshInventoryView();
}

// ═══════════════════════════════════════
// ORDER STATUS TRANSITIONS (Phase 2)
// ═══════════════════════════════════════

async function markOrderShipped(id) {
  const order = _invOrdersData.find(o => o.id === id);
  if (!order) return;

  const tracking = prompt('Enter tracking number (optional):', order.trackingNumber || '');
  if (tracking === null) return; // cancelled

  order.status = 'shipped';
  order.trackingNumber = tracking;
  order.shippedDate = new Date().toISOString();
  order.statusHistory = [...(order.statusHistory || []), { status: 'shipped', date: order.shippedDate }];
  order.updatedAt = order.shippedDate;

  await window.api.saveOrder(order);
  showToast('Order marked as shipped', 'success');
  await refreshInventoryView();
}

async function markOrderDelivered(id) {
  const order = _invOrdersData.find(o => o.id === id);
  if (!order) return;

  const now = new Date().toISOString();
  order.status = 'delivered';
  order.deliveredDate = now;
  order.statusHistory = [...(order.statusHistory || []), { status: 'delivered', date: now }];
  order.updatedAt = now;

  await window.api.saveOrder(order);

  // Auto-add items to inventory
  const lineItems = order.lineItems || [];
  let addedCount = 0;

  for (const li of lineItems) {
    if (li.type === 'compound' && li.compoundName) {
      const noteParts = ['From order: ' + (order.supplier || '')];
      if (li.batchNumber) noteParts.push('Batch: ' + li.batchNumber);
      if (li.capColor && li.capColor !== '#000000') noteParts.push('Cap: ' + li.capColor);

      // Create one inventory entry per physical vial
      const vialCount = li.quantity || 1;
      for (let v = 0; v < vialCount; v++) {
        const entry = {
          id: generateId(),
          compoundName: li.compoundName,
          format: 'vial',
          quantity: 1,
          amountPerUnit: li.amountPerUnit || 0,
          volumePerUnit: null,
          expiryDate: null,
          remainingAmount: li.amountPerUnit || 0,
          batchNumber: li.batchNumber || null,
          capColor: li.capColor || null,
          status: 'in-stock',
          notes: noteParts.join(' | ')
        };
        await window.api.saveInventory(entry);
      }
      addedCount++;
    } else if (li.type === 'supply' && li.name) {
      // Find existing supply by name+category or create new
      const existing = _invSuppliesData.find(s =>
        s.name.toLowerCase() === li.name.toLowerCase() && s.category === li.category
      );
      if (existing) {
        existing.quantity = (existing.quantity || 0) + (li.quantity || 1);
        existing.updatedAt = now;
        await window.api.saveSupply(existing);
      } else {
        const entry = {
          id: generateId(),
          category: li.category || 'other',
          name: li.name,
          specs: li.specs || '',
          quantity: li.quantity || 1,
          unit: 'pcs',
          lowStockThreshold: 10,
          notes: 'From order: ' + (order.supplier || ''),
          createdAt: now,
          updatedAt: now
        };
        await window.api.saveSupply(entry);
      }
      addedCount++;
    }
  }

  if (addedCount > 0) {
    showToast(`Order delivered — ${addedCount} item(s) added to inventory`, 'success');
  } else {
    showToast('Order marked as delivered', 'success');
  }

  await refreshInventoryView();
}

// ═══════════════════════════════════════
// SUPPLY USAGE CONFIG (Phase 3)
// ═══════════════════════════════════════

function openUsageConfigModal() {
  // Render inline in the supplies tab
  const container = document.getElementById('inv-tab-supplies');
  let configEl = document.getElementById('inv-usage-config-section');
  if (configEl) {
    configEl.remove();
    return; // toggle off
  }

  configEl = document.createElement('div');
  configEl.id = 'inv-usage-config-section';
  configEl.className = 'inv-usage-config-section';

  const routes = ['intramuscular', 'subcutaneous', 'oral', 'intravenous', 'topical'];
  const routeLabels = { intramuscular: 'IM', subcutaneous: 'SubQ', oral: 'Oral', intravenous: 'IV', topical: 'Topical' };
  const defaults = _invUsageConfig.globalDefaults || {};

  let routeSections = '';
  for (const route of routes) {
    const items = defaults[route] || [];
    const itemRows = items.map((item, idx) =>
      `<div class="usage-config-row">
        <select class="uc-category" data-route="${route}" data-idx="${idx}">
          ${Object.entries(SUPPLY_CATEGORIES).map(([k, v]) =>
            `<option value="${k}" ${item.category === k ? 'selected' : ''}>${v.label}</option>`
          ).join('')}
        </select>
        <input type="text" class="uc-name" data-route="${route}" data-idx="${idx}" value="${escapeHtml(item.name || '')}" placeholder="Name">
        <input type="number" class="uc-qty" data-route="${route}" data-idx="${idx}" value="${item.quantityPerDose || 1}" min="1" style="width:50px">
        <span class="text-muted">per dose</span>
        <button class="btn btn-danger btn-tiny" onclick="removeUsageConfigItem('${route}', ${idx})">X</button>
      </div>`
    ).join('');

    routeSections += `
      <div class="usage-config-route">
        <h4>${routeLabels[route]} Defaults</h4>
        <div class="usage-config-items" id="uc-items-${route}">${itemRows}</div>
        <button class="btn btn-secondary btn-tiny" onclick="addUsageConfigItem('${route}')">+ Add</button>
      </div>`;
  }

  configEl.innerHTML = `
    <div class="inv-usage-config-panel">
      <div class="inv-usage-config-header">
        <h3>Supply Usage Config</h3>
        <p class="inv-empty-hint">Define which supplies are auto-deducted per dose by route.</p>
      </div>
      ${routeSections}
      <div class="inv-form-actions" style="margin-top:12px">
        <button class="btn btn-primary btn-small" onclick="saveUsageConfig()">Save Config</button>
        <button class="btn btn-secondary btn-small" onclick="document.getElementById('inv-usage-config-section').remove()">Close</button>
      </div>
    </div>`;

  // Insert after header
  const header = container.querySelector('.inv-supplies-header');
  if (header && header.nextSibling) {
    container.insertBefore(configEl, header.nextSibling);
  } else {
    container.appendChild(configEl);
  }
}

function addUsageConfigItem(route) {
  const itemsContainer = document.getElementById('uc-items-' + route);
  if (!itemsContainer) return;
  const idx = itemsContainer.children.length;
  const div = document.createElement('div');
  div.className = 'usage-config-row';
  div.innerHTML = `
    <select class="uc-category" data-route="${route}" data-idx="${idx}">
      ${Object.entries(SUPPLY_CATEGORIES).map(([k, v]) =>
        `<option value="${k}">${v.label}</option>`
      ).join('')}
    </select>
    <input type="text" class="uc-name" data-route="${route}" data-idx="${idx}" value="" placeholder="Name">
    <input type="number" class="uc-qty" data-route="${route}" data-idx="${idx}" value="1" min="1" style="width:50px">
    <span class="text-muted">per dose</span>
    <button class="btn btn-danger btn-tiny" onclick="this.parentElement.remove()">X</button>`;
  itemsContainer.appendChild(div);
}

function removeUsageConfigItem(route, idx) {
  const itemsContainer = document.getElementById('uc-items-' + route);
  if (!itemsContainer || !itemsContainer.children[idx]) return;
  itemsContainer.children[idx].remove();
}

async function saveUsageConfig() {
  const routes = ['intramuscular', 'subcutaneous', 'oral', 'intravenous', 'topical'];
  const globalDefaults = {};

  for (const route of routes) {
    const itemsContainer = document.getElementById('uc-items-' + route);
    if (!itemsContainer) { globalDefaults[route] = []; continue; }

    const items = [];
    for (const row of itemsContainer.children) {
      const category = row.querySelector('.uc-category')?.value || 'other';
      const name = row.querySelector('.uc-name')?.value?.trim() || '';
      const quantityPerDose = parseInt(row.querySelector('.uc-qty')?.value) || 1;
      if (name) {
        items.push({ category, name, quantityPerDose });
      }
    }
    globalDefaults[route] = items;
  }

  _invUsageConfig.globalDefaults = globalDefaults;
  await window.api.saveSupplyUsageConfig(_invUsageConfig);
  showToast('Usage config saved', 'success');
  document.getElementById('inv-usage-config-section')?.remove();
}

// ═══════════════════════════════════════
// SUPPLY AUTO-DEDUCTION (Phase 3)
// ═══════════════════════════════════════

async function deductSuppliesForDose(compoundName, route) {
  // Load latest config
  const config = await window.api.getSupplyUsageConfig();
  const supplies = await window.api.getSupplies();

  // Check for compound-specific override first, then global default
  const overrides = config.compoundOverrides || {};
  const usageItems = overrides[compoundName] || (config.globalDefaults || {})[route] || [];

  if (usageItems.length === 0) return;

  for (const item of usageItems) {
    // Find matching supply by name (case-insensitive) and category
    const match = supplies.find(s =>
      (s.name || '').toLowerCase() === (item.name || '').toLowerCase() &&
      s.category === item.category &&
      s.quantity > 0
    );
    if (match) {
      const newQty = Math.max(0, match.quantity - (item.quantityPerDose || 1));
      await window.api.updateSupply(match.id, { quantity: newQty, updatedAt: new Date().toISOString() });
    }
  }
}

// ═══════════════════════════════════════
// CYCLE SUPPLY REQUIREMENTS (Phase 4)
// ═══════════════════════════════════════

async function calculateCycleSupplyRequirements(cycle) {
  const config = await window.api.getSupplyUsageConfig();
  const supplies = await window.api.getSupplies();
  const requirements = {}; // key: "category:name" => { ...item, needed, available }

  const scheduled = cycle.scheduledDoses || [];
  // If no scheduled doses, estimate from entries
  const dosesList = scheduled.length > 0
    ? scheduled
    : estimateDosesFromEntries(cycle);

  for (const dose of dosesList) {
    const route = dose.route || 'subcutaneous';
    const compoundName = dose.compoundName;
    const overrides = config.compoundOverrides || {};
    const usageItems = overrides[compoundName] || (config.globalDefaults || {})[route] || [];

    for (const item of usageItems) {
      const key = item.category + ':' + item.name.toLowerCase();
      if (!requirements[key]) {
        requirements[key] = {
          category: item.category,
          name: item.name,
          needed: 0,
          available: 0
        };
        // Find matching supply
        const match = supplies.find(s =>
          (s.name || '').toLowerCase() === (item.name || '').toLowerCase() &&
          s.category === item.category
        );
        if (match) requirements[key].available = match.quantity;
      }
      requirements[key].needed += (item.quantityPerDose || 1);
    }
  }

  return Object.values(requirements);
}

function estimateDosesFromEntries(cycle) {
  // Rough estimate: generate dose count from entries
  const doses = [];
  for (const entry of (cycle.entries || [])) {
    const doseCount = estimateEntryDoseCount(entry);
    for (let i = 0; i < doseCount; i++) {
      doses.push({ compoundName: entry.compoundName, route: entry.route || 'subcutaneous' });
    }
  }
  return doses;
}

function estimateEntryDoseCount(entry) {
  const days = entry.durationDays || 0;
  switch (entry.frequency) {
    case 'daily': return days;
    case '2x_daily': return days * 2;
    case '3x_weekly': return Math.round(days * 3 / 7);
    case 'eod': return Math.ceil(days / 2);
    case 'weekly': return Math.ceil(days / 7);
    case 'every_n_days':
    case 'custom':
      return entry.customFreqDays > 0 ? Math.ceil(days / entry.customFreqDays) : days;
    case 'custom_days':
      return entry.customDays ? Math.round(days * entry.customDays.length / 7) : days;
    default: return days;
  }
}

async function renderCycleSupplyRequirements(cycle, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const requirements = await calculateCycleSupplyRequirements(cycle);

  if (requirements.length === 0) {
    container.innerHTML = '';
    return;
  }

  const cards = requirements.map(req => {
    const sufficient = req.available >= req.needed;
    const deficit = Math.max(0, req.needed - req.available);
    const catConfig = SUPPLY_CATEGORIES[req.category] || SUPPLY_CATEGORIES.other;

    return `
      <div class="cycle-supply-req-card ${sufficient ? 'sufficient' : 'insufficient'}">
        <div class="cycle-supply-req-name">${escapeHtml(req.name)}</div>
        <div class="cycle-supply-req-cat">${catConfig.label}</div>
        <div class="cycle-supply-req-qty">
          <span class="cycle-supply-needed">Need: ${req.needed}</span>
          <span class="cycle-supply-available ${sufficient ? '' : 'low'}">Have: ${req.available}</span>
        </div>
        ${!sufficient ? '<div class="cycle-supply-deficit">Short ' + deficit + '</div>' : ''}
      </div>`;
  }).join('');

  container.innerHTML = `
    <div class="detail-section" style="margin-top:16px">
      <h3 class="detail-section-title">Supply Requirements</h3>
      <div class="cycle-supply-req-grid">${cards}</div>
    </div>`;
}

// ═══════════════════════════════════════
// CYCLE INVENTORY ALLOCATION
// ═══════════════════════════════════════

async function allocateVialsToCycle(cycleId, vialIds) {
  let count = 0;
  for (const id of vialIds) {
    await window.api.updateInventory(id, { status: 'in-use', cycleId });
    count++;
  }
  return count;
}

// Ensure every delivered order's compound line items have corresponding inventory entries.
// Orders are the source of truth for what's been purchased; inventory entries track remaining amounts.
// If an order was created directly with "delivered" status (not transitioned via Mark Delivered),
// inventory entries were never auto-created. This function fills that gap.
async function reconcileDeliveredOrders() {
  const orders = await window.api.getOrders();
  const inventory = await window.api.getInventory();

  // Build a set of order IDs that already have inventory entries (check notes for "From order:")
  const existingCompounds = new Set(inventory.map(i => (i.compoundName || '').toLowerCase()));

  for (const order of orders) {
    if (order.status !== 'delivered') continue;
    const lineItems = order.lineItems || [];

    for (const li of lineItems) {
      if (li.type !== 'compound' || !li.compoundName) continue;

      // Check if any inventory entry exists for this compound + mg size
      const nameLower = li.compoundName.toLowerCase();
      const liMg = li.amountPerUnit || 0;
      const hasEntry = inventory.some(i =>
        (i.compoundName || '').toLowerCase() === nameLower &&
        (i.amountPerUnit || 0) === liMg &&
        (i.remainingAmount || 0) > 0
      );
      if (hasEntry) continue;

      // Also check if there's a zero-remaining entry (already consumed) — don't re-create
      const hasAnyEntry = inventory.some(i =>
        (i.compoundName || '').toLowerCase() === nameLower &&
        (i.amountPerUnit || 0) === liMg
      );
      if (hasAnyEntry) continue;

      // No inventory entry at all for this compound — create per-vial entries from the delivered order
      if ((li.amountPerUnit || 0) <= 0) continue;

      const noteParts = ['From order: ' + (order.supplier || '')];
      if (li.batchNumber) noteParts.push('Batch: ' + li.batchNumber);

      const vialCount = li.quantity || 1;
      for (let v = 0; v < vialCount; v++) {
        const entry = {
          id: generateId(),
          compoundName: li.compoundName,
          format: 'vial',
          quantity: 1,
          amountPerUnit: li.amountPerUnit || 0,
          remainingAmount: li.amountPerUnit || 0,
          batchNumber: li.batchNumber || null,
          capColor: li.capColor || null,
          status: 'in-stock',
          notes: noteParts.join(' | '),
          createdAt: new Date().toISOString()
        };
        await window.api.saveInventory(entry);

        // Add to local array so subsequent iterations see it
        inventory.push(entry);
      }
    }
  }
}

async function returnCycleInventory(cycleId) {
  const inventory = await window.api.getInventory();
  const inUseItems = inventory.filter(i => i.status === 'in-use' && i.cycleId === cycleId);
  const returned = [];

  for (const item of inUseItems) {
    // Flip vial back to in-stock
    await window.api.updateInventory(item.id, {
      status: 'in-stock',
      cycleId: null
    });
    returned.push({
      compoundName: item.compoundName,
      amount: item.remainingAmount || 0,
      vialCount: 1
    });
  }

  return returned;
}

async function getCycleAllocations(cycleId) {
  const inventory = await window.api.getInventory();
  return inventory.filter(i => i.status === 'in-use' && i.cycleId === cycleId);
}

// ═══════════════════════════════════════
// NAVIGATE TO INVENTORY TAB
// ═══════════════════════════════════════

function navigateToInventoryTab(compoundName) {
  switchView('inventory');
  // If a compound name is given, ensure we're on the compounds sub-tab
  if (compoundName) {
    _invCurrentTab = 'compounds';
    document.querySelectorAll('.inv-sub-btn').forEach(b => b.classList.remove('active'));
    const compoundsBtn = document.querySelector('.inv-sub-btn[data-subtab="compounds"]');
    if (compoundsBtn) compoundsBtn.classList.add('active');
    document.querySelectorAll('.inv-tab-content').forEach(t => t.classList.remove('active'));
    const tab = document.getElementById('inv-tab-compounds');
    if (tab) tab.classList.add('active');
  }
}

// ═══════════════════════════════════════
// EXPOSE TO GLOBAL SCOPE
// ═══════════════════════════════════════

window.initInventory = initInventory;
window.refreshInventoryView = refreshInventoryView;
window.navigateToInventoryTab = navigateToInventoryTab;

// Compounds sub-tab
window.invAdjustCompoundStock = invAdjustCompoundStock;
window.invAdjustCompoundStockPicker = invAdjustCompoundStockPicker;

// Supplies sub-tab
window.openSupplyModal = openSupplyModal;
window.closeSupplyModal = closeSupplyModal;
window.invAdjustSupply = invAdjustSupply;
window.invDeleteSupply = invDeleteSupply;
window.openUsageConfigModal = openUsageConfigModal;
window.addUsageConfigItem = addUsageConfigItem;
window.removeUsageConfigItem = removeUsageConfigItem;
window.saveUsageConfig = saveUsageConfig;

// Orders sub-tab
window.openOrderModal = openOrderModal;
window.closeOrderModal = closeOrderModal;
window.addOrderLineItem = addOrderLineItem;
window.updateOrderTotalCost = updateOrderTotalCost;
window.invDeleteOrder = invDeleteOrder;
window.setOrderFilter = setOrderFilter;
window.markOrderShipped = markOrderShipped;
window.markOrderDelivered = markOrderDelivered;

// Supply deduction
window.deductSuppliesForDose = deductSuppliesForDose;

// Cycle integration
window.calculateCycleSupplyRequirements = calculateCycleSupplyRequirements;
window.renderCycleSupplyRequirements = renderCycleSupplyRequirements;

// Cycle inventory allocation
window.allocateVialsToCycle = allocateVialsToCycle;
window.returnCycleInventory = returnCycleInventory;
window.getCycleAllocations = getCycleAllocations;
window.reconcileDeliveredOrders = reconcileDeliveredOrders;
