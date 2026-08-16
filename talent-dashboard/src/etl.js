/* ===================================================================
   ETL — طبقة تنظيف وتوحيد البيانات
   تعمل مرة واحدة عند كل رفع لملف الإكسل، داخل المتصفح بالكامل.
   نفس الشيفرة تُستخدم لتوليد البيانات المضمّنة في الملف.
   =================================================================== */
(function (root) {
  'use strict';

  var SHEET_MAIN = 'Form Responses 1';
  var SHEET_DICT = 'تصنيف الجنسيات';

  /* ---- أدوات ---- */
  function grid(ws) { return XLSX.utils.sheet_to_json(ws, { header: 1, raw: true, defval: null }); }

  function findSheet(wb, name) {
    if (wb.Sheets[name]) return wb.Sheets[name];
    var t = String(name).trim().toLowerCase();
    for (var i = 0; i < wb.SheetNames.length; i++) {
      var s = wb.SheetNames[i];
      if (String(s).trim().toLowerCase() === t) return wb.Sheets[s];
    }
    for (var j = 0; j < wb.SheetNames.length; j++) {
      if (String(wb.SheetNames[j]).toLowerCase().indexOf(t.slice(0, 8)) >= 0) return wb.Sheets[wb.SheetNames[j]];
    }
    return null;
  }

  function str(v) { return v == null ? '' : String(v).trim(); }

  var AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
  function num(v) {
    if (v == null || v === '') return null;
    if (typeof v === 'number') return isFinite(v) ? v : null;
    var s = String(v).replace(/،/g, ',').replace(/٫/g, '.');
    s = s.replace(/[٠-٩]/g, function (c) { return String(AR_DIGITS.indexOf(c)); });
    var low = s.toLowerCase();
    var m = s.replace(/,/g, '').match(/\d+(?:\.\d+)?/);
    if (!m) return null;
    var val = parseFloat(m[0]);
    if (!isFinite(val)) return null;
    /* «16 الف» → 16000 */
    if (val < 100 && (low.indexOf('الف') >= 0 || low.indexOf('ألف') >= 0 || /\dk\b/.test(low) || low.indexOf(' k') >= 0)) val *= 1000;
    return val;
  }

  function excelDate(v) {
    if (v == null || v === '') return null;
    if (v instanceof Date) return v.getTime();
    if (typeof v === 'number') {
      /* serial date */
      var d = new Date(Date.UTC(1899, 11, 30) + Math.round(v * 86400000));
      return isNaN(d.getTime()) ? null : d.getTime();
    }
    var p = Date.parse(String(v));
    return isNaN(p) ? null : p;
  }

  /* ---- قاموس الجنسيات (من الملف نفسه) ---- */
  function readDict(wb) {
    var ws = findSheet(wb, SHEET_DICT);
    var rules = [], arabicKw = [];
    if (!ws) return { rules: rules, arabicKw: arabicKw, found: false };
    var rows = grid(ws);
    for (var i = 1; i < rows.length; i++) {
      var r = rows[i] || [];
      if (r[4] && r[5]) rules.push([String(r[4]).trim().toLowerCase(), String(r[5]).trim()]);
      if (r[7]) arabicKw.push(String(r[7]).trim().toLowerCase());
    }
    return { rules: rules, arabicKw: arabicKw, found: true };
  }

  /* احتياطي إن لم توجد ورقة القاموس */
  var FALLBACK_RULES = [
    ['مصر', 'مصري'], ['egy', 'مصري'], ['egip', 'مصري'], ['evyp', 'مصري'],
    ['سعود', 'سعودي'], ['saudi', 'سعودي'], ['suadi', 'سعودي'], ['المملكة', 'سعودي'],
    ['سود', 'سوداني'], ['sudan', 'سوداني'], ['sodan', 'سوداني'], ['sud', 'سوداني'], ['sod', 'سوداني'],
    ['يمن', 'يمني'], ['يمان', 'يمني'], ['yem', 'يمني'], ['بمني', 'يمني'],
    ['سور', 'سوري'], ['syr', 'سوري'],
    ['اردن', 'أردني'], ['أردن', 'أردني'], ['jordan', 'أردني'],
    ['فلسطين', 'فلسطيني'], ['palest', 'فلسطيني'],
    ['pak', 'باكستاني'], ['باكستان', 'باكستاني'],
    ['india', 'هندي'], ['هند', 'هندي'],
    ['صومال', 'صومالي'], ['somal', 'صومالي'],
    ['lanka', 'سريلانكي'], ['سريلانك', 'سريلانكي'],
    ['تونس', 'تونسي'], ['tunis', 'تونسي'],
    ['لبنان', 'لبناني'], ['leban', 'لبناني'],
    ['جزائر', 'جزائري'], ['alger', 'جزائري'],
    ['مغرب', 'مغربي'], ['بنغلاد', 'بنغلاديشي'], ['bangla', 'بنغلاديشي']
  ];
  var FALLBACK_AR = ['سعود', 'saudi', 'suadi', 'المملكة', 'مصر', 'egy', 'egip', 'evyp', 'سود', 'sudan',
    'sodan', 'يمن', 'يمان', 'yem', 'سور', 'syr', 'اردن', 'أردن', 'jordan', 'فلسطين', 'palest',
    'لبنان', 'leban', 'تونس', 'tunis', 'جزائر', 'alger', 'مغرب', 'صومال', 'somal', 'عراق', 'iraq',
    'ليبيا', 'libya', 'كويت', 'قطر', 'عمان', 'بحرين', 'امارات', 'موريتان', 'جيبوت', 'سعودية'];

  /* ---- تصنيفات ---- */
  function gender(v) {
    var s = String(v == null ? '' : v);
    if (s.indexOf('أنثى') >= 0 || s.indexOf('انثى') >= 0 || s.toLowerCase().indexOf('female') >= 0) return 2;
    if (s.indexOf('ذكر') >= 0 || s.toLowerCase().indexOf('male') >= 0) return 1;
    return 0;
  }
  function yes(v) {
    var s = String(v == null ? '' : v);
    return (s.indexOf('نعم') >= 0 || /\bYes\b/i.test(s)) ? 1 : 0;
  }

  var EDU_NONE = 'غير محدد';
  function eduLevel(v) {
    var s = String(v == null ? '' : v).toLowerCase();
    if (!s) return EDU_NONE;
    if (/ماجست|master|mba|دكتور|phd|زمالة/.test(s)) return 'ماجستير فأعلى';
    if (/بكالور|بكالريوس|بكالوريس|بكالريس|bachelor|b\.?sc|ليسانس|هندس|طب |صيدل/.test(s)) return 'بكالوريوس';
    if (/دبلوم|diploma|معهد/.test(s)) return 'دبلوم';
    if (/ثانو|secondary|high school|توجيهي/.test(s)) return 'ثانوية';
    return EDU_NONE;
  }

  var NONE_WORDS = ['لا يوجد', 'لايوجد', 'لا اعمل', 'لا أعمل', 'لا توجد', 'لا عمل', 'بدون', 'عاطل',
    'باحث عن عمل', 'متفرغ', 'حديث تخرج', 'n/a', 'na', 'none', 'nothing', 'unemployed',
    'fresh graduate', 'freelance', '-', '.', '_', '0'];
  function isBlankish(v) {
    var s = String(v == null ? '' : v).trim().toLowerCase();
    if (!s) return true;
    for (var i = 0; i < NONE_WORDS.length; i++) if (s === NONE_WORDS[i] || s.indexOf(NONE_WORDS[i]) === 0) return true;
    return false;
  }

  var CITY_RULES = [
    [/riyad|رياض/i, 'الرياض'], [/jed|jid|جد[ةه]/i, 'جدة'], [/dam+am|دمام/i, 'الدمام'],
    [/khob|خبر/i, 'الخبر'], [/mecca|makk|مك[ةه]/i, 'مكة'], [/madin|medina|مدين[ةه] المنور/i, 'المدينة'],
    [/dhahran|ظهران/i, 'الظهران'], [/tabuk|تبوك/i, 'تبوك'], [/abha|أبها|ابها/i, 'أبها'],
    [/qassim|قصيم|بريد[ةه]/i, 'القصيم'], [/hail|حائل/i, 'حائل'], [/jazan|جازان|جيزان/i, 'جازان'],
    [/taif|طائف/i, 'الطائف'], [/yanbu|ينبع/i, 'ينبع'], [/jubail|جبيل/i, 'الجبيل'],
    [/egypt|مصر|cairo|قاهر/i, 'مصر'], [/sudan|سودان|khartoum|خرطوم/i, 'السودان'],
    [/yemen|يمن|صنعاء/i, 'اليمن'], [/jordan|اردن|أردن/i, 'الأردن'], [/syria|سوري/i, 'سوريا']
  ];
  function cityOf(v) {
    var s = String(v == null ? '' : v).trim();
    if (!s) return '';
    for (var i = 0; i < CITY_RULES.length; i++) if (CITY_RULES[i][0].test(s)) return CITY_RULES[i][1];
    return 'أخرى';
  }

  /* =========================================================
     استخراج الدورات والشهادات من الحقل النصي الحر (عمود M)
     كل ما يفصله فاصلة أو سطر جديد أو شرطة يُعامل كشهادة مستقلة،
     ثم تُوحَّد التسميات العربية والإنجليزية إلى مسمى واحد.
     ========================================================= */
  var CERT_NONE = /^(لا ?يوجد|لا ?شيء|لايوجد|لا|بدون|no|none|nil|n\/?a|na|nothing|non|-+|\.+|_+|0|x|xx|null|غير|مافي|ما ?في|يوجد|not? ?yet|عدم|لم ?احصل|لم ?أحصل|دورة|دورات|دوره|course|courses|training|تدريب|تدريبات|شهادة|شهادات|certificate|certificates|etc|others|اخرى|أخرى|yes|نعم|جامعة|جامعه|university|instructor|من|في|و|the|and|of)$/i;
  var CERT_NOISE = /^(?:(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\.? ?\d{0,4}|\d{4}|\d{1,2}[\/-]\d{1,2}(?:[\/-]\d{2,4})?|[0-9\s.\-–—]+|(?:يناير|فبراير|مارس|أبريل|ابريل|مايو|يونيو|يوليو|أغسطس|اغسطس|سبتمبر|أكتوبر|اكتوبر|نوفمبر|ديسمبر)[^\d]*\d{0,4})$/i;

  var CERT_CANON = [
    [/\bpmp\b|\bp\.?m\.?p\.?\b|ادارة المشاريع الاحترافية|بي ام بي/i, 'PMP'],
    [/\bpgmp\b/i, 'PgMP'], [/\bcapm\b/i, 'CAPM'], [/^pmi$/i, 'PMI'],
    [/\bpmi[- ]?rmp\b|\brmp\b/i, 'PMI-RMP'], [/\bpmi[- ]?sp\b/i, 'PMI-SP'],
    [/\bpmo[- ]?cp\b/i, 'PMO-CP'], [/\bprince ?2\b/i, 'PRINCE2'],
    [/primavera|بريمافيرا|بريمفيرا|primavira|\bp ?6\b/i, 'Primavera P6'],
    [/ms ?project|microsoft ?project|ام اس بروجكت|مايكروسوفت بروجكت/i, 'MS Project'],
    [/auto ?cad|اوتوكاد|أوتوكاد|أتوكاد|اتوكاد|autocade/i, 'AutoCAD'],
    [/\br[ei]v[ei]?t\b|\brivit\b|ريفيت|ريفت|رفيت/i, 'Revit'],
    [/\bbim\b|بيم/i, 'BIM'], [/navis ?works?/i, 'Navisworks'],
    [/\betabs?\b|ايتابس/i, 'ETABS'], [/\bsap ?2000\b/i, 'SAP2000'],
    [/\bstaad\b|ستاد/i, 'STAAD'], [/\bsafe\b(?! ?ty)/i, 'SAFE'],
    [/civil ?3 ?d/i, 'Civil 3D'], [/sketch ?up/i, 'SketchUp'],
    [/3ds? ?max|ثري دي ماكس/i, '3ds Max'], [/photo ?shop|فوتوشوب/i, 'Photoshop'],
    [/lumion|لوميون/i, 'Lumion'], [/\bcad\b/i, 'CAD'], [/\bhvac\b|تكييف/i, 'HVAC'],
    [/\bicdl\b|الرخصة الدولية|الرخصه الدوليه|رخصة قيادة الحاسب/i, 'ICDL'],
    [/\bosha\b|اوشا|أوشا/i, 'OSHA'], [/\bnebosh\b|نيبوش/i, 'NEBOSH'], [/\biosh\b/i, 'IOSH'],
    [/first ?aid|اسعافات|إسعافات/i, 'First Aid'],
    [/\bhse\b|health ?,? ?safety|السلامة المهنية|الصحة والسلامة|سلامة مهنية|امن وسلامة|أمن وسلامة/i, 'HSE'],
    [/fire ?fight|مكافحة الحريق|اطفاء|إطفاء/i, 'Fire Fighting'],
    [/six ?sigma|سيكس سيجما|ستة سيجما/i, 'Six Sigma'], [/\blean\b/i, 'Lean'],
    [/\biso ?9001\b/i, 'ISO 9001'], [/\biso ?45001\b/i, 'ISO 45001'],
    [/\biso ?14001\b/i, 'ISO 14001'], [/\biso\b/i, 'ISO'],
    [/\bcma\b|سي ام ايه/i, 'CMA'], [/\bcpa\b/i, 'CPA'],
    [/\bsocpa\b|الهيئة السعودية للمحاسبين|زمالة المحاسبين السعودي/i, 'SOCPA'],
    [/\bacca\b/i, 'ACCA'], [/\bcia\b/i, 'CIA'], [/\bifrs\b|المعايير الدولية/i, 'IFRS'],
    [/\bcfa\b/i, 'CFA'], [/\bcfm\b/i, 'CFM'],
    [/quick ?books?|كويك بوكس/i, 'QuickBooks'], [/peach ?tree|بيتش تري/i, 'Peachtree'],
    [/\bodoo\b/i, 'Odoo'], [/\boracle\b|اوراكل/i, 'Oracle'],
    [/\bsap\b(?! ?2000)|ساب\b/i, 'SAP'], [/\berp\b/i, 'ERP'],
    [/\bielts\b|ايلتس/i, 'IELTS'], [/\btoefl\b|توفل/i, 'TOEFL'],
    [/\bccna\b/i, 'CCNA'], [/\bccnp\b/i, 'CCNP'], [/\bmcsa\b/i, 'MCSA'], [/\bcisco\b/i, 'Cisco'],
    [/\bcompt ?ia\b/i, 'CompTIA'],
    [/\btot\b|تدريب المدربين/i, 'TOT'],
    [/\bshrm\b/i, 'SHRM'], [/\bcipd\b/i, 'CIPD'],
    [/\bhrm\b|ادارة الموارد البشرية|إدارة الموارد البشرية/i, 'HR Management'],
    [/\bfidic\b|فيديك/i, 'FIDIC'], [/\bleed\b/i, 'LEED'],
    [/quantity survey|حصر الكميات|مساح كميات|حساب الكميات|حصر كميات/i, 'Quantity Surveying'],
    [/value engineer|الهندسة القيمية/i, 'Value Engineering'],
    [/\bmba\b|ماجستير ادارة الاعمال|ماجستير إدارة الأعمال/i, 'MBA'],
    [/\bexcel\b|اكسل|إكسل|اكسيل/i, 'Excel'],
    [/\bword\b|\bpower ?point\b|\b(?:ms|microsoft) ?office\b|مايكروسوفت اوفيس|مايكروسوفت أوفيس|الاوفيس|الأوفيس|أوفيس/i, 'MS Office'],
    [/\bpower ?bi\b|باور بي/i, 'Power BI'],
    [/project management|إدارة المشاريع|ادارة المشاريع/i, 'Project Management']
  ];

  var CERT_SPLIT = /[\n\r\t•·●◦▪‣➢✓√\*\|,،;؛\/\\+&]|(?:\s[-–—]\s)|(?:^\s*[-–—]\s*)|(?:\s+و\s+)|(?:\s{3,})/g;
  var CERT_MAXCHARS = 40, CERT_MAXWORDS = 4, CERT_MAXOUT = 14;

  function certStrip(t) {
    return String(t)
      .replace(/^[\s\-–—•·●◦▪‣➢✓√*.\d)\]:]+/, '')
      .replace(/[\s\-–—•·●◦▪‣*:,.]+$/, '')
      .replace(/\s+/g, ' ')
      .trim();
  }
  function certCase(s) {
    if (/[؀-ۿ]/.test(s)) return s;
    if (s.length <= 5 && s === s.toUpperCase()) return s;
    if (/^[A-Z0-9\s.+&()-]+$/.test(s) && s.length <= 22) return s;
    return s.replace(/\w\S*/g, function (w) { return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase(); });
  }
  function certCanon(tok) {
    for (var i = 0; i < CERT_CANON.length; i++) if (CERT_CANON[i][0].test(tok)) return CERT_CANON[i][1];
    return null;
  }
  function certMine(text) {
    var out = [];
    for (var i = 0; i < CERT_CANON.length; i++) {
      if (CERT_CANON[i][0].test(text) && out.indexOf(CERT_CANON[i][1]) < 0) out.push(CERT_CANON[i][1]);
    }
    return out;
  }
  function certsOf(v) {
    var s = String(v == null ? '' : v).trim();
    if (!s) return [];
    if (s.length > 4000) s = s.slice(0, 4000);
    var parts = s.split(CERT_SPLIT);
    var out = [], seen = Object.create(null);
    function push(x) { if (x && !seen[x.toLowerCase()]) { seen[x.toLowerCase()] = 1; out.push(x); } }
    for (var i = 0; i < parts.length; i++) {
      var t = certStrip(parts[i]);
      if (!t || t.length < 2) continue;
      if (CERT_NONE.test(t) || CERT_NOISE.test(t)) continue;
      var c = certCanon(t);
      if (c) { push(c); continue; }
      if (t.length > CERT_MAXCHARS || t.split(/\s+/).length > CERT_MAXWORDS) { certMine(t).forEach(push); continue; }
      if (!/[A-Za-z؀-ۿ]/.test(t)) continue;
      push(certCase(t));
    }
    return out.slice(0, CERT_MAXOUT);
  }

  /* حالة المرشح — قائمة مغلقة */
  var STATUS_MAP = [
    [/مقبول|accept|hired|تم التعيين|offer accept/i, 'مقبول'],
    [/عرض|offer/i, 'عرض وظيفي'],
    [/مقابلة فني|technical|فني|gm interview|technical interview/i, 'مقابلة فنية'],
    [/مقابل|interview/i, 'مقابلة HR'],
    [/مرفوض|غير مقبول|reject|not fit|weak|خبرة ضعيفة|راتب عالي|راتب اكبر/i, 'مرفوض'],
    [/تم ارسال|تم الارسال|i sent|تم التنزيل|تم تنزيل|sent|فرز|shortlist|موافقة مبدء|موافقة مبدئ/i, 'تم الفرز']
  ];
  function statusOf(v) {
    var s = String(v == null ? '' : v).trim();
    if (!s) return 'جديد';
    for (var i = 0; i < STATUS_MAP.length; i++) if (STATUS_MAP[i][0].test(s)) return STATUS_MAP[i][1];
    return 'تم الفرز';
  }

  /* ---- توحيد الهوية: البريد والجوال ---- */
  function normEmail(v) {
    var s = String(v == null ? '' : v).trim().toLowerCase().replace(/\s+/g, '');
    var m = s.match(/^([^@]+)@([^@]+)$/);
    if (!m) return '';
    var loc = m[1], dom = m[2].replace(/[.,;]+$/, '');
    loc = loc.split('+')[0];
    if (/^(gmail|googlemail)\.com$/.test(dom)) { loc = loc.replace(/\./g, ''); dom = 'gmail.com'; }
    if (!loc || dom.indexOf('.') < 0) return '';
    return loc + '@' + dom;
  }
  function normPhone(v) {
    var s = String(v == null ? '' : v);
    s = s.replace(/[٠-٩]/g, function (c) { return String(AR_DIGITS.indexOf(c)); });
    s = s.replace(/\D/g, '');
    if (!s) return '';
    if (s.indexOf('00966') === 0) s = s.slice(5);
    else if (s.indexOf('966') === 0 && s.length > 9) s = s.slice(3);
    while (s.charAt(0) === '0') s = s.slice(1);
    if (s.length > 9) s = s.slice(-9);
    return s.length >= 8 ? s : '';
  }

  function driveId(u) {
    var s = String(u == null ? '' : u);
    var m = s.match(/[?&]id=([A-Za-z0-9_-]+)/) || s.match(/\/d\/([A-Za-z0-9_-]+)/);
    return m ? m[1] : '';
  }

  /* ---- تحديد الأعمدة بالعنوان (يتحمّل تغيّر الترتيب) ---- */
  function mapColumns(header) {
    var H = header.map(function (h) { return String(h == null ? '' : h).toLowerCase().replace(/\s+/g, ' ').trim(); });
    function find(subs, fallbackIdx) {
      for (var i = 0; i < H.length; i++) {
        for (var j = 0; j < subs.length; j++) {
          if (H[i] && H[i].indexOf(subs[j].toLowerCase()) >= 0) return i;
        }
      }
      return (fallbackIdx == null ? -1 : fallbackIdx);
    }
    return {
      ts: find(['timestamp', 'الطابع الزمني'], 1),
      email: find(['email address'], 2),
      nameAr: find(['الاسم رباعي', 'four parts) in arabic'], 3),
      nameEn: find(['in english'], 4),
      gender: find(['جنس gender', 'gender'], 5),
      nat: find(['nationality'], 6),
      riyadh: find(['reside in riyadh'], 7),
      pos: find(['ما هي الوظيفة المتقدم', 'what is the position'], 8),
      exp: find(['عدد سنوات الخبرة', 'how many ye'], 9),
      loc: find(['محل الاقامة بالتحديد'], 10),
      phone: find(['mobile number', 'رقم الموبيل'], 11),
      training: find(['التدريبات', 'training'], 12),
      dob: find(['date of birth', 'تاريخ الميلاد'], 13),
      iqama: find(['نوع إقامتك', 'residency'], 14),
      email2: find(['بريد إلكتروني', 'your email'], 15),
      edu: find(['المؤهل الدراسي'], 16),
      docs: find(['residence permit'], 17),
      age: find(['السن age', 'السن'], 18),
      curPos: find(['الوظيفة الحالية', 'current positi'], 19),
      company: find(['اسم اخر شركة', 'name of the'], 20),
      salCur: find(['الراتب الحالي'], 21),
      salExp: find(['الراتب المتوقع'], 22),
      cv: find(['تحميل السيرة الذاتية', 'رفع السيرة'], 23),
      dammam: find(['reside in dammam', 'تقييم بالدمام'], 24),
      status: find(['حالة المرشح', 'candidate status'], 31)
    };
  }

  /* ---- المحرك ---- */
  function run(wb, opts) {
    opts = opts || {};
    var report = { sheets: [], dict: 0, raw: 0, dupes: 0, merged: 0, multiRole: 0, kept: 0, natForms: 0, certLabels: 0, warnings: [] };

    var ws = findSheet(wb, SHEET_MAIN);
    if (!ws) {
      /* أول ورقة فيها أكثر من 5 أعمدة */
      for (var i = 0; i < wb.SheetNames.length; i++) {
        var g0 = grid(wb.Sheets[wb.SheetNames[i]]);
        if (g0.length > 2 && (g0[0] || []).length > 5) { ws = wb.Sheets[wb.SheetNames[i]]; report.warnings.push('لم تُوجد ورقة «' + SHEET_MAIN + '» — استُخدمت «' + wb.SheetNames[i] + '»'); break; }
      }
    } else report.sheets.push(SHEET_MAIN);
    if (!ws) throw new Error('لم يُعثر على ورقة بيانات صالحة داخل الملف.');

    var rows = grid(ws);
    if (!rows.length) throw new Error('الورقة فارغة.');

    /* صف العناوين: أول صف يحتوي Timestamp أو ما يشبهه */
    var hIdx = 0;
    for (var h = 0; h < Math.min(5, rows.length); h++) {
      var joined = (rows[h] || []).join('|').toLowerCase();
      if (joined.indexOf('timestamp') >= 0 || joined.indexOf('nationality') >= 0) { hIdx = h; break; }
    }
    var C = mapColumns(rows[hIdx] || []);

    var dict = readDict(wb);
    if (dict.found) report.sheets.push(SHEET_DICT);
    var rules = dict.rules.length ? dict.rules : FALLBACK_RULES;
    var arKw = dict.arabicKw.length ? dict.arabicKw : FALLBACK_AR;
    if (!dict.found) report.warnings.push('لم تُوجد ورقة «' + SHEET_DICT + '» — استُخدم القاموس الاحتياطي المدمج.');
    report.dict = rules.length;

    var natCache = {}, natForms = {};
    function normNat(v) {
      var s = String(v == null ? '' : v).trim().toLowerCase();
      if (!s) return 'غير محدد';
      natForms[s] = 1;
      if (natCache[s] !== undefined) return natCache[s];
      var out = 'أخرى';
      for (var i = 0; i < rules.length; i++) { if (s.indexOf(rules[i][0]) >= 0) { out = rules[i][1]; break; } }
      natCache[s] = out;
      return out;
    }
    var arCache = {};
    function isArabic(v) {
      var s = String(v == null ? '' : v).trim().toLowerCase();
      if (!s) return 0;
      if (arCache[s] !== undefined) return arCache[s];
      var r = 0;
      for (var i = 0; i < arKw.length; i++) { if (s.indexOf(arKw[i]) >= 0) { r = 1; break; } }
      arCache[s] = r;
      return r;
    }

    function cell(r, k) { return C[k] >= 0 ? r[C[k]] : null; }

    var list = [];
    for (var i = hIdx + 1; i < rows.length; i++) {
      var r = rows[i] || [];
      var ts = excelDate(cell(r, 'ts'));
      var nameAr = str(cell(r, 'nameAr'));
      /* استبعاد صفوف العناوين المكررة والصفوف التقنية */
      if (ts == null || ts < 946684800000 || ts > Date.now() + 63072000000) continue;
      if (!nameAr) continue;

      var natRaw = str(cell(r, 'nat'));
      var age = num(cell(r, 'age'));
      if (age == null) {
        var dob = excelDate(cell(r, 'dob'));
        if (dob != null) age = Math.floor((Date.now() - dob) / 31557600000);
      }
      var exp = num(cell(r, 'exp'));
      var email = str(cell(r, 'email')).toLowerCase() || str(cell(r, 'email2')).toLowerCase();
      var phone = str(cell(r, 'phone')).replace(/\D/g, '');
      var loc = str(cell(r, 'loc'));
      var training = str(cell(r, 'training'));
      var curPos = str(cell(r, 'curPos'));
      var company = str(cell(r, 'company'));

      list.push({
        t: ts,
        n: nameAr || str(cell(r, 'nameEn')),
        ne: str(cell(r, 'nameEn')),
        e: email,
        h: phone,
        _e: normEmail(email),
        _e2: normEmail(cell(r, 'email2')),
        _p: normPhone(cell(r, 'phone')),
        g: gender(cell(r, 'gender')),
        nt: normNat(natRaw),
        nr: natRaw,
        ar: isArabic(natRaw),
        ry: yes(cell(r, 'riyadh')),
        dm: yes(cell(r, 'dammam')),
        p: str(cell(r, 'pos')).replace(/\s+/g, ' ') || 'غير محدد',
        x: (exp != null && exp >= 0 && exp <= 50) ? exp : null,
        a: (age != null && age >= 16 && age <= 75) ? age : null,
        cp: curPos,
        co: company,
        emp: (!isBlankish(curPos) && !isBlankish(company)) ? 1 : 0,
        sc: (function (v) { return (v != null && v >= 500 && v <= 200000) ? v : null; })(num(cell(r, 'salCur'))),
        se: (function (v) { return (v != null && v >= 500 && v <= 200000) ? v : null; })(num(cell(r, 'salExp'))),
        seRaw: str(cell(r, 'salExp')),
        cv: driveId(cell(r, 'cv')),
        dc: driveId(cell(r, 'docs')),
        ed: eduLevel(cell(r, 'edu')),
        edr: str(cell(r, 'edu')),
        ct: cityOf(loc),
        lo: loc,
        tr: training,
        cr: certsOf(training),
        st: statusOf(cell(r, 'status'))
      });
    }
    report.raw = list.length;
    report.natForms = Object.keys(natForms).length;

    /* =========================================================
       إزالة التكرار — ربط الهويات (البريد أو الجوال) ثم الدمج
       الاسم لا يُستخدم إطلاقًا للمطابقة: قد يكتبه المرشح عربيًا
       مرة وإنجليزيًا مرة، أو ثنائيًا مرة ورباعيًا مرة.
       الربط متعدٍّ: أ↔ب بالبريد، ب↔ج بالجوال ⇒ أ=ب=ج شخص واحد.
       ========================================================= */
    list.sort(function (a, b) { return (a.t || 0) - (b.t || 0); });

    var parent = Object.create(null);
    function find(x) {
      if (parent[x] === undefined) { parent[x] = x; return x; }
      while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x]; }
      return x;
    }
    function union(a, b) { a = find(a); b = find(b); if (a !== b) parent[a] = b; }

    for (var u = 0; u < list.length; u++) {
      var rec = list[u], node = 'r' + u;
      find(node);
      if (rec._e) union(node, 'e:' + rec._e);
      if (rec._e2 && rec._e2 !== rec._e) union(node, 'e:' + rec._e2);
      if (rec._p) union(node, 'p:' + rec._p);
    }

    var buckets = Object.create(null), order = [];
    for (var v = 0; v < list.length; v++) {
      var root = find('r' + v);
      if (buckets[root] === undefined) { buckets[root] = []; order.push(root); }
      buckets[root].push(list[v]);
    }

    /* ---- اختيار الأكثر تفصيلًا ---- */
    function words(s) { return String(s || '').trim().split(/\s+/).filter(Boolean).length; }
    function richestName(group, key) {
      var best = '';
      for (var i = 0; i < group.length; i++) {
        var c = String(group[i][key] || '').replace(/\s+/g, ' ').trim();
        if (!c) continue;
        if (!best) { best = c; continue; }
        var wc = words(c), wb = words(best);
        if (wc > wb || (wc === wb && c.length > best.length)) best = c;
      }
      return best;
    }
    /* أحدث قيمة غير فارغة (الأحدث أولًا) */
    function latest(group, key, blankOk) {
      for (var i = group.length - 1; i >= 0; i--) {
        var val = group[i][key];
        if (val === null || val === undefined || val === '') continue;
        if (!blankOk && typeof val === 'string' && isBlankish(val)) continue;
        return val;
      }
      return (typeof group[group.length - 1][key] === 'number') ? null : '';
    }
    function longest(group, key) {
      var best = '';
      for (var i = 0; i < group.length; i++) {
        var c = String(group[i][key] || '');
        if (c.length > best.length) best = c;
      }
      return best;
    }
    var ST_RANK = { 'مقبول': 6, 'عرض وظيفي': 5, 'مقابلة فنية': 4, 'مقابلة HR': 3, 'مرفوض': 2, 'تم الفرز': 1, 'جديد': 0 };
    function bestStatus(group) {
      var best = 'جديد', r = -1;
      for (var i = 0; i < group.length; i++) {
        var st = group[i].st, rk = ST_RANK[st] === undefined ? 0 : ST_RANK[st];
        if (rk >= r) { r = rk; best = st; }
      }
      return best;
    }

    var out = [];
    for (var g = 0; g < order.length; g++) {
      var grp = buckets[order[g]];               /* مرتبة زمنيًا تصاعديًا */
      var last = grp[grp.length - 1];            /* أحدث طلب */
      if (grp.length === 1) {
        last.subs = 1;
        last.pos = [last.p];
        out.push(last);
        continue;
      }
      report.dupes += grp.length - 1;
      report.merged++;

      /* كل الوظائف التي تقدّم لها — الأحدث أولًا */
      var roles = [], seenR = Object.create(null);
      for (var q = grp.length - 1; q >= 0; q--) {
        var pv = grp[q].p;
        if (pv && !seenR[pv]) { seenR[pv] = 1; roles.push(pv); }
      }
      /* اتحاد الشهادات من كل الطلبات */
      var certs = [], seenC = Object.create(null);
      for (var w2 = 0; w2 < grp.length; w2++) {
        var cl = grp[w2].cr || [];
        for (var y = 0; y < cl.length; y++) if (!seenC[cl[y]]) { seenC[cl[y]] = 1; certs.push(cl[y]); }
      }

      var m = {
        t: last.t,
        n: richestName(grp, 'n') || last.n,
        ne: richestName(grp, 'ne'),
        e: latest(grp, 'e', true) || last.e,
        h: latest(grp, 'h', true) || last.h,
        _e: last._e, _p: last._p,
        g: (function () { for (var i = grp.length - 1; i >= 0; i--) if (grp[i].g) return grp[i].g; return 0; })(),
        nt: (function () { for (var i = grp.length - 1; i >= 0; i--) if (grp[i].nt && grp[i].nt !== 'غير محدد' && grp[i].nt !== 'أخرى') return grp[i].nt; return last.nt; })(),
        nr: latest(grp, 'nr', true),
        ar: (function () { for (var i = 0; i < grp.length; i++) if (grp[i].ar) return 1; return 0; })(),
        ry: (function () { for (var i = grp.length - 1; i >= 0; i--) if (grp[i].ry) return 1; return 0; })(),
        dm: (function () { for (var i = grp.length - 1; i >= 0; i--) if (grp[i].dm) return 1; return 0; })(),
        p: last.p,
        pos: roles,
        x: latest(grp, 'x'), a: latest(grp, 'a'),
        cp: latest(grp, 'cp') || longest(grp, 'cp'), co: latest(grp, 'co') || longest(grp, 'co'),
        emp: (function () { for (var i = grp.length - 1; i >= 0; i--) if (grp[i].emp) return 1; return 0; })(),
        sc: latest(grp, 'sc'), se: latest(grp, 'se'),
        seRaw: latest(grp, 'seRaw', true),
        cv: latest(grp, 'cv', true), dc: latest(grp, 'dc', true),
        ed: (function () {
          var R = { 'ماجستير فأعلى': 4, 'بكالوريوس': 3, 'دبلوم': 2, 'ثانوية': 1, 'غير محدد': 0 }, b = 'غير محدد', r = -1;
          for (var i = 0; i < grp.length; i++) { var k = R[grp[i].ed] === undefined ? 0 : R[grp[i].ed]; if (k > r) { r = k; b = grp[i].ed; } }
          return b;
        })(),
        edr: latest(grp, 'edr') || longest(grp, 'edr'),
        ct: (function () { for (var i = grp.length - 1; i >= 0; i--) if (grp[i].ct && grp[i].ct !== 'أخرى') return grp[i].ct; return last.ct; })(),
        lo: latest(grp, 'lo') || longest(grp, 'lo'),
        tr: longest(grp, 'tr'),
        cr: certs.slice(0, CERT_MAXOUT),
        st: bestStatus(grp),
        subs: grp.length
      };
      out.push(m);
    }

    out.sort(function (a, b) { return (b.t || 0) - (a.t || 0); });
    report.kept = out.length;
    report.multiRole = out.filter(function (r) { return r.pos && r.pos.length > 1; }).length;
    var _cl = Object.create(null);
    for (var z = 0; z < out.length; z++) { var cz = out[z].cr || []; for (var z2 = 0; z2 < cz.length; z2++) _cl[cz[z2]] = 1; }
    report.certLabels = Object.keys(_cl).length;
    return { records: out, report: report };
  }

  root.HRETL = { run: run, statusOf: statusOf, certsOf: certsOf, normEmail: normEmail, normPhone: normPhone };
})(typeof globalThis !== 'undefined' ? globalThis : this);
