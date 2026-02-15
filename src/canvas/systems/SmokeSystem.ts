import { lerp } from '../../utils';

export interface SmokeParticle {
  r: number;
  alpha: number;
  phase: number;
  speed: number;
  hue: number;
  spread: number; // Persist spread value
}

export class SmokeSystem {
  private particles: SmokeParticle[] = [];

  constructor(count: number = 100) {
    for (let i = 0; i < count; i++) {
      this.particles.push({
        r: 3 + Math.random() * 8,
        alpha: 0.2 + Math.random() * 0.3,
        phase: Math.random() * 10,
        speed: 0.3 + Math.random() * 0.4, // Slightly slower for relaxed feel
        hue: Math.random() > 0.5 ? 0 : 30,
        spread: (Math.random() - 0.5) * 40 // Random spread per particle
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

    const driftT = (t - 0.2) / 0.5; // Opacity scaler
    
    // Target: Airsense Sensor Intake (approx visual location)
    // Station is at stationX, stationY. Sensor head is ~ -140px up from stationY (in local coords)
    // -140 (head) + -18 (LED/Intake area) = -158 relative to stationY
    const targetX = stationX - 20; 
    const targetY = stationY - 100; // Roughly the height of the sensor head

    this.particles.forEach((sp, i) => {
      const sourceX = chimneyX + Math.sin(sp.phase) * 10;
      const sourceY = horizon - chimneyH - 5;
      
      // Make simulation time-based so it floats freely regardless of scroll
      const lifeT = (now * sp.speed * 0.3 + sp.phase / 8) % 1; // Even slower (0.3 factor)
      
      // Control points for bezier-like flow
      // Use stored spread, scale by lifeT squared
      // INCREASED SPREAD: multiply by larger factor for more divergence
      const spread = sp.spread * 5 * (lifeT * lifeT); 
      
      const px = lerp(sourceX, targetX, lifeT) + Math.sin(now * 1.0 + sp.phase + lifeT * 3) * (5 + lifeT * 20) + spread;
      const py = lerp(sourceY, targetY, lifeT) + Math.cos(now * 0.8 + sp.phase) * 5 - lifeT * 10 + spread * 0.5;
      
      // Alpha based on lifeT (fade in/out) and scroll visibility (driftT)
      const a = sp.alpha * Math.sin(lifeT * Math.PI) * Math.min(driftT * 4, 1);
      
      if (a > 0.01) {
        ctx.beginPath(); 
        // Increase size growth for spreading look
        ctx.arc(px, py, sp.r * (0.8 + lifeT * 6), 0, Math.PI * 2);
        ctx.fillStyle = i % 2 === 0 ? 'rgba(80, 80, 80, ' + a + ')' : 'rgba(120, 120, 120, ' + a + ')';
        ctx.fill();
      }
    });
  }
}
