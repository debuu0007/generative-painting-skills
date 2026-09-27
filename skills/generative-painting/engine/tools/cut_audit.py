"""Cut audit: for every adjacent pair of shots, measure which of the six contrast
axes change, from each shot's lossless mid-frame anchor.

  G ground value      |ΔL*| of the modal (ground) colour > 12
  P palette/saturation ΔE of mean chroma-weighted a*b* > 12, or |Δ mean chroma| > 9
  D occupied density  |Δ fraction of non-ground pixels| > 0.15
  S subject scale     largest connected subject area changes by > 2.2× (or by > 0.18 of the frame)
  M mark organisation high-frequency energy ratio > 1.45, or |Δ orientation coherence| > 0.12
  C composition       mass-centroid distance > 0.12 of the frame, or |Δ spread| > 0.08

Thresholds are deliberately conservative ("perceptually obvious"). Usage:
  python3 tools/cut_audit.py <out/id> <film.js-shot-json>   (shot json written by the exporter manifest)
"""
import json, os, subprocess, sys
import numpy as np
from scipy import ndimage

def load(path, n):
    raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', path, '-vf', f'scale={n}:{n}:flags=area', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-'], capture_output=True, check=True).stdout
    return np.frombuffer(raw, np.uint8).reshape(n, n, 3).astype(np.float64)

def lab(rgb):
    c = rgb / 255
    c = np.where(c > 0.04045, ((c + 0.055) / 1.055) ** 2.4, c / 12.92)
    X = (c[..., 0] * 0.4124 + c[..., 1] * 0.3576 + c[..., 2] * 0.1805) / 0.95047
    Y = c[..., 0] * 0.2126 + c[..., 1] * 0.7152 + c[..., 2] * 0.0722
    Z = (c[..., 0] * 0.0193 + c[..., 1] * 0.1192 + c[..., 2] * 0.9505) / 1.08883
    f = lambda t: np.where(t > 0.008856, np.cbrt(t), 7.787 * t + 16 / 116)
    return np.stack([116 * f(Y) - 16, 500 * (f(X) - f(Y)), 200 * (f(Y) - f(Z))], -1)

def features(path):
    L = lab(load(path, 64)).reshape(-1, 3)
    q = np.round(L / 6)
    keys, counts = np.unique(q, axis=0, return_counts=True)
    ground = L[(q == keys[counts.argmax()]).all(1)].mean(0)
    occ = (np.linalg.norm(L - ground, axis=1) > 14).reshape(64, 64)
    lbl, n = ndimage.label(occ)
    largest = max((np.sum(lbl == i) for i in range(1, n + 1)), default=0) / occ.size
    ys, xs = np.nonzero(occ)
    cen = np.array([xs.mean(), ys.mean()]) / 64 if len(xs) else np.array([0.5, 0.5])
    spread = float(np.sqrt(((xs / 64 - cen[0]) ** 2 + (ys / 64 - cen[1]) ** 2).mean())) if len(xs) else 0.0
    chroma = np.hypot(L[:, 1], L[:, 2])
    w = chroma + 1e-6
    ab = np.array([(L[:, 1] * w).sum() / w.sum(), (L[:, 2] * w).sum() / w.sum()])
    # Mark organisation from a 300-px luminance image: high-frequency energy + orientation coherence.
    Y = lab(load(path, 300))[..., 0]
    hf = float(np.abs(ndimage.laplace(Y)).mean())
    gx = ndimage.sobel(Y, 1); gy = ndimage.sobel(Y, 0)
    jxx = ndimage.gaussian_filter(gx * gx, 3).mean(); jyy = ndimage.gaussian_filter(gy * gy, 3).mean(); jxy = ndimage.gaussian_filter(gx * gy, 3).mean()
    coh = float(np.sqrt((jxx - jyy) ** 2 + 4 * jxy ** 2) / (jxx + jyy + 1e-9))
    return dict(groundL=float(ground[0]), ab=ab.tolist(), chroma=float(chroma.mean()), density=float(occ.mean()), largest=float(largest), centroid=cen.tolist(), spread=spread, hf=hf, coherence=coh)

def axes(a, b):
    out = {}
    out['G'] = abs(a['groundL'] - b['groundL']) > 12
    out['P'] = np.hypot(a['ab'][0] - b['ab'][0], a['ab'][1] - b['ab'][1]) > 12 or abs(a['chroma'] - b['chroma']) > 9
    out['D'] = abs(a['density'] - b['density']) > 0.15
    la, lb = max(a['largest'], 0.004), max(b['largest'], 0.004)
    out['S'] = max(la, lb) / min(la, lb) > 2.2 or abs(la - lb) > 0.18
    out['M'] = max(a['hf'], b['hf']) / max(1e-6, min(a['hf'], b['hf'])) > 1.45 or abs(a['coherence'] - b['coherence']) > 0.12
    out['C'] = np.hypot(a['centroid'][0] - b['centroid'][0], a['centroid'][1] - b['centroid'][1]) > 0.12 or abs(a['spread'] - b['spread']) > 0.08
    return out

def main():
    out = sys.argv[1]
    manifest = json.load(open(os.path.join(out, 'manifest.json')))
    shots = manifest['shots']
    anchors = sorted(os.listdir(os.path.join(out, 'anchors')))
    feats = {}
    for s in shots:
        f = next(a for a in anchors if a.startswith(f"{s['shot']}-"))
        feats[s['shot']] = features(os.path.join(out, 'anchors', f))
    rows = []
    for a, b in zip(shots, shots[1:]):
        ax = axes(feats[a['shot']], feats[b['shot']])
        changed = [k for k, v in ax.items() if v]
        kind = 'loop' if b.get('repeatOf') == shots[0]['shot'] else 'hero-crop' if b.get('crop') else 'ordinary'
        ok = len(changed) >= 3 if kind == 'ordinary' else True
        rows.append({'cut': f"{a['shot']}→{b['shot']}", 'kind': kind, 'changed': ''.join(changed), 'count': len(changed), 'ok': ok})
        print(f"{a['shot']}→{b['shot']}  {kind:9s} {''.join(changed):7s} {len(changed)}  {'ok' if ok else 'WEAK'}")
    res = {'thresholds': __doc__.split('\n\n')[0], 'features': feats, 'cuts': rows, 'weak': [r['cut'] for r in rows if not r['ok']]}
    json.dump(res, open(os.path.join(out, 'cut-audit.json'), 'w'), indent=1)
    print('weak ordinary cuts:', res['weak'] or 'none')

main()
