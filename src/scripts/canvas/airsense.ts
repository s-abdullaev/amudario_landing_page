import { lerp, subT, easeInOut } from '../utils';
import { drawConnector, drawGlassPanel, drawStat, canvasLang } from './callout-box';
import { drawStationMast } from './station-parts';

const PANEL_LABELS: Record<string, Record<string, string>> = {
  en: { title: 'AIR QUALITY INDEX', good: 'Good', moderate: 'Moderate', unhealthy: 'Unhealthy' },
  uz: { title: 'ҲАВО СИФАТИ ИНДЕКСИ', good: 'Яхши', moderate: 'Ўртача', unhealthy: 'Зарарли' },
  ru: { title: 'ИНДЕКС КАЧЕСТВА ВОЗДУХА', good: 'Хорошо', moderate: 'Умеренно', unhealthy: 'Вредно' },
};

/** Air-quality panel with a masked-face icon that colors with the AQI. */
function drawAirPanel(
  ctx: CanvasRenderingContext2D,
  dx: number, dy: number,
  appear: number, valRatio: number, now: number,
  w: number, h: number
): void {
  const W = 268, H = 168;
  const bx = Math.max(10, Math.min(w - W - 10, dx - W - 70));
  const by = Math.max(10, Math.min(h - H - 10, dy - H - 30));

  const L = PANEL_LABELS[canvasLang()];
  const aqi = Math.round(valRatio * 87);
  const [status, sColor] = aqi > 100 ? [L.unhealthy, '#FF6B6B'] : aqi > 50 ? [L.moderate, '#FFB347'] : [L.good, '#00E5A0'];

  ctx.save();
  ctx.globalAlpha = appear;
  drawConnector(ctx, dx, dy, bx + W, by + H * 0.6, 'rgba(255,179,71,0.4)', sColor);
  drawGlassPanel(ctx, bx, by, W, H, aqi > 50 ? 'rgba(255,179,71,0.4)' : 'rgba(0,229,160,0.35)');

  // Icon cell: face wearing a mask
  const ib = 50;
  ctx.strokeStyle = `${sColor}66`; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(bx + 14, by + 14, ib, ib, 8); ctx.stroke();
  ctx.save();
  ctx.translate(bx + 14 + ib / 2, by + 14 + ib / 2);
  // Head
  ctx.strokeStyle = '#f0f4ff'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, 0, 16, 0, Math.PI * 2); ctx.stroke();
  // Ears
  ctx.beginPath(); ctx.arc(-16, 1, 3, Math.PI * 0.5, Math.PI * 1.5); ctx.stroke();
  ctx.beginPath(); ctx.arc(16, 1, 3, -Math.PI * 0.5, Math.PI * 0.5); ctx.stroke();
  // Eyes + brows
  ctx.fillStyle = '#f0f4ff';
  ctx.beginPath(); ctx.ellipse(-6, -4, 2, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(6, -4, 2, 1.4, 0, 0, Math.PI * 2); ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.beginPath(); ctx.moveTo(-9, -9); ctx.lineTo(-3, -9); ctx.moveTo(3, -9); ctx.lineTo(9, -9); ctx.stroke();
  // Mask — tinted by air quality
  ctx.beginPath();
  ctx.moveTo(-13, 1);
  ctx.quadraticCurveTo(0, -4, 13, 1);
  ctx.quadraticCurveTo(11, 12, 0, 15);
  ctx.quadraticCurveTo(-11, 12, -13, 1);
  ctx.closePath();
  ctx.fillStyle = sColor; ctx.globalAlpha = appear * 0.85; ctx.fill();
  ctx.globalAlpha = appear;
  // Straps + pleats
  ctx.strokeStyle = sColor; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(-13, 2); ctx.lineTo(-16, 0); ctx.moveTo(13, 2); ctx.lineTo(16, 0); ctx.stroke();
  ctx.strokeStyle = 'rgba(10,20,40,0.55)';
  ctx.beginPath();
  ctx.moveTo(-7, 4); ctx.lineTo(7, 4);
  ctx.moveTo(-8, 7); ctx.lineTo(8, 7);
  ctx.moveTo(-7, 10); ctx.lineTo(7, 10);
  ctx.stroke();
  ctx.restore();

  // Header: AQI number + status
  ctx.textAlign = 'left';
  ctx.font = '400 10px Inter'; ctx.fillStyle = 'rgba(240,244,255,0.5)';
  ctx.fillText(L.title, bx + 76, by + 28);
  ctx.font = '700 26px Montserrat'; ctx.fillStyle = sColor;
  ctx.fillText(String(aqi), bx + 76, by + 56);
  const aw = ctx.measureText(String(aqi)).width;
  ctx.font = '600 12px Inter';
  ctx.fillText(status, bx + 76 + aw + 10, by + 56);

  ctx.strokeStyle = 'rgba(240,244,255,0.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(bx + 14, by + 78); ctx.lineTo(bx + W - 14, by + 78); ctx.stroke();

  // Pollutant grid
  drawStat(ctx, bx + 16, by + 96, 'PM2.5', Math.round(valRatio * 28).toString(), 'µg/m³', '#FF6B6B');
  drawStat(ctx, bx + 104, by + 96, 'PM10', Math.round(valRatio * 45).toString(), 'µg/m³', '#FFB347');
  drawStat(ctx, bx + 192, by + 96, 'PM1.0', Math.round(valRatio * 12).toString(), 'µg/m³');
  drawStat(ctx, bx + 16, by + 132, 'CO₂', Math.round(valRatio * 412).toString(), 'ppm', '#4DA8FF');
  drawStat(ctx, bx + 104, by + 132, 'VOC', (valRatio * 0.3).toFixed(1), 'ppm', '#00E5A0');
  drawStat(ctx, bx + 192, by + 132, 'NO₂', (valRatio * 21).toFixed(0), 'ppb');
  ctx.restore();
}
import { SmokeSystem } from './systems/SmokeSystem';
import { CitySkyline } from './components/CitySkyline';

// Initialize Systems
const smokeSystem = new SmokeSystem(150);
const citySkyline = new CitySkyline(25);

// Pre-generated park trees (keeping local for now as it's simple)
const parkTrees = Array.from({ length: 8 }, (_, i) => ({
  x: 0.3 + Math.abs(Math.sin(i * 4.7)) * 0.5,
  size: 20 + Math.abs(Math.sin(i * 2.3)) * 25,
  hue: 100 + Math.floor(Math.abs(Math.sin(i * 3.1)) * 60),
}));

// Pre-generated asphalt stains — machine oil blotches & rusty pollutant patches
const stains = Array.from({ length: 16 }, (_, i) => ({
  x: Math.sin(i * 12.9898) * 0.5 + 0.5,
  y: 0.12 + (Math.sin(i * 78.233) * 0.5 + 0.5) * 0.82,
  r: 10 + (Math.sin(i * 39.425) * 0.5 + 0.5) * 26,
  stretch: 1.6 + (Math.sin(i * 5.7) * 0.5 + 0.5) * 1.6,
  rot: Math.sin(i * 3.3) * 0.35,
  oil: i % 3 !== 0, // most are dark oil, every third a rusty pollutant patch
  delay: (i % 6) * 0.07,
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

  // City skyline
  citySkyline.draw(ctx, w, horizon);

  // Ground / park — asphalt darkens with grime as pollution builds
  const gGrey = Math.floor(lerp(226, 178, pollLevel));
  ctx.fillStyle = `rgb(${gGrey}, ${gGrey + 6}, ${gGrey + 14})`;
  ctx.fillRect(0, horizon, w, h - horizon);

  // Oil stains & pollutant patches seep across the asphalt
  const stainT = subT(t, 0.2, 0.7);
  if (stainT > 0.01) {
    // Faint tire-grime bands
    for (let b = 0; b < 2; b++) {
      const by = horizon + (0.32 + b * 0.3) * (h - horizon);
      ctx.fillStyle = `rgba(52, 54, 60, ${0.07 * stainT})`;
      ctx.fillRect(0, by, w, 4 + b * 3);
    }

    stains.forEach(s => {
      const a = Math.max(0, Math.min(1, stainT * 1.7 - s.delay));
      if (a <= 0) return;
      const sx = s.x * w;
      const depth = s.y;
      const sy = horizon + depth * (h - horizon);
      const scale = 0.35 + depth * 0.9;
      const R = s.r * s.stretch * scale * (0.6 + 0.4 * a); // stain spreads as it soaks in

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(s.rot);
      ctx.scale(1, 0.36); // flatten into road-plane ellipse
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, R);
      if (s.oil) {
        g.addColorStop(0, `rgba(28, 30, 38, ${0.4 * a})`);
        g.addColorStop(0.65, `rgba(40, 42, 50, ${0.22 * a})`);
        g.addColorStop(1, 'rgba(40, 42, 50, 0)');
      } else {
        g.addColorStop(0, `rgba(98, 72, 42, ${0.32 * a})`);
        g.addColorStop(1, 'rgba(98, 72, 42, 0)');
      }
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();

      // Iridescent oil sheen — subtle petrol rainbow on the dark blotches
      if (s.oil && a > 0.4) {
        const sheenA = (a - 0.4) * 0.5;
        ctx.lineWidth = 1.5;
        ctx.strokeStyle = `rgba(140, 110, 190, ${0.14 * sheenA})`;
        ctx.beginPath(); ctx.arc(0, 0, R * 0.55, 0, Math.PI * 2); ctx.stroke();
        ctx.strokeStyle = `rgba(90, 160, 130, ${0.12 * sheenA})`;
        ctx.beginPath(); ctx.arc(0, 0, R * 0.72, 0, Math.PI * 2); ctx.stroke();
      }
      ctx.restore();
    });
  }

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

  // Smoke Particles (System) — every chimney smokes
  smokeSystem.updateAndDraw(ctx, t, now, chimneys, horizon);

  // Airsense station
  
  // Scale similar to OXUS for consistent size; zooms toward the camera on scroll
  const sc = Math.min(w, h) / 600;
  const zoom = 1 + easeInOut(subT(t, 0.25, 0.6)) * 0.55;
  ctx.save();
  // Shift down as it zooms so the mast top stays inside the frame
  ctx.translate(stationX, stationY - 50 + (zoom - 1) * 200);
  ctx.scale(sc * zoom, sc * zoom);

  // Slanted solar panel on a T-shaped rack, behind the pole (drawn first)
  ctx.save(); ctx.translate(0, -20);
  ctx.strokeStyle = '#868e93'; ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(-56, 26); ctx.lineTo(56, 26); // crossbar under panel
  ctx.moveTo(0, 26); ctx.lineTo(0, 48);    // stem down to pole clamp
  ctx.stroke();
  ctx.transform(1, 0, -0.1, 1, 0, 0); // slight skew — tilted toward the sun
  const spw = 140, sph = 50;
  ctx.beginPath(); ctx.roundRect(-spw / 2 - 3, -sph / 2 - 3, spw + 6, sph + 6, 3);
  ctx.fillStyle = '#d9dcde'; ctx.fill();
  ctx.strokeStyle = '#9aa1a6'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#24476b';
  ctx.fillRect(-spw / 2, -sph / 2, spw, sph);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 0.7;
  for (let gx = -spw / 2 + 12; gx < spw / 2; gx += 12) {
    ctx.beginPath(); ctx.moveTo(gx, -sph / 2); ctx.lineTo(gx, sph / 2); ctx.stroke();
  }
  for (let gy = -sph / 2 + 13; gy < sph / 2; gy += 13) {
    ctx.beginPath(); ctx.moveTo(-spw / 2, gy); ctx.lineTo(spw / 2, gy); ctx.stroke();
  }
  const sheen = ctx.createLinearGradient(-spw / 2, -sph / 2, spw / 2, sph / 2);
  sheen.addColorStop(0, 'rgba(255,255,255,0.2)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen; ctx.fillRect(-spw / 2, -sph / 2, spw, sph);
  ctx.restore();

  // Shared Mast — drawn after the panel so the pole passes in front
  drawStationMast(ctx);

  // Mast extension above the sensor head
  ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(0, -196);
  ctx.strokeStyle = '#b0b6ba'; ctx.lineWidth = 5; ctx.stroke();

  // Gas sensors mounted above the box
  for (const gs of [{ x: -13, y: -162 }, { x: 13, y: -182 }]) {
    ctx.save(); ctx.translate(gs.x, gs.y);
    // Clamp arm to pole
    ctx.beginPath(); ctx.moveTo(gs.x < 0 ? 13 : -13, 0); ctx.lineTo(gs.x < 0 ? 5 : -5, 0);
    ctx.strokeStyle = '#868e93'; ctx.lineWidth = 2.5; ctx.stroke();
    // Cylindrical sensor body
    ctx.beginPath(); ctx.roundRect(-7, -9, 14, 18, 2);
    ctx.fillStyle = '#e8e8e8'; ctx.fill();
    ctx.strokeStyle = '#a0a0a0'; ctx.lineWidth = 1; ctx.stroke();
    // Cap
    ctx.beginPath(); ctx.ellipse(0, -9, 7, 2.5, 0, 0, Math.PI * 2);
    ctx.fillStyle = '#c8cdd1'; ctx.fill(); ctx.stroke();
    // Intake slots
    ctx.strokeStyle = 'rgba(120,125,130,0.6)'; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(-4, -2); ctx.lineTo(4, -2);
    ctx.moveTo(-4, 2); ctx.lineTo(4, 2); ctx.stroke();
    // Tiny status LED
    ctx.beginPath(); ctx.arc(0, 6, 1.5, 0, Math.PI * 2);
    ctx.fillStyle = '#00E5A0';
    ctx.globalAlpha = 0.5 + Math.sin(now * 4 + gs.y) * 0.5; ctx.fill();
    ctx.globalAlpha = 1;
    ctx.restore();
  }

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

  // Product label
  ctx.fillStyle = '#2b2f36';
  ctx.font = '700 9px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('AirSense', 0, 28);
  ctx.textAlign = 'left';
  
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
    const appear = easeInOut(subT(t, 0.5, 0.7));
    if (appear > 0.01) drawAirPanel(ctx, stationX, stationY - 70, appear, valRatio, now, w, h);
  }
}