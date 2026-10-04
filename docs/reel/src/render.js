// Renders the reel frames with Playwright and pipes them to ffmpeg, then muxes the soundtrack.
// Usage: node render.js <work_dir> <out.mp4> [fps]
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');
const { buildHtml } = require('./reel');

const [work, out, fpsArg] = process.argv.slice(2);
const FPS = parseInt(fpsArg || '30', 10);
const timeline = JSON.parse(fs.readFileSync(path.join(work, 'timeline.json'), 'utf8'));
const htmlPath = path.join(work, 'reel.html');
fs.writeFileSync(htmlPath, buildHtml(timeline));

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  await page.goto('file://' + htmlPath);
  await page.evaluate(() => document.fonts.ready);

  if (process.env.STILLS) {
    for (const t of process.env.STILLS.split(',').map(Number)) {
      await page.evaluate((x) => window.render(x), t);
      await page.screenshot({ path: path.join(work, `still-${t}.png`) });
    }
    await browser.close();
    return;
  }

  const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-i', path.join(work, 'soundtrack.wav'),
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '19', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
    '-c:a', 'aac', '-b:a', '192k', '-ar', '44100', '-shortest', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });

  const frames = Math.round(timeline.total * FPS);
  for (let f = 0; f < frames; f++) {
    await page.evaluate((x) => window.render(x), f / FPS);
    const buf = await page.screenshot({ type: 'jpeg', quality: 92 });
    if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
    if (f % 150 === 0) console.log(`frame ${f}/${frames}`);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
  console.log('✓', out);
})();
