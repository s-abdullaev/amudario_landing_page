/** Navbar scroll behavior + mobile toggle */
export function initNavbar(): void {
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
      })
    );
  }

  // Scroll-based navbar style
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', scrollY > 50);
    }, { passive: true });
  }
}

/** Scroll-triggered reveal animations */
export function initReveals(): void {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.reveal,.reveal-up,.reveal-left,.reveal-right').forEach(el =>
    obs.observe(el)
  );
}

/** Animated number counters in the hero stats */
export function initCounters(): void {
  let done = false;

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !done) {
        done = true;
        runCounters();
      }
    });
  }, { threshold: 0.5 });

  document.querySelectorAll<HTMLElement>('.stat-number[data-count]').forEach(el =>
    obs.observe(el)
  );
}

function runCounters(): void {
  document.querySelectorAll<HTMLElement>('.stat-number[data-count]').forEach(el => {
    const target = +(el.dataset.count ?? 0);
    const start = performance.now();
    (function tick(now: number) {
      const p = Math.min((now - start) / 2000, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3))).toString();
      if (p < 1) requestAnimationFrame(tick);
    })(start);
  });
}

/** Marquee hover-to-pause */
export function initMarquee(): void {
  const track = document.querySelector<HTMLElement>('.marquee-track');
  if (track) {
    track.onmouseenter = () => { track.style.animationPlayState = 'paused'; };
    track.onmouseleave = () => { track.style.animationPlayState = 'running'; };
  }
}

/** Trigger hero reveals on load */
export function triggerHeroReveals(): void {
  setTimeout(() => {
    document.querySelectorAll('.hero .reveal').forEach(el => el.classList.add('active'));
  }, 200);
}
