import { lerp, subT, easeInOut } from '../utils';
import { drawConnector } from './callout-box';
import { drawStationMast } from './station-parts';
import { CottonField } from './components/CottonField';

const cottonField = new CottonField();

// Console-screen palette: dim green labels, bright green values
const MAROON = 'rgba(0, 229, 160, 0.8)';
const INK = '#a9ffd2';
const MONO = 'Consolas, "Courier New", monospace';

// LCD labels localized to the page language
const LCD_LABELS: Record<string, Record<string, string>> = {
  en: {
    sub: 'Automatic agrometeostation',
    airT: 'Air temp', airH: 'Air humidity', airP: 'Air pressure',
    rain: 'Rain', leafW: 'Leaf wetness', leafT: 'Leaf temp',
    wind: 'Wind', speed: 'Speed', soil: 'Soil', t: 'T', moist: 'Moist', ec: 'EC',
  },
  uz: {
    sub: 'Avtomatik agrometeostansiya',
    airT: 'Havo harorati', airH: 'Havo namligi', airP: 'Havo bosimi',
    rain: "Yomg'ir", leafW: 'Barg namligi', leafT: 'Barg harorati',
    wind: 'Shamol', speed: 'Tezlik', soil: 'Tuproq', t: 'T', moist: 'Nam', ec: 'EC',
  },
  ru: {
    sub: 'Автоматическая агрометеостанция',
    airT: 'Темп. воздуха', airH: 'Влажность', airP: 'Давление',
    rain: 'Дождь', leafW: 'Влажн. листа', leafT: 'Темп. листа',
    wind: 'Ветер', speed: 'Скорость', soil: 'Почва', t: 'T', moist: 'Влаж', ec: 'EC',
  },
};

function lcdLabels(): Record<string, string> {
  const lang = (typeof document !== 'undefined' ? document.documentElement.lang || 'en' : 'en').slice(0, 2);
  return LCD_LABELS[lang] || LCD_LABELS.en;
}

/** LCD-style live readout panel, modeled after the real station display. */
function drawOxusLCD(
  ctx: CanvasRenderingContext2D,
  deviceX: number, deviceY: number, sc: number,
  appear: number, envT: number, now: number,
  w: number, h: number
): void {
  const L = lcdLabels();
  const W = 324, H = 258;
  const bx = Math.max(10, Math.min(w - W - 10, deviceX - W - 80 * sc));
  const by = Math.max(10, Math.min(h - H - 10, deviceY - H * 0.72));

  ctx.save();
  ctx.globalAlpha = appear;
  drawConnector(ctx, deviceX - 44 * sc, deviceY - 30 * sc, bx + W + 6, by + H * 0.5, 'rgba(0,229,160,0.4)', '#00E5A0');

  // Console shell — semi-transparent dark glass
  ctx.shadowColor = 'rgba(0,0,0,0.55)'; ctx.shadowBlur = 20; ctx.shadowOffsetY = 8;
  ctx.fillStyle = 'rgba(6, 14, 11, 0.72)';
  ctx.beginPath(); ctx.roundRect(bx - 8, by - 8, W + 16, H + 16, 12); ctx.fill();
  ctx.shadowColor = 'transparent'; ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
  ctx.strokeStyle = 'rgba(0,229,160,0.4)'; ctx.lineWidth = 1; ctx.stroke();
  // Faint scanlines for a CRT-console feel
  ctx.fillStyle = 'rgba(0,229,160,0.035)';
  for (let ly = by; ly < by + H; ly += 4) ctx.fillRect(bx - 4, ly, W + 8, 1);

  const P = 12;
  const cx0 = bx + P;
  const right = bx + W - P;
  ctx.textAlign = 'left';

  // Header: brand + live clock
  ctx.font = `700 15px ${MONO}`;
  ctx.fillStyle = INK;
  ctx.fillText('AMUDARIO', cx0, by + 20);
  const d = new Date();
  const p2 = (n: number) => String(n).padStart(2, '0');
  const dt = `${d.getFullYear()}-${p2(d.getMonth() + 1)}-${p2(d.getDate())} ${p2(d.getHours())}:${p2(d.getMinutes())}:${p2(d.getSeconds())}`;
  ctx.font = `700 13px ${MONO}`;
  ctx.textAlign = 'right';
  ctx.fillText(dt, right, by + 20);
  ctx.textAlign = 'left';
  ctx.font = `600 12px ${MONO}`;
  ctx.fillStyle = MAROON;
  ctx.fillText(L.sub, cx0, by + 36);
  ctx.strokeStyle = INK; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(cx0, by + 44); ctx.lineTo(right, by + 44); ctx.stroke();

  // Top trio: air temp / humidity / pressure
  const trio = [
    { l: L.airT, v: lerp(18, 24.5, envT).toFixed(1) + ' C' },
    { l: L.airH, v: lerp(40, 62, envT).toFixed(1) + ' %' },
    { l: L.airP, v: lerp(958.2, 961.8, envT).toFixed(1) + ' hPa' },
  ];
  const triW = (W - P * 2) / 3;
  trio.forEach((it, i) => {
    const tx = cx0 + i * triW;
    ctx.font = `600 11px ${MONO}`;
    ctx.fillStyle = MAROON;
    ctx.fillText(it.l, tx + 2, by + 60);
    ctx.font = `700 14px ${MONO}`;
    ctx.fillStyle = INK;
    ctx.fillText(it.v, tx + 10, by + 78);
    if (i > 0) {
      ctx.beginPath(); ctx.moveTo(tx - 5, by + 50); ctx.lineTo(tx - 5, by + 82);
      ctx.strokeStyle = INK; ctx.lineWidth = 0.75; ctx.stroke();
    }
  });
  ctx.beginPath(); ctx.moveTo(cx0, by + 88); ctx.lineTo(right, by + 88);
  ctx.strokeStyle = INK; ctx.lineWidth = 1; ctx.stroke();

  // Mid boxes: rain | leaf | wind compass
  const midY = by + 96, midH = 72;
  ctx.strokeStyle = INK; ctx.lineWidth = 1;
  // Rain
  ctx.beginPath(); ctx.roundRect(cx0, midY, 74, midH, 6); ctx.stroke();
  ctx.textAlign = 'center';
  ctx.font = `600 12px ${MONO}`; ctx.fillStyle = MAROON;
  ctx.fillText(L.rain, cx0 + 37, midY + 16);
  ctx.font = `700 20px ${MONO}`; ctx.fillStyle = INK;
  ctx.fillText('0.0', cx0 + 37, midY + 42);
  ctx.font = `600 10px ${MONO}`;
  ctx.fillText('mm', cx0 + 37, midY + 58);
  // Leaf
  const lx = cx0 + 82;
  ctx.beginPath(); ctx.roundRect(lx, midY, 100, midH, 6); ctx.stroke();
  ctx.textAlign = 'left';
  ctx.font = `600 11px ${MONO}`; ctx.fillStyle = MAROON;
  ctx.fillText(L.leafW, lx + 8, midY + 16);
  ctx.font = `700 12px ${MONO}`; ctx.fillStyle = INK;
  ctx.fillText(lerp(0, 4.2, envT).toFixed(1) + ' %', lx + 8, midY + 30);
  ctx.beginPath(); ctx.moveTo(lx + 8, midY + 37); ctx.lineTo(lx + 92, midY + 37);
  ctx.lineWidth = 0.75; ctx.stroke();
  ctx.font = `600 11px ${MONO}`; ctx.fillStyle = MAROON;
  ctx.fillText(L.leafT, lx + 8, midY + 51);
  ctx.font = `700 12px ${MONO}`; ctx.fillStyle = INK;
  ctx.fillText(lerp(17.2, 20.7, envT).toFixed(1) + ' C', lx + 8, midY + 65);
  // Wind + compass
  const wx = lx + 108;
  ctx.beginPath(); ctx.roundRect(wx, midY, right - wx, midH, 6); ctx.lineWidth = 1; ctx.stroke();
  ctx.font = `600 11px ${MONO}`; ctx.fillStyle = MAROON;
  ctx.fillText(L.wind, wx + 8, midY + 16);
  const ccx = wx + 26, ccy = midY + 44, cr = 18;
  ctx.beginPath(); ctx.arc(ccx, ccy, cr, 0, Math.PI * 2);
  ctx.strokeStyle = INK; ctx.lineWidth = 1.25; ctx.stroke();
  ctx.font = `700 8px ${MONO}`; ctx.fillStyle = MAROON; ctx.textAlign = 'center';
  ctx.fillText('N', ccx, ccy - cr + 8);
  ctx.fillText('S', ccx, ccy + cr - 3);
  ctx.fillText('W', ccx - cr + 6, ccy + 3);
  ctx.fillText('E', ccx + cr - 6, ccy + 3);
  const wang = -Math.PI / 2 + Math.sin(now * 0.3) * 0.4 + envT * 1.2;
  const ax2 = ccx + Math.cos(wang) * (cr - 5);
  const ay2 = ccy + Math.sin(wang) * (cr - 5);
  ctx.beginPath(); ctx.moveTo(ccx, ccy); ctx.lineTo(ax2, ay2);
  ctx.strokeStyle = MAROON; ctx.lineWidth = 2; ctx.stroke();
  ctx.beginPath(); ctx.arc(ax2, ay2, 2, 0, Math.PI * 2);
  ctx.fillStyle = MAROON; ctx.fill();
  ctx.textAlign = 'left';
  ctx.font = `600 10px ${MONO}`; ctx.fillStyle = MAROON;
  ctx.fillText(L.speed, ccx + 28, midY + 28);
  ctx.font = `700 12px ${MONO}`; ctx.fillStyle = INK;
  ctx.fillText(lerp(0.5, 3.2, envT).toFixed(1) + ' m/s', ccx + 28, midY + 42);
  ctx.font = `600 10px ${MONO}`; ctx.fillStyle = MAROON;
  ctx.fillText(Math.round(lerp(0, 210, envT)) + ' deg', ccx + 28, midY + 58);

  // Soil table
  const tY = midY + midH + 8;
  const table = [
    [L.soil, 'S1', 'S2', 'S3'],
    [L.t, lerp(22.1, 26.2, envT).toFixed(1), lerp(22.4, 26.3, envT).toFixed(1), lerp(23.0, 26.9, envT).toFixed(1)],
    [L.moist, lerp(6.2, 9.7, envT).toFixed(1), lerp(5.4, 8.1, envT).toFixed(1), lerp(6.1, 9.7, envT).toFixed(1)],
    [L.ec, '0.03', '0.01', '0.03'],
  ];
  const colW = (W - P * 2) / 4, rowH = 17;
  table.forEach((row, ri) => {
    row.forEach((cell, ci) => {
      ctx.font = `${ri === 0 || ci === 0 ? '700' : '600'} 11px ${MONO}`;
      ctx.fillStyle = ri === 0 ? MAROON : INK;
      ctx.textAlign = ci === 0 ? 'left' : 'center';
      ctx.fillText(cell, ci === 0 ? cx0 + 2 : cx0 + ci * colW + colW / 2, tY + 12 + ri * rowH);
    });
    ctx.beginPath(); ctx.moveTo(cx0, tY + 16 + ri * rowH); ctx.lineTo(right, tY + 16 + ri * rowH);
    ctx.strokeStyle = 'rgba(0,229,160,0.35)'; ctx.lineWidth = 0.5; ctx.stroke();
  });
  for (let ci = 1; ci < 4; ci++) {
    ctx.beginPath(); ctx.moveTo(cx0 + ci * colW, tY + 2); ctx.lineTo(cx0 + ci * colW, tY + 16 + 3 * rowH);
    ctx.strokeStyle = 'rgba(0,229,160,0.35)'; ctx.lineWidth = 0.5; ctx.stroke();
  }
  ctx.textAlign = 'left';
  ctx.restore();
}

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

  // Soft sun with warm glow — climbs gently as the story progresses
  const sunX = w * 0.16;
  const sunY = h * (0.24 - t * 0.08);
  const sunR = Math.min(w, h) * 0.045;
  const sunGlow = ctx.createRadialGradient(sunX, sunY, sunR * 0.3, sunX, sunY, sunR * 5);
  sunGlow.addColorStop(0, 'rgba(255, 240, 180, 0.85)');
  sunGlow.addColorStop(0.3, 'rgba(255, 228, 140, 0.28)');
  sunGlow.addColorStop(1, 'rgba(255, 220, 120, 0)');
  ctx.fillStyle = sunGlow;
  ctx.fillRect(0, 0, w, h * 0.6);
  ctx.beginPath(); ctx.arc(sunX, sunY, sunR, 0, Math.PI * 2);
  ctx.fillStyle = '#fff6cf'; ctx.fill();

  // Cotton field
  const horizon = h * 0.55;
  
  cottonField.draw(ctx, t, now, w, h);

  // Weather Station
  const sc = Math.min(w, h) / 600;
  const zoom = 1 + easeInOut(subT(t, 0.25, 0.6)) * 0.35;
  const sx = w * 0.81;
  // Slightly lower anchor so the mast base visually sits into the field.
  const sy = h * 0.56;
  ctx.save();
  ctx.translate(sx, sy);
  ctx.scale(sc * zoom, sc * zoom);

  // ── Wide solar panel mounted behind the pole (drawn first so the pole passes in front) ──
  ctx.save(); ctx.translate(0, -20);
  ctx.transform(1, 0, -0.1, 1, 0, 0); // slight skew so the panel reads as tilted toward the sun
  const pw2 = 150, ph2 = 52;
  ctx.beginPath(); ctx.roundRect(-pw2 / 2 - 3, -ph2 / 2 - 3, pw2 + 6, ph2 + 6, 3);
  ctx.fillStyle = '#d9dcde'; ctx.fill();
  ctx.strokeStyle = '#9aa1a6'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#24476b';
  ctx.fillRect(-pw2 / 2, -ph2 / 2, pw2, ph2);
  ctx.strokeStyle = 'rgba(255,255,255,0.45)'; ctx.lineWidth = 0.7;
  for (let gx = -pw2 / 2 + 12; gx < pw2 / 2; gx += 12) {
    ctx.beginPath(); ctx.moveTo(gx, -ph2 / 2); ctx.lineTo(gx, ph2 / 2); ctx.stroke();
  }
  for (let gy = -ph2 / 2 + 13; gy < ph2 / 2; gy += 13) {
    ctx.beginPath(); ctx.moveTo(-pw2 / 2, gy); ctx.lineTo(pw2 / 2, gy); ctx.stroke();
  }
  const sheen2 = ctx.createLinearGradient(-pw2 / 2, -ph2 / 2, pw2 / 2, ph2 / 2);
  sheen2.addColorStop(0, 'rgba(255,255,255,0.28)');
  sheen2.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen2; ctx.fillRect(-pw2 / 2, -ph2 / 2, pw2, ph2);
  ctx.restore();

  // Pole (Shared)
  drawStationMast(ctx);

  // ── Anemometer at the top of the pole — cups spin as the user scrolls ──
  ctx.beginPath(); ctx.moveTo(0, -148); ctx.lineTo(0, -172);
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.beginPath(); ctx.ellipse(0, -148, 10, 3, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#B0B0B0'; ctx.fill();
  const rot = t * 30 + now * 0.6;
  ctx.save(); ctx.translate(0, -172);
  ctx.beginPath(); ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fillStyle = '#1a1a1a'; ctx.fill();
  ctx.save(); ctx.scale(1, 0.32);
  for (let a = 0; a < 3; a++) {
    const ang = rot + a * (Math.PI * 2 / 3);
    const cx2 = Math.cos(ang) * 20;
    const cy2 = Math.sin(ang) * 20;
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(cx2, cy2);
    ctx.strokeStyle = '#808080'; ctx.lineWidth = 1.5; ctx.stroke();
    ctx.beginPath(); ctx.arc(cx2, cy2, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = '#1a1a1a'; ctx.fill();
  }
  ctx.restore(); ctx.restore();

  // ── Stevenson Screen on LEFT arm ──
  ctx.save(); ctx.translate(0, -112);
  // Horizontal arm from mast
  ctx.beginPath();
  ctx.moveTo(-6, 0); ctx.lineTo(-42, 0);
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 2; ctx.stroke();
  // Short vertical hanger
  ctx.beginPath(); ctx.moveTo(-42, 0); ctx.lineTo(-42, 6);
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 1.5; ctx.stroke();
  // Screen body
  ctx.save(); ctx.translate(-42, 6);
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

  // ── Pyranometer on its own arm, slightly above the Stevenson screen ──
  ctx.save(); ctx.translate(-52, -132);
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(46, 0);
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 2; ctx.stroke(); // arm to pole
  ctx.beginPath(); ctx.arc(0, -6, 9, Math.PI, 0); ctx.closePath();
  ctx.fillStyle = '#D8D8D8'; ctx.fill();
  ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#B8B8B8'; ctx.fillRect(-2, -6, 4, 6);
  ctx.restore();

  // ── Large rain gauge on RIGHT bracket (with bird spikes) ──
  ctx.save(); ctx.translate(0, -100);
  ctx.beginPath(); ctx.moveTo(6, 0); ctx.lineTo(34, 0);
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 2.5; ctx.stroke();
  ctx.save(); ctx.translate(52, 0);
  const gw = 44, gh = 56;
  // Cylinder body
  ctx.beginPath(); ctx.roundRect(-gw / 2, -gh + 14, gw, gh, 3);
  ctx.fillStyle = '#EDEDED'; ctx.fill();
  ctx.strokeStyle = '#A0A0A0'; ctx.lineWidth = 1; ctx.stroke();
  // Side shading for cylindrical feel
  ctx.fillStyle = 'rgba(120,120,120,0.12)';
  ctx.fillRect(gw / 2 - 8, -gh + 14, 8, gh);
  // Top rim
  ctx.beginPath(); ctx.ellipse(0, -gh + 14, gw / 2, 5, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#DDDDDD'; ctx.fill();
  ctx.strokeStyle = '#A0A0A0'; ctx.stroke();
  // Bird spikes around the rim
  ctx.strokeStyle = '#909090'; ctx.lineWidth = 1;
  for (let s = 0; s < 7; s++) {
    const spx = -gw / 2 + 3 + s * (gw - 6) / 6;
    ctx.beginPath();
    ctx.moveTo(spx, -gh + 12);
    ctx.lineTo(spx + (s - 3) * 1.2, -gh + 1);
    ctx.stroke();
  }
  // Banding line
  ctx.beginPath(); ctx.moveTo(-gw / 2, -8); ctx.lineTo(gw / 2, -8);
  ctx.strokeStyle = 'rgba(140,140,140,0.5)'; ctx.stroke();
  ctx.restore();
  // Triangular support bracket under the gauge
  ctx.beginPath();
  ctx.moveTo(6, 12); ctx.lineTo(68, 12); ctx.lineTo(6, 36); ctx.closePath();
  ctx.fillStyle = '#C4C8CB'; ctx.fill();
  ctx.strokeStyle = '#8d959a'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();

  // ── Control box front-and-center (screen, label, QR, cables) ──
  ctx.save(); ctx.translate(0, 10);
  ctx.beginPath(); ctx.roundRect(-42, -52, 84, 104, 7);
  ctx.fillStyle = '#F6F4ED'; ctx.fill();
  ctx.strokeStyle = '#B0AA98'; ctx.lineWidth = 1.5; ctx.stroke();
  // Inner face seam
  ctx.beginPath(); ctx.roundRect(-36, -46, 72, 92, 5);
  ctx.strokeStyle = 'rgba(150,145,125,0.35)'; ctx.lineWidth = 1; ctx.stroke();
  // Screen
  ctx.beginPath(); ctx.roundRect(-17, -36, 34, 26, 2);
  ctx.fillStyle = '#2b3440'; ctx.fill();
  ctx.strokeStyle = '#8a94a0'; ctx.lineWidth = 1; ctx.stroke();
  ctx.fillStyle = '#9fd8c8';
  ctx.fillRect(-13, -32, 26, 4);
  ctx.fillRect(-13, -25, 18, 3);
  // Label
  ctx.fillStyle = '#2b2f36';
  ctx.font = '700 11px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('OxusWS', 0, 8);
  ctx.textAlign = 'left';
  // QR code
  ctx.fillStyle = '#3a3f45';
  for (let qy = 0; qy < 5; qy++) {
    for (let qx = 0; qx < 5; qx++) {
      if ((qx * 7 + qy * 5 + qx * qy) % 3 !== 0) ctx.fillRect(-30 + qx * 3, 18 + qy * 3, 2.5, 2.5);
    }
  }
  // Info lines beside the QR
  ctx.fillStyle = 'rgba(70,75,82,0.65)';
  ctx.fillRect(-8, 20, 28, 2);
  ctx.fillRect(-8, 25, 22, 2);
  ctx.fillRect(-8, 30, 25, 2);
  // Status LED
  ctx.beginPath(); ctx.arc(30, -40, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#00E5A0';
  ctx.globalAlpha = 0.5 + Math.sin(now * 3) * 0.5; ctx.fill();
  ctx.globalAlpha = 1;
  // Cable glands + looping cables
  ctx.fillStyle = '#8a9096';
  ctx.fillRect(-20, 50, 8, 6);
  ctx.fillRect(10, 50, 8, 6);
  ctx.strokeStyle = '#5a6066'; ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(-16, 56); ctx.bezierCurveTo(-16, 76, -2, 76, -2, 60); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(14, 56); ctx.bezierCurveTo(14, 78, 2, 78, 2, 62); ctx.stroke();
  ctx.restore();

  ctx.restore(); // station

  // Callout — LCD-style live readout panel
  if (t > 0.35) {
    const envT = subT(t, 0.35, 0.85);
    const appear = easeInOut(subT(t, 0.35, 0.55));
    if (appear > 0.01) drawOxusLCD(ctx, sx, sy, sc, appear, envT, now, w, h);
  }
}