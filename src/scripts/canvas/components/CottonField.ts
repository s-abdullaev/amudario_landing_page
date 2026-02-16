import { lerp, subT } from '../../utils';

/**
 * Cotton field drawn with inline row-based rendering.
 * Each plant has a stem, branches with leaves, and cotton bolls.
 */
export class CottonField {
  public draw(ctx: CanvasRenderingContext2D, t: number, now: number, w: number, h: number): void {
    const horizon = h * 0.55;
    const growT = Math.min(1, subT(t, 0.0, 0.45));
    const bloomT = subT(t, 0.2, 0.8);

    // Ground with tilled-row hint
    const grd = ctx.createLinearGradient(0, horizon, 0, h);
    grd.addColorStop(0, '#d6d0c4');
    grd.addColorStop(0.4, '#e5e1d8');
    grd.addColorStop(1, '#cec7b6');
    ctx.fillStyle = grd;
    ctx.fillRect(0, horizon, w, h - horizon);

    // Cotton rows — dense planting
    const rows = 16;
    for (let r = 0; r < rows; r++) {
      const prog = r / rows;
      const y = horizon + Math.pow(prog, 1.4) * (h - horizon);
      const scale = 0.3 + 0.7 * prog;
      const alpha = 0.4 + 0.6 * prog;
      const rowW = w * (0.6 + 2 * prog);
      const rowX = w / 2;
      const count = 14 + r * 3;
      const spacing = rowW / count;

      // Dirt row line
      ctx.beginPath();
      ctx.moveTo(rowX - rowW / 2, y + 4 * scale);
      ctx.lineTo(rowX + rowW / 2, y + 4 * scale);
      ctx.strokeStyle = `rgba(170, 155, 130, ${0.15 + 0.25 * prog})`;
      ctx.lineWidth = 2 * scale;
      ctx.stroke();

      for (let p = 0; p < count; p++) {
        const px = rowX - rowW / 2 + p * spacing + (r % 2) * spacing * 0.5;
        const seed = r * 99 + p * 13;
        const wind = Math.sin(now + seed) * 3 * scale * growT;
        const maxStemH = 32 * scale;
        const stemH = maxStemH * (0.08 + 0.92 * growT);
        const topX = px + wind;
        const topY = y - stemH;

        // ── Stem (curved with wind, grows with scroll) ──
        ctx.beginPath();
        ctx.moveTo(px, y + 3 * scale);
        ctx.quadraticCurveTo(px + wind * 0.4, y - stemH * 0.5, topX, topY);
        ctx.strokeStyle = `rgba(95, 130, 60, ${0.5 + 0.5 * prog})`;
        ctx.lineWidth = Math.max(1, (1.4 + 1.2 * growT) * scale);
        ctx.stroke();

        // ── Branches + Leaves (appear as plant grows) ──
        const brGrow = Math.max(0, (growT - 0.15) / 0.85);
        const brCount = 2 + (seed % 2);
        for (let br = 0; br < brCount; br++) {
          if (brGrow <= 0) break;
          const frac = (br + 1) / (brCount + 1);
          const brY = y - frac * stemH;
          const brWindX = wind * frac;
          const brBaseX = px + brWindX;
          const brDir = ((seed + br) % 2 === 0) ? 1 : -1;
          const brLen = (10 + (seed * (br + 1)) % 7) * scale * brGrow;
          const brTipX = brBaseX + brDir * brLen;
          const brTipY = brY - 3 * scale * brGrow;

          // Branch line
          ctx.beginPath();
          ctx.moveTo(brBaseX, brY);
          ctx.lineTo(brTipX, brTipY);
          ctx.strokeStyle = `rgba(85, 120, 50, ${(0.35 + 0.45 * prog) * brGrow})`;
          ctx.lineWidth = Math.max(0.5, 1.2 * scale);
          ctx.stroke();

          // Leaf (grows with brGrow)
          const leafAngle = brDir * 0.35 + Math.sin(now * 0.8 + seed + br) * 0.12;
          const leafScale = brGrow * scale;
          ctx.beginPath();
          ctx.ellipse(
            brTipX + brDir * 4 * leafScale, brTipY,
            7 * leafScale, 3.2 * leafScale,
            leafAngle, 0, Math.PI * 2
          );
          ctx.fillStyle = `rgba(55, ${90 + r * 4}, 38, ${(0.45 + 0.4 * prog) * brGrow})`;
          ctx.fill();

          // Leaf midrib
          if (brGrow > 0.3) {
            const cosA = Math.cos(leafAngle);
            const sinA = Math.sin(leafAngle);
            const mx = brTipX + brDir * 4 * leafScale;
            const my = brTipY;
            const halfVein = 5 * leafScale;
            ctx.beginPath();
            ctx.moveTo(mx - cosA * halfVein, my - sinA * halfVein);
            ctx.lineTo(mx + cosA * halfVein, my + sinA * halfVein);
            ctx.strokeStyle = `rgba(75, 115, 48, ${(0.25 + 0.25 * prog) * brGrow})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        // ── Canopy (tall dome, grows with scroll) ──
        const canR = 26 * scale * (0.1 + 0.9 * growT);
        const canH = canR * 1.6;
        ctx.beginPath();
        ctx.moveTo(topX - canR, y);
        ctx.bezierCurveTo(
          topX - canR * 0.85, y - canH,
          topX + canR * 0.85, y - canH,
          topX + canR, y
        );
        ctx.fillStyle = `rgba(38, ${68 + r * 5}, 42, ${(0.25 + 0.35 * prog) * growT})`;
        ctx.fill();

        // ── Cotton bolls ──
        const numBolls = 2 + (seed % 2);
        for (let b = 0; b < numBolls; b++) {
          const bx = topX + Math.sin(seed + b) * 14 * scale;
          const by = y - Math.cos(seed + b) * 10 * scale;
          const open = Math.max(0, Math.min(1, bloomT * 1.5 + Math.sin(seed) * 0.5 - 0.2));
          const size = (4 + 6 * open) * scale;

          if (open > 0.5) {
            // Fluffy open boll — overlapping lobes
            for (let s = 0; s < 4; s++) {
              const sa = (s / 4) * Math.PI * 2 - 0.3;
              const lx = bx + Math.cos(sa) * size * 0.35;
              const ly = by + Math.sin(sa) * size * 0.35;
              ctx.beginPath();
              ctx.arc(lx, ly, size * 0.6, 0, Math.PI * 2);
              const v = Math.floor(lerp(230, 255, open));
              ctx.fillStyle = `rgb(${v}, ${v}, ${Math.floor(v * 0.97)})`;
              ctx.fill();
            }
          } else {
            // Closed / partially-open boll
            ctx.beginPath();
            ctx.arc(bx, by, size, 0, Math.PI * 2);
            const cr = Math.floor(lerp(180, 255, open));
            const cg = Math.floor(lerp(150, 255, open));
            const cb = Math.floor(lerp(110, 255, open));
            ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
            ctx.fill();
          }

          // Calyx (tiny green sepals peeking from behind the boll)
          if (open > 0.25 && scale > 0.45) {
            for (let s = 0; s < 3; s++) {
              const ca = ((s - 1) * 0.5) + Math.PI * 0.5;
              ctx.beginPath();
              ctx.moveTo(bx, by + size * 0.3);
              ctx.lineTo(
                bx + Math.cos(ca) * size * 0.7,
                by + size * 0.3 + Math.sin(ca) * size * 0.55
              );
              ctx.strokeStyle = `rgba(70, 110, 45, ${0.4 * alpha})`;
              ctx.lineWidth = Math.max(0.5, 0.8 * scale);
              ctx.stroke();
            }
          }
        }
      }
    }
  }
}
