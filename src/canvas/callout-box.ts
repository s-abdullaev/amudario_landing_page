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

  // Position callout at bottom-right of device to avoid bullet points on left
  const boxW = 240;
  const rows = Math.ceil(items.length / 2);
  const boxH = 40 + rows * 36;
  
  // Force bottom-right positioning
  const offsetX = 50; 
  const offsetY = 60; 
  
  const boxX = deviceX + offsetX;
  const boxY = deviceY + offsetY;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Angled connecting line from device to box
  ctx.beginPath();
  ctx.moveTo(deviceX, deviceY);
  ctx.lineTo(boxX, boxY + boxH/2); // Connect to side of box
  ctx.strokeStyle = 'rgba(77, 168, 255, 0.4)'; // Blue-ish indicator line
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
  ctx.fillStyle = 'rgba(10, 20, 40, 0.92)'; // Darker blue background
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
