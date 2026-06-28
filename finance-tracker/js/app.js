/* ═══════════════════════════════════════════════
   MAGHARIAN FINANCE TRACKER — MAIN APP
   ═══════════════════════════════════════════════ */

// ─── STATE ─────────────────────────────────────
const State = {
  business: 'repair',   // 'repair' | 'store'
  section: 'dashboard',
};

// ─── HELPERS ───────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);
const today = () => new Date().toISOString().split('T')[0];
const fmt = (n, cur = 'ILS') => {
  const syms = { ILS: '₪', USD: '$', EUR: '€' };
  const sym = syms[cur] || cur;
  return `${sym}${Number(n || 0).toFixed(2)}`;
};
const fmtDate = d => d ? new Date(d + 'T00:00:00').toLocaleDateString() : '';
const ym = (date, monthStr) => {
  if (!date || !monthStr) return false;
  return date.startsWith(monthStr);
};

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  const icons = { success: '✓', error: '✕', warning: '⚠', info: 'ℹ' };
  el.innerHTML = `<span>${icons[type] || 'ℹ'}</span> ${msg}`;
  $('toast-container').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function confirm(msg) {
  return window.confirm(msg);
}

function currentMonth() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function dateRange(monthStr) {
  const [y, m] = monthStr.split('-').map(Number);
  const start = `${y}-${String(m).padStart(2,'0')}-01`;
  const end = new Date(y, m, 0);
  const endStr = `${y}-${String(m).padStart(2,'0')}-${String(end.getDate()).padStart(2,'0')}`;
  return { start, end: endStr };
}

// ─── NAVIGATION ────────────────────────────────
function navigate(section) {
  State.section = section;
  $$('.section').forEach(s => s.classList.remove('active'));
  const target = $(`section-${section}`);
  if (target) target.classList.add('active');

  $$('.nav-item').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.section === section);
  });

  refresh(section);
}

function switchBusiness(biz) {
  State.business = biz;
  document.body.className = `business-${biz}`;

  // Header
  $$('.biz-btn').forEach(b => b.classList.toggle('active', b.dataset.biz === biz));
  $('biz-name').textContent = I18N.t(biz === 'repair' ? 'repairShop' : 'convenienceStore');

  // Nav groups
  document.querySelector('.repair-nav').style.display = biz === 'repair' ? '' : 'none';
  document.querySelector('.store-nav').style.display = biz === 'store' ? '' : 'none';
  $('repair-quick').style.display = biz === 'repair' ? '' : 'none';
  $('store-quick').style.display = biz === 'store' ? '' : 'none';

  localStorage.setItem('business', biz);
  navigate('dashboard');
}

// ─── REFRESH DISPATCHER ────────────────────────
async function refresh(section) {
  try {
    switch (section) {
      case 'dashboard': await renderDashboard(); break;
      case 'repair-jobs': await renderRepairJobs(); break;
      case 'product-sales': await renderProductSales(); break;
      case 'inventory': await renderInventory(); break;
      case 'daily-sales': await renderDailySales(); break;
      case 'customer-credit': await renderCustomerCredit(); break;
      case 'expenses': await renderExpenses(); break;
      case 'reports': break;
    }
  } catch (e) {
    console.error('Refresh error:', e);
  }
}

// ─── DASHBOARD ─────────────────────────────────
async function renderDashboard() {
  $('today-date').textContent = new Date().toLocaleDateString(undefined, { weekday:'long', year:'numeric', month:'long', day:'numeric' });
  const cards = $('summary-cards');
  const recent = $('recent-list');

  if (State.business === 'repair') {
    const [jobs, sales, expenses] = await Promise.all([
      DB.getAll(DB.STORES.repairJobs),
      DB.getAll(DB.STORES.productSales),
      DB.getAll(DB.STORES.expenses)
    ]);

    const tod = today();
    const todayJobs = jobs.filter(j => j.date === tod);
    const todaySales = sales.filter(s => s.date === tod);
    const todayExp = expenses.filter(e => e.date === tod && e.business === 'repair');

    const repairRev = todayJobs.reduce((s, j) => s + (j.customerCharge || 0), 0);
    const salesRev = todaySales.reduce((s, p) => s + (p.sellingPrice * p.quantity || 0), 0);
    const totalRev = repairRev + salesRev;
    const totalExp = todayExp.filter(e => e.currency === 'ILS').reduce((s, e) => s + (e.amount || 0), 0);
    const netProfit = todayJobs.reduce((s, j) => s + (j.profit || 0), 0)
                   + todaySales.reduce((s, p) => s + (p.totalProfit || 0), 0)
                   - totalExp;

    const pendingJobs = jobs.filter(j => j.status === 'pending').length;

    cards.innerHTML = `
      <div class="summary-card card-info">
        <div class="card-icon">💰</div>
        <div class="card-label">${I18N.t('totalRevenue')}</div>
        <div class="card-value">${fmt(totalRev)}</div>
        <div class="card-sub">${I18N.t('repairJobsCount')}: ${fmt(repairRev)} · ${I18N.t('productSalesCount')}: ${fmt(salesRev)}</div>
      </div>
      <div class="summary-card card-negative">
        <div class="card-icon">📉</div>
        <div class="card-label">${I18N.t('totalExpenses')}</div>
        <div class="card-value">${fmt(totalExp)}</div>
        <div class="card-sub">${todayExp.length} ${I18N.t('expenses').toLowerCase()}</div>
      </div>
      <div class="summary-card ${netProfit >= 0 ? 'card-positive' : 'card-negative'}">
        <div class="card-icon">${netProfit >= 0 ? '📈' : '📉'}</div>
        <div class="card-label">${I18N.t('netProfit')}</div>
        <div class="card-value ${netProfit >= 0 ? 'profit' : 'loss'}">${fmt(netProfit)}</div>
        <div class="card-sub">Today</div>
      </div>
      <div class="summary-card card-warning">
        <div class="card-icon">🔧</div>
        <div class="card-label">${I18N.t('pending')}</div>
        <div class="card-value">${pendingJobs}</div>
        <div class="card-sub">${I18N.t('repairJobs').toLowerCase()}</div>
      </div>
    `;

    // Recent
    const allRecent = [
      ...todayJobs.map(j => ({ type: 'repair', icon: '🔧', title: `${j.customerName} — ${j.deviceType}`, sub: fmtDate(j.date), amount: j.customerCharge, positive: true })),
      ...todaySales.map(s => ({ type: 'sale', icon: '🛍️', title: s.productType, sub: `x${s.quantity}`, amount: s.sellingPrice * s.quantity, positive: true })),
      ...todayExp.map(e => ({ type: 'expense', icon: '💸', title: e.category, sub: e.notes || '', amount: e.amount, positive: false, currency: e.currency })),
    ].slice(-8);

    recent.innerHTML = allRecent.length
      ? allRecent.map(tx => `
        <div class="tx-item">
          <div class="tx-left">
            <div class="tx-icon">${tx.icon}</div>
            <div class="tx-info">
              <div class="tx-title">${tx.title}</div>
              <div class="tx-sub">${tx.sub}</div>
            </div>
          </div>
          <div class="tx-right">
            <div class="tx-amount ${tx.positive ? 'positive' : 'negative'}">${tx.positive ? '+' : '-'}${fmt(tx.amount, tx.currency || 'ILS')}</div>
          </div>
        </div>
      `).join('')
      : `<div class="empty-state"><p>No transactions today</p></div>`;

    await renderWeeklyChart('repair', jobs, sales);
    await renderCategoryChart('repair', jobs, sales);

  } else {
    const [dailySales, credits, expenses] = await Promise.all([
      DB.getAll(DB.STORES.dailySales),
      DB.getAll(DB.STORES.customerCredits),
      DB.getAll(DB.STORES.expenses)
    ]);

    const tod = today();
    const todaySale = dailySales.find(s => s.date === tod);
    const todayExp = expenses.filter(e => e.date === tod && e.business === 'store' && e.currency === 'ILS');
    const totalRev = todaySale ? (todaySale.cashTotal + todaySale.visaTotal) : 0;
    const totalExp = todayExp.reduce((s, e) => s + (e.amount || 0), 0);
    const netProfit = totalRev - totalExp;
    const outstanding = credits
      .filter(c => c.status === 'active')
      .reduce((s, c) => s + (c.currentBalance || 0), 0);

    cards.innerHTML = `
      <div class="summary-card card-info">
        <div class="card-icon">💰</div>
        <div class="card-label">${I18N.t('totalRevenue')}</div>
        <div class="card-value">${fmt(totalRev)}</div>
        <div class="card-sub">${I18N.t('cash')}: ${fmt(todaySale?.cashTotal)} · ${I18N.t('visa')}: ${fmt(todaySale?.visaTotal)}</div>
      </div>
      <div class="summary-card card-negative">
        <div class="card-icon">📉</div>
        <div class="card-label">${I18N.t('totalExpenses')}</div>
        <div class="card-value">${fmt(totalExp)}</div>
        <div class="card-sub">${todayExp.length} ${I18N.t('expenses').toLowerCase()}</div>
      </div>
      <div class="summary-card ${netProfit >= 0 ? 'card-positive' : 'card-negative'}">
        <div class="card-icon">${netProfit >= 0 ? '📈' : '📉'}</div>
        <div class="card-label">${I18N.t('netProfit')}</div>
        <div class="card-value ${netProfit >= 0 ? 'profit' : 'loss'}">${fmt(netProfit)}</div>
        <div class="card-sub">Today</div>
      </div>
      <div class="summary-card card-warning">
        <div class="card-icon">👥</div>
        <div class="card-label">${I18N.t('outstandingCredit')}</div>
        <div class="card-value">${fmt(outstanding)}</div>
        <div class="card-sub">${credits.filter(c => c.status === 'active').length} active</div>
      </div>
    `;

    recent.innerHTML = todaySale
      ? `<div class="tx-item"><div class="tx-left"><div class="tx-icon">💵</div><div class="tx-info"><div class="tx-title">Cash Sales</div><div class="tx-sub">${fmtDate(todaySale.date)}</div></div></div><div class="tx-right"><div class="tx-amount positive">+${fmt(todaySale.cashTotal)}</div></div></div>
         <div class="tx-item"><div class="tx-left"><div class="tx-icon">💳</div><div class="tx-info"><div class="tx-title">Card Sales</div><div class="tx-sub">${fmtDate(todaySale.date)}</div></div></div><div class="tx-right"><div class="tx-amount positive">+${fmt(todaySale.visaTotal)}</div></div></div>`
      : `<div class="empty-state"><p>No sales entered today</p></div>`;

    await renderWeeklyChart('store', dailySales, []);
    await renderCategoryChart('store', [], [], expenses);
  }
}

// ─── CHARTS ────────────────────────────────────
const chartInstances = {};

function destroyChart(id) {
  if (chartInstances[id]) { chartInstances[id].destroy(); delete chartInstances[id]; }
}

async function renderWeeklyChart(type, primary, secondary) {
  destroyChart('chart-weekly');
  const ctx = $('chart-weekly');
  if (!ctx) return;

  const days = [];
  const values = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];
    days.push(d.toLocaleDateString(undefined, { weekday: 'short' }));

    if (type === 'repair') {
      const repairRev = primary.filter(j => j.date === dateStr).reduce((s, j) => s + (j.customerCharge || 0), 0);
      const saleRev = secondary.filter(s => s.date === dateStr).reduce((s, p) => s + (p.sellingPrice * p.quantity || 0), 0);
      values.push(repairRev + saleRev);
    } else {
      const sale = primary.find(s => s.date === dateStr);
      values.push(sale ? (sale.cashTotal + sale.visaTotal) : 0);
    }
  }

  chartInstances['chart-weekly'] = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: days,
      datasets: [{
        label: I18N.t('totalRevenue'),
        data: values,
        backgroundColor: 'rgba(37,99,235,0.7)',
        borderColor: 'rgba(37,99,235,1)',
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true } }
    }
  });
}

async function renderCategoryChart(type, jobs, sales, expenses) {
  destroyChart('chart-categories');
  const ctx = $('chart-categories');
  if (!ctx) return;

  let labels, data, colors;
  const cm = currentMonth();

  if (type === 'repair') {
    const jobRev = (jobs || []).filter(j => ym(j.date, cm)).reduce((s, j) => s + (j.customerCharge || 0), 0);
    const saleRev = (sales || []).filter(s => ym(s.date, cm)).reduce((s, p) => s + (p.sellingPrice * p.quantity || 0), 0);
    labels = [I18N.t('repairJobs'), I18N.t('productSales')];
    data = [jobRev, saleRev];
    colors = ['rgba(124,58,237,0.8)', 'rgba(37,99,235,0.8)'];
  } else {
    const expData = await DB.getAll(DB.STORES.expenses);
    const storeExp = expData.filter(e => e.business === 'store' && ym(e.date, cm) && e.currency === 'ILS');
    const cats = [...new Set(storeExp.map(e => e.category))];
    labels = cats.map(c => I18N.t(c) || c);
    data = cats.map(c => storeExp.filter(e => e.category === c).reduce((s, e) => s + e.amount, 0));
    colors = ['#dc2626','#d97706','#059669','#2563eb','#7c3aed','#db2777'].slice(0, cats.length);
  }

  chartInstances['chart-categories'] = new Chart(ctx, {
    type: 'doughnut',
    data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 2 }] },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { boxWidth: 12, padding: 10, font: { size: 11 } } } }
    }
  });
}

// ─── REPAIR JOBS ───────────────────────────────
async function renderRepairJobs() {
  const jobs = await DB.getAll(DB.STORES.repairJobs);
  const search = $('repair-search')?.value.toLowerCase() || '';
  const statusF = $('repair-status-filter')?.value || '';
  const monthF = $('repair-month-filter')?.value || '';

  let filtered = jobs.filter(j => {
    if (statusF && j.status !== statusF) return false;
    if (monthF && !ym(j.date, monthF)) return false;
    if (search && !`${j.customerName} ${j.deviceType} ${j.id}`.toLowerCase().includes(search)) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const tbody = $('repair-jobs-body');
  if (!filtered.length) {
    tbody.innerHTML = `<tr><td colspan="7"><div class="empty-state"><svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg><p>${I18N.t('noData')}</p></div></td></tr>`;
  } else {
    tbody.innerHTML = filtered.map(j => `
      <tr>
        <td>${fmtDate(j.date)}</td>
        <td><strong>${j.customerName}</strong></td>
        <td>${j.deviceType}</td>
        <td>${fmt(j.customerCharge)}</td>
        <td class="${j.profit >= 0 ? 'profit' : 'loss'}">${fmt(j.profit)}</td>
        <td><span class="badge badge-${j.status}">${I18N.t(j.status)}</span></td>
        <td>
          <div class="action-btns">
            <button class="btn-icon edit" onclick="editRepairJob('${j.id}')" title="Edit">✏️</button>
            <button class="btn-icon delete" onclick="deleteRepairJob('${j.id}')" title="Delete">🗑️</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  // Summary
  const totalCharge = filtered.reduce((s, j) => s + (j.customerCharge || 0), 0);
  const totalProfit = filtered.reduce((s, j) => s + (j.profit || 0), 0);
  const totalParts = filtered.reduce((s, j) => s + ((j.parts || []).reduce((ps, p) => ps + (p.cost * p.quantity || 0), 0)), 0);
  $('repair-jobs-summary').innerHTML = `
    <div class="summary-item"><div class="s-label">Total Jobs</div><div class="s-value">${filtered.length}</div></div>
    <div class="summary-item"><div class="s-label">${I18N.t('totalRevenue')}</div><div class="s-value">${fmt(totalCharge)}</div></div>
    <div class="summary-item"><div class="s-label">Parts Cost</div><div class="s-value">${fmt(totalParts)}</div></div>
    <div class="summary-item"><div class="s-label">${I18N.t('profit')}</div><div class="s-value ${totalProfit >= 0 ? 'profit' : 'loss'}">${fmt(totalProfit)}</div></div>
  `;

  // Autocomplete
  const names = [...new Set(jobs.map(j => j.customerName))];
  $('customer-names-repair').innerHTML = names.map(n => `<option value="${n}">`).join('');
}

window.editRepairJob = async function(id) {
  const job = await DB.get(DB.STORES.repairJobs, id);
  if (!job) return;
  $('rj-id').value = job.id;
  $('rj-date').value = job.date;
  $('rj-customer').value = job.customerName;
  $('rj-device').value = job.deviceType;
  $('rj-status').value = job.status;
  $('rj-labor-hours').value = job.laborHours || 0;
  $('rj-labor-rate').value = job.laborRate || 50;
  $('rj-charge').value = job.customerCharge;
  $('rj-notes').value = job.notes || '';

  // Parts
  const partsList = $('parts-list');
  partsList.innerHTML = '';
  (job.parts || []).forEach(p => addPartRow(p));
  if (!job.parts?.length) addPartRow();

  updateRepairProfit();
  openModal('modal-repair-job');
};

window.deleteRepairJob = async function(id) {
  if (!confirm(I18N.t('deleteConfirm'))) return;
  await DB.remove(DB.STORES.repairJobs, id);
  toast(I18N.t('deleted'), 'success');
  await renderRepairJobs();
};

// ─── PRODUCT SALES ─────────────────────────────
async function renderProductSales() {
  const sales = await DB.getAll(DB.STORES.productSales);
  const search = $('sale-search')?.value.toLowerCase() || '';
  const monthF = $('sale-month-filter')?.value || '';

  let filtered = sales.filter(s => {
    if (monthF && !ym(s.date, monthF)) return false;
    if (search && !s.productType.toLowerCase().includes(search)) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const tbody = $('product-sales-body');
  tbody.innerHTML = filtered.length ? filtered.map(s => `
    <tr>
      <td>${fmtDate(s.date)}</td>
      <td><strong>${s.productType}</strong></td>
      <td>${s.quantity}</td>
      <td>${fmt(s.costPrice)}</td>
      <td>${fmt(s.sellingPrice)}</td>
      <td class="${s.totalProfit >= 0 ? 'profit' : 'loss'}">${fmt(s.totalProfit)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon edit" onclick="editProductSale('${s.id}')" title="Edit">✏️</button>
          <button class="btn-icon delete" onclick="deleteProductSale('${s.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="7"><div class="empty-state"><p>${I18N.t('noData')}</p></div></td></tr>`;

  const totalRev = filtered.reduce((s, p) => s + (p.sellingPrice * p.quantity || 0), 0);
  const totalCost = filtered.reduce((s, p) => s + (p.costPrice * p.quantity || 0), 0);
  const totalProfit = filtered.reduce((s, p) => s + (p.totalProfit || 0), 0);
  $('product-sales-summary').innerHTML = `
    <div class="summary-item"><div class="s-label">Items Sold</div><div class="s-value">${filtered.reduce((s, p) => s + p.quantity, 0)}</div></div>
    <div class="summary-item"><div class="s-label">Revenue</div><div class="s-value">${fmt(totalRev)}</div></div>
    <div class="summary-item"><div class="s-label">Cost</div><div class="s-value">${fmt(totalCost)}</div></div>
    <div class="summary-item"><div class="s-label">${I18N.t('profit')}</div><div class="s-value ${totalProfit >= 0 ? 'profit' : 'loss'}">${fmt(totalProfit)}</div></div>
  `;
}

window.editProductSale = async function(id) {
  const sale = await DB.get(DB.STORES.productSales, id);
  if (!sale) return;
  $('ps-id').value = sale.id;
  $('ps-date').value = sale.date;
  $('ps-product').value = sale.productType;
  $('ps-qty').value = sale.quantity;
  $('ps-cost').value = sale.costPrice;
  $('ps-sell').value = sale.sellingPrice;
  $('ps-notes').value = sale.notes || '';
  updateSaleProfit();
  openModal('modal-product-sale');
};

window.deleteProductSale = async function(id) {
  if (!confirm(I18N.t('deleteConfirm'))) return;
  await DB.remove(DB.STORES.productSales, id);
  toast(I18N.t('deleted'), 'success');
  await renderProductSales();
};

// ─── INVENTORY ─────────────────────────────────
async function renderInventory() {
  const items = await DB.getAll(DB.STORES.inventory);
  const search = $('inv-search')?.value.toLowerCase() || '';
  const catF = $('inv-category-filter')?.value || '';

  let filtered = items.filter(i => {
    if (catF && i.category !== catF) return false;
    if (search && !i.name.toLowerCase().includes(search)) return false;
    return true;
  }).sort((a, b) => a.name.localeCompare(b.name));

  const tbody = $('inventory-body');
  tbody.innerHTML = filtered.length ? filtered.map(i => `
    <tr>
      <td><strong>${i.name}</strong></td>
      <td>${I18N.t(i.category) || i.category}</td>
      <td>${i.quantity}</td>
      <td>${fmt(i.costPerUnit)}</td>
      <td class="profit">${fmt(i.quantity * i.costPerUnit)}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon edit" onclick="editInventory('${i.id}')" title="Edit">✏️</button>
          <button class="btn-icon delete" onclick="deleteInventory('${i.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="6"><div class="empty-state"><p>${I18N.t('noData')}</p></div></td></tr>`;

  const totalValue = filtered.reduce((s, i) => s + (i.quantity * i.costPerUnit || 0), 0);
  const totalItems = filtered.reduce((s, i) => s + (i.quantity || 0), 0);
  $('inventory-summary').innerHTML = `
    <div class="summary-item"><div class="s-label">SKUs</div><div class="s-value">${filtered.length}</div></div>
    <div class="summary-item"><div class="s-label">Total Units</div><div class="s-value">${totalItems}</div></div>
    <div class="summary-item"><div class="s-label">${I18N.t('inventoryValue')}</div><div class="s-value profit">${fmt(totalValue)}</div></div>
  `;
}

window.editInventory = async function(id) {
  const item = await DB.get(DB.STORES.inventory, id);
  if (!item) return;
  $('inv-id').value = item.id;
  $('inv-name').value = item.name;
  $('inv-category').value = item.category;
  $('inv-qty').value = item.quantity;
  $('inv-cost').value = item.costPerUnit;
  updateInventoryTotal();
  openModal('modal-inventory');
};

window.deleteInventory = async function(id) {
  if (!confirm(I18N.t('deleteConfirm'))) return;
  await DB.remove(DB.STORES.inventory, id);
  toast(I18N.t('deleted'), 'success');
  await renderInventory();
};

// ─── DAILY SALES (Store) ───────────────────────
async function renderDailySales() {
  const sales = await DB.getAll(DB.STORES.dailySales);
  const monthF = $('ds-month-filter')?.value || '';

  let filtered = sales
    .filter(s => !monthF || ym(s.date, monthF))
    .sort((a, b) => b.date.localeCompare(a.date));

  const tbody = $('daily-sales-body');
  tbody.innerHTML = filtered.length ? filtered.map(s => `
    <tr>
      <td>${fmtDate(s.date)}</td>
      <td>${fmt(s.cashTotal)}</td>
      <td>${fmt(s.visaTotal)}</td>
      <td class="profit"><strong>${fmt(s.revenueTotal)}</strong></td>
      <td>${s.notes || ''}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon edit" onclick="editDailySale('${s.id}')" title="Edit">✏️</button>
          <button class="btn-icon delete" onclick="deleteDailySale('${s.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="6"><div class="empty-state"><p>${I18N.t('noData')}</p></div></td></tr>`;

  const totalCash = filtered.reduce((s, d) => s + (d.cashTotal || 0), 0);
  const totalVisa = filtered.reduce((s, d) => s + (d.visaTotal || 0), 0);
  const totalRev = filtered.reduce((s, d) => s + (d.revenueTotal || 0), 0);
  $('daily-sales-summary').innerHTML = `
    <div class="summary-item"><div class="s-label">Days</div><div class="s-value">${filtered.length}</div></div>
    <div class="summary-item"><div class="s-label">${I18N.t('cash')}</div><div class="s-value">${fmt(totalCash)}</div></div>
    <div class="summary-item"><div class="s-label">${I18N.t('visa')}</div><div class="s-value">${fmt(totalVisa)}</div></div>
    <div class="summary-item"><div class="s-label">${I18N.t('total')}</div><div class="s-value profit">${fmt(totalRev)}</div></div>
  `;
}

window.editDailySale = async function(id) {
  const sale = await DB.get(DB.STORES.dailySales, id);
  if (!sale) return;
  $('ds-id').value = sale.id;
  $('ds-date').value = sale.date;
  $('ds-cash').value = sale.cashTotal;
  $('ds-visa').value = sale.visaTotal;
  $('ds-notes').value = sale.notes || '';
  updateDailyTotal();
  openModal('modal-daily-sale');
};

window.deleteDailySale = async function(id) {
  if (!confirm(I18N.t('deleteConfirm'))) return;
  await DB.remove(DB.STORES.dailySales, id);
  toast(I18N.t('deleted'), 'success');
  await renderDailySales();
};

// ─── CUSTOMER CREDIT ───────────────────────────
async function renderCustomerCredit() {
  const customers = await DB.getAll(DB.STORES.customerCredits);
  const search = $('credit-search')?.value.toLowerCase() || '';
  const statusF = $('credit-status-filter')?.value || '';

  let filtered = customers.filter(c => {
    if (statusF && c.status !== statusF) return false;
    if (search && !c.customerName.toLowerCase().includes(search)) return false;
    return true;
  }).sort((a, b) => b.currentBalance - a.currentBalance);

  const grid = $('credit-cards-grid');
  grid.innerHTML = filtered.length ? filtered.map(c => `
    <div class="credit-card ${c.status}" onclick="openCustomerTab('${c.id}')">
      <div class="credit-card-header">
        <div>
          <div class="credit-card-name">👤 ${c.customerName}</div>
          <div class="credit-card-meta">${c.currency} · ${c.entries?.length || 0} entries</div>
        </div>
        <span class="badge badge-${c.status}">${I18N.t(c.status === 'active' ? 'activeTab' : 'settled')}</span>
      </div>
      <div class="credit-card-balance ${c.currentBalance <= 0 ? 'zero' : ''}">
        ${c.currentBalance > 0 ? fmt(c.currentBalance, c.currency) + ' owed' : '✓ Settled'}
      </div>
      <div class="credit-card-meta">
        Purchases: ${fmt(c.totalPurchases, c.currency)} · Paid: ${fmt(c.totalPayments, c.currency)}
      </div>
    </div>
  `).join('') : `<div class="empty-state" style="grid-column:1/-1"><p>${I18N.t('noData')}</p></div>`;
}

window.openCustomerTab = async function(id) {
  const customer = await DB.get(DB.STORES.customerCredits, id);
  if (!customer) return;

  $('tab-customer-name').textContent = `👤 ${customer.customerName}`;
  $('tab-customer-id').value = id;
  $('tab-entry-date').value = today();
  $('tab-entry-currency').value = customer.currency || 'ILS';

  const badge = $('tab-balance-badge');
  badge.textContent = customer.currentBalance > 0
    ? `${fmt(customer.currentBalance, customer.currency)} owed`
    : '✓ Settled';
  badge.className = `tab-balance-badge ${customer.currentBalance <= 0 ? 'zero' : ''}`;

  const list = $('tab-entries-list');
  const entries = [...(customer.entries || [])].reverse();
  list.innerHTML = entries.length ? entries.map(e => `
    <div class="tab-entry-row ${e.type}">
      <div>
        <div class="tab-entry-date">${fmtDate(e.date)}</div>
        <div>${e.notes || I18N.t(e.type)}</div>
      </div>
      <div class="tab-entry-amount ${e.type}">
        ${e.type === 'purchase' ? '+' : '-'}${fmt(e.amount, e.currency || customer.currency)}
      </div>
    </div>
  `).join('') : `<div class="empty-state" style="padding:20px"><p>No entries yet</p></div>`;

  openModal('modal-customer-tab');
};

// ─── EXPENSES ──────────────────────────────────
async function renderExpenses() {
  const expenses = await DB.getAll(DB.STORES.expenses);
  const search = $('exp-search')?.value.toLowerCase() || '';
  const catF = $('exp-category-filter')?.value || '';
  const monthF = $('exp-month-filter')?.value || '';

  let filtered = expenses.filter(e => {
    if (e.business !== State.business) return false;
    if (catF && e.category !== catF) return false;
    if (monthF && !ym(e.date, monthF)) return false;
    if (search && !(e.category + e.notes || '').toLowerCase().includes(search)) return false;
    return true;
  }).sort((a, b) => b.date.localeCompare(a.date));

  const tbody = $('expenses-body');
  tbody.innerHTML = filtered.length ? filtered.map(e => `
    <tr>
      <td>${fmtDate(e.date)}</td>
      <td>${I18N.t(e.category) || e.category}</td>
      <td class="loss"><strong>${fmt(e.amount, e.currency)}</strong></td>
      <td>${e.currency}</td>
      <td>${e.notes || ''}</td>
      <td>
        <div class="action-btns">
          <button class="btn-icon edit" onclick="editExpense('${e.id}')" title="Edit">✏️</button>
          <button class="btn-icon delete" onclick="deleteExpense('${e.id}')" title="Delete">🗑️</button>
        </div>
      </td>
    </tr>
  `).join('') : `<tr><td colspan="6"><div class="empty-state"><p>${I18N.t('noData')}</p></div></td></tr>`;

  // Summary by currency
  const byCurrency = {};
  filtered.forEach(e => {
    byCurrency[e.currency] = (byCurrency[e.currency] || 0) + e.amount;
  });
  const summaryHTML = Object.entries(byCurrency)
    .map(([cur, total]) => `<div class="summary-item"><div class="s-label">${cur}</div><div class="s-value loss">${fmt(total, cur)}</div></div>`)
    .join('');
  $('expenses-summary').innerHTML = `<div class="summary-item"><div class="s-label">Count</div><div class="s-value">${filtered.length}</div></div>${summaryHTML}`;
}

window.editExpense = async function(id) {
  const e = await DB.get(DB.STORES.expenses, id);
  if (!e) return;
  $('exp-id').value = e.id;
  $('exp-date').value = e.date;
  $('exp-category').value = e.category;
  $('exp-amount').value = e.amount;
  $('exp-currency').value = e.currency;
  $('exp-notes').value = e.notes || '';
  openModal('modal-expense');
};

window.deleteExpense = async function(id) {
  if (!confirm(I18N.t('deleteConfirm'))) return;
  await DB.remove(DB.STORES.expenses, id);
  toast(I18N.t('deleted'), 'success');
  await renderExpenses();
};

// ─── REPORTS ───────────────────────────────────
async function generateReport() {
  const type = document.querySelector('.report-type-btn.active')?.dataset.report || 'daily';
  const output = $('report-output');

  let dateParam;
  if (type === 'daily') dateParam = $('report-date').value;
  else if (type === 'monthly') dateParam = $('report-month').value;
  else dateParam = $('report-year').value;

  if (!dateParam) { toast('Please select a date', 'warning'); return; }

  output.innerHTML = '<div class="report-placeholder"><p>Generating...</p></div>';

  try {
    if (State.business === 'repair') {
      await renderRepairReport(type, dateParam, output);
    } else {
      await renderStoreReport(type, dateParam, output);
    }
  } catch (e) {
    output.innerHTML = '<div class="report-placeholder"><p>Error generating report</p></div>';
    console.error(e);
  }
}

async function renderRepairReport(type, param, output) {
  const [jobs, sales, expenses] = await Promise.all([
    DB.getAll(DB.STORES.repairJobs),
    DB.getAll(DB.STORES.productSales),
    DB.getAll(DB.STORES.expenses)
  ]);

  let filteredJobs, filteredSales, filteredExp, title;

  if (type === 'daily') {
    filteredJobs = jobs.filter(j => j.date === param);
    filteredSales = sales.filter(s => s.date === param);
    filteredExp = expenses.filter(e => e.date === param && e.business === 'repair');
    title = `${I18N.t('dailySummary')} — ${fmtDate(param)}`;
  } else if (type === 'monthly') {
    filteredJobs = jobs.filter(j => ym(j.date, param));
    filteredSales = sales.filter(s => ym(s.date, param));
    filteredExp = expenses.filter(e => ym(e.date, param) && e.business === 'repair');
    title = `${I18N.t('monthlySummary')} — ${param}`;
  } else {
    filteredJobs = jobs.filter(j => j.date.startsWith(param));
    filteredSales = sales.filter(s => s.date.startsWith(param));
    filteredExp = expenses.filter(e => e.date.startsWith(param) && e.business === 'repair');
    title = `${I18N.t('yearlySummary')} — ${param}`;
  }

  const repairRev = filteredJobs.reduce((s, j) => s + (j.customerCharge || 0), 0);
  const saleRev = filteredSales.reduce((s, p) => s + (p.sellingPrice * p.quantity || 0), 0);
  const totalRev = repairRev + saleRev;
  const totalProfit = filteredJobs.reduce((s, j) => s + (j.profit || 0), 0)
                    + filteredSales.reduce((s, p) => s + (p.totalProfit || 0), 0);
  const ilsExp = filteredExp.filter(e => e.currency === 'ILS').reduce((s, e) => s + e.amount, 0);
  const netProfit = totalProfit - ilsExp;

  // Category breakdown for expenses
  const expCats = {};
  filteredExp.filter(e => e.currency === 'ILS').forEach(e => {
    expCats[e.category] = (expCats[e.category] || 0) + e.amount;
  });

  output.innerHTML = `
    <div class="report-content">
      <div class="report-title">${title}</div>
      <div class="report-section">
        <h4>${I18N.t('totalRevenue')}</h4>
        <div class="report-row"><span>${I18N.t('repairJobs')} (${filteredJobs.length})</span><span class="profit">${fmt(repairRev)}</span></div>
        <div class="report-row"><span>${I18N.t('productSales')} (${filteredSales.reduce((s,p)=>s+p.quantity,0)} units)</span><span class="profit">${fmt(saleRev)}</span></div>
        <div class="report-row report-total"><span>${I18N.t('total')}</span><span class="profit">${fmt(totalRev)}</span></div>
      </div>
      <div class="report-section">
        <h4>${I18N.t('totalExpenses')} (ILS)</h4>
        ${Object.entries(expCats).map(([cat, amt]) =>
          `<div class="report-row"><span>${I18N.t(cat) || cat}</span><span class="loss">${fmt(amt)}</span></div>`
        ).join('')}
        <div class="report-row report-total"><span>${I18N.t('total')}</span><span class="loss">${fmt(ilsExp)}</span></div>
      </div>
      <div class="report-section">
        <h4>${I18N.t('netProfit')}</h4>
        <div class="report-row report-total">
          <span>${I18N.t('netProfit')}</span>
          <span class="${netProfit >= 0 ? 'profit' : 'loss'}" style="font-size:1.2rem">${fmt(netProfit)}</span>
        </div>
      </div>
      ${type !== 'daily' ? renderJobsBreakdown(filteredJobs) : ''}
      <div class="report-actions">
        <button class="btn btn-outline" onclick="exportReportPDF('${title}')">📄 PDF</button>
        <button class="btn btn-outline" onclick="exportReportExcel()">📊 Excel</button>
      </div>
    </div>
  `;
}

function renderJobsBreakdown(jobs) {
  const byStatus = { pending: 0, completed: 0, paid: 0 };
  jobs.forEach(j => byStatus[j.status] = (byStatus[j.status] || 0) + 1);
  return `
    <div class="report-section">
      <h4>Job Status</h4>
      ${Object.entries(byStatus).map(([s, c]) =>
        `<div class="report-row"><span>${I18N.t(s)}</span><span>${c} jobs</span></div>`
      ).join('')}
    </div>
  `;
}

async function renderStoreReport(type, param, output) {
  const [dailySales, credits, expenses] = await Promise.all([
    DB.getAll(DB.STORES.dailySales),
    DB.getAll(DB.STORES.customerCredits),
    DB.getAll(DB.STORES.expenses)
  ]);

  let filteredSales, filteredExp, title;

  if (type === 'daily') {
    filteredSales = dailySales.filter(s => s.date === param);
    filteredExp = expenses.filter(e => e.date === param && e.business === 'store');
    title = `${I18N.t('dailySummary')} — ${fmtDate(param)}`;
  } else if (type === 'monthly') {
    filteredSales = dailySales.filter(s => ym(s.date, param));
    filteredExp = expenses.filter(e => ym(e.date, param) && e.business === 'store');
    title = `${I18N.t('monthlySummary')} — ${param}`;
  } else {
    filteredSales = dailySales.filter(s => s.date.startsWith(param));
    filteredExp = expenses.filter(e => e.date.startsWith(param) && e.business === 'store');
    title = `${I18N.t('yearlySummary')} — ${param}`;
  }

  const totalCash = filteredSales.reduce((s, d) => s + (d.cashTotal || 0), 0);
  const totalVisa = filteredSales.reduce((s, d) => s + (d.visaTotal || 0), 0);
  const totalRev = totalCash + totalVisa;
  const ilsExp = filteredExp.filter(e => e.currency === 'ILS').reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRev - ilsExp;
  const outstanding = credits.filter(c => c.status === 'active').reduce((s, c) => s + (c.currentBalance || 0), 0);

  // Best/worst days (monthly+)
  let bestWorst = '';
  if (type !== 'daily' && filteredSales.length) {
    const sorted = [...filteredSales].sort((a, b) => b.revenueTotal - a.revenueTotal);
    bestWorst = `
      <div class="report-section">
        <h4>Highlights</h4>
        <div class="report-row"><span>${I18N.t('bestDay')}</span><span class="profit">${fmtDate(sorted[0].date)} — ${fmt(sorted[0].revenueTotal)}</span></div>
        <div class="report-row"><span>${I18N.t('worstDay')}</span><span class="loss">${fmtDate(sorted[sorted.length-1].date)} — ${fmt(sorted[sorted.length-1].revenueTotal)}</span></div>
        <div class="report-row"><span>${I18N.t('avgDaily')}</span><span>${fmt(totalRev / filteredSales.length)}</span></div>
      </div>
    `;
  }

  output.innerHTML = `
    <div class="report-content">
      <div class="report-title">${title}</div>
      <div class="report-section">
        <h4>${I18N.t('totalRevenue')}</h4>
        <div class="report-row"><span>${I18N.t('cash')}</span><span class="profit">${fmt(totalCash)}</span></div>
        <div class="report-row"><span>${I18N.t('visa')}</span><span class="profit">${fmt(totalVisa)}</span></div>
        <div class="report-row report-total"><span>${I18N.t('total')} (${filteredSales.length} days)</span><span class="profit">${fmt(totalRev)}</span></div>
      </div>
      <div class="report-section">
        <h4>${I18N.t('totalExpenses')} (ILS)</h4>
        <div class="report-row report-total"><span>${I18N.t('total')}</span><span class="loss">${fmt(ilsExp)}</span></div>
      </div>
      <div class="report-section">
        <h4>${I18N.t('netProfit')}</h4>
        <div class="report-row report-total">
          <span>${I18N.t('netProfit')}</span>
          <span class="${netProfit >= 0 ? 'profit' : 'loss'}" style="font-size:1.2rem">${fmt(netProfit)}</span>
        </div>
      </div>
      ${bestWorst}
      <div class="report-section">
        <h4>${I18N.t('outstandingCredit')}</h4>
        <div class="report-row"><span>Active tabs</span><span>${credits.filter(c=>c.status==='active').length} customers</span></div>
        <div class="report-row report-total"><span>Total owed</span><span class="loss">${fmt(outstanding)}</span></div>
      </div>
      <div class="report-actions">
        <button class="btn btn-outline" onclick="exportReportPDF('${title}')">📄 PDF</button>
        <button class="btn btn-outline" onclick="exportReportExcel()">📊 Excel</button>
      </div>
    </div>
  `;
}

// ─── EXPORT ────────────────────────────────────
window.exportReportPDF = function(title) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();
  doc.setFontSize(16);
  doc.text(title || 'Report', 14, 18);
  doc.setFontSize(11);

  const content = document.querySelector('.report-content');
  if (!content) { toast('No report to export', 'warning'); return; }

  let y = 30;
  content.querySelectorAll('.report-section').forEach(section => {
    const h4 = section.querySelector('h4');
    if (h4) { doc.setFont(undefined, 'bold'); doc.text(h4.textContent, 14, y); y += 6; doc.setFont(undefined, 'normal'); }
    section.querySelectorAll('.report-row').forEach(row => {
      const cells = row.querySelectorAll('span');
      if (cells.length >= 2) {
        doc.text(cells[0].textContent, 14, y);
        doc.text(cells[1].textContent, 150, y, { align: 'right' });
        y += 6;
      }
      if (y > 270) { doc.addPage(); y = 20; }
    });
    y += 4;
  });

  doc.save(`report-${Date.now()}.pdf`);
  toast('PDF exported', 'success');
};

window.exportReportExcel = async function() {
  const data = await DB.exportAll();
  const wb = XLSX.utils.book_new();
  Object.entries(data).forEach(([name, rows]) => {
    if (rows.length) {
      const ws = XLSX.utils.json_to_sheet(rows.map(r => {
        const flat = { ...r };
        if (flat.parts) flat.parts = JSON.stringify(flat.parts);
        if (flat.entries) flat.entries = JSON.stringify(flat.entries);
        return flat;
      }));
      XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
    }
  });
  XLSX.writeFile(wb, `magharian-finance-${Date.now()}.xlsx`);
  toast('Excel exported', 'success');
};

async function exportJSON() {
  const data = await DB.exportAll();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `magharian-backup-${Date.now()}.json`;
  a.click();
  URL.revokeObjectURL(url);
  toast('Backup downloaded', 'success');
}

async function importJSON(file) {
  try {
    const text = await file.text();
    const data = JSON.parse(text);
    await DB.importAll(data);
    toast(I18N.t('importSuccess'), 'success');
    await refresh(State.section);
  } catch {
    toast(I18N.t('importError'), 'error');
  }
}

// ─── MODAL HELPERS ─────────────────────────────
function openModal(id) {
  $$(`.modal-overlay`).forEach(m => m.classList.remove('open'));
  const modal = $(id);
  if (modal) modal.classList.add('open');
}

function closeModal(modalId) {
  if (modalId) $(modalId)?.classList.remove('open');
  else $$('.modal-overlay').forEach(m => m.classList.remove('open'));
}

function resetForm(formId) {
  $(formId)?.reset();
}

// ─── FORM HELPERS ──────────────────────────────
function addPartRow(part) {
  const div = document.createElement('div');
  div.className = 'parts-item';
  div.innerHTML = `
    <input type="text" placeholder="Part name" class="part-name" value="${part?.name || ''}" />
    <input type="number" placeholder="Cost" class="part-cost" min="0" step="0.01" value="${part?.cost || ''}" />
    <input type="number" placeholder="Qty" class="part-qty" min="1" value="${part?.quantity || 1}" />
    <button type="button" class="btn-icon remove-part" onclick="this.parentElement.remove();updateRepairProfit()">✕</button>
  `;
  div.querySelectorAll('input').forEach(i => i.addEventListener('input', updateRepairProfit));
  $('parts-list').appendChild(div);
}

function getPartsData() {
  return [...$$('.parts-item')].map(div => ({
    name: div.querySelector('.part-name').value,
    cost: parseFloat(div.querySelector('.part-cost').value) || 0,
    quantity: parseInt(div.querySelector('.part-qty').value) || 1,
  })).filter(p => p.name);
}

function updateRepairProfit() {
  const parts = getPartsData();
  const partsCost = parts.reduce((s, p) => s + p.cost * p.quantity, 0);
  const laborHours = parseFloat($('rj-labor-hours')?.value) || 0;
  const laborRate = parseFloat($('rj-labor-rate')?.value) || 0;
  const laborCost = laborHours * laborRate;
  const charge = parseFloat($('rj-charge')?.value) || 0;
  const profit = charge - partsCost - laborCost;
  $('rj-profit-display').textContent = `${fmt(profit)} ${profit < 0 ? '⚠️' : ''}`;
  $('rj-profit-display').style.color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
}

function updateSaleProfit() {
  const cost = parseFloat($('ps-cost')?.value) || 0;
  const sell = parseFloat($('ps-sell')?.value) || 0;
  const qty = parseInt($('ps-qty')?.value) || 1;
  const profit = (sell - cost) * qty;
  $('ps-profit-display').textContent = fmt(profit);
  $('ps-profit-display').style.color = profit >= 0 ? 'var(--success)' : 'var(--danger)';
}

function updateInventoryTotal() {
  const qty = parseFloat($('inv-qty')?.value) || 0;
  const cost = parseFloat($('inv-cost')?.value) || 0;
  $('inv-total-display').textContent = fmt(qty * cost);
}

function updateDailyTotal() {
  const cash = parseFloat($('ds-cash')?.value) || 0;
  const visa = parseFloat($('ds-visa')?.value) || 0;
  $('ds-total-display').textContent = fmt(cash + visa);
}

// ─── FORM SUBMISSIONS ──────────────────────────
async function handleRepairJob(e) {
  e.preventDefault();
  const parts = getPartsData();
  const partsCost = parts.reduce((s, p) => s + p.cost * p.quantity, 0);
  const laborHours = parseFloat($('rj-labor-hours').value) || 0;
  const laborRate = parseFloat($('rj-labor-rate').value) || 0;
  const charge = parseFloat($('rj-charge').value) || 0;
  const profit = charge - partsCost - (laborHours * laborRate);

  const job = {
    id: $('rj-id').value || undefined,
    date: $('rj-date').value,
    customerName: $('rj-customer').value,
    deviceType: $('rj-device').value,
    parts, laborHours, laborRate,
    customerCharge: charge, profit,
    status: $('rj-status').value,
    notes: $('rj-notes').value,
  };

  await DB.put(DB.STORES.repairJobs, job);
  closeModal('modal-repair-job');
  resetForm('form-repair-job');
  $('rj-id').value = '';
  toast(I18N.t('saved'), 'success');
  await refresh(State.section);
}

async function handleProductSale(e) {
  e.preventDefault();
  const cost = parseFloat($('ps-cost').value) || 0;
  const sell = parseFloat($('ps-sell').value) || 0;
  const qty = parseInt($('ps-qty').value) || 1;

  const sale = {
    id: $('ps-id').value || undefined,
    date: $('ps-date').value,
    productType: $('ps-product').value,
    quantity: qty, costPrice: cost, sellingPrice: sell,
    profitPerUnit: sell - cost,
    totalProfit: (sell - cost) * qty,
    notes: $('ps-notes').value,
  };

  await DB.put(DB.STORES.productSales, sale);
  closeModal('modal-product-sale');
  resetForm('form-product-sale');
  $('ps-id').value = '';
  toast(I18N.t('saved'), 'success');
  await refresh(State.section);
}

async function handleInventory(e) {
  e.preventDefault();
  const item = {
    id: $('inv-id').value || undefined,
    name: $('inv-name').value,
    category: $('inv-category').value,
    quantity: parseInt($('inv-qty').value) || 0,
    costPerUnit: parseFloat($('inv-cost').value) || 0,
  };
  await DB.put(DB.STORES.inventory, item);
  closeModal('modal-inventory');
  resetForm('form-inventory');
  $('inv-id').value = '';
  toast(I18N.t('saved'), 'success');
  await refresh(State.section);
}

async function handleDailySale(e) {
  e.preventDefault();
  const cash = parseFloat($('ds-cash').value) || 0;
  const visa = parseFloat($('ds-visa').value) || 0;
  const sale = {
    id: $('ds-id').value || undefined,
    date: $('ds-date').value,
    cashTotal: cash,
    visaTotal: visa,
    revenueTotal: cash + visa,
    notes: $('ds-notes').value,
  };
  await DB.put(DB.STORES.dailySales, sale);
  closeModal('modal-daily-sale');
  resetForm('form-daily-sale');
  $('ds-id').value = '';
  toast(I18N.t('saved'), 'success');
  await refresh(State.section);
}

async function handleNewCustomer(e) {
  e.preventDefault();
  const customer = {
    customerName: $('cc-name').value,
    currency: $('cc-currency').value,
    entries: [],
    totalPurchases: 0,
    totalPayments: 0,
    currentBalance: 0,
    status: 'active',
  };
  await DB.put(DB.STORES.customerCredits, customer);
  closeModal('modal-customer-credit');
  resetForm('form-new-customer');
  toast(I18N.t('saved'), 'success');
  await renderCustomerCredit();
}

async function handleTabEntry(e) {
  e.preventDefault();
  const id = $('tab-customer-id').value;
  const customer = await DB.get(DB.STORES.customerCredits, id);
  if (!customer) return;

  const type = $('tab-entry-type').value;
  const amount = parseFloat($('tab-entry-amount').value) || 0;

  const entry = {
    date: $('tab-entry-date').value,
    type,
    amount,
    currency: $('tab-entry-currency').value,
    notes: $('tab-entry-notes').value,
  };

  customer.entries = customer.entries || [];
  customer.entries.push(entry);
  customer.totalPurchases = customer.entries.filter(en => en.type === 'purchase').reduce((s, en) => s + en.amount, 0);
  customer.totalPayments = customer.entries.filter(en => en.type === 'payment').reduce((s, en) => s + en.amount, 0);
  customer.currentBalance = customer.totalPurchases - customer.totalPayments;

  await DB.put(DB.STORES.customerCredits, customer);
  toast(I18N.t('saved'), 'success');
  await openCustomerTab(id);
  await renderCustomerCredit();
}

async function handleSettleTab() {
  const id = $('tab-customer-id').value;
  const customer = await DB.get(DB.STORES.customerCredits, id);
  if (!customer) return;
  customer.status = customer.status === 'active' ? 'settled' : 'active';
  await DB.put(DB.STORES.customerCredits, customer);
  toast(I18N.t('saved'), 'success');
  await openCustomerTab(id);
  await renderCustomerCredit();
}

async function handleExpense(e) {
  e.preventDefault();
  const expense = {
    id: $('exp-id').value || undefined,
    date: $('exp-date').value,
    category: $('exp-category').value,
    amount: parseFloat($('exp-amount').value) || 0,
    currency: $('exp-currency').value,
    notes: $('exp-notes').value,
    business: State.business,
  };
  await DB.put(DB.STORES.expenses, expense);
  closeModal('modal-expense');
  resetForm('form-expense');
  $('exp-id').value = '';
  toast(I18N.t('saved'), 'success');
  await refresh(State.section);
}

// ─── SEED DEMO DATA ────────────────────────────
async function seedDemoData() {
  const existing = await DB.getAll(DB.STORES.repairJobs);
  if (existing.length > 0) return; // already has data

  const t0 = today();
  const dayBefore = d => { const dt = new Date(d); dt.setDate(dt.getDate()-1); return dt.toISOString().split('T')[0]; };
  const d1 = dayBefore(t0), d2 = dayBefore(d1), d3 = dayBefore(d2);

  // Repair jobs
  for (const job of [
    { date: t0, customerName: 'Ahmad Hassan', deviceType: 'iPhone 14', parts:[{name:'Screen',cost:180,quantity:1}], laborHours:1.5, laborRate:60, customerCharge:350, profit:80, status:'paid', notes:'' },
    { date: t0, customerName: 'Sara Khalil', deviceType: 'PS5 Controller', parts:[{name:'Joystick',cost:30,quantity:2}], laborHours:1, laborRate:60, customerCharge:150, profit:60, status:'completed', notes:'Drift fix' },
    { date: d1, customerName: 'Mohammed Ali', deviceType: 'Samsung S23', parts:[{name:'Battery',cost:80,quantity:1}], laborHours:0.5, laborRate:60, customerCharge:160, profit:50, status:'paid', notes:'' },
    { date: d2, customerName: 'Layla Nasser', deviceType: 'Xbox Series X', parts:[{name:'HDMI port',cost:25,quantity:1}], laborHours:2, laborRate:60, customerCharge:200, profit:55, status:'pending', notes:'Waiting for part' },
    { date: d3, customerName: 'Yusuf Ibrahim', deviceType: 'iPad Air', parts:[{name:'Charging port',cost:45,quantity:1}], laborHours:1, laborRate:60, customerCharge:150, profit:45, status:'paid', notes:'' },
  ]) await DB.put(DB.STORES.repairJobs, job);

  // Product sales
  for (const s of [
    { date: t0, productType: 'PlayStation 5', quantity:1, costPrice:1800, sellingPrice:2100, profitPerUnit:300, totalProfit:300, notes:'' },
    { date: d1, productType: 'iPhone 15 Case', quantity:3, costPrice:20, sellingPrice:45, profitPerUnit:25, totalProfit:75, notes:'' },
    { date: d2, productType: 'Nintendo Switch', quantity:1, costPrice:900, sellingPrice:1100, profitPerUnit:200, totalProfit:200, notes:'' },
  ]) await DB.put(DB.STORES.productSales, s);

  // Inventory
  for (const item of [
    { name: 'iPhone Screens (14)', category:'parts', quantity:5, costPerUnit:180 },
    { name: 'Samsung Batteries', category:'parts', quantity:8, costPerUnit:80 },
    { name: 'PS5 Controllers', category:'consoles', quantity:3, costPerUnit:220 },
    { name: 'Phone Cases (mixed)', category:'accessories', quantity:20, costPerUnit:18 },
    { name: 'USB-C Cables', category:'accessories', quantity:15, costPerUnit:12 },
  ]) await DB.put(DB.STORES.inventory, item);

  // Repair expenses
  for (const e of [
    { date: t0, category:'supplies', amount:120, currency:'ILS', notes:'Cleaning supplies', business:'repair' },
    { date: d1, category:'utilities', amount:250, currency:'ILS', notes:'Electricity', business:'repair' },
    { date: d3, category:'rent', amount:2000, currency:'ILS', notes:'Monthly rent', business:'repair' },
  ]) await DB.put(DB.STORES.expenses, e);

  // Daily sales (store)
  for (const s of [
    { date: t0, cashTotal:850, visaTotal:320, revenueTotal:1170, notes:'Good day' },
    { date: d1, cashTotal:720, visaTotal:180, revenueTotal:900, notes:'' },
    { date: d2, cashTotal:1100, visaTotal:450, revenueTotal:1550, notes:'Weekend' },
    { date: d3, cashTotal:600, visaTotal:200, revenueTotal:800, notes:'' },
  ]) await DB.put(DB.STORES.dailySales, s);

  // Customer credits (store)
  for (const c of [
    {
      customerName: 'Abu Khalid', currency:'ILS', status:'active',
      entries:[
        { date: d3, type:'purchase', amount:250, currency:'ILS', notes:'Groceries' },
        { date: d2, type:'purchase', amount:180, currency:'ILS', notes:'Cigarettes + drinks' },
        { date: d1, type:'payment', amount:200, currency:'ILS', notes:'Partial payment' },
      ],
      totalPurchases:430, totalPayments:200, currentBalance:230,
    },
    {
      customerName: 'Um Hassan', currency:'ILS', status:'active',
      entries:[
        { date: d2, type:'purchase', amount:150, currency:'ILS', notes:'Weekly groceries' },
        { date: t0, type:'purchase', amount:90, currency:'ILS', notes:'' },
      ],
      totalPurchases:240, totalPayments:0, currentBalance:240,
    },
    {
      customerName: 'Sami Daoud', currency:'ILS', status:'settled',
      entries:[
        { date: d3, type:'purchase', amount:320, currency:'ILS', notes:'Bulk buy' },
        { date: d1, type:'payment', amount:320, currency:'ILS', notes:'Full payment' },
      ],
      totalPurchases:320, totalPayments:320, currentBalance:0,
    },
  ]) await DB.put(DB.STORES.customerCredits, c);

  // Store expenses
  for (const e of [
    { date: t0, category:'supplier', amount:1500, currency:'ILS', notes:'Weekly supplier payment', business:'store' },
    { date: d2, category:'wages', amount:800, currency:'ILS', notes:'Worker salary', business:'store' },
    { date: d3, category:'rent', amount:1800, currency:'ILS', notes:'Monthly rent', business:'store' },
  ]) await DB.put(DB.STORES.expenses, e);

  console.log('Demo data seeded ✓');
}

// ─── INIT ──────────────────────────────────────
async function init() {
  await DB.open();
  I18N.init();
  await seedDemoData();

  // Restore business preference
  const savedBiz = localStorage.getItem('business') || 'repair';
  switchBusiness(savedBiz);

  // Today's date defaults
  $$('input[type="date"]').forEach(el => { if (!el.value) el.value = today(); });
  $$('input[type="month"]').forEach(el => { if (!el.value) el.value = currentMonth(); });
  $('report-date').value = today();
  $('report-month').value = currentMonth();
  $('report-year').value = new Date().getFullYear();

  // Wire business selector
  $$('.biz-btn').forEach(btn => {
    btn.addEventListener('click', () => switchBusiness(btn.dataset.biz));
  });

  // Wire language selector
  $$('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      I18N.apply(btn.dataset.lang);
      $('biz-name').textContent = I18N.t(State.business === 'repair' ? 'repairShop' : 'convenienceStore');
    });
  });

  // Wire navigation
  $$('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => navigate(btn.dataset.section));
  });

  // Wire quick-add buttons and section header buttons
  $$('[data-modal]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.modal;
      // Reset hidden id fields before opening for new entries
      const form = document.querySelector(`#${id} form`);
      if (form) {
        const hiddenId = form.querySelector('input[type=hidden]');
        if (hiddenId) hiddenId.value = '';
      }
      // Default dates
      const dateField = document.querySelector(`#${id} input[type="date"]`);
      if (dateField && !dateField.value) dateField.value = today();
      openModal(id);
    });
  });

  // Modal close
  $$('.modal-close, .modal-close-btn').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });
  $$('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) closeModal(overlay.id);
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  // Form submissions
  $('form-repair-job').addEventListener('submit', handleRepairJob);
  $('form-product-sale').addEventListener('submit', handleProductSale);
  $('form-inventory').addEventListener('submit', handleInventory);
  $('form-daily-sale').addEventListener('submit', handleDailySale);
  $('form-new-customer').addEventListener('submit', handleNewCustomer);
  $('form-tab-entry').addEventListener('submit', handleTabEntry);
  $('form-expense').addEventListener('submit', handleExpense);

  // Add part button
  $('add-part-btn').addEventListener('click', () => { addPartRow(); updateRepairProfit(); });

  // Real-time profit calculations
  ['rj-charge', 'rj-labor-hours', 'rj-labor-rate'].forEach(id => {
    $(id)?.addEventListener('input', updateRepairProfit);
  });
  ['ps-cost', 'ps-sell', 'ps-qty'].forEach(id => {
    $(id)?.addEventListener('input', updateSaleProfit);
  });
  ['inv-qty', 'inv-cost'].forEach(id => {
    $(id)?.addEventListener('input', updateInventoryTotal);
  });
  ['ds-cash', 'ds-visa'].forEach(id => {
    $(id)?.addEventListener('input', updateDailyTotal);
  });

  // Tab settle button
  $('settle-tab-btn').addEventListener('click', handleSettleTab);

  // Filter inputs — live filtering
  ['repair-search', 'repair-status-filter', 'repair-month-filter'].forEach(id => {
    $(id)?.addEventListener('input', () => renderRepairJobs());
  });
  ['sale-search', 'sale-month-filter'].forEach(id => {
    $(id)?.addEventListener('input', () => renderProductSales());
  });
  ['inv-search', 'inv-category-filter'].forEach(id => {
    $(id)?.addEventListener('input', () => renderInventory());
  });
  $('ds-month-filter')?.addEventListener('input', () => renderDailySales());
  ['credit-search', 'credit-status-filter'].forEach(id => {
    $(id)?.addEventListener('input', () => renderCustomerCredit());
  });
  ['exp-search', 'exp-category-filter', 'exp-month-filter'].forEach(id => {
    $(id)?.addEventListener('input', () => renderExpenses());
  });

  // Report type selector
  $$('.report-type-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      $$('.report-type-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const type = btn.dataset.report;
      $('report-date').style.display = type === 'daily' ? '' : 'none';
      $('report-month').style.display = type === 'monthly' ? '' : 'none';
      $('report-year').style.display = type === 'yearly' ? '' : 'none';
    });
  });
  $('generate-report-btn').addEventListener('click', generateReport);

  // Export menu
  $('export-btn').addEventListener('click', e => {
    e.stopPropagation();
    $('export-dropdown').classList.toggle('open');
  });
  document.addEventListener('click', () => $('export-dropdown').classList.remove('open'));

  $$('[data-export]').forEach(btn => {
    btn.addEventListener('click', async () => {
      $('export-dropdown').classList.remove('open');
      const type = btn.dataset.export;
      if (type === 'json') await exportJSON();
      else if (type === 'pdf') exportReportPDF('Full Export');
      else if (type === 'excel') await exportReportExcel();
      else if (type === 'import') $('import-file-input').click();
    });
  });

  $('import-file-input').addEventListener('change', e => {
    const file = e.target.files[0];
    if (file) importJSON(file);
    e.target.value = '';
  });

  // Initial parts row
  addPartRow();
}

document.addEventListener('DOMContentLoaded', init);
