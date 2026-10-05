/* Order details + carrier tracking iframe (with nested map iframe). */
(function () {
  'use strict';
  const SL = window.ShopLab;
  const {
    $, esc, money, param, fmtDate, fmtDateTime, SHIPPING_LABELS, ORDER_STATUS,
    getProduct, productImage, Auth, Orders, lineMeta, carrierName, toast, statusBadge, downloadInvoice, downloadReceipt,
  } = SL;

  /** Carrier widget rendered inside the tracking iframe. Data arrives via postMessage. */
  const TRACKING_WIDGET = `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><title>SwiftTrack</title><style>
:root{color-scheme:light dark}
body{margin:0;font:14px/1.45 system-ui,sans-serif;background:#fff;color:#111}
@media (prefers-color-scheme:dark){body{background:#131315;color:#f5f5f4}.card{background:#1b1b1e!important}.ev{border-color:#2a2a2e!important}button{background:#fafaf9!important;color:#0b0b0c!important}}
.wrap{padding:16px}
header{display:flex;justify-content:space-between;align-items:center;margin-bottom:8px}
.brand{font-weight:800;letter-spacing:-.02em}
.tag{font-size:11px;font-weight:700;background:#fde68a;color:#78350f;padding:2px 6px;border-radius:4px}
.card{background:#f5f5f4;border-radius:12px;padding:12px;margin:8px 0}
.status{font-size:18px;font-weight:700;margin:2px 0}
iframe{width:100%;height:130px;border:0;border-radius:12px;display:block;margin:10px 0}
ol{list-style:none;margin:0;padding:0;max-height:120px;overflow:auto}
.ev{display:flex;gap:10px;padding:6px 0;border-bottom:1px solid #e7e5e4;font-size:13px}
.ev time{color:#78716c;min-width:110px}
.foot{display:flex;align-items:center;gap:10px;margin-top:10px}
button{padding:8px 16px;border:0;border-radius:999px;background:#111;color:#fff;font:inherit;font-weight:600;cursor:pointer}
button:disabled{opacity:.6;cursor:progress}
.muted{color:#78716c;font-size:12px}
</style></head><body data-testid="tracking-body"><div class="wrap">
<header><span class="brand">📦 SwiftTrack</span><span class="tag" id="tk-carrier" data-testid="tracking-carrier">—</span></header>
<div class="card">
<div class="muted">Tracking number</div>
<div><strong id="tk-number" data-testid="tracking-number">Not yet assigned</strong></div>
<div class="status" id="tk-status" data-testid="tracking-status">Loading…</div>
<div class="muted" id="tk-eta" data-testid="tracking-eta"></div>
</div>
<iframe id="tk-map" title="Delivery route map" data-testid="tracking-map-iframe"></iframe>
<ol id="tk-events" data-testid="tracking-events" aria-label="Tracking events"></ol>
<div class="foot"><button type="button" id="tk-refresh" data-testid="tracking-refresh-btn">Refresh status</button><span class="muted" id="tk-updated" data-testid="tracking-last-updated"></span></div>
</div><script>
(function(){
  var $=function(id){return document.getElementById(id);};
  function mapHtml(pct,label,color){
    return '<!DOCTYPE html><html><head><meta charset="utf-8"><style>'+
      'body{margin:0;height:130px;font:12px system-ui,sans-serif;background:linear-gradient(135deg,#e0f2fe,#ecfdf5);position:relative;overflow:hidden;color:#0f172a}'+
      '.road{position:absolute;left:8%;right:8%;top:60px;height:6px;border-radius:3px;background:#cbd5e1}'+
      '.done{position:absolute;left:8%;top:60px;height:6px;border-radius:3px;background:'+color+';width:'+(pct*0.84)+'%}'+
      '.pin{position:absolute;top:50px;font-size:20px}.truck{position:absolute;top:30px;font-size:26px;transform:translateX(-50%);transition:left .6s}'+
      '.lbl{position:absolute;left:0;right:0;bottom:10px;text-align:center;font-weight:600}'+
      '</style></head><body data-testid="map-body">'+
      '<div class="road"></div><div class="done"></div>'+
      '<span class="pin" style="left:5%">🏭</span><span class="pin" style="right:5%">🏠</span>'+
      '<span class="truck" data-testid="map-truck" data-progress="'+pct+'" style="left:'+(8+pct*0.84)+'%">🚚</span>'+
      '<div class="lbl" data-testid="map-location">'+label+'</div></body></html>';
  }
  function render(d){
    $('tk-carrier').textContent=d.carrier||'Awaiting carrier';
    $('tk-number').textContent=d.number||'Not yet assigned';
    $('tk-status').textContent=d.statusText;
    $('tk-status').setAttribute('data-status',d.status);
    $('tk-eta').textContent=d.eta?('Estimated delivery: '+d.eta):'';
    $('tk-map').srcdoc=mapHtml(d.progress,d.location,d.status==='cancelled'?'#dc2626':'#16a34a');
    var ol=$('tk-events');ol.innerHTML='';
    d.events.slice().reverse().forEach(function(ev){
      var li=document.createElement('li');li.className='ev';li.setAttribute('data-testid','tracking-event');
      var t=document.createElement('time');t.textContent=ev.at;var s=document.createElement('span');s.textContent=ev.text;
      li.appendChild(t);li.appendChild(s);ol.appendChild(li);
    });
    $('tk-updated').textContent='Last checked '+new Date().toLocaleTimeString();
    var b=$('tk-refresh');b.disabled=false;b.textContent='Refresh status';
  }
  window.addEventListener('message',function(e){if(e.data&&e.data.type==='shoplab:tracking-data')render(e.data.data);});
  $('tk-refresh').addEventListener('click',function(){
    var b=$('tk-refresh');b.disabled=true;b.textContent='Checking…';$('tk-updated').textContent='Contacting carrier…';
    parent.postMessage({type:'shoplab:tracking-refresh'},'*');
  });
  parent.postMessage({type:'shoplab:tracking-ready'},'*');
})();
</script></body></html>`;

  SL.pages.order = function () {
    const id = param('id');
    const session = Auth.session();
    const load = () => {
      const o = Orders.get(id);
      return o && (o.user === session.user || Auth.isAdmin()) ? o : null;
    };
    let order = load();
    if (!order) { $('#order-not-found').hidden = false; return; }
    $('#order-content').hidden = false;
    document.title = 'ShopLab — Order ' + order.id;

    const frame = $('#tracking-frame');

    function trackingData(o) {
      const fmt = (iso) => fmtDateTime(iso);
      const t = o.tracking || {};
      const progress = { processing: 8, shipped: 58, delivered: 100, return_requested: 100, returned: 100, return_rejected: 100, cancelled: 0 }[o.status];
      const statusText = {
        processing: 'Label created — awaiting pickup', shipped: 'In transit', delivered: 'Delivered',
        return_requested: 'Delivered · return requested', returned: 'Returned to sender', return_rejected: 'Delivered', cancelled: 'Shipment cancelled',
      }[o.status];
      const location = { processing: 'ShopLab warehouse', shipped: 'Regional distribution centre', cancelled: 'Cancelled at warehouse' }[o.status] || 'Delivered to ' + o.address.city;
      const events = (o.history || []).map((h) => ({ at: fmt(h.at), text: (ORDER_STATUS[h.status] || {}).label + (h.note ? ' — ' + h.note : '') }));
      return {
        status: o.status, statusText, progress, location, events,
        carrier: t.carrier ? carrierName(t.carrier) : '', number: t.number || '',
        eta: o.status === 'shipped' || o.status === 'processing' ? fmtDate(o.shipping.eta + 'T12:00:00') : '',
      };
    }
    function sendTracking() {
      if (frame.contentWindow) frame.contentWindow.postMessage({ type: 'shoplab:tracking-data', data: trackingData(order) }, '*');
    }

    function render() {
      const o = order;
      $('#order-breadcrumb-id').textContent = o.id;
      $('#order-number').textContent = o.id;
      $('#order-date').textContent = fmtDate(o.date);
      $('#order-status').innerHTML = statusBadge(o.status, 'order-status-badge');

      // Contextual actions.
      $('#order-cancel').hidden = o.status !== 'processing';
      const ret = $('#order-return');
      ret.hidden = o.status !== 'delivered';
      ret.href = 'account.html?order=' + encodeURIComponent(o.id) + '#returns';

      const banner = $('#order-banner');
      const msg = {
        processing: ['alert-info', 'We’re preparing your order. You can still cancel it.'],
        shipped: ['alert-info', 'Your order is on its way with ' + carrierName((o.tracking || {}).carrier) + '.'],
        delivered: ['alert-success', 'Delivered. Not right? You can return items within 30 days.'],
        cancelled: ['alert-error', 'This order was cancelled. You have not been charged.'],
        return_requested: ['alert-warning', 'Return ' + (o.returnRequest ? o.returnRequest.id : '') + ' is awaiting review.'],
        returned: ['alert-success', 'Your return was approved and a refund of ' + money(o.totals.total) + ' was issued.'],
        return_rejected: ['alert-error', 'Your return was rejected' + (o.returnRequest && o.returnRequest.decisionNote ? ': ' + o.returnRequest.decisionNote : '.')],
      }[o.status];
      banner.className = 'alert ' + msg[0];
      banner.textContent = msg[1];
      banner.dataset.status = o.status;
      banner.hidden = false;

      // Timeline.
      const at = (st) => { const h = (o.history || []).filter((x) => x.status === st).pop(); return h ? fmtDateTime(h.at) : ''; };
      const steps = o.status === 'cancelled'
        ? [['processing', 'Order placed'], ['cancelled', 'Cancelled']]
        : [['processing', 'Order placed'], ['shipped', 'Shipped'], ['delivered', 'Delivered']]
          .concat(o.returnRequest ? [['return_requested', 'Return requested'], [o.status === 'return_rejected' ? 'return_rejected' : 'returned', o.status === 'return_rejected' ? 'Return rejected' : 'Refunded']] : []);
      const order_ = steps.map((s) => s[0]);
      const reached = Math.max(0, order_.indexOf(o.status));
      $('#order-timeline').innerHTML = steps.map(([st, label], i) =>
        '<li class="' + (i < reached ? 'is-done' : i === reached ? 'is-current' : '') + '" data-testid="order-timeline-step" data-step="' + st + '"' + (i === reached ? ' aria-current="step"' : '') + '>' +
          '<span class="dot" aria-hidden="true">' + (i < reached || (i === reached && ['delivered', 'returned'].includes(st)) ? '✓' : i + 1) + '</span>' +
          '<strong>' + label + '</strong><span class="small muted">' + (at(st) || '&nbsp;') + '</span></li>').join('');

      // Items.
      $('#order-items').innerHTML = o.items.map((i) => {
        const p = getProduct(i.id);
        return '<li class="order-item" data-testid="order-item">' +
          '<img src="' + productImage(p) + '" alt="" width="64" height="64">' +
          '<div><a href="product-detail.html?id=' + i.id + '" data-testid="order-item-name">' + esc(i.name) + '</a><br><span class="small muted" data-testid="order-item-meta">' + esc(lineMeta(i)) + '</span></div>' +
          '<span class="small muted">× ' + i.qty + '</span><strong>' + money(i.unitPrice * i.qty) + '</strong></li>';
      }).join('');

      const t = o.totals;
      $('#order-totals').innerHTML =
        '<div><dt>Subtotal</dt><dd>' + money(t.subtotal) + '</dd></div>' +
        (t.discount ? '<div><dt>Discount' + (o.promo ? ' (' + esc(o.promo) + ')' : '') + '</dt><dd class="discount-value">−' + money(t.discount) + '</dd></div>' : '') +
        '<div><dt>Shipping</dt><dd>' + (t.shipping ? money(t.shipping) : 'FREE') + '</dd></div>' +
        '<div><dt>Tax</dt><dd>' + money(t.tax) + '</dd></div>' +
        '<div class="total-row"><dt>Total</dt><dd data-testid="order-detail-total">' + money(t.total) + '</dd></div>';

      $('#order-address').innerHTML = esc(o.customer.name) + '<br>' + esc(o.address.line1) + '<br>' + esc(o.address.city) + ' ' + esc(o.address.postalCode) + '<br>' + esc(o.address.country);
      $('#order-shipping-method').textContent = SHIPPING_LABELS[o.shipping.method] + ' · ' + o.shipping.slot + ' delivery';
      $('#order-payment').textContent = o.payment.method === 'card' ? (o.payment.brand || 'Card') + ' ending ' + o.payment.last4 : 'SecurePay (' + o.payment.token + ')';
      $('#order-extras').hidden = !o.giftMessage && !o.notes;
      $('#order-gift').textContent = o.giftMessage ? '🎁 “' + o.giftMessage + '”' : '';
      $('#order-notes').textContent = o.notes || '';

      sendTracking();
    }

    // Tracking widget messaging (refresh re-reads the latest status after a delay).
    window.addEventListener('message', (e) => {
      if (e.source !== frame.contentWindow || !e.data) return;
      if (e.data.type === 'shoplab:tracking-ready') sendTracking();
      if (e.data.type === 'shoplab:tracking-refresh') {
        setTimeout(() => { order = load() || order; render(); }, 1200);
      }
    });
    frame.srcdoc = TRACKING_WIDGET;

    $('#order-invoice').addEventListener('click', () => downloadInvoice(order));
    $('#order-receipt').addEventListener('click', () => downloadReceipt(order));
    $('#order-help').addEventListener('click', () => window.alert('Questions about ' + order.id + '? Email support@shoplab.test or call 1-800-SHOPLAB.'));
    $('#order-cancel').addEventListener('click', () => {
      if (!window.confirm('Cancel order ' + order.id + '? This cannot be undone.')) return;
      order = Orders.update(order.id, (o) => Orders.setStatus(o, 'cancelled', 'Cancelled by customer'));
      render();
      toast('Order cancelled', 'success');
    });
    document.addEventListener('orders:change', () => { order = load() || order; render(); });

    render();
  };
})();
