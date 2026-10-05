/* ==========================================================================
   ShopLab — UI Automation Testbed
   Single classic script (no modules, no build step) so the site works from
   file:// as well as GitHub Pages. Each page sets <body data-page="..."> and
   the router at the bottom runs the matching init function.
   ========================================================================== */
(function () {
  'use strict';

  // ==========================================================================
  // Data
  // ==========================================================================

  const CATEGORY_LABELS = {
    electronics: 'Electronics',
    fashion: 'Fashion',
    home: 'Home & Kitchen',
    sports: 'Sports & Outdoors',
    books: 'Books',
    beauty: 'Beauty',
  };

  const PRODUCTS = [
    {
      id: 1, name: 'Aurora Wireless Headphones', category: 'electronics', price: 129.99, compareAt: 159.99,
      rating: 4.6, tags: ['bestseller', 'sale'], stock: 24, vendor: 'SoundWave Audio', emoji: '🎧', color: '#6366f1',
      options: ['Standard', 'Pro bundle (with case)', 'Gift wrapped'],
      colors: [{ name: 'Midnight', hex: '#1f2937' }, { name: 'Cloud', hex: '#e5e7eb' }, { name: 'Indigo', hex: '#4f46e5' }],
      short: 'Over-ear headphones with adaptive noise cancelling and 40-hour battery life.',
      features: ['Adaptive noise cancelling', '40-hour battery', 'USB-C fast charge', 'Multipoint Bluetooth 5.3'],
    },
    {
      id: 2, name: 'Nimbus Smart Watch', category: 'electronics', price: 249.0,
      rating: 4.4, tags: ['new'], stock: 8, vendor: 'Nimbus Labs', emoji: '⌚', color: '#0ea5e9',
      options: ['40 mm', '44 mm'],
      colors: [{ name: 'Graphite', hex: '#374151' }, { name: 'Silver', hex: '#d1d5db' }],
      short: 'Track workouts, sleep and heart rate with a bright always-on display.',
      features: ['Always-on AMOLED display', 'GPS + heart-rate sensor', '7-day battery', 'Water resistant to 50 m'],
    },
    {
      id: 3, name: 'Pixel Pro Mechanical Keyboard', category: 'electronics', price: 89.5,
      rating: 4.8, tags: ['bestseller'], stock: 3, vendor: 'KeyCraft', emoji: '⌨️', color: '#22c55e',
      options: ['Linear switches', 'Tactile switches', 'Clicky switches'],
      colors: [{ name: 'Charcoal', hex: '#27272a' }, { name: 'Mint', hex: '#a7f3d0' }],
      short: 'Hot-swappable 75% keyboard with PBT keycaps and per-key RGB.',
      features: ['Hot-swappable switches', 'PBT double-shot keycaps', 'Per-key RGB', 'USB-C detachable cable'],
    },
    {
      id: 4, name: 'Trailblazer Running Shoes', category: 'sports', price: 119.0, compareAt: 139.0,
      rating: 4.3, tags: ['sale', 'eco'], stock: 15, vendor: 'Stride Co.', emoji: '👟', color: '#f97316',
      options: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
      colors: [{ name: 'Sunset', hex: '#f97316' }, { name: 'Ocean', hex: '#0284c7' }, { name: 'Stone', hex: '#a8a29e' }],
      short: 'Lightweight trail runners made with 60% recycled materials.',
      features: ['Recycled knit upper', 'Grippy lugged outsole', 'Responsive foam midsole', '260 g per shoe'],
    },
    {
      id: 5, name: 'Summit Insulated Bottle', category: 'sports', price: 34.99,
      rating: 4.7, tags: ['eco', 'bestseller'], stock: 50, vendor: 'Summit Gear', emoji: '🥤', color: '#14b8a6',
      options: ['500 ml', '750 ml', '1 L'],
      colors: [{ name: 'Glacier', hex: '#99f6e4' }, { name: 'Forest', hex: '#166534' }],
      short: 'Keeps drinks cold for 24 hours or hot for 12.',
      features: ['Double-wall vacuum insulation', 'Leak-proof lid', 'Dishwasher safe', 'BPA free'],
    },
    {
      id: 6, name: 'Linen Everyday Shirt', category: 'fashion', price: 49.0,
      rating: 4.1, tags: ['new', 'eco'], stock: 30, vendor: 'Thread & Loom', emoji: '👕', color: '#a855f7',
      options: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ name: 'Oat', hex: '#e7dcc8' }, { name: 'Sage', hex: '#9caf88' }, { name: 'Navy', hex: '#1e3a8a' }],
      short: 'Breathable European linen in a relaxed fit.',
      features: ['100% European flax linen', 'Relaxed fit', 'Corozo buttons', 'Pre-washed for softness'],
    },
    {
      id: 7, name: 'Classic Leather Wallet', category: 'fashion', price: 59.0,
      rating: 4.5, tags: ['limited'], stock: 0, vendor: 'Heritage Goods', emoji: '👛', color: '#92400e',
      options: ['Bifold', 'Card holder'],
      colors: [{ name: 'Tan', hex: '#b45309' }, { name: 'Black', hex: '#111827' }],
      short: 'Full-grain leather wallet that ages beautifully. Currently out of stock.',
      features: ['Full-grain vegetable-tanned leather', '6 card slots', 'RFID blocking', 'Hand-stitched edges'],
    },
    {
      id: 8, name: 'Barista Pour-Over Kettle', category: 'home', price: 74.95,
      rating: 4.6, tags: ['bestseller'], stock: 12, vendor: 'BrewHaus', emoji: '☕', color: '#78716c',
      options: ['Stovetop', 'Electric (+$0)'],
      colors: [{ name: 'Matte Black', hex: '#1c1917' }, { name: 'Copper', hex: '#c2410c' }],
      short: 'Gooseneck kettle with a built-in thermometer for precise pours.',
      features: ['Gooseneck spout', 'Built-in thermometer', '1 L capacity', 'Stainless steel body'],
    },
    {
      id: 9, name: 'Cloud Memory Pillow', category: 'home', price: 39.99, compareAt: 54.99,
      rating: 4.2, tags: ['sale'], stock: 40, vendor: 'DreamWell', emoji: '🛏️', color: '#64748b',
      options: ['Standard', 'King'],
      colors: [{ name: 'White', hex: '#f8fafc' }, { name: 'Grey', hex: '#94a3b8' }],
      short: 'Adaptive memory foam with a cooling gel layer.',
      features: ['Cooling gel layer', 'Removable bamboo cover', 'Hypoallergenic', '100-night trial'],
    },
    {
      id: 10, name: 'The Testing Mindset (Hardcover)', category: 'books', price: 27.5,
      rating: 4.9, tags: ['new', 'bestseller'], stock: 100, vendor: 'Pagecraft Press', emoji: '📘', color: '#2563eb',
      options: ['Hardcover', 'Paperback', 'Signed edition'],
      colors: [{ name: 'Classic', hex: '#1d4ed8' }],
      short: 'A practical guide to writing reliable, maintainable UI tests.',
      features: ['352 pages', 'Covers Playwright, Cypress and Selenium', 'Includes exercises', 'Foreword by a QA lead'],
    },
    {
      id: 11, name: 'Botanical Face Serum', category: 'beauty', price: 42.0,
      rating: 4.4, tags: ['eco', 'new'], stock: 18, vendor: 'Verde Botanics', emoji: '🌿', color: '#16a34a',
      options: ['30 ml', '50 ml'],
      colors: [{ name: 'Original', hex: '#86efac' }],
      short: 'Lightweight serum with niacinamide and green tea extract.',
      features: ['5% niacinamide', 'Green tea extract', 'Fragrance free', 'Vegan and cruelty free'],
    },
    {
      id: 12, name: 'Limited Edition Vinyl Player', category: 'electronics', price: 449.0,
      rating: 4.7, tags: ['limited'], stock: 2, vendor: 'RetroSpin', emoji: '🎵', color: '#db2777',
      options: ['Standard', 'With speakers'],
      colors: [{ name: 'Walnut', hex: '#78350f' }, { name: 'Rose', hex: '#f9a8d4' }],
      short: 'Belt-drive turntable in a hand-finished walnut plinth. Only a few left.',
      features: ['Belt-drive, 33/45 RPM', 'Built-in phono preamp', 'Bluetooth output', 'Walnut plinth'],
    },
  ];

  const REVIEW_POOL = [
    { author: 'Priya K.', rating: 5, title: 'Exceeded expectations', body: 'Great build quality and it arrived two days early. Would buy again.' },
    { author: 'Marcus L.', rating: 4, title: 'Solid value', body: 'Does exactly what it says. Packaging could be a bit more eco-friendly.' },
    { author: 'Aiko T.', rating: 5, title: 'My new favourite', body: 'I use it every single day. The attention to detail is impressive.' },
    { author: 'Daniel R.', rating: 3, title: 'Good, not great', body: 'It works fine, but I expected a little more for the price.' },
    { author: 'Fatima S.', rating: 4, title: 'Lovely', body: 'Looks even better in person. Customer support was quick and helpful.' },
    { author: 'Jonas W.', rating: 5, title: 'Perfect gift', body: 'Bought it as a gift and they loved it. Wrapping option was a nice touch.' },
    { author: 'Elena G.', rating: 2, title: 'Shipping was slow', body: 'The product is fine, but delivery took almost two weeks.' },
  ];

  const COUNTRIES = [
    'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Canada', 'Chile', 'China', 'Denmark', 'Egypt',
    'Finland', 'France', 'Germany', 'Greece', 'India', 'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan',
    'Kenya', 'Mexico', 'Netherlands', 'New Zealand', 'Nigeria', 'Norway', 'Poland', 'Portugal', 'Singapore',
    'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'United Arab Emirates', 'United Kingdom',
    'United States', 'Vietnam',
  ];

  const PROMOS = {
    SAVE10: { type: 'percent', value: 10, label: '10% off your order' },
    WELCOME20: { type: 'percent', value: 20, min: 50, label: '20% off orders over $50' },
    FREESHIP: { type: 'shipping', label: 'free standard shipping' },
  };

  const SHIPPING_RATES = { standard: 5.99, express: 14.99, overnight: 29.99 };
  const FREE_SHIPPING_THRESHOLD = 100;
  const TAX_RATE = 0.08;

  const KEYS = {
    cart: 'shoplab.cart',
    wishlist: 'shoplab.wishlist',
    orders: 'shoplab.orders',
    inventory: 'shoplab.inventory',
  };

  // ==========================================================================
  // Utilities
  // ==========================================================================

  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const round2 = (n) => Math.round(n * 100) / 100;
  const money = (n) => '$' + round2(n).toFixed(2);
  const clamp = (n, min, max) => Math.min(max, Math.max(min, n));
  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const param = (name) => new URLSearchParams(location.search).get(name);
  const getProduct = (id) => PRODUCTS.find((p) => p.id === Number(id));
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const stars = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
  const today = () => new Date().toISOString().slice(0, 10);

  /** localStorage wrapper that never throws (private mode, blocked storage, etc). */
  const store = {
    get(key, fallback) {
      try {
        const raw = localStorage.getItem(key);
        return raw == null ? fallback : JSON.parse(raw);
      } catch (_) { return fallback; }
    },
    set(key, value) {
      try { localStorage.setItem(key, JSON.stringify(value)); } catch (_) { /* ignore */ }
    },
    remove(key) {
      try { localStorage.removeItem(key); } catch (_) { /* ignore */ }
    },
  };

  function shade(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const parts = [(n >> 16) + amount, ((n >> 8) & 255) + amount, (n & 255) + amount];
    return '#' + parts.map((x) => clamp(x, 0, 255).toString(16).padStart(2, '0')).join('');
  }

  /** Generates an offline SVG product image (no network needed). */
  function productImage(p, variant = 0) {
    const angle = [135, 45, 90][variant % 3];
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300">' +
      '<defs><linearGradient id="g" gradientTransform="rotate(' + angle + ' .5 .5)">' +
      '<stop offset="0" stop-color="' + p.color + '"/><stop offset="1" stop-color="' + shade(p.color, variant === 1 ? -50 : 60) + '"/>' +
      '</linearGradient></defs>' +
      '<rect width="400" height="300" fill="url(#g)"/>' +
      '<circle cx="' + (variant === 2 ? 70 : 330) + '" cy="60" r="90" fill="#fff" opacity=".14"/>' +
      '<circle cx="' + (variant === 2 ? 340 : 60) + '" cy="260" r="60" fill="#000" opacity=".08"/>' +
      '<text x="200" y="160" font-size="' + (variant === 2 ? 150 : 115) + '" text-anchor="middle" dominant-baseline="middle">' + p.emoji + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function reviewsFor(p) {
    const count = 2 + (p.id % 2);
    return Array.from({ length: count }, (_, i) => {
      const r = REVIEW_POOL[(p.id * 3 + i) % REVIEW_POOL.length];
      const date = new Date(Date.UTC(2026, (p.id + i) % 9, 3 + i * 7)).toISOString().slice(0, 10);
      return Object.assign({ date }, r);
    });
  }

  function toast(message, type = 'info', timeout = 4000) {
    let region = $('#toast-region');
    if (!region) {
      region = document.createElement('div');
      region.id = 'toast-region';
      region.className = 'toast-region';
      region.setAttribute('role', 'status');
      region.setAttribute('aria-live', 'polite');
      region.dataset.testid = 'toast-region';
      document.body.appendChild(region);
    }
    const el = document.createElement('div');
    el.className = 'toast';
    el.dataset.type = type;
    el.dataset.testid = 'toast-message';
    el.innerHTML = '<span class="toast-text"></span><button type="button" aria-label="Dismiss notification" data-testid="toast-close">×</button>';
    $('.toast-text', el).textContent = message;
    $('button', el).addEventListener('click', () => el.remove());
    region.appendChild(el);
    setTimeout(() => el.remove(), timeout);
    return el;
  }

  /** Puts a button into (or out of) a loading state with spinner + aria-busy. */
  function setBusy(btn, busy, busyText) {
    if (busy) {
      if (btn.dataset.idleLabel == null) btn.dataset.idleLabel = btn.innerHTML;
      btn.classList.add('is-loading');
      btn.disabled = true;
      btn.setAttribute('aria-busy', 'true');
      if (busyText) btn.textContent = busyText;
    } else {
      btn.classList.remove('is-loading');
      btn.disabled = false;
      btn.removeAttribute('aria-busy');
      if (btn.dataset.idleLabel != null) {
        btn.innerHTML = btn.dataset.idleLabel;
        delete btn.dataset.idleLabel;
      }
    }
  }

  function downloadFile(filename, content, mime) {
    const blob = content instanceof Blob ? content : new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    document.dispatchEvent(new CustomEvent('shoplab:download', { detail: { filename } }));
  }

  /** Builds a minimal, valid single-page PDF from plain text lines (ASCII only). */
  function buildPdf(lines) {
    const ascii = (s) => String(s).replace(/[^\x20-\x7E]/g, '?').replace(/[\\()]/g, '\\$&');
    let stream = 'BT /F1 12 Tf 56 760 Td 18 TL\n';
    lines.forEach((line, i) => {
      stream += (i ? 'T* ' : '') + '(' + ascii(line) + ') Tj\n';
    });
    stream += 'ET';
    const objects = [
      '<< /Type /Catalog /Pages 2 0 R >>',
      '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
      '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>',
      '<< /Length ' + stream.length + ' >>\nstream\n' + stream + '\nendstream',
      '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    ];
    let pdf = '%PDF-1.4\n';
    const offsets = [];
    objects.forEach((obj, i) => {
      offsets.push(pdf.length);
      pdf += (i + 1) + ' 0 obj\n' + obj + '\nendobj\n';
    });
    const xref = pdf.length;
    pdf += 'xref\n0 ' + (objects.length + 1) + '\n0000000000 65535 f \n';
    pdf += offsets.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('');
    pdf += 'trailer\n<< /Size ' + (objects.length + 1) + ' /Root 1 0 R >>\nstartxref\n' + xref + '\n%%EOF';
    return pdf;
  }

  function invoiceCsv(order) {
    const q = (v) => '"' + String(v).replace(/"/g, '""') + '"';
    const t = order.totals;
    const rows = [
      ['Invoice', order.id], ['Date', order.date], ['Customer', order.customer.name], ['Email', order.customer.email], [],
      ['SKU', 'Product', 'Qty', 'Unit Price', 'Line Total'],
    ];
    order.items.forEach((i) => rows.push(['SL-' + String(i.id).padStart(4, '0'), i.name, i.qty, i.price.toFixed(2), (i.price * i.qty).toFixed(2)]));
    rows.push([], ['', '', '', 'Subtotal', t.subtotal.toFixed(2)], ['', '', '', 'Discount', (-t.discount).toFixed(2)],
      ['', '', '', 'Shipping', t.shipping.toFixed(2)], ['', '', '', 'Tax', t.tax.toFixed(2)], ['', '', '', 'Total', t.total.toFixed(2)]);
    return rows.map((r) => r.map(q).join(',')).join('\r\n');
  }

  function receiptPdf(order) {
    const t = order.totals;
    const lines = [
      'ShopLab - Payment Receipt', '', 'Order: ' + order.id, 'Date: ' + order.date,
      'Customer: ' + order.customer.name + ' <' + order.customer.email + '>', '', 'Items:',
    ];
    order.items.forEach((i) => lines.push('  ' + i.qty + ' x ' + i.name + '   ' + money(i.price * i.qty)));
    lines.push('', 'Subtotal: ' + money(t.subtotal), 'Discount: -' + money(t.discount), 'Shipping: ' + money(t.shipping),
      'Tax: ' + money(t.tax), 'TOTAL: ' + money(t.total), '', 'Thank you for testing with ShopLab!');
    return buildPdf(lines);
  }

  function sampleOrder() {
    const orders = store.get(KEYS.orders, []);
    if (orders.length) return orders[orders.length - 1];
    const items = [1, 4, 10].map((id, i) => {
      const p = getProduct(id);
      return { id: p.id, name: p.name, qty: i + 1, price: p.price };
    });
    const subtotal = round2(items.reduce((s, i) => s + i.price * i.qty, 0));
    const tax = round2(subtotal * TAX_RATE);
    return {
      id: 'SL-SAMPLE-0001', date: today(), customer: { name: 'Sample Customer', email: 'sample@shoplab.test' }, items,
      totals: { subtotal, discount: 0, shipping: 0, tax, total: round2(subtotal + tax) },
    };
  }

  // ==========================================================================
  // Cart (persisted in localStorage; array order = display order)
  // ==========================================================================

  const Cart = {
    items() {
      return store.get(KEYS.cart, []).filter((i) => getProduct(i.id) && i.qty > 0);
    },
    save(items) {
      store.set(KEYS.cart, items);
      updateCartBadge(true);
      document.dispatchEvent(new CustomEvent('cart:change'));
    },
    /** Adds qty (capped at stock). Returns how many units were actually added. */
    add(id, qty = 1) {
      const p = getProduct(id);
      if (!p || p.stock <= 0) return 0;
      const items = this.items();
      const existing = items.find((i) => i.id === p.id);
      const current = existing ? existing.qty : 0;
      const next = clamp(current + qty, 1, p.stock);
      if (existing) existing.qty = next;
      else items.push({ id: p.id, qty: next });
      this.save(items);
      return next - current;
    },
    setQty(id, qty) {
      const p = getProduct(id);
      const items = this.items();
      const item = items.find((i) => i.id === Number(id));
      if (!p || !item) return;
      item.qty = clamp(Math.floor(qty) || 1, 1, p.stock);
      this.save(items);
    },
    remove(id) { this.save(this.items().filter((i) => i.id !== Number(id))); },
    clear() { this.save([]); },
    reorder(ids) {
      const items = this.items();
      this.save(ids.map((id) => items.find((i) => i.id === id)).filter(Boolean));
    },
    count() { return this.items().reduce((s, i) => s + i.qty, 0); },
    lines() { return this.items().map((i) => ({ id: i.id, qty: i.qty, product: getProduct(i.id) })); },
  };

  // ==========================================================================
  // Auth (dummy, client-side only). auth-guard.js reads the same key.
  // ==========================================================================

  const SESSION_KEY = 'shoplab.session';
  const DEMO_PASSWORD = 'ShopLab@123';
  const USERS = {
    standard_user: { name: 'Standard User' },
    locked_user: { name: 'Locked User', locked: true },
    slow_user: { name: 'Slow User', delay: 4000 },
  };

  const REMEMBER_KEY = 'shoplab.rememberedUser';

  // The session lives in localStorage so it is shared with new tabs/windows,
  // like a cookie would be. "Remember me" only pre-fills the username.
  const Auth = {
    session() {
      const v = store.get(SESSION_KEY, null);
      return v && v.user ? v : null;
    },
    /** Returns '' on success or an error message. */
    check(username, password) {
      const u = USERS[username];
      if (!u || password !== DEMO_PASSWORD) return 'Username and password do not match any user in this service.';
      if (u.locked) return 'Sorry, this user has been locked out.';
      return '';
    },
    start(username, remember) {
      const session = { user: username, name: USERS[username].name, loginAt: new Date().toISOString() };
      store.set(SESSION_KEY, session);
      if (remember) store.set(REMEMBER_KEY, username);
      else store.remove(REMEMBER_KEY);
      return session;
    },
    clear() { store.remove(SESSION_KEY); },
    logout() {
      this.clear();
      location.href = 'login.html?loggedOut=1';
    },
  };

  /** Only allow redirects to local pages (no protocol, no //host). */
  function safeRedirect(target) {
    if (!target || /^[a-z][a-z0-9+.-]*:|^\/\/|\\/i.test(target)) return 'index.html';
    return /^[\w-]+\.html([?#].*)?$/.test(target) && !/^login\.html/.test(target) ? target : 'index.html';
  }

  function updateCartBadge(bump) {
    $$('[data-testid="header-cart-count"]').forEach((el) => {
      el.textContent = String(Cart.count());
      if (bump) {
        el.classList.remove('bump');
        void el.offsetWidth; // restart the animation
        el.classList.add('bump');
      }
    });
  }

  function resetDemoState() {
    Object.values(KEYS).forEach((k) => store.remove(k));
    location.reload();
  }

  // ==========================================================================
  // Reusable widgets
  // ==========================================================================

  /**
   * HTML5 drag-and-drop sortable lists. Items must have draggable="true" and
   * data-id. Lists passed together can exchange items. onChange runs once
   * after a drag that changed the DOM order.
   */
  function makeSortable(lists, onChange) {
    let dragged = null;
    let moved = false;

    function itemAfter(list, y) {
      const items = $$(':scope > [draggable="true"]', list).filter((el) => el !== dragged);
      return items.find((el) => {
        const r = el.getBoundingClientRect();
        return y < r.top + r.height / 2;
      }) || null;
    }

    function finish() {
      if (!dragged) return;
      dragged.classList.remove('is-dragging');
      lists.forEach((l) => l.classList.remove('is-drop-target'));
      dragged = null;
      if (moved) onChange();
      moved = false;
    }

    lists.forEach((list) => {
      list.addEventListener('dragstart', (e) => {
        const item = e.target.closest && e.target.closest('[draggable="true"]');
        if (!item || item.parentElement !== list) return;
        dragged = item;
        moved = false;
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', item.dataset.id); } catch (_) { /* IE-style */ }
        requestAnimationFrame(() => item.classList.add('is-dragging'));
      });
      list.addEventListener('dragover', (e) => {
        if (!dragged) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        lists.forEach((l) => l.classList.toggle('is-drop-target', l === list));
        const after = itemAfter(list, e.clientY);
        if (after) {
          if (dragged.nextElementSibling !== after) { list.insertBefore(dragged, after); moved = true; }
        } else if (list.lastElementChild !== dragged) {
          list.appendChild(dragged);
          moved = true;
        }
      });
      list.addEventListener('drop', (e) => {
        if (!dragged) return;
        e.preventDefault();
        finish();
      });
      list.addEventListener('dragend', finish);
    });
  }

  /**
   * Accessible combobox (ARIA 1.2 pattern): type to filter, ↑/↓ to move,
   * Enter to select, Escape to close, or click an option.
   * options: [{ value, label, meta? }]
   */
  function createCombobox({ input, listbox, toggle, hidden, options, onSelect, testid }) {
    let shown = [];
    let active = -1;
    let selected = null;

    const highlight = (label, q) => {
      if (!q) return esc(label);
      const i = label.toLowerCase().indexOf(q);
      if (i < 0) return esc(label);
      return esc(label.slice(0, i)) + '<mark>' + esc(label.slice(i, i + q.length)) + '</mark>' + esc(label.slice(i + q.length));
    };

    function render() {
      const q = input.value.trim().toLowerCase();
      const showAll = !q || (selected && input.value === selected.label);
      shown = showAll ? options.slice() : options.filter((o) => o.label.toLowerCase().includes(q));
      active = -1;
      input.removeAttribute('aria-activedescendant');
      if (!shown.length) {
        listbox.innerHTML = '<li class="no-results" role="presentation" data-testid="' + testid + '-no-results">No matches for “' + esc(input.value) + '”</li>';
        return;
      }
      listbox.innerHTML = shown.map((o, i) =>
        '<li role="option" id="' + listbox.id + '-opt-' + i + '" data-index="' + i + '" data-value="' + esc(o.value) + '"' +
        ' data-testid="' + testid + '-option" aria-selected="' + Boolean(selected && selected.value === o.value) + '">' +
        '<span>' + highlight(o.label, showAll ? '' : q) + '</span>' +
        (o.meta ? '<span class="muted small">' + esc(o.meta) + '</span>' : '') + '</li>'
      ).join('');
    }

    function open() {
      render();
      listbox.hidden = false;
      input.setAttribute('aria-expanded', 'true');
    }

    function close() {
      listbox.hidden = true;
      input.setAttribute('aria-expanded', 'false');
      input.removeAttribute('aria-activedescendant');
      active = -1;
    }

    function setActive(i) {
      const items = $$('[role="option"]', listbox);
      if (!items.length) return;
      active = (i + items.length) % items.length;
      items.forEach((el, j) => el.classList.toggle('is-active', j === active));
      input.setAttribute('aria-activedescendant', items[active].id);
      items[active].scrollIntoView({ block: 'nearest' });
    }

    function choose(i) {
      const o = shown[i];
      if (!o) return;
      selected = o;
      input.value = o.label;
      if (hidden) hidden.value = o.value;
      close();
      if (onSelect) onSelect(o);
    }

    input.addEventListener('input', () => {
      if (selected && input.value !== selected.label) {
        selected = null;
        if (hidden) hidden.value = '';
        if (onSelect) onSelect(null);
      }
      open();
    });
    input.addEventListener('click', () => { if (listbox.hidden) open(); });
    input.addEventListener('blur', close);
    input.addEventListener('keydown', (e) => {
      const isOpen = !listbox.hidden;
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          if (!isOpen) open();
          setActive(active + 1);
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (!isOpen) open();
          setActive(active - 1);
          break;
        case 'Enter':
          if (isOpen) {
            e.preventDefault();
            if (active >= 0) choose(active);
            else if (shown.length === 1) choose(0);
          }
          break;
        case 'Escape':
          if (isOpen) { e.preventDefault(); close(); }
          break;
        case 'Tab':
          close();
          break;
        default:
      }
    });

    // mousedown preventDefault keeps focus in the input so blur doesn't close the list first.
    listbox.addEventListener('mousedown', (e) => e.preventDefault());
    listbox.addEventListener('click', (e) => {
      const li = e.target.closest('[role="option"]');
      if (li) choose(Number(li.dataset.index));
    });
    if (toggle) {
      toggle.addEventListener('mousedown', (e) => e.preventDefault());
      toggle.addEventListener('click', () => {
        if (listbox.hidden) { input.focus(); open(); } else close();
      });
    }

    return {
      get selected() { return selected; },
      clear() { selected = null; input.value = ''; if (hidden) hidden.value = ''; close(); },
    };
  }

  // ==========================================================================
  // Shell (header, footer, cross-tab sync)
  // ==========================================================================

  function initShell() {
    updateCartBadge(false);

    const toggle = $('#menu-toggle');
    const nav = $('#main-nav');
    if (toggle && nav) {
      toggle.addEventListener('click', () => {
        const open = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
      });
    }

    $$('[data-testid="footer-reset-state"]').forEach((b) => b.addEventListener('click', resetDemoState));

    const session = Auth.session();
    if (nav && session) {
      const user = document.createElement('span');
      user.className = 'user-chip';
      user.id = 'header-username';
      user.dataset.testid = 'header-username';
      user.title = 'Signed in as ' + session.user;
      user.textContent = '👤 ' + session.user;
      const logout = document.createElement('button');
      logout.type = 'button';
      logout.className = 'btn btn-sm';
      logout.id = 'logout-btn';
      logout.dataset.testid = 'header-logout-btn';
      logout.setAttribute('aria-label', 'Log out');
      logout.textContent = 'Log out';
      logout.addEventListener('click', () => Auth.logout());
      nav.append(user, logout);
    }

    // Keep tabs in sync (e.g. a cart change in a target="_blank" tab).
    window.addEventListener('storage', (e) => {
      if (e.key === SESSION_KEY && document.body.dataset.page !== 'login' && !Auth.session()) {
        location.replace('login.html?loggedOut=1');
        return;
      }
      if (e.key === KEYS.cart || e.key === null) {
        updateCartBadge(false);
        document.dispatchEvent(new CustomEvent('cart:change'));
      }
    });
  }

  // ==========================================================================
  // Page: Catalog (index.html)
  // ==========================================================================

  function initCatalog() {
    const form = $('#filters-form');
    const grid = $('#product-grid');
    const countEl = $('#results-count');
    const search = $('#search-input');
    const category = $('#category-filter');
    const range = $('#price-range');
    const rangeOut = $('#price-range-value');
    const inStock = $('#in-stock-only');
    const sort = $('#sort-select');
    const pendingQty = {};

    // Deep links for tests: index.html?q=shoes&category=sports
    if (param('q')) search.value = param('q');
    if (param('category') && CATEGORY_LABELS[param('category')]) category.value = param('category');

    function filtered() {
      const q = search.value.trim().toLowerCase();
      const tags = $$('input[name="tags"]:checked', form).map((i) => i.value);
      const max = Number(range.value);
      const list = PRODUCTS.filter((p) =>
        (!q || [p.name, p.vendor, p.short, CATEGORY_LABELS[p.category]].concat(p.tags).join(' ').toLowerCase().includes(q)) &&
        (category.value === 'all' || p.category === category.value) &&
        (!tags.length || tags.some((t) => p.tags.includes(t))) &&
        p.price <= max &&
        (!inStock.checked || p.stock > 0));
      const sorters = {
        'price-asc': (a, b) => a.price - b.price,
        'price-desc': (a, b) => b.price - a.price,
        'rating-desc': (a, b) => b.rating - a.rating,
        'name-asc': (a, b) => a.name.localeCompare(b.name),
      };
      return sorters[sort.value] ? list.sort(sorters[sort.value]) : list;
    }

    function cardHtml(p) {
      const qty = pendingQty[p.id] || 1;
      const out = p.stock <= 0;
      const badge = p.tags.includes('sale') ? '<span class="badge badge-sale" data-testid="product-badge">Sale</span>'
        : p.tags.includes('new') ? '<span class="badge badge-new" data-testid="product-badge">New</span>' : '';
      const stockNote = out ? '<p class="stock-note out" data-testid="product-stock-status">Out of stock</p>'
        : p.stock <= 5 ? '<p class="stock-note low" data-testid="product-stock-status">Only ' + p.stock + ' left</p>'
        : '<p class="stock-note muted" data-testid="product-stock-status">In stock</p>';
      return (
        '<article class="product-card' + (out ? ' is-out-of-stock' : '') + '" id="product-card-' + p.id + '" data-testid="product-card" data-product-id="' + p.id + '" aria-labelledby="product-title-' + p.id + '">' +
          '<a href="product-detail.html?id=' + p.id + '" class="product-media" data-testid="product-image-link" tabindex="-1" aria-hidden="true">' +
            '<img src="' + productImage(p) + '" alt="' + esc(p.name) + '" data-testid="product-image" loading="lazy" width="400" height="300">' + badge +
          '</a>' +
          '<div class="product-body">' +
            '<p class="product-category" data-testid="product-category">' + esc(CATEGORY_LABELS[p.category]) + '</p>' +
            '<h3 class="product-title" id="product-title-' + p.id + '"><a href="product-detail.html?id=' + p.id + '" data-testid="product-title-link" id="product-link-' + p.id + '">' + esc(p.name) + '</a></h3>' +
            '<div class="rating" aria-label="Rated ' + p.rating + ' out of 5" data-testid="product-rating">' + stars(p.rating) + '<span>' + p.rating.toFixed(1) + '</span></div>' +
            '<div class="price-row"><p class="price" data-testid="product-price">' + money(p.price) + '</p>' +
              (p.compareAt ? '<span class="compare-price" data-testid="product-compare-price">' + money(p.compareAt) + '</span>' : '') + '</div>' +
            stockNote +
            '<div class="tag-list" data-testid="product-tags">' + p.tags.map((t) => '<span class="badge" data-testid="product-tag">' + t + '</span>').join('') + '</div>' +
            '<div class="card-actions">' +
              '<div class="qty" role="group" aria-label="Quantity for ' + esc(p.name) + '" data-testid="product-qty">' +
                '<button type="button" data-action="dec" id="qty-dec-' + p.id + '" data-testid="product-qty-decrement" aria-label="Decrease quantity for ' + esc(p.name) + '"' + (out || qty <= 1 ? ' disabled' : '') + '>−</button>' +
                '<input type="number" id="qty-' + p.id + '" name="qty-' + p.id + '" value="' + qty + '" min="1" max="' + Math.max(1, p.stock) + '" data-testid="product-qty-input" aria-label="Quantity for ' + esc(p.name) + '"' + (out ? ' disabled' : '') + '>' +
                '<button type="button" data-action="inc" id="qty-inc-' + p.id + '" data-testid="product-qty-increment" aria-label="Increase quantity for ' + esc(p.name) + '"' + (out || qty >= p.stock ? ' disabled' : '') + '>+</button>' +
              '</div>' +
              '<button type="button" class="btn btn-primary" data-action="add" id="add-to-cart-' + p.id + '" data-testid="product-add-to-cart" aria-label="Add ' + esc(p.name) + ' to cart"' + (out ? ' disabled' : '') + '>' + (out ? 'Out of Stock' : 'Add to Cart') + '</button>' +
            '</div>' +
            '<div class="card-links">' +
              '<a href="product-detail.html?id=' + p.id + '&tab=reviews" target="_blank" rel="noopener" id="reviews-link-' + p.id + '" data-testid="product-reviews-link" aria-label="Read reviews for ' + esc(p.name) + ' (opens in new tab)">Read Reviews ↗</a>' +
              '<a href="product-detail.html?id=' + p.id + '&tab=terms" target="_blank" rel="noopener" id="terms-link-' + p.id + '" data-testid="product-vendor-terms-link" aria-label="Vendor terms for ' + esc(p.name) + ' (opens in new tab)">Vendor Terms ↗</a>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }

    function render() {
      rangeOut.textContent = '$' + range.value;
      range.setAttribute('aria-valuetext', '$' + range.value);
      const list = filtered();
      countEl.textContent = 'Showing ' + list.length + ' of ' + PRODUCTS.length + ' products';
      if (!list.length) {
        grid.dataset.state = 'empty';
        grid.innerHTML =
          '<div class="empty-state" data-testid="catalog-empty-state" style="grid-column:1/-1">' +
          '<span class="emoji" aria-hidden="true">🔎</span><strong>No products match your filters.</strong>' +
          '<button type="button" class="btn btn-sm" id="empty-reset" data-testid="catalog-empty-reset">Clear filters</button></div>';
        return;
      }
      grid.dataset.state = 'ready';
      grid.innerHTML = list.map(cardHtml).join('');
    }

    function syncQtyControls(card, p) {
      const qty = pendingQty[p.id] || 1;
      $('[data-testid="product-qty-input"]', card).value = qty;
      $('[data-action="dec"]', card).disabled = qty <= 1;
      $('[data-action="inc"]', card).disabled = qty >= p.stock;
    }

    // Reset synchronously so the grid is already re-rendered when the click returns.
    function resetFilters() {
      form.reset();
      render();
    }

    form.addEventListener('input', render);
    form.addEventListener('change', render);
    form.addEventListener('submit', (e) => e.preventDefault());
    $('#reset-filters').addEventListener('click', resetFilters);
    sort.addEventListener('change', render);

    grid.addEventListener('click', async (e) => {
      if (e.target.closest('#empty-reset')) { resetFilters(); return; }
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const card = btn.closest('[data-testid="product-card"]');
      const p = getProduct(card.dataset.productId);
      const action = btn.dataset.action;

      if (action === 'inc' || action === 'dec') {
        pendingQty[p.id] = clamp((pendingQty[p.id] || 1) + (action === 'inc' ? 1 : -1), 1, p.stock);
        syncQtyControls(card, p);
        return;
      }

      if (action === 'add') {
        const qty = pendingQty[p.id] || 1;
        setBusy(btn, true, 'Adding…');
        await wait(500);
        const added = Cart.add(p.id, qty);
        setBusy(btn, false);
        if (added > 0) {
          btn.classList.add('is-added');
          btn.textContent = '✓ Added';
          btn.dataset.state = 'added';
          toast('Added ' + added + ' × ' + p.name + ' to cart', 'success');
          pendingQty[p.id] = 1;
          syncQtyControls(card, p);
          setTimeout(() => {
            btn.classList.remove('is-added');
            btn.textContent = 'Add to Cart';
            delete btn.dataset.state;
          }, 1500);
        } else {
          toast('You already have the maximum available stock (' + p.stock + ') of ' + p.name + ' in your cart.', 'error');
        }
      }
    });

    grid.addEventListener('change', (e) => {
      const input = e.target.closest('[data-testid="product-qty-input"]');
      if (!input) return;
      const card = input.closest('[data-testid="product-card"]');
      const p = getProduct(card.dataset.productId);
      pendingQty[p.id] = clamp(Math.floor(Number(input.value)) || 1, 1, p.stock);
      syncQtyControls(card, p);
    });

    // Simulated network latency so tests have to wait for the grid.
    setTimeout(() => {
      grid.removeAttribute('aria-busy');
      render();
    }, 600);
  }

  // ==========================================================================
  // Page: Product detail
  // ==========================================================================

  function initProductDetail() {
    const p = getProduct(param('id'));
    if (!p) {
      $('#pdp-not-found').hidden = false;
      document.title = 'ShopLab — Product not found';
      return;
    }
    $('#pdp-content').hidden = false;
    document.title = 'ShopLab — ' + p.name;

    const out = p.stock <= 0;
    const reviews = reviewsFor(p);

    // ---- Static content
    $('#pdp-breadcrumb-category').innerHTML = '<a href="index.html?category=' + p.category + '">' + esc(CATEGORY_LABELS[p.category]) + '</a>';
    $('#pdp-breadcrumb-current').textContent = p.name;
    $('#pdp-category').textContent = CATEGORY_LABELS[p.category];
    $('#pdp-title').textContent = p.name;
    $('#pdp-vendor').textContent = p.vendor;
    $('#pdp-rating').innerHTML = stars(p.rating) + '<span>' + p.rating.toFixed(1) + ' / 5</span>';
    $('#pdp-rating').setAttribute('aria-label', 'Rated ' + p.rating + ' out of 5');
    $('#pdp-price').textContent = money(p.price);
    $('#pdp-compare-price').textContent = p.compareAt ? money(p.compareAt) : '';
    const stockEl = $('#pdp-stock');
    stockEl.textContent = out ? 'Out of stock' : p.stock <= 5 ? 'Only ' + p.stock + ' left in stock' : 'In stock (' + p.stock + ' available)';
    stockEl.className = 'stock-note ' + (out ? 'out' : p.stock <= 5 ? 'low' : 'muted');
    stockEl.dataset.stock = String(p.stock);
    $('#pdp-short-description').textContent = p.short;
    $('#pdp-description').textContent =
      p.short + ' Designed by ' + p.vendor + ' and backed by our 30-day satisfaction guarantee. ' +
      'This is placeholder copy for automation practice: assert on it, scroll to it, or ignore it entirely.';
    $('#pdp-features').innerHTML = p.features.map((f) => '<li data-testid="pdp-feature">' + esc(f) + '</li>').join('');

    // ---- Gallery
    const mainImg = $('#pdp-main-image');
    mainImg.src = productImage(p, 0);
    mainImg.alt = p.name;
    const thumbs = $('#pdp-thumbs');
    thumbs.innerHTML = [0, 1, 2].map((i) =>
      '<button type="button" id="pdp-thumb-' + i + '" data-index="' + i + '" data-testid="pdp-thumbnail" aria-pressed="' + (i === 0) + '" aria-label="Show image ' + (i + 1) + ' of 3">' +
      '<img src="' + productImage(p, i) + '" alt=""></button>').join('');
    thumbs.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-index]');
      if (!btn) return;
      mainImg.src = productImage(p, Number(btn.dataset.index));
      mainImg.dataset.index = btn.dataset.index;
      $$('button', thumbs).forEach((b) => b.setAttribute('aria-pressed', String(b === btn)));
    });

    // ---- Options
    const variant = $('#pdp-variant');
    p.options.forEach((o) => variant.add(new Option(o, o)));
    $('#pdp-colors').innerHTML = p.colors.map((c, i) =>
      '<label class="swatch" for="pdp-color-' + i + '">' +
      '<input type="radio" name="color" id="pdp-color-' + i + '" value="' + esc(c.name) + '" data-testid="pdp-color-option"' + (i === 0 ? ' checked' : '') + '>' +
      '<span class="swatch-dot" style="background:' + c.hex + '"></span>' + esc(c.name) + '</label>').join('');

    // ---- Quantity
    const qtyInput = $('#pdp-qty-input');
    const dec = $('#pdp-qty-decrement');
    const inc = $('#pdp-qty-increment');
    qtyInput.max = String(Math.max(1, p.stock));
    function setQty(n) {
      const q = clamp(Math.floor(n) || 1, 1, Math.max(1, p.stock));
      qtyInput.value = q;
      dec.disabled = out || q <= 1;
      inc.disabled = out || q >= p.stock;
    }
    dec.addEventListener('click', () => setQty(Number(qtyInput.value) - 1));
    inc.addEventListener('click', () => setQty(Number(qtyInput.value) + 1));
    qtyInput.addEventListener('change', () => setQty(Number(qtyInput.value)));
    setQty(1);

    // ---- Add to cart
    const addBtn = $('#pdp-add-to-cart');
    const addSuccess = $('#pdp-add-success');
    const variantError = $('#pdp-variant-error');
    if (out) {
      addBtn.disabled = true;
      addBtn.textContent = 'Out of Stock';
      qtyInput.disabled = true;
      variant.disabled = true;
    }
    variant.addEventListener('change', () => {
      if (variant.value) { variantError.textContent = ''; variant.setAttribute('aria-invalid', 'false'); }
    });
    $('#pdp-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      addSuccess.hidden = true;
      if (!variant.value) {
        variantError.textContent = 'Please select an option.';
        variant.setAttribute('aria-invalid', 'true');
        variant.focus();
        return;
      }
      setBusy(addBtn, true, 'Adding…');
      await wait(600);
      const added = Cart.add(p.id, Number(qtyInput.value));
      setBusy(addBtn, false);
      if (added > 0) {
        const color = ($('input[name="color"]:checked') || {}).value;
        addSuccess.className = 'alert alert-success';
        addSuccess.textContent = 'Added ' + added + ' × ' + p.name + ' (' + variant.value + (color ? ', ' + color : '') + ') to your cart.';
        toast('Added to cart', 'success');
      } else {
        addSuccess.className = 'alert alert-warning';
        addSuccess.textContent = 'You already have all ' + p.stock + ' available units in your cart.';
      }
      addSuccess.hidden = false;
      setQty(1);
    });

    // ---- Wishlist toggle (shared with playground drag-and-drop)
    const wishBtn = $('#pdp-wishlist-toggle');
    function syncWish() {
      const on = store.get(KEYS.wishlist, []).includes(p.id);
      wishBtn.setAttribute('aria-pressed', String(on));
      wishBtn.textContent = on ? '♥ Wishlisted' : '♡ Wishlist';
      wishBtn.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist');
    }
    wishBtn.addEventListener('click', () => {
      const list = store.get(KEYS.wishlist, []);
      const on = list.includes(p.id);
      store.set(KEYS.wishlist, on ? list.filter((id) => id !== p.id) : list.concat(p.id));
      syncWish();
      toast(on ? 'Removed from wishlist' : 'Added to wishlist', 'info');
    });
    syncWish();

    // ---- Tabs (keyboard: ←/→/Home/End)
    const tabs = $$('[role="tab"]');
    function selectTab(name, focus) {
      tabs.forEach((t) => {
        const on = t.dataset.tab === name;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        $('#' + t.getAttribute('aria-controls')).hidden = !on;
        if (on && focus) t.focus();
      });
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => {
        selectTab(t.dataset.tab);
        history.replaceState(null, '', '?id=' + p.id + '&tab=' + t.dataset.tab);
      });
      t.addEventListener('keydown', (e) => {
        const map = { ArrowRight: i + 1, ArrowLeft: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        const next = tabs[(map[e.key] + tabs.length) % tabs.length];
        selectTab(next.dataset.tab, true);
      });
    });
    const initialTab = param('tab');
    selectTab(['description', 'reviews', 'terms'].includes(initialTab) ? initialTab : 'description');
    if (initialTab) requestAnimationFrame(() => $('.tabs').scrollIntoView());

    // ---- Reviews
    function renderReviews() {
      $('#pdp-review-count').textContent = String(reviews.length);
      $('#pdp-reviews').innerHTML = reviews.map((r, i) =>
        '<article class="review" data-testid="review-item" id="review-' + i + '">' +
          '<div class="review-head"><strong data-testid="review-author">' + esc(r.author) + '</strong>' +
          '<span class="rating" aria-label="' + r.rating + ' out of 5 stars" data-testid="review-stars">' + stars(r.rating) + '</span>' +
          '<span class="muted small">' + r.date + '</span></div>' +
          (r.title ? '<p style="margin:.3rem 0 .2rem"><strong>' + esc(r.title) + '</strong></p>' : '') +
          '<p class="muted" data-testid="review-body" style="margin:0">' + esc(r.body) + '</p>' +
        '</article>').join('');
    }
    renderReviews();

    const reviewForm = $('#review-form');
    const comment = $('#review-comment');
    comment.addEventListener('input', () => { $('#review-comment-count').textContent = comment.value.length + ' / 500'; });
    reviewForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      $('#review-success').hidden = true;
      const name = $('#review-name');
      const rating = $('input[name="rating"]:checked', reviewForm);
      const checks = [
        [name, '#review-name-error', name.value.trim().length >= 2 ? '' : 'Name must be at least 2 characters.'],
        [null, '#review-rating-error', rating ? '' : 'Please choose a star rating.'],
        [comment, '#review-comment-error', comment.value.trim().length >= 10 ? '' : 'Review must be at least 10 characters.'],
      ];
      let firstInvalid = null;
      checks.forEach(([field, errSel, msg]) => {
        $(errSel).textContent = msg;
        if (field) field.setAttribute('aria-invalid', String(Boolean(msg)));
        if (msg && !firstInvalid) firstInvalid = field || $('#rating-5');
      });
      if (firstInvalid) { firstInvalid.focus(); return; }

      const submit = $('#review-submit');
      setBusy(submit, true, 'Posting…');
      await wait(800);
      setBusy(submit, false);
      reviews.unshift({ author: name.value.trim(), rating: Number(rating.value), title: '', body: comment.value.trim(), date: today() });
      renderReviews();
      reviewForm.reset();
      $('#review-comment-count').textContent = '0 / 500';
      $$('[aria-invalid]', reviewForm).forEach((el) => el.removeAttribute('aria-invalid'));
      $('#review-success').hidden = false;
    });

    // ---- Vendor terms
    const returnDays = 14 + (p.id % 3) * 8;
    $('#pdp-terms-title').textContent = p.vendor + ' — Vendor Terms of Sale';
    $('#pdp-terms').innerHTML = [
      'Items may be returned within ' + returnDays + ' days of delivery in original condition.',
      p.vendor + ' ships from its own warehouse; dispatch takes 1–2 business days.',
      'Warranty: ' + (1 + (p.id % 2)) + ' year(s) limited manufacturer warranty against defects.',
      'Prices include all applicable fees except sales tax, which is calculated at checkout.',
      'ShopLab is a demo store: no goods are shipped and no payments are taken.',
    ].map((t) => '<li data-testid="pdp-terms-item">' + esc(t) + '</li>').join('');
  }

  // ==========================================================================
  // Page: Checkout
  // ==========================================================================

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

  function formatCardNumber(v) {
    return v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  }
  function formatExpiry(v) {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  }
  function formatPhone(v) {
    const d = v.replace(/\D/g, '').slice(0, 10);
    if (d.length <= 3) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  }
  function cardBrand(digits) {
    if (/^4/.test(digits)) return 'VISA';
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'MASTERCARD';
    if (/^3[47]/.test(digits)) return 'AMEX';
    if (/^6(011|5)/.test(digits)) return 'DISCOVER';
    return 'CARD';
  }
  function luhn(digits) {
    let sum = 0;
    let dbl = false;
    for (let i = digits.length - 1; i >= 0; i--) {
      let d = Number(digits[i]);
      if (dbl) { d *= 2; if (d > 9) d -= 9; }
      sum += d;
      dbl = !dbl;
    }
    return sum % 10 === 0;
  }
  function expiryError(v) {
    const m = /^(\d{2})\/(\d{2})$/.exec(v);
    if (!m) return 'Enter expiry as MM/YY.';
    const month = Number(m[1]);
    const year = 2000 + Number(m[2]);
    if (month < 1 || month > 12) return 'Month must be between 01 and 12.';
    const now = new Date();
    if (year < now.getFullYear() || (year === now.getFullYear() && month < now.getMonth() + 1)) return 'This card has expired.';
    return '';
  }

  function gatewayWidgetHtml() {
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>SecurePay</title><style>' +
      ':root{color-scheme:light dark}body{margin:0;font:14px/1.45 system-ui,sans-serif;background:#fff;color:#111}' +
      '@media (prefers-color-scheme:dark){body{background:#171b2e;color:#e7e9f3}input{background:#0f1220!important;color:#e7e9f3!important;border-color:#2c3354!important}}' +
      '.gw{padding:16px}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}' +
      '.tag{font-size:11px;font-weight:700;background:#fde68a;color:#78350f;padding:2px 6px;border-radius:4px}' +
      'label{display:block;font-size:12px;font-weight:600;margin:8px 0 3px}' +
      'input{width:100%;box-sizing:border-box;padding:8px 10px;border:1px solid #cbd5e1;border-radius:6px;font:inherit;font-family:ui-monospace,monospace}' +
      '.row{display:flex;gap:10px}.row>div{flex:1}' +
      'button{margin-top:12px;width:100%;padding:10px;border:0;border-radius:6px;background:#0f766e;color:#fff;font:inherit;font-weight:700;cursor:pointer}' +
      'button:disabled{opacity:.6;cursor:not-allowed}#gw-msg{margin:8px 0 0;font-size:13px;min-height:18px}.ok{color:#15803d}.err{color:#dc2626}' +
      '</style></head><body data-testid="gateway-body"><div class="gw">' +
      '<header><strong>🔐 SecurePay</strong><span class="tag">TEST MODE</span></header>' +
      '<div>Amount due: <strong id="gw-amount" data-testid="gateway-amount">$0.00</strong></div>' +
      '<form id="gw-form" novalidate>' +
      '<label for="gw-card">Card number</label>' +
      '<input id="gw-card" name="gwCard" inputmode="numeric" maxlength="19" placeholder="4242 4242 4242 4242" data-testid="gateway-card-input" aria-label="Gateway card number">' +
      '<div class="row"><div><label for="gw-exp">Expiry</label><input id="gw-exp" name="gwExp" maxlength="5" placeholder="MM/YY" data-testid="gateway-expiry-input" aria-label="Gateway card expiry"></div>' +
      '<div><label for="gw-cvc">CVC</label><input id="gw-cvc" name="gwCvc" maxlength="4" placeholder="123" data-testid="gateway-cvc-input" aria-label="Gateway card CVC"></div></div>' +
      '<button type="submit" id="gw-pay" data-testid="gateway-authorize-btn">Authorize payment</button>' +
      '<p id="gw-msg" role="status" data-testid="gateway-message"></p>' +
      '</form></div><script>' +
      '(function(){var f=document.getElementById("gw-form"),c=document.getElementById("gw-card"),x=document.getElementById("gw-exp"),v=document.getElementById("gw-cvc"),b=document.getElementById("gw-pay"),m=document.getElementById("gw-msg"),a=document.getElementById("gw-amount");' +
      'function say(t,k){m.textContent=t;m.className=k||"";}' +
      'c.addEventListener("input",function(){var d=c.value.replace(/\\D/g,"").slice(0,16);c.value=d.replace(/(.{4})/g,"$1 ").trim();});' +
      'x.addEventListener("input",function(){var d=x.value.replace(/\\D/g,"").slice(0,4);x.value=d.length>=3?d.slice(0,2)+"/"+d.slice(2):d;});' +
      'v.addEventListener("input",function(){v.value=v.value.replace(/\\D/g,"").slice(0,4);});' +
      'window.addEventListener("message",function(e){if(e.data&&e.data.type==="shoplab:amount"){a.textContent=e.data.formatted;}});' +
      'f.addEventListener("submit",function(e){e.preventDefault();var d=c.value.replace(/\\D/g,"");' +
      'if(d.length<15){say("Enter a valid card number.","err");return;}' +
      'if(!/^(0[1-9]|1[0-2])\\/\\d{2}$/.test(x.value)){say("Enter expiry as MM/YY.","err");return;}' +
      'if(!/^\\d{3,4}$/.test(v.value)){say("Enter a valid CVC.","err");return;}' +
      'b.disabled=true;b.textContent="Authorizing…";say("");' +
      'setTimeout(function(){' +
      'if(d==="4000000000000002"){say("Card declined. Try 4242 4242 4242 4242.","err");b.disabled=false;b.textContent="Authorize payment";parent.postMessage({type:"shoplab:gateway",status:"declined"},"*");return;}' +
      'var tok="tok_"+Math.random().toString(36).slice(2,12);say("Payment authorized ✓","ok");b.textContent="Authorized";' +
      '[c,x,v].forEach(function(i){i.disabled=true;});' +
      'parent.postMessage({type:"shoplab:gateway",status:"authorized",token:tok,last4:d.slice(-4)},"*");},1500);});' +
      'parent.postMessage({type:"shoplab:gateway-ready"},"*");})();' +
      '</scr' + 'ipt></body></html>';
  }

  function initCheckout() {
    const form = $('#checkout-form');
    const state = { promo: null, gatewayToken: null, giftMessage: '', processing: false, lastOrder: null };
    const radioValue = (name) => form.elements.namedItem(name).value;
    const isCard = () => radioValue('paymentMethod') === 'card';

    // ---- Totals
    function totals() {
      const lines = Cart.lines();
      const count = lines.reduce((s, l) => s + l.qty, 0);
      const subtotal = round2(lines.reduce((s, l) => s + l.qty * l.product.price, 0));
      let discount = 0;
      if (state.promo && state.promo.type === 'percent' && (!state.promo.min || subtotal >= state.promo.min)) {
        discount = round2(subtotal * state.promo.value / 100);
      }
      const method = radioValue('shipping');
      const freeStandard = subtotal >= FREE_SHIPPING_THRESHOLD || (state.promo && state.promo.type === 'shipping');
      const shipping = !lines.length ? 0 : method === 'standard' && freeStandard ? 0 : SHIPPING_RATES[method];
      const tax = round2((subtotal - discount) * TAX_RATE);
      const total = round2(subtotal - discount + shipping + tax);
      return { lines, count, subtotal, discount, shipping, tax, total, freeStandard };
    }

    // ---- Cart rendering
    const list = $('#cart-list');

    function cartItemHtml(l, i, all) {
      const p = l.product;
      return (
        '<li class="cart-item" draggable="true" data-id="' + p.id + '" id="cart-item-' + p.id + '" data-testid="cart-item">' +
          '<span class="drag-handle" aria-hidden="true" data-testid="cart-item-drag-handle">⠿</span>' +
          '<img src="' + productImage(p) + '" alt="" width="48" height="48">' +
          '<div>' +
            '<p class="cart-item-name" data-testid="cart-item-name">' + esc(p.name) + '</p>' +
            '<div class="cart-item-meta">' +
              '<div class="qty qty-sm" role="group" aria-label="Quantity for ' + esc(p.name) + '">' +
                '<button type="button" data-action="dec" data-testid="cart-item-qty-decrement" aria-label="Decrease quantity of ' + esc(p.name) + '"' + (l.qty <= 1 ? ' disabled' : '') + '>−</button>' +
                '<input type="number" id="cart-qty-' + p.id + '" value="' + l.qty + '" min="1" max="' + p.stock + '" data-testid="cart-item-qty-input" aria-label="Quantity of ' + esc(p.name) + '">' +
                '<button type="button" data-action="inc" data-testid="cart-item-qty-increment" aria-label="Increase quantity of ' + esc(p.name) + '"' + (l.qty >= p.stock ? ' disabled' : '') + '>+</button>' +
              '</div>' +
              '<span class="small muted">' + money(p.price) + ' each</span>' +
            '</div>' +
          '</div>' +
          '<div class="cart-item-actions">' +
            '<span class="cart-item-total" data-testid="cart-item-total">' + money(p.price * l.qty) + '</span>' +
            '<div class="row" style="gap:.15rem">' +
              '<button type="button" class="btn btn-sm btn-ghost btn-icon" data-action="up" data-testid="cart-item-move-up" aria-label="Move ' + esc(p.name) + ' up"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
              '<button type="button" class="btn btn-sm btn-ghost btn-icon" data-action="down" data-testid="cart-item-move-down" aria-label="Move ' + esc(p.name) + ' down"' + (i === all.length - 1 ? ' disabled' : '') + '>↓</button>' +
              '<button type="button" class="btn btn-sm btn-ghost btn-icon" data-action="remove" data-testid="cart-item-remove" aria-label="Remove ' + esc(p.name) + ' from cart">✕</button>' +
            '</div>' +
          '</div>' +
        '</li>'
      );
    }

    function renderCart() {
      const t = totals();
      list.innerHTML = t.lines.map(cartItemHtml).join('');
      list.hidden = !t.lines.length;
      $('#cart-empty').hidden = t.lines.length > 0;
      $('#clear-cart').disabled = !t.lines.length;
      $('#summary-count').textContent = String(t.count);
      $('#summary-subtotal').textContent = money(t.subtotal);
      $('#summary-discount-row').hidden = !t.discount;
      $('#summary-discount').textContent = '−' + money(t.discount);
      $('#summary-shipping').textContent = t.shipping === 0 && t.lines.length ? 'FREE' : money(t.shipping);
      $('#summary-tax').textContent = money(t.tax);
      $('#summary-total').textContent = money(t.total);
      $('#ship-standard-price').textContent = t.freeStandard ? 'FREE' : money(SHIPPING_RATES.standard);
      sendGatewayAmount(t.total);
    }

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const id = Number(btn.closest('[data-testid="cart-item"]').dataset.id);
      const items = Cart.items();
      const idx = items.findIndex((i) => i.id === id);
      const item = items[idx];
      switch (btn.dataset.action) {
        case 'inc': Cart.setQty(id, item.qty + 1); break;
        case 'dec': Cart.setQty(id, item.qty - 1); break;
        case 'remove':
          Cart.remove(id);
          toast(getProduct(id).name + ' removed from cart', 'info');
          break;
        case 'up':
        case 'down': {
          const ids = items.map((i) => i.id);
          const j = btn.dataset.action === 'up' ? idx - 1 : idx + 1;
          if (j < 0 || j >= ids.length) return;
          [ids[idx], ids[j]] = [ids[j], ids[idx]];
          Cart.reorder(ids);
          break;
        }
        default:
      }
    });
    list.addEventListener('change', (e) => {
      const input = e.target.closest('[data-testid="cart-item-qty-input"]');
      if (input) Cart.setQty(Number(input.closest('[data-testid="cart-item"]').dataset.id), Number(input.value));
    });
    makeSortable([list], () => Cart.reorder($$(':scope > li', list).map((li) => Number(li.dataset.id))));

    document.addEventListener('cart:change', renderCart);
    form.addEventListener('change', (e) => { if (e.target.name === 'shipping') renderCart(); });

    $('#cart-add-samples').addEventListener('click', () => {
      Cart.add(1, 1);
      Cart.add(4, 2);
      Cart.add(10, 1);
      toast('Sample items added', 'success');
    });

    // Native confirm()
    $('#clear-cart').addEventListener('click', () => {
      if (window.confirm('Remove all items from your cart?')) {
        Cart.clear();
        toast('Cart cleared', 'info');
      } else {
        toast('Cart kept', 'info');
      }
    });

    // ---- Promo code (2 s mock validation)
    const promoInput = $('#promo-code');
    const promoBtn = $('#apply-promo');
    const promoError = $('#promo-error');
    const promoLoading = $('#promo-loading');
    const promoSuccess = $('#promo-success');

    async function applyPromo() {
      const code = promoInput.value.trim().toUpperCase();
      promoError.textContent = '';
      promoInput.removeAttribute('aria-invalid');
      if (!code) {
        promoError.textContent = 'Please enter a promo code.';
        promoInput.setAttribute('aria-invalid', 'true');
        return;
      }
      promoSuccess.hidden = true;
      promoLoading.hidden = false;
      promoInput.disabled = true;
      setBusy(promoBtn, true, 'Checking…');
      await wait(2000);
      promoLoading.hidden = true;
      setBusy(promoBtn, false);
      promoInput.disabled = false;

      const promo = PROMOS[code];
      const subtotal = totals().subtotal;
      let error = '';
      if (code === 'EXPIRED') error = 'This promo code has expired.';
      else if (!promo) error = '“' + code + '” is not a valid promo code.';
      else if (promo.min && subtotal < promo.min) error = code + ' requires a subtotal of at least ' + money(promo.min) + '.';

      if (error) {
        promoError.textContent = error;
        promoInput.setAttribute('aria-invalid', 'true');
        return;
      }
      state.promo = Object.assign({ code }, promo);
      promoInput.value = code;
      promoInput.disabled = true;
      promoBtn.disabled = true;
      $('#promo-success-text').textContent = 'Code ' + code + ' applied — ' + promo.label + '!';
      promoSuccess.dataset.code = code;
      promoSuccess.hidden = false;
      renderCart();
    }

    promoBtn.addEventListener('click', applyPromo);
    promoInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') { e.preventDefault(); applyPromo(); }
    });
    $('#promo-remove').addEventListener('click', () => {
      state.promo = null;
      promoSuccess.hidden = true;
      delete promoSuccess.dataset.code;
      promoInput.disabled = false;
      promoBtn.disabled = false;
      promoInput.value = '';
      promoInput.focus();
      renderCart();
    });

    // ---- Input masks
    const cardNumber = $('#card-number');
    cardNumber.addEventListener('input', () => {
      cardNumber.value = formatCardNumber(cardNumber.value);
      const brand = cardBrand(cardNumber.value.replace(/\D/g, ''));
      $('#card-brand').textContent = brand;
      $('#card-brand').dataset.brand = brand.toLowerCase();
    });
    $('#card-expiry').addEventListener('input', (e) => { e.target.value = formatExpiry(e.target.value); });
    $('#card-cvv').addEventListener('input', (e) => { e.target.value = e.target.value.replace(/\D/g, '').slice(0, 4); });
    $('#phone').addEventListener('input', (e) => { e.target.value = formatPhone(e.target.value); });

    // ---- Country combobox
    createCombobox({
      input: $('#country-input'),
      listbox: $('#country-listbox'),
      toggle: $('#country-toggle'),
      hidden: $('#country'),
      options: COUNTRIES.map((c) => ({ value: c, label: c })),
      testid: 'country-combobox',
      onSelect: (o) => { if (o) validateRule(ruleFor('country-input')); },
    });

    // ---- Payment method + gateway iframe
    const frame = $('#payment-gateway-frame');
    const gatewayStatus = $('#gateway-status');
    frame.srcdoc = gatewayWidgetHtml();

    function sendGatewayAmount(total) {
      if (frame.contentWindow) frame.contentWindow.postMessage({ type: 'shoplab:amount', formatted: money(total) }, '*');
    }

    form.addEventListener('change', (e) => {
      if (e.target.name !== 'paymentMethod') return;
      $('#card-fields').hidden = !isCard();
      $('#gateway-fields').hidden = isCard();
    });

    window.addEventListener('message', (e) => {
      if (e.source !== frame.contentWindow || !e.data) return;
      if (e.data.type === 'shoplab:gateway-ready') sendGatewayAmount(totals().total);
      if (e.data.type === 'shoplab:gateway') {
        if (e.data.status === 'authorized') {
          state.gatewayToken = e.data.token;
          $('#gateway-token').value = e.data.token;
          gatewayStatus.className = 'alert alert-success';
          gatewayStatus.dataset.status = 'authorized';
          gatewayStatus.textContent = 'Payment authorized — card ending ' + e.data.last4 + ' (token ' + e.data.token + ')';
          $('#gateway-error').textContent = '';
        } else {
          state.gatewayToken = null;
          $('#gateway-token').value = '';
          gatewayStatus.className = 'alert alert-error';
          gatewayStatus.dataset.status = 'declined';
          gatewayStatus.textContent = 'Payment declined by the gateway. Try another card.';
        }
      }
    });

    // ---- Native alert() / prompt()
    $('#help-alert-btn').addEventListener('click', () => {
      window.alert('Need help? Call 1-800-SHOPLAB or email support@shoplab.test');
    });
    $('#gift-message-btn').addEventListener('click', () => {
      const msg = window.prompt('Enter a gift message (max 100 characters):', state.giftMessage);
      if (msg === null) return;
      state.giftMessage = msg.trim().slice(0, 100);
      $('#gift-message-value').textContent = state.giftMessage || 'none';
    });

    // ---- Terms gate the submit button
    const terms = $('#agree-terms');
    const placeOrder = $('#place-order');
    terms.addEventListener('change', () => { placeOrder.disabled = !terms.checked; });
    placeOrder.disabled = !terms.checked;

    // ---- Validation
    const rules = [
      { field: 'full-name', label: 'Full name', test: (v) => (v.trim().length >= 2 ? '' : 'Enter your full name (at least 2 characters).') },
      { field: 'email', label: 'Email', test: (v) => (!v.trim() ? 'Email is required.' : EMAIL_RE.test(v.trim()) ? '' : 'Enter a valid email address, e.g. name@example.com.') },
      { field: 'phone', label: 'Phone', test: (v) => (!v || v.replace(/\D/g, '').length === 10 ? '' : 'Phone number must have 10 digits.') },
      { field: 'address', label: 'Street address', test: (v) => (v.trim().length >= 5 ? '' : 'Enter your street address.') },
      { field: 'city', label: 'City', test: (v) => (v.trim().length >= 2 ? '' : 'Enter your city.') },
      { field: 'postal-code', label: 'Postal code', test: (v) => (/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(v.trim()) ? '' : 'Enter a valid postal code.') },
      { field: 'country-input', errorId: 'country-error', label: 'Country', test: () => ($('#country').value ? '' : 'Select a country from the list.') },
      { field: 'card-name', label: 'Name on card', when: isCard, test: (v) => (v.trim().length >= 2 ? '' : 'Enter the name shown on the card.') },
      {
        field: 'card-number', label: 'Card number', when: isCard,
        test: (v) => {
          const d = v.replace(/\D/g, '');
          if (!d) return 'Card number is required.';
          return d.length >= 15 && luhn(d) ? '' : 'Enter a valid card number.';
        },
      },
      { field: 'card-expiry', label: 'Expiry', when: isCard, test: expiryError },
      { field: 'card-cvv', label: 'CVV', when: isCard, test: (v) => (/^\d{3,4}$/.test(v) ? '' : 'Enter the 3 or 4 digit security code.') },
      { field: 'payment-gateway-frame', errorId: 'gateway-error', label: 'SecurePay', when: () => !isCard(), test: () => (state.gatewayToken ? '' : 'Authorize the payment in the SecurePay frame first.') },
    ];
    const ruleFor = (field) => rules.find((r) => r.field === field);

    function validateRule(rule) {
      const el = $('#' + rule.field);
      const active = !rule.when || rule.when();
      const msg = active ? rule.test(el.value || '') : '';
      const errEl = $('#' + (rule.errorId || rule.field + '-error'));
      if (errEl) errEl.textContent = msg;
      if (el.matches('input, select, textarea')) {
        el.setAttribute('aria-invalid', msg ? 'true' : 'false');
        el.classList.toggle('was-validated', active);
      }
      return msg;
    }

    // Validate on blur once touched; re-validate live while a field is invalid.
    form.addEventListener('input', (e) => {
      e.target.dataset.touched = 'true';
      const rule = ruleFor(e.target.id);
      if (rule && e.target.getAttribute('aria-invalid') === 'true') validateRule(rule);
    });
    form.addEventListener('focusout', (e) => {
      const rule = ruleFor(e.target.id);
      if (rule && e.target.dataset.touched) validateRule(rule);
    });

    const errorSummary = $('#checkout-error-summary');
    $('#checkout-error-list').addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      e.preventDefault();
      const target = $(a.getAttribute('href'));
      if (target) { target.scrollIntoView({ block: 'center' }); if (target.focus) target.focus(); }
    });

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!terms.checked) return;
      const errors = rules.map((r) => ({ r, msg: validateRule(r) })).filter((x) => x.msg);
      if (!Cart.count()) errors.unshift({ r: { field: 'cart-list', label: 'Cart' }, msg: 'Your cart is empty.' });
      if (errors.length) {
        $('#checkout-error-list').innerHTML = errors.map(({ r, msg }) =>
          '<li><a href="#' + r.field + '" data-testid="checkout-error-item" data-field="' + r.field + '">' + esc(r.label) + ': ' + esc(msg) + '</a></li>').join('');
        errorSummary.hidden = false;
        errorSummary.focus();
        errorSummary.scrollIntoView({ block: 'start' });
        return;
      }
      errorSummary.hidden = true;
      openConfirm();
    });

    // ---- Confirm order <dialog>
    const modal = $('#confirm-order-modal');
    const confirmBtn = $('#confirm-order-submit');
    const cancelBtn = $('#confirm-order-cancel');

    function openConfirm() {
      const t = totals();
      const row = (label, value, testid, strong) =>
        '<tr' + (testid ? ' data-testid="' + testid + '"' : '') + '><td>' + (strong ? '<strong>' + label + '</strong>' : label) + '</td><td>' + (strong ? '<strong>' + value + '</strong>' : value) + '</td></tr>';
      $('#confirm-order-lines').innerHTML =
        t.lines.map((l) => row(l.qty + ' × ' + esc(l.product.name), money(l.qty * l.product.price), 'confirm-order-line')).join('') +
        '<tr><td colspan="2"><hr style="border:0;border-top:1px solid var(--border)"></td></tr>' +
        row('Subtotal', money(t.subtotal)) +
        (t.discount ? row('Discount (' + state.promo.code + ')', '−' + money(t.discount)) : '') +
        row('Shipping (' + radioValue('shipping') + ')', t.shipping ? money(t.shipping) : 'FREE') +
        row('Tax', money(t.tax)) +
        row('Total', money(t.total), 'confirm-order-total', true);
      $('#confirm-order-processing').hidden = true;
      modal.showModal();
      confirmBtn.focus();
    }

    function cancelOrder() {
      if (state.processing) return;
      modal.close('cancel');
      toast('Order not placed — you can keep editing.', 'info');
    }
    cancelBtn.addEventListener('click', cancelOrder);
    $('#confirm-order-close').addEventListener('click', cancelOrder);
    modal.addEventListener('cancel', (e) => {
      e.preventDefault(); // Escape key: route through cancelOrder so behaviour is identical
      cancelOrder();
    });

    confirmBtn.addEventListener('click', async () => {
      state.processing = true;
      setBusy(confirmBtn, true, 'Processing…');
      cancelBtn.disabled = true;
      $('#confirm-order-close').disabled = true;
      $('#confirm-order-processing').hidden = false;
      await wait(1500);

      const t = totals();
      const now = new Date();
      const order = {
        id: 'SL-' + now.toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(Math.floor(1000 + Math.random() * 9000)),
        date: now.toISOString().slice(0, 19).replace('T', ' '),
        customer: { name: $('#full-name').value.trim(), email: $('#email').value.trim() },
        shipping: { method: radioValue('shipping'), address: $('#address').value.trim(), city: $('#city').value.trim(), country: $('#country').value },
        payment: isCard() ? 'card' : 'gateway',
        promo: state.promo ? state.promo.code : null,
        giftMessage: state.giftMessage,
        items: t.lines.map((l) => ({ id: l.product.id, name: l.product.name, qty: l.qty, price: l.product.price })),
        totals: { subtotal: t.subtotal, discount: t.discount, shipping: t.shipping, tax: t.tax, total: t.total },
      };
      store.set(KEYS.orders, store.get(KEYS.orders, []).concat(order));
      state.lastOrder = order;

      state.processing = false;
      setBusy(confirmBtn, false);
      cancelBtn.disabled = false;
      $('#confirm-order-close').disabled = false;
      modal.close('confirmed');
      Cart.clear();

      $('#checkout-view').hidden = true;
      $('#order-success').hidden = false;
      $('#order-id').textContent = order.id;
      $('#order-total').textContent = money(order.totals.total);
      $('#order-email').textContent = order.customer.email;
      window.scrollTo(0, 0);
      toast('Order placed successfully!', 'success');
    });

    // ---- Downloads after purchase
    $('#download-invoice-csv').addEventListener('click', () => {
      const o = state.lastOrder || sampleOrder();
      downloadFile('invoice-' + o.id + '.csv', invoiceCsv(o), 'text/csv;charset=utf-8');
    });
    $('#download-receipt-pdf').addEventListener('click', () => {
      const o = state.lastOrder || sampleOrder();
      downloadFile('receipt-' + o.id + '.pdf', receiptPdf(o), 'application/pdf');
    });

    renderCart();
  }

  // ==========================================================================
  // Page: Admin playground
  // ==========================================================================

  function initPlayground() {
    initUploader();
    initDownloads();
    initConverterFrame();
    initDropdowns();
    initInventoryTable();
    initWishlistDnD();
    initDialogs();
    initWaits();
    initMouseKeyboard();
    initMisc();
  }

  // ---- File upload ---------------------------------------------------------

  function initUploader() {
    const MAX_BYTES = 5 * 1024 * 1024;
    const MAX_FILES = 5;
    const ALLOWED = ['jpg', 'jpeg', 'png', 'pdf'];
    let files = [];
    let seq = 0;

    const dz = $('#upload-dropzone');
    const input = $('#file-upload');
    const list = $('#upload-list');
    const errorBox = $('#upload-error');
    const clearBtn = $('#upload-clear');
    const submitBtn = $('#upload-submit');
    const success = $('#upload-success');
    const progressWrap = $('#upload-progress-wrap');
    const progress = $('#upload-progress');
    const bar = $('#upload-progress-bar');

    const fmtSize = (b) => (b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB');

    function addFiles(fileList) {
      const errors = [];
      Array.from(fileList).forEach((f) => {
        const ext = f.name.includes('.') ? f.name.split('.').pop().toLowerCase() : '';
        if (!ALLOWED.includes(ext)) errors.push(f.name + ': unsupported file type (allowed: JPG, PNG, PDF).');
        else if (f.size > MAX_BYTES) errors.push(f.name + ': file is larger than 5 MB.');
        else if (files.length >= MAX_FILES) errors.push(f.name + ': you can upload at most ' + MAX_FILES + ' files.');
        else if (files.some((x) => x.file.name === f.name && x.file.size === f.size)) errors.push(f.name + ': already added.');
        else files.push({ id: ++seq, file: f, isPdf: ext === 'pdf', url: ext === 'pdf' ? null : URL.createObjectURL(f) });
      });
      errorBox.hidden = !errors.length;
      errorBox.innerHTML = errors.length ? '<div><strong>Some files were rejected:</strong><ul>' + errors.map((m) => '<li data-testid="upload-error-item">' + esc(m) + '</li>').join('') + '</ul></div>' : '';
      success.hidden = true;
      input.value = ''; // allow re-selecting the same file
      render();
    }

    function render() {
      list.innerHTML = files.map((f) =>
        '<li class="upload-item" data-testid="upload-preview-item" data-file-name="' + esc(f.file.name) + '" id="upload-item-' + f.id + '">' +
          '<div class="thumb">' + (f.isPdf
            ? '<span data-testid="upload-preview-pdf-icon" aria-label="PDF document" role="img">📄</span>'
            : '<img src="' + f.url + '" alt="Preview of ' + esc(f.file.name) + '" data-testid="upload-preview-thumbnail">') + '</div>' +
          '<div class="meta">' +
            '<span class="name" data-testid="upload-file-name" title="' + esc(f.file.name) + '">' + esc(f.file.name) + '</span>' +
            '<span class="muted" data-testid="upload-file-size">' + fmtSize(f.file.size) + '</span>' +
            '<button type="button" class="btn btn-sm btn-danger" data-remove="' + f.id + '" data-testid="upload-remove-btn" aria-label="Remove ' + esc(f.file.name) + '">Remove</button>' +
          '</div>' +
        '</li>').join('');
      $('#upload-count').textContent = files.length + (files.length === 1 ? ' file' : ' files') + ' selected';
      clearBtn.disabled = !files.length;
      submitBtn.disabled = !files.length;
    }

    input.addEventListener('change', () => addFiles(input.files));
    dz.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    ['dragenter', 'dragover'].forEach((type) => dz.addEventListener(type, (e) => {
      e.preventDefault();
      dz.classList.add('is-dragover');
    }));
    dz.addEventListener('dragleave', (e) => { if (!dz.contains(e.relatedTarget)) dz.classList.remove('is-dragover'); });
    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('is-dragover');
      if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    });
    // Stop the browser from navigating to a file dropped outside the zone.
    ['dragover', 'drop'].forEach((type) => window.addEventListener(type, (e) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) e.preventDefault();
    }));

    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove]');
      if (!btn) return;
      const f = files.find((x) => x.id === Number(btn.dataset.remove));
      if (f && f.url) URL.revokeObjectURL(f.url);
      files = files.filter((x) => x !== f);
      success.hidden = true;
      render();
    });

    clearBtn.addEventListener('click', () => {
      files.forEach((f) => f.url && URL.revokeObjectURL(f.url));
      files = [];
      errorBox.hidden = true;
      success.hidden = true;
      render();
    });

    submitBtn.addEventListener('click', () => {
      const names = files.map((f) => f.file.name);
      setBusy(submitBtn, true, 'Uploading…');
      clearBtn.disabled = true;
      success.hidden = true;
      progressWrap.hidden = false;
      let pct = 0;
      const timer = setInterval(() => {
        pct = Math.min(100, pct + 10);
        bar.style.width = pct + '%';
        progress.setAttribute('aria-valuenow', String(pct));
        if (pct < 100) return;
        clearInterval(timer);
        setBusy(submitBtn, false);
        progressWrap.hidden = true;
        bar.style.width = '0';
        progress.setAttribute('aria-valuenow', '0');
        success.textContent = 'Uploaded ' + names.length + (names.length === 1 ? ' file' : ' files') + ' successfully: ' + names.join(', ');
        success.hidden = false;
        files.forEach((f) => f.url && URL.revokeObjectURL(f.url));
        files = [];
        render();
      }, 150);
    });

    render();
  }

  // ---- Downloads -----------------------------------------------------------

  function initDownloads() {
    const log = $('#pg-download-log');
    document.addEventListener('shoplab:download', (e) => { log.textContent = e.detail.filename; });
    $('#pg-download-static').addEventListener('click', () => { log.textContent = 'sample.txt'; });
    $('#pg-download-csv').addEventListener('click', () => {
      const o = sampleOrder();
      downloadFile('invoice-' + o.id + '.csv', invoiceCsv(o), 'text/csv;charset=utf-8');
    });
    $('#pg-download-pdf').addEventListener('click', () => {
      const o = sampleOrder();
      downloadFile('receipt-' + o.id + '.pdf', receiptPdf(o), 'application/pdf');
    });
    $('#pg-download-json').addEventListener('click', () => {
      downloadFile('inventory.json', JSON.stringify(loadInventory(), null, 2), 'application/json');
    });
  }

  // ---- Currency converter iframe (with a nested iframe) -------------------

  function initConverterFrame() {
    const tickerHtml = '<!DOCTYPE html><html><head><meta charset="utf-8"><style>' +
      'body{margin:0;padding:8px 10px;font:13px system-ui,sans-serif;background:#0f172a;color:#e2e8f0;display:flex;gap:10px;align-items:center;flex-wrap:wrap}' +
      'button{font:inherit;padding:3px 8px;border-radius:4px;border:1px solid #475569;background:#1e293b;color:#e2e8f0;cursor:pointer}' +
      '</style></head><body data-testid="ticker-body">' +
      '<span id="ticker-text" data-testid="ticker-text">EUR 0.92 · GBP 0.79 · INR 83.20 · JPY 149.50</span>' +
      '<button type="button" id="ticker-refresh" data-testid="ticker-refresh-btn">Refresh</button>' +
      '<span id="ticker-updated" data-testid="ticker-updated">Refreshed 0 times</span>' +
      '<script>(function(){var n=0;document.getElementById("ticker-refresh").addEventListener("click",function(){n++;document.getElementById("ticker-updated").textContent="Refreshed "+n+(n===1?" time":" times");});})();</scr' + 'ipt>' +
      '</body></html>';

    const converterHtml = '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>Currency converter</title><style>' +
      ':root{color-scheme:light dark}body{margin:0;padding:14px 16px;font:14px/1.45 system-ui,sans-serif;background:#fff;color:#111}' +
      '@media (prefers-color-scheme:dark){body{background:#171b2e;color:#e7e9f3}input,select{background:#0f1220!important;color:#e7e9f3!important;border-color:#2c3354!important}}' +
      'h2{font-size:16px;margin:0 0 10px}form{display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end}' +
      'label{display:block;font-size:12px;font-weight:600;margin-bottom:3px}' +
      'input,select{padding:7px 9px;border:1px solid #cbd5e1;border-radius:6px;font:inherit;min-width:120px}' +
      'button{padding:8px 14px;border:0;border-radius:6px;background:#4f46e5;color:#fff;font:inherit;font-weight:700;cursor:pointer}' +
      '#cv-result{margin:12px 0;font-weight:700;font-size:15px;min-height:22px}' +
      'iframe{width:100%;height:44px;border:0;border-radius:6px;display:block}' +
      '</style></head><body data-testid="converter-body">' +
      '<h2>💱 Currency converter</h2>' +
      '<form id="cv-form" novalidate>' +
      '<div><label for="cv-amount">Amount (USD)</label><input type="number" id="cv-amount" name="amount" value="100" min="0" step="0.01" data-testid="converter-amount-input" aria-label="Amount in US dollars"></div>' +
      '<div><label for="cv-to">Convert to</label><select id="cv-to" name="to" data-testid="converter-currency-select" aria-label="Target currency">' +
      '<option value="EUR">EUR · Euro</option><option value="GBP">GBP · Pound</option><option value="INR">INR · Rupee</option>' +
      '<option value="JPY">JPY · Yen</option><option value="CAD">CAD · Canadian $</option><option value="AUD">AUD · Australian $</option></select></div>' +
      '<button type="submit" id="cv-convert" data-testid="converter-convert-btn">Convert</button>' +
      '</form>' +
      '<p id="cv-result" role="status" data-testid="converter-result">Enter an amount and press Convert.</p>' +
      '<iframe id="rates-ticker" name="rates-ticker" title="Exchange rates ticker" data-testid="rates-ticker-iframe"></iframe>' +
      '<script>(function(){' +
      'var R={EUR:0.92,GBP:0.79,INR:83.2,JPY:149.5,CAD:1.36,AUD:1.52};' +
      'document.getElementById("rates-ticker").srcdoc=' + JSON.stringify(tickerHtml).replace(/</g, '\\u003c') + ';' +
      'document.getElementById("cv-form").addEventListener("submit",function(e){e.preventDefault();' +
      'var a=parseFloat(document.getElementById("cv-amount").value),c=document.getElementById("cv-to").value,out=document.getElementById("cv-result");' +
      'if(isNaN(a)||a<0){out.textContent="Please enter a valid amount.";out.style.color="#dc2626";return;}' +
      'out.style.color="";var t=a.toFixed(2)+" USD = "+(a*R[c]).toFixed(2)+" "+c;out.textContent=t;' +
      'parent.postMessage({type:"shoplab:convert",text:t},"*");});' +
      '})();</scr' + 'ipt></body></html>';

    const frame = $('#currency-converter-frame');
    frame.srcdoc = converterHtml;
    window.addEventListener('message', (e) => {
      if (e.source === frame.contentWindow && e.data && e.data.type === 'shoplab:convert') {
        $('#converter-parent-result').textContent = e.data.text;
      }
    });
  }

  // ---- Dropdowns -----------------------------------------------------------

  function initDropdowns() {
    const nativeSel = $('#pg-native-select');
    nativeSel.addEventListener('change', () => {
      const opt = nativeSel.selectedOptions[0];
      $('#pg-native-select-output').textContent = nativeSel.value ? 'Selected: ' + nativeSel.value + ' (' + opt.text + ')' : 'Selected: none';
    });
    const multi = $('#pg-multi-select');
    multi.addEventListener('change', () => {
      const values = Array.from(multi.selectedOptions).map((o) => o.value);
      $('#pg-multi-select-output').textContent = 'Selected: ' + (values.length ? values.join(', ') : 'none');
    });
    createCombobox({
      input: $('#pg-combobox-input'),
      listbox: $('#pg-combobox-listbox'),
      toggle: $('#pg-combobox-toggle'),
      options: PRODUCTS.map((p) => ({ value: String(p.id), label: p.name, meta: money(p.price) })),
      testid: 'product-combobox',
      onSelect: (o) => {
        $('#pg-combobox-output').textContent = o ? 'Selected: ' + o.label + ' (id ' + o.value + ')' : 'Selected: none';
      },
    });
  }

  // ---- Inventory table -----------------------------------------------------

  function generateInventory() {
    let seed = 42;
    const rnd = () => (seed = (seed * 1103515245 + 12345) % 2147483648) / 2147483648;
    const adjectives = ['Classic', 'Ultra', 'Eco', 'Smart', 'Compact', 'Deluxe', 'Travel', 'Pro', 'Mini', 'Everyday'];
    const nouns = {
      electronics: ['Earbuds', 'Charger', 'Speaker', 'Webcam', 'Monitor Arm'],
      fashion: ['Scarf', 'Beanie', 'Belt', 'Sneakers', 'Jacket'],
      home: ['Mug', 'Candle', 'Throw Blanket', 'Planter', 'Cutting Board'],
      sports: ['Yoga Mat', 'Dumbbell Set', 'Jump Rope', 'Gym Bag', 'Headband'],
      books: ['Notebook', 'Cookbook', 'Novel', 'Atlas', 'Journal'],
      beauty: ['Lip Balm', 'Face Mask', 'Hand Cream', 'Shampoo Bar', 'Body Oil'],
    };
    const cats = Object.keys(CATEGORY_LABELS);
    return Array.from({ length: 47 }, (_, i) => {
      const category = cats[i % cats.length];
      const name = adjectives[Math.floor(rnd() * adjectives.length)] + ' ' + nouns[category][Math.floor(rnd() * 5)];
      const stock = rnd() < 0.12 ? 0 : Math.floor(rnd() * 120);
      const price = round2(5 + rnd() * 295);
      const updated = new Date(Date.UTC(2026, 0, 1 + Math.floor(rnd() * 270))).toISOString().slice(0, 10);
      return { sku: 'SKU-' + (1001 + i), name, category, stock, price, updated };
    });
  }

  function loadInventory() {
    return store.get(KEYS.inventory, null) || generateInventory();
  }

  function initInventoryTable() {
    const state = {
      rows: loadInventory(),
      query: '',
      sortKey: null,
      sortDir: 'asc',
      page: 1,
      pageSize: 10,
      selected: new Set(),
      editing: null,
      pendingDelete: null,
    };
    const tbody = $('#inventory-body');
    const pager = $('#inventory-pagination');
    const selectAll = $('#inventory-select-all');
    const bulkBtn = $('#inventory-bulk-delete');
    const viewModal = $('#inventory-view-modal');
    const deleteModal = $('#inventory-delete-modal');

    const persist = () => store.set(KEYS.inventory, state.rows);
    const statusOf = (r) => (r.stock === 0 ? ['Out of stock', 'badge-danger'] : r.stock < 10 ? ['Low stock', 'badge-warning'] : ['In stock', 'badge-success']);
    const findRow = (sku) => state.rows.find((r) => r.sku === sku);

    function visibleRows() {
      const q = state.query.toLowerCase();
      let rows = state.rows.filter((r) => !q || (r.sku + ' ' + r.name + ' ' + CATEGORY_LABELS[r.category]).toLowerCase().includes(q));
      if (state.sortKey) {
        const k = state.sortKey;
        const dir = state.sortDir === 'asc' ? 1 : -1;
        rows = rows.slice().sort((a, b) => (typeof a[k] === 'number' ? a[k] - b[k] : String(a[k]).localeCompare(String(b[k]))) * dir);
      }
      return rows;
    }

    function rowHtml(r) {
      const [statusText, statusClass] = statusOf(r);
      const checked = state.selected.has(r.sku);
      const editing = state.editing === r.sku;
      const actions = editing
        ? '<button type="button" class="btn btn-sm btn-success" data-action="save" data-testid="inventory-row-save" aria-label="Save ' + r.sku + '">Save</button>' +
          '<button type="button" class="btn btn-sm" data-action="cancel" data-testid="inventory-row-cancel" aria-label="Cancel editing ' + r.sku + '">Cancel</button>'
        : '<button type="button" class="btn btn-sm" data-action="view" data-testid="inventory-row-view" aria-label="View ' + r.sku + '">View</button>' +
          '<button type="button" class="btn btn-sm" data-action="edit" data-testid="inventory-row-edit" aria-label="Edit ' + r.sku + '">Edit</button>' +
          '<button type="button" class="btn btn-sm btn-danger" data-action="delete" data-testid="inventory-row-delete" aria-label="Delete ' + r.sku + '">Delete</button>';
      return (
        '<tr id="row-' + r.sku + '" data-testid="inventory-row" data-sku="' + r.sku + '" class="' + (checked ? 'is-selected ' : '') + (editing ? 'is-editing' : '') + '">' +
          '<td><input type="checkbox" data-action="select" data-testid="inventory-row-checkbox" aria-label="Select ' + r.sku + '"' + (checked ? ' checked' : '') + '></td>' +
          '<td class="mono" data-testid="inventory-cell-sku">' + r.sku + '</td>' +
          '<td data-testid="inventory-cell-name">' + (editing ? '<input class="input" style="width:170px" id="edit-name-' + r.sku + '" data-testid="inventory-edit-name" aria-label="Name" value="' + esc(r.name) + '">' : esc(r.name)) + '</td>' +
          '<td data-testid="inventory-cell-category">' + esc(CATEGORY_LABELS[r.category]) + '</td>' +
          '<td class="num" data-testid="inventory-cell-stock">' + (editing ? '<input class="input" type="number" min="0" step="1" id="edit-stock-' + r.sku + '" data-testid="inventory-edit-stock" aria-label="Stock" value="' + r.stock + '">' : r.stock) + '</td>' +
          '<td class="num" data-testid="inventory-cell-price">' + (editing ? '<input class="input" type="number" min="0.01" step="0.01" id="edit-price-' + r.sku + '" data-testid="inventory-edit-price" aria-label="Price" value="' + r.price.toFixed(2) + '">' : money(r.price)) + '</td>' +
          '<td><span class="badge ' + statusClass + '" data-testid="inventory-cell-status">' + statusText + '</span></td>' +
          '<td data-testid="inventory-cell-updated">' + r.updated + '</td>' +
          '<td><div class="row-actions">' + actions + '</div></td>' +
        '</tr>'
      );
    }

    function render() {
      const rows = visibleRows();
      const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
      state.page = clamp(state.page, 1, totalPages);
      const start = (state.page - 1) * state.pageSize;
      const pageRows = rows.slice(start, start + state.pageSize);

      tbody.innerHTML = pageRows.length
        ? pageRows.map(rowHtml).join('')
        : '<tr><td colspan="9" class="muted" data-testid="inventory-empty" style="text-align:center;padding:2rem">No matching items.</td></tr>';

      // Sort indicators
      $$('#inventory-table th[data-sort-key]').forEach((th) => {
        const on = th.dataset.sortKey === state.sortKey;
        th.setAttribute('aria-sort', on ? (state.sortDir === 'asc' ? 'ascending' : 'descending') : 'none');
        $('.sort-indicator', th).textContent = on ? (state.sortDir === 'asc' ? '↑' : '↓') : '↕';
      });

      // Select-all reflects the current page only
      const pageSkus = pageRows.map((r) => r.sku);
      const selectedOnPage = pageSkus.filter((s) => state.selected.has(s)).length;
      selectAll.checked = pageSkus.length > 0 && selectedOnPage === pageSkus.length;
      selectAll.indeterminate = selectedOnPage > 0 && selectedOnPage < pageSkus.length;
      $('#inventory-selected-count').textContent = String(state.selected.size);
      bulkBtn.disabled = state.selected.size === 0;

      // Pagination (window of up to 5 page numbers)
      const first = clamp(state.page - 2, 1, Math.max(1, totalPages - 4));
      const last = Math.min(totalPages, first + 4);
      const btn = (label, page, testid, aria, disabled, current) =>
        '<button type="button" class="btn btn-sm" data-page="' + page + '" data-testid="' + testid + '" aria-label="' + aria + '"' +
        (disabled ? ' disabled' : '') + (current ? ' aria-current="page"' : '') + '>' + label + '</button>';
      let html = btn('«', 1, 'inventory-page-first', 'First page', state.page === 1) +
        btn('‹ Prev', state.page - 1, 'inventory-page-prev', 'Previous page', state.page === 1);
      for (let i = first; i <= last; i++) html += btn(String(i), i, 'inventory-page-number', 'Page ' + i, false, i === state.page);
      html += btn('Next ›', state.page + 1, 'inventory-page-next', 'Next page', state.page === totalPages) +
        btn('»', totalPages, 'inventory-page-last', 'Last page', state.page === totalPages);
      pager.innerHTML = html;

      $('#inventory-summary').textContent = rows.length
        ? 'Showing ' + (start + 1) + '–' + (start + pageRows.length) + ' of ' + rows.length + ' items · Page ' + state.page + ' of ' + totalPages
        : 'Showing 0 of 0 items';
      $('#inventory-summary').dataset.total = String(rows.length);
    }

    $('#inventory-table thead').addEventListener('click', (e) => {
      const th = e.target.closest('th[data-sort-key]');
      if (!th || !e.target.closest('.sort-btn')) return;
      const key = th.dataset.sortKey;
      state.sortDir = state.sortKey === key && state.sortDir === 'asc' ? 'desc' : 'asc';
      state.sortKey = key;
      state.page = 1;
      render();
    });

    selectAll.addEventListener('change', () => {
      const rows = visibleRows();
      const start = (state.page - 1) * state.pageSize;
      rows.slice(start, start + state.pageSize).forEach((r) => {
        if (selectAll.checked) state.selected.add(r.sku);
        else state.selected.delete(r.sku);
      });
      render();
    });

    pager.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-page]');
      if (!b || b.disabled) return;
      state.page = Number(b.dataset.page);
      render();
    });

    $('#inventory-search').addEventListener('input', (e) => {
      state.query = e.target.value.trim();
      state.page = 1;
      render();
    });
    $('#inventory-page-size').addEventListener('change', (e) => {
      state.pageSize = Number(e.target.value);
      state.page = 1;
      render();
    });

    tbody.addEventListener('change', (e) => {
      if (e.target.dataset.action !== 'select') return;
      const sku = e.target.closest('tr').dataset.sku;
      if (e.target.checked) state.selected.add(sku);
      else state.selected.delete(sku);
      render();
    });

    tbody.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-action]');
      if (!b) return;
      const sku = b.closest('tr').dataset.sku;
      const row = findRow(sku);
      switch (b.dataset.action) {
        case 'view': {
          const [statusText] = statusOf(row);
          $('#inventory-view-title').textContent = row.name;
          $('#inventory-view-body').innerHTML = [
            ['SKU', row.sku], ['Name', esc(row.name)], ['Category', esc(CATEGORY_LABELS[row.category])],
            ['Stock', row.stock], ['Price', money(row.price)], ['Status', statusText], ['Last updated', row.updated],
          ].map(([k, v]) => '<tr><td class="muted">' + k + '</td><td data-testid="inventory-view-' + k.toLowerCase().replace(/\s+/g, '-') + '">' + v + '</td></tr>').join('');
          viewModal.showModal();
          break;
        }
        case 'edit':
          state.editing = sku;
          render();
          $('#edit-name-' + sku).focus();
          break;
        case 'cancel':
          state.editing = null;
          render();
          break;
        case 'save': {
          const nameEl = $('#edit-name-' + sku);
          const stockEl = $('#edit-stock-' + sku);
          const priceEl = $('#edit-price-' + sku);
          const name = nameEl.value.trim();
          const stock = Number(stockEl.value);
          const price = Number(priceEl.value);
          const bad = [
            [nameEl, !name], [stockEl, !Number.isInteger(stock) || stock < 0], [priceEl, !(price > 0)],
          ];
          bad.forEach(([el, invalid]) => el.setAttribute('aria-invalid', String(invalid)));
          if (bad.some(([, invalid]) => invalid)) {
            toast('Fix the highlighted fields: name required, stock ≥ 0 (whole number), price > 0.', 'error');
            return;
          }
          Object.assign(row, { name, stock, price: round2(price), updated: today() });
          state.editing = null;
          persist();
          render();
          toast(sku + ' saved', 'success');
          break;
        }
        case 'delete':
          state.pendingDelete = [sku];
          $('#inventory-delete-text').textContent = 'Delete ' + sku + ' (' + row.name + ')? This cannot be undone.';
          deleteModal.returnValue = '';
          deleteModal.showModal();
          break;
        default:
      }
    });

    tbody.addEventListener('keydown', (e) => {
      if (!state.editing || !e.target.matches('input.input')) return;
      if (e.key === 'Enter') $('[data-action="save"]', e.target.closest('tr')).click();
      if (e.key === 'Escape') $('[data-action="cancel"]', e.target.closest('tr')).click();
    });

    bulkBtn.addEventListener('click', () => {
      const skus = Array.from(state.selected);
      if (!window.confirm('Delete ' + skus.length + ' selected item(s)?')) return;
      state.rows = state.rows.filter((r) => !state.selected.has(r.sku));
      state.selected.clear();
      persist();
      render();
      toast('Deleted ' + skus.length + ' item(s)', 'success');
    });

    deleteModal.addEventListener('close', () => {
      if (deleteModal.returnValue === 'confirm' && state.pendingDelete) {
        const skus = state.pendingDelete;
        state.rows = state.rows.filter((r) => !skus.includes(r.sku));
        skus.forEach((s) => state.selected.delete(s));
        persist();
        render();
        toast(skus.join(', ') + ' deleted', 'success');
      }
      state.pendingDelete = null;
    });

    $$('[data-close]', viewModal).forEach((b) => b.addEventListener('click', () => viewModal.close()));

    $('#inventory-reset').addEventListener('click', () => {
      store.remove(KEYS.inventory);
      Object.assign(state, { rows: generateInventory(), query: '', sortKey: null, sortDir: 'asc', page: 1, editing: null });
      state.selected.clear();
      $('#inventory-search').value = '';
      render();
      toast('Inventory reset', 'info');
    });

    render();
  }

  // ---- Drag-and-drop wishlist ---------------------------------------------

  function initWishlistDnD() {
    const avail = $('#dnd-available');
    const wish = $('#dnd-wishlist');

    const getIds = () => store.get(KEYS.wishlist, []).filter((id) => getProduct(id));

    function itemHtml(p, inWish, i, total) {
      const controls = inWish
        ? '<button type="button" class="btn btn-sm btn-ghost" data-action="up" data-testid="dnd-item-up" aria-label="Move ' + esc(p.name) + ' up"' + (i === 0 ? ' disabled' : '') + '>↑</button>' +
          '<button type="button" class="btn btn-sm btn-ghost" data-action="down" data-testid="dnd-item-down" aria-label="Move ' + esc(p.name) + ' down"' + (i === total - 1 ? ' disabled' : '') + '>↓</button>' +
          '<button type="button" class="btn btn-sm btn-ghost" data-action="remove" data-testid="dnd-item-remove" aria-label="Remove ' + esc(p.name) + ' from wishlist">✕</button>'
        : '<button type="button" class="btn btn-sm btn-ghost" data-action="add" data-testid="dnd-item-add" aria-label="Add ' + esc(p.name) + ' to wishlist">♡ Add</button>';
      return '<li class="dnd-item" draggable="true" data-id="' + p.id + '" id="dnd-item-' + p.id + '" data-testid="dnd-item">' +
        '<span class="drag-handle" aria-hidden="true">⠿</span><span aria-hidden="true">' + p.emoji + '</span>' +
        '<span class="name" data-testid="dnd-item-name">' + esc(p.name) + '</span>' + controls + '</li>';
    }

    function render() {
      const ids = getIds();
      const others = PRODUCTS.filter((p) => !ids.includes(p.id));
      wish.innerHTML = ids.map((id, i) => itemHtml(getProduct(id), true, i, ids.length)).join('');
      avail.innerHTML = others.map((p, i) => itemHtml(p, false, i, others.length)).join('');
      $('#dnd-wishlist-count').textContent = String(ids.length);
      $('#dnd-available-count').textContent = String(others.length);
      $('#dnd-wishlist-order').textContent = ids.length ? ids.map((id) => getProduct(id).name).join(' > ') : 'empty';
      wish.dataset.order = ids.join(',');
    }

    function save(ids) {
      store.set(KEYS.wishlist, ids);
      render();
    }

    makeSortable([avail, wish], () => save($$(':scope > li', wish).map((li) => Number(li.dataset.id))));

    [avail, wish].forEach((list) => list.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-action]');
      if (!b) return;
      const id = Number(b.closest('li').dataset.id);
      const ids = getIds();
      const i = ids.indexOf(id);
      if (b.dataset.action === 'add') save(ids.concat(id));
      if (b.dataset.action === 'remove') save(ids.filter((x) => x !== id));
      if (b.dataset.action === 'up' && i > 0) { [ids[i - 1], ids[i]] = [ids[i], ids[i - 1]]; save(ids); }
      if (b.dataset.action === 'down' && i < ids.length - 1) { [ids[i + 1], ids[i]] = [ids[i], ids[i + 1]]; save(ids); }
    }));

    $('#dnd-reset').addEventListener('click', () => save([]));
    window.addEventListener('storage', (e) => { if (e.key === KEYS.wishlist) render(); });
    render();
  }

  // ---- Alerts, dialogs, overlays ------------------------------------------

  function initDialogs() {
    const out = $('#pg-dialog-result');
    $('#pg-alert-btn').addEventListener('click', () => {
      window.alert('Hello from ShopLab! This is a native alert.');
      out.textContent = 'Result: alert accepted';
    });
    $('#pg-confirm-btn').addEventListener('click', () => {
      const ok = window.confirm('Do you want to proceed?');
      out.textContent = 'Result: confirm ' + (ok ? 'accepted' : 'dismissed');
    });
    $('#pg-prompt-btn').addEventListener('click', () => {
      const v = window.prompt('What is your name?', 'Tester');
      out.textContent = v === null ? 'Result: prompt dismissed' : 'Result: prompt returned "' + v + '"';
    });

    // <dialog> with method="dialog" form
    const dialog = $('#pg-dialog');
    $('#pg-open-dialog').addEventListener('click', () => {
      dialog.returnValue = '';
      $('#pg-dialog-email').value = '';
      dialog.showModal();
    });
    dialog.addEventListener('close', () => {
      const email = $('#pg-dialog-email').value.trim();
      $('#pg-html-dialog-result').textContent = dialog.returnValue === 'ok'
        ? 'Result: subscribed ' + (email || '(no email)')
        : 'Result: ' + (dialog.returnValue || 'dismissed');
    });

    // Plain div overlay
    const overlay = $('#pg-overlay');
    const overlayOut = $('#pg-overlay-result');
    let lastFocus = null;
    function closeOverlay(result) {
      overlay.hidden = true;
      overlayOut.textContent = 'Result: ' + result;
      if (lastFocus) lastFocus.focus();
    }
    $('#pg-open-overlay').addEventListener('click', (e) => {
      lastFocus = e.currentTarget;
      overlay.hidden = false;
      $('#pg-overlay-accept').focus();
    });
    $('#pg-overlay-accept').addEventListener('click', () => closeOverlay('accepted'));
    $('#pg-overlay-reject').addEventListener('click', () => closeOverlay('rejected'));
    overlay.addEventListener('click', (e) => { if (e.target === overlay) closeOverlay('dismissed (backdrop)'); });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !overlay.hidden) closeOverlay('dismissed (Escape)');
    });

    $('#pg-toast-success').addEventListener('click', () => toast('Everything worked!', 'success'));
    $('#pg-toast-error').addEventListener('click', () => toast('Something went wrong.', 'error'));
  }

  // ---- Waits & dynamic content --------------------------------------------

  function initWaits() {
    // Delayed element
    const loadBtn = $('#pg-load-delayed');
    loadBtn.addEventListener('click', async () => {
      const container = $('#pg-delayed-container');
      container.innerHTML = '';
      $('#pg-delayed-spinner').hidden = false;
      setBusy(loadBtn, true, 'Loading…');
      await wait(3000);
      setBusy(loadBtn, false);
      $('#pg-delayed-spinner').hidden = true;
      container.innerHTML = '<div class="alert alert-success" id="pg-delayed-content" data-testid="delayed-content">Data loaded successfully ✓</div>';
    });

    // Countdown-enabled button
    const startBtn = $('#pg-start-countdown');
    const target = $('#pg-countdown-target');
    const cdOut = $('#pg-countdown-output');
    startBtn.addEventListener('click', () => {
      let left = 5;
      startBtn.disabled = true;
      target.disabled = true;
      target.textContent = 'Locked';
      cdOut.textContent = 'Unlocks in ' + left + 's';
      const timer = setInterval(() => {
        left -= 1;
        if (left > 0) { cdOut.textContent = 'Unlocks in ' + left + 's'; return; }
        clearInterval(timer);
        target.disabled = false;
        target.textContent = 'Click me!';
        cdOut.textContent = 'Unlocked';
        startBtn.disabled = false;
      }, 1000);
    });
    target.addEventListener('click', () => { cdOut.textContent = 'Target clicked ✓'; });

    // Visibility toggle
    const toggleBtn = $('#pg-toggle-visibility');
    const toggleTarget = $('#pg-toggle-target');
    toggleBtn.addEventListener('click', () => {
      toggleTarget.hidden = !toggleTarget.hidden;
      toggleBtn.textContent = toggleTarget.hidden ? 'Show element' : 'Hide element';
      toggleBtn.setAttribute('aria-expanded', String(!toggleTarget.hidden));
    });

    // Text that changes after a delay
    const jobBtn = $('#pg-change-text');
    const status = $('#pg-status-text');
    jobBtn.addEventListener('click', () => {
      jobBtn.disabled = true;
      status.textContent = 'Status: running…';
      status.dataset.status = 'running';
      setTimeout(() => {
        status.textContent = 'Status: completed ✓';
        status.dataset.status = 'completed';
        jobBtn.disabled = false;
      }, 2000);
    });

    // Dynamic id
    const dyn = $('[data-testid="dynamic-id-btn"]');
    dyn.id = 'dyn-' + Math.random().toString(36).slice(2, 8);
    $('#pg-dynamic-output').textContent = 'id: ' + dyn.id;
    dyn.addEventListener('click', () => { $('#pg-dynamic-output').textContent = 'Clicked element with id="' + dyn.id + '"'; });

    // Stale element list
    let renders = 0;
    const staleList = $('#pg-stale-list');
    function renderStale() {
      renders += 1;
      staleList.innerHTML = ['Alpha', 'Bravo', 'Charlie'].map((n) =>
        '<li data-testid="stale-item" data-render="' + renders + '">' + n + ' (render #' + renders + ')</li>').join('');
    }
    $('#pg-rerender').addEventListener('click', renderStale);
    renderStale();
  }

  // ---- Mouse & keyboard ----------------------------------------------------

  function initMouseKeyboard() {
    $('#pg-hover-menu').addEventListener('click', (e) => {
      const a = e.target.closest('a');
      if (!a) return;
      e.preventDefault();
      $('#pg-hover-output').textContent = 'Clicked: ' + a.textContent;
    });

    let dbl = 0;
    $('#pg-dblclick').addEventListener('dblclick', () => {
      dbl += 1;
      $('#pg-dblclick-output').textContent = 'Double-clicks: ' + dbl;
    });

    // Custom context menu
    const menu = document.createElement('ul');
    menu.className = 'context-menu';
    menu.id = 'pg-context-menu';
    menu.setAttribute('role', 'menu');
    menu.dataset.testid = 'contextmenu-menu';
    menu.hidden = true;
    menu.innerHTML = ['copy', 'edit', 'delete'].map((a) =>
      '<li role="none"><button type="button" role="menuitem" data-menu-action="' + a + '" data-testid="contextmenu-item-' + a + '">' + a[0].toUpperCase() + a.slice(1) + '</button></li>').join('');
    document.body.appendChild(menu);
    const hideMenu = () => { menu.hidden = true; };
    $('#pg-contextmenu').addEventListener('contextmenu', (e) => {
      e.preventDefault();
      menu.hidden = false;
      menu.style.left = Math.min(e.clientX, window.innerWidth - 180) + 'px';
      menu.style.top = Math.min(e.clientY, window.innerHeight - 140) + 'px';
      $('button', menu).focus();
    });
    menu.addEventListener('click', (e) => {
      const b = e.target.closest('[data-menu-action]');
      if (!b) return;
      $('#pg-contextmenu-output').textContent = 'Action: ' + b.dataset.menuAction;
      hideMenu();
    });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target)) hideMenu(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hideMenu(); });
    window.addEventListener('scroll', hideMenu, { passive: true });

    $('#pg-key-input').addEventListener('keydown', (e) => {
      const mods = [e.ctrlKey && 'Control', e.altKey && 'Alt', e.shiftKey && 'Shift', e.metaKey && 'Meta'].filter(Boolean);
      const key = ['Control', 'Alt', 'Shift', 'Meta'].includes(e.key) ? e.key : mods.concat(e.key === ' ' ? 'Space' : e.key).join('+');
      $('#pg-key-output').textContent = 'Last key: ' + key + ' (code: ' + e.code + ')';
    });

    $('#pg-scroll-btn').addEventListener('click', () => { $('#pg-scroll-output').textContent = 'Clicked ✓'; });
  }

  // ---- Shadow DOM, new windows, reset -------------------------------------

  function initMisc() {
    $('#pg-popup-btn').addEventListener('click', () => {
      const w = window.open('product-detail.html?id=3', 'shoplab-popup', 'width=960,height=720');
      if (!w) toast('Popup blocked by the browser.', 'error');
    });
    $('#pg-reset-all').addEventListener('click', resetDemoState);
  }

  /** <shop-newsletter>: a custom element with an open shadow root. */
  if (window.customElements && !customElements.get('shop-newsletter')) {
    customElements.define('shop-newsletter', class extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return;
        const root = this.attachShadow({ mode: 'open' });
        root.innerHTML =
          '<style>' +
          ':host{display:block;width:100%}' +
          '.box{display:flex;flex-direction:column;gap:6px;padding:10px;border:1px dashed var(--primary,#4f46e5);border-radius:8px;background:var(--surface,#fff)}' +
          'label{font-size:12px;font-weight:600}' +
          'input{padding:7px 9px;border:1px solid var(--border,#ccc);border-radius:6px;font:inherit;background:var(--surface,#fff);color:var(--text,#111)}' +
          'button{padding:7px 10px;border:0;border-radius:6px;background:var(--primary,#4f46e5);color:#fff;font:inherit;font-weight:600;cursor:pointer}' +
          'p{margin:0;font-size:13px;min-height:18px}.ok{color:var(--success,green)}.err{color:var(--danger,red)}' +
          '</style>' +
          '<div class="box" part="box">' +
          '<label for="sd-email">Newsletter email (inside shadow DOM)</label>' +
          '<input id="sd-email" type="email" placeholder="you@example.com" data-testid="shadow-email-input" aria-label="Newsletter email">' +
          '<button type="button" id="sd-submit" data-testid="shadow-submit-btn">Join</button>' +
          '<p id="sd-msg" role="status" data-testid="shadow-message"></p>' +
          '</div>';
        const input = root.getElementById('sd-email');
        const msg = root.getElementById('sd-msg');
        root.getElementById('sd-submit').addEventListener('click', () => {
          const ok = EMAIL_RE.test(input.value.trim());
          msg.className = ok ? 'ok' : 'err';
          msg.textContent = ok ? 'Subscribed ' + input.value.trim() + ' ✓' : 'Please enter a valid email.';
        });
      }
    });
  }

  // ==========================================================================
  // Router
  // ==========================================================================

  // ==========================================================================
  // Page: Login
  // ==========================================================================

  function initLogin() {
    const redirect = safeRedirect(param('redirect'));
    if (Auth.session()) { location.replace(redirect); return; }

    const form = $('#login-form');
    const username = $('#username');
    const password = $('#password');
    const submit = $('#login-submit');
    const errorBox = $('#login-error');
    const info = $('#login-info');

    const remembered = store.get(REMEMBER_KEY, '');
    if (remembered) {
      username.value = remembered;
      $('#remember-me').checked = true;
    }

    if (param('loggedOut')) {
      info.textContent = 'You have been logged out.';
      info.hidden = false;
    } else if (param('redirect')) {
      info.textContent = 'Please sign in to continue.';
      info.hidden = false;
    }

    function showError(msg) {
      $('#login-error-text').textContent = msg;
      errorBox.hidden = false;
    }
    $('#login-error-close').addEventListener('click', () => {
      errorBox.hidden = true;
      [username, password].forEach((el) => el.removeAttribute('aria-invalid'));
    });

    $('#toggle-password').addEventListener('click', (e) => {
      const show = password.type === 'password';
      password.type = show ? 'text' : 'password';
      e.currentTarget.textContent = show ? 'Hide' : 'Show';
      e.currentTarget.setAttribute('aria-pressed', String(show));
      e.currentTarget.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
    });

    $('#forgot-password').addEventListener('click', (e) => {
      e.preventDefault();
      info.textContent = 'This is a demo: every account uses the password ShopLab@123.';
      info.hidden = false;
    });

    [username, password].forEach((el) => el.addEventListener('input', () => {
      if (el.getAttribute('aria-invalid') === 'true' && el.value) {
        el.setAttribute('aria-invalid', 'false');
        $('#' + el.id + '-error').textContent = '';
      }
    }));

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorBox.hidden = true;
      const user = username.value.trim();
      const fields = [[username, user ? '' : 'Username is required.'], [password, password.value ? '' : 'Password is required.']];
      fields.forEach(([el, msg]) => {
        $('#' + el.id + '-error').textContent = msg;
        el.setAttribute('aria-invalid', String(Boolean(msg)));
      });
      const firstInvalid = fields.find(([, msg]) => msg);
      if (firstInvalid) { firstInvalid[0].focus(); return; }

      setBusy(submit, true, 'Signing in…');
      username.disabled = true;
      password.disabled = true;
      await wait((USERS[user] && USERS[user].delay) || 800);
      username.disabled = false;
      password.disabled = false;
      setBusy(submit, false);

      const error = Auth.check(user, password.value);
      if (error) {
        showError(error);
        [username, password].forEach((el) => el.setAttribute('aria-invalid', 'true'));
        password.value = '';
        password.focus();
        return;
      }
      Auth.start(user, $('#remember-me').checked);
      submit.textContent = '✓ Signed in';
      location.href = redirect;
    });

    (remembered ? password : username).focus();
  }

  const PAGES = {
    login: initLogin,
    catalog: initCatalog,
    'product-detail': initProductDetail,
    checkout: initCheckout,
    playground: initPlayground,
  };

  function boot() {
    initShell();
    const init = PAGES[document.body.dataset.page];
    if (init) init();
    document.body.dataset.ready = 'true'; // tests can wait for body[data-ready="true"]
  }

  // Small public API for test setup / debugging from the console.
  window.ShopLab = {
    version: '1.0.0',
    products: PRODUCTS,
    cart: Cart,
    reset: resetDemoState,
    login(user = 'standard_user', remember = false) { return Auth.start(user, remember); },
    logout() { Auth.logout(); },
    seedCart(items) { Cart.save((items || [{ id: 1, qty: 1 }, { id: 4, qty: 2 }]).map((i) => ({ id: i.id, qty: i.qty }))); },
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
