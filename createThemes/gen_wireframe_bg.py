"""Generate the shared wireframe background for the white theme (480x480)."""
from PIL import Image, ImageDraw

W, H = 480, 480

# --- Colors (pre-composited on #f6f4ed background) ---
BG = (246, 244, 237)
GOLD = (201, 168, 76)
MUTED = (158, 155, 143)

# rgba(MUTED, 0.25) on BG
FRAME_OUTER = tuple(int(BG[i] * 0.75 + MUTED[i] * 0.25) for i in range(3))
# rgba(MUTED, 0.12) on BG
FRAME_INNER = tuple(int(BG[i] * 0.88 + MUTED[i] * 0.12) for i in range(3))
# rgba(GOLD, 0.4) on BG
CORNER = tuple(int(BG[i] * 0.6 + GOLD[i] * 0.4) for i in range(3))
# rgba(GOLD, 0.3) on BG
DOT_FULL = tuple(int(BG[i] * 0.7 + GOLD[i] * 0.3) for i in range(3))
# rgba(GOLD, 0.2) on BG
DOT_DIM = tuple(int(BG[i] * 0.8 + GOLD[i] * 0.2) for i in range(3))

img = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(img)

# Outer frame (inset 24px) — draw 4 sides as 1px lines
frame_inset = 24
x0, y0, x1, y1 = frame_inset, frame_inset, W - frame_inset - 1, H - frame_inset - 1
d.rectangle([x0, y0, x1, y1], outline=FRAME_OUTER, width=1)

# Inner frame (inset 32px)
inner_inset = 32
x0, y0 = inner_inset, inner_inset
x1, y1 = W - inner_inset - 1, H - inner_inset - 1
d.rectangle([x0, y0, x1, y1], outline=FRAME_INNER, width=1)

# Corner marks (L-shapes at 23px from edges, 8px long, 1px wide)
arm = 8


def draw_corner(cx, cy, dx, dy):
    """Draw L-shaped corner mark. dx/dy = +1 or -1 for direction."""
    d.line([(cx, cy), (cx + dx * arm, cy)], fill=CORNER, width=1)
    d.line([(cx, cy), (cx, cy + dy * arm)], fill=CORNER, width=1)


# top-left
draw_corner(23, 23, 1, 1)
# top-right
draw_corner(W - 24, 23, -1, 1)
# bottom-left
draw_corner(23, H - 24, 1, -1)
# bottom-right
draw_corner(W - 24, H - 24, -1, -1)

# Dots (3px diameter circles)
r = 1  # radius for 3px dot


def dot(x, y, color):
    d.ellipse([x - r, y - r, x + r, y + r], fill=color)


dot(56, 80, DOT_FULL)       # dot-1: top-left area
dot(W - 56, H - 80, DOT_FULL)  # dot-2: bottom-right area
dot(W - 80, 56, DOT_DIM)   # dot-3: top-right area
dot(80, H - 56, DOT_DIM)   # dot-4: bottom-left area

out_path = "themes/white/home/wireframe_bg.png"
img.save(out_path)
print(f"Saved {out_path} ({W}x{H})")
