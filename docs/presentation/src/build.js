// Builds the HIDE & SEEK presentation PDFs (FR + HE) and the standalone visuals (PNG).
// Usage: node src/build.js
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { screens, css: mockCss } = require('./mockups');
const content = require('./content');

const OUT = path.resolve(__dirname, '..');
const BUILD = path.join(OUT, 'build');
fs.mkdirSync(BUILD, { recursive: true });

// Rubik (Latin + Hebrew) is bundled locally so the PDFs never depend on the network.
const FONTS = `<style>${fs.readFileSync(path.join(OUT, 'fonts', 'rubik.css'), 'utf8')}</style>`;

const docCss = `
@page{size:A4;margin:0}
*{box-sizing:border-box;margin:0;padding:0}
html,body{background:#0a0e14}
body{font-family:Rubik,'Noto Color Emoji',sans-serif;color:#e6edf3;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.page{width:210mm;height:297mm;padding:15mm 15mm 14mm;position:relative;overflow:hidden;page-break-after:always;background:
  radial-gradient(900px 500px at 100% 0%,rgba(34,211,238,.07),transparent 60%),
  radial-gradient(700px 500px at 0% 100%,rgba(59,130,246,.07),transparent 60%),#0a0e14}
.page:last-child{page-break-after:auto}
.grid-bg{position:absolute;inset:0;background-image:linear-gradient(rgba(148,163,184,.045) 1px,transparent 1px),linear-gradient(90deg,rgba(148,163,184,.045) 1px,transparent 1px);background-size:28px 28px;pointer-events:none}
.content{position:relative;height:100%;display:flex;flex-direction:column;gap:17px}
.foot{position:absolute;bottom:7mm;left:15mm;right:15mm;display:flex;justify-content:space-between;font-size:8.5px;color:#5b6878;letter-spacing:.12em}
h1{font-size:30px;font-weight:900;letter-spacing:-.01em;line-height:1.1}
h1 .ix{color:#22d3ee;font-size:14px;font-weight:800;letter-spacing:.2em;display:block;margin-bottom:4px}
h2{font-size:15px;font-weight:800;color:#67e8f9;letter-spacing:.04em;margin-top:4px}
p,li{font-size:13.5px;line-height:1.6;color:#cbd5e1}
b{color:#fff;font-weight:700}
b.b,.b{color:#60a5fa}b.r,.r{color:#f87171}.y{color:#facc15}
.lead{font-size:15.5px;line-height:1.6;color:#d6dee8}
.mono{font-family:ui-monospace,monospace;background:#121822;border:1px solid #22d3ee55;color:#67e8f9;padding:1px 5px;border-radius:5px;letter-spacing:.08em}
.card{background:rgba(18,24,34,.85);border:1px solid #1f2a38;border-radius:14px;padding:12px 14px}
.cards{display:grid;gap:10px}
.c3{grid-template-columns:repeat(3,1fr)}.c2{grid-template-columns:repeat(2,1fr)}.c4{grid-template-columns:repeat(4,1fr)}
.team{border-top:3px solid}.team.b{border-top-color:#3b82f6}.team.r{border-top-color:#ef4444}.team.y{border-top-color:#facc15}
.team .ic{font-size:22px}.team .tn{font-weight:900;font-size:13px;letter-spacing:.08em;margin:4px 0}
.team p{font-size:12.5px}
.goal{display:flex;gap:10px;align-items:flex-start}.goal .ic{font-size:18px;line-height:1.3}
.key{text-align:center;padding:14px 8px}.key b{display:block;font-size:24px;font-weight:900;color:#22d3ee;text-shadow:0 0 14px rgba(34,211,238,.35)}
.key span{font-size:10.5px;color:#8b98a9;text-transform:uppercase;letter-spacing:.1em}
table{width:100%;border-collapse:separate;border-spacing:0 5px;font-size:12.5px}
th{font-size:9.5px;color:#8b98a9;text-transform:uppercase;letter-spacing:.1em;text-align:start;padding:0 12px;font-weight:600}
td{background:rgba(18,24,34,.9);padding:11px 12px;border-top:1px solid #1f2a38;border-bottom:1px solid #1f2a38}
td:first-child{border-inline-start:1px solid #1f2a38;border-start-start-radius:10px;border-end-start-radius:10px;font-weight:800;color:#fff}
td:last-child{border-inline-end:1px solid #1f2a38;border-start-end-radius:10px;border-end-end-radius:10px;color:#a6b3c3}
td.r{color:#f87171;font-weight:700}td.b{color:#60a5fa;font-weight:700}
tr.hl td{background:rgba(34,211,238,.09);border-color:#22d3ee55}
.dur{display:flex;flex-direction:column;gap:4px}.dur .ic{font-size:20px}.dur .dn{font-weight:900;letter-spacing:.1em;font-size:11px;color:#8b98a9}
.dur .dt{font-size:22px;font-weight:900}.dur p{font-size:10.5px;line-height:1.45}
.dur.hl{border-color:#22d3ee88;box-shadow:0 0 20px rgba(34,211,238,.12)}
.list{display:flex;flex-direction:column;gap:7px}
.li{display:flex;gap:10px;align-items:flex-start;font-size:13.5px;line-height:1.5;color:#cbd5e1}.li .ic{font-size:16px;width:22px;flex:none;text-align:center}
.timeline{display:flex;flex-direction:column;gap:0;position:relative}
.ph{display:grid;grid-template-columns:40px 92px 62px 1fr;align-items:center;gap:10px;padding:13px 0;border-bottom:1px dashed #1f2a38}
.ph .n{width:30px;height:30px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-weight:900;background:#121822;border:1.5px solid #22d3ee;color:#22d3ee;box-shadow:0 0 12px rgba(34,211,238,.3)}
.ph .pn{font-weight:900;letter-spacing:.08em;font-size:13px}.ph .pt{font-weight:800;color:#22c55e;font-size:12px}
.ph p{font-size:13px}
.ph.hot .n{border-color:#ef4444;color:#fca5a5;box-shadow:0 0 12px rgba(239,68,68,.4)}.ph.hot .pt{color:#fca5a5}
.rule{display:flex;gap:12px}.rule .ic{font-size:22px;flex:none;width:28px;text-align:center}
.rule .rt{font-weight:900;font-size:15px;margin-bottom:3px}.rule p{font-size:13px;line-height:1.55}
.note{font-size:12.5px;color:#a6b3c3;border-inline-start:3px solid #22d3ee;padding:6px 12px;background:rgba(34,211,238,.06);border-radius:6px}
.mini{display:flex;gap:9px;align-items:flex-start;padding:12px 12px}.mini .ic{font-size:18px}
.mini .mn{font-weight:900;font-size:11.5px;letter-spacing:.1em;margin-bottom:2px}.mini p{font-size:11.8px;line-height:1.45}
.mini.b{border-inline-start:3px solid #3b82f6}.mini.r{border-inline-start:3px solid #ef4444}
.tag{display:inline-block;font-size:8.5px;font-weight:800;letter-spacing:.1em;padding:2px 6px;border-radius:5px;margin-inline-start:6px}
.tag.b{background:#3b82f622;color:#93c5fd}.tag.r{background:#ef444422;color:#fca5a5}
.pts{display:flex;flex-direction:column;gap:4px}.pts .pr{display:flex;justify-content:space-between;font-size:12.5px;color:#cbd5e1;padding:3px 0;border-bottom:1px dashed #1f2a38}
.pts .pr b{color:#22c55e}.pts h3{font-size:12px;margin-bottom:4px}
.mode{display:flex;gap:10px;align-items:baseline;padding:6px 0;border-bottom:1px dashed #1f2a38}
.mode .mn{font-weight:900;letter-spacing:.08em;font-size:12px;color:#facc15;width:120px;flex:none}.mode p{font-size:12.5px}
.sos{border:1px solid #ef4444;background:rgba(127,29,29,.25);box-shadow:0 0 20px rgba(239,68,68,.15)}
.sos h3,.priv h3{font-size:14px;margin-bottom:4px}
.big-rule{display:flex;gap:14px;align-items:center;padding:14px 16px}.big-rule .ic{font-size:24px;width:30px;text-align:center}
.big-rule p{font-size:14px}
.phones{display:flex;justify-content:space-between;align-items:flex-start;gap:8px}
.ph-item{display:flex;flex-direction:column;align-items:center;gap:10px;width:220px}
.ph-item .zoom{zoom:.82}
.cap{text-align:center}.cap b{display:block;font-size:13px;color:#fff;margin-bottom:2px}.cap span{font-size:10.5px;color:#a6b3c3;line-height:1.4;display:block}
.step{display:flex;gap:12px;align-items:flex-start}.step .sv{font-weight:900;font-size:13px;color:#8b98a9;border:1.5px solid #2a3442;border-radius:8px;padding:3px 8px;flex:none}
.step.now .sv{color:#04121a;background:#22d3ee;border-color:#22d3ee;box-shadow:0 0 14px rgba(34,211,238,.5)}
.step p{font-size:13.5px}
.ask{counter-increment:a;display:flex;gap:10px;align-items:center;font-size:14px;color:#e6edf3;padding:9px 12px}
.ask::before{content:counter(a);width:22px;height:22px;border-radius:50%;background:#22d3ee22;color:#22d3ee;font-weight:900;font-size:11px;display:flex;align-items:center;justify-content:center;flex:none}
.asks{counter-reset:a;display:flex;flex-direction:column;gap:6px}
/* cover */
.cover .content{justify-content:space-between}
.logo{font-size:76px;font-weight:900;line-height:.92;letter-spacing:-.02em;text-shadow:0 0 30px rgba(34,211,238,.45)}
.logo span{color:#22d3ee}
.kicker{font-size:11px;letter-spacing:.3em;color:#22d3ee;font-weight:700}
.tagline{font-size:22px;font-weight:700;line-height:1.3;margin-top:14px}
.cover-row{display:flex;gap:26px;align-items:center}
.cover-txt{flex:1;display:flex;flex-direction:column;gap:14px}
.cover-ph{zoom:.95;transform:rotate(${'4deg'});}
.pills{display:flex;flex-wrap:wrap;gap:6px}.pills span{font-size:10.5px;background:#121822;border:1px solid #2a3442;border-radius:999px;padding:4px 10px;color:#cbd5e1}
.vs{display:flex;gap:10px}.vs div{flex:1;border-radius:12px;padding:10px 12px;font-weight:900;letter-spacing:.1em;font-size:13px}
.vs .h{background:#3b82f61f;border:1px solid #3b82f6;color:#93c5fd}.vs .x{background:#ef44441f;border:1px solid #ef4444;color:#fca5a5}
[dir=rtl] .cover-ph{transform:rotate(-4deg)}
`;

const page = (inner, t, n, cls = '') =>
  `<section class="page ${cls}"><div class="grid-bg"></div><div class="content">${inner}</div>
   <div class="foot"><span>${t.footer}</span><span>${String(n).padStart(2, '0')}</span></div></section>`;

const title = (ix, txt) => `<h1><span class="ix">${ix}</span>${txt}</h1>`;

function render(t) {
  const pages = [];
  let n = 1;
  const add = (html, cls) => pages.push(page(html, t, n++, cls));
  const he = t.lang === 'he';

  // 1 · Cover
  add(`
    <div class="kicker">${t.cover.kicker}</div>
    <div class="cover-row">
      <div class="cover-txt">
        <div class="logo" dir="ltr">HIDE<br><span>&amp;</span>SEEK</div>
        <div class="tagline">${t.cover.tagline}</div>
        <p class="lead">${t.cover.sub}</p>
        <div class="vs" dir="${t.dir}"><div class="h">🟦 ${t.concept.teams[0][1]}</div><div class="x">🟥 ${t.concept.teams[1][1]}</div></div>
        <div class="pills" dir="ltr"><span>🗺️ GPS</span><span>⏱️ Timer</span><span>🎯 Capture</span><span>🔒 Prison</span><span>⚡ Powers</span><span>📡 Radar</span><span>🎙️ Radio</span><span>🎲 Events</span><span>🏆 Scores</span><span>🚨 SOS</span></div>
      </div>
      <div class="cover-ph">${screens.hider()}</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:flex-end">
      <p class="lead" style="font-weight:700;color:#fff">${t.cover.where}</p>
      <p style="font-size:11px;color:#8b98a9">${t.cover.readTime}</p>
    </div>`, 'cover');

  // 2 · Concept + goal
  const c = t.concept;
  add(`
    ${title('01', c.title)}
    <p class="lead">${c.lead}</p>
    <div class="cards c3">${c.teams.map(([ic, tn, k, d]) => `<div class="card team ${k}"><div class="ic">${ic}</div><div class="tn ${k}">${tn}</div><p>${d}</p></div>`).join('')}</div>
    <h2>${c.goalTitle}</h2>
    <div class="card list">${c.goals.map(([ic, d]) => `<div class="goal"><span class="ic">${ic}</span><p>${d}</p></div>`).join('')}</div>
    <h2>${c.keyTitle}</h2>
    <div class="cards c4">${c.keys.map(([v, l]) => `<div class="card key"><b dir="ltr">${v}</b><span>${l}</span></div>`).join('')}</div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:24px;opacity:.95">
      <div style="zoom:.62">${screens.lobby()}</div><div style="zoom:.62">${screens.hunter()}</div><div style="zoom:.62">${screens.results()}</div>
    </div>`);

  // 3 · Numbers
  const nb = t.numbers;
  add(`
    ${title('02', nb.title)}
    <p class="lead">${nb.lead}</p>
    <table><thead><tr>${nb.tableHead.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${nb.table.map((r, i) => `<tr class="${i === 2 ? 'hl' : ''}"><td dir="ltr" style="text-align:${he ? 'right' : 'left'}">${r[0]}</td><td class="r">${r[1]}</td><td class="b">${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table>
    <h2>${nb.durTitle}</h2>
    <div class="cards c3">${nb.durations.map(([ic, dn, dt, d], i) => `<div class="card dur ${i === 1 ? 'hl' : ''}"><span class="ic">${ic}</span><span class="dn">${dn}</span><span class="dt">${dt}</span><p>${d}</p></div>`).join('')}</div>
    <p class="note">${nb.durNote}</p>
    <h2>${nb.needTitle}</h2>
    <div class="card list">${nb.needs.map(([ic, d]) => `<div class="li"><span class="ic">${ic}</span><span>${d}</span></div>`).join('')}</div>`);

  // 4 · Flow
  const f = t.flow;
  add(`
    ${title('03', f.title)}
    <h2>${f.joinTitle}</h2>
    <p class="lead" style="font-size:13px">${f.join}</p>
    <div class="card timeline">${f.phases.map(([num, pn, pt, d]) => `<div class="ph ${num === '5' ? 'hot' : ''}"><span class="n">${num}</span><span class="pn">${pn}</span><span class="pt" dir="ltr">${pt}</span><p>${d}</p></div>`).join('')}</div>
    <h2>${f.visTitle}</h2>
    <div class="card"><p>${f.vis}</p></div>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:24px;padding-bottom:22px"><div style="zoom:.52">${screens.lobby()}</div><div style="zoom:.52">${screens.hider()}</div></div>`);

  // 5 · Rules
  const r = t.rules;
  add(`
    ${title('04', r.title)}
    <div class="cards" style="gap:9px">${r.items.map(([ic, rt, d]) => `<div class="card rule"><span class="ic">${ic}</span><div><div class="rt">${rt}</div><p>${d}</p></div></div>`).join('')}</div>
    <p class="note">${r.note}</p>
    <div style="flex:1;display:flex;align-items:center;justify-content:center;gap:24px;padding-bottom:22px"><div style="zoom:.52">${screens.hunter()}</div><div style="zoom:.52">${screens.outzone()}</div><div style="zoom:.52">${screens.captured()}</div></div>`);

  // 6 · Zones, powers, malus
  const e = t.extras;
  add(`
    ${title('05', e.title)}
    <h2>${e.zonesTitle}</h2>
    <div class="cards c3">${e.zones.map(([ic, zn, d]) => `<div class="card mini"><span class="ic">${ic}</span><div><div class="mn" dir="ltr">${zn}</div><p>${d}</p></div></div>`).join('')}</div>
    <h2>${e.powersTitle}</h2>
    <div class="cards c3">${e.powers.map(([ic, pn, d, k]) => `<div class="card mini ${k}"><span class="ic">${ic}</span><div><div class="mn">${pn}<span class="tag ${k}">${k === 'b' ? '🟦' : '🟥'}</span></div><p>${d}</p></div></div>`).join('')}</div>
    <p class="note">${e.powersNote}</p>
    <h2>${e.malusTitle}</h2>
    <div class="cards c3">${e.malus.map(([ic, mn, d]) => `<div class="card mini"><span class="ic">${ic}</span><div><div class="mn">${mn}</div><p>${d}</p></div></div>`).join('')}</div>`);

  // 7 · Events, points, modes
  const ev = t.events;
  add(`
    ${title('06', ev.title)}
    <h2>${ev.evTitle}</h2>
    <p>${ev.evLead}</p>
    <div class="cards c3">${ev.events.map(([ic, en, d]) => `<div class="card mini"><span class="ic">${ic}</span><div><div class="mn">${en}</div><p>${d}</p></div></div>`).join('')}</div>
    <h2>${ev.ptsTitle}</h2>
    <div class="cards c2">
      <div class="card pts"><h3 class="b">${ev.hiderLbl}</h3>${ev.ptsHider.map(([l, v]) => `<div class="pr"><span>${l}</span><b dir="ltr">${v}</b></div>`).join('')}</div>
      <div class="card pts"><h3 class="r">${ev.hunterLbl}</h3>${ev.ptsHunter.map(([l, v]) => `<div class="pr"><span>${l}</span><b dir="ltr">${v}</b></div>`).join('')}</div>
    </div>
    <p class="note">${ev.xp}</p>
    <h2>${ev.modesTitle}</h2>
    <div class="card" style="padding:6px 14px">${ev.modes.map(([mn, d]) => `<div class="mode"><span class="mn" dir="ltr">${mn}</span><p>${d}</p></div>`).join('')}</div>`);

  // 8 · Safety
  const s = t.safety;
  add(`
    ${title('07', s.title)}
    <p class="lead">${s.lead}</p>
    <div class="cards" style="gap:8px">${s.rules.map(([ic, d]) => `<div class="card big-rule"><span class="ic">${ic}</span><p>${d}</p></div>`).join('')}</div>
    <div class="cards c2">
      <div class="card sos"><h3>${s.sosTitle}</h3><p>${s.sos}</p></div>
      <div class="card priv"><h3>${s.privacyTitle}</h3><p>${s.privacy}</p></div>
    </div>`);

  // 9-11 · Visuals
  const v = t.visuals;
  const item = (k) => `<div class="ph-item"><div class="zoom">${screens[k]()}</div><div class="cap"><b>${v.caps[k][0]}</b><span>${v.caps[k][1]}</span></div></div>`;
  add(`
    ${title('08', v.title)}
    <p class="lead">${v.lead}</p>
    <div class="phones">${item('home')}${item('lobby')}${item('hider')}</div>`);
  add(`
    ${title('08', v.title)}
    <div class="phones" style="margin-top:20px">${item('hunter')}${item('outzone')}${item('captured')}</div>`);
  add(`
    ${title('08', v.title)}
    <div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-top:6px">
      <div style="zoom:.93">${screens.admin()}</div>
      <div class="cap" style="max-width:560px"><b>${v.caps.admin[0]}</b><span>${v.caps.admin[1]}</span></div>
    </div>
    <div style="display:flex;justify-content:center;margin-top:6px">${item('results')}</div>`);

  // 12 · Next
  const nx = t.next;
  add(`
    ${title('09', nx.title)}
    <p class="lead">${nx.lead}</p>
    <div class="card list" style="gap:12px">${nx.steps.map(([sv, d, now]) => `<div class="step ${now}"><span class="sv">${sv}</span><p>${d}</p></div>`).join('')}</div>
    <h2>${nx.askTitle}</h2>
    <div class="asks">${nx.asks.map((a) => `<div class="card ask">${a}</div>`).join('')}</div>
    <div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px">
      <div class="logo" dir="ltr" style="font-size:48px;text-align:center">HIDE <span>&amp;</span> SEEK</div>
      <p class="lead" style="text-align:center;color:#fff;font-weight:700">${nx.outro}</p>
    </div>`);

  return `<!doctype html><html lang="${t.lang}" dir="${t.dir}"><head><meta charset="utf-8"><title>HIDE &amp; SEEK</title>${FONTS}
  <style>${docCss}${mockCss}</style></head><body>${pages.join('\n')}</body></html>`;
}

function gallery() {
  const ph = (k, label) => `<div style="display:flex;flex-direction:column;align-items:center;gap:14px">${screens[k]()}<div style="font:700 15px Rubik;color:#e6edf3;letter-spacing:.08em">${label}</div></div>`;
  return `<!doctype html><html><head><meta charset="utf-8">${FONTS}<style>
  *{box-sizing:border-box;margin:0;padding:0}body{background:#0a0e14;font-family:Rubik,'Noto Color Emoji',sans-serif;color:#e6edf3}
  ${mockCss}
  .single{padding:30px;display:inline-block;background:radial-gradient(400px 400px at 50% 30%,rgba(34,211,238,.12),transparent),#0a0e14}
  .wall{width:1600px;padding:50px 50px 60px;background:radial-gradient(900px 500px at 80% 0%,rgba(34,211,238,.1),transparent 60%),radial-gradient(700px 500px at 0% 100%,rgba(59,130,246,.1),transparent 60%),#0a0e14}
  .wall h1{font-size:64px;font-weight:900;text-align:center;text-shadow:0 0 30px rgba(34,211,238,.5)}.wall h1 span{color:#22d3ee}
  .wall .sub{text-align:center;color:#22d3ee;letter-spacing:.4em;font-size:15px;margin:6px 0 40px}
  .row{display:flex;justify-content:center;gap:34px;margin-bottom:46px}
  </style></head><body>
  <div class="wall" id="wall"><h1>HIDE <span>&amp;</span> SEEK</h1><div class="sub">MULTIPLAYER · GPS · IRL</div>
    <div class="row">${ph('home', 'HOME')}${ph('lobby', 'LOBBY')}${ph('hider', 'HIDER')}${ph('hunter', 'HUNTER')}</div>
    <div class="row">${ph('outzone', 'OUT OF ZONE')}${ph('captured', 'CAPTURED')}${ph('results', 'GAME OVER')}</div>
    <div class="row">${screens.admin()}</div>
  </div>
  ${['home', 'lobby', 'hider', 'hunter', 'outzone', 'captured', 'results'].map((k) => `<div class="single" id="s-${k}">${screens[k]()}</div>`).join('')}
  <div class="single" id="s-admin">${screens.admin()}</div>
  </body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ deviceScaleFactor: 2 });
  const pg = await ctx.newPage();

  for (const t of [content.fr, content.he]) {
    const htmlPath = path.join(BUILD, `${t.file}.html`);
    fs.writeFileSync(htmlPath, render(t));
    await pg.goto('file://' + htmlPath, { waitUntil: 'networkidle' });
    await pg.evaluate(() => document.fonts.ready);
    await pg.pdf({ path: path.join(OUT, `${t.file}.pdf`), format: 'A4', printBackground: true, preferCSSPageSize: true });
    // Preview of every page, for checking layout.
    await pg.setViewportSize({ width: 794, height: 1123 });
    const sections = await pg.$$('section.page');
    for (let i = 0; i < sections.length; i++) await sections[i].screenshot({ path: path.join(BUILD, `${t.lang}-p${i + 1}.png`) });
    console.log('✓', t.file, sections.length, 'pages');
  }

  const visDir = path.join(OUT, 'visuels');
  fs.mkdirSync(visDir, { recursive: true });
  const gPath = path.join(BUILD, 'gallery.html');
  fs.writeFileSync(gPath, gallery());
  await pg.setViewportSize({ width: 1700, height: 1200 });
  await pg.goto('file://' + gPath, { waitUntil: 'networkidle' });
  await pg.evaluate(() => document.fonts.ready);
  await (await pg.$('#wall')).screenshot({ path: path.join(visDir, '00_toutes-les-maquettes.png') });
  const names = ['home', 'lobby', 'hider', 'hunter', 'outzone', 'captured', 'results', 'admin'];
  for (let i = 0; i < names.length; i++)
    await (await pg.$('#s-' + names[i])).screenshot({ path: path.join(visDir, `${String(i + 1).padStart(2, '0')}_${names[i]}.png`) });
  console.log('✓ visuels');
  await browser.close();
})();
