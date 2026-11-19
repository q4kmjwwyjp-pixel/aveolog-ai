import zlib
import struct
import math

def create_png(width, height, draw_func, filename):
    raw_data = bytearray()
    for y in range(height):
        raw_data.append(0)  # filter type 0 (None)
        for x in range(width):
            r, g, b, a = draw_func(x, y, width, height)
            raw_data.extend([int(r), int(g), int(b), int(a)])
            
    png = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr_crc = zlib.crc32(b'IHDR' + ihdr_data)
    png += struct.pack('>I', len(ihdr_data)) + b'IHDR' + ihdr_data + struct.pack('>I', ihdr_crc)
    
    compressed_data = zlib.compress(bytes(raw_data), 9)
    idat_crc = zlib.crc32(b'IDAT' + compressed_data)
    png += struct.pack('>I', len(compressed_data)) + b'IDAT' + compressed_data + struct.pack('>I', idat_crc)
    
    iend_crc = zlib.crc32(b'IEND')
    png += struct.pack('>I', 0) + b'IEND' + struct.pack('>I', iend_crc)
    
    with open(filename, 'wb') as f:
        f.write(png)
    print(f"Generated {filename} ({width}x{height})")

def point_in_chevy(u, v):
    # u, v centered in [-1, 1], normalized coords
    # Main bowtie:
    # Crossbeam horizontal:
    # v between -0.13 and +0.13
    # slant edge: x at v=-0.13 is -0.66 to 0.66, at v=0.13 is -0.58 to 0.58 (or vice versa)
    # Chevrolet bowtie geometry:
    # Horizontal bar: |v| <= 0.125 and |u - v * 0.3| <= 0.62
    # Vertical bar: |u + v * 0.14| <= 0.20 and |v| <= 0.42
    
    # Accurate geometry:
    # Horizontal crossbar:
    in_horiz = (abs(v) <= 0.125) and (abs(u - v * 0.32) <= 0.64)
    # Vertical beam:
    in_vert = (abs(u + v * 0.14) <= 0.20) and (abs(v) <= 0.41)
    return in_horiz or in_vert

def point_in_chevy_inset(u, v):
    in_horiz = (abs(v) <= 0.08) and (abs(u - v * 0.32) <= 0.54)
    in_vert = (abs(u + v * 0.14) <= 0.15) and (abs(v) <= 0.35)
    return in_horiz or in_vert

def chevy_icon_shader(x, y, w, h):
    # Normalization: [-1, 1]
    u = (x / w) * 2.0 - 1.0
    v = (y / h) * 2.0 - 1.0
    r_dist = math.sqrt(u * u + v * v)

    # Background: Radial deep titanium luxury black #161c26 to #05070a
    bg_t = min(1.0, r_dist / 1.3)
    r_bg = 24.0 * (1.0 - bg_t) + 5.0 * bg_t
    g_bg = 30.0 * (1.0 - bg_t) + 7.0 * bg_t
    b_bg = 42.0 * (1.0 - bg_t) + 10.0 * bg_t

    # Subtle ambient warm glow behind emblem
    if r_dist < 0.75:
        glow = math.exp(-3.5 * r_dist * r_dist) * 0.28
        r_bg += 212.0 * glow
        g_bg += 154.0 * glow
        b_bg += 36.0 * glow

    # Caliper ring: thin precision outer ring at radius 0.88
    if abs(r_dist - 0.88) < 0.008:
        ring_alpha = 0.22
        r_bg = r_bg * (1.0 - ring_alpha) + 255.0 * ring_alpha
        g_bg = g_bg * (1.0 - ring_alpha) + 255.0 * ring_alpha
        b_bg = b_bg * (1.0 - ring_alpha) + 255.0 * ring_alpha

    # Dotted index ring at radius 0.76
    if abs(r_dist - 0.76) < 0.005:
        angle = math.atan2(v, u)
        if math.sin(angle * 36) > 0.3:
            r_bg = min(255.0, r_bg + 18.0)
            g_bg = min(255.0, g_bg + 20.0)
            b_bg = min(255.0, b_bg + 25.0)

    # Check Chevy Bowtie
    in_emblem = point_in_chevy(u, v)
    
    if in_emblem:
        in_inset = point_in_chevy_inset(u, v)
        
        # Base metallic gold gradient: top light #ffeb99, mid #d99b26, bottom #8c5608
        grad_t = (v + 0.42) / 0.84
        grad_t = max(0.0, min(1.0, grad_t))
        
        # Specular light streak along diagonal (luxury satin brushed metal effect)
        diag_spec = math.exp(-12.0 * (u * 0.7 + v * 0.7 + 0.08)**2) * 0.45
        
        if in_inset:
            # Chiseled bevel face
            # Light from top-left:
            facet_light = 0.85 - 0.45 * grad_t + diag_spec
            gr = 245.0 * facet_light + 45.0
            gg = 185.0 * facet_light + 30.0
            gb = 50.0 * facet_light + 10.0
        else:
            # Outer chrome-gold border rim
            rim_light = 0.95 - 0.35 * grad_t + diag_spec * 0.8
            gr = 255.0 * rim_light
            gg = 205.0 * rim_light
            gb = 75.0 * rim_light

        # Subtle bevel edge contrast
        return min(255, int(gr)), min(255, int(gg)), min(255, int(gb)), 255

    # Drop shadow below emblem
    shadow_v = v - 0.04
    if point_in_chevy(u, shadow_v):
        r_bg *= 0.55
        g_bg *= 0.55
        b_bg *= 0.55

    return min(255, int(r_bg)), min(255, int(g_bg)), min(255, int(b_bg)), 255

if __name__ == '__main__':
    create_png(180, 180, chevy_icon_shader, '/data/data/com.termux/files/home/aveolog-ai/icons/apple-touch-icon.png')
    create_png(192, 192, chevy_icon_shader, '/data/data/com.termux/files/home/aveolog-ai/icons/icon-192.png')
    create_png(512, 512, chevy_icon_shader, '/data/data/com.termux/files/home/aveolog-ai/icons/icon-512.png')
