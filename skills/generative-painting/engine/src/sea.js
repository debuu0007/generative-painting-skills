/** Ocean subjects built on the collision kit. Every function returns point lists (world coords,
 * angles in DEGREES) or paints through the kit, so the materials — glaze, reserve, contour,
 * hatch, stipple — are shared; only the subjects change.
 * All randomness goes through the kit (seeded by the plate). */
export function createSea(k, brush) {
  const { R, G, polar, rad } = k;
  const toWorld = (x, y, angle, local) => {
    const c = Math.cos(rad(angle)); const s = Math.sin(rad(angle));
    return local.map(([lx, ly]) => [x + lx * c - ly * s, y + lx * s + ly * c]);
  };

  /** Fish centred at (x, y), nose pointing along `angle`. Returns body/tail/fin outlines + eye. */
  function fish(x, y, angle, len, height, o = {}) {
    const asym = o.asym ?? R(0.05, 0.2); // deeper back than belly
    const ped = height * (o.peduncle ?? 0.09);
    const n = o.n ?? 24;
        // Body: elliptical rounded head to the widest point, then a smooth taper to the peduncle.
    const widest = o.widest ?? R(0.3, 0.4);
    const top = []; const bottom = [];
    for (let i = 0; i <= n; i++) {
      const u = i / n;
      const head = Math.sqrt(Math.max(0, 1 - Math.pow((u - widest) / widest, 2)));
      const t = (u - widest) / (1 - widest);
      const taper = ped / (height / 2) + (1 - ped / (height / 2)) * Math.pow(Math.cos((Math.PI / 2) * t), 1.15);
      const hw = (height / 2) * (u < widest ? head : taper);
      const lx = len * 0.5 - u * len * 0.78;
      top.push([lx + G(0, len * 0.003), -hw * (1 + asym) + G(0, height * 0.006)]);
      bottom.push([lx + G(0, len * 0.003), hw * (1 - asym * 0.6) + G(0, height * 0.006)]);
    }
    const body = toWorld(x, y, angle, top.concat(bottom.reverse()));
    // Tail: one forked outline from the peduncle (upper lobe, notch, lower lobe).
    const tl = len * (o.tail ?? R(0.2, 0.3)); const th = height * (o.tailSpread ?? R(0.38, 0.55));
    const fork = o.fork ?? R(0.3, 0.6);
    const px = -len * 0.28 + 2;
    const tailLocal = [
      [px, -ped], [px - tl * 0.35, -th * 0.45], [px - tl * 0.75, -th * 0.85], [px - tl, -th + G(0, 1.5)],
      [px - tl * (1 - fork * 0.35), -th * 0.35], [px - tl * (1 - fork * 0.55), 0],
      [px - tl * (1 - fork * 0.35), th * 0.35], [px - tl, th + G(0, 1.5)], [px - tl * 0.75, th * 0.85], [px - tl * 0.35, th * 0.45], [px, ped],
    ];
    const tail = toWorld(x, y, angle, tailLocal);
    const [ex, ey] = toWorld(x, y, angle, [[len * 0.33, -height * 0.08]])[0];
    const dorsal = k.petalOutline(...toWorld(x, y, angle, [[len * 0.05, -height * 0.46]])[0], angle + 180 - (o.dorsalLift ?? R(35, 60)), len * (o.dorsal ?? R(0.3, 0.45)), height * 0.28, { base: 0.5, widest: 0.25, bend: -0.25 });
    const anal = k.petalOutline(...toWorld(x, y, angle, [[-len * 0.08, height * 0.36]])[0], angle + 180 + R(25, 45), len * R(0.18, 0.28), height * 0.2, { base: 0.5, widest: 0.3, bend: 0.2 });
    const pectoral = k.petalOutline(...toWorld(x, y, angle, [[len * 0.18, height * 0.1]])[0], angle + 180 + R(20, 40), len * R(0.18, 0.26), height * 0.16, { base: 0.2, widest: 0.4 });
    const gill = toWorld(x, y, angle, [[len * 0.24, -height * 0.34], [len * 0.2, -height * 0.05], [len * 0.23, height * 0.28]]);
    const stripe = (at, w = 0.08) => toWorld(x, y, angle, [[len * at, -height * 0.55], [len * (at - w), 0], [len * at, height * 0.55], [len * (at + w * 0.6), height * 0.55], [len * (at - w * 0.4), 0], [len * (at + w * 0.6), -height * 0.55]]);
    return { body, tail, dorsal, anal, pectoral, gill, eye: [ex, ey], eyeR: height * 0.07, stripe, x, y, angle, len, height };
  }

  /** Paint a fish: reserve (for dark grounds) + glazes + fins + broken contour + eye. */
  function paintFish(f, o = {}) {
    const cols = o.colors ?? ['#e0542f', '#f28c28'];
    const fins = [f.tail, f.dorsal, f.anal, f.pectoral];
    for (const fin of fins) {
      if (o.reserve) k.reserve(fin, o.finReserve ?? o.reserve, o.reserveAlpha ?? 230, 0.5, 2);
      k.glaze(fin, o.fin ?? cols[1 % cols.length], o.finAlpha ?? 140, { bleed: 0.3, texture: 0.8, border: 0.6 });
      if (o.finRays !== false) {
        const [cx, cy] = k.centroid(fin);
        for (let i = 0; i < 4; i++) {
          const q = fin[Math.floor(R(fin.length))];
          k.line(cx + (q[0] - cx) * 0.1, cy + (q[1] - cy) * 0.1, cx + (q[0] - cx) * 0.9, cy + (q[1] - cy) * 0.9, { brush: '2H', color: o.ray ?? o.ink ?? '#3a2f28', weight: 0.2 });
        }
      }
    }
    if (o.reserve) k.reserve(f.body, o.reserve, o.reserveAlpha ?? 245, 0.5, 3);
    k.glaze(f.body, cols[0], o.alpha ?? 175, { bleed: o.bleed ?? 0.18, texture: 0.85, border: 0.75 });
    if (cols[1]) k.glaze(k.shrink(k.wobble(f.body, 1.5), R(0.55, 0.8), ...k.centroid(f.body)), cols[1], (o.alpha ?? 175) * 0.8, { bleed: 0.3, texture: 0.8 });
    if (o.belly) {
      const b = f.body.slice(Math.floor(f.body.length / 2));
      k.glaze(k.shrink(b, 0.8, f.x, f.y), o.belly, 120, { bleed: 0.35, texture: 0.6 });
    }
    if (o.stripes) for (const at of o.stripes) k.glaze(f.stripe(at, o.stripeW ?? 0.07), o.stripeColor ?? '#fff6e8', o.stripeAlpha ?? 200, { bleed: 0.1, texture: 0.5 });
    if (o.scales) scaleArcs(f, { color: o.scales, brush: 'HB', weight: 0.25 });
    if (o.spots) for (let i = 0; i < o.spots; i++) {
      const [sx, sy] = k.centroid(f.body);
      const q = [sx + G(0, f.len * 0.16), sy + G(0, f.height * 0.16)];
      brush.noStroke(); brush.noFill(); brush.wash(o.spotColor ?? '#2a1a14', 200); brush.circle(q[0], q[1], R(0.8, f.height * 0.035), 0.3); brush.noWash();
    }
    if (o.contour !== false) {
      k.contour(f.body, { brush: o.contourBrush ?? 'pen', color: o.ink ?? '#3a2f28', weight: o.contourWeight ?? 0.45, open: o.open ?? 0.8, jitter: 0.8 });
      k.contour(f.tail, { brush: 'HB', color: o.ink ?? '#3a2f28', weight: 0.3, open: 0.85, jitter: 0.6 });
      for (const fin of [f.dorsal, f.anal, f.pectoral]) k.contour(fin, { brush: 'HB', color: o.ink ?? '#3a2f28', weight: 0.25, open: 0.7, jitter: 0.5 });
      brush.noFill(); brush.set('HB', o.ink ?? '#3a2f28', 0.35); brush.spline(f.gill, 0.6);
    }
    const [ex, ey] = f.eye;
    brush.noStroke(); brush.noFill();
    brush.wash(o.eyeRing ?? '#f7f1e3', 240); brush.circle(ex, ey, f.eyeR * 1.35, 0.1);
    brush.wash(o.eye ?? '#120b08', 255); brush.circle(ex, ey, f.eyeR * 0.8, 0.1);
    brush.wash('#ffffff', 230); brush.circle(ex + f.eyeR * 0.25, ey - f.eyeR * 0.25, Math.max(0.6, f.eyeR * 0.22), 0.1);
    brush.noWash();
  }

  /** Fish scales as rows of small arcs inside the body (engraving/field-guide texture). */
  function scaleArcs(f, o = {}) {
    const inside = (px, py, poly) => {
      let c = false;
      for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
        const [xi, yi] = poly[i]; const [xj, yj] = poly[j];
        if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) c = !c;
      }
      return c;
    };
    const step = o.step ?? Math.max(4, f.height * 0.075);
    const inner = k.shrink(f.body, 0.9, f.x, f.y);
    brush.noFill();
    brush.set(o.brush ?? 'rotring', o.color ?? '#2a1c13', o.weight ?? 0.18);
    for (let lx = -f.len * 0.22; lx < f.len * 0.24; lx += step * 0.85) {
      for (let ly = -f.height * 0.5; ly < f.height * 0.5; ly += step) {
        const row = Math.round((lx + f.len) / (step * 0.85));
        const [cx, cy] = toWorld(f.x, f.y, f.angle, [[lx, ly + (row % 2 ? step / 2 : 0)]])[0];
        if (!inside(cx, cy, inner) || k.chance(o.skip ?? 0.08)) continue;
        // A small arc opening toward the tail.
        const pts = [];
        for (let a = -70; a <= 70; a += 35) pts.push(polar(cx, cy, f.angle + a, step * 0.55));
        brush.spline(pts, 0.6);
      }
    }
  }

  /** Jellyfish bell (dome + scalloped rim) pointing along `angle` (270 = upright). */
  function jellyBell(x, y, r, angle = 270, o = {}) {
    const depth = o.depth ?? R(0.7, 1.0);
    const local = [];
    const n = 18;
    for (let i = 0; i <= n; i++) {
      const a = 180 + (180 * i) / n; // dome from left rim over the top to the right rim
      local.push([Math.cos(rad(a)) * r * (1 + G(0, 0.02)), Math.sin(rad(a)) * r * depth * (1 + G(0, 0.02))]);
    }
    const sc = o.scallops ?? 8;
    for (let i = 1; i < sc * 2; i++) {
      const t = i / (sc * 2);
      local.push([r - 2 * r * t, (i % 2 ? r * 0.12 : r * 0.03) + G(0, r * 0.01)]);
    }
    // Local frame is "upright" (rim down); rotate so the dome points along `angle`.
    return toWorld(x, y, angle + 90, local);
  }

  /** Tentacles and oral arms hanging from a bell whose dome points along `angle`. */
  function tentacles(x, y, r, angle, count, len, o = {}) {
    const down = angle + 180;
    const out = [];
    for (let i = 0; i < count; i++) {
      const off = (i / Math.max(1, count - 1) - 0.5) * 1.7 * r;
      const [sx, sy] = polar(...polar(x, y, down, r * 0.08), angle + 90, off);
      const pts = [];
      const L = len * R(0.6, 1.1);
      const amp = o.wave ?? R(6, 16);
      const ph = R(360);
      for (let s = 0; s <= 10; s++) {
        const t = s / 10;
        const [bx, by] = polar(sx, sy, down + G(0, 2), L * t);
        pts.push([...polar(bx, by, down + 90, Math.sin(rad(ph + t * 540)) * amp * t), k.lerp(1.1, 0.3, t)]);
      }
      out.push(pts);
    }
    return out;
  }

  /** Paint a full jellyfish. */
  function paintJelly(x, y, r, angle, o = {}) {
    const bell = jellyBell(x, y, r, angle, o);
    const tl = tentacles(x, y, r, angle, o.tentacles ?? 9, o.tentacleLen ?? r * 3, o);
    for (const t of tl) k.stem(t, { brush: o.tentacleBrush ?? 'HB', color: o.tentacle ?? '#f0c8d8', weight: o.tentacleWeight ?? 0.5, curvature: 0.7 });
    for (let i = 0; i < (o.arms ?? 3); i++) {
      const arm = tentacles(x, y, r * 0.35, angle, 1, r * R(1.4, 2.2), { wave: R(5, 10) })[0];
      const ribbon = k.strip(arm, r * R(0.12, 0.2), 0.3);
      if (o.reserve) k.reserve(ribbon, o.armReserve ?? o.reserve, 150, 0.6, 2);
      k.glaze(ribbon, o.arm ?? '#e0418a', o.armAlpha ?? 130, { bleed: 0.3, texture: 0.7 });
    }
    if (o.reserve) k.reserve(bell, o.reserve, o.reserveAlpha ?? 140, 0.5, 3);
    if (o.glaze !== false) {
      k.glaze(bell, o.color ?? '#c7b0e6', o.alpha ?? 120, { bleed: 0.25, texture: 0.9, border: 0.85 });
      k.glaze(k.shrink(bell, 0.6, x, y), o.inner ?? o.color ?? '#c7b0e6', (o.alpha ?? 120) * 0.8, { bleed: 0.35, texture: 0.8 });
    }
    if (o.gonads) for (let i = 0; i < 4; i++) {
      const [gx, gy] = polar(x, y, angle + 90 + (i - 1.5) * 32, r * 0.32);
      const g = k.petalCircle(...polar(gx, gy, angle, r * 0.18), r * 0.12, 8, 0.25);
      if (o.reserve) k.reserve(g, o.gonads, 230, 0.6, 2);
      k.glaze(g, o.gonads, 190, { bleed: 0.25 });
    }
    k.contour(bell, { brush: o.contourBrush ?? 'HB', color: o.ink ?? '#5a3a6e', weight: o.contourWeight ?? 0.4, open: 0.85, jitter: 0.7 });
    // Radial canals.
    for (let i = 0; i < 7; i++) {
      const a = angle + 90 + (i - 3) * 22;
      k.line(...polar(x, y, angle, r * 0.1), ...polar(x, y, a - 90, r * R(0.6, 0.85)), { brush: '2H', color: o.canal ?? o.ink ?? '#5a3a6e', weight: 0.22 });
    }
    return bell;
  }

  /** Log-spiral shell (nautilus/snail) outline and septa. */
  function spiralShell(x, y, r, angle = 0, o = {}) {
    const turns = o.turns ?? 1.7;
    const b = Math.log(r / (r * 0.08)) / (turns * 360);
    const outer = [];
    const steps = 48;
    for (let i = 0; i <= steps; i++) {
      const th = (turns * 360 * i) / steps;
      const rr = r * 0.08 * Math.exp(b * th);
      outer.push(polar(x, y, angle + th, rr * (1 + G(0, 0.008))));
    }
    const septa = [];
    for (let i = 8; i < steps; i += 3) {
      const th = (turns * 360 * i) / steps;
      const rr = r * 0.08 * Math.exp(b * th);
      const inner = r * 0.08 * Math.exp(b * (th - 360));
      const a = polar(x, y, angle + th, rr * 0.99);
      const c = polar(x, y, angle + th, Math.max(inner, 1));
      const m = polar(x, y, angle + th - 14, (rr + inner) / 2);
      septa.push([c, m, a]);
    }
    return { outline: outer, septa };
  }

  /** Starfish outline with `arms` arms. */
  function starfish(x, y, r, arms = 5, o = {}) {
    const inner = r * (o.inner ?? R(0.28, 0.4));
    const rot = o.rotation ?? R(360);
    const pts = [];
    for (let i = 0; i < arms * 2; i++) {
      const a = rot + (180 / arms) * i + G(0, 4);
      const rr = i % 2 ? inner : r * R(0.85, 1.1);
      pts.push(polar(x, y, a, rr));
      if (i % 2 === 0) pts.push(polar(x, y, a + 180 / arms * 0.35, rr * 0.72));
      else pts.push(polar(x, y, a + 180 / arms * 0.65, r * 0.62));
    }
    return pts;
  }

  /** Sea urchin: body disc + radiating spines. */
  function paintUrchin(x, y, r, o = {}) {
    const n = o.spines ?? 90;
    for (let i = 0; i < n; i++) {
      const a = R(360);
      k.line(...polar(x, y, a, r * 0.7), ...polar(x, y, a + G(0, 2), r * R(1.4, 2.4)), { brush: o.spineBrush ?? 'pen', color: k.pick(o.spineColors ?? ['#5a1a3a', '#7a2a50']), weight: R(0.25, 0.6) });
    }
    const disc = k.petalCircle(x, y, r, 14, 0.06);
    if (o.reserve) k.reserve(disc, o.reserve, 240, 0.6, 2);
    k.glaze(disc, o.color ?? '#6a1f4a', 190, { bleed: 0.25, texture: 0.85 });
    k.glaze(k.petalCircle(x, y, r * 0.55, 10, 0.1), o.inner ?? '#3a0c28', 170, { bleed: 0.2 });
    k.stipple(x, y, r * 0.5, r * 0.5, 40, o.dots ?? '#f7c9d8', { weight: 0.4 });
  }

  /** Branching coral as painted ribbons from (x, y) upward-ish along `angle`. */
  function coralBranches(x, y, angle, len, width, depth = 3, out = []) {
    const [x1, y1] = polar(x, y, angle + G(0, 8), len);
    const path = k.stemPath(x, y, x1, y1, R(-0.2, 0.2), 4);
    out.push({ poly: k.strip(path, width, 0.55), tip: [x1, y1], width });
    if (depth > 0) {
      const kids = k.pick([2, 2, 3]);
      for (let i = 0; i < kids; i++) coralBranches(x1, y1, angle + (i - (kids - 1) / 2) * R(22, 38), len * R(0.55, 0.78), width * 0.62, depth - 1, out);
    }
    return out;
  }

  /** A wavy kelp/seagrass frond rising from (x, y). */
  function frond(x, y, height, o = {}) {
    const lean = o.lean ?? R(-0.2, 0.2);
    const pts = [];
    const ph = R(360);
    const amp = o.amp ?? R(6, 20);
    for (let s = 0; s <= 10; s++) {
      const t = s / 10;
      pts.push([x + lean * height * t + Math.sin(rad(ph + t * 400)) * amp * t, y - height * t, k.lerp(1.2, 0.5, t)]);
    }
    return { path: pts, poly: k.strip(pts, o.width ?? R(6, 14), o.taper ?? 0.2) };
  }

  /** Drawn bubble: faint wash, broken pen ring, highlight. */
  function bubble(x, y, r, o = {}) {
    brush.noStroke(); brush.noFill();
    if (o.fill !== false) { brush.wash(o.fillColor ?? '#ffffff', o.fillAlpha ?? 40); brush.circle(x, y, r, 0.15); brush.noWash(); }
    brush.set('pen', o.ring ?? '#ffffff', o.weight ?? 0.4); brush.noFill();
    brush.circle(x + G(0, 0.5), y + G(0, 0.5), r, 0.2);
    brush.noStroke(); brush.wash(o.ring ?? '#ffffff', 200); brush.circle(x - r * 0.35, y - r * 0.35, Math.max(0.5, r * 0.18), 0.1); brush.noWash();
  }

  return { fish, paintFish, scaleArcs, jellyBell, tentacles, paintJelly, spiralShell, starfish, paintUrchin, coralBranches, frond, bubble, toWorld };
}
