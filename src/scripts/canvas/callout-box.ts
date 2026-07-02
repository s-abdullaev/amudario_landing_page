import { easeInOut } from '../utils';

export interface CalloutItem {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}

/** Dashed connector line from a device point to a panel edge, with a solid dot at the device. */
export function drawConnector(
  ctx: CanvasRenderingContext2D,
  deviceX: number, deviceY: number,
  targetX: number, targetY: number,
  lineColor = 'rgba(77, 168, 255, 0.4)',
  dotColor = '#4DA8FF'
): void {
  ctx.beginPath();
  ctx.moveTo(deviceX, deviceY);
  ctx.lineTo(targetX, targetY);
  ctx.strokeStyle = lineColor;
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(deviceX, deviceY, 3, 0, Math.PI * 2);
  ctx.fillStyle = dotColor;
  ctx.fill();
}

/** Dark glass panel shell with drop shadow and accent border. */
export function drawGlassPanel(
  ctx: CanvasRenderingContext2D,
  x: number, y: number, w: number, h: number,
  accent = 'rgba(77, 168, 255, 0.3)'
): void {
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = 'rgba(10, 20, 40, 0.62)';
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 12);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = accent;
  ctx.lineWidth = 1;
  ctx.stroke();
}

/** Single labelled stat (label over value + optional unit). */
export function drawStat(
  ctx: CanvasRenderingContext2D,
  x: number, y: number,
  label: string, value: string, unit?: string, color = '#f0f4ff'
): void {
  ctx.textAlign = 'left';
  ctx.font = '400 10px Inter';
  ctx.fillStyle = 'rgba(240,244,255,0.5)';
  ctx.fillText(label, x, y);
  ctx.font = '700 15px Montserrat';
  ctx.fillStyle = color;
  ctx.fillText(value, x, y + 17);
  if (unit) {
    const tw = ctx.measureText(value).width;
    ctx.font = '400 9px Inter';
    ctx.fillStyle = 'rgba(240,244,255,0.35)';
    ctx.fillText(unit, x + tw + 4, y + 17);
  }
}

/**
 * Draws a stat callout box connected to a device with a dashed line.
 * @param cols — number of columns in the grid (default 2)
 * @param side — 'left' or 'right' of the device
 */
export function drawCalloutBox(
  ctx: CanvasRenderingContext2D,
  deviceX: number,
  deviceY: number,
  title: string,
  items: CalloutItem[],
  t: number,
  side: 'left' | 'right' = 'left',
  cols: number = 2
): void {
  const alpha = easeInOut(t);
  if (alpha < 0.01) return;

  const colW = 110;
  const boxW = 32 + cols * colW;
  const rows = Math.ceil(items.length / cols);
  const boxH = 40 + rows * 36;
  
  // Position callout based on side
  let boxX: number, boxY: number;
  if (side === 'left') {
    boxX = deviceX - boxW - 50;
    boxY = deviceY - boxH - 20;
  } else {
    boxX = deviceX + 50;
    boxY = deviceY + 60;
  }

  ctx.save();
  ctx.globalAlpha = alpha;

  // Connecting line from device to box
  ctx.beginPath();
  ctx.moveTo(deviceX, deviceY);
  ctx.lineTo(side === 'left' ? boxX + boxW : boxX, boxY + boxH / 2);
  ctx.strokeStyle = 'rgba(77, 168, 255, 0.4)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([4, 3]);
  ctx.stroke();
  ctx.setLineDash([]);

  // Connection dot
  ctx.beginPath();
  ctx.arc(deviceX, deviceY, 3, 0, Math.PI * 2);
  ctx.fillStyle = '#4DA8FF';
  ctx.fill();

  // Glass panel
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = 'rgba(10, 20, 40, 0.55)';
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 12);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(77, 168, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Title
  ctx.font = '600 11px Inter';
  ctx.fillStyle = '#4DA8FF';
  ctx.textAlign = 'left';
  ctx.fillText(title, boxX + 16, boxY + 22);

  // Items in Grid
  items.forEach((item, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const ix = boxX + 16 + col * colW;
    const iy = boxY + 44 + row * 36;
    
    ctx.font = '400 10px Inter';
    ctx.fillStyle = 'rgba(240,244,255,0.5)';
    ctx.fillText(item.label, ix, iy);
    
    ctx.font = '700 15px Montserrat';
    ctx.fillStyle = item.color || '#f0f4ff';
    ctx.fillText(item.value, ix, iy + 17);
    
    if (item.unit) {
      const tw = ctx.measureText(item.value).width;
      ctx.font = '400 9px Inter';
      ctx.fillStyle = 'rgba(240,244,255,0.35)';
      ctx.fillText(item.unit, ix + tw + 4, iy + 17);
    }
  });

  ctx.restore();
}
