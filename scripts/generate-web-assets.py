import os
from PIL import Image, ImageDraw, ImageFilter, ImageFont

def ensure_dir(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)

def create_hero_cape_town(filename):
    width, height = 1600, 900
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)

    # Sky gradient: deep twilight blue to warm gold
    for y in range(height):
        t = y / height
        if t < 0.5:
            # Sky
            factor = t / 0.5
            r = int(26 * (1 - factor) + 214 * factor)
            g = int(36 * (1 - factor) + 138 * factor)
            b = int(74 * (1 - factor) + 60 * factor)
        else:
            # Ocean & coastline
            factor = (t - 0.5) / 0.5
            r = int(214 * (1 - factor) + 15 * factor)
            g = int(138 * (1 - factor) + 42 * factor)
            b = int(60 * (1 - factor) + 65 * factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Sun / Glow
    glow = Image.new("RGBA", (width, height), (0,0,0,0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse([1100, 200, 1500, 600], fill=(255, 220, 150, 100))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    img.paste(glow, (0, 0), glow)

    # Table Mountain silhouette
    mountain_pts = [
        (0, 520),
        (200, 480),
        (350, 420),
        (450, 310), # Table mountain left edge
        (500, 300), # Table top start
        (1000, 300), # Table top end
        (1080, 350), # Devil's peak / Lion's head slope
        (1150, 310),
        (1220, 400),
        (1400, 490),
        (1600, 510),
        (1600, 900),
        (0, 900)
    ]
    draw.polygon(mountain_pts, fill=(18, 24, 38))

    # Ocean reflections
    ocean = Image.new("RGBA", (width, height), (0,0,0,0))
    ocean_draw = ImageDraw.Draw(ocean)
    for i in range(12):
        y_pos = 550 + i * 25
        ocean_draw.rectangle([200 + i*30, y_pos, 1400 - i*20, y_pos + 6], fill=(255, 200, 120, 35 - i*2))
    ocean = ocean.filter(ImageFilter.GaussianBlur(10))
    img.paste(ocean, (0,0), ocean)

    ensure_dir(filename)
    img.save(filename, "WEBP", quality=92)
    print(f"Saved {filename}")

def create_cape_winelands(filename):
    width, height = 1600, 900
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)

    # Atmospheric wine country gradient (morning golden sun & verdant hills)
    for y in range(height):
        t = y / height
        if t < 0.45:
            # Soft morning sky
            r = int(245 - t * 80)
            g = int(230 - t * 60)
            b = int(200 - t * 90)
        else:
            # Verdant vines & golden hills
            factor = (t - 0.45) / 0.55
            r = int(140 - factor * 80)
            g = int(130 - factor * 70)
            b = int(50 - factor * 30)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Stellenbosch Mountain Backdrop
    mtn = [
        (0, 480), (180, 400), (380, 320), (520, 360),
        (700, 260), (880, 330), (1100, 240), (1350, 380),
        (1600, 440), (1600, 900), (0, 900)
    ]
    draw.polygon(mtn, fill=(60, 75, 55))

    # Rolling vineyard foreground
    hill1 = [(0, 520), (450, 460), (950, 550), (1600, 490), (1600, 900), (0, 900)]
    draw.polygon(hill1, fill=(85, 105, 50))

    hill2 = [(0, 620), (600, 560), (1200, 640), (1600, 580), (1600, 900), (0, 900)]
    draw.polygon(hill2, fill=(110, 130, 45))

    # Vineyard rows highlights
    rows = Image.new("RGBA", (width, height), (0,0,0,0))
    r_draw = ImageDraw.Draw(rows)
    for i in range(15):
        x1 = 200 + i * 80
        r_draw.line([(x1, 600), (x1 - 150, 900)], fill=(184, 115, 26, 60), width=4)
    img.paste(rows, (0,0), rows)

    ensure_dir(filename)
    img.save(filename, "WEBP", quality=92)
    print(f"Saved {filename}")

def create_atlantic_seaboard(filename):
    width, height = 1600, 900
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)

    # Crisp ocean sky and turquoise sea
    for y in range(height):
        t = y / height
        if t < 0.4:
            # Azure sky
            r = int(180 + t * 50)
            g = int(210 + t * 30)
            b = int(240 - t * 10)
        else:
            # Ocean gradient
            factor = (t - 0.4) / 0.6
            r = int(20 * (1-factor) + 10 * factor)
            g = int(140 * (1-factor) + 70 * factor)
            b = int(180 * (1-factor) + 110 * factor)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # 12 Apostles mountain coastline
    mtn = [
        (0, 400), (250, 310), (450, 360), (650, 270),
        (850, 340), (1100, 260), (1350, 350), (1600, 410),
        (1600, 900), (0, 900)
    ]
    draw.polygon(mtn, fill=(45, 60, 75))

    # Coastal cliff / beach headland
    headland = [(700, 480), (950, 430), (1200, 520), (1600, 460), (1600, 900), (700, 900)]
    draw.polygon(headland, fill=(80, 95, 75))

    # Sea spray / foam highlights
    foam = Image.new("RGBA", (width, height), (0,0,0,0))
    f_draw = ImageDraw.Draw(foam)
    for i in range(8):
        f_draw.ellipse([650 + i*100, 470 + i*20, 850 + i*100, 500 + i*20], fill=(255, 255, 255, 40))
    foam = foam.filter(ImageFilter.GaussianBlur(15))
    img.paste(foam, (0,0), foam)

    ensure_dir(filename)
    img.save(filename, "WEBP", quality=92)
    print(f"Saved {filename}")

def create_franschhoek_valley(filename):
    width, height = 1600, 900
    img = Image.new("RGB", (width, height))
    draw = ImageDraw.Draw(img)

    # Franschhoek valley sunset - plum, gold & warm earth
    for y in range(height):
        t = y / height
        if t < 0.5:
            # Sunset sky
            r = int(240 - t * 40)
            g = int(150 - t * 50)
            b = int(120 + t * 40)
        else:
            # Valley mist & mountain shadows
            factor = (t - 0.5) / 0.5
            r = int(75 - factor * 40)
            g = int(45 - factor * 25)
            b = int(60 - factor * 30)
        draw.line([(0, y), (width, y)], fill=(r, g, b))

    # Dramatic Franschhoek Mountains
    peaks = [
        (0, 420), (300, 220), (550, 360), (800, 190),
        (1050, 330), (1300, 240), (1600, 390), (1600, 900), (0, 900)
    ]
    draw.polygon(peaks, fill=(55, 35, 50))

    # Valley floor mist
    mist = Image.new("RGBA", (width, height), (0,0,0,0))
    m_draw = ImageDraw.Draw(mist)
    m_draw.rectangle([0, 440, 1600, 560], fill=(240, 200, 180, 70))
    mist = mist.filter(ImageFilter.GaussianBlur(35))
    img.paste(mist, (0,0), mist)

    # Foreground estate outline
    estate = [(0, 600), (400, 540), (900, 620), (1600, 570), (1600, 900), (0, 900)]
    draw.polygon(estate, fill=(40, 50, 35))

    ensure_dir(filename)
    img.save(filename, "WEBP", quality=92)
    print(f"Saved {filename}")

if __name__ == "__main__":
    create_hero_cape_town("public/images/hero/hero-cape-town-1600x900.webp")
    create_cape_winelands("public/images/journeys/cape-winelands-1600x900.webp")
    create_atlantic_seaboard("public/images/journeys/atlantic-seaboard-1600x900.webp")
    create_franschhoek_valley("public/images/journeys/franschhoek-valley-1600x900.webp")
