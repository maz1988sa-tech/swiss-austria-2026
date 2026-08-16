/* ===================================================================
   جسر Google Sheets — يقرأ الشيت مباشرة داخل المتصفح
   يستخدم واجهة gviz عبر JSONP، فلا يحتاج خادمًا ولا مفتاح API،
   ولا يصطدم بقيود CORS التي تمنع fetch من ملف محلي.
   الشرط الوحيد: أن يكون الشيت مشاركًا «لأي شخص لديه الرابط».
   =================================================================== */
(function (root) {
  'use strict';

  var SEQ = 0;

  /* استخراج رقم الورقة (gid) من الرابط إن وُجد — يثبّت التبويب بدقة */
  function gidOf(url) {
    var s = String(url || '');
    var m = s.match(/[#&?]gid=(\d+)/);
    return m ? m[1] : '';
  }

  /* استخراج معرّف الشيت من أي صيغة رابط */
  function sheetIdOf(url) {
    var s = String(url || '').trim();
    if (!s) return '';
    if (/^[A-Za-z0-9_-]{20,}$/.test(s)) return s;              /* معرّف مباشر */
    var m = s.match(/\/spreadsheets\/d\/(?:e\/)?([A-Za-z0-9_-]+)/);
    if (m) return m[1];
    m = s.match(/[?&]id=([A-Za-z0-9_-]+)/);
    return m ? m[1] : '';
  }

  /* تحويل قيمة gviz إلى قيمة صالحة لـ SheetJS */
  var DATE_RE = /^Date\((\d+),(\d+),(\d+)(?:,(\d+),(\d+),(\d+))?\)$/;
  function cellValue(c) {
    if (c == null) return null;
    var v = c.v;
    if (v == null || v === '') return null;
    if (typeof v === 'string') {
      var m = DATE_RE.exec(v);
      if (m) {
        return new Date(+m[1], +m[2], +m[3], +(m[4] || 0), +(m[5] || 0), +(m[6] || 0));
      }
      return v;
    }
    if (Object.prototype.toString.call(v) === '[object Array]') return c.f || v.join(':');
    return v;
  }

  /* جلب عبر JSONP — target = {sheet} أو {gid} */
  function fetchSheet(id, target, timeoutMs, tq) {
    return new Promise(function (resolve, reject) {
      var cb = '__gv' + (++SEQ) + '_' + Math.floor(performance.now());
      var url = 'https://docs.google.com/spreadsheets/d/' + encodeURIComponent(id) +
        '/gviz/tq?tqx=out:json;responseHandler:' + cb;
      target = target || {};
      if (target.gid) url += '&gid=' + encodeURIComponent(target.gid);
      else if (target.sheet) url += '&sheet=' + encodeURIComponent(target.sheet);
      if (tq) url += '&tq=' + encodeURIComponent(tq);

      var script = document.createElement('script');
      var done = false;
      var timer = setTimeout(function () { finish(new Error('timeout')); }, timeoutMs || 25000);

      function finish(err, data) {
        if (done) return; done = true;
        clearTimeout(timer);
        try { delete root[cb]; } catch (e) { root[cb] = undefined; }
        if (script.parentNode) script.parentNode.removeChild(script);
        err ? reject(err) : resolve(data);
      }

      root[cb] = function (res) {
        if (!res || res.status === 'error') {
          var msg = (res && res.errors && res.errors[0] && (res.errors[0].detailed_message || res.errors[0].message)) || 'query error';
          return finish(new Error(String(msg).replace(/<[^>]+>/g, '').slice(0, 160)));
        }
        finish(null, res.table);
      };
      script.onerror = function () { finish(new Error('network')); };
      script.src = url;
      document.head.appendChild(script);
    });
  }

  /* table → مصفوفة ثنائية: صف العناوين ثم الصفوف */
  function tableToAoa(table) {
    if (!table || !table.cols) return [];
    var head = table.cols.map(function (c) { return c.label == null ? '' : String(c.label); });
    var out = [head];
    var rows = table.rows || [];
    for (var i = 0; i < rows.length; i++) {
      var c = (rows[i] && rows[i].c) || [];
      var line = [];
      for (var j = 0; j < head.length; j++) line.push(cellValue(c[j]));
      out.push(line);
    }
    return out;
  }

  function looksLikeResponses(aoa) {
    if (!aoa.length) return false;
    var h = aoa[0].join('|').toLowerCase();
    return h.indexOf('timestamp') >= 0 || h.indexOf('nationality') >= 0;
  }
  function looksLikeDict(aoa) {
    if (!aoa.length) return false;
    var h = aoa[0].join('|');
    if (h.toLowerCase().indexOf('timestamp') >= 0) return false;   /* رجع لورقة الردود */
    return h.indexOf('الجنسية الموحدة') >= 0 || h.indexOf('الكلمة المفتاحية') >= 0;
  }

  var MAIN_NAMES = ['Form Responses 1', 'Form responses 1', 'ردود النموذج 1'];
  var DICT_NAMES = ['تصنيف الجنسيات'];

  /* عدّ الصفوف في تبويب معيّن — طلب صغير جدًا (عدة بايتات) */
  function probeCount(id, target) {
    return fetchSheet(id, target, 20000, 'select count(B)').then(function (t) {
      try {
        var v = t.rows[0].c[0].v;
        return (typeof v === 'number' && isFinite(v)) ? v : 0;
      } catch (e) { return 0; }
    }).catch(function () { return 0; });
  }

  function labelOf(target) {
    return target.gid ? ('gid ' + target.gid) : (target.sheet || '(الورقة الأولى)');
  }

  /* يبني كائن Workbook متوافق مع SheetJS ليعمل ETL دون أي تعديل */
  function load(url, onStep) {
    var id = sheetIdOf(url), gid = gidOf(url);
    if (!id) return Promise.reject(new Error('bad-url'));
    var step = onStep || function () { };
    var info = { id: id, main: '', dict: '', rows: 0, scanned: [] };

    step('connect');

    /* 1) اختيار التبويب الصحيح */
    var pick;
    if (gid) {
      pick = Promise.resolve({ gid: gid });                       /* الرابط يحدّد التبويب */
    } else {
      /* نقيس عدد الصفوف في كل تبويب مرشّح ونختار الأكبر —
         هذا يمنع القراءة من تبويب صغير بالخطأ. */
      var cands = [{}].concat(MAIN_NAMES.map(function (n) { return { sheet: n }; }));
      pick = Promise.all(cands.map(function (t) {
        return probeCount(id, t).then(function (n) { return { t: t, n: n }; });
      })).then(function (res) {
        res.sort(function (a, b) { return b.n - a.n; });
        if (!res.length || res[0].n <= 0) { info.probeFailed = true; return null; }
        res.forEach(function (r) { if (r.n > 0) info.scanned.push(labelOf(r.t) + ': ' + r.n); });
        return res[0].t;
      });
    }

    /* إن تعذّر القياس (عمود فارغ أو رفض الاستعلام) نرجع للتجربة المتسلسلة */
    function sequential() {
      var chain = Promise.reject();
      MAIN_NAMES.map(function (n) { return { sheet: n }; }).concat([{}]).forEach(function (t) {
        chain = chain.catch(function () {
          return fetchSheet(id, t, 90000).then(function (tb) {
            var aoa = tableToAoa(tb);
            if (!looksLikeResponses(aoa)) throw new Error('not-responses');
            return { aoa: aoa, target: t };
          });
        });
      });
      return chain;
    }

    return pick.then(function (target) {
      step('probe', info);
      if (!target) return sequential();
      return fetchSheet(id, target, 90000).then(function (t) {
        var aoa = tableToAoa(t);
        if (!looksLikeResponses(aoa)) throw new Error('not-responses');
        return { aoa: aoa, target: target };
      });
    }).then(function (got) {
      info.main = labelOf(got.target);
      info.rows = Math.max(0, got.aoa.length - 1);
      step('main', info);
      return got.aoa;
    }).then(function (mainAoa) {
      /* 2) ورقة قاموس الجنسيات — اختيارية */
      var dictChain = Promise.reject();
      DICT_NAMES.forEach(function (nm) {
        dictChain = dictChain.catch(function () {
          return fetchSheet(id, { sheet: nm }, 30000).then(function (t) {
            var aoa = tableToAoa(t);
            if (!looksLikeDict(aoa)) throw new Error('no-dict');
            info.dict = nm;
            return aoa;
          });
        });
      });
      return dictChain.catch(function () { return null; }).then(function (dictAoa) {
        step('dict', info);
        var wb = { SheetNames: [], Sheets: {} };
        wb.SheetNames.push('Form Responses 1');
        wb.Sheets['Form Responses 1'] = XLSX.utils.aoa_to_sheet(mainAoa, { cellDates: true });
        if (dictAoa) {
          wb.SheetNames.push('تصنيف الجنسيات');
          wb.Sheets['تصنيف الجنسيات'] = XLSX.utils.aoa_to_sheet(dictAoa, { cellDates: true });
        }
        return { wb: wb, info: info };
      });
    });
  }

  root.GSheet = { load: load, sheetIdOf: sheetIdOf, gidOf: gidOf };
})(typeof globalThis !== 'undefined' ? globalThis : this);
