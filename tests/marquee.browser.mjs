import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const browser = await chromium.launch({ headless: true, ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}) });
try {
  for (const width of [320, 390, 768, 1440, 1920, 2560, 3840]) {
    const page = await browser.newPage({ viewport: { width, height: 900 } });
    await page.goto(process.env.MARQUEE_TEST_URL || 'http://127.0.0.1:4176/', { waitUntil: 'domcontentloaded' });
    await page.evaluate(() => document.fonts.ready);
    const result = await page.evaluate(() => {
      const marquee = document.querySelector('.brand-marquee');
      const groups = [...marquee.querySelectorAll('.marquee-cycle')];
      const animations = groups.flatMap(group => group.getAnimations());
      if (groups.length !== 2 || animations.length !== 2) return null;
      animations.forEach(a => a.pause());
      const positions = group => [...group.children].map(child => ({ text: child.textContent, left: child.getBoundingClientRect().left }));
      animations.forEach(a => { a.currentTime = 0; });
      const initial = positions(groups[0]);
      const coverage = [0, .25, .5, .75, .999].map(phase => {
        animations.forEach(a => { a.currentTime = Number(a.effect.getTiming().duration) * phase; });
        const clip = marquee.getBoundingClientRect();
        const boxes = groups.map(g => g.getBoundingClientRect()).sort((a,b) => a.left-b.left);
        let covered = clip.left;
        for (const box of boxes) if (box.right > covered && box.left <= covered + 1) covered = Math.max(covered, box.right);
        return { phase, missing: Math.max(0, clip.right-covered) };
      });
      animations.forEach(a => { a.currentTime = Number(a.effect.getTiming().duration) * .99999; });
      const repeated = positions(groups[1]);
      const same = initial.every((item, i) => item.text === repeated[i]?.text);
      const largestShift = Math.max(...initial.map((item, i) => Math.abs(item.left - repeated[i].left)));
      return {coverage, same, largestShift};
    });
    assert.ok(result, 'two animated cycles are present');
    for (const sample of result.coverage) assert.ok(sample.missing <= 1, `${width}px at ${sample.phase}: ${sample.missing}px of blank space`);
    assert.equal(result.same, true, 'the two cycles have the same content');
    assert.ok(result.largestShift < 1, `${width}px: repeat shifts ${result.largestShift}px`);
    console.log(`PASS ${width}px: continuous coverage and seamless repeat`);
    await page.close();
  }
  const reducedPage = await browser.newPage({ viewport: { width: 1920, height: 900 }, reducedMotion: 'reduce' });
  await reducedPage.goto(process.env.MARQUEE_TEST_URL || 'http://127.0.0.1:4176/', { waitUntil: 'domcontentloaded' });
  const reduced = await reducedPage.evaluate(() => ({ animations: document.querySelector('.brand-marquee').getAnimations({subtree:true}).length, overflow: document.documentElement.scrollWidth - innerWidth }));
  assert.equal(reduced.animations, 0, 'reduced motion must stop the loop');
  assert.equal(reduced.overflow, 0, 'the loop must not cause horizontal scrolling');
  console.log('PASS reduced motion');
  await reducedPage.close();
} finally { await browser.close(); }

