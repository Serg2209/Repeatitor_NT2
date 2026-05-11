import { useState, useEffect, useRef } from "react";

// ─── TELEGRAM CONFIG ──────────────────────────────────────────────────────────
// 🔧 Замініть ці два значення на свої (інструкція у README):
const TG_BOT_TOKEN = "ВАШИЙ_BOT_TOKEN";   // напр. "7412345678:AAHx..."
const TG_CHAT_ID   = "ВАШИЙ_CHAT_ID";     // напр. "123456789"

// ─── TELEGRAM FORMATTER ───────────────────────────────────────────────────────
function buildTelegramMessage(studentName, level, profile, route) {
  const VARK_FULL = { V: "Візуальний 👁", A: "Аудіальний 🎧", K: "Кінестетичний 🤸", R: "Читання/письмо 📖" };
  const KOLB_FULL = { AC: "Акомодаційний", AS: "Асимілювальний", DI: "Дивергентний", CO: "Конвергентний" };
  const AUTO_FULL = { auto_high: "Висока 🟢", auto_mid: "Збалансована 🟡", auto_low: "Потребує структури 🔴" };
  const FB_FULL   = { fb_immediate: "Миттєве виправлення", fb_delayed: "Після завершення думки", fb_summary: "Підсумок наприкінці", fb_meta: "Саморефлексія" };
  const HW_FULL   = { hw_min: "≤10 хв / 3 дні", hw_mid: "20 хв / 5 днів", hw_high: "35 хв / 6 днів", hw_max: "45+ хв / щодня" };
  const date = new Date().toLocaleDateString("uk-UA", { day: "2-digit", month: "2-digit", year: "numeric" });

  const scaleLines = profile.scales && Object.keys(profile.scales).length
    ? Object.entries(profile.scales)
        .sort((a,b) => b[1]-a[1])
        .map(([k,v]) => {
          const labels = { schemas:"Схеми/таблиці", speaking:"Розмова", roleplay:"Рольові ігри", grammar:"Граматика", listening:"Аудіювання", reading:"Читання", writing:"Письмо", vocab:"Словник" };
          const bar = "█".repeat(v) + "░".repeat(5-v);
          return `  ${bar} ${v}/5  ${labels[k] || k}`;
        }).join("\n")
    : "  (не заповнено)";

  return `🇳🇱 *NT2 НЕЙРОПРОФІЛЬ УЧНЯ*
━━━━━━━━━━━━━━━━━━━━
👤 *Студент:* ${studentName}
📅 *Дата:* ${date}
🎯 *Рівень:* ${level}

━━━━━━━━━━━━━━━━━━━━
🧠 *ПРОФІЛЬ*

• Канал сприйняття: *${VARK_FULL[profile.varkDom] || profile.varkDom}*
• Стиль Колба: *${KOLB_FULL[profile.kolbDom] || profile.kolbDom}*
• Мотивація: *${route.summary.motivation}*
• Автономія: *${AUTO_FULL[profile.autonomy] || profile.autonomy}*
• Нейроритм: *${profile.focusMin} хв* фокусний блок
• Зворотний зв'язок: *${FB_FULL[profile.feedback] || profile.feedback}*
• Самостійна робота: *${HW_FULL[profile.hwLoad] || profile.hwLoad}*

━━━━━━━━━━━━━━━━━━━━
📊 *КОГНІТИВНИЙ ПРОФІЛЬ*

${scaleLines}

━━━━━━━━━━━━━━━━━━━━
🗺 *АДАПТИВНИЙ МАРШРУТ (${level})*

${route.phases.map(p => `${p.emoji} *Фаза ${p.phase} — ${p.name}* (тижні ${p.weeks})\n  ↳ ${p.goal}`).join("\n\n")}

━━━━━━━━━━━━━━━━━━━━
📚 *РЕКОМЕНДОВАНІ МАТЕРІАЛИ*
${route.materials.map(m => `• ${m}`).join("\n")}

━━━━━━━━━━━━━━━━━━━━
💡 *СТРАТЕГІЯ ЗВ'ЯЗКУ*
${route.feedbackStrategy}

_Згенеровано NT2 Нейропрофіль • ${date}_`;
}

// ─── DATA ────────────────────────────────────────────────────────────────────

const QUESTIONS = [
  // BLOCK 1: Perception (VARK)
  {
    id: "q1", block: 1, blockName: "СПРИЙНЯТТЯ",
    blockSub: "Як ви засвоюєте нову інформацію?",
    text: "Почувши нове нідерландське слово, ви швидше його запам'ятаєте, якщо:",
    type: "single",
    options: [
      { label: "Побачите його написаним або з картинкою-асоціацією", value: "V" },
      { label: "Почуєте вимову кілька разів вголос", value: "A" },
      { label: "Одразу використаєте його в реченні чи діалозі", value: "K" },
      { label: "Прочитаєте приклади й запишете своє визначення", value: "R" },
    ]
  },
  {
    id: "q2", block: 1, blockName: "СПРИЙНЯТТЯ",
    blockSub: "Як ви засвоюєте нову інформацію?",
    text: "Вивчаючи нове граматичне правило нідерландської, вам найлегше, коли:",
    type: "single",
    options: [
      { label: "Репетитор малює схему або таблицю", value: "V" },
      { label: "Репетитор пояснює усно з прикладами", value: "A" },
      { label: "Ми одразу виконуємо вправи і спілкуємося", value: "K" },
      { label: "Я читаю пояснення і пишу власні приклади", value: "R" },
    ]
  },
  {
    id: "q3", block: 1, blockName: "СПРИЙНЯТТЯ",
    blockSub: "Як ви засвоюєте нову інформацію?",
    text: "Готуючись до занять, ви найчастіше:",
    type: "single",
    options: [
      { label: "Переглядаю відео або схеми", value: "V" },
      { label: "Слухаю подкасти або нідерландське радіо", value: "A" },
      { label: "Практикую розмову вголос або рольові вправи", value: "K" },
      { label: "Читаю тексти й роблю конспекти", value: "R" },
    ]
  },
  // BLOCK 2: Processing (Kolb)
  {
    id: "q4", block: 2, blockName: "ПЕРЕРОБКА",
    blockSub: "Як ви засвоюєте та закріплюєте матеріал?",
    text: "Ваш улюблений підхід до вивчення граматики чи лексики:",
    type: "single",
    options: [
      { label: "Спочатку спробую — потім зрозумію правило", value: "AC" },
      { label: "Спочатку вислухаю пояснення — потім вправи", value: "AS" },
      { label: "Вигадую зв'язки та аналогії між мовами", value: "DI" },
      { label: "Порівнюю правила, шукаю систему, приймаю рішення", value: "CO" },
    ]
  },
  {
    id: "q5", block: 2, blockName: "ПЕРЕРОБКА",
    blockSub: "Як ви засвоюєте та закріплюєте матеріал?",
    text: "Яке твердження найкраще описує вас?",
    type: "single",
    options: [
      { label: "«Покажи мені приклад — і я повторю»", value: "AS" },
      { label: "«Поясни мені логіку — і я запам'ятаю»", value: "CO" },
      { label: "«Дай мені говорити — і я осягну»", value: "AC" },
      { label: "«Дай мені подумати — і я з'єднаю всі крапки»", value: "DI" },
    ]
  },
  // BLOCK 3: Cognitive (scale)
  {
    id: "q6", block: 3, blockName: "КОГНІТИВНИЙ ПРОФІЛЬ",
    blockSub: "Оцініть привабливість форматів (1 = зовсім не моє, 5 = дуже підходить)",
    text: "Оцініть кожен формат навчальної діяльності",
    type: "scale",
    items: [
      { key: "schemas", label: "Схеми, таблиці, граматичні діаграми" },
      { key: "speaking", label: "Спонтанна розмовна практика" },
      { key: "roleplay", label: "Рольові ігри та симуляції ситуацій" },
      { key: "grammar", label: "Граматичні вправи з чіткими правилами" },
      { key: "listening", label: "Аудіювання автентичних діалогів" },
      { key: "reading", label: "Читання та аналіз текстів" },
      { key: "writing", label: "Письмові завдання (есе, листи, повідомлення)" },
      { key: "vocab", label: "Картки та системна робота зі словником" },
    ]
  },
  // BLOCK 4: Motivation / Andragogy
  {
    id: "q7", block: 4, blockName: "МОТИВАЦІЯ",
    blockSub: "Що рухає вами у навчанні? (Андрагогічна модель Ноулса)",
    text: "Ваша основна причина вивчати нідерландську:",
    type: "single",
    options: [
      { label: "Особистий інтерес, культура, сім'я", value: "IM_high" },
      { label: "Інтеграційний іспит (Inburgering) або офіційна вимога", value: "EM_high" },
      { label: "Кар'єра, навчання, переїзд", value: "EM_mid" },
      { label: "Самовдосконалення, розширення горизонтів", value: "IM_mid" },
    ]
  },
  {
    id: "q8", block: 4, blockName: "МОТИВАЦІЯ",
    blockSub: "Що рухає вами у навчанні?",
    text: "Ви навчаєтеся найефективніше, коли:",
    type: "single",
    options: [
      { label: "Сам(-а) визначаю, що і коли вивчати", value: "auto_high" },
      { label: "Маю чіткий структурований план від репетитора", value: "auto_low" },
      { label: "Разом обговорюємо цілі та план", value: "auto_mid" },
    ]
  },
  {
    id: "q9", block: 4, blockName: "МОТИВАЦІЯ",
    blockSub: "Що рухає вами у навчанні?",
    text: "Коли я роблю помилку, я хочу, щоб репетитор:",
    type: "single",
    options: [
      { label: "Одразу виправив мене вголос", value: "fb_immediate" },
      { label: "Дав закінчити думку, потім м'яко вказав", value: "fb_delayed" },
      { label: "Занотував помилки і ми аналізували наприкінці", value: "fb_summary" },
      { label: "Спитав: «Чи ти сам(а) бачиш помилку?»", value: "fb_meta" },
    ]
  },
  // BLOCK 5: Neuro-rhythm
  {
    id: "q10", block: 5, blockName: "НЕЙРОРИТМ",
    blockSub: "Ваш природний ритм уваги та відновлення",
    text: "Оптимальна тривалість одного фокусного блоку (без перерви):",
    type: "single",
    options: [
      { label: "≤ 15 хвилин", value: "15" },
      { label: "15–25 хвилин (Pomodoro)", value: "25" },
      { label: "25–45 хвилин", value: "45" },
      { label: "≥ 45 хвилин — люблю глибоке занурення", value: "90" },
    ]
  },
  {
    id: "q11", block: 5, blockName: "НЕЙРОРИТМ",
    blockSub: "Ваш природний ритм уваги та відновлення",
    text: "Ви відчуваєте перевантаження, коли:",
    type: "single",
    options: [
      { label: "Одночасно надходить інфо з кількох каналів (звук+текст+відео)", value: "overload_multi" },
      { label: "Тривалий монолог без моєї активної участі", value: "overload_mono" },
      { label: "Немає перерв між різними видами завдань", value: "overload_nobreak" },
      { label: "Відсутній зворотний зв'язок", value: "overload_nofb" },
    ]
  },
  {
    id: "q12", block: 5, blockName: "НЕЙРОРИТМ",
    blockSub: "Ваш природний ритм уваги та відновлення",
    text: "Скільки самостійної роботи між заняттями вам підходить?",
    type: "single",
    options: [
      { label: "Мінімум — лише конче необхідне (≤ 10 хв)", value: "hw_min" },
      { label: "Помірно — 15–20 хв на день з чіткими завданнями", value: "hw_mid" },
      { label: "Активно — 30–45 хв на день", value: "hw_high" },
      { label: "Багато — самостійно шукаю додаткові матеріали", value: "hw_max" },
    ]
  },
];

// ─── PROFILE COMPUTATION ────────────────────────────────────────────────────

function computeProfile(answers) {
  // VARK
  const vark = { V: 0, A: 0, K: 0, R: 0 };
  ["q1","q2","q3"].forEach(id => { if(answers[id]) vark[answers[id]] = (vark[answers[id]]||0)+1; });
  const varkDom = Object.entries(vark).sort((a,b)=>b[1]-a[1])[0][0];

  // Kolb
  const kolb = { AC: 0, AS: 0, DI: 0, CO: 0 };
  ["q4","q5"].forEach(id => { if(answers[id]) kolb[answers[id]] = (kolb[answers[id]]||0)+1; });
  const kolbDom = Object.entries(kolb).sort((a,b)=>b[1]-a[1])[0][0];

  // Motivation
  const motRaw = answers["q7"] || "IM_mid";
  const motivation = motRaw.startsWith("IM") ? "internal" : "external";
  const autonomy = answers["q8"] || "auto_mid";
  const feedback = answers["q9"] || "fb_delayed";

  // Neuro-rhythm
  const focusMin = parseInt(answers["q10"] || "25");
  const overload = answers["q11"] || "overload_nobreak";
  const hwLoad = answers["q12"] || "hw_mid";

  // Scales
  const scales = answers["q6"] || {};

  // Top 3 activities
  const sortedActivities = Object.entries(scales).sort((a,b)=>b[1]-a[1]).slice(0,3).map(e=>e[0]);

  return { varkDom, vark, kolbDom, kolb, motivation, autonomy, feedback, focusMin, overload, hwLoad, scales, sortedActivities };
}

// ─── ROUTE GENERATION ───────────────────────────────────────────────────────

function generateRoute(profile, level) {
  const { varkDom, kolbDom, motivation, autonomy, focusMin, hwLoad, sortedActivities } = profile;

  const VARK_LABELS = { V: "Візуальний", A: "Аудіальний", K: "Кінестетичний", R: "Читання/письмо" };
  const KOLB_LABELS = { AC: "Акомодаційний", AS: "Асимілювальний", DI: "Дивергентний", CO: "Конвергентний" };

  const levelWeeks = { A1: 8, A2: 10, B1: 12, B2: 14 };
  const totalWeeks = levelWeeks[level] || 12;

  const phases = [
    { phase: 1, weeks: `1–${Math.round(totalWeeks*0.25)}`, name: "АКТИВАЦІЯ", emoji: "🔥", color: "#FF6B35", focus: "Занурення у мову та базовий словник", goal: buildGoal(level, 1) },
    { phase: 2, weeks: `${Math.round(totalWeeks*0.25)+1}–${Math.round(totalWeeks*0.5)}`, name: "СТРУКТУРА", emoji: "🧩", color: "#4ECDC4", focus: "Граматична основа та розмовні кліше", goal: buildGoal(level, 2) },
    { phase: 3, weeks: `${Math.round(totalWeeks*0.5)+1}–${Math.round(totalWeeks*0.75)}`, name: "ПРАКТИКА", emoji: "💬", color: "#45B7D1", focus: "Реальні ситуації та автентичний ввід", goal: buildGoal(level, 3) },
    { phase: 4, weeks: `${Math.round(totalWeeks*0.75)+1}–${totalWeeks}`, name: "АВТОНОМІЯ", emoji: "🚀", color: "#96CEB4", focus: "Самостійне використання + іспит/ціль", goal: buildGoal(level, 4) },
  ];

  const sessionStructure = buildSessionStructure(profile, focusMin);
  const materials = buildMaterials(varkDom, level);
  const hwPlan = buildHW(hwLoad, varkDom, kolbDom);
  const feedbackStrategy = buildFeedback(profile.feedback);
  const errorCorrectionTip = buildErrorTip(profile.feedback);

  return {
    summary: {
      vark: `${VARK_LABELS[varkDom]} (${varkDom})`,
      kolb: `${KOLB_LABELS[kolbDom]}`,
      motivation: motivation === "internal" ? "Внутрішня (IM)" : "Зовнішня (EM)",
      autonomy: autonomy === "auto_high" ? "Висока" : autonomy === "auto_low" ? "Потребує структури" : "Збалансована",
      rhythm: `${focusMin} хв фокус`,
    },
    phases,
    sessionStructure,
    materials,
    hwPlan,
    feedbackStrategy,
    errorCorrectionTip,
  };
}

function buildGoal(level, phase) {
  const goals = {
    A1: ["Вивчити 200 базових слів, привітання і числа", "Відповідати на прості питання про себе", "Описати своє оточення 3–5 реченнями", "Пройти тест A1 або впевнено спілкуватися у магазині"],
    A2: ["Розширити словник до 600 слів, розуміти прості тексти", "Будувати речення в минулому та майбутньому часі", "Вести діалог про повсякденне (робота, сім'я, покупки)", "Пройти тест A2 / базовий Inburgering рівень"],
    B1: ["Розуміти основний зміст автентичних новин", "Аргументувати свою думку усно та письмово", "Вільно спілкуватися у більшості побутових ситуацій", "Скласти іспит B1 / NT2 Profiel 1"],
    B2: ["Читати нідерландські книги та статті без словника", "Брати участь у дискусіях на абстрактні теми", "Писати офіційні листи та резюме", "Скласти NT2 Profiel 2 або CNaVT B2"],
  };
  return (goals[level] || goals["B1"])[phase - 1];
}

function buildSessionStructure(profile, focusMin) {
  const { kolbDom, varkDom } = profile;
  const totalMin = 60;
  if (kolbDom === "AC") {
    return [
      { min: 5, label: "Warm-up", desc: "Вільна розмова / перевірка ДЗ", color: "#FF6B35" },
      { min: 10, label: "Вхідна практика", desc: "Рольова ситуація без підготовки", color: "#FF8C61" },
      { min: 15, label: "Пояснення", desc: "Граматика через приклади з практики", color: "#4ECDC4" },
      { min: focusMin, label: "Закріплення", desc: "Вправи + повторна симуляція", color: "#45B7D1" },
      { min: 5, label: "Рефлексія", desc: "Що отримали? Ціль на тиждень", color: "#96CEB4" },
    ];
  }
  if (kolbDom === "AS") {
    return [
      { min: 5, label: "Warm-up", desc: "Повторення попереднього", color: "#FF6B35" },
      { min: 15, label: "Теорія", desc: "Нова граматика + схема", color: "#4ECDC4" },
      { min: 20, label: "Практика", desc: "Вправи від простих до складних", color: "#45B7D1" },
      { min: 15, label: "Продукція", desc: "Власні речення / діалог", color: "#96CEB4" },
      { min: 5, label: "Підсумок", desc: "Self-check і ДЗ", color: "#FF6B35" },
    ];
  }
  if (kolbDom === "DI") {
    return [
      { min: 5, label: "Warm-up", desc: "Асоціація дня", color: "#FF6B35" },
      { min: 10, label: "Проблема", desc: "Відкрите питання / провокативний текст", color: "#FF8C61" },
      { min: 20, label: "Дослідження", desc: "Мозковий штурм + пошук аналогій між мовами", color: "#4ECDC4" },
      { min: 20, label: "Синтез", desc: "Побудова власної «карти» нової теми", color: "#45B7D1" },
      { min: 5, label: "Рефлексія", desc: "Що здивувало? Що хочу дізнатися ще?", color: "#96CEB4" },
    ];
  }
  // CO
  return [
    { min: 5, label: "Warm-up", desc: "Огляд попереднього + питання", color: "#FF6B35" },
    { min: 10, label: "Аналіз", desc: "Порівняння правил / систем", color: "#4ECDC4" },
    { min: 20, label: "Вирішення", desc: "Завдання з одним правильним рішенням", color: "#45B7D1" },
    { min: 20, label: "Застосування", desc: "Реальний текст / ситуація", color: "#96CEB4" },
    { min: 5, label: "Підсумок", desc: "Чіткі висновки + ДЗ", color: "#FF6B35" },
  ];
}

function buildMaterials(vark, level) {
  const base = {
    V: ["Intertaal NT2 з кольоровими схемами", "Anki-картки з зображеннями", "Infographics NT2 (Pinterest)", "Mind-map граматичних часів", "Відео: Easy Dutch (YouTube)"],
    A: ["Podcast: Kletskoppen (A2+)", "Podcast: De Taalcafé", "NT2 аудіо-діалоги Babbel / Pimsleur", "Нідерландське радіо NPO Radio 1", "Shadowing-вправи з автентичних відео"],
    K: ["Rольові картки Taalkit NT2", "Real-life завдання: ринок, пошта, лікар", "Conversation exchange з носіями", "NT2 immersion days", "Drag-and-drop вправи в Quizlet Live"],
    R: ["Methode NT2 Handboek (Coutinho)", "Taal Vitaal Reader", "Нідерландські газети (NRC, De Volkskrant)", "LezenVoorLater.nl", "Woordenboek Van Dale online"],
  };
  return base[vark] || base["V"];
}

function buildHW(hwLoad, vark, kolb) {
  const plans = {
    hw_min: { days: 3, time: "10 хв", tasks: ["1 Anki-сесія (10 слів)", "1 аудіювання (3 хв)", "Перечитати нотатки з заняття"] },
    hw_mid: { days: 5, time: "20 хв", tasks: ["Anki (20 слів/день)", "Слухати 1 подкаст / переглянути 1 відео", "1 письмова вправа або запис у щоденник", "Повторити граматику за схемою"] },
    hw_high: { days: 6, time: "35 хв", tasks: ["Anki (30 слів)", "Shadowing 10 хв", "Читання тексту + виписати 5 нових слів", "Написати 5 речень із новою темою", "Перегляд серіалу нідерландською (субтитри)"] },
    hw_max: { days: 7, time: "45+ хв", tasks: ["Anki + власний словник (50 слів)", "Перегляд новин / статей нідерландською", "Написати абзац / запис у щоденнику", "Пошук власних матеріалів за інтересами", "Практика з носіями (tandem / Reddit r/learndutch)"] },
  };
  return plans[hwLoad] || plans["hw_mid"];
}

function buildFeedback(fbType) {
  const strats = {
    fb_immediate: "Миттєве виправлення помилки вголос під час говоріння. Повторення правильного варіанту 2–3 рази разом.",
    fb_delayed: "Репетитор дає завершити думку, потім м'яко перефразовує правильний варіант і запитує підтвердження.",
    fb_summary: "Протягом заняття помилки фіксуються в нотатках. Останні 5 хв — спільний аналіз паттернів помилок.",
    fb_meta: "Репетитор запитує «Як звучало?» — стимулює розвиток внутрішнього редактора. Акцент на саморефлексії.",
  };
  return strats[fbType] || strats["fb_delayed"];
}

function buildErrorTip(fbType) {
  const tips = {
    fb_immediate: "Слідкуйте, щоб виправлення не переривали потік думки — робіть це в природних паузах.",
    fb_delayed: "Ефективно для розвитку fluency. Поєднуйте з письмовим фіксуванням для довготривалої пам'яті.",
    fb_summary: "Підсумковий аналіз будує метакогнітивні навички. Ведіть «журнал помилок» разом з учнем.",
    fb_meta: "Найвища андрагогічна стратегія. Розвиває незалежність. Дайте час на паузу та роздум.",
  };
  return tips[fbType] || "";
}

// ─── UI COMPONENTS ───────────────────────────────────────────────────────────

const BLOCK_ICONS = ["", "👁", "🔄", "🧠", "💡", "⚡"];
const BLOCK_COLORS = ["", "#FF6B35", "#4ECDC4", "#9B59B6", "#E74C3C", "#F39C12"];

function ProgressBar({ current, total }) {
  const pct = Math.round((current / total) * 100);
  return (
    <div style={{ width: "100%", background: "#1a1a2e", borderRadius: 8, height: 6, margin: "16px 0 24px" }}>
      <div style={{ width: `${pct}%`, height: "100%", background: "linear-gradient(90deg, #FF6B35, #4ECDC4)", borderRadius: 8, transition: "width 0.5s ease" }} />
      <div style={{ textAlign: "right", color: "#888", fontSize: 11, marginTop: 4 }}>{pct}% завершено</div>
    </div>
  );
}

function BlockBadge({ blockNum, blockName, blockSub, color, icon }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
        <span style={{ background: color, borderRadius: "50%", width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{icon}</span>
        <div>
          <div style={{ color: color, fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Space Mono', monospace" }}>Блок {blockNum}</div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, fontFamily: "'DM Serif Display', serif" }}>{blockName}</div>
        </div>
      </div>
      <div style={{ color: "#aaa", fontSize: 13, marginLeft: 42, fontFamily: "'Space Mono', monospace" }}>{blockSub}</div>
    </div>
  );
}

function SingleQuestion({ q, value, onChange, blockColor }) {
  return (
    <div>
      <div style={{ color: "#e0e0e0", fontSize: 16, fontWeight: 600, marginBottom: 20, lineHeight: 1.6, fontFamily: "'DM Serif Display', serif" }}>{q.text}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {q.options.map((opt, i) => {
          const selected = value === opt.value;
          return (
            <button key={i} onClick={() => onChange(q.id, opt.value)}
              style={{
                background: selected ? `${blockColor}22` : "#0d0d1a",
                border: `1.5px solid ${selected ? blockColor : "#2a2a3e"}`,
                borderRadius: 12, padding: "14px 18px", textAlign: "left", cursor: "pointer",
                color: selected ? "#fff" : "#bbb", fontSize: 14, fontFamily: "'Space Mono', monospace",
                transition: "all 0.2s", display: "flex", alignItems: "center", gap: 12,
              }}>
              <span style={{ width: 22, height: 22, borderRadius: "50%", border: `2px solid ${selected ? blockColor : "#444"}`, background: selected ? blockColor : "transparent", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                {selected && <span style={{ color: "#000", fontSize: 12, fontWeight: 900 }}>✓</span>}
              </span>
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function ScaleQuestion({ q, values = {}, onChange, blockColor }) {
  return (
    <div>
      <div style={{ color: "#e0e0e0", fontSize: 15, fontWeight: 600, marginBottom: 20, fontFamily: "'DM Serif Display', serif" }}>{q.text}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {q.items.map((item) => (
          <div key={item.key} style={{ background: "#0d0d1a", border: "1px solid #2a2a3e", borderRadius: 10, padding: "12px 16px" }}>
            <div style={{ color: "#ccc", fontSize: 13, fontFamily: "'Space Mono', monospace", marginBottom: 10 }}>{item.label}</div>
            <div style={{ display: "flex", gap: 8 }}>
              {[1,2,3,4,5].map(n => {
                const sel = values[item.key] === n;
                return (
                  <button key={n} onClick={() => onChange("q6", { ...values, [item.key]: n })}
                    style={{ width: 36, height: 36, borderRadius: 8, border: `2px solid ${sel ? blockColor : "#333"}`, background: sel ? blockColor : "#1a1a2e", color: sel ? "#000" : "#888", fontWeight: 700, fontSize: 13, cursor: "pointer", transition: "all 0.2s", fontFamily: "'Space Mono', monospace" }}>
                    {n}
                  </button>
                );
              })}
              <span style={{ color: "#555", fontSize: 11, alignSelf: "center", marginLeft: 8, fontFamily: "'Space Mono', monospace" }}>
                {values[item.key] ? ["","зовсім не моє","не дуже","нейтрально","підходить","дуже підходить"][values[item.key]] : "не обрано"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RadarChart({ data }) {
  const cx = 120, cy = 120, r = 85;
  const labels = ["V", "A", "K", "R"];
  const maxVal = 3;
  const angles = labels.map((_, i) => (i / labels.length) * 2 * Math.PI - Math.PI / 2);
  const pts = labels.map((l, i) => {
    const v = (data[l] || 0) / maxVal;
    return { x: cx + r * v * Math.cos(angles[i]), y: cy + r * v * Math.sin(angles[i]) };
  });
  const poly = pts.map(p => `${p.x},${p.y}`).join(" ");
  const gridPts = (frac) => labels.map((_, i) => `${cx + r * frac * Math.cos(angles[i])},${cy + r * frac * Math.sin(angles[i])}`).join(" ");

  return (
    <svg width={240} height={240} style={{ display: "block", margin: "0 auto" }}>
      {[0.33, 0.67, 1].map(f => <polygon key={f} points={gridPts(f)} fill="none" stroke="#2a2a3e" strokeWidth={1} />)}
      {angles.map((a, i) => <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(a)} y2={cy + r * Math.sin(a)} stroke="#2a2a3e" strokeWidth={1} />)}
      <polygon points={poly} fill="#FF6B3544" stroke="#FF6B35" strokeWidth={2} />
      {pts.map((p, i) => <circle key={i} cx={p.x} cy={p.y} r={4} fill="#FF6B35" />)}
      {labels.map((l, i) => (
        <text key={l} x={cx + (r + 18) * Math.cos(angles[i])} y={cy + (r + 18) * Math.sin(angles[i])} textAnchor="middle" dominantBaseline="central" fill="#FF6B35" fontSize={13} fontWeight={700} fontFamily="'Space Mono', monospace">{l}</text>
      ))}
    </svg>
  );
}

function BarChart({ scales }) {
  const items = Object.entries(scales).sort((a, b) => b[1] - a[1]);
  const labels = {
    schemas: "Схеми/таблиці", speaking: "Розмова", roleplay: "Рольові ігри",
    grammar: "Граматика", listening: "Аудіювання", reading: "Читання",
    writing: "Письмо", vocab: "Словник",
  };
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {items.map(([k, v]) => (
        <div key={k} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 90, color: "#aaa", fontSize: 11, fontFamily: "'Space Mono', monospace", flexShrink: 0, textAlign: "right" }}>{labels[k]}</div>
          <div style={{ flex: 1, background: "#1a1a2e", borderRadius: 4, height: 18, overflow: "hidden" }}>
            <div style={{ width: `${(v / 5) * 100}%`, height: "100%", background: `linear-gradient(90deg, #4ECDC4, #45B7D1)`, borderRadius: 4, transition: "width 0.8s ease", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6 }}>
              <span style={{ color: "#000", fontSize: 10, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{v}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ProfileCard({ label, value, sub, color = "#FF6B35" }) {
  return (
    <div style={{ background: "#0d0d1a", border: `1px solid ${color}44`, borderRadius: 14, padding: "16px 18px", borderLeft: `3px solid ${color}` }}>
      <div style={{ color: "#888", fontSize: 10, letterSpacing: 2, textTransform: "uppercase", fontFamily: "'Space Mono', monospace", marginBottom: 4 }}>{label}</div>
      <div style={{ color: "#fff", fontSize: 16, fontWeight: 700, fontFamily: "'DM Serif Display', serif" }}>{value}</div>
      {sub && <div style={{ color: "#666", fontSize: 11, marginTop: 4, fontFamily: "'Space Mono', monospace" }}>{sub}</div>}
    </div>
  );
}

function PhaseCard({ phase }) {
  return (
    <div style={{ background: "#0d0d1a", border: `1px solid ${phase.color}33`, borderRadius: 16, padding: "20px 22px", borderTop: `3px solid ${phase.color}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div>
          <div style={{ color: phase.color, fontSize: 11, fontWeight: 700, letterSpacing: 2, fontFamily: "'Space Mono', monospace" }}>ФАЗА {phase.phase} • ТИЖНІ {phase.weeks}</div>
          <div style={{ color: "#fff", fontSize: 18, fontWeight: 700, fontFamily: "'DM Serif Display', serif", marginTop: 4 }}>{phase.emoji} {phase.name}</div>
        </div>
      </div>
      <div style={{ color: "#aaa", fontSize: 13, fontFamily: "'Space Mono', monospace", marginBottom: 10 }}>{phase.focus}</div>
      <div style={{ background: `${phase.color}11`, border: `1px solid ${phase.color}33`, borderRadius: 8, padding: "10px 14px" }}>
        <div style={{ color: phase.color, fontSize: 11, fontWeight: 700, marginBottom: 4, fontFamily: "'Space Mono', monospace" }}>ЦІЛЬ ФАЗИ</div>
        <div style={{ color: "#ddd", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>{phase.goal}</div>
      </div>
    </div>
  );
}

function SessionBlock({ seg }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 42, height: 42, borderRadius: 10, background: `${seg.color}22`, border: `1.5px solid ${seg.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontFamily: "'Space Mono', monospace", fontWeight: 700, color: seg.color, fontSize: 11 }}>{seg.min}м</div>
      <div>
        <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "'DM Serif Display', serif" }}>{seg.label}</div>
        <div style={{ color: "#888", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>{seg.desc}</div>
      </div>
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

export default function NT2NeuroProfil() {
  const [screen, setScreen] = useState("intro"); // intro | quiz | result
  const [qIndex, setQIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [level, setLevel] = useState("A2");
  const [profile, setProfile] = useState(null);
  const [route, setRoute] = useState(null);
  const [activeTab, setActiveTab] = useState("profile");
  const [studentName, setStudentName] = useState("");
  const [tgStatus, setTgStatus] = useState("idle"); // idle | sending | sent | error
  const topRef = useRef(null);

  const sendToTelegram = async () => {
    if (!studentName.trim()) { alert("Введіть ваше ім'я перед відправкою"); return; }
    if (TG_BOT_TOKEN === "ВАШИЙ_BOT_TOKEN") {
      alert("⚙️ Репетитор ще не налаштував Telegram-бота.\nЗверніться до репетитора.");
      return;
    }
    setTgStatus("sending");
    try {
      const text = buildTelegramMessage(studentName.trim(), level, profile, route);
      const res = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: TG_CHAT_ID, text, parse_mode: "Markdown" }),
      });
      const data = await res.json();
      if (data.ok) { setTgStatus("sent"); }
      else { console.error(data); setTgStatus("error"); }
    } catch (e) {
      console.error(e); setTgStatus("error");
    }
  };

  const currentQ = QUESTIONS[qIndex];
  const totalQ = QUESTIONS.length;

  const handleAnswer = (id, val) => {
    setAnswers(prev => ({ ...prev, [id]: val }));
  };

  const canAdvance = () => {
    if (!currentQ) return false;
    if (currentQ.type === "scale") {
      return currentQ.items.every(item => answers["q6"]?.[item.key]);
    }
    return !!answers[currentQ.id];
  };

  const advance = () => {
    if (topRef.current) topRef.current.scrollIntoView({ behavior: "smooth" });
    if (qIndex < totalQ - 1) {
      setQIndex(i => i + 1);
    } else {
      const p = computeProfile(answers);
      const r = generateRoute(p, level);
      setProfile(p);
      setRoute(r);
      setScreen("result");
    }
  };

  const restart = () => {
    setAnswers({}); setQIndex(0); setProfile(null); setRoute(null); setScreen("intro");
  };

  // Google Fonts
  useEffect(() => {
    const link = document.createElement("link");
    link.href = "https://fonts.googleapis.com/css2?family=DM+Serif+Display&family=Space+Mono:wght@400;700&display=swap";
    link.rel = "stylesheet";
    document.head.appendChild(link);
  }, []);

  const containerStyle = {
    minHeight: "100vh",
    background: "#070712",
    color: "#e0e0e0",
    fontFamily: "'Space Mono', monospace",
    padding: "0 0 60px",
    position: "relative",
  };

  const cardStyle = {
    maxWidth: 680,
    margin: "0 auto",
    padding: "0 20px",
  };

  // ── INTRO ──
  if (screen === "intro") {
    return (
      <div style={containerStyle}>
        <div style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a0533 100%)", borderBottom: "1px solid #1a1a3e", padding: "60px 20px 50px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto", textAlign: "center" }}>
            <div style={{ display: "inline-block", background: "#FF6B3522", border: "1px solid #FF6B3555", borderRadius: 20, padding: "6px 18px", marginBottom: 24, color: "#FF6B35", fontSize: 12, letterSpacing: 2 }}>NT2 • НЕЙРОПРОФІЛЬ 2025</div>
            <h1 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 42, fontWeight: 400, margin: "0 0 16px", lineHeight: 1.2, color: "#fff" }}>
              Ваш особистий<br /><span style={{ color: "#FF6B35" }}>нейропрофіль</span> учня
            </h1>
            <p style={{ color: "#aaa", fontSize: 14, lineHeight: 1.8, maxWidth: 520, margin: "0 auto 36px" }}>
              12 запитань — 5 хвилин — і ви отримаєте адаптивний маршрут вивчення нідерландської, побудований під ваш унікальний стиль навчання.
            </p>

            <div style={{ marginBottom: 36 }}>
              <div style={{ color: "#888", fontSize: 12, marginBottom: 12, letterSpacing: 1 }}>ВАШ ПОТОЧНИЙ РІВЕНЬ NT2</div>
              <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                {["A1","A2","B1","B2"].map(l => (
                  <button key={l} onClick={() => setLevel(l)}
                    style={{ padding: "10px 24px", borderRadius: 10, border: `2px solid ${level === l ? "#4ECDC4" : "#2a2a3e"}`, background: level === l ? "#4ECDC422" : "#0d0d1a", color: level === l ? "#4ECDC4" : "#888", fontWeight: 700, fontSize: 16, cursor: "pointer", fontFamily: "'Space Mono', monospace", transition: "all 0.2s" }}>
                    {l}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => setScreen("quiz")}
              style={{ background: "linear-gradient(135deg, #FF6B35, #FF8C61)", color: "#000", border: "none", borderRadius: 14, padding: "18px 48px", fontSize: 16, fontWeight: 700, cursor: "pointer", fontFamily: "'Space Mono', monospace", letterSpacing: 1 }}>
              Почати діагностику →
            </button>

            <div style={{ display: "flex", gap: 24, justifyContent: "center", marginTop: 40, flexWrap: "wrap" }}>
              {[["👁","VARK-канал"], ["🔄","Стиль Колба"], ["🧠","Коґнітивний профіль"], ["💡","Мотивація (IM/EM)"], ["⚡","Нейроритм"]].map(([i, l]) => (
                <div key={l} style={{ textAlign: "center" }}>
                  <div style={{ fontSize: 22 }}>{i}</div>
                  <div style={{ color: "#555", fontSize: 10, marginTop: 4, letterSpacing: 1 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── QUIZ ──
  if (screen === "quiz") {
    const bColor = BLOCK_COLORS[currentQ.block] || "#FF6B35";
    const bIcon = BLOCK_ICONS[currentQ.block] || "📌";
    const prevBlock = qIndex > 0 ? QUESTIONS[qIndex - 1].block : 0;
    const showBlockHeader = currentQ.block !== prevBlock;

    return (
      <div style={containerStyle} ref={topRef}>
        <div style={{ background: "#0a0a1a", borderBottom: "1px solid #1a1a3e", padding: "20px", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <div style={{ color: "#888", fontSize: 12 }}>Запитання {qIndex + 1} з {totalQ}</div>
              <button onClick={restart} style={{ background: "none", border: "none", color: "#555", cursor: "pointer", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>← Назад</button>
            </div>
            <ProgressBar current={qIndex + 1} total={totalQ} />
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ paddingTop: 36 }}>
            {showBlockHeader && (
              <BlockBadge blockNum={currentQ.block} blockName={currentQ.blockName} blockSub={currentQ.blockSub} color={bColor} icon={bIcon} />
            )}

            {currentQ.type === "single" && (
              <SingleQuestion q={currentQ} value={answers[currentQ.id]} onChange={handleAnswer} blockColor={bColor} />
            )}
            {currentQ.type === "scale" && (
              <ScaleQuestion q={currentQ} values={answers["q6"] || {}} onChange={handleAnswer} blockColor={bColor} />
            )}

            <div style={{ marginTop: 36 }}>
              <button onClick={advance} disabled={!canAdvance()}
                style={{ width: "100%", background: canAdvance() ? `linear-gradient(135deg, ${bColor}, ${bColor}bb)` : "#1a1a2e", color: canAdvance() ? "#000" : "#444", border: "none", borderRadius: 14, padding: "18px", fontSize: 15, fontWeight: 700, cursor: canAdvance() ? "pointer" : "not-allowed", fontFamily: "'Space Mono', monospace", transition: "all 0.3s", letterSpacing: 1 }}>
                {qIndex < totalQ - 1 ? "Наступне →" : "Отримати нейропрофіль ✦"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── RESULT ──
  if (screen === "result" && profile && route) {
    const tabs = [
      { id: "profile", label: "Нейропрофіль" },
      { id: "route", label: "Маршрут" },
      { id: "session", label: "Структура заняття" },
      { id: "hw", label: "Домашні завдання" },
    ];

    const VARK_FULL = { V: "Візуальний", A: "Аудіальний", K: "Кінестетичний", R: "Читання/письмо" };
    const KOLB_FULL = { AC: "Акомодаційний", AS: "Асимілювальний", DI: "Дивергентний", CO: "Конвергентний" };
    const KOLB_DESC = {
      AC: "Діяти → осмислити. Вчиться через спробу та помилку. Обожнює нові виклики.",
      AS: "Теорія → практика. Потребує логічного пояснення перед дією.",
      DI: "Відчути → осмислити. Асоціативне мислення, творчі зв'язки між мовами.",
      CO: "Осмислити → діяти. Аналізує системи, порівнює, шукає єдине правильне рішення.",
    };

    return (
      <div style={containerStyle}>
        {/* Header */}
        <div style={{ background: "linear-gradient(135deg, #0f0f23 0%, #1a0533 100%)", borderBottom: "1px solid #1a1a3e", padding: "40px 20px 32px" }}>
          <div style={{ maxWidth: 680, margin: "0 auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
              <div>
                <div style={{ color: "#FF6B35", fontSize: 11, letterSpacing: 2, marginBottom: 8 }}>NT2 • НЕЙРОПРОФІЛЬ УЧНЯ • РІВЕНЬ {level}</div>
                <h2 style={{ fontFamily: "'DM Serif Display', serif", fontSize: 32, fontWeight: 400, margin: 0, color: "#fff" }}>
                  {VARK_FULL[profile.varkDom]} + {KOLB_FULL[profile.kolbDom]}
                </h2>
                <div style={{ color: "#888", fontSize: 13, marginTop: 6, fontFamily: "'Space Mono', monospace" }}>Мотивація: {route.summary.motivation} • Ритм: {route.summary.rhythm}</div>
              </div>
              <button onClick={restart}
                style={{ background: "#1a1a2e", border: "1px solid #2a2a3e", color: "#888", borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>
                ↺ Пройти знову
              </button>
            </div>

            {/* ── TELEGRAM SEND PANEL ── */}
            <div style={{ marginTop: 28, background: tgStatus === "sent" ? "#0d2e1a" : "#0d0d1a", border: `1px solid ${tgStatus === "sent" ? "#27ae6088" : tgStatus === "error" ? "#e74c3c88" : "#2E86C155"}`, borderRadius: 16, padding: "20px 22px" }}>
              <div style={{ color: "#2E86C1", fontSize: 11, letterSpacing: 2, fontFamily: "'Space Mono', monospace", marginBottom: 12 }}>📱 НАДІСЛАТИ РЕЗУЛЬТАТ РЕПЕТИТОРУ</div>
              {tgStatus === "sent" ? (
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 28 }}>✅</span>
                  <div>
                    <div style={{ color: "#2ecc71", fontWeight: 700, fontSize: 14, fontFamily: "'Space Mono', monospace" }}>Надіслано!</div>
                    <div style={{ color: "#888", fontSize: 12, fontFamily: "'Space Mono', monospace" }}>Репетитор отримав ваш нейропрофіль у Telegram</div>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
                  <div style={{ flex: 1, minWidth: 180 }}>
                    <div style={{ color: "#888", fontSize: 11, marginBottom: 6, fontFamily: "'Space Mono', monospace" }}>ВАШЕ ІМ'Я ТА ПРІЗВИЩЕ</div>
                    <input
                      type="text"
                      value={studentName}
                      onChange={e => setStudentName(e.target.value)}
                      placeholder="напр. Олена Коваль"
                      style={{ width: "100%", background: "#070712", border: "1px solid #2a2a3e", borderRadius: 10, padding: "12px 14px", color: "#fff", fontSize: 13, fontFamily: "'Space Mono', monospace", outline: "none" }}
                    />
                  </div>
                  <button
                    onClick={sendToTelegram}
                    disabled={tgStatus === "sending"}
                    style={{ background: tgStatus === "sending" ? "#1a1a2e" : "linear-gradient(135deg, #2E86C1, #45B7D1)", color: tgStatus === "sending" ? "#555" : "#000", border: "none", borderRadius: 10, padding: "12px 22px", fontSize: 13, fontWeight: 700, cursor: tgStatus === "sending" ? "not-allowed" : "pointer", fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap" }}>
                    {tgStatus === "sending" ? "⏳ Надсилаю..." : "📤 Надіслати в Telegram"}
                  </button>
                  {tgStatus === "error" && (
                    <div style={{ width: "100%", color: "#e74c3c", fontSize: 12, fontFamily: "'Space Mono', monospace", marginTop: 6 }}>
                      ❌ Помилка відправки. Перевірте налаштування бота або зверніться до репетитора.
                    </div>
                  )}
                </div>
              )}
            </div>

        {/* Tabs */}
        <div style={{ borderBottom: "1px solid #1a1a3e", background: "#0a0a1a", position: "sticky", top: 0, zIndex: 10 }}>
          <div style={{ maxWidth: 680, margin: "0 auto", display: "flex", overflowX: "auto" }}>
            {tabs.map(t => (
              <button key={t.id} onClick={() => setActiveTab(t.id)}
                style={{ padding: "16px 20px", border: "none", borderBottom: `2px solid ${activeTab === t.id ? "#FF6B35" : "transparent"}`, background: "none", color: activeTab === t.id ? "#FF6B35" : "#666", fontSize: 12, cursor: "pointer", fontFamily: "'Space Mono', monospace", whiteSpace: "nowrap", letterSpacing: 1, transition: "color 0.2s" }}>
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ paddingTop: 32 }}>

            {/* ── TAB: PROFILE ── */}
            {activeTab === "profile" && (
              <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                <div>
                  <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "#fff", fontSize: 22, marginBottom: 20 }}>Ваш нейропрофіль NT2</h3>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <ProfileCard label="Канал сприйняття" value={VARK_FULL[profile.varkDom]} sub={`${profile.varkDom}-домінантний`} color="#FF6B35" />
                    <ProfileCard label="Стиль Колба" value={KOLB_FULL[profile.kolbDom]} sub={KOLB_DESC[profile.kolbDom]?.split(".")[0]} color="#4ECDC4" />
                    <ProfileCard label="Мотивація" value={route.summary.motivation} sub="IM = внутрішня / EM = зовнішня" color="#9B59B6" />
                    <ProfileCard label="Автономія" value={route.summary.autonomy} sub="Рівень самостійності" color="#E74C3C" />
                    <ProfileCard label="Нейроритм" value={route.summary.rhythm} sub="Оптимальний фокусний блок" color="#F39C12" />
                  </div>
                </div>

                <div style={{ background: "#0d0d1a", border: "1px solid #2a2a3e", borderRadius: 16, padding: "24px" }}>
                  <h4 style={{ color: "#FF6B35", fontSize: 13, letterSpacing: 2, margin: "0 0 16px", fontFamily: "'Space Mono', monospace" }}>VARK-РОЗПОДІЛ</h4>
                  <RadarChart data={profile.vark} />
                </div>

                {profile.scales && Object.keys(profile.scales).length > 0 && (
                  <div style={{ background: "#0d0d1a", border: "1px solid #2a2a3e", borderRadius: 16, padding: "24px" }}>
                    <h4 style={{ color: "#4ECDC4", fontSize: 13, letterSpacing: 2, margin: "0 0 20px", fontFamily: "'Space Mono', monospace" }}>КОГНІТИВНИЙ ПРОФІЛЬ</h4>
                    <BarChart scales={profile.scales} />
                  </div>
                )}

                <div style={{ background: "#0d0d1a", border: "1px solid #9B59B633", borderRadius: 16, padding: "24px", borderLeft: "3px solid #9B59B6" }}>
                  <h4 style={{ color: "#9B59B6", fontSize: 13, letterSpacing: 2, margin: "0 0 12px", fontFamily: "'Space Mono', monospace" }}>СТРАТЕГІЯ ЗВОРОТНОГО ЗВ'ЯЗКУ</h4>
                  <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.8, margin: "0 0 10px", fontFamily: "'Space Mono', monospace" }}>{route.feedbackStrategy}</p>
                  <p style={{ color: "#888", fontSize: 12, fontStyle: "italic", margin: 0, fontFamily: "'Space Mono', monospace" }}>{route.errorCorrectionTip}</p>
                </div>

                <div style={{ background: "#0d0d1a", border: "1px solid #F39C1233", borderRadius: 16, padding: "24px", borderLeft: "3px solid #F39C12" }}>
                  <h4 style={{ color: "#F39C12", fontSize: 13, letterSpacing: 2, margin: "0 0 14px", fontFamily: "'Space Mono', monospace" }}>РЕКОМЕНДОВАНІ МАТЕРІАЛИ NT2</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {route.materials.map((m, i) => (
                      <div key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                        <span style={{ color: "#F39C12", fontWeight: 700, flexShrink: 0, fontFamily: "'Space Mono', monospace" }}>→</span>
                        <span style={{ color: "#ccc", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── TAB: ROUTE ── */}
            {activeTab === "route" && (
              <div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "#fff", fontSize: 22, marginBottom: 8 }}>Адаптивний маршрут NT2</h3>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 28, fontFamily: "'Space Mono', monospace" }}>Рівень {level} • {route.phases[route.phases.length - 1].weeks.split("–")[1]} тижнів</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {route.phases.map(ph => <PhaseCard key={ph.phase} phase={ph} />)}
                </div>

                <div style={{ marginTop: 28, background: "#0d0d1a", border: "1px solid #2a2a3e", borderRadius: 16, padding: "24px" }}>
                  <h4 style={{ color: "#4ECDC4", fontSize: 13, letterSpacing: 2, margin: "0 0 16px", fontFamily: "'Space Mono', monospace" }}>АНДРАГОГІЧНІ ПРИНЦИПИ У ВАШОМУ МАРШРУТІ</h4>
                  {[
                    ["Самоспрямованість", route.summary.autonomy === "Висока" ? "Учень сам обирає теми й темп. Репетитор — фасилітатор." : "Спільне планування цілей на початку кожного блоку."],
                    ["Досвід як ресурс", "Кожна нова тема пов'язується з реальним досвідом учня у НЛ-контексті."],
                    ["Готовність навчатися", "Матеріал прив'язаний до реальних потреб: побут, робота, іспит."],
                    ["Практична орієнтація", "Нове правило → одразу реальна ситуація застосування."],
                  ].map(([k, v]) => (
                    <div key={k} style={{ marginBottom: 14 }}>
                      <div style={{ color: "#4ECDC4", fontSize: 12, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{k}</div>
                      <div style={{ color: "#aaa", fontSize: 12, fontFamily: "'Space Mono', monospace", marginTop: 4 }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── TAB: SESSION ── */}
            {activeTab === "session" && (
              <div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "#fff", fontSize: 22, marginBottom: 8 }}>Структура заняття</h3>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 28, fontFamily: "'Space Mono', monospace" }}>Адаптовано під стиль {KOLB_FULL[profile.kolbDom]} • ~60 хв</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {route.sessionStructure.map((seg, i) => (
                    <div key={i}>
                      <SessionBlock seg={seg} />
                      {i < route.sessionStructure.length - 1 && (
                        <div style={{ marginLeft: 21, marginTop: 8, marginBottom: 0, width: 1, height: 16, background: "#2a2a3e" }} />
                      )}
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 28, background: "#0d0d1a", border: "1px solid #2a2a3e", borderRadius: 16, padding: "24px" }}>
                  <h4 style={{ color: "#FF6B35", fontSize: 13, letterSpacing: 2, margin: "0 0 14px", fontFamily: "'Space Mono', monospace" }}>ЧОМУ САМЕ ТАКА СТРУКТУРА?</h4>
                  <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.8, margin: 0, fontFamily: "'Space Mono', monospace" }}>{KOLB_DESC[profile.kolbDom]}</p>
                </div>

                <div style={{ marginTop: 16, background: "#0d0d1a", border: "1px solid #2a2a3e", borderRadius: 16, padding: "24px" }}>
                  <h4 style={{ color: "#4ECDC4", fontSize: 13, letterSpacing: 2, margin: "0 0 14px", fontFamily: "'Space Mono', monospace" }}>НЕЙРОРИТМ НА ЗАНЯТТІ</h4>
                  <p style={{ color: "#ccc", fontSize: 13, lineHeight: 1.8, margin: 0, fontFamily: "'Space Mono', monospace" }}>
                    Оптимальний фокусний блок: <span style={{ color: "#4ECDC4", fontWeight: 700 }}>{profile.focusMin} хв</span>. Після кожного блоку — коротка рухова або ментальна пауза (2–3 хв). Уникайте ситуацій: <span style={{ color: "#FF6B35" }}>{profile.overload === "overload_multi" ? "одночасний ввід з кількох каналів" : profile.overload === "overload_mono" ? "тривалий монолог без участі" : profile.overload === "overload_nobreak" ? "відсутність пауз між видами завдань" : "відсутність зворотного зв'язку"}</span>.
                  </p>
                </div>
              </div>
            )}

            {/* ── TAB: HW ── */}
            {activeTab === "hw" && (
              <div>
                <h3 style={{ fontFamily: "'DM Serif Display', serif", color: "#fff", fontSize: 22, marginBottom: 8 }}>Домашні завдання</h3>
                <p style={{ color: "#888", fontSize: 13, marginBottom: 28, fontFamily: "'Space Mono', monospace" }}>Персоналізований план самостійної роботи</p>

                <div style={{ background: "#0d0d1a", border: "1px solid #96CEB433", borderRadius: 16, padding: "24px", marginBottom: 20, borderLeft: "3px solid #96CEB4" }}>
                  <div style={{ display: "flex", gap: 24, flexWrap: "wrap", marginBottom: 16 }}>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#96CEB4", fontSize: 28, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{route.hwPlan.days}</div>
                      <div style={{ color: "#888", fontSize: 11, letterSpacing: 1 }}>ДНІВ/ТИЖДЕНЬ</div>
                    </div>
                    <div style={{ textAlign: "center" }}>
                      <div style={{ color: "#96CEB4", fontSize: 28, fontWeight: 700, fontFamily: "'Space Mono', monospace" }}>{route.hwPlan.time}</div>
                      <div style={{ color: "#888", fontSize: 11, letterSpacing: 1 }}>НА ДЕНЬ</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {route.hwPlan.tasks.map((t, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                        <span style={{ color: "#96CEB4", fontWeight: 700, flexShrink: 0, fontFamily: "'Space Mono', monospace", marginTop: 1 }}>{String(i+1).padStart(2,"0")}</span>
                        <span style={{ color: "#ccc", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ background: "#0d0d1a", border: "1px solid #2a2a3e", borderRadius: 16, padding: "24px" }}>
                  <h4 style={{ color: "#45B7D1", fontSize: 13, letterSpacing: 2, margin: "0 0 16px", fontFamily: "'Space Mono', monospace" }}>МАТЕРІАЛИ ПІД ВАШЕ СПРИЙНЯТТЯ ({profile.varkDom})</h4>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {route.materials.map((m, i) => (
                      <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: "#10101e", borderRadius: 8, padding: "12px 14px" }}>
                        <span style={{ color: "#45B7D1", fontWeight: 700, flexShrink: 0, fontFamily: "'Space Mono', monospace" }}>→</span>
                        <span style={{ color: "#ccc", fontSize: 13, fontFamily: "'Space Mono', monospace" }}>{m}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}
