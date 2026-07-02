import { subT, lerp } from '../../utils';

/**
 * Wheat field drawn with inline row-based rendering.
 * Wheat heads have proper grain shapes arranged along a central rachis.
 * As the story progresses the field flourishes: a second pass of stalks
 * fills every gap and a straw blanket hides the bare earth entirely.
 */
export class WheatField {
  public draw(ctx: CanvasRenderingContext2D, t: number, now: number, w: number, h: number): void {
    const horizon = h * 0.6;
    const growth = subT(t, 0.05, 0.6);
    // Maturation: young green wheat ripens to gold as the story unfolds
    const mature = subT(t, 0.4, 0.85);
    // Flourish: field thickens until no bare land is visible
    const flourish = subT(t, 0.45, 0.9);
    const stalkR = Math.floor(lerp(120, 185, mature));
    const stalkG = Math.floor(lerp(155, 162, mature));
    const stalkB = Math.floor(lerp(75, 100, mature));
    const grainR = Math.floor(lerp(150, 224, mature));
    const grainG = Math.floor(lerp(175, 192, mature));
    const grainB = Math.floor(lerp(85, 78, mature));

    // Straw blanket — bare earth fades away beneath the flourishing crop
    if (flourish > 0.01) {
      const undergrowth = ctx.createLinearGradient(0, horizon, 0, h);
      undergrowth.addColorStop(0, `rgba(${Math.floor(lerp(170, 196, mature))}, ${Math.floor(lerp(180, 172, mature))}, ${Math.floor(lerp(110, 96, mature))}, ${0.75 * flourish})`);
      undergrowth.addColorStop(1, `rgba(${Math.floor(lerp(150, 214, mature))}, ${Math.floor(lerp(170, 186, mature))}, ${Math.floor(lerp(95, 100, mature))}, ${0.9 * flourish})`);
      ctx.fillStyle = undergrowth;
      ctx.fillRect(0, horizon, w, h - horizon);
    }

    // Density adapts to screen width — mobile gets fewer stalks per row
    const isMobile = w <= 480;
    const isTablet = w > 480 && w <= 768;
    const wheatRows = isMobile ? 10 : isTablet ? 13 : 16;
    const deviceSeed = Math.floor(w / 100);          // different seed per device tier

    for (let r = 0; r < wheatRows; r++) {
      const prog = r / wheatRows;
      const y = horizon + Math.pow(prog, 1.5) * (h - horizon);
      const rowW = w * (0.85 + 1.6 * prog);
      const baseCount = isMobile ? (10 + r * 2) : isTablet ? (18 + r * 4) : (28 + r * 6);
      const count = baseCount;
      const spacing = rowW / count;
      for (let p = 0; p < count; p++) {
        const px = w / 2 - rowW / 2 + p * spacing + (r % 2) * spacing * 0.5;
        const seed = r * 13 + p * 7 + deviceSeed * 11;
        const maxH = 20 + 55 * prog;
        const currentH = maxH * (0.2 + 0.8 * growth);
        const sway = Math.sin(now * 0.8 + seed) * 4 * prog;

        this.drawStalk(ctx, px, y, currentH, sway, prog, 1, growth,
          stalkR, stalkG, stalkB, grainR, grainG, grainB);

        // Flourish pass — an extra stalk sprouts in every gap between neighbours
        if (flourish > 0.02) {
          const fseed = seed + 101;
          const fx = px + spacing * 0.5 + Math.sin(fseed * 3.7) * spacing * 0.2;
          const fSway = Math.sin(now * 0.8 + fseed) * 4 * prog;
          const fH = currentH * (0.85 + Math.sin(fseed) * 0.1) * (0.25 + 0.75 * flourish);
          this.drawStalk(ctx, fx, y + spacing * 0.06, fH, fSway, prog, flourish, growth,
            stalkR, stalkG, stalkB, grainR, grainG, grainB);
        }
      }
    }
  }

  private drawStalk(
    ctx: CanvasRenderingContext2D,
    px: number, y: number, currentH: number, sway: number, prog: number,
    fade: number, growth: number,
    stalkR: number, stalkG: number, stalkB: number,
    grainR: number, grainG: number, grainB: number
  ): void {
    // Stalk
    ctx.beginPath();
    ctx.moveTo(px, y);
    ctx.quadraticCurveTo(px + sway * 0.5, y - currentH * 0.5, px + sway, y - currentH);
    ctx.strokeStyle = `rgba(${stalkR}, ${stalkG}, ${stalkB}, ${(0.3 + 0.7 * prog) * fade})`;
    ctx.lineWidth = 1 + 2 * prog;
    ctx.stroke();

    // Wheat head — multiple grains along a rachis in a wheat ear shape
    if (growth > 0.3) {
      const headX = px + sway;
      const headY = y - currentH;
      const headLen = 28 * prog; // total ear length
      const grainCount = 4 + Math.floor(prog * 3); // 4-7 grains
      const angle = sway * 0.05; // slight tilt with wind
      const alpha = (0.5 + 0.5 * prog) * fade;

      ctx.save();
      ctx.translate(headX, headY);
      ctx.rotate(angle);

      // Central rachis (thin line)
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, -headLen);
      ctx.strokeStyle = `rgba(${stalkR + 20}, ${stalkG + 10}, ${stalkB}, ${alpha})`;
      ctx.lineWidth = 0.8 * prog;
      ctx.stroke();

      // Grains — alternating left/right along the rachis
      ctx.fillStyle = `rgba(${grainR}, ${grainG}, ${grainB}, ${alpha})`;
      for (let g = 0; g < grainCount; g++) {
        const gy = -g * (headLen / grainCount); // position along rachis
        const side = (g % 2 === 0) ? -1 : 1;
        const gw = 6 * prog; // grain width
        const gh = 9 * prog;   // grain height
        const tilt = side * 0.4; // angle outward

        ctx.save();
        ctx.translate(side * 1.5 * prog, gy);
        ctx.rotate(tilt);
        ctx.beginPath();
        ctx.ellipse(0, 0, gw, gh, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Awns (bristles at top)
      ctx.strokeStyle = `rgba(${grainR - 20}, ${grainG - 12}, ${grainB + 20}, ${alpha * 0.6})`;
      ctx.lineWidth = 0.5;
      for (let a = 0; a < 3; a++) {
        const ax = (a - 1) * 2 * prog;
        ctx.beginPath();
        ctx.moveTo(ax, -headLen);
        ctx.lineTo(ax + (a - 1) * 3 * prog, -headLen - 6 * prog);
        ctx.stroke();
      }

      ctx.restore();
    }
  }
}
