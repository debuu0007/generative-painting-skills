/** Shot 06 — instance-mode adapter of a hand-written p5.brush sketch (source A).
 * Instance-mode port only: every drawing call, argument, unrolled call and random() call is kept
 * in source order. Controlled initialization added: pixelDensity(1) immediately after createCanvas (p5 2.x keeps density
 * on the renderer that createCanvas replaces); the
 * reconstruction seed is applied by the shared presetup hook exactly as in the reference harness. */
export const hibiscusCanopy = {
  id: 'hibiscus-canopy',
  kind: 'supplied',
  sketch(p, brush) {
    const random = (...a) => p.random(...a);
    const width = () => p.width;
    const height = () => p.height;

    p.setup = async () => {
      p.createCanvas(600, 600, p.WEBGL);
      p.pixelDensity(1);
      p.angleMode(p.DEGREES);
      brush.scaleBrushes(3);
      p.background('#051208');
      p.noLoop();
    };

    p.draw = () => {
      p.translate(-width() / 2, -height() / 2);
      bgGlaze('#0b2e13'); bgGlaze('#081c0c'); bgGlaze('#143a1a'); bgGlaze('#0b2e13');
      bloom(); bloom(); bloom(); bloom(); bloom();
      bloom(); bloom(); bloom(); bloom(); bloom();
      bloom(); bloom(); bloom(); bloom(); bloom();
      bloom(); bloom(); bloom(); bloom(); bloom();
      glow(); glow(); glow(); glow(); glow();
      glow(); glow(); glow(); glow(); glow();
      const P = ['#ff1694', '#ff8c00', '#4b0082'];
      brush.field('curved');
      glazeFlower(P[0]); glazeFlower(P[1]); glazeFlower(P[2]);
      glazeFlower(P[0]); glazeFlower(P[1]); glazeFlower(P[2]);
      glazeFlower(P[0]); glazeFlower(P[1]); glazeFlower(P[2]);
      glazeFlower(P[0]); glazeFlower(P[1]); glazeFlower(P[2]);
      glazeFlower(P[0]); glazeFlower(P[1]);
      focalFlower(); focalFlower(); focalFlower();
      brush.noField();
    };

    function bgGlaze(c) {
      brush.noStroke();
      brush.fill(c, 180);
      brush.fillTexture(0.4, 0.2);
      brush.rect(0, 0, width(), height());
    }
    function bloom() {
      brush.fill('#2a4d2e', 80);
      brush.fillBleed(0.8, 'out');
      brush.circle(random(width()), random(height()), random(30, 120), 0.2);
    }
    function glow() {
      brush.fill('#1e5a2d', 40);
      brush.circle(random(width()), random(height()), random(100, 250), 0.5);
    }
    function glazeFlower(col) {
      drawHibiscus(random(50, 550), random(50, 550), random(60, 110), col, 110);
    }
    function focalFlower() {
      drawHibiscus(random(150, 450), random(150, 450), random(100, 140), '#fefefa', 200, '#c40000');
    }
    function drawHibiscus(x, y, size, col, opacity, eyeCol = null) {
      p.push();
      p.translate(x, y);
      p.rotate(random(360));
      petal(0, size, col, opacity);
      petal(1, size, col, opacity);
      petal(2, size, col, opacity);
      petal(3, size, col, opacity);
      petal(4, size, col, opacity);
      const centerCol = eyeCol || p.lerpColor(p.color(col), p.color(0), 0.4);
      brush.fill(centerCol, 180);
      brush.fillBleed(0.6, 'out');
      brush.circle(0, 0, size * 0.3, 0.2);
      brush.set('pen', '#ffeb3b', 0.6);
      const stamenAngle = random(360);
      brush.flowLine(0, 0, size * 0.9, stamenAngle);
      brush.set('pen', '#ffc107', 1.2);
      for (let j = 0; j < 6; j++) {
        const px = p.cos(stamenAngle) * (size * 0.8 + j * 2);
        const py = p.sin(stamenAngle) * (size * 0.8 + j * 2);
        brush.circle(px, py, 2, 0.1);
      }
      p.pop();
    }
    function petal(i, size, col, opacity) {
      p.push();
      p.rotate(i * 72 + random(-8, 8));
      brush.noStroke();
      brush.fill(col, opacity);
      brush.fillBleed(0.15, 'in');
      brush.fillTexture(0.1, 0.4);
      brush.beginShape(0.6);
      brush.vertex(0, 0);
      brush.vertex(size * 0.4, -size * 0.3);
      brush.vertex(size * 0.9, -size * 0.1);
      brush.vertex(size, size * 0.2);
      brush.vertex(size * 0.5, size * 0.4);
      brush.endShape(p.CLOSE);
      brush.set('HB', '#333', 0.3);
      brush.line(0, 0, size * 0.7, size * 0.1);
      p.pop();
    }
  },
};
