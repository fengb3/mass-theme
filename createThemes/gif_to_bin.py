# convert_gif_to_bin.py
from PIL import Image, ImageSequence
import struct, sys, argparse
import numpy as np

def detect_has_alpha(frame_rgba):
    # 检测是否存在透明像素
    for _, _, _, a in frame_rgba.getdata():
        if a < 255:
            return True
    return False

def rgb888_to_rgb565_with_dither(rgba_image):
    """
    使用 Floyd-Steinberg 抖动算法将 RGBA 图像转换为 RGB565
    抖动算法可以显著改善渐变色的显示效果，避免明显的色带
    """
    w, h = rgba_image.size
    # 转为 numpy 数组（float32 以便累加误差）
    pixels = np.array(rgba_image, dtype=np.float32)
    
    output = bytearray()
    
    for y in range(h):
        for x in range(w):
            old_r, old_g, old_b, a = pixels[y, x]
            
            # 量化到 RGB565（截断低位）
            new_r = int(old_r) & 0xF8  # 保留高 5 位
            new_g = int(old_g) & 0xFC  # 保留高 6 位
            new_b = int(old_b) & 0xF8  # 保留高 5 位
            
            # 计算量化误差
            err_r = old_r - new_r
            err_g = old_g - new_g
            err_b = old_b - new_b
            
            # Floyd-Steinberg 误差扩散矩阵：
            #          X    7/16
            #    3/16 5/16 1/16
            # 将误差分散到相邻未处理的像素
            if x + 1 < w:
                pixels[y, x + 1, 0] = np.clip(pixels[y, x + 1, 0] + err_r * 7 / 16, 0, 255)
                pixels[y, x + 1, 1] = np.clip(pixels[y, x + 1, 1] + err_g * 7 / 16, 0, 255)
                pixels[y, x + 1, 2] = np.clip(pixels[y, x + 1, 2] + err_b * 7 / 16, 0, 255)
            
            if y + 1 < h:
                if x > 0:
                    pixels[y + 1, x - 1, 0] = np.clip(pixels[y + 1, x - 1, 0] + err_r * 3 / 16, 0, 255)
                    pixels[y + 1, x - 1, 1] = np.clip(pixels[y + 1, x - 1, 1] + err_g * 3 / 16, 0, 255)
                    pixels[y + 1, x - 1, 2] = np.clip(pixels[y + 1, x - 1, 2] + err_b * 3 / 16, 0, 255)
                
                pixels[y + 1, x, 0] = np.clip(pixels[y + 1, x, 0] + err_r * 5 / 16, 0, 255)
                pixels[y + 1, x, 1] = np.clip(pixels[y + 1, x, 1] + err_g * 5 / 16, 0, 255)
                pixels[y + 1, x, 2] = np.clip(pixels[y + 1, x, 2] + err_b * 5 / 16, 0, 255)
                
                if x + 1 < w:
                    pixels[y + 1, x + 1, 0] = np.clip(pixels[y + 1, x + 1, 0] + err_r * 1 / 16, 0, 255)
                    pixels[y + 1, x + 1, 1] = np.clip(pixels[y + 1, x + 1, 1] + err_g * 1 / 16, 0, 255)
                    pixels[y + 1, x + 1, 2] = np.clip(pixels[y + 1, x + 1, 2] + err_b * 1 / 16, 0, 255)
            
            # 转换为 RGB565（小端）
            rgb565 = ((new_r << 8) & 0xF800) | ((new_g << 3) & 0x07E0) | (new_b >> 3)
            output += struct.pack("<H", rgb565)
    
    return output

def gif_to_bin(gif_path, out_path, force_rgb565=False, force_argb8888=False, enable_dither=True):
    im = Image.open(gif_path)  # 不要提前 convert，否则会变成静态图
    w, h = im.size
    frames = []
    delays = []
    has_alpha = False

    for f in ImageSequence.Iterator(im):
        rgba = f.convert("RGBA")  # 每帧单独转换

        # 帧间隔（读不到默认100ms）
        original_delay = f.info.get("duration", 100)
        delays.append(original_delay)

        # 首先检测透明度
        if not has_alpha:
            # GIF 帧 info 里有 transparency 字段也视为有 alpha
            if f.info.get("transparency") is not None or detect_has_alpha(rgba):
                has_alpha = True

        frames.append(rgba)

    # 选择输出格式：若有透明且未强制 565，则用 ARGB8888；否则 RGB565
    if force_argb8888:
        use_argb8888 = True
    elif force_rgb565:
        use_argb8888 = False
    else:
        use_argb8888 = has_alpha

    magic = b"ARG8" if use_argb8888 else b"RGB5"
    bpp = 4 if use_argb8888 else 2

    # 编码帧像素
    encoded_frames = []
    for rgba in frames:
        buf = bytearray()
        if use_argb8888:
            # 小端：B,G,R,A（与常见 ARGB8888 一致，C 端按 byte 对齐读）
            for r, g, b, a in rgba.getdata():
                buf += struct.pack("<BBBB", b, g, r, a)
        else:
            # RGB565：使用抖动算法改善渐变效果
            if enable_dither:
                buf = rgb888_to_rgb565_with_dither(rgba)
            else:
                # 旧方法：直接截断（会产生明显色带）
                for r, g, b, a in rgba.getdata():
                    rgb565 = ((r & 0xF8) << 8) | ((g & 0xFC) << 3) | (b >> 3)
                    buf += struct.pack("<H", rgb565)  # 小端
        encoded_frames.append(buf)

    # 输出格式：magic(4) + w(2) + h(2) + frame_cnt(2) + reserved(2)
    with open(out_path, "wb") as f:
        f.write(magic)
        f.write(struct.pack("<HHH", w, h, len(encoded_frames)))
        f.write(struct.pack("<H", 0))  # reserved
        # 每帧：delay_ms(2) + padding(2) + 像素数据
        for delay, frame in zip(delays, encoded_frames):
            f.write(struct.pack("<HH", delay, 0))
            f.write(frame)

    total_bytes = sum(len(fr) for fr in encoded_frames)
    print(f"done: {gif_path} -> {out_path}")
    print(f"  size: {w}x{h}, frames={len(encoded_frames)}, format={'ARGB8888' if use_argb8888 else 'RGB565'}, bytes_per_px={bpp}")
    print(f"  has_alpha_detected={has_alpha}, forced_rgb565={force_rgb565}, forced_argb8888={force_argb8888}")
    if not use_argb8888:
        print(f"  dithering: {'enabled (Floyd-Steinberg)' if enable_dither else 'disabled'}")
    if delays:
        print(f"  frame delays: {delays} ms (avg: {sum(delays)/len(delays):.1f} ms/frame)")
    print(f"  payload bytes (all frames): {total_bytes}")

def main():
    parser = argparse.ArgumentParser(description="Convert GIF/PNG to BIN (RGB565 or ARGB8888 auto).")
    parser.add_argument("input", help="input GIF/PNG file")
    parser.add_argument("output", help="output BIN file")
    parser.add_argument("--force-rgb565", action="store_true", help="force RGB565 even if alpha exists")
    parser.add_argument("--force-argb8888", action="store_true", help="force ARGB8888")
    parser.add_argument("--no-dither", action="store_true", help="disable dithering (Floyd-Steinberg) for RGB565")
    args = parser.parse_args()

    gif_to_bin(args.input, args.output, 
               force_rgb565=args.force_rgb565, 
               force_argb8888=args.force_argb8888,
               enable_dither=not args.no_dither)

if __name__ == "__main__":
    main()