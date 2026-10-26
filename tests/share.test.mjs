// Run: node --test prototype/web/tests/share.test.mjs
import test from 'node:test';
import assert from 'node:assert/strict';
import { buildPayload, encode, decode, expand } from '../demo/js/share.js';
import { PATIENTS } from '../demo/js/demo-data.js';
import { doctor } from '../demo/js/views.js';

test('every sample patient survives encode → decode in every scope', async () => {
  for (const p of Object.values(PATIENTS)) {
    const self = structuredClone(p.self);
    self.custom.push({ cat: 'allergies', text: '海鲜 <b>x</b>' });
    for (const scope of ['all', 'dental', 'em']) {
      const payload = buildPayload(p, self, scope, 1793000000000);
      const link = await encode(payload);
      assert.ok(link.length < 1000, 'link short enough for a QR code: ' + link.length);
      assert.deepEqual(await decode(link), expand(payload));
    }
  }
});

test('damaged or hostile links are rejected', async () => {
  for (const bad of ['', 'x', 'zAAAA', 'z!!!', 'j' + 'a'.repeat(7000), 'j' + Buffer.from('{"v":2}').toString('base64url')]) {
    await assert.rejects(decode(bad));
  }
  const odd = expand({ v: 1, p: [1, null], r: [[123, 99, {}], 'x'], a: [1, 'ok'], k: 'no', x: [['q', 'bad'], ['a', 5]] });
  assert.equal(odd.records.length, 1);
  assert.equal(odd.records[0].tooth, null);
  assert.deepEqual(odd.self.allergies, ['ok']);
});

test('doctor view escapes link text and hides expired data', async () => {
  const p = PATIENTS.chen, self = structuredClone(p.self);
  self.custom.push({ cat: 'meds', text: '<img src=x onerror=alert(1)>' });
  const live = expand(buildPayload(p, self, 'all'));
  const html = doctor(live, 'en', false);
  assert.ok(html.includes('&lt;img') && !html.includes('<img'));
  const old = expand(buildPayload(p, self, 'all', Date.now() - 2 * 86400000));
  const expired = doctor(old, 'en', false);
  assert.ok(expired.includes('expired') && !expired.includes('Penicillin'));
});
