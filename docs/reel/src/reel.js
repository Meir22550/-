// Builds the HIDE & SEEK Instagram Reel (1080x1920, 30 fps) as an HTML page driven by render(t).
const fs = require('fs');
const path = require('path');
const { screens, css: mockCss } = require('../../presentation/src/mockups');

const FONT_CSS = fs.readFileSync(path.resolve(__dirname, '../../presentation/fonts/rubik.css'), 'utf8')
  .replace(/\.\.\/fonts\//g, 'file://' + path.resolve(__dirname, '../../presentation/fonts') + '/');

// Each element: data-in (s after scene start), data-a (animation type).
const el = (html, a = 'up', at = 0, extra = '') => `<div class="an" data-a="${a}" data-in="${at}" ${extra}>${html}</div>`;
const phone = (k, zoom = 1.75) => `<div style="zoom:${zoom}">${screens[k]()}</div>`;

function scenesHtml() {
  return {
    hook: `
      <div class="center col">
        ${el('<div class="kick">LE</div>', 'pop', 0.05)}
        ${el('<div class="mega">CACHE<br>CACHE</div>', 'glitch', 0.2)}
        ${el('<div class="stamp">EN VRAI 📍</div>', 'stamp', 1.2)}
        ${el('<div class="pill cyan">🎮 VERSION JEU VIDÉO</div>', 'up', 2.0)}
      </div>`,
    intro: `
      <div class="center col" style="justify-content:flex-start;padding-top:250px">
        ${el('<div class="logo" style="font-size:140px">HIDE<span>&amp;</span>SEEK</div>', 'zoom', 0)}
        ${el('<div class="sub">MULTIPLAYER · GPS · IRL</div>', 'fade', 0.4)}
        ${el(`<div class="tilt">${phone('hider', 1.55)}</div>`, 'rise', 0.7)}
      </div>`,
    teams: `
      <div class="split">
        ${el('<div class="team blue"><div class="tic">🟦</div><div class="tname">CACHEURS</div><div class="tdesc">se planquent 🤫</div></div>', 'left', 0.05)}
        ${el('<div class="vs">VS</div>', 'pop', 0.9)}
        ${el('<div class="team red"><div class="tic">🟥</div><div class="tname">CHASSEURS</div><div class="tdesc">traquent 🎯</div></div>', 'right', 1.6)}
      </div>`,
    join: `
      <div class="center col" style="justify-content:flex-start;padding-top:240px;gap:26px">
        ${el('<div class="codechip">CODE · <b id="code">ABCD12</b></div>', 'pop', 0)}
        ${el(phone('lobby', 1.6), 'rise', 0.25)}
        ${el('<div class="pill green">⏱️ START !</div>', 'stamp', 3.4, 'style="position:absolute;top:1180px"')}
      </div>`,
    goal: `
      <div class="center col">
        ${el('<div class="clock" id="clock">30:00</div>', 'zoom', 0)}
        ${el('<div class="pill">⏱️ 30 MINUTES</div>', 'up', 0.5)}
        ${el('<div class="wincard">🟦 1 cacheur libre à la fin<br><b>= VICTOIRE 🏆</b></div>', 'pop', 1.9)}
      </div>`,
    capture: `
      <div class="center">
        ${el(phone('hunter', 1.75), 'left', 0, 'id="cap-a"')}
        ${el('<div class="dist">&lt; 5 m</div>', 'stamp', 1.1, 'style="position:absolute;top:330px"')}
        <div class="flash" id="flash"></div>
        ${el(phone('captured', 1.75), 'rise', 3.0, 'style="position:absolute"')}
        ${el('<div class="pill purple">🔓 un pote peut te libérer</div>', 'up', 5.4, 'style="position:absolute;top:1180px"')}
      </div>`,
    powers: `
      <div class="center col" style="gap:40px">
        ${el('<div class="h2">POUVOIRS ⚡</div>', 'up', 0)}
        <div class="pgrid">
          ${[['📡', 'RADAR'], ['👻', 'INVISIBLE'], ['🛡️', 'BOUCLIER'], ['⚡', 'SPEED'], ['🎯', 'SCAN'], ['🚨', 'ÉVÉNEMENTS']]
            .map(([i, n], k) => el(`<div class="pcard"><span>${i}</span><b>${n}</b></div>`, 'pop', 0.35 + k * 0.38)).join('')}
        </div>
      </div>`,
    zone: `
      <div class="center">
        ${el(phone('outzone', 1.75), 'zoom', 0)}
        <div class="redframe" id="redframe"></div>
      </div>`,
    outro: `
      <div class="center col" style="gap:30px">
        ${el('<div class="logo big">HIDE<br><span>&amp;</span>SEEK</div>', 'zoom', 0)}
        ${el('<div class="pill">📍 BIENTÔT À RA’ANANA</div>', 'up', 0.9)}
        ${el('<div class="chaud" id="chaud">T’ES CHAUD ? 🔥</div>', 'stamp', 2.0)}
        ${el('<div class="share">📲 envoie ça à tes potes</div>', 'fade', 2.8)}
      </div>`,
  };
}

const css = `
${FONT_CSS}
*{box-sizing:border-box;margin:0;padding:0}
html,body{width:1080px;height:1920px;overflow:hidden;background:#05070b}
body{font-family:Rubik,'Noto Color Emoji',sans-serif;color:#e6edf3}
#stage{position:absolute;inset:0;overflow:hidden;background:radial-gradient(1200px 900px at 50% 35%,#0d1a2a,#05070b 70%)}
.grid{position:absolute;inset:-100px;background-image:linear-gradient(rgba(34,211,238,.07) 2px,transparent 2px),linear-gradient(90deg,rgba(34,211,238,.07) 2px,transparent 2px);background-size:90px 90px}
.radar{position:absolute;left:50%;top:42%;width:1700px;height:1700px;margin:-850px 0 0 -850px;border-radius:50%;
  background:conic-gradient(from 0deg,rgba(34,211,238,.0) 0deg,rgba(34,211,238,.0) 300deg,rgba(34,211,238,.16) 360deg)}
.rings{position:absolute;left:50%;top:42%;transform:translate(-50%,-50%)}
.rings i{position:absolute;left:50%;top:50%;border:2px solid rgba(34,211,238,.12);border-radius:50%;transform:translate(-50%,-50%)}
.vignette{position:absolute;inset:0;background:radial-gradient(ellipse at center,transparent 50%,rgba(0,0,0,.75));pointer-events:none}
.scan{position:absolute;inset:0;background:repeating-linear-gradient(0deg,rgba(255,255,255,.025) 0 2px,transparent 2px 5px);pointer-events:none}
.scene{position:absolute;inset:0;opacity:0}
.center{position:absolute;inset:0 0 400px 0;display:flex;align-items:center;justify-content:center}
.col{flex-direction:column;gap:30px}
.an{will-change:transform,opacity}
.kick{font-size:90px;font-weight:800;letter-spacing:.3em;color:#8b98a9}
.mega{font-size:230px;font-weight:900;line-height:.86;text-align:center;letter-spacing:-.02em;text-shadow:0 0 50px rgba(34,211,238,.35)}
.stamp{font-size:120px;font-weight:900;color:#05070b;background:#facc15;padding:6px 40px;border-radius:24px;transform:rotate(-5deg);box-shadow:0 0 70px rgba(250,204,21,.5)}
.pill{font-size:54px;font-weight:800;padding:20px 44px;border-radius:999px;background:rgba(18,24,34,.9);border:3px solid #2a3442;letter-spacing:.03em}
.pill.cyan{border-color:#22d3ee;color:#67e8f9;box-shadow:0 0 40px rgba(34,211,238,.35)}
.pill.green{border-color:#22c55e;color:#86efac;background:#052e16;box-shadow:0 0 50px rgba(34,197,94,.5);font-size:70px}
.pill.purple{border-color:#a855f7;color:#e9d5ff;background:#2e1065;box-shadow:0 0 50px rgba(168,85,247,.5)}
.logo{font-size:170px;font-weight:900;line-height:.9;text-align:center;letter-spacing:-.02em;text-shadow:0 0 60px rgba(34,211,238,.55)}
.logo span{color:#22d3ee;margin:0 14px}.logo.big{font-size:210px}
.sub{font-size:38px;letter-spacing:.45em;color:#22d3ee;font-weight:600}
.tilt{transform:rotate(-6deg);margin-top:30px}
.split{position:absolute;inset:0 0 400px 0;display:flex;flex-direction:column;justify-content:center;align-items:center;gap:26px}
.team{width:900px;border-radius:44px;padding:36px;display:flex;flex-direction:column;align-items:center;gap:6px}
.team.blue{background:linear-gradient(135deg,rgba(59,130,246,.35),rgba(59,130,246,.08));border:4px solid #3b82f6;box-shadow:0 0 90px rgba(59,130,246,.45)}
.team.red{background:linear-gradient(135deg,rgba(239,68,68,.35),rgba(239,68,68,.08));border:4px solid #ef4444;box-shadow:0 0 90px rgba(239,68,68,.45)}
.tic{font-size:80px}.tname{font-size:110px;font-weight:900;letter-spacing:.04em}.tdesc{font-size:56px;color:#cbd5e1;font-weight:600}
.vs{font-size:110px;font-weight:900;color:#facc15;text-shadow:0 0 50px rgba(250,204,21,.7)}
.codechip{font-size:60px;font-weight:700;color:#8b98a9;padding:22px 48px;border-radius:30px;background:#0e141c;border:3px solid #22d3ee;box-shadow:0 0 60px rgba(34,211,238,.35)}
.codechip b{color:#22d3ee;letter-spacing:.14em;font-weight:900}
.clock{font-size:330px;font-weight:900;font-variant-numeric:tabular-nums;color:#22c55e;text-shadow:0 0 90px rgba(34,197,94,.7);line-height:1}
.wincard{font-size:62px;font-weight:700;text-align:center;line-height:1.35;padding:40px 60px;border-radius:40px;background:rgba(59,130,246,.15);border:4px solid #3b82f6;box-shadow:0 0 70px rgba(59,130,246,.4)}
.wincard b{font-size:90px;color:#fff;font-weight:900}
.dist{font-size:120px;font-weight:900;color:#fff;background:#ef4444;padding:4px 40px;border-radius:24px;box-shadow:0 0 80px rgba(239,68,68,.8);transform:rotate(4deg)}
.flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
.h2{font-size:130px;font-weight:900;text-shadow:0 0 50px rgba(250,204,21,.5)}
.pgrid{display:grid;grid-template-columns:repeat(3,300px);gap:30px}
.pcard{height:290px;border-radius:40px;background:rgba(18,24,34,.92);border:4px solid #2a3442;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;box-shadow:0 0 50px rgba(34,211,238,.15)}
.pcard span{font-size:110px}.pcard b{font-size:36px;letter-spacing:.04em}
.redframe{position:absolute;inset:0;box-shadow:inset 0 0 200px 40px rgba(239,68,68,.9);opacity:0}
.chaud{white-space:nowrap;font-size:96px;font-weight:900;color:#05070b;background:linear-gradient(135deg,#facc15,#f97316);padding:14px 50px;border-radius:30px;box-shadow:0 0 90px rgba(249,115,22,.7)}
.share{font-size:44px;color:#a6b3c3;font-weight:600}
#cap{position:absolute;left:60px;right:60px;top:1545px;display:flex;justify-content:center;text-align:center;z-index:20}
#cap span{font-size:66px;font-weight:800;line-height:1.18;padding:14px 30px;border-radius:24px;background:rgba(5,7,11,.72);box-shadow:0 10px 40px rgba(0,0,0,.5)}
#cap em{font-style:normal;color:#facc15}
#bar{position:absolute;top:0;left:0;height:10px;background:linear-gradient(90deg,#22d3ee,#3b82f6);box-shadow:0 0 20px #22d3ee;z-index:30}
#tag{position:absolute;top:120px;left:0;right:0;text-align:center;font-size:34px;font-weight:800;letter-spacing:.3em;color:rgba(230,237,243,.55);z-index:20}
#tag span{color:#22d3ee}
${mockCss}
`;

// Runs in the browser.
function runtime(T) {
  const clamp = (x) => Math.max(0, Math.min(1, x));
  const easeOut = (x) => 1 - Math.pow(1 - x, 3);
  const back = (x) => { const c = 1.9; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
  const scenes = T.scenes.map((s) => ({ ...s, node: document.getElementById('s-' + s.id), els: [...document.querySelectorAll('#s-' + s.id + ' .an')] }));
  const capEl = document.getElementById('cap');

  // Caption chunks: split each line into ~4-word groups timed by character count.
  for (const s of scenes) {
    // Split on punctuation first, then cap each chunk at ~5 words.
    const clauses = s.cap.match(/[^.,?!…:=]+[.,?!…:=]*\s*(🔥)?/g).map((c) => c.trim()).filter(Boolean);
    const chunks = [];
    for (const c of clauses) {
      const w = c.split(' ');
      if (w.length <= 6) { chunks.push(c); continue; }
      const half = Math.ceil(w.length / 2);
      chunks.push(w.slice(0, half).join(' '), w.slice(half).join(' '));
    }
    const total = chunks.reduce((a, c) => a + c.length, 0);
    let acc = 0;
    s.chunks = chunks.map((c) => { const st = acc / total; acc += c.length; return { text: c, st }; });
  }
  const fmt = (c) => c.split(' ').map((w) => (/[A-ZÉÈÀ]{2,}/.test(w.replace(/[^A-Za-zÉÈÀéèà]/g, '')) && w === w.toUpperCase() ? `<em>${w}</em>` : w)).join(' ');

  window.render = (t) => {
    document.getElementById('bar').style.width = (t / T.total) * 100 + '%';
    document.querySelector('.radar').style.transform = `rotate(${t * 60}deg)`;
    document.querySelector('.grid').style.transform = `translateY(${(t * 18) % 90}px)`;
    document.querySelectorAll('.rings i').forEach((r, i) => {
      const ph = ((t * 0.5 + i / 4) % 1);
      r.style.width = r.style.height = 200 + ph * 1500 + 'px';
      r.style.opacity = 1 - ph;
    });
    let capHtml = '';
    for (const s of scenes) {
      const lt = t - s.start;
      const vis = lt >= -0.2 && lt <= s.dur + 0.2;
      if (!vis) { s.node.style.opacity = 0; continue; }
      const fin = clamp((lt + 0.2) / 0.25), fout = clamp((s.dur + 0.2 - lt) / 0.25);
      s.node.style.opacity = Math.min(fin, fout);
      const zoom = 1 + 0.035 * clamp(lt / s.dur);
      const kick = lt < 0.05 ? 1.06 - 0.06 * clamp((lt + 0.2) / 0.25) : 1;
      s.node.style.transform = `scale(${zoom * kick})`;
      for (const e of s.els) {
        const p = clamp((lt - parseFloat(e.dataset.in)) / 0.5);
        const pe = easeOut(p);
        const a = e.dataset.a;
        let tr = '', op = p > 0 ? 1 : 0;
        if (a === 'up') { tr = `translateY(${(1 - pe) * 120}px)`; op = pe; }
        else if (a === 'rise') { tr = `translateY(${(1 - pe) * 900}px)`; }
        else if (a === 'fade') { op = pe; }
        else if (a === 'left') { tr = `translateX(${(1 - pe) * -1200}px)`; }
        else if (a === 'right') { tr = `translateX(${(1 - pe) * 1200}px)`; }
        else if (a === 'pop') { const b = p > 0 ? back(p) : 0; tr = `scale(${b})`; }
        else if (a === 'zoom') { tr = `scale(${0.6 + 0.4 * back(p)})`; op = clamp(p * 2); }
        else if (a === 'stamp') { const q = clamp((lt - parseFloat(e.dataset.in)) / 0.22); tr = `scale(${2.6 - 1.6 * easeOut(q)})`; op = q > 0 ? 1 : 0; }
        else if (a === 'glitch') {
          op = p > 0 ? 1 : 0;
          const g = p < 1 ? Math.sin(lt * 90) * 26 * (1 - p) : 0;
          tr = `translateX(${g}px) skewX(${g / 3}deg)`;
          e.style.textShadow = p < 1 ? `${g}px 0 #ef4444, ${-g}px 0 #22d3ee` : '0 0 50px rgba(34,211,238,.35)';
        }
        e.style.opacity = op;
        e.style.transform = tr;
      }
      // Scene-specific effects.
      if (s.id === 'join') {
        const n = Math.floor(clamp((lt - 0.4) / 1.2) * 6);
        document.getElementById('code').textContent = 'ABCD12'.slice(0, n).padEnd(6, '_');
      }
      if (s.id === 'goal') {
        const sec = Math.max(0, 1800 - Math.floor(Math.max(0, lt - 0.3) * 37));
        document.getElementById('clock').textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
      }
      if (s.id === 'capture') {
        const f = lt - 2.85;
        document.getElementById('flash').style.opacity = f > 0 && f < 0.35 ? 0.85 * (1 - f / 0.35) : 0;
        const a = document.getElementById('cap-a');
        if (lt > 3.0) a.style.opacity = Math.max(0, 1 - (lt - 3.0) / 0.3);
        s.node.style.transform += f > 0 && f < 0.3 ? ` translate(${Math.sin(f * 120) * 14}px,${Math.cos(f * 100) * 10}px)` : '';
      }
      if (s.id === 'zone') document.getElementById('redframe').style.opacity = 0.45 + 0.55 * Math.abs(Math.sin(lt * 5));
      if (s.id === 'outro') {
        const c = document.getElementById('chaud');
        if (lt > 2.3) c.style.transform = `scale(${1 + 0.05 * Math.sin((lt - 2.3) * 8)}) rotate(-3deg)`;
      }
      if (lt >= 0 && lt <= s.dur) {
        const rel = clamp(lt / Math.max(0.1, s.voice));
        let cur = s.chunks[0];
        for (const c of s.chunks) if (rel >= c.st) cur = c;
        capHtml = `<span>${fmt(cur.text)}</span>`;
      }
    }
    if (capEl.innerHTML !== capHtml) capEl.innerHTML = capHtml;
  };
}

function buildHtml(timeline) {
  const sc = scenesHtml();
  const rings = '<div class="rings">' + '<i></i>'.repeat(4) + '</div>';
  return `<!doctype html><html lang="fr"><head><meta charset="utf-8"><style>${css}</style></head><body>
  <div id="stage"><div class="grid"></div><div class="radar"></div>${rings}
  ${timeline.scenes.map((s) => `<section class="scene" id="s-${s.id}">${sc[s.id]}</section>`).join('')}
  <div class="scan"></div><div class="vignette"></div>
  <div id="tag">HIDE <span>&amp;</span> SEEK</div><div id="cap"></div><div id="bar"></div></div>
  <script>(${runtime.toString()})(${JSON.stringify(timeline)});</script></body></html>`;
}

module.exports = { buildHtml };
