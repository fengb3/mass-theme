"""
验证 png_to_bin.py 输出与已有 BIN 文件是否一致

用法:
  python verify_bin.py
"""

import struct
from pathlib import Path
from PIL import Image

THEMES_DIR = Path(__file__).resolve().parents[1] / "themes" / "dark" / "home"


def read_bin_header(data: bytes):
    magic, w, h, frames, reserved = struct.unpack_from("<4sHHHH", data, 0)
    return magic.decode("ascii"), w, h, frames, reserved


def png_to_bin_data(png_path: Path, mode: str) -> bytes:
    img = Image.open(png_path).convert("RGBA")
    w, h = img.size

    if mode == "rgb565":
        magic = b"RGB5"
    else:
        magic = b"ARG8"

    header = struct.pack("<4sHHHH", magic, w, h, 1, 0)
    bin_data = bytearray(header)
    bin_data += struct.pack("<I", 100)

    pixels = img.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = pixels[x, y]
            if mode == "rgb565":
                rgb565 = ((r >> 3) << 11) | ((g >> 2) << 5) | (b >> 3)
                bin_data += struct.pack("<H", rgb565)
            else:
                bin_data += struct.pack("<BBBB", r, g, b, a)

    return bytes(bin_data)


def main():
    # 找到所有 PNG+BIN 对
    pairs = []
    for png_file in sorted(THEMES_DIR.glob("*.png")):
        bin_file = png_file.with_suffix(".bin")
        if bin_file.exists():
            pairs.append((png_file, bin_file))

    if not pairs:
        print(f"未找到 PNG+BIN 文件对: {THEMES_DIR}")
        return

    print(f"验证目录: {THEMES_DIR}")
    print(f"找到 {len(pairs)} 组文件\n")

    all_match = True
    for png_path, bin_path in pairs:
        existing = bin_path.read_bytes()
        magic, w, h, frames, _ = read_bin_header(existing)
        mode = "rgb565" if magic == "RGB5" else "argb8888"

        print(f"--- {bin_path.name} ---")
        print(f"  头部: magic={magic}, {w}x{h}, {frames}帧, mode={mode}")
        print(f"  文件大小: {len(existing)} bytes")

        # 用我们的代码生成
        generated = png_to_bin_data(png_path, mode)

        if len(generated) == len(existing):
            match = generated == existing
            if match:
                print(f"  [OK] 完全一致")
            else:
                # 找到第一个不同的字节
                for i in range(len(existing)):
                    if generated[i] != existing[i]:
                        print(f"  [FAIL] 不一致! 首个差异在偏移 0x{i:04X}")
                        print(f"     已有: {existing[i:i+16].hex(' ')}")
                        print(f"     生成: {generated[i:i+16].hex(' ')}")
                        break
                all_match = False
        else:
            print(f"  [FAIL] 大小不同! 已有={len(existing)}, 生成={len(generated)}")
            all_match = False

        print()

    if all_match:
        print("所有文件验证通过! [OK]")
    else:
        print("存在不一致 [FAIL] -- 需要检查差异")


if __name__ == "__main__":
    main()
