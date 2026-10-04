"""Builds the reel soundtrack: voiceover + synthesized beat + whooshes/impacts, and the scene timeline.

Usage: python3 audio.py <voice_wav_dir> <out_dir>
Writes <out_dir>/timeline.json and <out_dir>/soundtrack.wav
"""
import json
import sys
import wave
from pathlib import Path

import numpy as np

SR = 44100
HERE = Path(__file__).parent
voice_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
out_dir.mkdir(parents=True, exist_ok=True)
script = json.loads((HERE / "script.json").read_text())

PAD, LEAD, OUTRO_HOLD = 0.4, 0.15, 1.5


def load(p):
    with wave.open(str(p)) as w:
        sr, n = w.getframerate(), w.getnframes()
        x = np.frombuffer(w.readframes(n), dtype=np.int16).astype(np.float32) / 32768
    # resample to SR (linear is fine for speech)
    t_new = np.arange(int(len(x) * SR / sr)) / SR
    return np.interp(t_new, np.arange(len(x)) / sr, x)


# ---- timeline
scenes, t = [], 0.0
voices = []
for i, s in enumerate(script):
    v = load(voice_dir / f"{s['id']}.wav")
    vd = len(v) / SR
    dur = LEAD + vd + (OUTRO_HOLD if i == len(script) - 1 else PAD)
    scenes.append({"id": s["id"], "cap": s["cap"], "start": round(t, 3), "dur": round(dur, 3), "voice": round(vd + LEAD, 3)})
    voices.append((t + LEAD, v))
    t += dur
total = round(t, 3)
(out_dir / "timeline.json").write_text(json.dumps({"total": total, "scenes": scenes}, ensure_ascii=False, indent=1))

N = int(total * SR) + SR
tt = np.arange(N) / SR
voice = np.zeros(N, np.float32)
for st, v in voices:
    i = int(st * SR)
    voice[i:i + len(v)] += v
voice *= 0.9 / (np.abs(voice).max() + 1e-9)

# ---- music (120 BPM, A minor: Am F C G)
BPM = 120
beat = 60 / BPM
music = np.zeros(N, np.float32)
rng = np.random.default_rng(1)


def add(sig, at, gain=1.0):
    i = int(at * SR)
    if i >= N:
        return
    j = min(N, i + len(sig))
    music[i:j] += gain * sig[: j - i]


def kick():
    d = np.arange(int(0.35 * SR)) / SR
    f = 45 + 110 * np.exp(-d * 30)
    return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-d * 9)


def hat(dec=60):
    d = np.arange(int(0.08 * SR)) / SR
    n = rng.standard_normal(len(d))
    n = np.diff(n, prepend=0)  # crude high-pass
    return n * np.exp(-d * dec) * 0.5


def clap():
    d = np.arange(int(0.2 * SR)) / SR
    n = rng.standard_normal(len(d))
    env = np.exp(-d * 25) * (1 + 0.6 * np.sin(2 * np.pi * 90 * d) ** 8)
    return np.diff(n, prepend=0) * env * 0.6


def lowpass(x, a):
    y = np.zeros_like(x)
    acc = 0.0
    for i in range(len(x)):
        acc += a * (x[i] - acc)
        y[i] = acc
    return y


def saw(freq, dur):
    d = np.arange(int(dur * SR)) / SR
    return 2 * ((d * freq) % 1) - 1


roots = [55.0, 43.65, 65.41, 49.0]  # A1 F1 C2 G1
chords = [[220, 261.6, 329.6], [174.6, 220, 261.6], [261.6, 329.6, 392], [196, 246.9, 293.7]]
drop = scenes[1]["start"]  # beat drops when the logo appears

# bass 16ths + pad, per bar (4 beats)
bar = 4 * beat
b = 0
while b * bar < total:
    t0 = b * bar
    r, ch = roots[b % 4], chords[b % 4]
    if t0 >= drop - 0.01:
        for k in range(16):
            note = saw(r * (2 if k % 4 == 2 else 1), beat / 4 * 0.9)
            env = np.exp(-np.arange(len(note)) / SR * 14)
            add(note * env, t0 + k * beat / 4, 0.32)
    pad = sum(saw(f * dt, bar) for f in ch for dt in (0.997, 1.003)) / 6
    att = np.minimum(1, np.arange(len(pad)) / (0.3 * SR))
    add(pad * att * np.minimum(1, (len(pad) - np.arange(len(pad))) / (0.2 * SR)), t0, 0.10)
    b += 1

# drums
k = 0
while k * beat < total:
    tb = k * beat
    if tb >= drop - 0.01:
        add(kick(), tb, 0.9)
        add(hat(), tb + beat / 2, 0.35)
        if k % 2 == 1:
            add(clap(), tb, 0.45)
        if scenes[5]["start"] <= tb < scenes[7]["start"] + scenes[7]["dur"]:  # busier hats mid-video
            add(hat(90), tb + beat / 4, 0.18)
            add(hat(90), tb + 3 * beat / 4, 0.18)
    k += 1

music = lowpass(music, 0.55)

# riser before the drop
rd = np.arange(int(drop * SR)) / SR
riser = rng.standard_normal(len(rd)) * (rd / drop) ** 3 * 0.25 + np.sin(2 * np.pi * np.cumsum(200 + 1200 * (rd / drop) ** 2) / SR) * (rd / drop) ** 2 * 0.12
add(riser.astype(np.float32), 0)

# ---- SFX
def whoosh(d=0.45):
    x = np.arange(int(d * SR)) / SR
    n = rng.standard_normal(len(x))
    env = np.sin(np.pi * x / d) ** 2
    return lowpass(n * env, 0.25) * 0.9


def impact():
    d = np.arange(int(0.9 * SR)) / SR
    boom = np.sin(2 * np.pi * np.cumsum(30 + 90 * np.exp(-d * 12)) / SR) * np.exp(-d * 4)
    crack = rng.standard_normal(len(d)) * np.exp(-d * 30)
    return boom + 0.4 * crack


sfx = np.zeros(N, np.float32)


def add_sfx(sig, at, gain):
    i = max(0, int(at * SR))
    j = min(N, i + len(sig))
    sfx[i:j] += gain * sig[: j - i]


for s in scenes[2:]:
    add_sfx(whoosh(), s["start"] - 0.3, 0.5)
add_sfx(impact(), 1.2, 0.8)  # "EN VRAI" stamp
add_sfx(impact(), scenes[5]["start"] + 2.85, 1.0)  # capture flash
add_sfx(impact(), scenes[8]["start"] + 2.0, 0.8)  # "T'es chaud ?"

# ---- mix with ducking under the voice
env = lowpass(np.abs(voice), 0.002)
env = env / (env.max() + 1e-9)
duck = 1 - 0.6 * np.clip(env * 3, 0, 1)
music *= 0.32 / (np.abs(music).max() + 1e-9)
mix = voice + music * duck + sfx * 0.35
# fade out end
fo = int(1.2 * SR)
end = int(total * SR)
mix[end - fo:end] *= np.linspace(1, 0, fo)
mix[end:] = 0
mix = mix[:end]
mix *= 0.95 / np.abs(mix).max()

with wave.open(str(out_dir / "soundtrack.wav"), "w") as w:
    w.setnchannels(1)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype(np.int16).tobytes())
print("total", total, "s")
