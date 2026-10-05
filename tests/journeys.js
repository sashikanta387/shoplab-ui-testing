/*
 * ShopLab end-to-end business journeys (plain Playwright script, no test runner needed).
 *
 *   npm i -D playwright && npx playwright install chromium
 *   node tests/journeys.js                                           # runs against the local files
 *   ROOT=https://<user>.github.io/<repo>/ node tests/journeys.js     # or against a deployed copy
 *
 * Journeys: register → shop (prescription + personalised items) → checkout (promo, terms,
 * iframe gateway) → track → admin fulfils & edits catalog → customer returns → admin rejects.
 */
const { chromium } = require('playwright');
const fs = require('fs');
const os = require('os');
const path = require('path');
const { pathToFileURL } = require('url');
const ROOT = process.env.ROOT || pathToFileURL(path.resolve(__dirname, '..')).href + '/';
const OUT = fs.mkdtempSync(path.join(os.tmpdir(), 'shoplab-e2e-'));
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8DwHwAFBQIAX8jx0gAAAABJRU5ErkJggg==', 'base64');

const results = [];
let failed = 0;
const dialogQueue = [];
async function step(name, fn) {
  dialogQueue.length = 0;
  try { await fn(); results.push('PASS  ' + name); }
  catch (e) { failed++; results.push('FAIL  ' + name + '  →  ' + e.message.split('\n').filter((l) => !/^\s*$/.test(l)).slice(0, 6).join(' | ')); }
}
const eq = (a, b, m) => { if (a !== b) throw new Error(m + ': expected ' + JSON.stringify(b) + ', got ' + JSON.stringify(a)); };
async function text(loc, expected, timeout = 5000) {
  const t0 = Date.now(); let last;
  while (Date.now() - t0 < timeout) {
    last = ((await loc.textContent()) || '').trim();
    if (expected instanceof RegExp ? expected.test(last) : last === expected) return last;
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error('text: expected ' + expected + ', got ' + JSON.stringify(last));
}
const nextWeekday = () => { const d = new Date(Date.now() + 3 * 86400000); while (d.getDay() === 0) d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };
const nextSunday = () => { const d = new Date(Date.now() + 86400000); while (d.getDay() !== 0) d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); };

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ acceptDownloads: true, viewport: { width: 1360, height: 900 } });
  const errors = [];
  context.on('page', (p) => {
    p.on('pageerror', (e) => errors.push(p.url().split('/').pop() + ' :: ' + e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/fonts\.g/.test(m.text())) errors.push(p.url().split('/').pop() + ' :: ' + m.text()); });
  });
  const page = await context.newPage();
  page.on('dialog', (d) => (dialogQueue.shift() || ((x) => x.accept()))(d).catch(() => {}));
  const t = (id) => page.getByTestId(id);
  async function login(user, password = user === 'ada_l' ? 'Engine#1843' : 'ShopLab@123') {
    await page.goto(ROOT + 'login.html');
    await t('login-username-input').fill(user);
    await t('login-password-input').fill(password);
    await t('login-submit-btn').click();
    await page.waitForURL(/index\.html/, { timeout: 8000 });
  }
  async function logout() {
    await t('header-account-btn').hover();
    await t('header-logout-btn').click();
    await page.waitForURL(/login\.html\?loggedOut=1/);
  }

  // ====================== Journey 1: new customer registers ======================
  await step('J1 anonymous → redirected to login', async () => {
    await page.goto(ROOT + 'index.html');
    await page.waitForURL(/login\.html\?redirect=index\.html/);
  });
  await step('J1 register: validation then create account', async () => {
    await t('auth-tab-register').click();
    await t('register-submit-btn').click();
    await text(t('register-name-error'), 'Enter your full name.');
    await text(t('register-terms-error'), 'You must accept the Terms of Service.');
    await t('register-name-input').fill('Ada Lovelace');
    await t('register-email-input').fill('ada@example.com');
    await t('register-username-input').fill('standard_user');
    await t('register-password-input').fill('weak');
    await t('register-submit-btn').click();
    await text(t('register-username-error'), 'That username is already taken.');
    await t('register-username-input').fill('ada_l');
    await t('register-password-input').fill('Engine#1843');
    await text(t('register-password-strength-label'), 'Strong');
    await t('register-confirm-input').fill('Engine#1843');
    await t('register-dob-input').fill('1990-12-10');
    await t('register-terms-checkbox').check();
    await t('register-submit-btn').click();
    await text(t('login-info-banner'), 'Account created for ada_l — please sign in.', 4000);
    eq(await t('login-username-input').inputValue(), 'ada_l', 'prefilled username');
  });
  await step('J1 sign in as new user + cookie banner', async () => {
    await t('login-password-input').fill('Engine#1843');
    await t('login-submit-btn').click();
    await page.waitForURL(/index\.html$/);
    await t('cookie-banner').waitFor();
    await t('cookie-manage-btn').click();
    await t('cookie-analytics-switch').check();
    await t('cookie-save-btn').click();
    await t('cookie-banner').waitFor({ state: 'hidden' });
    await text(t('header-username'), 'ada_l');
  });
  await page.screenshot({ path: path.join(OUT, 'e2e-home.png') });

  await step('J1 header search combobox → glasses PDP', async () => {
    await page.keyboard.press('/');
    await page.keyboard.type('glass');
    await t('header-search-option').first().waitFor();
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    await page.waitForURL(/product-detail\.html\?id=13/);
  });
  await step('J1 prescription required: validation then upload', async () => {
    await t('pdp-add-to-cart').click();
    await text(t('pdp-variant-error'), 'Please select an option.');
    await text(t('pdp-prescription-file-error'), 'Please upload your prescription (JPG, PNG or PDF).');
    await t('pdp-variant-select').selectOption('Progressive');
    await t('prescription-upload-input').setInputFiles({ name: 'rx.pdf', mimeType: 'application/pdf', buffer: Buffer.from('%PDF-1.4') });
    await t('prescription-upload-preview-pdf-icon').waitFor();
    await t('pdp-prescription-date').fill(new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10));
    await t('pdp-prescription-pd').fill('63');
    await t('pdp-add-to-cart').click();
    await t('cart-drawer').locator('[data-testid="cart-drawer-line"]').first().waitFor();
    await text(t('cart-drawer-line-meta').first(), /Prescription: rx\.pdf/);
    await t('cart-drawer-close').click();
  });
  await step('J1 personalised shirt via mega menu (hover)', async () => {
    await t('nav-categories-btn').hover();
    await t('mega-menu-fashion').click();
    await page.waitForURL(/category=fashion/);
    await page.locator('#product-card-6 [data-testid="product-title-link"]').click();
    await t('pdp-variant-select').selectOption('M');
    await page.getByTestId('pdp-color-option').nth(1).check();
    await text(t('pdp-color-name'), 'Sage');
    await t('pdp-personalization-toggle').check();
    await text(t('pdp-price'), '$54.00');
    await t('pdp-add-to-cart').click();
    await text(t('pdp-personalization-error'), /Upload a design or enter custom text/);
    await t('personalization-upload-input').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: PNG });
    await t('personalization-upload-preview-thumbnail').waitFor();
    await t('pdp-personalization-text').fill('ADA 1843');
    await t('pdp-add-to-cart').click();
    await t('cart-drawer').locator('[data-testid="cart-drawer-line"]').nth(1).waitFor();
    await text(t('header-cart-count'), '2');
  });
  await step('J1 PDP extras: zoom, size guide, share popup, reviews, recommendations', async () => {
    await t('cart-drawer-close').click();
    await t('cart-drawer-backdrop').waitFor({ state: 'hidden' });
    await t('pdp-gallery-main').dblclick({ position: { x: 100, y: 100 } });
    eq(await t('pdp-gallery-main').getAttribute('data-zoomed'), 'true', 'zoomed');
    await page.keyboard.press('Escape');
    await t('pdp-size-guide-link').click();
    await t('size-guide-table').waitFor();
    await t('size-guide-close').click();
    await t('pdp-share-btn').click();
    await t('pdp-share-popup').waitFor({ state: 'visible', timeout: 3000 });
    const [popup] = await Promise.all([page.waitForEvent('popup', { timeout: 5000 }), t('pdp-share-popup').click({ timeout: 5000 })]);
    await popup.getByTestId('pdp-title').waitFor();
    await popup.close();
    await t('pdp-tab-reviews').click();
    await t('review-sort-select').selectOption('lowest');
    await t('review-star-5').click();
    await t('review-name-input').fill('Ada');
    await t('review-comment-input').fill('Lovely fabric and the print came out great.');
    await t('review-submit').click();
    await t('review-success').waitFor();
    await page.locator('#recommendations[data-state="ready"]').waitFor({ timeout: 4000 });
  });
  await step('J1 out-of-stock → notify me', async () => {
    await page.goto(ROOT + 'product-detail.html?id=7');
    if (!(await t('pdp-add-to-cart').isDisabled())) throw new Error('add should be disabled');
    await t('pdp-notify-email').fill('ada@example.com');
    await t('pdp-notify-submit').click();
    await t('pdp-notify-success').waitFor({ timeout: 4000 });
  });

  // Catalog features
  await step('J1 catalog: carousel, countdown, tiles, chips, load more, quick view', async () => {
    await page.goto(ROOT + 'index.html');
    await t('carousel-next').click();
    eq(await t('hero-carousel').getAttribute('data-active-index'), '1', 'slide');
    await t('carousel-dot').nth(2).click();
    eq(await t('hero-carousel').getAttribute('data-active-index'), '2', 'slide dot');
    const s1 = await t('deal-countdown').getAttribute('data-remaining');
    await page.waitForTimeout(1200);
    if (Number(await t('deal-countdown').getAttribute('data-remaining')) >= Number(s1)) throw new Error('countdown not ticking');
    await page.locator('[data-testid="catalog-product-grid"][data-state="ready"]').waitFor();
    await text(t('catalog-results-count'), 'Showing 8 of 13 products');
    await t('catalog-load-more').click();
    await text(t('catalog-results-count'), 'Showing 13 of 13 products', 4000);
    await t('category-tile-electronics').click();
    await text(t('catalog-results-count'), 'Showing 4 of 4 products');
    await t('catalog-tag-sale').check();
    eq(await t('active-filter-chip').count(), 2, 'chips');
    await t('active-filters-clear-all').click();
    await text(t('catalog-results-count'), 'Showing 8 of 13 products');
    await page.locator('#product-card-5').hover();
    await page.locator('#product-card-5 [data-testid="product-quick-view"]').click();
    await t('quick-view-variant-select').selectOption('750 ml');
    await t('quick-view-qty-increment').click();
    await t('quick-view-add-to-cart').click();
    await t('cart-drawer').locator('[data-testid="cart-drawer-line"]').nth(2).waitFor();
    await text(t('header-cart-count'), '4');
    await text(t('cart-drawer-shipping-text'), /free standard shipping/);
    await t('cart-drawer-close').click();
  });
  await step('J1 wishlist: hearts + account drag-to-cart + reorder', async () => {
    for (const id of [1, 2, 8]) await page.locator('#product-card-' + id + ' [data-testid="product-wishlist-toggle"]').click();
    await text(t('header-wishlist-count'), '3');
    await t('header-wishlist-link').click();
    await page.waitForURL(/account\.html#wishlist/);
    await text(t('wishlist-order'), 'Aurora Wireless Headphones > Nimbus Smart Watch > Barista Pour-Over Kettle');
    await page.locator('#wishlist-item-8').dragTo(page.locator('#wishlist-item-1'), { targetPosition: { x: 40, y: 5 } });
    await text(t('wishlist-order'), /^Barista Pour-Over Kettle > /);
    await page.locator('#wishlist-item-2').dragTo(t('wishlist-cart-dropzone'));
    await text(t('wishlist-dropzone-text'), 'Added Nimbus Smart Watch ✓');
    await text(t('header-cart-count'), '5');
    await t('wishlist-item-down').first().click();
    await text(t('wishlist-order'), 'Aurora Wireless Headphones > Barista Pour-Over Kettle');
  });

  // ====================== Checkout ======================
  await step('J1 checkout: cart lines, reorder, clear-cart dismiss', async () => {
    await page.goto(ROOT + 'checkout.html');
    eq(await t('cart-item').count(), 4, 'cart lines');
    dialogQueue.push((d) => d.dismiss());
    await t('cart-clear-btn').click();
    eq(await t('cart-item').count(), 4, 'still 4');
    const first = await t('cart-item-name').first().textContent();
    await t('cart-item-move-down').first().click();
    eq(await t('cart-item-name').nth(1).textContent(), first, 'moved down');
  });
  await step('J1 checkout: promo spinner + discount', async () => {
    await t('promo-code-input').fill('WELCOME20');
    await t('promo-apply-btn').click();
    await t('promo-loading').waitFor();
    await t('promo-success-banner').waitFor({ timeout: 4000 });
    await text(t('cart-discount'), /^−\$/);
  });
  await step('J1 checkout: form, combobox, delivery date (Sunday rejected), prompt/alert', async () => {
    eq(await t('checkout-fullname-input').inputValue(), 'Ada Lovelace', 'name prefilled from profile');
    await t('checkout-address-input').fill('12 St James Square');
    await t('checkout-city-input').fill('London');
    await t('checkout-postal-input').fill('SW1Y 4JH');
    await t('country-combobox-input').fill('king');
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('Enter');
    eq(await t('country-combobox-value').inputValue(), 'United Kingdom', 'country');
    await t('checkout-shipping-express').check();
    await t('checkout-delivery-date').fill(nextSunday());
    await t('checkout-delivery-date').blur();
    await text(t('checkout-delivery-date-error'), 'We don’t deliver on Sundays.');
    await t('checkout-delivery-date').fill(nextWeekday());
    await t('checkout-delivery-date').blur();
    await text(t('checkout-delivery-date-error'), '');
    dialogQueue.push((d) => d.accept('Happy birthday!'));
    await t('checkout-gift-message-btn').click();
    await text(t('checkout-gift-message-value'), 'Happy birthday!');
  });
  await step('J1 checkout: terms dialog unlocks after scroll', async () => {
    if (!(await t('checkout-place-order').isDisabled())) throw new Error('should be disabled');
    await t('checkout-terms-link').click();
    if (!(await t('terms-accept-btn').isDisabled())) throw new Error('accept should start disabled');
    await t('terms-end').scrollIntoViewIfNeeded();
    await page.locator('[data-testid="terms-accept-btn"]:enabled').waitFor();
    await t('terms-accept-btn').click();
    if (!(await t('checkout-terms-checkbox').isChecked())) throw new Error('terms not checked');
  });
  await step('J1 checkout: gateway iframe pay + confirm order', async () => {
    await t('checkout-payment-gateway').check();
    const gw = page.frameLocator('[data-testid="payment-gateway-iframe"]');
    await text(gw.getByTestId('gateway-amount'), (await t('cart-total').textContent()).trim());
    await gw.getByTestId('gateway-card-input').fill('4000000000000002');
    await gw.getByTestId('gateway-expiry-input').fill('1230');
    await gw.getByTestId('gateway-cvc-input').fill('123');
    await gw.getByTestId('gateway-authorize-btn').click();
    await page.locator('[data-testid="checkout-gateway-status"][data-status="declined"]').waitFor({ timeout: 4000 });
    await gw.getByTestId('gateway-card-input').fill('4242424242424242');
    await gw.getByTestId('gateway-authorize-btn').click();
    await page.locator('[data-testid="checkout-gateway-status"][data-status="authorized"]').waitFor({ timeout: 4000 });
    await t('checkout-place-order').click();
    await t('confirm-order-modal').waitFor();
    eq(await t('confirm-order-line').count(), 4, 'confirm lines');
    await t('confirm-order-submit').click();
    await t('order-success-banner').waitFor({ timeout: 5000 });
    await text(t('header-cart-count'), '0');
    const [csv] = await Promise.all([page.waitForEvent('download'), t('order-download-invoice-csv').click()]);
    const p = path.join(OUT, 'e2e-invoice.csv'); await csv.saveAs(p);
    if (!/Prescription: rx\.pdf/.test(fs.readFileSync(p, 'utf8'))) throw new Error('invoice missing prescription line');
  });
  let orderId;
  await step('J1 track order: timeline + tracking iframe (nested map)', async () => {
    orderId = (await t('order-id').textContent()).trim();
    await t('order-view-details').click();
    await page.waitForURL(/order\.html\?id=/);
    await page.locator('[data-testid="order-timeline-step"][data-step="processing"].is-current').waitFor();
    const tk = page.frameLocator('[data-testid="tracking-iframe"]');
    await text(tk.getByTestId('tracking-status'), 'Label created — awaiting pickup');
    await tk.frameLocator('[data-testid="tracking-map-iframe"]').getByTestId('map-truck').waitFor();
    if (await t('order-cancel-btn').isHidden()) throw new Error('cancel should show');
  });
  await step('J1 account orders table shows order + logout', async () => {
    await page.goto(ROOT + 'account.html#orders');
    await text(t('orders-summary'), 'Showing 1–1 of 1 · Page 1 of 1');
    await text(t('orders-status-badge').first(), 'Processing');
    await logout();
  });

  // ====================== Journey 2: admin fulfils ======================
  await step('J2 admin: fulfil order (carrier select, tracking), then deliver', async () => {
    await login('admin_user');
    await t('header-account-btn').hover();
    await t('account-menu-admin').click();
    await page.waitForURL(/admin\.html/);
    await t('admin-tab-orders').click();
    await t('admin-orders-search-input').fill(orderId);
    await t('admin-orders-fulfil').click();
    await t('fulfil-submit-btn').click();
    await text(t('fulfil-carrier-error'), 'Choose a carrier.');
    await t('fulfil-carrier-select').selectOption({ label: 'DHL Express' });
    eq(/^JD\d{12}$/.test(await t('fulfil-tracking-input').inputValue()), true, 'tracking generated');
    await t('fulfil-submit-btn').click();
    await text(t('admin-orders-status').first(), 'Shipped', 4000);
    await t('admin-orders-deliver').click();
    await text(t('admin-orders-status').first(), 'Delivered');
  });
  await step('J2 admin: edit price inline, archive via context menu', async () => {
    await t('admin-tab-products').click();
    await t('admin-products-search-input').fill('Smart Watch');
    await t('admin-products-edit').click();
    await t('admin-products-edit-price').fill('199');
    await t('admin-products-save').click();
    await text(t('admin-products-cell-price').first(), '$199.00');
    await t('admin-products-search-input').fill('Pillow');
    await t('admin-products-row').first().click({ button: 'right' });
    dialogQueue.push((d) => d.accept());
    await t('admin-products-context-menu-item-archive').click();
    await text(t('admin-products-status').first(), 'Archived');
    const [csv] = await Promise.all([page.waitForEvent('download'), t('admin-products-export-csv').click()]);
    if (!/products-.*\.csv/.test(csv.suggestedFilename())) throw new Error('csv name');
  });
  await step('J2 store reflects admin changes', async () => {
    await page.goto(ROOT + 'index.html');
    await page.locator('[data-state="ready"]').waitFor();
    await text(page.locator('#product-card-2 [data-testid="product-price"]'), '$199.00');
    await t('catalog-load-more').click();
    await text(t('catalog-results-count'), 'Showing 12 of 12 products', 4000);
    eq(await page.locator('#product-card-9').count(), 0, 'pillow hidden');
    await logout();
  });

  // ====================== Journey 3: customer returns ======================
  await step('J3 customer: tracking refresh shows Delivered', async () => {
    await login('ada_l');
    await page.goto(ROOT + 'order.html?id=' + orderId);
    const tk = page.frameLocator('[data-testid="tracking-iframe"]');
    await text(tk.getByTestId('tracking-status'), 'Delivered');
    await tk.getByTestId('tracking-refresh-btn').click();
    await text(tk.getByTestId('tracking-refresh-btn'), 'Checking…');
    await text(tk.getByTestId('tracking-refresh-btn'), 'Refresh status', 4000);
    eq(await tk.getByTestId('tracking-carrier').textContent(), 'DHL Express', 'carrier');
  });
  await step('J3 customer: return with photo (damaged) → RMA', async () => {
    await t('order-request-return').click();
    await page.waitForURL(/account\.html\?order=.*#returns/);
    await t('return-item-checkbox').first().check();
    await t('return-reason-select').selectOption('damaged');
    await t('return-submit-btn').click();
    await text(t('return-photos-error'), 'Upload at least one photo showing the damage.');
    await t('return-photo-input').setInputFiles([{ name: 'box.png', mimeType: 'image/png', buffer: PNG }, { name: 'bad.exe', mimeType: 'application/octet-stream', buffer: Buffer.from('MZ') }]);
    await t('return-photo-error').waitFor();
    eq(await t('return-photo-preview-item').count(), 1, 'one photo');
    await t('return-refund-credit').check();
    await t('return-submit-btn').click();
    await t('return-confirm-submit').click();
    await t('return-success').waitFor({ timeout: 4000 });
    await text(t('return-status').first(), 'Awaiting review');
    await logout();
  });
  await step('J4 admin rejects return via prompt(); customer sees note', async () => {
    await login('admin_user');
    await page.goto(ROOT + 'admin.html#returns');
    dialogQueue.push((d) => d.accept('Item shows normal wear'));
    await t('admin-returns-reject').click();
    await text(t('admin-returns-status').first(), 'Rejected');
    await logout();
    await login('ada_l');
    await page.goto(ROOT + 'account.html#returns');
    await text(t('return-decision-note').first(), 'Note from store: Item shows normal wear');
  });

  // ====================== Journey 5: seeded data + table features ======================
  await step('J5 admin seeds orders; customer table sort/filter/paginate + cancel confirm', async () => {
    await logout();
    await login('admin_user');
    await page.goto(ROOT + 'admin.html');
    await t('admin-seed-orders-btn').click();
    await text(t('admin-kpi-orders-value'), '13', 4000);
    await t('admin-orders-pending-count').waitFor();
    await logout();
    await login('standard_user');
    await page.goto(ROOT + 'account.html#orders');
    await text(t('orders-summary'), 'Showing 1–5 of 12 · Page 1 of 3');
    await t('orders-page-next').click();
    await text(t('orders-summary'), 'Showing 6–10 of 12 · Page 2 of 3');
    await t('orders-filter-status').selectOption('processing');
    await text(t('orders-summary'), 'Showing 1–3 of 3 · Page 1 of 1');
    await t('orders-sort-total').click();
    dialogQueue.push((d) => d.accept());
    await t('orders-cancel-btn').first().click();
    await text(t('orders-summary'), 'Showing 1–2 of 2 · Page 1 of 1');
    const [dl] = await Promise.all([page.waitForEvent('download'), t('orders-invoice-btn').first().click()]);
    if (!/invoice-SL-/.test(dl.suggestedFilename())) throw new Error('invoice');
  });
  await step('J5 profile save + delete-data prompt mismatch alert', async () => {
    await t('account-tab-profile').click();
    await t('profile-phone-input').pressSequentially('5551234567');
    await t('profile-interests-select').selectOption(['books', 'electronics']);
    await t('profile-contact-sms').check();
    await t('profile-newsletter-switch').check();
    await t('profile-save-btn').click();
    await text(t('profile-saved-text'), '✓ Saved', 3000);
    let alertMsg = '';
    dialogQueue.push((d) => d.accept('nope'), (d) => { alertMsg = d.message(); return d.accept(); });
    await t('profile-delete-data-btn').click();
    await page.waitForTimeout(300);
    if (!/did not match/.test(alertMsg)) throw new Error('alert: ' + alertMsg);
  });
  await step('Shell: shadow DOM newsletter, back-to-top, customer blocked from admin', async () => {
    await page.goto(ROOT + 'index.html');
    await t('shadow-email-input').fill('ada@example.com');
    await t('shadow-submit-btn').click();
    await text(t('shadow-message'), /Subscribed ada@example.com/);
    await page.evaluate(() => window.scrollTo(0, 2000));
    await t('back-to-top').waitFor();
    await page.goto(ROOT + 'admin.html');
    await t('admin-access-denied').waitFor();
  });
  await step('Mobile: no horizontal overflow on any page', async () => {
    const m = await context.newPage();
    await m.setViewportSize({ width: 375, height: 800 });
    for (const f of ['index.html', 'product-detail.html?id=13', 'checkout.html', 'account.html', 'order.html?id=' + orderId, 'login.html']) {
      await m.goto(ROOT + f);
      await m.waitForTimeout(800);
      const over = await m.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
      if (over > 0) throw new Error(f + ' overflows by ' + over + 'px');
    }
    await m.goto(ROOT + 'index.html');
    await m.waitForTimeout(800);
    await m.screenshot({ path: path.join(OUT, 'e2e-mobile.png') });
    await m.close();
  });

  await browser.close();
  console.log(results.join('\n'));
  console.log('\n' + (results.length - failed) + '/' + results.length + ' passed');
  console.log('ERRORS:', errors.length ? '\n' + errors.join('\n') : 'none');
  console.log('Artifacts (screenshots, downloads):', OUT);
  process.exitCode = failed || errors.length ? 1 : 0;
})();
