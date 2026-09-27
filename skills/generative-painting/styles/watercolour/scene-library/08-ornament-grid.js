/** Shot 08 — instance-mode adapter of a hand-written p5.brush sketch (source B).
 * Instance-mode port only; drawing calls, arguments and order unchanged. Added: pixelDensity(1). */
export const ornamentGrid = {
  id: 'ornament-grid',
  kind: 'supplied',
  sketch(p, brush) {
    const random = (...a) => p.random(...a);

    p.setup = async () => {
      p.createCanvas(600, 600, p.WEBGL);
      p.pixelDensity(1);
      brush.scaleBrushes(3);
      p.angleMode(p.DEGREES);
      p.noLoop();
    };

    p.draw = () => {
      const width = p.width;
      const height = p.height;
      p.translate(-width / 2, -height / 2);
      p.background('#fdf9f0');
      const colors = {
        gold: '#C5A059', teal: '#5E8C8A', rose: '#B97D78',
        crimson: '#991F25', ink: '#4a3c31',
      };
      const spacing = 160;
      const startX = (width - 2 * spacing) / 2;
      const startY = (height - 2 * spacing) / 2;
      motifAt(startX + 0 * spacing, startY + 0 * spacing, colors);
      motifAt(startX + 1 * spacing, startY + 0 * spacing, colors);
      motifAt(startX + 2 * spacing, startY + 0 * spacing, colors);
      motifAt(startX + 0 * spacing, startY + 1 * spacing, colors);
      motifAt(startX + 1 * spacing, startY + 1 * spacing, colors);
      motifAt(startX + 2 * spacing, startY + 1 * spacing, colors);
      motifAt(startX + 0 * spacing, startY + 2 * spacing, colors);
      motifAt(startX + 1 * spacing, startY + 2 * spacing, colors);
      motifAt(startX + 2 * spacing, startY + 2 * spacing, colors);
      drawDecorativeBorder(colors);
    };

    function motifAt(x, y, colors) {
      p.push();
      p.translate(x, y);
      drawHibiscusMotif(colors);
      p.pop();
    }
    function drawHibiscusMotif(c) {
      brush.noStroke();
      brush.fill(c.teal, 35);
      brush.fillBleed(0.05);
      brush.fillTexture(0.4, 0.2);
      brush.circle(0, 0, 65, 0.05);
      drawPetal(0, c);
      drawPetal(1, c);
      drawPetal(2, c);
      drawPetal(3, c);
      drawPetal(4, c);
      p.push();
      p.rotate(-15);
      brush.set('HB', c.gold, 0.8);
      brush.line(0, 0, 0, -35);
      brush.fill(c.gold, 200);
      for (let m = 0; m < 5; m++) {
        const r = random(2, 4);
        const ox = random(-4, 4);
        const oy = -35 + random(-5, 5);
        brush.circle(ox, oy, r, 0.1);
      }
      p.pop();
    }
    function drawPetal(k, c) {
      p.push();
      p.rotate(k * 72);
      brush.fill(c.rose, 140);
      brush.fillTexture(0.6, 0.4);
      brush.noStroke();
      brush.beginShape(0.6);
      brush.vertex(0, 0);
      brush.vertex(15, -35);
      brush.vertex(0, -50);
      brush.vertex(-15, -35);
      brush.endShape(true);
      brush.hatchStyle('HB', c.crimson, 0.5);
      brush.hatch(1.5, 90, { rand: 0.2 });
      brush.beginShape(0.5);
      brush.vertex(0, -5);
      brush.vertex(8, -20);
      brush.vertex(0, -25);
      brush.vertex(-8, -20);
      brush.endShape(true);
      brush.noHatch();
      brush.set('pen', c.ink, 0.4);
      brush.line(0, -5, 0, -40);
      p.pop();
    }
    function drawDecorativeBorder(c) {
      const width = p.width;
      const height = p.height;
      brush.set('2B', c.gold, 1.2);
      brush.noFill();
      const margin = 40;
      const len = 60;
      brush.line(margin, margin, margin + len, margin);
      brush.line(margin, margin, margin, margin + len);
      brush.line(width - margin, margin, width - margin - len, margin);
      brush.line(width - margin, margin, width - margin, margin + len);
      brush.line(margin, height - margin, margin + len, height - margin);
      brush.line(margin, height - margin, margin, height - margin - len);
      brush.line(width - margin, height - margin, width - margin - len, height - margin);
      brush.line(width - margin, height - margin, width - margin, height - margin - len);
      brush.fill(c.teal, 100);
      for (let q = 120; q < width - 100; q += 180) {
        brush.circle(q, margin, 4);
        brush.circle(q, height - margin, 4);
        brush.circle(margin, q, 4);
        brush.circle(width - margin, q, 4);
      }
    }
  },
};
