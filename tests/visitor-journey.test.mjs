import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('the original section order and single application route are preserved', async () => {
  const source = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');
  const markers = ['id="about"', 'className="gallery section"', 'className="fit section"', 'id="experience"', 'className="voices section"', 'id="outline"', 'id="faq"', 'id="entry"'];
  const positions = markers.map(marker => source.indexOf(marker));
  assert.ok(positions.every(p => p >= 0));
  assert.deepEqual(positions, [...positions].sort((a,b) => a-b));
  assert.doesNotMatch(source, /id="flow"/);
  assert.match(source, /docs\.google\.com\/forms/);
});

