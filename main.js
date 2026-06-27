/* ============================================
   ASTRA OS — Main JavaScript
   Ancient Wisdom. Future Intelligence.
============================================ */

'use strict';

// ── Loading Screen ──────────────────────────
const bootLines = [
  '> Initializing ASTRA OS kernel...',
  '> Loading agent constellation matrix...',
  '> Calibrating Nakshatra neural pathways...',
  '> Activating Vajra automation protocols...',
  '> Syncing Garuda research intelligence...',
  '> System ready. Welcome to ASTRA OS.'
];

function initLoader() {
  const loading = document.getElementById('loading');
  const terminal = document.getElementById('loading-terminal');
  if (!loading || !terminal) return;

  let i = 0;
  const interval = setInterval(() => {
    if (i < bootLines.length) {
      const line = document.createElement('div');
      line.textContent = bootLines[i];
      line.style.color = i === bootLines.length - 1 ? 'var(--cyan)' : 'var(--green)';
      line.style.marginBottom = '4px';
      terminal.appendChild(line);
      i++;
    } else {
      clearInterval(interval);
      setTimeout(() => {
        loading.classList.add('hidden');
        setTimeout(() => { loading.style.display = 'none'; }, 800);
        revealPage();
      }, 400);
    }
  }, 280);
}

function revealPage() {
  document.querySelectorAll('.fade-in').forEach((el, i) => {
    setTimeout(() => el.classList.add('visible'), i * 60);
  });
}

// ── Custom Cursor ────────────────────────────
function initCursor() {
  const dot  = document.getElementById('cursor-dot');
  const ring = document.getElementById('cursor-ring');
  if (!dot || !ring) return;

  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  function animRing() {
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  document.querySelectorAll('a, button, .glass-card, .agent-card').forEach(el => {
    el.addEventListener('mouseenter', () => {
      dot.style.width  = '14px';
      dot.style.height = '14px';
      ring.style.width  = '50px';
      ring.style.height = '50px';
      ring.style.borderColor = 'rgba(6,182,212,0.8)';
    });
    el.addEventListener('mouseleave', () => {
      dot.style.width  = '8px';
      dot.style.height = '8px';
      ring.style.width  = '36px';
      ring.style.height = '36px';
      ring.style.borderColor = 'rgba(6,182,212,0.5)';
    });
  });
}

// ── Constellation Canvas ─────────────────────
function initConstellation() {
  const canvas = document.getElementById('constellation-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let W, H, stars = [], mouse = { x: -9999, y: -9999 };
  const STAR_COUNT = 120;
  const CONNECT_DIST = 140;

  function resize() {
    W = canvas.width  = window.innerWidth;
    H = canvas.height = window.innerHeight;
  }

  function makeStar() {
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.15,
      r: Math.random() * 1.5 + 0.4,
      alpha: Math.random() * 0.5 + 0.2,
    };
  }

  function initStars() {
    stars = Array.from({ length: STAR_COUNT }, makeStar);
  }

  document.addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // update & draw stars
    stars.forEach(s => {
      // gentle drift toward cursor
      const dx = mouse.x - s.x, dy = mouse.y - s.y;
      const d  = Math.hypot(dx, dy);
      if (d < 200) {
        s.vx += dx / d * 0.002;
        s.vy += dy / d * 0.002;
      }
      s.vx *= 0.99; s.vy *= 0.99;

      s.x += s.vx; s.y += s.vy;
      if (s.x < 0) s.x = W; if (s.x > W) s.x = 0;
      if (s.y < 0) s.y = H; if (s.y > H) s.y = 0;

      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(148,163,184,${s.alpha})`;
      ctx.fill();
    });

    // connections
    for (let i = 0; i < stars.length; i++) {
      for (let j = i + 1; j < stars.length; j++) {
        const dx = stars[i].x - stars[j].x;
        const dy = stars[i].y - stars[j].y;
        const d  = Math.hypot(dx, dy);
        if (d < CONNECT_DIST) {
          const alpha = (1 - d / CONNECT_DIST) * 0.18;
          ctx.beginPath();
          ctx.moveTo(stars[i].x, stars[i].y);
          ctx.lineTo(stars[j].x, stars[j].y);
          ctx.strokeStyle = `rgba(99,179,237,${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  resize();
  initStars();
  draw();
  window.addEventListener('resize', () => { resize(); initStars(); });
}

// ── Navigation ───────────────────────────────
function initNav() {
  const nav = document.querySelector('.nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  });
}

// ── Typing Effect ────────────────────────────
function initTyping() {
  const el = document.getElementById('hero-typing');
  if (!el) return;

  const phrases = [
    'Automate your research',
    'Orchestrate AI agents',
    'Build the future',
    'Scale with intelligence'
  ];

  let pi = 0, ci = 0, deleting = false;

  function tick() {
    const phrase = phrases[pi];
    if (!deleting) {
      el.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) {
        deleting = true;
        setTimeout(tick, 1800);
        return;
      }
    } else {
      el.textContent = phrase.slice(0, --ci);
      if (ci === 0) {
        deleting = false;
        pi = (pi + 1) % phrases.length;
      }
    }
    setTimeout(tick, deleting ? 45 : 80);
  }
  tick();
}

// ── Animated Counters ────────────────────────
function animateCounters() {
  document.querySelectorAll('[data-count]').forEach(el => {
    const target = parseFloat(el.dataset.count);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    let current = 0;
    const step = target / 60;
    const timer = setInterval(() => {
      current = Math.min(current + step, target);
      el.textContent = prefix + (Number.isInteger(target) ? Math.floor(current) : current.toFixed(1)) + suffix;
      if (current >= target) clearInterval(timer);
    }, 16);
  });
}

// ── Intersection Observer ────────────────────
function initObserver() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        // trigger counters inside this element
        e.target.querySelectorAll('[data-count]').forEach(el => {
          if (!el.dataset.counted) {
            el.dataset.counted = 'true';
            animateSingleCounter(el);
          }
        });
      }
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.fade-in').forEach(el => io.observe(el));
}

function animateSingleCounter(el) {
  const target = parseFloat(el.dataset.count);
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  let current = 0;
  const step = target / 50;
  const timer = setInterval(() => {
    current = Math.min(current + step, target);
    el.textContent = prefix + (Number.isInteger(target) ? Math.floor(current) : current.toFixed(1)) + suffix;
    if (current >= target) clearInterval(timer);
  }, 20);
}

// ── Command Palette ──────────────────────────
const paletteCommands = [
  { icon: '🏠', name: 'Home',             type: 'navigate', href: '#hero' },
  { icon: '🤖', name: 'Meet the Agents',  type: 'navigate', href: '#agents' },
  { icon: '📡', name: 'Command Center',   type: 'navigate', href: '#dashboard' },
  { icon: '🗺',  name: 'Roadmap',          type: 'navigate', href: '#roadmap' },
  { icon: '🔨', name: 'Build Logs',       type: 'navigate', href: '#builds' },
  { icon: '⚡',  name: 'Tech Stack',       type: 'navigate', href: '#tech' },
  { icon: '👤', name: 'About Pranav',     type: 'navigate', href: '#about' },
  { icon: '📬', name: 'Contact',          type: 'navigate', href: '#contact' },
  { icon: '⚡', name: 'Vajra — Automation Engine',  type: 'agent', href: '#agents' },
  { icon: '🦅', name: 'Garuda — Research Intelligence', type: 'agent', href: '#agents' },
  { icon: '🎯', name: 'Sarathi — Strategy Advisor', type: 'agent', href: '#agents' },
  { icon: '🌀', name: 'Sudarshan — Analytics',       type: 'agent', href: '#agents' },
  { icon: '📖', name: 'Veda — Knowledge Engine',     type: 'agent', href: '#agents' },
  { icon: '🔥', name: 'Agni — Code Architect',       type: 'agent', href: '#agents' },
];

function initCommandPalette() {
  const palette = document.getElementById('command-palette');
  const input   = document.getElementById('palette-input');
  const results = document.getElementById('palette-results');
  if (!palette || !input || !results) return;

  let selected = 0;

  function open() {
    palette.classList.add('open');
    input.value = '';
    renderResults('');
    setTimeout(() => input.focus(), 50);
  }

  function close() {
    palette.classList.remove('open');
  }

  function renderResults(query) {
    const q = query.toLowerCase();
    const filtered = paletteCommands.filter(c => c.name.toLowerCase().includes(q));
    results.innerHTML = '';

    const sections = [
      { key: 'navigate', label: 'Navigation' },
      { key: 'agent',    label: 'Agents' },
    ];

    sections.forEach(({ key, label }) => {
      const items = filtered.filter(c => c.type === key);
      if (!items.length) return;

      const sl = document.createElement('div');
      sl.className = 'palette-section-label';
      sl.textContent = label;
      results.appendChild(sl);

      items.forEach((cmd, i) => {
        const div = document.createElement('div');
        div.className = 'palette-result';
        div.innerHTML = `
          <span class="palette-result-icon">${cmd.icon}</span>
          <span class="palette-result-name">${cmd.name}</span>
          <span class="palette-result-type">${cmd.type}</span>
        `;
        div.addEventListener('click', () => {
          close();
          document.querySelector(cmd.href)?.scrollIntoView({ behavior: 'smooth' });
        });
        results.appendChild(div);
      });
    });
  }

  input.addEventListener('input', () => renderResults(input.value));

  document.addEventListener('keydown', e => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      palette.classList.contains('open') ? close() : open();
    }
    if (e.key === 'Escape') close();
  });

  palette.addEventListener('click', e => {
    if (e.target === palette) close();
  });

  // Keyboard shortcut hint button
  document.querySelectorAll('[data-open-palette]').forEach(btn => {
    btn.addEventListener('click', open);
  });
}

// ── Mouse Glow Follow ────────────────────────
function initMouseGlow() {
  const glow = document.createElement('div');
  glow.id = 'mouse-glow';
  Object.assign(glow.style, {
    position: 'fixed',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)',
    pointerEvents: 'none',
    zIndex: '1',
    transform: 'translate(-50%,-50%)',
    transition: 'left 0.2s ease, top 0.2s ease',
  });
  document.body.appendChild(glow);

  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top  = e.clientY + 'px';
  });
}

// ── Smooth section navigation ────────────────
function initSmoothNav() {
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });
}

// ── FAB tooltip ──────────────────────────────
function initFAB() {
  const fab = document.getElementById('ai-fab');
  if (!fab) return;
  fab.addEventListener('click', () => {
    const target = document.getElementById('dashboard');
    target?.scrollIntoView({ behavior: 'smooth' });
  });
}

// ── Boot ─────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initLoader();
  initCursor();
  initConstellation();
  initNav();
  initTyping();
  initObserver();
  initCommandPalette();
  initMouseGlow();
  initSmoothNav();
  initFAB();
});
