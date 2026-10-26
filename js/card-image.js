// Draws the emergency card as a 1080×1920 PNG (phone lock-screen proportions) on a canvas.
// Text comes from the same dictionaries as the screen; nothing is fetched.
import { UI, TERMS } from './i18n.js';
import { secondLang } from './views.js';

const W = 1080, H = 1920, PAD = 80;
const FONT = '-apple-system, "Apple SD Gothic Neo", "PingFang SC", "Noto Sans", "Noto Sans KR", "Segoe UI", Roboto, sans-serif';
const C = { bg: '#FBFCFA', ink: '#0F2A2E', muted: '#566A6B', crit: '#A23B2A', line: '#CCD8D4' };

function label(id, l) { const x = TERMS[id]; return x && x[l] ? x[l] : String(id); }

// Wraps by character so CJK text without spaces also breaks.
function wrap(ctx, text, maxW) {
  const lines = []; let cur = '';
  for (const ch of String(text)) {
    if (ch === '\n') { lines.push(cur); cur = ''; continue; }
    if (ctx.measureText(cur + ch).width > maxW && cur) {
      const sp = cur.lastIndexOf(' ');
      if (sp > cur.length * 0.5) { lines.push(cur.slice(0, sp)); cur = cur.slice(sp + 1) + ch; }
      else { lines.push(cur); cur = ch; }
    } else cur += ch;
  }
  if (cur) lines.push(cur);
  return lines;
}

export function drawCard(self, A) {
  const B = secondLang(A);
  const canvas = document.createElement('canvas');
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = C.crit; ctx.lineWidth = 18; ctx.strokeRect(9, 9, W - 18, H - 18);

  // Leave the top third clear: the lock screen clock sits there.
  let y = 560;
  const text = (s, size, weight, color, gap) => {
    ctx.font = weight + ' ' + size + 'px ' + FONT; ctx.fillStyle = color;
    for (const line of wrap(ctx, s, W - PAD * 2)) { ctx.fillText(line, PAD, y); y += size * 1.3; }
    y += gap || 0;
  };
  ctx.textBaseline = 'top';
  text('✚ ' + UI.em_card[A] + ' · ' + UI.em_card[B], 44, '700', C.crit, 18);
  text(UI.plea[A], 52, '700', C.ink, 4);
  text(UI.plea[B], 34, '400', C.muted, 36);

  const block = (key, items) => {
    ctx.fillStyle = C.line; ctx.fillRect(PAD, y, W - PAD * 2, 3); y += 26;
    text(UI[key][A] + ' · ' + UI[key][B], 30, '600', C.muted, 6);
    if (!items.length) { text(UI.none[A] + ' / ' + UI.none[B], 48, '700', C.ink, 26); return; }
    items.forEach(([a, b]) => { text(a, 50, '700', C.ink, 0); text(b, 32, '500', C.muted, 14); });
    y += 12;
  };
  const items = cat => self[cat].map(id => [label(id, A), label(id, B)])
    .concat(self.custom.filter(c => c.cat === cat).map(c => [c.text, UI.unreviewed[B]]));
  block('allergies', items('allergies'));
  block('meds', items('meds'));
  block('conditions', items('conditions'));
  block('contact', [[self.contact.name, self.contact.phone]]);
  return canvas;
}

export function cardBlob(self, A) {
  return new Promise((resolve, reject) => drawCard(self, A).toBlob(b => b ? resolve(b) : reject(new Error('toBlob failed')), 'image/png'));
}
