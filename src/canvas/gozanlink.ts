import { lerp, subT, easeInOut } from '../utils';
import { drawCalloutBox } from './callout-box';

/**
 * GOZANLINK — Smart greenhouse with growing tomatoes and indoor sensor.
 */
export function drawGozanlink(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
): void {
  ctx.clearRect(0, 0, w, h);
  const now = Date.now() / 1000;

  // Light greenhouse sky/backdrop
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#f0fff4'); // Mint cream
  skyGrad.addColorStop(1, '#e6fffa');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  const ghCX = w * 0.75;
  const ghCY = h * 0.42;
  const zoom = 1 + easeInOut(subT(t, 0.1, 0.4)) * 2;

  ctx.save();
  ctx.translate(ghCX, ghCY); ctx.scale(zoom, zoom); ctx.translate(-ghCX, -ghCY);

  ctx.fillStyle = '#f1f8e9'; // Light floor
  ctx.fillRect(0, h * 0.7, w, h * 0.3);

  // Greenhouse structure
  ctx.beginPath();
  ctx.moveTo(ghCX - 140, ghCY + 90); ctx.lineTo(ghCX - 140, ghCY - 20);
  ctx.quadraticCurveTo(ghCX, ghCY - 90, ghCX + 140, ghCY - 20);
  ctx.lineTo(ghCX + 140, ghCY + 90); ctx.closePath();
  const ghGrad = ctx.createLinearGradient(ghCX - 140, ghCY - 90, ghCX + 140, ghCY + 90);
  ghGrad.addColorStop(0, 'rgba(100,180,100,0.1)');
  ghGrad.addColorStop(1, 'rgba(50,120,50,0.06)');
  ctx.fillStyle = ghGrad; ctx.fill();
  ctx.strokeStyle = 'rgba(100,200,100,0.3)'; ctx.lineWidth = 1.5; ctx.stroke();

  // Glass pane lines
  ctx.beginPath();
  ctx.moveTo(ghCX, ghCY - 90); ctx.lineTo(ghCX, ghCY + 90);
  ctx.moveTo(ghCX - 70, ghCY - 60); ctx.lineTo(ghCX - 70, ghCY + 90);
  ctx.moveTo(ghCX + 70, ghCY - 60); ctx.lineTo(ghCX + 70, ghCY + 90);
  ctx.strokeStyle = 'rgba(100,200,100,0.12)'; ctx.lineWidth = 0.5; ctx.stroke();

  // Door (Front Center)
  ctx.fillStyle = 'rgba(20, 40, 20, 0.4)';
  ctx.fillRect(ghCX - 25, ghCY + 20, 50, 70);
  ctx.strokeStyle = 'rgba(100, 220, 100, 0.5)';
  ctx.lineWidth = 2;
  ctx.strokeRect(ghCX - 25, ghCY + 20, 50, 70);
  // Door handle
  ctx.beginPath(); ctx.arc(ghCX + 15, ghCY + 55, 3, 0, Math.PI*2); ctx.fillStyle='#ccc'; ctx.fill();

  // Chimney (Roof)
  ctx.fillStyle = '#2a3a2a';
  ctx.beginPath();
  ctx.moveTo(ghCX + 80, ghCY - 40);
  ctx.lineTo(ghCX + 80, ghCY - 100);
  ctx.lineTo(ghCX + 100, ghCY - 100);
  ctx.lineTo(ghCX + 100, ghCY - 30);
  ctx.closePath();
  ctx.fill();
  // Chimney cap
  ctx.fillStyle = '#1a2a1a';
  ctx.fillRect(ghCX + 78, ghCY - 105, 24, 5);
  // Smoke puffs
  if (t > 0.1) {
     const smokeT = (now * 0.5) % 1;
     ctx.fillStyle = `rgba(200,200,200,${0.3 * (1-smokeT)})`;
     ctx.beginPath(); ctx.arc(ghCX + 90, ghCY - 110 - smokeT * 30, 5 + smokeT * 10, 0, Math.PI*2); ctx.fill();
  }

  // Plants & tomatoes
  if (t > 0.15) {
    ctx.globalAlpha = subT(t, 0.15, 0.35);
    const tomatoT = subT(t, 0.35, 0.75);
    for (let row = 0; row < 4; row++) {
      const ry = ghCY + 10 + row * 22;
      for (let p = 0; p < 7; p++) {
        const px = ghCX - 80 + p * 26;
        const stemH = 16 + Math.sin(p * 2) * 4;
        ctx.strokeStyle = '#2a6a2a'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(px, ry); ctx.lineTo(px, ry - stemH); ctx.stroke();
        ctx.fillStyle = `rgba(${40 + row * 12},${110 + p * 12},${40 + row * 8},0.85)`;
        ctx.beginPath(); ctx.ellipse(px - 5, ry - stemH + 3, 7, 3.5, -0.4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.ellipse(px + 5, ry - stemH + 1, 6, 3, 0.4, 0, Math.PI * 2); ctx.fill();

        if ((row + p) % 2 === 0 && tomatoT > 0) {
          const tSize = 3 + tomatoT * 3;
          const ripeness = Math.min(1, tomatoT * 1.5);
          ctx.beginPath(); ctx.arc(px + 3, ry - stemH + 9, tSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgb(${Math.floor(lerp(50, 220, ripeness))},${Math.floor(lerp(120, 35, ripeness))},25)`;
          ctx.fill();
          ctx.beginPath(); ctx.arc(px + 1, ry - stemH + 7, tSize * 0.3, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255,255,255,${ripeness * 0.25})`; ctx.fill();
        }
      }
    }
    ctx.globalAlpha = 1;
  }

  // Indoor sensor
  const sensorX = ghCX + 90;
  const sensorY = ghCY + 30;
  ctx.save(); ctx.translate(sensorX, sensorY);
  ctx.fillStyle = '#E8E8E8';
  ctx.beginPath(); ctx.roundRect(-12, -16, 24, 32, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(0,229,160,0.5)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#b3e5fc'; ctx.fillRect(-8, -12, 16, 12); // Light blue screen
  ctx.beginPath(); ctx.arc(0, 10, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#00E5A0'; ctx.globalAlpha = 0.5 + Math.sin(now * 4) * 0.5; ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.restore(); // zoom

  // Callout — originate from the sensor device (screen-space coords after zoom)
  if (t > 0.4) {
    const envT = subT(t, 0.4, 0.8);
    const deviceScreenX = ghCX + 90 * zoom;
    const deviceScreenY = ghCY + 30 * zoom;
    drawCalloutBox(ctx, deviceScreenX, deviceScreenY - 40, 'GREENHOUSE CLIMATE', [
      { label: 'Temperature', value: `${lerp(18, 26.3, envT).toFixed(1)}`, unit: '°C', color: '#FF6B6B' },
      { label: 'Humidity', value: `${lerp(50, 74, envT).toFixed(0)}`, unit: '%', color: '#4DA8FF' },
      { label: 'CO₂', value: `${lerp(350, 520, envT).toFixed(0)}`, unit: 'ppm', color: '#00E5A0' },
      { label: 'Wind', value: `${lerp(0.5, 1.8, envT).toFixed(1)}`, unit: 'm/s', color: '#f0f4ff' },
      { label: 'Gas Usage', value: `${lerp(1.0, 3.4, envT).toFixed(1)}`, unit: 'm³/h', color: '#FFB347' },
    ], subT(t, 0.4, 0.6), 'left', 3);
  }
}

export const GOZAN_CAPTIONS = [
  'Inside the smart greenhouse…',
  'Temperature and humidity optimized',
  'Tomatoes ripening under ideal conditions',
  'Precision climate control in action',
];
