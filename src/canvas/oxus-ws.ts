import { lerp, subT, easeInOut } from '../utils';
import { drawCalloutBox } from './callout-box';
import { drawStationMast, drawSolarPanel } from './station-parts';

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

  // Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#0a1a2a');
  skyGrad.addColorStop(1, '#152535');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Cotton field
  const horizon = h * 0.55;
  const bloomT = subT(t, 0.2, 0.8);
  ctx.save();
  ctx.fillStyle = '#0d1a12';
  ctx.fillRect(0, horizon, w, h - horizon);

  const rows = 12;
  for (let r = 0; r < rows; r++) {
    const prog = r / rows;
    const y = horizon + Math.pow(prog, 1.4) * (h - horizon);
    const scale = 0.3 + 0.7 * prog;
    const rowW = w * (0.6 + 2 * prog);
    const count = 8 + r * 2;
    const spacing = rowW / count;

    for (let p = 0; p < count; p++) {
      const px = w / 2 - rowW / 2 + p * spacing + (r % 2) * spacing * 0.5;
      const seed = r * 99 + p * 13;
      const wind = Math.sin(now + seed) * 3 * scale;

      // Bush
      ctx.beginPath();
      ctx.arc(px + wind, y, 25 * scale, 0, Math.PI, true);
      ctx.fillStyle = `rgba(30, ${60 + r * 5}, 40, ${0.4 + 0.6 * prog})`;
      ctx.fill();

      // Cotton bolls
      const numBolls = 2 + (seed % 2);
      for (let b = 0; b < numBolls; b++) {
        const bx = px + wind + Math.sin(seed + b) * 15 * scale;
        const by = y - Math.cos(seed + b) * 10 * scale;
        const open = Math.max(0, Math.min(1, bloomT * 1.5 + Math.sin(seed) * 0.5 - 0.2));
        const size = (4 + 6 * open) * scale;
        ctx.beginPath();
        ctx.arc(bx, by, size, 0, Math.PI * 2);
        const gb = Math.floor(lerp(40, 240, open));
        ctx.fillStyle = `rgb(${Math.floor(lerp(20, 240, open))}, ${gb}, ${Math.floor(lerp(20, 240, open))})`;
        ctx.fill();
      }
    }
  }
  ctx.restore();

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
    ctx.fillStyle = '#00E5A0'; ctx.fill();
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
    drawCalloutBox(ctx, sx + 20 * sc, sy - 60 * sc, 'FIELD CONDITIONS', [
      { label: 'Wind Speed', value: (12 + t * 15).toFixed(1), unit: 'km/h', color: '#00E5A0' },
      { label: 'Temperature', value: '28.5', unit: '°C', color: '#FFB347' },
      { label: 'Humidity', value: '42', unit: '%', color: '#4DA8FF' },
      { label: 'Pressure', value: '1012', unit: 'hPa', color: '#f0f4ff' },
    ], subT(t, 0.35, 0.55), 'left');
  }
}

export const OXUS_CAPTIONS = [
  'Monitoring vast cotton fields…',
  'Smart sensors track microclimate data',
  'Cotton buds opening in optimal conditions',
  'Real-time wind and weather analysis',
  'Ensuring healthy crop cycles with precision data',
];
