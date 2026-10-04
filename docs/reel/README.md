# Reel HIDE & SEEK (45 s, 9:16)

- `HIDE-AND-SEEK_reel_FR.mp4`: final video (1080x1920, 30 fps)
- `src/script.json`: voiceover text (`say`) and captions (`cap`) for each scene

Regenerate:
1. Voice: Piper TTS (`pip install piper-tts`), voice `fr-siwis-medium` (rhasspy/piper GitHub release v0.0.2), one `<id>.wav` per scene
2. `python3 src/audio.py <wav_dir> <work_dir>`: timeline + soundtrack (beat, sound effects, ducking)
3. `node src/render.js <work_dir> out.mp4`: frames (Playwright) + ffmpeg
