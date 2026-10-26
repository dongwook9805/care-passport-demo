// Share links carry the record itself after "#/v/", so nothing is stored on a server.
// Format: one prefix letter ("z" = deflate-raw compressed, "j" = plain JSON) + base64url.
// Anything decoded here came from a link someone else made: validate every field and never trust it as HTML.

const MAX_LINK = 6000;      // characters after "#/v/"
const MAX_JSON = 20000;     // bytes after inflating
const DAY = 24 * 60 * 60 * 1000;
const CAT_CODE = { allergies: 'a', meds: 'm', conditions: 'c' };
const CODE_CAT = { a: 'allergies', m: 'meds', c: 'conditions' };

export function buildPayload(patient, self, scope, now = Date.now()) {
  const o = { v: 1, s: scope, p: [patient.name, patient.name_en, patient.birth, patient.nat, patient.lang], t: now, e: now + DAY };
  if (scope !== 'em') {
    o.r = patient.records.map(r => {
      const row = [r.date, r.tooth || 0, r.proc, r.material || '', r.lot || '', r.next ? r.next.date : '', r.next ? r.next.proc : ''];
      while (row.length > 3 && row[row.length - 1] === '') row.pop();
      return row;
    });
  }
  if (scope !== 'dental') {
    o.a = self.allergies; o.m = self.meds; o.c = self.conditions;
    if (self.custom.length) o.x = self.custom.map(c => [CAT_CODE[c.cat], c.text]);
    o.k = [self.contact.name, self.contact.phone];
  }
  return o;
}

function toB64url(bytes) {
  let s = '';
  for (let i = 0; i < bytes.length; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(str) {
  if (!/^[A-Za-z0-9_-]*$/.test(str)) throw new Error('bad characters');
  let b = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  const s = atob(b);
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) out[i] = s.charCodeAt(i);
  return out;
}

async function pipe(bytes, stream, limit) {
  const reader = new Blob([bytes]).stream().pipeThrough(stream).getReader();
  const chunks = []; let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (limit && total > limit) { reader.cancel(); throw new Error('too large'); }
    chunks.push(value);
  }
  const out = new Uint8Array(total); let off = 0;
  for (const c of chunks) { out.set(c, off); off += c.length; }
  return out;
}

const canCompress = typeof CompressionStream === 'function' && typeof DecompressionStream === 'function';

export async function encode(obj) {
  const json = new TextEncoder().encode(JSON.stringify(obj));
  if (canCompress) {
    try { return 'z' + toB64url(await pipe(json, new CompressionStream('deflate-raw'))); } catch (e) { /* fall through */ }
  }
  return 'j' + toB64url(json);
}

export async function decode(link) {
  if (typeof link !== 'string' || link.length < 2 || link.length > MAX_LINK) throw new Error('bad length');
  const kind = link[0], bytes = fromB64url(link.slice(1));
  let json;
  if (kind === 'z') {
    if (!canCompress) throw new Error('no inflate');
    json = await pipe(bytes, new DecompressionStream('deflate-raw'), MAX_JSON);
  } else if (kind === 'j') {
    if (bytes.length > MAX_JSON) throw new Error('too large');
    json = bytes;
  } else throw new Error('bad prefix');
  return expand(JSON.parse(new TextDecoder().decode(json)));
}

// ---- validation: turn an untrusted object into the shape the views expect ----
function str(x, max = 80) { return typeof x === 'string' ? x.slice(0, max) : ''; }
function ids(a) { return Array.isArray(a) ? a.filter(x => typeof x === 'string').slice(0, 20).map(x => x.slice(0, 40)) : []; }
function tooth(n) { return Number.isInteger(n) && n >= 11 && n <= 48 && n % 10 >= 1 && n % 10 <= 8 ? n : null; }
function time(n) { return Number.isFinite(n) && n > 0 ? n : null; }

export function expand(o) {
  if (!o || o.v !== 1 || !Array.isArray(o.p)) throw new Error('bad payload');
  const scope = ['all', 'dental', 'em'].includes(o.s) ? o.s : 'all';
  const data = {
    scope,
    patient: { name: str(o.p[0]), name_en: str(o.p[1]), birth: str(o.p[2], 10), nat: str(o.p[3], 4), lang: str(o.p[4], 4) },
    sharedAt: time(o.t), expiresAt: time(o.e),
    records: [], self: null
  };
  if (scope !== 'em' && Array.isArray(o.r)) {
    data.records = o.r.slice(0, 40).filter(Array.isArray).map(r => ({
      date: str(r[0], 10), tooth: tooth(r[1]), proc: str(r[2], 40), material: str(r[3]), lot: str(r[4], 40),
      next: r[5] ? { date: str(r[5], 10), proc: str(r[6], 40) } : null
    }));
  }
  if (scope !== 'dental') {
    const k = Array.isArray(o.k) ? o.k : [];
    data.self = {
      allergies: ids(o.a), meds: ids(o.m), conditions: ids(o.c),
      custom: (Array.isArray(o.x) ? o.x : []).slice(0, 20).filter(x => Array.isArray(x) && CODE_CAT[x[0]]).map(x => ({ cat: CODE_CAT[x[0]], text: str(x[1], 60) })),
      contact: { name: str(k[0]), phone: str(k[1], 30) }
    };
  }
  return data;
}
