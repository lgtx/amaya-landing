// Altura header para scroll-margin-top
function setHeaderHeightVar() {
  const h = document.querySelector('header')?.offsetHeight || 72;
  document.documentElement.style.setProperty('--header-h', h + 'px');
}
setHeaderHeightVar();
window.addEventListener('resize', setHeaderHeightVar);

// ===== Crossfade (autoplay + dots + pausa hover) =====
(function () {
  const fader = document.querySelector('[data-phone-fader]');
  if (!fader) return;
  const slides = Array.from(fader.querySelectorAll('.phone-slide'));
  const dots = Array.from(document.querySelectorAll('[data-phone-dot]'));

  // Si no hay dots, no ejecutar este modo para evitar conflicto con flechas
  if (dots.length === 0) return;

  let i = 0, t;

  function show(n) {
    i = (n + slides.length) % slides.length;
    slides.forEach((img, k) => img.classList.toggle('is-active', k === i));
    dots.forEach((d, k) => d.setAttribute('aria-current', k === i ? 'true' : 'false'));
  }
  function play() { stop(); t = setInterval(() => show(i + 1), 4500); }
  function stop() { if (t) { clearInterval(t); t = null; } }

  dots.forEach((d, k) => d.addEventListener('click', () => { stop(); show(k); play(); }));
  fader.addEventListener('mouseenter', stop);
  fader.addEventListener('mouseleave', play);

  show(0); play();
})();

// Partículas sutiles en el HERO (burbujas + cruces)
(function () {
  const section = document.querySelector('.hero-bg');
  const canvas = document.getElementById('heroFx');
  if (!section || !canvas) return;
  const ctx = canvas.getContext('2d');
  let dpr = Math.max(1, window.devicePixelRatio || 1);
  let W, H, bubbles = [], crosses = [];

  function resize() {
    const r = section.getBoundingClientRect();
    W = Math.floor(r.width); H = Math.floor(r.height);
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    init();
  }

  function init() {
    const bCount = Math.min(48, Math.floor(W / 25));
    const cCount = Math.min(10, Math.floor(W / 140));
    bubbles = Array.from({ length: bCount }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      r: 1.2 + Math.random() * 2.8,
      vy: 0.15 + Math.random() * 0.35,
      vx: (Math.random() * 0.3 - 0.15),
      a: 0.18 + Math.random() * 0.45,
      hue: Math.random() < 0.6 ? '#10b981' : '#14b8a6'
    }));
    crosses = Array.from({ length: cCount }, () => ({
      x: Math.random() * W, y: Math.random() * H,
      size: 6 + Math.random() * 10,
      vy: 0.08 + Math.random() * 0.18,
      vx: (Math.random() * 0.2 - 0.1),
      a: 0.12 + Math.random() * 0.25,
      t: Math.random() * Math.PI * 2,
      hue: Math.random() < 0.7 ? 'rgba(16,185,129,1)' : 'rgba(20,184,166,1)'
    }));
  }

  function drawCross(cx, cy, s, alpha, color) {
    ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = color;
    const w = s * 0.5;
    ctx.fillRect(cx - w / 2, cy - s, w, s * 2);      /* vertical */
    ctx.fillRect(cx - s, cy - w / 2, s * 2, w);      /* horizontal */
    ctx.restore();
  }

  function tick() {
    ctx.clearRect(0, 0, W, H);
    for (const p of bubbles) {
      p.y -= p.vy; p.x += p.vx;
      if (p.y < -8) { p.y = H + 8; p.x = Math.random() * W; }
      if (p.x < -8) p.x = W + 8; if (p.x > W + 8) p.x = -8;
      ctx.globalAlpha = p.a; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.hue; ctx.fill();
    }
    for (const c of crosses) {
      c.y -= c.vy; c.x += c.vx; c.t += 0.02;
      const scale = 1 + Math.sin(c.t) * 0.06;
      const sx = c.size * scale;
      if (c.y < -sx) { c.y = H + sx; c.x = Math.random() * W; c.t = Math.random() * Math.PI * 2; }
      if (c.x < -sx) c.x = W + sx; if (c.x > W + sx) c.x = -sx;
      drawCross(c.x, c.y, sx, c.a, c.hue);
    }
    requestAnimationFrame(tick);
  }

  resize(); tick();
  window.addEventListener('resize', resize);
})();

/* Slider fade + flechas (sin dots) */
(function(){
  const wrap   = document.querySelector('[data-phone-fader]');
  if(!wrap) return;
  const slides = Array.from(wrap.querySelectorAll('.phone-slide'));
  const prev   = document.querySelector('[data-phone-prev]');
  const next   = document.querySelector('[data-phone-next]');

  let i = 0, busy = false, timer = null;
  const D = 380;      // duración del fade
  const T = 4200;     // autoplay

  function go(dir){ // dir: +1 next, -1 prev
    if(busy || slides.length < 2) return;
    busy = true;

    const cur = slides[i];
    const n   = (i + (dir>0?1:-1) + slides.length) % slides.length;
    const nxt = slides[n];

    // preparar capas para crossfade
    nxt.classList.add('is-active');      // aparecer
    cur.classList.add('is-leaving');     // se mantiene arriba mientras hace fade-out

    // iniciar fade-out de la actual
    cur.classList.remove('is-active');

    // al finalizar el fade, limpiar y actualizar índice
    setTimeout(() => {
      cur.classList.remove('is-leaving');
      i = n; busy = false;
    }, D);
  }

  function play(){ stop(); timer = setInterval(()=>go(+1), T); }
  function stop(){ if(timer){ clearInterval(timer); timer = null; } }

  next?.addEventListener('click', ()=>{ stop(); go(+1); play(); });
  prev?.addEventListener('click', ()=>{ stop(); go(-1); play(); });

  // Pausa en hover (desktop)
  wrap.addEventListener('mouseenter', stop);
  wrap.addEventListener('mouseleave', play);

  // Init
  slides.forEach((s,idx)=> s.classList.toggle('is-active', idx===0));
  play();
})();

