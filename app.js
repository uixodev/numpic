(() => {
'use strict';
const CARDS = window.CARDS;                       // index = number 0..99
const $ = (s, r = document) => r.querySelector(s);
const pad = n => String(n).padStart(2, '0');
const rand = n => Math.floor(Math.random() * n);
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = rand(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const range = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));

/* ---------------- icons ---------------- */
const I = (d, extra = '') => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" ${extra}>${d}</svg>`;
const F = d => `<svg viewBox="0 0 24 24" fill="currentColor">${d}</svg>`;
const ICON = {
  flame: F('<path d="M19.5 12.4c-1.6-4.1-7.2-4.3-5.8-10.2.1-.4-.4-.8-.8-.5C9.300 3.700 6.700 8 8.900 13.600c.2.500-.4.900-.8.600-1.800-1.400-2-3.300-1.800-4.800.1-.5-.6-.8-.9-.3C4.700 10.200 4 11.800 4 14.400c.4 5.600 5.100 7.300 6.800 7.500 2.400.3 5.100-.1 7-1.900 2.100-1.900 2.800-5 1.700-7.700zm-9.300 5c1.400-.4 2.200-1.400 2.400-2.300.3-1.400-1-2.800-.1-5.100.3 1.900 3.300 3 3.300 5.100.1 2.500-2.700 4.700-5.600 2.300z"/>'),
  bolt: F('<path d="M13.5 2 4.5 13.5h6L9.5 22l9-11.5h-6z"/>'),
  star: F('<path d="m12 2.5 2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 17.4l-5.9 3.1 1.2-6.5L2.5 9.4l6.6-.9z"/>'),
  spark: F('<path d="M12 2l2.3 6.4L21 10.7l-6.7 2.3L12 22l-2.3-9-6.7-2.3 6.7-2.3z"/>'),
  lock: I('<rect x="5" y="11" width="14" height="10" rx="3"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>'),
  check: I('<path d="m5 12.5 4.5 4.5L19 7.5"/>', 'stroke-width="3.2"'),
  x: I('<path d="M6 6l12 12M18 6 6 18"/>', 'stroke-width="3"'),
  trophy: I('<path d="M7 3h10v5a5 5 0 0 1-10 0z"/><path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5a3.5 3.5 0 0 1-3.5 3.5M12 13v4M8 21h8M9.5 21v-1.5a2.5 2.5 0 0 1 5 0V21"/>'),
  route: I('<circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8.5 18H15a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h6.5"/>'),
  grid: I('<rect x="4" y="4" width="7" height="7" rx="2"/><rect x="13" y="4" width="7" height="7" rx="2"/><rect x="4" y="13" width="7" height="7" rx="2"/><rect x="13" y="13" width="7" height="7" rx="2"/>'),
  target: I('<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r=".8" fill="currentColor"/>'),
  user: I('<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>'),
  speaker: I('<path d="M4 9.5v5h4l5 4v-13l-5 4z"/><path d="M16.5 9a4 4 0 0 1 0 6M19 6.5a8 8 0 0 1 0 11"/>'),
  back: I('<path d="M20 5H9l-6 7 6 7h11z"/><path d="m12 9 5 6M17 9l-5 6"/>', 'stroke-width="2"'),
  eye: I('<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/><circle cx="12" cy="12" r="3"/>'),
  shuffle: I('<path d="M3 7h3c5 0 5 10 10 10h5M3 17h3c1.7 0 2.8-.9 3.8-2.2M21 7h-5c-1.7 0-2.8.9-3.8 2.2M18 4l3 3-3 3M18 14l3 3-3 3"/>'),
  heart: F('<path d="M12 21s-8-5.3-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 5.7-8 11-8 11z"/>'),
};

/* ---------------- persistent state ---------------- */
const KEY = 'numpic.v1';
const defaults = () => ({ xp: 0, streak: 0, best: 0, last: null, today: { d: null, xp: 0 }, goal: 30, sound: true,
  done: {}, cards: {}, answered: 0, correct: 0, lessons: 0 });
let S;
try { S = { ...defaults(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { S = defaults(); }
const save = () => { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch {} };
const dayStr = (d = new Date()) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const liveStreak = () => {
  if (!S.last) return 0;
  return (S.last === dayStr() || S.last === dayStr(new Date(Date.now() - 864e5))) ? S.streak : 0;
};
const todayXp = () => S.today.d === dayStr() ? S.today.xp : 0;
const cs = n => S.cards[n] || { s: 0, seen: 0 };
function bump(n, d) {
  const c = S.cards[n] || (S.cards[n] = { s: 0, seen: 1 });
  c.s = clamp(c.s + d, 0, 5);
}

/* ---------------- course structure ---------------- */
const SOUNDS = ['S · Z', 'T · D', 'N', 'M', 'R', 'L', 'J · Ch · Sh', 'K · G', 'F · V', 'P · B'];
const PAL = [
  ['#8b6cff', '#5b3df5', '#3f27b8'], ['#ff8a7a', '#ff4d6d', '#c22e4b'], ['#4cc9ff', '#2f7bff', '#1f55c4'],
  ['#ffcb47', '#ff9a1f', '#c46f0a'], ['#ff7ad9', '#c43cf0', '#8a24b0'], ['#7b8cff', '#4b4ee8', '#3235a8'],
  ['#38e0e8', '#12a5d6', '#0b78a0'], ['#ff9966', '#ff5e3a', '#c23d1e'], ['#b583ff', '#8a3ffc', '#5f26b5'],
  ['#ffa3a3', '#f0568c', '#b03563'],
];
const colorVars = u => `--c1:${PAL[u][0]};--c2:${PAL[u][1]};--cd:${PAL[u][2]}`;
const UNITS = range(0, 9).map(u => ({
  u, sound: SOUNDS[u], from: u * 10, to: u * 10 + 9,
  nodes: [
    { id: `u${u}a`, kind: 'learn', u, label: `${pad(u * 10)}–${pad(u * 10 + 4)}`, cards: range(u * 10, u * 10 + 4) },
    { id: `u${u}b`, kind: 'learn', u, label: `${pad(u * 10 + 5)}–${pad(u * 10 + 9)}`, cards: range(u * 10 + 5, u * 10 + 9) },
    { id: `u${u}t`, kind: 'test', u, label: 'Unit test', cards: range(u * 10, u * 10 + 9) },
  ],
}));
const ALL = UNITS.flatMap(u => u.nodes);
const unlocked = i => i === 0 || !!S.done[ALL[i - 1].id];
const currentIdx = () => { const i = ALL.findIndex(n => !S.done[n.id]); return i < 0 ? -1 : i; };

/* ---------------- audio / haptics ---------------- */
let AC;
function tone(seq) {
  if (!S.sound) return;
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    let t = AC.currentTime;
    for (const [f, d, type] of seq) {
      const o = AC.createOscillator(), g = AC.createGain();
      o.type = type || 'sine'; o.frequency.value = f;
      g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.16, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g).connect(AC.destination); o.start(t); o.stop(t + d + 0.02); t += d * 0.8;
    }
  } catch {}
}
const sfx = {
  ok: () => { tone([[660, .1], [880, .16]]); buzz(15); },
  bad: () => { tone([[220, .18, 'triangle'], [165, .22, 'triangle']]); buzz([40, 40, 40]); },
  win: () => tone([[523, .12], [659, .12], [784, .12], [1047, .3]]),
  tap: () => tone([[500, .05]]),
};
function buzz(p) { try { if (S.sound && navigator.vibrate) navigator.vibrate(p); } catch {} }
function speak(n) {
  try {
    const c = CARDS[n]; const u = new SpeechSynthesisUtterance(`${c.n.split('').join(' ')}. ${c.w}`);
    u.lang = /[а-яё]/i.test(c.w) ? 'ru-RU' : 'en-GB'; u.rate = .9; speechSynthesis.cancel(); speechSynthesis.speak(u);
  } catch {}
}

/* ---------------- tiny UI helpers ---------------- */
let toastT;
function toast(msg) { const t = $('#toast'); t.textContent = msg; t.classList.add('on'); clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('on'), 2200); }
function sheet(html, mount) {
  const b = document.createElement('div'); b.className = 'backdrop';
  b.innerHTML = `<div class="sheet" role="dialog" aria-modal="true">${html}</div>`;
  const close = () => b.remove();
  b.addEventListener('click', e => { if (e.target === b) close(); });
  document.body.appendChild(b); mount && mount(b, close); return close;
}
function confetti() {
  const cols = ['#8b6cff', '#ff4d6d', '#ffcb47', '#4cc9ff', '#ff7ad9', '#ff9a1f'];
  for (let i = 0; i < 46; i++) {
    const e = document.createElement('i'); e.className = 'confetti';
    e.style.cssText = `left:${rand(100)}vw;background:${cols[rand(cols.length)]};--dx:${rand(160) - 80}px;--r:${rand(720)}deg;animation-duration:${1.8 + Math.random() * 1.6}s;animation-delay:${Math.random() * .5}s`;
    document.body.appendChild(e); setTimeout(() => e.remove(), 4200);
  }
}
const cardPic = n => `${CARDS[n].e} ${CARDS[n].w}`;

/* ---------------- main app (tabs) ---------------- */
let tab = 'path';
const TABS = [['path', 'Learn', ICON.route], ['library', 'Library', ICON.grid], ['practice', 'Practice', ICON.target], ['profile', 'Profile', ICON.user]];
let libFilter = 'all', libQuery = '', libCover = false;

function renderNav() {
  $('#nav').innerHTML = `<div class="brand"><img src="icon.svg" alt="">Numpic</div>` +
    TABS.map(([id, label, ic]) => `<button class="tab ${tab === id ? 'on' : ''}" data-tab="${id}" aria-label="${label}">${ic}<span>${label}</span></button>`).join('');
}
function statusBar(title) {
  const st = liveStreak();
  return `<div class="status"><div class="title-sm">${title}</div><div class="sp"></div>
    <div class="chip fire ${st ? '' : 'off'}" title="Day streak">${ICON.flame}${st}</div>
    <div class="chip xp" title="Total XP">${ICON.bolt}${S.xp}</div></div>`;
}
function render(keepScroll) {
  const y = window.scrollY; renderNav();
  const app = $('#app');
  app.innerHTML = ({ path: viewPath, library: viewLibrary, practice: viewPractice, profile: viewProfile })[tab]();
  window.scrollTo(0, keepScroll ? y : 0);
  if (tab === 'path' && !keepScroll) { const c = $('.node.current'); c && setTimeout(() => c.scrollIntoView({ block: 'center', behavior: 'smooth' }), 60); }
}

/* ----- Learn path ----- */
function stars(n) { return `<div class="stars">${[1, 2, 3].map(i => ICON.star.replace('<svg', `<svg class="${i <= n ? 'on' : ''}"`)).join('')}</div>`; }
function viewPath() {
  const cur = currentIdx(); const goal = S.goal, tx = todayXp();
  const offs = [0, -42, -66, -42, 0, 42, 66, 42];
  let k = 0;
  const units = UNITS.map(un => {
    const first = ALL.indexOf(un.nodes[0]); const locked = !unlocked(first);
    const nodes = un.nodes.map(nd => {
      const i = ALL.indexOf(nd); const open = unlocked(i), done = !!S.done[nd.id], isCur = i === cur;
      const x = offs[k++ % offs.length];
      const ic = !open ? ICON.lock : done ? ICON.check : nd.kind === 'test' ? ICON.trophy : ICON.spark;
      return `<div class="node-wrap" style="transform:translateX(${x}px)">
        ${isCur ? '<div class="start-bubble">START</div>' : ''}
        <button class="node ${nd.kind} ${open ? '' : 'locked'} ${isCur ? 'current' : ''}" data-node="${nd.id}" aria-label="${nd.kind === 'test' ? 'Unit test' : 'Lesson ' + nd.label}">${ic}</button>
        ${done ? stars(S.done[nd.id]) : `<div class="node-label">${nd.label}</div>`}</div>`;
    }).join('');
    return `<section class="unit ${locked ? 'locked' : ''}" style="${colorVars(un.u)}">
      <div class="unit-banner"><div><small>Unit ${un.u + 1} · ${un.sound}</small><b>Numbers ${pad(un.from)}–${pad(un.to)}</b></div><div class="rng">${pad(un.from)}</div></div>
      <div class="trail">${nodes}</div></section>`;
  }).join('');
  const finish = cur < 0 ? `<div class="welcome"><h1>All levels cleared 🎉</h1><p>Keep your memory sharp in the Practice tab — weak cards come back first.</p></div>` : '';
  const welcome = S.lessons === 0 ? `<div class="welcome"><h1>Numbers become pictures.</h1>
      <p>Each number 00–99 has its own image. Learn them 5 at a time, then lock them in with quizzes.</p><div class="em">🍅 🌱 ☀️ 🥋 🎩</div></div>` : '';
  return `${statusBar('Numpic')}${welcome}${finish}
    <div class="goal"><div class="goal-top"><span>Daily goal</span><span>${Math.min(tx, goal)} / ${goal} XP</span></div>
    <div class="meter"><i style="width:${Math.min(100, tx / goal * 100)}%"></i></div></div>${units}`;
}
function nodeSheet(id) {
  const nd = ALL.find(n => n.id === id), i = ALL.indexOf(nd);
  if (!unlocked(i)) { toast('Finish the previous level to unlock this one'); sfx.tap(); return; }
  const done = S.done[id] || 0, un = UNITS[nd.u];
  const title = nd.kind === 'test' ? `Unit ${nd.u + 1} test` : `Unit ${nd.u + 1} · ${nd.label}`;
  sheet(`<h3>${title}</h3><div class="sub">${nd.kind === 'test' ? 'All ten pictures' + (nd.u ? ' + a few from earlier units' : '') + ' – no more peeking.' : 'Meet 5 new pictures, then practise them.'}</div>
    <div class="emoji-row">${nd.cards.map(n => `<span>${CARDS[n].e}</span>`).join('')}</div>
    ${done ? stars(done).replace('class="stars"', 'class="stars" style="margin-top:10px"') : ''}
    <div class="row" style="${colorVars(un.u)}"><button class="btn" id="go" style="background:linear-gradient(135deg,var(--c1),var(--c2));box-shadow:0 5px 0 var(--cd)">${done ? 'Practise again' : 'Start'}</button></div>`,
    (b, close) => { $('#go', b).onclick = () => { close(); startNode(nd); }; });
}

/* ----- Library ----- */
function viewLibrary() {
  const q = libQuery.trim().toLowerCase();
  let list = CARDS.map((c, n) => n).filter(n => libFilter === 'all' || Math.floor(n / 10) === +libFilter);
  if (q) list = CARDS.map((c, n) => n).filter(n => CARDS[n].n.includes(q) || CARDS[n].w.toLowerCase().includes(q));
  const tiles = list.map(n => {
    const c = CARDS[n], st = cs(n).s;
    return `<button class="tile ${cs(n).seen ? '' : 'unseen'}" data-card="${n}"><div class="tn">${c.n}</div><div class="te">${c.e}</div><div class="tw">${c.w}</div>
      <div class="tm">${range(1, 5).map(i => `<i class="${i <= st ? 'on' : ''}"></i>`).join('')}</div></button>`;
  }).join('');
  const mastered = CARDS.filter((c, n) => cs(n).s >= 4).length;
  return `${statusBar('Library')}
    <div class="muted" style="font-weight:800;margin-bottom:10px">${mastered} / 100 mastered</div>
    <input class="search" id="q" placeholder="Search a number or word…" value="${libQuery.replace(/"/g, '&quot;')}" inputmode="search" autocomplete="off">
    <div class="chips">
      <button class="fchip ${libCover ? 'on' : ''}" data-cover>Cover mode</button>
      <button class="fchip ${libFilter === 'all' ? 'on' : ''}" data-filter="all">All</button>
      ${range(0, 9).map(u => `<button class="fchip ${libFilter == u ? 'on' : ''}" data-filter="${u}">${pad(u * 10)}s</button>`).join('')}
    </div>
    <div class="grid ${libCover ? 'cover' : ''}" id="lib">${tiles || '<p class="muted">No matches.</p>'}</div>`;
}
function cardSheet(n) {
  const c = CARDS[n], s = cs(n).s;
  sheet(`<div class="big-card" style="margin-bottom:14px"><div class="bc-num">${c.n}</div><div class="bc-emoji">${c.e}</div><div class="bc-word">${c.w}</div></div>
    <div class="muted" style="text-align:center;font-weight:800">Strength: ${['new', 'shaky', 'learning', 'getting there', 'solid', 'mastered'][s]}</div>
    <div class="row"><button class="ghost-btn" id="sp" style="justify-content:center;--c2:var(--brand)">${ICON.speaker}Listen</button></div>`,
    b => { $('#sp', b).onclick = () => speak(n); });
}

/* ----- Practice ----- */
function viewPractice() {
  const opt = range(0, 9).map(u => `<option value="${u * 10}">${pad(u * 10)}</option>`).join('');
  const optEnd = range(0, 9).map(u => `<option value="${u * 10 + 9}" ${u === 9 ? 'selected' : ''}>${pad(u * 10 + 9)}</option>`).join('');
  const m = (id, u, ic, t, d) => `<button class="mode" data-mode="${id}" style="${colorVars(u)}"><div class="mi">${ic}</div><div><b>${t}</b><span>${d}</span></div></button>`;
  return `${statusBar('Practice')}
    ${m('smart', 1, ICON.heart, 'Smart review', 'Your 10 weakest cards come first')}
    ${m('blitz', 2, ICON.shuffle, 'Random blitz', '10 random cards from 00–99')}
    ${m('rev', 3, ICON.eye, 'Pictures → numbers', 'Recall the number from the picture')}
    <div class="panel" style="margin-top:8px"><div class="h2" style="margin:0">Pick a range</div>
      <div class="range"><select id="r1" aria-label="From">${opt}</select><b>to</b><select id="r2" aria-label="To">${optEnd}</select></div>
      <button class="btn" id="goRange">Start</button></div>`;
}

/* ----- Profile ----- */
function viewProfile() {
  const mastered = CARDS.filter((c, n) => cs(n).s >= 4).length, seen = CARDS.filter((c, n) => cs(n).seen).length;
  const acc = S.answered ? Math.round(S.correct / S.answered * 100) : 0;
  return `${statusBar('Profile')}
    <div class="stats">
      <div class="stat"><b>${S.xp}</b><span>Total XP</span></div><div class="stat"><b>${Math.max(S.best, liveStreak())}</b><span>Best streak</span></div>
      <div class="stat"><b>${mastered}<small class="muted"> /100</small></b><span>Mastered</span></div><div class="stat"><b>${acc}%</b><span>Accuracy</span></div>
      <div class="stat"><b>${seen}</b><span>Cards seen</span></div><div class="stat"><b>${S.lessons}</b><span>Lessons done</span></div>
    </div>
    <div class="panel">
      <div class="setting"><div><b>Daily goal</b><div class="muted" style="font-size:14px;font-weight:700">XP per day</div></div>
        <div class="seg">${[20, 30, 50, 100].map(g => `<button class="${S.goal === g ? 'on' : ''}" data-goal="${g}">${g}</button>`).join('')}</div></div>
      <div class="setting"><div><b>Sound & haptics</b></div><button class="switch ${S.sound ? 'on' : ''}" data-sound aria-label="Toggle sound"></button></div>
      <div class="setting"><div><b>Reset progress</b><div class="muted" style="font-size:14px;font-weight:700">Start from level one</div></div><button class="btn danger sm" data-reset>Reset</button></div>
    </div>
    <p class="muted" style="text-align:center;margin-top:18px;font-weight:700;font-size:14px">Tip: add Numpic to your home screen to use it like a native app, even offline.</p>`;
}

/* ---------------- app-level events ---------------- */
document.addEventListener('click', e => {
  const t = e.target.closest('[data-tab],[data-node],[data-card],[data-filter],[data-cover],[data-mode],[data-goal],[data-sound],[data-reset],#goRange,.tile');
  if (!t || L) return;
  if (t.dataset.tab) { tab = t.dataset.tab; render(); }
  else if (t.dataset.node) nodeSheet(t.dataset.node);
  else if (t.dataset.card !== undefined) {
    const n = +t.dataset.card;
    if (libCover && !t.classList.contains('show')) t.classList.add('show'); else if (libCover) t.classList.remove('show'); else cardSheet(n);
  }
  else if (t.dataset.filter) { libFilter = t.dataset.filter; libQuery = ''; render(true); }
  else if (t.hasAttribute('data-cover')) { libCover = !libCover; render(true); }
  else if (t.dataset.mode) practice(t.dataset.mode);
  else if (t.id === 'goRange') {
    let a = +$('#r1').value, b = +$('#r2').value; if (b < a) [a, b] = [b, a];
    if (b - a < 3) { toast('Pick a range of at least 4 numbers'); return; }
    startFree(`${pad(a)}–${pad(b)}`, pickFrom(range(a, b), 10), 7);
  }
  else if (t.dataset.goal) { S.goal = +t.dataset.goal; save(); render(true); }
  else if (t.hasAttribute('data-sound')) { S.sound = !S.sound; save(); render(true); if (S.sound) sfx.ok(); }
  else if (t.hasAttribute('data-reset')) {
    sheet(`<h3>Reset all progress?</h3><div class="sub">Levels, XP, streak and card strength will be erased. This can't be undone.</div>
      <div class="row"><button class="btn" id="no">Keep my progress</button><button class="btn danger" id="yes">Reset everything</button></div>`,
      (b, close) => { $('#no', b).onclick = close; $('#yes', b).onclick = () => { S = defaults(); save(); close(); tab = 'path'; render(); toast('Progress reset'); }; });
  }
});
document.addEventListener('input', e => {
  if (e.target.id === 'q') { libQuery = e.target.value; const pos = e.target.selectionStart; render(true); const q = $('#q'); q.focus(); q.setSelectionRange(pos, pos); }
});

/* ---------------- lesson building ---------------- */
const pickFrom = (arr, n) => shuffle(arr).slice(0, n);
function weakest(pool, n) {
  return pool.map(x => [x, cs(x).s + Math.random() * .9]).sort((a, b) => a[1] - b[1]).slice(0, n).map(x => x[0]);
}
function choices(n, pool, wantNumbers) {
  const rev = +String(pad(n)).split('').reverse().join('');
  let c = shuffle(pool.filter(x => x !== n && (wantNumbers || (CARDS[x].e !== CARDS[n].e && CARDS[x].w !== CARDS[n].w))));
  if (wantNumbers && pool.includes(rev) && rev !== n) c = [rev, ...c.filter(x => x !== rev)];   // swapped digits are the classic trap
  if (c.length < 3) c = c.concat(shuffle(range(0, 99).filter(x => x !== n && !c.includes(x) && CARDS[x].e !== CARDS[n].e)));
  return shuffle([n, ...c.slice(0, 3)]);
}
const mkQ = (t, n, pool) => ({ t, n, opts: t === 'type' ? null : choices(n, pool, t === 'p2n') });
function mkMatch(ns) { return { t: 'match', ns: shuffle(ns), right: shuffle(ns) }; }

function buildLearn(cards, pool) {
  const q = cards.map(n => ({ t: 'intro', n }));
  q.push(...shuffle(cards).map(n => mkQ('n2p', n, pool)));
  q.push(mkMatch(cards.slice(0, 5)));
  q.push(...shuffle(cards).map(n => mkQ('p2n', n, pool)));
  q.push(...shuffle(cards).map(n => mkQ('type', n, pool)));
  return q;
}
function buildMixed(cards, pool) {
  const types = ['n2p', 'p2n', 'type'], off = rand(3);
  const q = shuffle(cards).map((n, i) => mkQ(types[(i + off) % 3], n, pool));
  const half = Math.floor(q.length / 2);
  q.splice(half, 0, mkMatch(pickFrom(cards, 4)));
  q.push(mkMatch(pickFrom(cards, 4)));
  return q;
}
function startNode(nd) {
  const first = nd.cards[0], earlier = range(0, Math.max(0, first - 1));
  if (nd.kind === 'learn') {
    const pool = nd.cards.concat(earlier.length >= 3 ? pickFrom(earlier, 6) : []);
    return begin({ title: nd.label, node: nd, u: nd.u, q: buildLearn(nd.cards, pool), xp: 10 });
  }
  const extra = nd.u > 0 ? weakest(range(0, nd.cards[0] - 1), 4) : [];
  const set = nd.cards.concat(extra);
  begin({ title: 'Unit test', node: nd, u: nd.u, q: buildMixed(set, set), xp: 15 });
}
function startFree(title, cards, u, rev) {
  if (cards.length < 4) { toast('Learn a few cards first'); return; }
  const q = rev ? shuffle(cards).map(n => mkQ(rand(2) ? 'p2n' : 'type', n, cards)) : buildMixed(cards, cards);
  begin({ title, u, q, xp: 10 });
}
function practice(mode) {
  if (mode === 'smart') {
    const seen = range(0, 99).filter(n => cs(n).seen);
    if (seen.length < 5) { toast('Finish your first lesson to unlock smart review'); return; }
    return startFree('Smart review', weakest(seen, 10), 1);
  }
  if (mode === 'blitz') return startFree('Random blitz', pickFrom(range(0, 99), 10), 2);
  if (mode === 'rev') return startFree('Pictures → numbers', pickFrom(range(0, 99), 10), 3, true);
}

/* ---------------- lesson runtime ---------------- */
let L = null;
const REQ_TYPES = ['n2p', 'p2n', 'type'];
function begin(cfg) {
  L = { ...cfg, i: 0, total: cfg.q.length, passed: 0, mistakes: 0, sel: null, typed: '', phase: 'ask', t0: Date.now(), mSel: null, mLeft: 0, mMiss: false };
  const el = $('#lesson'); el.hidden = false; document.body.classList.add('in-lesson');
  el.setAttribute('style', colorVars(cfg.u));
  el.innerHTML = `<header class="l-top"><button class="icon-btn" data-l="quit" aria-label="Quit">${ICON.x}</button>
    <div class="bar"><i id="lbar"></i></div><div class="l-mis" id="lmis"></div></header>
    <main class="l-body" id="lbody"></main><footer class="l-foot" id="lfoot"><div class="in" id="lin"></div></footer>`;
  showEx();
}
const ex = () => L.q[L.i];
function setBar() {
  $('#lbar').style.width = Math.min(100, L.passed / L.total * 100) + '%';
  $('#lmis').innerHTML = L.mistakes ? `${ICON.heart.replace('<svg', '<svg')}${L.mistakes}` : '';
}
function foot(mode, html, btn) {   // mode: '', ok, bad
  const f = $('#lfoot'); f.className = 'l-foot ' + mode;
  $('#lin').innerHTML = (html || '') + btn;
}
const btnHtml = (label, act, dis, cls = '') => `<button class="btn ${cls}" data-l="${act}" ${dis ? 'disabled' : ''} style="${cls ? '' : 'background:linear-gradient(135deg,var(--c1),var(--c2));box-shadow:0 5px 0 var(--cd)'}${dis ? ';background:var(--lock);box-shadow:0 5px 0 var(--lock-deep)' : ''}">${label}</button>`;

function showEx() {
  setBar(); const e = ex(); L.sel = null; L.typed = ''; L.phase = 'ask'; L.mSel = null; L.mLeft = e.t === 'match' ? e.ns.length : 0; L.mMiss = false;
  const c = e.n !== undefined ? CARDS[e.n] : null; const body = $('#lbody'); body.scrollTop = 0;
  if (e.t === 'intro') {
    body.innerHTML = `<span class="tag">New picture</span>
      <div class="big-card"><div class="bc-num">${c.n}</div><div class="bc-emoji">${c.e}</div><div class="bc-word">${c.w}</div></div>
      <button class="ghost-btn" data-l="speak">${ICON.speaker}Listen</button>
      <p class="tip">Picture it clearly. Say it out loud: “${c.n} – ${c.w}”.</p>`;
    foot('', '', btnHtml('Continue', 'next'));
  } else if (e.t === 'n2p') {
    body.innerHTML = `<h2 class="q">Which picture is this number?</h2><div class="num-tile">${c.n}</div>
      <div class="opts">${e.opts.map((x, i) => `<button class="opt" data-opt="${i}"><span class="k">${i + 1}</span><span class="oe">${CARDS[x].e}</span><span class="ow">${CARDS[x].w}</span></button>`).join('')}</div>`;
    foot('', '', btnHtml('Check', 'check', true));
  } else if (e.t === 'p2n') {
    body.innerHTML = `<h2 class="q">Which number is this?</h2><div class="pic-tile"><span>${c.e}</span><b>${c.w}</b></div>
      <div class="opts">${e.opts.map((x, i) => `<button class="opt" data-opt="${i}"><span class="k">${i + 1}</span><span class="on">${CARDS[x].n}</span></button>`).join('')}</div>`;
    foot('', '', btnHtml('Check', 'check', true));
  } else if (e.t === 'type') {
    body.innerHTML = `<h2 class="q">Type the number</h2><div class="pic-tile"><span>${c.e}</span><b>${c.w}</b></div>
      <div class="slots" id="slots"><div class="slot cur"></div><div class="slot"></div></div>
      <div class="pad">${[1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => `<button data-d="${d}">${d}</button>`).join('')}<span></span><button data-d="0">0</button><button data-d="b" aria-label="Delete">${ICON.back}</button></div>`;
    foot('', '', btnHtml('Check', 'check', true));
  } else if (e.t === 'match') {
    body.innerHTML = `<h2 class="q">Match the pairs</h2><div class="match">
      <div class="col">${e.ns.map(n => `<button class="mbtn num" data-m="l" data-n="${n}">${CARDS[n].n}</button>`).join('')}</div>
      <div class="col">${e.right.map(n => `<button class="mbtn pic" data-m="r" data-n="${n}"><span>${CARDS[n].e}</span>${CARDS[n].w}</button>`).join('')}</div></div>`;
    foot('', '', btnHtml('Match all pairs', 'x', true));
  }
}
function drawSlots() {
  const s = $('#slots'); if (!s) return;
  s.innerHTML = [0, 1].map(i => `<div class="slot ${L.typed.length === i && L.phase === 'ask' ? 'cur' : ''}">${L.typed[i] || ''}</div>`).join('');
  const b = $('[data-l="check"]'); if (b) { const on = L.typed.length === 2; b.disabled = !on; b.style.cssText = on ? 'background:linear-gradient(135deg,var(--c1),var(--c2));box-shadow:0 5px 0 var(--cd)' : 'background:var(--lock);box-shadow:0 5px 0 var(--lock-deep)'; }
}
function select(i) {
  if (L.phase !== 'ask') return; const o = document.querySelectorAll('.opt'); if (!o[i]) return;
  o.forEach(x => x.classList.remove('sel')); o[i].classList.add('sel'); L.sel = i; sfx.tap();
  const b = $('[data-l="check"]'); b.disabled = false; b.style.cssText = 'background:linear-gradient(135deg,var(--c1),var(--c2));box-shadow:0 5px 0 var(--cd)';
}
const PRAISE = ['Nice!', 'Spot on!', 'Brilliant!', 'You got it!', 'Sharp memory!', 'Perfect!'];
function record(n, ok, retry) {
  S.answered++; if (ok) S.correct++;
  if (!ok) bump(n, -1); else if (!retry) bump(n, 1);
}
function requeue(e) {
  const others = REQ_TYPES.filter(t => t !== e.t); const t = others[rand(others.length)];
  const pool = L.node ? L.node.cards.concat(range(0, Math.max(0, L.node.cards[0] - 1))) : range(0, 99);
  L.q.push({ ...mkQ(t, e.n, pool.length >= 4 ? pool : range(0, 99)), retry: true }); L.total++;
}
function check() {
  if (L.phase !== 'ask') return; const e = ex(); let ok;
  if (e.t === 'type') ok = L.typed === CARDS[e.n].n;
  else { if (L.sel === null) return; ok = e.opts[L.sel] === e.n; }
  L.phase = 'done';
  if (e.t === 'type') { document.querySelectorAll('.slot').forEach(s => s.classList.remove('cur')); document.querySelectorAll('.slot').forEach(s => s.classList.add(ok ? 'right' : 'wrong')); document.querySelectorAll('.pad button').forEach(b => b.disabled = true); }
  else {
    document.querySelectorAll('.opt').forEach((o, i) => { o.disabled = true; o.classList.remove('sel'); if (e.opts[i] === e.n) o.classList.add('right'); else if (i === L.sel) o.classList.add('wrong'); });
  }
  record(e.n, ok, e.retry);
  const c = CARDS[e.n];
  if (ok) { L.passed++; sfx.ok(); }
  else { L.mistakes++; sfx.bad(); requeue(e); }
  setBar();
  foot(ok ? 'ok' : 'bad', `<div class="fb"><div class="ic">${ok ? ICON.check : ICON.x}</div><div><b>${ok ? PRAISE[rand(PRAISE.length)] : 'Not quite'}</b>${ok ? '' : `<span>${c.n} = ${c.e} ${c.w}</span>`}</div></div>`,
    btnHtml('Continue', 'next', false, ok ? 'good' : 'bad'));
}
function typeDigit(d) {
  if (L.phase !== 'ask' || ex().t !== 'type') return;
  if (d === 'b') L.typed = L.typed.slice(0, -1); else if (L.typed.length < 2) L.typed += d;
  sfx.tap(); drawSlots();
}
function matchTap(btn) {
  if (L.phase !== 'ask') return; const side = btn.dataset.m, n = +btn.dataset.n;
  if (!L.mSel || L.mSel.side === side) {
    document.querySelectorAll(`.mbtn[data-m="${side}"]`).forEach(b => b.classList.remove('sel')); btn.classList.add('sel'); L.mSel = { side, n, btn }; sfx.tap(); return;
  }
  const a = L.mSel; L.mSel = null; document.querySelectorAll('.mbtn.sel').forEach(b => b.classList.remove('sel'));
  const numN = side === 'l' ? n : a.n, picN = side === 'r' ? n : a.n;
  if (numN === picN) {
    btn.classList.add('ok'); a.btn.classList.add('ok'); sfx.ok(); bump(numN, L.mMiss ? 0 : 0); L.mLeft--;
    if (L.mLeft === 0) {
      L.phase = 'done'; L.passed++; setBar();
      foot('ok', `<div class="fb"><div class="ic">${ICON.check}</div><div><b>${L.mMiss ? 'All matched' : 'Flawless!'}</b></div></div>`, btnHtml('Continue', 'next', false, 'good'));
    }
  } else {
    [btn, a.btn].forEach(b => { b.classList.add('no'); setTimeout(() => b.classList.remove('no'), 400); });
    L.mistakes++; L.mMiss = true; bump(numN, -1); S.answered++; sfx.bad(); setBar();
  }
}
function next() {
  const e = ex();
  if (e.t === 'intro') { const c = S.cards[e.n] || (S.cards[e.n] = { s: 0, seen: 1 }); c.seen = 1; c.s = Math.max(c.s, 1); L.passed++; sfx.tap(); }
  L.i++;
  if (L.i >= L.q.length) return finish();
  showEx();
}
function quit() {
  sheet(`<h3>Quit this lesson?</h3><div class="sub">You'll lose the progress you made in it.</div>
    <div class="row"><button class="btn" id="stay">Keep going</button><button class="btn danger" id="leave">Quit</button></div>`,
    (b, close) => { $('#stay', b).onclick = close; $('#leave', b).onclick = () => { close(); closeLesson(); }; });
}
function closeLesson() { L = null; const el = $('#lesson'); el.hidden = true; el.innerHTML = ''; document.body.classList.remove('in-lesson'); render(true); }

function finish() {
  const nQ = L.q.filter(x => x.t !== 'intro').length;
  const stars = L.mistakes === 0 ? 3 : L.mistakes <= 3 ? 2 : 1;
  const total = nQ || 1; const acc = clamp(Math.round((1 - L.mistakes / (total + L.mistakes)) * 100), 0, 100);
  const xp = L.xp + (L.mistakes === 0 ? 5 : 0) + stars * 2;
  const secs = Math.round((Date.now() - L.t0) / 1000);
  const t = dayStr(); const wasToday = S.last === t;
  S.xp += xp; S.lessons++;
  if (S.today.d !== t) S.today = { d: t, xp: 0 }; S.today.xp += xp;
  if (!wasToday) { S.streak = (S.last === dayStr(new Date(Date.now() - 864e5))) ? S.streak + 1 : 1; S.last = t; S.best = Math.max(S.best, S.streak); }
  if (L.node) S.done[L.node.id] = Math.max(S.done[L.node.id] || 0, stars);
  save();
  const un = L.node && L.node.kind === 'test' ? `Unit ${L.node.u + 1} complete!` : 'Lesson complete!';
  const m = Math.floor(secs / 60), s = secs % 60;
  $('#lbody').className = 'l-body done';
  $('#lbody').innerHTML = `<div class="trophy">${ICON.trophy}</div><h1>${un}</h1>
    <div class="big-stars">${[1, 2, 3].map(i => ICON.star.replace('<svg', `<svg class="${i <= stars ? 'on' : ''}"`)).join('')}</div>
    <div class="res"><div><small>XP</small><b>+${xp}</b></div><div><small>Accuracy</small><b>${acc}%</b></div><div><small>Time</small><b>${m}:${pad(s)}</b></div></div>
    <p class="tip">${stars === 3 ? 'Flawless – those pictures are sticking.' : 'Missed cards will come back in Smart review.'}</p>`;
  $('.l-top').style.visibility = 'hidden';
  foot('', '', btnHtml('Continue', 'close'));
  sfx.win(); confetti();
}

/* lesson events */
document.addEventListener('click', e => {
  if (!L) return;
  const t = e.target.closest('[data-l],[data-opt],[data-d],[data-m]'); if (!t) return;
  if (t.dataset.opt !== undefined) select(+t.dataset.opt);
  else if (t.dataset.d !== undefined) typeDigit(t.dataset.d);
  else if (t.dataset.m) matchTap(t);
  else switch (t.dataset.l) {
    case 'check': check(); break;
    case 'next': next(); break;
    case 'speak': speak(ex().n); break;
    case 'quit': quit(); break;
    case 'close': save(); closeLesson(); tab = 'path'; render(); break;
  }
});
document.addEventListener('keydown', e => {
  if (!L || e.metaKey || e.ctrlKey || e.altKey) return;
  if (document.querySelector('.backdrop')) return;
  const x = ex(); if (!x) return;
  if (e.key === 'Enter') {
    const b = $('#lin .btn'); if (b && !b.disabled) { e.preventDefault(); b.click(); }
  } else if (x.t === 'type' && L.phase === 'ask') {
    if (/^\d$/.test(e.key)) typeDigit(e.key); else if (e.key === 'Backspace') typeDigit('b');
  } else if ((x.t === 'n2p' || x.t === 'p2n') && /^[1-4]$/.test(e.key)) select(+e.key - 1);
  else if (e.key === 'Escape') quit();
});

/* ---------------- boot ---------------- */
render();
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
