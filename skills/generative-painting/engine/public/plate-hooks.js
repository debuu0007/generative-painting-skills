/* Pointillist edition: adds an optional __plateTransform material pass after capture.
 * Classic script loaded after the pinned p5 + p5.brush UMD builds, before any sketch.
 * Adds only controlled initialization (reconstruction seed before setup) and a readiness
 * signal that fires after p5.brush has flushed the first completed draw() and the WebGL
 * result has been copied into a stable 2D canvas. Drawing operations are untouched. */
(function () {
  var q = new URLSearchParams(location.search);
  var seed = Number(q.get('seed') || 1);
  var settle;
  var fail;
  var plate = {
    seed: seed,
    errors: [],
    ready: new Promise(function (resolve, reject) { settle = resolve; fail = reject; }),
  };
  plate.ready.catch(function () {});
  window.__plate = plate;
  function error(message) {
    plate.errors.push(String(message));
    fail(new Error(String(message)));
  }
  window.addEventListener('error', function (e) { error(e.message || e); });
  window.addEventListener('unhandledrejection', function (e) { error((e.reason && e.reason.message) || e.reason); });
  var captured = false;
  p5.registerAddon(function (_p5, _fn, lifecycles) {
    lifecycles.presetup = function () {
      this.randomSeed(seed);
      this.noiseSeed(seed);
    };
    // Registered after p5.brush, so this runs after the brush postdraw flush.
    lifecycles.postdraw = function () {
      if (captured) return;
      captured = true;
      try {
        var src = this.canvas;
        var out = document.createElement('canvas');
        out.width = src.width;
        out.height = src.height;
        out.getContext('2d').drawImage(src, 0, 0);
        var px = out.getContext('2d').getImageData(0, 0, out.width, out.height).data;
        var min = 255;
        var max = 0;
        for (var i = 0; i < px.length; i += 4 * 97) {
          var l = px[i] + px[i + 1] + px[i + 2];
          if (l < min) min = l;
          if (l > max) max = l;
        }
        if (max - min < 12) throw new Error('Captured plate is blank or uniform');
        var result = {
          canvas: out,
          width: out.width,
          height: out.height,
          logicalWidth: this.width,
          logicalHeight: this.height,
          density: this.pixelDensity(),
          frameCount: this.frameCount,
          seed: seed,
        };
        // Optional material pass (pointillism): receives the untouched watercolour result and
        // returns the replacement plate, keeping the original alongside for fidelity checks.
        Promise.resolve(window.__plateTransform ? window.__plateTransform(result) : result).then(settle, function (e) { error(e && e.message ? e.message : e); });
      } catch (e) {
        error(e.message);
      }
    };
  });
})();
