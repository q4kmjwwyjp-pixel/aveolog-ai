import zlib
import struct
import math

def create_png(width, height, draw_func, filename):
    # RGBA image buffer
    raw_data = bytearray()
    
    for y in range(height):
        raw_data.append(0) # filter byte 0 (None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([int(r), int(g), int(b), int(a)])
            
    # PNG signature
    png = b'\x89PNG\r\n\x1a\n'
    
    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    # IDAT chunk
    compressed_data = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed_data)
    png += struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('>I', idat_crc)
    
    # IEND chunk
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height})")

def aveo_icon_shader(x, y, w, h):
    # Normalized coords from -1 to 1
    nx = (x / w) * 2.0 - 1.0
    ny = (y / h) * 2.0 - 1.0
    dist = math.sqrt(nx * nx + ny * ny)
    
    # Rounded corner squircle for iOS icon
    corner_r = 0.22 # iOS icon corner radius ratio
    # Superellipse check: |x|^4.5 + |y|^4.5 <= 1
    p = 4.2
    in_squircle = (abs(nx)**p + abs(ny)**p) <= 0.95
    
    # Background gradient: deep obsidian slate #0a0e17 to #161f30
    bg_t = (ny + 1.0) / 2.0
    r_bg = int(10 + (22 - 10) * bg_t)
    g_bg = int(14 + (31 - 14) * bg_t)
    b_bg = int(23 + (48 - 23) * bg_t)
    
    # Subtly glow in center
    glow = max(0.0, 1.0 - dist * 1.1)
    r_bg = min(255, int(r_bg + 40 * glow))
    g_bg = min(255, int(g_bg + 25 * glow))
    b_bg = min(255, int(b_bg + 60 * glow))

    # Automotive emblem: Golden Bowtie / Wing shape with AI telemetry cyan accent
    # Central bowtie:
    # Golden bowtie bounds:
    # Horiz bar: y between -0.15 and 0.15, x between -0.55 and 0.55
    # Angled tips:
    is_gold = False
    
    # Draw Chevy Bowtie stylized
    # Central cross:
    # horizontal trapezoid: -0.55 <= nx <= 0.55 and -0.12 <= ny <= 0.12
    # vertical trapezoid: -0.18 <= nx <= 0.18 and -0.38 <= ny <= 0.38
    in_h = (abs(nx) <= 0.58) and (abs(ny) <= 0.14) and (abs(nx) * 0.15 + abs(ny) <= 0.18)
    in_v = (abs(nx) <= 0.20) and (abs(ny) <= 0.40)
    
    if in_h or in_v:
        is_gold = True

    # Outer metallic ring / gauge arc (like an RPM tachometer)
    is_gauge = False
    gauge_rad = 0.72
    gauge_thick = 0.04
    gauge_angle = math.atan2(ny, nx) # -pi to pi
    if abs(dist - gauge_rad) < gauge_thick and ny < 0.55:
        is_gauge = True

    if is_gold:
        # Metallic gold gradient #fbbf24 to #d97706
        gt = (ny + 0.4) / 0.8
        gr = int(245 - 30 * gt)
        gg = int(175 - 45 * gt)
        gb = int(35 + 20 * gt)
        return gr, gg, gb, 255
    elif is_gauge:
        # Cyan / amber neon tachometer line
        if nx > 0 and ny < 0: # redline zone
            return 239, 68, 68, 240 # crimson red
        else:
            return 6, 182, 212, 230 # cyan glow
    else:
        return r_bg, g_bg, b_bg, 255

if __name__ == '__main__':
    create_png(180, 180, aveo_icon_shader, '/data/data/com.termux/files/home/aveolog-ai/icons/apple-touch-icon.png')
    create_png(192, 192, aveo_icon_shader, '/data/data/com.termux/files/home/aveolog-ai/icons/icon-192.png')
    create_png(512, 512, aveo_icon_shader, '/data/data/com.termux/files/home/aveolog-ai/icons/icon-512.png')
