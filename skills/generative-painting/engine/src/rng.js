/** Seeded RNG. Same seed + same call sequence => same numbers. */
export function mulberry32(seed) {
  let a = seed >>> 0;
  return function next() {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function makeRng(seed, salt = 0) {
  const n = typeof seed === 'string' ? hashString(seed) : seed >>> 0;
  const rand = mulberry32((n + salt * 2654435761) >>> 0);
  const api = {
    seed: n,
    next: rand,
    float(min = 0, max = 1) {
      return min + rand() * (max - min);
    },
    int(min, max) {
      return Math.floor(api.float(min, max + 1));
    },
    signed(amp = 1) {
      return (rand() * 2 - 1) * amp;
    },
    pick(arr) {
      return arr[Math.floor(rand() * arr.length)];
    },
    /** Independent 0..1 from integer coords (not sequential). */
    n2(x, y = 0) {
      const s = Math.sin(x * 127.1 + y * 311.7 + n * 0.001) * 43758.5453;
      return s - Math.floor(s);
    },
    fork(salt) {
      return makeRng(n, salt);
    },
  };
  return api;
}
