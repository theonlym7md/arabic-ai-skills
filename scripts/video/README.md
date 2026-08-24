# Demo video

The project demo is generated entirely from code so its Arabic examples, timing, and branding remain reproducible.

## Build

```powershell
python -m pip install -r scripts/video/requirements.txt
python scripts/video/build_demo.py
```

The build writes these public assets:

- `docs/assets/arabic-ai-skills-demo.mp4`
- `docs/assets/arabic-ai-skills-preview.gif`
- `docs/assets/arabic-ai-skills-poster.png`

The renderer uses Tahoma when available and falls back to Arial. FFmpeg is supplied by `imageio-ffmpeg`.
