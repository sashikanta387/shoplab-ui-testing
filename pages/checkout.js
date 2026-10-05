/* Checkout page: cart summary, forms, promo, gateway iframe, terms, confirmation. */
(function () {
  'use strict';
  const SL = window.ShopLab;
  const {
    $, $$, esc, money, round2, wait, EMAIL_RE, COUNTRIES, PROMOS, SHIPPING_RATES, FREE_SHIPPING_THRESHOLD, TAX_RATE,
    getProduct, productImage, Cart, lineMeta, Orders, Profile, Auth, toast, setBusy, createCombobox, makeSortable,
    downloadInvoice, downloadReceipt, formatCardNumber, formatExpiry, formatPhone, cardBrand, luhn, expiryError,
  } = SL;

  /** SecurePay widget rendered inside the payment iframe (srcdoc). */
  function gatewayWidgetHtml() {
    return '<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>SecurePay</title><style>' +
      ':root{color-scheme:light dark}body{margin:0;font:14px/1.45 system-ui,sans-serif;background:#fff;color:#111}' +
      '@media (prefers-color-scheme:dark){body{background:#171b2e;color:#e7e9f3}input{background:#0f1220!important;color:#e7e9f3!important;border-color:#2c3354!important}button{background:#fafaf9!important;color:#0b0b0c!important}}' +
      '.gw{padding:16px}header{display:flex;justify-content:space-between;align-items:center;margin-bottom:6px}' +
      '.tag{font-size:11px;font-weight:700;background:#fde68a;color:#78350f;padding:2px 6px;border-radius:4px}' +
      'label{display:block;font-size:12px;font-weight:600;margin:8px 0 3px}' +
      'input{width:100%;box-sizing:border-box;padding:9px 11px;border:1px solid #d6d3d1;border-radius:10px;font:inherit;font-family:ui-monospace,monospace}' +
      '.row{display:flex;gap:10px}.row>div{flex:1}' +
      'button{margin-top:12px;width:100%;padding:11px;border:0;border-radius:999px;background:#111;color:#fff;font:inherit;font-weight:700;cursor:pointer}' +
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
  SL.pages.checkout = function () {
    const form = $('#checkout-form');
    const state = { promo: null, gatewayToken: null, giftMessage: '', processing: false, lastOrder: null };
    const radioValue = (name) => form.elements.namedItem(name).value;
    const isCard = () => radioValue('paymentMethod') === 'card';
    const session = Auth.session();

    // ---- Totals -------------------------------------------------------------
    function totals() {
      const lines = Cart.lines();
      const count = lines.reduce((s, l) => s + l.qty, 0);
      const subtotal = round2(lines.reduce((s, l) => s + l.total, 0));
      let discount = 0;
      if (state.promo && state.promo.type === 'percent' && (!state.promo.min || subtotal >= state.promo.min)) {
        discount = round2(subtotal * state.promo.value / 100);
      }
      const method = radioValue('shipping');
      const freeStandard = subtotal >= FREE_SHIPPING_THRESHOLD || Boolean(state.promo && state.promo.type === 'shipping');
      const shipping = !lines.length ? 0 : method === 'standard' && freeStandard ? 0 : SHIPPING_RATES[method];
      const tax = round2((subtotal - discount) * TAX_RATE);
      const total = round2(subtotal - discount + shipping + tax);
      return { lines, count, subtotal, discount, shipping, tax, total, freeStandard };
    }

    // ---- Cart rendering -----------------------------------------------------
    const list = $('#cart-list');

    function cartItemHtml(l, i, all) {
      const p = l.product;
      return (
        '<li class="cart-item" draggable="true" data-id="' + esc(l.key) + '" data-key="' + esc(l.key) + '" data-product-id="' + p.id + '" data-testid="cart-item">' +
          '<span class="drag-handle" aria-hidden="true" data-testid="cart-item-drag-handle">⠿</span>' +
          '<img src="' + productImage(p) + '" alt="" width="56" height="56">' +
          '<div>' +
            '<p class="cart-item-name" data-testid="cart-item-name">' + esc(p.name) + '</p>' +
            '<p class="small muted cart-item-variant" data-testid="cart-item-meta">' + esc(lineMeta(l)) + '</p>' +
            '<div class="cart-item-meta">' +
              '<div class="qty qty-sm" role="group" aria-label="Quantity for ' + esc(p.name) + '">' +
                '<button type="button" data-action="dec" data-testid="cart-item-qty-decrement" aria-label="Decrease quantity of ' + esc(p.name) + '"' + (l.qty <= 1 ? ' disabled' : '') + '>−</button>' +
                '<input type="number" value="' + l.qty + '" min="1" max="' + p.stock + '" data-testid="cart-item-qty-input" aria-label="Quantity of ' + esc(p.name) + '">' +
                '<button type="button" data-action="inc" data-testid="cart-item-qty-increment" aria-label="Increase quantity of ' + esc(p.name) + '"' + (Cart.totalFor(p.id) >= p.stock ? ' disabled' : '') + '>+</button>' +
              '</div>' +
              '<span class="small muted">' + money(l.unitPrice) + ' each</span>' +
            '</div>' +
          '</div>' +
          '<div class="cart-item-actions">' +
            '<span class="cart-item-total" data-testid="cart-item-total">' + money(l.total) + '</span>' +
            '<div class="row" style="gap:.1rem">' +
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
      const key = btn.closest('[data-testid="cart-item"]').dataset.key;
      const items = Cart.items();
      const idx = items.findIndex((l) => l.key === key);
      const line = items[idx];
      switch (btn.dataset.action) {
        case 'inc': Cart.setQty(key, line.qty + 1); break;
        case 'dec': Cart.setQty(key, line.qty - 1); break;
        case 'remove':
          Cart.remove(key);
          toast(getProduct(line.id).name + ' removed from cart', 'info');
          break;
        case 'up':
        case 'down': {
          const keys = items.map((l) => l.key);
          const j = btn.dataset.action === 'up' ? idx - 1 : idx + 1;
          if (j < 0 || j >= keys.length) return;
          [keys[idx], keys[j]] = [keys[j], keys[idx]];
          Cart.reorder(keys);
          break;
        }
        default:
      }
    });
    list.addEventListener('change', (e) => {
      const input = e.target.closest('[data-testid="cart-item-qty-input"]');
      if (input) Cart.setQty(input.closest('[data-testid="cart-item"]').dataset.key, Number(input.value));
    });
    makeSortable([list], () => Cart.reorder($$(':scope > li', list).map((li) => li.dataset.key)));

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

    // ---- Prefill from profile / saved addresses ----------------------------
    const profile = Profile.get(session.user);
    $('#full-name').value = profile.name || '';
    $('#email').value = profile.email || '';
    if (profile.phone) $('#phone').value = profile.phone;
    const saved = [];
    Orders.mine().slice().reverse().forEach((o) => {
      const k = [o.address.line1, o.address.city, o.address.postalCode, o.address.country].join('|');
      if (!saved.some((s) => s.k === k)) saved.push({ k, a: o.address });
    });
    if (saved.length) {
      $('#saved-address-field').hidden = false;
      saved.forEach((s, i) => $('#saved-address').add(new Option(s.a.line1 + ', ' + s.a.city + ', ' + s.a.country, String(i))));
    }

    // ---- Promo code (2 s mock validation) ----------------------------------
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
    promoInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); applyPromo(); } });
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

    // ---- Input masks --------------------------------------------------------
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

    // ---- Country combobox + saved addresses --------------------------------
    const country = createCombobox({
      input: $('#country-input'),
      listbox: $('#country-listbox'),
      toggle: $('#country-toggle'),
      hidden: $('#country'),
      options: COUNTRIES.map((c) => ({ value: c, label: c })),
      testid: 'country-combobox',
      onSelect: (o) => { if (o) validateRule(ruleFor('country-input')); },
    });
    $('#saved-address').addEventListener('change', (e) => {
      const s = saved[Number(e.target.value)];
      if (!s) return;
      $('#address').value = s.a.line1;
      $('#city').value = s.a.city;
      $('#postal-code').value = s.a.postalCode;
      country.select(s.a.country);
      ['address', 'city', 'postal-code'].forEach((id) => validateRule(ruleFor(id)));
    });

    // ---- Delivery date ------------------------------------------------------
    const dateInput = $('#delivery-date');
    const tomorrow = new Date(Date.now() + 86400000);
    dateInput.min = tomorrow.toISOString().slice(0, 10);
    dateInput.max = new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10);

    // ---- Payment method + gateway iframe -----------------------------------
    const frame = $('#payment-gateway-frame');
    const gatewayStatus = $('#gateway-status');
    frame.srcdoc = gatewayWidgetHtml();

    function sendGatewayAmount(total) {
      if (frame.contentWindow) frame.contentWindow.postMessage({ type: 'shoplab:amount', formatted: money(total) }, '*');
    }

    function syncStepper() {
      const payStarted = cardNumber.value || state.gatewayToken || !isCard();
      $$('.stepper li').forEach((li) => {
        const s = li.dataset.step;
        li.classList.toggle('is-done', s === 'cart' || (s === 'details' && payStarted));
        li.classList.toggle('is-current', (s === 'details' && !payStarted) || (s === 'payment' && payStarted));
        li.toggleAttribute('aria-current', li.classList.contains('is-current'));
      });
    }

    form.addEventListener('change', (e) => {
      if (e.target.name !== 'paymentMethod') return;
      $('#card-fields').hidden = !isCard();
      $('#gateway-fields').hidden = isCard();
      syncStepper();
    });
    cardNumber.addEventListener('input', syncStepper);

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
        syncStepper();
      }
    });

    // ---- Native alert() / prompt() -----------------------------------------
    $('#help-alert-btn').addEventListener('click', () => {
      window.alert('Need help? Call 1-800-SHOPLAB or email support@shoplab.test');
    });
    $('#gift-message-btn').addEventListener('click', () => {
      const msg = window.prompt('Enter a gift message (max 100 characters):', state.giftMessage);
      if (msg === null) return;
      state.giftMessage = msg.trim().slice(0, 100);
      $('#gift-message-value').textContent = state.giftMessage || 'none';
    });

    // ---- Terms: checkbox gates submit; dialog unlocks after scrolling ------
    const terms = $('#agree-terms');
    const placeOrder = $('#place-order');
    const termsModal = $('#terms-modal');
    const termsScroll = $('#terms-scroll');
    const termsAccept = $('#terms-accept');
    terms.addEventListener('change', () => { placeOrder.disabled = !terms.checked; });
    placeOrder.disabled = !terms.checked;
    $('#open-terms').addEventListener('click', () => {
      termsScroll.scrollTop = 0;
      termsAccept.disabled = true;
      $('#terms-scroll-hint').textContent = 'Scroll to the bottom to enable “I agree”.';
      termsModal.showModal();
    });
    termsScroll.addEventListener('scroll', () => {
      if (termsScroll.scrollTop + termsScroll.clientHeight >= termsScroll.scrollHeight - 4) {
        termsAccept.disabled = false;
        $('#terms-scroll-hint').textContent = 'Thanks for reading.';
      }
    });
    termsAccept.addEventListener('click', () => {
      terms.checked = true;
      placeOrder.disabled = false;
      termsModal.close();
      toast('Terms accepted', 'success');
    });
    $('#terms-decline').addEventListener('click', () => {
      terms.checked = false;
      placeOrder.disabled = true;
      termsModal.close();
    });
    $('#terms-close').addEventListener('click', () => termsModal.close());

    // ---- Validation ---------------------------------------------------------
    const rules = [
      { field: 'full-name', label: 'Full name', test: (v) => (v.trim().length >= 2 ? '' : 'Enter your full name (at least 2 characters).') },
      { field: 'email', label: 'Email', test: (v) => (!v.trim() ? 'Email is required.' : EMAIL_RE.test(v.trim()) ? '' : 'Enter a valid email address, e.g. name@example.com.') },
      { field: 'phone', label: 'Phone', test: (v) => (!v || v.replace(/\D/g, '').length === 10 ? '' : 'Phone number must have 10 digits.') },
      { field: 'address', label: 'Street address', test: (v) => (v.trim().length >= 5 ? '' : 'Enter your street address.') },
      { field: 'city', label: 'City', test: (v) => (v.trim().length >= 2 ? '' : 'Enter your city.') },
      { field: 'postal-code', label: 'Postal code', test: (v) => (/^[A-Za-z0-9][A-Za-z0-9 -]{2,9}$/.test(v.trim()) ? '' : 'Enter a valid postal code.') },
      { field: 'country-input', errorId: 'country-error', label: 'Country', test: () => ($('#country').value ? '' : 'Select a country from the list.') },
      {
        field: 'delivery-date', label: 'Delivery date',
        test: (v) => {
          if (!v) return '';
          if (v < dateInput.min || v > dateInput.max) return 'Choose a date between tomorrow and 30 days from now.';
          return new Date(v + 'T12:00:00').getDay() === 0 ? 'We don’t deliver on Sundays.' : '';
        },
      },
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

    form.addEventListener('input', (e) => {
      e.target.dataset.touched = 'true';
      const rule = ruleFor(e.target.id);
      if (rule && e.target.getAttribute('aria-invalid') === 'true') validateRule(rule);
    });
    form.addEventListener('focusout', (e) => {
      const rule = ruleFor(e.target.id);
      if (rule && e.target.dataset.touched) validateRule(rule);
    });
    dateInput.addEventListener('change', () => validateRule(ruleFor('delivery-date')));

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

    // ---- Confirm order <dialog> --------------------------------------------
    const modal = $('#confirm-order-modal');
    const confirmBtn = $('#confirm-order-submit');
    const cancelBtn = $('#confirm-order-cancel');

    function openConfirm() {
      const t = totals();
      const row = (label, value, testid, strong) =>
        '<tr' + (testid ? ' data-testid="' + testid + '"' : '') + '><td>' + (strong ? '<strong>' + label + '</strong>' : label) + '</td><td>' + (strong ? '<strong>' + value + '</strong>' : value) + '</td></tr>';
      $('#confirm-order-lines').innerHTML =
        t.lines.map((l) => row(l.qty + ' × ' + esc(l.product.name) + '<br><span class="small muted">' + esc(lineMeta(l)) + '</span>', money(l.total), 'confirm-order-line')).join('') +
        '<tr><td colspan="2"><hr class="hr"></td></tr>' +
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
      e.preventDefault(); // Escape: same behaviour as Cancel
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
      const days = { standard: 6, express: 3, overnight: 1 }[radioValue('shipping')];
      const eta = dateInput.value || new Date(now.getTime() + days * 86400000).toISOString().slice(0, 10);
      const order = {
        id: Orders.newId(),
        user: session.user,
        date: now.toISOString(),
        status: 'processing',
        history: [{ status: 'processing', at: now.toISOString(), note: 'Order placed' }],
        customer: { name: $('#full-name').value.trim(), email: $('#email').value.trim(), phone: $('#phone').value.trim() },
        address: { line1: $('#address').value.trim(), city: $('#city').value.trim(), postalCode: $('#postal-code').value.trim(), country: $('#country').value },
        shipping: { method: radioValue('shipping'), slot: $('#delivery-slot').value, eta },
        payment: isCard() ? { method: 'card', last4: cardNumber.value.replace(/\D/g, '').slice(-4), brand: cardBrand(cardNumber.value.replace(/\D/g, '')) } : { method: 'gateway', token: state.gatewayToken },
        promo: state.promo ? state.promo.code : null,
        giftMessage: state.giftMessage,
        notes: $('#order-notes').value.trim(),
        items: t.lines.map((l) => ({ key: l.key, id: l.product.id, name: l.product.name, qty: l.qty, unitPrice: l.unitPrice, variant: l.variant, color: l.color, custom: l.custom, prescription: l.prescription })),
        totals: { subtotal: t.subtotal, discount: t.discount, shipping: t.shipping, tax: t.tax, total: t.total },
      };
      Orders.add(order);
      Profile.save(session.user, { phone: order.customer.phone || undefined });
      state.lastOrder = order;

      state.processing = false;
      setBusy(confirmBtn, false);
      cancelBtn.disabled = false;
      $('#confirm-order-close').disabled = false;
      modal.close('confirmed');
      Cart.clear();

      $('#checkout-view').hidden = true;
      $('#order-success').hidden = false;
      $$('.stepper li').forEach((li) => { li.classList.add('is-done'); li.classList.remove('is-current'); li.removeAttribute('aria-current'); });
      $('.stepper li[data-step="done"]').classList.add('is-current');
      $('#order-id').textContent = order.id;
      $('#order-total').textContent = money(order.totals.total);
      $('#order-email').textContent = order.customer.email;
      $('#order-eta').textContent = new Date(eta + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
      $('#view-order').href = 'order.html?id=' + encodeURIComponent(order.id);
      window.scrollTo(0, 0);
      toast('Order placed successfully!', 'success');
    });

    $('#download-invoice-csv').addEventListener('click', () => state.lastOrder && downloadInvoice(state.lastOrder));
    $('#download-receipt-pdf').addEventListener('click', () => state.lastOrder && downloadReceipt(state.lastOrder));

    renderCart();
    syncStepper();
  };
})();
