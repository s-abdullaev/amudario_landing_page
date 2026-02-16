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

  // ── Stevenson Screen on RIGHT arm ──
  ctx.save(); ctx.translate(0, -112);
  // Horizontal arm from mast
  ctx.beginPath();
  ctx.moveTo(6, 0); ctx.lineTo(50, 0);
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 2; ctx.stroke();
  // Short vertical hanger
  ctx.beginPath(); ctx.moveTo(50, 0); ctx.lineTo(50, 6);
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 1.5; ctx.stroke();
  // Screen body
  ctx.save(); ctx.translate(50, 6);
  const sw = 28;
  // Dome cap
  ctx.beginPath();
  ctx.ellipse(0, 0, sw / 2 + 2, 5, 0, Math.PI, 0);
  ctx.closePath();
  ctx.fillStyle = '#E0E0E0'; ctx.fill();
  ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 1; ctx.stroke();
  // Louver plates
  const lCount = 4;
  const lH = 3;
  const lGap = 4;
  for (let i = 0; i < lCount; i++) {
    const ly = 1 + i * (lH + lGap);
    if (i > 0) {
      ctx.fillStyle = 'rgba(40,40,40,0.12)';
      ctx.fillRect(-sw / 2 + 2, ly - lGap, sw - 4, lGap);
    }
    ctx.beginPath();
    ctx.roundRect(-sw / 2 - 2, ly, sw + 4, lH, 1);
    ctx.fillStyle = '#E8E8E8'; ctx.fill();
    ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 0.5; ctx.stroke();
  }
  // Side supports
  const sTop = 1;
  const sBot = 1 + (lCount - 1) * (lH + lGap) + lH;
  ctx.beginPath();
  ctx.moveTo(-sw / 2, sTop); ctx.lineTo(-sw / 2, sBot);
  ctx.moveTo(sw / 2, sTop); ctx.lineTo(sw / 2, sBot);
  ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 1; ctx.stroke();
  // Bottom cap
  ctx.beginPath();
  ctx.ellipse(0, sBot + 2, sw / 2 + 1, 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#D0D0D0'; ctx.fill();
  ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 0.5; ctx.stroke();
  ctx.restore(); // screen body
  ctx.restore(); // arm

  // ── Rain Gauge on LEFT arm ──
  ctx.save(); ctx.translate(0, -90);
  // Horizontal arm from mast
  ctx.beginPath();
  ctx.moveTo(-6, 0); ctx.lineTo(-42, 0);
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 2; ctx.stroke();
  // Gauge mounted at arm end
  ctx.save(); ctx.translate(-42, 0);
  // Funnel opening (wide rim at top)
  const rfw = 24;
  ctx.beginPath();
  ctx.rect(-rfw / 2 - 2, -20, rfw + 4, 3);
  ctx.fillStyle = '#D0D0D0'; ctx.fill();
  ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 1; ctx.stroke();
  // Funnel taper
  ctx.beginPath();
  ctx.moveTo(-rfw / 2, -17);
  ctx.lineTo(rfw / 2, -17);
  ctx.lineTo(8, -8);
  ctx.lineTo(-8, -8);
  ctx.closePath();
  ctx.fillStyle = '#E0E0E0'; ctx.fill();
  ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 0.5; ctx.stroke();
  // Cylinder body
  ctx.beginPath();
  ctx.roundRect(-8, -8, 16, 24, 1);
  ctx.fillStyle = '#E8E8E8'; ctx.fill();
  ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 1; ctx.stroke();
  // Water level indicator line
  ctx.beginPath();
  ctx.moveTo(-5, 8); ctx.lineTo(5, 8);
  ctx.strokeStyle = '#4DA8FF'; ctx.lineWidth = 1.5; ctx.stroke();
  // Bottom base
  ctx.beginPath();
  ctx.rect(-9, 16, 18, 3);
  ctx.fillStyle = '#D0D0D0'; ctx.fill();
  ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 0.5; ctx.stroke();
  ctx.restore(); // gauge body
  ctx.restore(); // arm

  // Cross-arm bar
  ctx.save(); ctx.translate(0, -140);
  ctx.fillStyle = '#A0A0A0';
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.roundRect(-65, -3, 130, 6, 2); ctx.fill(); ctx.stroke();

  // Wind vane (LEFT side — arrow with tail fin)
  ctx.save(); ctx.translate(-55, -3);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -18);
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 2; ctx.stroke();
  ctx.save(); ctx.translate(0, -18);
  ctx.rotate(Math.sin(now * 0.7) * 0.4 + t * 2);
  ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0);
  ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.moveTo(22, 0); ctx.lineTo(15, -5);
  ctx.moveTo(22, 0); ctx.lineTo(15, 5);
  ctx.strokeStyle = '#555'; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath();
  ctx.rect(-22, -7, 10, 14);
  ctx.fillStyle = '#555'; ctx.fill();
  ctx.restore(); ctx.restore();

  // Anemometer (RIGHT side — 3 spinning cups)
  ctx.save(); ctx.translate(55, -3);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -18);
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 2; ctx.stroke();
  const rot = t * 25 + now * 0.5;
  ctx.save(); ctx.translate(0, -18);
  ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a1a'; ctx.fill();
  ctx.save(); ctx.scale(1, 0.3);
  for (let a = 0; a < 3; a++) {
    const ang = rot + a * (Math.PI * 2 / 3);
    const cx = Math.cos(ang) * 18;
    const cy = Math.sin(ang) * 18;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cx, cy);
    ctx.strokeStyle = '#808080'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a'; ctx.fill();
  }
  ctx.restore(); ctx.restore(); ctx.restore();

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

  // Base stand
  ctx.save(); ctx.translate(0, 195);
  ctx.beginPath();
  ctx.ellipse(0, 0, 28, 6, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#C0C0C0'; ctx.fill();
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 1; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(-18, 4); ctx.lineTo(-24, 10); ctx.lineTo(-12, 10); ctx.closePath();
  ctx.moveTo(18, 4); ctx.lineTo(12, 10); ctx.lineTo(24, 10); ctx.closePath();
  ctx.fillStyle = '#B0B0B0'; ctx.fill();
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 0.5; ctx.stroke();
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