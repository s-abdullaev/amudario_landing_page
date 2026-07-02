import { clamp } from './utils';
import { drawOxusWS } from './canvas/oxus-ws';
import { drawJayhunTrap } from './canvas/jayhun-trap';
import { drawAirsense } from './canvas/airsense';
import { drawGozanlink } from './canvas/gozanlink';

export type StoryId = 'explode' | 'jayhun' | 'airsense' | 'gozan';

interface StoryState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  section: HTMLElement;
  progressBar: HTMLElement | null;
  factsContainer: HTMLElement | null;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  /** Smoothed scroll progress — eases toward the raw value for fluid motion */
  smoothT: number;
}

const STORY_IDS: StoryId[] = ['explode', 'jayhun', 'airsense', 'gozan'];

const DRAW_MAP: Record<StoryId, (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void> = {
  explode: drawOxusWS,
  jayhun: drawJayhunTrap,
  airsense: drawAirsense,
  gozan: drawGozanlink,
};

const stories = new Map<StoryId, StoryState>();

function getStoryT(section: HTMLElement): number {
  const r = section.getBoundingClientRect();
  const range = section.offsetHeight - innerHeight;
  return clamp(-r.top / range, 0, 1);
}

function resizeCanvas(canvas: HTMLCanvasElement): void {
  const parent = canvas.parentElement!;
  if (canvas.width !== parent.clientWidth || canvas.height !== parent.clientHeight) {
    canvas.width = parent.clientWidth;
    canvas.height = parent.clientHeight;
  }
}

function revealFacts(state: StoryState, t: number): void {
  if (!state.factsContainer) return;
  state.factsContainer.querySelectorAll<HTMLElement>('.fact').forEach(fact => {
    const threshold = parseFloat(fact.dataset.appear || '1');
    fact.classList.toggle('visible', t >= threshold);
  });
}

function updateProgress(state: StoryState, t: number): void {
  if (state.progressBar) state.progressBar.style.width = `${t * 100}%`;
}

/** Initialize all story sections. Call once on page load. */
export function initStories(): void {
  for (const id of STORY_IDS) {
    const canvas = document.getElementById(`${id}Canvas`) as HTMLCanvasElement | null;
    if (!canvas) continue;
    const ctx = canvas.getContext('2d')!;
    const section = canvas.closest('.story-section') as HTMLElement;
    const progressBar = section.querySelector('.story-progress-fill') as HTMLElement | null;
    const factsContainer = section.querySelector('.story-facts') as HTMLElement | null;

    stories.set(id, {
      canvas, ctx, section, progressBar, factsContainer,
      draw: DRAW_MAP[id],
      smoothT: getStoryT(section),
    });
  }
}

/** Called on scroll — cheap DOM-only updates; canvas drawing happens in animateStories(). */
export function updateStoriesOnScroll(): void {
  stories.forEach(state => {
    const r = state.section.getBoundingClientRect();
    if (r.bottom < -innerHeight || r.top > innerHeight * 2) return;
    resizeCanvas(state.canvas);
    updateProgress(state, getStoryT(state.section));
  });
}

let lastFrame = 0;

/** Called on every animation frame — eases smoothT toward the raw scroll value and redraws. */
export function animateStories(): void {
  const nowMs = performance.now();
  const dt = lastFrame ? Math.min((nowMs - lastFrame) / 1000, 0.1) : 1 / 60;
  lastFrame = nowMs;
  // Frame-rate-independent exponential smoothing: swift catch-up, silky settle
  const k = 1 - Math.exp(-dt * 8);

  stories.forEach(state => {
    const r = state.section.getBoundingClientRect();
    if (r.bottom < -innerHeight * 0.5 || r.top > innerHeight * 1.5) return;
    resizeCanvas(state.canvas);
    const target = getStoryT(state.section);
    state.smoothT += (target - state.smoothT) * k;
    if (Math.abs(target - state.smoothT) < 0.0004) state.smoothT = target;
    const t = state.smoothT;
    updateProgress(state, t);
    revealFacts(state, t);
    state.draw(state.ctx, state.canvas.width, state.canvas.height, t);
  });
}
