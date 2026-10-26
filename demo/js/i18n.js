// Working title. The name is not decided yet: change it here (and in manifest.webmanifest).
export const APP_NAME = 'K-CARE LINK';

export const LANGS = ['zh', 'en', 'ru', 'ko'];
export const LANG_LABEL = { zh: '中文', en: 'English', ru: 'Русский', ko: '한국어' };

// Patient-facing strings, one entry per key in all four languages.
export const UI = {
  demo: { ko: '데모 · 가상 데이터', zh: '演示 · 虚拟数据', en: 'Demo · sample data', ru: 'Демо · тестовые данные' },
  start_title: { ko: '한국에서 받은 치료를, 내 언어로', zh: '在韩国做的治疗，用我的语言保存', en: 'Your Korean dental treatment, in your language', ru: 'Лечение в Корее — на вашем языке' },
  start_sub: { ko: '병원이 확인한 치료 기록과 알레르기·복용약을 휴대폰에 담고, 어느 나라 의사에게든 보여 주세요.', zh: '把医院确认的治疗记录和过敏、用药信息存在手机里，在任何国家都能给医生看。', en: 'Keep clinic-verified records, allergies and medications on your phone, and show them to a doctor anywhere.', ru: 'Храните записи, подтверждённые клиникой, аллергии и лекарства в телефоне и показывайте любому врачу.' },
  choose_lang: { ko: '언어 선택', zh: '选择语言', en: 'Choose language', ru: 'Выберите язык' },
  pick_patient: { ko: '가상 환자 고르기', zh: '选择虚拟患者', en: 'Choose a sample patient', ru: 'Выберите тестового пациента' },
  pick_sub: { ko: '데모라서 가상 환자의 기록으로 시작합니다.', zh: '这是演示版，使用虚拟患者的记录。', en: "This is a demo, so it starts with a sample patient's records.", ru: 'Это демо, поэтому используются записи тестового пациента.' },
  passport: { ko: '의료 여권', zh: '医疗护照', en: 'Medical passport', ru: 'Медицинский паспорт' },
  born: { ko: '출생', zh: '出生', en: 'Born', ru: 'Рожд.' },
  verified: { ko: '병원 확인 기록', zh: '医院确认记录', en: 'Clinic-verified records', ru: 'Подтверждено клиникой' },
  verified_by: { ko: '병원 확인', zh: '医院确认', en: 'Clinic-verified', ru: 'Клиника' },
  self: { ko: '내가 적은 정보', zh: '本人填写的信息', en: 'Added by me', ru: 'Указано мной' },
  self_badge: { ko: '본인 입력', zh: '本人填写', en: 'Self-reported', ru: 'Со слов пациента' },
  allergies: { ko: '알레르기', zh: '过敏', en: 'Allergies', ru: 'Аллергии' },
  meds: { ko: '복용약', zh: '正在服用的药', en: 'Medications', ru: 'Лекарства' },
  conditions: { ko: '지병', zh: '基础疾病', en: 'Conditions', ru: 'Заболевания' },
  contact: { ko: '긴급 연락처', zh: '紧急联系人', en: 'Emergency contact', ru: 'Экстренный контакт' },
  none: { ko: '없음', zh: '无', en: 'None', ru: 'Нет' },
  show_doctor: { ko: '의사에게 보여주기', zh: '给医生看', en: 'Show a doctor', ru: 'Показать врачу' },
  em_card: { ko: '응급 카드', zh: '急救卡', en: 'Emergency card', ru: 'Экстренная карта' },
  edit: { ko: '편집', zh: '编辑', en: 'Edit', ru: 'Изменить' },
  back: { ko: '‹ 뒤로', zh: '‹ 返回', en: '‹ Back', ru: '‹ Назад' },
  tooth: { ko: '치아', zh: '牙位', en: 'Tooth', ru: 'Зуб' },
  full_mouth: { ko: '전체', zh: '全口', en: 'All', ru: 'Все' },
  what: { ko: '무슨 치료인가요', zh: '这是什么治疗', en: 'What was done', ru: 'Что сделано' },
  care: { ko: '주의할 점', zh: '注意事项', en: 'Aftercare', ru: 'Рекомендации' },
  next: { ko: '다음 진료', zh: '下次就诊', en: 'Next visit', ru: 'Следующий визит' },
  clinic: { ko: '치료한 병원', zh: '治疗医院', en: 'Treating clinic', ru: 'Клиника' },
  material: { ko: '재료', zh: '材料', en: 'Material', ru: 'Материал' },
  no_real: { ko: '데모입니다. 실제 내 정보는 넣지 마세요.', zh: '这是演示版，请勿填写真实信息。', en: 'This is a demo. Do not enter real information.', ru: 'Это демо. Не вводите реальные данные.' },
  pick: { ko: '목록에서 고르면 다른 언어로 정확히 바뀝니다', zh: '从列表中选择，可准确翻译成其他语言', en: 'Items picked from the list translate exactly', ru: 'Пункты из списка переводятся точно' },
  free: { ko: '목록에 없으면 직접 입력', zh: '列表中没有？自己填写', en: 'Not listed? Type it', ru: 'Нет в списке? Введите сами' },
  add: { ko: '추가', zh: '添加', en: 'Add', ru: 'Добавить' },
  done: { ko: '완료', zh: '完成', en: 'Done', ru: 'Готово' },
  remove: { ko: '삭제', zh: '删除', en: 'Remove', ru: 'Удалить' },
  unreviewed: { ko: '번역 미검수', zh: '翻译未审核', en: 'Not translated', ru: 'Без перевода' },
  scope_q: { ko: '무엇을 보여줄까요', zh: '要分享什么', en: 'What to share', ru: 'Что показать' },
  scope_all: { ko: '전체', zh: '全部', en: 'Everything', ru: 'Всё' },
  scope_dental: { ko: '치과 기록만', zh: '仅牙科记录', en: 'Dental records only', ru: 'Только стоматология' },
  scope_em: { ko: '응급 정보만', zh: '仅急救信息', en: 'Emergency info only', ru: 'Только экстренное' },
  expires: { ko: '24시간 뒤 링크가 만료됩니다', zh: '链接24小时后失效', en: 'The link expires in 24 hours', ru: 'Ссылка действует 24 часа' },
  qr_hint: { ko: '의사가 휴대폰 카메라로 찍으면 앱 설치 없이 열립니다.', zh: '医生用手机相机扫码即可打开，无需安装应用。', en: 'The doctor scans it with a phone camera. No app needed.', ru: 'Врач сканирует камерой телефона. Приложение не нужно.' },
  qr_fail: { ko: 'QR을 만들지 못했어요. 링크 복사를 써 주세요.', zh: '无法生成二维码，请使用复制链接。', en: 'Could not make the QR code. Use Copy link instead.', ru: 'Не удалось создать QR-код. Скопируйте ссылку.' },
  preview_doc: { ko: '의사가 보는 화면 미리보기', zh: '预览医生看到的页面', en: 'Preview what the doctor sees', ru: 'Как это увидит врач' },
  copy_link: { ko: '링크 복사', zh: '复制链接', en: 'Copy link', ru: 'Копировать ссылку' },
  copied: { ko: '링크를 복사했어요', zh: '已复制链接', en: 'Link copied', ru: 'Ссылка скопирована' },
  copy_manual: { ko: '아래 링크를 길게 눌러 복사하세요', zh: '请长按下方链接复制', en: 'Press and hold the link below to copy it', ru: 'Нажмите и удерживайте ссылку ниже, чтобы скопировать' },
  plea: { ko: '제가 말을 못 하면 이 정보를 봐 주세요', zh: '如果我无法说话，请查看这些信息', en: "If I can't speak, please read this", ru: 'Если я не могу говорить, прочитайте это' },
  save_lock: { ko: '잠금화면용 이미지로 저장', zh: '保存为锁屏图片', en: 'Save as lock-screen image', ru: 'Сохранить для экрана блокировки' },
  making: { ko: '만드는 중…', zh: '生成中…', en: 'Preparing…', ru: 'Готовим…' },
  saved_img: { ko: '이미지를 만들었어요. 사진에 저장한 뒤 잠금화면으로 지정하세요.', zh: '图片已生成。保存到相册后设为锁屏壁纸。', en: 'Image ready. Save it to Photos and set it as your lock screen.', ru: 'Изображение готово. Сохраните его в фото и поставьте на экран блокировки.' },
  save_fail: { ko: '이미지를 만들지 못했어요. 이 화면을 캡처해 주세요.', zh: '无法生成图片，请截屏保存此页面。', en: 'Could not make the image. Take a screenshot of this screen instead.', ru: 'Не удалось создать изображение. Сделайте снимок экрана.' },
  install: { ko: '홈 화면에 추가하면 인터넷 없이도 응급 카드를 열 수 있어요.', zh: '添加到主屏幕后，没有网络也能打开急救卡。', en: 'Add this page to your home screen to open the emergency card offline.', ru: 'Добавьте страницу на главный экран, чтобы открывать карту без интернета.' },
  change_patient: { ko: '가상 환자 바꾸기', zh: '更换虚拟患者', en: 'Switch sample patient', ru: 'Сменить пациента' },
  reset: { ko: '데모 초기화', zh: '重置演示', en: 'Reset demo', ru: 'Сбросить демо' },
  reset_confirm: { ko: '한 번 더 누르면 초기화', zh: '再按一次重置', en: 'Tap again to reset', ru: 'Нажмите ещё раз' }
};

// Fixed terminology: term id → per-language label. Procedures also carry a plain-language explanation and aftercare.
// No machine translation: anything not in this dictionary is shown as the patient typed it, marked "not translated".
export const TERMS = {
  implant: { cat: 'proc', ko: '임플란트', zh: '种植牙', en: 'Dental implant', ru: 'Имплантат',
    plain: { ko: '빠진 이 자리에 인공 치아 뿌리를 심었어요. 뼈와 붙는 데 3~4개월이 걸리고, 그 뒤에 윗부분 치아를 올립니다.', zh: '在缺牙的位置植入了人工牙根。需要3–4个月与骨头结合，之后再装上牙冠。', en: 'An artificial tooth root was placed where the tooth was missing. It takes 3–4 months to bond with the bone, then a crown goes on top.', ru: 'На месте отсутствующего зуба установлен искусственный корень. Ему нужно 3–4 месяца, чтобы срастись с костью, затем ставится коронка.' },
    care: { ko: '2주 동안 수술한 쪽으로 딱딱한 음식을 씹지 마세요. 흡연은 뼈와 붙는 것을 방해합니다.', zh: '两周内不要用手术一侧咀嚼硬的食物。吸烟会影响愈合。', en: 'Avoid chewing hard food on that side for 2 weeks. Smoking slows healing.', ru: '2 недели не жуйте твёрдую пищу этой стороной. Курение замедляет заживление.' } },
  root_canal: { cat: 'proc', ko: '신경치료', zh: '根管治疗', en: 'Root canal treatment', ru: 'Лечение каналов',
    plain: { ko: '이 안쪽의 염증 난 신경을 없애고 속을 채웠어요.', zh: '清除了牙齿内部发炎的神经并进行了充填。', en: 'The inflamed nerve inside the tooth was removed and the canals were filled.', ru: 'Воспалённый нерв внутри зуба удалён, каналы запломбированы.' },
    care: { ko: '크라운을 씌우기 전까지는 이 치아로 딱딱한 것을 씹지 마세요. 깨질 수 있습니다.', zh: '在戴牙冠之前，不要用这颗牙咬硬物，牙齿可能会裂。', en: 'Until a crown is placed, avoid biting hard food with this tooth. It can crack.', ru: 'До установки коронки не кусайте этим зубом твёрдое — он может треснуть.' } },
  crown: { cat: 'proc', ko: '크라운', zh: '牙冠', en: 'Crown', ru: 'Коронка',
    plain: { ko: '치아 전체를 감싸는 인공 치아를 씌웠어요.', zh: '给牙齿戴上了包裹整颗牙的人工牙冠。', en: 'The tooth was covered with an artificial cap.', ru: 'Зуб покрыт искусственной коронкой.' },
    care: { ko: '캐러멜·껌처럼 끈적한 음식은 피하고 치실을 매일 쓰세요.', zh: '避免焦糖、口香糖等黏性食物，每天使用牙线。', en: 'Avoid sticky food like caramel or gum. Floss daily.', ru: 'Избегайте липкой пищи (ириски, жвачка). Пользуйтесь нитью каждый день.' } },
  extraction: { cat: 'proc', ko: '발치', zh: '拔牙', en: 'Extraction', ru: 'Удаление зуба',
    plain: { ko: '치아를 뽑았어요.', zh: '拔除了这颗牙。', en: 'The tooth was removed.', ru: 'Зуб удалён.' },
    care: { ko: '24시간 동안 빨대·침 뱉기·흡연을 피하세요. 피가 계속 나면 병원에 연락하세요.', zh: '24小时内不要用吸管、吐口水或吸烟。若持续出血，请联系医院。', en: 'For 24 hours, no straws, spitting or smoking. Contact the clinic if bleeding continues.', ru: '24 часа не пользуйтесь трубочкой, не сплёвывайте и не курите. Если кровотечение не прекращается, свяжитесь с клиникой.' } },
  scaling: { cat: 'proc', ko: '스케일링', zh: '洗牙', en: 'Scaling', ru: 'Снятие зубного камня',
    plain: { ko: '치석을 제거했어요.', zh: '清除了牙结石。', en: 'Tartar was removed.', ru: 'Удалён зубной камень.' },
    care: { ko: '며칠 동안 이가 시릴 수 있어요.', zh: '几天内牙齿可能会敏感。', en: 'Teeth may feel sensitive for a few days.', ru: 'Несколько дней зубы могут быть чувствительными.' } },
  penicillin: { cat: 'allergies', ko: '페니실린', zh: '青霉素', en: 'Penicillin', ru: 'Пенициллин' },
  local_anesthetic: { cat: 'allergies', ko: '국소마취제(리도카인)', zh: '局部麻醉药（利多卡因）', en: 'Local anesthetic (lidocaine)', ru: 'Местный анестетик (лидокаин)' },
  latex: { cat: 'allergies', ko: '라텍스', zh: '乳胶', en: 'Latex', ru: 'Латекс' },
  nsaid: { cat: 'allergies', ko: '소염진통제(NSAID)', zh: '非甾体抗炎药', en: 'NSAIDs', ru: 'НПВП' },
  warfarin: { cat: 'meds', bleed: true, ko: '와파린(항응고제)', zh: '华法林（抗凝药）', en: 'Warfarin (anticoagulant)', ru: 'Варфарин (антикоагулянт)' },
  aspirin: { cat: 'meds', bleed: true, ko: '아스피린', zh: '阿司匹林', en: 'Aspirin', ru: 'Аспирин' },
  metformin: { cat: 'meds', ko: '메트포르민(당뇨약)', zh: '二甲双胍（降糖药）', en: 'Metformin', ru: 'Метформин' },
  amlodipine: { cat: 'meds', ko: '암로디핀(혈압약)', zh: '氨氯地平（降压药）', en: 'Amlodipine', ru: 'Амлодипин' },
  hypertension: { cat: 'conditions', ko: '고혈압', zh: '高血压', en: 'Hypertension', ru: 'Гипертония' },
  diabetes: { cat: 'conditions', ko: '당뇨', zh: '糖尿病', en: 'Diabetes', ru: 'Диабет' },
  heart: { cat: 'conditions', ko: '심장질환', zh: '心脏病', en: 'Heart disease', ru: 'Болезнь сердца' },
  pregnancy: { cat: 'conditions', ko: '임신 중', zh: '怀孕中', en: 'Pregnant', ru: 'Беременность' }
};

export const NAT = {
  CN: { ko: '중국', zh: '中国', en: 'China', ru: 'Китай' },
  UZ: { ko: '우즈베키스탄', zh: '乌兹别克斯坦', en: 'Uzbekistan', ru: 'Узбекистан' },
  RU: { ko: '러시아', zh: '俄罗斯', en: 'Russia', ru: 'Россия' },
  KZ: { ko: '카자흐스탄', zh: '哈萨克斯坦', en: 'Kazakhstan', ru: 'Казахстан' },
  VN: { ko: '베트남', zh: '越南', en: 'Vietnam', ru: 'Вьетнам' },
  US: { ko: '미국', zh: '美国', en: 'United States', ru: 'США' }
};

export const CLINIC = { ko: '가상치과 (부산)', zh: '虚拟牙科（釜山）', en: 'Demo Dental Clinic (Busan)', ru: 'Демо-клиника (Пусан)' };
export const CLINIC_PHONE = '+82 51-000-0000';
export const REL = { ko: '배우자', zh: '配偶', en: 'Spouse', ru: 'Супруг(а)' };

// Doctor view: English by default, Korean original on toggle.
export const DOC = {
  demo: { en: 'Demo · sample data only', ko: '데모 · 가상 데이터' },
  kicker: { en: 'Dental record summary · shared by the patient', ko: '치과 기록 요약 · 환자가 직접 공유' },
  alerts: { en: 'Check before treatment', ko: '치료 전 확인' },
  bleed: { en: 'bleeding risk', ko: '출혈 위험' },
  no_alerts: { en: 'No allergies, medications or conditions reported.', ko: '보고된 알레르기·복용약·지병 없음' },
  allergy: { en: 'Allergy', ko: '알레르기' }, med: { en: 'Medication', ko: '복용약' }, cond: { en: 'Condition', ko: '지병' },
  chart: { en: 'Tooth chart (FDI)', ko: '치아 차트 (FDI)' },
  hist: { en: 'Treatment history', ko: '치료 이력' },
  date: { en: 'Date', ko: '날짜' }, tooth: { en: 'Tooth', ko: '치아' }, proc: { en: 'Procedure', ko: '치료' },
  mat: { en: 'Material / lot', ko: '재료 / 로트' }, src: { en: 'Source', ko: '출처' },
  verified: { en: 'Clinic-verified', ko: '병원 확인' }, selfr: { en: 'Patient-reported', ko: '환자 입력' },
  planned: { en: 'Planned', ko: '예정' }, all: { en: 'Full mouth', ko: '전체' },
  clinic: { en: 'Treating clinic', ko: '치료 병원' },
  contact: { en: 'Emergency contact', ko: '긴급 연락처' },
  patient_words: { en: "patient's own words, not translated", ko: '환자가 직접 쓴 말, 번역 안 됨' },
  toggle: { en: '한국어 원문', ko: 'English' },
  scope_note: { en: 'The patient shared emergency information only.', ko: '환자가 응급 정보만 공유했습니다.' },
  shared: { en: 'Shared', ko: '공유' },
  expires: { en: 'Link expires', ko: '링크 만료' },
  foot: { en: 'Clinic-verified items were confirmed by the treating clinic. Patient-reported items have not been checked. This page was built from data inside the link; nothing was sent to a server.', ko: '병원 확인 항목은 치료한 병원이 확인한 것이고, 환자 입력 항목은 확인되지 않았습니다. 이 화면은 링크 안의 데이터로 만들어졌고 서버에 아무것도 보내지 않았습니다.' },
  expired: { en: 'This link has expired. Ask the patient to share it again.', ko: '만료된 링크입니다. 환자에게 다시 공유해 달라고 요청하세요.' },
  expiry_note: { en: 'In this demo, expiry is shown on screen but cannot be enforced.', ko: '이 데모에서는 만료를 화면에 표시만 하고 실제로 막지는 못합니다.' },
  broken: { en: 'This link is damaged or incomplete. Ask the patient to show the QR code again.', ko: '링크가 손상되었거나 일부가 빠졌습니다. 환자에게 QR을 다시 보여 달라고 요청하세요.' },
  back_patient: { en: '‹ Back to patient screen', ko: '‹ 환자 화면으로' }
};
