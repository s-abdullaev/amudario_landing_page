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

  // Hazy urban sky - Light Theme
  const pollLevel = subT(t, 0.1, 0.5);
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  // Interpolate between clean white/blueish and smoggy grey
  const r = 240 - pollLevel * 40; // 240 -> 200
  const g = 245 - pollLevel * 40;
  const b = 250 - pollLevel * 30;
  skyGrad.addColorStop(0, `rgb(${r},${g},${b})`);
  skyGrad.addColorStop(1, `rgb(${r-10},${g-10},${b-5})`);
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  const horizon = h * 0.65;
  const stationX = w * 0.75;
  const stationY = horizon - 20;

  // Industrial Chimneys (3 of different sizes)
  const chimneys = [
    { x: w * 0.42, h: 120, w: 20 }, // Short
    { x: w * 0.50, h: 160, w: 25 }, // Medium
    { x: w * 0.58, h: 220, w: 30 }, // Tall
  ];

  chimneys.forEach((c, idx) => {
    ctx.fillStyle = '#b0bec5'; // Light cool gray
    ctx.beginPath();
    ctx.moveTo(c.x - c.w/2, horizon);
    ctx.lineTo(c.x + c.w/2, horizon);
    ctx.lineTo(c.x + c.w/2 - 4, horizon - c.h);
    ctx.lineTo(c.x - c.w/2 + 4, horizon - c.h);
    ctx.closePath();
    ctx.fill();
    
    // Details
    ctx.fillStyle = '#90a4ae'; // Slightly darker gray for detail
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
  ctx.fillStyle = '#e2e8f0'; // Light concrete/grass mix
  ctx.fillRect(0, horizon, w, h - horizon);

  // Park trees with gas emissions
  parkTrees.forEach((tree, ti) => {
    const tx = tree.x * w;
    const ty = horizon;
    const s = tree.size;
    ctx.fillStyle = '#8d6e63'; // Lighter brown trunk
    ctx.fillRect(tx - 3, ty - s * 0.6, 6, s * 0.6);
    ctx.beginPath(); ctx.arc(tx, ty - s * 0.8, s * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = `hsl(${tree.hue}, 40%, 45%)`; // Lighter green foliage
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
  ctx.save(); ctx.translate(0, -100);
  
  // Main Sensor Unit — bigger
  ctx.fillStyle = '#f5f5f5'; // Very light grey
  ctx.beginPath(); ctx.roundRect(-30, -36, 60, 72, 6);
  ctx.fill();
  ctx.strokeStyle = '#90a4ae'; ctx.lineWidth = 1.5; ctx.stroke();
  
  // Vents
  ctx.fillStyle = '#cfd8dc'; // Light blue-grey vents
  for (let v = -12; v <= 12; v += 8) ctx.fillRect(-14, v, 28, 3);
  
  // Status LED
  ctx.beginPath(); ctx.arc(0, -18, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#00E5A0'; ctx.globalAlpha = 0.5 + Math.sin(now * 4) * 0.5; ctx.fill();
  ctx.globalAlpha = 1;
  
  // Antenna
  ctx.beginPath(); ctx.moveTo(12, -28); ctx.lineTo(12, -55);
  ctx.strokeStyle = '#b0bec5'; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(12, -57, 3, 0, Math.PI * 2); ctx.fillStyle = '#90a4ae'; ctx.fill();
  
  ctx.restore();
  ctx.restore();

  // Callout
  if (t > 0.5) {
    const valRatio = subT(t, 0.5, 0.85);
    const aqi = Math.round(valRatio * 87);
    drawCalloutBox(ctx, stationX, stationY - 70, 'AIR QUALITY', [
      { label: 'AQI', value: aqi.toString(), color: aqi > 50 ? '#FF6B6B' : '#00E5A0' },
      { label: 'PM2.5', value: Math.round(valRatio * 28).toString(), unit: 'µg/m³', color: '#FF6B6B' },
      { label: 'CO₂', value: Math.round(valRatio * 412).toString(), unit: 'ppm', color: '#4DA8FF' },
      { label: 'PM10', value: Math.round(valRatio * 45).toString(), unit: 'µg/m³', color: '#FFB347' },
      { label: 'PM1.0', value: Math.round(valRatio * 12).toString(), unit: 'µg/m³', color: '#f0f4ff' },
      { label: 'VOC', value: (valRatio * 0.3).toFixed(1), unit: 'ppm', color: '#00E5A0' },
    ], subT(t, 0.5, 0.7), 'left', 3);
  }
}

export const AIRSENSE_CAPTIONS = [
  'Plants emit gases into urban air…',
  'Sensors detect volatile compounds',
  'Monitoring PM2.5 and CO₂ levels',
  'Alerting users to air quality changes',
  'High precision atmospheric data collection',
];
