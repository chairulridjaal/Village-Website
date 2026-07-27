# Checklist Kredensial & Serah Terima Aset Digital — Web Desa Citarik

Dokumen ini mendata **semua akun dan aset digital** situs https://desacitarik.web.id yang harus
diserahterimakan dari tim KKN (Rafif Muhammad Farras, IPB) kepada Pemerintah Desa Citarik,
**paling lambat 14 Agustus 2026** (akhir masa KKN).

> **Cara pakai:** centang `[x]` setiap butir saat serah terima. Simpan semua kata sandi di
> **satu tempat aman milik desa** (buku tercatat yang disimpan Sekdes, atau pengelola kata
> sandi). JANGAN menyimpan kata sandi di dokumen ini.

---

## 1. Akun Google Desa — `desaloji.sukabumi@gmail.com`

Akun induk. Semua akun lain (Cloudflare) terdaftar dengan email ini. **Siapa pun yang
menguasai email ini menguasai seluruh situs** — amankan paling ketat.

- [ ] Kata sandi Gmail diserahkan ke pengelola yang ditunjuk desa
- [ ] **Nomor HP pemulihan** diganti ke nomor perangkat desa (bukan nomor mahasiswa KKN)
- [ ] Email pemulihan diperiksa/diganti ke email perangkat desa
- [ ] Verifikasi 2 langkah: pastikan metode verifikasi memakai HP perangkat desa

## 2. Akun Cloudflare — hosting situs (GRATIS)

Terdaftar dengan email `desaloji.sukabumi@gmail.com` di https://dash.cloudflare.com.
Berisi semua infrastruktur situs:

| Aset | Nama | Fungsi |
|---|---|---|
| Worker | `web-desa-citarik` | Aplikasi situs |
| D1 Database | `web-desa-citarik-db` | Semua konten (berita, UMKM, wisata, dll) |
| R2 Storage | `web-desa-citarik-media` | File foto |
| KV | `SESSION_KV` | Sesi login admin |
| Zone/DNS | `desacitarik.web.id` | Pengarahan domain |
| Web Analytics | desacitarik.web.id | Statistik pengunjung |

- [ ] Kata sandi Cloudflare diserahkan (login = email Google desa di atas)
- [ ] **PENTING — Kartu pembayaran:** akun saat ini memakai **kartu pribadi Rafif**
      (syarat aktivasi R2). Ganti/hapus di *Dashboard → Manage Account → Billing → Payment info*.
      Seluruh pemakaian situs **gratis (paket free)**, kartu hanya jaga-jaga jika melebihi
      kuota gratis — pemakaian desa saat ini jauh di bawah kuota.
- [ ] Rafif memastikan kartunya sudah terhapus dari akun

## 3. Domain `desacitarik.web.id` — dewabiz.com (BERBAYAR, tahunan)

Domain disewa di **https://dewabiz.com** (client area), nameserver diarahkan ke Cloudflare.
**Satu-satunya biaya rutin situs ini.**

- [ ] Akun dewabiz diserahkan (email + kata sandi login client area)
- [ ] **Tanggal jatuh tempo perpanjangan dicatat** oleh bendahara/sekretaris desa: `____________`
- [ ] Anggaran perpanjangan domain (± Rp50–100 ribu/tahun) masuk perencanaan desa
- [ ] Pengingat perpanjangan dipasang (kalender HP perangkat desa, H-30 sebelum jatuh tempo)

> Jika domain tidak diperpanjang, situs mati total sampai domain diaktifkan kembali.

## 4. Akun Panel Admin — desacitarik.web.id/admin

Akun untuk mengelola konten sehari-hari (lihat `panduan-admin.md`).

- [ ] Nama pengguna + kata sandi admin diserahkan ke **Pengelola Digital Desa** yang ditunjuk
- [ ] Nama pengelola yang ditunjuk dicatat: `____________`
- [ ] Pengelola sudah mengikuti pelatihan/workshop penggunaan panel admin
- [ ] Pengelola sudah praktik minimal: menulis 1 berita + mengunggah foto

## 5. Kode Sumber — GitHub

Kode program situs tersimpan di **https://github.com/Raphcel/Village-Website** (publik,
saat ini milik akun pribadi Rafif).

- [ ] Salinan kode diserahkan ke desa (tautan repo dicatat; opsional: unduhan ZIP di
      flashdisk/Drive desa)
- [ ] Opsional: repo ditransfer ke akun GitHub desa, ATAU dibiarkan di akun Rafif dengan
      catatan bahwa repo publik dan bisa diunduh siapa pun kapan pun

## 6. Backup Data

- [ ] File ekspor JSON terakhir (panel admin → Statistik → Ekspor) diunduh saat serah terima
      dan disimpan di Google Drive desa
- [ ] Rutinitas backup bulanan dijelaskan ke pengelola (lihat `panduan-admin.md` bagian 11)

## 7. Kontak Pendamping Teknis

Untuk masalah yang tidak bisa diselesaikan lewat panel admin (situs mati, lupa kata sandi
admin, perubahan program):

| Peran | Nama | Kontak |
|---|---|---|
| Pembangun situs (KKN IPB 2026) | Rafif Muhammad Farras | rafiffarras23@gmail.com |
| Pengelola Digital Desa | `____________` | `____________` |

---

**Serah terima dilakukan pada tanggal:** `____________`

| Pihak | Nama | Tanda tangan |
|---|---|---|
| Yang menyerahkan (KKN IPB) | Rafif Muhammad Farras | |
| Yang menerima (Pemdes Citarik) | | |

*Dokumen serah terima Program DIGDAYA DESA — KKNT Inovasi IPB 2026, Desa Citarik, Kec. Simpenan, Kab. Sukabumi.*
