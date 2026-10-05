/* Home / catalog page: carousel, flash deals, categories, filters, grid, quick view. */
(function () {
  'use strict';
  const SL = window.ShopLab;
  const {
    $, $$, esc, money, clamp, wait, param, stars, plural, CATEGORY_LABELS, CATEGORY_EMOJI,
    Products, getProduct, productImage, Cart, Drawer, Recent, toast, setBusy, productCardHtml, bindCardWishlist,
  } = SL;

  const PAGE_SIZE = 8;

  // ---- Hero carousel -------------------------------------------------------
  function initCarousel() {
    const root = $('#hero-carousel');
    const slides = $$('[data-testid="carousel-slide"]', root);
    const dots = $$('[data-testid="carousel-dot"]', root);
    const track = $('.carousel-track', root);
    const pauseBtn = $('#carousel-pause');
    let index = 0;
    let timer = null;
    let paused = false;

    function go(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(' + (-index * 100) + '%)';
      root.dataset.activeIndex = String(index);
      slides.forEach((s, j) => {
        s.setAttribute('aria-hidden', String(j !== index));
        s.classList.toggle('is-active', j === index);
        $$('a, button', s).forEach((el) => { el.tabIndex = j === index ? 0 : -1; });
      });
      dots.forEach((d, j) => d.setAttribute('aria-selected', String(j === index)));
    }
    function schedule() {
      clearInterval(timer);
      if (!paused) timer = setInterval(() => go(index + 1), 6000);
    }
    $('#carousel-prev').addEventListener('click', () => { go(index - 1); schedule(); });
    $('#carousel-next').addEventListener('click', () => { go(index + 1); schedule(); });
    dots.forEach((d) => d.addEventListener('click', () => { go(Number(d.dataset.slide)); schedule(); }));
    pauseBtn.addEventListener('click', () => {
      paused = !paused;
      pauseBtn.setAttribute('aria-pressed', String(paused));
      pauseBtn.setAttribute('aria-label', paused ? 'Play slideshow' : 'Pause slideshow');
      pauseBtn.textContent = paused ? '▶' : '❚❚';
      schedule();
    });
    root.addEventListener('mouseenter', () => clearInterval(timer));
    root.addEventListener('mouseleave', schedule);
    root.addEventListener('focusin', () => clearInterval(timer));
    root.addEventListener('focusout', schedule);
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') { go(index - 1); schedule(); }
      if (e.key === 'ArrowRight') { go(index + 1); schedule(); }
    });
    go(0);
    schedule();
  }

  // ---- Flash deal countdown + scroller -----------------------------------
  function initDeals() {
    const KEY = 'shoplab.dealEndsAt';
    let ends = 0;
    try { ends = Number(sessionStorage.getItem(KEY)) || 0; } catch (_) { /* ignore */ }
    if (ends < Date.now()) {
      ends = Date.now() + (2 * 3600 + 45 * 60) * 1000;
      try { sessionStorage.setItem(KEY, String(ends)); } catch (_) { /* ignore */ }
    }
    const el = $('#deal-countdown');
    const pad = (n) => String(n).padStart(2, '0');
    function tick() {
      const left = Math.max(0, Math.round((ends - Date.now()) / 1000));
      el.dataset.remaining = String(left);
      $('[data-testid="deal-countdown-hours"]', el).textContent = pad(Math.floor(left / 3600));
      $('[data-testid="deal-countdown-minutes"]', el).textContent = pad(Math.floor((left % 3600) / 60));
      $('[data-testid="deal-countdown-seconds"]', el).textContent = pad(left % 60);
    }
    tick();
    setInterval(tick, 1000);

    const track = $('#deal-track');
    const deals = Products.visible().filter((p) => p.tags.includes('sale') || p.tags.includes('bestseller'));
    track.innerHTML = deals.map((p) => productCardHtml(p, { compact: true })).join('');
    bindCardWishlist(track);
    $('[data-testid="deal-scroll-prev"]').addEventListener('click', () => track.scrollBy({ left: -track.clientWidth * 0.8, behavior: 'smooth' }));
    $('[data-testid="deal-scroll-next"]').addEventListener('click', () => track.scrollBy({ left: track.clientWidth * 0.8, behavior: 'smooth' }));
  }

  // ---- Quick view ----------------------------------------------------------
  function initQuickView() {
    const modal = $('#quick-view-modal');
    const qty = $('#quick-view-qty');
    let product = null;

    function setQty(n) {
      qty.value = clamp(Math.floor(n) || 1, 1, Math.max(1, product.stock));
      $('#quick-view-dec').disabled = Number(qty.value) <= 1;
      $('#quick-view-inc').disabled = Number(qty.value) >= product.stock;
    }

    SL.openQuickView = function (id) {
      product = getProduct(id);
      $('#quick-view-image').src = productImage(product);
      $('#quick-view-image').alt = product.name;
      $('#quick-view-category').textContent = CATEGORY_LABELS[product.category];
      $('#quick-view-title').textContent = product.name;
      $('#quick-view-rating').innerHTML = stars(product.rating) + '<span>' + product.rating.toFixed(1) + '</span>';
      $('#quick-view-price').textContent = money(product.price);
      $('#quick-view-desc').textContent = product.short;
      $('#quick-view-variant').innerHTML = product.options.map((o) => '<option>' + esc(o) + '</option>').join('');
      $('#quick-view-color').innerHTML = product.colors.map((c) => '<option>' + esc(c.name) + '</option>').join('');
      $('#quick-view-details').href = 'product-detail.html?id=' + product.id;
      const out = product.stock <= 0;
      const add = $('#quick-view-add');
      add.disabled = out || product.requiresPrescription;
      add.textContent = out ? 'Out of stock' : product.requiresPrescription ? 'Prescription required' : 'Add to Cart';
      setQty(1);
      modal.showModal();
    };

    $('#quick-view-dec').addEventListener('click', () => setQty(Number(qty.value) - 1));
    $('#quick-view-inc').addEventListener('click', () => setQty(Number(qty.value) + 1));
    qty.addEventListener('change', () => setQty(Number(qty.value)));
    $('#quick-view-close').addEventListener('click', () => modal.close());
    modal.addEventListener('click', (e) => { if (e.target === modal) modal.close(); });
    $('#quick-view-form').addEventListener('submit', async (e) => {
      e.preventDefault();
      const btn = $('#quick-view-add');
      setBusy(btn, true, 'Adding…');
      await wait(500);
      const added = Cart.add(product.id, Number(qty.value), { variant: $('#quick-view-variant').value, color: $('#quick-view-color').value });
      setBusy(btn, false);
      if (!added) { toast('No more stock available for ' + product.name, 'error'); return; }
      modal.close();
      toast('Added ' + added + ' × ' + product.name + ' to cart', 'success');
      Drawer.open();
    });
  }

  // ---- Catalog -------------------------------------------------------------
  function initCatalog() {
    const form = $('#filters-form');
    const grid = $('#product-grid');
    const search = $('#search-input');
    const category = $('#category-filter');
    const range = $('#price-range');
    const inStock = $('#in-stock-only');
    const sort = $('#sort-select');
    const loadMore = $('#load-more');
    const pendingQty = {};
    let visibleCount = PAGE_SIZE;
    let ready = false;

    // Category tiles with counts.
    const tiles = $('#category-tiles');
    tiles.innerHTML = Object.keys(CATEGORY_LABELS).map((k) => {
      const n = Products.visible().filter((p) => p.category === k).length;
      return '<a href="index.html?category=' + k + '#catalog" class="category-tile" data-category-link="' + k + '" data-testid="category-tile-' + k + '" aria-label="Shop ' + esc(CATEGORY_LABELS[k]) + '">' +
        '<span class="category-emoji" aria-hidden="true">' + CATEGORY_EMOJI[k] + '</span><span>' + esc(CATEGORY_LABELS[k].split(' ')[0]) + '</span><span class="small muted">' + plural(n, 'item') + '</span></a>';
    }).join('');

    // Deep links: ?q= ?category= ?tag=
    if (param('q')) search.value = param('q');
    if (param('category') && CATEGORY_LABELS[param('category')]) category.value = param('category');
    if (param('tag')) { const chip = $('#tag-' + param('tag')); if (chip) chip.checked = true; }

    function filtered() {
      const q = search.value.trim().toLowerCase();
      const tags = $$('input[name="tags"]:checked', form).map((i) => i.value);
      const max = Number(range.value);
      const list = Products.visible().filter((p) =>
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

    function renderActiveFilters() {
      const chips = [];
      if (search.value.trim()) chips.push(['search', 'Search: “' + search.value.trim() + '”']);
      if (category.value !== 'all') chips.push(['category', CATEGORY_LABELS[category.value]]);
      $$('input[name="tags"]:checked', form).forEach((i) => chips.push(['tag:' + i.value, 'Tag: ' + i.value]));
      if (Number(range.value) < 500) chips.push(['price', 'Under $' + range.value]);
      if (inStock.checked) chips.push(['stock', 'In stock']);
      $('#active-filters').innerHTML = chips.map(([k, l]) =>
        '<button type="button" class="filter-pill" data-clear="' + esc(k) + '" data-testid="active-filter-chip" aria-label="Remove filter ' + esc(l) + '">' + esc(l) + ' <span aria-hidden="true">×</span></button>').join('') +
        (chips.length > 1 ? '<button type="button" class="link-btn small" data-clear="all" data-testid="active-filters-clear-all">Clear all</button>' : '');
      $$('[data-category-link]').forEach((t) => t.setAttribute('aria-current', String(t.dataset.categoryLink === category.value)));
    }

    function render() {
      if (!ready) return;
      $('#price-range-value').textContent = '$' + range.value;
      range.setAttribute('aria-valuetext', '$' + range.value);
      renderActiveFilters();
      const list = filtered();
      const shown = list.slice(0, visibleCount);
      $('#results-count').textContent = 'Showing ' + shown.length + ' of ' + list.length + ' products';
      if (!list.length) {
        grid.dataset.state = 'empty';
        grid.innerHTML =
          '<div class="empty-state" data-testid="catalog-empty-state" style="grid-column:1/-1">' +
          '<span class="emoji" aria-hidden="true">🔎</span><strong>No products match your filters.</strong>' +
          '<button type="button" class="btn btn-sm" id="empty-reset" data-testid="catalog-empty-reset">Clear filters</button></div>';
      } else {
        grid.dataset.state = 'ready';
        grid.innerHTML = shown.map((p) => productCardHtml(p, { qty: pendingQty[p.id] || 1 })).join('');
      }
      const more = list.length - shown.length;
      loadMore.hidden = more <= 0;
      loadMore.textContent = 'Load ' + Math.min(more, PAGE_SIZE) + ' more';
      $('#load-more-text').textContent = list.length ? 'You’ve viewed ' + shown.length + ' of ' + list.length + ' products' : '';
      $('#load-more-bar').style.width = (list.length ? Math.round((shown.length / list.length) * 100) : 0) + '%';
    }

    function refresh() {
      visibleCount = PAGE_SIZE;
      render();
    }

    function resetFilters() {
      form.reset();
      refresh();
    }

    form.addEventListener('input', refresh);
    form.addEventListener('change', refresh);
    form.addEventListener('submit', (e) => e.preventDefault());
    sort.addEventListener('change', render);
    $('#reset-filters').addEventListener('click', resetFilters);

    $('#active-filters').addEventListener('click', (e) => {
      const b = e.target.closest('[data-clear]');
      if (!b) return;
      const k = b.dataset.clear;
      if (k === 'all') { resetFilters(); return; }
      if (k === 'search') search.value = '';
      if (k === 'category') category.value = 'all';
      if (k === 'price') range.value = '500';
      if (k === 'stock') inStock.checked = false;
      if (k.startsWith('tag:')) $('#tag-' + k.slice(4)).checked = false;
      refresh();
    });

    $$('[data-category-link]').forEach((tile) => tile.addEventListener('click', (e) => {
      e.preventDefault();
      category.value = tile.dataset.categoryLink;
      refresh();
      $('#catalog').scrollIntoView({ block: 'start' });
    }));

    loadMore.addEventListener('click', async () => {
      setBusy(loadMore, true, 'Loading…');
      grid.setAttribute('aria-busy', 'true');
      await wait(800);
      visibleCount += PAGE_SIZE;
      setBusy(loadMore, false);
      grid.removeAttribute('aria-busy');
      render();
    });

    function syncQty(card, p) {
      const q = pendingQty[p.id] || 1;
      $('[data-testid="product-qty-input"]', card).value = q;
      $('[data-action="dec"]', card).disabled = q <= 1;
      $('[data-action="inc"]', card).disabled = q >= p.stock;
    }

    bindCardWishlist(grid);
    grid.addEventListener('click', async (e) => {
      if (e.target.closest('#empty-reset')) { resetFilters(); return; }
      const btn = e.target.closest('button[data-action]');
      if (!btn) return;
      const card = btn.closest('[data-testid="product-card"]');
      const p = getProduct(card.dataset.productId);
      const action = btn.dataset.action;
      if (action === 'quick-view') { SL.openQuickView(p.id); return; }
      if (action === 'inc' || action === 'dec') {
        pendingQty[p.id] = clamp((pendingQty[p.id] || 1) + (action === 'inc' ? 1 : -1), 1, p.stock);
        syncQty(card, p);
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
          syncQty(card, p);
          Drawer.open();
          setTimeout(() => {
            btn.classList.remove('is-added');
            btn.textContent = 'Add to Cart';
            delete btn.dataset.state;
          }, 1500);
        } else {
          toast('You already have all ' + p.stock + ' available units of ' + p.name + ' in your cart.', 'error');
        }
      }
    });
    grid.addEventListener('change', (e) => {
      const input = e.target.closest('[data-testid="product-qty-input"]');
      if (!input) return;
      const card = input.closest('[data-testid="product-card"]');
      const p = getProduct(card.dataset.productId);
      pendingQty[p.id] = clamp(Math.floor(Number(input.value)) || 1, 1, p.stock);
      syncQty(card, p);
    });

    // Simulated network latency (skeleton cards) so tests have to wait.
    setTimeout(() => {
      ready = true;
      grid.removeAttribute('aria-busy');
      render();
    }, 700);
  }

  function initRecent() {
    const ids = Recent.ids();
    if (!ids.length) return;
    $('#recently-viewed').hidden = false;
    const grid = $('#recent-grid');
    grid.innerHTML = ids.map((id) => productCardHtml(getProduct(id), { compact: true })).join('');
    bindCardWishlist(grid);
  }

  SL.pages.catalog = function () {
    initCarousel();
    initDeals();
    initQuickView();
    initCatalog();
    initRecent();
  };
})();
