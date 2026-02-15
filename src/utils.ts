/** Ease in-out quadratic */
export function easeInOut(t: number): number {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

/** Linear interpolation */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Clamp value between lo and hi */
export function clamp(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}

/** Normalized sub-range 0→1 within [start, end] */
export function subT(t: number, start: number, end: number): number {
  return clamp((t - start) / (end - start), 0, 1);
}

/** Polyfill for CanvasRenderingContext2D.roundRect */
export function ensureRoundRect(): void {
  if (!CanvasRenderingContext2D.prototype.roundRect) {
    (CanvasRenderingContext2D.prototype as any).roundRect = function (
      x: number, y: number, w: number, h: number, r: number | number[]
    ) {
      const radii = typeof r === 'number' ? [r, r, r, r] : r || [0, 0, 0, 0];
      const [tl, tr, br, bl] = radii;
      this.moveTo(x + tl, y);
      this.lineTo(x + w - tr, y);
      this.quadraticCurveTo(x + w, y, x + w, y + tr);
      this.lineTo(x + w, y + h - br);
      this.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
      this.lineTo(x + bl, y + h);
      this.quadraticCurveTo(x, y + h, x, y + h - bl);
      this.lineTo(x, y + tl);
      this.quadraticCurveTo(x, y, x + tl, y);
      this.closePath();
      return this;
    };
  }
}
