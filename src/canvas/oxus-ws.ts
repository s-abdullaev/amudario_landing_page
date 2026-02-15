import { lerp, subT, easeInOut } from '../utils';
import { drawCalloutBox } from './callout-box';
import { drawStationMast, drawSolarPanel } from './station-parts';
import { CottonField } from './components/CottonField';

const cottonField = new CottonField();

/**
 * OXUS WS — Cotton field with weather station, scroll-driven anemometer.
 */
export function drawOxusWS(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
): void {
  ctx.clearRect(0, 0, w, h);
  const now = Date.now() / 1000;

  // Sky - Light Theme (Day)
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#e0f7fa'); // Very light cyan
  skyGrad.addColorStop(1, '#b2ebf2'); // Slightly darker cyan
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Cotton field
  const horizon = h * 0.55;
  
  cottonField.draw(ctx, t, now, w, h);

  // Weather Station
  const sc = Math.min(w, h) / 600;
  const sx = w * 0.75;
  const sy = h * 0.48;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(sc, sc);

  // Pole (Shared)
  drawStationMast(ctx);

  // Cross-arm + Anemometer
  ctx.save(); ctx.translate(0, -140);
  ctx.fillStyle = '#A0A0A0';
  ctx.beginPath(); ctx.roundRect(-60, -4, 120, 8, 2); ctx.fill(); ctx.stroke();

  ctx.save(); ctx.translate(-55, -5);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -10); ctx.stroke();
  const rot = t * 25 + now * 0.5;
  ctx.save(); ctx.translate(0, -10); ctx.scale(1, 0.3);
  for (let a = 0; a < 3; a++) {
    const ang = rot + a * (Math.PI * 2 / 3);
    const cx = Math.cos(ang) * 15;
    const cy = Math.sin(ang) * 15;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cx, cy);
    ctx.strokeStyle = '#808080'; ctx.lineWidth = 1; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a'; ctx.fill();
  }
  ctx.restore(); ctx.restore();

  // Wind vane
  ctx.save(); ctx.translate(55, -5);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -10); ctx.stroke();
  ctx.save(); ctx.translate(0, -10);
  ctx.rotate(Math.sin(now) * 0.5 + t * 2);
  ctx.beginPath();
  ctx.moveTo(-15, 0); ctx.lineTo(15, 0); ctx.lineTo(10, -5);
  ctx.moveTo(15, 0); ctx.lineTo(10, 5);
  ctx.strokeStyle = '#00B4D8'; ctx.lineWidth = 2; ctx.stroke();
  ctx.restore(); ctx.restore();
  ctx.restore(); // cross-arm

  // Solar panel (Shared)
  drawSolarPanel(ctx);

  // Sensor box
  ctx.save(); ctx.translate(0, -60);
  ctx.fillStyle = '#E0E0E0';
  ctx.beginPath(); ctx.roundRect(-15, -20, 30, 40, 4); ctx.fill();
  ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath(); ctx.arc(0, -10, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#00E5A0';
  ctx.globalAlpha = 0.5 + Math.sin(now * 3) * 0.5; ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.restore(); // station

  // Callout
  if (t > 0.35) {
    const envT = subT(t, 0.35, 0.85);
    drawCalloutBox(ctx, sx, sy - 60 * sc, 'FIELD CONDITIONS', [
      { label: 'Temperature', value: lerp(18, 24.5, envT).toFixed(1), unit: '°C', color: '#FFB347' },
      { label: 'Humidity', value: lerp(40, 62, envT).toFixed(0), unit: '%', color: '#4DA8FF' },
      { label: 'Wind Speed', value: lerp(0.5, 3.2, envT).toFixed(1), unit: 'm/s', color: '#00E5A0' },
      { label: 'Soil Wetness', value: lerp(25, 41, envT).toFixed(0), unit: '%', color: '#4DA8FF' },
      { label: 'Soil Temp', value: lerp(14, 18.7, envT).toFixed(1), unit: '°C', color: '#FFB347' },
      { label: 'Soil EC', value: lerp(0.8, 1.4, envT).toFixed(1), unit: 'dS/m', color: '#f0f4ff' },
      { label: 'Rain', value: '0.0', unit: 'mm', color: '#4DA8FF' },
    ], subT(t, 0.35, 0.55), 'right');
  }
}

export const OXUS_CAPTIONS = [
  'Monitoring vast cotton fields…',
  'Smart sensors track microclimate data',
  'Cotton buds opening in optimal conditions',
  'Real-time wind and weather analysis',
  'Ensuring healthy crop cycles with precision data',
];
