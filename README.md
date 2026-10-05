# ShopLab: an e-commerce testbed for UI automation

ShopLab is a static, multi-page e-commerce site built for practising **Playwright**, **Cypress** and **Selenium**. It uses plain HTML, CSS and JavaScript, with no build step and no network calls. It works when you open `index.html` straight from disk (`file://`) and when it is hosted on GitHub Pages.

```
login.html             Dummy sign-in page (the entry point; every other page requires a login)
auth-guard.js          Tiny <head> script that redirects anonymous visitors to login.html
index.html             Catalog: search, filters, product grid, new-tab links
product-detail.html    Product page: gallery, options, tabs, review form, vendor terms
checkout.html          Cart (drag-to-reorder), forms, masks, promo spinner, iframe gateway, <dialog>, downloads
admin-playground.html  Edge cases: upload, downloads, nested iframes, combobox, table, DnD, dialogs, waits, shadow DOM
styles.css             All styles (light and dark via prefers-color-scheme)
app.js                 All behaviour (one classic script; the router uses <body data-page="...">)
```

---

## Run it

| Option | How |
|---|---|
| Open directly | Double-click `index.html`. |
| Local server (recommended for tests) | `npx serve .` or `python3 -m http.server 8080`, then open `http://localhost:8080` |
| GitHub Pages | See below. |

### Enable GitHub Pages

1. Push these files to the **root** of the `main` branch.
2. In the repository, open **Settings → Pages**.
3. Under **Build and deployment**, set **Source: Deploy from a branch**.
4. Set **Branch: `main`** and folder **`/ (root)`**, then click **Save**.
5. After about a minute the site is live at `https://<user>.github.io/<repo>/`.

---

## Login

Every page except `login.html` is protected. Opening any page (including the site root) without a session redirects to `login.html?redirect=<page>`, and a successful login returns you to that page (`index.html` by default).

| Username | Password | Behaviour |
|---|---|---|
| `standard_user` | `ShopLab@123` | Signs in after about 0.8 s |
| `locked_user` | `ShopLab@123` | Error: "Sorry, this user has been locked out." |
| `slow_user` | `ShopLab@123` | Signs in after **4 s** (practise long explicit waits) |
| anything else | — | Error: "Username and password do not match any user in this service." |

* The session is stored in `localStorage` under `shoplab.session`. It is shared with new tabs and windows, the way a cookie would be.
* **Remember me** pre-fills the username on the next visit (`shoplab.rememberedUser`).
* **Log out** (`header-logout-btn`) clears the session and goes to `login.html?loggedOut=1`. Other open tabs are signed out too.
* **Skip the UI login in tests** by seeding the session before the page loads:

```ts
// Playwright
await context.addInitScript(() =>
  localStorage.setItem('shoplab.session', JSON.stringify({ user: 'standard_user' })));
```
```python
# Selenium: open any page on the same origin first, then set the session
driver.get(BASE + "login.html")
driver.execute_script("localStorage.setItem('shoplab.session', JSON.stringify({user:'standard_user'}))")
```

`window.ShopLab.login('standard_user')` and `window.ShopLab.logout()` also work from any page that loads `app.js`. `ShopLab.reset()` clears demo data but keeps you signed in.

---

## Conventions and test helpers

* Every interactive element has a **`data-testid`** in the form `<component>-<action>`, along with a semantic `id`, `name` (form fields) and `aria-label`.
* Repeated items (cards, rows, cart lines) share one `data-testid` and add a **data attribute key**: `data-product-id`, `data-sku` or `data-id`. Each also gets a unique `id`, such as `add-to-cart-3` or `row-SKU-1007`.
* **`body[data-ready="true"]`** is set once page scripts have initialised.
* State attributes to assert on: the grid's `data-state="loading|ready|empty"`, `aria-busy`, `aria-invalid`, `aria-pressed`, `aria-selected`, `aria-sort`, `aria-expanded`, and `data-status` on async results.
* Loading buttons get the class `.is-loading`, `aria-busy="true"` and `disabled`.
* State is stored in `localStorage` (`shoplab.cart`, `shoplab.wishlist`, `shoplab.orders`, `shoplab.inventory`). Reset it with the footer **Reset demo state** button (`footer-reset-state`), or from code:

```js
window.ShopLab.reset();                                   // clear storage and reload
window.ShopLab.seedCart([{ id: 1, qty: 2 }, { id: 4, qty: 1 }]); // pre-fill the cart
```

**Deep links:** `index.html?q=shoes&category=sports` and `product-detail.html?id=3&tab=reviews|terms|description`.

### Test data

| Thing | Value |
|---|---|
| Valid card | `4242 4242 4242 4242`, any future `MM/YY`, any 3-digit CVV |
| Declined card (iframe gateway only) | `4000 0000 0000 0002` |
| Promo codes | `SAVE10` (10% off), `WELCOME20` (20% off, minimum $50), `FREESHIP` (free standard shipping), `EXPIRED` (expired error); anything else returns an invalid error |
| Out-of-stock product | id `7` (Classic Leather Wallet): Add to Cart is disabled |
| Low-stock products | id `3` (3 left), id `12` (2 left): increments are capped at stock |
| Free standard shipping | subtotal ≥ $100 |
| Tax | 8% of (subtotal − discount) |

---

## Component → `data-testid` reference

### Login: `login.html`

| Component | data-testid |
|---|---|
| Card / form | `login-card`, `login-form`, `login-brand` |
| Username | `login-username-input`, `login-username-error` |
| Password and show/hide toggle | `login-password-input`, `login-password-error`, `login-password-toggle` (`aria-pressed`) |
| Remember me / forgot password | `login-remember-checkbox`, `login-forgot-password-link` |
| Submit (`.is-loading` + `aria-busy` while signing in) | `login-submit-btn` |
| Banners | `login-error-banner`, `login-error-text`, `login-error-close`, `login-info-banner` |
| Demo credentials panel | `login-demo-credentials`, `login-demo-user-standard`, `login-demo-user-locked`, `login-demo-user-slow`, `login-demo-password` |

### Shared (all protected pages)

| Component | data-testid |
|---|---|
| Signed-in user / log out | `header-username`, `header-logout-btn` |
| Header / brand link / nav | `site-header`, `header-brand-link`, `header-nav` |
| Mobile menu toggle | `header-menu-toggle` |
| Nav links | `nav-shop-link`, `nav-playground-link`, `nav-cart-link` |
| Cart badge | `header-cart-count` |
| Toasts | `toast-region`, `toast-message` (`data-type="success|error|info"`), `toast-close` |
| Footer reset | `footer-reset-state` |

### Catalog: `index.html`

| Component | data-testid |
|---|---|
| Search (`input[type=search]`) | `catalog-search-input` |
| Category `<select>` | `catalog-category-select` |
| Tag multi-select checkboxes | `catalog-tag-filters`, `catalog-tag-new`, `catalog-tag-sale`, `catalog-tag-bestseller`, `catalog-tag-eco`, `catalog-tag-limited` |
| Price slider (`input[type=range]`) and value | `catalog-price-range`, `catalog-price-range-value` |
| In-stock checkbox | `catalog-in-stock-checkbox` |
| Reset filters | `catalog-reset-filters` |
| Sort `<select>` | `catalog-sort-select` |
| Result count | `catalog-results-count` |
| Grid / loading / empty | `catalog-product-grid` (`data-state`), `catalog-loading`, `catalog-empty-state`, `catalog-empty-reset` |
| Product card | `product-card` (`data-product-id`) |
| Card internals | `product-image-link`, `product-image`, `product-badge`, `product-category`, `product-title-link`, `product-rating`, `product-price`, `product-compare-price`, `product-stock-status`, `product-tags`, `product-tag` |
| Quantity counter | `product-qty`, `product-qty-decrement`, `product-qty-input`, `product-qty-increment` |
| Add to cart | `product-add-to-cart` (`data-state="added"` briefly after success) |
| New-tab links (`target="_blank"`) | `product-reviews-link`, `product-vendor-terms-link` |

### Product detail: `product-detail.html`

| Component | data-testid |
|---|---|
| Not-found state | `pdp-not-found`, `pdp-back-to-shop` |
| Content / breadcrumb | `pdp-content`, `pdp-breadcrumb`, `pdp-breadcrumb-home`, `pdp-breadcrumb-category`, `pdp-breadcrumb-current` |
| Gallery | `pdp-gallery`, `pdp-main-image`, `pdp-thumbnails`, `pdp-thumbnail` (`aria-pressed`) |
| Info | `pdp-category`, `pdp-title`, `pdp-vendor`, `pdp-rating`, `pdp-price`, `pdp-compare-price`, `pdp-stock-status` (`data-stock`), `pdp-short-description` |
| Option `<select>` and error | `pdp-variant-select`, `pdp-variant-error` |
| Colour radios | `pdp-color-options`, `pdp-color-option` |
| Quantity | `pdp-qty`, `pdp-qty-decrement`, `pdp-qty-input`, `pdp-qty-increment` |
| Actions | `pdp-add-to-cart`, `pdp-add-success`, `pdp-wishlist-toggle` (`aria-pressed`), `pdp-go-to-checkout` |
| Tabs | `pdp-tab-description`, `pdp-tab-reviews`, `pdp-tab-terms`, `pdp-panel-description`, `pdp-panel-reviews`, `pdp-panel-terms` |
| Description | `pdp-description`, `pdp-features`, `pdp-feature` |
| Reviews | `pdp-review-count`, `pdp-review-list`, `review-item`, `review-author`, `review-stars`, `review-body` |
| Review form | `review-form`, `review-name-input`, `review-rating`, `review-rating-1..5` (radios), `review-star-1..5` (clickable labels), `review-comment-input`, `review-comment-count`, `review-submit`, `review-success` |
| Review errors | `review-name-error`, `review-rating-error`, `review-comment-error` |
| Vendor terms | `pdp-terms-title`, `pdp-terms-list`, `pdp-terms-item` |

### Checkout: `checkout.html`

| Component | data-testid |
|---|---|
| Form / error summary | `checkout-form`, `checkout-error-summary`, `checkout-error-list`, `checkout-error-item` (`data-field`) |
| Contact | `checkout-fullname-input`, `checkout-email-input`, `checkout-phone-input` (mask `(555) 123-4567`) |
| Address | `checkout-address-input`, `checkout-city-input`, `checkout-postal-input` |
| Country combobox (custom auto-suggest) | `country-combobox`, `country-combobox-input`, `country-combobox-toggle`, `country-combobox-listbox`, `country-combobox-option`, `country-combobox-no-results`, `country-combobox-value` (hidden input) |
| Delivery-slot native `<select>` | `checkout-delivery-slot-select` |
| Shipping radios | `checkout-shipping-methods`, `checkout-shipping-standard`, `checkout-shipping-express`, `checkout-shipping-overnight`, `checkout-shipping-standard-price` |
| Payment method radios | `checkout-payment-methods`, `checkout-payment-card`, `checkout-payment-gateway` |
| Card fields (masked) | `checkout-card-fields`, `checkout-card-name-input`, `checkout-card-number-input`, `checkout-card-brand`, `checkout-card-expiry-input`, `checkout-card-cvv-input` |
| Field errors | `checkout-<field>-error`, e.g. `checkout-email-error`, `checkout-card-number-error`, `checkout-country-error` |
| Gateway iframe (parent side) | `checkout-gateway-fields`, `payment-gateway-iframe`, `checkout-gateway-status` (`data-status="authorized|declined"`), `checkout-gateway-token`, `checkout-gateway-error` |
| Gateway iframe (inside the frame) | `gateway-body`, `gateway-amount`, `gateway-card-input`, `gateway-expiry-input`, `gateway-cvc-input`, `gateway-authorize-btn`, `gateway-message` |
| Extras | `checkout-notes-input`, `checkout-gift-message-btn` (**`prompt()`**), `checkout-gift-message-value`, `checkout-help-alert-btn` (**`alert()`**) |
| Checkboxes | `checkout-newsletter-checkbox`, `checkout-terms-checkbox`, `checkout-terms-link` (new tab) |
| Place order (disabled until terms are checked) | `checkout-place-order` |
| Cart list (drag to reorder) | `checkout-summary`, `cart-list`, `cart-item` (`data-id`, `draggable`), `cart-item-drag-handle`, `cart-item-name`, `cart-item-total` |
| Cart line controls | `cart-item-qty-decrement`, `cart-item-qty-input`, `cart-item-qty-increment`, `cart-item-move-up`, `cart-item-move-down`, `cart-item-remove` |
| Cart actions | `cart-clear-btn` (**`confirm()`**), `cart-empty-state`, `cart-browse-link`, `cart-add-samples` |
| Promo (2 s spinner) | `promo-section`, `promo-code-input`, `promo-apply-btn`, `promo-loading`, `promo-success-banner` (`data-code`), `promo-success-text`, `promo-remove-btn`, `promo-error` |
| Totals | `cart-totals`, `cart-item-count`, `cart-subtotal`, `cart-discount`, `cart-shipping`, `cart-tax`, `cart-total` |
| Confirm `<dialog>` | `confirm-order-modal`, `confirm-order-summary`, `confirm-order-line`, `confirm-order-total`, `confirm-order-processing`, `confirm-order-close`, `confirm-order-cancel`, `confirm-order-submit` |
| Success + downloads | `order-success`, `order-success-title`, `order-success-banner`, `order-id`, `order-total`, `order-email`, `order-download-invoice-csv`, `order-download-receipt-pdf`, `order-continue-shopping` |

### Playground: `admin-playground.html`

| Section | data-testid |
|---|---|
| Section nav | `pg-section-nav`, `pg-nav-upload`, `pg-nav-download`, `pg-nav-iframes`, `pg-nav-dropdowns`, `pg-nav-table`, `pg-nav-dnd`, `pg-nav-alerts`, `pg-nav-waits`, `pg-nav-mouse`, `pg-nav-misc` |
| **File upload** (`.jpg`/`.png`/`.pdf`, ≤5 MB, max 5) | `upload-dropzone`, `upload-input`, `upload-error`, `upload-error-item`, `upload-preview-list`, `upload-preview-item` (`data-file-name`), `upload-preview-thumbnail`, `upload-preview-pdf-icon`, `upload-file-name`, `upload-file-size`, `upload-remove-btn`, `upload-count`, `upload-clear-btn`, `upload-submit-btn`, `upload-progress` (`aria-valuenow`), `upload-success` |
| **Downloads** | `download-invoice-csv`, `download-receipt-pdf`, `download-inventory-json`, `download-static-link`, `download-last-file` |
| **iFrames** (parent) | `currency-converter-iframe`, `converter-parent-result` |
| Converter (inside frame 1) | `converter-body`, `converter-amount-input`, `converter-currency-select`, `converter-convert-btn`, `converter-result`, `rates-ticker-iframe` |
| Ticker (nested frame 2) | `ticker-body`, `ticker-text`, `ticker-refresh-btn`, `ticker-updated` |
| **Dropdowns** | `dropdown-native-select` (optgroups, one disabled option), `dropdown-native-select-output`, `dropdown-multi-select`, `dropdown-multi-select-output` |
| Product combobox | `product-combobox`, `product-combobox-input`, `product-combobox-toggle`, `product-combobox-listbox`, `product-combobox-option`, `product-combobox-no-results`, `product-combobox-output` |
| **Inventory table** (47 rows) | `inventory-table`, `inventory-body`, `inventory-row` (`data-sku`), `inventory-search-input`, `inventory-page-size-select`, `inventory-select-all`, `inventory-row-checkbox`, `inventory-selected-count`, `inventory-bulk-delete` (**`confirm()`**), `inventory-reset`, `inventory-empty` |
| Sort headers (`aria-sort` on `<th>`) | `inventory-sort-sku`, `inventory-sort-name`, `inventory-sort-category`, `inventory-sort-stock`, `inventory-sort-price`, `inventory-sort-updated` |
| Cells | `inventory-cell-sku`, `inventory-cell-name`, `inventory-cell-category`, `inventory-cell-stock`, `inventory-cell-price`, `inventory-cell-status`, `inventory-cell-updated` |
| Row actions | `inventory-row-view`, `inventory-row-edit`, `inventory-row-delete`, `inventory-row-save`, `inventory-row-cancel`, `inventory-edit-name`, `inventory-edit-stock`, `inventory-edit-price` |
| Row dialogs | `inventory-view-modal`, `inventory-view-details`, `inventory-view-<field>` (e.g. `inventory-view-stock`), `inventory-view-close`, `inventory-view-ok`, `inventory-delete-modal`, `inventory-delete-text`, `inventory-delete-cancel`, `inventory-delete-confirm` |
| Pagination | `inventory-pagination`, `inventory-page-first`, `inventory-page-prev`, `inventory-page-number` (`aria-current="page"`), `inventory-page-next`, `inventory-page-last`, `inventory-summary` (`data-total`) |
| **Drag-and-drop wishlist** | `dnd-available-list`, `dnd-wishlist-list`, `dnd-item` (`data-id`, `draggable`), `dnd-item-name`, `dnd-item-add`, `dnd-item-remove`, `dnd-item-up`, `dnd-item-down`, `dnd-available-count`, `dnd-wishlist-count`, `dnd-wishlist-order`, `dnd-reset-btn` |
| **Native dialogs** | `native-alert-btn`, `native-confirm-btn`, `native-prompt-btn`, `native-dialog-result` |
| HTML `<dialog>` | `html-dialog-open-btn`, `html-dialog`, `html-dialog-email-input`, `html-dialog-confirm`, `html-dialog-cancel`, `html-dialog-close`, `html-dialog-result` |
| Div overlay | `overlay-open-btn`, `overlay-modal`, `overlay-accept-btn`, `overlay-reject-btn`, `overlay-result` |
| Toasts | `toast-success-btn`, `toast-error-btn` |
| **Waits** | `delayed-load-btn`, `delayed-spinner`, `delayed-container`, `delayed-content` (appears after 3 s) |
| | `countdown-start-btn`, `countdown-target-btn` (enabled after 5 s), `countdown-output` |
| | `visibility-toggle-btn`, `visibility-target` |
| | `text-change-btn`, `text-change-status` (`data-status="running|completed"`) |
| | `dynamic-id-btn` (random `id` on every load), `dynamic-id-output` |
| | `stale-list`, `stale-item` (`data-render`), `stale-rerender-btn` |
| **Mouse and keyboard** | `hover-target`, `hover-trigger`, `hover-menu`, `hover-menu-item-profile`, `hover-menu-item-orders`, `hover-menu-item-logout`, `hover-output` |
| | `dblclick-target`, `dblclick-output` |
| | `contextmenu-target`, `contextmenu-menu`, `contextmenu-item-copy`, `contextmenu-item-edit`, `contextmenu-item-delete`, `contextmenu-output` |
| | `keypress-input`, `keypress-output` |
| | `scroll-container`, `scroll-target-btn`, `scroll-output` |
| **Shadow DOM** (open root in `<shop-newsletter>`) | `shadow-host`, `shadow-email-input`, `shadow-submit-btn`, `shadow-message` |
| **Windows** | `new-tab-link` (`target="_blank"`), `popup-window-btn` (`window.open`), `pg-reset-all-btn` |

---

## Sample tests

### Playwright (TypeScript)

```ts
// tests/shoplab.spec.ts   (playwright.config: use: { baseURL: 'http://localhost:8080/', testIdAttribute: 'data-testid' })
import { test, expect } from '@playwright/test';

test('login: locked user, then a successful sign-in', async ({ page }) => {
  await page.goto('index.html');                                   // redirected to the login page
  await expect(page).toHaveURL(/login\.html\?redirect=/);
  await page.getByTestId('login-username-input').fill('locked_user');
  await page.getByTestId('login-password-input').fill('ShopLab@123');
  await page.getByTestId('login-submit-btn').click();
  await expect(page.getByTestId('login-error-text')).toHaveText('Sorry, this user has been locked out.');

  await page.getByTestId('login-username-input').fill('standard_user');
  await page.getByTestId('login-password-input').fill('ShopLab@123');
  await page.getByTestId('login-submit-btn').click();
  await expect(page).toHaveURL(/index\.html$/);
  await expect(page.getByTestId('header-username')).toContainText('standard_user');
});

test.describe('signed in', () => {
test.beforeEach(async ({ page, context }) => {
  // Skip the login UI: seed the session (shared by new tabs too), then start clean.
  await context.addInitScript(() => {
    localStorage.setItem('shoplab.session', JSON.stringify({ user: 'standard_user' }));
  });
  await page.goto('index.html');
  await page.evaluate(() => ['shoplab.cart', 'shoplab.wishlist', 'shoplab.orders', 'shoplab.inventory']
    .forEach((k) => localStorage.removeItem(k)));
});

test('filter, add to cart, apply promo, pay through the iframe, download the invoice', async ({ page, context }) => {
  await page.goto('index.html');
  await expect(page.getByTestId('catalog-product-grid')).toHaveAttribute('data-state', 'ready');

  // Filters
  await page.getByTestId('catalog-search-input').fill('headphones');
  await expect(page.getByTestId('product-card')).toHaveCount(1);

  // Quantity counter + add to cart
  const card = page.locator('[data-testid="product-card"][data-product-id="1"]');
  await card.getByTestId('product-qty-increment').click();
  await card.getByTestId('product-add-to-cart').click();
  await expect(page.getByTestId('header-cart-count')).toHaveText('2');

  // Multi-tab: "Read Reviews" opens in a new tab
  const [reviewsTab] = await Promise.all([
    context.waitForEvent('page'),
    card.getByTestId('product-reviews-link').click(),
  ]);
  await expect(reviewsTab.getByTestId('pdp-tab-reviews')).toHaveAttribute('aria-selected', 'true');
  await reviewsTab.close();

  // Checkout
  await page.getByTestId('nav-cart-link').click();
  await page.getByTestId('promo-code-input').fill('SAVE10');
  await page.getByTestId('promo-apply-btn').click();
  await expect(page.getByTestId('promo-loading')).toBeVisible();          // spinner
  await expect(page.getByTestId('promo-success-banner')).toBeVisible({ timeout: 5000 });

  await page.getByTestId('checkout-fullname-input').fill('Ada Lovelace');
  await page.getByTestId('checkout-email-input').fill('ada@example.com');
  await page.getByTestId('checkout-address-input').fill('1 Engine Way');
  await page.getByTestId('checkout-city-input').fill('London');
  await page.getByTestId('checkout-postal-input').fill('NW1 6XE');

  // Custom combobox: type, arrow down, Enter
  await page.getByTestId('country-combobox-input').fill('united k');
  await page.getByTestId('country-combobox-input').press('ArrowDown');
  await page.getByTestId('country-combobox-input').press('Enter');
  await expect(page.getByTestId('country-combobox-input')).toHaveValue('United Kingdom');

  await page.getByTestId('checkout-shipping-express').check();

  // iFrame payment gateway
  await page.getByTestId('checkout-payment-gateway').check();
  const gateway = page.frameLocator('[data-testid="payment-gateway-iframe"]');
  await gateway.getByTestId('gateway-card-input').fill('4242424242424242');
  await gateway.getByTestId('gateway-expiry-input').fill('12/30');
  await gateway.getByTestId('gateway-cvc-input').fill('123');
  await gateway.getByTestId('gateway-authorize-btn').click();
  await expect(page.getByTestId('checkout-gateway-status')).toHaveAttribute('data-status', 'authorized');

  // Terms gate the submit button, then the <dialog> confirmation
  await expect(page.getByTestId('checkout-place-order')).toBeDisabled();
  await page.getByTestId('checkout-terms-checkbox').check();
  await page.getByTestId('checkout-place-order').click();
  await expect(page.getByTestId('confirm-order-modal')).toBeVisible();
  await page.getByTestId('confirm-order-submit').click();
  await expect(page.getByTestId('order-success-banner')).toBeVisible();

  // File download
  const [download] = await Promise.all([
    page.waitForEvent('download'),
    page.getByTestId('order-download-invoice-csv').click(),
  ]);
  expect(download.suggestedFilename()).toMatch(/^invoice-SL-.*\.csv$/);
});

test('playground: native dialogs, upload, drag and drop, table', async ({ page }) => {
  await page.goto('admin-playground.html');

  // Native confirm()
  page.once('dialog', (d) => d.dismiss());
  await page.getByTestId('native-confirm-btn').click();
  await expect(page.getByTestId('native-dialog-result')).toHaveText('Result: confirm dismissed');

  // File upload
  await page.getByTestId('upload-input').setInputFiles('fixtures/design.png');
  await expect(page.getByTestId('upload-preview-thumbnail')).toBeVisible();

  // Drag and drop
  await page.locator('#dnd-item-3').dragTo(page.getByTestId('dnd-wishlist-list'));
  await expect(page.getByTestId('dnd-wishlist-order')).toContainText('Pixel Pro');

  // Sort, paginate, then delete a row through the confirmation dialog
  await page.getByTestId('inventory-sort-price').click();
  await expect(page.locator('th[data-sort-key="price"]')).toHaveAttribute('aria-sort', 'ascending');
  await page.getByTestId('inventory-page-next').click();
  const row = page.locator('[data-testid="inventory-row"][data-sku="SKU-1010"]');
  await page.getByTestId('inventory-search-input').fill('SKU-1010');
  await row.getByTestId('inventory-row-delete').click();
  await page.getByTestId('inventory-delete-confirm').click();
  await expect(row).toHaveCount(0);

  // Shadow DOM (Playwright reaches into open shadow roots automatically)
  await page.getByTestId('shadow-email-input').fill('me@test.io');
  await page.getByTestId('shadow-submit-btn').click();
  await expect(page.getByTestId('shadow-message')).toContainText('Subscribed');
});
});
```

### Selenium (Python)

```python
# pip install selenium pytest
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

BASE = "http://localhost:8080/"
tid = lambda t: (By.CSS_SELECTOR, f'[data-testid="{t}"]')

driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)

try:
    # Login (anonymous visits redirect to login.html)
    driver.get(BASE + "index.html")
    wait.until(EC.visibility_of_element_located(tid("login-form")))
    driver.find_element(*tid("login-username-input")).send_keys("standard_user")
    driver.find_element(*tid("login-password-input")).send_keys("ShopLab@123")
    driver.find_element(*tid("login-submit-btn")).click()
    wait.until(EC.url_contains("index.html"))

    # Catalog: wait for the async grid, filter with a native <select>, add to cart
    driver.get(BASE + "index.html")
    wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, '[data-testid="catalog-product-grid"][data-state="ready"]')))
    Select(driver.find_element(*tid("catalog-category-select"))).select_by_value("sports")
    driver.find_element(By.ID, "add-to-cart-4").click()
    wait.until(EC.text_to_be_present_in_element(tid("header-cart-count"), "1"))

    # Multi-window: Vendor Terms opens in a new tab
    main = driver.current_window_handle
    driver.find_element(By.ID, "terms-link-4").click()
    wait.until(EC.number_of_windows_to_be(2))
    driver.switch_to.window([h for h in driver.window_handles if h != main][0])
    wait.until(EC.visibility_of_element_located(tid("pdp-terms-title")))
    driver.close()
    driver.switch_to.window(main)

    # Checkout: explicit wait for the 2-second promo spinner
    driver.get(BASE + "checkout.html")
    driver.find_element(*tid("promo-code-input")).send_keys("FREESHIP")
    driver.find_element(*tid("promo-apply-btn")).click()
    wait.until(EC.visibility_of_element_located(tid("promo-loading")))
    wait.until(EC.visibility_of_element_located(tid("promo-success-banner")))

    # Native alert()
    driver.find_element(*tid("checkout-help-alert-btn")).click()
    alert = wait.until(EC.alert_is_present())
    print("Alert says:", alert.text)
    alert.accept()

    # Native prompt()
    driver.find_element(*tid("checkout-gift-message-btn")).click()
    prompt = wait.until(EC.alert_is_present())
    prompt.send_keys("Happy birthday!")
    prompt.accept()

    # Masked card input
    card = driver.find_element(*tid("checkout-card-number-input"))
    card.send_keys("4242424242424242")
    assert card.get_attribute("value") == "4242 4242 4242 4242"

    # iFrame: switch in, act, switch back
    driver.find_element(*tid("checkout-payment-gateway")).click()
    driver.switch_to.frame(driver.find_element(*tid("payment-gateway-iframe")))
    driver.find_element(*tid("gateway-card-input")).send_keys("4242424242424242")
    driver.find_element(*tid("gateway-expiry-input")).send_keys("1230")
    driver.find_element(*tid("gateway-cvc-input")).send_keys("123")
    driver.find_element(*tid("gateway-authorize-btn")).click()
    driver.switch_to.default_content()
    wait.until(EC.text_to_be_present_in_element(tid("checkout-gateway-status"), "authorized"))

    # Playground: file upload (send_keys works on the visually hidden file input)
    driver.get(BASE + "admin-playground.html")
    driver.find_element(*tid("upload-input")).send_keys("/absolute/path/to/design.png")
    wait.until(EC.visibility_of_element_located(tid("upload-preview-item")))

    # Nested iframes
    driver.switch_to.frame(driver.find_element(*tid("currency-converter-iframe")))
    driver.switch_to.frame(driver.find_element(*tid("rates-ticker-iframe")))
    driver.find_element(*tid("ticker-refresh-btn")).click()
    driver.switch_to.default_content()

    # Combobox: keyboard selection
    combo = driver.find_element(*tid("product-combobox-input"))
    combo.send_keys("vinyl")
    combo.send_keys(Keys.ARROW_DOWN, Keys.ENTER)
    assert "Vinyl" in driver.find_element(*tid("product-combobox-output")).text

    # Shadow DOM
    host = driver.find_element(*tid("shadow-host"))
    host.shadow_root.find_element(By.CSS_SELECTOR, '[data-testid="shadow-email-input"]').send_keys("me@test.io")
    host.shadow_root.find_element(By.CSS_SELECTOR, '[data-testid="shadow-submit-btn"]').click()
finally:
    driver.quit()
```

> **Selenium and HTML5 drag-and-drop:** `ActionChains.drag_and_drop` does not fire native `dragstart`/`drop` events. Use the fallback buttons (`dnd-item-add`, `dnd-item-up`, `dnd-item-down`, `cart-item-move-up`, `cart-item-move-down`), or simulate the events with `execute_script`. Playwright's `dragTo()` and Cypress with a drag plugin work natively.

### Cypress (quick taste)

```js
cy.visit('/admin-playground.html', {
  onBeforeLoad: (win) => win.localStorage.setItem('shoplab.session', JSON.stringify({ user: 'standard_user' })),
});
cy.get('[data-testid="currency-converter-iframe"]').its('0.contentDocument.body')
  .find('[data-testid="converter-convert-btn"]').click();      // srcdoc frames share the origin, so this works
cy.window().then((win) => cy.stub(win, 'prompt').returns('Cypress'));
cy.get('[data-testid="native-prompt-btn"]').click();
cy.get('[data-testid="native-dialog-result"]').should('have.text', 'Result: prompt returned "Cypress"');
```

---

## Notes

* All product images are generated SVGs and all iframes use `srcdoc`, so the site makes no network requests.
* Simulated latencies, for practising waits: catalog grid 600 ms, add-to-cart 500–600 ms, promo validation **2 s**, gateway authorisation 1.5 s, order processing 1.5 s, delayed element 3 s, countdown 5 s, text change 2 s.
* Cart changes sync across tabs through the `storage` event.
