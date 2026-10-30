// Care-journey screens: ask a clinic, check in after treatment, messages with the clinic, X-rays and photos,
// and a preview of what the clinic sees. Same rules as views.js: every typed value goes through esc().
import { UI, CLINIC, LANG_LABEL } from './i18n.js';
import { J, SYM } from './journey-i18n.js';
import { PATIENTS } from './demo-data.js';
import { esc, term } from './views.js';

const j = (k, l) => J[k][l];
const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k]);
export const ASK_SYM = ['pain', 'swelling', 'bleeding', 'loose', 'broken', 'sensitive', 'pus'];
const CHECK_SYM = ['none'].concat(ASK_SYM);
const SINCE = ['d', 'w', 'm', 'l'];
const WANT = ['visit', 'cost', 'opinion', 'online'];

// Labels for the summary the clinic receives.
const LBL = {
  area: { ko: '부위', zh: '部位', en: 'Where', ru: 'Где' },
  sym: { ko: '증상', zh: '症状', en: 'Symptoms', ru: 'Симптомы' },
  pain: { ko: '통증', zh: '疼痛', en: 'Pain', ru: 'Боль' },
  since: { ko: '시작', zh: '开始', en: 'Since', ru: 'С' },
  want: { ko: '요청', zh: '希望', en: 'Asks for', ru: 'Просит' },
  about: { ko: '치료', zh: '治疗', en: 'Treatment', ru: 'Лечение' },
  record: { ko: '이 치아 기록', zh: '这颗牙的记录', en: 'Record for this tooth', ru: 'Запись по зубу' },
  prior: { ko: '이전 치료', zh: '既往治疗', en: 'Past treatment', ru: 'Прошлое лечение' },
  words: { ko: '환자가 쓴 말', zh: '患者原话', en: "Patient's words", ru: 'Слова пациента' },
  files: { ko: '첨부', zh: '附件', en: 'Attached', ru: 'Вложения' },
  photos: { ko: '사진 {n}장', zh: '照片{n}张', en: '{n} photo(s)', ru: 'фото: {n}' }
};
const lb = (k, l) => LBL[k][l];

const UPPER = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const LOWER = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
function pickChart(sel, records) {
  const had = new Set(records.filter(r => r.tooth).map(r => r.tooth));
  const t = n => '<button type="button" class="t' + (had.has(n) ? ' had' : '') + '" data-act="tooth" data-n="' + n + '" aria-pressed="' + (sel === n) + '" aria-label="' + n + '">' + n + '</button>';
  const jaw = teeth => '<div class="jaw"><div class="half">' + teeth.slice(0, 8).map(t).join('') + '</div><div class="half">' + teeth.slice(8).map(t).join('') + '</div></div>';
  return '<div class="chart pick"><div class="lbl"><span>R</span><span>L</span></div>' + jaw(UPPER) + '<div class="mid"></div>' + jaw(LOWER) + '</div>';
}
function chips(name, keys, label, checked, type) {
  return '<div class="chips">' + keys.map(k => '<label class="chip pickable"><input type="' + (type || 'checkbox') + '" name="' + name + '" value="' + k + '"' + (checked.indexOf(k) > -1 ? ' checked' : '') + '>' + label(k) + '</label>').join('') + '</div>';
}
function attachRow(L, act) {
  return '<div class="attach"><label class="btn"><input type="file" accept="image/*" multiple data-act="' + act + '" class="vh">＋ ' + j('attach', L) + '</label>' +
    '<div class="thumbs" id="att"></div></div><p class="sub">' + j('attach_note', L) + '</p>';
}
export function thumbs(ids) {
  return (ids || []).map(id => '<img class="thumb" data-fid="' + esc(id) + '" alt="">').join('');
}
function fmt(ms, l) {
  try { return new Intl.DateTimeFormat({ ko: 'ko-KR', zh: 'zh-CN', ru: 'ru-RU', en: 'en-GB' }[l], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ms)); }
  catch (e) { return new Date(ms).toISOString().slice(5, 16).replace('T', ' '); }
}

// ---------- logic shared with app.js ----------
// The next check-in that is due for the most recent dated treatment: day 1, 7 or 30, newest first.
export function dueCheck(s) {
  const recs = PATIENTS[s.pid].records.map((r, i) => ({ r, i })).filter(o => /^\d{4}-\d{2}-\d{2}$/.test(o.r.date))
    .sort((a, b) => b.r.date.localeCompare(a.r.date));
  if (!recs.length) return null;
  const o = recs[0], days = Math.floor((Date.now() - Date.parse(o.r.date)) / 864e5);
  const cp = [30, 7, 1].find(n => n <= days);
  if (!cp || s.inbox.some(it => it.kind === 'check' && it.rec === o.i && it.cp === cp)) return null;
  return { i: o.i, r: o.r, cp };
}
// Demo rule for the clinic's list, so urgent check-ins stand out. Not a diagnosis.
export function flag(it) {
  if (it.kind === 'msg') return '';
  const s = it.sym || [], p = it.pain || 0;
  if (p >= 7 || s.indexOf('bleeding') > -1 || s.indexOf('loose') > -1) return 'red';
  if (p >= 4 || ['swelling', 'broken', 'pus'].some(k => s.indexOf(k) > -1)) return 'amber';
  return 'green';
}
export const unread = s => s.inbox.filter(it => it.reply && !it.seen).length;

// The organized summary, in any of the four languages. Picked items translate; typed text stays as written.
export function summary(it, s, L) {
  const p = PATIENTS[s.pid], rows = [];
  const raw = v => esc(v) + ' <span class="badge u">' + UI.unreviewed[L] + '</span>';
  if (it.kind === 'check') {
    const r = p.records[it.rec];
    if (r) rows.push([lb('about', L), term(r.proc, L) + (r.tooth ? ' #' + r.tooth : '') + ' · <span class="mono">' + esc(r.date) + '</span> · D+' + it.cp]);
  }
  if (it.kind === 'inquiry') {
    rows.push([lb('area', L), it.tooth ? '<span class="mono">#' + it.tooth + '</span>' : j('where_none', L)]);
    const rec = it.tooth && p.records.filter(r => r.tooth === it.tooth);
    if (rec && rec.length) rows.push([lb('record', L), rec.map(r => term(r.proc, L) + ' <span class="mono">' + esc(r.date) + '</span>' + (r.material ? ' · ' + esc(r.material) + (r.lot ? ' · LOT ' + esc(r.lot) : '') : '')).join('<br>')]);
  }
  if (it.sym && it.sym.length) rows.push([lb('sym', L), it.sym.map(k => SYM[k] ? SYM[k][L] : esc(k)).join(', ')]);
  if (it.kind !== 'msg' && it.pain != null) rows.push([lb('pain', L), '<span class="mono">' + (+it.pain) + '/10</span>']);
  if (it.since) rows.push([lb('since', L), j('since_' + it.since, L)]);
  if (it.want && it.want.length) rows.push([lb('want', L), it.want.map(k => j('w_' + k, L)).join(', ')]);
  if (it.prior) rows.push([lb('prior', L), raw(it.prior)]);
  if (it.text) rows.push([lb('words', L), raw(it.text)]);
  if (it.files && it.files.length) rows.push([lb('files', L), fill(lb('photos', L), { n: it.files.length })]);
  return '<dl class="kv sum">' + rows.map(r => '<dt>' + r[0] + '</dt><dd>' + r[1] + '</dd>').join('') + '</dl>';
}

// ---------- home panel ----------
export function panel(s) {
  const L = s.lang, due = dueCheck(s), n = unread(s);
  const tile = (href, stage, title, sub, extra) => '<a class="tile" href="' + href + '"><span class="stage-t">' + stage + '</span><b>' + title + (extra || '') + '</b><span class="sub">' + sub + '</span></a>';
  return '<section class="sec"><h2>' + j('journey', L) + '</h2>' +
    (due ? '<a class="due" href="#/check/' + due.i + '/' + due.cp + '"><b>' + fill(j('due_t', L), { n: due.cp }) + '</b><span>' + fill(j('due_d', L), { proc: term(due.r.proc, L), date: esc(due.r.date) }) + '</span></a>' : '') +
    '<div class="tiles">' +
    tile('#/ask', j('st_before', L), j('ask', L), j('ask_sub', L)) +
    tile('#/check', j('st_home', L), j('check', L), j('check_sub', L)) +
    tile('#/thread', j('st_home', L), j('thread', L), j('thread_sub', L), n ? ' <span class="badge new">' + j('unread', L) + ' ' + n + '</span>' : '') +
    tile('#/files', j('st_after', L) + ' · ' + j('st_home', L), j('files', L), j('files_sub', L)) +
    '</div><a class="link small" href="#/clinic">' + j('clinic_view', L) + ' ›</a></section>';
}

// ---------- ask a clinic ----------
export function ask(s) {
  const L = s.lang, d = s.draft;
  return '<div class="bar"><a class="link" href="#/">' + UI.back[L] + '</a></div>' +
    '<div><p class="sub">' + j('st_before', L) + '</p><h1 class="big">' + j('ask', L) + '</h1></div>' +
    '<p class="warnline">' + UI.no_real[L] + '</p>' +
    '<form class="form" data-act="ask" novalidate>' +
    '<section class="sec"><h2>' + j('where', L) + '</h2>' + pickChart(d.tooth, PATIENTS[s.pid].records) + '<p class="sub" id="tooth-out">' + (d.tooth ? '#' + d.tooth : j('where_none', L)) + '</p></section>' +
    '<section class="sec"><h2>' + j('symptoms', L) + '</h2>' + chips('sym', ASK_SYM, k => SYM[k][L], []) + '</section>' +
    painRow(L) +
    '<section class="sec"><h2>' + j('since', L) + '</h2>' + chips('since', SINCE, k => j('since_' + k, L), [], 'radio') + '</section>' +
    '<section class="sec"><h2>' + j('want', L) + '</h2>' + chips('want', WANT, k => j('w_' + k, L), []) + '</section>' +
    '<section class="sec"><label class="fl" for="ask-prior">' + j('prior', L) + '</label><input class="in" id="ask-prior" name="prior" maxlength="120" autocomplete="off"></section>' +
    '<section class="sec"><label class="fl" for="ask-text">' + j('msg', L) + '</label><textarea class="in" id="ask-text" name="text" maxlength="600" rows="4" placeholder="' + esc(j('msg_ph', L)) + '"></textarea></section>' +
    '<section class="sec">' + attachRow(L, 'attach') + '</section>' +
    '<button class="btn primary block" type="submit">' + j('send', L) + '</button></form>';
}
function painRow(L) {
  return '<section class="sec"><div class="sec-h"><label class="fl" for="pain">' + j('pain', L) + '</label><output class="mono pain-out" id="pain-out" for="pain">0/10</output></div>' +
    '<input type="range" id="pain" name="pain" min="0" max="10" step="1" value="0" class="range"><p class="sub">' + j('pain_scale', L) + '</p></section>';
}

export function sent(s, it) {
  const L = s.lang;
  return '<div class="bar"><a class="link" href="#/">' + UI.back[L] + '</a></div>' +
    '<div class="okbox"><b>✓ ' + j('sent_h', L) + '</b><span>' + CLINIC[L] + '</span></div>' +
    '<section class="sec"><h2>' + j('how_clinic', L) + '</h2><div class="card">' + summary(it, s, L) + '<div class="thumbs">' + thumbs(it.files) + '</div></div>' +
    '<p class="sub">' + j('how_note', L) + '</p>' +
    (L === 'ko' ? '' : '<details class="card"><summary>' + j('ko_view', L) + '</summary><div lang="ko">' + summary(it, s, 'ko') + '</div></details>') + '</section>' +
    '<div class="row2"><a class="btn primary" href="#/thread">' + j('go_thread', L) + '</a><a class="btn" href="#/">' + UI.done[L] + '</a></div>';
}

// ---------- check-in ----------
export function check(s, ri, cp) {
  const L = s.lang, recs = PATIENTS[s.pid].records;
  const due = dueCheck(s), rIdx = recs[ri] ? ri : (due ? due.i : 0), day = cp || (due && due.i === rIdx ? due.cp : 7);
  return '<div class="bar"><a class="link" href="#/">' + UI.back[L] + '</a></div>' +
    '<div><p class="sub">' + j('st_home', L) + '</p><h1 class="big">' + j('check_h', L) + '</h1></div>' +
    '<p class="warnline">' + UI.no_real[L] + '</p>' +
    '<form class="form" data-act="check" novalidate><input type="hidden" name="cp" value="' + (+day) + '">' +
    '<section class="sec"><label class="fl" for="check-rec">' + j('which', L) + '</label><select class="in" id="check-rec" name="rec">' +
    recs.map((r, i) => '<option value="' + i + '"' + (i === rIdx ? ' selected' : '') + '>' + term(r.proc, L) + (r.tooth ? ' #' + r.tooth : '') + ' · ' + esc(r.date) + '</option>').join('') + '</select>' +
    '<p class="sub mono">D+' + (+day) + '</p></section>' +
    '<section class="sec"><h2>' + j('symptoms', L) + '</h2>' + chips('sym', CHECK_SYM, k => SYM[k][L], []) + '</section>' +
    painRow(L) +
    '<section class="sec"><label class="fl" for="check-text">' + j('note_opt', L) + '</label><textarea class="in" id="check-text" name="text" maxlength="400" rows="3" placeholder="' + esc(j('msg_ph', L)) + '"></textarea></section>' +
    '<section class="sec"><h2>' + j('photo_opt', L) + '</h2>' + attachRow(L, 'attach') + '</section>' +
    '<p class="crit-line">' + j('urgent', L) + '</p>' +
    '<button class="btn primary block" type="submit">' + j('send', L) + '</button></form>';
}

// ---------- messages with the clinic ----------
export function thread(s) {
  const L = s.lang;
  const kindLbl = k => j('k_' + k, L);
  const items = s.inbox.slice().sort((a, b) => a.at - b.at);
  const bubble = it => {
    const mine = '<div class="msg me"><div class="msg-h"><span class="badge s">' + kindLbl(it.kind) + '</span><span class="sub mono">' + fmt(it.at, L) + '</span></div>' +
      summary(it, s, L) + '<div class="thumbs">' + thumbs(it.files) + '</div></div>';
    const reply = it.reply
      ? '<div class="msg clinic"><div class="msg-h"><b>' + CLINIC[L] + '</b><span class="sub mono">' + fmt(it.reply.at, L) + '</span></div><p>' + j('auto_reply', L) + '</p><p class="sub">' + j('auto_note', L) + '</p></div>'
      : '<p class="sub wait">… ' + j('waiting', L) + '</p>';
    return mine + reply;
  };
  return '<div class="bar"><a class="link" href="#/">' + UI.back[L] + '</a><a class="link" href="#/clinic">' + j('clinic_view', L) + ' ›</a></div>' +
    '<div><p class="sub">' + CLINIC[L] + '</p><h1 class="big">' + j('thread', L) + '</h1></div>' +
    '<div class="msgs">' + (items.length ? items.map(bubble).join('') : '<p class="sub">' + j('empty_thread', L) + '</p>') + '</div>' +
    '<form class="form compose" data-act="msg" novalidate><label class="fl vh" for="msg-text">' + j('compose_ph', L) + '</label>' +
    '<textarea class="in" id="msg-text" name="text" maxlength="600" rows="3" placeholder="' + esc(j('compose_ph', L)) + '"></textarea>' +
    attachRow(L, 'attach') + '<button class="btn primary block" type="submit">' + j('send', L) + '</button></form>' +
    '<p class="sub center">' + j('tele_note', L) + '</p>';
}

// ---------- X-rays and photos ----------
const KINDS = ['xray', 'photo', 'doc'];
export function files(s, list) {
  const L = s.lang, sel = s.cmp;
  const tile = f => '<div class="ftile"><a href="#/photo/' + esc(f.id) + '"><img data-fid="' + esc(f.id) + '" alt=""></a>' +
    '<div class="fmeta"><span class="mono">' + esc(f.date) + '</span><span>' + j('kind_' + f.kind, L) + (f.tooth ? ' · #' + f.tooth : '') + (f.sample ? ' <span class="badge u">' + j('example', L) + '</span>' : '') + '</span></div>' +
    '<button type="button" class="chip sm" data-act="fsel" data-id="' + esc(f.id) + '" aria-pressed="' + (sel.indexOf(f.id) > -1) + '">' + j('compare', L) + '</button></div>';
  return '<div class="bar"><a class="link" href="#/">' + UI.back[L] + '</a></div>' +
    '<div><p class="sub">' + j('st_after', L) + ' · ' + j('st_home', L) + '</p><h1 class="big">' + j('files', L) + '</h1></div>' +
    '<div class="up"><label class="fl" for="f-kind">' + j('kind', L) + '</label><select class="in" id="f-kind">' + KINDS.map(k => '<option value="' + k + '">' + j('kind_' + k, L) + '</option>').join('') + '</select>' +
    '<label class="btn primary"><input type="file" accept="image/*" multiple data-act="upload" class="vh">＋ ' + j('upload', L) + '</label></div>' +
    (list.some(f => f.sample) ? '' : '<button type="button" class="btn block" data-act="samples">' + j('sample_xray', L) + '</button>') +
    (list.length ? '<p class="sub">' + j('compare_pick', L) + '</p><div class="fgrid">' + list.map(tile).join('') + '</div>' : '<p class="sub">' + j('files_empty', L) + '</p>') +
    '<a class="btn block' + (sel.length === 2 ? ' primary' : ' off') + '" href="' + (sel.length === 2 ? '#/compare/' + sel.map(esc).join('/') : '#/files') + '" aria-disabled="' + (sel.length !== 2) + '">' + j('compare', L) + ' (' + sel.length + '/2)</a>' +
    '<p class="sub">' + j('files_local', L) + '</p><p class="sub">' + j('share_later', L) + '</p>';
}
export function compare(s, a, b) {
  const L = s.lang;
  if (!a || !b) return '<div class="bar"><a class="link" href="#/files">' + UI.back[L] + '</a></div><p class="sub">' + j('compare_pick', L) + '</p>';
  const [x, y] = [a, b].sort((p, q) => p.date.localeCompare(q.date));
  const days = Math.round((Date.parse(y.date) - Date.parse(x.date)) / 864e5);
  const col = f => '<figure class="cmp-f"><img data-fid="' + esc(f.id) + '" alt=""><figcaption class="mono">' + esc(f.date) + (f.sample ? ' · ' + j('example', L) : '') + '</figcaption></figure>';
  return '<div class="bar"><a class="link" href="#/files">' + UI.back[L] + '</a><span class="badge v mono">+' + days + 'd</span></div>' +
    '<h1>' + j('compare', L) + '</h1><div class="cmp">' + col(x) + col(y) + '</div><p class="sub center">' + j('zoom', L) + '</p>';
}
export function photo(s, f) {
  const L = s.lang;
  if (!f) return '<div class="bar"><a class="link" href="#/files">' + UI.back[L] + '</a></div>';
  return '<div class="bar"><a class="link" href="#/files">' + UI.back[L] + '</a><button type="button" class="link danger" data-act="fdel" data-id="' + esc(f.id) + '">' + UI.remove[L] + '</button></div>' +
    '<p class="sub mono">' + esc(f.date) + ' · ' + j('kind_' + f.kind, L) + (f.sample ? ' · ' + j('example', L) : '') + '</p>' +
    '<img class="full" data-fid="' + esc(f.id) + '" alt="">';
}

// ---------- the clinic's screen (Korean; the clinic is in Korea) ----------
export function clinic(s) {
  const p = PATIENTS[s.pid];
  const items = s.inbox.slice().sort((a, b) => b.at - a.at);
  const K = { inquiry: '문의', check: '경과', msg: '메시지' };
  const F = { red: '빨리 확인', amber: '확인 필요', green: '양호' };
  const card = it => {
    const f = flag(it);
    return '<article class="cv ' + f + '"><div class="msg-h"><span><span class="badge s">' + K[it.kind] + '</span>' + (f ? ' <span class="flag ' + f + '">' + F[f] + '</span>' : '') + '</span><span class="sub mono">' + fmt(it.at, 'ko') + '</span></div>' +
      summary(it, s, 'ko') + '<div class="thumbs">' + thumbs(it.files) + '</div>' +
      '<p class="sub">' + (it.reply ? '자동 답장 보냄 · ' + fmt(it.reply.at, 'ko') : '답장 대기') + '</p></article>';
  };
  return '<div class="bar"><a class="link" href="#/">‹ 환자 화면으로</a><span class="badge u">병원 화면 · 데모</span></div>' +
    '<div><p class="sub">' + CLINIC.ko + '</p><h1 class="big" lang="ko">외국인 환자 문의·경과</h1></div>' +
    '<div class="profile" lang="ko"><b>' + esc(p.name) + '</b><span class="meta">' + esc(p.name_en) + ' · 출생 <span class="mono">' + esc(p.birth) + '</span> · 환자 언어 ' + (LANG_LABEL[p.lang] || '') + '</span></div>' +
    '<div class="list" lang="ko">' + (items.length ? items.map(card).join('') : '<p class="sub">아직 받은 문의나 경과가 없습니다. 환자 화면에서 문의를 보내 보세요.</p>') + '</div>' +
    '<p class="sub" lang="ko">고른 항목(부위·증상·통증·요청)은 용어 사전으로 정확히 한국어로 바뀌고, 환자가 직접 쓴 글은 원문 그대로 보입니다. 표시는 데모용 규칙(통증 7 이상·출혈·흔들림은 빨리 확인)이며 진단이 아닙니다.</p>';
}
