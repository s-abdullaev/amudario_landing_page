/**
 * Shared drawing components for station models (Mast, Solar Panel, etc.)
 * Promotes reuse and visual consistency between OXUS WS and Airsense.
 */

export function drawStationMast(ctx: CanvasRenderingContext2D): void {
  // Pole
  ctx.fillStyle = '#C0C0C0';
  ctx.beginPath(); 
  // Standard mast height and width
  ctx.roundRect(-6, -150, 12, 350, 4); 
  ctx.fill();
  ctx.strokeStyle = '#808080'; ctx.lineWidth = 1; ctx.stroke();
}

export function drawSolarPanel(ctx: CanvasRenderingContext2D): void {
  // Solar panel (horizontal, rectangular)
  ctx.save(); 
  ctx.translate(0, 20); // Position relative to attachment point on mast

  // Mount arm
  ctx.beginPath(); 
  ctx.moveTo(0, 0); 
  ctx.lineTo(0, 20); 
  ctx.strokeStyle = '#808080'; 
  ctx.stroke();

  ctx.translate(0, 20); 
  
  // Panel Body
  ctx.beginPath(); 
  ctx.roundRect(-40, -15, 80, 30, 2);
  ctx.fillStyle = '#1a3a5c'; 
  ctx.fill();
  ctx.strokeStyle = 'rgba(0,180,216,0.6)'; 
  ctx.lineWidth = 1; 
  ctx.stroke();
  
  // Panel grid details
  ctx.fillStyle = 'rgba(255,255,255,0.1)';
  // Draw grid lines
  for(let i=1; i<4; i++) {
    ctx.fillRect(-40 + i*20, -15, 1, 30);
  }
  ctx.fillRect(-40, 0, 80, 1);
  
  ctx.restore();
}
