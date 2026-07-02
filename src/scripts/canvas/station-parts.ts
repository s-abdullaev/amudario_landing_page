/**
 * Shared drawing components for station models (Mast, Solar Panel, etc.)
 * Promotes reuse and visual consistency between OXUS WS and Airsense.
 */

export function drawStationMast(ctx: CanvasRenderingContext2D): void {
  // Metallic pole with vertical highlight (matches the JayhunTrap post style)
  const grad = ctx.createLinearGradient(-6, 0, 6, 0);
  grad.addColorStop(0, '#9ba3a8');
  grad.addColorStop(0.5, '#d5dadd');
  grad.addColorStop(1, '#8d959a');
  ctx.fillStyle = grad;
  ctx.beginPath();
  // Standard mast height and width
  ctx.roundRect(-6, -150, 12, 350, 4);
  ctx.fill();
  ctx.strokeStyle = '#8d959a'; ctx.lineWidth = 1; ctx.stroke();

  // Ground shadow + square base plate
  ctx.fillStyle = 'rgba(80, 90, 85, 0.22)';
  ctx.beginPath(); ctx.ellipse(0, 204, 30, 7, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#b6bdc2';
  ctx.beginPath(); ctx.roundRect(-24, 196, 48, 8, 2); ctx.fill();
  ctx.strokeStyle = '#8d959a'; ctx.lineWidth = 1; ctx.stroke();
}

export function drawSolarPanel(ctx: CanvasRenderingContext2D): void {
  ctx.save();
  ctx.translate(0, 20);

  // Mount arm (vertical)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 20);
  ctx.strokeStyle = '#808080';
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.translate(0, 20);

  // Panel body — horizontal rectangle, light blue
  const pw = 70, ph = 35;
  ctx.beginPath();
  ctx.roundRect(-pw / 2, -ph / 2, pw, ph, 2);
  ctx.fillStyle = '#90caf9'; // Light blue
  ctx.fill();
  ctx.strokeStyle = '#64b5f6';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Squared grid texture
  const cellSize = 10;
  ctx.strokeStyle = 'rgba(255,255,255,0.3)';
  ctx.lineWidth = 0.5;
  for (let x = -pw / 2 + cellSize; x < pw / 2; x += cellSize) {
    ctx.beginPath();
    ctx.moveTo(x, -ph / 2);
    ctx.lineTo(x, ph / 2);
    ctx.stroke();
  }
  for (let y = -ph / 2 + cellSize; y < ph / 2; y += cellSize) {
    ctx.beginPath();
    ctx.moveTo(-pw / 2, y);
    ctx.lineTo(pw / 2, y);
    ctx.stroke();
  }

  ctx.restore();
}
