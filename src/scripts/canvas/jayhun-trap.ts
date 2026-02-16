import { lerp, subT, easeInOut } from '../utils';
import { drawCalloutBox } from './callout-box';
import { WheatField } from './components/WheatField';

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

  ctx.fillStyle = '#4a5a4a'; ctx.fillRect(trapX - 3, trapY, 6, h * 0.25); // Pole

  // Trap body - Lighter green/metallic
  ctx.beginPath();
  ctx.moveTo(trapX - 50, trapY - 20); ctx.lineTo(trapX + 50, trapY - 20);
  ctx.lineTo(trapX + 30, trapY + 30); ctx.lineTo(trapX - 30, trapY + 30);
  ctx.closePath();
  ctx.fillStyle = '#e8f5e9'; // Very light green
  ctx.fill();
  ctx.strokeStyle = '#2e7d32'; // Dark green outline
  ctx.lineWidth = 1; ctx.stroke();

  // Entry hole
  ctx.save();
  ctx.beginPath();
  ctx.ellipse(trapX, trapY + 5, 12, 18, 0, 0, Math.PI * 2);
  ctx.fillStyle = '#d7ccc8'; // Light greyish-brown/beige hole
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,0,0,0.1)'; ctx.lineWidth = 1; ctx.stroke();
  ctx.restore();

  // Roof
  ctx.beginPath();
  ctx.moveTo(trapX - 60, trapY - 20); ctx.lineTo(trapX, trapY - 50); ctx.lineTo(trapX + 60, trapY - 20);
  ctx.closePath();
  ctx.fillStyle = '#c8e6c9'; // Light green roof
  ctx.fill();
  ctx.strokeStyle = '#2e7d32'; ctx.stroke();

  // Glow (Yellow attractant)
  const glowR = 40 + Math.sin(now * 2) * 8;
  const glowGrad = ctx.createRadialGradient(trapX, trapY, 5, trapX, trapY, glowR);
  glowGrad.addColorStop(0, 'rgba(255,193,7,0.4)'); // Amber glow
  glowGrad.addColorStop(1, 'rgba(255,193,7,0)');
  ctx.fillStyle = glowGrad;
  ctx.beginPath(); ctx.arc(trapX, trapY, glowR, 0, Math.PI * 2); ctx.fill();

  if (t > 0.3) {
    ctx.globalAlpha = subT(t, 0.3, 0.45);
    ctx.fillStyle = '#fff9c4'; // Light sticky plate
    ctx.fillRect(trapX - 25, trapY + 5, 50, 25);
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
    const count = Math.min(17, Math.floor(subT(t, 0.45, 0.8) * 18));
    const dailyRate = lerp(0, 4.2, subT(t, 0.45, 0.8));
    drawCalloutBox(ctx, trapX, trapY + 10, 'PEST ANALYSIS', [
      { label: 'Species', value: 'Helicoverpa', color: '#00E5A0' },
      { label: 'Count', value: count.toString(), color: '#4DA8FF' },
      { label: 'Daily Rate', value: dailyRate.toFixed(1) + ' /day', color: '#f0f4ff' },
      { label: 'Risk', value: count > 10 ? 'High' : 'Medium', color: count > 10 ? '#FF6B6B' : '#FFB347' },
    ], subT(t, 0.45, 0.65), 'left');
  }
}

export const JAYHUN_CAPTIONS = [
  'Wheat ripening under the night sky…',
  'Moths lured by pheromones…',
  'Pests captured on sticky plate',
  'AI identifies species instantly',
  'Automated counting for precision data',
];
