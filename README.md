# Website Desa Citarik

Website resmi Desa Citarik, dibangun sebagai bagian dari program **KKN-T Inovasi IPB University 2026** di Desa Citarik, Kabupaten Sukabumi. Situs ini menampilkan profil desa, potensi (pertanian, perikanan, pariwisata, sumber daya manusia), direktori UMKM, peta interaktif, dan berita desa, lengkap dengan panel admin untuk mengelola konten.

Situs berjalan langsung di [desacitarik.web.id](https://desacitarik.web.id).

## Tumpukan Teknologi (Tech Stack)

| Lapisan | Teknologi |
|---------|-----------|
| Framework | [Astro 7](https://astro.build) (mode `server` / SSR) |
| Hosting & Runtime | [Cloudflare Workers](https://workers.cloudflare.com) (via `@astrojs/cloudflare`) |
| Database | [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite) |
| Penyimpanan media | [Cloudflare R2](https://developers.cloudflare.com/r2/) (objek/gambar) |
| Sesi login | [Cloudflare KV](https://developers.cloudflare.com/kv/) |
| Styling | [Tailwind CSS 4](https://tailwindcss.com) |
| Peta | [Leaflet](https://leafletjs.com) |
| Komponen interaktif | React 19 |

Pilihan ini menjaga biaya operasional tetap rendah (target ~Rp300 ribu/tahun) dengan memanfaatkan tier gratis Cloudflare.

## Struktur Proyek

```
src/
├── components/      Komponen UI (Layout, Nav, Footer, Button, Card, dll.)
├── lib/
│   ├── auth/        Hashing kata sandi (PBKDF2) & sesi KV
│   ├── db/          Akses data D1 per entitas (wisata, umkm, berita, dll.)
│   ├── cache/       Purge cache halaman publik
│   ├── media/       Pipeline unggah gambar ke R2
│   ├── site.ts       Identitas situs (nama, domain, deskripsi default)
│   └── env.ts       Akses binding Cloudflare
├── pages/
│   ├── (publik)     index, profil, potensi (+ sdm), wisata, umkm, peta, berita, kontak
│   ├── admin/       Panel admin (dasbor + kelola konten)
│   └── api/         Endpoint form admin, media, dan cron
└── middleware.ts    Penjaga rute /admin

migrations/          Skema D1 (0001) + data awal (0002) + konten resmi & SEO (0003-0004)
public/images/       Aset gambar statis
```

## Model Data

Tabel utama di D1: `admin_user`, `page_section`, `wisata`, `umkm`, `berita`, `media`, `media_link` (relasi media polimorfik), `titik_peta` (pin peta), dan `perangkat_desa` (struktur organisasi). Lihat [`migrations/0001_schema.sql`](migrations/0001_schema.sql) untuk detail lengkap.

## Menjalankan di Lokal

**Prasyarat:** Node.js 20+ dan npm.

```bash
# 1. Pasang dependensi
npm install

# 2. Siapkan database D1 lokal (jalankan semua migration secara berurutan)
npm run db:setup

# 3. Jalankan server pengembangan (build Astro lalu Wrangler)
npm run dev
```

Situs akan tersedia di `http://localhost:4321`.

> **Catatan login lokal:** tanpa runtime Cloudflare, panel admin menerima `admin` / `admin` hanya untuk pengujian. Kredensial ini **tidak** berlaku di produksi.

## Konfigurasi & Rahasia

- Salin `.dev.vars.example` menjadi `.dev.vars` untuk variabel lingkungan lokal. File `.dev.vars` **tidak boleh** di-commit (sudah ada di `.gitignore`).
- Proyek ini tidak memerlukan secret produksi wajib saat ini (autentikasi admin memakai hash PBKDF2 tersimpan di D1, bukan secret lingkungan). `wrangler secret put NAMA_SECRET` tetap tersedia jika Anda menambah kebutuhan secret di masa depan.
- `wrangler.toml` memuat ID resource nyata (bukan placeholder) milik akun Cloudflare pemilik situs ini. Jika Anda meng-clone proyek ini, ID tersebut **harus** diganti dengan resource milik akun Anda sendiri, lihat bagian [Menggunakan Template Ini untuk Desa Lain](#menggunakan-template-ini-untuk-desa-lain).

## Deploy ke Produksi

```bash
npm run deploy   # astro build && wrangler deploy
```

Sebelum deploy pertama, buat resource Cloudflare berikut dan tempel ID-nya ke `wrangler.toml`:

```bash
wrangler d1 create web-desa-citarik-db
wrangler r2 bucket create web-desa-citarik-media
wrangler kv namespace create SESSION_KV
```

Lalu terapkan seluruh migration ke database produksi:

```bash
wrangler d1 migrations apply web-desa-citarik-db --remote
```

Backup database dilakukan **manual** lewat tombol export di panel admin (`/admin/export`), bukan cron otomatis. Cron mingguan tersedia di kode namun sengaja dinonaktifkan (`crons = []` di `wrangler.toml`) karena memerlukan subdomain `workers.dev` yang terdaftar di akun; aktifkan kembali dengan mengisi `crons = ["0 0 * * 0"]` bila diperlukan.

## Panel Admin

- Halaman setup pertama (`/admin/setup`) membuat akun admin awal. Halaman ini hanya bisa dipakai sekali (saat belum ada admin terdaftar).
- Login di `/admin/login`, lalu kelola konten dari `/admin/dasbor`.
- Kata sandi disimpan sebagai hash PBKDF2 (SHA-256, 100.000 iterasi) dengan salt acak.
- Endpoint `/api/admin/*` dilindungi middleware sesi (lihat `src/middleware.ts`) dengan rate limiting percobaan login.

## Menggunakan Template Ini untuk Desa Lain

Proyek ini dirancang agar mudah dipakai ulang oleh desa lain. Ganti nilai-nilai berikut sebelum deploy ke akun Cloudflare Anda sendiri:

| Nilai | Lokasi | Keterangan |
|---|---|---|
| Nama worker | `wrangler.toml` (baris `name`), `package.json` (`name`) | Nama unik untuk Worker Anda |
| Domain & zona | `wrangler.toml` (`routes`) | Ganti dengan domain desa Anda yang sudah terdaftar di Cloudflare |
| Database D1 | `wrangler.toml` (`database_name`, `database_id`), `package.json` (skrip `db:setup`) | Buat baru dengan `wrangler d1 create` |
| Bucket R2 | `wrangler.toml` (`bucket_name`) | Buat baru dengan `wrangler r2 bucket create` |
| Namespace KV | `wrangler.toml` (`id` pada `kv_namespaces`) | Buat baru dengan `wrangler kv namespace create` |
| URL situs | `astro.config.mjs` (`site`), `src/lib/site.ts` | Domain publik desa Anda |
| Nama file ekspor | `src/pages/api/admin/export.ts` (prefix `web-desa-citarik-export`) | Opsional, kosmetik saja |
| Konten & data desa | `migrations/0002_seed.sql`, `0003_*.sql`, `0004_*.sql`, serta teks di `src/pages/**/*.astro` | Ganti seluruh data profil, wisata, UMKM, dan perangkat desa dengan data desa Anda |
| Gambar | `public/images/*`, `public/favicon.svg` | Ganti dengan foto dan lambang desa Anda |
| Analitik | `src/components/Layout.astro` (`data-cf-beacon` token) | Buat token baru di Cloudflare Web Analytics |

Setelah mengganti nilai di atas, jalankan `npm run db:setup` untuk lokal, lalu `wrangler d1 migrations apply <nama-db> --remote` dan `npm run deploy` untuk produksi.

## Status Pengembangan

Dibangun mengikuti alur perencanaan terstruktur (brief, PRD, UX, arsitektur, epics & stories). Situs telah melalui audit keamanan (guard autentikasi admin, rate limiting login, perbaikan kebocoran media) dan berjalan di produksi.

---

*Dikembangkan oleh tim KKN-T Inovasi IPB University 2026, Desa Citarik, Kabupaten Sukabumi.*
