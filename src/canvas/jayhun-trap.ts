import { lerp, subT, easeInOut } from '../utils';
import { drawCalloutBox } from './callout-box';
import { WheatField } from './components/WheatField';

const wheatField = new WheatField();


// Pre-generate moths
interface Moth {
  x: number; y: number; size: number; speed: number;
  phase: number; wingPhase: number;
}

const MOTH_COUNT = 5;
const moths: Moth[] = [];
for (let i = 0; i < MOTH_COUNT; i++) {
  moths.push({
    x: Math.random(), y: Math.random(),
    size: 8 + Math.random() * 10,
    speed: 0.3 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    wingPhase: Math.random() * Math.PI * 2,
  });
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

  // Moths
  moths.forEach((m, i) => {
    const wingAng = Math.sin(now * 8 + m.wingPhase) * 0.4;
    let mx: number, my: number;
    if (t < 0.2) {
      const flyT = t / 0.2;
      mx = lerp(m.x * w, trapX + (i - 2) * 12, flyT * m.speed);
      my = lerp(m.y * h * 0.5, trapY - 10, flyT * m.speed);
    } else if (t < 0.45) {
      mx = trapX + (i - 2) * 8;
      my = trapY + 10 + (i % 3) * 5;
    } else {
      mx = trapX - 15 + (i % 3) * 15;
      my = trapY + 10 + Math.floor(i / 3) * 10;
    }
    drawMoth(ctx, mx, my, m.size * (t > 0.4 ? 1 : 0.7), wingAng, 1);

    // AI detection box
    if (t > 0.5 && t < 0.95 && i < Math.floor(subT(t, 0.5, 0.7) * MOTH_COUNT)) {
      ctx.save();
      ctx.strokeStyle = '#00E5A0'; // Green detection box
      ctx.lineWidth = 1 / zoom;
      ctx.setLineDash([3 / zoom, 2 / zoom]);
      ctx.strokeRect(mx - m.size * 0.5, my - m.size * 0.5, m.size, m.size);
      ctx.font = `${9 / zoom}px Inter`; ctx.fillStyle = '#00E5A0';
      ctx.fillText(`${85 + i * 2}%`, mx - m.size * 0.5, my - m.size * 0.5 - 2 / zoom);
      ctx.restore();
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
