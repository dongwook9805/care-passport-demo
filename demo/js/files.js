// Photos and X-rays the patient adds. They live only in this browser (IndexedDB) and are never uploaded.
const DB = 'kcl-files', STORE = 'files';
let dbp = null;

function open() {
  if (!dbp) {
    dbp = new Promise((res, rej) => {
      const r = indexedDB.open(DB, 1);
      r.onupgradeneeded = () => r.result.createObjectStore(STORE, { keyPath: 'id' });
      r.onsuccess = () => res(r.result);
      r.onerror = () => rej(r.error);
    });
    dbp.catch(() => { dbp = null; });
  }
  return dbp;
}
function run(mode, fn) {
  return open().then(db => new Promise((res, rej) => {
    const t = db.transaction(STORE, mode), req = fn(t.objectStore(STORE));
    t.oncomplete = () => res(req ? req.result : undefined);
    t.onerror = () => rej(t.error);
    t.onabort = () => rej(t.error);
  }));
}
export const putFile = rec => run('readwrite', s => { s.put(rec); return null; });
export const getFile = id => run('readonly', s => s.get(id));
export const allFiles = () => run('readonly', s => s.getAll()).then(list => (list || []).sort((a, b) => b.date.localeCompare(a.date) || b.at - a.at));
export const delFile = id => run('readwrite', s => { s.delete(id); return null; });
export const clearFiles = () => run('readwrite', s => { s.clear(); return null; });

export const newId = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const today = () => new Date().toISOString().slice(0, 10);

// Keep detail for X-rays (long side up to 2400 px) but stop phone photos from filling storage.
async function shrink(file, max = 2400) {
  try {
    const bmp = await createImageBitmap(file);
    const k = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const c = document.createElement('canvas');
    c.width = Math.round(bmp.width * k); c.height = Math.round(bmp.height * k);
    c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
    if (bmp.close) bmp.close();
    return await new Promise(r => c.toBlob(b => r(b || file), 'image/jpeg', 0.92));
  } catch (e) { return file; }
}

// Adds picked image files; returns their records.
export async function addFiles(fileList, kind) {
  const out = [];
  for (const f of Array.from(fileList || [])) {
    if (!/^image\//.test(f.type)) continue;
    const blob = await shrink(f);
    const date = f.lastModified ? new Date(f.lastModified).toISOString().slice(0, 10) : today();
    const rec = { id: newId(), at: Date.now(), date, kind, blob, sample: false };
    await putFile(rec);
    out.push(rec);
  }
  return out;
}

// Object URLs, made once per file and reused across renders.
const urls = new Map();
export async function urlFor(id) {
  if (urls.has(id)) return urls.get(id);
  const rec = await getFile(id);
  if (!rec) return '';
  const u = URL.createObjectURL(rec.blob);
  urls.set(id, u);
  return u;
}
export function forgetUrls() { urls.forEach(u => URL.revokeObjectURL(u)); urls.clear(); }

// Two drawn periapical X-rays of the same root-canal-treated molar: the dark area at the root tip shrinks.
// Clearly marked as samples; they exist so the compare view can be tried without a real X-ray.
function drawXray(lesion, label) {
  const W = 900, H = 1100, c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d');
  const g = x.createRadialGradient(W / 2, H / 2, 100, W / 2, H / 2, 700);
  g.addColorStop(0, '#3a3a3a'); g.addColorStop(1, '#121212');
  x.fillStyle = g; x.fillRect(0, 0, W, H);
  // ctx.filter is not drawn by every browser, so softness comes from shadowBlur instead.
  x.shadowColor = 'rgba(200,200,200,0.5)'; x.shadowBlur = 10;
  // bone texture
  x.fillStyle = 'rgba(150,150,150,0.35)';
  for (let i = 0; i < 900; i++) { const px = (i * 97) % W, py = 420 + ((i * 53) % 640); x.fillRect(px, py, 6, 6); }
  // tooth: crown and two roots
  x.fillStyle = '#cfcfcf';
  x.beginPath(); x.moveTo(250, 160); x.quadraticCurveTo(450, 80, 650, 160); x.lineTo(640, 430); x.lineTo(260, 430); x.closePath(); x.fill();
  x.fillStyle = '#b5b5b5';
  x.beginPath(); x.moveTo(290, 420); x.quadraticCurveTo(300, 760, 330, 900); x.quadraticCurveTo(360, 930, 390, 890); x.quadraticCurveTo(420, 700, 430, 420); x.closePath(); x.fill();
  x.beginPath(); x.moveTo(480, 420); x.quadraticCurveTo(500, 700, 530, 890); x.quadraticCurveTo(560, 930, 590, 900); x.quadraticCurveTo(610, 760, 615, 420); x.closePath(); x.fill();
  // root canal fillings and the crown restoration
  x.strokeStyle = '#ffffff'; x.lineWidth = 14; x.lineCap = 'round';
  x.beginPath(); x.moveTo(360, 430); x.quadraticCurveTo(365, 700, 360, 880); x.stroke();
  x.beginPath(); x.moveTo(545, 430); x.quadraticCurveTo(555, 700, 560, 880); x.stroke();
  x.fillStyle = '#f4f4f4'; x.fillRect(320, 220, 260, 120);
  // dark area at the root tip
  x.fillStyle = 'rgba(10,10,10,0.85)';
  x.beginPath(); x.ellipse(362, 935, lesion, lesion * 0.8, 0, 0, Math.PI * 2); x.fill();
  x.shadowBlur = 0;
  x.fillStyle = 'rgba(255,255,255,0.75)'; x.font = '600 34px ui-monospace, Menlo, monospace';
  x.fillText('SAMPLE · ' + label, 36, H - 40);
  return new Promise(r => c.toBlob(r, 'image/jpeg', 0.9));
}
export async function addSamples() {
  const pairs = [['2026-09-18', 72], ['2026-10-30', 30]];
  const out = [];
  for (const [date, size] of pairs) {
    const rec = { id: newId(), at: Date.now(), date, kind: 'xray', tooth: 46, blob: await drawXray(size, date), sample: true };
    await putFile(rec);
    out.push(rec);
  }
  return out;
}
