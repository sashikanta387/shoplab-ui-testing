/* My account: orders, wishlist (drag & drop), returns (upload), profile. */
(function () {
  'use strict';
  const SL = window.ShopLab;
  const {
    $, $$, esc, money, wait, param, fmtDate, plural, EMAIL_RE, ORDER_STATUS, store, KEYS,
    getProduct, productImage, Auth, Cart, Wishlist, Orders, Profile, Drawer, toast, setBusy, statusBadge, lineMeta,
    initTabs, createDataTable, createUploader, makeSortable, makeDropZone, downloadInvoice, formatPhone,
  } = SL;

  SL.pages.account = function () {
    const session = Auth.session();

    // ---- Header + stats -----------------------------------------------------
    function renderStats() {
      const mine = Orders.mine();
      $('#stat-orders').textContent = String(mine.length);
      $('#stat-spent').textContent = money(mine.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.totals.total, 0));
      $('#stat-wishlist').textContent = String(Wishlist.ids().length);
      $('#stat-returns').textContent = String(mine.filter((o) => o.status === 'return_requested').length);
    }
    const profile = Profile.get(session.user);
    $('#account-greeting').textContent = 'Hi, ' + (profile.name || session.user).split(' ')[0] + ' 👋';
    $('#account-avatar').textContent = (profile.name || session.user).charAt(0).toUpperCase();
    renderStats();

    // ---- Tabs synced with the URL hash -------------------------------------
    const tabs = initTabs($('[data-testid="account-tabs"]'), {
      initial: location.hash.slice(1) || 'orders',
      onChange: (name) => history.replaceState(null, '', location.pathname + location.search + '#' + name),
    });
    window.addEventListener('hashchange', () => tabs.select(location.hash.slice(1)));

    // ---- Orders table -------------------------------------------------------
    const table = createDataTable({
      root: $('#orders-table'),
      prefix: 'orders',
      pageSizes: [5, 10, 25],
      sortKey: 'date',
      sortDir: 'desc',
      getRows: () => Orders.mine(),
      rowKey: (o) => o.id,
      rowAttrs: (o) => 'data-status="' + o.status + '"',
      searchFn: (o) => o.id + ' ' + o.items.map((i) => i.name).join(' '),
      searchPlaceholder: 'Search orders or products',
      filters: [{
        id: 'status', label: 'Filter by status',
        options: [['', 'All statuses']].concat(Object.keys(ORDER_STATUS).map((k) => [k, ORDER_STATUS[k].label])),
        test: (o, v) => o.status === v,
      }],
      emptyHtml: '<div class="table-empty-inner"><span class="emoji">📦</span><p>No orders yet.</p><a href="index.html#catalog" class="btn btn-primary btn-sm" data-testid="orders-start-shopping">Start shopping</a></div>',
      columns: [
        { key: 'id', label: 'Order', sortable: true, render: (o) => '<a href="order.html?id=' + encodeURIComponent(o.id) + '" class="mono strong-link" data-testid="orders-order-link">' + esc(o.id) + '</a>' },
        { key: 'date', label: 'Placed', sortable: true, render: (o) => fmtDate(o.date) },
        {
          key: 'items', label: 'Items', sortable: true, sortValue: (o) => o.items.reduce((s, i) => s + i.qty, 0),
          render: (o) => '<span class="thumb-stack">' + o.items.slice(0, 3).map((i) => { const p = getProduct(i.id); return '<img src="' + productImage(p) + '" alt="" width="28" height="28">'; }).join('') + '</span> ' + plural(o.items.reduce((s, i) => s + i.qty, 0), 'item'),
        },
        { key: 'total', label: 'Total', num: true, sortable: true, sortValue: (o) => o.totals.total, render: (o) => money(o.totals.total) },
        { key: 'status', label: 'Status', sortable: true, render: (o) => statusBadge(o.status, 'orders-status-badge') },
        {
          key: 'actions', label: 'Actions',
          render: (o) => '<div class="row-actions">' +
            '<a class="btn btn-sm" href="order.html?id=' + encodeURIComponent(o.id) + '" data-testid="orders-track-btn">Track</a>' +
            '<button type="button" class="btn btn-sm" data-act="invoice" data-testid="orders-invoice-btn" aria-label="Download invoice for ' + esc(o.id) + '">Invoice</button>' +
            '<button type="button" class="btn btn-sm" data-act="reorder" data-testid="orders-reorder-btn" aria-label="Buy ' + esc(o.id) + ' again">Buy again</button>' +
            (o.status === 'processing' ? '<button type="button" class="btn btn-sm btn-danger" data-act="cancel" data-testid="orders-cancel-btn" aria-label="Cancel ' + esc(o.id) + '">Cancel</button>' : '') +
            (o.status === 'delivered' ? '<button type="button" class="btn btn-sm" data-act="return" data-testid="orders-return-btn" aria-label="Return items from ' + esc(o.id) + '">Return</button>' : '') +
          '</div>',
        },
      ],
    });
    table.render();

    table.tbody.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-act]');
      if (!b) return;
      const id = b.closest('tr').dataset.key;
      const o = Orders.get(id);
      if (b.dataset.act === 'invoice') downloadInvoice(o);
      if (b.dataset.act === 'reorder') {
        let added = 0;
        o.items.forEach((i) => { added += Cart.add(i.id, i.qty, { variant: i.variant, color: i.color, custom: i.custom, prescription: i.prescription }); });
        if (added) { toast('Added ' + plural(added, 'item') + ' from ' + id + ' to your cart', 'success'); Drawer.open(); }
        else toast('Those items are out of stock right now.', 'error');
      }
      if (b.dataset.act === 'cancel') {
        if (!window.confirm('Cancel order ' + id + '? This cannot be undone.')) return;
        Orders.update(id, (x) => Orders.setStatus(x, 'cancelled', 'Cancelled by customer'));
        toast('Order ' + id + ' cancelled', 'success');
      }
      if (b.dataset.act === 'return') {
        tabs.select('returns');
        $('#return-order').value = id;
        $('#return-order').dispatchEvent(new Event('change'));
      }
    });
    document.addEventListener('orders:change', () => { table.render(); renderStats(); renderReturns(); });

    // ---- Wishlist -----------------------------------------------------------
    const wl = $('#wishlist-list');
    function renderWishlist() {
      const ids = Wishlist.ids();
      wl.innerHTML = ids.map((id, i) => {
        const p = getProduct(id);
        const out = p.stock <= 0 || p.archived;
        return '<li class="wishlist-item" draggable="true" data-id="' + p.id + '" id="wishlist-item-' + p.id + '" data-testid="wishlist-item">' +
          '<span class="drag-handle" aria-hidden="true">⠿</span><span class="rank" data-testid="wishlist-item-rank">' + (i + 1) + '</span>' +
          '<img src="' + productImage(p) + '" alt="" width="56" height="56">' +
          '<div class="wishlist-info"><a href="product-detail.html?id=' + p.id + '" data-testid="wishlist-item-name">' + esc(p.name) + '</a>' +
            '<span class="small ' + (out ? 'stock-note out' : 'muted') + '">' + money(p.price) + (out ? ' · Out of stock' : '') + '</span></div>' +
          '<div class="row-actions">' +
            '<button type="button" class="btn btn-sm btn-primary" data-wl="cart" data-testid="wishlist-item-add-to-cart"' + (out || p.requiresPrescription ? ' disabled' : '') + ' aria-label="Move ' + esc(p.name) + ' to cart">Move to cart</button>' +
            '<button type="button" class="btn btn-sm btn-ghost btn-icon" data-wl="up" data-testid="wishlist-item-up" aria-label="Move ' + esc(p.name) + ' up"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
            '<button type="button" class="btn btn-sm btn-ghost btn-icon" data-wl="down" data-testid="wishlist-item-down" aria-label="Move ' + esc(p.name) + ' down"' + (i === ids.length - 1 ? ' disabled' : '') + '>↓</button>' +
            '<button type="button" class="btn btn-sm btn-ghost btn-icon" data-wl="remove" data-testid="wishlist-item-remove" aria-label="Remove ' + esc(p.name) + ' from wishlist">✕</button>' +
          '</div></li>';
      }).join('');
      $('#wishlist-empty').hidden = ids.length > 0;
      $('.wishlist-board').hidden = !ids.length;
      $('#wishlist-add-all').disabled = !ids.length;
      $('#wishlist-order').textContent = ids.length ? ids.map((id) => getProduct(id).name).join(' > ') : 'empty';
      wl.dataset.order = ids.join(',');
      renderStats();
    }

    function moveToCart(id) {
      const p = getProduct(id);
      if (p.requiresPrescription) { toast(p.name + ' needs a prescription — add it from the product page.', 'error'); return false; }
      const added = Cart.add(p.id, 1);
      if (!added) { toast(p.name + ' is out of stock', 'error'); return false; }
      Wishlist.set(Wishlist.ids().filter((x) => x !== p.id));
      toast(p.name + ' moved to your cart', 'success');
      return true;
    }

    makeSortable([wl], () => Wishlist.set($$(':scope > li', wl).map((li) => Number(li.dataset.id))));
    makeDropZone($('#wishlist-cart-dropzone'), (id) => {
      if (moveToCart(id)) {
        const z = $('#wishlist-cart-dropzone');
        z.classList.add('is-success');
        $('#wishlist-dropzone-text').textContent = 'Added ' + getProduct(id).name + ' ✓';
        setTimeout(() => { z.classList.remove('is-success'); $('#wishlist-dropzone-text').textContent = 'Uses the default option and colour'; }, 2000);
      }
      renderWishlist();
    });
    wl.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-wl]');
      if (!b) return;
      const id = Number(b.closest('li').dataset.id);
      const ids = Wishlist.ids();
      const i = ids.indexOf(id);
      if (b.dataset.wl === 'cart') moveToCart(id);
      if (b.dataset.wl === 'remove') { Wishlist.set(ids.filter((x) => x !== id)); toast('Removed from wishlist', 'info'); }
      if (b.dataset.wl === 'up' && i > 0) { [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]]; Wishlist.set(ids); }
      if (b.dataset.wl === 'down' && i < ids.length - 1) { [ids[i + 1], ids[i]] = [ids[i], ids[i + 1]]; Wishlist.set(ids); }
    });
    $('#wishlist-add-all').addEventListener('click', async (e) => {
      const btn = e.currentTarget;
      setBusy(btn, true, 'Adding…');
      await wait(600);
      setBusy(btn, false);
      let moved = 0;
      Wishlist.ids().forEach((id) => {
        const p = getProduct(id);
        if (!p.requiresPrescription && Cart.add(id, 1)) { moved++; Wishlist.set(Wishlist.ids().filter((x) => x !== id)); }
      });
      toast(moved ? plural(moved, 'item') + ' moved to your cart' : 'Nothing could be added — items are out of stock', moved ? 'success' : 'error');
      if (moved) Drawer.open();
    });
    document.addEventListener('wishlist:change', renderWishlist);
    renderWishlist();

    // ---- Returns ------------------------------------------------------------
    const orderSel = $('#return-order');
    const reason = $('#return-reason');
    const photos = createUploader($('#return-uploader'), { prefix: 'return-photo', label: 'Upload photos of the item', maxFiles: 3 });

    function eligible() { return Orders.mine().filter((o) => o.status === 'delivered'); }

    function renderReturnOptions() {
      const current = orderSel.value;
      orderSel.innerHTML = '<option value="">— Select a delivered order —</option>' +
        eligible().map((o) => '<option value="' + esc(o.id) + '">' + esc(o.id) + ' · ' + fmtDate(o.date) + ' · ' + money(o.totals.total) + '</option>').join('');
      if (eligible().some((o) => o.id === current)) orderSel.value = current;
      $('#returns-none').hidden = eligible().length > 0;
      $('#return-form').hidden = !eligible().length;
    }

    function renderItems() {
      const o = Orders.get(orderSel.value);
      $('#return-items-list').innerHTML = o
        ? o.items.map((i, n) => '<label class="return-item check" for="return-item-' + n + '"><input type="checkbox" id="return-item-' + n + '" value="' + n + '" data-testid="return-item-checkbox">' +
            '<img src="' + productImage(getProduct(i.id)) + '" alt="" width="40" height="40"><span><strong>' + esc(i.name) + '</strong><br><span class="small muted">' + i.qty + ' × ' + esc(lineMeta(i)) + '</span></span></label>').join('')
        : '<p class="small muted">Select an order first.</p>';
    }

    function renderReturns() {
      renderReturnOptions();
      const withReturns = Orders.mine().filter((o) => o.returnRequest);
      $('#returns-list').innerHTML = withReturns.length
        ? withReturns.map((o) => {
          const r = o.returnRequest;
          const st = { requested: ['Awaiting review', 'badge-warning'], approved: ['Approved · refunded', 'badge-success'], rejected: ['Rejected', 'badge-danger'] }[r.status];
          return '<li class="return-card" data-testid="return-card" data-rma="' + esc(r.id) + '">' +
            '<div><strong class="mono" data-testid="return-rma">' + esc(r.id) + '</strong> <span class="badge ' + st[1] + '" data-testid="return-status" data-status="' + r.status + '">' + st[0] + '</span>' +
            '<p class="small muted" style="margin:.25rem 0 0">Order <a href="order.html?id=' + encodeURIComponent(o.id) + '">' + esc(o.id) + '</a> · ' + plural(r.items.length, 'item') + ' · ' + esc(r.reasonLabel) + ' · ' + plural(r.photos.length, 'photo') + '</p>' +
            (r.decisionNote ? '<p class="small" style="margin:.25rem 0 0" data-testid="return-decision-note">Note from store: ' + esc(r.decisionNote) + '</p>' : '') + '</div>' +
            '<span class="small muted">' + fmtDate(r.at) + '</span></li>';
        }).join('')
        : '<li class="muted small" data-testid="returns-empty">No return requests yet.</li>';
      renderStats();
    }

    orderSel.addEventListener('change', renderItems);
    reason.addEventListener('change', () => {
      $('#return-photos-hint').textContent = reason.value === 'damaged' ? '(required — at least one photo, up to 3)' : '(optional, up to 3)';
      $('#return-details-hint').textContent = reason.value === 'other' ? '(required)' : '(optional)';
    });

    $('#return-form').addEventListener('submit', (e) => {
      e.preventDefault();
      $('#return-success').hidden = true;
      const items = $$('[data-testid="return-item-checkbox"]:checked').map((c) => Number(c.value));
      const checks = [
        ['return-order-error', orderSel, orderSel.value ? '' : 'Choose the order you want to return.'],
        ['return-items-error', null, items.length ? '' : 'Select at least one item.'],
        ['return-reason-error', reason, reason.value ? '' : 'Tell us why you’re returning it.'],
        ['return-details-error', $('#return-details'), reason.value === 'other' && $('#return-details').value.trim().length < 10 ? 'Please describe the problem (at least 10 characters).' : ''],
        ['return-photos-error', null, reason.value === 'damaged' && !photos.files.length ? 'Upload at least one photo showing the damage.' : ''],
      ];
      let first = null;
      checks.forEach(([errId, el, msg]) => {
        $('#' + errId).textContent = msg;
        if (el) el.setAttribute('aria-invalid', String(Boolean(msg)));
        if (msg && !first) first = el || $('#' + errId);
      });
      if (first) { if (first.focus) first.focus(); return; }

      const o = Orders.get(orderSel.value);
      $('#return-confirm-summary').innerHTML =
        '<p>Return <strong>' + plural(items.length, 'item') + '</strong> from order <strong class="mono">' + esc(o.id) + '</strong>:</p><ul>' +
        items.map((n) => '<li>' + esc(o.items[n].name) + '</li>').join('') + '</ul>' +
        '<p class="small muted">Reason: ' + esc(reason.selectedOptions[0].text) + ' · Refund to: ' + ($('input[name="refund"]:checked').value === 'credit' ? 'store credit' : 'original payment') + ' · ' + plural(photos.files.length, 'photo') + '</p>';
      const dlg = $('#return-confirm-modal');
      dlg.returnValue = '';
      dlg.showModal();
    });

    $('#return-confirm-modal').addEventListener('close', async () => {
      const dlg = $('#return-confirm-modal');
      if (dlg.returnValue !== 'confirm') return;
      const btn = $('#return-submit');
      setBusy(btn, true, 'Submitting…');
      await wait(1200);
      setBusy(btn, false);
      const items = $$('[data-testid="return-item-checkbox"]:checked').map((c) => Number(c.value));
      const rma = 'RMA-' + String(Math.floor(100000 + Math.random() * 900000));
      const id = orderSel.value;
      Orders.update(id, (o) => {
        o.returnRequest = {
          id: rma, items: items.map((n) => o.items[n].key || n), itemNames: items.map((n) => o.items[n].name), reason: reason.value, reasonLabel: reason.selectedOptions[0].text,
          details: $('#return-details').value.trim(), refund: $('input[name="refund"]:checked').value,
          photos: photos.files.map((f) => f.name), status: 'requested', at: new Date().toISOString(),
        };
        Orders.setStatus(o, 'return_requested', 'Return ' + rma + ' requested');
      });
      $('#return-form').reset();
      photos.clear();
      renderItems();
      $('#return-success').innerHTML = 'Return <strong data-testid="return-success-rma">' + rma + '</strong> submitted for order ' + esc(id) + '. We’ll email you a prepaid label once it’s approved.';
      $('#return-success').hidden = false;
      toast('Return ' + rma + ' requested', 'success');
    });

    renderReturns();
    if (param('order')) {
      tabs.select('returns');
      orderSel.value = param('order');
      renderItems();
    }

    // ---- Profile ------------------------------------------------------------
    const pf = $('#profile-form');
    $('#profile-name').value = profile.name || '';
    $('#profile-email').value = profile.email || '';
    $('#profile-phone').value = profile.phone || '';
    $('#profile-dob').value = profile.dob || '';
    $$('#profile-interests option').forEach((o) => { o.selected = (profile.interests || []).includes(o.value); });
    const contact = $('input[name="contact"][value="' + (profile.contact || 'email') + '"]');
    if (contact) contact.checked = true;
    $('#profile-newsletter').checked = Boolean(profile.newsletter);
    $('#profile-phone').addEventListener('input', (e) => { e.target.value = formatPhone(e.target.value); });
    pf.addEventListener('input', () => { $('#profile-saved').textContent = 'Unsaved changes'; });

    pf.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = $('#profile-name').value.trim();
      const email = $('#profile-email').value.trim();
      $('#profile-name-error').textContent = name.length >= 2 ? '' : 'Enter your full name.';
      $('#profile-email-error').textContent = EMAIL_RE.test(email) ? '' : 'Enter a valid email address.';
      $('#profile-name').setAttribute('aria-invalid', String(name.length < 2));
      $('#profile-email').setAttribute('aria-invalid', String(!EMAIL_RE.test(email)));
      if (name.length < 2 || !EMAIL_RE.test(email)) return;
      const btn = $('#profile-save');
      setBusy(btn, true, 'Saving…');
      await wait(900);
      setBusy(btn, false);
      Profile.save(session.user, {
        name, email, phone: $('#profile-phone').value.trim(), dob: $('#profile-dob').value,
        interests: Array.from($('#profile-interests').selectedOptions).map((o) => o.value),
        contact: $('input[name="contact"]:checked').value, newsletter: $('#profile-newsletter').checked,
      });
      $('#profile-saved').textContent = '✓ Saved';
      $('#account-greeting').textContent = 'Hi, ' + name.split(' ')[0] + ' 👋';
      toast('Profile updated', 'success');
    });

    // prompt(): type DELETE to confirm.
    $('#profile-delete').addEventListener('click', () => {
      const answer = window.prompt('This removes your orders, cart and wishlist from this browser.\nType DELETE to confirm:');
      if (answer === null) return;
      if (answer !== 'DELETE') { window.alert('Confirmation text did not match. Nothing was deleted.'); return; }
      Orders.saveAll(Orders.all().filter((o) => o.user !== session.user));
      Cart.clear();
      Wishlist.set([]);
      store.remove(KEYS.profilePrefix + session.user);
      toast('Your shopping data was deleted', 'success');
    });
  };
})();
