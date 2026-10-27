/* OASIS RMS · site interactions and motion. No dependencies. */
(function () {
  'use strict';
  const doc = document.documentElement;
  doc.classList.add('js');
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- header: tighten on scroll, mobile sticky CTA ---------- */
  const header = $('[data-header]');
  const sticky = $('[data-sticky-cta]');
  const hero = $('.hero');
  const onScroll = () => {
    const y = window.scrollY;
    if (header) header.classList.toggle('is-scrolled', y > 24);
    if (sticky) {
      const past = hero ? y > hero.offsetTop + hero.offsetHeight - 200 : y > 400;
      const nearEnd = window.innerHeight + y > document.body.scrollHeight - 220;
      sticky.classList.toggle('is-on', past && !nearEnd && document.body.dataset.page !== 'contact');
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- mobile menu ---------- */
  const menu = $('[data-menu]');
  const openBtn = $('[data-menu-open]');
  const closeBtn = $('[data-menu-close]');
  const setMenu = (open) => {
    if (!menu) return;
    menu.hidden = !open;
    openBtn.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    (open ? closeBtn : openBtn).focus();
  };
  if (openBtn) openBtn.addEventListener('click', () => setMenu(true));
  if (closeBtn) closeBtn.addEventListener('click', () => setMenu(false));
  if (menu) menu.addEventListener('click', (e) => { if (e.target === menu) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && menu && !menu.hidden) setMenu(false); });

  /* ---------- heading word reveal ---------- */
  $$('[data-split]').forEach((h) => {
    if (reduced) return;
    const words = h.textContent.trim().split(/\s+/);
    h.setAttribute('aria-label', h.textContent.trim());
    h.innerHTML = words.map((w, i) => `<span class="word" aria-hidden="true"><span style="--w:${i}">${w}</span></span>`).join(' ');
  });

  /* ---------- stagger indexes ---------- */
  $$('[data-stagger]').forEach((g) => Array.from(g.children).forEach((c, i) => c.style.setProperty('--i', i)));

  /* ---------- scroll reveal ---------- */
  const revealTargets = $$('[data-reveal], [data-stagger], [data-split], .b-live');
  if ('IntersectionObserver' in window && !reduced) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (!en.isIntersecting) return;
        en.target.classList.add('is-in');
        en.target.querySelectorAll('[data-split]').forEach((h) => h.classList.add('is-in'));
        io.unobserve(en.target);
      });
    }, { threshold: 0.18, rootMargin: '0px 0px -40px 0px' });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-in'));
  }

  /* ---------- count up ---------- */
  const counters = $$('[data-count]');
  const runCount = (el) => {
    const to = parseFloat(el.dataset.count); const dec = parseInt(el.dataset.decimals || '0', 10);
    const t0 = performance.now(), dur = 1400;
    const tick = (t) => {
      const p = Math.min(1, (t - t0) / dur); const e = 1 - Math.pow(1 - p, 3);
      el.textContent = (to * e).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick); else el.textContent = to.toFixed(dec);
    };
    requestAnimationFrame(tick);
  };
  if (counters.length && 'IntersectionObserver' in window && !reduced) {
    const co = new IntersectionObserver((entries) => entries.forEach((en) => { if (en.isIntersecting) { runCount(en.target); co.unobserve(en.target); } }), { threshold: 0.6 });
    counters.forEach((c) => co.observe(c));
  }

  /* ---------- live order card ---------- */
  const STATES = [['Sent', 'Sent to the kitchen'], ['Preparing', 'The kitchen is cooking'], ['Ready', 'Ready at the pass'], ['Served', 'Served · bill ready']];
  $$('[data-live]').forEach((card) => {
    let i = 0;
    const set = () => {
      card.dataset.state = String(i);
      $('[data-live-status]', card).textContent = STATES[i][0];
      $('[data-live-msg]', card).textContent = STATES[i][1];
    };
    set();
    if (!reduced) setInterval(() => { i = (i + 1) % STATES.length; set(); }, 1800);
  });

  /* ---------- order journey ---------- */
  $$('[data-journey]').forEach((j) => {
    const steps = $$('[data-step]', j);
    const stages = $$('[data-stage]', j);
    const DWELL = 3200;
    let cur = 0, timer = null, paused = false, started = false;
    j.style.setProperty('--dwell', DWELL + 'ms');
    const show = (n) => {
      cur = n;
      steps.forEach((s, k) => { s.classList.toggle('is-active', k === n); s.setAttribute('aria-selected', String(k === n)); s.tabIndex = k === n ? 0 : -1; });
      stages.forEach((s, k) => s.classList.toggle('is-active', k === n));
      // restart the progress bar animation
      const bar = steps[n].querySelector('.step-bar i'); if (bar) { bar.style.animation = 'none'; void bar.offsetWidth; bar.style.animation = ''; }
    };
    const schedule = () => { clearTimeout(timer); if (reduced || paused || !started) return; timer = setTimeout(() => { show((cur + 1) % steps.length); schedule(); }, DWELL); };
    steps.forEach((s, k) => {
      s.addEventListener('click', () => { show(k); schedule(); });
      s.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return; e.preventDefault(); const n = (cur + d + steps.length) % steps.length; show(n); steps[n].focus(); schedule();
      });
    });
    j.addEventListener('mouseenter', () => { paused = true; j.classList.add('is-paused'); clearTimeout(timer); });
    j.addEventListener('mouseleave', () => { paused = false; j.classList.remove('is-paused'); show(cur); schedule(); });
    j.addEventListener('focusin', () => { paused = true; j.classList.add('is-paused'); clearTimeout(timer); });
    j.addEventListener('focusout', (e) => { if (!j.contains(e.relatedTarget)) { paused = false; j.classList.remove('is-paused'); schedule(); } });
    if (reduced) j.classList.add('is-static');
    // start only when the journey is on screen
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => en.forEach((x) => { if (x.isIntersecting && !started) { started = true; show(0); schedule(); } }), { threshold: 0.35 }).observe(j);
    } else { started = true; schedule(); }
    show(0);
  });

  /* ---------- Kitchen Ops: hover or select a feature to change the screens ---------- */
  const koItems = $$('[data-ko]');
  const koSlides = $$('[data-ko-slide]');
  if (koItems.length) {
    let koCur = 0;
    const koShow = (n) => {
      if (n === koCur && koItems[n].classList.contains('is-active')) return;
      koCur = n;
      koItems.forEach((b, k) => { const on = k === n; b.classList.toggle('is-active', on); b.setAttribute('aria-selected', String(on)); b.tabIndex = on ? 0 : -1; });
      koSlides.forEach((s, k) => s.classList.toggle('is-active', k === n));
    };
    koItems.forEach((b, k) => {
      b.addEventListener('mouseenter', () => { if (window.matchMedia('(hover: hover)').matches) koShow(k); });
      b.addEventListener('click', () => koShow(k));
      b.addEventListener('focus', () => koShow(k));
      b.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowDown' || e.key === 'ArrowRight' ? 1 : e.key === 'ArrowUp' || e.key === 'ArrowLeft' ? -1 : 0;
        if (!d) return; e.preventDefault(); const n = (koCur + d + koItems.length) % koItems.length; koItems[n].focus();
      });
    });
    koShow(0);
  }

  /* ---------- marquee: duplicate tracks for a seamless loop ---------- */
  $$('.marquee-track').forEach((t) => {
    Array.from(t.children).forEach((li) => { const c = li.cloneNode(true); c.setAttribute('aria-hidden', 'true'); t.appendChild(c); });
  });

  /* ---------- features filter ---------- */
  const filters = $$('[data-filter]');
  filters.forEach((f) => f.addEventListener('click', () => {
    const v = f.dataset.filter;
    filters.forEach((x) => { const on = x === f; x.classList.toggle('is-on', on); x.setAttribute('aria-pressed', String(on)); });
    $$('[data-group]').forEach((g) => {
      const show = v === 'all' || g.dataset.group === v;
      g.classList.toggle('is-hidden', !show);
      if (show) { $$('[data-reveal]', g).forEach((el) => el.classList.add('is-in')); }
    });
    const first = v === 'all' ? null : document.getElementById(v);
    if (first) first.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }));
  // open a group from a link like features.html#kitchen-ops
  if (filters.length && location.hash) { const f = $(`[data-filter="${location.hash.slice(1)}"]`); if (f) setTimeout(() => f.click(), 300); }

  /* ---------- pricing: monthly / yearly ---------- */
  const billing = $('[data-billing]');
  if (billing) billing.addEventListener('click', () => {
    const yearly = billing.getAttribute('aria-checked') !== 'true';
    billing.setAttribute('aria-checked', String(yearly));
    $$('[data-bill-label]').forEach((l) => l.classList.toggle('is-on', (l.dataset.billLabel === 'yearly') === yearly));
    const save = $('[data-save]'); if (save) save.classList.toggle('is-on', yearly);
    $$('[data-monthly]').forEach((el) => {
      el.textContent = yearly ? el.dataset.yearly : el.dataset.monthly;
      el.classList.remove('price-swap'); void el.offsetWidth; el.classList.add('price-swap');
    });
  });
  $$('[data-bill-label]').forEach((l) => l.addEventListener('click', () => {
    const wantYearly = l.dataset.billLabel === 'yearly';
    if ((billing.getAttribute('aria-checked') === 'true') !== wantYearly) billing.click();
  }));

  /* ---------- FAQ ---------- */
  $$('[data-faq]').forEach((b) => b.addEventListener('click', () => {
    const item = b.closest('.faq-item'); const open = !item.classList.contains('is-open');
    item.classList.toggle('is-open', open); b.setAttribute('aria-expanded', String(open));
  }));

  /* ---------- demo form ---------- */
  const form = $('[data-demo-form]');
  if (form) {
    $$('select', form).forEach((sel) => { const upd = () => sel.classList.toggle('is-empty', !sel.value); sel.addEventListener('change', upd); upd(); });
    const rules = {
      name: (v) => v.trim().length > 1 || 'Please enter your name.',
      restaurant: (v) => v.trim().length > 1 || 'Please enter the restaurant name.',
      phone: (v) => /^(\+?91[\s-]?)?[6-9]\d{4}[\s-]?\d{5}$/.test(v.trim()) || 'Please enter a 10-digit mobile number.',
      email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) || 'Please enter a valid email.'
    };
    const check = (input) => {
      const rule = rules[input.name]; if (!rule) return true;
      const res = rule(input.value); const field = input.closest('.field'); const err = field.querySelector('.err');
      const ok = res === true; field.classList.toggle('has-error', !ok); err.textContent = ok ? '' : res;
      input.setAttribute('aria-invalid', String(!ok)); return ok;
    };
    Object.keys(rules).forEach((n) => { const i = form.elements[n]; i.addEventListener('blur', () => { if (i.value) check(i); }); i.addEventListener('input', () => { if (i.closest('.field').classList.contains('has-error')) check(i); }); });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const bad = Object.keys(rules).map((n) => form.elements[n]).filter((i) => !check(i));
      if (bad.length) { bad[0].focus(); return; }
      const data = Object.fromEntries(new FormData(form).entries());
      data.interests = new FormData(form).getAll('interests');
      /* TODO: send `data` to your backend or CRM here, e.g.
         fetch('/api/demo-request', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }) */
      console.info('Demo request', data);
      form.hidden = true;
      const ok = $('[data-success]'); ok.hidden = false; ok.focus();
    });
  }

  /* ---------- footer year ---------- */
  $$('[data-year]').forEach((y) => { y.textContent = new Date().getFullYear(); });
})();
