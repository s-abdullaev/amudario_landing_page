import { subT } from '../../utils';

/**
 * Wheat field drawn with inline row-based rendering.
 * Wheat heads have proper grain shapes arranged along a central rachis.
 */
export class WheatField {
  public draw(ctx: CanvasRenderingContext2D, t: number, now: number, w: number, h: number): void {
    const horizon = h * 0.6;
    const growth = subT(t, 0.05, 0.6);
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

        // Stalk
        ctx.beginPath();
        ctx.moveTo(px, y);
        ctx.quadraticCurveTo(px + sway * 0.5, y - currentH * 0.5, px + sway, y - currentH);
        ctx.strokeStyle = `rgba(180, 160, 100, ${0.3 + 0.7 * prog})`;
        ctx.lineWidth = 1 + 2 * prog;
        ctx.stroke();

        // Wheat head — multiple grains along a rachis in a wheat ear shape
        if (growth > 0.3) {
          const headX = px + sway;
          const headY = y - currentH;
          const headLen = 28 * prog; // total ear length
          const grainCount = 4 + Math.floor(prog * 3); // 4-7 grains
          const angle = sway * 0.05; // slight tilt with wind
          const alpha = 0.5 + 0.5 * prog;

          ctx.save();
          ctx.translate(headX, headY);
          ctx.rotate(angle);

          // Central rachis (thin line)
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(0, -headLen);
          ctx.strokeStyle = `rgba(200, 175, 90, ${alpha})`;
          ctx.lineWidth = 0.8 * prog;
          ctx.stroke();

          // Grains — alternating left/right along the rachis
          ctx.fillStyle = `rgba(220, 190, 80, ${alpha})`;
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
          ctx.strokeStyle = `rgba(200, 180, 100, ${alpha * 0.6})`;
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
  }
}
