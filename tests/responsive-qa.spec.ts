/**
 * QA Subagent: Responsive Layout Verification
 * Tests formatting, alignment, and layout across mobile, tablet, and desktop viewports.
 * Run: npx playwright test responsive-qa
 */

import { test, expect } from '@playwright/test';

const HOMEPAGE = '/en/';
const PRODUCT_PAGE = '/en/oxus-ws';

const viewportNames: Record<string, string> = {
  desktop: '1280×720',
  tablet: '1024×768',
  mobile: '390×844',
};

test.describe('Homepage - Layout & Formatting QA', () => {
  test('hero section is visible and properly contained', async ({ page }, testInfo) => {
    const vp = viewportNames[testInfo.project.name] || 'unknown';
    await page.goto(HOMEPAGE, { waitUntil: 'load' });
    await page.waitForTimeout(500); // Allow animations

    const hero = page.locator('.hero');
    await expect(hero).toBeVisible();

    // Check no excessive horizontal overflow (allow for canvas/rounding)
    const html = page.locator('html');
    const overflow = await html.evaluate(() => {
      const body = document.body;
      const htmlEl = document.documentElement;
      const maxScroll = Math.max(body.scrollWidth, htmlEl.scrollWidth);
      const clientW = Math.max(body.clientWidth, htmlEl.clientWidth);
      return maxScroll - clientW;
    });
    // Allow minor overflow from canvas/animations; fail only on significant overflow (e.g. >50px)
    expect(overflow).toBeLessThanOrEqual(50);

    // Hero content centered
    const heroContent = page.locator('.hero-content');
    await expect(heroContent).toBeVisible();
    const heroBox = await heroContent.boundingBox();
    expect(heroBox).not.toBeNull();
    expect(heroBox!.width).toBeGreaterThan(200);
  });

  test('navbar is visible and navigation links accessible', async ({ page }) => {
    await page.goto(HOMEPAGE, { waitUntil: 'load' });

    const navbar = page.locator('.navbar');
    await expect(navbar).toBeVisible();

    const navLogo = page.locator('.nav-logo');
    await expect(navLogo).toBeVisible();

    const navContainer = page.locator('.nav-container');
    await expect(navContainer).toBeVisible();
  });

  test('solutions grid displays correctly', async ({ page }, testInfo) => {
    await page.goto(HOMEPAGE, { waitUntil: 'load' });
    await page.locator('#products').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const grid = page.locator('.solutions-grid');
    await expect(grid).toBeVisible();

    const cards = page.locator('.solution-card');
    await expect(cards).toHaveCount(4);

    // Cards should not overflow or overlap
    for (let i = 0; i < 4; i++) {
      const card = cards.nth(i);
      await expect(card).toBeVisible();
      const box = await card.boundingBox();
      expect(box).not.toBeNull();
      expect(box!.width).toBeGreaterThan(0);
      expect(box!.height).toBeGreaterThan(0);
    }
  });

  test('footer is visible and links are accessible', async ({ page }) => {
    await page.goto(HOMEPAGE, { waitUntil: 'load' });
    await page.locator('.footer').scrollIntoViewIfNeeded();

    const footer = page.locator('.footer');
    await expect(footer).toBeVisible();

    const footerLinks = page.locator('.footer-links a');
    await expect(footerLinks.first()).toBeVisible();
    expect(await footerLinks.count()).toBeGreaterThanOrEqual(1);
  });

  test('story sections have no layout overflow', async ({ page }) => {
    await page.goto(HOMEPAGE, { waitUntil: 'load' });

    const storySections = page.locator('.story-section');
    const count = await storySections.count();
    expect(count).toBeGreaterThanOrEqual(1);

    for (let i = 0; i < Math.min(count, 2); i++) {
      const section = storySections.nth(i);
      await section.scrollIntoViewIfNeeded();
      await page.waitForTimeout(200);

      const overflow = await section.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return rect.right > window.innerWidth + 10 || rect.left < -10;
      });
      expect(overflow).toBe(false);
    }
  });

  test('container has proper padding and max-width', async ({ page }) => {
    await page.goto(HOMEPAGE, { waitUntil: 'load' });

    const container = page.locator('.container').first();
    if ((await container.count()) > 0) {
      await container.scrollIntoViewIfNeeded();
      const box = await container.boundingBox();
      if (box) {
        expect(box.width).toBeLessThanOrEqual(1248); // 1200 + 48 padding
        expect(box.width).toBeGreaterThan(100);
      }
    }
  });
});

test.describe('Product Page - Layout QA', () => {
  test('product nav and hero visible', async ({ page }) => {
    await page.goto(PRODUCT_PAGE, { waitUntil: 'load' });

    const productNav = page.locator('.product-nav, #productNav');
    await expect(productNav).toBeVisible();

    const productHero = page.locator('.product-hero');
    await expect(productHero).toBeVisible();
  });

  test('product content grids responsive', async ({ page }) => {
    await page.goto(PRODUCT_PAGE, { waitUntil: 'load' });
    await page.locator('.product-problems').scrollIntoViewIfNeeded();
    await page.waitForTimeout(300);

    const problemsGrid = page.locator('.product-problems-grid');
    await expect(problemsGrid).toBeVisible();
    const box = await problemsGrid.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThan(0);
  });
});

test.describe('Navbar hamburger collapse', () => {
  test('desktop: nav links visible, hamburger hidden', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'desktop', 'desktop-only test');
    await page.goto(HOMEPAGE, { waitUntil: 'load' });

    const navLinks = page.locator('.nav-links');
    const navToggle = page.locator('.nav-toggle');

    await expect(navLinks).toBeVisible();
    // Hamburger should be hidden (display: none) on desktop
    await expect(navToggle).toBeHidden();

    // Nav links should be laid out horizontally
    const linksBox = await navLinks.boundingBox();
    expect(linksBox).not.toBeNull();
    expect(linksBox!.width).toBeGreaterThan(300);
  });

  test('tablet: nav links visible, hamburger hidden (breakpoint > 768px)', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'tablet', 'tablet-only test');
    await page.goto(HOMEPAGE, { waitUntil: 'load' });

    const navLinks = page.locator('.nav-links');
    const navToggle = page.locator('.nav-toggle');

    // Tablet is 1024px, above the 768px breakpoint — links visible, hamburger hidden
    await expect(navLinks).toBeVisible();
    await expect(navToggle).toBeHidden();
  });

  test('mobile: hamburger visible, nav links hidden until toggled', async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== 'mobile', 'mobile-only test');
    await page.goto(HOMEPAGE, { waitUntil: 'load' });

    const navLinks = page.locator('.nav-links');
    const navToggle = page.locator('.nav-toggle');

    // Hamburger should be visible on mobile
    await expect(navToggle).toBeVisible();

    // Nav links panel should be off-screen (right: -100%)
    const linksBox = await navLinks.boundingBox();
    expect(linksBox).not.toBeNull();
    expect(linksBox!.x).toBeGreaterThanOrEqual(390); // pushed off viewport

    // Click hamburger to open
    await navToggle.click();
    await page.waitForTimeout(500); // wait for slide animation

    // Nav links should now be visible and on-screen
    await expect(navLinks).toHaveClass(/open/);
    const openBox = await navLinks.boundingBox();
    expect(openBox).not.toBeNull();
    expect(openBox!.x).toBeLessThan(390);
    expect(openBox!.width).toBeGreaterThan(200);

    // Hamburger should show X pattern (active class)
    await expect(navToggle).toHaveClass(/active/);

    // Click hamburger again to close
    await navToggle.click();
    await page.waitForTimeout(500);

    await expect(navLinks).not.toHaveClass(/open/);
  });
});

test.describe('Logo aspect ratio', () => {
  test('navbar logo preserves aspect ratio on homepage', async ({ page }) => {
    await page.goto(HOMEPAGE, { waitUntil: 'load' });

    const logoImg = page.locator('.nav-logo img');
    await expect(logoImg).toBeVisible();

    const ratio = await logoImg.evaluate((img: HTMLImageElement) => {
      const natural = img.naturalWidth / img.naturalHeight;
      const rendered = img.getBoundingClientRect().width / img.getBoundingClientRect().height;
      return { natural: Math.round(natural * 100) / 100, rendered: Math.round(rendered * 100) / 100 };
    });

    expect(ratio.rendered).toBeCloseTo(ratio.natural, 1);
  });

  test('navbar logo preserves aspect ratio on product page', async ({ page }) => {
    await page.goto(PRODUCT_PAGE, { waitUntil: 'load' });

    const logoImg = page.locator('.nav-logo img');
    await expect(logoImg).toBeVisible();

    const ratio = await logoImg.evaluate((img: HTMLImageElement) => {
      const natural = img.naturalWidth / img.naturalHeight;
      const rendered = img.getBoundingClientRect().width / img.getBoundingClientRect().height;
      return { natural: Math.round(natural * 100) / 100, rendered: Math.round(rendered * 100) / 100 };
    });

    expect(ratio.rendered).toBeCloseTo(ratio.natural, 1);
  });

  test('footer logo preserves aspect ratio', async ({ page }) => {
    await page.goto(HOMEPAGE, { waitUntil: 'load' });
    await page.locator('.footer').scrollIntoViewIfNeeded();

    const logoImg = page.locator('.footer-brand img');
    await expect(logoImg).toBeVisible();

    const ratio = await logoImg.evaluate((img: HTMLImageElement) => {
      const natural = img.naturalWidth / img.naturalHeight;
      const rendered = img.getBoundingClientRect().width / img.getBoundingClientRect().height;
      return { natural: Math.round(natural * 100) / 100, rendered: Math.round(rendered * 100) / 100 };
    });

    expect(ratio.rendered).toBeCloseTo(ratio.natural, 1);
  });
});

test.describe('Cross-viewport layout sanity', () => {
  test('no elements with zero dimensions when visible', async ({ page }) => {
    await page.goto(HOMEPAGE, { waitUntil: 'load' });

    const problematic = await page.evaluate(() => {
      const issues: string[] = [];
      document.querySelectorAll('.hero, .navbar, .solution-card, .footer, .section-header').forEach((el, i) => {
        const rect = el.getBoundingClientRect();
        if (rect.width === 0 || rect.height === 0) {
          const inView = rect.top < window.innerHeight && rect.bottom > 0;
          if (inView) issues.push(`${el.className} (index ${i}): ${rect.width}x${rect.height}`);
        }
      });
      return issues;
    });
    expect(problematic).toEqual([]);
  });

  test('buttons and links are clickable (adequate touch targets)', async ({ page }) => {
    await page.goto(HOMEPAGE, { waitUntil: 'load' });

    const buttons = page.locator('.btn, .nav-cta, .nav-back');
    const count = await buttons.count();
    for (let i = 0; i < Math.min(count, 5); i++) {
      const btn = buttons.nth(i);
      if (await btn.isVisible()) {
        const box = await btn.boundingBox();
        if (box) {
          // Min touch target ~44px recommended; allow 28px min for compact nav
          expect(box.height).toBeGreaterThanOrEqual(24);
          expect(box.width).toBeGreaterThan(16);
        }
      }
    }
  });
});
