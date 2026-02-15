import { clamp } from './utils';
import { drawOxusWS, OXUS_CAPTIONS } from './canvas/oxus-ws';
import { drawJayhunTrap, JAYHUN_CAPTIONS } from './canvas/jayhun-trap';
import { drawAirsense, AIRSENSE_CAPTIONS } from './canvas/airsense';
import { drawGozanlink, GOZAN_CAPTIONS } from './canvas/gozanlink';

export type StoryId = 'explode' | 'jayhun' | 'airsense' | 'gozan';

interface StoryState {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  section: HTMLElement;
  caption: HTMLElement | null;
  progressBar: HTMLElement | null;
  factsContainer: HTMLElement | null;
  draw: (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void;
  captions: string[];
}

const STORY_IDS: StoryId[] = ['explode', 'jayhun', 'airsense', 'gozan'];

const DRAW_MAP: Record<StoryId, (ctx: CanvasRenderingContext2D, w: number, h: number, t: number) => void> = {
  explode: drawOxusWS,
  jayhun: drawJayhunTrap,
  airsense: drawAirsense,
  gozan: drawGozanlink,
};

const CAPTIONS_MAP: Record<StoryId, string[]> = {
  explode: OXUS_CAPTIONS,
  jayhun: JAYHUN_CAPTIONS,
  airsense: AIRSENSE_CAPTIONS,
  gozan: GOZAN_CAPTIONS,
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

function updateCaption(state: StoryState, t: number): void {
  if (!state.caption) return;
  const msgs = state.captions;
  const idx = Math.min(Math.floor(t * msgs.length), msgs.length - 1);
  const text = msgs[idx];
  if (state.caption.textContent !== text) state.caption.textContent = text;
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
    const caption = section.querySelector('.story-caption') as HTMLElement | null;
    const progressBar = section.querySelector('.story-progress-fill') as HTMLElement | null;
    const factsContainer = section.querySelector('.story-facts') as HTMLElement | null;

    stories.set(id, {
      canvas, ctx, section, caption, progressBar, factsContainer,
      draw: DRAW_MAP[id],
      captions: CAPTIONS_MAP[id],
    });
  }
}

/** Called on scroll to update visible stories. */
export function updateStoriesOnScroll(): void {
  stories.forEach(state => {
    const r = state.section.getBoundingClientRect();
    if (r.bottom < -innerHeight || r.top > innerHeight * 2) return;
    resizeCanvas(state.canvas);
    const t = getStoryT(state.section);
    updateProgress(state, t);
    revealFacts(state, t);
    updateCaption(state, t);
    state.draw(state.ctx, state.canvas.width, state.canvas.height, t);
  });
}

/** Called on every animation frame for continuous animations. */
export function animateStories(): void {
  stories.forEach(state => {
    const r = state.section.getBoundingClientRect();
    if (r.bottom < 0 || r.top > innerHeight) return;
    resizeCanvas(state.canvas);
    const t = getStoryT(state.section);
    revealFacts(state, t);
    updateCaption(state, t);
    state.draw(state.ctx, state.canvas.width, state.canvas.height, t);
  });
}
