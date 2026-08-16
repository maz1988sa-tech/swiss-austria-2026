/* ===================================================================
   طبقة التخزين — محوّل (Adapter)
   ------------------------------------------------------------------
   المصدر الأساسي  : Supabase  (مساحة عمل مشتركة بين كل الأجهزة)
   الاحتياطي المحلي : IndexedDB (نسخة كاش، تُستخدم فقط عند تعذّر السحابة)

   واجهة Store لم تتغيّر — بقية التطبيق يستدعي نفس الدوال:
     Store.saveWorkspace(ws) → Promise
     Store.loadWorkspace()   → Promise<ws|null>
     Store.clearWorkspace()  → Promise
     Store.readLog / pushSnapshot / clearLog
   =================================================================== */
(function (root) {
  'use strict';

  /* ================= إعدادات Supabase — المكان الوحيد للمفاتيح ================= */
  var SUPABASE_CONFIG = {
    url: 'https://gnbbqxrhrcotjgbjjhxh.supabase.co',
    publishableKey: 'sb_publishable_UnpYvtHE2IvlO5NuLbsZEA_AdlfyeAd',
    workspaceKey: 'alramsat-main',

    /* هل تُرفع سجلات المرشحين (11 ألف سجل ≈ 9 ميجابايت) إلى السحابة؟
       الافتراضي false: بيانات المرشحين مصدرها Google Sheet وهي مشتركة أصلًا،
       والمرفوع هو ما لا يمكن استرجاعه: الحالات والفلاتر والأوزان والسجل (≈ 7 كيلوبايت).
       اجعلها true إن أردت أن تعمل اللوحة على جهاز آخر بلا إنترنت للشيت. */
    includeRecords: false,

    /* هل يُرفع رابط الشيت إلى السحابة؟
       false افتراضيًا: الجدول مقروء لأي حامل للمفتاح العلني، ورابط الشيت
       يفتح قاعدة المرشحين كاملة. يبقى محفوظًا محليًا في كل متصفح. */
    includeSheetUrl: false,

    realtime: true,
    tableWorkspace: 'workspace',
    tableAudit: 'workspace_audit',

    /* مهلات — لا نُبقي المستخدم ينتظر شبكة ميتة.
       القراءة عند الإقلاع أقصر لأنها تحجب شاشة البدء. */
    loadTimeoutMs: 3500,
    saveTimeoutMs: 12000
  };
  root.SUPABASE_CONFIG = SUPABASE_CONFIG;

  /* ================= التخزين المحلي (كما كان) ================= */
  var DB = 'alramsat-ws', STORE = 'ws', KEY = 'workspace';
  var LOG_KEY = 'alr.synclog';
  var LOG_MAX = 5;

  function open() {
    return new Promise(function (res, rej) {
      var q = indexedDB.open(DB, 1);
      q.onupgradeneeded = function () {
        if (!q.result.objectStoreNames.contains(STORE)) q.result.createObjectStore(STORE);
      };
      q.onsuccess = function () { res(q.result); };
      q.onerror = function () { rej(q.error); };
    });
  }
  function tx(mode, fn) {
    return open().then(function (db) {
      return new Promise(function (res, rej) {
        var t = db.transaction(STORE, mode), s = t.objectStore(STORE), out = fn(s);
        t.oncomplete = function () { res(out && out.result !== undefined ? out.result : out); };
        t.onerror = function () { rej(t.error); };
      });
    });
  }
  function localSave(ws) { return tx('readwrite', function (s) { return s.put(ws, KEY); }); }
  function localLoad() { return tx('readonly', function (s) { return s.get(KEY); }).catch(function () { return null; }); }
  function localClear() { return tx('readwrite', function (s) { return s.delete(KEY); }).catch(function () { }); }

  /* ================= سجل التحديثات (أرقام مجمّعة) ================= */
  function readLog() {
    try {
      var v = JSON.parse(localStorage.getItem(LOG_KEY) || '[]');
      return Object.prototype.toString.call(v) === '[object Array]' ? v : [];
    } catch (e) { return []; }
  }
  function writeLog(list) { try { localStorage.setItem(LOG_KEY, JSON.stringify(list.slice(0, LOG_MAX))); } catch (e) { } }
  function pushSnapshot(snap) { var l = readLog(); l.unshift(snap); writeLog(l); return l.slice(0, LOG_MAX); }
  function clearLog() { try { localStorage.removeItem(LOG_KEY); } catch (e) { } }
  function setLog(list) { writeLog(list || []); return readLog(); }

  /* ================= عميل Supabase ================= */
  var sb = null, sbReady = false, sbErr = '';
  var SRV = {                       /* حالة النسخة على الخادم كما رآها هذا المتصفح */
    version: 0, updatedAt: null, updatedBy: null, loaded: false
  };
  var listeners = [];

  function configured() {
    return !!(SUPABASE_CONFIG.url && SUPABASE_CONFIG.publishableKey &&
      SUPABASE_CONFIG.url.indexOf('PUT_') !== 0 && SUPABASE_CONFIG.publishableKey.indexOf('PUT_') !== 0 &&
      /^https?:\/\//.test(SUPABASE_CONFIG.url));
  }
  function client() {
    if (sb || !configured()) return sb;
    try {
      var lib = root.supabase;
      if (!lib || !lib.createClient) { sbErr = 'client-missing'; return null; }
      sb = lib.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.publishableKey, {
        auth: { persistSession: true, autoRefreshToken: true },
        realtime: { params: { eventsPerSecond: 2 } }
      });
      sbReady = true;
    } catch (e) { sbErr = String(e && e.message || e); sb = null; }
    return sb;
  }

  /* مُعرِّف المستخدم — يعمل مع Supabase Auth إن فُعّل، وإلا اسم جهاز محلي */
  function deviceLabel() {
    var k = 'alr.device';
    try {
      var v = localStorage.getItem(k);
      if (!v) { v = 'device-' + Math.random().toString(36).slice(2, 8); localStorage.setItem(k, v); }
      return v;
    } catch (e) { return 'device'; }
  }
  function whoAmI() {
    var c = client();
    if (!c || !c.auth || !c.auth.getUser) return Promise.resolve({ id: null, label: deviceLabel() });
    return c.auth.getUser().then(function (r) {
      var u = r && r.data && r.data.user;
      return u ? { id: u.id, label: u.email || u.id } : { id: null, label: deviceLabel() };
    }).catch(function () { return { id: null, label: deviceLabel() }; });
  }

  /* ---- قراءة النسخة المشتركة ---- */
  function cloudLoad() {
    var c = client();
    if (!c) return Promise.reject(new Error(configured() ? (sbErr || 'client') : 'not-configured'));
    return c.from(SUPABASE_CONFIG.tableWorkspace)
      .select('workspace_data,version,updated_at,updated_by')
      .eq('workspace_key', SUPABASE_CONFIG.workspaceKey)
      .maybeSingle()
      .then(function (r) {
        if (r.error) throw new Error(r.error.message || 'select failed');
        if (!r.data) { SRV = { version: 0, updatedAt: null, updatedBy: null, loaded: true }; return null; }
        SRV = { version: r.data.version || 0, updatedAt: r.data.updated_at, updatedBy: r.data.updated_by, loaded: true };
        return r.data.workspace_data || null;
      });
  }

  /* ---- الإصدار الحالي على الخادم (فحص خفيف قبل الحفظ / للتحقق الدوري) ---- */
  function cloudVersion() {
    var c = client();
    if (!c) return Promise.reject(new Error('not-configured'));
    return c.from(SUPABASE_CONFIG.tableWorkspace)
      .select('version,updated_at,updated_by')
      .eq('workspace_key', SUPABASE_CONFIG.workspaceKey)
      .maybeSingle()
      .then(function (r) {
        if (r.error) throw new Error(r.error.message || 'select failed');
        return r.data ? { version: r.data.version || 0, updatedAt: r.data.updated_at, updatedBy: r.data.updated_by }
          : { version: 0, updatedAt: null, updatedBy: null };
      });
  }

  /* ---- الكتابة مع تحكّم تفاؤلي في التزامن ---- */
  function cloudSave(ws, opts) {
    opts = opts || {};
    var c = client();
    if (!c) return Promise.reject(tag('offline', configured() ? (sbErr || 'client') : 'not-configured'));

    var payload = ws, drop = {};
    if (!SUPABASE_CONFIG.includeRecords) drop.records = 1;
    if (!SUPABASE_CONFIG.includeSheetUrl) drop.sheet = 1;
    if (payload) {
      var omit = false;
      for (var d0 in drop) if (payload[d0] !== undefined) omit = true;
      if (omit) {
        payload = {};
        for (var k in ws) if (!drop[k]) payload[k] = ws[k];
        if (drop.records) { payload.recordsOmitted = true; payload.recordCount = (ws.records || []).length; }
      }
    }

    return cloudVersion().then(function (srv) {
      /* تعارض: نسخة الخادم أحدث مما حمّله هذا المتصفح */
      if (!opts.force && SRV.loaded && srv.version > SRV.version) {
        throw tag('conflict', 'server v' + srv.version + ' > local v' + SRV.version);
      }
      var next = (srv.version || 0) + 1;
      return whoAmI().then(function (me) {
        return c.from(SUPABASE_CONFIG.tableWorkspace).upsert({
          workspace_key: SUPABASE_CONFIG.workspaceKey,
          workspace_data: payload,
          version: next,
          updated_at: new Date().toISOString(),
          updated_by: me.label
        }, { onConflict: 'workspace_key' }).select('version,updated_at,updated_by').maybeSingle()
          .then(function (r) {
            if (r.error) {
              /* حارس قاعدة البيانات رفض كتابة قديمة — نفس معنى التعارض */
              var m = String(r.error.message || '');
              throw tag(/stale write|40001|serialization/i.test(m) ? 'conflict' : 'write', m || 'upsert failed');
            }
            SRV = {
              version: (r.data && r.data.version) || next,
              updatedAt: (r.data && r.data.updated_at) || new Date().toISOString(),
              updatedBy: (r.data && r.data.updated_by) || me.label, loaded: true
            };
            /* سجل تدقيق خفيف — من حفظ ومتى وأي إصدار (بلا نسخ البيانات) */
            c.from(SUPABASE_CONFIG.tableAudit).insert({
              workspace_key: SUPABASE_CONFIG.workspaceKey,
              action: 'save', user_id: me.id, actor: me.label, workspace_version: SRV.version
            }).then(function () { }, function () { });
            return SRV;
          });
      });
    });
  }

  function cloudClear() {
    var c = client();
    if (!c) return Promise.reject(tag('offline', 'not-configured'));
    return c.from(SUPABASE_CONFIG.tableWorkspace).delete()
      .eq('workspace_key', SUPABASE_CONFIG.workspaceKey)
      .then(function (r) {
        if (r.error) throw tag('write', r.error.message);
        SRV = { version: 0, updatedAt: null, updatedBy: null, loaded: true };
      });
  }

  function tag(kind, msg) { var e = new Error(msg || kind); e.kind = kind; return e; }

  /* سباق بين الوعد والمهلة — الرفض بنوع 'offline' حتى يعرضه التطبيق بوضوح */
  function withTimeout(pr, ms, what) {
    if (!ms) return pr;
    return new Promise(function (res, rej) {
      var t = setTimeout(function () { rej(tag('offline', 'timeout: ' + (what || 'request'))); }, ms);
      pr.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); });
    });
  }

  /* ---- Realtime: إشعار بوجود نسخة أحدث (لا استبدال تلقائي) ---- */
  var channel = null;
  function subscribe(cb) {
    if (cb) listeners.push(cb);
    if (channel || !SUPABASE_CONFIG.realtime) return;
    var c = client(); if (!c || !c.channel) return;
    try {
      channel = c.channel('ws-' + SUPABASE_CONFIG.workspaceKey)
        .on('postgres_changes',
          { event: '*', schema: 'public', table: SUPABASE_CONFIG.tableWorkspace,
            filter: 'workspace_key=eq.' + SUPABASE_CONFIG.workspaceKey },
          function (p) {
            var v = (p && p.new && p.new.version) || 0;
            if (v > SRV.version) {
              listeners.forEach(function (f) {
                try { f({ version: v, updatedBy: p.new && p.new.updated_by, updatedAt: p.new && p.new.updated_at }); } catch (e) { }
              });
            }
          })
        .subscribe();
    } catch (e) { channel = null; }
  }

  /* ================= الواجهة الموحّدة ================= */
  var LAST = { source: '', cloudOk: false, error: '' };

  function saveWorkspace(ws, opts) {
    return withTimeout(cloudSave(ws, opts), SUPABASE_CONFIG.saveTimeoutMs, 'save').then(function (srv) {
      localSave(ws).catch(function () { });      /* كاش محلي — لا يؤثر على نتيجة الحفظ */
      LAST = { source: 'cloud', cloudOk: true, error: '' };
      return { cloud: true, version: srv.version, updatedBy: srv.updatedBy };
    }).catch(function (e) {
      LAST = { source: 'cloud', cloudOk: false, error: String(e && e.message || e) };
      /* لا نُظهر نجاحًا كاذبًا: نمرّر الخطأ كما هو ليعرضه التطبيق */
      if (e && e.kind === 'conflict') throw e;
      localSave(ws).catch(function () { });      /* نحفظ محليًا حتى لا يضيع العمل */
      throw e && e.kind ? e : tag('offline', String(e && e.message || e));
    });
  }

  function loadWorkspace() {
    return withTimeout(cloudLoad(), SUPABASE_CONFIG.loadTimeoutMs, 'load').then(function (ws) {
      LAST = { source: 'cloud', cloudOk: true, error: '' };
      if (ws) { localSave(ws).catch(function () { }); return ws; }
      return null;
    }).catch(function (e) {
      LAST = { source: 'local', cloudOk: false, error: String(e && e.message || e) };
      return localLoad();
    });
  }

  function clearWorkspace() {
    return withTimeout(cloudClear(), SUPABASE_CONFIG.saveTimeoutMs, 'clear')
      .catch(function () { }).then(function () { return localClear(); });
  }

  root.Store = {
    /* نفس الواجهة القديمة */
    saveWorkspace: saveWorkspace, loadWorkspace: loadWorkspace, clearWorkspace: clearWorkspace,
    readLog: readLog, pushSnapshot: pushSnapshot, clearLog: clearLog, setLog: setLog, LOG_MAX: LOG_MAX,
    /* إضافات السحابة */
    configured: configured,
    server: function () { return SRV; },
    status: function () { return { configured: configured(), ready: sbReady, last: LAST, srv: SRV }; },
    cloudVersion: cloudVersion,
    localLoad: localLoad, localSave: localSave, localClear: localClear,
    subscribe: subscribe, whoAmI: whoAmI,
    CONFIG: SUPABASE_CONFIG
  };
})(typeof globalThis !== 'undefined' ? globalThis : this);
