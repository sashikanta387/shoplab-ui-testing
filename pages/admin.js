/* Admin console: dashboard, products (inline edit), orders (fulfilment), returns. */
(function () {
  'use strict';
  const SL = window.ShopLab;
  const {
    $, $$, esc, money, round2, wait, today, plural, fmtDate, CATEGORY_LABELS, ORDER_STATUS, CARRIERS, PRODUCTS,
    Products, getProduct, productImage, Auth, Orders, toast, setBusy, statusBadge, lineMeta, carrierName,
    initTabs, createDataTable, attachContextMenu, downloadFile, downloadInvoice, TAX_RATE,
  } = SL;

  SL.pages.admin = function () {
    if (!Auth.isAdmin()) { $('#admin-denied').hidden = false; return; }
    $('#admin-content').hidden = false;

    const tabs = initTabs($('[data-testid="admin-tabs"]'), {
      initial: location.hash.slice(1) || 'dashboard',
      onChange: (name) => history.replaceState(null, '', '#' + name),
    });

    // ======================================================================
    // Dashboard
    // ======================================================================
    function renderDashboard() {
      const orders = Orders.all();
      const live = orders.filter((o) => o.status !== 'cancelled');
      const revenue = live.reduce((s, o) => s + o.totals.total, 0);
      const units = live.reduce((s, o) => s + o.items.reduce((a, i) => a + i.qty, 0), 0);
      const low = Products.visible().filter((p) => p.stock <= 5);
      const pending = orders.filter((o) => o.status === 'processing').length;
      const returns = orders.filter((o) => o.status === 'return_requested').length;
      const kpi = (id, label, value, hint) =>
        '<div class="kpi" data-testid="admin-kpi-' + id + '"><span class="kpi-label">' + label + '</span><strong class="kpi-value" data-testid="admin-kpi-' + id + '-value">' + value + '</strong><span class="small muted">' + hint + '</span></div>';
      $('#kpi-grid').innerHTML =
        kpi('revenue', 'Revenue', money(revenue), plural(live.length, 'paid order')) +
        kpi('orders', 'Orders', String(orders.length), pending + ' awaiting fulfilment') +
        kpi('aov', 'Avg. order value', money(live.length ? revenue / live.length : 0), plural(units, 'unit') + ' sold') +
        kpi('low-stock', 'Low stock', String(low.length), 'products at 5 or fewer') +
        kpi('returns', 'Open returns', String(returns), 'awaiting review');

      const counts = Object.keys(ORDER_STATUS).map((k) => [k, orders.filter((o) => o.status === k).length]);
      const max = Math.max(1, ...counts.map((c) => c[1]));
      $('#status-chart').innerHTML = counts.map(([k, n]) =>
        '<div class="bar-row" data-testid="admin-status-bar-' + k + '" data-count="' + n + '"><span class="bar-label">' + ORDER_STATUS[k].label + '</span>' +
        '<div class="bar-track"><div class="bar-fill status-' + k + '" style="width:' + Math.round((n / max) * 100) + '%"></div></div><strong>' + n + '</strong></div>').join('');

      $('#low-stock').innerHTML = low.length ? low.map((p) =>
        '<li data-testid="admin-low-stock-item" data-product-id="' + p.id + '"><img src="' + productImage(p) + '" alt="" width="36" height="36">' +
        '<span><strong>' + esc(p.name) + '</strong><br><span class="small ' + (p.stock ? 'stock-note low' : 'stock-note out') + '">' + (p.stock ? p.stock + ' left' : 'Out of stock') + '</span></span>' +
        '<button type="button" class="btn btn-sm" data-restock="' + p.id + '" data-testid="admin-restock-btn">+20 stock</button></li>').join('')
        : '<li class="muted small">All products are well stocked.</li>';

      const recent = orders.slice().sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);
      $('#recent-orders').innerHTML = recent.length ? recent.map((o) =>
        '<li data-testid="admin-recent-order"><span><a class="mono" href="order.html?id=' + encodeURIComponent(o.id) + '">' + esc(o.id) + '</a><br><span class="small muted">' + esc(o.customer.name) + ' · ' + fmtDate(o.date) + '</span></span>' +
        statusBadge(o.status) + '<strong>' + money(o.totals.total) + '</strong></li>').join('')
        : '<li class="muted small">No orders yet. Place one in the store or generate sample orders.</li>';

      $('#admin-orders-pending').textContent = pending ? String(pending) : '';
      $('#admin-returns-pending').textContent = returns ? String(returns) : '';
    }

    $('#low-stock').addEventListener('click', (e) => {
      const b = e.target.closest('[data-restock]');
      if (!b) return;
      const p = getProduct(b.dataset.restock);
      Products.update(p.id, { stock: p.stock + 20 });
      toast(p.name + ' restocked (+20)', 'success');
    });

    // Sample orders across every status.
    $('#admin-seed').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      setBusy(btn, true, 'Generating…');
      await wait(700);
      setBusy(btn, false);
      const statuses = ['processing', 'processing', 'shipped', 'shipped', 'delivered', 'delivered', 'delivered', 'cancelled', 'return_requested', 'returned', 'processing', 'delivered'];
      const cities = [['221B Baker Street', 'London', 'NW1 6XE', 'United Kingdom'], ['1 Infinite Loop', 'Cupertino', '95014', 'United States'], ['10 Downing Street', 'London', 'SW1A 2AA', 'United Kingdom'], ['5 Rue de Rivoli', 'Paris', '75001', 'France']];
      const created = statuses.map((status, n) => {
        const placed = new Date(Date.now() - (n + 1) * 2 * 86400000 - n * 3600000);
        const picks = [PRODUCTS[(n * 3) % 12], PRODUCTS[(n * 5 + 1) % 12]].filter((p) => p.stock > 0).slice(0, 1 + (n % 2));
        const items = picks.map((p, k) => ({ key: p.id + '|' + p.options[0] + '|' + p.colors[0].name, id: p.id, name: p.name, qty: 1 + ((n + k) % 2), unitPrice: p.price, variant: p.options[0], color: p.colors[0].name, custom: null, prescription: null }));
        const subtotal = round2(items.reduce((s, i) => s + i.unitPrice * i.qty, 0));
        const shipping = subtotal >= 100 ? 0 : 5.99;
        const tax = round2(subtotal * TAX_RATE);
        const c = cities[n % cities.length];
        const iso = (d) => new Date(placed.getTime() + d * 86400000).toISOString();
        const history = [{ status: 'processing', at: placed.toISOString(), note: 'Order placed' }];
        const o = {
          id: 'SL-' + placed.toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(1000 + n * 7 + Math.floor(Math.random() * 6)),
          user: 'standard_user', date: placed.toISOString(), status, history,
          customer: { name: 'Standard User', email: 'standard.user@shoplab.test', phone: '' },
          address: { line1: c[0], city: c[1], postalCode: c[2], country: c[3] },
          shipping: { method: 'standard', slot: 'anytime', eta: iso(6).slice(0, 10) },
          payment: { method: 'card', last4: '4242', brand: 'VISA' }, promo: null, giftMessage: '', notes: '',
          items, totals: { subtotal, discount: 0, shipping, tax, total: round2(subtotal + shipping + tax) },
        };
        if (status === 'cancelled') history.push({ status: 'cancelled', at: iso(0.2), note: 'Cancelled by customer' });
        if (['shipped', 'delivered', 'return_requested', 'returned'].includes(status)) {
          o.tracking = { carrier: ['ups', 'fedex', 'dhl'][n % 3], number: '1Z' + String(100000000 + n * 7919).padStart(12, '0'), shippedAt: iso(1) };
          history.push({ status: 'shipped', at: iso(1), note: 'Shipped via ' + carrierName(o.tracking.carrier) + ' (' + o.tracking.number + ')' });
        }
        if (['delivered', 'return_requested', 'returned'].includes(status)) history.push({ status: 'delivered', at: iso(4), note: 'Left at front door' });
        if (['return_requested', 'returned'].includes(status)) {
          o.returnRequest = { id: 'RMA-' + (500000 + n), items: [items[0].key], itemNames: [items[0].name], reason: 'damaged', reasonLabel: 'Arrived damaged', details: 'Box was crushed.', refund: 'original', photos: ['damage.jpg'], status: 'requested', at: iso(5) };
          history.push({ status: 'return_requested', at: iso(5), note: 'Return ' + o.returnRequest.id + ' requested' });
        }
        if (status === 'returned') {
          o.returnRequest.status = 'approved';
          history.push({ status: 'returned', at: iso(7), note: 'Refund of ' + money(o.totals.total) + ' issued' });
        }
        return o;
      });
      Orders.saveAll(Orders.all().concat(created));
      toast('Created 12 sample orders', 'success');
    });
    $('#admin-clear-orders').addEventListener('click', () => {
      if (!window.confirm('Delete ALL orders for every customer?')) return;
      Orders.saveAll([]);
      toast('All orders deleted', 'info');
    });

    // ======================================================================
    // Products
    // ======================================================================
    const stockState = (p) => (p.archived ? 'archived' : p.stock === 0 ? 'out' : p.stock <= 5 ? 'low' : 'active');
    const STOCK_BADGE = { active: ['Active', 'badge-success'], low: ['Low stock', 'badge-warning'], out: ['Out of stock', 'badge-danger'], archived: ['Archived', ''] };

    const products = createDataTable({
      root: $('#admin-products'),
      prefix: 'admin-products',
      selectable: true,
      pageSizes: [5, 10, 25],
      getRows: () => PRODUCTS,
      rowKey: (p) => String(p.id),
      rowAttrs: (p) => 'data-product-id="' + p.id + '" data-state="' + stockState(p) + '"',
      searchFn: (p) => Products.sku(p) + ' ' + p.name + ' ' + p.vendor,
      searchPlaceholder: 'Search by name, SKU or vendor',
      filters: [
        { id: 'category', label: 'Filter by category', options: [['', 'All categories']].concat(Object.keys(CATEGORY_LABELS).map((k) => [k, CATEGORY_LABELS[k]])), test: (p, v) => p.category === v },
        { id: 'state', label: 'Filter by status', options: [['', 'Any status'], ['active', 'Active'], ['low', 'Low stock'], ['out', 'Out of stock'], ['archived', 'Archived']], test: (p, v) => stockState(p) === v },
      ],
      toolbarHtml:
        '<button type="button" class="btn btn-sm" id="products-bulk-archive" data-testid="admin-products-bulk-archive" disabled>Archive selected</button>' +
        '<button type="button" class="btn btn-sm" id="products-export-csv" data-testid="admin-products-export-csv">⬇ CSV</button>' +
        '<button type="button" class="btn btn-sm" id="products-export-json" data-testid="admin-products-export-json">⬇ JSON</button>' +
        '<button type="button" class="btn btn-sm btn-ghost" id="products-reset" data-testid="admin-products-reset">Reset catalog</button>',
      onRender: (t) => { $('#products-bulk-archive').disabled = !t.state.selected.size; },
      columns: [
        {
          key: 'name', label: 'Product', sortable: true,
          render: (p) => '<div class="cell-product"><img src="' + productImage(p) + '" alt="" width="40" height="40"><span><strong>' + esc(p.name) + '</strong><br><span class="small muted mono">' + Products.sku(p) + '</span></span></div>',
        },
        { key: 'category', label: 'Category', sortable: true, render: (p) => esc(CATEGORY_LABELS[p.category]) },
        {
          key: 'price', label: 'Price', num: true, sortable: true,
          render: (p, t) => (t.state.editing === String(p.id)
            ? '<input class="input input-sm" type="number" min="0.01" step="0.01" id="edit-price-' + p.id + '" data-testid="admin-products-edit-price" aria-label="Price" value="' + p.price.toFixed(2) + '">'
            : money(p.price)),
        },
        {
          key: 'stock', label: 'Stock', num: true, sortable: true,
          render: (p, t) => (t.state.editing === String(p.id)
            ? '<input class="input input-sm" type="number" min="0" step="1" id="edit-stock-' + p.id + '" data-testid="admin-products-edit-stock" aria-label="Stock" value="' + p.stock + '">'
            : String(p.stock)),
        },
        { key: 'state', label: 'Status', sortable: true, sortValue: stockState, render: (p) => '<span class="badge ' + STOCK_BADGE[stockState(p)][1] + '" data-testid="admin-products-status">' + STOCK_BADGE[stockState(p)][0] + '</span>' },
        {
          key: 'actions', label: 'Actions',
          render: (p, t) => '<div class="row-actions">' + (t.state.editing === String(p.id)
            ? '<button type="button" class="btn btn-sm btn-primary" data-act="save" data-testid="admin-products-save">Save</button><button type="button" class="btn btn-sm" data-act="cancel" data-testid="admin-products-cancel">Cancel</button>'
            : '<button type="button" class="btn btn-sm" data-act="edit" data-testid="admin-products-edit" aria-label="Edit ' + esc(p.name) + '">Edit</button>' +
              '<button type="button" class="btn btn-sm" data-act="' + (p.archived ? 'restore' : 'archive') + '" data-testid="admin-products-' + (p.archived ? 'restore' : 'archive') + '" aria-label="' + (p.archived ? 'Restore ' : 'Archive ') + esc(p.name) + '">' + (p.archived ? 'Restore' : 'Archive') + '</button>' +
              '<a class="btn btn-sm btn-ghost" href="product-detail.html?id=' + p.id + '" target="_blank" rel="noopener" data-testid="admin-products-view" aria-label="View ' + esc(p.name) + ' in store (new tab)">View ↗</a>') + '</div>',
        },
      ],
    });
    products.render();

    function productAction(act, id) {
      const p = getProduct(id);
      switch (act) {
        case 'edit':
          products.state.editing = String(id);
          products.render();
          $('#edit-price-' + id).focus();
          break;
        case 'cancel':
          products.state.editing = null;
          products.render();
          break;
        case 'save': {
          const priceEl = $('#edit-price-' + id);
          const stockEl = $('#edit-stock-' + id);
          const price = Number(priceEl.value);
          const stock = Number(stockEl.value);
          priceEl.setAttribute('aria-invalid', String(!(price > 0)));
          stockEl.setAttribute('aria-invalid', String(!Number.isInteger(stock) || stock < 0));
          if (!(price > 0) || !Number.isInteger(stock) || stock < 0) { toast('Price must be > 0 and stock a whole number ≥ 0.', 'error'); return; }
          products.state.editing = null;
          Products.update(id, { price: round2(price), stock });
          toast(p.name + ' updated', 'success');
          break;
        }
        case 'archive':
          if (!window.confirm('Archive ' + p.name + '? It will disappear from the store.')) return;
          Products.update(id, { archived: true });
          toast(p.name + ' archived', 'info');
          break;
        case 'restore':
          Products.update(id, { archived: false });
          toast(p.name + ' restored to the store', 'success');
          break;
        case 'restock':
          Products.update(id, { stock: p.stock + 20 });
          toast(p.name + ' restocked (+20)', 'success');
          break;
        case 'view':
          window.open('product-detail.html?id=' + id, '_blank', 'noopener');
          break;
        case 'copy-sku':
          if (navigator.clipboard) navigator.clipboard.writeText(Products.sku(p)).catch(() => {});
          toast('Copied ' + Products.sku(p), 'info');
          break;
        default:
      }
    }

    products.tbody.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-act]');
      if (b) productAction(b.dataset.act, Number(b.closest('tr').dataset.key));
    });
    products.tbody.addEventListener('keydown', (e) => {
      if (!products.state.editing || !e.target.matches('input.input')) return;
      if (e.key === 'Enter') productAction('save', Number(products.state.editing));
      if (e.key === 'Escape') productAction('cancel');
    });
    attachContextMenu(products.tbody, 'tr[data-product-id]', (row) => {
      const p = getProduct(row.dataset.productId);
      return [
        { action: 'edit', label: '✏️ Edit price & stock' },
        { action: 'restock', label: '📦 Restock +20' },
        { action: p.archived ? 'restore' : 'archive', label: p.archived ? '♻️ Restore' : '🗄 Archive' },
        { action: 'view', label: '↗ View in store' },
        { action: 'copy-sku', label: '📋 Copy SKU' },
      ];
    }, (act, row) => productAction(act, Number(row.dataset.productId)), 'admin-products-context-menu');

    $('#products-bulk-archive').addEventListener('click', () => {
      const ids = Array.from(products.state.selected);
      if (!window.confirm('Archive ' + plural(ids.length, 'product') + '?')) return;
      ids.forEach((id) => Products.update(id, { archived: true }));
      products.state.selected.clear();
      toast('Archived ' + plural(ids.length, 'product'), 'info');
    });
    $('#products-export-csv').addEventListener('click', () => {
      const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
      const rows = [['SKU', 'Name', 'Category', 'Price', 'Stock', 'Status']].concat(PRODUCTS.map((p) => [Products.sku(p), p.name, CATEGORY_LABELS[p.category], p.price.toFixed(2), p.stock, stockState(p)]));
      downloadFile('products-' + today() + '.csv', rows.map((r) => r.map(q).join(',')).join('\r\n'), 'text/csv;charset=utf-8');
    });
    $('#products-export-json').addEventListener('click', () => {
      downloadFile('products-' + today() + '.json', JSON.stringify(PRODUCTS.map((p) => ({ sku: Products.sku(p), id: p.id, name: p.name, category: p.category, price: p.price, stock: p.stock, archived: p.archived })), null, 2), 'application/json');
    });
    $('#products-reset').addEventListener('click', () => {
      if (!window.confirm('Restore every product’s original price, stock and visibility?')) return;
      Products.resetAll();
      toast('Catalog reset to defaults', 'info');
    });

    // ======================================================================
    // Orders
    // ======================================================================
    const ordersTable = createDataTable({
      root: $('#admin-orders'),
      prefix: 'admin-orders',
      pageSizes: [5, 10, 25],
      sortKey: 'date',
      sortDir: 'desc',
      getRows: () => Orders.all(),
      rowKey: (o) => o.id,
      rowAttrs: (o) => 'data-status="' + o.status + '"',
      searchFn: (o) => o.id + ' ' + o.customer.name + ' ' + o.user + ' ' + o.customer.email,
      searchPlaceholder: 'Search order, customer or email',
      filters: [{ id: 'status', label: 'Filter by status', options: [['', 'All statuses']].concat(Object.keys(ORDER_STATUS).map((k) => [k, ORDER_STATUS[k].label])), test: (o, v) => o.status === v }],
      emptyHtml: 'No orders yet.',
      columns: [
        { key: 'id', label: 'Order', sortable: true, render: (o) => '<a class="mono strong-link" href="order.html?id=' + encodeURIComponent(o.id) + '" data-testid="admin-orders-link">' + esc(o.id) + '</a>' },
        { key: 'customer', label: 'Customer', sortable: true, sortValue: (o) => o.customer.name, render: (o) => esc(o.customer.name) + '<br><span class="small muted">' + esc(o.user) + '</span>' },
        { key: 'date', label: 'Placed', sortable: true, render: (o) => fmtDate(o.date) },
        { key: 'total', label: 'Total', num: true, sortable: true, sortValue: (o) => o.totals.total, render: (o) => money(o.totals.total) },
        { key: 'status', label: 'Status', sortable: true, render: (o) => statusBadge(o.status, 'admin-orders-status') },
        {
          key: 'actions', label: 'Actions',
          render: (o) => '<div class="row-actions">' +
            (o.status === 'processing' ? '<button type="button" class="btn btn-sm btn-primary" data-act="fulfil" data-testid="admin-orders-fulfil">Fulfil</button>' : '') +
            (o.status === 'shipped' ? '<button type="button" class="btn btn-sm btn-success" data-act="deliver" data-testid="admin-orders-deliver">Mark delivered</button>' : '') +
            (o.status === 'processing' ? '<button type="button" class="btn btn-sm" data-act="cancel" data-testid="admin-orders-cancel">Cancel</button>' : '') +
            '<button type="button" class="btn btn-sm btn-ghost" data-act="invoice" data-testid="admin-orders-invoice">Invoice</button>' +
          '</div>',
        },
      ],
    });
    ordersTable.render();

    function orderAction(act, id) {
      const o = Orders.get(id);
      if (act === 'fulfil') openFulfil(o);
      if (act === 'deliver') {
        Orders.update(id, (x) => Orders.setStatus(x, 'delivered', 'Delivered — left at front door'));
        toast(id + ' marked as delivered', 'success');
      }
      if (act === 'cancel') {
        if (!window.confirm('Cancel order ' + id + ' and refund the customer?')) return;
        Orders.update(id, (x) => Orders.setStatus(x, 'cancelled', 'Cancelled by store'));
        toast(id + ' cancelled', 'info');
      }
      if (act === 'invoice') downloadInvoice(o);
      if (act === 'view') location.href = 'order.html?id=' + encodeURIComponent(id);
      if (act === 'copy-id') { if (navigator.clipboard) navigator.clipboard.writeText(id).catch(() => {}); toast('Copied ' + id, 'info'); }
    }
    ordersTable.tbody.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-act]');
      if (b) orderAction(b.dataset.act, b.closest('tr').dataset.key);
    });
    attachContextMenu(ordersTable.tbody, 'tr[data-key]', (row) => {
      const st = row.dataset.status;
      return [
        { action: 'view', label: '👁 View order' },
        { action: 'fulfil', label: '🚚 Fulfil', disabled: st !== 'processing' },
        { action: 'deliver', label: '✅ Mark delivered', disabled: st !== 'shipped' },
        { action: 'cancel', label: '✕ Cancel order', disabled: st !== 'processing' },
        { action: 'invoice', label: '⬇ Download invoice' },
        { action: 'copy-id', label: '📋 Copy order ID' },
      ];
    }, (act, row) => orderAction(act, row.dataset.key), 'admin-orders-context-menu');

    // ---- Fulfilment dialog --------------------------------------------------
    const fulfil = $('#fulfil-modal');
    let fulfilling = null;
    $('#fulfil-carrier').innerHTML = '<option value="">— Choose a carrier —</option>' + CARRIERS.map((g) =>
      '<optgroup label="' + g.group + '">' + g.options.map(([v, l, dis]) => '<option value="' + v + '"' + (dis ? ' disabled' : '') + '>' + l + '</option>').join('') + '</optgroup>').join('');
    const genTracking = () => {
      const c = $('#fulfil-carrier').value;
      const prefix = { ups: '1Z', fedex: 'FX', usps: '94', dhl: 'JD', 'royal-mail': 'RM' }[c] || 'SL';
      $('#fulfil-tracking').value = prefix + String(Math.floor(Math.random() * 1e12)).padStart(12, '0');
    };
    function openFulfil(o) {
      fulfilling = o;
      $('#fulfil-order-id').textContent = o.id;
      $('#fulfil-items').innerHTML = o.items.map((i) => i.qty + ' × ' + esc(i.name) + ' <span class="muted">(' + esc(lineMeta(i)) + ')</span>').join('<br>') +
        '<br>Ship to: ' + esc(o.address.line1 + ', ' + o.address.city + ', ' + o.address.country);
      $('#fulfil-form').reset();
      $$('[aria-invalid]', fulfil).forEach((el) => el.removeAttribute('aria-invalid'));
      $$('.field-error', fulfil).forEach((el) => { el.textContent = ''; });
      $('#fulfil-date').value = today();
      $('#fulfil-date').min = o.date.slice(0, 10);
      $('#fulfil-date').max = today();
      fulfil.showModal();
    }
    $('#fulfil-generate').addEventListener('click', genTracking);
    $('#fulfil-carrier').addEventListener('change', () => { if (!$('#fulfil-tracking').value) genTracking(); });
    $('#fulfil-close').addEventListener('click', () => fulfil.close());
    $('#fulfil-cancel').addEventListener('click', () => fulfil.close());
    $('#fulfil-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const carrier = $('#fulfil-carrier').value;
      const number = $('#fulfil-tracking').value.trim();
      const date = $('#fulfil-date').value;
      const checks = [
        ['fulfil-carrier', carrier ? '' : 'Choose a carrier.'],
        ['fulfil-tracking', /^[A-Z0-9]{10,18}$/.test(number) ? '' : 'Tracking numbers are 10–18 capital letters or digits.'],
        ['fulfil-date', !date ? 'Choose the ship date.' : date < $('#fulfil-date').min || date > today() ? 'Ship date must be between the order date and today.' : ''],
      ];
      let first = null;
      checks.forEach(([id, msg]) => {
        $('#' + id + '-error').textContent = msg;
        $('#' + id).setAttribute('aria-invalid', String(Boolean(msg)));
        if (msg && !first) first = $('#' + id);
      });
      if (first) { first.focus(); return; }
      const btn = $('#fulfil-submit');
      setBusy(btn, true, 'Creating label…');
      await wait(1000);
      setBusy(btn, false);
      const notify = $('#fulfil-notify').checked;
      Orders.update(fulfilling.id, (o) => {
        o.tracking = { carrier, number, shippedAt: date };
        Orders.setStatus(o, 'shipped', 'Shipped via ' + carrierName(carrier) + ' (' + number + ')' + (notify ? ' · customer notified' : ''));
      });
      fulfil.close();
      toast(fulfilling.id + ' shipped with ' + carrierName(carrier), 'success');
    });

    // ======================================================================
    // Returns
    // ======================================================================
    const RETURN_BADGE = { requested: ['Awaiting review', 'badge-warning'], approved: ['Approved', 'badge-success'], rejected: ['Rejected', 'badge-danger'] };
    const returnsTable = createDataTable({
      root: $('#admin-returns'),
      prefix: 'admin-returns',
      pageSizes: [5, 10, 25],
      sortKey: 'at',
      sortDir: 'desc',
      getRows: () => Orders.all().filter((o) => o.returnRequest),
      rowKey: (o) => o.returnRequest.id,
      rowAttrs: (o) => 'data-order-id="' + esc(o.id) + '" data-status="' + o.returnRequest.status + '"',
      searchFn: (o) => o.returnRequest.id + ' ' + o.id + ' ' + o.customer.name,
      searchPlaceholder: 'Search RMA, order or customer',
      filters: [{ id: 'status', label: 'Filter by status', options: [['', 'All'], ['requested', 'Awaiting review'], ['approved', 'Approved'], ['rejected', 'Rejected']], test: (o, v) => o.returnRequest.status === v }],
      emptyHtml: 'No return requests.',
      columns: [
        { key: 'rma', label: 'RMA', sortable: true, sortValue: (o) => o.returnRequest.id, render: (o) => '<span class="mono">' + esc(o.returnRequest.id) + '</span>' },
        { key: 'order', label: 'Order', sortable: true, sortValue: (o) => o.id, render: (o) => '<a class="mono" href="order.html?id=' + encodeURIComponent(o.id) + '">' + esc(o.id) + '</a><br><span class="small muted">' + esc(o.customer.name) + '</span>' },
        { key: 'reason', label: 'Reason', sortable: true, sortValue: (o) => o.returnRequest.reasonLabel, render: (o) => esc(o.returnRequest.reasonLabel) + '<br><span class="small muted">' + plural(o.returnRequest.photos.length, 'photo') + '</span>' },
        { key: 'at', label: 'Requested', sortable: true, sortValue: (o) => o.returnRequest.at, render: (o) => fmtDate(o.returnRequest.at) },
        { key: 'status', label: 'Status', sortable: true, sortValue: (o) => o.returnRequest.status, render: (o) => '<span class="badge ' + RETURN_BADGE[o.returnRequest.status][1] + '" data-testid="admin-returns-status">' + RETURN_BADGE[o.returnRequest.status][0] + '</span>' },
        {
          key: 'actions', label: 'Actions',
          render: (o) => '<div class="row-actions"><button type="button" class="btn btn-sm" data-act="review" data-testid="admin-returns-review">Review</button>' +
            (o.returnRequest.status === 'requested'
              ? '<button type="button" class="btn btn-sm btn-success" data-act="approve" data-testid="admin-returns-approve">Approve</button>' +
                '<button type="button" class="btn btn-sm btn-danger" data-act="reject" data-testid="admin-returns-reject">Reject</button>'
              : '') + '</div>',
        },
      ],
    });
    returnsTable.render();

    async function returnAction(act, orderId) {
      const o = Orders.get(orderId);
      const r = o.returnRequest;
      if (act === 'review') {
        $('#return-review-id').textContent = r.id;
        $('#return-review-body').innerHTML =
          '<dl class="totals"><div><dt>Order</dt><dd class="mono">' + esc(o.id) + '</dd></div><div><dt>Customer</dt><dd>' + esc(o.customer.name) + '</dd></div>' +
          '<div><dt>Reason</dt><dd>' + esc(r.reasonLabel) + '</dd></div><div><dt>Refund to</dt><dd>' + (r.refund === 'credit' ? 'Store credit' : 'Original payment') + '</dd></div></dl>' +
          '<p><strong>Items:</strong> ' + esc((r.itemNames || []).join(', ')) + '</p>' +
          (r.details ? '<p><strong>Details:</strong> ' + esc(r.details) + '</p>' : '') +
          '<p><strong>Photos:</strong> ' + (r.photos.length ? r.photos.map((f) => '<span class="badge">📷 ' + esc(f) + '</span>').join(' ') : 'none') + '</p>';
        $('#return-review-modal').showModal();
      }
      if (act === 'approve') {
        Orders.update(orderId, (x) => {
          x.returnRequest.status = 'approved';
          x.returnRequest.decisionNote = 'Approved — refund issued';
          Orders.setStatus(x, 'returned', 'Refund of ' + money(x.totals.total) + ' issued');
        });
        toast(r.id + ' approved and refunded', 'success');
      }
      if (act === 'reject') {
        const note = window.prompt('Reason for rejecting ' + r.id + ' (shown to the customer):', '');
        if (note === null) return;
        if (!note.trim()) { window.alert('A rejection reason is required.'); return; }
        Orders.update(orderId, (x) => {
          x.returnRequest.status = 'rejected';
          x.returnRequest.decisionNote = note.trim();
          Orders.setStatus(x, 'return_rejected', 'Return rejected: ' + note.trim());
        });
        toast(r.id + ' rejected', 'info');
      }
    }
    returnsTable.tbody.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-act]');
      if (b) returnAction(b.dataset.act, b.closest('tr').dataset.orderId);
    });
    $('#return-review-close').addEventListener('click', () => $('#return-review-modal').close());

    // ---- Keep everything in sync ------------------------------------------
    const refresh = () => { renderDashboard(); products.render(); ordersTable.render(); returnsTable.render(); };
    document.addEventListener('orders:change', refresh);
    document.addEventListener('products:change', refresh);
    renderDashboard();
    void tabs;
  };
})();
