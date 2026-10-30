import { APP_NAME, LANGS, LANG_LABEL, UI, TERMS } from '../demo/js/i18n.js';
import { PATIENTS } from '../demo/js/demo-data.js';
import { buildPayload, encode } from '../demo/js/share.js';
import { esc } from '../demo/js/views.js';
import { HOME } from './home-i18n.js';

// Contact for clinics. Empty until the team picks a public channel; the page then says it is coming soon.
const CONTACT = '';

const KEY = 'kcl-home-lang';
const DEMO_KEY = 'kcl-demo-v1';
const APPLE = /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent); // iPadOS reports itself as Macintosh
const wide = window.matchMedia('(min-width: 921px)');

function initialLang() {
  try { const s = localStorage.getItem(KEY); if (LANGS.includes(s)) return s; } catch (e) { /* ignore */ }
  const l = (navigator.language || '').slice(0, 2);
  return LANGS.includes(l) ? l : 'en';
}

let lang = initialLang();
// Russian readers get the Russian-speaking sample patient; everyone else gets the Chinese patient.
const pidFor = l => (l === 'ru' ? 'aziz' : 'chen');

function apply() {
  document.documentElement.lang = lang;
  document.title = APP_NAME;
  document.querySelectorAll('[data-name]').forEach(el => { el.textContent = APP_NAME; });
  document.querySelectorAll('[data-t]').forEach(el => { const s = HOME[el.dataset.t]; if (s) el.textContent = s[lang]; });
  document.getElementById('contact').textContent = CONTACT || HOME.contact_pending[lang];
  document.getElementById('wallet-home').href = 'demo/wallet/' + pidFor(lang) + '.pkpass';
  document.getElementById('langs').innerHTML = LANGS.map(l =>
    '<button type="button" data-l="' + l + '" aria-pressed="' + (l === lang) + '">' + LANG_LABEL[l] + '</button>').join('');
  drawCards();
}

// ---------- the Wallet card, drawn the way the real pass looks (prototype/wallet/build-passes.mjs) ----------
// Labels follow the page language (Wallet uses the phone's language); values are the patient's language plus English.
const MARK = '<svg viewBox="0 0 100 100" aria-hidden="true"><rect x="27" y="21" width="46" height="58" rx="5" fill="#FBFCFA"/><rect x="45.5" y="35" width="9" height="26" fill="#0C6A63"/><rect x="37" y="43.5" width="26" height="9" fill="#0C6A63"/><rect x="36" y="67.5" width="28" height="2.4" fill="#0C6A63"/></svg>';
const TOOTH = '<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="46" fill="none" stroke="#BEE4DD" stroke-width="4"/><path fill="#FBFCFA" d="M30 38C30 21 42 18 50 26C58 18 70 21 70 38C70 50 66 54 64 62L60 79C59 83 55 83 55 79L52 62C51 58 49 58 48 62L45 79C45 83 41 83 40 79L36 62C34 54 30 50 30 38Z"/></svg>';

const two = (id, l) => { const x = TERMS[id]; if (!x) return esc(id); return l === 'en' ? x.en : x[l] + ' · ' + x.en; };
const list = (ids, l) => (ids.length ? ids.map(id => (TERMS[id] && TERMS[id].bleed ? '⚠ ' : '') + two(id, l)).join('<br>') : UI.none[l] + (l === 'en' ? '' : ' · None'));
function nextVisit(p) { return p.records.map(r => r.next).filter(Boolean).sort((a, b) => a.date.localeCompare(b.date))[0]; }

function passHtml(p, L, qrId) {
  const l = p.lang, s = p.self, next = nextVisit(p);
  return '<div class="pass-top"><span class="pass-logo">' + MARK + '</span><b>' + esc(APP_NAME) + '</b>' +
      (next ? '<span class="pass-h"><small>' + UI.next[L] + '</small>' + esc(next.date) + ' ' + (TERMS[next.proc] ? TERMS[next.proc][l] : '') + '</span>' : '') + '</div>' +
    '<div class="pass-primary"><div><small>' + HOME.card_name[L] + '</small><strong>' + esc(p.name === p.name_en ? p.name : p.name + '  ' + p.name_en) + '</strong></div><span class="pass-thumb">' + TOOTH + '</span></div>' +
    '<div class="pass-row"><div><small>' + UI.allergies[L] + '</small><span>' + list(s.allergies, l) + '</span></div></div>' +
    '<div class="pass-row two"><div><small>' + UI.meds[L] + '</small><span>' + list(s.meds, l) + '</span></div><div><small>' + UI.born[L] + '</small><span>' + esc(p.birth) + '</span></div></div>' +
    (qrId ? '<a class="pass-qr" id="' + qrId + '" target="_blank" rel="noopener" aria-label="Doctor view"></a><p class="pass-alt">DEMO · Sample data</p>' : '');
}

// Scene 1: an example inquiry (planned feature) — the message in the patient's language, the summary in the page language.
// Scene 3: what the doctor abroad sees (always English).
function inboundShot(p, L) {
  const from = p.lang.toUpperCase(), to = L.toUpperCase();
  const row = k => '<div class="mini-r wide"><span>' + HOME[k][L] + '</span><span>' + HOME[k + '_v'][L] + '</span></div>';
  return '<div class="mini"><div class="mini-h"><b>' + HOME.inq_new[L] + '</b><span class="tag en">' + (from === to ? from : from + ' → ' + to) + '</span></div>' +
    '<p class="mini-msg" lang="' + p.lang + '">' + esc(HOME.inq_msg[p.lang]) + '<span class="mini-att">X-ray.jpg</span></p>' +
    '<div class="mini-sum">' + HOME.inq_sum[L] + '</div>' + ['inq_c', 'inq_q'].map(row).join('') + '</div>';
}
function doctorShot(p) {
  const s = p.self;
  const risks = s.allergies.map(id => 'Allergy: ' + (TERMS[id] ? TERMS[id].en : id)).concat(s.meds.filter(id => TERMS[id] && TERMS[id].bleed).map(id => TERMS[id].en + ': bleeding risk'));
  return '<div class="mini doc"><div class="mini-h"><b>Clinical summary</b><span class="tag en">EN</span></div>' +
    (risks.length ? '<div class="mini-alert">⚠ ' + risks.map(esc).join('<br>⚠ ') + '</div>' : '') +
    p.records.slice(0, 3).map(r => '<div class="mini-r"><span class="mono">' + esc(r.date.slice(5)) + '</span><span>' + (r.tooth ? '#' + r.tooth + ' ' : '') + (TERMS[r.proc] ? TERMS[r.proc].en : esc(r.proc)) + '</span></div>').join('') + '</div>';
}

let drawId = 0;
async function drawCards() {
  const id = ++drawId, p = PATIENTS[pidFor(lang)];
  document.getElementById('pass').innerHTML = passHtml(p, lang, 'pass-qr');
  document.getElementById('shot1').innerHTML = inboundShot(p, lang);
  document.getElementById('shot2').innerHTML = '<div class="pass mini-pass">' + passHtml(p, lang, '') + '</div>';
  document.getElementById('shot3').innerHTML = doctorShot(p);
  // Same link the pass QR carries (no 24-hour expiry), so scanning the page shows the real doctor view.
  let url;
  try {
    const payload = buildPayload(p, p.self, 'all');
    delete payload.e;
    url = new URL('demo/#/v/' + (await encode(payload)), location.href).href;
  } catch (e) { return; }
  if (id !== drawId) return;
  const a = document.getElementById('pass-qr');
  a.href = url;
  qrCanvas(a, url, 3, 2);
}

function qrCanvas(box, text, px, quiet) {
  if (typeof window.qrcode !== 'function') return false;
  const qr = window.qrcode(0, 'L');
  qr.addData(text); qr.make();
  const n = qr.getModuleCount();
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = (n + quiet * 2) * px;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0F2A2E';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * px, (r + quiet) * px, px, px);
  box.innerHTML = '';
  box.appendChild(canvas);
  return true;
}

// ---------- embedded demo (wide screens only; on phones the buttons open it full screen) ----------
// Keep the embedded demo in the page language until the visitor has picked a sample patient.
// Returns true when it changed the stored language.
function syncDemoLang() {
  try {
    const s = JSON.parse(localStorage.getItem(DEMO_KEY) || 'null') || {};
    if (s.pid || s.lang === lang) return false;
    s.lang = lang;
    localStorage.setItem(DEMO_KEY, JSON.stringify(s));
    return true;
  } catch (e) { return false; /* storage blocked: the demo picks its own language */ }
}
const frame = document.getElementById('demo-frame');
function loadFrame() { if (wide.matches && !frame.getAttribute('src')) frame.src = 'demo/'; }
wide.addEventListener('change', loadFrame);

document.getElementById('langs').addEventListener('click', e => {
  const b = e.target.closest('[data-l]');
  if (!b || b.dataset.l === lang) return;
  lang = b.dataset.l;
  try { localStorage.setItem(KEY, lang); } catch (err) { /* ignore */ }
  apply();
  if (syncDemoLang() && frame.getAttribute('src')) {
    try { frame.contentWindow.location.reload(); } catch (err) { frame.src = 'demo/'; }
  }
});

function drawDemoQR() {
  const url = new URL('demo/', location.href).href;
  document.getElementById('demo-url').textContent = url.replace(/^https?:\/\//, '');
  const box = document.getElementById('qr');
  if (!qrCanvas(box, url, 4, 3)) box.hidden = true;
}

// Days until the amended Act takes effect: 27 May 2027, 00:00 in Korea (UTC+9).
const LAUNCH = Date.UTC(2027, 4, 26, 15);
document.getElementById('dday').textContent = 'D-' + Math.max(0, Math.ceil((LAUNCH - Date.now()) / 864e5));

document.getElementById('wallet-home').hidden = !APPLE;
document.getElementById('wallet-hint').hidden = !APPLE;
document.getElementById('android-hint').hidden = APPLE;

apply();
syncDemoLang();
loadFrame();
drawDemoQR();
