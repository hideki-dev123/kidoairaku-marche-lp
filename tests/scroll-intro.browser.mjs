// Run against the existing dev server. Playwright is a QA tool, not an app dependency.
// PLAYWRIGHT_MODULE may point to a preinstalled Playwright index.mjs file URL.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true });
const baseURL = process.env.INTRO_TEST_URL || 'http://127.0.0.1:5173';
const output = 'outputs/intro-qa';
await mkdir(output, { recursive: true });
const reports = [];

async function snapshot(page) {
  return page.evaluate(() => {
    const intro = document.querySelector('.scroll-intro');
    const hero = document.querySelector('.intro-hero');
    const video = document.querySelector('video');
    return {
      time: video.currentTime, paused: video.paused, duration: video.duration,
      reveal: Number(getComputedStyle(intro).getPropertyValue('--intro-reveal')),
      opacity: Number(getComputedStyle(hero).opacity), fallback: intro.dataset.fallback,
      heroTop: hero.getBoundingClientRect().top,
      stageTop: document.querySelector('.intro-stage').getBoundingClientRect().top,
      width: document.documentElement.scrollWidth, viewport: window.innerWidth,
      heroInert: hero.inert,
    };
  });
}

async function seek(page, progress) {
  await page.evaluate((p) => {
    const intro = document.querySelector('.scroll-intro');
    const stage = document.querySelector('.intro-stage');
    window.scrollTo({ top: intro.offsetTop + (intro.offsetHeight - stage.offsetHeight) * p, behavior: 'instant' });
  }, progress);
  await page.waitForFunction((p) => {
    const video = document.querySelector('video');
    const desired = Math.min(1, p / 0.78) * (video.duration - 1 / 24 + 0.001);
    const reveal = Number(getComputedStyle(document.querySelector('.scroll-intro')).getPropertyValue('--intro-reveal'));
    return !video.seeking && Math.abs(video.currentTime - desired) < 0.035 && (p <= 0.82 || reveal > 0);
  }, progress, { timeout: 12000 });
  await page.screenshot({ path: `${output}/${page.viewportSize().width}-${Math.round(progress * 1000)}.png` });
  const state = await snapshot(page);
  assert.equal(state.paused, true, 'film must never play on a clock');
  assert.ok(state.width <= state.viewport, 'no horizontal page overflow');
  if (progress <= 0.82) assert.equal(state.opacity, 0, 'Hero cannot precede the completed film');
  if (progress === 1) { assert.equal(state.reveal, 1); assert.equal(state.heroInert, false); }
  return state;
}

try {
  for (const [width, height] of [[1440,900],[1280,720],[768,1024],[375,812],[390,844],[430,932]]) {
    const page = await browser.newPage({ viewport: { width, height }, isMobile: width < 500, hasTouch: width < 500 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
    const samples = [];
    for (const progress of [0,0.195,0.39,0.585,0.779,0.78,0.8,0.87,0.93,1,0.39,0]) {
      samples.push({ progress, ...await seek(page, progress) });
    }
    const stopped = await snapshot(page);
    await page.waitForTimeout(300);
    assert.equal((await snapshot(page)).time, stopped.time, 'scroll stop must freeze the film');
    await seek(page, 1);
    await page.reload({ waitUntil: 'domcontentloaded' });
    // Vinext owns history restoration. Accept its reset-to-top policy, but
    // require video/Hero to agree with the actual restored scroll position.
    await page.waitForFunction(() => {
      const intro = document.querySelector('.scroll-intro');
      const video = document.querySelector('video');
      return window.scrollY === 0
        ? video.readyState >= 2 && video.currentTime < 0.04 && getComputedStyle(document.querySelector('.intro-hero')).opacity === '0'
        : intro.dataset.complete === 'true';
    });
    const reload = await snapshot(page);
    const knownEnvironmentErrors = process.env.ALLOW_WINDOWS_VINEXT_FONT_ERRORS === '1'
      ? errors.filter(error => /^Not allowed to load local resource: file:\/\/\/.+\/\.vinext\/fonts\/.+\.woff2$/.test(error)) : [];
    assert.deepEqual(errors.filter(error => !knownEnvironmentErrors.includes(error)), [], 'no new browser console errors');
    reports.push({ width, height, samples, reload, errors, knownEnvironmentErrors });
    console.log(`PASS ${width}x${height}: film 0/25/50/75/100, hold, reveal, reverse, stop, reload`);
    await page.close();
  }

  for (const mode of ['reduced','no-js','video-error','skip','reduced-live','deep-link']) {
    const context = await browser.newContext({ viewport: { width:390, height:844 },
      reducedMotion: mode === 'reduced' ? 'reduce' : 'no-preference', javaScriptEnabled: mode !== 'no-js' });
    const page = await context.newPage();
    if (mode === 'video-error') await page.route('**/*.mp4', route => route.abort());
    await page.goto(baseURL + (mode === 'deep-link' ? '/#top' : ''), { waitUntil:'domcontentloaded' });
    if (mode !== 'no-js' && mode !== 'reduced') await page.waitForFunction(() => {
      const intro = document.querySelector('.scroll-intro');
      return intro.dataset.complete !== undefined || intro.dataset.fallback === 'true';
    });
    if (mode === 'skip') await page.getByRole('button', { name:'イントロをスキップ' }).click();
    if (mode === 'reduced-live') {
      await seek(page, 0.39);
      await page.emulateMedia({ reducedMotion:'reduce' });
      await page.waitForFunction(() => document.querySelector('.scroll-intro').dataset.fallback === 'true');
    }
    if (mode === 'deep-link') await page.waitForFunction(() => document.querySelector('.scroll-intro').dataset.complete === 'true');
    else await page.waitForFunction(() => getComputedStyle(document.querySelector('.intro-hero')).opacity === '1');
    const usable = await page.evaluate(() => ({
      height: document.querySelector('.scroll-intro').offsetHeight,
      heroHeight: document.querySelector('.intro-hero').offsetHeight,
      opacity: getComputedStyle(document.querySelector('.intro-hero')).opacity,
      cta: document.querySelector('.hero-actions a').getAttribute('href'),
      scrollY: window.scrollY,
    }));
    assert.equal(usable.opacity, '1');
    assert.equal(usable.cta, '#entry');
    if (mode !== 'deep-link') assert.equal(usable.height, usable.heroHeight, 'fallback removes the long runway');
    if (mode === 'reduced-live') assert.ok(usable.scrollY <= 1, 'changing motion preference during the film keeps Hero in view');
    await page.screenshot({ path:`${output}/${mode}.png` });
    reports.push({ mode, ...usable });
    console.log(`PASS ${mode}`);
    await context.close();
  }

  {
    const context = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
      hasTouch: true,
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 Version/17.0 Mobile/15E148 Safari/604.1',
    });
    const page = await context.newPage();
    await page.addInitScript(() => {
      window.__introPlayEvents = 0;
      document.addEventListener('play', (event) => {
        if (event.target instanceof HTMLVideoElement) window.__introPlayEvents += 1;
      }, true);
    });
    await page.goto(baseURL, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => document.querySelector('video').readyState >= 2);
    await page.waitForFunction(() => document.documentElement.classList.contains('motion-ready'));
    await page.touchscreen.tap(20, 100);
    await page.waitForFunction(() => window.__introPlayEvents === 1);
    await page.evaluate(() => {
      const intro = document.querySelector('.scroll-intro');
      const stage = document.querySelector('.intro-stage');
      window.scrollTo({ top: (intro.offsetHeight - stage.offsetHeight) * 0.39, behavior: 'instant' });
    });
    await page.waitForFunction(() => {
      const video = document.querySelector('video');
      return video.currentTime > 4.9 && video.paused;
    });
    reports.push({ mode: 'ios-user-activation', ...await snapshot(page) });
    console.log('PASS ios-user-activation');
    await context.close();
  }
} finally {
  await writeFile(`${output}/results.json`, JSON.stringify(reports, null, 2));
  await browser.close();
}
