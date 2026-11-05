import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
test('visitors can follow the event from introduction through application', async () => {
  const source = await readFile(new URL('../app/page.tsx', import.meta.url), 'utf8');
  const positions = ['id="about"', 'id="experience"', 'id="outline"', 'id="flow"', 'id="faq"', 'id="entry"'].map(id => source.indexOf(id));
  assert.ok(positions.every(p => p >= 0));
  assert.deepEqual(positions, [...positions].sort((a,b) => a-b));
  assert.match(source, /docs\.google\.com\/forms/);
  assert.match(source, /会場は決定次第ご案内/);
});

