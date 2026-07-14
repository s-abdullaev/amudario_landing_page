/* ===== Amudario — scroll-scrub engine, reveals, counters, 3D tilt ===== */
(function () {
  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const sections = Array.from(document.querySelectorAll("[data-scrub]"));
  const nav = document.getElementById("nav");

  const items = sections.map((section) => {
    const video = section.querySelector("[data-scrub-video]");
    const len = parseFloat(section.getAttribute("data-len")) || 2;
    const panel = section.querySelector(".product__panel");
    const fades = Array.from(section.querySelectorAll("[data-hero-fade]"));
    return {
      section, video, len, panel, fades,
      isHero: section.classList.contains("hero"),
      panelDir: panel && panel.classList.contains("product__panel--right") ? 1 : -1,
      cur: 0, target: 0, dur: 0, ready: false, top: 0, height: 0
    };
  });

  const hero = items.find((i) => i.isHero);
  const ppHero = document.querySelector(".pp-hero"); // product detail page banner
  const vh = () => window.innerHeight;

  function layout() {
    items.forEach((it) => {
      it.height = it.len * vh();
      it.section.style.height = it.height + "px";
    });
    items.forEach((it) => {
      const r = it.section.getBoundingClientRect();
      it.top = r.top + window.scrollY;
    });
  }

  function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
  function smoothstep(e0, e1, x) {
    const t = clamp((x - e0) / (e1 - e0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  function onScroll() {
    const y = window.scrollY;

    // white nav over hero video / product banner; solid colored nav after scrolling past
    const heroBottom = hero ? hero.height - 80
      : ppHero ? ppHero.offsetHeight - 80
      : 0;
    const overHero = y < heroBottom;
    nav.classList.toggle("nav--onvideo", overHero);
    nav.classList.toggle("nav--scrolled", y > 12 && !overHero);

    for (const it of items) {
      const range = it.height - vh();
      let p = range > 0 ? (y - it.top) / range : 0;
      p = clamp(p, 0, 1);
      it.target = p;

      if (it.isHero && it.fades.length) {
        const op = 1 - smoothstep(0.55, 1, p);
        const mobile = window.matchMedia("(max-width:760px)").matches;
        for (const f of it.fades) {
          const base = mobile ? "0%" : (f.dataset.fadeBase || "0%");
          f.style.opacity = op.toFixed(3);
          f.style.transform = `translateY(${base}) translateY(${(-p * 60).toFixed(1)}px)`;
        }
      } else if (it.panel) {
        const inT = smoothstep(0.04, 0.2, p);
        const op = inT * (1 - smoothstep(0.86, 1, p));
        const shift = (1 - inT) * 30;
        const rot = (1 - inT) * 7 * it.panelDir; // 3D swing-in from its side
        it.panel.style.opacity = op.toFixed(3);
        it.panel.style.transform =
          `perspective(1200px) translateY(-50%) translateY(${shift.toFixed(1)}px) rotateY(${rot.toFixed(2)}deg)`;
      }
    }
  }

  const FRAME = 1 / 30; // quantize seeks to frame boundaries

  function tick() {
    for (const it of items) {
      if (!it.ready || !it.dur) continue;
      it.cur += (it.target - it.cur) * 0.14;
      if (Math.abs(it.target - it.cur) < 0.0005) it.cur = it.target;
      const v = it.video;
      // never queue a new seek while the previous one is still decoding —
      // stacked seeks are what makes scrubbing look jerky
      if (v.readyState < 2 || v.seeking) continue;
      const t = clamp(
        Math.round((it.cur * (it.dur - 0.04)) / FRAME) * FRAME,
        0, it.dur - 0.04
      );
      if (Math.abs(v.currentTime - t) >= FRAME / 2) {
        try { v.currentTime = t; } catch (e) {}
      }
    }
    requestAnimationFrame(tick);
  }

  items.forEach((it) => {
    const v = it.video;
    v.pause();
    const meta = () => { it.dur = v.duration || 0; it.ready = true; };
    if (v.readyState >= 1 && v.duration) meta();
    else v.addEventListener("loadedmetadata", meta, { once: true });
    // stagger bandwidth: hero buffers immediately, product videos start
    // downloading once their section comes within a few viewports (see onScroll)
    if (it.isHero) {
      it.upgraded = true;
      v.preload = "auto";
    } else {
      v.preload = "metadata";
    }
    v.load();
  });

  function upgradePreload() {
    const y = window.scrollY;
    for (const it of items) {
      if (it.upgraded) continue;
      if (y + vh() * 3 > it.top) {
        it.upgraded = true;
        it.video.preload = "auto";
        it.video.load();
      }
    }
  }
  window.addEventListener("scroll", upgradePreload, { passive: true });

  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => { layout(); onScroll(); }, 150);
  });
  window.addEventListener("scroll", onScroll, { passive: true });

  layout();
  onScroll();
  upgradePreload();
  window.addEventListener("load", () => { layout(); onScroll(); upgradePreload(); });
  if (!prefersReduced) requestAnimationFrame(tick);

  /* ===== scroll reveals ===== */
  const revealEls = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window && !prefersReduced) {
    const io = new IntersectionObserver((entries) => {
      for (const e of entries) {
        if (e.isIntersecting) {
          e.target.classList.add("revealed");
          if (e.target.hasAttribute("data-count") || e.target.querySelector("[data-count]")) {
            countUp(e.target.hasAttribute("data-count") ? e.target : e.target.querySelector("[data-count]"));
          }
          io.unobserve(e.target);
        }
      }
    }, { threshold: 0.18, rootMargin: "0px 0px -8% 0px" });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("revealed"));
  }

  /* ===== stat counters — parse "250,000+" style values, animate up ===== */
  function countUp(el) {
    if (!el || el.dataset.counted) return;
    el.dataset.counted = "1";
    const raw = el.textContent.trim();
    const m = raw.match(/^([\d\s., ]+)(.*)$/);
    if (!m) return;
    const numStr = m[1].replace(/[^\d]/g, "");
    const target = parseInt(numStr, 10);
    if (!target) return;
    const suffix = m[2] || "";
    // preserve original grouping character (space vs comma)
    const groupChar = m[1].includes(",") ? "," : (m[1].match(/[\s ]/) ? " " : "");
    const fmt = (n) => groupChar
      ? String(n).replace(/\B(?=(\d{3})+(?!\d))/g, groupChar)
      : String(n);
    const dur = 1400;
    const t0 = performance.now();
    (function step(now) {
      const k = clamp((now - t0) / dur, 0, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = fmt(Math.round(target * eased)) + suffix;
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  // re-run counters when language switches (values re-rendered by i18n)
  window.addEventListener("amudario:lang", () => {
    document.querySelectorAll("[data-count]").forEach((el) => {
      delete el.dataset.counted;
      if (el.closest(".revealed")) countUp(el);
    });
  });

  /* ===== 3D tilt on cards ===== */
  if (!prefersReduced && matchMedia("(pointer:fine)").matches) {
    document.querySelectorAll("[data-tilt]").forEach((card) => {
      let raf = 0;
      card.addEventListener("pointermove", (ev) => {
        if (raf) return;
        raf = requestAnimationFrame(() => {
          raf = 0;
          const r = card.getBoundingClientRect();
          const px = (ev.clientX - r.left) / r.width - 0.5;
          const py = (ev.clientY - r.top) / r.height - 0.5;
          card.style.transform =
            `perspective(900px) rotateX(${(-py * 6).toFixed(2)}deg) rotateY(${(px * 8).toFixed(2)}deg) translateY(-4px)`;
        });
      });
      card.addEventListener("pointerleave", () => {
        card.style.transform = "";
      });
    });
  }
})();
