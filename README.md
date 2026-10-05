# ShopLab: a realistic e-commerce store for end-to-end UI automation

ShopLab is a static, multi-page online store built for practising **Playwright**, **Cypress** and **Selenium**. Every tricky UI pattern (iframes, uploads, downloads, drag and drop, native dialogs, shadow DOM, hover menus, waits and so on) appears inside a **real business journey**, so you can write end-to-end tests that read like user stories rather than isolated widget checks.

It uses plain HTML, CSS and JavaScript, with no build step and no network calls. It works from `file://` and on GitHub Pages.

**Live demo:** https://sashikanta387.github.io/shoplab-ui-testing/

```
login.html            Sign in / create account (entry point)
index.html            Home: hero carousel, flash deals, categories, catalog
product-detail.html   Product page: gallery, options, prescription & personalisation uploads, reviews
checkout.html         Checkout: forms, promo, terms, payment gateway iframe, confirmation
order.html            Order details: status timeline, carrier tracking iframe, invoice downloads
account.html          My account: orders, wishlist, returns, profile
admin.html            Admin console (admin_user only): dashboard, products, orders, returns
auth-guard.js         Redirects anonymous visitors to login.html
app.js                Shared core: data, state, reusable widgets, header/footer/cart drawer
pages/*.js            One script per page
styles.css            All styles (light + dark)
tests/journeys.js     Runnable Playwright script covering every journey below
```

---

## Run it

| Option | How |
|---|---|
| Open directly | Double-click `login.html` (or any page). |
| Local server | `python3 -m http.server 8080`, then open http://localhost:8080 |
| GitHub Pages | **Settings → Pages → Deploy from a branch → `main` / `(root)`** |
| Example tests | `npm i -D playwright && npx playwright install chromium && node tests/journeys.js` |

---

## Accounts

| Username | Password | Role / behaviour |
|---|---|---|
| `standard_user` | `ShopLab@123` | Customer |
| `admin_user` | `ShopLab@123` | Admin: sees **Admin** in the nav and can open `admin.html` |
| `locked_user` | `ShopLab@123` | Error: "Sorry, this user has been locked out." |
| `slow_user` | `ShopLab@123` | Signs in after **4 s** |
| *(registered)* | *(your own)* | Created on the **Create account** tab |

## Test data

| Thing | Value |
|---|---|
| Cards | `4242 4242 4242 4242` succeeds; `4000 0000 0000 0002` is **declined** by the SecurePay iframe |
| Promo codes | `SAVE10` (10%), `WELCOME20` (20%, $50 minimum), `FREESHIP`, `EXPIRED` (expired error); anything else is invalid |
| Out of stock | #7 Classic Leather Wallet: **Notify me** form instead of Add to Cart |
| Low stock | #3 keyboard (3 left), #12 vinyl player (2 left), #2 watch (8) |
| Prescription required | #13 ClearView Glasses: upload file, prescription date (≤ 2 years old) and PD (50–80) |
| Personalisable (+$5) | #3 keyboard, #5 bottle, #6 shirt: design upload and/or custom text |
| Size guide | #4 shoes, #6 shirt |
| Shipping | Standard $5.99 (free ≥ $100), Express $14.99, Overnight $29.99; no Sunday delivery dates |
| Tax | 8% of (subtotal − discount) |

---

## Business journeys to automate

These are the end-to-end flows the store supports. Each one uses several "hard" UI patterns along the way.

| # | Journey | Patterns you'll exercise |
|---|---|---|
| 1 | **Sign up and first purchase**: register → sign in → accept cookies → search → buy → pay → track | Form validation, password strength meter, date input, cookie banner, `<dialog>`, combobox |
| 2 | **Prescription glasses**: search "glass" → choose options → upload prescription → checkout | Header auto-suggest (keyboard), mandatory file upload, date / number validation |
| 3 | **Personalised gift**: mega menu → shirt → colour/size → personalisation switch → upload design + text → gift message | Hover mega menu, toggle switch, image upload preview, `prompt()` |
| 4 | **Browse and quick add**: carousel → category tile → filter chips → load more → quick view → mini-cart drawer | Auto-rotating carousel, skeleton loading, "Load more" spinner, modal, slide-in drawer, free-shipping progress bar |
| 5 | **Wishlist to cart**: heart products → My account → drag to reorder → drag onto the bag drop zone | HTML5 drag and drop (list + drop zone), button fallbacks |
| 6 | **Checkout edge cases**: promo with 2 s validation, Terms that unlock after scrolling, declined then approved card in iframe, confirm dialog | Explicit waits, scroll-to-enable, `frameLocator`, `confirm()`, `alert()`, `prompt()` |
| 7 | **Track an order**: success page → order page → status timeline → carrier widget → Refresh | Iframe **inside** iframe (tracking → map), postMessage, text that changes after a delay |
| 8 | **Admin fulfilment**: admin console → Orders → Fulfil (carrier select + tracking number) → Mark delivered | Role-based access, native `<select>` with optgroups, modal form validation |
| 9 | **Admin catalog change**: edit price inline / archive via right-click → check the store | Inline table editing, context menu, `confirm()`, cross-page data consistency |
| 10 | **Returns**: delivered order → Return items → choose items → "damaged" requires photos → confirm → admin approves or rejects with a reason | Conditional validation, multi-file upload, `prompt()` (reject reason), status badges |
| 11 | **Order history**: admin seeds 12 sample orders → customer sorts/filters/pages → cancels one → downloads invoice | Sortable/paginated table, status filter, `confirm()`, CSV download |
| 12 | **Profile and privacy**: edit profile (multi-select interests, radios, switch) → "Delete my data" requires typing DELETE | Multi-select, `prompt()` + `alert()` mismatch path |

A full working implementation of these journeys is in [`tests/journeys.js`](tests/journeys.js).

---

## Automation conventions

* **`data-testid`** on every interactive element (`<component>-<action>`), plus semantic `id`, `name` and accessible labels.
* Repeated items share a testid and carry a key: `data-product-id`, `data-key` (orders, cart lines, table rows), `data-id` (wishlist), `data-status`, `data-step`.
* **`body[data-ready="true"]`** is set once a page has initialised.
* State attributes to assert on: `data-state` (catalog grid, recommendations), `data-status` (badges, gateway, tracking), `aria-busy`, `aria-invalid`, `aria-pressed`, `aria-selected`, `aria-expanded`, `aria-sort`, `data-active-index` (carousel), `data-remaining` (countdown), `data-zoomed` (gallery).
* Loading buttons get `.is-loading`, `aria-busy="true"` and `disabled`.
* Menus and dropdowns fade in over about 150 ms. Wait for the item to be **visible** before clicking it.
* **Skip the login UI** in tests:

```ts
await context.addInitScript(() => {
  localStorage.setItem('shoplab.session', JSON.stringify({ user: 'standard_user' }));      // or admin_user
  localStorage.setItem('shoplab.cookieConsent', JSON.stringify({ choice: 'accepted' }));  // hide the cookie banner
});
```

* Storage keys: `shoplab.session`, `.users`, `.cart`, `.wishlist`, `.orders`, `.productOverrides`, `.cookieConsent`, `.recentlyViewed`, `.backInStock`, `.profile.<user>`. **Reset demo data** (footer) or `window.ShopLab.reset()` clears everything except accounts and the session.
* Helpers on `window.ShopLab`: `login(user)`, `logout()`, `seedCart([{id, qty}])`, `reset()`, `cart`, `products`.
* Deep links: `index.html?q=…&category=…&tag=sale#catalog`, `product-detail.html?id=4&tab=reviews|shipping|terms`, `account.html#orders|wishlist|returns|profile`, `account.html?order=<id>#returns`, `order.html?id=<id>`, `admin.html#products|orders|returns`.

---

## Component → `data-testid` reference

### Site shell (every signed-in page)

| Component | data-testid |
|---|---|
| Announcement bar / header | `announcement-bar`, `site-header`, `header-brand-link`, `header-menu-toggle`, `header-nav` |
| Nav links | `nav-shop-link`, `nav-deals-link`, `nav-orders-link`, `nav-admin-link` (admin only) |
| Category **mega menu** (hover or click) | `nav-categories-btn`, `mega-menu`, `mega-menu-<category>`, `mega-menu-featured` |
| **Search combobox** (`/` focuses it) | `header-search-input`, `header-search-listbox`, `header-search-option`, `header-search-no-results` |
| Wishlist link | `header-wishlist-link`, `header-wishlist-count` |
| **Account menu** (hover or click) | `header-account-btn`, `header-account-menu`, `header-username`, `header-user-email`, `account-menu-orders`, `account-menu-wishlist`, `account-menu-returns`, `account-menu-profile`, `account-menu-admin`, `header-logout-btn` |
| **Cart drawer** | `header-cart-btn`, `header-cart-count`, `cart-drawer`, `cart-drawer-backdrop`, `cart-drawer-close`, `cart-drawer-count`, `cart-drawer-shipping-text`, `cart-drawer-shipping-progress`, `cart-drawer-line` (`data-key`), `cart-drawer-line-name`, `cart-drawer-line-meta`, `cart-drawer-qty-decrement`, `cart-drawer-qty-input`, `cart-drawer-qty-increment`, `cart-drawer-line-total`, `cart-drawer-remove`, `cart-drawer-subtotal`, `cart-drawer-checkout`, `cart-drawer-continue`, `cart-drawer-empty` |
| **Cookie consent** | `cookie-banner`, `cookie-accept-btn`, `cookie-reject-btn`, `cookie-manage-btn`, `cookie-preferences-modal`, `cookie-essential-switch`, `cookie-analytics-switch`, `cookie-marketing-switch`, `cookie-save-btn`, `cookie-modal-close`, `footer-cookie-preferences` |
| Footer | `site-footer`, `footer-category-<category>`, `footer-orders-link`, `footer-wishlist-link`, `footer-returns-link`, `footer-profile-link`, `footer-cart-link`, `footer-shipping-link`, `footer-terms-link`, `footer-reset-state` |
| **Shadow DOM** newsletter (`<shop-newsletter>`, open root) | `shadow-host`, `shadow-email-input`, `shadow-submit-btn`, `shadow-message` |
| Misc | `toast-region`, `toast-message` (`data-type`), `toast-close`, `back-to-top`, `skip-link` |

### Login: `login.html`

| Component | data-testid |
|---|---|
| Tabs | `auth-tabs`, `auth-tab-signin`, `auth-tab-register`, `auth-panel-signin`, `auth-panel-register` |
| Sign in | `login-form`, `login-username-input`, `login-password-input`, `login-password-toggle`, `login-remember-checkbox`, `login-forgot-password-link`, `login-submit-btn` |
| Messages | `login-username-error`, `login-password-error`, `login-error-banner`, `login-error-text`, `login-error-close`, `login-info-banner` |
| Demo accounts (click to fill) | `login-demo-credentials`, `login-demo-user-standard`, `login-demo-user-admin`, `login-demo-user-locked`, `login-demo-user-slow`, `login-demo-password` |
| Create account | `register-form`, `register-name-input`, `register-email-input`, `register-username-input`, `register-password-input`, `register-password-strength` (`data-strength` 0–4), `register-password-strength-label`, `register-confirm-input`, `register-dob-input`, `register-terms-checkbox`, `register-terms-link` (**`alert()`**), `register-submit-btn`, `register-error-banner` |
| Field errors | `register-<field>-error` (name, email, username, password, confirm, dob, terms) |

### Home / catalog: `index.html`

| Component | data-testid |
|---|---|
| **Hero carousel** (auto-advances every 6 s, pauses on hover) | `hero-carousel` (`data-active-index`), `carousel-slide` (`data-index`), `carousel-prev`, `carousel-next`, `carousel-dot` (`aria-selected`), `carousel-pause` (`aria-pressed`), `catalog-hero`, `hero-shop-now`, `hero-browse-all`, `hero-shop-deals`, `hero-personalise` |
| **Flash deals** countdown and scroller | `deal-strip`, `deal-countdown` (`data-remaining` seconds), `deal-countdown-hours`, `deal-countdown-minutes`, `deal-countdown-seconds`, `deal-track`, `deal-scroll-prev`, `deal-scroll-next` |
| Category tiles | `category-strip`, `category-tile-<category>` (`aria-current`) |
| Filters | `catalog-filters-form`, `catalog-search-input`, `catalog-category-select`, `catalog-tag-filters`, `catalog-tag-<new\|sale\|bestseller\|eco\|limited>`, `catalog-price-range`, `catalog-price-range-value`, `catalog-in-stock-checkbox`, `catalog-reset-filters` |
| Active filter chips | `catalog-active-filters`, `active-filter-chip`, `active-filters-clear-all` |
| Results | `catalog-results-count`, `catalog-sort-select`, `catalog-product-grid` (`data-state` loading/ready/empty), `catalog-loading` (skeleton), `catalog-empty-state`, `catalog-empty-reset` |
| **Load more** | `catalog-load-more`, `catalog-load-more-text` |
| Product card (`data-product-id`) | `product-card`, `product-image-link`, `product-image`, `product-badge`, `product-wishlist-toggle` (`aria-pressed`), `product-quick-view`, `product-category`, `product-title-link`, `product-rating`, `product-price`, `product-compare-price`, `product-stock-status`, `product-colors`, `product-qty`, `product-qty-decrement`, `product-qty-input`, `product-qty-increment`, `product-add-to-cart` (`data-state="added"`), `product-choose-options` (prescription item), `product-notify-link` (out of stock), `product-reviews-link` / `product-vendor-terms-link` (`target="_blank"`) |
| **Quick view** dialog | `quick-view-modal`, `quick-view-image`, `quick-view-title`, `quick-view-price`, `quick-view-variant-select`, `quick-view-color-select`, `quick-view-qty-decrement`, `quick-view-qty-input`, `quick-view-qty-increment`, `quick-view-add-to-cart`, `quick-view-details-link`, `quick-view-close` |
| Recently viewed | `recently-viewed`, `recently-viewed-grid` |

### Product detail: `product-detail.html?id=<n>`

| Component | data-testid |
|---|---|
| States / breadcrumb | `pdp-content`, `pdp-not-found`, `pdp-back-to-shop`, `pdp-breadcrumb`, `pdp-breadcrumb-home`, `pdp-breadcrumb-category`, `pdp-breadcrumb-current` |
| **Gallery** (double-click to zoom, ←/→ keys) | `pdp-gallery`, `pdp-gallery-main` (`data-zoomed`), `pdp-main-image`, `pdp-gallery-prev`, `pdp-gallery-next`, `pdp-thumbnails`, `pdp-thumbnail` (`aria-pressed`) |
| Info | `pdp-category`, `pdp-title`, `pdp-vendor`, `pdp-rating` (jumps to reviews), `pdp-price`, `pdp-compare-price`, `pdp-savings`, `pdp-stock-status` (`data-stock`), `pdp-short-description`, `pdp-delivery-estimate`, `pdp-perks` |
| Options | `pdp-form`, `pdp-variant-select`, `pdp-variant-error`, `pdp-color-options`, `pdp-color-option`, `pdp-color-name`, `pdp-size-guide-link`, `size-guide-modal`, `size-guide-table`, `size-guide-close` |
| **Prescription** upload (glasses) | `pdp-prescription-panel`, `prescription-upload-dropzone`, `prescription-upload-input`, `prescription-upload-preview-item`, `prescription-upload-preview-thumbnail`, `prescription-upload-preview-pdf-icon`, `prescription-upload-file-name`, `prescription-upload-remove-btn`, `prescription-upload-error`, `pdp-prescription-date`, `pdp-prescription-pd`, `pdp-prescription-file-error`, `pdp-prescription-date-error`, `pdp-prescription-pd-error` |
| **Personalisation** upload | `pdp-personalization-panel`, `pdp-personalization-toggle` (switch), `pdp-personalization-fields`, `personalization-upload-*` (same suffixes as above), `pdp-personalization-text`, `pdp-personalization-text-count`, `pdp-personalization-error` |
| Quantity / buy | `pdp-qty`, `pdp-qty-decrement`, `pdp-qty-input`, `pdp-qty-increment`, `pdp-add-to-cart`, `pdp-buy-now`, `pdp-add-success`, `pdp-wishlist-toggle` |
| **Share** dropdown | `pdp-share`, `pdp-share-btn`, `pdp-share-menu`, `pdp-share-copy`, `pdp-share-email` (mailto), `pdp-share-popup` (**`window.open`**) |
| Back in stock | `pdp-notify-form`, `pdp-notify-email`, `pdp-notify-submit`, `pdp-notify-error`, `pdp-notify-success` |
| Tabs | `pdp-tabs`, `pdp-tab-description`, `pdp-tab-reviews`, `pdp-tab-shipping`, `pdp-tab-terms`, `pdp-panel-*`, `pdp-features`, `pdp-feature`, `pdp-shipping-table`, `pdp-terms-title`, `pdp-terms-list`, `pdp-terms-item` |
| Reviews | `pdp-review-count`, `review-summary`, `review-average`, `review-distribution`, `review-bar-<1-5>`, `review-sort-select`, `pdp-review-list` (scroll container), `review-item`, `review-author`, `review-stars`, `review-body` |
| Review form | `review-form`, `review-name-input`, `review-rating`, `review-rating-<1-5>`, `review-star-<1-5>` (clickable labels), `review-comment-input`, `review-comment-count`, `review-submit`, `review-success`, `review-name-error`, `review-rating-error`, `review-comment-error` |
| **Lazy recommendations** (about 1.5 s) | `recommendations` (`data-state="ready"`), `recommendations-loading`, `recommendations-track`, `recommendations-prev`, `recommendations-next` |

### Checkout: `checkout.html`

| Component | data-testid |
|---|---|
| Progress | `checkout-stepper` (`li.is-current` / `.is-done`) |
| Form / errors | `checkout-form`, `checkout-error-summary`, `checkout-error-list`, `checkout-error-item` (`data-field`), `checkout-<field>-error` |
| Contact (prefilled from profile) | `checkout-fullname-input`, `checkout-email-input`, `checkout-phone-input` (masked) |
| Address | `checkout-saved-address-select` (after your first order), `checkout-address-input`, `checkout-city-input`, `checkout-postal-input`, `checkout-delivery-slot-select` |
| Country **combobox** | `country-combobox`, `country-combobox-input`, `country-combobox-toggle`, `country-combobox-listbox`, `country-combobox-option`, `country-combobox-no-results`, `country-combobox-value` |
| Delivery | `checkout-shipping-methods`, `checkout-shipping-standard\|express\|overnight`, `checkout-shipping-standard-price`, `checkout-delivery-date` (date input), `checkout-delivery-date-error` |
| Payment | `checkout-payment-methods`, `checkout-payment-card`, `checkout-payment-gateway`, `checkout-card-fields`, `checkout-card-name-input`, `checkout-card-number-input` (masked), `checkout-card-brand`, `checkout-card-expiry-input`, `checkout-card-cvv-input` |
| **Gateway iframe** (parent) | `checkout-gateway-fields`, `payment-gateway-iframe`, `checkout-gateway-status` (`data-status` authorized/declined), `checkout-gateway-token`, `checkout-gateway-error` |
| Gateway iframe (inside) | `gateway-body`, `gateway-amount`, `gateway-card-input`, `gateway-expiry-input`, `gateway-cvc-input`, `gateway-authorize-btn`, `gateway-message` |
| Extras | `checkout-notes-input`, `checkout-gift-message-btn` (**`prompt()`**), `checkout-gift-message-value`, `checkout-help-alert-btn` (**`alert()`**), `checkout-newsletter-checkbox` |
| **Terms** (scroll-to-enable dialog) | `checkout-terms-checkbox`, `checkout-terms-link`, `terms-modal`, `terms-scroll`, `terms-end`, `terms-scroll-hint`, `terms-accept-btn` (disabled until the bottom), `terms-decline-btn`, `terms-modal-close` |
| Submit | `checkout-place-order` (disabled until terms are accepted) |
| Cart summary (drag to reorder) | `checkout-summary`, `cart-list`, `cart-item` (`data-key`, `data-product-id`), `cart-item-drag-handle`, `cart-item-name`, `cart-item-meta`, `cart-item-qty-decrement`, `cart-item-qty-input`, `cart-item-qty-increment`, `cart-item-total`, `cart-item-move-up`, `cart-item-move-down`, `cart-item-remove`, `cart-clear-btn` (**`confirm()`**), `cart-empty-state`, `cart-browse-link`, `cart-add-samples` |
| Promo (2 s) | `promo-section`, `promo-code-input`, `promo-apply-btn`, `promo-loading`, `promo-success-banner` (`data-code`), `promo-success-text`, `promo-remove-btn`, `promo-error` |
| Totals | `cart-totals`, `cart-item-count`, `cart-subtotal`, `cart-discount`, `cart-shipping`, `cart-tax`, `cart-total` |
| Confirm dialog | `confirm-order-modal`, `confirm-order-summary`, `confirm-order-line`, `confirm-order-total`, `confirm-order-processing`, `confirm-order-close`, `confirm-order-cancel`, `confirm-order-submit` |
| Success | `order-success`, `order-success-title`, `order-success-banner`, `order-id`, `order-total`, `order-email`, `order-eta`, `order-view-details`, `order-download-invoice-csv`, `order-download-receipt-pdf`, `order-continue-shopping` |

### Order details: `order.html?id=<orderId>`

| Component | data-testid |
|---|---|
| States | `order-content`, `order-not-found`, `order-back-to-orders`, `order-breadcrumb-orders` |
| Header and actions | `order-number`, `order-date`, `order-status`, `order-status-badge` (`data-status`), `order-status-banner`, `order-download-invoice`, `order-download-receipt`, `order-cancel-btn` (**`confirm()`**, processing only), `order-request-return` (delivered only), `order-help-btn` (**`alert()`**) |
| Timeline | `order-timeline`, `order-timeline-step` (`data-step`, `.is-done`, `.is-current`) |
| **Tracking iframe** (parent) | `tracking-iframe` |
| Tracking iframe (inside) | `tracking-body`, `tracking-carrier`, `tracking-number`, `tracking-status` (`data-status`), `tracking-eta`, `tracking-events`, `tracking-event`, `tracking-refresh-btn` ("Checking…" for about 1.2 s), `tracking-last-updated`, `tracking-map-iframe` |
| Map iframe (nested inside tracking) | `map-body`, `map-truck` (`data-progress` 0–100), `map-location` |
| Details | `order-items`, `order-item`, `order-item-name`, `order-item-meta`, `order-totals`, `order-detail-total`, `order-address`, `order-shipping-method`, `order-payment`, `order-extras`, `order-gift-message`, `order-notes` |

### My account: `account.html`

| Component | data-testid |
|---|---|
| Header | `account-hero`, `account-greeting`, `account-stat-orders`, `account-stat-spent`, `account-stat-wishlist`, `account-stat-returns` |
| Tabs (vertical, synced with `#hash`) | `account-tabs`, `account-tab-orders\|wishlist\|returns\|profile`, `account-panel-*` |
| **Orders table** | `orders-table`, `orders-search-input`, `orders-filter-status`, `orders-page-size-select`, `orders-sort-<id\|date\|items\|total\|status>`, `orders-row` (`data-key`, `data-status`), `orders-cell-*`, `orders-order-link`, `orders-status-badge`, `orders-track-btn`, `orders-invoice-btn` (download), `orders-reorder-btn`, `orders-cancel-btn` (**`confirm()`**), `orders-return-btn`, `orders-empty`, `orders-start-shopping`, `orders-summary`, `orders-pagination`, `orders-page-first\|prev\|number\|next\|last` |
| **Wishlist** (drag and drop) | `wishlist-list` (`data-order`), `wishlist-item` (`data-id`, draggable), `wishlist-item-rank`, `wishlist-item-name`, `wishlist-item-add-to-cart`, `wishlist-item-up`, `wishlist-item-down`, `wishlist-item-remove`, `wishlist-cart-dropzone` (drop target), `wishlist-dropzone-text`, `wishlist-add-all-btn`, `wishlist-order`, `wishlist-empty`, `wishlist-browse` |
| **Returns** | `return-form`, `returns-no-eligible`, `return-order-select`, `return-items`, `return-item-checkbox`, `return-reason-select`, `return-refund-methods`, `return-refund-original`, `return-refund-credit`, `return-details-input`, `return-photo-*` (uploader: dropzone, input, preview-item, preview-thumbnail, preview-pdf-icon, file-name, remove-btn, error, error-item), `return-submit-btn`, `return-confirm-modal`, `return-confirm-summary`, `return-confirm-submit`, `return-confirm-cancel`, `return-success`, `return-success-rma`, `returns-list`, `return-card` (`data-rma`), `return-rma`, `return-status` (`data-status`), `return-decision-note`, `returns-empty` |
| Return errors | `return-order-error`, `return-items-error`, `return-reason-error`, `return-details-error`, `return-photos-error` |
| **Profile** | `profile-form`, `profile-name-input`, `profile-email-input`, `profile-phone-input`, `profile-dob-input`, `profile-interests-select` (multi), `profile-contact-pref`, `profile-contact-email\|sms\|none`, `profile-newsletter-switch`, `profile-save-btn`, `profile-saved-text`, `profile-name-error`, `profile-email-error`, `profile-danger-zone`, `profile-delete-data-btn` (**`prompt()`** then **`alert()`**) |

### Admin console: `admin.html` (admin_user)

| Component | data-testid |
|---|---|
| Access | `admin-access-denied`, `admin-back-to-shop`, `admin-content` |
| Tabs | `admin-tabs`, `admin-tab-dashboard\|products\|orders\|returns`, `admin-orders-pending-count`, `admin-returns-pending-count`, `admin-panel-*` |
| Dashboard | `admin-kpis`, `admin-kpi-<revenue\|orders\|aov\|low-stock\|returns>`, `admin-kpi-*-value`, `admin-status-chart`, `admin-status-bar-<status>` (`data-count`), `admin-low-stock-list`, `admin-low-stock-item`, `admin-restock-btn`, `admin-recent-orders`, `admin-recent-order`, `admin-seed-orders-btn`, `admin-clear-orders-btn` (**`confirm()`**) |
| **Products table** (inline edit, right-click) | `admin-products-table`, `admin-products-search-input`, `admin-products-filter-category`, `admin-products-filter-state`, `admin-products-page-size-select`, `admin-products-sort-<name\|category\|price\|stock\|state>`, `admin-products-select-all`, `admin-products-row` (`data-product-id`, `data-state`), `admin-products-row-checkbox`, `admin-products-cell-*`, `admin-products-status`, `admin-products-edit`, `admin-products-edit-price`, `admin-products-edit-stock`, `admin-products-save`, `admin-products-cancel`, `admin-products-archive` (**`confirm()`**), `admin-products-restore`, `admin-products-view` (new tab), `admin-products-bulk-archive`, `admin-products-export-csv`, `admin-products-export-json`, `admin-products-reset`, pagination `admin-products-page-*` |
| Products context menu | `admin-products-context-menu`, `admin-products-context-menu-item-<edit\|restock\|archive\|restore\|view\|copy-sku>` |
| **Orders table** | `admin-orders-table`, `admin-orders-search-input`, `admin-orders-filter-status`, `admin-orders-row` (`data-status`), `admin-orders-link`, `admin-orders-status`, `admin-orders-fulfil`, `admin-orders-deliver`, `admin-orders-cancel` (**`confirm()`**), `admin-orders-invoice`, `admin-orders-context-menu`, `admin-orders-context-menu-item-<view\|fulfil\|deliver\|cancel\|invoice\|copy-id>` |
| **Fulfil dialog** | `fulfil-modal`, `fulfil-order-id`, `fulfil-items`, `fulfil-carrier-select` (optgroups, one disabled option), `fulfil-tracking-input`, `fulfil-generate-tracking`, `fulfil-date-input`, `fulfil-notify-checkbox`, `fulfil-submit-btn`, `fulfil-cancel-btn`, `fulfil-close`, `fulfil-carrier-error`, `fulfil-tracking-error`, `fulfil-date-error` |
| **Returns table** | `admin-returns-table`, `admin-returns-search-input`, `admin-returns-filter-status`, `admin-returns-row` (`data-order-id`, `data-status`), `admin-returns-status`, `admin-returns-review`, `admin-returns-approve`, `admin-returns-reject` (**`prompt()`** for the reason), `return-review-modal`, `return-review-body`, `return-review-close` |

---

## Sample tests

### Playwright: a cross-role journey (order → fulfil → track)

```ts
import { test, expect, Page } from '@playwright/test';
// playwright.config: use: { baseURL: 'http://localhost:8080/', testIdAttribute: 'data-testid' }

async function signIn(page: Page, user: string) {
  await page.goto('login.html');
  await page.getByTestId('login-username-input').fill(user);
  await page.getByTestId('login-password-input').fill('ShopLab@123');
  await page.getByTestId('login-submit-btn').click();
  await expect(page).toHaveURL(/index\.html/);
  const cookies = page.getByTestId('cookie-accept-btn');
  if (await cookies.isVisible()) await cookies.click();
}

test('customer orders, admin ships, customer tracks', async ({ page }) => {
  await signIn(page, 'standard_user');

  // Search with the header combobox
  await page.getByTestId('header-search-input').fill('headphones');
  await page.getByTestId('header-search-option').first().click();
  await page.getByTestId('pdp-variant-select').selectOption('Standard');
  await page.getByTestId('pdp-add-to-cart').click();
  await expect(page.getByTestId('cart-drawer')).toHaveAttribute('aria-hidden', 'false');
  await page.getByTestId('cart-drawer-checkout').click();

  // Checkout
  await page.getByTestId('promo-code-input').fill('SAVE10');
  await page.getByTestId('promo-apply-btn').click();
  await expect(page.getByTestId('promo-success-banner')).toBeVisible({ timeout: 5000 });
  await page.getByTestId('checkout-address-input').fill('221B Baker Street');
  await page.getByTestId('checkout-city-input').fill('London');
  await page.getByTestId('checkout-postal-input').fill('NW1 6XE');
  await page.getByTestId('country-combobox-input').fill('united k');
  await page.getByTestId('country-combobox-input').press('ArrowDown');
  await page.getByTestId('country-combobox-input').press('Enter');

  const gateway = page.frameLocator('[data-testid="payment-gateway-iframe"]');
  await page.getByTestId('checkout-payment-gateway').check();
  await gateway.getByTestId('gateway-card-input').fill('4242424242424242');
  await gateway.getByTestId('gateway-expiry-input').fill('12/30');
  await gateway.getByTestId('gateway-cvc-input').fill('123');
  await gateway.getByTestId('gateway-authorize-btn').click();
  await expect(page.getByTestId('checkout-gateway-status')).toHaveAttribute('data-status', 'authorized');

  await page.getByTestId('checkout-terms-link').click();                 // scroll-to-enable terms
  await page.getByTestId('terms-end').scrollIntoViewIfNeeded();
  await page.getByTestId('terms-accept-btn').click();
  await page.getByTestId('checkout-place-order').click();
  await page.getByTestId('confirm-order-submit').click();
  const orderId = (await page.getByTestId('order-id').textContent())!.trim();

  // Admin fulfils it
  await page.getByTestId('header-account-btn').hover();
  await page.getByTestId('header-logout-btn').click();
  await signIn(page, 'admin_user');
  await page.goto('admin.html#orders');
  await page.getByTestId('admin-orders-search-input').fill(orderId);
  await page.getByTestId('admin-orders-fulfil').click();
  await page.getByTestId('fulfil-carrier-select').selectOption({ label: 'UPS' });
  await page.getByTestId('fulfil-submit-btn').click();
  await expect(page.getByTestId('admin-orders-status').first()).toHaveText('Shipped');

  // Customer tracks it (iframe inside an iframe)
  await page.getByTestId('header-account-btn').hover();
  await page.getByTestId('header-logout-btn').click();
  await signIn(page, 'standard_user');
  await page.goto(`order.html?id=${orderId}`);
  const tracking = page.frameLocator('[data-testid="tracking-iframe"]');
  await expect(tracking.getByTestId('tracking-status')).toHaveText('In transit');
  await expect(tracking.frameLocator('[data-testid="tracking-map-iframe"]').getByTestId('map-truck'))
    .toHaveAttribute('data-progress', '58');
});
```

### Selenium (Python): wishlist drag-to-cart fallback, return with photo

```python
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait, Select
from selenium.webdriver.support import expected_conditions as EC

BASE = "http://localhost:8080/"
tid = lambda t: (By.CSS_SELECTOR, f'[data-testid="{t}"]')
driver = webdriver.Chrome()
wait = WebDriverWait(driver, 10)

# Seed the session instead of using the login UI
driver.get(BASE + "login.html")
driver.execute_script("""
  localStorage.setItem('shoplab.session', JSON.stringify({user: 'standard_user'}));
  localStorage.setItem('shoplab.cookieConsent', JSON.stringify({choice: 'accepted'}));
  localStorage.setItem('shoplab.wishlist', JSON.stringify([1, 8]));
""")

# HTML5 drag and drop doesn't fire through ActionChains, so use the button fallback
driver.get(BASE + "account.html#wishlist")
wait.until(EC.element_to_be_clickable(tid("wishlist-item-add-to-cart"))).click()
wait.until(EC.text_to_be_present_in_element(tid("header-cart-count"), "1"))

# Returns need a delivered order: seed with the admin console first, then
driver.get(BASE + "account.html#returns")
Select(driver.find_element(*tid("return-order-select"))).select_by_index(1)
driver.find_element(*tid("return-item-checkbox")).click()
Select(driver.find_element(*tid("return-reason-select"))).select_by_value("damaged")
driver.find_element(*tid("return-photo-input")).send_keys("/absolute/path/to/photo.png")
driver.find_element(*tid("return-submit-btn")).click()
wait.until(EC.element_to_be_clickable(tid("return-confirm-submit"))).click()
wait.until(EC.visibility_of_element_located(tid("return-success")))

# Shadow DOM (footer newsletter)
host = driver.find_element(*tid("shadow-host"))
host.shadow_root.find_element(By.CSS_SELECTOR, '[data-testid="shadow-email-input"]').send_keys("me@test.io")
host.shadow_root.find_element(By.CSS_SELECTOR, '[data-testid="shadow-submit-btn"]').click()
driver.quit()
```

> **Selenium and HTML5 drag and drop:** `ActionChains.drag_and_drop` doesn't fire native `dragstart`/`drop` events. Use the fallback buttons (`wishlist-item-up`, `wishlist-item-down`, `wishlist-item-add-to-cart`, `cart-item-move-up`, `cart-item-move-down`), or dispatch the events with `execute_script`. Playwright's `dragTo()` works natively.

### Cypress

```js
beforeEach(() => {
  cy.visit('/index.html', {
    onBeforeLoad(win) {
      win.localStorage.setItem('shoplab.session', JSON.stringify({ user: 'standard_user' }));
      win.localStorage.setItem('shoplab.cookieConsent', JSON.stringify({ choice: 'accepted' }));
    },
  });
});

it('quick view adds to the mini cart', () => {
  cy.get('[data-testid="catalog-product-grid"][data-state="ready"]');
  cy.get('#product-card-1 [data-testid="product-quick-view"]').click({ force: true });
  cy.get('[data-testid="quick-view-add-to-cart"]').click();
  cy.get('[data-testid="cart-drawer"]').should('have.attr', 'aria-hidden', 'false');
  cy.get('[data-testid="cart-drawer-line"]').should('have.length', 1);
});
```

---

## Notes

* Product images are generated SVGs and every iframe uses `srcdoc`. Only the Inter web font is fetched from Google Fonts, and the system font is used offline.
* Simulated latencies, for practising waits: sign-in 0.8 s (`slow_user` 4 s), catalog skeleton 0.7 s, add to cart 0.5–0.6 s, load more 0.8 s, recommendations 1.5 s, promo **2 s**, gateway 1.5 s, order processing 1.5 s, tracking refresh 1.2 s, fulfilment 1 s, return submit 1.2 s, back-in-stock 1.5 s.
* Orders, carts and admin changes live in `localStorage`, so admin and customer must use the **same browser profile** (same origin) to see each other's changes. That's the default inside a single Playwright/Cypress context.
