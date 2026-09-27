/** Geometry capture for the pointillist translation.
 *
 * `createRecorder(p, brush)` returns a proxy with the same API as p5.brush. Every call is logged
 * and then forwarded, unchanged and in the same order, to the real brush. The original watercolour
 * therefore paints exactly as before (same arguments, same random consumption), and its pixels can
 * be hash-compared with the original film's plate to prove the capture changed nothing.
 *
 * The log is a flat list of drawing operations in 0..600 logical coordinates: every shape, circle,
 * rect, arc, line, spline, flow line and freehand stroke, with the active fill / wash / hatch /
 * stroke state and the p5 transform already applied. The pointillist renderer replays it in order,
 * so object inventory, placement, silhouettes and layer order are the source's own.
 *
 * Nothing here calls p.random or any seeded generator. */

const IDENT = () => [1, 0, 0, 1, 0, 0]; // a, b, c, d, e, f  (x' = a x + c y + e, y' = b x + d y + f)
const mul = (m, n) => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];

export function createRecorder(p, brush) {
  const ops = [];
  const log = { ops, background: null, calls: 0 };
  let m = IDENT(); const stack = [];
  // p5 WEBGL puts the origin at the centre; scenes translate(-w/2, -h/2). Canvas = M·pt + (w/2, h/2).
  const pt = (x, y) => [m[0] * x + m[2] * y + m[4] + p.width / 2, m[1] * x + m[3] * y + m[5] + p.height / 2];
  const scaleOf = () => Math.sqrt(Math.abs(m[0] * m[3] - m[1] * m[2]));
  const rotOf = () => (Math.atan2(m[1], m[0]) * 180) / Math.PI;

  // ---- p5 transform tracking (wrap the instance methods the scenes use) ----
  const wrapP = (name, fn) => { const orig = p[name].bind(p); p[name] = (...a) => { fn(...a); return orig(...a); }; };
  const deg = (a) => (p._angleMode === 'radians' || p.angleMode?.() === 'radians' ? (a * 180) / Math.PI : a);
  wrapP('push', () => stack.push(m.slice()));
  wrapP('pop', () => { m = stack.pop() || IDENT(); });
  wrapP('translate', (x, y) => { m = mul(m, [1, 0, 0, 1, x, y || 0]); });
  wrapP('rotate', (a) => { const r = (deg(a) * Math.PI) / 180; m = mul(m, [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0]); });
  wrapP('scale', (sx, sy = sx) => { m = mul(m, [sx, 0, 0, sy, 0, 0]); });
  wrapP('resetMatrix', () => { m = IDENT(); });
  wrapP('background', (...a) => { if (log.background === null) log.background = typeof a[0] === 'string' ? a[0] : a; });
  log.resetFrame = () => { m = IDENT(); stack.length = 0; };

  // ---- brush state ----
  const st = { fill: null, bleed: 0, bleedDir: 'out', texture: 0.4, border: 0.4, wash: null, hatch: null, hatchStyle: { brush: 'HB', color: 'black', weight: 1 }, stroke: null, field: null };
  const snap = () => ({
    fill: st.fill && { ...st.fill, bleed: st.bleed, bleedDir: st.bleedDir, texture: st.texture, border: st.border },
    wash: st.wash && { ...st.wash },
    hatch: st.hatch && { ...st.hatch, ...st.hatchStyle },
    stroke: st.stroke && { ...st.stroke },
    field: st.field,
  });
  const emit = (op) => { ops.push({ ...op, ...snap(), i: ops.length, scale: scaleOf(), rot: rotOf() }); };
  let shape = null; let freehand = null;

  const handlers = {
    set: (name, color, weight = 1) => { st.stroke = { brush: name, color, weight }; },
    noStroke: () => { st.stroke = null; },
    fill: (color, alpha = 255) => { st.fill = { color, alpha }; },
    fillBleed: (b, dir = 'out') => { st.bleed = b; st.bleedDir = dir; },
    fillTexture: (t = 0.4, b = 0.4) => { st.texture = t; st.border = b; },
    noFill: () => { st.fill = null; },
    wash: (color, alpha = 255) => { st.wash = { color, alpha }; },
    noWash: () => { st.wash = null; },
    hatch: (dist = 5, angle = 45, opts = {}) => { st.hatch = { dist, angle, rand: opts.rand || 0, gradient: opts.gradient || 0 }; },
    hatchStyle: (b, color = 'black', weight = 1) => { st.hatchStyle = { brush: b, color, weight }; },
    noHatch: () => { st.hatch = null; },
    field: (name) => { st.field = name; },
    noField: () => { st.field = null; },
    beginShape: (curv = 0) => { shape = { curv: Math.max(0, Math.min(1, curv)), pts: [] }; },
    vertex: (x, y) => { if (shape) shape.pts.push(pt(x, y)); },
    endShape: (close = false) => { if (shape && shape.pts.length > 1) emit({ type: 'shape', pts: shape.pts, curv: shape.curv, closed: !!close }); shape = null; },
    rect: (x, y, w, h, mode = 'corner') => {
      if (mode === 'center') { x -= w / 2; y -= h / 2; }
      emit({ type: 'shape', pts: [pt(x, y), pt(x + w, y), pt(x + w, y + h), pt(x, y + h)], curv: 0, closed: true, rect: true });
    },
    circle: (x, y, r, irr = false) => { emit({ type: 'circle', c: pt(x, y), r: r * scaleOf(), irr: irr || 0 }); },
    arc: (x, y, r, a0, a1) => { emit({ type: 'arc', c: pt(x, y), r: r * scaleOf(), a0: a0 - rotOf(), a1: a1 - rotOf() }); },
    line: (x1, y1, x2, y2) => { emit({ type: 'path', pts: [pt(x1, y1), pt(x2, y2)], curv: 0 }); },
    spline: (pts, curv = 0.5) => { emit({ type: 'path', pts: pts.map((q) => pt(q[0], q[1])), curv }); },
    flowLine: (x, y, len, dir) => { emit({ type: 'flow', c: pt(x, y), len: len * scaleOf(), dir: dir - rotOf() }); },
    beginStroke: (type, x, y) => { freehand = { type, start: pt(x, y), segs: [] }; },
    move: (a, len) => { if (freehand) freehand.segs.push([a - rotOf(), len * scaleOf()]); },
    endStroke: () => {
      if (!freehand) return;
      // Plot convention (y up): each segment advances by (cos a, -sin a) · length.
      let [x, y] = freehand.start; const pts = [[x, y]];
      for (const [a, len] of freehand.segs) { const r = (a * Math.PI) / 180; x += Math.cos(r) * len; y -= Math.sin(r) * len; pts.push([x, y]); }
      emit({ type: 'path', pts, curv: freehand.type === 'curve' ? 0.6 : 0, freehand: true });
      freehand = null;
    },
  };

  const proxy = {};
  for (const key of Object.keys(brush)) {
    const v = brush[key];
    if (typeof v !== 'function') { Object.defineProperty(proxy, key, { get: () => brush[key], enumerable: true }); continue; }
    proxy[key] = (...args) => {
      log.calls++;
      if (handlers[key]) handlers[key](...args);
      return v.apply(brush, args);
    };
  }
  return { proxy, log };
}
