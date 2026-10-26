import { APP_NAME, LANGS, LANG_LABEL } from '../demo/js/i18n.js';
import { HOME } from './home-i18n.js';

// Contact for clinics. Empty until the team picks a public channel; the page then says it is coming soon.
const CONTACT = '';

const KEY = 'kcl-home-lang';
const DEMO_KEY = 'kcl-demo-v1';

function initialLang() {
  try { const s = localStorage.getItem(KEY); if (LANGS.includes(s)) return s; } catch (e) { /* ignore */ }
  const l = (navigator.language || '').slice(0, 2);
  return LANGS.includes(l) ? l : 'en';
}

let lang = initialLang();

function apply() {
  document.documentElement.lang = lang;
  document.title = APP_NAME;
  document.querySelectorAll('[data-name]').forEach(el => { el.textContent = APP_NAME; });
  document.querySelectorAll('[data-t]').forEach(el => { const s = HOME[el.dataset.t]; if (s) el.textContent = s[lang]; });
  document.getElementById('contact').textContent = CONTACT || HOME.contact_pending[lang];
  // Russian readers get the Russian-speaking sample patient's card; everyone else gets the Chinese patient's.
  document.getElementById('wallet-home').href = 'demo/wallet/' + (lang === 'ru' ? 'aziz' : 'chen') + '.pkpass';
  document.getElementById('langs').innerHTML = LANGS.map(l =>
    '<button type="button" data-l="' + l + '" aria-pressed="' + (l === lang) + '">' + LANG_LABEL[l] + '</button>').join('');
}

// Keep the embedded demo in the page language until the visitor has picked a sample patient.
// Returns true when it changed the stored language. The frame gets its src only after this runs,
// so the demo reads the language on its first load.
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

document.getElementById('langs').addEventListener('click', e => {
  const b = e.target.closest('[data-l]');
  if (!b || b.dataset.l === lang) return;
  lang = b.dataset.l;
  try { localStorage.setItem(KEY, lang); } catch (err) { /* ignore */ }
  apply();
  if (syncDemoLang()) {
    try { frame.contentWindow.location.reload(); } catch (err) { frame.src = 'demo/'; }
  }
});

function drawQR() {
  const url = new URL('demo/', location.href).href;
  document.getElementById('demo-url').textContent = url.replace(/^https?:\/\//, '');
  const box = document.getElementById('qr');
  if (typeof window.qrcode !== 'function') { box.hidden = true; return; }
  const qr = window.qrcode(0, 'M');
  qr.addData(url); qr.make();
  const n = qr.getModuleCount(), quiet = 3, px = 4;
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = (n + quiet * 2) * px;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = '#0F2A2E';
  for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) ctx.fillRect((c + quiet) * px, (r + quiet) * px, px, px);
  box.appendChild(canvas);
}

// Wallet passes open only on Apple devices (iPadOS reports itself as Macintosh).
if (/iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent)) document.getElementById('wallet-box').hidden = false;

apply();
syncDemoLang();
frame.src = 'demo/';
drawQR();
