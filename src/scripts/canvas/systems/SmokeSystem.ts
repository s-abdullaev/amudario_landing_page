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
    chimneys: Array<{ x: number; h: number }>,
    horizon: number
  ): void {
    if (t <= 0.05 || chimneys.length === 0) return;

    // Smoke thickens quickly as the story begins
    const driftT = Math.min((t - 0.05) / 0.3, 1);

    this.particles.forEach((sp, i) => {
      // Distribute particles across all chimneys — every stack smokes
      const c = chimneys[i % chimneys.length];
      const sourceX = c.x + Math.sin(sp.phase) * 8;
      const sourceY = horizon - c.h - 5;

      // Each particle loops through its lifetime
      const lifeT = (now * sp.speed * 0.25 + sp.phase / 8) % 1;

      // Rise in a graceful plume, spreading gently as it climbs
      const scatterRange = (60 + c.h * 0.45) * lifeT;
      const windDrift = sp.driftDir * scatterRange;
      const turbulence = Math.sin(now * 0.8 + sp.phase + lifeT * 4) * (6 + lifeT * 22);

      const px = sourceX + windDrift + turbulence + sp.spreadX * scatterRange * 0.6;
      const py = sourceY - lifeT * (70 + c.h * 0.5) + sp.spreadY * scatterRange * 0.4 + Math.cos(now * 0.5 + sp.phase) * 6;

      // Fade in/out across lifetime — kept translucent so the scene stays readable
      const a = sp.alpha * 0.55 * Math.sin(lifeT * Math.PI) * driftT;

      if (a > 0.01) {
        ctx.beginPath();
        // Grow larger as they scatter
        ctx.arc(px, py, sp.r * (0.7 + lifeT * 2.6), 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0
          ? `rgba(80, 80, 80, ${a})`
          : `rgba(120, 120, 120, ${a})`;
        ctx.fill();
      }
    });
  }
}
