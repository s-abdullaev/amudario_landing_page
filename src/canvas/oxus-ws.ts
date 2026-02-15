import { lerp, subT, easeInOut } from '../utils';
import { drawCalloutBox } from './callout-box';
import { drawStationMast, drawSolarPanel } from './station-parts';
import { CottonField } from './components/CottonField';

const cottonField = new CottonField(1920, 1080); // Default size, or update on resize if needed? 
// FieldSystem generates relative to passed size, but plants have absolute coords?
// Actually FieldSystem generate() uses the passed w/h. If w/h changes significantly, we might need to regenerate.
// But for now, let's assume standard 1920 width for generation or make it dynamic.
// The draw() uses the pre-generated plants. If screen resizes, plants might look off.
// PROPER FIX: Check if w/h changed and regenerate.


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
  
  // Use new CottonField component
  // We need to persist the field instance or re-create it?
  // Ideally, instance should be created once. But drawOxusWS is a function.
  // For now, we will create it inside or attach it to the module scope if possible, 
  // but better to keep it simple and stateless-ish or use a memoization pattern if performance hits.
  // Given the previous pattern in Airsense, let's instantiate it at module level.
  
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
