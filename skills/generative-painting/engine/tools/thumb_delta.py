"""Broad-value / palette fidelity: mean CIE76 ΔE between original and pointillist plates at thumbnail
scale (24×24 area-average), plus mean lightness difference (pointillist − original). Lower is closer.
Usage: python3 tools/thumb_delta.py out/<id>  [ids...]"""
import subprocess, sys, os, json, math
def thumb(path, n=24):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={n}:{n}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    return [tuple(raw[i:i + 3]) for i in range(0, len(raw), 3)]
def lab(c):
    def f(u):
        u /= 255; return ((u + 0.055) / 1.055) ** 2.4 if u > 0.04045 else u / 12.92
    r, g, b = map(f, c)
    x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047; y = 0.2126 * r + 0.7152 * g + 0.0722 * b; z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883
    g3 = lambda t: t ** (1 / 3) if t > 0.008856 else 7.787 * t + 16 / 116
    return (116 * g3(y) - 16, 500 * (g3(x) - g3(y)), 200 * (g3(y) - g3(z)))
out = sys.argv[1]; ids = sys.argv[2:] or sorted(p[:-4] for p in os.listdir(os.path.join(out, 'plates')))
rows = {}
for i in ids:
    a = thumb(os.path.join(out, 'originals', i + '.png')); b = thumb(os.path.join(out, 'plates', i + '.png'))
    la = [lab(c) for c in a]; lb = [lab(c) for c in b]
    de = sum(math.dist(p, q) for p, q in zip(la, lb)) / len(la); dl = sum(q[0] - p[0] for p, q in zip(la, lb)) / len(la)
    rows[i] = {'deltaE': round(de, 2), 'dL': round(dl, 2)}
    print(f'{i:22s} ΔE {de:6.2f}   ΔL {dl:+6.2f}')
json.dump(rows, open(os.path.join(out, 'plates-thumb-delta.json'), 'w'), indent=1)
