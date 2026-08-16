/* ============================================================================
   Al Ramsat — Talent Dashboard · build
   ----------------------------------------------------------------------------
   Inlines every asset into one self-contained HTML file.

     node build.js --empty            → Al-Ramsat-Talent-Dashboard-v2.0.html
                                        (ships with no data; pulls from the sheet)
     node build.js                    → …-with-data.html   (needs HR_XLSX)
     node build.js --empty --public   → docs/index.html    (GitHub Pages build)

   The default Google Sheet URL is NEVER hard-coded here: it opens the whole
   candidate database, so it must not live in a public repository. Provide it
   through `sheet-url.txt` (git-ignored) or the SHEET_URL environment variable.
   The --public build always omits it.
   ========================================================================== */
const fs = require('fs'), zlib = require('zlib'), path = require('path');

const EMPTY = process.argv.includes('--empty');
const PUBLIC = process.argv.includes('--public');

/* ---- default sheet URL: local-only, never committed ---------------------- */
function sheetUrl() {
  if (PUBLIC) return '';
  if (process.env.SHEET_URL) return process.env.SHEET_URL.trim();
  try { return fs.readFileSync('sheet-url.txt', 'utf8').trim(); } catch (e) { return ''; }
}

/* ---- candidate data is only needed for the --with-data build ------------- */
let gz = '', report = 'null';
if (!EMPTY) {
  global.XLSX = require('xlsx'); require('./etl.js');
  const { pack } = require('./packlib.js');
  const SRC = process.env.HR_XLSX;
  if (!SRC) throw new Error('set HR_XLSX=/path/to/responses.xlsx, or pass --empty');
  const out = HRETL.run(XLSX.readFile(SRC, { cellDates: true }));
  gz = zlib.gzipSync(Buffer.from(JSON.stringify(pack(out.records)), 'utf8'), { level: 9 }).toString('base64');
  report = JSON.stringify(out.report);
  console.log('etl', report);
}

let html = fs.readFileSync('shell.html', 'utf8');
const put = (tok, val) => {
  const i = html.indexOf(tok);
  if (i < 0) throw new Error('token missing ' + tok);
  html = html.slice(0, i) + val + html.slice(i + tok.length);
};

put('/*__FONTS__*/', fs.readFileSync('fonts.css', 'utf8'));
put('/*__CSS__*/', fs.readFileSync('app.css', 'utf8'));
put('/*__XLSX__*/', fs.readFileSync('node_modules/xlsx/dist/xlsx.mini.min.js', 'utf8'));
put('/*__ETL__*/', fs.readFileSync('etl.js', 'utf8'));
put('/*__GSHEET__*/', fs.readFileSync('gsheet.js', 'utf8'));
put('/*__SUPABASE__*/', fs.readFileSync('node_modules/@supabase/supabase-js/dist/umd/supabase.js', 'utf8'));
put('/*__STORE__*/', fs.readFileSync('store.js', 'utf8'));
put('/*__SHEETURL__*/', sheetUrl());
put('/*__PACK__*/', gz);
put('/*__REPORT__*/', report);

const B = JSON.parse(fs.readFileSync('brand/b64.json', 'utf8'));
put('/*__FAVB64__*/', B.fav);
put('/*__LOGOL__*/', B.light);
put('/*__LOGOD__*/', B.dark);
put('/*__APP__*/', fs.readFileSync('app.js', 'utf8'));

const OUT = PUBLIC ? 'docs/index.html'
  : (EMPTY ? 'Al-Ramsat-Talent-Dashboard-v2.0.html' : 'Al-Ramsat-Talent-Dashboard-v2.0-with-data.html');
if (PUBLIC) fs.mkdirSync('docs', { recursive: true });
fs.writeFileSync(OUT, html);
console.log('built', OUT, (fs.statSync(OUT).size / 1e6).toFixed(2) + 'MB',
  EMPTY ? '(no embedded data)' : '', PUBLIC ? '(public: no sheet URL)' : '');
