export interface FieldConfig {
  rows: number;
  rowSpacingScale: number; // Factor to multiply width by for row spacing
  baseColor: string;
  horizonY: number;
}

export interface Plant {
  x: number;
  y: number;
  row: number;
  seed: number;
}

export abstract class FieldSystem {
  protected plants: Plant[] = [];
  protected config: FieldConfig;

  constructor(config: FieldConfig, width: number, height: number) {
    this.config = config;
    // Generate normalized coordinates (0..1)
    // We ignore the passed width/height for generation to make it responsive
    this.generate(1, 1);
  }

  protected generate(w: number, h: number): void {
    const horizon = h * this.config.horizonY;
    
    for (let r = 0; r < this.config.rows; r++) {
      const prog = r / this.config.rows;
      // Perspective projection for Y
      const y = horizon + Math.pow(prog, 1.4) * (h - horizon);
      
      // Variable row width based on perspective
      const rowW = w * (this.config.rowSpacingScale + 2 * prog);
      const count = 8 + r * 2; // More plants in front rows
      const spacing = rowW / count;

      for (let p = 0; p < count; p++) {
        // Center the row
        const px = w / 2 - rowW / 2 + p * spacing + (r % 2) * spacing * 0.5;
        this.plants.push({
          x: px,
          y: y,
          row: r,
          seed: r * 99 + p * 13
        });
      }
    }
  }

  // Sorting for painter's algorithm (back to front)
  // But usually we just draw rows 0..N, which is back to front if we generated back to front.
  // Our generation loop creates row 0 (back) first. So iterating this.plants matches render order.

  public abstract draw(ctx: CanvasRenderingContext2D, t: number, now: number, w: number, h: number): void;
}
