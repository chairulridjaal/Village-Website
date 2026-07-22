# Product Brief: Sistem Informasi Desa (SID) & UMKM Directory — Desa Citarik

> BMAD Phase 1 artifact. Source document for `bmad-prd`.
> Project: KKNT Inovasi IPB 2026 — Desa Citarik, Kabupaten Sukabumi.

## 1. Vision / Problem Statement

Desa Citarik has no official web presence and its active UMKM cannot be discovered online. We will build a **Village Information System (Sistem Informasi Desa)** that acts as the village's official digital identity — profile, public services, demographics, public information, legal products, village potential, and a photo gallery — and embeds a public **UMKM directory** with direct links to each business's WhatsApp, Instagram, marketplace, and Google Maps.

The single most important constraint: **the system must be operable by village staff with no coding knowledge after the student team leaves.** Sustainability beats sophistication. Every feature is judged by "who maintains this in August?"

## 2. Target Users

- **Public visitors / buyers** (primary) — residents and                                                                                                                                                                                               
- **Village administrator** (primary operator) — village staff or trained youth ("Admin Desa Digital") who manages all content through a simple admin panel. Low technical literacy assumed.
- **UMKM owners** (indirect) — gain visibility; do not log in themselves.

## 3. Goals & Success Metrics

- Website live on a working public URL (free subdomain initially), load time under ~3s on mobile.
- All core village sections published (profile, services, statistics, public info, legal products, potential, gallery).
- UMKM directory populated with **≥10** businesses, each with photos and platform links.
- Village admin can **add/edit content unaided** (verified by a handover test).
- All dynamic content editable without a developer or a redeploy.
- Discoverable via search engines (server-rendered, indexable).

## 4. Scope

### In Scope (MVP)

**Public-facing pages**
- **Beranda (Home)** — hero, quick links, latest news, featured UMKM/products.
- **Profil Desa** — history, vision & mission, government structure, geography/maps, contact.
- **Layanan Desa** — list of administrative services with requirements & procedures; optional "ajukan via WhatsApp" button per service (informational, not a full submission engine).
- **Statistik / Data Penduduk** — aggregate demographics rendered as charts (by gender, age band, occupation, education). **Aggregate data only — no individual citizen records.**
- **Informasi Publik** — transparency section (e.g., APBDes summaries, programs, downloadable documents) in the spirit of PPID.
- **Produk Hukum** — village regulations and decrees (Perdes, SK Kepala Desa) as a searchable list of downloadable documents with metadata (number, year, title, category).
- **Potensi Desa** — agriculture, tourism, natural resources, and economic potential write-ups with images.
- **Galeri** — photo gallery grouped by album/event.
- **Direktori UMKM** — filterable (category) and searchable (name) list; each entry has a detail view.
- **Berita / Pengumuman** — village announcements and articles.
- **Kontak & Peta** — embedded map, contact info, WhatsApp link.

**Admin panel** (single admin role)
- Authentication (email + password).
- CRUD for: UMKM, News, Gallery albums/photos, Produk Hukum (with file upload), Informasi Publik (with file upload), Potensi Desa, Layanan Desa entries.
- Editable Statistik data (key numbers that drive the charts).
- Editable Profil Desa content blocks.
- Image/document upload; active/inactive (publish/draft) toggle on content.

### Out of Scope (explicitly)
- Full online service submission / e-government request workflow (links to WhatsApp instead).
- Individual citizen database / per-resident PII (statistics are aggregate only).
- Integrated marketplace / cart / checkout / in-site payments (QRIS handled per-UMKM offline).
- User accounts, comments, reviews for the public.
- Multi-role permissions (one admin role only).

> Field activities of the wider KKN program — Google Maps registration, QRIS setup, WhatsApp Business catalogs, warga workshops — are **context, not software features**.

## 5. Functional Requirements (high level)

- FR1: Visitors can view all core village sections (profile, services, statistics, public info, legal products, potential, gallery).
- FR2: Visitors can browse active UMKM in a directory, filter by category, and search by name.
- FR3: Visitors can open a UMKM detail view with photos and outbound platform links.
- FR4: Visitors can view aggregate population statistics as charts.
- FR5: Visitors can browse and download legal products (produk hukum) and public-information documents.
- FR6: Visitors can read village news/announcements.
- FR7: An admin can authenticate with email + password.
- FR8: An admin can CRUD all dynamic content types (UMKM, news, gallery, produk hukum, informasi publik, potensi, layanan) including file/image uploads.
- FR9: An admin can edit statistics data and village profile content.
- FR10: An admin can publish/unpublish (active/inactive) any content item.
- FR11: Content changes appear on the public site without a manual redeploy.

## 6. Non-Functional Requirements

- NFR1: Mobile-first, responsive; usable on low-end Android and weak signal.
- NFR2: SEO-friendly via server rendering so village and UMKM pages are indexable.
- NFR3: Images compressed (<~300KB each); uploaded documents (PDF) size-checked to respect free-tier storage.
- NFR4: Runs on free-tier infrastructure; **launches on a free subdomain** with no required paid domain during KKN.
- NFR5: All accounts (hosting, DB, storage, email) owned by a **village-owned email**, never a student's personal account — required for handover.
- NFR6: Admin panel simple enough for a non-technical operator; destructive actions confirmed; content types grouped clearly in the UI.
- NFR7: Statistics and public data must avoid exposing individual PII.

## 7. Constraints & Assumptions

- Timeline: aligned to a ~40-day KKN; development begins **pre-departure** so the core is partly built before on-site connectivity issues hit. Note: the expanded SID scope is larger than a directory-only site — prioritize Home, Profil, UMKM Directory, and Gallery first; layer the document/statistics sections next.
- Connectivity at the village is unreliable; prefer server/edge rendering and resilient data fetching.
- Team has Next.js + Supabase familiarity (prior TUMBUH / Habitscape experience).
- A handover document with all credentials and a "what to do if the site breaks" guide is a required deliverable.

## 8. Preferred Tech Stack (proposal — Architect to confirm)

- **Frontend:** Next.js (App Router) + Tailwind CSS.
- **Backend / Data:** Supabase (Postgres, Auth, Storage). Optional Cloudflare R2 if media outgrows free tier.
- **Charts:** a lightweight chart library (e.g., Recharts) for the statistics section.
- **Hosting:** Vercel (free tier), free `*.vercel.app` subdomain at launch.
- **Domain:** deferred — see Domain Plan below.
- **Initial data model:** `umkm`, `news`, `gallery_albums`, `gallery_photos`, `produk_hukum`, `informasi_publik`, `potensi`, `layanan`, `statistik`, `profil_desa`, `admin_users` (full schema in PRD).

## 9. Domain Plan (deferred to handover / penyuluhan)

A `.desa.id` domain requires an official request from the village government and cannot be obtained instantly. Therefore:
- **During KKN:** launch on the free Vercel subdomain (or a cheap interim domain such as `.my.id` if a custom name is wanted).
- **At handover (penyuluhan):** include a step-by-step guide for the admin/perangkat desa to register `.desa.id` afterward — required documents, registrar, and how to point the domain to the existing Vercel deployment (no rebuild needed).
- This keeps the site shippable within the KKN window and leaves the official-domain upgrade as a clean, documented follow-up the village owns.

## 10. Key Risks

- Scope creep from the expanded SID → phase the build (core pages first, document/statistics sections second); keep admin minimal.
- Admin inactivity after KKN → train 2 operators, keep admin panel simple, leave a guide.
- Domain/hosting expiry → village-owned email, calendar reminder; document the `.desa.id` upgrade path.
- Weak connectivity during build → finish core build before/early in KKN.
- Free-tier storage limits → compress images, size-check PDFs, plan R2 fallback.
- Accidental PII exposure in statistics → enforce aggregate-only data at admin-input level.

## 11. Handoff Notes for BMAD

- Start point: feed this brief to `bmad-prd` (PM) to generate FRs/NFRs in Given/When/Then, epics, and stories.
- Then run `bmad-ux` (optional) for the public sections + admin panel screens.
- Then `bmad-architect` to lock the Next.js/Supabase architecture and finalize the schema.
- Then `bmad-sprint-planning` → Dev, one story per fresh chat.
- Suggested epics:
  - **E1 — Foundation & public shell:** layout, navigation, Home, Profil Desa, Kontak & Peta.
  - **E2 — UMKM directory:** list, category filter, search, detail view.
  - **E3 — Content sections:** Berita, Galeri, Potensi Desa.
  - **E4 — Document & data sections:** Produk Hukum, Informasi Publik (uploads), Statistik (charts).
  - **E5 — Layanan Desa:** service listing + WhatsApp request buttons.
  - **E6 — Admin panel & auth:** login + CRUD across all content types + publish toggle.
  - **E7 — Deploy, SEO & handover:** subdomain launch, indexing, exit document, `.desa.id` upgrade guide.
