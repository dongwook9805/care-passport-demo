// Screens return HTML strings. Every value that a person typed, or that came from a share link, goes through esc().
import { LANGS, LANG_LABEL, UI, TERMS, NAT, CLINIC, CLINIC_PHONE, REL, DOC } from './i18n.js';
import { PATIENTS } from './demo-data.js';

export function esc(s) {
  return String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
function t(k, l) { return UI[k][l]; }
function d(k, l) { return DOC[k][l]; }
// Term ids from a share link may be unknown: fall back to the escaped id itself.
export function term(id, l) { const x = TERMS[id]; return x && x[l] ? x[l] : esc(id); }
function nat(code, l) { return NAT[code] ? NAT[code][l] : esc(code); }
function toothLabel(n, l) { return n ? '#' + n : UI.full_mouth[l]; }
export function secondLang(l) { return l === 'en' ? 'ko' : 'en'; }
function fmtTime(ms, l) {
  try { return new Intl.DateTimeFormat(l === 'ko' ? 'ko-KR' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(ms)); }
  catch (e) { return new Date(ms).toISOString().slice(0, 16).replace('T', ' '); }
}

const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
function chart(records, link) {
  const on = {}, gone = {};
  records.forEach((r, i) => { if (r.tooth) { on[r.tooth] = i; if (r.proc === 'extraction') gone[r.tooth] = true; } });
  const tooth = n => {
    const cls = 't' + (n in on ? (gone[n] ? ' gone' : ' on') : '');
    return (n in on && link)
      ? '<a class="' + cls + '" href="#/detail/' + on[n] + '" aria-label="' + n + '">' + n + '</a>'
      : '<span class="' + cls + '" aria-hidden="true">' + n + '</span>';
  };
  const jaw = teeth => '<div class="jaw"><div class="half">' + teeth.slice(0, 8).map(tooth).join('') + '</div><div class="half">' + teeth.slice(8).map(tooth).join('') + '</div></div>';
  return '<div class="chart" role="img" aria-label="FDI tooth chart: ' + Object.keys(on).join(', ') + '">' +
    '<div class="lbl"><span>R</span><span>L</span></div>' +
    jaw(UPPER) + '<div class="mid"></div>' + jaw(LOWER) + '</div>';
}

// Wallet passes are pre-signed for the sample patients (prototype/wallet/build-passes.mjs). Only Apple devices open .pkpass.
const APPLE = typeof navigator !== 'undefined' && /iPhone|iPad|iPod|Macintosh/.test(navigator.userAgent);
function wallet(s) {
  if (!APPLE) return '';
  // target="_top": inside the homepage's iframe, Safari only hands a pass to Wallet from a top-level navigation.
  return '<a class="btn wallet block" href="wallet/' + s.pid + '.pkpass" target="_top" type="application/vnd.apple.pkpass">' + t('wallet_add', s.lang) + '</a>' +
    '<p class="sub center">' + t('wallet_note', s.lang) + '</p>';
}

function selfList(self, cat, l) {
  const ids = self[cat], custom = self.custom.filter(c => c.cat === cat);
  if (!ids.length && !custom.length) return '<span class="muted">' + UI.none[l] + '</span>';
  return ids.map(id => term(id, l)).concat(custom.map(c => esc(c.text) + ' <span class="badge u">' + UI.unreviewed[l] + '</span>')).join(', ');
}

// ---------- patient screens ----------
export function start(s) {
  const L = s.lang;
  return '<div class="hero"><p class="lead">' + t('start_title', L) + '</p><p class="sub">' + t('start_sub', L) + '</p></div>' +
    '<section class="sec"><h2>' + t('choose_lang', L) + '</h2><div class="list">' +
    LANGS.map(l => '<button type="button" class="row-btn" data-act="lang" data-l="' + l + '" aria-pressed="' + (l === L) + '">' + LANG_LABEL[l] + (l === L ? '<span aria-hidden="true">✓</span>' : '') + '</button>').join('') +
    '</div></section>' +
    '<section class="sec"><h2>' + t('pick_patient', L) + '</h2><p class="sub">' + t('pick_sub', L) + '</p><div class="list">' +
    Object.keys(PATIENTS).map(id => {
      const p = PATIENTS[id];
      return '<button type="button" class="row-btn" data-act="pick" data-pid="' + id + '"><span><b>' + esc(p.name) + '</b><br><span class="sub">' + esc(p.name_en) + ' · ' + nat(p.nat, L) + '</span></span><span aria-hidden="true">›</span></button>';
    }).join('') + '</div></section>';
}

export function home(s) {
  const L = s.lang, p = PATIENTS[s.pid], self = s.self;
  return '<div class="bar"><h1>' + t('passport', L) + '</h1><a class="link" href="#/start">' + LANG_LABEL[L] + ' ▾</a></div>' +
    '<div class="profile"><b>' + esc(p.name) + '</b><span class="meta">' + esc(p.name_en) + ' · ' + t('born', L) + ' <span class="mono">' + esc(p.birth) + '</span> · ' + nat(p.nat, L) + '</span></div>' +
    '<section class="sec"><div class="sec-h"><h2>' + t('verified', L) + '</h2><span class="badge v">✓ ' + CLINIC[L] + '</span></div>' +
    chart(p.records, true) +
    p.records.map((r, i) => '<a class="rec" href="#/detail/' + i + '"><span class="tooth">' + toothLabel(r.tooth, L) + '</span>' +
      '<span><span class="name">' + term(r.proc, L) + '</span><br><span class="when">' + esc(r.date) + '</span></span><span class="chev" aria-hidden="true">›</span></a>').join('') +
    '</section>' +
    '<section class="sec"><div class="sec-h"><h2>' + t('self', L) + '</h2><span class="badge s">' + t('self_badge', L) + '</span></div>' +
    '<div class="selfbox"><dl class="kv">' +
    '<dt>' + t('allergies', L) + '</dt><dd>' + selfList(self, 'allergies', L) + '</dd>' +
    '<dt>' + t('meds', L) + '</dt><dd>' + selfList(self, 'meds', L) + '</dd>' +
    '<dt>' + t('conditions', L) + '</dt><dd>' + selfList(self, 'conditions', L) + '</dd>' +
    '<dt>' + t('contact', L) + '</dt><dd>' + esc(self.contact.name) + ' (' + REL[L] + ')<br><span class="mono">' + esc(self.contact.phone) + '</span></dd>' +
    '</dl><a class="link" href="#/edit">' + t('edit', L) + ' ›</a></div></section>' +
    '<div class="row2"><a class="btn primary" href="#/share">' + t('show_doctor', L) + '</a><a class="btn" href="#/card">' + t('em_card', L) + '</a></div>' +
    wallet(s) +
    '<p class="sub center">' + t('install', L) + '</p>' +
    '<div class="row2 quiet"><a class="link" href="#/start">' + t('change_patient', L) + '</a><button type="button" class="link" data-act="reset">' + t('reset', L) + '</button></div>';
}

export function detail(s, i) {
  const L = s.lang, records = PATIENTS[s.pid].records, r = records[i] || records[0], tm = TERMS[r.proc];
  return '<div class="bar"><a class="link" href="#/">' + t('back', L) + '</a><span class="badge v">✓ ' + t('verified_by', L) + '</span></div>' +
    '<div><p class="sub mono">' + esc(r.date) + ' · ' + t('tooth', L) + ' ' + toothLabel(r.tooth, L) + '</p><h1 class="big">' + tm[L] + '</h1></div>' +
    chart([r], false) +
    '<div class="card"><h2>' + t('what', L) + '</h2><p>' + tm.plain[L] + '</p></div>' +
    '<div class="card"><h2>' + t('care', L) + '</h2><p>' + tm.care[L] + '</p></div>' +
    (r.next ? '<div class="card"><h2>' + t('next', L) + '</h2><p><span class="mono">' + esc(r.next.date) + '</span> · ' + term(r.next.proc, L) + '</p></div>' : '') +
    (r.material ? '<div class="card"><h2>' + t('material', L) + '</h2><p class="mono small">' + esc(r.material) + (r.lot ? ' · LOT ' + esc(r.lot) : '') + '</p></div>' : '') +
    '<div class="card note"><h2>' + t('clinic', L) + '</h2><p>' + CLINIC[L] + '<br><span class="mono">' + CLINIC_PHONE + '</span></p></div>';
}

export function edit(s) {
  const L = s.lang, self = s.self;
  const cat = (c) => {
    const ids = Object.keys(TERMS).filter(k => TERMS[k].cat === c);
    const custom = self.custom.map((x, i) => ({ x, i })).filter(o => o.x.cat === c);
    return '<section class="sec"><h2>' + t(c, L) + '</h2><div class="chips">' +
      ids.map(id => '<button type="button" class="chip" data-act="toggle" data-c="' + c + '" data-id="' + id + '" aria-pressed="' + (self[c].indexOf(id) > -1) + '">' + term(id, L) + '</button>').join('') + '</div>' +
      custom.map(o => '<div class="custom"><span>' + esc(o.x.text) + ' <span class="badge u">' + t('unreviewed', L) + '</span></span><button type="button" class="link" data-act="rmcustom" data-i="' + o.i + '">' + t('remove', L) + '</button></div>').join('') +
      '<form class="addrow" data-act="addcustom" data-c="' + c + '"><input id="free-' + c + '" name="text" type="text" maxlength="60" autocomplete="off" placeholder="' + esc(t('free', L)) + '" aria-label="' + esc(t(c, L) + ' · ' + t('free', L)) + '"><button class="btn" type="submit">' + t('add', L) + '</button></form></section>';
  };
  return '<div class="bar"><a class="link" href="#/">' + t('back', L) + '</a><span class="badge s">' + t('self_badge', L) + '</span></div>' +
    '<h1 class="big">' + t('self', L) + '</h1>' +
    '<p class="warnline">' + t('no_real', L) + '</p>' +
    '<p class="sub">' + t('pick', L) + '</p>' +
    cat('allergies') + cat('meds') + cat('conditions') +
    '<a class="btn primary block" href="#/">' + t('done', L) + '</a>';
}

export function share(s) {
  const L = s.lang;
  const opts = [['all', 'scope_all'], ['dental', 'scope_dental'], ['em', 'scope_em']];
  return '<div class="bar"><a class="link" href="#/">' + t('back', L) + '</a></div>' +
    '<h1 class="big">' + t('show_doctor', L) + '</h1>' +
    '<section class="sec"><h2>' + t('scope_q', L) + '</h2><div class="list">' +
    opts.map(o => '<button type="button" class="opt" data-act="scope" data-v="' + o[0] + '" aria-pressed="' + (s.scope === o[0]) + '"><span class="dot" aria-hidden="true"></span>' + t(o[1], L) + '</button>').join('') +
    '</div></section>' +
    '<div class="qr" id="qr" aria-label="QR"><span class="sub">' + t('making', L) + '</span></div>' +
    '<p class="sub center">' + t('qr_hint', L) + '<br><b>' + t('expires', L) + '</b></p>' +
    '<div class="row2"><button class="btn" type="button" data-act="copylink" disabled>' + t('copy_link', L) + '</button>' +
    '<button class="btn primary" type="button" data-act="preview" disabled>' + t('preview_doc', L) + '</button></div>' +
    '<textarea id="link-out" class="linkbox" readonly hidden aria-label="' + esc(t('copy_link', L)) + '"></textarea>';
}

export function card(s) {
  const A = s.lang, B = secondLang(A), self = s.self;
  const both = cat => {
    const ids = self[cat], cus = self.custom.filter(c => c.cat === cat);
    if (!ids.length && !cus.length) return UI.none[A] + '<small>' + UI.none[B] + '</small>';
    return ids.map(id => term(id, A) + '<small>' + term(id, B) + '</small>').concat(cus.map(c => esc(c.text) + '<small>' + UI.unreviewed[B] + '</small>')).join('');
  };
  const lbl = k => UI[k][A] + ' <small>· ' + UI[k][B] + '</small>';
  return '<div class="bar"><a class="link" href="#/">' + t('back', A) + '</a></div>' +
    '<div class="em"><div class="head"><b>✚ ' + UI.em_card[A] + ' · ' + UI.em_card[B] + '</b></div>' +
    '<p class="plea">' + UI.plea[A] + '<small>' + UI.plea[B] + '</small></p>' +
    '<dl>' +
    '<div><dt>' + lbl('allergies') + '</dt><dd>' + both('allergies') + '</dd></div>' +
    '<div><dt>' + lbl('meds') + '</dt><dd>' + both('meds') + '</dd></div>' +
    '<div><dt>' + lbl('conditions') + '</dt><dd>' + both('conditions') + '</dd></div>' +
    '<div><dt>' + lbl('contact') + '</dt><dd>' + esc(self.contact.name) + '<small class="mono">' + esc(self.contact.phone) + '</small></dd></div>' +
    '</dl></div>' +
    wallet(s) +
    '<button class="btn block" type="button" data-act="savecard">' + t('save_lock', A) + '</button>' +
    '<p class="sub center">' + t('install', A) + '</p>';
}

// ---------- doctor screen (built only from the link) ----------
export function doctor(data, L, fromPatient) {
  const p = data.patient, s = data.self;
  const head = '<div class="bar end"><button type="button" class="link" data-act="doclang">' + d('toggle', L) + '</button></div>';
  const back = fromPatient ? '<a class="link" href="#/share">' + d('back_patient', L) + '</a>' : '';
  if (data.expiresAt && Date.now() > data.expiresAt) {
    return head + '<div class="alert"><h2>' + d('expired', L) + '</h2></div><p class="foot">' + d('expiry_note', L) + '</p>' + back;
  }
  const alerts = [];
  if (s) {
    s.allergies.forEach(id => alerts.push(d('allergy', L) + ': <b>' + term(id, L) + '</b>'));
    s.meds.forEach(id => alerts.push(d('med', L) + ': <b>' + term(id, L) + '</b>' + (TERMS[id] && TERMS[id].bleed ? ' — <span class="risk">' + d('bleed', L) + '</span>' : '')));
    s.conditions.forEach(id => alerts.push(d('cond', L) + ': <b>' + term(id, L) + '</b>'));
    s.custom.forEach(c => alerts.push(esc(c.text) + ' <i>(' + d('patient_words', L) + ')</i>'));
  }
  // Source sits under the procedure name instead of its own column so the table fits a phone.
  const rows = data.records.map(r =>
    '<tr><td class="mono">' + esc(r.date) + '</td><td' + (r.tooth ? ' class="mono"' : '') + '>' + (r.tooth || d('all', L)) + '</td><td>' + term(r.proc, L) +
    (r.next ? '<br><span class="foot">' + d('planned', L) + ': ' + term(r.next.proc, L) + ' · ' + esc(r.next.date) + '</span>' : '') +
    '<br><span class="badge v">' + d('verified', L) + '</span></td>' +
    '<td class="foot wrap">' + (r.material ? esc(r.material) + (r.lot ? '<br>LOT ' + esc(r.lot) : '') : '—') + '</td></tr>').join('');
  const lang = LANG_LABEL[p.lang] || esc(p.lang);
  return head +
    '<div class="doc-h"><span class="kicker">' + d('kicker', L) + '</span><h1>' + esc(p.name_en) + (p.name && p.name !== p.name_en ? ' · ' + esc(p.name) : '') + '</h1>' +
    '<span class="meta">DOB ' + esc(p.birth) + ' · ' + nat(p.nat, L) + ' · ' + lang + '</span></div>' +
    (s ? '<div class="alert"><h2>' + d('alerts', L) + ' · <span class="norm">' + d('selfr', L) + '</span></h2>' +
      (alerts.length ? '<ul>' + alerts.map(a => '<li>' + a + '</li>').join('') + '</ul>' : '<p>' + d('no_alerts', L) + '</p>') + '</div>' : '') +
    (data.scope !== 'em'
      ? '<section class="sec"><h2>' + d('chart', L) + '</h2>' + chart(data.records, false) + '</section>' +
        '<section class="sec"><h2>' + d('hist', L) + '</h2><div class="tbl-wrap"><table><thead><tr><th>' + d('date', L) + '</th><th>' + d('tooth', L) + '</th><th>' + d('proc', L) + '</th><th>' + d('mat', L) + '</th></tr></thead><tbody>' + rows + '</tbody></table></div></section>' +
        '<div class="card note"><h2>' + d('clinic', L) + '</h2><p>' + CLINIC[L] + '<br><span class="mono">' + CLINIC_PHONE + '</span></p></div>'
      : '<p class="sub">' + d('scope_note', L) + '</p>') +
    (s ? '<p class="foot">' + d('contact', L) + ': ' + esc(s.contact.name) + ' · <span class="mono">' + esc(s.contact.phone) + '</span></p>' : '') +
    '<p class="foot">' + (data.sharedAt ? d('shared', L) + ' ' + fmtTime(data.sharedAt, L) : '') + (data.expiresAt ? ' · ' + d('expires', L) + ' ' + fmtTime(data.expiresAt, L) : '') + '</p>' +
    '<p class="foot">' + d('foot', L) + ' ' + d('expiry_note', L) + '</p>' + back;
}

export function broken(L) {
  return '<div class="bar end"><button type="button" class="link" data-act="doclang">' + d('toggle', L) + '</button></div>' +
    '<div class="alert"><h2>' + d('broken', L) + '</h2></div>';
}
