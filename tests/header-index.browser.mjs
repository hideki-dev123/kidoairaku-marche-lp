import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
const url = process.env.HEADER_TEST_URL || 'http://127.0.0.1:4176/';
const expected = ['#about', '#gallery', '#experience', '#voices', '#outline', '#faq'];
try {
  for (const width of [320, 360, 390, 768, 1024, 1199]) {
    const page = await browser.newPage({ viewport: { width, height: 844 }, reducedMotion: 'reduce' });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    await page.waitForSelector('.header-index[data-ready=true] summary', { timeout: 10000 });
    const summary = page.locator('.header-index summary');
    await summary.click();
    assert.equal(await page.locator('.header-index').evaluate(el => el.open), true, 'menu opens');
    const items = page.locator('.header-index nav a');
    assert.deepEqual(await items.evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), expected);
    for (const href of expected) {
      assert.equal(await page.locator(href).count(), 1, `${href} exists`);
      assert.equal(await page.locator(`.header-index nav a[href="${href}"]`).isVisible(), true, `${href} visible`);
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.header-index').evaluate(el => el.open), false, 'Escape closes menu');
    assert.equal(await summary.evaluate(el => document.activeElement === el), true, 'Escape restores focus');
    await summary.click();
    await page.locator('.header-index nav a[href="#outline"]').click();
    assert.equal(await page.locator('.header-index').evaluate(el => el.open), false, 'link closes menu');
    assert.equal(new URL(page.url()).hash, '#outline');
    const geometry = await page.evaluate(() => {
      const brand = document.querySelector('.topbar .brand').getBoundingClientRect();
      const index = document.querySelector('.header-index summary').getBoundingClientRect();
      const cta = document.querySelector('.topbar .header-cta').getBoundingClientRect();
      return { brandRight: brand.right, indexLeft: index.left, indexRight: index.right, ctaLeft: cta.left, ctaRight: cta.right, viewport: innerWidth, overflow: document.documentElement.scrollWidth - innerWidth };
    });
    assert.ok(geometry.brandRight <= geometry.indexLeft && geometry.indexRight <= geometry.ctaLeft && geometry.ctaRight <= width, `${width}px header controls fit in order`);
    assert.equal(geometry.overflow, 0, 'no page overflow');
    console.log(`PASS ${width}px menu, keyboard, links and header layout`);
    await page.close();
  }
  for (const width of [1200, 1280, 1440, 1920]) {
    const page = await browser.newPage({ viewport: { width, height: 900 }, reducedMotion: 'reduce' });
    await page.goto(url, { waitUntil: 'domcontentloaded' });
    const links = page.locator('.desktop-index a');
    assert.deepEqual(await links.evaluateAll(nodes => nodes.map(node => node.getAttribute('href'))), expected);
    assert.equal(await links.count(), expected.length);
    for (const link of await links.all()) assert.equal(await link.isVisible(), true);
    assert.equal(await page.locator('.header-index').isVisible(), false);
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth - innerWidth), 0);
    console.log(`PASS ${width}px desktop index`);
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: { width: 320, height: 320 }, reducedMotion: "reduce" });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('.header-index[data-ready=true]', { state: 'attached' });
    await page.locator(".header-index summary").click();
    const panel = await page.locator(".index-panel").evaluate(el => ({ height: el.getBoundingClientRect().height, scroll: el.scrollHeight, top: el.getBoundingClientRect().top, viewport: innerHeight }));
    assert.ok(panel.top + panel.height <= panel.viewport, "short screens keep the index inside the viewport");
    assert.ok(panel.scroll >= panel.height, "long index remains scrollable");
    await page.locator('.header-index nav a[href="#faq"]').click();
    assert.equal(new URL(page.url()).hash, "#faq");
    assert.equal(await page.locator(".header-index").evaluate(el => el.open), false);
    console.log("PASS short screen index scroll and navigation");
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('.header-index[data-ready=true]', { state: 'attached' });
    await page.locator(".header-index summary").click();
    await page.mouse.click(5, 800);
    assert.equal(await page.locator(".header-index").evaluate(el => el.open), false, "outside tap closes the menu");
    console.log("PASS outside tap closes index");
    await page.close();
  }
  {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    await page.goto(url, { waitUntil: "domcontentloaded" });
    await page.waitForSelector('.header-index[data-ready=true]', { state: 'attached' });
    await page.locator(".intro-skip").click();
    await page.locator(".header-index summary").click();
    await page.locator('.header-index nav a[href="#gallery"]').click();
    assert.equal(new URL(page.url()).hash, "#gallery");
    console.log("PASS index after skipping intro");
    await page.close();
  }
} finally { await browser.close(); }

