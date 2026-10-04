// Phone / dashboard mockups for the HIDE & SEEK presentation.
// App UI is in English (game-style labels) so the same visuals work in every language.

let uid = 0;

function qr(size = 120) {
  // Decorative QR-like pattern (deterministic), with the three finder squares.
  const n = 25;
  const c = size / n;
  let seed = 7;
  const rnd = () => ((seed = (seed * 9301 + 49297) % 233280) / 233280);
  let cells = '';
  const finder = (x, y) =>
    `<rect x="${x * c}" y="${y * c}" width="${7 * c}" height="${7 * c}" fill="#0a0e14"/>` +
    `<rect x="${(x + 1) * c}" y="${(y + 1) * c}" width="${5 * c}" height="${5 * c}" fill="#fff"/>` +
    `<rect x="${(x + 2) * c}" y="${(y + 2) * c}" width="${3 * c}" height="${3 * c}" fill="#0a0e14"/>`;
  const inFinder = (x, y) => (x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9);
  for (let y = 0; y < n; y++)
    for (let x = 0; x < n; x++)
      if (!inFinder(x, y) && rnd() > 0.52) cells += `<rect x="${x * c}" y="${y * c}" width="${c}" height="${c}" fill="#0a0e14"/>`;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">${cells}${finder(0, 0)}${finder(n - 7, 0)}${finder(0, n - 7)}</svg>`;
}

// Stylised street map of a neighbourhood with zones and players.
function map({ w = 260, h = 400, me = 'hider', showHunters = false, radar = false, outside = false, prison = false } = {}) {
  const id = 'm' + uid++;
  const cx = w / 2, cy = h / 2 + 10, R = Math.min(w, h) * 0.46;
  const roads = [
    // main roads
    [`M-10 ${h * 0.22} L${w + 10} ${h * 0.30}`, 9],
    [`M${w * 0.18} -10 L${w * 0.26} ${h + 10}`, 9],
    [`M-10 ${h * 0.78} L${w + 10} ${h * 0.70}`, 7],
    // minor streets
    [`M${w * 0.55} -10 L${w * 0.60} ${h + 10}`, 5],
    [`M${w * 0.82} -10 L${w * 0.86} ${h + 10}`, 4],
    [`M-10 ${h * 0.50} L${w + 10} ${h * 0.52}`, 5],
    [`M${w * 0.26} ${h * 0.62} L${w * 0.60} ${h * 0.64}`, 3],
    [`M${w * 0.60} ${h * 0.40} L${w + 10} ${h * 0.38}`, 3],
    [`M${w * 0.40} ${h * 0.27} L${w * 0.42} ${h * 0.51}`, 3],
    [`M${w * 0.72} ${h * 0.52} L${w * 0.70} ${h * 0.72}`, 3],
    [`M${w * 0.05} ${h * 0.40} Q${w * 0.15} ${h * 0.38} ${w * 0.22} ${h * 0.42}`, 3],
  ];
  const roadSvg = roads
    .map(([d, sw]) => `<path d="${d}" stroke="#1d2836" stroke-width="${sw + 3}" fill="none" stroke-linecap="round"/><path d="${d}" stroke="#263447" stroke-width="${sw}" fill="none" stroke-linecap="round"/>`)
    .join('');
  const buildings = [];
  let s = 3;
  const rnd = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  for (let i = 0; i < 70; i++) {
    const x = rnd() * w, y = rnd() * h, bw = 6 + rnd() * 12, bh = 6 + rnd() * 10;
    buildings.push(`<rect x="${x}" y="${y}" width="${bw}" height="${bh}" rx="1.5" fill="#151e2a"/>`);
  }

  const dot = (x, y, color, label = '', pulse = false) => `
    ${pulse ? `<circle cx="${x}" cy="${y}" r="14" fill="${color}" opacity=".18"/><circle cx="${x}" cy="${y}" r="22" fill="none" stroke="${color}" stroke-opacity=".35"/>` : ''}
    <circle cx="${x}" cy="${y}" r="7" fill="${color}" stroke="#0a0e14" stroke-width="2.5" filter="url(#${id}g)"/>
    ${label ? `<text x="${x}" y="${y - 12}" fill="#e6edf3" font-size="8.5" font-weight="700" text-anchor="middle" font-family="Rubik">${label}</text>` : ''}`;

  const meX = cx - 20, meY = cy + 30;
  const meColor = me === 'hider' ? '#3b82f6' : '#ef4444';

  return `
<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" style="display:block">
  <defs>
    <pattern id="${id}h" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
      <rect width="6" height="6" fill="#ef4444" fill-opacity=".10"/><line x1="0" y1="0" x2="0" y2="6" stroke="#ef4444" stroke-opacity=".55" stroke-width="2"/>
    </pattern>
    <filter id="${id}g" x="-100%" y="-100%" width="300%" height="300%"><feGaussianBlur stdDeviation="2.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <mask id="${id}mask"><rect width="${w}" height="${h}" fill="#fff"/><circle cx="${cx}" cy="${cy}" r="${R}" fill="#000"/></mask>
    <radialGradient id="${id}rad"><stop offset="0" stop-color="#ef4444" stop-opacity=".0"/><stop offset="1" stop-color="#ef4444" stop-opacity=".28"/></radialGradient>
    <linearGradient id="${id}sweep" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ef4444" stop-opacity="0"/><stop offset="1" stop-color="#ef4444" stop-opacity=".45"/></linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#0d131c"/>
  ${buildings.join('')}
  <path d="M${w * 0.62} ${h * 0.54} l${w * 0.08} -2 l2 ${h * 0.15} l-${w * 0.09} 2z" fill="#12301f"/>
  <circle cx="${w * 0.10}" cy="${h * 0.62}" r="${w * 0.07}" fill="#12301f"/>
  ${roadSvg}
  <!-- outside game area -->
  <rect width="${w}" height="${h}" fill="#000" opacity=".55" mask="url(#${id}mask)"/>
  <circle cx="${cx}" cy="${cy}" r="${R}" fill="none" stroke="#22c55e" stroke-width="2.5" stroke-dasharray="7 5" filter="url(#${id}g)"/>
  <!-- forbidden: main road strip / parking -->
  <path d="M${w * 0.62} ${h * 0.12} L${w * 0.92} ${h * 0.17} L${w * 0.90} ${h * 0.33} L${w * 0.64} ${h * 0.30}Z" fill="url(#${id}h)" stroke="#ef4444" stroke-width="1.5"/>
  <text x="${w * 0.77}" y="${h * 0.235}" fill="#fca5a5" font-size="8" font-weight="700" text-anchor="middle" font-family="Rubik">NO-GO</text>
  <!-- safe zone -->
  <circle cx="${w * 0.30}" cy="${h * 0.72}" r="22" fill="#3b82f6" fill-opacity=".14" stroke="#60a5fa" stroke-width="1.5"/>
  <text x="${w * 0.30}" y="${h * 0.72 + 3}" font-size="11" text-anchor="middle">🛡️</text>
  <!-- power zone -->
  <circle cx="${w * 0.74}" cy="${h * 0.62}" r="18" fill="#facc15" fill-opacity=".14" stroke="#facc15" stroke-width="1.5" stroke-dasharray="3 3"/>
  <text x="${w * 0.74}" y="${h * 0.62 + 4}" font-size="12" text-anchor="middle">⚡</text>
  <!-- items -->
  <text x="${w * 0.45}" y="${h * 0.42}" font-size="12" text-anchor="middle">💎</text>
  <text x="${w * 0.20}" y="${h * 0.34}" font-size="11" text-anchor="middle">🗝️</text>
  ${prison ? `<rect x="${w * 0.40}" y="${h * 0.80}" width="44" height="30" rx="6" fill="#a855f7" fill-opacity=".15" stroke="#a855f7"/><text x="${w * 0.40 + 22}" y="${h * 0.80 + 19}" font-size="12" text-anchor="middle">🔒</text>` : ''}
  ${radar ? `
    <circle cx="${meX}" cy="${meY}" r="95" fill="url(#${id}rad)" stroke="#ef4444" stroke-opacity=".6" stroke-dasharray="2 4"/>
    <circle cx="${meX}" cy="${meY}" r="55" fill="none" stroke="#ef4444" stroke-opacity=".35"/>
    <path d="M${meX} ${meY} L${meX + 95} ${meY} A95 95 0 0 0 ${meX + 67} ${meY - 67} Z" fill="url(#${id}sweep)"/>
    <text x="${meX + 60}" y="${meY + 92}" fill="#fca5a5" font-size="7.5" font-family="Rubik">100 m</text>` : ''}
  <!-- players -->
  ${me === 'hider'
    ? dot(w * 0.62, h * 0.44, '#3b82f6', 'Noam') + dot(w * 0.33, h * 0.58, '#3b82f6', 'Lucas')
    : dot(w * 0.30, h * 0.40, '#ef4444', 'Eliott')}
  ${showHunters ? dot(w * 0.66, h * 0.86, '#ef4444', '', true) : ''}
  ${radar ? dot(meX + 48, meY - 40, '#3b82f6', '42 m', true) + dot(meX - 70, meY + 40, '#3b82f6', '', true) : ''}
  <!-- me -->
  <path d="M${meX} ${meY} L${meX - 14} ${meY - 36} A38 38 0 0 1 ${meX + 14} ${meY - 36}Z" fill="${meColor}" opacity=".28"/>
  <circle cx="${meX}" cy="${meY}" r="18" fill="${meColor}" opacity=".18"/>
  <circle cx="${meX}" cy="${meY}" r="8" fill="#fff" stroke="${meColor}" stroke-width="4" filter="url(#${id}g)"/>
  ${outside ? '' : ''}
</svg>`;
}

const statusBar = `<div class="sb"><span>9:41</span><span class="notch"></span><span>📶 🔋</span></div>`;

function phone(inner, extraClass = '') {
  return `<div class="phone ${extraClass}"><div class="screen">${statusBar}${inner}</div></div>`;
}

const screens = {
  home: () => phone(`
    <div class="home">
      <div class="home-bg">${map({ w: 260, h: 540 })}</div>
      <div class="home-ov">
        <div class="logo-sm">HIDE<span>&amp;</span>SEEK</div>
        <div class="tag">MULTIPLAYER · GPS · IRL</div>
        <div class="radar-ring"><div></div><div></div><div></div><span>📍</span></div>
        <div class="btn primary">🎮&nbsp; CREATE GAME</div>
        <div class="btn">🚪&nbsp; JOIN GAME</div>
        <div class="btn ghost">📖&nbsp; HOW TO PLAY</div>
        <div class="btn ghost">⚙️&nbsp; SETTINGS</div>
      </div>
    </div>`),

  lobby: () => phone(`
    <div class="pad">
      <div class="small muted">LOBBY</div>
      <div class="h">Ra'anana Night Hunt</div>
      <div class="codebox"><div><div class="small muted">GAME CODE</div><div class="code">ABCD12</div></div><div class="qr">${qr(78)}</div></div>
      <div class="row-sp small muted"><span>PLAYERS 8 / 16</span><span>⏱ 30 min</span></div>
      <div class="team-h blue">🟦 HIDERS · 6</div>
      ${['Meir', 'Lucas', 'Noam', 'Yael', 'Tom', 'Shira'].map((n, i) => `<div class="pl"><span class="av" style="background:hsl(${210 + i * 12} 70% 45%)">${n[0]}</span>${n}<span class="ready">${i === 5 ? '…' : 'READY ✓'}</span></div>`).join('')}
      <div class="team-h red">🟥 HUNTERS · 2</div>
      ${['Eliott', 'Dan'].map((n, i) => `<div class="pl"><span class="av" style="background:hsl(${0 + i * 15} 70% 48%)">${n[0]}</span>${n}<span class="ready">READY ✓</span></div>`).join('')}
      <div class="btn primary big">🚀&nbsp; START GAME</div>
    </div>`),

  hider: () => phone(`
    <div class="game">
      <div class="hud-top">
        <div class="chip blue">🟦 HIDER</div>
        <div class="timer">18:42</div>
        <div class="chip">📡 GPS ±4m</div>
      </div>
      <div class="phase">HUNT PHASE · 3 hiders left</div>
      <div class="mapwrap">${map({ w: 260, h: 380, me: 'hider', showHunters: true })}</div>
      <div class="toast red">💓 Hunter nearby · ~60 m</div>
      <div class="hud-bottom">
        <div class="pw"><b>👻</b><span>INVISIBLE</span></div>
        <div class="pw"><b>🛡️</b><span>SHIELD</span></div>
        <div class="pw cd"><b>⚡</b><span>0:45</span></div>
        <div class="pw radio"><b>🎙️</b><span>RADIO</span></div>
      </div>
      <div class="scorebar"><span>SCORE <b>450</b></span><span>#2 🥈</span><span class="sos">SOS</span></div>
    </div>`),

  hunter: () => phone(`
    <div class="game">
      <div class="hud-top">
        <div class="chip red">🟥 HUNTER</div>
        <div class="timer warn">04:58</div>
        <div class="chip">📡 GPS ±3m</div>
      </div>
      <div class="phase red">🔥 FINAL HUNT · radar active</div>
      <div class="mapwrap">${map({ w: 260, h: 380, me: 'hunter', radar: true })}</div>
      <div class="capture">🎯 CAPTURE <small>target 4 m</small></div>
      <div class="hud-bottom">
        <div class="pw"><b>📡</b><span>RADAR</span></div>
        <div class="pw"><b>🎯</b><span>SCAN</span></div>
        <div class="pw cd"><b>❄️</b><span>1:20</span></div>
        <div class="pw radio"><b>🎙️</b><span>RADIO</span></div>
      </div>
      <div class="scorebar"><span>SCORE <b>600</b></span><span>#1 🥇</span><span class="sos">SOS</span></div>
    </div>`),

  outzone: () => phone(`
    <div class="game">
      <div class="mapwrap full">${map({ w: 260, h: 540, me: 'hider', outside: true })}</div>
      <div class="alert-ov">
        <div class="alert-icon">⚠️</div>
        <div class="alert-t">OUT OF ZONE</div>
        <div class="alert-s">Go back inside the green area</div>
        <div class="count">0:11</div>
        <div class="alert-s small">After 0:00 → your position is revealed for 30 s</div>
        <div class="arrow">⬆️ 35 m</div>
      </div>
    </div>`),

  captured: () => phone(`
    <div class="game">
      <div class="mapwrap full">${map({ w: 260, h: 540, me: 'hider', prison: true })}</div>
      <div class="alert-ov purple">
        <div class="burst">🚨</div>
        <div class="alert-t">YOU'VE BEEN<br>CAPTURED!</div>
        <div class="alert-s">by <b>Eliott</b> · 18:02</div>
        <div class="jail">🔒 Go to PRISON<br><small>A teammate can free you (10 s within 5 m)</small></div>
        <div class="btn ghost">🗺️&nbsp; SHOW PRISON</div>
      </div>
    </div>`),

  results: () => phone(`
    <div class="pad results">
      <div class="go">🏁 GAME OVER</div>
      <div class="winner">🟦 HIDERS WIN</div>
      <div class="podium">
        <div class="pod p2"><span class="av" style="background:#3b82f6">L</span><b>Lucas</b><small>1 250</small><div class="bar">2</div></div>
        <div class="pod p1"><span class="av" style="background:#2563eb">M</span><b>Meir</b><small>1 480</small><div class="bar">1</div></div>
        <div class="pod p3"><span class="av" style="background:#ef4444">E</span><b>Eliott</b><small>1 100</small><div class="bar">3</div></div>
      </div>
      <div class="stats">
        <div><b>27:14</b><span>survival</span></div>
        <div><b>3.2 km</b><span>distance</span></div>
        <div><b>4</b><span>items</span></div>
        <div><b>+340</b><span>XP</span></div>
      </div>
      <div class="badge">🏅 NEW BADGE · <b>GHOST</b> — never detected</div>
      <div class="btn primary">🔄&nbsp; PLAY AGAIN</div>
      <div class="row2"><div class="btn ghost">🏠 HOME</div><div class="btn ghost">📊 STATS</div></div>
    </div>`),

  admin: () => `
  <div class="tablet"><div class="adm">
    <div class="adm-side">
      <div class="logo-xs">HIDE<span>&amp;</span>SEEK</div>
      <div class="nav on">📊 Dashboard</div><div class="nav">🗺️ Map control</div><div class="nav">🎮 Game control</div>
      <div class="nav">🟥 Zones</div><div class="nav">👥 Players</div><div class="nav">⚙️ Settings</div>
      <div class="gm">🎮 GAME MASTER</div>
    </div>
    <div class="adm-main">
      <div class="adm-top">
        <div><div class="small muted">GAME · ABCD12</div><div class="h">Ra'anana Night Hunt</div></div>
        <div class="timer">18:42</div>
        <div class="ctrls"><span>⏸️ Pause</span><span>⏭️ Next phase</span><span>🎲 Event</span><span class="end">🏁 End</span></div>
      </div>
      <div class="kpis">
        <div><b>8</b><span>players</span></div><div><b>8/8</b><span>GPS active</span></div>
        <div><b>3</b><span>hiders free</span></div><div><b>2</b><span>in prison</span></div><div class="warn"><b>1</b><span>⚠️ anomaly</span></div>
      </div>
      <div class="adm-grid">
        <div class="adm-map">${map({ w: 330, h: 230, me: 'hider', showHunters: true, prison: true })}</div>
        <div class="adm-table">
          <div class="tr th"><span>Player</span><span>Team</span><span>Status</span><span>GPS</span><span>Score</span></div>
          <div class="tr"><span>Meir</span><span class="b">HIDER</span><span>free</span><span>±4m</span><span>450</span></div>
          <div class="tr"><span>Lucas</span><span class="b">HIDER</span><span>👻 invisible</span><span>±6m</span><span>380</span></div>
          <div class="tr"><span>Noam</span><span class="b">HIDER</span><span>🔒 prison</span><span>±5m</span><span>210</span></div>
          <div class="tr"><span>Eliott</span><span class="r">HUNTER</span><span>📡 radar</span><span>±3m</span><span>600</span></div>
          <div class="tr warnrow"><span>Dan</span><span class="r">HUNTER</span><span>⚠️ 92 km/h</span><span>±40m</span><span>300</span></div>
          <div class="acts"><span>👁️ Reveal</span><span>❄️ Freeze</span><span>⚡ Give power</span><span>🔓 Free</span></div>
        </div>
      </div>
    </div>
  </div></div>`,
};

const css = `
.phone{width:260px;height:540px;border-radius:40px;background:#05070a;padding:9px;box-shadow:0 0 0 1.5px #2a3442,0 20px 50px rgba(0,0,0,.6),0 0 40px rgba(34,211,238,.08);flex:none;direction:ltr}
.screen{width:100%;height:100%;border-radius:32px;overflow:hidden;position:relative;background:#0a0e14;color:#e6edf3;font-family:Rubik,sans-serif}
.sb{position:absolute;top:0;left:0;right:0;height:26px;display:flex;justify-content:space-between;align-items:center;padding:0 18px;font-size:10px;font-weight:600;z-index:5}
.notch{width:70px;height:18px;background:#05070a;border-radius:10px}
.pad{padding:34px 14px 14px;height:100%;display:flex;flex-direction:column;gap:6px}
.small{font-size:9px;letter-spacing:.08em}.muted{color:#8b98a9}
.h{font-size:15px;font-weight:800}
.btn{border:1px solid #2a3442;border-radius:12px;padding:9px;text-align:center;font-weight:700;font-size:11px;background:#121822;letter-spacing:.04em}
.btn.primary{background:linear-gradient(135deg,#22d3ee,#3b82f6);border:none;color:#04121a;box-shadow:0 0 18px rgba(34,211,238,.35)}
.btn.ghost{background:rgba(18,24,34,.7)}
.btn.big{margin-top:auto;padding:11px}
.home{position:absolute;inset:0}.home-bg{position:absolute;inset:0;opacity:.55}
.home-ov{position:absolute;inset:0;padding:70px 22px 26px;display:flex;flex-direction:column;gap:9px;background:linear-gradient(180deg,rgba(10,14,20,.2),rgba(10,14,20,.92) 60%)}
.logo-sm{font-size:34px;font-weight:900;text-align:center;letter-spacing:.02em;line-height:1;text-shadow:0 0 18px rgba(34,211,238,.6)}
.logo-sm span{color:#22d3ee;margin:0 3px}
.tag{text-align:center;font-size:9px;letter-spacing:.3em;color:#22d3ee;margin-bottom:6px}
.radar-ring{position:relative;width:120px;height:120px;margin:4px auto 14px}
.radar-ring div{position:absolute;inset:0;border:1.5px solid rgba(34,211,238,.5);border-radius:50%}
.radar-ring div:nth-child(2){inset:22px;border-color:rgba(34,211,238,.35)}.radar-ring div:nth-child(3){inset:44px;background:rgba(34,211,238,.15)}
.radar-ring span{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-size:20px}
.codebox{display:flex;justify-content:space-between;align-items:center;background:#121822;border:1px solid #22d3ee55;border-radius:14px;padding:10px 12px;margin:4px 0}
.code{font-size:26px;font-weight:900;letter-spacing:.12em;color:#22d3ee;text-shadow:0 0 12px rgba(34,211,238,.5)}
.qr{background:#fff;padding:4px;border-radius:6px;line-height:0}
.row-sp{display:flex;justify-content:space-between}
.team-h{font-size:10px;font-weight:800;margin-top:4px;letter-spacing:.06em}.team-h.blue{color:#60a5fa}.team-h.red{color:#f87171}
.pl{display:flex;align-items:center;gap:8px;font-size:11px;background:#121822;border-radius:9px;padding:4px 8px}
.av{width:20px;height:20px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#fff;flex:none}
.ready{margin-left:auto;font-size:8.5px;color:#22c55e;font-weight:700}
.game{position:absolute;inset:0}
.hud-top{position:absolute;top:28px;left:8px;right:8px;display:flex;justify-content:space-between;align-items:center;z-index:4}
.chip{font-size:8.5px;font-weight:700;padding:4px 7px;border-radius:999px;background:rgba(18,24,34,.9);border:1px solid #2a3442}
.chip.blue{border-color:#3b82f6;color:#93c5fd}.chip.red{border-color:#ef4444;color:#fca5a5}
.timer{font-size:24px;font-weight:900;font-variant-numeric:tabular-nums;color:#22c55e;text-shadow:0 0 14px rgba(34,197,94,.6)}
.timer.warn{color:#facc15;text-shadow:0 0 14px rgba(250,204,21,.6)}
.phase{position:absolute;top:62px;left:50%;transform:translateX(-50%);font-size:8.5px;font-weight:700;letter-spacing:.06em;background:rgba(34,211,238,.12);border:1px solid #22d3ee66;color:#67e8f9;padding:3px 9px;border-radius:999px;z-index:4;white-space:nowrap}
.phase.red{background:rgba(239,68,68,.15);border-color:#ef444488;color:#fca5a5}
.mapwrap{position:absolute;top:56px;left:0;right:0}.mapwrap.full{top:0}
.toast{position:absolute;top:380px;left:14px;right:14px;font-size:10px;font-weight:700;padding:7px 10px;border-radius:10px;z-index:4;text-align:center}
.toast.red{background:rgba(127,29,29,.85);border:1px solid #ef4444;box-shadow:0 0 16px rgba(239,68,68,.45)}
.capture{position:absolute;top:372px;left:30px;right:30px;text-align:center;font-weight:900;font-size:15px;letter-spacing:.06em;padding:9px;border-radius:14px;background:linear-gradient(135deg,#ef4444,#f97316);box-shadow:0 0 24px rgba(239,68,68,.6);z-index:4}
.capture small{display:block;font-size:8.5px;font-weight:600;opacity:.9;letter-spacing:.04em}
.hud-bottom{position:absolute;bottom:34px;left:8px;right:8px;display:flex;gap:6px;z-index:4}
.pw{flex:1;background:rgba(18,24,34,.95);border:1px solid #2a3442;border-radius:12px;padding:6px 0;display:flex;flex-direction:column;align-items:center;gap:2px}
.pw b{font-size:16px}.pw span{font-size:7.5px;font-weight:700;letter-spacing:.06em;color:#cbd5e1}
.pw.cd{opacity:.55}.pw.radio{border-color:#22c55e88}
.scorebar{position:absolute;bottom:8px;left:10px;right:10px;display:flex;justify-content:space-between;align-items:center;font-size:10px;color:#cbd5e1;z-index:4}
.scorebar b{color:#fff}.sos{background:#dc2626;color:#fff;font-weight:900;padding:2px 8px;border-radius:6px;font-size:9px}
.alert-ov{position:absolute;inset:0;background:radial-gradient(circle at 50% 40%,rgba(239,68,68,.35),rgba(60,5,5,.9) 75%);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center;padding:24px;z-index:6;box-shadow:inset 0 0 60px rgba(239,68,68,.8)}
.alert-ov.purple{background:radial-gradient(circle at 50% 40%,rgba(168,85,247,.35),rgba(20,6,40,.92) 75%);box-shadow:inset 0 0 60px rgba(168,85,247,.7)}
.alert-icon,.burst{font-size:42px}
.alert-t{font-size:24px;font-weight:900;letter-spacing:.04em;line-height:1.05}
.alert-s{font-size:11px;color:#fecaca}.alert-ov.purple .alert-s{color:#e9d5ff}
.count{font-size:46px;font-weight:900;font-variant-numeric:tabular-nums;color:#fff;text-shadow:0 0 20px #ef4444}
.arrow{margin-top:6px;font-size:12px;font-weight:800;background:#22c55e22;border:1px solid #22c55e;color:#86efac;padding:6px 12px;border-radius:999px}
.jail{font-size:13px;font-weight:800;background:rgba(168,85,247,.15);border:1px solid #a855f7;border-radius:12px;padding:10px;margin:6px 0}
.jail small{font-weight:500;font-size:9px;color:#d8b4fe}
.results{align-items:stretch}.go{text-align:center;font-weight:900;font-size:22px;margin-top:6px}
.winner{text-align:center;font-size:11px;font-weight:800;color:#60a5fa;letter-spacing:.1em}
.podium{display:flex;align-items:flex-end;justify-content:center;gap:8px;margin:8px 0 4px;height:150px}
.pod{display:flex;flex-direction:column;align-items:center;gap:2px;width:68px;font-size:10px}
.pod .av{width:30px;height:30px;font-size:13px}.pod small{color:#8b98a9;font-size:9px}
.pod .bar{width:100%;border-radius:8px 8px 0 0;display:flex;align-items:flex-start;justify-content:center;padding-top:4px;font-weight:900;font-size:16px}
.p1 .bar{height:70px;background:linear-gradient(#facc15,#a16207)}.p2 .bar{height:50px;background:linear-gradient(#cbd5e1,#64748b)}.p3 .bar{height:36px;background:linear-gradient(#f59e0b,#92400e)}
.stats{display:grid;grid-template-columns:1fr 1fr;gap:6px}
.stats div{background:#121822;border-radius:10px;padding:6px 8px;display:flex;flex-direction:column}
.stats b{font-size:14px}.stats span{font-size:8.5px;color:#8b98a9;text-transform:uppercase;letter-spacing:.06em}
.badge{font-size:10px;background:rgba(250,204,21,.1);border:1px solid #facc1588;color:#fde68a;border-radius:10px;padding:7px;text-align:center}
.row2{display:flex;gap:6px}.row2 .btn{flex:1}
.tablet{width:720px;height:420px;border-radius:26px;background:#05070a;padding:10px;box-shadow:0 0 0 1.5px #2a3442,0 20px 50px rgba(0,0,0,.6);direction:ltr}
.adm{display:flex;height:100%;border-radius:18px;overflow:hidden;background:#0a0e14;color:#e6edf3;font-family:Rubik,sans-serif}
.adm-side{width:130px;background:#0e141c;border-right:1px solid #1f2a38;padding:14px 10px;display:flex;flex-direction:column;gap:4px}
.logo-xs{font-weight:900;font-size:15px;margin-bottom:10px}.logo-xs span{color:#22d3ee}
.nav{font-size:10.5px;padding:6px 8px;border-radius:8px;color:#a6b3c3}.nav.on{background:#22d3ee1f;color:#67e8f9;font-weight:700}
.gm{margin-top:auto;font-size:9px;font-weight:800;color:#facc15;letter-spacing:.06em}
.adm-main{flex:1;padding:12px 14px;display:flex;flex-direction:column;gap:10px}
.adm-top{display:flex;align-items:center;gap:14px}.adm-top .timer{margin-left:auto}
.ctrls{display:flex;gap:5px}.ctrls span{font-size:9px;background:#121822;border:1px solid #2a3442;padding:5px 7px;border-radius:8px;font-weight:600}
.ctrls .end{border-color:#ef4444;color:#fca5a5}
.kpis{display:flex;gap:8px}.kpis div{flex:1;background:#121822;border:1px solid #1f2a38;border-radius:10px;padding:6px 9px;display:flex;flex-direction:column}
.kpis b{font-size:17px}.kpis span{font-size:8.5px;color:#8b98a9}.kpis .warn{border-color:#f59e0b88}.kpis .warn b{color:#fbbf24}
.adm-grid{display:flex;gap:10px;flex:1;min-height:0}
.adm-map{border-radius:12px;overflow:hidden;border:1px solid #1f2a38;flex:none;height:230px}
.adm-table{flex:1;display:flex;flex-direction:column;gap:3px;font-size:9.5px}
.tr{display:grid;grid-template-columns:1.1fr 1fr 1.3fr .8fr .7fr;padding:5px 6px;border-radius:6px;background:#121822}
.tr.th{background:none;color:#8b98a9;font-size:8.5px;text-transform:uppercase;letter-spacing:.06em}
.tr .b{color:#60a5fa;font-weight:700}.tr .r{color:#f87171;font-weight:700}
.warnrow{background:rgba(245,158,11,.12);border:1px solid #f59e0b66}
.acts{display:flex;gap:4px;margin-top:auto;flex-wrap:wrap}.acts span{font-size:8.5px;background:#22d3ee14;border:1px solid #22d3ee55;color:#a5f3fc;padding:4px 6px;border-radius:7px}
`;

module.exports = { screens, css, qr };
