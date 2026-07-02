import { lerp, subT, easeInOut } from '../utils';
import { drawConnector, drawGlassPanel, drawStat, canvasLang } from './callout-box';

const PANEL_LABELS: Record<string, Record<string, string>> = {
  en: {
    title: 'GREENHOUSE CLIMATE', outage: '⚡ POWER OUTAGE', backup: 'Backup heating: ON',
    indoorT: 'Indoor Temp', humidity: 'Humidity', gas: 'Gas Usage', outside: 'Outside', grid: 'Grid Voltage',
  },
  uz: {
    title: 'ИССИҚХОНА ИҚЛИМИ', outage: '⚡ ЭЛЕКТР УЗИЛИШИ', backup: 'Заҳира иситиш: ЁҚИҚ',
    indoorT: 'Ички ҳарорат', humidity: 'Намлик', gas: 'Газ сарфи', outside: 'Ташқарида', grid: 'Тармоқ кучланиши',
  },
  ru: {
    title: 'КЛИМАТ ТЕПЛИЦЫ', outage: '⚡ ОТКЛЮЧЕНИЕ СЕТИ', backup: 'Резервный обогрев: ВКЛ',
    indoorT: 'Темп. внутри', humidity: 'Влажность', gas: 'Расход газа', outside: 'Снаружи', grid: 'Напряжение сети',
  },
};

/** Greenhouse climate panel with a blinking power-outage warning. */
function drawGozanPanel(
  ctx: CanvasRenderingContext2D,
  dx: number, dy: number,
  appear: number, envT: number, now: number,
  w: number, h: number
): void {
  const W = 268, H = 168;
  const bx = Math.max(10, Math.min(w - W - 10, dx - W - 60));
  const by = Math.max(10, Math.min(h - H - 10, dy - H - 20));

  ctx.save();
  ctx.globalAlpha = appear;
  drawConnector(ctx, dx, dy, bx + W, by + H * 0.6, 'rgba(255,179,71,0.4)', '#FFB347');
  drawGlassPanel(ctx, bx, by, W, H, 'rgba(255,179,71,0.4)');

  // Icon cell: blinking electricity-outage warning triangle
  const ib = 50;
  ctx.strokeStyle = 'rgba(255,179,71,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(bx + 14, by + 14, ib, ib, 8); ctx.stroke();
  const blink = 0.5 + 0.5 * Math.sin(now * 5);
  ctx.save();
  ctx.translate(bx + 14 + ib / 2, by + 14 + ib / 2 + 2);
  // Triangle
  ctx.beginPath();
  ctx.moveTo(0, -16); ctx.lineTo(16, 12); ctx.lineTo(-16, 12);
  ctx.closePath();
  ctx.fillStyle = `rgba(255,179,71,${0.12 + 0.3 * blink})`;
  ctx.fill();
  ctx.strokeStyle = '#FFB347'; ctx.lineWidth = 2; ctx.lineJoin = 'round'; ctx.stroke();
  // Lightning bolt
  ctx.globalAlpha = appear * (0.55 + 0.45 * blink);
  ctx.beginPath();
  ctx.moveTo(3, -8); ctx.lineTo(-4, 1); ctx.lineTo(0, 1);
  ctx.lineTo(-2, 8); ctx.lineTo(5, -1); ctx.lineTo(1, -1);
  ctx.closePath();
  ctx.fillStyle = '#FFB347'; ctx.fill();
  ctx.restore();

  // Header
  const L = PANEL_LABELS[canvasLang()];
  ctx.textAlign = 'left';
  ctx.font = '400 10px Inter'; ctx.fillStyle = 'rgba(240,244,255,0.5)';
  ctx.fillText(L.title, bx + 76, by + 28);
  ctx.globalAlpha = appear * (0.55 + 0.45 * blink);
  ctx.font = '700 14px Montserrat'; ctx.fillStyle = '#FFB347';
  ctx.fillText(L.outage, bx + 76, by + 48);
  ctx.globalAlpha = appear;
  ctx.font = '400 10px Inter'; ctx.fillStyle = '#00E5A0';
  ctx.fillText(L.backup, bx + 76, by + 64);

  ctx.strokeStyle = 'rgba(240,244,255,0.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(bx + 14, by + 78); ctx.lineTo(bx + W - 14, by + 78); ctx.stroke();

  // Indoor climate grid
  drawStat(ctx, bx + 16, by + 96, L.indoorT, lerp(18, 26.3, envT).toFixed(1), '°C', '#FF6B6B');
  drawStat(ctx, bx + 104, by + 96, L.humidity, lerp(50, 74, envT).toFixed(0), '%', '#4DA8FF');
  drawStat(ctx, bx + 192, by + 96, 'CO₂', lerp(350, 520, envT).toFixed(0), 'ppm', '#00E5A0');
  drawStat(ctx, bx + 16, by + 132, L.gas, lerp(1.0, 3.4, envT).toFixed(1), 'm³/h', '#FFB347');
  drawStat(ctx, bx + 104, by + 132, L.outside, '−6.5', '°C');
  drawStat(ctx, bx + 192, by + 132, L.grid, '182', 'V', '#FF6B6B');
  ctx.restore();
}

// Pre-generate snowflakes
interface Snowflake {
  x: number; y: number; size: number;
  speedY: number; drift: number; driftFreq: number; phase: number;
}
const SNOW_COUNT = 80;
const snowflakes: Snowflake[] = [];

// Pre-generated ground snow patches — drifts that build up as it keeps snowing
const snowPatches = Array.from({ length: 12 }, (_, i) => ({
  x: Math.sin(i * 12.9898) * 0.5 + 0.5,
  y: 0.15 + (Math.sin(i * 78.233) * 0.5 + 0.5) * 0.75,
  r: 22 + (Math.sin(i * 39.425) * 0.5 + 0.5) * 48,
  delay: (i % 5) * 0.09,
}));
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

  // Snow patches accumulate on the ground as the storm continues
  const accumT = subT(t, 0.15, 0.75);
  if (accumT > 0.01) {
    for (const sp of snowPatches) {
      const a = Math.max(0, Math.min(1, accumT * 1.6 - sp.delay));
      if (a <= 0) continue;
      const px = sp.x * w;
      const py = horizon + sp.y * (h - horizon);
      const depth = 0.4 + sp.y * 0.8;
      const R = sp.r * depth * (0.5 + 0.5 * a); // drift spreads as snow keeps falling
      ctx.save();
      ctx.translate(px, py);
      ctx.scale(1, 0.3); // flatten into ground-plane drift
      const g = ctx.createRadialGradient(0, 0, 1, 0, 0, R);
      g.addColorStop(0, `rgba(255,255,255,${0.9 * a})`);
      g.addColorStop(0.7, `rgba(246,250,255,${0.5 * a})`);
      g.addColorStop(1, 'rgba(246,250,255,0)');
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(0, 0, R, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }
  }

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

  // Chimney (Roof) — drawn first so the dome hides its base inside the greenhouse
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

  // Snow builds up along the greenhouse roof
  if (accumT > 0.02) {
    const th = 3 + accumT * 9; // snow depth grows with the storm
    const x0 = ghCX - 140, y0 = ghCY - 20;
    const cx = ghCX, cy = ghCY - 90;
    const x1 = ghCX + 140, y1 = ghCY - 20;
    const N = 26;
    const qx = (u: number) => (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * cx + u * u * x1;
    const qy = (u: number) => (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * cy + u * u * y1;

    ctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      if (i === 0) ctx.moveTo(qx(u), qy(u)); else ctx.lineTo(qx(u), qy(u));
    }
    for (let i = N; i >= 0; i--) {
      const u = i / N;
      const taper = Math.sin(Math.PI * u); // deepest at the crown
      const bump = Math.sin(u * 26) * 1.5 * accumT; // soft uneven drift edge
      ctx.lineTo(qx(u), qy(u) - th * (0.3 + 0.7 * taper) - bump);
    }
    ctx.closePath();
    ctx.fillStyle = `rgba(250, 252, 255, ${0.6 + 0.35 * accumT})`;
    ctx.fill();
    ctx.strokeStyle = `rgba(205, 218, 238, ${0.5 * accumT})`;
    ctx.lineWidth = 1; ctx.stroke();

    // Snow cap on the chimney
    ctx.fillStyle = `rgba(250, 252, 255, ${0.9 * accumT})`;
    ctx.beginPath();
    ctx.roundRect(ghCX + 74, ghCY - 105 - 5 * accumT, 32, 4 + 5 * accumT, 3);
    ctx.fill();
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

        // Tomatoes on ~2/3 of plants, ripening in a staggered wave across the greenhouse
        const plantIdx = row * 7 + p;
        if (plantIdx % 3 !== 2 && tomatoT > 0) {
          const stagger = (plantIdx % 5) * 0.09; // each plant ripens at its own moment
          const ripeness = Math.max(0, Math.min(1, tomatoT * 1.8 - stagger));
          if (ripeness > 0) {
            const tSize = 3 + ripeness * 3.5;
            const tx2 = px + 3, ty2 = ry - stemH + 9;
            // Warm glow around fully ripe tomatoes
            if (ripeness > 0.75) {
              const glowA = (ripeness - 0.75) * 1.2 * (0.7 + Math.sin(now * 2 + plantIdx) * 0.3);
              const glow = ctx.createRadialGradient(tx2, ty2, 1, tx2, ty2, tSize * 2.6);
              glow.addColorStop(0, `rgba(255, 90, 50, ${glowA * 0.5})`);
              glow.addColorStop(1, 'rgba(255, 90, 50, 0)');
              ctx.fillStyle = glow;
              ctx.beginPath(); ctx.arc(tx2, ty2, tSize * 2.6, 0, Math.PI * 2); ctx.fill();
            }
            ctx.beginPath(); ctx.arc(tx2, ty2, tSize, 0, Math.PI * 2);
            ctx.fillStyle = `rgb(${Math.floor(lerp(50, 226, ripeness))},${Math.floor(lerp(120, 40, ripeness))},25)`;
            ctx.fill();
            ctx.beginPath(); ctx.arc(px + 1, ry - stemH + 7, tSize * 0.3, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${ripeness * 0.3})`; ctx.fill();
          }
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
  ctx.beginPath(); ctx.roundRect(-16, -20, 32, 40, 4); ctx.fill();
  ctx.strokeStyle = 'rgba(0,229,160,0.5)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#b3e5fc'; ctx.fillRect(-11, -16, 22, 14); // Light blue screen
  // Product label on the device face
  ctx.fillStyle = '#1b5e20';
  ctx.font = '700 5px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('GozanLink', 0, 7);
  ctx.textAlign = 'left';
  ctx.beginPath(); ctx.arc(0, 14, 2.5, 0, Math.PI * 2);
  ctx.fillStyle = '#00E5A0'; ctx.globalAlpha = 0.5 + Math.sin(now * 4) * 0.5; ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  ctx.restore(); // zoom

  // Callout — originate from the sensor device (screen-space coords after zoom)
  if (t > 0.4) {
    const envT = subT(t, 0.4, 0.8);
    const appear = easeInOut(subT(t, 0.4, 0.6));
    const deviceScreenX = ghCX + 90 * zoom;
    const deviceScreenY = ghCY + 30 * zoom;
    if (appear > 0.01) drawGozanPanel(ctx, deviceScreenX, deviceScreenY - 20, appear, envT, now, w, h);
  }
}