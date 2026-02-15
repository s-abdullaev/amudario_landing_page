import { lerp, subT } from '../../utils';

/**
 * Cotton field drawn with inline row-based rendering (matching original script.js).
 * Using real pixel coordinates at draw-time for correct layout.
 */
export class CottonField {
  public draw(ctx: CanvasRenderingContext2D, t: number, now: number, w: number, h: number): void {
    const horizon = h * 0.55;
    const bloomT = subT(t, 0.2, 0.8);

    // Ground
    ctx.fillStyle = '#e5e1d8'; // Light earth
    ctx.fillRect(0, horizon, w, h - horizon);

    // Cotton rows
    const rows = 12;
    for (let r = 0; r < rows; r++) {
      const prog = r / rows;
      const y = horizon + Math.pow(prog, 1.4) * (h - horizon);
      const scale = 0.3 + 0.7 * prog;
      const rowW = w * (0.6 + 2 * prog);
      const rowX = w / 2;
      const count = 8 + r * 2;
      const spacing = rowW / count;
      for (let p = 0; p < count; p++) {
        const px = rowX - rowW / 2 + p * spacing + (r % 2) * spacing * 0.5;
        const seed = r * 99 + p * 13;
        const wind = Math.sin(now + seed) * 3 * scale;

        // Bush
        ctx.beginPath();
        ctx.arc(px + wind, y, 25 * scale, 0, Math.PI, true);
        ctx.fillStyle = `rgba(30, ${60 + r * 5}, 40, ${0.4 + 0.6 * prog})`;
        ctx.fill();

        // Cotton bolls
        const numBolls = 2 + (seed % 2);
        for (let b = 0; b < numBolls; b++) {
          const bx = px + wind + Math.sin(seed + b) * 15 * scale;
          const by = y - Math.cos(seed + b) * 10 * scale;
          const open = Math.max(0, Math.min(1, bloomT * 1.5 + Math.sin(seed) * 0.5 - 0.2));
          const size = (4 + 6 * open) * scale;

          ctx.beginPath();
          ctx.arc(bx, by, size, 0, Math.PI * 2);

          const cr = Math.floor(lerp(180, 255, open));
          const cg = Math.floor(lerp(150, 255, open));
          const cb = Math.floor(lerp(110, 255, open));
          ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
          ctx.fill();
        }
      }
    }
  }
}
