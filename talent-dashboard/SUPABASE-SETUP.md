# Al Ramsat — Talent Dashboard · Shared Storage Setup

> **This project is already configured and live.** The steps below document how it
> was wired up, and how to point the dashboard at a different Supabase project.
>
> | | |
> |---|---|
> | Supabase project | `alramsat-talent-dashboard` (`gnbbqxrhrcotjgbjjhxh`, eu-central-1) |
> | Project URL | `https://gnbbqxrhrcotjgbjjhxh.supabase.co` |
> | Key in the HTML | publishable (`sb_publishable_…`) — safe for the browser |
> | Tables | `workspace`, `workspace_audit` |
> | RLS | enabled on both, Stage 1 policies (see `supabase-schema.sql`) |

---

## What changed in the dashboard

Nothing about the design, the layout, the candidate analysis, the deduplication,
the certificate parsing or the Google Sheet pipeline was touched. Only the
**persistence layer** was replaced.

| Layer | Before | After |
|---|---|---|
| `Store.saveWorkspace` | IndexedDB only | Supabase first → IndexedDB cache |
| `Store.loadWorkspace` | IndexedDB only | Supabase first → IndexedDB fallback |
| `Store.clearWorkspace` | IndexedDB only | Supabase then IndexedDB |
| Refresh log | `localStorage` only | travels inside the shared workspace |
| Candidate records | in the saved blob | **stay in Google Sheets** (see below) |

`app.js` calls the same four `Store.*` functions it always did. The adapter lives
entirely in the `store.js` block inside the HTML.

### Google Sheets is still the source of candidates

The shared workspace carries **screening statuses, filters, scoring weights,
the selected view, the sheet URL and the refresh log** — about **7 KB**.
It does **not** carry the 11,000 candidate records (~9 MB), because the sheet
already is the shared, always-current source for those. On open, a device pulls
candidates from the sheet and applies the shared statuses on top.

To store records in the cloud too, set one line in the HTML:

```js
includeRecords: true    // SUPABASE_CONFIG, inside the store.js block
```

Expect ~9 MB per save. Everything else keeps working unchanged.

---

## Setup — 11 steps

Follow these only if you are pointing the dashboard at a **new** Supabase project.

### 1. Create a Supabase account
Go to <https://supabase.com> and sign up (GitHub login is fastest).

### 2. Create a project
Dashboard → **New project**.
Name it `alramsat-talent-dashboard`, pick a region near you
(`eu-central-1` / Frankfurt is a good default for Saudi Arabia),
set a database password and store it in your password manager.
The **Free** plan is enough: $0/month.

Wait ~2 minutes for the project to finish provisioning.

### 3. Run the schema
Open **SQL Editor → New query**, paste the whole contents of
[`supabase-schema.sql`](./supabase-schema.sql), and press **Run**.

It creates both tables, the stale-write guard, the indexes,
enables Row Level Security and adds `workspace` to the Realtime publication.
Running it twice is safe.

### 4. Copy the Project URL
**Project Settings → API → Project URL**.
It looks like `https://xxxxxxxxxxxx.supabase.co`.

### 5. Copy the publishable key
**Project Settings → API keys → Publishable key** (`sb_publishable_…`).

> ⚠ Copy the **publishable** (or legacy **anon**) key only.
> **Never** copy the `service_role` key or the database password into the HTML —
> those bypass Row Level Security completely. They belong in a password manager,
> never in a file you host or share.

### 6. Paste both into the dashboard
Open `Al-Ramsat-Talent-Dashboard-v2.0.html` in a text editor and search for
`SUPABASE_CONFIG`. It appears **once**, near the top of the storage block:

```js
var SUPABASE_CONFIG = {
  url:            'https://gnbbqxrhrcotjgbjjhxh.supabase.co',
  publishableKey: 'sb_publishable_UnpYvtHE2IvlO5NuLbsZEA_AdlfyeAd',
  workspaceKey:   'alramsat-main',
  includeRecords: false,
  realtime:       true,
  tableWorkspace: 'workspace',
  tableAudit:     'workspace_audit'
};
```

Replace the first two values. These are the only two lines you ever edit —
the keys are not scattered anywhere else in the file.

### 7. Confirm RLS is on
**Authentication → Policies**. Both `workspace` and `workspace_audit` must show
**RLS enabled** with the policies from step 3 listed.
Do not disable RLS to make something work — if a call fails, fix the policy.

### 8. Open the dashboard and check the indicator
A small pill appears in the header next to the icons:

| Pill | Meaning |
|---|---|
| 🟢 **مشترك / Shared** | Connected to Supabase; saves go to the shared workspace |
| 🟡 **محلي فقط / Local only** | Supabase unreachable; saving writes to this browser only |
| ⚪ **غير مُهيّأ / Not configured** | Keys are still the `PUT_…` placeholders |

Hover it for the current version and who saved last. Click it to re-check.

### 9. First save
Press the refresh arrow to pull from Google Sheets, change a status, press
**Save**. The toast must read
**«تم الحفظ في مساحة العمل المشتركة · النسخة 1»**.

If Supabase is unreachable you get
**«تعذر الوصول إلى التخزين المشترك. لم يتم حفظ التغييرات على الخادم.»**
instead — the success message is never shown for a write the server did not confirm.

### 10. Verify from a second device
Open the same link on another computer or in a private window.
It should load the shared statuses and filters automatically, then pull the
candidates from the sheet.

Check the data landed:

```sql
select workspace_key, version, updated_by, updated_at from public.workspace;
select actor, workspace_version, created_at
  from public.workspace_audit order by created_at desc limit 20;
```

### 11. Lock it down before the link spreads
The shipped policies are **Stage 1**: anyone with the link can read and write the
shared workspace. That is fine for an unlisted link inside the recruitment team.
Before the link goes any wider, enable Supabase Auth, invite the team, then run
the **Stage 2** block at the bottom of `supabase-schema.sql`. No code change is
needed — supabase-js starts sending the session token automatically.

---

## How conflicts are handled

Every save carries a `version`. Two independent guards prevent silent overwrites:

1. **In the browser** — before writing, the dashboard re-reads the server version.
   If the server is ahead of what this browser loaded, the write is refused.
2. **In the database** — a `BEFORE UPDATE` trigger rejects any row whose incoming
   version is not strictly greater than the stored one. This closes the race where
   two browsers read the same version at the same moment.

When a conflict happens the user sees
**«تم تحديث البيانات بواسطة مستخدم آخر. يرجى تحميل آخر نسخة قبل الحفظ.»**
and a banner offering **تحميل أحدث نسخة / Load latest**.
Their unsaved work stays on screen until they choose. Nothing is overwritten
automatically — not on load, not on Realtime notification, not on conflict.

With Realtime on, an already-open dashboard shows that banner the moment someone
else saves, without waiting for the next save attempt.

---

## Behaviour when Supabase is unavailable

| Situation | What happens |
|---|---|
| Keys not set | Pill shows **غير مُهيّأ**; storage is local IndexedDB, exactly as before |
| Network down | Pill turns 🟡; load falls back to the local cache; **save shows a warning and keeps the unsaved-changes dot on** |
| Conflict | Save refused, banner offered, nothing overwritten |

A save that the server did not confirm never shows the success message and never
clears the "unsaved changes" indicator.

---

## Migrating an existing local workspace

The first time you open a configured dashboard on a browser that already holds a
locally saved workspace, and the shared workspace is still empty, you are asked:

> تم العثور على مساحة عمل محفوظة على هذا الجهاز. هل تريد رفعها لتصبح النسخة المشتركة؟

Accepting uploads it as version 1. The prompt appears once per browser and never
overwrites an existing shared workspace.

---

## Security summary

- Only the **publishable** key ships in the HTML. It is designed for browsers.
- `service_role` keys and the database password appear **nowhere** in the file,
  the repository, or this document.
- RLS is enabled on both tables and is never disabled as a workaround.
- Browser writes are restricted to the single `workspace_key = 'alramsat-main'` row.
- The audit table is append-only from the browser: insert and read, no update or delete.
- The excel/CSV backup export still works and remains the offline safety net.

**If the publishable key is ever exposed somewhere it should not be**, rotate it in
**Project Settings → API keys**, then update the one line in the HTML.
