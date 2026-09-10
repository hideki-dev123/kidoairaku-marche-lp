import assert from 'node:assert/strict';

const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
});
const page = await context.newPage();

try {
  await page.addInitScript(() => {
    window.__introPlayEvents = 0;
    document.addEventListener('play', (event) => {
      if (event.target instanceof HTMLVideoElement) window.__introPlayEvents += 1;
    }, true);
  });
  await page.goto(process.env.INTRO_TEST_URL || 'http://127.0.0.1:5173', { waitUntil: 'domcontentloaded' });
  await page.waitForSelector('video');
  await page.waitForFunction(() => document.documentElement.classList.contains('motion-ready'));
  await page.touchscreen.tap(20, 100);
  await page.waitForFunction(() => window.__introPlayEvents === 1, undefined, { timeout: 3000 });
  await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
  await page.evaluate(() => {
    const intro = document.querySelector('.scroll-intro');
    const stage = document.querySelector('.intro-stage');
    window.scrollTo({ top: (intro.offsetHeight - stage.offsetHeight) * 0.39, behavior: 'instant' });
  });
  await page.waitForFunction(() => {
    const video = document.querySelector('video');
    return video.currentTime > 4.9 && video.paused;
  });
  assert.equal(await page.evaluate(() => document.querySelector('video').paused), true);
  console.log('PASS iOS touch unlocks a paused scroll-scrub video');
} finally {
  await context.close();
  await browser.close();
}
