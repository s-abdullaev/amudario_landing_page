import { lerp } from '../../utils';

export interface SmokeParticle {
  r: number;
  alpha: number;
  phase: number;
  speed: number;
  hue: number;
  spreadX: number;
  spreadY: number;
  driftDir: number; // -1 left, 0 center, 1 right
}

export class SmokeSystem {
  private particles: SmokeParticle[] = [];

  constructor(count: number = 100) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        r: 3 + Math.random() * 8,
        alpha: 0.15 + Math.random() * 0.25,
        phase: Math.random() * 10,
        speed: 0.2 + Math.random() * 0.35,
        hue: Math.random() > 0.5 ? 0 : 30,
        spreadX: (Math.random() - 0.5) * 2, // normalized spread direction
        spreadY: (Math.random() - 0.5) * 0.5,
        driftDir: Math.random() - 0.5, // random horizontal drift
      });
    }
  }

  updateAndDraw(
    ctx: CanvasRenderingContext2D,
    t: number,
    now: number,
    chimneyX: number,
    chimneyH: number,
    horizon: number,
    stationX: number,
    stationY: number
  ): void {
    if (t <= 0.2) return;

    const driftT = (t - 0.2) / 0.5;

    this.particles.forEach((sp, i) => {
      const sourceX = chimneyX + Math.sin(sp.phase) * 10;
      const sourceY = horizon - chimneyH - 5;

      // Each particle loops through its lifetime
      const lifeT = (now * sp.speed * 0.25 + sp.phase / 8) % 1;

      // Scatter widely through the air — rise and spread in all directions
      const scatterRange = 300 * lifeT; // grows as particle ages
      const windDrift = sp.driftDir * scatterRange;
      const turbulence = Math.sin(now * 0.8 + sp.phase + lifeT * 4) * (10 + lifeT * 40);

      const px = sourceX + windDrift + turbulence + sp.spreadX * scatterRange * 0.8;
      const py = sourceY - lifeT * 180 + sp.spreadY * scatterRange * 0.4 + Math.cos(now * 0.5 + sp.phase) * 8;

      // Fade in/out across lifetime
      const a = sp.alpha * Math.sin(lifeT * Math.PI) * Math.min(driftT * 4, 1);

      if (a > 0.01) {
        ctx.beginPath();
        // Grow larger as they scatter
        ctx.arc(px, py, sp.r * (0.8 + lifeT * 5), 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0
          ? `rgba(80, 80, 80, ${a})`
          : `rgba(120, 120, 120, ${a})`;
        ctx.fill();
      }
    });
  }
}
