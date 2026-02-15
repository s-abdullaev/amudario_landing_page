export interface CityBuilding {
  bh: number;
  bw: number;
  gap: number;
  windows: { wx: number; wy: number; warmth: number }[];
  cols: number;
  rows: number;
}

export class CitySkyline {
  private buildings: CityBuilding[] = [];

  constructor(count: number = 25) {
    for (let i = 0; i < count; i++) {
      const seed = i * 7 + 3;
      const bh = 40 + Math.abs(Math.sin(seed * 1.7)) * 60 + Math.abs(Math.cos(seed * 0.3)) * 30;
      const bw = 25 + Math.abs(Math.sin(seed * 3.1)) * 35;
      const gap = Math.abs(Math.sin(seed * 2.3)) * 8;
      const windows: CityBuilding['windows'] = [];
      const cols = Math.floor(bw / 8);
      const brows = Math.floor(bh / 12);
      for (let wy = 0; wy < brows; wy++) {
        for (let wx = 0; wx < cols; wx++) {
          const litSeed = (i * 31 + wy * 7 + wx * 13) % 100;
          if (litSeed < 40) windows.push({ wx, wy, warmth: litSeed % 3 });
        }
      }
      this.buildings.push({ bh, bw, gap, windows, cols, rows: brows });
    }
  }

  draw(
    ctx: CanvasRenderingContext2D,
    w: number,
    horizon: number
  ): void {
    const cityW = w * 1.4;
    const cityX = w * 0.5 - cityW * 0.5;
    
    for (const [i, b] of this.buildings.entries()) {
      const bx = cityX + (i / this.buildings.length) * cityW + b.gap;
      const by = horizon - b.bh;
      
      // Building body
      ctx.fillStyle = '#0f1820';
      ctx.fillRect(bx, by, b.bw, b.bh);
      
      // Windows
      const padX = (b.bw - b.cols * 8) / 2 + 2;
      b.windows.forEach(win => {
        const wx = bx + padX + win.wx * 8;
        const wy = by + 6 + win.wy * 12;
        ctx.fillStyle = win.warmth === 0 ? 'rgba(255,220,120,0.6)' :
                        win.warmth === 1 ? 'rgba(180,210,255,0.4)' : 'rgba(255,240,200,0.8)';
        ctx.fillRect(wx, wy, 4, 5);
      });
    }
  }
}
