/* ============ LOADING SEQUENCE ============
   Cinematic terminal boot: tasks tick off one by one,
   progress bar fills, then the WARNING/ACCESS prompt appears. */
(function () {
  const screen = document.getElementById('loadingScreen');
  const tasks = Array.from(document.querySelectorAll('#loadingTasks li'));
  const fill = document.getElementById('loadingBarFill');
  const percentEl = document.getElementById('loadingPercent');
  const warning = document.getElementById('loadingWarning');
  const accessBtn = document.getElementById('accessBtn');

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const stepDelay = reduced ? 40 : 320;

  let i = 0;

  function tickTask() {
    if (i > 0) tasks[i - 1].classList.replace('active', 'done');
    if (i < tasks.length) {
      tasks[i].classList.add('active');
      const pct = Math.round(((i + 1) / tasks.length) * 100);
      fill.style.width = pct + '%';
      percentEl.textContent = pct + '%';
      i++;
      setTimeout(tickTask, stepDelay);
    } else {
      setTimeout(() => warning.classList.add('visible'), 300);
    }
  }

  function grantAccess() {
    document.body.style.overflow = '';
    screen.setAttribute('data-done', 'true');
    setTimeout(() => { screen.style.display = 'none'; }, 900);
  }

  document.body.style.overflow = 'hidden';
  setTimeout(tickTask, reduced ? 50 : 400);

  accessBtn.addEventListener('click', grantAccess);
  accessBtn.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') grantAccess();
  });

  // Safety net: never trap a user longer than ~9s even if something stalls.
  setTimeout(() => {
    if (screen.getAttribute('data-done') !== 'true') warning.classList.add('visible');
  }, 9000);
})();
/* ============ SONAR CURSOR ============ */
(function () {
  if (window.matchMedia('(hover: none)').matches) return;

  const cursor = document.getElementById('sonarCursor');
  if (!cursor) return;

  let x = window.innerWidth / 2, y = window.innerHeight / 2;
  let cx = x, cy = y;

  window.addEventListener('mousemove', (e) => {
    x = e.clientX; y = e.clientY;
  });

  function raf() {
    cx += (x - cx) * 0.35;
    cy += (y - cy) * 0.35;
    cursor.style.transform = `translate(${cx}px, ${cy}px)`;
    requestAnimationFrame(raf);
  }
  raf();

  const hoverTargets = 'a, button, .file-icon, [data-interactive]';
  document.addEventListener('mouseover', (e) => {
    if (e.target.closest(hoverTargets)) cursor.classList.add('is-hover');
  });
  document.addEventListener('mouseout', (e) => {
    if (e.target.closest(hoverTargets)) cursor.classList.remove('is-hover');
  });

  document.addEventListener('click', (e) => {
    const ping = document.createElement('div');
    ping.className = 'sonar-ping';
    ping.style.left = e.clientX + 'px';
    ping.style.top = e.clientY + 'px';
    document.body.appendChild(ping);
    setTimeout(() => ping.remove(), 750);
  });
})();
/* ============ AMBIENT OCEAN BACKGROUND ============
   Subtle drifting particles / bioluminescent dust / a rare
   distant whale silhouette. Deliberately understated. */
(function () {
  const canvas = document.getElementById('oceanCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let w, h, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = canvas.width = innerWidth * dpr;
    h = canvas.height = innerHeight * dpr;
    canvas.style.width = innerWidth + 'px';
    canvas.style.height = innerHeight + 'px';
  }
  resize();
  window.addEventListener('resize', resize);

  const COUNT = reduced ? 0 : Math.min(70, Math.floor(innerWidth / 22));
  const particles = Array.from({ length: COUNT }, () => spawn());

  function spawn() {
    return {
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: Math.random() * 1.6 + 0.4,
      vy: -(Math.random() * 0.18 + 0.04),
      vx: (Math.random() - 0.5) * 0.08,
      a: Math.random() * 0.5 + 0.15,
      hue: Math.random() > 0.85 ? 'bio' : 'dust'
    };
  }

  let whaleT = -1000;
  function maybeSpawnWhale(t) {
    if (t - whaleT > 26000 && Math.random() < 0.001) whaleT = t;
  }

  function draw(t) {
    ctx.clearRect(0, 0, w, h);
    ctx.save();
    ctx.scale(dpr, dpr);

    // distant whale silhouette, extremely subtle
    const sinceWhale = t - whaleT;
    if (whaleT > 0 && sinceWhale < 18000) {
      const p = sinceWhale / 18000;
      const wx = -200 + p * (innerWidth + 400);
      const wy = innerHeight * 0.62;
      ctx.globalAlpha = Math.sin(p * Math.PI) * 0.06;
      ctx.fillStyle = '#5FE3F0';
      ctx.beginPath();
      ctx.ellipse(wx, wy, 90, 22, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    maybeSpawnWhale(t);

    for (const p of particles) {
      p.y += p.vy;
      p.x += p.vx;
      if (p.y < -10) { p.y = innerHeight + 10; p.x = Math.random() * innerWidth; }
      ctx.beginPath();
      ctx.fillStyle = p.hue === 'bio'
        ? `rgba(95,227,240,${p.a})`
        : `rgba(160,190,200,${p.a * 0.5})`;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    if (!reduced) requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
/* ============ CLASSIFIED DATABASE MENU ============ */
(function () {
  const toggle = document.getElementById('dbToggle');
  const menu = document.getElementById('dbMenu');
  const closeBtn = document.getElementById('dbClose');

  const scrim = document.createElement('div');
  scrim.className = 'db-scrim';
  document.body.appendChild(scrim);

  function open() {
    menu.setAttribute('data-open', 'true');
    toggle.setAttribute('aria-expanded', 'true');
    scrim.classList.add('visible');
  }
  function close() {
    menu.setAttribute('data-open', 'false');
    toggle.setAttribute('aria-expanded', 'false');
    scrim.classList.remove('visible');
  }

  toggle.addEventListener('click', () => {
    menu.getAttribute('data-open') === 'true' ? close() : open();
  });
  closeBtn.addEventListener('click', close);
  scrim.addEventListener('click', close);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') close();
  });
  menu.querySelectorAll('a').forEach(a => a.addEventListener('click', close));
})();
/* ============ SCROLL REVEAL INIT ============ */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const targets = document.querySelectorAll('[data-reveal]');
  if (!targets.length) return;

  if (reduced) {
    targets.forEach(el => el.classList.add('in-view'));
    return;
  }

  const groups = document.querySelectorAll('[data-reveal-group]');
  groups.forEach(group => {
    Array.from(group.children).forEach((child, i) => {
      child.style.setProperty('--stagger-i', i);
    });
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

  targets.forEach(el => io.observe(el));

  // Gentle parallax on the hero background as the visitor scrolls away.
  const heroBg = document.querySelector('.hero-bg');
  if (heroBg) {
    window.addEventListener('scroll', () => {
      const y = window.scrollY;
      if (y < window.innerHeight * 1.2) {
        heroBg.style.transform = `translateY(${y * 0.18}px)`;
      }
    }, { passive: true });
  }
})();
/* ============ ARCHIVE DATA — PART I ============
   Content sourced directly from the Red Tide story files.
   Each entry renders inside a draggable file-window. */
window.REDTIDE_FILES = {
  day1: {
    title: 'INCIDENT LOG // DAY 1',
    body: `
      <h3>08:12 GMT — PHILIPPINE SEA</h3>
      <p>A fisherman nearly 300 kilometers off the coast of the Philippines uploads a photo. Nothing unusual. A small fishing boat. Grey sky. Calm sea.</p>
      <p>Except the ocean around him is red. Not blood. Not paint. Not algae. Just deep crimson.</p>
      <p class="quote">"Likely an uncommon biological bloom."</p>
      <p>The news lasts only twenty-three seconds. Nobody cares.</p>
    `
  },
  day3: {
    title: 'SATELLITE CONFIRMATION // DAY 3',
    body: `
      <h3>MISSION CONTROL</h3>
      <p>The first satellite image arrives. Every scientist in Mission Control goes silent. The Atlantic. The Pacific. The Indian Ocean. The Southern Ocean. All showing the same crimson expansion.</p>
      <p class="quote">"That's impossible..."</p>
      <p class="quote">"No... Impossible would've been easier."</p>
      <h3>DAY 5 — DESIGNATION</h3>
      <p>The media names the phenomenon <span class="redline">THE RED TIDE</span>. Swimming, fishing, and commercial shipping are suspended worldwide. Nobody understands why.</p>
    `
  },
  day13: {
    title: 'VESSEL LOSS REPORT // DAY 13',
    body: `
      <h3>FIRST DISAPPEARANCE</h3>
      <p>The first cargo vessel disappears. No distress call. No explosion. No debris. No oil spill. Just gone.</p>
      <p>Within the next week, seven more ships vanish. Insurance companies suspend ocean transport. Global trade slows dramatically.</p>
      <h3>DAY 22 — COASTAL SIGHTINGS</h3>
      <p>Fishing villages report figures standing chest-deep in the ocean, watching, unmoving. By the time rescue boats arrive, they're gone. The footprints stop exactly where the waves begin.</p>
    `
  },
  day27: {
    title: 'RECOVERED AUDIO // DAY 27',
    body: `
      <h3>EMERGENCY TRANSMISSION — 32 SECONDS SURVIVE</h3>
      <p class="quote">Crew: "Captain... there's someone swimming beside us."</p>
      <p class="quote">Captain: "We're nearly forty kilometers offshore. Nobody swims that far."</p>
      <p class="quote">Crew: "No... he's still there."</p>
      <p>The transmission ends. The ship is never found.</p>
    `
  },
  month2: {
    title: 'SONAR ANALYSIS // MONTH 2',
    body: `
      <h3>CONTACT COUNT</h3>
      <p>Military sonar begins detecting movement. Three contacts. Then eight. Then hundreds. Perfect spacing. Perfect synchronization. Perfect silence. They move like one organism.</p>
      <p>Initially believed to be whales — the theory lasts six hours. Whales don't stop moving. These contacts remain perfectly still, sometimes for twelve hours straight. Watching. Waiting.</p>
      <h3>GLOBAL PANIC</h3>
      <p>An International Maritime Emergency is declared. Every civilian vessel is ordered back to port. Entire coastlines are evacuated.</p>
    `
  },
  'atlantis-found': {
    title: 'DISCOVERY LOG // MONTH 3',
    body: `
      <h3>AZORES EXPEDITION</h3>
      <p>An international archaeological expedition exploring unusual sonar readings near the Azores uncovers enormous stone ruins. Atlantis has been found. For three days, humanity celebrates.</p>
      <h3>SECOND DIVE</h3>
      <p>Explorers descend deeper. Whale-rib arches rise from the seafloor. Ancient stonework blends into structures unlike anything built on land. The city no longer resembles ruins — it resembles a city that never stopped growing.</p>
      <p class="quote">"...Captain... someone still lives here."</p>
      <p>The transmission cuts to static.</p>
      <h3 class="redline">INCIDENT 044-A — RESEARCH VESSEL ORION</h3>
      <p class="redline">STATUS: UNOPENED — see Part II</p>
    `
  },

  /* ===== PART II — FIRST CONTACT ===== */
  orion_capture: {
    title: 'INCIDENT 044-A // CAPTURE',
    body: `
      <h3>NORTH ATLANTIC — 23:42 UTC</h3>
      <p>A lone female is sighted near restricted waters, standing waist-deep in the crimson sea, watching the sunrise. When patrol boats approach, she never flees. She calmly allows herself to be surrounded.</p>
      <p>She is transported to Research Vessel ORION. Humanity believes it has captured history.</p>
      <p class="quote">"Perhaps they're only intelligent animals." — "Or maybe she's waiting for something."</p>
      <p>Nobody notices: the female has never once looked afraid.</p>
    `
  },
  orion_breach: {
    title: 'INCIDENT 044-A // BREACH',
    body: `
      <h3>163 CONTACTS SURROUND ORION</h3>
      <p>One contact leaves the formation. Only one. A dark figure erupts from the sea, clearing the deck in a single leap. It reaches the containment cage and tears the front away with a coral hook.</p>
      <p>The pair press their foreheads together. Then, in flawless English, the male turns to the humans:</p>
      <p class="quote redline">"You still build cages."</p>
      <p>They leap through the shattered opening and disappear into the crimson ocean.</p>
      <h3>ANALYST NOTE</h3>
      <p class="quote">"They weren't waiting. They knew one was enough."</p>
      <p class="redline">Use the hologram below to replay the retrieval.</p>
    `
  },

  /* ===== PART III — OPERATION LEVIATHAN ===== */
  leviathan_dive: {
    title: 'OPERATION LEVIATHAN // DIVE LOG',
    body: `
      <h3>SUBMERSIBLE A-17 — DEPTH 1,148m</h3>
      <p>The submersible enters the Red Tide. Visibility poor. Shadows cross the floodlights — one, five, twenty, fifty, one hundred. The sonar software stops counting past three hundred.</p>
      <p>External cameras reveal an entire civilization: males, females, juveniles, elders. Armor grown from coral, whale bone, and deep-sea minerals. Nothing manufactured. Everything grown.</p>
      <p>Dozens of hands press against the viewing ports. Not striking. Observing.</p>
    `
  },
  leviathan_loss: {
    title: 'OPERATION LEVIATHAN // LOSS',
    body: `
      <h3>HULL INTEGRITY COMPROMISED</h3>
      <p>The captain orders full speed to test the formation. The distance never changes — no visible effort, no exhaustion. Then the alarms begin. Violent impacts. Red water enters the compartment.</p>
      <p class="quote">"Sir... they broke in."</p>
      <p>No further communication is ever received. No wreckage is found. The ocean keeps its secret.</p>
      <p class="redline">Use the hologram below to replay the encirclement.</p>
    `
  },
  month7_contact: {
    title: 'INTERROGATION LOG // MONTH 7',
    body: `
      <h3>FIRST VOLUNTARY CONTACT</h3>
      <p>After six hours of silence, an Atlantian speaks in perfect English: <span class="quote">"You speak loudly."</span> Asked how it knows the language, it answers: <span class="quote">"The sea carries every voice. For centuries... we listened."</span></p>
      <p>When asked for its native tongue, the chamber fills with a fluid, resonant language. An elderly archaeologist recognizes it — Ancient Greek.</p>
      <p class="quote">"The sea remembers what the land forgets."</p>
      <p>Researchers conclude: Ancient Greek was the shared tongue when Atlantis connected two civilizations. Atlantis preserved it. Humanity forgot it.</p>
    `
  },

  /* ===== PART IV — THE LAST ARCHIVE ===== */
  atlantis_deep: {
    title: 'EXPEDITION LOG 18 // MONTH 8',
    body: `
      <h3>THE DEEPER CITY</h3>
      <p>Human ruins give way to living architecture. Towering coral pillars. Whale-rib cages planted like cathedrals. Bioluminescent forests. No roads, no ceilings, no floors — every structure exists in three dimensions. People didn't walk here. They swam.</p>
      <p class="quote">"Atlantis wasn't destroyed... it adapted."</p>
    `
  },
  great_divide: {
    title: 'FILE 008 // THE GREAT DIVIDE',
    body: `
      <h3>THE OLDEST CHAMBER</h3>
      <p>Two statues: a surface child and an ocean child, holding hands. Beneath them, in Ancient Greek:</p>
      <p class="quote">"Before the sea divided us... there was only one humanity."</p>
      <p>The Atlantians were never invaders. They were humanity's forgotten relatives.</p>
    `
  },
  final_transmission: {
    title: 'FINAL TRANSMISSION // ARCHIVE LOST',
    body: `
      <h3>03:14 UTC — EVERY NAVAL FREQUENCY ON EARTH</h3>
      <p class="quote">"The sea remembers."</p>
      <p>Followed by Ancient Greek. No threats. No demands. Only silence.</p>
      <h3 class="redline">UNKNOWN FILE — NO AUTHOR</h3>
      <p>"You believed we vanished. You called us myths, monsters, mermaids. The sea was never yours. It only tolerated you."</p>
      <p class="quote">"The question is no longer whether you can find us. The question is — can you live beside us?"</p>
      <p class="redline">GLOBAL MARITIME AUTHORITY — Archive Connection Lost.</p>
    `
  }
};
/* ============ ARCHIVE FILE WINDOW SYSTEM ============
   Opens story content in OS-style "classified file" windows:
   draggable, minimizable, closable — like a military terminal. */
(function () {
  const layer = document.getElementById('fileWindowLayer');
  const icons = document.querySelectorAll('.file-icon');
  if (!layer || !icons.length) return;

  const scrim = document.createElement('div');
  scrim.className = 'file-window-scrim';
  layer.appendChild(scrim);
  scrim.style.pointerEvents = 'auto';

  const openWindows = new Map();
  let zTop = 10;

  function buildWindow(key) {
    const data = window.REDTIDE_FILES[key];
    if (!data) return null;

    const win = document.createElement('div');
    win.className = 'file-window';
    win.style.zIndex = ++zTop;
    win.innerHTML = `
      <div class="file-window-titlebar" data-drag-handle>
        <span class="file-window-title">FILE // <strong>${data.title}</strong></span>
        <span class="file-window-controls">
          <button class="wc-btn wc-min" aria-label="Minimize file"></button>
          <button class="wc-btn wc-close" aria-label="Close file"></button>
        </span>
      </div>
      <div class="file-window-body">${data.body}</div>
    `;
    layer.appendChild(win);

    win.querySelector('.wc-close').addEventListener('click', () => closeWindow(key));
    win.querySelector('.wc-min').addEventListener('click', () => toggleMinimize(win));
    win.addEventListener('mousedown', () => { win.style.zIndex = ++zTop; });
    makeDraggable(win);

    return win;
  }

  function openWindowFor(key) {
    let win = openWindows.get(key);
    if (!win) {
      win = buildWindow(key);
      if (!win) return;
      openWindows.set(key, win);
    }
    requestAnimationFrame(() => {
      win.classList.remove('minimized');
      win.classList.add('open');
    });
    scrim.classList.add('visible');
    layer.style.pointerEvents = 'auto';
  }

  function closeWindow(key) {
    const win = openWindows.get(key);
    if (!win) return;
    win.classList.remove('open');
    setTimeout(() => {
      win.remove();
      openWindows.delete(key);
      if (openWindows.size === 0) {
        scrim.classList.remove('visible');
        layer.style.pointerEvents = 'none';
      }
    }, 450);
  }

  function toggleMinimize(win) {
    win.classList.toggle('minimized');
  }

  function makeDraggable(win) {
    const handle = win.querySelector('[data-drag-handle]');
    let dragging = false, startX, startY, startLeft, startTop;

    handle.addEventListener('mousedown', (e) => {
      if (e.target.closest('.wc-btn')) return;
      dragging = true;
      const rect = win.getBoundingClientRect();
      startX = e.clientX; startY = e.clientY;
      startLeft = rect.left; startTop = rect.top;
      win.style.left = startLeft + 'px';
      win.style.top = startTop + 'px';
      win.style.transform = 'none';
      win.classList.add('open');
      document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      win.style.left = (startLeft + dx) + 'px';
      win.style.top = (startTop + dy) + 'px';
    });

    window.addEventListener('mouseup', () => {
      dragging = false;
      document.body.style.userSelect = '';
    });
  }

  icons.forEach(icon => {
    icon.addEventListener('click', () => openWindowFor(icon.dataset.file));
  });

  scrim.addEventListener('click', () => {
    openWindows.forEach((_, key) => closeWindow(key));
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const keys = Array.from(openWindows.keys());
      if (keys.length) closeWindow(keys[keys.length - 1]);
    }
  });
})();
/* ============ HOLOGRAM 1 — ORION SHIP ============
   400+ surrounding red contact nodes + 1 node inside the ship.
   On tap: a second node appears inside the ship (the rescuer),
   both nodes leave together, then the entire formation
   disperses into the dark — visualizing Incident 044-A. */
(function () {
  const wrap = document.getElementById('shipHologram');
  if (!wrap) return;
  const canvas = wrap.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const caption = wrap.querySelector('.hologram-caption');
  const counter = wrap.querySelector('.hologram-counter');
  const replayBtn = document.getElementById('shipReplay');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = wrap.getBoundingClientRect();
    W = canvas.width = rect.width * dpr;
    H = canvas.height = rect.height * dpr;
  }
  resize();
  window.addEventListener('resize', resize);

  const NODE_COUNT = 412;
  const nodes = [];
  for (let i = 0; i < NODE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.28 + Math.random() * 0.68; // relative to min(W,H)
    nodes.push({
      baseX: 0.5 + Math.cos(angle) * radius * 0.48,
      baseY: 0.5 + Math.sin(angle) * radius * 0.42,
      phase: Math.random() * Math.PI * 2,
      speed: 0.4 + Math.random() * 0.5,
      r: Math.random() * 1.3 + 0.7,
      alpha: 1
    });
  }

  // The captive + the rescuer, both live "inside" the ship until the escape.
  const captive = { x: 0.5, y: 0.48, alpha: 1, state: 'inside' };
  const rescuer = { x: 0.5, y: 0.48, alpha: 0, state: 'hidden' };

  let phaseState = 'idle'; // idle -> rescuer-in -> escaping -> dispersing -> gone
  let phaseT = 0;
  let lastTs = 0;

  function shipPath(cx, cy, w, h) {
    ctx.beginPath();
    ctx.moveTo(cx - w * 0.5, cy);
    ctx.lineTo(cx - w * 0.32, cy - h * 0.5);
    ctx.lineTo(cx + w * 0.32, cy - h * 0.5);
    ctx.lineTo(cx + w * 0.5, cy);
    ctx.lineTo(cx + w * 0.32, cy + h * 0.5);
    ctx.lineTo(cx - w * 0.32, cy + h * 0.5);
    ctx.closePath();
  }

  function draw(ts) {
    const dt = lastTs ? (ts - lastTs) / 1000 : 0;
    lastTs = ts;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.scale(dpr, dpr);
    const w = W / dpr, h = H / dpr;
    const cx = w / 2, cy = h / 2;

    // faint concentric sonar rings
    ctx.strokeStyle = 'rgba(45,224,230,0.08)';
    ctx.lineWidth = 1;
    for (let ring = 1; ring <= 4; ring++) {
      ctx.beginPath();
      ctx.ellipse(cx, cy, ring * Math.min(w, h) * 0.11, ring * Math.min(w, h) * 0.09, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // ship silhouette
    const shipW = Math.min(w, h) * 0.5;
    const shipH = shipW * 0.32;
    shipPath(cx, cy, shipW, shipH);
    ctx.fillStyle = 'rgba(19,36,50,0.85)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(95,227,240,0.55)';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // surrounding contact field
    let visibleCount = 0;
    for (const n of nodes) {
      if (!reduced) n.phase += dt * n.speed;
      const jx = Math.cos(n.phase) * 0.006;
      const jy = Math.sin(n.phase * 1.3) * 0.006;
      const x = (n.baseX + jx) * w;
      const y = (n.baseY + jy) * h;
      if (n.alpha <= 0.01) continue;
      visibleCount++;
      const pulse = 0.55 + Math.sin(n.phase * 2) * 0.25;
      ctx.beginPath();
      ctx.fillStyle = `rgba(196,33,59,${n.alpha * pulse})`;
      ctx.shadowColor = 'rgba(196,33,59,0.8)';
      ctx.shadowBlur = 4;
      ctx.arc(x, y, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // captive / rescuer nodes (inside ship, or escaping)
    [captive, rescuer].forEach((n) => {
      if (n.alpha <= 0.01) return;
      const x = n.x * w, y = n.y * h;
      ctx.beginPath();
      ctx.fillStyle = `rgba(95,227,240,${n.alpha})`;
      ctx.shadowColor = 'rgba(95,227,240,0.9)';
      ctx.shadowBlur = 10;
      ctx.arc(x, y, 3.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.restore();

    counter.textContent = phaseState === 'gone'
      ? 'CONTACTS: 0 — FORMATION LOST'
      : `CONTACTS: ${visibleCount + 1}`;

    runSequence(dt);
    requestAnimationFrame(draw);
  }

  function runSequence(dt) {
    if (phaseState === 'idle') return;
    phaseT += dt;

    if (phaseState === 'rescuer-in') {
      rescuer.alpha = Math.min(1, phaseT / 0.6);
      if (phaseT > 1.1) { phaseState = 'escaping'; phaseT = 0; }
    } else if (phaseState === 'escaping') {
      const p = Math.min(1, phaseT / 1.3);
      const edgeX = 0.5 + 0.46;
      const edgeY = 0.48;
      captive.x = 0.5 + (edgeX - 0.5) * p;
      captive.y = 0.48 + (edgeY - 0.48) * p;
      rescuer.x = captive.x - 0.01;
      rescuer.y = captive.y + 0.01;
      captive.alpha = 1 - p * 0.9;
      rescuer.alpha = 1 - p * 0.9;
      if (p >= 1) { phaseState = 'dispersing'; phaseT = 0; }
    } else if (phaseState === 'dispersing') {
      const p = Math.min(1, phaseT / 3.2);
      for (const n of nodes) n.alpha = 1 - p;
      caption.textContent = 'ALL 163 CONTACTS RETURN TO FORMATION — THEN VANISH INTO THE DARK.';
      if (p >= 1) { phaseState = 'gone'; caption.textContent = 'RETRIEVAL COMPLETE. NO FURTHER CONTACT.'; }
    }
  }

  function trigger() {
    if (phaseState !== 'idle' && phaseState !== 'gone') return;
    // reset
    nodes.forEach(n => n.alpha = 1);
    captive.x = 0.5; captive.y = 0.48; captive.alpha = 1;
    rescuer.x = 0.5; rescuer.y = 0.48; rescuer.alpha = 0;
    phaseState = 'rescuer-in';
    phaseT = 0;
    caption.textContent = 'A SECOND CONTACT BREACHES THE HULL — REACHING THE CAPTIVE.';
  }

  wrap.addEventListener('click', trigger);
  wrap.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') trigger(); });
  replayBtn.addEventListener('click', (e) => { e.stopPropagation(); trigger(); });

  requestAnimationFrame(draw);
})();
/* ============ HOLOGRAM 2 — LEVIATHAN SUBMARINE ============
   A circle (the submersible's hull, seen in cross-section)
   surrounded by red nodes moving in slow circular orbit.
   Tapping the hull 3-4 times cracks it; on the final tap two
   nodes break formation and enter the circle — Tethys & Ariel. */
(function () {
  const wrap = document.getElementById('subHologram');
  if (!wrap) return;
  const canvas = wrap.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const caption = wrap.querySelector('.hologram-caption');
  const counter = wrap.querySelector('.hologram-counter');
  const replayBtn = document.getElementById('subReplay');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = wrap.getBoundingClientRect();
    W = canvas.width = rect.width * dpr;
    H = canvas.height = rect.height * dpr;
  }
  resize();
  window.addEventListener('resize', resize);

  const ORBIT_COUNT = 96;
  const orbiters = [];
  for (let i = 0; i < ORBIT_COUNT; i++) {
    orbiters.push({
      angle: (i / ORBIT_COUNT) * Math.PI * 2,
      radiusMul: 0.9 + Math.random() * 0.28,
      speed: (0.12 + Math.random() * 0.08) * (Math.random() > 0.5 ? 1 : -1),
      r: Math.random() * 1.2 + 0.7,
      breaching: false,
      bx: 0, by: 0, alpha: 1
    });
  }

  let hits = 0;
  const HITS_NEEDED = 4;
  let cracks = [];
  let breachStarted = false;
  let lastTs = 0;

  function draw(ts) {
    const dt = lastTs ? (ts - lastTs) / 1000 : 0;
    lastTs = ts;
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.scale(dpr, dpr);
    const w = W / dpr, h = H / dpr;
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.24;

    // hull circle
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(19,36,50,0.85)';
    ctx.fill();
    ctx.strokeStyle = hits >= HITS_NEEDED ? 'rgba(196,33,59,0.7)' : 'rgba(95,227,240,0.5)';
    ctx.lineWidth = 1.6;
    ctx.stroke();

    // crack lines
    ctx.strokeStyle = 'rgba(196,33,59,0.85)';
    ctx.lineWidth = 1.1;
    cracks.forEach(crack => {
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(crack.a) * R * 0.1, cy + Math.sin(crack.a) * R * 0.1);
      crack.pts.forEach(p => ctx.lineTo(cx + p.x, cy + p.y));
      ctx.stroke();
    });

    // orbiting nodes
    let visible = 0;
    orbiters.forEach(o => {
      if (o.alpha <= 0.01) return;
      if (!o.breaching) {
        if (!reduced) o.angle += dt * o.speed;
        const rad = R * (1.55 * o.radiusMul);
        o.bx = cx + Math.cos(o.angle) * rad;
        o.by = cy + Math.sin(o.angle) * rad * 0.86;
      } else {
        const p = Math.min(1, (performance.now() - o.breachStart) / 900);
        o.bx = o.startX + (cx - o.startX) * p;
        o.by = o.startY + (cy - o.startY) * p;
        if (p >= 1) o.alpha = 0;
      }
      visible++;
      ctx.beginPath();
      ctx.fillStyle = `rgba(196,33,59,${o.alpha * 0.85})`;
      ctx.shadowColor = 'rgba(196,33,59,0.8)';
      ctx.shadowBlur = 4;
      ctx.arc(o.bx, o.by, o.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.restore();
    counter.textContent = `SONAR CONTACTS: ${visible} · HULL STRIKES: ${Math.min(hits, HITS_NEEDED)}/${HITS_NEEDED}`;
    requestAnimationFrame(draw);
  }

  function addCrack() {
    const a = Math.random() * Math.PI * 2;
    const R = 60;
    let x = 0, y = 0;
    const pts = [];
    for (let i = 0; i < 4; i++) {
      x += (Math.random() - 0.3) * 26;
      y += (Math.random() - 0.5) * 26;
      pts.push({ x, y });
    }
    cracks.push({ a, pts });
  }

  function triggerBreach() {
    breachStarted = true;
    caption.textContent = 'HULL BREACHED — TWO CONTACTS ENTER THE VESSEL.';
    const picks = orbiters.filter(o => o.alpha > 0.5).slice(0, 2);
    const chosen = [];
    while (chosen.length < 2 && orbiters.length) {
      const idx = Math.floor(Math.random() * orbiters.length);
      if (!chosen.includes(orbiters[idx])) chosen.push(orbiters[idx]);
    }
    chosen.forEach(o => {
      o.breaching = true;
      o.startX = o.bx;
      o.startY = o.by;
      o.breachStart = performance.now();
    });
  }

  function tapHull(e) {
    if (breachStarted) return;
    hits++;
    addCrack();
    if (hits === 1) caption.textContent = 'THE HULL ABSORBS THE IMPACT.';
    if (hits === 2) caption.textContent = 'ANOTHER STRIKE. THE PLATING GROANS.';
    if (hits === 3) caption.textContent = 'HULL INTEGRITY COMPROMISED.';
    if (hits >= HITS_NEEDED) triggerBreach();
  }

  function reset() {
    hits = 0;
    cracks = [];
    breachStarted = false;
    orbiters.forEach(o => { o.breaching = false; o.alpha = 1; });
    caption.textContent = 'TAP THE HULL TO REPLAY THE ENCIRCLEMENT.';
  }

  wrap.addEventListener('click', tapHull);
  wrap.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') tapHull(e); });
  replayBtn.addEventListener('click', (e) => { e.stopPropagation(); reset(); });

  requestAnimationFrame(draw);
})();
/* ============ HOLOGRAM 3 — GLOBAL RED TIDE MAP ============
   A holographic lat/long projection of Earth's oceans, washed
   crimson, scattered with hundreds of glowing contact nodes
   that flare in near-perfect synchrony — deliberately
   impossible to count. */
(function () {
  const wrap = document.getElementById('worldmapHologram');
  if (!wrap) return;
  const canvas = wrap.querySelector('canvas');
  const ctx = canvas.getContext('2d');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W, H, dpr;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = wrap.getBoundingClientRect();
    W = canvas.width = rect.width * dpr;
    H = canvas.height = rect.height * dpr;
  }
  resize();
  window.addEventListener('resize', resize);

  const NODE_COUNT = 480;
  const nodes = Array.from({ length: NODE_COUNT }, () => ({
    x: Math.random(),
    y: 0.12 + Math.random() * 0.76,
    r: Math.random() * 1.1 + 0.5,
    offset: Math.random() * 0.6
  }));

  let clock = 0, lastTs = 0;

  function draw(ts) {
    const dt = lastTs ? (ts - lastTs) / 1000 : 0;
    lastTs = ts;
    if (!reduced) clock += dt;

    ctx.clearRect(0, 0, W, H);
    ctx.save();
    ctx.scale(dpr, dpr);
    const w = W / dpr, h = H / dpr;

    // crimson ocean wash
    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w * 0.6);
    grad.addColorStop(0, 'rgba(196,33,59,0.16)');
    grad.addColorStop(1, 'rgba(196,33,59,0.02)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    // lat/long grid — the "holographic projection" feel
    ctx.strokeStyle = 'rgba(196,33,59,0.14)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 10; i++) {
      const x = (i / 10) * w;
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
    }
    for (let j = 0; j <= 6; j++) {
      const y = (j / 6) * h;
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
    }
    ctx.strokeStyle = 'rgba(196,33,59,0.35)';
    ctx.lineWidth = 1.4;
    ctx.strokeRect(1, 1, w - 2, h - 2);

    // synchronized pulse wave: mostly in-phase with slight per-node jitter
    const wave = 0.55 + Math.sin(clock * 1.6) * 0.45;
    nodes.forEach(n => {
      const flare = Math.max(0, wave - n.offset * 0.3) + 0.15;
      const x = n.x * w, y = n.y * h;
      ctx.beginPath();
      ctx.fillStyle = `rgba(255,90,110,${0.25 + flare * 0.55})`;
      ctx.shadowColor = 'rgba(255,90,110,0.9)';
      ctx.shadowBlur = 3 + flare * 3;
      ctx.arc(x, y, n.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    ctx.restore();
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();
/* ============ INTERACTIVE HOLOGRAPHIC GLOBE ============
   A wireframe/point-cloud Earth the visitor can drag to rotate
   and scroll to zoom. Red nodes mark classified incidents;
   clicking one opens its report.

   Defensive by design: Three.js loads from a CDN, so this waits
   for it (with a timeout), falls back visibly if WebGL or the
   library is unavailable, and never leaves a silent blank box. */
(function () {
  const mount = document.getElementById('globeMount');
  const fallback = document.getElementById('globeFallback');
  if (!mount) return;

  function showError(msg, sub) {
    if (!fallback) return;
    fallback.classList.add('error');
    fallback.innerHTML = `
      <span class="globe-fallback-spin" aria-hidden="true">⚠</span>
      <p>${msg}</p>
      ${sub ? `<span class="globe-fallback-sub">${sub}</span>` : ''}
    `;
  }

  function webglAvailable() {
    try {
      const c = document.createElement('canvas');
      return !!(window.WebGLRenderingContext &&
        (c.getContext('webgl') || c.getContext('experimental-webgl')));
    } catch (e) {
      return false;
    }
  }

  // Three.js loads via a blocking <script> tag before this file, but the
  // CDN-fallback path (onerror handler in index.html) injects a second
  // script asynchronously — so poll briefly instead of assuming it's ready.
  let waited = 0;
  const POLL_MS = 150;
  const MAX_WAIT_MS = 6000;

  function waitForThree() {
    if (typeof THREE !== 'undefined') {
      init();
      return;
    }
    if (window.__THREE_LOAD_FAILED || waited >= MAX_WAIT_MS) {
      showError(
        'UPLINK FAILED — 3D ENGINE UNAVAILABLE',
        'Three.js could not be loaded from the CDN. Check your internet connection or an ad-blocker/extension that may be blocking cdnjs.cloudflare.com and cdn.jsdelivr.net, then reload.'
      );
      return;
    }
    waited += POLL_MS;
    setTimeout(waitForThree, POLL_MS);
  }

  if (!webglAvailable()) {
    showError(
      'WEBGL UNAVAILABLE ON THIS DEVICE',
      'Your browser or graphics driver does not support WebGL, which the holographic globe requires.'
    );
    return;
  }

  waitForThree();

  function init() {
    try {
      if (fallback) fallback.remove();

      const reportPanel = document.getElementById('globeReport');
      const reportTitle = document.getElementById('globeReportTitle');
      const reportBody = document.getElementById('globeReportBody');
      const reportClose = document.getElementById('globeReportClose');

      const NODES = [
        { lat: 38, lon: -68, title: 'INCIDENT 044-A', text: 'Research Vessel ORION — first physical contact and containment breach. North Atlantic.' },
        { lat: 20, lon: -155, title: 'OPERATION LEVIATHAN', text: 'Submersible A-17 lost during deep reconnaissance. No wreckage recovered.' },
        { lat: 13, lon: 122, title: 'DAY 1 SIGHTING', text: 'First reported crimson water anomaly, Philippine Sea.' },
        { lat: -14, lon: -170, title: 'FISHING FLEET LOSS', text: 'Seven vessels vanish within one week — no distress signal.' },
        { lat: 37, lon: -25, title: 'ATLANTIS LOCATED', text: 'Azores expedition uncovers living underwater architecture.' },
        { lat: -33, lon: 151, title: 'COASTAL SIGHTING', text: 'Figures reported standing chest-deep offshore, motionless, for hours.' },
        { lat: 60, lon: -20, title: 'SONAR FORMATION', text: '163 synchronized contacts detected — perfect spacing, no known cause.' },
        { lat: -60, lon: 0, title: 'ANTARCTIC CONTACT', text: 'Deep sonar returns near the ice shelf. Unconfirmed, unresolved.' }
      ];

      let W = mount.clientWidth || mount.getBoundingClientRect().width || 600;
      let H = mount.clientHeight || mount.getBoundingClientRect().height || 400;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
      camera.position.set(0, 0, 6.4);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(W, H);
      mount.appendChild(renderer.domElement);

      const globeGroup = new THREE.Group();
      scene.add(globeGroup);

      const dotGeo = new THREE.SphereGeometry(2, 64, 64);
      const dotMat = new THREE.PointsMaterial({ color: 0x2de0e6, size: 0.012, transparent: true, opacity: 0.55 });
      globeGroup.add(new THREE.Points(dotGeo, dotMat));

      const wireGeo = new THREE.SphereGeometry(2.002, 24, 18);
      const wireMat = new THREE.MeshBasicMaterial({ color: 0x2de0e6, wireframe: true, transparent: true, opacity: 0.08 });
      globeGroup.add(new THREE.Mesh(wireGeo, wireMat));

      const glowGeo = new THREE.SphereGeometry(2.15, 32, 32);
      const glowMat = new THREE.MeshBasicMaterial({ color: 0x0fa3a3, transparent: true, opacity: 0.05, side: THREE.BackSide });
      globeGroup.add(new THREE.Mesh(glowGeo, glowMat));

      function latLonToVec3(lat, lon, r) {
        const phi = (90 - lat) * (Math.PI / 180);
        const theta = (lon + 180) * (Math.PI / 180);
        return new THREE.Vector3(
          -r * Math.sin(phi) * Math.cos(theta),
          r * Math.cos(phi),
          r * Math.sin(phi) * Math.sin(theta)
        );
      }

      const nodeMeshes = [];
      const nodeGeo = new THREE.SphereGeometry(0.045, 12, 12);
      NODES.forEach(n => {
        const mat = new THREE.MeshBasicMaterial({ color: 0xc4213b });
        const mesh = new THREE.Mesh(nodeGeo, mat);
        mesh.position.copy(latLonToVec3(n.lat, n.lon, 2.05));
        mesh.userData = n;
        globeGroup.add(mesh);
        nodeMeshes.push(mesh);

        const ringGeo = new THREE.RingGeometry(0.06, 0.075, 24);
        const ringMat = new THREE.MeshBasicMaterial({ color: 0xc4213b, transparent: true, opacity: 0.6, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, ringMat);
        ring.position.copy(mesh.position);
        ring.lookAt(0, 0, 0);
        globeGroup.add(ring);
      });

      let dragging = false, lastX = 0, lastY = 0;

      function onDown(x, y) { dragging = true; lastX = x; lastY = y; }
      function onMove(x, y) {
        if (!dragging) return;
        const dx = x - lastX, dy = y - lastY;
        globeGroup.rotation.y += dx * 0.0045;
        globeGroup.rotation.x = Math.max(-1, Math.min(1, globeGroup.rotation.x + dy * 0.0045));
        lastX = x; lastY = y;
      }
      function onUp() { dragging = false; }

      const dom = renderer.domElement;
      dom.addEventListener('mousedown', (e) => onDown(e.clientX, e.clientY));
      window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
      window.addEventListener('mouseup', onUp);
      dom.addEventListener('touchstart', (e) => { const t = e.touches[0]; onDown(t.clientX, t.clientY); }, { passive: true });
      dom.addEventListener('touchmove', (e) => { const t = e.touches[0]; onMove(t.clientX, t.clientY); }, { passive: true });
      dom.addEventListener('touchend', onUp);

      dom.addEventListener('wheel', (e) => {
        e.preventDefault();
        camera.position.z = Math.max(3.2, Math.min(10, camera.position.z + e.deltaY * 0.0025));
      }, { passive: false });

      const raycaster = new THREE.Raycaster();
      const mouseV = new THREE.Vector2();
      dom.addEventListener('click', (e) => {
        if (Math.abs(e.clientX - lastX) > 4) return;
        const rect = dom.getBoundingClientRect();
        mouseV.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
        mouseV.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
        raycaster.setFromCamera(mouseV, camera);
        const hits = raycaster.intersectObjects(nodeMeshes);
        if (hits.length) openReport(hits[0].object.userData);
      });

      function openReport(data) {
        if (!reportPanel) return;
        reportTitle.textContent = data.title;
        reportBody.textContent = data.text;
        reportPanel.classList.add('open');
      }
      if (reportClose) reportClose.addEventListener('click', () => reportPanel.classList.remove('open'));

      function resize() {
        W = mount.clientWidth; H = mount.clientHeight;
        if (!W || !H) return;
        camera.aspect = W / H;
        camera.updateProjectionMatrix();
        renderer.setSize(W, H);
      }
      window.addEventListener('resize', resize);
      // Re-measure once more shortly after init in case the globe section
      // was still mid-layout (e.g. behind a not-yet-revealed parent) on load.
      setTimeout(resize, 300);

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      function animate() {
        if (!dragging && !reduced) globeGroup.rotation.y += 0.0009;
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
      }
      animate();
    } catch (err) {
      console.error('Globe initialization failed:', err);
      showError('HOLOGRAM PROJECTION FAILED', 'An unexpected error interrupted the render. Check the browser console for details.');
    }
  }
})();
/* ============ ARCHIVE TERMINAL ============ */
(function () {
  const body = document.getElementById('terminalBody');
  const input = document.getElementById('terminalInput');
  const form = document.getElementById('terminalForm');
  if (!body || !input || !form) return;

  const COMMANDS = {
    help: () => [
      'AVAILABLE COMMANDS:',
      '  help       — list commands',
      '  archive    — archive status summary',
      '  entities   — list known Atlantian designations',
      '  atlantis   — Atlantis discovery brief',
      '  redtide    — Red Tide phenomenon summary',
      '  status     — current mission status',
      '  timeline   — key dates in the crisis',
      '  map        — jump to the world map',
      '  clear      — clear the terminal'
    ],
    archive: () => [
      'ARCHIVE STATUS: PARTIALLY DECLASSIFIED',
      '4 PARTS RECOVERED · 2 FILES CORRUPTED',
      'CLEARANCE LEVEL: OMEGA'
    ],
    entities: () => [
      'KNOWN DESIGNATIONS:',
      '  MELIA — status: unconfirmed',
      '  MNESSEUS — status: unconfirmed',
      '  LADY OF THE LAKE — status: sighted, North Atlantic + Antarctic',
      '  ARIEL — status: involved, Incident 044-A',
      '  ATLANTIEA — status: unconfirmed',
      '  TETHYS — status: involved, Operation Leviathan',
      'Full profiles: see CHARACTERS section.'
    ],
    atlantis: () => [
      'Located near the Azores. Not ruins — living architecture.',
      'Coral pillars, whale-rib cathedrals, bioluminescent forests.',
      'Statues in the oldest chamber suggest a single divided humanity.'
    ],
    redtide: () => [
      'Global ocean discoloration first reported Day 1, Philippine Sea.',
      'Spread to every ocean within 72 hours.',
      'Cause: unconfirmed. Correlated with Atlantian activity.'
    ],
    status: () => [
      'MISSION STATUS: ARCHIVE LOST',
      'Last transmission: "The sea remembers."',
      'No further contact from G.M.A. monitoring network.'
    ],
    timeline: () => [
      'DAY 1     — First crimson water sighting',
      'DAY 13    — First vessel disappearance',
      'MONTH 2   — Global sonar formation detected',
      'MONTH 3   — Atlantis located',
      'MONTH 7   — First voluntary contact',
      'MONTH 9   — Final transmission — ARCHIVE LOST'
    ],
    map: () => { location.hash = '#world-map'; return ['Redirecting to world map...']; },
    clear: () => null
  };

  function printLine(text, cls) {
    const div = document.createElement('div');
    div.className = 'line' + (cls ? ' ' + cls : '');
    div.textContent = text;
    body.appendChild(div);
  }

  function printCommand(cmd) {
    const div = document.createElement('div');
    div.className = 'line cmd';
    div.textContent = cmd;
    body.appendChild(div);
  }

  function runCommand(raw) {
    const cmd = raw.trim().toLowerCase();
    printCommand(raw);
    if (!cmd) return;
    if (cmd === 'clear') { body.innerHTML = ''; return; }
    const handler = COMMANDS[cmd];
    if (!handler) {
      printLine(`Unrecognized command: "${cmd}". Type "help" for a list.`, 'err');
      return;
    }
    const out = handler();
    if (out) out.forEach(line => printLine(line, 'dim'));
    body.scrollTop = body.scrollHeight;
  }

  printLine('GLOBAL MARITIME AUTHORITY — SECURE TERMINAL', 'dim');
  printLine('Type "help" to list available commands.', 'dim');

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const val = input.value;
    input.value = '';
    runCommand(val);
    body.scrollTop = body.scrollHeight;
  });

  document.querySelectorAll('[data-term-cmd]').forEach(btn => {
    btn.addEventListener('click', () => {
      input.value = btn.dataset.termCmd;
      input.focus();
    });
  });
})();
/* ============ CHARACTER DATABASE ============ */
window.REDTIDE_CHARACTERS = [
  {
    id: 'melia',
    codename: 'UNKNOWN SUBJECT — M',
    name: 'Melia',
    role: 'Elder / Record-Keeper',
    height: '—cm (unconfirmed)',
    weapons: 'None observed',
    behavior: 'Passive. Observed near ancient archive chambers.',
    languages: 'Ancient Greek, Atlantian tongue',
    lastSeen: 'Unconfirmed',
    threat: 'MINIMAL'
  },
  {
    id: 'mnesseus',
    codename: 'UNKNOWN ENTITY — MN',
    name: 'Mnesseus',
    role: 'Unconfirmed',
    height: '—cm (unconfirmed)',
    weapons: 'Unconfirmed',
    behavior: 'No direct sighting on record.',
    languages: 'Unconfirmed',
    lastSeen: 'No record',
    threat: 'UNKNOWN'
  },
  {
    id: 'lady-of-the-lake',
    codename: 'UNKNOWN SUBJECT — LOTL',
    name: 'Lady of the Lake',
    role: 'Long-range scout',
    height: '—cm (unconfirmed)',
    weapons: 'Coral hook',
    behavior: 'Tracked across multiple ocean basins — North America, Antarctica, Indian Ocean.',
    languages: 'English (self-taught), Ancient Greek',
    lastSeen: 'Southern Ocean, unconfirmed',
    threat: 'LOW'
  },
  {
    id: 'ariel',
    codename: 'UNKNOWN SUBJECT — A',
    name: 'Ariel',
    role: 'Captive, Incident 044-A',
    height: '—cm (unconfirmed)',
    weapons: 'None used during captivity',
    behavior: 'Calm under containment. Showed no fear response.',
    languages: 'English (fluent), Ancient Greek',
    lastSeen: 'North Atlantic, released into formation',
    threat: 'LOW'
  },
  {
    id: 'atlantiea',
    codename: 'UNKNOWN ENTITY — AT',
    name: 'Atlantiea',
    role: 'Unconfirmed — possible city authority',
    height: '—cm (unconfirmed)',
    weapons: 'Unconfirmed',
    behavior: 'Referenced only in translated inscriptions.',
    languages: 'Ancient Greek',
    lastSeen: 'No direct sighting',
    threat: 'UNKNOWN'
  },
  {
    id: 'tethys',
    codename: 'UNKNOWN SUBJECT — T',
    name: 'Tethys',
    role: 'Breach operative, Operation Leviathan',
    height: '—cm (unconfirmed)',
    weapons: 'Coral hook, sharpened bone blade',
    behavior: 'Highly coordinated. Led hull breach on Submersible A-17.',
    languages: 'English (fluent), Ancient Greek',
    lastSeen: 'Pacific deep trench, unconfirmed',
    threat: 'ELEVATED'
  }
];
/* ============ CHARACTER DATABASE RENDER ============
   Each subject starts locked (silhouette + designation only).
   Clicking declassifies it — revealing full intelligence. */
(function () {
  const grid = document.getElementById('charGrid');
  if (!grid || !window.REDTIDE_CHARACTERS) return;

  const THREAT_COLOR = {
    MINIMAL: 'rgba(95,227,240,0.6)',
    LOW: 'rgba(95,227,240,0.6)',
    ELEVATED: 'rgba(196,33,59,0.7)',
    UNKNOWN: 'rgba(150,160,168,0.6)'
  };

  window.REDTIDE_CHARACTERS.forEach(c => {
    const card = document.createElement('button');
    card.className = 'char-card';
    card.setAttribute('data-unlocked', 'false');
    card.setAttribute('data-interactive', '');
    card.innerHTML = `
      <div class="char-portrait">
        <div class="char-silhouette"></div>
        <span class="char-lock-icon">LOCKED</span>
      </div>
      <div class="char-info">
        <div class="char-codename">${c.codename}</div>
        <div class="char-name">CLASSIFIED</div>
        <span class="char-threat">THREAT: ${c.threat}</span>
        <dl class="char-details">
          <dt>ROLE</dt><dd>${c.role}</dd>
          <dt>HEIGHT</dt><dd>${c.height}</dd>
          <dt>WEAPONS</dt><dd>${c.weapons}</dd>
          <dt>BEHAVIOR</dt><dd>${c.behavior}</dd>
          <dt>LANGUAGES</dt><dd>${c.languages}</dd>
          <dt>LAST SEEN</dt><dd>${c.lastSeen}</dd>
        </dl>
      </div>
    `;

    card.addEventListener('click', () => {
      const unlocked = card.getAttribute('data-unlocked') === 'true';
      if (unlocked) return;
      card.setAttribute('data-unlocked', 'true');
      card.querySelector('.char-lock-icon').textContent = 'DECLASSIFIED';
      card.querySelector('.char-name').textContent = c.name;
      const threatEl = card.querySelector('.char-threat');
      threatEl.style.borderColor = THREAT_COLOR[c.threat] || 'var(--border-soft)';
    });

    grid.appendChild(card);
  });
})();
/* ============ ATLANTIS INTERACTIVE ILLUSTRATION ============ */
(function () {
  const stage = document.getElementById('atlantisStage');
  if (!stage) return;
  const tooltip = stage.querySelector('.atlantis-tooltip');
  const spots = stage.querySelectorAll('.atlantis-hotspot');

  function show(spot) {
    const { lore, loreTitle } = spot.dataset;
    tooltip.innerHTML = `<strong>${loreTitle}</strong>${lore}`;
    const left = spot.style.left;
    const top = spot.style.top;
    tooltip.style.left = left;
    tooltip.style.top = `calc(${top} + 26px)`;
    tooltip.classList.add('visible');
  }

  spots.forEach(spot => {
    spot.addEventListener('click', () => show(spot));
    spot.addEventListener('focus', () => show(spot));
  });

  stage.addEventListener('mouseleave', () => tooltip.classList.remove('visible'));
})();
/* ============ RESEARCH HOLOGRAMS ============ */
(function () {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function setupCanvas(id) {
    const wrap = document.getElementById(id);
    if (!wrap) return null;
    const canvas = wrap.querySelector('canvas');
    const ctx = canvas.getContext('2d');
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const rect = wrap.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);
    return { canvas, ctx, wrap };
  }

  /* ===== 1. HOLOGRAPHIC SCALES ===== */
  const scales = setupCanvas('scalesCanvas');
  if (scales) {
    let t = 0;
    function draw() {
      const w = scales.wrap.clientWidth, h = scales.wrap.clientHeight;
      const ctx = scales.ctx;
      ctx.clearRect(0, 0, w, h);
      if (!reduced) t += 0.01;
      const rows = 7, cols = 11, size = w / cols;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const offsetX = (r % 2) * size / 2;
          const x = c * size + offsetX;
          const y = r * size * 0.78 + size * 0.3;
          const glow = 0.35 + Math.sin(t + r * 0.5 + c * 0.3) * 0.25;
          ctx.beginPath();
          ctx.arc(x, y, size * 0.46, Math.PI, 0);
          ctx.strokeStyle = `rgba(45,224,230,${glow})`;
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ===== 2. HOLOGRAPHIC WEAPON (coral hook / spear) ===== */
  const weapon = setupCanvas('weaponCanvas');
  if (weapon) {
    let t = 0;
    function draw() {
      const w = weapon.wrap.clientWidth, h = weapon.wrap.clientHeight;
      const ctx = weapon.ctx;
      ctx.clearRect(0, 0, w, h);
      if (!reduced) t += 0.006;
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(Math.sin(t) * 0.08);

      // shaft
      ctx.strokeStyle = 'rgba(95,227,240,0.75)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(-h * 0.32, h * 0.3);
      ctx.lineTo(h * 0.1, -h * 0.32);
      ctx.stroke();

      // hooked blade
      ctx.beginPath();
      ctx.moveTo(h * 0.1, -h * 0.32);
      ctx.quadraticCurveTo(h * 0.34, -h * 0.42, h * 0.3, -h * 0.18);
      ctx.quadraticCurveTo(h * 0.26, -h * 0.02, h * 0.12, -h * 0.14);
      ctx.strokeStyle = 'rgba(196,33,59,0.85)';
      ctx.lineWidth = 3;
      ctx.stroke();

      // grip wraps
      ctx.strokeStyle = 'rgba(95,227,240,0.35)';
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 5; i++) {
        const p = i / 4;
        const x = -h * 0.32 + p * (h * 0.16);
        const y = h * 0.3 - p * (h * 0.14);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();
      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }

  /* ===== 4. COASTAL TRAVEL-PATH MAP — LADY OF THE LAKE ===== */
  const pathMap = setupCanvas('pathCanvas');
  if (pathMap) {
    // Stylized relative positions (not literal geography): North America
    // coasts, Antarctica, Indian/Arabic Ocean, connected in travel order.
    const route = [
      { x: 0.20, y: 0.28 }, // NE North America coast
      { x: 0.16, y: 0.42 }, // Gulf / SE coast
      { x: 0.30, y: 0.58 }, // South Atlantic crossing
      { x: 0.58, y: 0.82 }, // Antarctic waters
      { x: 0.78, y: 0.52 }, // Indian Ocean
      { x: 0.86, y: 0.40 }  // Arabian Sea
    ];
    const extraNodes = Array.from({ length: 40 }, () => ({
      x: Math.random(),
      y: 0.15 + Math.random() * 0.7,
      r: Math.random() * 1 + 0.5
    }));
    let t = 0;
    function draw() {
      const w = pathMap.wrap.clientWidth, h = pathMap.wrap.clientHeight;
      const ctx = pathMap.ctx;
      ctx.clearRect(0, 0, w, h);
      if (!reduced) t += 0.01;

      // grid
      ctx.strokeStyle = 'rgba(45,224,230,0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i <= 8; i++) {
        const x = (i / 8) * w;
        ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, h); ctx.stroke();
      }
      for (let j = 0; j <= 5; j++) {
        const y = (j / 5) * h;
        ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(w, y); ctx.stroke();
      }

      // ambient extra contact nodes (Antarctic + Indian/Arabic clusters etc.)
      extraNodes.forEach(n => {
        const flare = 0.3 + Math.sin(t + n.x * 6) * 0.2;
        ctx.beginPath();
        ctx.fillStyle = `rgba(196,33,59,${0.25 + flare})`;
        ctx.arc(n.x * w, n.y * h, n.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // travel path
      ctx.strokeStyle = 'rgba(95,227,240,0.8)';
      ctx.lineWidth = 1.6;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      route.forEach((p, i) => {
        const x = p.x * w, y = p.y * h;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      });
      ctx.stroke();
      ctx.setLineDash([]);

      // route waypoints
      route.forEach((p) => {
        ctx.beginPath();
        ctx.fillStyle = 'rgba(95,227,240,0.95)';
        ctx.shadowColor = 'rgba(95,227,240,0.9)';
        ctx.shadowBlur = 6;
        ctx.arc(p.x * w, p.y * h, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      requestAnimationFrame(draw);
    }
    requestAnimationFrame(draw);
  }
})();
/* ============ MAIN INIT ============ */
(function () {
  // Small foreground drift particles within the hero, layered above the
  // full-page canvas for extra depth right where the title lives.
  const field = document.getElementById('heroParticles');
  if (!field) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduced) return;

  const N = 22;
  for (let i = 0; i < N; i++) {
    const dot = document.createElement('span');
    const size = Math.random() * 2 + 1;
    const left = Math.random() * 100;
    const dur = Math.random() * 10 + 10;
    const delay = Math.random() * -20;
    dot.style.cssText = `
      position:absolute; left:${left}%; bottom:-10px;
      width:${size}px; height:${size}px; border-radius:50%;
      background:rgba(95,227,240,${Math.random() * 0.4 + 0.1});
      animation: heroFloat ${dur}s linear ${delay}s infinite;
    `;
    field.appendChild(dot);
  }

  const style = document.createElement('style');
  style.textContent = `
    @keyframes heroFloat {
      to { transform: translateY(-115vh); }
    }
  `;
  document.head.appendChild(style);
})();
