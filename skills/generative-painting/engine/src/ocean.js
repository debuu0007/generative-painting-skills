/** Marine species geometry (from the example film Ocean of Points). Silhouettes first, texture second: every
 * helper builds recognisable anatomy from kit geometry (blades, strips, rings) and paints through
 * the kit, so the capture/pointillism pipeline turns it into dots. Angles in DEGREES. All
 * randomness goes through the kit (the plate seed). */
import { createSea } from './sea.js';

export function createOcean(k, brush) {
  const sea = createSea(k, brush);
  const { R, G, polar, rad } = k;
  const toWorld = sea.toWorld;

  /** Ribbon along a path with a width profile w(t) (0..1) — bodies, arms, tails. */
  function ribbon(path, w) {
    const L = []; const Rt = [];
    for (let i = 0; i < path.length; i++) {
      const a = path[Math.max(0, i - 1)]; const b = path[Math.min(path.length - 1, i + 1)];
      const dx = b[0] - a[0]; const dy = b[1] - a[1]; const l = Math.hypot(dx, dy) || 1;
      const hw = w(i / (path.length - 1)) / 2;
      L.push([path[i][0] - (dy / l) * hw, path[i][1] + (dx / l) * hw]);
      Rt.push([path[i][0] + (dy / l) * hw, path[i][1] - (dx / l) * hw]);
    }
    return { poly: L.concat(Rt.reverse()), left: L, right: Rt.slice().reverse() };
  }
  const bez = (p0, p1, p2, p3, n = 24) => Array.from({ length: n + 1 }, (_, i) => {
    const t = i / n; const u = 1 - t;
    return [u * u * u * p0[0] + 3 * u * u * t * p1[0] + 3 * u * t * t * p2[0] + t * t * t * p3[0], u * u * u * p0[1] + 3 * u * u * t * p1[1] + 3 * u * t * t * p2[1] + t * t * t * p3[1]];
  });

  /** A school: `n` small fish along a path, each oriented to the local direction. */
  function school(path, n, o = {}) {
    const fishes = [];
    for (let i = 0; i < n; i++) {
      const t = R(); const idx = Math.min(path.length - 2, Math.floor(t * (path.length - 1)));
      const [ax, ay] = path[idx]; const [bx, by] = path[idx + 1];
      const ang = (Math.atan2(by - ay, bx - ax) * 180) / Math.PI + G(0, o.jitterAngle ?? 6);
      const off = G(0, o.spread ?? 14);
      const x = ax + (bx - ax) * R() - Math.sin(rad(ang)) * off; const y = ay + (by - ay) * R() + Math.cos(rad(ang)) * off;
      fishes.push(sea.fish(x, y, ang, (o.len ?? 20) * R(0.85, 1.15), (o.h ?? 6) * R(0.85, 1.15), { widest: 0.35, tail: 0.24, tailSpread: 0.5, fork: 0.6 }));
    }
    return fishes;
  }

  /** Barracuda: long narrow torpedo, pointed jaw, forked tail, dark bars. */
  function barracuda(x, y, angle, len, h) {
    const f = sea.fish(x, y, angle, len, h, { widest: 0.42, asym: 0.02, peduncle: 0.16, tail: 0.14, tailSpread: 0.95, fork: 0.7, dorsal: 0.12, dorsalLift: 25 });
    // Pointed jaw: sharpen the nose by replacing the rounded head front.
    f.jaw = toWorld(x, y, angle, [[len * 0.5, 0], [len * 0.56, h * 0.05], [len * 0.44, h * 0.16], [len * 0.44, -h * 0.12]]);
    f.bars = [0.25, 0.12, 0, -0.12, -0.24].map((at) => toWorld(x, y, angle, [[len * at, -h * 0.5], [len * (at - 0.035), -h * 0.05], [len * (at - 0.02), -h * 0.5]]));
    return f;
  }

  /** Lionfish: striped body, fan pectorals, long spined dorsal, banded tail. Returns parts. */
  function lionfish(x, y, angle, len, h) {
    const f = sea.fish(x, y, angle, len, h, { widest: 0.34, asym: 0.12, tail: 0.28, tailSpread: 0.6, fork: 0.05 });
    const stripes = [];
    for (let s = 0; s < 11; s++) {
      const at = 0.42 - s * 0.068;
      stripes.push(toWorld(x, y, angle, [[len * at, -h * 0.62], [len * (at - 0.03), 0], [len * at, h * 0.62], [len * (at + 0.026), h * 0.62], [len * (at - 0.004), 0], [len * (at + 0.026), -h * 0.62]]));
    }
    const fans = [];
    // Pectoral fans: huge, asymmetric (lower fan larger), membranes between rays.
    for (const [ox, oy, a0, a1, rl, n] of [[0.16, 0.22, 110, 205, 1.05, 13], [0.1, -0.1, 150, 250, 0.8, 11]]) {
      const [px, py] = toWorld(x, y, angle, [[len * ox, h * oy]])[0];
      const rays = [];
      for (let i = 0; i < n; i++) { const a = angle + a0 + ((a1 - a0) * i) / (n - 1) + G(0, 2); rays.push({ base: [px, py], tip: polar(px, py, a, len * rl * R(0.75, 1.05)), a }); }
      fans.push(rays);
    }
    // Dorsal spines: long, separated, standing up and back.
    const spines = [];
    for (let i = 0; i < 12; i++) {
      const [bx, by] = toWorld(x, y, angle, [[len * (0.3 - i * 0.045), -h * 0.46]])[0];
      spines.push({ base: [bx, by], tip: polar(bx, by, angle - 90 - 12 - i * 3 + G(0, 3), h * R(0.9, 1.5)) });
    }
    return { ...f, stripes, fans, spines };
  }

  /** Manta ray seen from above. Local frame: u forward along the body, v across the span (both
   * scaled: u by `chord`, v by `span`). Convex leading edges sweep back to pointed wingtips, concave
   * trailing edges return to a narrow rear body; a squared head between two forward cephalic fins. */
  function manta(cx, cy, angle, span, chord, o = {}) {
    const asym = o.asym ?? 0.08; // one wing slightly longer: a banking, asymmetric diagonal
    const L = (u, v) => toWorld(cx, cy, angle, [[u * chord, v * span]])[0];
    const edge = (side) => {
      const s = side; const reach = 0.5 * (1 + s * asym);
      const lead = bez([0.36, s * 0.1], [0.3, s * 0.3], [0.06, s * reach * 0.95], [-0.16, s * reach], 18);
      const trail = bez([-0.16, s * reach], [-0.2, s * reach * 0.62], [-0.1, s * 0.26], [-0.3, s * 0.1], 14);
      return lead.concat(trail.slice(1));
    };
    const right = edge(1); const left = edge(-1).reverse();
    const rear = [[-0.36, 0.06], [-0.4, 0], [-0.36, -0.06]];
    const front = [[0.42, -0.09], [0.43, 0], [0.42, 0.09]];
    const wing = [...front, ...right.map(([u, v]) => [u, v]), ...rear, ...left].map(([u, v]) => L(u, v + G(0, 0.002)));
    const cephL = k.petalOutline(...L(0.4, -0.085), angle - 6, chord * 0.2, chord * 0.055, { base: 0.6, widest: 0.5, bend: 0.25, asym: 0 });
    const cephR = k.petalOutline(...L(0.4, 0.085), angle + 6, chord * 0.2, chord * 0.055, { base: 0.6, widest: 0.5, bend: -0.25, asym: 0 });
    const tail = [L(-0.4, 0), L(-0.75, 0.01), L(-1.1, 0.04), L(-1.5, 0.08)].map((q) => [...q, 1]);
    // Dorsal shoulder marks and a narrow darker spine band (value structure, not a blob).
    const shoulders = [-1, 1].map((s) => bez([0.22, s * 0.06], [0.14, s * 0.22], [0.02, s * 0.3], [-0.04, s * 0.22], 10).concat(bez([-0.04, s * 0.22], [0.06, s * 0.14], [0.12, s * 0.08], [0.22, s * 0.06], 10)).map(([u, v]) => L(u, v)));
    const spine = [[0.3, -0.025], [0.1, -0.035], [-0.2, -0.025], [-0.34, -0.01], [-0.34, 0.01], [-0.2, 0.025], [0.1, 0.035], [0.3, 0.025]].map(([u, v]) => L(u, v));
    const eyes = [L(0.37, -0.1), L(0.37, 0.1)];
    return { wing, cephL, cephR, tail, shoulders, spine, eyes, L };
  }

  /** Leafy seadragon: long snout, curved segmented trunk, tail, leaf-like appendage clusters. */
  function seadragon(path, sc = 1) {
    const body = ribbon(path, (t) => sc * (t < 0.08 ? 10 + t * 150 : t < 0.35 ? 22 : 22 * (1 - (t - 0.35) / 0.65) + 3));
    const [hx, hy] = path[0]; const [nx, ny] = path[2];
    const ha = (Math.atan2(hy - ny, hx - nx) * 180) / Math.PI;
    const snout = k.petalOutline(hx, hy, ha, 46 * sc, 7 * sc, { base: 0.9, widest: 0.8, asym: 0, bend: 0.04 });
    const head = k.petalCircle(hx, hy, 11 * sc, 10, 0.08);
    const leaves = [];
    for (const [t, side, size] of [[0.12, -1, 1], [0.2, 1, 0.8], [0.3, -1, 1.2], [0.38, 1, 1], [0.5, -1, 1.1], [0.62, 1, 0.9], [0.75, -1, 0.8], [0.86, 1, 0.6]]) {
      const i = Math.floor(t * (path.length - 1)); const [bx, by] = path[i]; const [cx2, cy2] = path[Math.min(path.length - 1, i + 1)];
      const ta = (Math.atan2(cy2 - by, cx2 - bx) * 180) / Math.PI;
      const stalkA = ta + side * R(70, 110);
      const [sx, sy] = polar(bx, by, stalkA, 26 * size * sc);
      const cluster = [];
      for (let j = 0; j < 4; j++) cluster.push(k.leafOutline(sx, sy, stalkA + (j - 1.5) * R(22, 34), R(22, 36) * size * sc, R(9, 14) * size * sc));
      leaves.push({ stalk: [[bx, by], [sx, sy]], cluster });
    }
    return { body, snout, head, leaves, eye: polar(hx, hy, ha + 180 + 25, 4 * sc) };
  }

  /** Nudibranch: soft elongated body, frilled mantle edge, rhinophores, cerata, spots. */
  function nudibranch(x, y, angle, len, wid, o = {}) {
    const body = k.petalOutline(x - Math.cos(rad(angle)) * len * 0.5, y - Math.sin(rad(angle)) * len * 0.5, angle, len, wid, { base: 0.5, widest: 0.45, ruffle: o.ruffle ?? 0.18, asym: 0, bend: R(-0.12, 0.12), n: 12 });
    const [hx, hy] = polar(x, y, angle, len * 0.42);
    const rhino = [-1, 1].map((s) => k.petalOutline(hx, hy, angle + s * 35 - 0, wid * 0.55, wid * 0.16, { base: 0.6, widest: 0.5 }));
    const cerata = [];
    for (let i = 0; i < (o.cerata ?? 9); i++) {
      const [cx2, cy2] = polar(x, y, angle + 180, len * (0.05 + i * 0.04) - len * 0.1);
      cerata.push(k.petalOutline(cx2, cy2, angle + 180 + (i % 2 ? 40 : -40) + G(0, 8), wid * R(0.45, 0.7), wid * 0.2, { base: 0.5, widest: 0.5 }));
    }
    return { body, rhino, cerata, gills: k.petalCircle(...polar(x, y, angle + 180, len * 0.3), wid * 0.18, 9, 0.3) };
  }

  /** Octopus: mantle + curling tapered arms (log-spiral curls) with sucker rows. */
  function octopus(x, y, r, o = {}) {
    const mantle = k.petalOutline(x, y, -90 + G(0, 6), r * 1.6, r * 1.3, { base: 0.75, widest: 0.55, asym: 0.05 });
    const arms = [];
    const n = o.arms ?? 8;
    for (let i = 0; i < n; i++) {
      const a0 = 20 + (140 * i) / (n - 1) + G(0, 5);
      const path = [];
      const L = r * R(2.3, 3.3); const curl = (i % 2 ? 1 : -1) * R(260, 420);
      let [px, py] = polar(x, y, a0, r * 0.45); let a = a0;
      const steps = 36;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps; path.push([px, py]);
        a += (curl / steps) * Math.pow(t, 2.2) + G(0, 2);
        [px, py] = polar(px, py, a, (L / steps) * (1 - t * 0.55));
      }
      arms.push({ path, rib: ribbon(path, (t) => r * 0.42 * (1 - t) + 1.5) });
    }
    return { mantle, arms, eye: polar(x, y, -60, r * 0.55) };
  }

  /** Comb jelly: tall ovoid body with 8 comb rows (meridians) and two tentacle sheaths. */
  function combJelly(x, y, h, w) {
    const body = []; for (let i = 0; i < 40; i++) { const t = (i / 40) * Math.PI * 2; body.push([x + Math.sin(t) * w * (1 - 0.12 * Math.cos(t)), y - Math.cos(t) * h]); }
    const rows = [];
    for (let r = 0; r < 8; r++) {
      const u = -0.88 + (r / 7) * 1.76; const row = [];
      for (let s = 0; s <= 20; s++) { const t = -Math.PI / 2 + ((s / 20) * Math.PI); row.push([x + u * w * Math.cos(t) * 0.98, y + Math.sin(t) * h * 0.9]); }
      rows.push(row);
    }
    const lobes = [-1, 1].map((sd) => k.petalOutline(x + sd * w * 0.3, y + h * 0.55, 90 + sd * 12, h * 0.55, w * 0.55, { base: 0.4, widest: 0.5, bend: sd * 0.2 }));
    return { body, rows, lobes };
  }

  /** Sea fan: flat reticulate branching from a holdfast, as thin ribbons (network, not a tree ball). */
  function seaFan(x, y, angle, size, o = {}) {
    const branches = sea.coralBranches(x, y, angle, size * 0.38, o.width ?? 5, o.depth ?? 4);
    // Cross-links make the mesh of a gorgonian.
    const tips = branches.map((b) => b.tip);
    const links = [];
    for (let i = 0; i < tips.length; i++) for (let j = i + 1; j < tips.length; j++) {
      const d = Math.hypot(tips[i][0] - tips[j][0], tips[i][1] - tips[j][1]);
      if (d < size * 0.14 && R() < 0.55) links.push([tips[i], tips[j]]);
    }
    return { branches, links };
  }

  return { sea, ribbon, bez, school, barracuda, lionfish, manta, seadragon, nudibranch, octopus, combJelly, seaFan };
}
