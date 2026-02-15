import { lerp, subT } from '../utils';
import { drawCalloutBox } from './callout-box';
import { drawStationMast, drawSolarPanel } from './station-parts';
import { SmokeSystem } from './systems/SmokeSystem';
import { CitySkyline } from './components/CitySkyline';

// Initialize Systems
const smokeSystem = new SmokeSystem(100);
const citySkyline = new CitySkyline(25);

// Pre-generated park trees (keeping local for now as it's simple)
const parkTrees = Array.from({ length: 8 }, (_, i) => ({
  x: 0.3 + Math.abs(Math.sin(i * 4.7)) * 0.5,
  size: 20 + Math.abs(Math.sin(i * 2.3)) * 25,
  hue: 100 + Math.floor(Math.abs(Math.sin(i * 3.1)) * 60),
}));

/**
 * AIRSENSE — Urban station detecting plant gas emissions against city skyline.
 */
export function drawAirsense(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
): void {
  ctx.clearRect(0, 0, w, h);
  const now = Date.now() / 1000;

  // Hazy urban sky
  const pollLevel = subT(t, 0.1, 0.5);
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  const r = lerp(25, 55, pollLevel);
  skyGrad.addColorStop(0, `rgb(${r},${r + 8},${r + 35})`);
  skyGrad.addColorStop(1, `rgb(${r - 10},${r},${r + 18})`);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  const horizon = h * 0.65;
  const stationX = w * 0.75;
  const stationY = horizon - 20;

  // Industrial Chimneys (3 of different sizes)
  const chimneys = [
    { x: w * 0.15, h: 120, w: 20 }, // Short
    { x: w * 0.22, h: 160, w: 25 }, // Medium
    { x: w * 0.30, h: 220, w: 30 }, // Tall
  ];

  chimneys.forEach((c, idx) => {
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.moveTo(c.x - c.w/2, horizon);
    ctx.lineTo(c.x + c.w/2, horizon);
    ctx.lineTo(c.x + c.w/2 - 4, horizon - c.h);
    ctx.lineTo(c.x - c.w/2 + 4, horizon - c.h);
    ctx.closePath();
    ctx.fill();
    
    // Details
    ctx.fillStyle = '#1a1a1a';
    ctx.fillRect(c.x - c.w/2 + 3, horizon - c.h, c.w - 6, 8);
    // Warning light on tall one
    if (idx === 2) {
      ctx.fillStyle = 'rgba(255, 100, 100, 0.8)';
      ctx.beginPath(); ctx.arc(c.x, horizon - c.h + 4, 2, 0, Math.PI*2); ctx.fill();
    }
  });

  const chimneyX = chimneys[2].x; // Use tall chimney for smoke source reference
  const chimneyH = chimneys[2].h;

  // City skyline
  citySkyline.draw(ctx, w, horizon);

  // Ground / park
  ctx.fillStyle = '#0e1a10';
  ctx.fillRect(0, horizon, w, h - horizon);

  // Park trees with gas emissions
  parkTrees.forEach((tree, ti) => {
    const tx = tree.x * w;
    const ty = horizon;
    const s = tree.size;
    ctx.fillStyle = '#3a2a1a';
    ctx.fillRect(tx - 3, ty - s * 0.6, 6, s * 0.6);
    ctx.beginPath(); ctx.arc(tx, ty - s * 0.8, s * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${tree.hue}, 40%, 20%)`;
    ctx.fill();

    if (t > 0.15) {
      const gasAlpha = subT(t, 0.15, 0.5) * 0.5;
      for (let g = 0; g < 4; g++) {
        const gx = tx + Math.sin(now * 0.5 + ti + g * 2) * 15;
        const gy = ty - s - 10 - g * 12 + Math.sin(now * 0.3 + g) * 5;
        ctx.beginPath(); ctx.arc(gx, gy, 3 + g, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(100, 200, 100, ${gasAlpha * (1 - g * 0.2)})`;
        ctx.fill();
      }
    }
  });

  // Smoke Particles (System)
  smokeSystem.updateAndDraw(ctx, t, now, chimneyX, chimneyH, horizon, stationX, stationY);

  // Airsense station
  
  // Scale similar to OXUS for consistent size
  const sc = Math.min(w, h) / 600;
  ctx.save(); 
  ctx.translate(stationX, stationY - 50); // Adjust Y to plant pole firmly
  ctx.scale(sc, sc);

  // Shared Mast & Solar Panel
  drawStationMast(ctx);
  drawSolarPanel(ctx);

  // Airsense Sensor Head (replacing OXUS cross-arm)
  ctx.save(); ctx.translate(0, -140);
  
  // Main Sensor Unit
  ctx.fillStyle = '#E0E0E0';
  ctx.beginPath(); ctx.roundRect(-22, -28, 44, 56, 6);
  ctx.fillStyle = '#1a2a3a'; ctx.fill();
  ctx.strokeStyle = 'rgba(0,229,160,0.5)'; ctx.lineWidth = 1.5; ctx.stroke();
  
  // Vents
  ctx.fillStyle = '#141e2a';
  for (let v = -12; v <= 12; v += 8) ctx.fillRect(-14, v, 28, 3);
  
  // Status LED
  ctx.beginPath(); ctx.arc(0, -18, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#00E5A0'; ctx.globalAlpha = 0.5 + Math.sin(now * 4) * 0.5; ctx.fill();
  ctx.globalAlpha = 1;
  
  // Antenna
  ctx.beginPath(); ctx.moveTo(12, -28); ctx.lineTo(12, -55);
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(12, -57, 3, 0, Math.PI * 2); ctx.fillStyle = '#606060'; ctx.fill();
  
  ctx.restore();
  ctx.restore();

  // Callout
  if (t > 0.5) {
    const valRatio = subT(t, 0.5, 0.85);
    drawCalloutBox(ctx, stationX, stationY - 70, 'AIR QUALITY', [
      { label: 'PM2.5', value: Math.round(valRatio * 87).toString(), unit: 'μg/m³', color: '#FF6B6B' },
      { label: 'CO₂', value: Math.round(valRatio * 450).toString(), unit: 'ppm', color: '#4DA8FF' },
      { label: 'VOC', value: Math.round(valRatio * 23).toString(), unit: 'ppb', color: '#00E5A0' },
    ], subT(t, 0.5, 0.7), 'left');
  }
}

export const AIRSENSE_CAPTIONS = [
  'Plants emit gases into urban air…',
  'Sensors detect volatile compounds',
  'Monitoring PM2.5 and CO₂ levels',
  'Alerting users to air quality changes',
  'High precision atmospheric data collection',
];
