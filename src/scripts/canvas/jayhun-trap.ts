import { lerp, subT, easeInOut } from '../utils';
import { drawConnector, drawGlassPanel, drawStat } from './callout-box';
import { WheatField } from './components/WheatField';

/** Fancy pest-analysis panel with a blinking insect icon. */
function drawJayhunPanel(
  ctx: CanvasRenderingContext2D,
  hx: number, hy: number,
  appear: number, t: number, now: number,
  w: number, h: number
): void {
  const W = 256, H = 152;
  const bx = Math.max(10, Math.min(w - W - 10, hx - W - 80));
  const by = Math.max(10, Math.min(h - H - 10, hy - H - 40));

  ctx.save();
  ctx.globalAlpha = appear;
  drawConnector(ctx, hx - 54, hy + 4, bx + W, by + H * 0.6, 'rgba(0,229,160,0.4)', '#00E5A0');
  drawGlassPanel(ctx, bx, by, W, H, 'rgba(0,229,160,0.35)');

  // Icon cell with blinking moth
  const ib = 46;
  ctx.strokeStyle = 'rgba(0,229,160,0.5)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.roundRect(bx + 14, by + 14, ib, ib, 8); ctx.stroke();
  const blink = 0.45 + 0.55 * (0.5 + Math.sin(now * 5) * 0.5);
  ctx.save();
  ctx.translate(bx + 14 + ib / 2, by + 14 + ib / 2);
  ctx.globalAlpha = appear * blink;
  const ig = ctx.createRadialGradient(0, 0, 2, 0, 0, 22);
  ig.addColorStop(0, 'rgba(0,229,160,0.4)');
  ig.addColorStop(1, 'rgba(0,229,160,0)');
  ctx.fillStyle = ig;
  ctx.beginPath(); ctx.arc(0, 0, 22, 0, Math.PI * 2); ctx.fill();
  // Moth: body, wings, antennae
  ctx.fillStyle = '#00E5A0';
  ctx.beginPath(); ctx.ellipse(0, 2, 2.5, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(-7, -1, 8, 4.5, -0.5, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(7, -1, 8, 4.5, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#00E5A0'; ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(-1, -6); ctx.lineTo(-5, -12);
  ctx.moveTo(1, -6); ctx.lineTo(5, -12);
  ctx.stroke();
  ctx.restore();

  // Header
  ctx.textAlign = 'left';
  ctx.globalAlpha = appear * (0.5 + 0.5 * blink);
  ctx.font = '600 10px Inter'; ctx.fillStyle = '#00E5A0';
  ctx.fillText('● PEST DETECTED', bx + 72, by + 30);
  ctx.globalAlpha = appear;
  ctx.font = '700 15px Montserrat'; ctx.fillStyle = '#f0f4ff';
  ctx.fillText('Helicoverpa armigera', bx + 72, by + 50);

  ctx.strokeStyle = 'rgba(240,244,255,0.12)'; ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(bx + 14, by + 72); ctx.lineTo(bx + W - 14, by + 72); ctx.stroke();

  // Stats grid
  const count = Math.min(17, Math.floor(subT(t, 0.45, 0.8) * 18));
  const daily = lerp(0, 4.2, subT(t, 0.45, 0.8));
  drawStat(ctx, bx + 16, by + 90, 'Count', String(count), undefined, '#4DA8FF');
  drawStat(ctx, bx + 98, by + 90, 'Daily Rate', daily.toFixed(1), '/day');
  drawStat(ctx, bx + 180, by + 90, 'Confidence', '87', '%', '#00E5A0');
  drawStat(ctx, bx + 16, by + 126, 'Risk Level', count > 10 ? 'High' : 'Medium', undefined, count > 10 ? '#FF6B6B' : '#FFB347');
  drawStat(ctx, bx + 98, by + 126, 'Trap Status', 'Active', undefined, '#00E5A0');
  drawStat(ctx, bx + 180, by + 126, 'Battery', '94', '%');
  ctx.restore();
}

const wheatField = new WheatField();


// Pre-generate moths
interface Moth {
  x: number; y: number; size: number; speed: number;
  phase: number; wingPhase: number;
  /** Bezier control point offsets (normalized) for curvy flight */
  cp1x: number; cp1y: number;
  cp2x: number; cp2y: number;
  /** Flutter frequency & amplitude */
  flutterFreq: number; flutterAmp: number;
  /** Whether this moth is attracted to the trap */
  attracted: boolean;
  /** Idle drift parameters for non-attracted moths */
  driftFreqX: number; driftFreqY: number;
  driftAmpX: number; driftAmpY: number;
}

const MOTH_COUNT = 55;
const ATTRACTED_COUNT = 5;
const moths: Moth[] = [];

// Use golden-angle spacing to distribute moths evenly across the scene
for (let i = 0; i < MOTH_COUNT; i++) {
  const side = i % 2 === 0 ? 1 : -1;
  const attracted = i < ATTRACTED_COUNT;

  // Spread positions using a deterministic but well-distributed pattern
  const angle = i * 2.399963; // golden angle in radians
  const radius = 0.25 + (i / MOTH_COUNT) * 0.2;
  let sx = 0.5 + Math.cos(angle) * radius;
  let sy = 0.5 + Math.sin(angle) * radius;
  // Clamp to stay within canvas
  sx = Math.max(0.03, Math.min(0.97, sx));
  sy = Math.max(0.05, Math.min(0.85, sy));

  moths.push({
    x: sx,
    y: sy,
    size: 7 + Math.random() * 9,
    speed: 0.3 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    wingPhase: Math.random() * Math.PI * 2,
    cp1x: side * (0.15 + Math.random() * 0.25),
    cp1y: -0.1 - Math.random() * 0.2,
    cp2x: -side * (0.1 + Math.random() * 0.2),
    cp2y: 0.05 + Math.random() * 0.15,
    flutterFreq: 3 + Math.random() * 4,
    flutterAmp: 8 + Math.random() * 14,
    attracted,
    driftFreqX: 0.3 + Math.random() * 0.6,
    driftFreqY: 0.4 + Math.random() * 0.5,
    driftAmpX: 15 + Math.random() * 30,
    driftAmpY: 10 + Math.random() * 25,
  });
}

/** Cubic bezier interpolation */
function cubicBezier(p0: number, p1: number, p2: number, p3: number, t: number): number {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}

function drawMoth(ctx: CanvasRenderingContext2D, x: number, y: number, size: number, wingAngle: number, alpha: number): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.globalAlpha = alpha;
  ctx.beginPath(); ctx.ellipse(0, 0, size * 0.15, size * 0.4, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#8B7355'; ctx.fill();
  ctx.save(); ctx.rotate(wingAngle);
  ctx.beginPath(); ctx.ellipse(-size * 0.35, -size * 0.1, size * 0.45, size * 0.25, -0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(160,130,90,0.7)'; ctx.fill();
  ctx.restore();
  ctx.save(); ctx.rotate(-wingAngle);
  ctx.beginPath(); ctx.ellipse(size * 0.35, -size * 0.1, size * 0.45, size * 0.25, 0.3, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(160,130,90,0.7)'; ctx.fill();
  ctx.restore();
  ctx.restore();
}

/**
 * JAYHUN TRAP — Moths attracted to pheromone trap in a wheat field.
 */
export function drawJayhunTrap(
  ctx: CanvasRenderingContext2D,
  w: number,
  h: number,
  t: number
): void {
  ctx.clearRect(0, 0, w, h);
  const now = Date.now() / 1000;

  // Sky - Light Theme (Twilight/Evening)
  const nightGrad = ctx.createLinearGradient(0, 0, 0, h);
  nightGrad.addColorStop(0, '#e6e6fa'); // Lavender
  nightGrad.addColorStop(1, '#b0c4de'); // LightSteelBlue
  ctx.fillStyle = nightGrad;
  ctx.fillRect(0, 0, w, h);

  // Stars (Faint for twilight)
  ctx.fillStyle = 'rgba(255,255,255,0.6)';
  for (let i = 0; i < 40; i++) {
    const sx = (i * 137) % w;
    const sy = (i * 97) % (h * 0.6);
    ctx.beginPath(); ctx.arc(sx, sy, 0.5 + (i % 3) * 0.5, 0, Math.PI * 2); ctx.fill();
  }

  const horizon = h * 0.6;
  ctx.fillStyle = '#d7ccc8'; // Light earth
  ctx.fillRect(0, horizon, w, h - horizon);

  // Wheat field
  // Use new WheatField component
  wheatField.draw(ctx, t, now, w, h);

  // Trap
  const trapX = w * 0.75;
  const trapY = h * 0.45;
  const zoom = 1 + easeInOut(subT(t, 0.25, 0.6)) * 1.5;
  ctx.save();
  ctx.translate(trapX, trapY); ctx.scale(zoom, zoom); ctx.translate(-trapX, -trapY);

  // ── Trap station (modeled after the real TOPRAQ unit) ──
  const poleBot = trapY + h * 0.25;

  // Slanted solar panel behind the pole (drawn first so the pole passes in front)
  ctx.save();
  ctx.translate(trapX, trapY + 44);
  ctx.beginPath(); ctx.moveTo(0, -6); ctx.lineTo(0, 16); // vertical mount arm
  ctx.strokeStyle = '#868e93'; ctx.lineWidth = 3; ctx.stroke();
  ctx.translate(0, 38);
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
  sheen.addColorStop(0, 'rgba(255,255,255,0.28)');
  sheen.addColorStop(0.5, 'rgba(255,255,255,0)');
  ctx.fillStyle = sheen; ctx.fillRect(-spw / 2, -sph / 2, spw, sph);
  ctx.restore();

  // Metallic pole
  const poleGrad = ctx.createLinearGradient(trapX - 4, 0, trapX + 4, 0);
  poleGrad.addColorStop(0, '#9ba3a8');
  poleGrad.addColorStop(0.5, '#d5dadd');
  poleGrad.addColorStop(1, '#8d959a');
  ctx.fillStyle = poleGrad;
  ctx.fillRect(trapX - 4, trapY + 20, 8, poleBot - trapY - 20);

  // Ground shadow + square base plate
  ctx.fillStyle = 'rgba(80, 90, 85, 0.22)';
  ctx.beginPath(); ctx.ellipse(trapX, poleBot + 4, 26, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#b6bdc2';
  ctx.beginPath(); ctx.roundRect(trapX - 20, poleBot - 2, 40, 6, 2); ctx.fill();
  ctx.strokeStyle = '#8d959a'; ctx.lineWidth = 1; ctx.stroke();

  // Mounting bracket under housing
  ctx.fillStyle = '#aeb6bb';
  ctx.beginPath(); ctx.roundRect(trapX - 10, trapY + 26, 20, 12, 2); ctx.fill();
  ctx.strokeStyle = '#868e93'; ctx.lineWidth = 1; ctx.stroke();

  // Whip antenna
  ctx.beginPath();
  ctx.moveTo(trapX + 30, trapY - 32);
  ctx.lineTo(trapX + 30, trapY - 92);
  ctx.strokeStyle = '#4a4f52'; ctx.lineWidth = 1.5; ctx.stroke();
  for (let a = 0; a < 4; a++) {
    ctx.beginPath();
    ctx.moveTo(trapX + 28.5, trapY - 44 - a * 10);
    ctx.lineTo(trapX + 31.5, trapY - 44 - a * 10);
    ctx.strokeStyle = '#6b7075'; ctx.lineWidth = 1; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(trapX + 30, trapY - 94, 2, 0, Math.PI * 2);
  ctx.fillStyle = '#4a4f52'; ctx.fill();

  // Trap housing — cream octagonal box with chamfered corners
  const hw = 52, hh = 38, chf = 14;
  const hx = trapX, hy = trapY - 2;
  ctx.beginPath();
  ctx.moveTo(hx - hw + chf, hy - hh);
  ctx.lineTo(hx + hw - chf, hy - hh);
  ctx.lineTo(hx + hw, hy - hh + chf);
  ctx.lineTo(hx + hw, hy + hh - chf);
  ctx.lineTo(hx + hw - chf, hy + hh);
  ctx.lineTo(hx - hw + chf, hy + hh);
  ctx.lineTo(hx - hw, hy + hh - chf);
  ctx.lineTo(hx - hw, hy - hh + chf);
  ctx.closePath();
  const bodyGrad = ctx.createLinearGradient(hx - hw, hy - hh, hx + hw, hy + hh);
  bodyGrad.addColorStop(0, '#f7f4ec');
  bodyGrad.addColorStop(0.6, '#efeadd');
  bodyGrad.addColorStop(1, '#ddd6c4');
  ctx.fillStyle = bodyGrad; ctx.fill();
  ctx.strokeStyle = '#b9b29c'; ctx.lineWidth = 1.5; ctx.stroke();

  // Facet seams
  ctx.beginPath();
  ctx.moveTo(hx - hw + chf, hy - hh); ctx.lineTo(hx - hw + chf, hy + hh);
  ctx.moveTo(hx + hw - chf, hy - hh); ctx.lineTo(hx + hw - chf, hy + hh);
  ctx.strokeStyle = 'rgba(160, 150, 120, 0.35)'; ctx.lineWidth = 1; ctx.stroke();

  // Brand mark
  ctx.fillStyle = 'rgba(70, 120, 90, 0.75)';
  ctx.font = '600 8px Inter';
  ctx.textAlign = 'center';
  ctx.fillText('JayhunTrap', hx, hy - 16);
  ctx.textAlign = 'left';

  // Dark entry aperture — moths fly in here
  ctx.beginPath();
  ctx.roundRect(hx - 22, hy + 6, 44, 26, 5);
  ctx.fillStyle = '#3d3a32'; ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.25)'; ctx.lineWidth = 1; ctx.stroke();

  // Glow (pheromone attractant) — emanates from the aperture
  const glowR = 38 + Math.sin(now * 2) * 8;
  const glowGrad = ctx.createRadialGradient(hx, hy + 18, 4, hx, hy + 18, glowR);
  glowGrad.addColorStop(0, 'rgba(255,193,7,0.4)');
  glowGrad.addColorStop(1, 'rgba(255,193,7,0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath(); ctx.arc(hx, hy + 18, glowR, 0, Math.PI * 2); ctx.fill();

  // Sticky plate slides in at the aperture floor
  if (t > 0.3) {
    ctx.globalAlpha = subT(t, 0.3, 0.45);
    ctx.fillStyle = '#fff9c4';
    ctx.fillRect(hx - 20, hy + 26, 40, 5);
    ctx.globalAlpha = 1;
  }

  // Moths — attracted ones fly curvy paths to trap; the rest drift in the air
  let attractedIdx = 0;
  moths.forEach((m) => {
    const wingAng = Math.sin(now * 8 + m.wingPhase) * 0.4;
    let mx: number, my: number;

    const baseX = m.x * w;
    const baseY = m.y * h;

    if (!m.attracted) {
      // Floating moth: gentle figure-eight drift around its spawn position
      mx = baseX + Math.sin(now * m.driftFreqX + m.phase) * m.driftAmpX;
      my = baseY + Math.sin(now * m.driftFreqY + m.phase * 1.7) * m.driftAmpY;
      drawMoth(ctx, mx, my, m.size * 0.7, wingAng, 0.7);
    } else {
      // Attracted moth: curvy bezier flight into the trap
      const ai = attractedIdx++;
      const col = (ai % 3) - 1;
      const row = Math.floor(ai / 3);
      const endX = trapX + col * 12;
      const endY = trapY + 8 + row * 10;

      if (t < 0.25) {
        const rawT = t / 0.25;
        const flyT = Math.min(rawT * (0.6 + m.speed * 0.8), 1);
        const eased = flyT * flyT * (3 - 2 * flyT);

        const cx1 = lerp(baseX, endX, 0.33) + m.cp1x * w * 0.4;
        const cy1 = lerp(baseY, endY, 0.33) + m.cp1y * h * 0.4;
        const cx2 = lerp(baseX, endX, 0.66) + m.cp2x * w * 0.3;
        const cy2 = lerp(baseY, endY, 0.66) + m.cp2y * h * 0.3;

        mx = cubicBezier(baseX, cx1, cx2, endX, eased);
        my = cubicBezier(baseY, cy1, cy2, endY, eased);

        const flutter = Math.sin(eased * Math.PI * m.flutterFreq + m.phase) * m.flutterAmp * (1 - eased);
        const dt = 0.01;
        const nextT = Math.min(eased + dt, 1);
        const tangentX = cubicBezier(baseX, cx1, cx2, endX, nextT) - mx;
        const tangentY = cubicBezier(baseY, cy1, cy2, endY, nextT) - my;
        const tangentLen = Math.sqrt(tangentX * tangentX + tangentY * tangentY) || 1;
        mx += (-tangentY / tangentLen) * flutter;
        my += (tangentX / tangentLen) * flutter;
      } else if (t < 0.45) {
        mx = endX;
        my = endY;
      } else {
        mx = trapX - 15 + (ai % 3) * 15;
        my = trapY + 8 + Math.floor(ai / 3) * 12;
      }
      drawMoth(ctx, mx, my, m.size * (t > 0.4 ? 1 : 0.7), wingAng, 1);

      // AI detection box (only for attracted/caught moths)
      if (t > 0.5 && t < 0.95 && ai < Math.floor(subT(t, 0.5, 0.7) * ATTRACTED_COUNT)) {
        ctx.save();
        ctx.strokeStyle = '#00E5A0';
        ctx.lineWidth = 1 / zoom;
        ctx.setLineDash([3 / zoom, 2 / zoom]);
        ctx.strokeRect(mx - m.size * 0.5, my - m.size * 0.5, m.size, m.size);
        ctx.font = `${9 / zoom}px Inter`; ctx.fillStyle = '#00E5A0';
        ctx.fillText(`${85 + ai * 2}%`, mx - m.size * 0.5, my - m.size * 0.5 - 2 / zoom);
        ctx.restore();
      }
    }
  });

  ctx.restore(); // zoom

  // Callout
  if (t > 0.45) {
    const appear = easeInOut(subT(t, 0.45, 0.65));
    if (appear > 0.01) drawJayhunPanel(ctx, trapX, trapY, appear, t, now, w, h);
  }
}