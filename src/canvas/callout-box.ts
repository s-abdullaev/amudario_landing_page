import { easeInOut } from '../utils';

export interface CalloutItem {
  label: string;
  value: string;
  unit?: string;
  color?: string;
}

/**
 * Draws a stat callout box connected to a device with a dashed line.
 * @param side — 'left' or 'right' of the device
 */
export function drawCalloutBox(
  ctx: CanvasRenderingContext2D,
  deviceX: number,
  deviceY: number,
  title: string,
  items: CalloutItem[],
  t: number,
  side: 'left' | 'right' = 'left'
): void {
  const alpha = easeInOut(t);
  if (alpha < 0.01) return;

  const boxW = 240;
  const rows = Math.ceil(items.length / 2);
  const boxH = 40 + rows * 36;
  
  // Position callout based on side
  let boxX: number, boxY: number;
  if (side === 'left') {
    // Northwest: box to upper-left of device
    boxX = deviceX - boxW - 50;
    boxY = deviceY - boxH - 20;
  } else {
    // Southeast (default): box to lower-right of device
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

  // Glass panel - distinct blueish tint, darker
  ctx.shadowColor = 'rgba(0,0,0,0.6)';
  ctx.shadowBlur = 20;
  ctx.shadowOffsetY = 8;
  ctx.fillStyle = 'rgba(10, 20, 40, 0.55)'; // Semi-transparent background
  ctx.beginPath();
  ctx.roundRect(boxX, boxY, boxW, boxH, 12);
  ctx.fill();
  ctx.shadowColor = 'transparent';
  ctx.strokeStyle = 'rgba(77, 168, 255, 0.3)'; // Blue border
  ctx.lineWidth = 1;
  ctx.stroke();

  // Title
  ctx.font = '600 11px Inter';
  ctx.fillStyle = '#4DA8FF';
  ctx.textAlign = 'left';
  ctx.fillText(title, boxX + 16, boxY + 22);

  // Items in Grid
  items.forEach((item, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const ix = boxX + 16 + col * 110;
    const iy = boxY + 44 + row * 36;
    
    ctx.font = '400 10px Inter';
    ctx.fillStyle = 'rgba(240,244,255,0.5)';
    ctx.fillText(item.label, ix, iy);
    
    ctx.font = '700 15px Outfit';
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
