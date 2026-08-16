/* ===================================================================
   لوحة استقطاب المواهب — منطق التطبيق
   ملف واحد مستقل · المعالجة كلها داخل المتصفح · لا خادم
   =================================================================== */
(function () {
  'use strict';

  /* ================= i18n ================= */
  var L = {
    org: ['Al Ramsat · إدارة الموارد البشرية', 'Al Ramsat · Human Resources'],
    ftSector: ['المقاولات والبيئة المبنية — الرياض، المملكة العربية السعودية', 'Contracting & Built Environment — Riyadh, Saudi Arabia'],
    ftNote: ['لوحة داخلية · تُعالَج البيانات داخل المتصفح ولا تُرسل إلى أي خادم', 'Internal dashboard · data is processed in the browser and never sent to a server'],
    xlTitle: ['Al Ramsat — قاعدة المرشحين', 'Al Ramsat — Candidate pool'],
    xlOn: ['تاريخ التصدير', 'Exported on'], xlFilter: ['النطاق', 'Scope'], xlCount: ['عدد السجلات', 'Records'],
    xlExp: ['سنوات الخبرة', 'Years of experience'],
    title: ['منصة استقطاب المواهب — لوحة تنفيذية', 'Talent Acquisition — Executive Dashboard'],
    dataAsOf: ['البيانات حتى', 'Data as of'],
    t0: ['الملخص التنفيذي', 'Executive Summary'],
    t1: ['الطلب على الوظائف', 'Role Demand'],
    t2: ['ملف المرشحين', 'Candidate Profile'],
    t3: ['الرواتب', 'Compensation'],
    t4: ['محرك الترشيح', 'Shortlist Engine'],
    d0: ['ما الذي يحدث في قاعدة المرشحين الآن — وما القرار المطلوب', 'What is happening in the talent pool — and what decision is required'],
    d1: ['أين يتركّز المعروض من المرشحين — وأين تنعدم السعودة', 'Where supply concentrates — and where Saudization is absent'],
    d2: ['من هم فعليًا — الجنسية والعمر والخبرة والإقامة', 'Who they actually are — nationality, age, experience, residence'],
    d3: ['ما الذي يطلبه السوق — وأين تقع فجوة التوقّع', 'What the market asks for — and where the expectation gap sits'],
    d4: ['اختر الوظيفة · اضبط الأوزان · احصل على القائمة القصيرة فورًا', 'Pick the role · tune the weights · get the shortlist instantly'],
    qAll: ['كل الوظائف', 'All roles'], qEng: ['هندسة', 'Engineering'], qFin: ['مالية وإدارية', 'Finance & Admin'],
    qOps: ['تشغيل ولوجستيات', 'Operations & Logistics'], qRiy: ['الرياض فقط', 'Riyadh only'], qSa: ['سعوديون', 'Saudi nationals'],
    fSearch: ['بحث', 'Search'], phSearch: ['اسم · بريد · جوال · شركة', 'Name · email · mobile · company'],
    fPos: ['الوظيفة', 'Role'], fNat: ['الجنسية', 'Nationality'], fExp: ['الخبرة', 'Experience'],
    fRes: ['مقر الإقامة', 'Residence'], fSal: ['نطاق الراتب', 'Salary band'], fSt: ['حالة المرشح', 'Status'],
    fPer: ['الفترة', 'Period'], all: ['الكل', 'All'], allRoles: ['كل الوظائف', 'All roles'],
    match: ['مطابق', 'matching'], reset: ['مسح الفلاتر', 'Reset filters'],
    per12: ['آخر 12 شهرًا', 'Last 12 months'], per6: ['آخر 6 أشهر', 'Last 6 months'],
    per3: ['آخر 3 أشهر', 'Last 3 months'], per1: ['آخر شهر', 'Last month'],
    perAll: ['كل الفترات', 'All time'],
    perRef: ['محسوبة من تاريخ اليوم: {d}', 'Counted back from today: {d}'],
    riyIn: ['داخل الرياض', 'Inside Riyadh'], riyOut: ['خارج الرياض', 'Outside Riyadh'], dam: ['الدمام', 'Dammam'],
    /* KPI */
    kTotal: ['إجمالي المرشحين', 'Total candidates'], kTotalS: ['بعد حذف {n} طلبًا مكررًا', 'after removing {n} duplicates'],
    kRiy: ['مرشحون داخل الرياض', 'Candidates in Riyadh'], kRiyS: ['{p} من القاعدة', '{p} of the pool'],
    kSaudi: ['الكوادر السعودية', 'Saudi nationals'], kSaudiS: ['{p} — أقل من مستهدف السعودة', '{p} — below Saudization target'],
    kRoles: ['وظائف مطلوبة', 'Roles requested'], kRolesS: ['مسمى وظيفي مختلف في النموذج', 'distinct titles in the form'],
    kSal: ['وسيط الراتب المتوقع', 'Median expected salary'], kSalS: ['مقابل {c} حالي · فجوة {g}', 'vs {c} current · gap {g}'],
    kCov: ['تغطية حالة الفرز', 'Screening coverage'], kCovS: ['{n} مرشحًا فقط لهم حالة مسجلة', 'only {n} candidates have a status'],
    act: ['إجراء', 'Action'], watch: ['انتباه', 'Watch'],
    /* screen 0 */
    flowT: ['تدفّق الطلبات شهريًا', 'Monthly application flow'], flowTag: ['ذروة {m}', 'Peak {m}'],
    flowCap: ['أعلى شهر استقبل {mx} طلبًا. الطاقة الاستيعابية للفرز لا تنمو بنفس الوتيرة — وهذا مصدر التراكم.',
      'The peak month received {mx} applications. Screening capacity is not growing at the same rate — that is the source of the backlog.'],
    funT: ['قمع التوظيف', 'Hiring funnel'], funTag: ['من بيانات الملف', 'From file data'],
    fun1: ['إجمالي الطلبات المستلمة', 'Applications received'], fun1s: ['قبل التنظيف', 'before cleaning'],
    fun2: ['مرشحون فريدون', 'Unique candidates'], fun2s: ['بعد حذف {n} مكررًا', 'after removing {n} duplicates'],
    fun3: ['سيرة ذاتية مرفقة', 'CV attached'], fun3s: ['{p} قابلون للمراجعة', '{p} reviewable'],
    fun4: ['لهم حالة فرز مسجلة', 'Screening status recorded'], fun4s: ['{p} فقط', '{p} only'],
    funCap: ['مرشح واحد من كل {r} فقط لديه حالة فرز مسجلة. المرحلة الأخيرة محسوبة من الخلايا المعبّأة يدويًا في الملف — وهي الحلقة المفقودة في القياس.',
      'Only 1 in {r} candidates has a recorded screening status. The last stage comes from manually filled cells — the missing link in measurement.'],
    topT: ['أعلى الوظائف طلبًا', 'Most requested roles'], clickHint: ['اضغط للتفصيل', 'Click for detail'],
    topCap: ['أعلى 8 مسميات تستوعب {n} مرشحًا ({p} من القاعدة) — الباقي موزّع على {r} مسمى بمتوسط {a} مرشحًا لكل مسمى.',
      'The top 8 titles hold {n} candidates ({p} of the pool) — the rest spread over {r} titles averaging {a} each.'],
    dqT: ['جودة البيانات بعد التنظيف', 'Data quality after cleaning'], dqTag: ['آلي عند كل رفع', 'Automatic on every upload'],
    dq1v: ['{n}', '{n}'], dq1l: ['جنسية موحّدة', 'Unified nationalities'],
    dq1d: ['مستخرجة من {f} صيغة كتابة مختلفة عبر قاموس الملف ({r} قاعدة مطابقة)', 'derived from {f} spelling variants via the file dictionary ({r} match rules)'],
    dq2l: ['طلب مكرر حُذف', 'Duplicate applications removed'],
    dq2d: ['تطابق البريد أو الجوال — يُحتفظ بأحدث طلب', 'matched by email or mobile — the latest application is kept'],
    dq3l: ['راتب غير قابل للقراءة', 'Unreadable salary values'],
    dq3d: ['نص حر مثل «16 الف» أو «20000 riyal» — معروض ولا يُخمَّن', 'free text such as “16 الف” — shown, never guessed'],
    dq4l: ['مرشح بلا حالة فرز', 'Candidates with no status'],
    dq4d: ['أكبر فجوة حوكمية — تُحلّ بإضافة عمود «حالة المرشح» في الإكسل', 'the largest governance gap — solved by adding a “حالة المرشح” column'],
    /* screen 1 */
    k1a: ['مسميات وظيفية', 'Job titles'], k1as: ['في نموذج التقديم', 'in the application form'],
    k1b: ['أعلى 8 مسميات', 'Top 8 titles'], k1bs: ['{p} من القاعدة كاملة', '{p} of the entire pool'],
    k1c: ['مسميات بأقل من 10 مرشحين', 'Titles with under 10 candidates'], k1cs: ['شواغر بلا معروض كافٍ', 'roles without sufficient supply'],
    k1d: ['مسميات بصفر سعوديين', 'Titles with zero Saudis'], k1ds: ['فجوة سعودة هيكلية', 'structural Saudization gap'],
    tblT: ['تفصيل الوظائف — أعلى {n} طلبًا', 'Role detail — top {n} by demand'],
    rowHint: ['اضغط الصف لفتح قائمة المرشحين', 'Click a row to open its candidate list'],
    cRole: ['الوظيفة', 'Role'], cCands: ['المرشحون', 'Candidates'], cExp: ['وسيط الخبرة', 'Median exp.'],
    cSalE: ['وسيط الراتب المتوقع', 'Median expected'], cRiy: ['داخل الرياض', 'In Riyadh'],
    cSa: ['نسبة السعودة', 'Saudi share'], cF: ['إناث', 'Female'], cCv: ['سيرة مرفقة', 'CV attached'],
    tblCap: ['وسيط الراتب المتوقع بالريال السعودي. «نسبة السعودة» = حصة المرشحين السعوديين من المتقدمين لهذا المسمى — أحمر تحت 10%، كهرمان 10–25%، أخضر فوق 25%.',
      'Median expected salary in SAR. “Saudi share” = share of Saudi applicants for that title — red under 10%, amber 10–25%, green above 25%.'],
    saT: ['المسميات الأعلى سعودةً', 'Highest Saudization titles'], saTag: ['100 مرشح فأكثر', '100+ candidates'],
    saCap: ['الإعلانات المشروطة أصلًا بالسعوديين تُظهر نسبة مرتفعة بحكم الشرط لا بحكم السوق — اقرأ المسميات غير المشروطة فقط.',
      'Postings restricted to Saudis show a high share by condition, not by market — read only the unrestricted titles.'],
    certT: ['الشهادات الأكثر تكرارًا في القاعدة', 'Most frequent certifications'],
    certCap: ['كل بند يفصله فاصلة أو سطر في حقل «التدريبات» يُقرأ شهادة مستقلة، والتسميات العربية والإنجليزية تُوحَّد ({n} مسمى مميّز). مؤشر توفّر لا شهادة موثّقة.',
      'Each comma- or line-separated item in the training field is read as its own credential, with AR/EN names unified ({n} distinct labels). An availability signal, not a verified credential.'],
    /* screen 2 */
    k2a: ['وسيط العمر', 'Median age'], k2as: ['سنة — قاعدة شابة', 'years — a young pool'],
    k2b: ['وسيط الخبرة', 'Median experience'], k2bs: ['سنوات بنفس المسمى', 'years in the same title'],
    k2c: ['يعملون حاليًا', 'Currently employed'], k2cs: ['{p} — يحتاجون فترة إشعار', '{p} — need a notice period'],
    k2d: ['إناث', 'Female'], k2ds: ['{p} — اختلال حاد', '{p} — sharp imbalance'],
    k2e: ['سيرة ذاتية مرفقة', 'CV attached'], k2es: ['{p} قابلون للمراجعة', '{p} reviewable'],
    natT: ['الجنسية بعد التوحيد', 'Nationality after unification'], natTag: ['{n} جنسية', '{n} nationalities'],
    natCap: ['أعلى جنسيتين تشكّلان {p} من القاعدة. السعوديون {s}.', 'The top two nationalities make up {p} of the pool. Saudis {s}.'],
    ageT: ['الفئات العمرية', 'Age bands'], ageCap: ['{p} من المرشحين بين 25 و34 سنة.', '{p} of candidates are between 25 and 34.'],
    expT: ['سنوات الخبرة', 'Years of experience'], expCap: ['{p} لديهم 10 سنوات فأكثر — عمق جيد للمناصب الإشرافية.', '{p} have 10+ years — good depth for supervisory roles.'],
    eduT: ['المؤهل الدراسي', 'Education level'], eduTag: ['مصنَّف من نص حر', 'classified from free text'],
    eduCap: ['{p} حاصلون على بكالوريوس. {n} سجلًا ({u}) لم يُصنَّف لأن الحقل نصّي حر — يُحلّ بقائمة منسدلة في النموذج.',
      '{p} hold a bachelor’s degree. {n} records ({u}) unclassified because the field is free text — solved with a dropdown in the form.'],
    geoT: ['التوزيع الجغرافي', 'Geographic distribution'],
    geoCap: ['من حقل «محل الإقامة» الحر. المؤشر المعتمد للقرار هو سؤال «هل تقيم بالرياض» المباشر: {n} مرشحًا ({p}).',
      'From the free-text residence field. The decision-grade indicator is the direct “Do you reside in Riyadh” question: {n} candidates ({p}).'],
    /* screen 3 */
    k3a: ['وسيط الراتب الحالي', 'Median current salary'], k3as: ['ريال شهريًا', 'SAR / month'],
    k3b: ['وسيط الراتب المتوقع', 'Median expected salary'],
    k3c: ['فجوة التوقّع', 'Expectation gap'], k3cs: ['الزيادة التي يطلبها المرشح', 'the increase candidates ask for'],
    k3d: ['يطلبون أقل من 6,000', 'Asking under 6,000'], k3ds: ['{p} من السجلات الصالحة', '{p} of valid records'],
    k3e: ['غير قابل للقراءة', 'Unreadable'], k3es: ['نص حر — مستبعد من الحسابات', 'free text — excluded from calculations'],
    salT: ['توزيع الراتب المتوقع', 'Expected salary distribution'], salTag: ['{n} سجلًا صالحًا', '{n} valid records'],
    salCap: ['{p} من القاعدة يطلب بين 4,000 و8,000 ريال. الفئة 20K+ تمثل {h} فقط — القيادات نادرة في هذه القاعدة.',
      '{p} of the pool asks for 4,000–8,000 SAR. The 20K+ band is only {h} — senior profiles are rare here.'],
    gapT: ['فجوة الراتب حسب الوظيفة', 'Salary gap by role'], gapTag: ['أعلى 10 طلبًا', 'Top 10 by demand'],
    cCur: ['الحالي', 'Current'], cExpd: ['المتوقع', 'Expected'], cGap: ['الفجوة', 'Gap'], cN: ['عدد', 'Count'],
    gapCap: ['الفجوة فوق 30% (أحمر) تعني تفاوضًا صعبًا؛ تحت 15% (أخضر) تعني إغلاقًا سريعًا للعرض.',
      'A gap above 30% (red) means a hard negotiation; below 15% (green) means a fast close.'],
    /* screen 4 */
    k4a: ['الوظيفة المختارة', 'Selected role'], k4as: ['غيّرها من القائمة', 'change it from the list'],
    k4b: ['حجم المعروض', 'Supply size'], k4bs: ['مرشحًا مطابقًا للمسمى', 'candidates matching the title'],
    k4c: ['يجتازون الحد {t}', 'Passing the {t} threshold'], k4cs: ['مرشحًا مؤهلًا للمقابلة', 'candidates ready to interview'],
    k4d: ['أعلى درجة', 'Top score'], k4ds: ['من 100', 'out of 100'],
    engRole: ['الوظيفة', 'Role'], engTh: ['حد الاجتياز', 'Pass threshold'],
    wT: ['أوزان التقييم', 'Scoring weights'], wTag: ['قابلة للتعديل', 'Adjustable'],
    wSum: ['مجموع الأوزان', 'Total weight'], wReset: ['إعادة الافتراضي', 'Reset defaults'],
    wCap: ['أي تعديل يعيد ترتيب القائمة فورًا دون رفع الملف مجددًا. مجموع الأوزان يُطبَّع تلقائيًا إلى 100.',
      'Any change re-ranks the list instantly, no re-upload. Weights are normalised to 100 automatically.'],
    slT: ['القائمة القصيرة — أعلى {n}', 'Shortlist — top {n}'], slHint: ['اضغط الاسم لفتح البطاقة', 'Click a name to open the card'],
    slCap: ['الترتيب محسوب آليًا من بيانات النموذج فقط. مراجعة السيرة الذاتية تبقى خطوة بشرية — البطاقة تفتح رابط السيرة مباشرة.',
      'Ranking is computed from form data only. CV review stays a human step — the card opens the CV link directly.'],
    w1: ['خبرة {n} سنوات فأكثر', '{n}+ years of experience'], w2: ['مقيم بالرياض', 'Resident in Riyadh'],
    w3: ['شهادة PMP', 'PMP certificate'], w4: ['برامج تخصصية', 'Specialist software'],
    w5: ['العمر 28–45', 'Age 28–45'], w6: ['سيرة ذاتية مرفقة', 'CV attached'],
    w7: ['الراتب ضمن النطاق', 'Salary within band'], w8: ['يعمل بنفس المسمى', 'Works in the same title'],
    /* modal / drawer */
    mAll: ['كل المرشحين', 'All candidates'], mFiltered: ['مفلترون حسب:', 'Filtered by:'],
    sTotal: ['إجمالي', 'Total'], sSaudi: ['سعوديون', 'Saudis'], sSalE: ['وسيط الراتب المتوقع', 'Median expected'],
    sExp: ['وسيط الخبرة', 'Median exp.'], sCv: ['بسيرة ذاتية', 'With CV'],
    cName: ['الاسم', 'Name'], cNat: ['الجنسية', 'Nationality'], cAge: ['العمر', 'Age'],
    cCurPos: ['الوظيفة الحالية', 'Current position'], cSalExp: ['الراتب المتوقع', 'Expected salary'],
    cRes: ['الإقامة', 'Residence'], cStat: ['الحالة', 'Status'], cCity: ['المدينة', 'City'],
    exportX: ['تصدير Excel', 'Export Excel'],
    mfAll: ['الكل', 'All'],
    mfResetT: ['مسح فلاتر النافذة', 'Clear window filters'],
    mfCount: ['{n} من {t}', '{n} of {t}'], sortNew: ['الأحدث', 'Newest'], sortExp: ['الأكثر خبرة', 'Most experienced'],
    sortSal: ['الأقل راتبًا', 'Lowest salary'], sortName: ['الاسم', 'Name'], sortBy: ['ترتيب', 'Sort'],
    showing: ['يُعرض {n} من {t} — استخدم الفلاتر أو التصدير للقائمة الكاملة.', 'Showing {n} of {t} — use filters or export for the full list.'],
    noRes: ['لا نتائج مطابقة للفلاتر الحالية.', 'No results match the current filters.'],
    drScore: ['الدرجة', 'Score'], drExpY: ['الخبرة', 'Experience'], drYears: ['سنة', 'yrs'],
    drSalE: ['الراتب المتوقع', 'Expected salary'], drSalC: ['الراتب الحالي', 'Current salary'],
    drEdu: ['المؤهل', 'Education'], drScoreT: ['تفصيل الدرجة', 'Score breakdown'],
    drContact: ['بيانات التواصل والملفات', 'Contact & documents'], drPhone: ['الجوال', 'Mobile'], drEmail: ['البريد', 'Email'],
    drCompany: ['آخر شركة', 'Last company'],
    drCerts: ['الدورات والشهادات المستخرجة', 'Extracted courses & certifications'],
    drSubs: ['قدّم {n} مرات — دُمجت في سجل واحد', 'Applied {n} times — merged into one record'],
    drRoles: ['الوظائف التي تقدّم لها', 'Roles applied for'],
    logT: ['سجل التحديثات', 'Refresh log'],
    logTag1: ['آخر تحديث', 'Last refresh'],
    logTag2: ['آخر مرتين', 'Last 2 refreshes'],
    logTag: ['آخر {n} مرات', 'Last {n} refreshes'],
    logNew: ['طلبًا جديدًا منذ آخر تحديث', 'new applications since last refresh'],
    logNewNone: ['لا طلبات جديدة منذ آخر تحديث', 'No new applications since last refresh'],
    logFlow: ['صافي التغيّر {d}', 'Net change {d}'],
    logFirst: ['أول تحديث مسجّل — لا مقارنة بعد', 'First recorded refresh — nothing to compare yet'],
    logDate: ['التاريخ', 'Date'], logTime: ['الوقت', 'Time'],
    logTotal: ['الإجمالي', 'Total'], logDelta: ['التغيّر', 'Change'], logNewC: ['جديد', 'New'],
    logEmpty: ['لم يُسجَّل أي تحديث بعد. اضغط زر التحديث ليبدأ السجل.',
      'No refresh recorded yet. Press the refresh button to start the log.'],
    logGrew: ['نمَت:', 'Grew:'],
    logQ: ['حُذف <b>{d}</b> طلبًا مكررًا · <b>{u}</b> راتبًا غير مقروء · <b>{s}</b> بلا حالة فرز',
      'Removed <b>{d}</b> duplicates · <b>{u}</b> unreadable salaries · <b>{s}</b> without a status'],
    logExport: ['تصدير السجل', 'Export log'],
    stale: ['لم يصل طلب جديد منذ {n} يومًا — تحقّق من ارتباط النموذج بالشيت.',
      'No new application for {n} days — check that the form is still feeding the sheet.'],
    /* الحفظ */
    saveTip: ['حفظ مساحة العمل (البيانات والحالات والفلاتر)', 'Save workspace (data, statuses, filters)'],
    saved: ['تم الحفظ — ستفتح اللوحة على هذه الحالة', 'Saved — the dashboard will open in this state'],
    saveFail: ['تعذّر الحفظ — المساحة ممتلئة في المتصفح', 'Save failed — browser storage is full'],
    /* التخزين المشترك (Supabase) */
    saveCloud: ['تم الحفظ في مساحة العمل المشتركة · النسخة {v}', 'Saved to the shared workspace · version {v}'],
    saveConflict: ['تم تحديث البيانات بواسطة مستخدم آخر. يرجى تحميل آخر نسخة قبل الحفظ.',
      'The workspace was updated by another user. Reload the latest version before saving.'],
    saveOffline: ['تعذر الوصول إلى التخزين المشترك. لم يتم حفظ التغييرات على الخادم.',
      'Shared storage is unavailable. Changes were not saved to the server.'],
    newerT: ['يتوفر تحديث أحدث لمساحة العمل.', 'A newer workspace version is available.'],
    newerS: ['حُفظت بواسطة {u} · النسخة {v}. لن يُستبدل عملك غير المحفوظ إلا إذا ضغطت تحميل.',
      'Saved by {u} · version {v}. Your unsaved work will not be replaced unless you press load.'],
    loadLatest: ['تحميل أحدث نسخة', 'Load latest'],
    discardAsk: ['لديك تغييرات غير محفوظة. تحميل النسخة المشتركة وتجاهل تغييراتك؟',
      'You have unsaved changes. Load the shared version and discard yours?'],
    later: ['لاحقًا', 'Later'],
    migAsk: ['تم العثور على مساحة عمل محفوظة على هذا الجهاز. هل تريد رفعها لتصبح النسخة المشتركة؟',
      'A workspace saved on this device was found. Upload it as the shared workspace?'],
    migDone: ['تم رفع مساحة العمل المحلية — أصبحت النسخة المشتركة', 'The local workspace was uploaded — it is now the shared version'],
    cloudOn: ['مشترك', 'Shared'],
    cloudOnT: ['متصل بالتخزين المشترك — النسخة {v} · آخر حفظ {u}', 'Connected to shared storage — version {v} · last saved by {u}'],
    cloudLocal: ['محلي فقط', 'Local only'],
    cloudLocalT: ['تعذّر الوصول إلى Supabase — الحفظ يتم على هذا الجهاز فقط', 'Supabase is unreachable — saving happens on this device only'],
    cloudOff: ['غير مُهيّأ', 'Not configured'],
    cloudOffT: ['لم تُضبط مفاتيح Supabase — راجع SUPABASE-SETUP.md', 'Supabase keys are not set — see SUPABASE-SETUP.md'],
    cloudSaving: ['جارٍ الحفظ…', 'Saving…'],
    sharedNoRecs: ['استُعيدت إعدادات وحالات مشتركة ({n}) — جارٍ سحب المرشحين من الشيت',
      'Shared settings and {n} statuses restored — pulling candidates from the sheet'],
    restoredCloud: ['استُعيدت مساحة العمل المشتركة · النسخة {v}', 'Restored the shared workspace · version {v}'],
    restored: ['استُعيدت مساحة عمل محفوظة بتاريخ {d}', 'Restored a workspace saved on {d}'],
    wsBanner: ['بيانات محفوظة بتاريخ {d} — اضغط زر التحديث لسحب الأحدث من الشيت',
      'Saved data from {d} — press refresh to pull the latest from the sheet'],
    clearAll: ['حذف المحفوظ', 'Delete saved'],
    bkExport: ['تصدير نسخة احتياطية', 'Export backup'],
    bkImport: ['استيراد نسخة', 'Import backup'],
    bkHint: ['النسخة الاحتياطية تحمل كل شيء: المرشحين وحالات الفرز والفلاتر والأوزان والسجل. استوردها في أي إصدار جديد من اللوحة لتكمل من حيث توقّفت.',
      'The backup carries everything: candidates, screening statuses, filters, weights and the log. Import it into any new version of the dashboard to carry on where you stopped.'],
    bkDone: ['تم تصدير النسخة الاحتياطية', 'Backup exported'],
    bkIn: ['تم الاستيراد — {n} مرشحًا · {s} حالة فرز', 'Imported — {n} candidates · {s} statuses'],
    bkInPart: ['استُوردت الإعدادات و{s} حالة فرز — اضغط تحديث لسحب المرشحين', 'Settings and {s} statuses imported — press refresh to pull the candidates'],
    bkBad: ['هذا ليس ملف نسخة احتياطية صالحًا', 'This is not a valid backup file'],
    bkDetect: ['تم التعرّف على ملف نسخة احتياطية', 'Backup file detected'],
    shCands: ['المرشحون', 'Candidates'], shStatus: ['الحالات', 'Statuses'],
    shLog: ['السجل', 'Log'], shSet: ['الإعدادات', 'Settings'], shInfo: ['معلومات', 'Info'],
    clearAllAsk: ['سيُحذف كل ما حفظته (البيانات والحالات والفلاتر والسجل) وتعود اللوحة فارغة. متابعة؟',
      'Everything you saved (data, statuses, filters and the log) will be deleted and the dashboard returns to empty. Continue?'],
    dq2d2: ['ربط بالبريد أو الجوال بعد التوحيد ({m} شخصًا قدّم أكثر من مرة) — يُبقى الاسم والبيانات الأكثر تفصيلًا',
      'linked by normalised email or mobile ({m} people applied more than once) — the most detailed name and data are kept'],
    drCv: ['فتح السيرة الذاتية', 'Open CV'], drCopy: ['نسخ الملخص', 'Copy summary'],
    drStatus: ['حالة المرشح', 'Candidate status'],
    drNote: ['تغيير الحالة يُحفظ داخل متصفحك ويُصدَّر مع ملف المتابعة — لا يُعدّل ملف الإكسل الأصلي.',
      'Status changes are saved in your browser and exported with the tracking file — the original Excel is never modified.'],
    noCv: ['لا توجد سيرة ذاتية مرفقة', 'No CV attached'], copied: ['تم النسخ', 'Copied'],
    rankIn: ['المرتبة {r} من {n}', 'Rank {r} of {n}'],
    /* upload */
    updT: ['مصدر البيانات', 'Data source'],
    updS: ['اللوحة تقرأ من Google Sheet مباشرة — المعالجة كلها داخل جهازك', 'The dashboard reads directly from Google Sheets — all processing on your device'],
    lSheet: ['رابط الشيت', 'Sheet link'],
    syncNow: ['تحديث الآن', 'Refresh now'],
    sheetHint: ['يجب أن يكون الشيت مشاركًا «لأي شخص لديه الرابط — مُشاهد». يُقرأ الشيت مباشرة ولا يُعدَّل إطلاقًا.',
      'The sheet must be shared as “Anyone with the link — Viewer”. It is read only, never modified.'],
    fbTitle: ['استيراد نسخة احتياطية أو رفع ملف إكسل يدويًا', 'Import a backup, or upload an Excel file manually'],
    syncTip: ['تحديث البيانات من Google Sheet', 'Refresh data from Google Sheet'],
    srcTip: ['مصدر البيانات', 'Data source'],
    stConnect: ['الاتصال بـ Google Sheets', 'Connecting to Google Sheets'],
    stMain: ['قراءة ورقة الردود', 'Reading the responses sheet'],
    stMainD: ['{n} صفًا · التبويب: {s}', '{n} rows · tab: {s}'],
    stProbe: ['فحص تبويبات الشيت', 'Scanning workbook tabs'],
    stProbeD: ['{list} — اختير الأكبر', '{list} — largest selected'],
    stDict: ['قراءة قاموس الجنسيات', 'Reading the nationality dictionary'],
    stDictOk: ['الورقة «{s}» — {r} قاعدة مطابقة', 'Sheet “{s}” — {r} match rules'],
    stDictNo: ['لم تُوجد ورقة «تصنيف الجنسيات» في الشيت — استُخدم القاموس المدمج ({r} قاعدة)',
      'No “تصنيف الجنسيات” sheet in the workbook — the built-in dictionary was used ({r} rules)'],
    syncing: ['جارٍ التحديث…', 'Refreshing…'],
    syncOk: ['تم التحديث — {n} مرشحًا', 'Refreshed — {n} candidates'],
    syncAt: ['آخر مزامنة {t}', 'Synced {t}'],
    errNet: ['تعذّر الوصول إلى الشيت. تأكد من الاتصال بالإنترنت ومن أن مشاركة الشيت مضبوطة على «أي شخص لديه الرابط».',
      'Could not reach the sheet. Check your internet connection and that sharing is set to “Anyone with the link”.'],
    errUrl: ['الرابط غير صالح — الصق رابط Google Sheet كاملًا.', 'Invalid link — paste the full Google Sheet URL.'],
    errShape: ['الشيت لا يحتوي على ورقة ردود صالحة (لم يُعثر على عمود Timestamp).',
      'The sheet has no valid responses tab (no Timestamp column found).'],
    dropT: ['اسحب هنا نسخة احتياطية أو ملف ردود النموذج', 'Drop a backup file or a form-responses file here'],
    dropD: ['‎.xlsx‎ · يُتعرَّف على نوع الملف تلقائيًا · لا يُرفع إلى أي خادم', '.xlsx · the file type is detected automatically · never sent to a server'],
    st1: ['قراءة الأوراق المطلوبة', 'Reading required sheets'],
    st2: ['توحيد الجنسيات والمسميات', 'Unifying nationalities and titles'],
    st2d: ['{r} قاعدة مطابقة من قاموس الملف · {f} صيغة رُدّت إلى {u} جنسية', '{r} match rules from the file dictionary · {f} variants reduced to {u}'],
    st3: ['حذف المكرر', 'Removing duplicates'],
    st3d: ['{n} طلبًا مكررًا من {m} شخصًا — الربط بالبريد أو الجوال بعد التوحيد، ويُبقى الاسم والبيانات الأكثر تفصيلًا',
      '{n} duplicates from {m} people — linked by normalised email or mobile; the most detailed name and data are kept'],
    st4: ['إعادة بناء المؤشرات', 'Rebuilding indicators'],
    st4d: ['{n} سجلًا · {p} مسمى وظيفي · {c} دورة وشهادة مستخرجة', '{n} records · {p} job titles · {c} extracted credentials'],
    updOk: ['اعتماد التحديث', 'Apply update'], cancel: ['إلغاء', 'Cancel'],
    lastUpd: ['آخر تحديث: {d}', 'Last update: {d}'],
    autoSave: ['لا يُحفظ شيء تلقائيًا — اضغط زر «الحفظ» في الشريط العلوي لتثبيت البيانات والحالات والفلاتر',
      'Nothing is saved automatically — press Save in the top bar to keep the data, statuses and filters'],
    updDone: ['تم تحديث البيانات — {n} مرشحًا', 'Data updated — {n} candidates'],
    updErr: ['تعذّرت قراءة الملف', 'Could not read the file'], reading: ['جارٍ القراءة…', 'Reading…'],
    restore: ['استعادة البيانات الأصلية', 'Restore original data'], restored: ['تمت الاستعادة', 'Restored'],
    embedded: ['لا توجد بيانات محمّلة بعد', 'No data loaded yet'],
    ebT: ['اللوحة فارغة — لم تُرفع أي بيانات بعد', 'The dashboard is empty — no data uploaded yet'],
    ebS: ['اضغط «تحديث البيانات الآن» ليقرأ النظام آخر الردود من Google Sheet مباشرة. يحتاج اتصالًا بالإنترنت.',
      'Click “Refresh data now” to read the latest responses straight from Google Sheets. An internet connection is required.'],
    ebBtn: ['تحديث البيانات الآن', 'Refresh data now'],
    emptyHint: ['اضغط زر التحديث لسحب البيانات', 'Click refresh to pull the data'],
    noData: ['—', '—'],
    srcNone: ['لا توجد بيانات — الملف فارغ. ارفع ملف الإكسل لتبدأ.', 'No data — the file is empty. Upload the Excel file to start.'],
    srcSaved: ['بيانات هذه الجلسة فقط: {n} مرشحًا — لا تُحفظ على الجهاز، وتختفي عند إغلاق الصفحة.',
      'This session only: {n} candidates — nothing is stored on the device; it disappears when the page closes.'],
    srcEmbed: ['البيانات المعروضة مضمّنة داخل هذا الملف: {n} مرشحًا.', 'The data shown is embedded in this file: {n} candidates.'],
    clearBtn: ['تفريغ اللوحة', 'Clear dashboard'],
    clearAsk: ['ستعود اللوحة فارغة وتُمسح البيانات المعروضة الآن. متابعة؟',
      'The dashboard will return to empty and the data currently shown will be cleared. Continue?'],
    privNote: ['الملف نفسه لا يحتوي أي بيانات · لا يُحفظ شيء في المتصفح إلا بضغطة «حفظ» منك.',
      'The file itself holds no data · nothing is stored in the browser unless you press Save.'],
    cleared: ['تم مسح جميع البيانات — اللوحة فارغة الآن', 'All data cleared — the dashboard is now empty'],
    ver: ['الإصدار', 'Version']
  };
  var APP_VERSION = '2.0';
  var LANG = 0;
  function T(k, vars) {
    var s = (L[k] ? L[k][LANG] : k) || k;
    if (vars) for (var v in vars) s = s.split('{' + v + '}').join(vars[v]);
    return s;
  }

  /* ================= helpers ================= */
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function nf(v) { return v == null || isNaN(v) ? '—' : Number(Math.round(v)).toLocaleString('en-US'); }
  function iso(s) { return '<span class="iso">' + s + '</span>'; }
  function pc(a, b, d) { return b ? iso((100 * a / b).toFixed(d == null ? 1 : d) + '%') : iso('0%'); }
  function med(arr) {
    var a = arr.filter(function (v) { return v != null && !isNaN(v); }).sort(function (x, y) { return x - y; });
    if (!a.length) return null;
    var m = Math.floor(a.length / 2);
    return a.length % 2 ? a[m] : (a[m - 1] + a[m]) / 2;
  }
  function countBy(list, fn) {
    var m = Object.create(null);
    for (var i = 0; i < list.length; i++) { var k = fn(list[i]); if (k == null || k === '') continue; m[k] = (m[k] || 0) + 1; }
    return m;
  }
  function toPairs(o) { return Object.keys(o).map(function (k) { return [k, o[k]]; }).sort(function (a, b) { return b[1] - a[1]; }); }
  var DAY = 86400000;
  function dateOf(r) { return r.t < 0 ? null : new Date(r.t * DAY); }
  var AR_MONTHS = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];
  var EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function fmtDate(d) { return d ? d.getDate() + ' ' + (LANG ? EN_MONTHS : AR_MONTHS)[d.getMonth()] + ' ' + d.getFullYear() : '—'; }
  function fmtMon(k) { var p = k.split('-'); return (LANG ? EN_MONTHS : AR_MONTHS)[+p[1] - 1] + ' ' + p[0]; }
  function initials(n) {
    var w = String(n || '').trim().split(/\s+/);
    return ((w[0] || '').slice(0, 1) + (w[1] || '').slice(0, 1)) || '?';
  }
  var SVG = {
    up: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 15V3M12 3 8 7M12 3l4 4"/><path d="M4 15v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3"/></svg>',
    moon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>',
    sun: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>',
    globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c2.5 2.5 3.8 6 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-6-3.8-9s1.3-6.5 3.8-9z"/></svg>',
    rst: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 12a9 9 0 1 0 3-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    arr: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m9 18 6-6-6-6"/></svg>',
    chk: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    top: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>',
    copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>',
    ext: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3h7v7M21 3l-9 9M20 14v5a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h5"/></svg>',
    xls: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M9 13l6 6M15 13l-6 6"/></svg>',
    save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><path d="M17 21v-8H7v8M7 3v5h8"/></svg>',
    sync: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12a9 9 0 1 1-2.64-6.36"/><path d="M21 3v6h-6"/></svg>',
    db: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 1.7 3.6 3 8 3s8-1.3 8-3V5"/><path d="M4 12c0 1.7 3.6 3 8 3s8-1.3 8-3"/></svg>'
  };

  /* ================= state ================= */
  var DATA = [];           /* السجلات النشطة */
  var META = { src: 'embedded', at: null, report: null };
  var OVERRIDES = {};      /* تغييرات الحالة محليًا */
  var VIEW = 0;
  var F = { q: '', pos: '', nat: '', exp: '', res: '', sal: '', st: '', per: '' , fam: ''};
  var ENG = { pos: '', th: 80, w: [25, 20, 10, 10, 10, 10, 10, 5], minExp: 5 };
  var DEF_W = [25, 20, 10, 10, 10, 10, 10, 5];
  var SORT = { key: 't', dir: -1 };
  /* نطاقات الراتب المتوقع — موحّدة بين فلتر الهيدر وفلاتر النوافذ */
  var SAL_BANDS = [
    ['0-3000', '0 – 3,000'], ['3000-6000', '3,000 – 6,000'], ['6000-9000', '6,000 – 9,000'],
    ['9000-12000', '9,000 – 12,000'], ['12000-16000', '12,000 – 16,000'], ['16000-', '16,000+']
  ];
  var EXP_BANDS = [['0-2', '0 – 2'], ['2-5', '2 – 5'], ['5-10', '5 – 10'], ['10-15', '10 – 15'], ['15-', '15+']];
  /* فلاتر النافذة المنبثقة — تُصفَّر عند فتح كل نافذة */
  var MF = { st: '', nat: '', exp: '', sal: '' };
  var PENDING = null;
  var SHEET_URL = '';
  var SYNCING = false;
  var LAST_SYNC = null;
  var LOG = [];            /* لقطات آخر 5 تحديثات — أرقام مجمّعة فقط */
  var LAST_RUN = null;     /* تفاصيل آخر عملية تحديث لعرضها في البطاقة */
  var DIRTY = false;
  var EPOCH = 0;          /* يُزاد عند الاستيراد أو الحذف — لإلغاء أي مزامنة متأخرة */
  var WS_AT = null;
  var SAVING = false;     /* حفظ جارٍ على الخادم */
  var NEWER = null;       /* نسخة أحدث على الخادم — تُعرض في شريط، لا تُطبَّق تلقائيًا */
  var OVERRIDES_H = null; /* حالات واردة من التخزين المشترك، مبصومة، بانتظار السجلات */

  var STATUSES = ['جديد', 'تم الفرز', 'مقابلة HR', 'مقابلة فنية', 'عرض وظيفي', 'مقبول', 'مرفوض'];
  var ST_EN = { 'جديد': 'New', 'تم الفرز': 'Screened', 'مقابلة HR': 'HR interview', 'مقابلة فنية': 'Technical interview', 'عرض وظيفي': 'Offer', 'مقبول': 'Hired', 'مرفوض': 'Rejected' };
  var ST_CLS = { 'جديد': 'p-n', 'تم الفرز': 'p-b', 'مقابلة HR': 'p-t', 'مقابلة فنية': 'p-t', 'عرض وظيفي': 'p-a', 'مقبول': 'p-g', 'مرفوض': 'p-r' };
  function stName(s) { return LANG ? (ST_EN[s] || s) : s; }
  function statusOf(r) { return OVERRIDES[r.key] || r.st; }

  var FAMILY = [
    ['eng', /engineer|هندس|مهندس|technician|فني|surveyor|مساح|قياس|draft|رسام|architect|معمار|qc |quality|جودة|hse|سلامة|safety|site|موقع|بناء|تشييد|كهرب|electric|mechanic|ميكانيك|مدني|civil|تنفيذ/i],
    ['fin', /account|محاسب|مالي|finance|audit|مراجع|hr|موارد بشرية|admin|اداري|إداري|سكرت|secretar|legal|قانون|محام|purchas|مشتريات|payroll|رواتب|خزينة|treasur|بيانات|data entry|مدخل/i],
    ['ops', /نقل|transport|لوجست|logistic|مستودع|warehouse|سائق|driver|تشغيل|operation|صيانة|maintenance|أمن|security|حارس|عمال|worker|فورمان|foreman|مشرف|supervisor|اسطول|fleet|توصيل|delivery|مبيعات|sales|خدمة عملاء|customer/i]
  ];
  var famCache = {};
  function famOf(p) {
    if (famCache[p] !== undefined) return famCache[p];
    var f = '';
    for (var i = 0; i < FAMILY.length; i++) { if (FAMILY[i][1].test(p)) { f = FAMILY[i][0]; break; } }
    famCache[p] = f; return f;
  }

  /* ================= filtering ================= */
  /* الفترة تُحسب رجوعًا من تاريخ اليوم وقت فتح الملف، لا من أحدث سجل في البيانات */
  function periodCut(months) {
    var cut = new Date(TODAY.getFullYear(), TODAY.getMonth(), TODAY.getDate(), 0, 0, 0, 0);
    cut.setMonth(cut.getMonth() - months);
    return cut;
  }
  function inPeriod(r) {
    if (!F.per) return true;
    var d = dateOf(r);
    if (!d) return false;
    return d >= periodCut(+F.per);
  }
  function inExp(r) {
    if (!F.exp) return true;
    if (r.x == null) return false;
    var p = F.exp.split('-');
    return r.x >= +p[0] && (p[1] === '' || r.x < +p[1]);
  }
  function inRange(v, spec) {
    if (!spec) return true;
    if (v == null) return false;
    var p = spec.split('-');
    return v >= +p[0] && (p[1] === '' || v < +p[1]);
  }
  function inSal(r) {
    if (!F.sal) return true;
    if (r.se == null) return false;
    var p = F.sal.split('-');
    return r.se >= +p[0] && (p[1] === '' || r.se < +p[1]);
  }
  function inRes(r) {
    if (!F.res) return true;
    if (F.res === 'riy') return !!r.ry;
    if (F.res === 'out') return !r.ry;
    if (F.res === 'dam') return !!r.dm;
    return true;
  }
  var Q = '';
  function inQ(r) {
    if (!Q) return true;
    return (r.n && r.n.toLowerCase().indexOf(Q) >= 0) || (r.e && r.e.indexOf(Q) >= 0) ||
      (r.h && r.h.indexOf(Q) >= 0) || (r.co && r.co.toLowerCase().indexOf(Q) >= 0) ||
      (r.cp && r.cp.toLowerCase().indexOf(Q) >= 0) || (r.p && r.p.toLowerCase().indexOf(Q) >= 0) ||
      (r.cr && r.cr.join(' ').toLowerCase().indexOf(Q) >= 0);
  }
  function apply() {
    Q = F.q.trim().toLowerCase();
    var out = [];
    for (var i = 0; i < DATA.length; i++) {
      var r = DATA[i];
      if (F.pos && r.p !== F.pos) continue;
      if (F.fam && famOf(r.p) !== F.fam) continue;
      if (F.nat && r.nt !== F.nat) continue;
      if (F.st && statusOf(r) !== F.st) continue;
      if (!inRes(r) || !inExp(r) || !inSal(r) || !inPeriod(r) || !inQ(r)) continue;
      out.push(r);
    }
    return out;
  }

  /* ================= charts ================= */
  function lineChart(series, h) {
    h = h || 160;
    var w = 900, pad = 20;
    if (!series.length) return '<div class="empty">' + (DATA.length ? T('noRes') : T('emptyHint')) + '</div>';
    var vals = series.map(function (s) { return s[1]; });
    var mx = Math.max.apply(null, vals) || 1;
    var n = series.length;
    var pts = series.map(function (s, i) {
      return [pad + (w - 2 * pad) * (n === 1 ? .5 : i / (n - 1)), h - 26 - (h - 48) * s[1] / mx];
    });
    var d = pts.map(function (p, i) { return (i ? 'L' : 'M') + p[0].toFixed(1) + ',' + p[1].toFixed(1); }).join(' ');
    var area = d + ' L' + pts[n - 1][0].toFixed(1) + ',' + (h - 26) + ' L' + pts[0][0].toFixed(1) + ',' + (h - 26) + ' Z';
    var grid = [0, .25, .5, .75, 1].map(function (t) {
      var y = (h - 26 - (h - 48) * t).toFixed(0);
      return '<line x1="' + pad + '" y1="' + y + '" x2="' + (w - pad) + '" y2="' + y + '" stroke="var(--line)" stroke-width="1"/>';
    }).join('');
    var step = Math.max(1, Math.ceil(n / 10));
    var labs = series.map(function (s, i) {
      if (i % step && i !== n - 1) return '';
      return '<text x="' + pts[i][0].toFixed(1) + '" y="' + (h - 8) + '" font-size="9" fill="var(--faint)" text-anchor="middle">' + s[0].slice(2) + '</text>';
    }).join('');
    var mi = vals.indexOf(mx);
    var dots = series.map(function (s, i) {
      return '<circle class="pt" cx="' + pts[i][0].toFixed(1) + '" cy="' + pts[i][1].toFixed(1) + '" r="8" fill="transparent"><title>' + fmtMon(s[0]) + ' — ' + nf(s[1]) + '</title></circle>';
    }).join('');
    return '<div class="chartwrap"><svg class="chart" viewBox="0 0 ' + w + ' ' + h + '" preserveAspectRatio="none" style="height:' + h + 'px">' +
      '<defs><linearGradient id="lgA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--ink3)" stop-opacity=".26"/><stop offset="1" stop-color="var(--ink3)" stop-opacity="0"/></linearGradient></defs>' +
      grid + '<path d="' + area + '" fill="url(#lgA)"/><path d="' + d + '" fill="none" stroke="var(--ink2)" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round"/>' +
      '<circle cx="' + pts[mi][0].toFixed(1) + '" cy="' + pts[mi][1].toFixed(1) + '" r="4.5" fill="var(--gold)" stroke="var(--card)" stroke-width="2"/>' +
      '<text x="' + pts[mi][0].toFixed(1) + '" y="' + Math.max(12, pts[mi][1] - 11).toFixed(1) + '" font-size="10" font-weight="700" fill="var(--gold)" text-anchor="middle">' + nf(mx) + '</text>' +
      labs + dots + '</svg></div>';
  }
  function barList(items, opt) {
    opt = opt || {};
    if (!items.length) return '<div class="empty">' + (DATA.length ? T('noRes') : T('emptyHint')) + '</div>';
    var mx = Math.max.apply(null, items.map(function (i) { return i[1]; })) || 1;
    return '<div class="bars">' + items.map(function (it) {
      var act = opt.act ? ' data-act="' + opt.act + '" data-v="' + esc(it[2] != null ? it[2] : it[0]) + '"' : '';
      var val = opt.fmt ? opt.fmt(it[1]) : nf(it[1]);
      return '<button class="bar"' + act + ' title="' + esc(it[0]) + '"><span class="bl">' + esc(it[0]) + '</span>' +
        '<span class="bt"><span class="bf' + (opt.teal ? ' t' : '') + '" style="width:' + (100 * it[1] / mx).toFixed(1) + '%"></span></span>' +
        '<span class="bv">' + val + '</span></button>';
    }).join('') + '</div>';
  }
  function distList(items, color, opt) {
    opt = opt || {};
    if (!items.length) return '<div class="empty">' + (DATA.length ? T('noRes') : T('emptyHint')) + '</div>';
    var mx = Math.max.apply(null, items.map(function (i) { return i[1]; })) || 1;
    return '<div class="dist">' + items.map(function (it) {
      var isNum = !/[؀-ۿ]/.test(String(it[0]));
      var lab = isNum ? '<bdi dir="ltr" style="display:inline-block">' + esc(it[0]) + '</bdi>' : esc(it[0]);
      var col = (String(it[0]) === 'غير محدد' || String(it[0]) === 'أخرى') ? 'var(--slate)' : color;
      var act = opt.act ? ' data-act="' + opt.act + '" data-v="' + esc(it[2] != null ? it[2] : it[0]) + '"' : '';
      return '<button class="dr"' + act + '><span class="dl" title="' + esc(it[0]) + '">' + lab + '</span>' +
        '<span class="dt"><span class="df" style="width:' + (100 * it[1] / mx).toFixed(1) + '%;background:' + col + '"></span></span>' +
        '<span class="dv">' + nf(it[1]) + '</span></button>';
    }).join('') + '</div>';
  }

  /* ================= KPI ================= */
  function kpi(o) {
    return '<button class="kpi ' + (o.cls || '') + '"' + (o.act ? ' data-act="' + o.act + '" data-v="' + esc(o.v || '') + '"' : '') + '>' +
      '<span class="l">' + o.label + '</span><span class="v' + (o.small ? ' sm' : '') + '">' + o.value + '</span>' +
      '<span class="s">' + o.sub + '</span>' +
      (o.chip ? '<span class="chip ' + (o.chipCls || 'up') + '">' + o.chip + '</span>' : '') +
      (o.act ? '<span class="arrow">' + SVG.arr + '</span>' : '') + '</button>';
  }

  /* ================= derived stats ================= */
  var MAXDATE = new Date();
  var TODAY = new Date();   /* مرجع الفلترة الزمنية — يُلتقط عند فتح الملف */
  function stats(rows) {
    var s = {
      n: rows.length,
      riy: 0, saudi: 0, female: 0, cv: 0, emp: 0, withSt: 0, arab: 0,
      exp: [], age: [], sc: [], se: []
    };
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      if (r.ry) s.riy++;
      if (r.nt === 'سعودي') s.saudi++;
      if (r.g === 2) s.female++;
      if (r.cv) s.cv++;
      if (r.emp) s.emp++;
      if (r.ar) s.arab++;
      if (statusOf(r) !== 'جديد') s.withSt++;
      if (r.x != null) s.exp.push(r.x);
      if (r.a != null) s.age.push(r.a);
      if (r.sc != null) s.sc.push(r.sc);
      if (r.se != null) s.se.push(r.se);
    }
    s.medExp = med(s.exp); s.medAge = med(s.age); s.medSc = med(s.sc); s.medSe = med(s.se);
    return s;
  }
  function monthly(rows) {
    var m = Object.create(null);
    for (var i = 0; i < rows.length; i++) {
      var d = dateOf(rows[i]); if (!d) continue;
      var k = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
      m[k] = (m[k] || 0) + 1;
    }
    return Object.keys(m).sort().map(function (k) { return [k, m[k]]; });
  }
  function roleStats(rows, minN) {
    var by = Object.create(null);
    for (var i = 0; i < rows.length; i++) { var p = rows[i].p; (by[p] || (by[p] = [])).push(rows[i]); }
    var out = [];
    for (var p in by) {
      var g = by[p];
      if (minN && g.length < minN) continue;
      var s = stats(g);
      out.push({ pos: p, n: g.length, riy: Math.round(100 * s.riy / g.length), sa: Math.round(100 * s.saudi / g.length),
        f: Math.round(100 * s.female / g.length), cv: Math.round(100 * s.cv / g.length),
        exp: s.medExp, se: s.medSe, sc: s.medSc });
    }
    out.sort(function (a, b) { return b.n - a.n; });
    return out;
  }

  /* ================= scoring ================= */
  var W_KEYS = ['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'];
  function scoreParts(r, band) {
    var tr = (r.tr || '').toUpperCase();
    var hasPmp = tr.indexOf('PMP') >= 0;
    var hasSw = /AUTOCAD|PRIMAVERA|REVIT|BIM|MS PROJECT|SAP|ETABS|STAAD|EXCEL/.test(tr);
    var e = r.x, m = ENG.minExp;
    var pExp = e == null ? 0 : (e >= m + 5 ? 1 : (e >= m ? 0.75 : (e >= m - 2 ? 0.4 : 0)));
    var pAge = r.a == null ? 0 : ((r.a >= 30 && r.a <= 42) ? 1 : ((r.a >= 26 && r.a <= 48) ? 0.7 : ((r.a >= 22 && r.a <= 55) ? 0.35 : 0)));
    var pSal = (r.se == null || !band) ? 0 : (r.se <= band * 0.85 ? 1 : (r.se <= band ? 0.75 : (r.se <= band * 1.2 ? 0.4 : 0)));
    return [pExp, r.ry ? 1 : 0, hasPmp ? 1 : 0, hasSw ? 1 : 0, pAge, r.cv ? 1 : 0, pSal, r.emp ? 1 : 0];
  }
  function scoreRaw(r, band, wn) {
    var p = scoreParts(r, band), t = 0;
    for (var i = 0; i < p.length; i++) t += p[i] * wn[i];
    return t;
  }
  function scoreOf(r, band, wn) { return Math.round(scoreRaw(r, band, wn)); }
  function rangeFill(v, mn, mx) {
    var p = (100 * (v - mn) / (mx - mn)).toFixed(1);
    return 'background:linear-gradient(to left,var(--ink2) 0%,var(--ink2) ' + p + '%,var(--soft) ' + p + '%,var(--soft) 100%)';
  }
  function normW() {
    var sum = ENG.w.reduce(function (a, b) { return a + b; }, 0) || 1;
    return ENG.w.map(function (v) { return v * 100 / sum; });
  }

  /* ================= renderers ================= */
  var ROWS = [];  /* rows after filters — shared */

  function render() {
    TODAY = new Date();
    ROWS = apply();
    var isEmpty = !DATA.length;
    document.body.classList.toggle('is-empty', isEmpty);
    var eb = $('#emptyBar');
    if (eb) {
      var showSaved = !isEmpty && META.src === 'saved' && WS_AT;
      eb.hidden = !(isEmpty || showSaved);
      if (showSaved) {
        $('#ebT').textContent = T('wsBanner', { d: fmtDate(WS_AT) });
        $('#ebS').textContent = ''; $('#ebBtn').textContent = T('ebBtn');
      } else if (isEmpty) {
        $('#ebT').textContent = T('ebT'); $('#ebS').textContent = T('ebS'); $('#ebBtn').textContent = T('ebBtn');
      }
    }
    $('#mcount').innerHTML = isEmpty ? '' : nf(ROWS.length) + ' ' + T('match');
    $$('.tab').forEach(function (b, i) { b.classList.toggle('on', i === VIEW); });
    $$('.sec').forEach(function (s, i) { s.classList.toggle('on', i === VIEW); });
    [render0, render1, render2, render3, render4][VIEW]();
    $$('.frow .flt').forEach(function (el) {
      var sel = el.querySelector('select');
      if (sel) el.classList.toggle('on', !!sel.value);
    });
  }

  /* ---- 00 ---- */
  function render0() {
    var s = stats(ROWS), rep = META.report || {};
    var dupes = rep.dupes || 0, raw = rep.raw || (ROWS.length + dupes);
    var gap = (s.medSc && s.medSe) ? Math.round(100 * (s.medSe - s.medSc) / s.medSc) : 0;
    var nRoles = Object.keys(countBy(ROWS, function (r) { return r.p; })).length;

    $('#kpi0').innerHTML =
      kpi({ label: T('kTotal'), value: nf(s.n), sub: T('kTotalS', { n: nf(dupes) }), act: 'all' }) +
      kpi({ label: T('kRiy'), value: nf(s.riy), sub: T('kRiyS', { p: pc(s.riy, s.n) }), cls: 't', act: 'res', v: 'riy', chip: pc(s.riy, s.n, 0), chipCls: 'up' }) +
      kpi({ label: T('kSaudi'), value: nf(s.saudi), sub: T('kSaudiS', { p: pc(s.saudi, s.n) }), cls: 'a', act: 'nat', v: 'سعودي', chip: pc(s.saudi, s.n, 1), chipCls: 'wr' }) +
      kpi({ label: T('kRoles'), value: nf(nRoles), sub: T('kRolesS'), cls: 'b', act: 'goto1' }) +
      kpi({ label: T('kSal'), value: nf(s.medSe), sub: T('kSalS', { c: nf(s.medSc), g: iso((gap > 0 ? '+' : '') + gap + '%') }), act: 'goto3' }) +
      kpi({ label: T('kCov'), value: pc(s.withSt, s.n), sub: T('kCovS', { n: nf(s.withSt) }), cls: 'r', act: 'hasSt', chip: T('act'), chipCls: 'dn' });

    var mon = monthly(ROWS);
    var mx = mon.length ? Math.max.apply(null, mon.map(function (m) { return m[1]; })) : 0;
    var mxk = mon.length ? mon[mon.map(function (m) { return m[1]; }).indexOf(mx)][0] : '';
    $('#flowCard').innerHTML =
      '<div class="ph">' + T('flowT') + '<span class="tag">' + T('flowTag', { m: mxk ? fmtMon(mxk) : '—' }) + '</span></div>' +
      lineChart(mon) + '<div class="cap">' + T('flowCap', { mx: nf(mx) }) + '</div>';

    var st = [
      [T('fun1'), raw, T('fun1s'), 'var(--fn1)', ''],
      [T('fun2'), s.n, T('fun2s', { n: nf(dupes) }), 'var(--fn2)', 'all'],
      [T('fun3'), s.cv, T('fun3s', { p: pc(s.cv, s.n) }), 'var(--fn3)', 'hasCv'],
      [T('fun4'), s.withSt, T('fun4s', { p: pc(s.withSt, s.n) }), 'var(--fn4)', 'hasSt']
    ];
    $('#funCard').innerHTML = '<div class="ph">' + T('funT') + '<span class="tag g">' + T('funTag') + '</span></div><div class="fn">' +
      st.map(function (x, i) {
        return '<button class="fs"' + (x[4] ? ' data-act="' + x[4] + '"' : '') + '><span class="fb" style="width:' + (100 - i * 17) + '%;background:' + x[3] + '">' + x[0] + '</span>' +
          '<span class="fv">' + nf(x[1]) + '<span>' + x[2] + '</span></span></button>';
      }).join('') + '</div><div class="cap">' + T('funCap', { r: s.withSt ? Math.round(s.n / s.withSt) : '—' }) + '</div>';

    var rs = roleStats(ROWS);
    var top8 = rs.slice(0, 8).reduce(function (a, b) { return a + b.n; }, 0);
    $('#topCard').innerHTML = '<div class="ph">' + T('topT') + '<span class="tag">' + T('clickHint') + '</span></div>' +
      barList(rs.slice(0, 8).map(function (r) { return [r.pos, r.n]; }), { act: 'pos' }) +
      '<div class="cap">' + T('topCap', { n: nf(top8), p: pc(top8, s.n, 0), r: nf(Math.max(0, rs.length - 8)), a: nf(rs.length > 8 ? (s.n - top8) / (rs.length - 8) : 0) }) + '</div>';

    renderLogCard(s, rep, dupes);
  }

  function fmtT(ms) {
    var d = new Date(ms);
    return String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
  }
  function deltaTag(v) {
    if (v == null) return '<span class="delta n">—</span>';
    var cls = v > 0 ? 'up' : (v < 0 ? 'dn' : 'n');
    return '<span class="delta ' + cls + '">' + iso((v > 0 ? '+' : '') + nf(v)) + '</span>';
  }
  function renderLogCard(s, rep, dupes) {
    var head = '<div class="ph">' + T('logT') +
      (LOG.length ? '<button class="btn sm" id="logExp" style="margin-inline-start:auto">' + T('logExport') + '</button>' +
        '<span class="tag g">' + (function (n) {
          return n === 1 ? T('logTag1') : (n === 2 && !LANG ? T('logTag2') : T('logTag', { n: n }));
        })(Math.min(LOG.length, Store.LOG_MAX)) + '</span>' : '') + '</div>';

    if (!LOG.length) {
      $('#dqCard').innerHTML = head + '<div class="logempty">' + T('logEmpty') + '</div>';
      return;
    }
    var cur = LOG[0], prev = LOG[1] || null;

    /* 1) رقمان: جديد فعليًا + صافي التغيّر */
    var freshN = cur.fresh || 0;
    var big = '<div class="synchead"><div class="syncbig">' +
      (prev
        ? '<span class="v' + (freshN ? '' : ' zero') + '">' + iso((freshN ? '+' : '') + nf(freshN)) + '</span>' +
          '<span class="l">' + (freshN ? T('logNew') : T('logNewNone')) + '</span>'
        : '<span class="l">' + T('logFirst') + '</span>') +
      '</div>' +
      (prev ? '<div class="syncflow">' + nf(prev.total) + ' ← ' + nf(cur.total) +
        '<small>' + T('logFlow', { d: (cur.delta > 0 ? '+' : '') + nf(cur.delta) }) + '</small></div>' : '<div></div>') +
      '</div>';

    /* 2) تنبيه ركود الشيت */
    var stale = '';
    if (cur.maxT) {
      var days = Math.floor((Date.now() - cur.maxT * DAY) / 86400000);
      if (days >= 7) stale = '<div class="stale">' + T('stale', { n: nf(days) }) + '</div>';
    }

    /* جدول آخر 5 */
    var tbl = '<div class="logtbl"><table><thead><tr><th>' + T('logDate') + '</th><th>' + T('logTime') +
      '</th><th>' + T('logTotal') + '</th><th>' + T('logNewC') + '</th><th>' + T('logDelta') + '</th></tr></thead><tbody>' +
      LOG.map(function (x, i) {
        return '<tr class="' + (i ? '' : 'cur') + '"><td>' + fmtDate(new Date(x.at)) + '</td><td>' + iso(fmtT(x.at)) +
          '</td><td class="num">' + nf(x.total) + '</td><td class="num">' + (i === LOG.length - 1 && !x.fresh ? '—' : iso(nf(x.fresh || 0))) +
          '</td><td>' + (i === LOG.length - 1 && x.delta === 0 ? '<span class="delta n">—</span>' : deltaTag(x.delta)) + '</td></tr>';
      }).join('') + '</tbody></table></div>';

    /* 3) أين نمت القاعدة */
    var grew = '';
    if (cur.grew && cur.grew.length) {
      grew = '<div class="grewrow"><b>' + T('logGrew') + '</b> ' +
        cur.grew.map(function (g) { return '<span class="g">' + esc(String(g[0]).slice(0, 30)) + ' ' + iso('+' + g[1]) + '</span>'; }).join('') + '</div>';
    }

    /* 4) سطر الجودة المضغوط */
    var qline = '<div class="qline">' + T('logQ', {
      d: nf(dupes), u: nf(s.n - s.se.length), s: nf(s.n - s.withSt)
    }) + '</div>';

    $('#dqCard').innerHTML = head + big + stale + tbl + grew + qline;
  }

  /* ---- 01 ---- */
  function render1() {
    var s = stats(ROWS), rs = roleStats(ROWS);
    var top8 = rs.slice(0, 8).reduce(function (a, b) { return a + b.n; }, 0);
    var lt10 = rs.filter(function (r) { return r.n < 10; }).length;
    var zero = rs.filter(function (r) { return r.sa === 0; }).length;
    $('#kpi1').innerHTML =
      kpi({ label: T('k1a'), value: nf(rs.length), sub: T('k1as'), cls: 'b' }) +
      kpi({ label: T('k1b'), value: nf(top8), sub: T('k1bs', { p: pc(top8, s.n, 0) }) }) +
      kpi({ label: T('k1c'), value: nf(lt10), sub: T('k1cs'), cls: 'a', chip: T('watch'), chipCls: 'wr' }) +
      kpi({ label: T('k1d'), value: nf(zero), sub: T('k1ds'), cls: 'r', chip: T('act'), chipCls: 'dn' });

    var show = rs.slice(0, 12);
    $('#roleTbl').innerHTML = '<div class="ph">' + T('tblT', { n: show.length }) + '<span class="tag">' + T('rowHint') + '</span></div>' +
      '<div class="tw"><table><thead><tr><th>#</th><th>' + T('cRole') + '</th><th>' + T('cCands') + '</th><th>' + T('cExp') + '</th>' +
      '<th>' + T('cSalE') + '</th><th>' + T('cRiy') + '</th><th>' + T('cSa') + '</th><th>' + T('cF') + '</th><th>' + T('cCv') + '</th></tr></thead><tbody>' +
      show.map(function (r, i) {
        var cls = r.sa < 10 ? 'p-r' : (r.sa < 25 ? 'p-a' : 'p-g');
        return '<tr data-act="pos" data-v="' + esc(r.pos) + '"><td class="num">' + (i + 1) + '</td><td class="el" title="' + esc(r.pos) + '">' + esc(r.pos) + '</td>' +
          '<td class="num">' + nf(r.n) + '</td><td class="num">' + (r.exp == null ? '—' : r.exp) + '</td><td class="num">' + nf(r.se) + '</td>' +
          '<td class="num">' + iso(r.riy + '%') + '</td><td><span class="pill ' + cls + '"><i></i>' + iso(r.sa + '%') + '</span></td>' +
          '<td class="num">' + iso(r.f + '%') + '</td><td class="num">' + iso(r.cv + '%') + '</td></tr>';
      }).join('') + '</tbody></table></div><div class="cap">' + T('tblCap') + '</div>';

    var big = roleStats(ROWS, 100).slice().sort(function (a, b) { return b.sa - a.sa; }).slice(0, 5);
    $('#saCard').innerHTML = '<div class="ph">' + T('saT') + '<span class="tag">' + T('saTag') + '</span></div>' +
      barList(big.map(function (r) { return [r.pos, r.sa]; }), { teal: 1, act: 'pos', fmt: function (v) { return iso(v + '%'); } }) +
      '<div class="cap">' + T('saCap') + '</div>';

    var certs = Object.create(null);
    for (var i = 0; i < ROWS.length; i++) { var c = ROWS[i].cr || []; for (var j = 0; j < c.length; j++) certs[c[j]] = (certs[c[j]] || 0) + 1; }
    $('#certCard').innerHTML = '<div class="ph">' + T('certT') + '</div>' +
      barList(toPairs(certs).slice(0, 8), { act: 'cert' }) +
      '<div class="cap">' + T('certCap', { n: nf(Object.keys(certs).length) }) + '</div>';
  }

  /* ---- 02 ---- */
  function render2() {
    var s = stats(ROWS);
    $('#kpi2').innerHTML =
      kpi({ label: T('k2a'), value: nf(s.medAge), sub: T('k2as') }) +
      kpi({ label: T('k2b'), value: nf(s.medExp), sub: T('k2bs'), cls: 't' }) +
      kpi({ label: T('k2c'), value: nf(s.emp), sub: T('k2cs', { p: pc(s.emp, s.n, 0) }) }) +
      kpi({ label: T('k2d'), value: nf(s.female), sub: T('k2ds', { p: pc(s.female, s.n) }), cls: 'a', act: 'fem', chip: pc(s.female, s.n, 1), chipCls: 'wr' }) +
      kpi({ label: T('k2e'), value: nf(s.cv), sub: T('k2es', { p: pc(s.cv, s.n, 1) }), cls: 't', act: 'hasCv', chip: pc(s.cv, s.n, 1), chipCls: 'up' });

    var nat = toPairs(countBy(ROWS, function (r) { return r.nt; }));
    var top2 = (nat[0] ? nat[0][1] : 0) + (nat[1] ? nat[1][1] : 0);
    $('#natCard').innerHTML = '<div class="ph">' + T('natT') + '<span class="tag">' + T('natTag', { n: nat.length }) + '</span></div>' +
      distList(nat.slice(0, 8), 'var(--ink2)', { act: 'nat' }) +
      '<div class="cap">' + T('natCap', { p: pc(top2, s.n, 0), s: pc(s.saudi, s.n) }) + '</div>';

    var AB = ['<25', '25–29', '30–34', '35–39', '40–49', '50+'];
    function ab(a) { return a < 25 ? AB[0] : a < 30 ? AB[1] : a < 35 ? AB[2] : a < 40 ? AB[3] : a < 50 ? AB[4] : AB[5]; }
    var ageC = countBy(ROWS, function (r) { return r.a == null ? null : ab(r.a); });
    var mid = (ageC[AB[1]] || 0) + (ageC[AB[2]] || 0);
    $('#ageCard').innerHTML = '<div class="ph">' + T('ageT') + '</div>' +
      distList(AB.filter(function (k) { return ageC[k]; }).map(function (k) { return [k, ageC[k]]; }), 'var(--gold)') +
      '<div class="cap">' + T('ageCap', { p: pc(mid, s.age.length, 0) }) + '</div>';

    var XB = ['0–2', '2–5', '5–10', '10–15', '15+'];
    var XV = ['0-2', '2-5', '5-10', '10-15', '15-'];
    function xb(x) { return x < 2 ? 0 : x < 5 ? 1 : x < 10 ? 2 : x < 15 ? 3 : 4; }
    var expC = countBy(ROWS, function (r) { return r.x == null ? null : XB[xb(r.x)]; });
    var senior = (expC[XB[3]] || 0) + (expC[XB[4]] || 0);
    $('#expCard').innerHTML = '<div class="ph">' + T('expT') + '</div>' +
      distList(XB.filter(function (k) { return expC[k]; }).map(function (k) { return [k, expC[k], XV[XB.indexOf(k)]]; }), 'var(--ink2)', { act: 'exp' }) +
      '<div class="cap">' + T('expCap', { p: pc(senior, s.exp.length, 0) }) + '</div>';

    var EO = ['بكالوريوس', 'ماجستير فأعلى', 'دبلوم', 'ثانوية', 'غير محدد'];
    var eduC = countBy(ROWS, function (r) { return r.ed; });
    $('#eduCard').innerHTML = '<div class="ph">' + T('eduT') + '<span class="tag g">' + T('eduTag') + '</span></div>' +
      distList(EO.filter(function (k) { return eduC[k]; }).map(function (k) { return [k, eduC[k]]; }), 'var(--ink2)') +
      '<div class="cap">' + T('eduCap', { p: pc(eduC['بكالوريوس'] || 0, s.n, 0), n: nf(eduC['غير محدد'] || 0), u: pc(eduC['غير محدد'] || 0, s.n, 0) }) + '</div>';

    var city = toPairs(countBy(ROWS, function (r) { return r.ct; })).slice(0, 7);
    $('#geoCard').innerHTML = '<div class="ph">' + T('geoT') + '</div>' +
      distList(city, 'var(--blue)') +
      '<div class="cap">' + T('geoCap', { n: nf(s.riy), p: pc(s.riy, s.n, 0) }) + '</div>';
  }

  /* ---- 03 ---- */
  function render3() {
    var s = stats(ROWS);
    var gap = (s.medSc && s.medSe) ? Math.round(100 * (s.medSe - s.medSc) / s.medSc) : 0;
    var lt6 = s.se.filter(function (v) { return v < 6000; }).length;
    var unread = s.n - s.se.length;
    $('#kpi3').innerHTML =
      kpi({ label: T('k3a'), value: nf(s.medSc), sub: T('k3as') }) +
      kpi({ label: T('k3b'), value: nf(s.medSe), sub: T('k3as'), cls: 't' }) +
      kpi({ label: T('k3c'), value: iso((gap > 0 ? '+' : '') + gap + '%'), sub: T('k3cs'), cls: 'a', chip: iso((gap > 0 ? '+' : '') + gap + '%'), chipCls: 'wr' }) +
      kpi({ label: T('k3d'), value: nf(lt6), sub: T('k3ds', { p: pc(lt6, s.se.length, 0) }), act: 'sal', v: '0-6000' }) +
      kpi({ label: T('k3e'), value: nf(unread), sub: T('k3es'), cls: 'r', chip: pc(unread, s.n, 1), chipCls: 'dn' });

    var SB = ['<4K', '4–6K', '6–8K', '8–12K', '12–20K', '20K+'];
    var SV = ['500-4000', '4000-6000', '6000-8000', '8000-12000', '12000-20000', '20000-'];
    function sb(v) { return v < 4000 ? 0 : v < 6000 ? 1 : v < 8000 ? 2 : v < 12000 ? 3 : v < 20000 ? 4 : 5; }
    var salC = countBy(ROWS, function (r) { return r.se == null ? null : SB[sb(r.se)]; });
    var mid = (salC[SB[1]] || 0) + (salC[SB[2]] || 0);
    $('#salCard').innerHTML = '<div class="ph">' + T('salT') + '<span class="tag">' + T('salTag', { n: nf(s.se.length) }) + '</span></div>' +
      distList(SB.filter(function (k) { return salC[k]; }).map(function (k) { return [k, salC[k], SV[SB.indexOf(k)]]; }), 'var(--gold)', { act: 'sal' }) +
      '<div class="cap">' + T('salCap', { p: pc(mid, s.se.length, 0), h: pc(salC[SB[5]] || 0, s.se.length, 1) }) + '</div>';

    var rs = roleStats(ROWS).slice(0, 10).filter(function (r) { return r.sc && r.se; });
    $('#gapCard').innerHTML = '<div class="ph">' + T('gapT') + '<span class="tag">' + T('gapTag') + '</span></div>' +
      '<div class="tw"><table><thead><tr><th>' + T('cRole') + '</th><th>' + T('cN') + '</th><th>' + T('cCur') + '</th><th>' + T('cExpd') + '</th><th>' + T('cGap') + '</th></tr></thead><tbody>' +
      rs.map(function (r) {
        var g = Math.round(100 * (r.se - r.sc) / r.sc);
        var cls = g > 30 ? 'p-r' : (g > 15 ? 'p-a' : 'p-g');
        return '<tr data-act="pos" data-v="' + esc(r.pos) + '"><td class="el" title="' + esc(r.pos) + '">' + esc(r.pos) + '</td><td class="num">' + nf(r.n) + '</td>' +
          '<td class="num">' + nf(r.sc) + '</td><td class="num">' + nf(r.se) + '</td>' +
          '<td><span class="pill ' + cls + '"><i></i>' + iso((g > 0 ? '+' : '') + g + '%') + '</span></td></tr>';
      }).join('') + '</tbody></table></div><div class="cap">' + T('gapCap') + '</div>';
  }

  /* ---- 04 ---- */
  var ENG_CACHE = null;
  function engineRows() {
    var pool = ROWS.filter(function (r) { return r.p === ENG.pos; });
    var band = med(pool.map(function (r) { return r.se; })) || 0;
    var wn = normW();
    var scored = pool.map(function (r) { var raw = scoreRaw(r, band, wn); return { r: r, s: Math.round(raw), raw: raw }; });
    scored.sort(function (a, b) {
      return b.raw - a.raw || (b.r.x || 0) - (a.r.x || 0) || ((a.r.se == null ? 1e9 : a.r.se) - (b.r.se == null ? 1e9 : b.r.se));
    });
    ENG_CACHE = { rows: scored, band: band, wn: wn };
    return ENG_CACHE;
  }
  function render4() {
    var rs = roleStats(ROWS);
    if (!ENG.pos || !rs.some(function (r) { return r.pos === ENG.pos; })) ENG.pos = rs.length ? rs[0].pos : '';
    var sel = $('#engPos');
    sel.innerHTML = rs.map(function (r) {
      return '<option value="' + esc(r.pos) + '"' + (r.pos === ENG.pos ? ' selected' : '') + '>' + esc(r.pos.slice(0, 46)) + ' (' + r.n + ')</option>';
    }).join('');
    $('#engTh').value = ENG.th;
    $('#engTh').style.cssText = rangeFill(ENG.th, 40, 100);
    $('#engThV').textContent = ENG.th;

    if (!ENG.pos) {
      $('#kpi4').innerHTML = ''; $('#wPanel').innerHTML = '';
      $('#slCard').innerHTML = '<div class="empty">' + (DATA.length ? T('noRes') : T('emptyHint')) + '</div>';
      return;
    }
    var e = engineRows();
    var pass = e.rows.filter(function (x) { return x.s >= ENG.th; }).length;
    var top = e.rows.length ? e.rows[0].s : 0;

    $('#kpi4').innerHTML =
      kpi({ label: T('k4a'), value: esc(ENG.pos.slice(0, 30)), sub: T('k4as'), cls: 'b', small: true }) +
      kpi({ label: T('k4b'), value: nf(e.rows.length), sub: T('k4bs') }) +
      kpi({ label: T('k4c', { t: ENG.th }), value: nf(pass), sub: T('k4cs'), cls: 't', chip: pc(pass, e.rows.length, 1), chipCls: 'up' }) +
      kpi({ label: T('k4d'), value: nf(top), sub: T('k4ds') });

    var wn = e.wn;
    $('#wPanel').innerHTML = W_KEYS.map(function (k, i) {
      var lab = i === 0 ? T('w1', { n: ENG.minExp }) : T(k);
      return '<div class="wrow"><div class="wt"><span>' + lab + '</span><b>' + Math.round(wn[i]) + '</b></div>' +
        '<input type="range" min="0" max="30" step="1" value="' + ENG.w[i] + '" data-w="' + i + '" style="' + rangeFill(ENG.w[i], 0, 30) + '"></div>';
    }).join('') +
      '<div class="wsum"><span>' + T('wSum') + '</span><b>100</b></div>' +
      '<div class="wbtns"><button class="btn sm" id="wReset">' + T('wReset') + '</button></div>';

    var show = e.rows.slice(0, 12);
    $('#slCard').innerHTML = '<div class="ph">' + T('slT', { n: show.length }) + '<span class="tag">' + T('slHint') + '</span></div>' +
      '<div>' + show.map(function (x, i) {
        var r = x.r;
        var bits = [r.nt, r.a != null ? r.a + ' ' + T('drYears') : null, r.x != null ? r.x + ' ' + (LANG ? 'yrs exp.' : 'سنة خبرة') : null,
          r.ry ? T('riyIn') : T('riyOut'), r.se != null ? (LANG ? 'expects ' : 'متوقع ') + nf(r.se) : null].filter(Boolean);
        return '<button class="cand" data-act="cand" data-v="' + esc(r.key) + '">' +
          '<span class="rk' + (i === 0 ? ' g1' : '') + '">' + (i + 1) + '</span>' +
          '<span><span class="cn">' + esc(r.n) + '</span><span class="cs">' + bits.join(' · ') + '</span></span>' +
          '<span class="sc"><span class="scv">' + x.s + '</span><span class="scl">' + T('k4ds') + '</span></span></button>';
      }).join('') + '</div>' +
      '<div class="cap">' + T('slCap') + '</div>';
  }

  /* ================= modal ================= */
  var MROWS = [], MTITLE = '', MSUB = '';
  function buildModalFilters() {
    var nat = toPairs(countBy(MROWS, function (r) { return r.nt; }));
    $('#mfSt').innerHTML = '<option value="">' + T('mfAll') + '</option>' +
      STATUSES.map(function (s) {
        var n = MROWS.filter(function (r) { return statusOf(r) === s; }).length;
        return n ? '<option value="' + esc(s) + '">' + esc(stName(s)) + ' (' + n + ')</option>' : '';
      }).join('');
    $('#mfNat').innerHTML = '<option value="">' + T('mfAll') + '</option>' +
      nat.map(function (p) { return '<option value="' + esc(p[0]) + '">' + esc(p[0]) + ' (' + p[1] + ')</option>'; }).join('');
    $('#mfExp').innerHTML = '<option value="">' + T('mfAll') + '</option>' +
      EXP_BANDS.map(function (v) { return '<option value="' + v[0] + '">' + v[1] + '</option>'; }).join('');
    $('#mfSal').innerHTML = '<option value="">' + T('mfAll') + '</option>' +
      SAL_BANDS.map(function (v) { return '<option value="' + v[0] + '">' + v[1] + '</option>'; }).join('');
    $('#mfSt').value = MF.st; $('#mfNat').value = MF.nat;
    $('#mfExp').value = MF.exp; $('#mfSal').value = MF.sal;
  }
  function modalRows() {
    return MROWS.filter(function (r) {
      if (MF.st && statusOf(r) !== MF.st) return false;
      if (MF.nat && r.nt !== MF.nat) return false;
      if (!inRange(r.x, MF.exp)) return false;
      if (!inRange(r.se, MF.sal)) return false;
      return true;
    });
  }
  function openList(rows, title, sub) {
    MROWS = rows; MTITLE = title; MSUB = sub || '';
    SORT = { key: 't', dir: -1 };
    MF = { st: '', nat: '', exp: '', sal: '' };
    $('#mSort').value = 't';
    buildModalFilters();
    drawList();
    $('#mOv').classList.add('on');
    document.body.style.overflow = 'hidden';
  }
  function drawList(keepScroll) {
    var sc = keepScroll ? ($('#mBody').scrollTop || 0) : 0;
    var rows = modalRows();
    var k = SORT.key, d = SORT.dir;
    rows.sort(function (a, b) {
      var va = k === 'n' ? a.n : (a[k] == null ? -Infinity : a[k]);
      var vb = k === 'n' ? b.n : (b[k] == null ? -Infinity : b[k]);
      if (k === 'n') return d * String(va).localeCompare(String(vb), 'ar');
      return d * (va - vb);
    });
    var s = stats(rows);
    $('#mTitle').textContent = MTITLE;
    $('#mSub').textContent = nf(MROWS.length) + (LANG ? ' candidates · ' : ' مرشحًا · ') + MSUB;
    var anyMF = !!(MF.st || MF.nat || MF.exp || MF.sal);
    $('#mfCount').textContent = anyMF ? T('mfCount', { n: nf(rows.length), t: nf(MROWS.length) }) : '';
    [['mfSt', 'st'], ['mfNat', 'nat'], ['mfExp', 'exp'], ['mfSal', 'sal']].forEach(function (p) {
      $('#' + p[0]).parentNode.classList.toggle('on', !!MF[p[1]]);
    });
    $('#mStats').innerHTML =
      '<div><div class="sv">' + nf(s.n) + '</div><div class="sl">' + T('sTotal') + '</div></div>' +
      '<div><div class="sv">' + nf(s.saudi) + '</div><div class="sl">' + T('sSaudi') + '</div></div>' +
      '<div><div class="sv">' + nf(s.medSe) + '</div><div class="sl">' + T('sSalE') + '</div></div>' +
      '<div><div class="sv">' + nf(s.medExp) + '</div><div class="sl">' + T('sExp') + '</div></div>' +
      '<div><div class="sv">' + nf(s.cv) + '</div><div class="sl">' + T('sCv') + '</div></div>';
    var LIM = 300, show = rows.slice(0, LIM);
    $('#mBody').innerHTML = !rows.length ? '<div class="empty">' + (DATA.length ? T('noRes') : T('emptyHint')) + '</div>' :
      '<table><thead><tr><th>#</th><th>' + T('cName') + '</th><th>' + T('cNat') + '</th><th>' + T('cAge') + '</th><th>' + T('cExp') + '</th>' +
      '<th>' + T('cCurPos') + '</th><th>' + T('cSalExp') + '</th><th>' + T('cRes') + '</th><th>' + T('cStat') + '</th></tr></thead><tbody>' +
      show.map(function (r, i) {
        var st = statusOf(r);
        return '<tr data-act="cand" data-v="' + esc(r.key) + '"><td class="num">' + (i + 1) + '</td><td>' + esc(r.n) + '</td>' +
          '<td>' + esc(r.nt) + '</td><td class="num">' + (r.a == null ? '—' : r.a) + '</td><td class="num">' + (r.x == null ? '—' : r.x) + '</td>' +
          '<td class="el" style="max-width:180px" title="' + esc(r.cp) + '">' + esc(r.cp || '—') + '</td><td class="num">' + nf(r.se) + '</td>' +
          '<td><span class="pill ' + (r.ry ? 'p-g' : 'p-n') + '"><i></i>' + (r.ry ? T('riyIn') : esc(r.ct || T('riyOut'))) + '</span></td>' +
          '<td class="stcell">' + statusSelect(r, st) + '</td></tr>';
      }).join('') + '</tbody></table>' +
      (rows.length > LIM ? '<div class="mnote">' + T('showing', { n: nf(LIM), t: nf(rows.length) }) + '</div>' : '');
    if (keepScroll) $('#mBody').scrollTop = sc;
  }
  function statusSelect(r, st) {
    return '<select class="stsel ' + (ST_CLS[st] || 'p-n') + '" data-st-key="' + esc(r.key) + '">' +
      STATUSES.map(function (s) {
        return '<option value="' + esc(s) + '"' + (s === st ? ' selected' : '') + '>' + esc(stName(s)) + '</option>';
      }).join('') + '</select>';
  }
  function setStatus(key, val) {
    OVERRIDES[key] = val;
    setDirty(true);
    render();
    if ($('#mOv').classList.contains('on')) drawList(true);
    if (CUR && CUR.key === key) {
      $$('#stSel button').forEach(function (x) { x.classList.toggle('on', x.dataset.st === val); });
    }
    toast(T('drStatus') + ': ' + stName(val));
  }
  function closeModal() { $('#mOv').classList.remove('on'); document.body.style.overflow = ''; }

  /* ================= drawer ================= */
  var CUR = null;
  function openCand(key) {
    var r = null;
    for (var i = 0; i < DATA.length; i++) if (DATA[i].key === key) { r = DATA[i]; break; }
    if (!r) return;
    CUR = r;
    var pool = DATA.filter(function (x) { return x.p === r.p; });
    var band = med(pool.map(function (x) { return x.se; })) || 0;
    var wn = normW();
    var parts = scoreParts(r, band);
    var sc = scoreOf(r, band, wn);
    var ranked = pool.map(function (x) { return { k: x.key, s: scoreRaw(x, band, wn), x: x }; }).sort(function (a, b) {
      return b.s - a.s || (b.x.x || 0) - (a.x.x || 0) || ((a.x.se == null ? 1e9 : a.x.se) - (b.x.se == null ? 1e9 : b.x.se));
    });
    var rank = ranked.map(function (x) { return x.k; }).indexOf(key) + 1;
    var st = statusOf(r);

    $('#drAv').textContent = initials(r.n);
    $('#drName').textContent = r.n;
    $('#drSub').innerHTML = esc(r.nt) + ' · ' + esc(r.p.slice(0, 40)) + ' · ' + T('rankIn', { r: rank, n: nf(pool.length) }) +
      (r.subs > 1 ? '<br><span class="dsubs">' + T('drSubs', { n: r.subs }) + '</span>' : '');
    $('#drBody').innerHTML =
      '<div class="dgrid">' +
      '<div class="dcell"><div class="cl">' + T('drScore') + '</div><div class="cv" style="color:var(--gold)">' + sc + '</div></div>' +
      '<div class="dcell"><div class="cl">' + T('drExpY') + '</div><div class="cv">' + (r.x == null ? '—' : r.x + ' ' + T('drYears')) + '</div></div>' +
      '<div class="dcell"><div class="cl">' + T('cAge') + '</div><div class="cv">' + (r.a == null ? '—' : r.a) + '</div></div>' +
      '<div class="dcell"><div class="cl">' + T('drSalE') + '</div><div class="cv">' + nf(r.se) + '</div></div>' +
      '<div class="dcell"><div class="cl">' + T('drSalC') + '</div><div class="cv">' + nf(r.sc) + '</div></div>' +
      '<div class="dcell"><div class="cl">' + T('cRes') + '</div><div class="cv txt">' + (r.ry ? T('riyIn') : esc(r.ct || T('riyOut'))) + '</div></div>' +
      '</div>' +
      '<div class="dsec">' + T('drScoreT') + '</div><div class="scorebar">' +
      W_KEYS.map(function (k, i) {
        var lab = i === 0 ? T('w1', { n: ENG.minExp }) : T(k);
        var got = parts[i] * wn[i];
        return '<div class="sb"><span class="sl2" title="' + esc(lab) + '">' + lab + '</span>' +
          '<span class="st"><span class="sf' + (got ? '' : ' z') + '" style="width:' + (parts[i] * 100).toFixed(0) + '%"></span></span>' +
          '<span class="sv2">' + Math.round(got) + '/' + Math.round(wn[i]) + '</span></div>';
      }).join('') + '</div>' +
      '<div class="dsec">' + T('drStatus') + '</div>' +
      '<div class="chipsel" id="stSel">' + STATUSES.map(function (x) {
        return '<button data-st="' + esc(x) + '" class="' + (x === st ? 'on' : '') + '">' + esc(stName(x)) + '</button>';
      }).join('') + '</div>' +
      '<div class="dsec">' + T('drContact') + '</div>' +
      '<div class="dgrid c2">' +
      '<div class="dcell"><div class="cl">' + T('drPhone') + '</div><div class="cv txt"><bdi dir="ltr">' + esc(r.h || '—') + '</bdi></div></div>' +
      '<div class="dcell"><div class="cl">' + T('drEmail') + '</div><div class="cv txt" title="' + esc(r.e) + '"><bdi dir="ltr">' + esc(r.e || '—') + '</bdi></div></div>' +
      '<div class="dcell"><div class="cl">' + T('drEdu') + '</div><div class="cv txt">' + esc(r.ed) + '</div></div>' +
      '<div class="dcell"><div class="cl">' + T('drCompany') + '</div><div class="cv txt" title="' + esc(r.co) + '">' + esc(r.co || '—') + '</div></div>' +
      '</div>' +
      (r.subs > 1 ? '<div class="dsec">' + T('drRoles') + '</div><div class="tagrow rolerow">' +
        r.pos.map(function (c, ix) { return '<span class="' + (ix ? 'g' : '') + '">' + esc(c.slice(0, 44)) + '</span>'; }).join('') + '</div>' : '') +
      (r.cr && r.cr.length ? '<div class="dsec">' + T('drCerts') + '</div><div class="tagrow">' + r.cr.map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div>' : '') +
      '<div class="btnrow">' +
      (r.cv ? '<a class="btn pri" href="https://drive.google.com/open?id=' + encodeURIComponent(r.cv) + '" target="_blank" rel="noopener">' + SVG.ext + T('drCv') + '</a>'
        : '<span class="btn" style="opacity:.5;cursor:default">' + T('noCv') + '</span>') +
      '<button class="btn" id="drCopy">' + SVG.copy + T('drCopy') + '</button></div>' +
      '<div class="cap" style="padding:2px 0 0">' + T('drNote') + '</div>';

    $('#drwBg').classList.add('on'); $('#drw').classList.add('on');
    document.body.style.overflow = 'hidden';
  }
  function closeDrawer() {
    $('#drwBg').classList.remove('on'); $('#drw').classList.remove('on');
    if (!$('#mOv').classList.contains('on')) document.body.style.overflow = '';
  }

  /* ================= export ================= */
  function exportRows(rows, name) {
    var head = ['#', T('cName'), T('drEmail'), T('drPhone'), T('cNat'), T('cAge'), T('xlExp'), T('fPos'),
      T('cCurPos'), T('drCompany'), T('drSalC'), T('drSalE'), T('drEdu'), T('cCity'), T('cRes'), T('cStat'), 'CV'];
    var now = new Date();
    var stamp = now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0') + '-' + String(now.getDate()).padStart(2, '0');
    var aoa = [
      [T('xlTitle')],
      [T('xlOn'), fmtDate(now), T('xlFilter'), MTITLE || T('mAll'), T('xlCount'), rows.length],
      [],
      head
    ];
    rows.forEach(function (r, i) {
      aoa.push([i + 1, r.n, r.e, r.h, r.nt, r.a, r.x, r.p, r.cp, r.co, r.sc, r.se, r.ed, r.ct,
        r.ry ? T('riyIn') : T('riyOut'), stName(statusOf(r)),
        r.cv ? 'https://drive.google.com/open?id=' + r.cv : '']);
    });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = head.map(function (h, i) { return { wch: i === 1 ? 30 : (i === 2 ? 26 : (i === 7 || i === 8 ? 26 : 13)) }; });
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 5 } }];
    ws['!freeze'] = { xSplit: '0', ySplit: '4' };
    if (ws['A1']) ws['A1'].s = { font: { bold: true, sz: 14 } };
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Al Ramsat');
    XLSX.writeFile(wb, 'AlRamsat-' + (name || 'candidates') + '-' + stamp + '.xlsx');
    toast(T('exportX') + ' \u2713');
  }

  function exportLog() {
    var aoa = [[T('logT') + ' — Al Ramsat'], [T('xlOn'), fmtDate(new Date())], [],
      [T('logDate'), T('logTime'), T('logTotal'), T('logNewC'), T('logDelta'),
        T('kRiy'), T('kSaudi'), T('fun3'), T('fun4')]];
    LOG.forEach(function (x) {
      aoa.push([fmtDate(new Date(x.at)), fmtT(x.at), x.total, x.fresh || 0, x.delta || 0,
        x.riyadh, x.saudi, x.cv, x.withSt]);
    });
    var ws = XLSX.utils.aoa_to_sheet(aoa);
    ws['!cols'] = [{ wch: 18 }, { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 9 }, { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 12 }];
    var wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Refresh log');
    XLSX.writeFile(wb, 'AlRamsat-refresh-log.xlsx');
    toast(T('logExport') + ' \u2713');
  }

  /* ================= نسخة احتياطية كاملة (تصدير / استيراد) ================= */
  var BK_MARK = 'AL-RAMSAT-BACKUP';
  var REC_COLS = ['t', 'n', 'ne', 'e', 'h', 'g', 'nt', 'ar', 'ry', 'dm', 'p', 'pos', 'subs',
    'x', 'a', 'cp', 'co', 'emp', 'sc', 'se', 'cv', 'ed', 'ct', 'tr', 'cr', 'st'];

  function exportWs() {
    if (!DATA.length) { toast(T('srcNone')); return; }
    var wb = XLSX.utils.book_new();

    /* 1) معلومات — علامة التعرّف */
    var info = [['marker', BK_MARK], ['version', APP_VERSION], ['exportedAt', new Date().toISOString()],
      ['records', DATA.length], ['statuses', Object.keys(OVERRIDES).length], ['sheet', SHEET_URL]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(info), T('shInfo'));

    /* 2) المرشحون — البيانات كاملة */
    var rec = [REC_COLS];
    for (var i = 0; i < DATA.length; i++) {
      var r = DATA[i], line = [];
      for (var c = 0; c < REC_COLS.length; c++) {
        var k = REC_COLS[c], v = r[k];
        if (k === 'pos' || k === 'cr') v = (v || []).join(' || ');
        line.push(v == null ? '' : v);
      }
      rec.push(line);
    }
    var wsRec = XLSX.utils.aoa_to_sheet(rec);
    wsRec['!cols'] = REC_COLS.map(function () { return { wch: 14 }; });
    XLSX.utils.book_append_sheet(wb, wsRec, T('shCands'));

    /* 3) الحالات — قابلة للقراءة والتعديل يدويًا */
    var stAoa = [[T('cName'), T('drEmail'), T('drPhone'), T('cStat'), 'key']];
    var byKey = {};
    for (var q = 0; q < DATA.length; q++) byKey[DATA[q].key] = DATA[q];
    for (var k2 in OVERRIDES) {
      var rr = byKey[k2] || {};
      stAoa.push([rr.n || '', rr.e || '', rr.h || '', OVERRIDES[k2], k2]);
    }
    var wsSt = XLSX.utils.aoa_to_sheet(stAoa);
    wsSt['!cols'] = [{ wch: 30 }, { wch: 26 }, { wch: 14 }, { wch: 14 }, { wch: 30 }];
    XLSX.utils.book_append_sheet(wb, wsSt, T('shStatus'));

    /* 4) السجل */
    var lg = [['at', 'total', 'fresh', 'delta', 'riyadh', 'saudi', 'cv', 'withSt', 'dupes', 'unread', 'maxT', 'roles']];
    LOG.forEach(function (x) {
      lg.push([x.at, x.total, x.fresh || 0, x.delta || 0, x.riyadh, x.saudi, x.cv, x.withSt,
        x.dupes, x.unread, x.maxT, JSON.stringify(x.roles || {})]);
    });
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(lg), T('shLog'));

    /* 5) الإعدادات */
    var st = [['key', 'value'],
      ['filters', JSON.stringify(F)], ['eng', JSON.stringify(ENG)], ['view', VIEW],
      ['sheet', SHEET_URL], ['theme', document.documentElement.getAttribute('data-theme')],
      ['lang', LANG], ['report', JSON.stringify(META.report || null)],
      ['lastSync', LAST_SYNC ? LAST_SYNC.getTime() : ''], ['lastRun', JSON.stringify(LAST_RUN || null)]];
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(st), T('shSet'));

    var d = new Date();
    var stamp = d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
    XLSX.writeFile(wb, 'AlRamsat-Backup-' + stamp + '.xlsx', { compression: true });
    toast(T('bkDone'));
  }

  function sheetAoa(wb, name) {
    var ws = wb.Sheets[name];
    if (!ws) {
      for (var i = 0; i < wb.SheetNames.length; i++) {
        if (String(wb.SheetNames[i]).trim() === String(name).trim()) { ws = wb.Sheets[wb.SheetNames[i]]; break; }
      }
    }
    return ws ? XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null }) : null;
  }
  function isBackup(wb) {
    var a = sheetAoa(wb, T('shInfo')) || sheetAoa(wb, 'Info') || sheetAoa(wb, 'معلومات');
    if (!a) return false;
    for (var i = 0; i < Math.min(4, a.length); i++) {
      if (a[i] && String(a[i][1]) === BK_MARK) return true;
    }
    return false;
  }
  function importWs(wb) {
    EPOCH++;                                   /* ألغِ أي مزامنة جارية */
    var recA = sheetAoa(wb, T('shCands')) || sheetAoa(wb, 'المرشحون') || sheetAoa(wb, 'Candidates');
    var stA = sheetAoa(wb, T('shStatus')) || sheetAoa(wb, 'الحالات') || sheetAoa(wb, 'Statuses');
    var lgA = sheetAoa(wb, T('shLog')) || sheetAoa(wb, 'السجل') || sheetAoa(wb, 'Log');
    var seA = sheetAoa(wb, T('shSet')) || sheetAoa(wb, 'الإعدادات') || sheetAoa(wb, 'Settings');

    /* الإعدادات */
    var set = {};
    if (seA) for (var i = 1; i < seA.length; i++) if (seA[i] && seA[i][0] != null) set[String(seA[i][0])] = seA[i][1];
    function pj(v, d) { try { return v == null || v === '' ? d : JSON.parse(v); } catch (e) { return d; } }

    /* المرشحون */
    var recs = null;
    if (recA && recA.length > 1) {
      var head = recA[0].map(function (x) { return String(x == null ? '' : x); });
      recs = [];
      for (var r = 1; r < recA.length; r++) {
        var row = recA[r]; if (!row) continue;
        var o = {};
        for (var c = 0; c < head.length; c++) {
          var k = head[c], v = row[c];
          if (v === '' || v === undefined) v = null;
          if (k === 'pos' || k === 'cr') o[k] = v ? String(v).split(' || ').filter(Boolean) : [];
          else if (['t', 'g', 'ar', 'ry', 'dm', 'subs', 'x', 'a', 'emp', 'sc', 'se'].indexOf(k) >= 0) o[k] = (v == null ? null : +v);
          else o[k] = v == null ? '' : String(v);
        }
        if (o.n || o.e) recs.push(o);
      }
      if (!recs.length) recs = null;
    }

    /* الحالات — تُجمع أولًا ثم تُطابَق بعد تحميل المرشحين */
    var stList = [];
    if (stA) for (var s = 1; s < stA.length; s++) {
      var line = stA[s]; if (!line) continue;
      var val = line[3] ? String(line[3]).trim() : '';
      if (!val || STATUSES.indexOf(val) < 0) continue;
      stList.push({ n: line[0] ? String(line[0]) : '', e: line[1] ? String(line[1]) : '',
        h: line[2] ? String(line[2]) : '', key: line[4] ? String(line[4]) : '', v: val });
    }

    /* السجل */
    if (lgA && lgA.length > 1) {
      var out = [];
      for (var l = 1; l < lgA.length; l++) {
        var x = lgA[l]; if (!x || x[0] == null) continue;
        out.push({ at: +x[0], total: +x[1] || 0, fresh: +x[2] || 0, delta: +x[3] || 0,
          riyadh: +x[4] || 0, saudi: +x[5] || 0, cv: +x[6] || 0, withSt: +x[7] || 0,
          dupes: +x[8] || 0, unread: +x[9] || 0, maxT: +x[10] || 0, roles: pj(x[11], {}), grew: [] });
      }
      if (out.length) { LOG = out.slice(0, Store.LOG_MAX); Store.clearLog(); LOG.slice().reverse().forEach(Store.pushSnapshot); LOG = Store.readLog(); }
    }

    if (set.filters) F = pj(set.filters, F);
    var en = pj(set.eng, null); if (en && en.w && en.w.length === 8) ENG = en;
    if (set.sheet) SHEET_URL = String(set.sheet);
    if (set.view != null && set.view !== '') VIEW = Math.max(0, Math.min(4, +set.view || 0));
    if (set.theme) setTheme(String(set.theme));
    if (set.lang != null && set.lang !== '') LANG = +set.lang ? 1 : 0;
    LAST_RUN = pj(set.lastRun, null);
    LAST_SYNC = set.lastSync ? new Date(+set.lastSync) : null;

    if (recs) {
      prep(recs, pj(set.report, null), Date.now(), 'saved');
      WS_AT = new Date();
    }
    /* مطابقة الحالات: المفتاح، ثم البريد، ثم الجوال، ثم الاسم */
    var byK = {}, byE = {}, byP = {}, byN = {};
    for (var z = 0; z < DATA.length; z++) {
      var rz = DATA[z];
      byK[rz.key] = rz.key;
      var ez = nEmail(rz.e); if (ez && !byE[ez]) byE[ez] = rz.key;
      var pz = nPhone(rz.h); if (pz && !byP[pz]) byP[pz] = rz.key;
      var nz = nName(rz.n); if (nz && !byN[nz]) byN[nz] = rz.key;
    }
    var ov = {}, matched = 0;
    for (var t2 = 0; t2 < stList.length; t2++) {
      var it = stList[t2];
      var k = (it.key && byK[it.key]) || byE[nEmail(it.e)] || byP[nPhone(it.h)] || byN[nName(it.n)] || '';
      if (k) { ov[k] = it.v; matched++; }
      else if (it.key) ov[it.key] = it.v;      /* نحتفظ به لعلّه يطابق بعد التحديث القادم */
    }
    OVERRIDES = ov; OVERRIDES_H = null;    /* النسخة الاحتياطية تُلغي أي حالات معلّقة */
    var nSt = stList.length;
    paintStatic();
    buildFilters();
    $('#fPos').value = F.pos; $('#fNat').value = F.nat; $('#fExp').value = F.exp;
    $('#fRes').value = F.res; $('#fSal').value = F.sal; $('#fSt').value = F.st; $('#fPer').value = F.per;
    $('#fQ').value = F.q || '';
    syncQnav(); setDirty(true); render();
    toast(recs ? T('bkIn', { n: nf(DATA.length), s: nf(matched) }) : T('bkInPart', { s: nf(nSt) }));
    closeUpd();
  }

  /* ================= toast ================= */
  var tt;
  function toast(msg) {
    var el = $('#toast'); el.textContent = msg; el.classList.add('on');
    clearTimeout(tt); tt = setTimeout(function () { el.classList.remove('on'); }, 2600);
  }

  /* ================= persistence ================= */
  var DB = 'hr-dash', STORE = 'kv';
  function idb() {
    return new Promise(function (res, rej) {
      var q = indexedDB.open(DB, 1);
      q.onupgradeneeded = function () { q.result.createObjectStore(STORE); };
      q.onsuccess = function () { res(q.result); };
      q.onerror = function () { rej(q.error); };
    });
  }
  function idbSet(k, v) {
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction(STORE, 'readwrite');
        tx.objectStore(STORE).put(v, k);
        tx.oncomplete = function () { res(); }; tx.onerror = function () { rej(tx.error); };
      });
    });
  }
  function idbGet(k) {
    return idb().then(function (db) {
      return new Promise(function (res, rej) {
        var tx = db.transaction(STORE, 'readonly');
        var q = tx.objectStore(STORE).get(k);
        q.onsuccess = function () { res(q.result); }; q.onerror = function () { rej(q.error); };
      });
    });
  }
  function lsGet(k, d) { try { var v = localStorage.getItem(k); return v == null ? d : JSON.parse(v); } catch (e) { return d; } }
  function lsSet(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } }

  /* ================= data prep ================= */
  /* الهوية = البريد الموحّد، وإلا الجوال الموحّد، وإلا الاسم.
     ثابتة عبر عمليات التحديث لأنها لا تعتمد على ترتيب الصفوف. */
  function nEmail(v) { return HRETL.normEmail ? HRETL.normEmail(v) : String(v || '').trim().toLowerCase(); }
  function nPhone(v) { return HRETL.normPhone ? HRETL.normPhone(v) : String(v || '').replace(/\D/g, ''); }
  function nName(v) { return String(v || '').replace(/\s+/g, ' ').trim(); }
  function idKey(r) {
    var e = nEmail(r.e); if (e) return 'e:' + e;
    var p = nPhone(r.h); if (p) return 'p:' + p;
    return 'n:' + nName(r.n);
  }

  /* بصمة غير عكسية لمفتاح الهوية (FNV-1a مزدوج، 64 بت).
     سبب وجودها: مفتاح الهوية هو بريد المرشح أو جواله. ما يُرفع إلى التخزين
     المشترك يُرفع مبصومًا، فلا تغادر بيانات المرشحين الشخصية المتصفح إطلاقًا،
     ومع ذلك تتطابق الحالات على أي جهاز لأن كل جهاز يحسب البصمة نفسها. */
  function hk(str) {
    var s = String(str || ''), h1 = 0x811c9dc5, h2 = 0x01000193;
    for (var i = 0; i < s.length; i++) {
      var c = s.charCodeAt(i);
      h1 ^= c; h1 = (h1 * 0x01000193) >>> 0;
      h2 = (h2 + c) >>> 0; h2 = (h2 * 0x85ebca6b) >>> 0; h2 ^= h2 >>> 13;
    }
    return ('00000000' + h1.toString(16)).slice(-8) + ('00000000' + (h2 >>> 0).toString(16)).slice(-8);
  }
  function hashOv(ov) { var o = {}; for (var k in ov) o[hk(k)] = ov[k]; return o; }
  /* حلّ البصمات إلى مفاتيح حقيقية بعد توفّر السجلات */
  function resolveOv() {
    if (!OVERRIDES_H || !DATA.length) return;
    var n = 0;
    for (var i = 0; i < DATA.length; i++) {
      var v = OVERRIDES_H[hk(DATA[i].key)];
      if (v) { OVERRIDES[DATA[i].key] = v; n++; }
    }
    if (n || DATA.length) OVERRIDES_H = null;
  }
  function prep(records, report, at, src) {
    for (var i = 0; i < records.length; i++) {
      var r = records[i];
      /* توحيد وحدة الزمن: الرفع يعطي ميلي ثانية، والبيانات المضغوطة تعطي رقم اليوم */
      if (r.t != null && r.t > 1e6) r.t = Math.floor(r.t / DAY);
      /* مفتاح هوية ثابت لا يتغيّر بين التحديثات — وإلا ضاعت حالات الفرز عند كل سحب */
      r.key = idKey(r);
      if (!r.cr) r.cr = [];
      if (!r.subs) r.subs = 1;
      if (!r.pos || !r.pos.length) r.pos = [r.p];
    }
    DATA = records;
    resolveOv();                         /* حالات مشتركة مبصومة → مفاتيح حقيقية */
    META = { src: src || 'embedded', at: at || null, report: report || null };
    var ds = records.map(function (r) { return r.t; }).filter(function (v) { return v > 0; });
    MAXDATE = ds.length ? new Date(Math.max.apply(null, ds) * DAY) : new Date();
    buildFilters();
    $('#asofD').textContent = DATA.length ? fmtDate(MAXDATE) : T('noData');
  }
  function unpack(p) {
    var d = p.d, out = [];
    for (var i = 0; i < p.r.length; i++) {
      var a = p.r[i];
      out.push({
        t: a[0], n: a[1], e: a[2], h: a[3], g: a[4], nt: d.nt[a[5]], ar: a[6], ry: a[7], dm: a[8], emp: a[9],
        p: d.p[a[10]], x: a[11] < 0 ? null : a[11], a: a[12] < 0 ? null : a[12], cp: a[13], co: a[14],
        sc: a[15] < 0 ? null : a[15], se: a[16] < 0 ? null : a[16], cv: a[17], ed: d.ed[a[18]], ct: d.ct[a[19]],
        tr: a[20], cr: (a[21] || []).map(function (j) { return d.cr[j]; }), st: d.st[a[22]],
        pos: a[23] ? a[23].map(function (j) { return d.p[j]; }) : null,
        subs: a[24] || 1
      });
    }
    return out;
  }

  /* ================= filters UI ================= */
  function buildFilters() {
    var pos = toPairs(countBy(DATA, function (r) { return r.p; }));
    var nat = toPairs(countBy(DATA, function (r) { return r.nt; }));
    $('#fPos').innerHTML = '<option value="">' + T('allRoles') + ' (' + pos.length + ')</option>' +
      pos.map(function (p) { return '<option value="' + esc(p[0]) + '">' + esc(p[0].slice(0, 44)) + ' (' + p[1] + ')</option>'; }).join('');
    $('#fNat').innerHTML = '<option value="">' + T('all') + '</option>' +
      nat.map(function (p) { return '<option value="' + esc(p[0]) + '">' + esc(p[0]) + ' (' + p[1] + ')</option>'; }).join('');
    $('#fExp').innerHTML = '<option value="">' + T('all') + '</option>' +
      EXP_BANDS.map(function (v) { return '<option value="' + v[0] + '">' + v[1] + '</option>'; }).join('');
    $('#fRes').innerHTML = '<option value="">' + T('all') + '</option><option value="riy">' + T('riyIn') +
      '</option><option value="out">' + T('riyOut') + '</option><option value="dam">' + T('dam') + '</option>';
    $('#fSal').innerHTML = '<option value="">' + T('all') + '</option>' +
      SAL_BANDS.map(function (v) { return '<option value="' + v[0] + '">' + v[1] + '</option>'; }).join('');
    $('#fSt').innerHTML = '<option value="">' + T('all') + '</option>' +
      STATUSES.map(function (s) { return '<option value="' + esc(s) + '">' + esc(stName(s)) + '</option>'; }).join('');
    $('#fPer').innerHTML = '<option value="">' + T('perAll') + '</option>' +
      '<option value="1">' + T('per1') + '</option>' +
      '<option value="3">' + T('per3') + '</option>' +
      '<option value="6">' + T('per6') + '</option>' +
      '<option value="12">' + T('per12') + '</option>';
    $('#fPer').title = T('perRef', { d: fmtDate(TODAY) });
    $('#lPer').title = $('#fPer').title;
    /* restore */
    $('#fPos').value = F.pos; $('#fNat').value = F.nat; $('#fExp').value = F.exp;
    $('#fRes').value = F.res; $('#fSal').value = F.sal; $('#fSt').value = F.st; $('#fPer').value = F.per;
  }

  /* ================= i18n paint ================= */
  function paintStatic() {
    document.documentElement.lang = LANG ? 'en' : 'ar';
    document.documentElement.dir = LANG ? 'ltr' : 'rtl';
    $('#bOrg').textContent = T('org'); $('#bTtl').textContent = T('title');
    $('#ftSector').textContent = T('ftSector');
    $('#ftNote').textContent = T('privNote');
    $('#ftVer').textContent = T('ver') + ' ' + APP_VERSION;
    $('#clearBtn').textContent = T('clearAll');
    $('#bkExport').textContent = T('bkExport');
    $('#fbTitle').textContent = T('fbTitle');
    $('#asofL').textContent = T('dataAsOf');
    $('#asofD').textContent = DATA.length ? fmtDate(MAXDATE) : T('noData');
    $('#ebT').textContent = T('ebT'); $('#ebS').textContent = T('ebS'); $('#ebBtn').textContent = T('ebBtn');
    $$('.tab').forEach(function (b, i) { b.textContent = T('t' + i); });
    var qn = [['', 'qAll'], ['eng', 'qEng'], ['fin', 'qFin'], ['ops', 'qOps'], ['riy', 'qRiy'], ['sa', 'qSa']];
    $('#qnav').innerHTML = qn.map(function (q) {
      return '<button class="q" data-q="' + q[0] + '">' + T(q[1]) + '</button>';
    }).join('');
    syncQnav();
    var labs = { lSearch: 'fSearch', lPos: 'fPos', lNat: 'fNat', lExp: 'fExp', lRes: 'fRes', lSal: 'fSal', lSt: 'fSt', lPer: 'fPer' };
    for (var k in labs) $('#' + k).textContent = T(labs[k]);
    $('#fQ').placeholder = T('phSearch');
    $('#rstBtn').title = T('reset');
    for (var i = 0; i < 5; i++) { $('#secT' + i).textContent = T('t' + i); $('#secD' + i).textContent = T('d' + i); }
    $('#lEngRole').textContent = T('engRole');
    $('#lEngTh').textContent = T('engTh');
    $('#wTitle').innerHTML = T('wT') + '<span class="tag g">' + T('wTag') + '</span>';
    $('#wCap').textContent = T('wCap');
    $('#updT').textContent = T('updT'); $('#updS').textContent = T('updS');
    $('#dropT').textContent = T('dropT'); $('#dropD').textContent = T('dropD');
    $('#lSheet').textContent = T('lSheet');
    $('#sheetHint').textContent = T('sheetHint');
    $('#fbTitle').textContent = T('fbTitle');
    $('#syncNow').textContent = SYNCING ? T('syncing') : T('syncNow');
    $('#syncBtn').title = T('syncTip'); $('#updBtn').title = T('srcTip');
    $('#saveBtn').title = T('saveTip');
    $('#ebBtn').textContent = T('ebBtn');
    $('#updOk').textContent = T('updOk'); $('#updCancel').textContent = T('cancel');
    $('#mExport').innerHTML = SVG.xls + T('exportX');
    $('#mSortL').textContent = T('sortBy');
    $('#mfStL').textContent = T('fSt'); $('#mfNatL').textContent = T('fNat');
    $('#mfExpL').textContent = T('fExp'); $('#mfSalL').textContent = T('cSalExp');
    $('#mfReset').innerHTML = SVG.rst; $('#mfReset').title = T('mfResetT');
    $('#mSort').innerHTML = '<option value="t">' + T('sortNew') + '</option><option value="x">' + T('sortExp') +
      '</option><option value="se">' + T('sortSal') + '</option><option value="n">' + T('sortName') + '</option>';
    buildFilters();
    paintCloud(); paintCloudBar();
  }
  function syncQnav() {
    $$('#qnav .q').forEach(function (b) {
      var v = b.dataset.q;
      var on = (v === '' && !F.fam && !F.res && !F.nat) || (v === 'riy' && F.res === 'riy') ||
        (v === 'sa' && F.nat === 'سعودي') || (v && v !== 'riy' && v !== 'sa' && F.fam === v);
      b.classList.toggle('on', on);
    });
  }

  /* ================= upload ================= */
  function openUpd() {
    PENDING = null;
    if (!$('#updSrc')) {
      var sd = document.createElement('div');
      sd.id = 'updSrc'; sd.className = 'updsrc none';
      $('#drop').parentNode.insertBefore(sd, $('#drop'));
    }
    $('#updSteps').innerHTML = '';
    $('#updOk').disabled = true; $('#updOk').style.opacity = .45;
    $('#updNote').innerHTML = T('autoSave');
    $('#clearBtn').style.display = DATA.length ? '' : 'none';
    $('#sheetUrl').value = SHEET_URL;
    var sb = $('#updSrc');
    if (!DATA.length) sb.className = 'updsrc none', sb.textContent = T('srcNone');
    else sb.className = 'updsrc has', sb.textContent = T('srcSaved', { n: nf(DATA.length) }) +
      (LAST_SYNC ? ' · ' + T('syncAt', { t: LAST_SYNC.toLocaleTimeString(LANG ? 'en-GB' : 'ar-SA', { hour: '2-digit', minute: '2-digit' }) }) : '');
    $('#updOv').classList.add('on'); document.body.style.overflow = 'hidden';
  }
  function closeUpd() { $('#updOv').classList.remove('on'); document.body.style.overflow = ''; }
  function step(ok, title, sub, prog) {
    return '<div class="step"><span class="sn' + (ok === 2 ? ' err' : ok ? '' : ' wait') + '">' + (ok === 1 ? SVG.chk : (ok === 2 ? '!' : '·')) + '</span>' +
      '<span style="flex:1"><span class="sx">' + title + '</span><span class="sy">' + sub + '</span>' +
      (prog != null ? '<span class="prog"><i style="width:' + prog + '%"></i></span>' : '') + '</span></div>';
  }
  function handleFile(file) {
    if (!file) return;
    $('#updSteps').innerHTML = step(0, T('reading'), esc(file.name), 15);
    var fr = new FileReader();
    fr.onload = function () {
      setTimeout(function () {
        try {
          var wb = XLSX.read(new Uint8Array(fr.result), { type: 'array', cellDates: true });
          if (isBackup(wb)) {
            $('#updSteps').innerHTML = step(1, T('bkDetect'), esc(file.name));
            setTimeout(function () { importWs(wb); }, 200);
            return;
          }
          var out = HRETL.run(wb);
          var rep = out.report;
          if (!out.records.length) throw new Error('empty');
          var nNat = Object.keys(countBy(out.records, function (r) { return r.nt; })).length;
          var nPos = Object.keys(countBy(out.records, function (r) { return r.p; })).length;
          PENDING = out;
          $('#updSteps').innerHTML =
            step(1, T('st1'), rep.sheets.join(' · ') + (rep.warnings.length ? ' — ' + rep.warnings.join(' ') : '')) +
            step(1, T('st2'), T('st2d', { r: nf(rep.dict), f: nf(rep.natForms), u: nNat })) +
            step(1, T('st3'), T('st3d', { n: nf(rep.dupes), m: nf(rep.merged || 0) })) +
            step(1, T('st4'), T('st4d', { n: nf(rep.kept), p: nPos, c: nf(rep.certLabels || 0) }), 100);
          $('#updOk').disabled = false; $('#updOk').style.opacity = 1;
        } catch (err) {
          PENDING = null;
          $('#updSteps').innerHTML = step(2, T('updErr'), esc(String(err && err.message ? err.message : err)));
          $('#updOk').disabled = true; $('#updOk').style.opacity = .45;
        }
      }, 120);
    };
    fr.readAsArrayBuffer(file);
  }
  function applyUpd() {
    if (!PENDING) return;
    var prevU = LOG.length ? LOG[0] : null;
    var snapU = snapshotOf(PENDING.records, PENDING.report);
    snapU.fresh = prevU ? PENDING.records.filter(function (r) { return r.t > prevU.maxT; }).length : 0;
    snapU.delta = prevU ? (snapU.total - prevU.total) : 0;
    snapU.grew = [];
    LOG = Store.pushSnapshot(snapU);
    LAST_RUN = { prev: prevU, snap: snapU };
    prep(PENDING.records, PENDING.report, Date.now(), 'upload');
    setDirty(true);
    toast(T('updDone', { n: nf(DATA.length) }));
    PENDING = null; closeUpd(); render();
  }

  /* ================= الحفظ والاستعادة ================= */
  function setDirty(v) {
    DIRTY = !!v;
    var b = $('#saveBtn'); if (b) b.classList.toggle('dirty', DIRTY);
  }
  function snapshotOf(rows, rep) {
    var s = stats(rows);
    var roles = countBy(rows, function (r) { return r.p; });
    var maxT = 0;
    for (var i = 0; i < rows.length; i++) if (rows[i].t > maxT) maxT = rows[i].t;
    return {
      at: Date.now(), total: rows.length, riyadh: s.riy, saudi: s.saudi, cv: s.cv,
      withSt: s.withSt, dupes: (rep && rep.dupes) || 0,
      unread: rows.length - s.se.length, maxT: maxT, roles: roles
    };
  }
  function saveWs(opts) {
    if (!DATA.length) { toast(T('srcNone')); return Promise.resolve(false); }
    if (SAVING) return Promise.resolve(false);
    var ws = {
      v: APP_VERSION, at: Date.now(), records: DATA, report: META.report,
      overrides: hashOv(OVERRIDES), ovh: 1,
      filters: F, view: VIEW, eng: ENG, sheet: SHEET_URL,
      lastRun: LAST_RUN, lastSync: LAST_SYNC ? LAST_SYNC.getTime() : null,
      log: LOG
    };
    SAVING = true; paintCloud('saving');
    var sb = $('#saveBtn'); if (sb) { sb.disabled = true; sb.classList.add('spin'); }
    function done() { SAVING = false; if (sb) { sb.disabled = false; sb.classList.remove('spin'); } }
    return Store.saveWorkspace(ws, opts).then(function (res) {
      /* لا نعرض رسالة النجاح إلا بعد تأكيد الكتابة على الخادم */
      done();
      WS_AT = new Date(ws.at); setDirty(false);
      NEWER = null; paintCloudBar();
      var b = $('#saveBtn'); b.classList.add('ok');
      setTimeout(function () { b.classList.remove('ok'); }, 900);
      paintCloud();
      toast(res && res.cloud ? T('saveCloud', { v: res.version }) : T('saved'));
      return true;
    }).catch(function (e) {
      done(); paintCloud();
      var k = e && e.kind;
      if (k === 'conflict') {
        toast(T('saveConflict'));
        Store.cloudVersion().then(function (s) { showNewer(s); }, function () { });
      } else if (k === 'offline' || k === 'write') {
        toast(T('saveOffline'));
      } else {
        toast(T('saveFail'));
      }
      return false;
    });
  }

  /* ================= التخزين المشترك — مؤشّر الحالة وشريط النسخة الأحدث ================= */
  function paintCloud(state) {
    var el = $('#cloudPill'); if (!el) return;
    var st = Store.status ? Store.status() : { configured: false };
    el.hidden = false;
    el.classList.remove('on', 'warn', 'off');
    if (state === 'saving') { el.classList.add('warn'); $('#cloudTxt').textContent = T('cloudSaving'); el.title = ''; return; }
    if (!st.configured) {
      el.classList.add('off'); $('#cloudTxt').textContent = T('cloudOff'); el.title = T('cloudOffT'); return;
    }
    if (st.last && st.last.cloudOk) {
      el.classList.add('on'); $('#cloudTxt').textContent = T('cloudOn');
      el.title = T('cloudOnT', { v: st.srv.version || 0, u: st.srv.updatedBy || '—' });
    } else {
      el.classList.add('warn'); $('#cloudTxt').textContent = T('cloudLocal'); el.title = T('cloudLocalT');
    }
  }
  function showNewer(info) {
    if (!info || !info.version) return;
    if (info.version <= (Store.server() || {}).version) return;
    NEWER = info; paintCloudBar();
  }
  function paintCloudBar() {
    var bar = $('#cloudBar'); if (!bar) return;
    if (!NEWER) { bar.hidden = true; return; }
    bar.hidden = false;
    $('#cbT').textContent = T('newerT');
    $('#cbS').textContent = T('newerS', { u: NEWER.updatedBy || '—', v: NEWER.version });
    $('#cbBtn').textContent = T('loadLatest');
    $('#cbX').textContent = T('later');
  }
  /* تحميل أحدث نسخة — بطلب صريح فقط، لا استبدال تلقائي */
  function loadLatest() {
    if (DIRTY && !window.confirm(T('discardAsk'))) return;   /* لا نستبدل عملًا غير محفوظ بلا إذن */
    NEWER = null; paintCloudBar();
    Store.loadWorkspace().then(function (ws) {
      if (!ws) { paintCloud(); return; }
      applyShared(ws, true);
    }).catch(function () { toast(T('saveOffline')); });
  }

  /* ================= Google Sheet sync ================= */
  function stepRow(state, title, sub) {
    return '<div class="step"><span class="sn' + (state === 2 ? ' err' : state === 1 ? '' : ' wait') + '">' +
      (state === 1 ? SVG.chk : (state === 2 ? '!' : '·')) + '</span>' +
      '<span style="flex:1"><span class="sx">' + title + '</span><span class="sy">' + (sub || '') + '</span></span></div>';
  }
  function setSyncing(on) {
    SYNCING = on;
    var b = $('#syncBtn');
    b.classList.toggle('spin', on); b.disabled = on;
    var n = $('#syncNow'); if (n) { n.disabled = on; n.textContent = on ? T('syncing') : T('syncNow'); }
  }
  function sync(silent) {
    if (SYNCING) return Promise.resolve();
    var url = ($('#sheetUrl') && $('#sheetUrl').value.trim()) || SHEET_URL;
    if (!GSheet.sheetIdOf(url)) {
      if (!silent) { openUpd(); $('#updSteps').innerHTML = stepRow(2, T('errUrl'), ''); }
      return Promise.resolve();
    }
    SHEET_URL = url; lsSet('sheetUrl', { url: url, def: window.__SHEET__ || '' });
    var myEpoch = EPOCH;
    setSyncing(true);
    var log = '';
    function paint(html) { var el = $('#updSteps'); if (el) el.innerHTML = html; }
    paint(stepRow(0, T('stConnect'), ''));

    var probeLog = '';
    return GSheet.load(url, function (phase, info) {
      if (phase === 'probe' && info && info.scanned && info.scanned.length) {
        probeLog = stepRow(1, T('stProbe'), T('stProbeD', { list: esc(info.scanned.join(' · ')) }));
        paint(probeLog + stepRow(0, T('stMain'), ''));
      } else if (phase === 'main') {
        log = probeLog + stepRow(1, T('stMain'), T('stMainD', { n: nf(info.rows), s: esc(info.main) }));
        paint(log + stepRow(0, T('stDict'), ''));
      }
    }).then(function (out) {
      if (myEpoch !== EPOCH) { setSyncing(false); return; }   /* أُلغيت — حدث استيراد أثناء السحب */
      var res = HRETL.run(out.wb);
      var rep = res.report;
      if (!res.records.length) throw new Error('empty');
      log += out.info.dict
        ? stepRow(1, T('stDict'), T('stDictOk', { s: esc(out.info.dict), r: nf(rep.dict) }))
        : stepRow(2, T('stDict'), T('stDictNo', { r: nf(rep.dict) }));
      var nNat = Object.keys(countBy(res.records, function (r) { return r.nt; })).length;
      var nPos = Object.keys(countBy(res.records, function (r) { return r.p; })).length;
      log += stepRow(1, T('st2'), T('st2d', { r: nf(rep.dict), f: nf(rep.natForms), u: nNat })) +
        stepRow(1, T('st3'), T('st3d', { n: nf(rep.dupes), m: nf(rep.merged || 0) })) +
        stepRow(1, T('st4'), T('st4d', { n: nf(rep.kept), p: nPos, c: nf(rep.certLabels || 0) }));
      paint(log);
      var prev = LOG.length ? LOG[0] : null;
      var snap = snapshotOf(res.records, rep);
      /* طلبات جديدة فعليًا = تواريخها أحدث من آخر لقطة */
      snap.fresh = prev ? res.records.filter(function (r) { return r.t * DAY > prev.maxT * DAY; }).length : 0;
      snap.delta = prev ? (snap.total - prev.total) : 0;
      snap.grew = [];
      if (prev && prev.roles) {
        var g = [];
        for (var k in snap.roles) {
          var d = snap.roles[k] - (prev.roles[k] || 0);
          if (d > 0) g.push([k, d]);
        }
        g.sort(function (a, b) { return b[1] - a[1]; });
        snap.grew = g.slice(0, 3);
      }
      LOG = Store.pushSnapshot(snap);
      LAST_RUN = { prev: prev, snap: snap };
      prep(res.records, rep, Date.now(), 'sheet');
      LAST_SYNC = new Date();
      setDirty(true);
      setSyncing(false);
      render();
      toast(T('syncOk', { n: nf(DATA.length) }));
      if (!silent) setTimeout(closeUpd, 900);
    }).catch(function (e) {
      setSyncing(false);
      if (myEpoch !== EPOCH) return;
      var msg = (e && e.message) === 'bad-url' ? T('errUrl')
        : ((e && (e.message === 'not-responses' || e.message === 'empty')) ? T('errShape') : T('errNet'));
      openUpd();                                   /* افتح أولًا — openUpd يمسح الخطوات */
      paint(log + stepRow(2, msg, esc(String((e && e.message) || '').slice(0, 120))));
      render();
    });
  }

  /* ================= events ================= */
  function bindActs() {
    document.addEventListener('click', function (ev) {
      var el = ev.target.closest('[data-act]');
      if (!el) return;
      var a = el.dataset.act, v = el.dataset.v || '';
      if (a === 'cand') { openCand(v); return; }
      if (a === 'goto1') { VIEW = 1; render(); scrollTop(); return; }
      if (a === 'goto3') { VIEW = 3; render(); scrollTop(); return; }
      if (a === 'pos') { openList(ROWS.filter(function (r) { return r.p === v; }), v, T('mFiltered') + ' ' + T('fPos')); return; }
      if (a === 'nat') { openList(ROWS.filter(function (r) { return r.nt === v; }), v, T('mFiltered') + ' ' + T('fNat')); return; }
      if (a === 'res') { openList(ROWS.filter(function (r) { return r.ry; }), T('riyIn'), T('mFiltered') + ' ' + T('fRes')); return; }
      if (a === 'exp') {
        var p = v.split('-');
        openList(ROWS.filter(function (r) { return r.x != null && r.x >= +p[0] && (p[1] === '' || r.x < +p[1]); }),
          T('fExp') + ' ' + v.replace('-', '–'), ''); return;
      }
      if (a === 'sal') {
        var q = v.split('-');
        openList(ROWS.filter(function (r) { return r.se != null && r.se >= +q[0] && (q[1] === '' || r.se < +q[1]); }),
          T('fSal') + ' ' + v.replace('-', '–'), ''); return;
      }
      if (a === 'cert') { openList(ROWS.filter(function (r) { return (r.cr || []).indexOf(v) >= 0; }), v, T('certT')); return; }
      if (a === 'fem') { openList(ROWS.filter(function (r) { return r.g === 2; }), T('k2d'), ''); return; }
      if (a === 'hasCv') { openList(ROWS.filter(function (r) { return !!r.cv; }), T('fun3'), ''); return; }
      if (a === 'hasSt') { openList(ROWS.filter(function (r) { return statusOf(r) !== 'جديد'; }), T('fun4'), ''); return; }
      if (a === 'all') { openList(ROWS.slice(), T('mAll'), ''); return; }
    });
  }
  function scrollTop() { window.scrollTo({ top: 0, behavior: 'smooth' }); }

  function bind() {
    $$('.tab').forEach(function (b, i) { b.addEventListener('click', function () { VIEW = i; render(); scrollTop(); }); });
    $('#qnav').addEventListener('click', function (e) {
      var b = e.target.closest('.q'); if (!b) return;
      var v = b.dataset.q;
      if (v === '') { F.fam = ''; F.res = ''; F.nat = ''; }
      else if (v === 'riy') { F.res = F.res === 'riy' ? '' : 'riy'; F.fam = ''; }
      else if (v === 'sa') { F.nat = F.nat === 'سعودي' ? '' : 'سعودي'; F.fam = ''; }
      else { F.fam = F.fam === v ? '' : v; }
      $('#fRes').value = F.res; $('#fNat').value = F.nat;
      syncQnav(); render();
    });
    var qt;
    $('#fQ').addEventListener('input', function (e) {
      clearTimeout(qt); var v = e.target.value;
      qt = setTimeout(function () { F.q = v; render(); }, 220);
    });
    [['fPos', 'pos'], ['fNat', 'nat'], ['fExp', 'exp'], ['fRes', 'res'], ['fSal', 'sal'], ['fSt', 'st'], ['fPer', 'per']]
      .forEach(function (p) {
        $('#' + p[0]).addEventListener('change', function (e) { F[p[1]] = e.target.value; setDirty(true); syncQnav(); render(); });
      });
    $('#rstBtn').addEventListener('click', function () {
      F = { q: '', pos: '', nat: '', exp: '', res: '', sal: '', st: '', per: '', fam: '' };
      $('#fQ').value = '';
      buildFilters(); syncQnav(); render();
    });
    $('#themeBtn').addEventListener('click', function () {
      var d = document.documentElement.getAttribute('data-theme') === 'dark';
      setTheme(d ? 'light' : 'dark'); lsSet('theme', d ? 'light' : 'dark');
    });
    $('#langBtn').addEventListener('click', function () {
      LANG = LANG ? 0 : 1; lsSet('lang', LANG); paintStatic(); render();
    });
    $('#updBtn').addEventListener('click', openUpd);
    $('#syncBtn').addEventListener('click', function () { sync(true); });
    $('#saveBtn').addEventListener('click', function () { saveWs(); });
    $('#bkExport').addEventListener('click', exportWs);
    document.addEventListener('click', function (e) { if (e.target && e.target.id === 'logExp') exportLog(); });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === 's') { e.preventDefault(); saveWs(); }
    });
    $('#ebBtn').addEventListener('click', function () { sync(true); });
    $('#cbBtn').addEventListener('click', loadLatest);
    $('#cbX').addEventListener('click', function () { NEWER = null; paintCloudBar(); });
    $('#cloudPill').addEventListener('click', function () {
      if (!Store.configured()) { openUpd(); return; }
      Store.cloudVersion().then(function (s) { showNewer(s); paintCloud(); }, function () { paintCloud(); });
    });
    $('#syncNow').addEventListener('click', function () { sync(false); });
    $('#sheetUrl').addEventListener('keydown', function (e) { if (e.key === 'Enter') sync(false); });
    $('#updClose').addEventListener('click', closeUpd);
    $('#updCancel').addEventListener('click', closeUpd);
    $('#updOk').addEventListener('click', applyUpd);
    $('#clearBtn').addEventListener('click', function () {
      if (!window.confirm(T('clearAllAsk'))) return;
      EPOCH++;
      purgeLegacy();
      Store.clearWorkspace().catch(function () { }).then(paintCloud);
      Store.clearLog();
      NEWER = null; paintCloudBar();
      LOG = []; LAST_RUN = null; WS_AT = null; setDirty(false);
      OVERRIDES = {}; OVERRIDES_H = null;
      window.__BASE__ = null;
      prep([], null, null, 'empty');
      F = { q: '', pos: '', nat: '', exp: '', res: '', sal: '', st: '', per: '', fam: '' };
      $('#fQ').value = ''; ENG.pos = '';
      buildFilters(); syncQnav(); closeUpd(); render(); toast(T('cleared'));
    });

    var drop = $('#drop'), fi = $('#fileIn');
    drop.addEventListener('click', function () { fi.click(); });
    fi.addEventListener('change', function (e) { handleFile(e.target.files[0]); e.target.value = ''; });
    ['dragenter', 'dragover'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.add('over'); });
    });
    ['dragleave', 'drop'].forEach(function (ev) {
      drop.addEventListener(ev, function (e) { e.preventDefault(); drop.classList.remove('over'); });
    });
    drop.addEventListener('drop', function (e) { handleFile(e.dataTransfer.files[0]); });

    $('#mClose').addEventListener('click', closeModal);
    $('#mOv').addEventListener('click', function (e) { if (e.target === $('#mOv')) closeModal(); });
    $('#updOv').addEventListener('click', function (e) { if (e.target === $('#updOv')) closeUpd(); });
    [['mfSt', 'st'], ['mfNat', 'nat'], ['mfExp', 'exp'], ['mfSal', 'sal']].forEach(function (p) {
      $('#' + p[0]).addEventListener('change', function (e) { MF[p[1]] = e.target.value; drawList(); });
    });
    $('#mfReset').addEventListener('click', function () {
      MF = { st: '', nat: '', exp: '', sal: '' };
      $('#mfSt').value = ''; $('#mfNat').value = ''; $('#mfExp').value = ''; $('#mfSal').value = '';
      drawList();
    });
    $('#mBody').addEventListener('change', function (e) {
      var s = e.target.closest ? e.target.closest('.stsel') : null;
      if (!s) return;
      setStatus(s.dataset.stKey, s.value);
    });
    $('#mBody').addEventListener('click', function (e) {
      if (e.target.closest && e.target.closest('.stsel')) e.stopPropagation();
    }, true);
    $('#mSort').addEventListener('change', function (e) {
      SORT = { key: e.target.value, dir: e.target.value === 'se' ? 1 : (e.target.value === 'n' ? 1 : -1) };
      drawList();
    });
    $('#mExport').addEventListener('click', function () { exportRows(modalRows(), 'candidates'); });
    $('#drClose').addEventListener('click', closeDrawer);
    $('#drwBg').addEventListener('click', closeDrawer);
    $('#drBody').addEventListener('click', function (e) {
      var b = e.target.closest('[data-st]');
      if (b && CUR) {
        $$('#stSel button').forEach(function (x) { x.classList.toggle('on', x === b); });
        setStatus(CUR.key, b.dataset.st);
        return;
      }
      if (e.target.closest('#drCopy') && CUR) {
        var r = CUR;
        var txt = [r.n, r.p, r.nt + ' · ' + (r.a || '—') + ' ' + T('drYears'),
          T('drExpY') + ': ' + (r.x == null ? '—' : r.x), T('drSalE') + ': ' + nf(r.se),
          T('drPhone') + ': ' + r.h, T('drEmail') + ': ' + r.e,
          r.cv ? 'CV: https://drive.google.com/open?id=' + r.cv : ''].filter(Boolean).join('\n');
        (navigator.clipboard ? navigator.clipboard.writeText(txt) : Promise.reject()).then(function () { toast(T('copied')); },
          function () { toast(T('copied')); });
      }
    });
    $('#engPos').addEventListener('change', function (e) { ENG.pos = e.target.value; render4(); });
    $('#engTh').addEventListener('input', function (e) {
      ENG.th = +e.target.value; $('#engThV').textContent = ENG.th;
      e.target.style.cssText = rangeFill(ENG.th, 40, 100); lsSet('th', ENG.th); render4();
    });
    $('#wPanel').addEventListener('input', function (e) {
      var i = e.target.dataset.w; if (i == null) return;
      ENG.w[+i] = +e.target.value; lsSet('weights', ENG.w); setDirty(true);
      e.target.style.cssText = rangeFill(ENG.w[+i], 0, 30);
      var wn = normW();
      $$('#wPanel .wrow').forEach(function (row, j) { row.querySelector('b').textContent = Math.round(wn[j]); });
      clearTimeout(qt); qt = setTimeout(render4, 160);
    });
    $('#wPanel').addEventListener('click', function (e) {
      if (e.target.id === 'wReset') { ENG.w = DEF_W.slice(); lsSet('weights', ENG.w); render4(); }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeDrawer(); closeModal(); closeUpd(); }
    });
    window.addEventListener('scroll', function () { $('#toTop').classList.toggle('on', window.scrollY > 420); });
    $('#toTop').addEventListener('click', scrollTop);
    bindActs();
  }
  function setTheme(t) {
    document.documentElement.setAttribute('data-theme', t);
    $('#themeBtn').innerHTML = t === 'dark' ? SVG.sun : SVG.moon;
    paintLogos(t);
  }
  function paintLogos(t) {
    var LG = window.__LOGO__ || {};
    var src = 'data:image/png;base64,' + (t === 'dark' ? (LG.d || LG.l) : LG.l);
    ['#hdrLogo', '#splashLogo', '#footLogo'].forEach(function (id) {
      var el = $(id); if (el) el.src = src;
    });
  }

  /* ================= boot ================= */
  function gunzip(b64) {
    var bin = atob(b64), len = bin.length, arr = new Uint8Array(len);
    for (var i = 0; i < len; i++) arr[i] = bin.charCodeAt(i);
    if (typeof DecompressionStream === 'undefined') throw new Error('DecompressionStream unsupported');
    var ds = new DecompressionStream('gzip');
    return new Response(new Blob([arr]).stream().pipeThrough(ds)).text();
  }

  /* تفريغ أي بيانات قديمة خزّنتها إصدارات سابقة في هذا المتصفح.
     هذه اللوحة لا تحفظ بيانات مرشحين إطلاقًا — تعيش في الجلسة فقط. */
  function purgeLegacy() {
    try { indexedDB.deleteDatabase(DB); } catch (e) { }
    try { indexedDB.deleteDatabase('hr-dash'); } catch (e) { }
    try { ['overrides', 'src', 'dataset', 'records'].forEach(function (k) { localStorage.removeItem(k); }); } catch (e) { }
  }

  /* تطبيق مساحة عمل (مشتركة أو محلية) على الحالة الحالية.
     ترجع 'full'   إذا كانت تحمل سجلات المرشحين
           'partial' إذا كانت بلا سجلات (تُكمَّل بسحب الشيت)
           ''        إذا كانت فارغة */
  function applyShared(ws, live) {
    if (!ws) return '';
    if (ws.ovh) { OVERRIDES = {}; OVERRIDES_H = ws.overrides || {}; }
    else { OVERRIDES = ws.overrides || {}; OVERRIDES_H = null; }
    if (ws.filters) { var d = { q: '', pos: '', nat: '', exp: '', res: '', sal: '', st: '', per: '', fam: '' };
      for (var k in ws.filters) if (k in d) d[k] = ws.filters[k]; F = d; }
    if (ws.eng && ws.eng.w && ws.eng.w.length === 8) ENG = ws.eng;
    if (ws.sheet) SHEET_URL = ws.sheet;
    LAST_RUN = ws.lastRun || null;
    LAST_SYNC = ws.lastSync ? new Date(ws.lastSync) : null;
    WS_AT = ws.at ? new Date(ws.at) : null;
    VIEW = ws.view || 0;
    LOG = (ws.log && ws.log.length) ? Store.setLog(ws.log) : Store.readLog();
    var mode = (ws.records && ws.records.length) ? 'full' : (ws.recordsOmitted ? 'partial' : '');
    if (mode === 'full') prep(ws.records, ws.report, ws.at, 'saved');
    if (live) {
      resolveOv();                       /* السجلات موجودة أصلًا — طبّق الحالات فورًا */
      var u = $('#sheetUrl'); if (u) u.value = SHEET_URL;
      buildFilters(); syncQnav(); setDirty(false); render(); paintCloud();
      if (mode === 'full') toast(T('restoredCloud', { v: (Store.server() || {}).version || 0 }));
      else { toast(T('sharedNoRecs', { n: nf(Object.keys(OVERRIDES).length) })); sync(true); }
    }
    return mode;
  }

  /* عرض مساحة عمل محلية قديمة لرفعها كنسخة مشتركة — مرّة واحدة، وبموافقة صريحة */
  function offerMigration() {
    if (!Store.configured()) return;
    var st = Store.status();
    if (!st.last || !st.last.cloudOk) return;          /* السحابة غير متاحة — لا نعرض شيئًا */
    if ((st.srv || {}).version) return;                 /* توجد نسخة مشتركة أصلًا */
    if (lsGet('migAsked', 0)) return;
    Store.localLoad().then(function (ws) {
      if (!ws || !ws.records || !ws.records.length) return;
      lsSet('migAsked', 1);
      if (!window.confirm(T('migAsk'))) return;
      applyShared(ws, true);
      saveWs({ force: true }).then(function (ok) { if (ok) toast(T('migDone')); });
    }).catch(function () { });
  }

  function boot() {
    purgeLegacy();
    var DEF = window.__SHEET__ || '';
    var savedUrl = lsGet('sheetUrl', null);
    /* إن تغيّر الرابط الافتراضي في نسخة جديدة، فالافتراضي هو الذي يسود */
    SHEET_URL = (savedUrl && savedUrl.def === DEF && savedUrl.url) ? savedUrl.url : DEF;
    setTheme(lsGet('theme', 'light'));
    LANG = lsGet('lang', 0) ? 1 : 0;
    OVERRIDES = {};
    var w = lsGet('weights', null);
    if (w && w.length === 8) ENG.w = w;
    var th = lsGet('th', null); if (th) ENG.th = th;
    $('#updBtn').innerHTML = SVG.db;
    $('#syncBtn').innerHTML = SVG.sync;
    $('#saveBtn').innerHTML = SVG.save + '<span class="dot"></span>';
    LOG = Store.readLog();
    $('#langBtn').innerHTML = SVG.globe;
    $('#rstBtn').innerHTML = SVG.rst;
    $('#toTop').innerHTML = SVG.top;
    $('#updIc').innerHTML = SVG.up;
    $('#dropIc').innerHTML = SVG.up;
    $('#ebIc').innerHTML = SVG.up;

    var pack = window.__PACK__;
    var load = (pack && pack.length > 32)
      ? gunzip(pack).then(function (json) { window.__BASE__ = JSON.parse(json); window.__PACK__ = null; })
      : Promise.resolve();

    load.then(function () {
      return Store.loadWorkspace().catch(function () { return null; });
    }).then(function (ws) {
      var mode = applyShared(ws, false);
      if (mode !== 'full') {
        if (window.__BASE__) prep(unpack(window.__BASE__), window.__REPORT__, null, 'embedded');
        else prep([], null, null, 'empty');
      }
      paintStatic();
      bind();
      setDirty(false);
      render();
      document.body.classList.remove('loading');
      $('#splash').classList.add('gone');
      setTimeout(function () { var s = $('#splash'); if (s) s.remove(); }, 400);

      /* إشعار بنسخة أحدث — بلا استبدال تلقائي.
         لا نفتح قناة Realtime إلا بعد قراءة ناجحة، وإلا ظلّ المتصفح يعيد المحاولة بلا طائل. */
      if ((Store.status().last || {}).cloudOk) {
        try { Store.subscribe(function (info) { showNewer(info); }); } catch (e) { }
      }
      paintCloud();

      if (mode === 'full') {
        var cloud = (Store.status().last || {}).cloudOk;
        toast(cloud ? T('restoredCloud', { v: (Store.server() || {}).version || 0 })
          : T('restored', { d: fmtDate(WS_AT) }));
      } else if (mode === 'partial') {
        /* النسخة المشتركة تحمل الحالات والإعدادات فقط — نسحب المرشحين من الشيت */
        toast(T('sharedNoRecs', { n: nf(Object.keys(OVERRIDES).length) }));
        setTimeout(function () { sync(true); }, 350);
      } else {
        setTimeout(offerMigration, 600);
        if (!DATA.length) setTimeout(function () { sync(true); }, 350);
      }
    }).catch(function (e) {
      $('#splash').innerHTML = '<div class="st" style="max-width:420px;text-align:center;line-height:1.8">' +
        'تعذّر تحميل البيانات المضمّنة.<br>' + esc(String(e && e.message ? e.message : e)) +
        '<br><br>حدّث المتصفح إلى نسخة أحدث ثم أعد فتح الملف.</div>';
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
