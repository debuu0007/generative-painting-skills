/** Shot 20 — instance-mode adapter of a hand-written p5.brush sketch (source C).
 * Instance-mode port only: the draw() body is the supplied body with p5 globals prefixed by `p.`;
 * all brush calls, literals and order are unchanged, including noLoop() at the end of draw().
 * Added: pixelDensity(1) immediately after createCanvas (p5 2.x keeps density on the renderer that createCanvas replaces). */
export const fieldJournal = {
  id: 'field-journal',
  kind: 'supplied',
  sketch(p, brush) {
    p.setup = async () => {
      p.createCanvas(600, 600, p.WEBGL);
      p.pixelDensity(1);
      p.angleMode(p.DEGREES);
      brush.scaleBrushes(3);
    };

    p.draw = () => {
      p.translate(-p.width / 2, -p.height / 2);
      p.background("#f4e8c1");
      brush.set("2H", "#7a7465", 0.15);
      for (let x = 40; x <= 560; x += 40) {
        brush.line(x, 40, x, 560);
      }
      for (let y = 40; y <= 560; y += 40) {
        brush.line(40, y, 560, y);
      }
      brush.noStroke();
      brush.fillBleed(0.4, "out");
      brush.fillTexture(0.85, 0.9);
      brush.fill("#9b7b5a", 30);
      brush.circle(130, 150, 75, 0.2);
      brush.circle(480, 420, 95, 0.3);
      brush.circle(410, 110, 45, 0.15);
      brush.fill("#8b6b4a", 25);
      brush.circle(280, 490, 50, 0.1);
      brush.circle(170, 380, 30, 0.1);
      brush.fill("#4a3520", 40);
      brush.fillBleed(0.5, "in");
      brush.field("hand");
      brush.rect(300, 8, 600, 16, "center");
      brush.rect(300, 592, 600, 16, "center");
      brush.rect(8, 300, 16, 600, "center");
      brush.rect(592, 300, 16, 600, "center");
      brush.noField();
      brush.hatchStyle("HB", "#2a2a2a", 0.4);
      brush.set("HB", "#333333", 0.4);
      brush.fill("#6b705c", 50);
      brush.fillBleed(0.2, "out");
      brush.hatch(6, 45, { rand: 0.1 });
      brush.beginShape(0.1);
      brush.vertex(296, 290);
      brush.vertex(304, 290);
      brush.vertex(302, 450);
      brush.vertex(298, 450);
      brush.endShape(true);
      brush.hatch(5, -45, { rand: 0.1 });
      brush.beginShape(0.2);
      brush.vertex(275, 275);
      brush.vertex(325, 275);
      brush.vertex(340, 230);
      brush.vertex(315, 260);
      brush.vertex(300, 295);
      brush.vertex(285, 260);
      brush.vertex(260, 230);
      brush.endShape(true);
      brush.fillBleed(0.15, "out");
      brush.fill("#c68e8c", 45);
      brush.hatch(4, 15, { rand: 0.2 });
      brush.beginShape(0.5);
      brush.vertex(280, 275);
      brush.vertex(250, 180);
      brush.vertex(265, 110);
      brush.vertex(305, 155);
      brush.vertex(300, 275);
      brush.endShape(true);
      brush.fill("#c06c5a", 40);
      brush.hatch(5, -20, { rand: 0.15 });
      brush.beginShape(0.4);
      brush.vertex(300, 275);
      brush.vertex(315, 150);
      brush.vertex(345, 115);
      brush.vertex(365, 195);
      brush.vertex(320, 275);
      brush.endShape(true);
      brush.fill("#b66a5e", 55);
      brush.hatch(7, 75, { rand: 0.1 });
      brush.beginShape(0.3);
      brush.vertex(290, 275);
      brush.vertex(280, 195);
      brush.vertex(305, 130);
      brush.vertex(335, 180);
      brush.vertex(310, 275);
      brush.endShape(true);
      brush.fill("#c06c5a", 35);
      brush.hatch(5, 10, { rand: 0.2 });
      brush.beginShape(0.4);
      brush.vertex(180, 520);
      brush.vertex(220, 490);
      brush.vertex(260, 530);
      brush.vertex(230, 560);
      brush.vertex(190, 540);
      brush.endShape(true);
      brush.fill("#c68e8c", 40);
      brush.hatch(6, -30, { rand: 0.15 });
      brush.beginShape(0.6);
      brush.vertex(350, 500);
      brush.vertex(380, 475);
      brush.vertex(420, 490);
      brush.vertex(390, 530);
      brush.vertex(360, 520);
      brush.endShape(true);
      brush.fill("#b66a5e", 50);
      brush.hatch(4, 50, { rand: 0.1 });
      brush.beginShape(0.2);
      brush.vertex(460, 520);
      brush.vertex(485, 510);
      brush.vertex(500, 540);
      brush.vertex(470, 545);
      brush.endShape(true);
      brush.noFill();
      brush.noHatch();
      brush.set("2H", "#2a2a2a", 0.35);
      brush.line(265, 130, 110, 90);
      brush.circle(110, 90, 2);
      brush.line(110, 90, 70, 90);
      brush.line(345, 140, 480, 95);
      brush.circle(480, 95, 2);
      brush.line(480, 95, 530, 95);
      brush.line(305, 230, 450, 240);
      brush.circle(450, 240, 2);
      brush.line(450, 240, 480, 240);
      brush.line(235, 510, 130, 460);
      brush.circle(130, 460, 2);
      brush.line(405, 505, 510, 465);
      brush.circle(510, 465, 2);
      brush.line(60, 540, 160, 540);
      brush.line(60, 535, 60, 545);
      brush.line(110, 537, 110, 543);
      brush.line(160, 535, 160, 545);
      p.noLoop();
    };
  },
};
