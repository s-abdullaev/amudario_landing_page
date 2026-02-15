/**
 * AMUDAR.IO — Main Entry Point
 * Wires together Three.js background, product story animations, and UI.
 */

import { ensureRoundRect } from './utils';
import { initBackground } from './three-background';
import { initStories, updateStoriesOnScroll, animateStories } from './story-manager';
import { initNavbar, initReveals, initCounters, initMarquee, triggerHeroReveals } from './ui';

// Polyfills
ensureRoundRect();

// Three.js background particles
const bgContainer = document.getElementById('three-bg');
if (bgContainer) initBackground(bgContainer);

// Story sections
initStories();

// UI components
initNavbar();
initReveals();
initCounters();
initMarquee();
triggerHeroReveals();

// Scroll handler
let ticking = false;
window.addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    updateStoriesOnScroll();
    ticking = false;
  });
}, { passive: true });

// Continuous animation loop (for time-based effects)
function loop(): void {
  requestAnimationFrame(loop);
  animateStories();
}
loop();
