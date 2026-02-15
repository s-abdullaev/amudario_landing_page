import { lerp, subT } from '../../utils';
import { FieldSystem, FieldConfig } from '../systems/FieldSystem';

export class CottonField extends FieldSystem {
  constructor(w: number, h: number) {
    super({
      rows: 12,
      rowSpacingScale: 0.6,
      baseColor: '#0d1a12',
      horizonY: 0.55
    }, w, h);
  }

  public draw(ctx: CanvasRenderingContext2D, t: number, now: number, w: number, h: number): void {
    const horizon = this.config.horizonY * h;
    const bloomT = subT(t, 0.2, 0.8);
    
    // Draw background/ground
    ctx.fillStyle = this.config.baseColor;
    ctx.fillRect(0, horizon, w, h - horizon);

    this.plants.forEach(p => {
      const prog = p.row / this.config.rows;
      const scale = 0.3 + 0.7 * prog;
      
      // Wind effect
      const wind = Math.sin(now + p.seed) * 3 * scale;
      
      // Bush
      ctx.beginPath();
      // x, y from plant property
      ctx.arc(p.x + wind, p.y, 25 * scale, 0, Math.PI, true);
      ctx.fillStyle = `rgba(30, ${60 + p.row * 5}, 40, ${0.4 + 0.6 * prog})`;
      ctx.fill();

      // Cotton bolls
      const numBolls = 2 + (p.seed % 2);
      for (let b = 0; b < numBolls; b++) {
        const bx = p.x + wind + Math.sin(p.seed + b) * 15 * scale;
        const by = p.y - Math.cos(p.seed + b) * 10 * scale;
        
        // Opening animation
        const open = Math.max(0, Math.min(1, bloomT * 1.5 + Math.sin(p.seed) * 0.5 - 0.2));
        const size = (4 + 6 * open) * scale;
        
        ctx.beginPath();
        ctx.arc(bx, by, size, 0, Math.PI * 2);
        
        const gb = Math.floor(lerp(40, 240, open));
        ctx.fillStyle = `rgb(${Math.floor(lerp(20, 240, open))}, ${gb}, ${Math.floor(lerp(20, 240, open))})`;
        ctx.fill();
      }
    });
  }
}
