/* ==========================================================================
   ShopLab core: data, state, reusable UI components and the site shell.
   Classic script (no modules, no build step) so the site works from file://
   and GitHub Pages. Page scripts in /pages register an init function on
   ShopLab.pages[<body data-page>] and the boot code at the bottom runs it.
   ========================================================================== */
(function () {
  'use strict';

  const SL = (window.ShopLab = window.ShopLab || {});
  SL.pages = SL.pages || {};

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
  const CATEGORY_EMOJI = { electronics: '🎧', fashion: '👕', home: '☕', sports: '👟', books: '📘', beauty: '🌿' };

  /* Flags:
     customizable         → optional "Add personalisation" (design upload + text, +$5)
     requiresPrescription → prescription upload is mandatory before add-to-cart
     sizeGuide            → shows the Size guide dialog link */
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
      rating: 4.8, tags: ['bestseller'], stock: 3, vendor: 'KeyCraft', emoji: '⌨️', color: '#22c55e', customizable: true,
      options: ['Linear switches', 'Tactile switches', 'Clicky switches'],
      colors: [{ name: 'Charcoal', hex: '#27272a' }, { name: 'Mint', hex: '#a7f3d0' }],
      short: 'Hot-swappable 75% keyboard with PBT keycaps and per-key RGB. Add your own keycap artwork.',
      features: ['Hot-swappable switches', 'PBT double-shot keycaps', 'Per-key RGB', 'Custom keycap artwork available'],
    },
    {
      id: 4, name: 'Trailblazer Running Shoes', category: 'sports', price: 119.0, compareAt: 139.0,
      rating: 4.3, tags: ['sale', 'eco'], stock: 15, vendor: 'Stride Co.', emoji: '👟', color: '#f97316', sizeGuide: true,
      options: ['US 7', 'US 8', 'US 9', 'US 10', 'US 11'],
      colors: [{ name: 'Sunset', hex: '#f97316' }, { name: 'Ocean', hex: '#0284c7' }, { name: 'Stone', hex: '#a8a29e' }],
      short: 'Lightweight trail runners made with 60% recycled materials.',
      features: ['Recycled knit upper', 'Grippy lugged outsole', 'Responsive foam midsole', '260 g per shoe'],
    },
    {
      id: 5, name: 'Summit Insulated Bottle', category: 'sports', price: 34.99,
      rating: 4.7, tags: ['eco', 'bestseller'], stock: 50, vendor: 'Summit Gear', emoji: '🥤', color: '#14b8a6', customizable: true,
      options: ['500 ml', '750 ml', '1 L'],
      colors: [{ name: 'Glacier', hex: '#99f6e4' }, { name: 'Forest', hex: '#166534' }],
      short: 'Keeps drinks cold for 24 hours or hot for 12. Add a custom engraving.',
      features: ['Double-wall vacuum insulation', 'Leak-proof lid', 'Dishwasher safe', 'Custom engraving available'],
    },
    {
      id: 6, name: 'Linen Everyday Shirt', category: 'fashion', price: 49.0,
      rating: 4.1, tags: ['new', 'eco'], stock: 30, vendor: 'Thread & Loom', emoji: '👕', color: '#a855f7', customizable: true, sizeGuide: true,
      options: ['XS', 'S', 'M', 'L', 'XL'],
      colors: [{ name: 'Oat', hex: '#e7dcc8' }, { name: 'Sage', hex: '#9caf88' }, { name: 'Navy', hex: '#1e3a8a' }],
      short: 'Breathable European linen in a relaxed fit. Upload your own design for a custom print.',
      features: ['100% European flax linen', 'Relaxed fit', 'Corozo buttons', 'Custom print available'],
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
      options: ['Stovetop', 'Electric'],
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
    {
      id: 13, name: 'ClearView Prescription Glasses', category: 'fashion', price: 89.0,
      rating: 4.5, tags: ['new'], stock: 20, vendor: 'ClearView Optics', emoji: '👓', color: '#0891b2', requiresPrescription: true,
      options: ['Single vision', 'Progressive', 'Reading'],
      colors: [{ name: 'Tortoise', hex: '#92400e' }, { name: 'Crystal', hex: '#e5e7eb' }, { name: 'Black', hex: '#111111' }],
      short: 'Lightweight frames with blue-light filtering lenses, made to your prescription.',
      features: ['Blue-light filtering lenses', 'Anti-scratch coating', 'Prescription required at purchase', 'Free adjustments'],
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
  const SHIPPING_LABELS = { standard: 'Standard (5–7 days)', express: 'Express (2–3 days)', overnight: 'Overnight' };
  const FREE_SHIPPING_THRESHOLD = 100;
  const TAX_RATE = 0.08;
  const PERSONALIZATION_FEE = 5;

  const CARRIERS = [
    { group: 'Domestic', options: [['ups', 'UPS'], ['fedex', 'FedEx'], ['usps', 'USPS']] },
    { group: 'International', options: [['dhl', 'DHL Express'], ['royal-mail', 'Royal Mail'], ['canada-post', 'Canada Post (unavailable)', true]] },
  ];
  const carrierName = (code) => {
    for (const g of CARRIERS) for (const [v, l] of g.options) if (v === code) return l;
    return code || '';
  };

  const ORDER_STATUS = {
    processing: { label: 'Processing', badge: 'badge-info' },
    shipped: { label: 'Shipped', badge: 'badge-new' },
    delivered: { label: 'Delivered', badge: 'badge-success' },
    cancelled: { label: 'Cancelled', badge: 'badge-danger' },
    return_requested: { label: 'Return requested', badge: 'badge-warning' },
    returned: { label: 'Returned & refunded', badge: '' },
    return_rejected: { label: 'Return rejected', badge: 'badge-danger' },
  };

  const KEYS = {
    session: 'shoplab.session',
    users: 'shoplab.users',
    remembered: 'shoplab.rememberedUser',
    cart: 'shoplab.cart',
    wishlist: 'shoplab.wishlist',
    orders: 'shoplab.orders',
    overrides: 'shoplab.productOverrides',
    consent: 'shoplab.cookieConsent',
    notify: 'shoplab.backInStock',
    recent: 'shoplab.recentlyViewed',
    profilePrefix: 'shoplab.profile.',
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
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const stars = (r) => '★'.repeat(Math.round(r)) + '☆'.repeat(5 - Math.round(r));
  const today = () => new Date().toISOString().slice(0, 10);
  const fmtDate = (iso) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  const fmtDateTime = (iso) => new Date(iso).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
  const plural = (n, word) => n + ' ' + word + (n === 1 ? '' : 's');
  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

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

  const emit = (name, detail) => document.dispatchEvent(new CustomEvent(name, { detail }));

  // ==========================================================================
  // Products (admin overrides for price / stock / archived are persisted)
  // ==========================================================================

  function applyOverrides() {
    const overrides = store.get(KEYS.overrides, {});
    PRODUCTS.forEach((p) => {
      if (p.basePrice == null) { p.basePrice = p.price; p.baseStock = p.stock; }
      p.price = p.basePrice;
      p.stock = p.baseStock;
      p.archived = false;
      Object.assign(p, overrides[p.id] || {});
    });
  }
  applyOverrides();

  const Products = {
    all: () => PRODUCTS,
    visible: () => PRODUCTS.filter((p) => !p.archived),
    get: (id) => PRODUCTS.find((p) => p.id === Number(id)),
    sku: (p) => 'SL-' + String(p.id).padStart(4, '0'),
    update(id, patch) {
      const overrides = store.get(KEYS.overrides, {});
      overrides[id] = Object.assign({}, overrides[id], patch);
      store.set(KEYS.overrides, overrides);
      applyOverrides();
      emit('products:change');
    },
    resetAll() {
      store.remove(KEYS.overrides);
      applyOverrides();
      emit('products:change');
    },
  };
  const getProduct = Products.get;

  /** Mixes a hex colour with white; amount 0..1 (1 = white). */
  function tint(hex, amount) {
    const n = parseInt(hex.slice(1), 16);
    const mix = (c) => Math.round(c + (255 - c) * amount);
    return '#' + [n >> 16, (n >> 8) & 255, n & 255].map((c) => mix(c).toString(16).padStart(2, '0')).join('');
  }

  /** Generates an offline, studio-style SVG product image (no network needed). */
  function productImage(p, variant = 0) {
    const bg = tint(p.color, [0.86, 0.8, 0.9][variant % 3]);
    const glow = tint(p.color, 0.6);
    const size = [150, 120, 190][variant % 3];
    const cy = [205, 210, 215][variant % 3];
    const svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">' +
      '<defs><radialGradient id="g" cx="50%" cy="42%" r="70%"><stop offset="0" stop-color="#fff" stop-opacity=".85"/>' +
      '<stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="400" height="400" fill="' + bg + '"/>' +
      '<rect width="400" height="400" fill="url(#g)"/>' +
      '<ellipse cx="200" cy="' + (cy + size * 0.55) + '" rx="' + size * 0.55 + '" ry="' + size * 0.09 + '" fill="' + glow + '" opacity=".55"/>' +
      '<text x="200" y="' + cy + '" font-size="' + size + '" text-anchor="middle" dominant-baseline="middle"' +
      (variant === 1 ? ' transform="rotate(-12 200 ' + cy + ')"' : '') + '>' + p.emoji + '</text>' +
      '</svg>';
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
  }

  function reviewsFor(p) {
    const count = 3 + (p.id % 3);
    return Array.from({ length: count }, (_, i) => {
      const r = REVIEW_POOL[(p.id * 3 + i) % REVIEW_POOL.length];
      const date = new Date(Date.UTC(2026, (p.id + i) % 9, 3 + i * 5)).toISOString().slice(0, 10);
      return Object.assign({ date }, r);
    });
  }

  // ==========================================================================
  // Auth (dummy, client-side only). auth-guard.js reads the same session key.
  // ==========================================================================

  const DEMO_PASSWORD = 'ShopLab@123';
  const BUILTIN_USERS = {
    standard_user: { name: 'Standard User', email: 'standard.user@shoplab.test', role: 'customer' },
    admin_user: { name: 'Store Admin', email: 'admin@shoplab.test', role: 'admin' },
    locked_user: { name: 'Locked User', email: 'locked@shoplab.test', role: 'customer', locked: true },
    slow_user: { name: 'Slow User', email: 'slow@shoplab.test', role: 'customer', delay: 4000 },
  };

  const Auth = {
    users() {
      const registered = {};
      store.get(KEYS.users, []).forEach((u) => { registered[u.username] = u; });
      return Object.assign({}, registered, BUILTIN_USERS);
    },
    /** Returns '' on success or an error message. */
    check(username, password) {
      const u = this.users()[username];
      if (!u || password !== (u.password || DEMO_PASSWORD)) return 'Username and password do not match any user in this service.';
      if (u.locked) return 'Sorry, this user has been locked out.';
      return '';
    },
    register({ name, email, username, password, dob }) {
      const users = store.get(KEYS.users, []);
      users.push({ name, email, username, password, dob, role: 'customer', createdAt: new Date().toISOString() });
      store.set(KEYS.users, users);
    },
    session() {
      const s = store.get(KEYS.session, null);
      if (!s || !s.user) return null;
      const u = this.users()[s.user] || {};
      return Object.assign({ name: u.name || s.user, email: u.email || '', role: u.role || 'customer' }, s);
    },
    isAdmin() {
      const s = this.session();
      return Boolean(s && s.role === 'admin');
    },
    start(username, remember) {
      const u = this.users()[username];
      const session = { user: username, name: u.name, email: u.email, role: u.role || 'customer', loginAt: new Date().toISOString() };
      store.set(KEYS.session, session);
      if (remember) store.set(KEYS.remembered, username);
      else store.remove(KEYS.remembered);
      return session;
    },
    logout() {
      store.remove(KEYS.session);
      location.href = 'login.html?loggedOut=1';
    },
  };

  /** Only allow redirects to local pages (no protocol, no //host). */
  function safeRedirect(target) {
    if (!target || /^[a-z][a-z0-9+.-]*:|^\/\/|\\/i.test(target)) return 'index.html';
    return /^[\w-]+\.html([?#].*)?$/.test(target) && !/^login\.html/.test(target) ? target : 'index.html';
  }

  // ==========================================================================
  // Cart. Lines are keyed by product + option + colour; personalised and
  // prescription items always get their own line.
  // ==========================================================================

  const Cart = {
    items() {
      return store.get(KEYS.cart, [])
        .filter((l) => l && getProduct(l.id) && l.qty > 0)
        .map((l) => (l.key ? l : Object.assign({ key: l.id + '|' + (l.variant || '') + '|' + (l.color || '') }, l)));
    },
    save(items) {
      store.set(KEYS.cart, items);
      emit('cart:change');
    },
    totalFor(id, items) {
      return (items || this.items()).filter((l) => l.id === Number(id)).reduce((s, l) => s + l.qty, 0);
    },
    /** Adds qty (capped at stock). Returns how many units were actually added. */
    add(id, qty = 1, opts = {}) {
      const p = getProduct(id);
      if (!p || p.archived || p.stock <= 0) return 0;
      const items = this.items();
      const allowed = p.stock - this.totalFor(p.id, items);
      const n = clamp(Math.floor(qty) || 1, 0, allowed);
      if (n <= 0) return 0;
      const variant = opts.variant || p.options[0];
      const color = opts.color || p.colors[0].name;
      const special = opts.custom || opts.prescription;
      const key = p.id + '|' + variant + '|' + color + (special ? '|' + Date.now().toString(36) : '');
      const existing = !special && items.find((l) => l.key === key);
      if (existing) existing.qty += n;
      else items.push({ key, id: p.id, qty: n, variant, color, custom: opts.custom || null, prescription: opts.prescription || null });
      this.save(items);
      return n;
    },
    setQty(key, qty) {
      const items = this.items();
      const line = items.find((l) => l.key === key);
      if (!line) return;
      const p = getProduct(line.id);
      const others = this.totalFor(line.id, items) - line.qty;
      line.qty = clamp(Math.floor(qty) || 1, 1, Math.max(1, p.stock - others));
      this.save(items);
    },
    remove(key) { this.save(this.items().filter((l) => l.key !== key)); },
    clear() { this.save([]); },
    reorder(keys) {
      const items = this.items();
      this.save(keys.map((k) => items.find((l) => l.key === k)).filter(Boolean));
    },
    unitPrice: (line) => getProduct(line.id).price + (line.custom ? PERSONALIZATION_FEE : 0),
    lines() {
      return this.items().map((l) => {
        const product = getProduct(l.id);
        const unitPrice = this.unitPrice(l);
        return Object.assign({}, l, { product, unitPrice, total: round2(unitPrice * l.qty) });
      });
    },
    count() { return this.items().reduce((s, l) => s + l.qty, 0); },
    subtotal() { return round2(this.lines().reduce((s, l) => s + l.total, 0)); },
  };

  /** "Option · Colour · Personalised: x.png" descriptor for a cart/order line. */
  function lineMeta(l) {
    const parts = [l.variant, l.color];
    if (l.custom) parts.push('Personalised' + (l.custom.fileName ? ': ' + l.custom.fileName : '') + (l.custom.text ? ' “' + l.custom.text + '”' : ''));
    if (l.prescription) parts.push('Prescription: ' + l.prescription.fileName);
    return parts.filter(Boolean).join(' · ');
  }

  // ==========================================================================
  // Wishlist, orders, profile, misc stores
  // ==========================================================================

  const Wishlist = {
    ids: () => store.get(KEYS.wishlist, []).filter((id) => getProduct(id)),
    has(id) { return this.ids().includes(Number(id)); },
    set(ids) {
      store.set(KEYS.wishlist, ids);
      emit('wishlist:change');
    },
    toggle(id) {
      const ids = this.ids();
      const on = !ids.includes(Number(id));
      this.set(on ? ids.concat(Number(id)) : ids.filter((x) => x !== Number(id)));
      return on;
    },
  };

  const Orders = {
    all: () => store.get(KEYS.orders, []),
    saveAll(list) {
      store.set(KEYS.orders, list);
      emit('orders:change');
    },
    mine() {
      const s = Auth.session();
      return s ? this.all().filter((o) => o.user === s.user) : [];
    },
    get(id) { return this.all().find((o) => o.id === id) || null; },
    add(order) { this.saveAll(this.all().concat(order)); },
    /** Mutates one order through fn(order) and persists the list. */
    update(id, fn) {
      const list = this.all();
      const o = list.find((x) => x.id === id);
      if (!o) return null;
      fn(o);
      this.saveAll(list);
      return o;
    },
    setStatus(o, status, note) {
      o.status = status;
      o.history = (o.history || []).concat({ status, at: new Date().toISOString(), note: note || '' });
    },
    newId() {
      const d = new Date();
      return 'SL-' + d.toISOString().slice(0, 10).replace(/-/g, '') + '-' + String(Math.floor(1000 + Math.random() * 9000));
    },
  };

  const Profile = {
    get(user) {
      const u = Auth.users()[user] || {};
      const last = Orders.all().filter((o) => o.user === user).slice(-1)[0];
      return Object.assign({
        name: u.name || user, email: u.email || '', phone: '', dob: u.dob || '', interests: [], contact: 'email', newsletter: false,
        address: last ? last.address : null,
      }, store.get(KEYS.profilePrefix + user, {}));
    },
    save(user, data) { store.set(KEYS.profilePrefix + user, Object.assign(store.get(KEYS.profilePrefix + user, {}), data)); },
  };

  const Recent = {
    ids: () => store.get(KEYS.recent, []).filter((id) => { const p = getProduct(id); return p && !p.archived; }),
    push(id) { store.set(KEYS.recent, [Number(id)].concat(this.ids().filter((x) => x !== Number(id))).slice(0, 8)); },
  };

  function resetDemoState() {
    [KEYS.cart, KEYS.wishlist, KEYS.orders, KEYS.overrides, KEYS.notify, KEYS.recent, KEYS.consent].forEach((k) => store.remove(k));
    location.reload();
  }

  // ==========================================================================
  // Feedback helpers
  // ==========================================================================

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

  const statusBadge = (status, testid) => {
    const s = ORDER_STATUS[status] || { label: status, badge: '' };
    return '<span class="badge ' + s.badge + '" data-status="' + esc(status) + '"' + (testid ? ' data-testid="' + testid + '"' : '') + '>' + esc(s.label) + '</span>';
  };

  // ==========================================================================
  // Downloads: CSV invoice, real PDF receipt, generic files
  // ==========================================================================

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
    emit('shoplab:download', { filename });
  }

  /** Builds a minimal, valid single-page PDF from plain text lines (ASCII only). */
  function buildPdf(lines) {
    const ascii = (s) => String(s).replace(/[^\x20-\x7E]/g, '?').replace(/[\\()]/g, '\\$&');
    let stream = 'BT /F1 12 Tf 56 760 Td 18 TL\n';
    lines.forEach((line, i) => { stream += (i ? 'T* ' : '') + '(' + ascii(line) + ') Tj\n'; });
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
    const q = (v) => '"' + String(v == null ? '' : v).replace(/"/g, '""') + '"';
    const t = order.totals;
    const rows = [
      ['Invoice', order.id], ['Date', fmtDate(order.date)], ['Customer', order.customer.name], ['Email', order.customer.email],
      ['Status', (ORDER_STATUS[order.status] || {}).label || order.status], [],
      ['SKU', 'Product', 'Options', 'Qty', 'Unit Price', 'Line Total'],
    ];
    order.items.forEach((i) => rows.push(['SL-' + String(i.id).padStart(4, '0'), i.name, lineMeta(i), i.qty, i.unitPrice.toFixed(2), (i.unitPrice * i.qty).toFixed(2)]));
    rows.push([], ['', '', '', '', 'Subtotal', t.subtotal.toFixed(2)], ['', '', '', '', 'Discount', (-t.discount).toFixed(2)],
      ['', '', '', '', 'Shipping', t.shipping.toFixed(2)], ['', '', '', '', 'Tax', t.tax.toFixed(2)], ['', '', '', '', 'Total', t.total.toFixed(2)]);
    return rows.map((r) => r.map(q).join(',')).join('\r\n');
  }

  function receiptPdf(order) {
    const t = order.totals;
    const lines = [
      'ShopLab - Payment Receipt', '', 'Order: ' + order.id, 'Date: ' + fmtDate(order.date),
      'Customer: ' + order.customer.name + ' <' + order.customer.email + '>',
      'Ship to: ' + [order.address.line1, order.address.city, order.address.postalCode, order.address.country].join(', '), '', 'Items:',
    ];
    order.items.forEach((i) => lines.push('  ' + i.qty + ' x ' + i.name + ' (' + lineMeta(i) + ')   ' + money(i.unitPrice * i.qty)));
    lines.push('', 'Subtotal: ' + money(t.subtotal), 'Discount: -' + money(t.discount), 'Shipping: ' + money(t.shipping),
      'Tax: ' + money(t.tax), 'TOTAL: ' + money(t.total), '', 'Thank you for shopping with ShopLab!');
    return buildPdf(lines);
  }

  function downloadInvoice(order) { downloadFile('invoice-' + order.id + '.csv', invoiceCsv(order), 'text/csv;charset=utf-8'); }
  function downloadReceipt(order) { downloadFile('receipt-' + order.id + '.pdf', receiptPdf(order), 'application/pdf'); }

  // ==========================================================================
  // Input formatting / validation helpers (checkout, profile, gateway)
  // ==========================================================================

  const formatCardNumber = (v) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim();
  const formatExpiry = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 4);
    return d.length >= 3 ? d.slice(0, 2) + '/' + d.slice(2) : d;
  };
  const formatPhone = (v) => {
    const d = v.replace(/\D/g, '').slice(0, 10);
    if (d.length <= 3) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 3) + ') ' + d.slice(3);
    return '(' + d.slice(0, 3) + ') ' + d.slice(3, 6) + '-' + d.slice(6);
  };
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

  // ==========================================================================
  // Reusable widgets
  // ==========================================================================

  /** Shared drag state so sortable lists and drop zones can cooperate. */
  const drag = { el: null, moved: false, lists: null };

  /**
   * HTML5 drag-and-drop sortable lists. Items need draggable="true" and
   * data-id. Lists passed together can exchange items. onChange runs once
   * after a drag that changed the DOM order.
   */
  function makeSortable(lists, onChange) {
    function itemAfter(list, y) {
      const items = $$(':scope > [draggable="true"]', list).filter((el) => el !== drag.el);
      return items.find((el) => {
        const r = el.getBoundingClientRect();
        return y < r.top + r.height / 2;
      }) || null;
    }
    function finish() {
      if (!drag.el) return;
      drag.el.classList.remove('is-dragging');
      lists.forEach((l) => l.classList.remove('is-drop-target'));
      const moved = drag.moved;
      drag.el = null;
      drag.moved = false;
      if (moved) onChange();
    }
    lists.forEach((list) => {
      list.addEventListener('dragstart', (e) => {
        const item = e.target.closest && e.target.closest('[draggable="true"]');
        if (!item || item.parentElement !== list) return;
        drag.el = item;
        drag.moved = false;
        drag.lists = lists;
        e.dataTransfer.effectAllowed = 'move';
        try { e.dataTransfer.setData('text/plain', item.dataset.id); } catch (_) { /* ignore */ }
        requestAnimationFrame(() => item.classList.add('is-dragging'));
      });
      list.addEventListener('dragover', (e) => {
        if (!drag.el || drag.lists !== lists) return;
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        lists.forEach((l) => l.classList.toggle('is-drop-target', l === list));
        const after = itemAfter(list, e.clientY);
        if (after) {
          if (drag.el.nextElementSibling !== after) { list.insertBefore(drag.el, after); drag.moved = true; }
        } else if (list.lastElementChild !== drag.el) {
          list.appendChild(drag.el);
          drag.moved = true;
        }
      });
      list.addEventListener('drop', (e) => {
        if (!drag.el) return;
        e.preventDefault();
        finish();
      });
      list.addEventListener('dragend', finish);
    });
  }

  /** A drop target that accepts an item being dragged from a sortable list. */
  function makeDropZone(zone, onDrop) {
    zone.addEventListener('dragover', (e) => {
      if (!drag.el) return;
      e.preventDefault();
      zone.classList.add('is-drop-target');
    });
    zone.addEventListener('dragleave', (e) => { if (!zone.contains(e.relatedTarget)) zone.classList.remove('is-drop-target'); });
    zone.addEventListener('drop', (e) => {
      if (!drag.el) return;
      e.preventDefault();
      zone.classList.remove('is-drop-target');
      const id = drag.el.dataset.id;
      drag.el.classList.remove('is-dragging');
      drag.el = null;
      drag.moved = false;
      onDrop(id);
    });
  }

  /**
   * Accessible combobox (ARIA 1.2): type to filter, ↑/↓ to move, Enter to
   * select, Escape to close, or click an option.
   * options: [{ value, label, meta?, icon?, keywords? }] or a function returning them.
   * onEnterFreeText(text) runs on Enter when no option is active.
   */
  function createCombobox({ input, listbox, toggle, hidden, options, onSelect, onEnterFreeText, testid, minChars = 0, limit = 50 }) {
    let shown = [];
    let active = -1;
    let selected = null;
    const getOptions = () => (typeof options === 'function' ? options() : options);

    const highlight = (label, q) => {
      if (!q) return esc(label);
      const i = label.toLowerCase().indexOf(q);
      if (i < 0) return esc(label);
      return esc(label.slice(0, i)) + '<mark>' + esc(label.slice(i, i + q.length)) + '</mark>' + esc(label.slice(i + q.length));
    };

    function render() {
      const q = input.value.trim().toLowerCase();
      const showAll = !q || (selected && input.value === selected.label);
      shown = (showAll ? getOptions() : getOptions().filter((o) => (o.label + ' ' + (o.keywords || '')).toLowerCase().includes(q))).slice(0, limit);
      active = -1;
      input.removeAttribute('aria-activedescendant');
      if (!shown.length) {
        listbox.innerHTML = '<li class="no-results" role="presentation" data-testid="' + testid + '-no-results">No matches for “' + esc(input.value) + '”</li>';
        return;
      }
      listbox.innerHTML = shown.map((o, i) =>
        '<li role="option" id="' + listbox.id + '-opt-' + i + '" data-index="' + i + '" data-value="' + esc(o.value) + '"' +
        ' data-testid="' + testid + '-option" aria-selected="' + Boolean(selected && selected.value === o.value) + '">' +
        '<span class="opt-label">' + (o.icon ? '<span class="opt-icon" aria-hidden="true">' + o.icon + '</span>' : '') + '<span>' + highlight(o.label, showAll ? '' : q) + '</span></span>' +
        (o.meta ? '<span class="muted small">' + esc(o.meta) + '</span>' : '') + '</li>'
      ).join('');
    }

    function open() {
      if (input.value.trim().length < minChars) { close(); return; }
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
          if (isOpen && active >= 0) { e.preventDefault(); choose(active); }
          else if (onEnterFreeText) { e.preventDefault(); close(); onEnterFreeText(input.value.trim()); }
          else if (isOpen) { e.preventDefault(); if (shown.length === 1) choose(0); }
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
      select(value) {
        const o = getOptions().find((x) => x.value === value);
        if (!o) return;
        selected = o;
        input.value = o.label;
        if (hidden) hidden.value = o.value;
        if (onSelect) onSelect(o);
      },
      clear() { selected = null; input.value = ''; if (hidden) hidden.value = ''; close(); },
    };
  }

  /**
   * Drag-and-drop file uploader with thumbnail previews.
   * Generates its own markup inside `container`; testids are `${prefix}-*`.
   */
  function createUploader(container, { prefix, label, hint, maxFiles = 5, maxBytes = 5 * 1024 * 1024, onChange }) {
    const ALLOWED = ['jpg', 'jpeg', 'png', 'pdf'];
    let files = [];
    let seq = 0;
    container.classList.add('uploader');
    container.innerHTML =
      '<label class="dropzone" for="' + prefix + '-input" id="' + prefix + '-dropzone" data-testid="' + prefix + '-dropzone" tabindex="0" aria-describedby="' + prefix + '-hint">' +
        '<span class="dz-icon" aria-hidden="true">📤</span><strong>' + esc(label) + '</strong>' +
        '<span class="small muted" id="' + prefix + '-hint">' + esc(hint || 'Drag & drop or click to browse · JPG, PNG or PDF up to 5 MB') + '</span>' +
      '</label>' +
      '<input type="file" class="visually-hidden" id="' + prefix + '-input" name="' + prefix + '" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf"' + (maxFiles > 1 ? ' multiple' : '') + ' data-testid="' + prefix + '-input" aria-label="' + esc(label) + '">' +
      '<div class="alert alert-error" id="' + prefix + '-error" data-testid="' + prefix + '-error" role="alert" hidden></div>' +
      '<ul class="upload-list" id="' + prefix + '-list" data-testid="' + prefix + '-preview-list" aria-label="Selected files"></ul>';

    const dz = $('.dropzone', container);
    const input = $('input[type="file"]', container);
    const list = $('.upload-list', container);
    const errorBox = $('.alert', container);
    const fmtSize = (b) => (b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB');

    function addFiles(fileList) {
      const errors = [];
      Array.from(fileList).forEach((f) => {
        const ext = f.name.includes('.') ? f.name.split('.').pop().toLowerCase() : '';
        if (!ALLOWED.includes(ext)) { errors.push(f.name + ': unsupported file type (allowed: JPG, PNG, PDF).'); return; }
        if (f.size > maxBytes) { errors.push(f.name + ': file is larger than 5 MB.'); return; }
        if (maxFiles === 1) { files.forEach((x) => x.url && URL.revokeObjectURL(x.url)); files = []; }
        if (files.length >= maxFiles) { errors.push(f.name + ': you can upload at most ' + maxFiles + ' files.'); return; }
        if (files.some((x) => x.file.name === f.name && x.file.size === f.size)) { errors.push(f.name + ': already added.'); return; }
        files.push({ id: ++seq, file: f, isPdf: ext === 'pdf', url: ext === 'pdf' ? null : URL.createObjectURL(f) });
      });
      errorBox.hidden = !errors.length;
      errorBox.innerHTML = errors.length ? '<div><strong>Some files were rejected:</strong><ul>' + errors.map((m) => '<li data-testid="' + prefix + '-error-item">' + esc(m) + '</li>').join('') + '</ul></div>' : '';
      input.value = ''; // allow re-selecting the same file
      render();
    }

    function render() {
      list.innerHTML = files.map((f) =>
        '<li class="upload-item" data-testid="' + prefix + '-preview-item" data-file-name="' + esc(f.file.name) + '">' +
          '<div class="thumb">' + (f.isPdf
            ? '<span data-testid="' + prefix + '-preview-pdf-icon" role="img" aria-label="PDF document">📄</span>'
            : '<img src="' + f.url + '" alt="Preview of ' + esc(f.file.name) + '" data-testid="' + prefix + '-preview-thumbnail">') + '</div>' +
          '<div class="meta">' +
            '<span class="name" data-testid="' + prefix + '-file-name" title="' + esc(f.file.name) + '">' + esc(f.file.name) + '</span>' +
            '<span class="muted">' + fmtSize(f.file.size) + '</span>' +
            '<button type="button" class="btn btn-sm btn-ghost" data-remove="' + f.id + '" data-testid="' + prefix + '-remove-btn" aria-label="Remove ' + esc(f.file.name) + '">Remove</button>' +
          '</div>' +
        '</li>').join('');
      container.dataset.count = String(files.length);
      if (onChange) onChange(files.map((f) => f.file));
    }

    input.addEventListener('change', () => addFiles(input.files));
    dz.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); input.click(); }
    });
    ['dragenter', 'dragover'].forEach((type) => dz.addEventListener(type, (e) => {
      if (drag.el) return; // a sortable item, not a file
      e.preventDefault();
      dz.classList.add('is-dragover');
    }));
    dz.addEventListener('dragleave', (e) => { if (!dz.contains(e.relatedTarget)) dz.classList.remove('is-dragover'); });
    dz.addEventListener('drop', (e) => {
      e.preventDefault();
      dz.classList.remove('is-dragover');
      if (e.dataTransfer && e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    });
    list.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-remove]');
      if (!btn) return;
      const f = files.find((x) => x.id === Number(btn.dataset.remove));
      if (f && f.url) URL.revokeObjectURL(f.url);
      files = files.filter((x) => x !== f);
      render();
    });

    return {
      get files() { return files.map((f) => f.file); },
      clear() {
        files.forEach((f) => f.url && URL.revokeObjectURL(f.url));
        files = [];
        errorBox.hidden = true;
        render();
      },
      showError(msg) {
        errorBox.hidden = !msg;
        errorBox.textContent = msg;
      },
    };
  }

  /**
   * Sortable, searchable, paginated table with optional row selection.
   * Generates its markup inside `root`; testids are `${prefix}-*`.
   * columns: [{ key, label, sortable?, num?, render(row, table) → html, sortValue?(row) }]
   */
  function createDataTable(opts) {
    const {
      root, prefix, columns, getRows, rowKey, rowAttrs, searchFn, searchPlaceholder = 'Search…',
      filters = [], selectable = false, pageSizes = [5, 10, 25], emptyHtml = 'Nothing to show.', toolbarHtml = '', onRender,
    } = opts;
    const state = { query: '', sortKey: opts.sortKey || null, sortDir: opts.sortDir || 'asc', page: 1, pageSize: opts.pageSize || pageSizes[0], selected: new Set(), editing: null, filters: {} };

    root.classList.add('data-table-root');
    root.innerHTML =
      '<div class="table-toolbar">' +
        (searchFn ? '<input type="search" class="input" id="' + prefix + '-search" data-testid="' + prefix + '-search-input" placeholder="' + esc(searchPlaceholder) + '" aria-label="' + esc(searchPlaceholder) + '">' : '') +
        filters.map((f) => '<select class="select" id="' + prefix + '-filter-' + f.id + '" data-filter="' + f.id + '" data-testid="' + prefix + '-filter-' + f.id + '" aria-label="' + esc(f.label) + '">' +
          f.options.map(([v, l]) => '<option value="' + esc(v) + '">' + esc(l) + '</option>').join('') + '</select>').join('') +
        '<span class="spacer"></span>' + toolbarHtml +
        '<label class="small muted" for="' + prefix + '-page-size">Rows</label>' +
        '<select class="select select-sm" id="' + prefix + '-page-size" data-testid="' + prefix + '-page-size-select" aria-label="Rows per page">' +
          pageSizes.map((n) => '<option value="' + n + '"' + (n === state.pageSize ? ' selected' : '') + '>' + n + '</option>').join('') +
        '</select>' +
      '</div>' +
      '<div class="table-wrap"><table class="data-table" id="' + prefix + '-table" data-testid="' + prefix + '-table"><thead><tr>' +
        (selectable ? '<th scope="col" class="col-check"><input type="checkbox" data-testid="' + prefix + '-select-all" aria-label="Select all rows on this page"></th>' : '') +
        columns.map((c) => '<th scope="col"' + (c.num ? ' class="num"' : '') + (c.sortable ? ' aria-sort="none" data-sort-key="' + c.key + '"' : '') + '>' +
          (c.sortable ? '<button type="button" class="sort-btn" data-testid="' + prefix + '-sort-' + c.key + '">' + esc(c.label) + ' <span class="sort-indicator" aria-hidden="true">↕</span></button>' : esc(c.label)) + '</th>').join('') +
      '</tr></thead><tbody data-testid="' + prefix + '-body"></tbody></table></div>' +
      '<div class="table-footer">' +
        '<p class="small muted" data-testid="' + prefix + '-summary" aria-live="polite"></p>' +
        '<div class="pagination" data-testid="' + prefix + '-pagination" role="navigation" aria-label="Pagination"></div>' +
      '</div>';

    const tbody = $('tbody', root);
    const pager = $('.pagination', root);
    const summary = $('[data-testid="' + prefix + '-summary"]', root);
    const selectAll = $('[data-testid="' + prefix + '-select-all"]', root);

    function visibleRows() {
      const q = state.query.toLowerCase();
      let rows = getRows().filter((r) => (!q || searchFn(r).toLowerCase().includes(q)) &&
        filters.every((f) => !state.filters[f.id] || f.test(r, state.filters[f.id])));
      if (state.sortKey) {
        const col = columns.find((c) => c.key === state.sortKey);
        const val = col.sortValue || ((r) => r[col.key]);
        const dir = state.sortDir === 'asc' ? 1 : -1;
        rows = rows.slice().sort((a, b) => {
          const x = val(a);
          const y = val(b);
          return (typeof x === 'number' ? x - y : String(x).localeCompare(String(y))) * dir;
        });
      }
      return rows;
    }

    function pageRows() {
      const rows = visibleRows();
      const totalPages = Math.max(1, Math.ceil(rows.length / state.pageSize));
      state.page = clamp(state.page, 1, totalPages);
      const start = (state.page - 1) * state.pageSize;
      return { rows, totalPages, start, page: rows.slice(start, start + state.pageSize) };
    }

    const api = { root, tbody, state, visibleRows };

    function render() {
      const { rows, totalPages, start, page } = pageRows();
      const colspan = columns.length + (selectable ? 1 : 0);
      tbody.innerHTML = page.length ? page.map((r) => {
        const key = rowKey(r);
        const sel = state.selected.has(key);
        return '<tr data-testid="' + prefix + '-row" data-key="' + esc(key) + '"' + (rowAttrs ? ' ' + rowAttrs(r) : '') +
          ' class="' + (sel ? 'is-selected ' : '') + (state.editing === key ? 'is-editing' : '') + '">' +
          (selectable ? '<td class="col-check"><input type="checkbox" data-row-select data-testid="' + prefix + '-row-checkbox" aria-label="Select ' + esc(key) + '"' + (sel ? ' checked' : '') + '></td>' : '') +
          columns.map((c) => '<td' + (c.num ? ' class="num"' : '') + ' data-testid="' + prefix + '-cell-' + c.key + '">' + c.render(r, api) + '</td>').join('') +
          '</tr>';
      }).join('') : '<tr><td colspan="' + colspan + '" class="table-empty" data-testid="' + prefix + '-empty">' + emptyHtml + '</td></tr>';

      $$('th[data-sort-key]', root).forEach((th) => {
        const on = th.dataset.sortKey === state.sortKey;
        th.setAttribute('aria-sort', on ? (state.sortDir === 'asc' ? 'ascending' : 'descending') : 'none');
        $('.sort-indicator', th).textContent = on ? (state.sortDir === 'asc' ? '↑' : '↓') : '↕';
      });

      if (selectAll) {
        const keys = page.map(rowKey);
        const n = keys.filter((k) => state.selected.has(k)).length;
        selectAll.checked = keys.length > 0 && n === keys.length;
        selectAll.indeterminate = n > 0 && n < keys.length;
      }

      const first = clamp(state.page - 2, 1, Math.max(1, totalPages - 4));
      const last = Math.min(totalPages, first + 4);
      const btn = (label, p, testid, aria, disabled, current) =>
        '<button type="button" class="btn btn-sm' + (current ? ' is-current' : '') + '" data-page="' + p + '" data-testid="' + prefix + '-' + testid + '" aria-label="' + aria + '"' +
        (disabled ? ' disabled' : '') + (current ? ' aria-current="page"' : '') + '>' + label + '</button>';
      let html = btn('«', 1, 'page-first', 'First page', state.page === 1) + btn('‹', state.page - 1, 'page-prev', 'Previous page', state.page === 1);
      for (let i = first; i <= last; i++) html += btn(String(i), i, 'page-number', 'Page ' + i, false, i === state.page);
      html += btn('›', state.page + 1, 'page-next', 'Next page', state.page === totalPages) + btn('»', totalPages, 'page-last', 'Last page', state.page === totalPages);
      pager.innerHTML = html;

      summary.textContent = rows.length
        ? 'Showing ' + (start + 1) + '–' + (start + page.length) + ' of ' + rows.length + ' · Page ' + state.page + ' of ' + totalPages
        : 'Showing 0 of 0';
      summary.dataset.total = String(rows.length);
      if (onRender) onRender(api);
    }
    api.render = render;

    $('thead', root).addEventListener('click', (e) => {
      const th = e.target.closest('th[data-sort-key]');
      if (!th || !e.target.closest('.sort-btn')) return;
      const key = th.dataset.sortKey;
      state.sortDir = state.sortKey === key && state.sortDir === 'asc' ? 'desc' : 'asc';
      state.sortKey = key;
      state.page = 1;
      render();
    });
    pager.addEventListener('click', (e) => {
      const b = e.target.closest('button[data-page]');
      if (!b || b.disabled) return;
      state.page = Number(b.dataset.page);
      render();
    });
    const search = $('input[type="search"]', root);
    if (search) search.addEventListener('input', () => { state.query = search.value.trim(); state.page = 1; render(); });
    $$('select[data-filter]', root).forEach((sel) => sel.addEventListener('change', () => {
      state.filters[sel.dataset.filter] = sel.value;
      state.page = 1;
      render();
    }));
    $('[data-testid="' + prefix + '-page-size-select"]', root).addEventListener('change', (e) => {
      state.pageSize = Number(e.target.value);
      state.page = 1;
      render();
    });
    if (selectAll) {
      selectAll.addEventListener('change', () => {
        pageRows().page.forEach((r) => {
          if (selectAll.checked) state.selected.add(rowKey(r));
          else state.selected.delete(rowKey(r));
        });
        render();
      });
      tbody.addEventListener('change', (e) => {
        if (!e.target.matches('[data-row-select]')) return;
        const key = e.target.closest('tr').dataset.key;
        if (e.target.checked) state.selected.add(key);
        else state.selected.delete(key);
        render();
      });
    }

    return api;
  }

  /**
   * Custom right-click menu for rows inside `scope` matching `rowSelector`.
   * getItems(row) → [{ action, label, disabled? }]; onSelect(action, row).
   */
  function attachContextMenu(scope, rowSelector, getItems, onSelect, testid) {
    const menu = document.createElement('ul');
    menu.className = 'context-menu';
    menu.setAttribute('role', 'menu');
    menu.dataset.testid = testid;
    menu.hidden = true;
    document.body.appendChild(menu);
    let row = null;
    const hide = () => { menu.hidden = true; row = null; };

    scope.addEventListener('contextmenu', (e) => {
      const r = e.target.closest(rowSelector);
      if (!r) return;
      e.preventDefault();
      row = r;
      menu.innerHTML = getItems(r).map((it) =>
        '<li role="none"><button type="button" role="menuitem" data-menu-action="' + it.action + '" data-testid="' + testid + '-item-' + it.action + '"' + (it.disabled ? ' disabled' : '') + '>' + esc(it.label) + '</button></li>').join('');
      menu.hidden = false;
      menu.style.left = Math.min(e.clientX, window.innerWidth - 200) + 'px';
      menu.style.top = Math.min(e.clientY, window.innerHeight - menu.offsetHeight - 8) + 'px';
      const firstBtn = $('button:not([disabled])', menu);
      if (firstBtn) firstBtn.focus();
    });
    menu.addEventListener('click', (e) => {
      const b = e.target.closest('[data-menu-action]');
      if (!b || b.disabled) return;
      const target = row;
      hide();
      onSelect(b.dataset.menuAction, target);
    });
    document.addEventListener('click', (e) => { if (!menu.contains(e.target)) hide(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') hide(); });
    window.addEventListener('scroll', hide, { passive: true });
  }

  /** Accessible tab set: [role=tab][data-tab] buttons with aria-controls panels. */
  function initTabs(root, { initial, onChange } = {}) {
    const tabs = $$('[role="tab"]', root);
    function select(name, focus) {
      if (!tabs.some((t) => t.dataset.tab === name)) name = tabs[0].dataset.tab;
      tabs.forEach((t) => {
        const on = t.dataset.tab === name;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        if (panel) panel.hidden = !on;
        if (on && focus) t.focus();
      });
      if (onChange) onChange(name);
    }
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t.dataset.tab));
      t.addEventListener('keydown', (e) => {
        const map = { ArrowRight: i + 1, ArrowLeft: i - 1, ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: tabs.length - 1 };
        if (!(e.key in map)) return;
        e.preventDefault();
        select(tabs[(map[e.key] + tabs.length) % tabs.length].dataset.tab, true);
      });
    });
    select(initial || tabs[0].dataset.tab);
    return { select };
  }

  /** Product card markup shared by catalog, recommendations and recently viewed. */
  function productCardHtml(p, { qty = 1, compact = false } = {}) {
    const out = p.stock <= 0;
    const wished = Wishlist.has(p.id);
    const idp = compact ? 'mini-' : '';
    const badge = p.tags.includes('sale') ? '<span class="badge badge-sale" data-testid="product-badge">Sale</span>'
      : p.tags.includes('new') ? '<span class="badge badge-new" data-testid="product-badge">New</span>' : '';
    const stockNote = out ? '<p class="stock-note out" data-testid="product-stock-status">Out of stock</p>'
      : p.stock <= 5 ? '<p class="stock-note low" data-testid="product-stock-status">Only ' + p.stock + ' left</p>'
      : '<p class="stock-note muted" data-testid="product-stock-status">In stock</p>';
    const needsOptions = p.requiresPrescription;
    const addBtn = out
      ? '<a class="btn" href="product-detail.html?id=' + p.id + '" id="add-to-cart-' + p.id + '" data-testid="product-notify-link" aria-label="Get notified when ' + esc(p.name) + ' is back">Notify me</a>'
      : needsOptions
        ? '<a class="btn btn-primary" href="product-detail.html?id=' + p.id + '" id="add-to-cart-' + p.id + '" data-testid="product-choose-options" aria-label="Choose options for ' + esc(p.name) + '">Choose options</a>'
        : '<button type="button" class="btn btn-primary" data-action="add" id="add-to-cart-' + p.id + '" data-testid="product-add-to-cart" aria-label="Add ' + esc(p.name) + ' to cart">Add to Cart</button>';
    return (
      '<article class="product-card' + (out ? ' is-out-of-stock' : '') + (compact ? ' is-compact' : '') + '" id="' + idp + 'product-card-' + p.id + '" data-testid="product-card" data-product-id="' + p.id + '" aria-labelledby="' + idp + 'product-title-' + p.id + '">' +
        '<div class="product-media-wrap">' +
          '<a href="product-detail.html?id=' + p.id + '" class="product-media" data-testid="product-image-link" tabindex="-1" aria-hidden="true">' +
            '<img src="' + productImage(p) + '" alt="' + esc(p.name) + '" data-testid="product-image" loading="lazy" width="400" height="400">' + badge +
          '</a>' +
          '<button type="button" class="card-wish" data-action="wish" data-testid="product-wishlist-toggle" aria-pressed="' + wished + '" aria-label="' + (wished ? 'Remove ' : 'Add ') + esc(p.name) + (wished ? ' from' : ' to') + ' wishlist">' + (wished ? '♥' : '♡') + '</button>' +
          (compact ? '' : '<button type="button" class="card-quick-view" data-action="quick-view" data-testid="product-quick-view" aria-label="Quick view ' + esc(p.name) + '">Quick view</button>') +
        '</div>' +
        '<div class="product-body">' +
          '<p class="product-category" data-testid="product-category">' + esc(CATEGORY_LABELS[p.category]) + '</p>' +
          '<h3 class="product-title" id="' + idp + 'product-title-' + p.id + '"><a href="product-detail.html?id=' + p.id + '" data-testid="product-title-link">' + esc(p.name) + '</a></h3>' +
          '<div class="rating" aria-label="Rated ' + p.rating + ' out of 5" data-testid="product-rating">' + stars(p.rating) + '<span>' + p.rating.toFixed(1) + '</span></div>' +
          '<div class="price-row"><p class="price" data-testid="product-price">' + money(p.price) + '</p>' +
            (p.compareAt ? '<span class="compare-price" data-testid="product-compare-price">' + money(p.compareAt) + '</span>' : '') + '</div>' +
          (compact ? '' :
            stockNote +
            '<div class="color-dots" data-testid="product-colors" aria-label="' + plural(p.colors.length, 'colour') + '">' +
              p.colors.map((c) => '<span class="swatch-dot" title="' + esc(c.name) + '" style="background:' + c.hex + '"></span>').join('') +
              '<span class="muted small">' + plural(p.colors.length, 'colour') + '</span></div>' +
            '<div class="card-actions">' +
              (out || needsOptions ? '' :
                '<div class="qty" role="group" aria-label="Quantity for ' + esc(p.name) + '" data-testid="product-qty">' +
                  '<button type="button" data-action="dec" data-testid="product-qty-decrement" aria-label="Decrease quantity for ' + esc(p.name) + '"' + (qty <= 1 ? ' disabled' : '') + '>−</button>' +
                  '<input type="number" id="qty-' + p.id + '" value="' + qty + '" min="1" max="' + p.stock + '" data-testid="product-qty-input" aria-label="Quantity for ' + esc(p.name) + '">' +
                  '<button type="button" data-action="inc" data-testid="product-qty-increment" aria-label="Increase quantity for ' + esc(p.name) + '"' + (qty >= p.stock ? ' disabled' : '') + '>+</button>' +
                '</div>') +
              addBtn +
            '</div>' +
            '<div class="card-links">' +
              '<a href="product-detail.html?id=' + p.id + '&tab=reviews" target="_blank" rel="noopener" data-testid="product-reviews-link" aria-label="Read reviews for ' + esc(p.name) + ' (opens in new tab)">Read Reviews ↗</a>' +
              '<a href="product-detail.html?id=' + p.id + '&tab=terms" target="_blank" rel="noopener" data-testid="product-vendor-terms-link" aria-label="Vendor terms for ' + esc(p.name) + ' (opens in new tab)">Vendor Terms ↗</a>' +
            '</div>') +
        '</div>' +
      '</article>'
    );
  }

  /** Wires wishlist hearts inside any container of product cards. */
  function bindCardWishlist(container) {
    container.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="wish"]');
      if (!btn) return;
      const card = btn.closest('[data-testid="product-card"]');
      const p = getProduct(card.dataset.productId);
      const on = Wishlist.toggle(p.id);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', (on ? 'Remove ' : 'Add ') + p.name + (on ? ' from' : ' to') + ' wishlist');
      btn.textContent = on ? '♥' : '♡';
      toast(on ? 'Saved to your wishlist' : 'Removed from your wishlist', 'info');
    });
  }

  // ==========================================================================
  // Site shell: header (search, mega menu, account menu), footer, cart
  // drawer, cookie consent, back-to-top, keyboard shortcut.
  // ==========================================================================

  const ICONS = {
    search: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>',
    bag: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M6 7h12l-1 13H7L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>',
    heart: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/></svg>',
    chevron: '<svg class="icon" aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>',
  };

  function headerHtml(page, session) {
    const navLink = (href, label, id, current) =>
      '<a href="' + href + '" id="' + id + '" data-testid="' + id + '-link"' + (current ? ' aria-current="page"' : '') + '>' + label + '</a>';
    const featured = Products.visible().filter((p) => p.tags.includes('sale')).slice(0, 2);
    const isAdmin = session && session.role === 'admin';
    return (
      '<div class="announcement-bar" data-testid="announcement-bar" role="region" aria-label="Announcements">' +
        '<span>Free shipping on orders over $100</span><span class="dot" aria-hidden="true">·</span><span>Use code <strong>SAVE10</strong> for 10% off</span>' +
      '</div>' +
      '<header class="site-header" data-testid="site-header">' +
        '<div class="container header-inner">' +
          '<button type="button" class="icon-btn menu-toggle" id="menu-toggle" data-testid="header-menu-toggle" aria-label="Open menu" aria-expanded="false" aria-controls="main-nav">☰</button>' +
          '<a href="index.html" class="brand" id="brand-link" data-testid="header-brand-link" aria-label="ShopLab home"><span class="brand-mark" aria-hidden="true">S</span><span>ShopLab</span></a>' +
          '<nav class="main-nav" id="main-nav" aria-label="Main navigation" data-testid="header-nav">' +
            navLink('index.html', 'Shop', 'nav-shop', page === 'catalog') +
            '<div class="nav-item has-mega" data-testid="nav-categories">' +
              '<button type="button" class="nav-trigger" id="nav-categories-btn" data-testid="nav-categories-btn" aria-haspopup="true" aria-expanded="false" aria-controls="mega-menu">Categories ' + ICONS.chevron + '</button>' +
              '<div class="mega-menu" id="mega-menu" data-testid="mega-menu" role="menu">' +
                '<div class="mega-cats">' +
                  Object.keys(CATEGORY_LABELS).map((k) =>
                    '<a href="index.html?category=' + k + '#catalog" role="menuitem" data-testid="mega-menu-' + k + '"><span aria-hidden="true">' + CATEGORY_EMOJI[k] + '</span>' + esc(CATEGORY_LABELS[k]) + '</a>').join('') +
                '</div>' +
                '<div class="mega-featured">' +
                  '<p class="eyebrow">On sale now</p>' +
                  featured.map((p) => '<a href="product-detail.html?id=' + p.id + '" class="mega-product" role="menuitem" data-testid="mega-menu-featured">' +
                    '<img src="' + productImage(p) + '" alt="" width="56" height="56"><span><strong>' + esc(p.name) + '</strong><span class="price-sale">' + money(p.price) + '</span></span></a>').join('') +
                '</div>' +
              '</div>' +
            '</div>' +
            '<a href="index.html?tag=sale#catalog" id="nav-deals" data-testid="nav-deals-link">Deals</a>' +
            navLink('account.html#orders', 'Orders', 'nav-orders', page === 'account') +
            (isAdmin ? navLink('admin.html', 'Admin', 'nav-admin', page === 'admin') : '') +
          '</nav>' +
          '<div class="header-search combobox" role="search" data-testid="header-search">' +
            '<label for="header-search-input" class="visually-hidden">Search products</label>' +
            '<span class="search-icon">' + ICONS.search + '</span>' +
            '<input type="search" class="input" id="header-search-input" role="combobox" aria-autocomplete="list" aria-expanded="false" aria-controls="header-search-listbox" autocomplete="off" placeholder="Search products…" data-testid="header-search-input">' +
            '<kbd class="search-kbd" aria-hidden="true">/</kbd>' +
            '<ul class="listbox" id="header-search-listbox" role="listbox" aria-label="Product suggestions" data-testid="header-search-listbox" hidden></ul>' +
          '</div>' +
          '<div class="header-actions">' +
            '<a href="account.html#wishlist" class="icon-btn" id="header-wishlist" data-testid="header-wishlist-link" aria-label="Wishlist">' + ICONS.heart +
              '<span class="icon-count" data-testid="header-wishlist-count">0</span></a>' +
            '<div class="nav-item has-dropdown account-menu" data-testid="header-account">' +
              '<button type="button" class="icon-btn account-btn" id="header-account-btn" data-testid="header-account-btn" aria-haspopup="true" aria-expanded="false" aria-controls="header-account-menu" aria-label="Account menu">' +
                '<span class="avatar" aria-hidden="true">' + esc((session ? session.user : '?').charAt(0).toUpperCase()) + '</span>' +
              '</button>' +
              '<div class="dropdown" id="header-account-menu" data-testid="header-account-menu" role="menu">' +
                '<div class="dropdown-head"><strong id="header-username" data-testid="header-username">' + esc(session ? session.user : '') + '</strong>' +
                  '<span class="muted small" data-testid="header-user-email">' + esc(session ? session.email : '') + '</span></div>' +
                '<a href="account.html#orders" role="menuitem" data-testid="account-menu-orders">📦 My orders</a>' +
                '<a href="account.html#wishlist" role="menuitem" data-testid="account-menu-wishlist">♡ Wishlist</a>' +
                '<a href="account.html#returns" role="menuitem" data-testid="account-menu-returns">↩︎ Returns</a>' +
                '<a href="account.html#profile" role="menuitem" data-testid="account-menu-profile">👤 Profile</a>' +
                (isAdmin ? '<a href="admin.html" role="menuitem" data-testid="account-menu-admin">🛠 Admin console</a>' : '') +
                '<button type="button" role="menuitem" id="logout-btn" data-testid="header-logout-btn">Log out</button>' +
              '</div>' +
            '</div>' +
            '<button type="button" class="icon-btn cart-btn" id="header-cart-btn" data-testid="header-cart-btn" aria-label="Open cart" aria-controls="cart-drawer" aria-expanded="false">' + ICONS.bag +
              '<span class="icon-count cart-count" id="cart-count" data-testid="header-cart-count" aria-live="polite">0</span></button>' +
          '</div>' +
        '</div>' +
      '</header>'
    );
  }

  function footerHtml() {
    return (
      '<footer class="site-footer" data-testid="site-footer">' +
        '<div class="container footer-grid">' +
          '<div class="footer-brand">' +
            '<a href="index.html" class="brand"><span class="brand-mark" aria-hidden="true">S</span><span>ShopLab</span></a>' +
            '<p class="muted small">A realistic demo store for practising end-to-end UI automation. No real payments, no real shipping.</p>' +
            '<shop-newsletter data-testid="shadow-host"></shop-newsletter>' +
          '</div>' +
          '<div class="footer-col"><h3>Shop</h3>' + Object.keys(CATEGORY_LABELS).map((k) => '<a href="index.html?category=' + k + '#catalog" data-testid="footer-category-' + k + '">' + esc(CATEGORY_LABELS[k]) + '</a>').join('') + '</div>' +
          '<div class="footer-col"><h3>Account</h3>' +
            '<a href="account.html#orders" data-testid="footer-orders-link">Order history</a>' +
            '<a href="account.html#wishlist" data-testid="footer-wishlist-link">Wishlist</a>' +
            '<a href="account.html#returns" data-testid="footer-returns-link">Returns</a>' +
            '<a href="account.html#profile" data-testid="footer-profile-link">Profile</a>' +
            '<a href="checkout.html" data-testid="footer-cart-link">Cart & checkout</a></div>' +
          '<div class="footer-col"><h3>Help</h3>' +
            '<a href="product-detail.html?id=1&tab=shipping" data-testid="footer-shipping-link">Shipping & returns</a>' +
            '<a href="product-detail.html?id=1&tab=terms" data-testid="footer-terms-link">Terms of sale</a>' +
            '<button type="button" class="link-btn" id="cookie-preferences-link" data-testid="footer-cookie-preferences">Cookie preferences</button>' +
            '<button type="button" class="link-btn" id="reset-demo-state" data-testid="footer-reset-state">Reset demo data</button></div>' +
        '</div>' +
        '<div class="container footer-bottom"><span>© 2026 ShopLab · Built for Playwright, Cypress &amp; Selenium practice</span><span>Test card 4242 4242 4242 4242</span></div>' +
      '</footer>'
    );
  }

  function drawerHtml() {
    return (
      '<div class="drawer-backdrop" id="cart-drawer-backdrop" data-testid="cart-drawer-backdrop" hidden></div>' +
      '<aside class="drawer" id="cart-drawer" data-testid="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-drawer-title" aria-hidden="true" tabindex="-1">' +
        '<div class="drawer-head"><h2 id="cart-drawer-title">Your cart <span class="muted" data-testid="cart-drawer-count"></span></h2>' +
          '<button type="button" class="modal-close" id="cart-drawer-close" data-testid="cart-drawer-close" aria-label="Close cart">×</button></div>' +
        '<div class="drawer-shipping" data-testid="cart-drawer-shipping">' +
          '<p class="small" id="drawer-shipping-text" data-testid="cart-drawer-shipping-text"></p>' +
          '<div class="progress" role="progressbar" aria-label="Progress to free shipping" aria-valuemin="0" aria-valuemax="100" data-testid="cart-drawer-shipping-progress"><div class="progress-bar"></div></div>' +
        '</div>' +
        '<ul class="drawer-lines" id="cart-drawer-lines" data-testid="cart-drawer-lines"></ul>' +
        '<div class="drawer-empty" data-testid="cart-drawer-empty" hidden><span class="emoji" aria-hidden="true">🛍️</span><p>Your cart is empty.</p>' +
          '<a href="index.html#catalog" class="btn btn-primary" data-testid="cart-drawer-shop">Start shopping</a></div>' +
        '<div class="drawer-foot">' +
          '<div class="drawer-subtotal"><span>Subtotal</span><strong data-testid="cart-drawer-subtotal">$0.00</strong></div>' +
          '<p class="small muted">Taxes and shipping calculated at checkout.</p>' +
          '<a href="checkout.html" class="btn btn-primary btn-lg btn-block" id="cart-drawer-checkout" data-testid="cart-drawer-checkout">Checkout</a>' +
          '<button type="button" class="btn btn-ghost btn-block" id="cart-drawer-continue" data-testid="cart-drawer-continue">Continue shopping</button>' +
        '</div>' +
      '</aside>'
    );
  }

  function cookieHtml() {
    return (
      '<section class="cookie-banner" id="cookie-banner" data-testid="cookie-banner" role="region" aria-label="Cookie consent" hidden>' +
        '<div><strong>🍪 We use cookies</strong><p class="small muted">To keep you signed in, remember your cart and improve the store. Choose what you allow.</p></div>' +
        '<div class="row">' +
          '<button type="button" class="btn btn-sm" id="cookie-manage" data-testid="cookie-manage-btn">Manage</button>' +
          '<button type="button" class="btn btn-sm" id="cookie-reject" data-testid="cookie-reject-btn">Reject non-essential</button>' +
          '<button type="button" class="btn btn-sm btn-primary" id="cookie-accept" data-testid="cookie-accept-btn">Accept all</button>' +
        '</div>' +
      '</section>' +
      '<dialog class="modal" id="cookie-modal" data-testid="cookie-preferences-modal" aria-labelledby="cookie-modal-title">' +
        '<form method="dialog">' +
          '<div class="modal-header"><h2 id="cookie-modal-title">Cookie preferences</h2><button type="submit" value="cancel" class="modal-close" aria-label="Close" data-testid="cookie-modal-close">×</button></div>' +
          '<div class="modal-body stack">' +
            '<label class="switch-row"><span><strong>Essential</strong><br><span class="small muted">Sign-in, cart and checkout. Always on.</span></span><input type="checkbox" class="switch" role="switch" checked disabled data-testid="cookie-essential-switch"></label>' +
            '<label class="switch-row"><span><strong>Analytics</strong><br><span class="small muted">Helps us understand how the store is used.</span></span><input type="checkbox" class="switch" role="switch" id="cookie-analytics" data-testid="cookie-analytics-switch"></label>' +
            '<label class="switch-row"><span><strong>Marketing</strong><br><span class="small muted">Personalised offers and recommendations.</span></span><input type="checkbox" class="switch" role="switch" id="cookie-marketing" data-testid="cookie-marketing-switch"></label>' +
          '</div>' +
          '<div class="modal-footer"><button type="submit" value="save" class="btn btn-primary" data-testid="cookie-save-btn">Save preferences</button></div>' +
        '</form>' +
      '</dialog>'
    );
  }

  function updateBadges(bump) {
    $$('[data-testid="header-cart-count"]').forEach((el) => {
      const n = Cart.count();
      el.textContent = String(n);
      el.dataset.count = String(n);
      if (bump) {
        el.classList.remove('bump');
        void el.offsetWidth; // restart the animation
        el.classList.add('bump');
      }
    });
    $$('[data-testid="header-wishlist-count"]').forEach((el) => {
      const n = Wishlist.ids().length;
      el.textContent = String(n);
      el.hidden = n === 0;
    });
  }

  // ---- Cart drawer ---------------------------------------------------------

  const Drawer = {
    open() {
      const d = $('#cart-drawer');
      if (!d) return;
      this.render();
      $('#cart-drawer-backdrop').hidden = false;
      d.classList.add('is-open');
      d.setAttribute('aria-hidden', 'false');
      $('#header-cart-btn').setAttribute('aria-expanded', 'true');
      document.body.classList.add('has-drawer');
      d.focus();
    },
    close() {
      const d = $('#cart-drawer');
      if (!d || !d.classList.contains('is-open')) return;
      d.classList.remove('is-open');
      d.setAttribute('aria-hidden', 'true');
      $('#cart-drawer-backdrop').hidden = true;
      $('#header-cart-btn').setAttribute('aria-expanded', 'false');
      document.body.classList.remove('has-drawer');
    },
    render() {
      const d = $('#cart-drawer');
      if (!d) return;
      const lines = Cart.lines();
      const subtotal = Cart.subtotal();
      $('[data-testid="cart-drawer-count"]', d).textContent = '(' + Cart.count() + ')';
      $('#cart-drawer-lines').innerHTML = lines.map((l) =>
        '<li class="drawer-line" data-testid="cart-drawer-line" data-key="' + esc(l.key) + '" data-id="' + l.id + '">' +
          '<img src="' + productImage(l.product) + '" alt="" width="64" height="64">' +
          '<div class="drawer-line-info">' +
            '<a href="product-detail.html?id=' + l.id + '" class="drawer-line-name" data-testid="cart-drawer-line-name">' + esc(l.product.name) + '</a>' +
            '<span class="small muted" data-testid="cart-drawer-line-meta">' + esc(lineMeta(l)) + '</span>' +
            '<div class="qty qty-sm" role="group" aria-label="Quantity for ' + esc(l.product.name) + '">' +
              '<button type="button" data-drawer="dec" data-testid="cart-drawer-qty-decrement" aria-label="Decrease quantity"' + (l.qty <= 1 ? ' disabled' : '') + '>−</button>' +
              '<input type="number" value="' + l.qty + '" min="1" data-testid="cart-drawer-qty-input" aria-label="Quantity" readonly>' +
              '<button type="button" data-drawer="inc" data-testid="cart-drawer-qty-increment" aria-label="Increase quantity"' + (Cart.totalFor(l.id) >= l.product.stock ? ' disabled' : '') + '>+</button>' +
            '</div>' +
          '</div>' +
          '<div class="drawer-line-end"><strong data-testid="cart-drawer-line-total">' + money(l.total) + '</strong>' +
            '<button type="button" class="link-btn small" data-drawer="remove" data-testid="cart-drawer-remove" aria-label="Remove ' + esc(l.product.name) + '">Remove</button></div>' +
        '</li>').join('');
      $('[data-testid="cart-drawer-empty"]', d).hidden = lines.length > 0;
      $('.drawer-foot', d).hidden = !lines.length;
      $('.drawer-shipping', d).hidden = !lines.length;
      $('[data-testid="cart-drawer-subtotal"]', d).textContent = money(subtotal);
      const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
      const pct = Math.min(100, Math.round((subtotal / FREE_SHIPPING_THRESHOLD) * 100));
      $('#drawer-shipping-text').innerHTML = remaining > 0
        ? 'You’re <strong>' + money(remaining) + '</strong> away from free shipping'
        : '🎉 You’ve unlocked <strong>free standard shipping</strong>';
      const bar = $('[data-testid="cart-drawer-shipping-progress"]', d);
      bar.setAttribute('aria-valuenow', String(pct));
      $('.progress-bar', bar).style.width = pct + '%';
    },
  };

  function initDrawer() {
    const d = $('#cart-drawer');
    $('#header-cart-btn').addEventListener('click', () => Drawer.open());
    $('#cart-drawer-close').addEventListener('click', () => Drawer.close());
    $('#cart-drawer-continue').addEventListener('click', () => Drawer.close());
    $('#cart-drawer-backdrop').addEventListener('click', () => Drawer.close());
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') Drawer.close(); });
    $('#cart-drawer-lines').addEventListener('click', (e) => {
      const b = e.target.closest('[data-drawer]');
      if (!b) return;
      const key = b.closest('[data-key]').dataset.key;
      const line = Cart.items().find((l) => l.key === key);
      if (!line) return;
      if (b.dataset.drawer === 'inc') Cart.setQty(key, line.qty + 1);
      if (b.dataset.drawer === 'dec') Cart.setQty(key, line.qty - 1);
      if (b.dataset.drawer === 'remove') { Cart.remove(key); toast(getProduct(line.id).name + ' removed from cart', 'info'); }
    });
    document.addEventListener('cart:change', () => { if (d.classList.contains('is-open')) Drawer.render(); });
  }

  // ---- Cookie consent ------------------------------------------------------

  function initCookies() {
    const banner = $('#cookie-banner');
    const modal = $('#cookie-modal');
    const save = (value) => {
      store.set(KEYS.consent, value);
      banner.hidden = true;
      document.body.classList.remove('has-cookie-banner');
    };
    if (!store.get(KEYS.consent, null)) {
      banner.hidden = false;
      document.body.classList.add('has-cookie-banner');
    }
    $('#cookie-accept').addEventListener('click', () => { save({ analytics: true, marketing: true, choice: 'accepted' }); toast('Cookie preferences saved', 'success'); });
    $('#cookie-reject').addEventListener('click', () => { save({ analytics: false, marketing: false, choice: 'rejected' }); toast('Only essential cookies will be used', 'info'); });
    const openPrefs = () => {
      const c = store.get(KEYS.consent, {}) || {};
      $('#cookie-analytics').checked = Boolean(c.analytics);
      $('#cookie-marketing').checked = Boolean(c.marketing);
      modal.returnValue = '';
      modal.showModal();
    };
    $('#cookie-manage').addEventListener('click', openPrefs);
    $('#cookie-preferences-link').addEventListener('click', openPrefs);
    modal.addEventListener('close', () => {
      if (modal.returnValue !== 'save') return;
      save({ analytics: $('#cookie-analytics').checked, marketing: $('#cookie-marketing').checked, choice: 'custom' });
      toast('Cookie preferences saved', 'success');
    });
  }

  // ---- Header behaviour ----------------------------------------------------

  function initHeader() {
    const nav = $('#main-nav');
    const toggle = $('#menu-toggle');
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });

    // Hover menus that also open on click / keyboard (mega menu + account menu).
    $$('.nav-item.has-mega, .nav-item.has-dropdown').forEach((item) => {
      const btn = $('button[aria-haspopup]', item);
      let closeTimer;
      const set = (open) => {
        item.classList.toggle('is-open', open);
        btn.setAttribute('aria-expanded', String(open));
      };
      item.addEventListener('mouseenter', () => { clearTimeout(closeTimer); set(true); });
      item.addEventListener('mouseleave', () => { closeTimer = setTimeout(() => set(false), 150); });
      // A mouse user has already opened it on hover, so a click shouldn't close it again.
      btn.addEventListener('click', () => set(item.matches(':hover') || !item.classList.contains('is-open')));
      item.addEventListener('focusout', (e) => { if (e.relatedTarget && !item.contains(e.relatedTarget)) set(false); });
      item.addEventListener('keydown', (e) => { if (e.key === 'Escape') { set(false); btn.focus(); } });
      document.addEventListener('click', (e) => { if (!item.contains(e.target)) set(false); });
    });

    $('#logout-btn').addEventListener('click', () => Auth.logout());
    $('#reset-demo-state').addEventListener('click', resetDemoState);

    // Global product search with suggestions.
    createCombobox({
      input: $('#header-search-input'),
      listbox: $('#header-search-listbox'),
      testid: 'header-search',
      minChars: 1,
      limit: 8,
      options: () => Products.visible().map((p) => ({
        value: String(p.id), label: p.name, meta: money(p.price), icon: p.emoji,
        keywords: [p.vendor, CATEGORY_LABELS[p.category], p.tags.join(' ')].join(' '),
      })),
      onSelect: (o) => { if (o) location.href = 'product-detail.html?id=' + o.value; },
      onEnterFreeText: (text) => { location.href = 'index.html?q=' + encodeURIComponent(text) + '#catalog'; },
    });

    // "/" focuses search (unless typing in a field).
    document.addEventListener('keydown', (e) => {
      if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.target.closest && e.target.closest('input, textarea, select, [contenteditable="true"]')) return;
      e.preventDefault();
      $('#header-search-input').focus();
    });

    // Back to top button appears after scrolling.
    const top = document.createElement('button');
    top.type = 'button';
    top.className = 'back-to-top';
    top.id = 'back-to-top';
    top.dataset.testid = 'back-to-top';
    top.setAttribute('aria-label', 'Back to top');
    top.textContent = '↑';
    top.hidden = true;
    document.body.appendChild(top);
    top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    window.addEventListener('scroll', () => { top.hidden = window.scrollY < 700; }, { passive: true });
  }

  function renderShell() {
    const page = document.body.dataset.page;
    const session = Auth.session();
    const headerSlot = $('#app-header');
    const footerSlot = $('#app-footer');
    if (footerSlot) footerSlot.outerHTML = footerHtml();
    if (!headerSlot) return;
    headerSlot.outerHTML = headerHtml(page, session);
    document.body.insertAdjacentHTML('beforeend', drawerHtml() + cookieHtml());
    initHeader();
    initDrawer();
    initCookies();
    updateBadges(false);
    document.addEventListener('cart:change', () => updateBadges(true));
    document.addEventListener('wishlist:change', () => updateBadges(false));

    // Stop the browser from navigating to a file dropped outside an upload zone.
    ['dragover', 'drop'].forEach((type) => window.addEventListener(type, (e) => {
      if (e.dataTransfer && Array.from(e.dataTransfer.types || []).includes('Files')) e.preventDefault();
    }));

    // Cross-tab sync: cart/wishlist badges and sign-out.
    window.addEventListener('storage', (e) => {
      if (e.key === KEYS.session && !Auth.session()) { location.replace('login.html?loggedOut=1'); return; }
      if (e.key === KEYS.cart || e.key === null) { updateBadges(false); emit('cart:change'); }
      if (e.key === KEYS.wishlist) { updateBadges(false); emit('wishlist:change'); }
      if (e.key === KEYS.orders) emit('orders:change');
    });
  }

  /** <shop-newsletter>: footer signup in an open shadow root. */
  if (window.customElements && !customElements.get('shop-newsletter')) {
    customElements.define('shop-newsletter', class extends HTMLElement {
      connectedCallback() {
        if (this.shadowRoot) return;
        const root = this.attachShadow({ mode: 'open' });
        root.innerHTML =
          '<style>' +
          ':host{display:block;margin-top:1rem}' +
          'form{display:flex;gap:6px;flex-wrap:wrap}' +
          'label{width:100%;font-size:13px;font-weight:600;color:var(--text,#111)}' +
          'input{flex:1;min-width:160px;padding:10px 14px;border:1px solid var(--border-strong,#ccc);border-radius:999px;font:inherit;background:var(--surface,#fff);color:var(--text,#111)}' +
          'button{padding:10px 18px;border:0;border-radius:999px;background:var(--primary,#111);color:var(--primary-fg,#fff);font:inherit;font-weight:600;cursor:pointer}' +
          'p{margin:6px 0 0;font-size:13px;min-height:18px;width:100%}.ok{color:var(--success,green)}.err{color:var(--danger,red)}' +
          '</style>' +
          '<form id="sd-form" novalidate part="form">' +
          '<label for="sd-email">Get 20% off your first order</label>' +
          '<input id="sd-email" type="email" placeholder="you@example.com" data-testid="shadow-email-input" aria-label="Newsletter email">' +
          '<button type="submit" id="sd-submit" data-testid="shadow-submit-btn">Subscribe</button>' +
          '<p id="sd-msg" role="status" data-testid="shadow-message"></p>' +
          '</form>';
        const input = root.getElementById('sd-email');
        const msg = root.getElementById('sd-msg');
        root.getElementById('sd-form').addEventListener('submit', (e) => {
          e.preventDefault();
          const ok = EMAIL_RE.test(input.value.trim());
          msg.className = ok ? 'ok' : 'err';
          msg.textContent = ok ? 'Subscribed ' + input.value.trim() + ' ✓ Use code WELCOME20.' : 'Please enter a valid email.';
        });
      }
    });
  }

  // ==========================================================================
  // Public namespace + boot
  // ==========================================================================

  Object.assign(SL, {
    version: '2.0.0',
    // data
    CATEGORY_LABELS, CATEGORY_EMOJI, PRODUCTS, COUNTRIES, PROMOS, SHIPPING_RATES, SHIPPING_LABELS, FREE_SHIPPING_THRESHOLD,
    TAX_RATE, PERSONALIZATION_FEE, CARRIERS, ORDER_STATUS, KEYS, DEMO_PASSWORD,
    // utils
    $, $$, round2, money, clamp, wait, param, esc, stars, today, fmtDate, fmtDateTime, plural, EMAIL_RE, store, emit,
    // state
    Products, getProduct, productImage, reviewsFor, Auth, safeRedirect, Cart, lineMeta, Wishlist, Orders, Profile, Recent,
    carrierName, resetDemoState,
    // ui
    toast, setBusy, statusBadge, downloadFile, buildPdf, invoiceCsv, receiptPdf, downloadInvoice, downloadReceipt,
    formatCardNumber, formatExpiry, formatPhone, cardBrand, luhn, expiryError,
    makeSortable, makeDropZone, createCombobox, createUploader, createDataTable, attachContextMenu, initTabs,
    productCardHtml, bindCardWishlist, Drawer,
    // test helpers
    products: PRODUCTS,
    cart: Cart,
    reset: resetDemoState,
    login(user = 'standard_user') { return Auth.start(user, false); },
    logout() { Auth.logout(); },
    seedCart(items) { Cart.save((items || [{ id: 1, qty: 1 }, { id: 4, qty: 2 }]).map((i) => Object.assign({ key: i.id + '||' }, i))); },
  });

  function boot() {
    renderShell();
    const init = SL.pages[document.body.dataset.page];
    if (init) init();
    document.body.dataset.ready = 'true'; // tests can wait for body[data-ready="true"]
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
