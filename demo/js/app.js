import { APP_NAME, LANGS, UI, DOC } from './i18n.js';
import { PATIENTS } from './demo-data.js';
import * as V from './views.js';
import { buildPayload, encode, decode } from './share.js';
import { cardBlob } from './card-image.js';
import * as JV from './journey.js';
import { J } from './journey-i18n.js';
import * as F from './files.js';

// ---------- state (patient data lives only in this browser) ----------
const KEY = 'kcl-demo-v1';
const SCOPES = ['all', 'dental', 'em'];
const clone = o => JSON.parse(JSON.stringify(o));

function guessLang() {
  const l = (navigator.language || '').slice(0, 2);
  return LANGS.includes(l) ? l : 'en';
}
function validSelf(x) {
  return x && ['allergies', 'meds', 'conditions', 'custom'].every(k => Array.isArray(x[k])) && x.contact && typeof x.contact.name === 'string';
}
const KINDS = ['inquiry', 'check', 'msg'];
function validInbox(x) {
  return Array.isArray(x) ? x.filter(it => it && typeof it.id === 'string' && KINDS.includes(it.kind) && typeof it.at === 'number') : [];
}
function load() { try { return JSON.parse(localStorage.getItem(KEY) || 'null') || {}; } catch (e) { return {}; } }
function save() {
  try { localStorage.setItem(KEY, JSON.stringify({ pid: state.pid, lang: state.lang, self: state.self, scope: state.scope, inbox: state.inbox })); } catch (e) { /* private mode: keep going in memory */ }
}

const saved = load();
const state = {
  pid: PATIENTS[saved.pid] ? saved.pid : null,
  lang: LANGS.includes(saved.lang) ? saved.lang : guessLang(),
  self: validSelf(saved.self) ? saved.self : null,
  scope: SCOPES.includes(saved.scope) ? saved.scope : 'all',
  inbox: validInbox(saved.inbox),
  draft: { tooth: null, files: [] },
  draftFor: '',
  cmp: [],
  docLang: 'en',
  fromPatient: false,
  shareUrl: ''
};
if (state.pid && !state.self) state.self = clone(PATIENTS[state.pid].self);
// Demo: the sample clinic answers every message a few seconds later. Anything sent before a reload is answered now.
const REPLY_MS = 3500;
state.inbox.forEach(it => { if (!it.reply && Date.now() - it.at > REPLY_MS) it.reply = { at: it.at + REPLY_MS }; });

// ---------- render ----------
const root = document.getElementById('app');
const brand = document.getElementById('brand');
const demo = document.getElementById('demo');
let renderId = 0;

function setChrome(lang, isDoctor) {
  document.documentElement.lang = lang;
  document.body.classList.toggle('doc', isDoctor);
  brand.textContent = APP_NAME;
  demo.textContent = isDoctor ? DOC.demo[lang] : UI.demo[lang];
  document.title = APP_NAME + (isDoctor ? ' · Doctor view' : '');
}

async function route() {
  const id = ++renderId;
  const h = location.hash.slice(1) || '/';
  if (h.startsWith('/v/')) {
    setChrome(state.docLang, true);
    let html;
    try { html = V.doctor(await decode(h.slice(3)), state.docLang, state.fromPatient); }
    catch (e) { html = V.broken(state.docLang); }
    if (id !== renderId) return;
    root.innerHTML = html;
    window.scrollTo(0, 0);
    return;
  }
  if (h.startsWith('/me/')) { const [link, to] = h.slice(4).split('/'); await restore(link, to === 'card' ? '#/card' : '#/'); return; }
  state.fromPatient = false;
  if (!state.pid && h !== '/start') { location.replace('#/start'); return; }
  setChrome(state.lang, false);
  // Each form starts with an empty draft (picked tooth, attached photos).
  const form = ['/ask', '/thread'].includes(h) || h.startsWith('/check') ? h : '';
  if (form && state.draftFor !== form) { state.draft = { tooth: null, files: [] }; state.draftFor = form; }
  if (!form) state.draftFor = '';
  let html;
  if (h === '/start') html = V.start(state);
  else if (h === '/ask') html = JV.ask(state);
  else if (h.startsWith('/sent/')) { const it = state.inbox.find(x => x.id === h.slice(6)); html = it ? JV.sent(state, it) : V.home(state, JV.panel(state)); }
  else if (h.startsWith('/check')) { const [, , ri, cp] = h.split('/'); html = JV.check(state, parseInt(ri, 10), parseInt(cp, 10) || 0); }
  else if (h === '/thread') { state.inbox.forEach(it => { if (it.reply) it.seen = true; }); save(); html = JV.thread(state); }
  else if (h === '/clinic') html = JV.clinic(state);
  else if (h === '/files') {
    const list = await F.allFiles().catch(() => []);
    state.cmp = state.cmp.filter(id => list.some(f => f.id === id));
    html = JV.files(state, list);
  }
  else if (h.startsWith('/compare/')) {
    const [a, b] = h.slice(9).split('/');
    const [x, y] = await Promise.all([F.getFile(a).catch(() => null), F.getFile(b).catch(() => null)]);
    html = JV.compare(state, x, y);
  }
  else if (h.startsWith('/photo/')) html = JV.photo(state, await F.getFile(h.slice(7)).catch(() => null));
  else if (h.startsWith('/detail/')) html = V.detail(state, parseInt(h.slice(8), 10) || 0);
  else if (h === '/edit') html = V.edit(state);
  else if (h === '/share') html = V.share(state);
  else if (h === '/card') html = V.card(state);
  else html = V.home(state, JV.panel(state));
  if (id !== renderId) return;
  root.innerHTML = html;
  window.scrollTo(0, 0);
  if (h === '/share') prepareShare(id);
  hydrate();
}

// "#/me/<data>": the "My record" link on the back of a Wallet card. It carries the patient's own record,
// so it opens on any phone, even one that never used the demo. Demo only: it maps back to a sample patient.
// "#/me/<data>/card" opens the emergency card instead of the home screen.
async function restore(link, dest) {
  let ok = false;
  try {
    const data = await decode(link);
    const pid = Object.keys(PATIENTS).find(k => PATIENTS[k].name_en === data.patient.name_en && PATIENTS[k].birth === data.patient.birth);
    if (pid) {
      if (state.pid !== pid) state.inbox = [];
      state.pid = pid;
      state.self = data.self || clone(PATIENTS[pid].self);
      if (LANGS.includes(data.patient.lang)) state.lang = data.patient.lang;
      save(); ok = true;
    }
  } catch (e) { /* fall through */ }
  location.replace(state.pid ? dest : '#/start');
  toast(ok ? UI.restored[state.lang] : UI.restore_fail[state.lang]);
}

// Fill <img data-fid> with the stored photo.
async function hydrate(scope) {
  for (const img of (scope || root).querySelectorAll('img[data-fid]')) {
    if (img.src) continue;
    try { const u = await F.urlFor(img.dataset.fid); if (u) img.src = u; else img.classList.add('missing'); }
    catch (e) { img.classList.add('missing'); }
  }
}

// ---------- the journey: add an item to the conversation and let the sample clinic reply ----------
function addItem(it) {
  it.id = F.newId(); it.at = Date.now(); it.reply = null;
  state.inbox.push(it); save();
  setTimeout(() => {
    it.reply = { at: Date.now() }; save();
    toast(J.new_reply[state.lang]);
    const h = location.hash.slice(1) || '/';
    if (h === '/' || h === '/thread' || h === '/clinic' || h.startsWith('/sent/')) rerender();
  }, REPLY_MS);
  return it;
}
const painOf = (fd, sym) => { const p = Math.max(0, Math.min(10, parseInt(fd.get('pain'), 10) || 0)); return p > 0 || sym.includes('pain') ? p : null; };
const txt = (fd, k, n) => String(fd.get(k) || '').trim().slice(0, n);

function rerender() { const y = window.scrollY; route().then(() => window.scrollTo(0, y)); }

// ---------- share: build the link and draw its QR ----------
function baseUrl() { return location.href.split('#')[0]; }

async function prepareShare(id) {
  const box = document.getElementById('qr');
  try {
    const link = await encode(buildPayload(PATIENTS[state.pid], state.self, state.scope));
    if (id !== renderId) return;
    state.shareUrl = baseUrl() + '#/v/' + link;
    drawQR(box, state.shareUrl);
    root.querySelectorAll('[data-act="copylink"],[data-act="preview"]').forEach(b => { b.disabled = false; });
  } catch (e) {
    box.innerHTML = '<span class="sub">' + UI.qr_fail[state.lang] + '</span>';
  }
}

function drawQR(box, text) {
  if (typeof window.qrcode !== 'function') throw new Error('qr library missing');
  const qr = window.qrcode(0, 'L');
  qr.addData(text);
  qr.make();
  const n = qr.getModuleCount(), quiet = 4, size = 280;
  const dpr = Math.max(1, Math.min(3, window.devicePixelRatio || 1));
  const canvas = document.createElement('canvas');
  const px = Math.floor((size * dpr) / (n + quiet * 2));
  canvas.width = canvas.height = px * (n + quiet * 2);
  canvas.style.width = canvas.style.height = size + 'px';
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0F2A2E';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * px, (r + quiet) * px, px, px);
  box.innerHTML = '';
  box.appendChild(canvas);
}

// ---------- toast ----------
const toastEl = document.getElementById('toast');
let toastTimer;
function toast(msg) {
  toastEl.textContent = msg; toastEl.hidden = false;
  clearTimeout(toastTimer); toastTimer = setTimeout(() => { toastEl.hidden = true; }, 3200);
}

// ---------- events ----------
let resetArmed = false;
root.addEventListener('click', async e => {
  const b = e.target.closest('[data-act]');
  if (!b || b.tagName === 'FORM') return;
  const a = b.dataset.act;
  if (a === 'lang') { state.lang = b.dataset.l; save(); rerender(); }
  else if (a === 'tooth') {
    const n = +b.dataset.n;
    state.draft.tooth = state.draft.tooth === n ? null : n;
    root.querySelectorAll('[data-act="tooth"]').forEach(x => x.setAttribute('aria-pressed', String(+x.dataset.n === state.draft.tooth)));
    const out = document.getElementById('tooth-out');
    if (out) out.textContent = state.draft.tooth ? '#' + state.draft.tooth : J.where_none[state.lang];
  }
  else if (a === 'fsel') {
    const id = b.dataset.id, i = state.cmp.indexOf(id);
    if (i > -1) state.cmp.splice(i, 1); else { state.cmp.push(id); if (state.cmp.length > 2) state.cmp.shift(); }
    rerender();
  }
  else if (a === 'samples') {
    b.disabled = true; b.textContent = UI.making[state.lang];
    try { const recs = await F.addSamples(); state.cmp = recs.map(r => r.id); rerender(); }
    catch (err) { b.disabled = false; toast(J.files_fail[state.lang]); }
  }
  else if (a === 'fdel') {
    if (b.dataset.armed !== '1') { b.dataset.armed = '1'; b.textContent = J.delete_arm[state.lang]; setTimeout(() => { if (b.isConnected) { b.dataset.armed = ''; b.textContent = UI.remove[state.lang]; } }, 3000); return; }
    await F.delFile(b.dataset.id).catch(() => {});
    state.cmp = state.cmp.filter(x => x !== b.dataset.id);
    location.hash = '#/files';
  }
  else if (a === 'pick') {
    if (state.pid !== b.dataset.pid) state.inbox = [];
    state.pid = b.dataset.pid; state.self = clone(PATIENTS[state.pid].self); save();
    location.hash = '#/';
  }
  else if (a === 'toggle') {
    const list = state.self[b.dataset.c], i = list.indexOf(b.dataset.id);
    if (i > -1) list.splice(i, 1); else list.push(b.dataset.id);
    b.setAttribute('aria-pressed', String(i === -1)); save();
  }
  else if (a === 'rmcustom') { state.self.custom.splice(+b.dataset.i, 1); save(); rerender(); }
  else if (a === 'scope') { state.scope = b.dataset.v; save(); rerender(); }
  else if (a === 'copylink') {
    const out = document.getElementById('link-out');
    const manual = () => { out.hidden = false; out.value = state.shareUrl; out.focus(); out.select(); toast(UI.copy_manual[state.lang]); };
    try { await navigator.clipboard.writeText(state.shareUrl); toast(UI.copied[state.lang]); } catch (err) { manual(); }
  }
  else if (a === 'preview') { state.fromPatient = true; location.hash = state.shareUrl.slice(state.shareUrl.indexOf('#')); }
  else if (a === 'doclang') { state.docLang = state.docLang === 'en' ? 'ko' : 'en'; const keep = state.fromPatient; await route(); state.fromPatient = keep; }
  else if (a === 'savecard') saveCard(b);
  else if (a === 'reset') {
    if (!resetArmed) { resetArmed = true; b.textContent = UI.reset_confirm[state.lang]; setTimeout(() => { resetArmed = false; if (b.isConnected) b.textContent = UI.reset[state.lang]; }, 3000); return; }
    resetArmed = false;
    try { localStorage.removeItem(KEY); } catch (err) { /* ignore */ }
    F.clearFiles().catch(() => {}); F.forgetUrls();
    state.pid = null; state.self = null; state.scope = 'all'; state.inbox = []; state.cmp = [];
    location.hash = '#/start';
  }
});

root.addEventListener('submit', e => {
  const jf = e.target.closest('form[data-act="ask"],form[data-act="check"],form[data-act="msg"]');
  if (jf) {
    e.preventDefault();
    const fd = new FormData(jf), kind = jf.dataset.act, files = state.draft.files.slice();
    let sym = fd.getAll('sym').map(String);
    const text = txt(fd, 'text', 600);
    if (kind === 'ask') {
      if (!sym.length && !text && !files.length) { toast(J.need_something[state.lang]); return; }
      const it = addItem({ kind: 'inquiry', tooth: state.draft.tooth, sym, pain: painOf(fd, sym), since: txt(fd, 'since', 2), want: fd.getAll('want').map(String), prior: txt(fd, 'prior', 120), text, files });
      state.draftFor = ''; location.hash = '#/sent/' + it.id;
    } else if (kind === 'check') {
      if (sym.length > 1) sym = sym.filter(k => k !== 'none');
      const it = addItem({ kind: 'check', rec: parseInt(fd.get('rec'), 10) || 0, cp: parseInt(fd.get('cp'), 10) || 7, sym, pain: painOf(fd, sym) ?? 0, text, files });
      state.draftFor = ''; location.hash = '#/thread';
      toast(JV.flag(it) === 'red' ? J.urgent[state.lang] : J.check_ok[state.lang]);
    } else {
      if (!text && !files.length) return;
      addItem({ kind: 'msg', text, files });
      state.draft = { tooth: null, files: [] }; rerender();
    }
    return;
  }
  const f = e.target.closest('form[data-act="addcustom"]');
  if (!f) return;
  e.preventDefault();
  const v = f.elements.text.value.trim();
  if (!v) return;
  state.self.custom.push({ cat: f.dataset.c, text: v.slice(0, 60) });
  save(); rerender();
});

// Photos picked in a form are stored right away and shown as thumbnails; the pain slider shows its value.
root.addEventListener('change', async e => {
  const el = e.target;
  if (el.matches('input[type="file"][data-act="attach"]')) {
    try { const recs = await F.addFiles(el.files, 'photo'); state.draft.files.push(...recs.map(r => r.id)); }
    catch (err) { toast(J.files_fail[state.lang]); }
    el.value = '';
    const box = document.getElementById('att');
    if (box) { box.innerHTML = JV.thumbs(state.draft.files); hydrate(box); }
  } else if (el.matches('input[type="file"][data-act="upload"]')) {
    const kind = (document.getElementById('f-kind') || {}).value || 'photo';
    try { await F.addFiles(el.files, kind); } catch (err) { toast(J.files_fail[state.lang]); }
    rerender();
  }
});
root.addEventListener('input', e => {
  if (e.target.id === 'pain') { const o = document.getElementById('pain-out'); if (o) o.textContent = e.target.value + '/10'; }
});

async function saveCard(btn) {
  const label = btn.textContent;
  btn.disabled = true; btn.textContent = UI.making[state.lang];
  try {
    const blob = await cardBlob(state.self, state.lang);
    const file = new File([blob], 'emergency-card.png', { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], title: UI.em_card[state.lang] }); }
      catch (err) { if (err && err.name === 'AbortError') return; throw err; }
    } else {
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url; link.download = 'emergency-card.png';
      document.body.appendChild(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
    toast(UI.saved_img[state.lang]);
  } catch (err) {
    toast(UI.save_fail[state.lang]);
  } finally {
    btn.disabled = false; btn.textContent = label;
  }
}

window.addEventListener('hashchange', route);
route();

// Offline support (needs https or localhost).
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
