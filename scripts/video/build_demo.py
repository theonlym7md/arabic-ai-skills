"""Build the Arabic AI Skills launch video and its GitHub preview assets."""

from __future__ import annotations

import math
import subprocess
import sys
from functools import lru_cache
from pathlib import Path

import arabic_reshaper
import imageio_ffmpeg
import numpy as np
from bidi.algorithm import get_display
from PIL import Image, ImageDraw, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[2]
ASSET_DIR = ROOT / "docs" / "assets"
VIDEO_PATH = ASSET_DIR / "arabic-ai-skills-demo.mp4"
PREVIEW_PATH = ASSET_DIR / "arabic-ai-skills-preview.gif"
POSTER_PATH = ASSET_DIR / "arabic-ai-skills-poster.png"

WIDTH = 1280
HEIGHT = 720
FPS = 30
DURATION = 54

BG = (8, 11, 19)
SURFACE = (17, 23, 36)
SURFACE_2 = (22, 30, 46)
TEXT = (244, 241, 232)
MUTED = (149, 161, 181)
CYAN = (41, 229, 197)
CYAN_DARK = (15, 112, 102)
RED = (255, 105, 111)
RED_DARK = (107, 40, 48)
GOLD = (248, 195, 94)
BLUE = (99, 152, 255)

ARABIC_REGULAR = Path("C:/Windows/Fonts/tahoma.ttf")
ARABIC_BOLD = Path("C:/Windows/Fonts/tahomabd.ttf")
LATIN_REGULAR = Path("C:/Windows/Fonts/segoeui.ttf")
LATIN_BOLD = Path("C:/Windows/Fonts/segoeuib.ttf")


def clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def ease_out(value: float) -> float:
    value = clamp(value)
    return 1 - (1 - value) ** 3


def ease_in_out(value: float) -> float:
    value = clamp(value)
    return value * value * (3 - 2 * value)


def ar(text: str) -> str:
    return get_display(arabic_reshaper.reshape(text))


@lru_cache(maxsize=None)
def font(size: int, bold: bool = False, latin: bool = False) -> ImageFont.FreeTypeFont:
    path = LATIN_BOLD if latin and bold else LATIN_REGULAR if latin else ARABIC_BOLD if bold else ARABIC_REGULAR
    return ImageFont.truetype(str(path), size=size)


def make_background() -> Image.Image:
    y = np.linspace(0, 1, HEIGHT, dtype=np.float32)[:, None, None]
    top = np.array((7, 10, 17), dtype=np.float32)[None, None, :]
    bottom = np.array((12, 18, 29), dtype=np.float32)[None, None, :]
    gradient = top * (1 - y) + bottom * y
    gradient = np.repeat(gradient, WIDTH, axis=1).astype(np.uint8)
    return Image.fromarray(gradient, "RGB").convert("RGBA")


BACKGROUND = make_background()


def add_glow(image: Image.Image, center: tuple[int, int], radius: int, color: tuple[int, int, int], alpha: int) -> None:
    glow = Image.new("RGBA", image.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(glow)
    x, y = center
    draw.ellipse((x - radius, y - radius, x + radius, y + radius), fill=(*color, alpha))
    glow = glow.filter(ImageFilter.GaussianBlur(radius // 2))
    image.alpha_composite(glow)


def draw_grid(image: Image.Image, time_value: float) -> None:
    draw = ImageDraw.Draw(image)
    offset = int((time_value * 7) % 48)
    for x in range(-48 + offset, WIDTH + 48, 48):
        draw.line((x, 0, x, HEIGHT), fill=(255, 255, 255, 9), width=1)
    for y in range(-48 + offset, HEIGHT + 48, 48):
        draw.line((0, y, WIDTH, y), fill=(255, 255, 255, 7), width=1)


def shape_text(draw: ImageDraw.ImageDraw, text: str, position: tuple[int, int], text_font: ImageFont.FreeTypeFont, fill: tuple[int, ...], *, rtl: bool = True) -> None:
    x, y = position
    display = ar(text) if rtl else text
    bbox = draw.textbbox((0, 0), display, font=text_font)
    width = bbox[2] - bbox[0]
    draw.text((x - width if rtl else x, y), display, font=text_font, fill=fill)


def wrap_arabic(draw: ImageDraw.ImageDraw, text: str, text_font: ImageFont.FreeTypeFont, max_width: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current: list[str] = []
    for word in words:
        candidate = " ".join([*current, word])
        bbox = draw.textbbox((0, 0), ar(candidate), font=text_font)
        if current and bbox[2] - bbox[0] > max_width:
            lines.append(" ".join(current))
            current = [word]
        else:
            current.append(word)
    if current:
        lines.append(" ".join(current))
    return lines


def draw_arabic_block(
    draw: ImageDraw.ImageDraw,
    text: str,
    right: int,
    top: int,
    text_font: ImageFont.FreeTypeFont,
    fill: tuple[int, ...],
    max_width: int,
    spacing: int = 14,
) -> int:
    line_height = text_font.size + spacing
    for index, line in enumerate(wrap_arabic(draw, text, text_font, max_width)):
        shape_text(draw, line, (right, top + index * line_height), text_font, fill)
    return top + len(wrap_arabic(draw, text, text_font, max_width)) * line_height


def rounded(draw: ImageDraw.ImageDraw, box: tuple[int, int, int, int], radius: int, fill: tuple[int, ...], outline: tuple[int, ...] | None = None, width: int = 1) -> None:
    draw.rounded_rectangle(box, radius=radius, fill=fill, outline=outline, width=width)


def chip(draw: ImageDraw.ImageDraw, text: str, right: int, top: int, accent: tuple[int, int, int]) -> int:
    display = ar(text)
    chip_font = font(20, bold=True)
    bbox = draw.textbbox((0, 0), display, font=chip_font)
    width = bbox[2] - bbox[0] + 42
    rounded(draw, (right - width, top, right, top + 42), 21, (*accent, 24), (*accent, 90))
    shape_text(draw, text, (right - 18, top + 7), chip_font, (*accent, 255))
    return right - width - 10


def scene_opacity(time_value: float, start: float, end: float, ramp: float = 0.65) -> float:
    return min(clamp((time_value - start) / ramp), clamp((end - time_value) / ramp))


def composite_with_opacity(base: Image.Image, layer: Image.Image, opacity: float) -> None:
    if opacity >= 0.999:
        base.alpha_composite(layer)
        return
    alpha = layer.getchannel("A").point(lambda value: int(value * opacity))
    layer = layer.copy()
    layer.putalpha(alpha)
    base.alpha_composite(layer)


def brand(draw: ImageDraw.ImageDraw) -> None:
    draw.ellipse((70, 52, 88, 70), fill=CYAN)
    draw.ellipse((77, 59, 81, 63), fill=BG)
    shape_text(draw, "ARABIC AI SKILLS", (102, 47), font(18, bold=True, latin=True), (*TEXT, 225), rtl=False)


def footer(draw: ImageDraw.ImageDraw, scene_number: int) -> None:
    draw.line((70, 665, 1210, 665), fill=(255, 255, 255, 22), width=1)
    shape_text(draw, f"0{scene_number} / 06", (70, 678), font(14, latin=True), (*MUTED, 180), rtl=False)


def title_scene(layer: Image.Image, local_time: float) -> None:
    draw = ImageDraw.Draw(layer)
    p = ease_out(local_time / 1.0)
    offset = int(32 * (1 - p))
    brand(draw)
    shape_text(draw, "مهارات عربية تُفهم من أول مرة", (1165, 215 + offset), font(58, bold=True), (*TEXT, 255))
    shape_text(draw, "ليست ترجمة حرفية. إنها تجربة منتج كاملة.", (1165, 304 + offset), font(29), (*MUTED, 255))
    rounded(draw, (798, 380 + offset, 1165, 444 + offset), 20, (*CYAN, 22), (*CYAN, 80))
    shape_text(draw, "سياق ← صياغة ← مراجعة", (1135, 394 + offset), font(25, bold=True), (*CYAN, 255))
    shape_text(draw, "ARABIC INTELLIGENCE", (70, 594), font(86, bold=True, latin=True), (255, 255, 255, 20), rtl=False)
    footer(draw, 1)


def comparison_scene(
    layer: Image.Image,
    local_time: float,
    title: str,
    context: str,
    before_title: str,
    before_body: str,
    after_title: str,
    after_body: str,
    tags: list[str],
    number: int,
) -> None:
    draw = ImageDraw.Draw(layer)
    p = ease_out(local_time / 0.8)
    slide = int(45 * (1 - p))
    brand(draw)
    shape_text(draw, title, (1180, 86), font(34, bold=True), (*TEXT, 255))
    shape_text(draw, context, (1180, 128), font(20), (*MUTED, 255))

    left = (75 - slide, 185, 600 - slide, 590)
    right = (680 + slide, 185, 1205 + slide, 590)
    rounded(draw, left, 30, (*SURFACE, 248), (*RED, 70), 2)
    rounded(draw, right, 30, (*SURFACE_2, 250), (*CYAN, 100), 2)

    rounded(draw, (left[0] + 28, left[1] + 28, left[0] + 118, left[1] + 72), 18, (*RED_DARK, 220))
    shape_text(draw, "قبل", (left[0] + 96, left[1] + 34), font(20, bold=True), (*RED, 255))
    shape_text(draw, before_title, (left[2] - 34, left[1] + 104), font(31, bold=True), (*TEXT, 230))
    draw_arabic_block(draw, before_body, left[2] - 34, left[1] + 165, font(23), (*MUTED, 235), left[2] - left[0] - 68, 17)
    draw.line((left[0] + 34, left[3] - 72, left[2] - 34, left[3] - 72), fill=(*RED, 46), width=2)
    shape_text(draw, "عام • بلا سياق • بلا خطوة واضحة", (left[2] - 34, left[3] - 52), font(18), (*RED, 215))

    rounded(draw, (right[2] - 118, right[1] + 28, right[2] - 28, right[1] + 72), 18, (*CYAN_DARK, 210))
    shape_text(draw, "بعد", (right[2] - 50, right[1] + 34), font(20, bold=True), (*CYAN, 255))
    shape_text(draw, after_title, (right[2] - 34, right[1] + 104), font(31, bold=True), (*TEXT, 255))
    draw_arabic_block(draw, after_body, right[2] - 34, right[1] + 165, font(23), (*TEXT, 225), right[2] - right[0] - 68, 17)
    tag_right = right[2] - 34
    for tag in tags:
        tag_right = chip(draw, tag, tag_right, right[3] - 72, CYAN)
    footer(draw, number)


def pipeline_scene(layer: Image.Image, local_time: float) -> None:
    draw = ImageDraw.Draw(layer)
    brand(draw)
    shape_text(draw, "كيف تتحول الكلمات إلى تجربة؟", (1180, 94), font(40, bold=True), (*TEXT, 255))
    shape_text(draw, "المهارة لا تستبدل كلمة بكلمة؛ بل تبني القرار.", (1180, 148), font(23), (*MUTED, 255))

    labels = [
        ("السياق", "من المستخدم؟ وما هدفه؟", CYAN),
        ("المجال", "حكومي، مالي، صحي...", BLUE),
        ("الصياغة", "معنى مباشر ونبرة مناسبة", GOLD),
        ("المراجعة", "وضوح، ثقة، وإجراء", CYAN),
    ]
    card_width = 250
    gap = 28
    start_x = 87
    for index, (heading, body, accent) in enumerate(labels):
        reveal = ease_out((local_time - index * 0.22) / 0.7)
        y_offset = int(30 * (1 - reveal))
        x = start_x + index * (card_width + gap)
        y = 255 + y_offset
        rounded(draw, (x, y, x + card_width, y + 230), 28, (*SURFACE, int(245 * reveal)), (*accent, int(90 * reveal)), 2)
        draw.ellipse((x + 28, y + 28, x + 64, y + 64), fill=(*accent, int(220 * reveal)))
        shape_text(draw, f"0{index + 1}", (x + 38, y + 35), font(13, bold=True, latin=True), (*BG, int(255 * reveal)), rtl=False)
        shape_text(draw, heading, (x + card_width - 28, y + 90), font(28, bold=True), (*TEXT, int(255 * reveal)))
        draw_arabic_block(draw, body, x + card_width - 28, y + 139, font(18), (*MUTED, int(240 * reveal)), card_width - 56, 12)
        if index < len(labels) - 1:
            draw.line((x + card_width + 7, y + 115, x + card_width + gap - 7, y + 115), fill=(*MUTED, int(90 * reveal)), width=2)
    footer(draw, 5)


def install_scene(layer: Image.Image, local_time: float) -> None:
    draw = ImageDraw.Draw(layer)
    p = ease_out(local_time / 0.9)
    brand(draw)
    shape_text(draw, "مهارتان. هدف واحد.", (1180, 96), font(42, bold=True), (*TEXT, 255))
    shape_text(draw, "تجربة عربية واضحة، طبيعية، وقابلة للتنفيذ.", (1180, 152), font(24), (*MUTED, 255))

    cards = [
        (75, "arabicskill", "كتابة المنتج والتوطين والتدقيق", CYAN),
        (665, "arabic-uiux-master", "النص العربي مع RTL وإتاحة الاستخدام", GOLD),
    ]
    for index, (x, name, description, accent) in enumerate(cards):
        reveal = ease_out((local_time - index * 0.18) / 0.8)
        y = 235 + int(22 * (1 - reveal))
        rounded(draw, (x, y, x + 540, y + 178), 30, (*SURFACE, int(248 * reveal)), (*accent, int(90 * reveal)), 2)
        draw.ellipse((x + 32, y + 34, x + 78, y + 80), fill=(*accent, int(220 * reveal)))
        shape_text(draw, "AI", (x + 44, y + 46), font(13, bold=True, latin=True), (*BG, int(255 * reveal)), rtl=False)
        shape_text(draw, name, (x + 102, y + 34), font(24, bold=True, latin=True), (*TEXT, int(255 * reveal)), rtl=False)
        shape_text(draw, description, (x + 505, y + 92), font(20), (*MUTED, int(245 * reveal)))

    rounded(draw, (75, 460, 1205, 546), 24, (5, 8, 14, 245), (*CYAN, 74), 2)
    shape_text(draw, "$", (105, 483), font(24, bold=True, latin=True), (*CYAN, 255), rtl=False)
    shape_text(draw, "npx skills add theonlym7md/arabic-ai-skills", (145, 480), font(24, latin=True), (*TEXT, 255), rtl=False)
    shape_text(draw, "متاح الآن على GitHub و skills.sh", (1180, 584), font(24, bold=True), (*CYAN, 255))
    footer(draw, 6)


SCENES = [
    (0.0, 6.0, title_scene),
    (
        5.4,
        17.0,
        lambda layer, t: comparison_scene(
            layer,
            t,
            "حالة فارغة حكومية",
            "المستخدم فتح صفحة المخالفات ولم يجد أي نتائج.",
            "لا توجد نتائج",
            "في إطار حرصنا المستمر على تقديم أفضل الخدمات، يرجى التكرم بالعلم بأنه لا توجد مخالفات.",
            "لا توجد مخالفات مسجّلة عليك",
            "لا توجد مخالفات مرورية مرتبطة بهويتك حاليًا.",
            ["واضح", "مطمئن", "محدد"],
            2,
        ),
    ),
    (
        16.4,
        28.0,
        lambda layer, t: comparison_scene(
            layer,
            t,
            "تعذّر الدفع",
            "المستخدم يحتاج سببًا مفهومًا وخطوة يستطيع تنفيذها.",
            "فشلت العملية",
            "حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى في وقت لاحق.",
            "تعذّر إكمال الدفع",
            "تحقق من بيانات البطاقة أو استخدم وسيلة دفع أخرى.",
            ["إجراء واضح", "بلا لوم", "ثقة"],
            3,
        ),
    ),
    (
        27.4,
        38.0,
        lambda layer, t: comparison_scene(
            layer,
            t,
            "طلب إذن الموقع",
            "النص يوضح الفائدة والبيانات قبل طلب الموافقة.",
            "السماح بالموقع",
            "نحتاج إلى الوصول لموقعك لتحسين تجربتك في التطبيق.",
            "اعرف أقرب فرع إليك",
            "اسمح بالوصول إلى موقعك لعرض الفروع القريبة. يمكنك تغيير الإذن لاحقًا.",
            ["فائدة أولًا", "شفاف", "اختيار"],
            4,
        ),
    ),
    (37.4, 45.5, pipeline_scene),
    (44.9, 54.0, install_scene),
]


def render_frame(frame_index: int) -> Image.Image:
    time_value = frame_index / FPS
    image = BACKGROUND.copy()
    add_glow(image, (1080 + int(30 * math.sin(time_value / 2)), 90), 250, CYAN, 22)
    add_glow(image, (120 + int(24 * math.cos(time_value / 2.7)), 650), 230, BLUE, 16)
    draw_grid(image, time_value)

    for start, end, renderer in SCENES:
        opacity = scene_opacity(time_value, start, end)
        if opacity <= 0:
            continue
        layer = Image.new("RGBA", image.size, (0, 0, 0, 0))
        renderer(layer, time_value - start)
        composite_with_opacity(image, layer, ease_in_out(opacity))

    return image.convert("RGB")


def encode_video() -> None:
    ASSET_DIR.mkdir(parents=True, exist_ok=True)
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    command = [
        ffmpeg,
        "-y",
        "-f",
        "rawvideo",
        "-vcodec",
        "rawvideo",
        "-pix_fmt",
        "rgb24",
        "-s",
        f"{WIDTH}x{HEIGHT}",
        "-r",
        str(FPS),
        "-i",
        "-",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "medium",
        "-crf",
        "19",
        "-movflags",
        "+faststart",
        "-pix_fmt",
        "yuv420p",
        str(VIDEO_PATH),
    ]
    process = subprocess.Popen(command, stdin=subprocess.PIPE)
    assert process.stdin is not None
    total_frames = DURATION * FPS
    for frame_index in range(total_frames):
        frame = render_frame(frame_index)
        process.stdin.write(frame.tobytes())
        if frame_index == int(1.8 * FPS):
            frame.save(POSTER_PATH, quality=95)
        if frame_index % (FPS * 5) == 0:
            print(f"Rendered {frame_index / FPS:.0f}s / {DURATION}s", flush=True)
    process.stdin.close()
    return_code = process.wait()
    if return_code != 0:
        raise RuntimeError(f"ffmpeg exited with code {return_code}")


def encode_preview() -> None:
    ffmpeg = imageio_ffmpeg.get_ffmpeg_exe()
    filter_graph = (
        "fps=10,scale=720:-1:flags=lanczos,split[s0][s1];"
        "[s0]palettegen=max_colors=80:stats_mode=diff[p];"
        "[s1][p]paletteuse=dither=bayer:bayer_scale=3"
    )
    command = [
        ffmpeg,
        "-y",
        "-ss",
        "1.0",
        "-t",
        "17",
        "-i",
        str(VIDEO_PATH),
        "-vf",
        filter_graph,
        "-loop",
        "0",
        str(PREVIEW_PATH),
    ]
    subprocess.run(command, check=True)


def main() -> None:
    encode_video()
    encode_preview()
    print(f"Video: {VIDEO_PATH}")
    print(f"Preview: {PREVIEW_PATH}")
    print(f"Poster: {POSTER_PATH}")


if __name__ == "__main__":
    try:
        main()
    except BrokenPipeError:
        sys.exit("ffmpeg closed the input pipe unexpectedly")
