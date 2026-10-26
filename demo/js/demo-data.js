// Sample patients. Everything here is invented; phone numbers use reserved-looking zeros.
export const PATIENTS = {
  chen: {
    label: '陈雨 · 中文', name: '陈雨', name_en: 'Chen Yu', birth: '1994-03', nat: 'CN', lang: 'zh',
    records: [
      { date: '2026-10-02', tooth: 36, proc: 'implant', material: 'Osstem TS III Ø4.5×10', lot: 'DEMO-0001', next: { date: '2027-01', proc: 'crown' } },
      { date: '2026-10-02', tooth: null, proc: 'scaling' },
      { date: '2026-09-18', tooth: 46, proc: 'root_canal', next: { date: '2026-11', proc: 'crown' } }
    ],
    self: { allergies: ['penicillin'], meds: [], conditions: [], custom: [], contact: { name: '陈明', phone: '+86 138 0000 0000' } }
  },
  aziz: {
    label: 'Азиз · Русский', name: 'Азиз Каримов', name_en: 'Aziz Karimov', birth: '1988-07', nat: 'UZ', lang: 'ru',
    records: [
      { date: '2026-10-10', tooth: 26, proc: 'root_canal', next: { date: '2026-11', proc: 'crown' } },
      { date: '2026-08-20', tooth: 11, proc: 'crown', material: 'Zirconia' },
      { date: '2026-08-05', tooth: 16, proc: 'extraction' }
    ],
    self: { allergies: ['latex'], meds: ['warfarin', 'amlodipine'], conditions: ['hypertension'], custom: [], contact: { name: 'Дильноза Каримова', phone: '+998 90 000 00 00' } }
  }
};
