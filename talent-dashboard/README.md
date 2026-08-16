# Al Ramsat — Talent Acquisition Dashboard

Executive dashboard for the Al Ramsat recruitment pipeline.
One self-contained HTML file: no build step to open it, no server, no framework.

**Live:** https://maz1988sa-tech.github.io/swiss-austria-2026/talent-dashboard/

---

## What it is

A single `.html` file that reads the recruitment Google Form responses sheet,
cleans and de-duplicates the applicants, and presents the result as five
executive views — pipeline, roles, demographics, compensation and a scoring
engine that ranks candidates against a role profile.

| | |
|---|---|
| Source of candidates | Google Sheet (read-only, pulled live via the gviz API) |
| Shared team state | Supabase — screening statuses, filters, weights, refresh log |
| Offline | Full IndexedDB fallback; the dashboard keeps working with no network |
| Languages | Arabic (RTL) and English, switchable |
| Themes | Light and dark |
| Dependencies at runtime | none — fonts, SheetJS and supabase-js are inlined |

### Views

| # | View | Answers |
|---|---|---|
| 00 | Overview | How many applicants, how are they moving, where do they drop |
| 01 | Roles | Which roles attract volume, which attract quality |
| 02 | Profile | Nationality, age, experience, education, geography |
| 03 | Compensation | Current vs expected salary, the gap by role |
| 04 | Scoring engine | Rank candidates against a weighted role profile |

---

## Data pipeline

Everything runs in the browser. No candidate record is ever sent to a server
that is not Google's own sheet.

1. **Pull** — the sheet is read through the Google Visualization JSONP endpoint,
   which works from `file://` with no CORS proxy. Tabs are probed by row count
   so the largest responses tab is picked automatically.
2. **Normalise** — nationalities are mapped through a dictionary tab
   (304 written forms → ~89 canonical values); Saudi phone numbers are reduced
   to their last 9 digits; Gmail addresses are normalised for dots and `+tags`.
3. **De-duplicate** — union-find over shared email **or** shared phone. A person
   who applies twice under an Arabic and an English spelling of their name is
   merged into one record, keeping the most complete field from each submission.
   *Current data: 13,016 rows → 1,986 duplicates from 1,542 people → 11,030 unique.*
4. **Parse certificates** — the free-text training column is split on 20+
   separators and mapped through a canonical dictionary so
   "PMP", "شهادة PMP" and "Project Management Professional" count once.
5. **Score** — eight weighted criteria, graded rather than pass/fail, with
   raw-score tie-breakers.

---

## Shared workspace

Screening statuses are shared across devices through Supabase. See
[`SUPABASE-SETUP.md`](./SUPABASE-SETUP.md) for the full setup and the security model.

Two design decisions worth knowing:

- **Candidate records are not uploaded.** The shared blob is ~2 KB: statuses,
  filters, scoring weights and the refresh log. The Google Sheet stays the single
  source of truth for the candidates themselves.
- **Identity keys are hashed before upload.** A candidate's identity key is their
  email or phone number. What leaves the browser is a 64-bit FNV fingerprint of
  that key, never the address itself — so the shared table holds no personal data,
  yet every device resolves the same statuses because every device computes the
  same fingerprint.

Concurrency is guarded twice: the browser refuses to write over a version it did
not load, and a `BEFORE UPDATE` trigger in Postgres rejects any stale write that
slips through the race. A conflict shows a banner and a **Load latest** button;
nothing is ever overwritten automatically.

---

## Repository layout

```
index.html             the published build — no sheet URL, no data
src/                   sources
  shell.html           HTML skeleton with build placeholders
  app.js               application: views, filters, modals, i18n, scoring
  app.css              design system
  etl.js               de-duplication, normalisation, certificate parsing
  gsheet.js            Google Sheets JSONP loader and tab probing
  store.js             persistence adapter: Supabase → IndexedDB
  build.js             inlines everything into one file
supabase-schema.sql    tables, RLS policies, stale-write trigger
SUPABASE-SETUP.md      setup and security notes
```

## Building

```bash
cd src
npm install
node build.js --empty             # → Al-Ramsat-Talent-Dashboard-v2.0.html
node build.js --empty --public    # → docs/index.html → copy to ../index.html
```

The default sheet URL is read from `sheet-url.txt` (git-ignored) or the
`SHEET_URL` environment variable. It is deliberately never committed: that link
opens the full candidate database, and this repository is public. The `--public`
build always omits it, so the published page starts empty and only works for
someone who already has the sheet link.

To embed a snapshot of the data in the file:

```bash
HR_XLSX=/path/to/responses.xlsx node build.js
```

---

## Backup

**Export backup** in the data-source dialog writes a single `.xlsx` holding
candidates, screening statuses, filters, weights and the refresh log. Importing
it into a newer build of the dashboard restores all of it — statuses are matched
on four fallbacks (stable key, email, phone, name) so they survive both a
dashboard upgrade and a re-ordered sheet.
