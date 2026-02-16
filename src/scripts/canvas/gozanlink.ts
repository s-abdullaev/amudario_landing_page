import { lerp, subT, easeInOut } from '../utils';
import { drawCalloutBox } from './callout-box';

// Pre-generate snowflakes
interface Snowflake {
  x: number; y: number; size: number;
  speedY: number; drift: number; driftFreq: number; phase: number;
}
const SNOW_COUNT = 80;
const snowflakes: Snowflake[] = [];
for (let i = 0; i < SNOW_COUNT; i++) {
  snowflakes.push({
    x: Math.random(),
    y: Math.random(),
    size: 1 + Math.random() * 2.5,
    speedY: 0.015 + Math.random() * 0.025,
    drift: 8 + Math.random() * 15,
    driftFreq: 0.5 + Math.random() * 1.5,
    phase: Math.random() * Math.PI * 2,
  });
}

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

  // Night blue sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
  skyGrad.addColorStop(0, '#0a1628');
  skyGrad.addColorStop(0.4, '#142a4f');
  skyGrad.addColorStop(0.7, '#1c3a6e');
  skyGrad.addColorStop(1, '#243b5e');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, h);

  // Stars
  ctx.fillStyle = 'rgba(255,255,255,0.7)';
  for (let i = 0; i < 60; i++) {
    const sx = (i * 137 + 43) % w;
    const sy = (i * 89 + 17) % (h * 0.6);
    const starSize = 0.5 + (i % 4) * 0.4;
    const twinkle = 0.4 + Math.sin(now * 1.5 + i * 0.7) * 0.3;
    ctx.globalAlpha = twinkle;
    ctx.beginPath(); ctx.arc(sx, sy, starSize, 0, Math.PI * 2); ctx.fill();
  }
  ctx.globalAlpha = 1;

  const horizon = h * 0.7;

  // Snowy ground
  const groundGrad = ctx.createLinearGradient(0, horizon, 0, h);
  groundGrad.addColorStop(0, '#c8d6e5');
  groundGrad.addColorStop(1, '#a4b5c9');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, horizon, w, h - horizon);

  // Falling snowflakes
  for (const s of snowflakes) {
    const sy = ((s.y + now * s.speedY) % 1.1) * h;
    const sx = s.x * w + Math.sin(now * s.driftFreq + s.phase) * s.drift;
    const alpha = 0.4 + s.size * 0.15;
    ctx.beginPath();
    ctx.arc(sx, sy, s.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fill();
  }

  const ghCX = w * 0.75;
  const ghCY = horizon - 90;
  const zoom = 1 + easeInOut(subT(t, 0.1, 0.4)) * 2;

  ctx.save();
  ctx.translate(ghCX, ghCY); ctx.scale(zoom, zoom); ctx.translate(-ghCX, -ghCY);

  // Greenhouse structure — opaque walls with green-tinted glass
  ctx.beginPath();
  ctx.moveTo(ghCX - 140, ghCY + 90); ctx.lineTo(ghCX - 140, ghCY - 20);
  ctx.quadraticCurveTo(ghCX, ghCY - 90, ghCX + 140, ghCY - 20);
  ctx.lineTo(ghCX + 140, ghCY + 90); ctx.closePath();
  const ghGrad = ctx.createLinearGradient(ghCX - 140, ghCY - 90, ghCX + 140, ghCY + 90);
  ghGrad.addColorStop(0, '#c8e6c9');
  ghGrad.addColorStop(0.5, '#a5d6a7');
  ghGrad.addColorStop(1, '#81c784');
  ctx.fillStyle = ghGrad; ctx.fill();
  ctx.strokeStyle = '#388e3c'; ctx.lineWidth = 2; ctx.stroke();

  // Concrete/metal base strip
  ctx.fillStyle = '#78909c';
  ctx.fillRect(ghCX - 140, ghCY + 80, 280, 10);

  // Glass pane lines
  ctx.beginPath();
  ctx.moveTo(ghCX, ghCY - 90); ctx.lineTo(ghCX, ghCY + 90);
  ctx.moveTo(ghCX - 70, ghCY - 60); ctx.lineTo(ghCX - 70, ghCY + 90);
  ctx.moveTo(ghCX + 70, ghCY - 60); ctx.lineTo(ghCX + 70, ghCY + 90);
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'; ctx.lineWidth = 1; ctx.stroke();

  // Horizontal pane divider
  ctx.beginPath();
  ctx.moveTo(ghCX - 138, ghCY + 30); ctx.lineTo(ghCX + 138, ghCY + 30);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)'; ctx.lineWidth = 1; ctx.stroke();

  // Glass sheen highlight
  ctx.beginPath();
  ctx.moveTo(ghCX - 120, ghCY + 90); ctx.lineTo(ghCX - 120, ghCY - 10);
  ctx.quadraticCurveTo(ghCX - 50, ghCY - 70, ghCX - 10, ghCY - 20);
  ctx.lineTo(ghCX - 10, ghCY + 90); ctx.closePath();
  ctx.fillStyle = 'rgba(255,255,255,0.15)'; ctx.fill();

  // Door (Front Center) — fades away as greenhouse zooms in
  const doorAlpha = 1 - easeInOut(subT(t, 0.1, 0.35));
  if (doorAlpha > 0.01) {
    ctx.save();
    ctx.globalAlpha = doorAlpha;
    ctx.fillStyle = '#2e7d32';
    ctx.fillRect(ghCX - 25, ghCY + 20, 50, 70);
    ctx.strokeStyle = '#1b5e20';
    ctx.lineWidth = 2;
    ctx.strokeRect(ghCX - 25, ghCY + 20, 50, 70);
    // Door window
    ctx.fillStyle = 'rgba(200,230,200,0.6)';
    ctx.fillRect(ghCX - 18, ghCY + 26, 36, 30);
    ctx.strokeStyle = '#1b5e20'; ctx.lineWidth = 1;
    ctx.strokeRect(ghCX - 18, ghCY + 26, 36, 30);
    // Door handle
    ctx.beginPath(); ctx.arc(ghCX + 15, ghCY + 65, 3, 0, Math.PI*2); ctx.fillStyle='#bbb'; ctx.fill();
    ctx.restore();
  }

  // Chimney (Roof)
  ctx.fillStyle = '#546e7a';
  ctx.beginPath();
  ctx.moveTo(ghCX + 80, ghCY - 40);
  ctx.lineTo(ghCX + 80, ghCY - 100);
  ctx.lineTo(ghCX + 100, ghCY - 100);
  ctx.lineTo(ghCX + 100, ghCY - 30);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = '#37474f'; ctx.lineWidth = 1; ctx.stroke();
  // Chimney cap
  ctx.fillStyle = '#37474f';
  ctx.fillRect(ghCX + 76, ghCY - 105, 28, 6);
  // Smoke puffs
  if (t > 0.1) {
     for (let s = 0; s < 3; s++) {
       const smokeT = ((now * 0.4 + s * 0.35) % 1);
       ctx.fillStyle = `rgba(210,210,210,${0.4 * (1-smokeT)})`;
       const sx = ghCX + 90 + Math.sin(smokeT * 3 + s) * 6;
       ctx.beginPath(); ctx.arc(sx, ghCY - 110 - smokeT * 40, 4 + smokeT * 12, 0, Math.PI*2); ctx.fill();
     }
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