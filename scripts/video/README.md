# Demo video

The project demo is generated entirely from code so its Arabic examples, timing, and branding remain reproducible.

## Build

Requires Python 3.11+ and `ffmpeg` on `PATH` (or the optional `imageio-ffmpeg` wheel in `requirements.txt`):

```powershell
python -m pip install -r scripts/video/requirements.txt
python scripts/video/build_demo.py
```

The build writes these public assets:

- `docs/assets/arabic-ai-skills-demo.mp4`
- `docs/assets/arabic-ai-skills-preview.gif`
- `docs/assets/arabic-ai-skills-poster.png`

Arabic text prefers Tahoma, falling back to Arial, Noto Sans Arabic (`Regular`/`Bold`/`VF`), or DejaVu Sans with `ImageFont.Layout.BASIC` and harakat preserved (`delete_harakat=False`). Latin labels prefer Segoe UI, falling back to Arial or DejaVu Sans. FFmpeg uses system `ffmpeg` from `PATH` first and falls back to `imageio-ffmpeg`.
