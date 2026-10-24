"""Crop the original phone screenshot to the intact certificate (no fabrication).

Source image: public/certificates/Cibersecurity.webp. The certificate fills
the screenshot width and occupies roughly 37%-73% of its height.
"""
from pathlib import Path
from PIL import Image

source = Path("public/certificates/Cibersecurity.webp")
destination = Path("public/certificates/ethical-hacking.webp")

with Image.open(source) as screenshot:
    picture = screenshot.convert("RGB")
    w, h = picture.size
    # The original screenshot has phone/browser chrome above the certificate
    # and gray margins below it. Crop inside those boundaries.
    top = round(h * 0.365)
    bottom = round(h * 0.735)
    if w < 200 or bottom - top < 140:
        raise ValueError(f"Unexpected cybersecurity screenshot dimensions: {w}x{h}")
    crop = picture.crop((0, top, w, bottom))
    crop.save(destination, format="WEBP", quality=93, method=6)
    print(f"Prepared {destination}: {crop.width}x{crop.height}")
