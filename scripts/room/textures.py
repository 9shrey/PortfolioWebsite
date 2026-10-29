"""Draws the room's printed surfaces (GPU shroud labels, ID badge, résumé sheet) into assets/room/src/gen.
python3 scripts/room/textures.py"""
import json, os, subprocess
from PIL import Image, ImageDraw, ImageFont, ImageFilter

OUT = "assets/room/src/gen"
os.makedirs(OUT, exist_ok=True)

def font(name, size, **axes):
    f = ImageFont.truetype(f"app/fonts/{name}.woff2", size)
    names = {a["name"].decode().lower(): a for a in f.get_variation_axes()}
    f.set_variation_by_axes([axes.get(n, a["default"]) for n, a in names.items()])
    return f

def fit(name, text, size, max_w, **axes):
    """Largest size <= size at which text fits max_w px."""
    while size > 10:
        f = font(name, size, **axes)
        if f.getlength(text) <= max_w: return f
        size -= 4
    return f

def hex2rgb(h): return tuple(int(h[i:i + 2], 16) for i in (1, 3, 5))

# GPU label strip: the band of each card that shows above the card in front of it in the rack (0.23 x 0.044 m).
for c in json.load(open("assets/room/cards.json"))["cards"]:
    bg, ac = hex2rgb(c["shroud"]), hex2rgb(c["accent"])
    ink = (20, 20, 22) if sum(bg) > 380 else (238, 236, 230)
    W, Hh = 2048, 392
    im = Image.new("RGB", (W, Hh), bg); d = ImageDraw.Draw(im)
    d.rectangle([0, Hh - 26, W, Hh], fill=ac)
    spec = font("martian-mono-var", 46, weight=500)
    sw = spec.getlength(c["spec"])
    big = fit("anybody-var", c["label"], 250, W - sw - 220, width=150, weight=900)
    d.text((70, (Hh - 26) / 2), c["label"], font=big, fill=ink, anchor="lm")
    d.text((W - 70, (Hh - 26) / 2 + 50), c["spec"], font=spec, fill=ac, anchor="rm")
    im.save(f"{OUT}/card_{c['id']}.png")

# ID badge, portrait card 54x86mm
W, H = 540, 860
im = Image.new("RGB", (W, H), (242, 240, 234)); d = ImageDraw.Draw(im)
d.rectangle([0, 0, W, 150], fill=(36, 66, 216))
d.text((40, 48), "SHREY SINGH", font=fit("anybody-var", "SHREY SINGH", 58, W - 80, width=140, weight=900), fill=(242, 240, 234))
d.rounded_rectangle([W // 2 - 44, 178, W // 2 + 44, 194], 8, fill=(200, 196, 186))   # lanyard slot
p = Image.open("assets/portrait-128.png").convert("L").resize((300, 300), Image.LANCZOS)
im.paste(Image.merge("RGB", (p, p, p)), (120, 230))
d.text((40, 570), "ML Systems Engineer", font=font("familjen-grotesk-var", 44, weight=700), fill=(20, 20, 22))
d.text((40, 630), "Agneyas Labs · Bengaluru", font=font("familjen-grotesk-var", 34), fill=(70, 70, 74))
for i, w in enumerate([3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1]):
    x = 40 + sum([3, 1, 2, 1, 3, 2, 1, 1, 3, 1, 2, 3, 1, 2, 1, 3, 1, 1, 2, 3, 1, 2, 1, 3, 2, 1, 1, 2, 3, 1][:i]) * 6 + i * 6
    d.rectangle([x, 720, x + w * 5, 810], fill=(20, 20, 22))
im.save(f"{OUT}/badge.png")

# Book spines: title and author running up the spine (read with the head tilted, like a real shelf)
for i, b in enumerate(json.load(open("assets/room/books.json"))["books"]):
    bg = hex2rgb(b["color"]); ink = (20, 20, 22) if sum(bg) > 380 else (240, 236, 228)
    L, T = 1024, 160                                     # along the spine, across it
    im = Image.new("RGB", (L, T), bg); d = ImageDraw.Draw(im)
    tf = fit("anybody-var", b["title"].upper(), 84, L - 330, width=115, weight=800)
    d.text((40, T / 2), b["title"].upper(), font=tf, fill=ink, anchor="lm")
    d.text((L - 40, T / 2), b["author"], font=fit("familjen-grotesk-var", b["author"], 46, 260, weight=700), fill=ink, anchor="rm")
    d.rectangle([0, 0, L, 10], fill=tuple(int(c * 0.75) for c in bg)); d.rectangle([0, T - 10, L, T], fill=tuple(int(c * 0.75) for c in bg))
    im.rotate(90, expand=True).save(f"{OUT}/spine_{i}.png")    # bottom-to-top, as on English-language spines

# Wall clock face: plain ticks, no numerals, a small maker's mark
S = 1024
im = Image.new("RGB", (S, S), (240, 237, 230)); d = ImageDraw.Draw(im)
import math
for k in range(60):
    a = math.radians(k * 6); big = k % 5 == 0
    r0, r1, w = (S * 0.40, S * 0.47, 14) if big else (S * 0.44, S * 0.47, 5)
    d.line([(S / 2 + r0 * math.sin(a), S / 2 - r0 * math.cos(a)), (S / 2 + r1 * math.sin(a), S / 2 - r1 * math.cos(a))], fill=(22, 22, 26), width=w)
d.text((S / 2, S * 0.66), "SS-26", font=font("martian-mono-var", 30, weight=500), fill=(110, 110, 116), anchor="mm")
im.save(f"{OUT}/clock_face.png")

# A four-star ball: orange glass with four red stars on the side that faces the room (equirect UVs)
Wd, Hd = 1024, 512
im = Image.new("RGB", (Wd, Hd), (236, 128, 26)); d = ImageDraw.Draw(im)
for yy in range(Hd):
    t = abs(yy - Hd / 2) / (Hd / 2)
    d.line([(0, yy), (Wd, yy)], fill=(int(250 - 60 * t), int(160 - 70 * t), int(40 - 20 * t)))
def star(cx, cy, r, fill):
    pts = []
    for k in range(10):
        a = math.pi / 2 + k * math.pi / 5; rr = r if k % 2 == 0 else r * 0.42
        pts.append((cx + rr * math.cos(a) * 0.5, cy - rr * math.sin(a)))   # x squeezed: equirect stretches it back
    d.polygon(pts, fill=fill)
for cu in (0.25, 0.75):            # the stars on both sides, so they face the room however the ball turns
    for sx, sy in ((-0.05, -0.12), (0.05, -0.1), (-0.04, 0.1), (0.05, 0.12)):
        star(Wd * (cu + sx), Hd * (0.5 + sy), 40, (196, 30, 30))
im.save(f"{OUT}/dragonball.png")

# The Polaroid on the monitor: assets/room/me.jpg if it's there (the LinkedIn photo), else the portrait.
# Square-cropped, warmed a little, like an instant print.
src = "assets/room/me.jpg" if os.path.exists("assets/room/me.jpg") else "assets/portrait-128.png"
ph = Image.open(src).convert("RGB")
side = min(ph.size); ph = ph.crop(((ph.width - side) // 2, (ph.height - side) // 3, (ph.width + side) // 2, (ph.height - side) // 3 + side))
ph = ph.resize((512, 512), Image.LANCZOS)
r_, g_, b_ = ph.split(); ph = Image.merge("RGB", (r_.point(lambda v: min(255, int(v * 1.04 + 6))), g_, b_.point(lambda v: int(v * 0.92))))
ph.save(f"{OUT}/me.png")

# Résumé, first page of the PDF
subprocess.run(["pdftoppm", "-png", "-r", "110", "-f", "1", "-l", "1", "-singlefile",
                "public/Shrey_Singh_Resume.pdf", f"{OUT}/resume"], check=True)
print("textures ok")
