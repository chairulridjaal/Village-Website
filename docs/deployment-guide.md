# Panduan Deployment — Web Desa Citarik

Dokumen ini untuk **pengembang** (mahasiswa KKN berikutnya / teknisi) yang perlu mengubah
**kode program** situs https://desacitarik.web.id. Perangkat desa **tidak perlu** dokumen ini —
pengelolaan konten sehari-hari cukup lewat panel admin (lihat `panduan-admin.md`) dan
langsung tayang tanpa deploy.

**Deploy hanya diperlukan jika kode berubah** (desain, fitur baru, perbaikan bug).

---

## Arsitektur Singkat

- **Framework:** Astro (SSR) + sedikit React, Tailwind CSS 4, peta Leaflet + OpenStreetMap.
- **Hosting:** Cloudflare Workers (akun `desaloji.sukabumi@gmail.com`, paket gratis).
- **Data:** Cloudflare D1 (SQLite, nama `web-desa-citarik-db`) — semua konten.
- **Media:** Cloudflare R2 (bucket `web-desa-citarik-media`) — file foto.
- **Sesi login:** Cloudflare KV (`SESSION_KV`).
- **Domain:** `desacitarik.web.id` (registrar dewabiz.com, DNS di Cloudflare). Worker terpasang
  lewat **route** `desacitarik.web.id/*` di `wrangler.toml` (bukan custom domain — ada A record
  proxied dummy `192.0.2.1` di zone yang membuat custom domain konflik). `workers_dev = false`.
- **Kode sumber:** https://github.com/Raphcel/Village-Website

## Prasyarat

1. **Node.js LTS** (v20+) dan npm — https://nodejs.org
2. Akses ke **akun Cloudflare desa** (`desaloji.sukabumi@gmail.com` — lihat `credential-checklist.md`)
3. Git (opsional tapi disarankan)

## Setup Awal

```bash
git clone https://github.com/Raphcel/Village-Website.git
cd Village-Website
npm install
npx wrangler login        # buka browser, masuk dengan akun Cloudflare desa
```

## Menjalankan Secara Lokal

```bash
npm run db:setup    # sekali saja: buat database lokal dari folder migrations/
npm run dev         # build + jalan di http://localhost:4321
```

Catatan: `npm run dev` menjalankan `astro build && wrangler dev`, jadi **perubahan kode
butuh restart perintah ini** (bukan hot-reload). Database lokal terpisah dari produksi —
aman untuk bereksperimen.

## Deploy ke Produksi

```bash
npm run deploy      # = astro build && wrangler deploy
```

Selesai — perubahan langsung aktif di https://desacitarik.web.id. Verifikasi dengan membuka situs
dan mengecek halaman yang diubah.

### Jika ada migrasi database baru

File SQL bernomor di folder `migrations/`. Setelah menambah file migrasi baru:

```bash
# terapkan ke database PRODUKSI (hati-hati!)
npx wrangler d1 migrations apply web-desa-citarik-db --remote
```

**Selalu backup dulu** sebelum migrasi produksi: panel admin → Statistik → Ekspor Semua
Konten (JSON). Jalankan `--local` dulu untuk menguji.

### Rollback (deploy bermasalah)

```bash
npx wrangler rollback     # kembali ke versi Worker sebelumnya
```

Atau checkout commit git yang masih baik lalu `npm run deploy` ulang.
Catatan: rollback Worker TIDAK membatalkan migrasi database — migrasi harus di-reverse manual.

## Hal yang Perlu Diketahui (jangan "diperbaiki" tanpa paham)

1. **Backup cron sengaja mati** (`crons = []` di `wrangler.toml`). Cron pernah gagal
   dengan error 10063. Backup dilakukan **manual** lewat tombol ekspor di panel admin.
   Aktifkan lagi hanya jika benar-benar perlu: isi `crons = ["0 0 * * 0"]`.
2. **Workers Builds (CI dari push GitHub) terhubung tapi GAGAL build** — belum terdiagnosis.
   Deploy resmi adalah **`npm run deploy` dari komputer lokal**. Jangan mengandalkan
   auto-deploy dari push. (Opsi bersih: putuskan koneksi Workers Builds di dashboard.)
3. **Ruleset GitHub "Main" dalam keadaan DISABLED** (dimatikan saat merge PR #3). Jika
   diaktifkan lagi, aturan *required_deployments* akan memblokir PR selama Workers Builds
   masih gagal.
4. **Tidak ada secret Wrangler** — semua konfigurasi ada di `wrangler.toml` (binding D1/R2/KV).
   Autentikasi admin memakai PBKDF2 + sesi KV, tidak ada API key eksternal.
5. **Konten ≠ kode.** Konten hidup di D1 produksi. Deploy tidak menyentuh konten;
   sebaliknya, mengedit konten tidak butuh deploy.

## Referensi Perintah

| Perintah | Fungsi |
|---|---|
| `npm run dev` | Build + jalankan lokal (port 4321) |
| `npm run db:setup` | Terapkan migrasi ke DB lokal |
| `npm run deploy` | Build + deploy ke produksi |
| `npx wrangler d1 migrations apply web-desa-citarik-db --remote` | Migrasi DB produksi |
| `npx wrangler d1 execute web-desa-citarik-db --remote --command "SELECT ..."` | Query langsung DB produksi (mis. reset admin) |
| `npx wrangler tail` | Lihat log Worker produksi langsung |
| `npx wrangler rollback` | Kembalikan Worker ke versi sebelumnya |

## Reset Kata Sandi Admin (darurat)

Tidak ada fitur "lupa password". Jika akun admin terkunci permanen, pengembang dapat
menghapus baris admin lalu membuka ulang halaman pendaftaran awal:

```bash
# HATI-HATI: hapus akun admin, lalu buka https://desacitarik.web.id/admin/setup
# untuk mendaftar ulang (halaman setup hanya aktif saat belum ada admin).
npx wrangler d1 execute web-desa-citarik-db --remote --command "DELETE FROM admin_user"
```

Backup ekspor JSON dulu sebelum menjalankan perintah destruktif apa pun.

---

*Dokumen serah terima Program DIGDAYA DESA — KKNT Inovasi IPB 2026, Desa Citarik, Kec. Simpenan, Kab. Sukabumi.*
