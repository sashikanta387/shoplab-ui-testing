/* Product detail page. */
(function () {
  'use strict';
  const SL = window.ShopLab;
  const {
    $, $$, esc, money, clamp, wait, param, stars, today, store, KEYS, EMAIL_RE, CATEGORY_LABELS, PERSONALIZATION_FEE,
    Products, getProduct, productImage, reviewsFor, Cart, Wishlist, Recent, Drawer, toast, setBusy, initTabs,
    createUploader, productCardHtml, bindCardWishlist,
  } = SL;

  SL.pages['product-detail'] = function () {
    const p = getProduct(param('id'));
    if (!p || p.archived) {
      $('#pdp-not-found').hidden = false;
      if (p && p.archived) {
        $('#pdp-not-found-title').textContent = 'No longer available';
        $('#pdp-not-found-text').textContent = p.name + ' has been discontinued.';
      }
      document.title = 'ShopLab — Product not found';
      return;
    }
    $('#pdp-content').hidden = false;
    document.title = 'ShopLab — ' + p.name;
    Recent.push(p.id);

    const out = p.stock <= 0;
    const reviews = reviewsFor(p);

    // ---- Static content -----------------------------------------------------
    $('#pdp-breadcrumb-category').innerHTML = '<a href="index.html?category=' + p.category + '#catalog">' + esc(CATEGORY_LABELS[p.category]) + '</a>';
    $('#pdp-breadcrumb-current').textContent = p.name;
    $('#pdp-category').textContent = CATEGORY_LABELS[p.category];
    $('#pdp-title').textContent = p.name;
    $('#pdp-vendor').textContent = p.vendor;
    $('#pdp-price').textContent = money(p.price);
    $('#pdp-compare-price').textContent = p.compareAt ? money(p.compareAt) : '';
    if (p.compareAt) {
      $('#pdp-savings').hidden = false;
      $('#pdp-savings').textContent = 'Save ' + money(p.compareAt - p.price);
    }
    const stockEl = $('#pdp-stock');
    stockEl.textContent = out ? 'Out of stock' : p.stock <= 5 ? 'Only ' + p.stock + ' left in stock — order soon' : 'In stock (' + p.stock + ' available)';
    stockEl.className = 'stock-note ' + (out ? 'out' : p.stock <= 5 ? 'low' : 'in');
    stockEl.dataset.stock = String(p.stock);
    $('#pdp-short-description').textContent = p.short;
    $('#pdp-description').textContent = p.short + ' Designed by ' + p.vendor + ' and backed by our 30-day satisfaction guarantee.';
    $('#pdp-features').innerHTML = p.features.map((f) => '<li data-testid="pdp-feature">' + esc(f) + '</li>').join('');

    // Delivery estimate: 3 business days from today.
    const eta = new Date();
    for (let added = 0; added < 3;) { eta.setDate(eta.getDate() + 1); if (eta.getDay() % 6) added++; }
    $('#pdp-delivery-estimate').textContent = 'Order today, get it by ' + eta.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    // ---- Gallery: thumbnails, arrows, keyboard, double-click zoom -----------
    const main = $('#gallery-main');
    const mainImg = $('#pdp-main-image');
    let imgIndex = 0;
    const thumbs = $('#pdp-thumbs');
    thumbs.innerHTML = [0, 1, 2].map((i) =>
      '<button type="button" id="pdp-thumb-' + i + '" data-index="' + i + '" data-testid="pdp-thumbnail" aria-pressed="false" aria-label="Show image ' + (i + 1) + ' of 3">' +
      '<img src="' + productImage(p, i) + '" alt=""></button>').join('');
    function showImage(i) {
      imgIndex = (i + 3) % 3;
      mainImg.src = productImage(p, imgIndex);
      mainImg.alt = p.name + ' — image ' + (imgIndex + 1);
      mainImg.dataset.index = String(imgIndex);
      $$('button', thumbs).forEach((b, j) => b.setAttribute('aria-pressed', String(j === imgIndex)));
    }
    function setZoom(on) {
      main.dataset.zoomed = String(on);
      main.classList.toggle('is-zoomed', on);
      if (!on) mainImg.style.transformOrigin = '';
    }
    thumbs.addEventListener('click', (e) => { const b = e.target.closest('button[data-index]'); if (b) showImage(Number(b.dataset.index)); });
    $('#gallery-prev').addEventListener('click', () => showImage(imgIndex - 1));
    $('#gallery-next').addEventListener('click', () => showImage(imgIndex + 1));
    main.addEventListener('dblclick', (e) => {
      if (e.target.closest('button')) return;
      setZoom(main.dataset.zoomed !== 'true');
    });
    main.addEventListener('mousemove', (e) => {
      if (main.dataset.zoomed !== 'true') return;
      const r = main.getBoundingClientRect();
      mainImg.style.transformOrigin = ((e.clientX - r.left) / r.width) * 100 + '% ' + ((e.clientY - r.top) / r.height) * 100 + '%';
    });
    main.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') showImage(imgIndex - 1);
      if (e.key === 'ArrowRight') showImage(imgIndex + 1);
      if (e.key === 'Escape') setZoom(false);
      if (e.key === 'z' || e.key === 'Enter') setZoom(main.dataset.zoomed !== 'true');
    });
    showImage(0);

    // ---- Options ------------------------------------------------------------
    const variant = $('#pdp-variant');
    p.options.forEach((o) => variant.add(new Option(o, o)));
    if (param('variant') && p.options.includes(param('variant'))) variant.value = param('variant');
    $('#pdp-colors').innerHTML = p.colors.map((c, i) =>
      '<label class="swatch" for="pdp-color-' + i + '">' +
      '<input type="radio" name="color" id="pdp-color-' + i + '" value="' + esc(c.name) + '" data-testid="pdp-color-option"' + (i === 0 ? ' checked' : '') + '>' +
      '<span class="swatch-dot" style="background:' + c.hex + '"></span>' + esc(c.name) + '</label>').join('');
    const colorName = () => ($('input[name="color"]:checked') || {}).value || '';
    $('#pdp-color-name').textContent = colorName();
    $('#pdp-colors').addEventListener('change', () => { $('#pdp-color-name').textContent = colorName(); });

    if (p.sizeGuide) {
      $('#size-guide-link').hidden = false;
      $('#size-guide-link').addEventListener('click', () => $('#size-guide-modal').showModal());
      $('[data-testid="size-guide-close"]').addEventListener('click', () => $('#size-guide-modal').close());
    }

    // Prescription (mandatory for glasses).
    let rx = null;
    if (p.requiresPrescription) {
      $('#rx-panel').hidden = false;
      rx = createUploader($('#rx-uploader'), { prefix: 'prescription-upload', label: 'Upload prescription', maxFiles: 1 });
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      $('#rx-date').min = twoYearsAgo.toISOString().slice(0, 10);
      $('#rx-date').max = today();
    }

    // Personalisation (optional).
    let custom = null;
    const customToggle = $('#custom-toggle');
    if (p.customizable) {
      $('#custom-panel').hidden = false;
      custom = createUploader($('#custom-uploader'), { prefix: 'personalization-upload', label: 'Upload your design', maxFiles: 1 });
      customToggle.addEventListener('change', () => {
        $('#custom-fields').hidden = !customToggle.checked;
        updatePrice();
      });
      $('#custom-text').addEventListener('input', (e) => { $('#custom-text-count').textContent = e.target.value.length + ' / 20'; });
    }
    function updatePrice() {
      const extra = custom && customToggle.checked ? PERSONALIZATION_FEE : 0;
      $('#pdp-price').textContent = money(p.price + extra);
      $('#pdp-price').dataset.personalised = String(Boolean(extra));
    }

    // ---- Quantity -----------------------------------------------------------
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

    // ---- Add to cart / Buy now ---------------------------------------------
    const addBtn = $('#pdp-add-to-cart');
    const buyBtn = $('#pdp-buy-now');
    const addSuccess = $('#pdp-add-success');
    if (out) {
      addBtn.disabled = true;
      buyBtn.disabled = true;
      addBtn.textContent = 'Out of Stock';
      qtyInput.disabled = true;
      variant.disabled = true;
      $('#pdp-qty-field').hidden = true;
      $('#notify-form').hidden = false;
    }
    variant.addEventListener('change', () => {
      if (variant.value) { $('#pdp-variant-error').textContent = ''; variant.setAttribute('aria-invalid', 'false'); }
    });

    function validate() {
      const errors = [];
      const set = (id, msg, el) => {
        $('#' + id).textContent = msg;
        if (el) el.setAttribute('aria-invalid', String(Boolean(msg)));
        if (msg) errors.push(el || $('#' + id));
      };
      set('pdp-variant-error', variant.value ? '' : 'Please select an option.', variant);
      if (rx) {
        const d = $('#rx-date').value;
        set('rx-file-error', rx.files.length ? '' : 'Please upload your prescription (JPG, PNG or PDF).', null);
        set('rx-date-error', !d ? 'Enter the date on your prescription.' : d < $('#rx-date').min ? 'Prescriptions older than 2 years are not accepted.' : d > today() ? 'Date cannot be in the future.' : '', $('#rx-date'));
        const pd = Number($('#rx-pd').value);
        set('rx-pd-error', pd >= 50 && pd <= 80 ? '' : 'Enter a pupillary distance between 50 and 80 mm.', $('#rx-pd'));
      }
      if (custom && customToggle.checked) {
        set('custom-error', custom.files.length || $('#custom-text').value.trim() ? '' : 'Upload a design or enter custom text, or switch personalisation off.', null);
      }
      if (errors.length && errors[0].focus) errors[0].focus();
      return !errors.length;
    }

    $('#pdp-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const buyNow = e.submitter && e.submitter.value === 'buy';
      addSuccess.hidden = true;
      if (!validate()) return;
      const btn = buyNow ? buyBtn : addBtn;
      setBusy(btn, true, buyNow ? 'Processing…' : 'Adding…');
      await wait(600);
      const opts = { variant: variant.value, color: colorName() };
      if (rx) opts.prescription = { fileName: rx.files[0].name, date: $('#rx-date').value, pd: Number($('#rx-pd').value) };
      if (custom && customToggle.checked) opts.custom = { fileName: custom.files[0] ? custom.files[0].name : '', text: $('#custom-text').value.trim() };
      const added = Cart.add(p.id, Number(qtyInput.value), opts);
      setBusy(btn, false);
      if (added > 0) {
        if (buyNow) { location.href = 'checkout.html'; return; }
        addSuccess.className = 'alert alert-success';
        addSuccess.textContent = 'Added ' + added + ' × ' + p.name + ' (' + variant.value + ', ' + colorName() + ') to your cart.';
        addSuccess.hidden = false;
        toast('Added to cart', 'success');
        Drawer.open();
        if (rx) { rx.clear(); }
        if (custom) { custom.clear(); customToggle.checked = false; $('#custom-fields').hidden = true; $('#custom-text').value = ''; updatePrice(); }
      } else {
        addSuccess.className = 'alert alert-warning';
        addSuccess.textContent = 'You already have all ' + p.stock + ' available units in your cart.';
        addSuccess.hidden = false;
      }
      setQty(1);
    });

    // ---- Back in stock ------------------------------------------------------
    $('#notify-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = $('#notify-email').value.trim();
      $('#notify-error').textContent = EMAIL_RE.test(email) ? '' : 'Enter a valid email address.';
      $('#notify-email').setAttribute('aria-invalid', String(!EMAIL_RE.test(email)));
      if (!EMAIL_RE.test(email)) return;
      const btn = $('#notify-submit');
      setBusy(btn, true, 'Saving…');
      await wait(1500);
      setBusy(btn, false);
      store.set(KEYS.notify, store.get(KEYS.notify, []).concat({ id: p.id, email, at: new Date().toISOString() }));
      $('#notify-success').textContent = 'We’ll email ' + email + ' as soon as ' + p.name + ' is back in stock.';
      $('#notify-success').hidden = false;
      btn.disabled = true;
      $('#notify-email').disabled = true;
    });

    // ---- Wishlist + share ---------------------------------------------------
    const wishBtn = $('#pdp-wishlist-toggle');
    function syncWish() {
      const on = Wishlist.has(p.id);
      wishBtn.setAttribute('aria-pressed', String(on));
      wishBtn.textContent = on ? '♥' : '♡';
      wishBtn.setAttribute('aria-label', on ? 'Remove from wishlist' : 'Add to wishlist');
    }
    wishBtn.addEventListener('click', () => {
      const on = Wishlist.toggle(p.id);
      syncWish();
      toast(on ? 'Saved to your wishlist' : 'Removed from your wishlist', 'info');
    });
    syncWish();

    const url = location.href.split('#')[0];
    $('#pdp-share-email').href = 'mailto:?subject=' + encodeURIComponent('Check out ' + p.name) + '&body=' + encodeURIComponent(url);
    $('#pdp-share-menu').addEventListener('click', async (e) => {
      const b = e.target.closest('[data-share]');
      if (!b) return;
      if (b.dataset.share === 'copy') {
        try { await navigator.clipboard.writeText(url); toast('Link copied to clipboard', 'success'); } catch (_) { toast('Copy failed — your browser blocked clipboard access', 'error'); }
      }
      if (b.dataset.share === 'popup') {
        const w = window.open('product-detail.html?id=' + p.id, 'shoplab-share', 'width=960,height=720');
        if (!w) toast('Popup blocked by the browser.', 'error');
      }
    });

    // ---- Tabs ---------------------------------------------------------------
    const initialTab = param('tab');
    initTabs($('#pdp-tabs'), {
      initial: initialTab,
      onChange: (name) => history.replaceState(null, '', '?id=' + p.id + '&tab=' + name),
    });
    if (initialTab) requestAnimationFrame(() => $('#pdp-tabs').scrollIntoView());
    $('#pdp-rating').addEventListener('click', () => {
      $('#tab-reviews').click();
      $('#pdp-tabs').scrollIntoView({ behavior: 'smooth' });
    });

    // ---- Reviews ------------------------------------------------------------
    function renderReviews() {
      const avg = reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
      $('#pdp-rating').innerHTML = stars(avg) + '<span>' + avg.toFixed(1) + ' · ' + reviews.length + ' reviews</span>';
      $('#pdp-rating').setAttribute('aria-label', 'Rated ' + avg.toFixed(1) + ' out of 5 from ' + reviews.length + ' reviews. Show reviews.');
      $('#pdp-review-count').textContent = String(reviews.length);
      $('#review-avg').textContent = avg.toFixed(1);
      $('#review-avg-stars').textContent = stars(avg);
      $('#review-bars').innerHTML = [5, 4, 3, 2, 1].map((n) => {
        const c = reviews.filter((r) => r.rating === n).length;
        return '<div class="review-bar" data-testid="review-bar-' + n + '"><span>' + n + '★</span><div class="progress"><div class="progress-bar" style="width:' +
          Math.round((c / reviews.length) * 100) + '%"></div></div><span class="muted small">' + c + '</span></div>';
      }).join('');
      const order = $('#review-sort').value;
      const sorted = reviews.slice().sort((a, b) => (order === 'highest' ? b.rating - a.rating : order === 'lowest' ? a.rating - b.rating : b.date.localeCompare(a.date)));
      $('#pdp-reviews').innerHTML = sorted.map((r, i) =>
        '<article class="review" data-testid="review-item" id="review-' + i + '">' +
          '<div class="review-head"><span class="avatar avatar-sm" aria-hidden="true">' + esc(r.author.charAt(0)) + '</span><strong data-testid="review-author">' + esc(r.author) + '</strong>' +
          '<span class="rating" aria-label="' + r.rating + ' out of 5 stars" data-testid="review-stars">' + stars(r.rating) + '</span>' +
          '<span class="muted small">' + r.date + '</span>' + (r.verified !== false ? '<span class="badge badge-success">Verified</span>' : '') + '</div>' +
          (r.title ? '<p style="margin:.4rem 0 .2rem"><strong>' + esc(r.title) + '</strong></p>' : '') +
          '<p class="muted" data-testid="review-body" style="margin:0">' + esc(r.body) + '</p>' +
        '</article>').join('');
    }
    $('#review-sort').addEventListener('change', renderReviews);
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
      $('#review-sort').value = 'newest';
      renderReviews();
      reviewForm.reset();
      $('#review-comment-count').textContent = '0 / 500';
      $$('[aria-invalid]', reviewForm).forEach((el) => el.removeAttribute('aria-invalid'));
      $('#review-success').hidden = false;
    });

    // ---- Vendor terms -------------------------------------------------------
    const returnDays = 14 + (p.id % 3) * 8;
    $('#pdp-terms-title').textContent = p.vendor + ' — Vendor Terms of Sale';
    $('#pdp-terms').innerHTML = [
      'Items may be returned within ' + returnDays + ' days of delivery in original condition.',
      p.vendor + ' ships from its own warehouse; dispatch takes 1–2 business days.',
      'Warranty: ' + (1 + (p.id % 2)) + ' year(s) limited manufacturer warranty against defects.',
      'Personalised and prescription items can only be returned if they arrive damaged.',
      'ShopLab is a demo store: no goods are shipped and no payments are taken.',
    ].map((t) => '<li data-testid="pdp-terms-item">' + esc(t) + '</li>').join('');

    // ---- Recommendations (lazy, delayed) ----------------------------------
    setTimeout(() => {
      const recs = Products.visible().filter((x) => x.id !== p.id)
        .sort((a, b) => (b.category === p.category) - (a.category === p.category) || b.rating - a.rating).slice(0, 8);
      const track = $('#rec-track');
      track.innerHTML = recs.map((r) => productCardHtml(r, { compact: true })).join('');
      bindCardWishlist(track);
      $('#rec-loading').hidden = true;
      $('#rec-scroller').hidden = false;
      $('#recommendations').dataset.state = 'ready';
      $('[data-testid="recommendations-prev"]').addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.8, behavior: 'smooth' }));
      $('[data-testid="recommendations-next"]').addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' }));
    }, 1500);
  };
})();
