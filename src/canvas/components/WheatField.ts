import { FieldSystem } from '../systems/FieldSystem';

export class WheatField extends FieldSystem {
  constructor(w: number, h: number) {
    super({
      rows: 15, // More rows for density
      rowSpacingScale: 0.8,
      baseColor: '#0A1015', // Night context base
      horizonY: 0.6
    }, w, h);
  }

  public draw(ctx: CanvasRenderingContext2D, t: number, now: number, w: number, h: number): void {
    const growT = t; // Growth based on scroll/time

    this.plants.forEach(p => {
      const prog = p.row / this.config.rows;
      const scale = 0.4 + 0.6 * prog;
      
      // Wind
      const wind = Math.sin(now * 1.5 + p.seed) * 5 * scale + Math.sin(now * 0.5 + p.row) * 3;
      
      const px = p.x + wind;
      const py = p.y;
      
      const growth = Math.min(1, growT * 1.5 + prog * 0.5);
      const height = (40 + (p.seed % 20)) * scale * growth;

      // Stalk
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.quadraticCurveTo(px + wind * 2, py - height / 2, px + wind * 3, py - height);
      ctx.strokeStyle = `rgba(180, 160, 100, ${0.3 + 0.7 * prog})`;
      ctx.lineWidth = 2 * scale;
      ctx.stroke();

      // Wheat Head (with grains)
      if (growth > 0.5) {
        const headX = px + wind * 3;
        const headY = py - height;
        const headSize = 12 * scale * growth;

        ctx.save();
        ctx.translate(headX, headY);
        ctx.rotate(wind * 0.05);
        
        ctx.fillStyle = `rgb(220, 200, 120)`;
        
        // Draw grains
        for(let g=0; g<5; g++) {
           ctx.beginPath();
           ctx.ellipse(0, g*3*scale, 2*scale, 4*scale, 0, 0, Math.PI*2);
           ctx.fill();
        }
        
        ctx.restore();
      }
    });
  }
}
