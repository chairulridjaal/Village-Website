# cms-nontech-overhaul - Work Plan

## TL;DR (For humans)

**What you'll get:** A village website and admin panel that non-technical staff can fully run: invent new population statistics categories, add unlimited potensi pages, manage menus/footer, create admin accounts with fine permissions, chat petugas on WhatsApp after submitting a letter request, and write content in a real rich-text editor.

**Why this approach:** Build on the existing Astro + D1 + form-POST admin (no VPS, no SPA rewrite). Replace fixed JSON blobs and hardcoded pages with proper tables and CMS screens, mirror the working UMKM pattern for potensi, and put TipTap only in the browser so Cloudflare Workers stay simple.

**What it will NOT do:** No automatic WhatsApp sending (only open chat links). No GitHub auto-deploy. No full headless CMS product. No deleting the last master admin or emptying the public header menu.

**Effort:** XL  
**Risk:** High — large surface (auth, schema, public routes, editor) and data migration must not wipe live Prodeskel stats  
**Decisions to sanity-check:** Permission flag list; TipTap (not another editor); nav is reorderable links not free HTML; old `stat_*` keys migrate then stay as read-only fallback one release

Your next move: say **start work** / `$start-work` to execute, or ask for a high-accuracy plan review first. Full execution detail follows below.

---

> TL;DR (machine): XL/High — custom stat categories, potensi CRUD+dynamic routes, master+perms, wa_pelayanan CTA, TipTap, nav/footer CMS, map+schema fixes

## Scope

### Must have

1. **Fully custom Statistik Desa**
   - Admin can create/rename/reorder/hide **categories** (e.g. Golongan Umur, Agama) and **rows** under each.
   - Two row layouts: `simple` (label + number) and `dusun` (label, RW, jml RW, L, P, KK).
   - Public `/profil` and beranda summary render **all active categories dynamically** (no hardcoded Golongan Umur / Pendidikan / etc.).
   - `stat_umum` (luas, rw, rt, and summary numbers) remains editable key-value in pengaturan OR a fixed “Ringkasan” card on the statistik admin page.
   - One-time migration seeds categories from existing `stat_dusun`, `stat_umur`, `stat_pendidikan`, `stat_pencaharian` JSON **without data loss**.

2. **Potensi CMS + unlimited pages**
   - New `potensi` table (UMKM-like): nama, slug, ringkasan, deskripsi_html, optional stats_json cards, cover via media, status draft|published, urutan.
   - Admin CRUD under `/admin/potensi`.
   - Public `/potensi` hub lists published items; `/potensi/[slug]` dynamic detail.
   - Seed Perikanan, Pertanian, SDM from current hardcoded copy; remove static `perikanan.astro` / `pertanian.astro` / `sdm.astro` after switch.
   - Sitemap/export include potensi.

3. **Multi-admin + master + permission flags**
   - Schema: `admin_user` gains `is_master INTEGER`, `aktif INTEGER`, and permission columns (or single `permissions_json`).
   - Flags (boolean, default for new non-master as noted):
     | Flag | Controls | Default new admin |
     |------|----------|-------------------|
     | `perm_konten` | page_section, statistik categories, perangkat, nav/footer | 1 |
     | `perm_pelayanan` | jenis + pengajuan | 1 |
     | `perm_umkm` | UMKM | 1 |
     | `perm_berita` | Berita | 1 |
     | `perm_peta` | Titik peta | 1 |
     | `perm_media` | Media library | 1 |
     | `perm_pengaturan` | Kontak, WA, map, site identity | 0 |
     | (master only UI) | Create/reset/deactivate admins, grant flags | — |
   - First existing user (lowest id) becomes `is_master=1` with all perms=1 on migrate.
   - Session KV stores `{ userId, username, is_master, perms[] }`; `App.Locals.user` updated; middleware loads full session.
   - Every `/api/admin/*` and admin page checks the relevant flag (master bypasses all).
   - UI `/admin/akun` (master only): list, create, reset password, toggle aktif, edit flags. Cannot deactivate/demote last master. Cannot delete last master.

4. **WA chat after pelayanan submit**
   - New pengaturan key `wa_pelayanan` (E.164 or local; store digits; display helper).
   - Editable under Pengaturan → section “Pelayanan”.
   - `/pelayanan/sukses`: large primary CTA **“Chat petugas via WhatsApp”** using `wa.me/<digits>?text=<prefilled>` including nomor pengajuan + encouragement copy. If empty, secondary message: “Nomor petugas belum diset — hubungi kantor desa” + link to kontak (no broken button).
   - Also show CTA on status page when result found (optional same helper).

5. **CMS UX redesign + TipTap**
   - Regroup `AdminLayout` sidebar into Indonesian groups:
     - **Dasbor**
     - **Konten:** Halaman, Statistik Desa, Perangkat, Menu situs
     - **Layanan:** Pengajuan, Jenis surat
     - **Direktori:** UMKM, Potensi, Berita, Peta, Media
     - **Sistem:** Pengaturan, Akun admin (master), Kunjungan & Backup (old Statistik analytics)
   - Plain-language labels, short help under each section title, “Lihat di situs” deep links where relevant.
   - Task-oriented dasbor cards gated by perms + pending pengajuan count.
   - Replace contenteditable + `AdminEditorToolbar` with **TipTap React island** (`@tiptap/react` + starter-kit + link + image) used by berita, umkm, konten, potensi. Image upload reuses existing `/api/admin/media` + webp pipeline. Server-side HTML allowlist sanitize on save.
   - Keep form POST save pattern (hidden input gets HTML on submit).

6. **Extras (user selected)**
   - Pengaturan: `map_lat`, `map_lng`, `map_zoom` (seed from current kantor GPS `-7.009933224557312, 106.58103748650889`, zoom 15). `kontak.astro` + any map defaults read these.
   - Fix stale **Simpenan** / old address in `Layout.astro` JSON-LD and page meta to Palabuhanratu + pengaturan (`kontak_alamat`, `kontak_email`, optional `kecamatan`/`kabupaten` keys).
   - Peta admin: when jenis=umkm, **dropdown of UMKM** (slug auto); optional potensi dropdown when jenis=potensi; no free-typed slug required for those types.
   - **Public nav + footer “Jelajahi” fully from CMS** via `nav_item` table (`location` header|footer, label, href, urutan, aktif, style `link`|`cta`). Seed current items. Admin reorder UI. Guard: at least one active header item. Brand block (logo text) stays code unless later; footer identity paragraph may stay fixed Indonesian one-liner or single pengaturan `footer_tagline`.

### Must NOT have (guardrails)

- No WhatsApp Cloud API / autosend; only `wa.me` links.
- No requirement for GitHub Actions / auto-deploy.
- No full SPA admin (Astro pages + islands only).
- No TipTap running on the Worker SSR path (client island only).
- No dropping live stats/potensi content without seed migration.
- No empty public header nav; no delete/deactivate last master.
- No `as any` / `@ts-ignore`; no empty catch.
- Do not reintroduce wisata.
- Do not change production resource IDs in `wrangler.toml` casually.
- Do not expand to multi-language or multi-desa in this plan.
- Free-form HTML for entire nav (XSS risk) — only structured label+href rows.

## Verification strategy

> Zero human intervention - all verification is agent-executed.

- Test decision: **tests-after** + agent-executed smoke via `npm run build`, local D1 migrations, and targeted page/API checks with curl/Playwright where available. No existing unit test harness — do not invent a full Jest suite unless trivial pure helpers (slug, sanitize, zip) get small node assert scripts under `scripts/qa/`.
- Evidence: `.omo/evidence/task-<N>-cms-nontech-overhaul.*`
- After all waves: F1–F4 must APPROVE before claiming done; then **user** confirms production deploy.

## Execution strategy

### Parallel execution waves

| Wave | Focus | Notes |
|------|--------|------|
| 0 | Schema foundation migrations + types + session shape | Blocks almost everything |
| 1 | Auth perms + akun UI + middleware gates | Parallel with data libs after 0 |
| 2 | Statistik custom categories (admin + public) | After 0 |
| 3 | Potensi CRUD + public routes | After 0; parallel 2 |
| 4 | TipTap editor island + replace all editors | After 0; parallel 2–3 |
| 5 | Nav/footer CMS + map/schema + peta dropdown + WA sukses | After 0; pengaturan keys early |
| 6 | Admin IA redesign (layout/dasbor) + polish | After features land so menu points real routes |
| 7 | Export/sitemap/cache purge + deploy checklist | End |

### Dependency matrix

| Todo | Depends on | Blocks | Can parallelize with |
| --- | --- | --- | --- |
| 1 Schema+migrate | — | 2–12 | — |
| 2 Session+middleware perms | 1 | 3, all API gates | 4,5 |
| 3 Akun admin UI | 2 | — | 4–11 |
| 4 Statistik lib+admin | 1 | 5 | 6,7,8 |
| 5 Statistik public | 4 | — | 6–11 |
| 6 Potensi lib+admin | 1 | 7 | 4,8 |
| 7 Potensi public routes | 6 | — | 4,5,8 |
| 8 TipTap island | 1 | 9 | 4,6 |
| 9 Wire TipTap all forms | 8 | — | 5,7,10 |
| 10 Nav/footer CMS | 1 | 11 | 4,6,8 |
| 11 Public Nav/Footer read CMS | 10 | — | 5,7,9 |
| 12 WA+map+schema+peta UX | 1 | — | 4–11 |
| 13 Admin layout IA | 3,4,6,10,12 (routes exist) | — | late |
| 14 Export/sitemap/purge/QA | all feature todos | F-wave | — |

## Todos

> Implementation + Test = ONE todo. Never separate.
<!-- APPEND TASK BATCHES BELOW THIS LINE WITH edit/apply_patch - never rewrite the headers above. -->

- [ ] 1. D1 migrations: auth, statistik, potensi, nav, pengaturan keys + data seed
  What to do:
  - Add `migrations/0013_cms_nontech.sql` (or split 0013–0016 if cleaner) that:
    1. `ALTER TABLE admin_user ADD` `is_master`, `aktif`, and permission ints (or `permissions_json TEXT`); backfill id=1 (or MIN(id)) master+all perms; others `is_master=0`, `aktif=1`, content perms=1, `perm_pengaturan=0`.
    2. Create `stat_kategori` + `stat_baris`; seed from current pengaturan JSON for dusun/umur/pendidikan/pencaharian; keep old keys intact for fallback.
    3. Create `potensi` table; INSERT three rows from current static page copy (perikanan, pertanian, sdm) status published.
    4. Create `nav_item`; seed header + footer from current `Nav.astro` / Footer Jelajahi lists (Kontak as `style=cta` header).
    5. INSERT pengaturan keys: `wa_pelayanan` '', `map_lat`, `map_lng`, `map_zoom`, `kecamatan` Palabuhanratu, `kabupaten` Sukabumi, `footer_tagline` optional.
  - Document apply order: local `npm run db:setup` / `wrangler d1 migrations apply ... --local` then remote before deploy.
  Must NOT do: drop old stat_* keys in same migration; change wrangler resource IDs; touch wisata.
  Parallelization: Wave 0 | Blocked by: — | Blocks: all
  References: `migrations/0001_schema.sql` (admin_user), `migrations/0005_pengaturan.sql` (stat JSON), `src/pages/potensi.astro`, `src/pages/potensi/*.astro`, `src/components/Nav.astro` lines 9–18, `src/components/Footer.astro` lines 39–46, kontak map coords in `src/pages/kontak.astro`
  Acceptance criteria (agent-executable):
  - `npx wrangler d1 migrations apply web-desa-citarik-db --local` exits 0
  - SQL check: `SELECT COUNT(*) FROM stat_kategori` ≥ 4; `stat_baris` ≥ rows from seed; `potensi` = 3; `nav_item` ≥ 8; admin_user has is_master row
  QA scenarios:
  - happy: apply on fresh local DB after prior migrations → counts match; Evidence `.omo/evidence/task-1-cms-nontech-overhaul-migrate.txt`
  - failure: re-apply is idempotent / does not duplicate seed (use INSERT OR IGNORE / guarded seeds); Evidence same file section FAIL-REAPPLY
  Commit: Y | `feat(db): cms overhaul schema auth stats potensi nav`

- [ ] 2. Session payload + middleware + permission helpers + Locals types
  What to do:
  - Extend `src/lib/auth/session.ts`: createSession/validateSession store/load `{ userId, username, is_master, perms: string[] }`; invalidate old username-only sessions gracefully (force re-login).
  - Update login + setup APIs to write full session after reading admin_user row.
  - `src/env.d.ts` Locals.user full shape.
  - `src/lib/auth/permissions.ts`: `requirePerm(locals, flag)`, `isMaster`, flag constants matching columns.
  - Middleware: set locals; optional early 403 for known paths is OK but prefer page/API checks.
  Must NOT do: store password in KV; break public routes.
  Parallelization: Wave 1 | Blocked by: 1 | Blocks: 3, API work
  References: `src/lib/auth/session.ts`, `src/middleware.ts`, `src/pages/api/admin/login.ts`, `src/pages/api/admin/setup.ts`, `src/env.d.ts`
  Acceptance criteria:
  - `npm run build` succeeds
  - Typecheck: Locals.user includes perms; login path still sets cookie
  QA:
  - happy: validateSession round-trip shape in small script or wrangler dev login
  - failure: missing session still 401/redirect; Evidence `.omo/evidence/task-2-cms-nontech-overhaul-auth.txt`
  Commit: Y | `feat(auth): session roles and permission helpers`

- [ ] 3. Master admin account management UI + APIs
  What to do:
  - Pages: `/admin/akun` list; create form; edit flags; reset password; toggle aktif.
  - APIs under `/api/admin/akun/*` — master-only; rate-limit create; min password 8; unique username.
  - Guards: cannot set is_master=0 on last master; cannot set aktif=0 on last master; non-master 403.
  - First setup still creates master with all perms.
  Must NOT do: expose password hashes; allow non-master to list users.
  Parallelization: Wave 1 | Blocked by: 2 | Blocks: —
  References: `src/pages/admin/setup.astro`, `src/pages/api/admin/setup.ts`, AdminLayout menu
  Acceptance criteria:
  - Master can create second admin; second admin can login; second cannot open `/admin/akun` (403/redirect)
  - Attempt deactivate last master rejected with Indonesian error
  QA: happy create+login; failure non-master access; Evidence `.omo/evidence/task-3-cms-nontech-overhaul-akun.txt`
  Commit: Y | `feat(admin): master multi-admin account management`

- [ ] 4. Statistik Desa: DB layer + admin CRUD (custom categories + rows)
  What to do:
  - `src/lib/db/statistik.ts` CRUD kategori/baris; reorder; layout types.
  - Admin page `/admin/statistik-desa` (new) with:
    - Ringkasan umum (luas/rw/rt from pengaturan stat_umum)
    - List categories; add category (label + layout simple|dusun)
    - Expand category: add/edit/delete/reorder rows (JS progressive enhancement OK)
  - API `/api/admin/statistik/*` gated `perm_konten`.
  - Remove statistik blocks from overcrowded `/admin/pengaturan` (keep kontak there).
  - Rename old `/admin/statistik` title to **Kunjungan & Backup** only analytics+export.
  Must NOT do: require code deploy to add a category; lose seed data.
  Parallelization: Wave 2 | Blocked by: 1 | Blocks: 5
  References: `src/pages/admin/pengaturan.astro` lines 75–167, `src/pages/api/admin/pengaturan.ts` zipRows
  Acceptance criteria:
  - Admin adds category “Agama” + 2 rows; persists after reload
  - Delete row removes it; empty category still allowed
  QA: happy add category; failure empty label rejected; Evidence `.omo/evidence/task-4-cms-nontech-overhaul-stat-admin.txt`
  Commit: Y | `feat(admin): custom statistik desa categories`

- [ ] 5. Statistik Desa: public profil + beranda dynamic render
  What to do:
  - Refactor `src/pages/profil.astro` to load categories+rows from DB; render each category as table/bars by layout; keep hero/sections from page_section.
  - `src/pages/index.astro` and pemerintahan (if uses stats) use new helpers for total penduduk (prefer dusun-layout category or stat_umum fallback).
  - Fallback: if no kategori rows, parse legacy pengaturan JSON once.
  Must NOT do: blank profil if migration partially applied — always fallback.
  Parallelization: Wave 2 | Blocked by: 4 | Blocks: —
  References: `src/pages/profil.astro`, `src/pages/index.astro`, `src/pages/pemerintahan.astro` (if any stats)
  Acceptance criteria:
  - Profil shows seeded categories; new “Agama” appears publicly when aktif
  - Total penduduk still coherent
  QA: happy public render; failure empty DB falls back; Evidence `.omo/evidence/task-5-cms-nontech-overhaul-stat-public.txt`
  Commit: Y | `feat(public): dynamic statistik desa rendering`

- [ ] 6. Potensi: DB layer + admin CRUD (mirror UMKM)
  What to do:
  - `src/lib/db/potensi.ts` like umkm (toSlug, published list, by slug/id, create/update/delete).
  - Admin `/admin/potensi`, `/new`, `/[id]` with TipTap later (contenteditable OK interim if todo 9 not done — prefer stub textarea then swap).
  - stats_json editor: simple repeatable label/value/icon fields.
  - Cover via AdminFotoManager owner_type `potensi` (extend media allowlist).
  - perm_konten or new `perm_potensi`? **Use `perm_konten`** unless split — decision: **perm_konten** covers potensi to avoid flag explosion (document in UI).
  Must NOT do: leave only hardcoded pages as source of truth.
  Parallelization: Wave 3 | Blocked by: 1 | Blocks: 7
  References: `src/lib/db/umkm.ts`, `src/pages/admin/umkm/*`, `src/lib/db/media.ts` owner types
  Acceptance criteria:
  - Create draft potensi; publish; appears in admin list
  QA: happy CRUD; failure duplicate slug auto-suffix; Evidence `.omo/evidence/task-6-cms-nontech-overhaul-potensi-admin.txt`
  Commit: Y | `feat(admin): potensi CMS CRUD`

- [ ] 7. Potensi: public hub + dynamic `[slug]` + remove static pages
  What to do:
  - Rewrite `src/pages/potensi.astro` to list DB items (card layout similar current).
  - Add `src/pages/potensi/[slug].astro`; 404 if missing/unpublished.
  - Delete `src/pages/potensi/perikanan.astro`, `pertanian.astro`, `sdm.astro`.
  - Update sitemap, export, any internal links; purgeCache paths include `/potensi` and slug.
  - Hide obsolete page_section `potensi` or repurpose — keep hidden.
  Must NOT do: break old URLs — seeded slugs must be `perikanan`, `pertanian`, `sdm`.
  Parallelization: Wave 3 | Blocked by: 6 | Blocks: —
  References: current potensi pages, `src/pages/sitemap` or equivalent, `src/pages/api/admin/export.ts`
  Acceptance criteria:
  - `/potensi/perikanan` 200 with seeded content; hub lists 3+
  - Unknown slug 404
  QA: happy seed URLs; failure draft not public; Evidence `.omo/evidence/task-7-cms-nontech-overhaul-potensi-public.txt`
  Commit: Y | `feat(public): dynamic potensi pages from CMS`

- [ ] 8. TipTap React island + HTML sanitize helper
  What to do:
  - `npm install @tiptap/react @tiptap/starter-kit @tiptap/extension-link @tiptap/extension-image` (and peer deps as required).
  - Component e.g. `src/components/admin/RichTextEditor.tsx` client island: props initialHtml, hiddenInputId/name, withImage.
  - Image button calls existing `uploadImage` from `src/scripts/admin-editor.ts` (export stays).
  - `src/lib/html/sanitize.ts` allowlist tags: p,br,strong,em,u,ul,ol,li,h2,h3,a[href],img[src|alt]; strip script/style/on*.
  - All save APIs run sanitize on content_html / deskripsi_html.
  Must NOT do: SSR TipTap on Worker; load editor on public pages.
  Parallelization: Wave 4 | Blocked by: 1 | Blocks: 9
  References: `src/scripts/admin-editor.ts`, `src/components/AdminEditorToolbar.astro`, package.json react already present
  Acceptance criteria:
  - Island mounts in a test admin page; bold/list/link/image work; sanitize strips `<script>`
  QA: happy edit+save; failure XSS payload stripped; Evidence `.omo/evidence/task-8-cms-nontech-overhaul-tiptap.txt`
  Commit: Y | `feat(admin): TipTap rich text editor island`

- [ ] 9. Wire TipTap into berita, umkm, konten, potensi forms; remove contenteditable toolbar
  What to do:
  - Replace AdminEditorToolbar + contenteditable blocks in:
    `admin/berita/new`, `admin/berita/[id]`, `admin/umkm/new`, `admin/umkm/[id]`, `admin/konten/[slug]`, `admin/potensi/*`
  - Delete or gut unused `AdminEditorToolbar.astro` if no callers; keep uploadImage utilities.
  Must NOT do: leave dual editors; break publish/draft buttons.
  Parallelization: Wave 4 | Blocked by: 8 | Blocks: —
  References: files listed in codegraph for AdminEditorToolbar callers
  Acceptance criteria:
  - Grep shows no contenteditable admin editors for those forms
  - Save berita still works with HTML
  QA: happy publish berita; failure empty content still validated; Evidence `.omo/evidence/task-9-cms-nontech-overhaul-editor-wire.txt`
  Commit: Y | `refactor(admin): replace contenteditable with TipTap`

- [ ] 10. Nav/footer CMS admin + lib
  What to do:
  - `src/lib/db/nav.ts` CRUD; reorder.
  - `/admin/menu` UI: two lists (Header, Footer); add/edit/delete/reorder; style link|cta; href validation (path or https).
  - Guard API: reject save that leaves zero active header items.
  - perm_konten.
  Must NOT do: allow javascript: URLs; raw HTML labels with tags.
  Parallelization: Wave 5 | Blocked by: 1 | Blocks: 11
  References: Nav/Footer hardcoded lists
  Acceptance criteria:
  - Add footer link; reorder header; persist
  - Attempt delete last header item fails with message
  QA: happy reorder; failure empty header; Evidence `.omo/evidence/task-10-cms-nontech-overhaul-nav-admin.txt`
  Commit: Y | `feat(admin): CMS for public nav and footer links`

- [ ] 11. Public Nav.astro + Footer.astro read from nav_item + fallback seed
  What to do:
  - Load active header/footer items ordered; if DB empty, fallback to current hardcoded arrays (safety).
  - Kontak CTA = items with style cta OR href `/kontak`.
  - Cache purge on menu save: `/` and all main paths or layout-level no-cache for nav (prefer purge homepage + known).
  Must NOT do: blank nav on production if query fails — try/catch fallback.
  Parallelization: Wave 5 | Blocked by: 10 | Blocks: —
  References: `src/components/Nav.astro`, `src/components/Footer.astro`, `src/components/Layout.astro`
  Acceptance criteria:
  - Changing label in admin changes public header after reload
  QA: happy; failure DB error shows fallback; Evidence `.omo/evidence/task-11-cms-nontech-overhaul-nav-public.txt`
  Commit: Y | `feat(public): nav and footer driven by CMS`

- [ ] 12. WA pelayanan CTA + map coords + schema/meta fix + peta UMKM/potensi dropdown
  What to do:
  - Pengaturan form: `wa_pelayanan`, map lat/lng/zoom, kecamatan/kabupaten; save via existing pengaturan API keys list.
  - Helper `waPelayananLink(nomorPengajuan, s)` in lib.
  - Update `src/pages/pelayanan/sukses.astro` prominent CTA; encourage chat; optional status page.
  - `kontak.astro` map from pengaturan; Layout.astro JSON-LD from pengaturan (no Simpenan); fix kontak description meta if still Simpenan.
  - Peta admin: fetch umkm+potensi lists; select fills linked_slug; keep advanced free slug only if jenis needs it.
  Must NOT do: autosend WA; leave Simpenan strings in schema.
  Parallelization: Wave 5 | Blocked by: 1 | Blocks: —
  References: `pelayanan/sukses.astro`, `admin/pengaturan.astro`, `api/admin/pengaturan.ts` KONTAK_KEYS, `kontak.astro`, `Layout.astro` orgJsonLd, `admin/peta/index.astro`
  Acceptance criteria:
  - With wa_pelayanan set, sukses page has wa.me link containing nomor
  - Grep `Simpenan` in src returns 0 (or only historical migration comments)
  - Peta add umkm without typing slug
  QA: happy WA link; failure empty wa shows no dead button; Evidence `.omo/evidence/task-12-cms-nontech-overhaul-wa-map-peta.txt`
  Commit: Y | `feat: wa pelayanan CTA, map settings, schema fix, peta dropdowns`

- [ ] 13. Admin IA redesign: AdminLayout groups, dasbor, help copy, perm-aware menu
  What to do:
  - Rebuild menuItems as grouped sections; hide items without perm; always show Keluar.
  - Dasbor: welcome + cards for allowed modules + pending pengajuan if perm_pelayanan.
  - Indonesian help one-liners on key index pages.
  - Ensure mobile sidebar still works.
  Must NOT do: English-only labels; show Akun to non-master.
  Parallelization: Wave 6 | Blocked by: 3,4,6,10,12 (routes exist) | Blocks: —
  References: `src/components/AdminLayout.astro`, `src/pages/admin/dasbor.astro`
  Acceptance criteria:
  - Non-master without perm_berita does not see Berita menu
  - Menu groups visible on desktop
  QA: happy master full menu; failure limited admin reduced menu; Evidence `.omo/evidence/task-13-cms-nontech-overhaul-ia.txt`
  Commit: Y | `feat(admin): non-tech IA and permission-aware nav`

- [ ] 14. Export, sitemap, cache purge audit, build, local E2E smoke, deploy notes
  What to do:
  - Update `api/admin/export.ts` to include new tables.
  - Sitemap entries for all published potensi.
  - Grep purgeCache call sites; add new paths.
  - `npm run build` clean; local migration+smoke checklist written to evidence.
  - Short `docs` note or README panel admin section update: multi-admin, statistik, potensi, menu, WA pelayanan — only if README already documents admin (update that section).
  Must NOT do: commit secrets; production deploy without user request (plan executor deploys only if user asked).
  Parallelization: Wave 7 | Blocked by: 1–13 | Blocks: F-wave
  References: export.ts, sitemap page, purge helper
  Acceptance criteria:
  - build exit 0; export JSON contains potensi + stat_kategori + nav_item + admin_user without password_hash
  QA: happy build+export; failure export redacts password_hash; Evidence `.omo/evidence/task-14-cms-nontech-overhaul-ship.txt`
  Commit: Y | `chore: export sitemap purge and cms overhaul ship checklist`

## Final verification wave

> Runs in parallel after ALL todos. ALL must APPROVE. Surface results and wait for the user's explicit okay before declaring complete.

- [ ] F1. Plan compliance audit
  - Every Must-have above has corresponding code paths; Must-NOT not violated; migrations applied story complete.
- [ ] F2. Code quality review
  - No type suppressions; permission checks on mutating admin APIs; sanitize on HTML; no XSS in nav href.
- [ ] F3. Real manual QA (agent-executed)
  - Local or preview: create category, create potensi, create admin, submit pelayanan see WA CTA, change nav label, set map, TipTap save berita.
  - Evidence screenshots or HTTP transcripts under `.omo/evidence/final-qa-cms-nontech-overhaul/`
- [ ] F4. Scope fidelity
  - No wisata revival; no WA autosend; no unrelated refactors; production data preserved via migration seeds.

## Commit strategy

- One logical commit per todo (as marked Y).
- Do not squash across waves until user asks.
- Never commit `.dev.vars`, credentials, or large binary dumps.
- Message style: conventional commits `feat|fix|refactor|chore(scope): …` matching repo tone.
- Production: after F-wave user OK → `wrangler d1 migrations apply web-desa-citarik-db --remote` then `npm run deploy` (explicit user request).

## Success criteria

1. Non-tech admin can add a new statistik **category** and rows; it appears on Profil without code.
2. Non-tech admin can add a fourth potensi page; public hub + detail work; old three URLs still work.
3. Master creates a second admin with limited flags; limited admin cannot open forbidden modules.
4. After letter submit, citizen sees encouraged WhatsApp chat to **WA Pelayanan** number with nomor in text.
5. TipTap used for major HTML fields; contenteditable toolbar gone from those flows.
6. Header/footer links editable in admin; map pin and schema.org use Palabuhanratu/pengaturan data; peta links UMKM via dropdown.
7. Admin sidebar grouped in plain Indonesian and permission-aware.
8. `npm run build` passes; migrations remote-safe; export includes new entities without secrets.

## Self-review notes (planner gap analysis — Metis unavailable)

| Risk | Mitigation in plan |
|------|-------------------|
| Live stats loss | Seed from JSON; keep old keys fallback |
| Session shape break | Force re-login; dual-read once |
| TipTap bundle size on CF | Client island only; admin routes only |
| Perm flag sprawl | Fixed table of flags; potensi under perm_konten |
| Nav empty site | Server guard min 1 header |
| Last master lockout | API + UI guards |
| Old potensi URLs | Seed exact slugs |
| Scope XL | Waves 0–7; ship per wave if needed but one plan |

---

**Executor start command:** user says start work / `$start-work` on this file `.omo/plans/cms-nontech-overhaul.md`.
