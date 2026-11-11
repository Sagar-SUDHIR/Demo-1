/* =====================================================
   The Mango Store - interactions
   ===================================================== */
(function () {
  'use strict';

  /* ---------- data ---------- */
  const SIZES = [
    { g: 100,  label: '100 g', price: 70 },
    { g: 200,  label: '200 g', price: 140 },
    { g: 500,  label: '500 g', price: 270 },
    { g: 1000, label: '1 kg',  price: 500 }
  ];

  const PRODUCTS = [
    {
      id: 'classic',
      name: 'Classic Mango Roll',
      alt: 'Mambalam / Mavina Hannu Sihi',
      badge: 'Best seller',
      art: 'roll',
      rating: 4.9, reviews: 214,
      desc: 'Sweet, juicy and tangy. Thin sun-dried layers of ripe mango, rolled by hand.'
    },
    {
      id: 'tandra',
      name: 'Mamidi Tandra Slab',
      alt: 'Andhra-style layered mango slab',
      badge: 'Andhra special',
      art: 'slab',
      rating: 4.7, reviews: 137,
      desc: 'Thick layered mango pulp with a hint of jaggery. Chewy, deep and rich.'
    }
  ];

  const REVIEWS = [
    { n: 'Lakshmi R.', c: 'Mysuru',    s: 5, t: 'Tastes exactly like what my grandmother dried on the terrace every summer. The tang is perfect.' },
    { n: 'Arun Nair',  c: 'Kochi',     s: 5, t: 'Ordered the 500 g pack and it was gone in two days. The kids keep asking for more.' },
    { n: 'Sravani K.', c: 'Vijayawada',s: 5, t: 'The tandra slab is properly layered, not sugary like the shop ones. Real mango flavour.' },
    { n: 'Rohit M.',   c: 'Bengaluru', s: 4, t: 'Fresh, soft and well packed. Delivered in 3 days. I will try the 1 kg pack next.' },
    { n: 'Deepa S.',   c: 'Chennai',   s: 5, t: 'Bought it as a gift for my parents abroad. They loved it and asked where I got it.' }
  ];

  /* ---------- helpers ---------- */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const rupee = n => '₹' + n.toLocaleString('en-IN');
  const stars = n => '★'.repeat(Math.round(n)) + '☆'.repeat(5 - Math.round(n));
  const esc = s => s.replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));

  const FREE_SHIP = 499, SHIP_FEE = 49;

  /* ---------- toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
  }

  /* ---------- header + menu ---------- */
  const header = $('#header');
  window.addEventListener('scroll', () => header.classList.toggle('scrolled', scrollY > 10), { passive: true });

  const burger = $('#burger'), menu = $('#menu');
  function closeMenu() { burger.classList.remove('open'); menu.classList.remove('open'); burger.setAttribute('aria-expanded', 'false'); }
  burger.addEventListener('click', () => {
    const open = burger.classList.toggle('open');
    menu.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', open);
  });
  $$('a', menu).forEach(a => a.addEventListener('click', closeMenu));

  // active link highlight
  const links = $$('a', menu);
  const secObs = new IntersectionObserver(es => {
    es.forEach(e => {
      if (e.isIntersecting) links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#' + e.target.id));
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  ['heritage', 'shop', 'making', 'reviews', 'faq'].forEach(id => secObs.observe($('#' + id)));

  /* ---------- products ---------- */
  function artHTML(type) {
    const leaf = '<svg class="leafy" viewBox="0 0 300 120" style="aspect-ratio:300/120"><use href="#leaf"/></svg>';
    if (type === 'slab') {
      return leaf + '<svg class="pa slab" viewBox="0 0 200 130"><use href="#slab"/></svg>';
    }
    return leaf +
      '<svg class="pa a1" viewBox="0 0 200 120"><use href="#roll"/></svg>' +
      '<svg class="pa a2" viewBox="0 0 200 120"><use href="#roll"/></svg>';
  }

  const state = {}; // chosen size index per product
  function renderProducts() {
    $('#products').innerHTML = PRODUCTS.map(p => {
      state[p.id] = 0;
      return `
      <article class="product reveal" data-id="${p.id}">
        <div class="p-art ${p.art}-bg">
          <span class="badge">${p.badge}</span>
          ${artHTML(p.art)}
        </div>
        <div class="p-body">
          <h3>${p.name}</h3>
          <p class="alt">${p.alt}</p>
          <div class="rating"><span class="stars" aria-hidden="true">${stars(p.rating)}</span> ${p.rating} (${p.reviews} reviews)</div>
          <p class="desc">${p.desc}</p>
          <div class="sizes" role="radiogroup" aria-label="Pack size">
            ${SIZES.map((s, i) => `<button class="size ${i === 0 ? 'on' : ''}" role="radio" aria-checked="${i === 0}" data-i="${i}">${s.label}</button>`).join('')}
          </div>
          <div class="p-buy">
            <div class="price"><span class="amt">${rupee(SIZES[0].price)}</span><small class="per">${rupee(SIZES[0].price * 10)} per kg</small></div>
            <button class="btn btn-primary add">Add to cart</button>
          </div>
        </div>
      </article>`;
    }).join('');
  }

  $('#products').addEventListener('click', e => {
    const card = e.target.closest('.product');
    if (!card) return;
    const id = card.dataset.id;

    const sizeBtn = e.target.closest('.size');
    if (sizeBtn) {
      const i = +sizeBtn.dataset.i;
      state[id] = i;
      $$('.size', card).forEach(b => { const on = b === sizeBtn; b.classList.toggle('on', on); b.setAttribute('aria-checked', on); });
      const amt = $('.amt', card);
      amt.textContent = rupee(SIZES[i].price);
      $('.per', card).textContent = rupee(Math.round(SIZES[i].price * (1000 / SIZES[i].g))) + ' per kg';
      amt.parentElement.classList.remove('pop'); void amt.offsetWidth; amt.parentElement.classList.add('pop');
      return;
    }
    if (e.target.closest('.add')) {
      addToCart(id, state[id]);
    }
  });

  /* ---------- cart ---------- */
  let cart = [];
  try { cart = JSON.parse(localStorage.getItem('mangoCart') || '[]'); } catch (_) { cart = []; }
  const save = () => { try { localStorage.setItem('mangoCart', JSON.stringify(cart)); } catch (_) {} };

  function addToCart(pid, si) {
    const key = pid + '-' + si;
    const found = cart.find(c => c.key === key);
    if (found) found.qty++;
    else cart.push({ key, pid, si, qty: 1 });
    save(); renderCart();
    const p = PRODUCTS.find(x => x.id === pid);
    toast(`${p.name} (${SIZES[si].label}) added`);
    const cc = $('#cartCount'); cc.classList.add('bump'); setTimeout(() => cc.classList.remove('bump'), 250);
  }

  function renderCart() {
    const box = $('#cartItems');
    const count = cart.reduce((a, c) => a + c.qty, 0);
    $('#cartCount').textContent = count;

    if (!cart.length) {
      box.innerHTML = '<div class="empty"><svg viewBox="0 0 70 76"><use href="#mango"/></svg><p>Your cart is empty.<br>Add a mango roll to begin.</p></div>';
    } else {
      box.innerHTML = cart.map(c => {
        const p = PRODUCTS.find(x => x.id === c.pid), s = SIZES[c.si];
        return `
        <div class="c-item" data-key="${c.key}">
          <div class="c-thumb"><svg viewBox="0 0 ${p.art === 'slab' ? '200 130' : '200 120'}"><use href="#${p.art}"/></svg></div>
          <div>
            <h4>${p.name}</h4><small>${s.label}</small>
            <div class="qty"><button data-a="dec" aria-label="Decrease">−</button><span>${c.qty}</span><button data-a="inc" aria-label="Increase">+</button></div>
          </div>
          <div><div class="c-price">${rupee(s.price * c.qty)}</div><button class="c-rm" data-a="rm">Remove</button></div>
        </div>`;
      }).join('');
    }

    const sub = cart.reduce((a, c) => a + SIZES[c.si].price * c.qty, 0);
    const ship = !sub || sub >= FREE_SHIP ? 0 : SHIP_FEE;
    $('#subTotal').textContent = rupee(sub);
    $('#shipping').textContent = ship ? rupee(ship) : (sub ? 'Free' : '₹0');
    $('#grandTotal').textContent = rupee(sub + ship);
    $('#shipNote').textContent = !sub ? '' : sub >= FREE_SHIP ? 'You get free delivery.' : `Add ${rupee(FREE_SHIP - sub)} more for free delivery.`;
    $('#checkout').disabled = !cart.length;
  }

  $('#cartItems').addEventListener('click', e => {
    const btn = e.target.closest('[data-a]');
    if (!btn) return;
    const key = btn.closest('.c-item').dataset.key;
    const item = cart.find(c => c.key === key);
    if (!item) return;
    const a = btn.dataset.a;
    if (a === 'inc') item.qty++;
    if (a === 'dec') item.qty--;
    if (a === 'rm' || item.qty <= 0) cart = cart.filter(c => c.key !== key);
    save(); renderCart();
  });

  const drawer = $('#drawer'), overlay = $('#overlay');
  function openCart() { drawer.classList.add('open'); overlay.classList.add('show'); drawer.setAttribute('aria-hidden', 'false'); }
  function closeCart() { drawer.classList.remove('open'); overlay.classList.remove('show'); drawer.setAttribute('aria-hidden', 'true'); }
  $('#openCart').addEventListener('click', openCart);
  $('#closeCart').addEventListener('click', closeCart);
  overlay.addEventListener('click', closeCart);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { closeCart(); closeModal(); closeMenu(); } });

  /* checkout (front-end demo: connect to your payment / order backend here) */
  const modal = $('#modal');
  function closeModal() { modal.classList.remove('show'); }
  $('#mClose').addEventListener('click', closeModal);
  modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  $('#checkout').addEventListener('click', () => {
    const sub = cart.reduce((a, c) => a + SIZES[c.si].price * c.qty, 0);
    const total = sub + (sub >= FREE_SHIP ? 0 : SHIP_FEE);
    const id = 'MS' + Math.floor(10000 + Math.random() * 90000);
    $('#mText').textContent = `Thank you! Your order ${id} for ${rupee(total)} is confirmed. We will pack your mango rolls fresh.`;
    cart = []; save(); renderCart(); closeCart();
    modal.classList.add('show');
  });

  /* ---------- reviews slider ---------- */
  let idx = 0, timer;
  function renderReviews() {
    $('#slides').innerHTML = REVIEWS.map(r => `
      <div class="slide"><figure class="quote">
        <span class="stars" aria-label="${r.s} out of 5">${stars(r.s)}</span>
        <p>${esc(r.t)}</p>
        <figcaption class="who"><span class="avatar" style="background:${['#1F5C34','#E4572E','#C98A00','#4C9A4F','#A9480F'][r.n.length % 5]}">${esc(r.n[0])}</span><span><strong>${esc(r.n)}</strong><small>${esc(r.c)}</small></span></figcaption>
      </figure></div>`).join('');
    $('#dots').innerHTML = REVIEWS.map((_, i) => `<button class="dot" data-i="${i}" aria-label="Review ${i + 1}"></button>`).join('');
    go(0);
  }
  function go(i) {
    idx = (i + REVIEWS.length) % REVIEWS.length;
    $('#slides').style.transform = `translateX(-${idx * 100}%)`;
    $$('.dot').forEach((d, k) => d.classList.toggle('on', k === idx));
  }
  const auto = () => { clearInterval(timer); timer = setInterval(() => go(idx + 1), 5500); };
  $('#prev').addEventListener('click', () => { go(idx - 1); auto(); });
  $('#next').addEventListener('click', () => { go(idx + 1); auto(); });
  $('#dots').addEventListener('click', e => { const d = e.target.closest('.dot'); if (d) { go(+d.dataset.i); auto(); } });

  $('#reviewForm').addEventListener('submit', e => {
    e.preventDefault();
    REVIEWS.unshift({ n: $('#rName').value.trim(), c: 'Verified buyer', s: +$('#rStars').value, t: $('#rText').value.trim() });
    renderReviews(); auto(); e.target.reset();
    toast('Thanks for your review!');
    $('#slider').scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  /* ---------- newsletter ---------- */
  $('#newsForm').addEventListener('submit', e => { e.preventDefault(); e.target.reset(); toast('You are on the list!'); });

  /* ---------- scroll reveal + counters ---------- */
  function setupReveal() {
    const obs = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in'); obs.unobserve(e.target); }
    }), { threshold: .15 });
    $$('.reveal').forEach(el => obs.observe(el));
  }

  function setupCounters() {
    const obs = new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target, end = parseFloat(el.dataset.count), dec = +(el.dataset.dec || 0), t0 = performance.now(), dur = 1600;
      (function tick(now) {
        const p = Math.min((now - t0) / dur, 1), v = end * (1 - Math.pow(1 - p, 3));
        el.textContent = dec ? v.toFixed(dec) : Math.round(v).toLocaleString('en-IN') + (end >= 1000 && p === 1 ? '+' : '');
        if (p < 1) requestAnimationFrame(tick);
      })(t0);
      obs.unobserve(el);
    }), { threshold: .6 });
    $$('[data-count]').forEach(el => obs.observe(el));
  }

  /* ---------- init ---------- */
  $('#year').textContent = new Date().getFullYear();
  renderProducts();
  renderCart();
  renderReviews();
  auto();
  // add reveal to static blocks
  $$('.heritage-card, .steps li, .faq details, .section-head').forEach(el => el.classList.add('reveal'));
  setupReveal();
  setupCounters();
})();


