# Panduan Admin — Web Desa Citarik

Panduan ini untuk **pengelola konten** situs https://citarik.web.id (perangkat desa / Karang Taruna).
Anda **tidak perlu keahlian teknis** — semua dilakukan lewat browser (HP atau komputer).

> **Prinsip penting:** Semua perubahan lewat Panel Admin **langsung tayang** di situs
> setelah disimpan/diterbitkan. Tidak perlu "upload ulang website" atau bantuan programmer.

---

## 1. Masuk ke Panel Admin

1. Buka **https://citarik.web.id/admin** di browser.
2. Masukkan **nama pengguna** dan **kata sandi** admin desa.
3. Klik **Masuk**.

Catatan keamanan:
- Salah kata sandi **5 kali berturut-turut** akan memblokir percobaan masuk selama **15 menit**. Tunggu, lalu coba lagi.
- Jangan bagikan kata sandi lewat WhatsApp/SMS terbuka. Simpan di tempat aman (lihat `credential-checklist.md`).
- **Lupa kata sandi?** Tidak ada tombol "lupa password". Hubungi pendamping teknis (kontak di `credential-checklist.md`) untuk direset lewat database.
- Selesai bekerja, klik **Keluar** (pojok kiri bawah menu) — terutama jika memakai komputer bersama.

## 2. Mengenal Dasbor

Setelah masuk, Anda melihat **Dasbor**:
- **Kotak angka**: jumlah Wisata, UMKM, dan Berita yang sudah terbit.
- **Aksi Cepat**: tombol pintas ke tugas yang paling sering dilakukan (tulis berita, tambah UMKM, dsb).
- **Menu samping** (di HP: tekan tombol ☰ kiri atas): Dasbor, Konten Halaman, Wisata, UMKM, Peta, Berita, Media, Perangkat Desa, Pengaturan, Statistik.
- Tombol **Lihat Situs ↗** (kanan atas) membuka situs publik di tab baru — gunakan untuk mengecek hasil suntingan.

## 3. Konten Halaman (teks halaman utama, profil, pemerintahan)

Menu **Konten Halaman** berisi bagian-bagian teks halaman statis:

| Bagian | Tampil di |
|---|---|
| Beranda: Hero | Sambutan besar di halaman depan |
| Beranda: Sekilas Desa | Ringkasan desa di halaman depan |
| Profil: Umum / Geografis / Sejarah | Halaman **Profil** |
| Pemerintahan: Visi & Misi / Ruang Lingkup / Tugas & Fungsi | Halaman **Pemerintahan** |

Cara mengubah:
1. Klik **Sunting** pada bagian yang ingin diubah.
2. Ubah teksnya. Gunakan toolbar untuk **tebal**, *miring*, subjudul, dan daftar.
3. Klik **Simpan**. Perubahan langsung tayang.

## 4. Berita (kegiatan desa, pengumuman)

Ini fitur yang paling sering dipakai. Targetnya: **minimal 1 berita per bulan** agar situs terlihat hidup.

**Menulis berita baru:**
1. Menu **Berita** → **Tulis Berita Baru** (atau lewat Aksi Cepat di Dasbor).
2. Isi **Judul** (singkat dan jelas, misal: "Kerja Bakti Bersih Pantai Citarik").
3. Tulis **Isi Berita**. Toolbar menyediakan tebal/miring, subjudul, daftar, dan **sisip gambar** langsung di dalam tulisan. Draf tersimpan otomatis selama mengetik.
4. Pilih salah satu:
   - **Simpan Draf** — tersimpan tapi *belum* tampil di situs. Bisa dilanjutkan nanti.
   - **Terbitkan** — langsung tayang di halaman Berita.
5. Setelah tersimpan, buka berita itu dari daftar untuk menambah **foto sampul dan galeri** di halaman edit.

**Mengubah / menghapus:** menu **Berita** → klik berita → sunting lalu Simpan, atau gunakan tombol Hapus. Menghapus tidak bisa dibatalkan.

**Tips foto:** foto dari HP langsung bisa dipakai — sistem otomatis memperkecil ukurannya. Isi **teks alternatif (alt)** dengan deskripsi singkat foto.

## 5. Wisata

Menu **Wisata** mengelola destinasi (Pantai Citarik, Vihara, Geopark Ciletuh, dst).

1. **Tambah Wisata** → isi **Nama** dan **Deskripsi**, pilih Status **Draf** dulu.
2. Simpan, lalu buka kembali dari daftar untuk menambah **foto sampul + galeri**.
3. Kalau sudah lengkap (deskripsi + foto), ubah Status menjadi **Terbitkan** dan Simpan.

## 6. UMKM (direktori usaha warga)

Menu **UMKM** mengelola direktori usaha warga.

1. **Tambah UMKM** → isi **Nama usaha**, **Kategori**, dan **Lokasi**.
2. Isi tulisan halaman per bagian — kolom yang kosong tidak akan ditampilkan di situs:
   - **Tentang UMKM**: 1–2 paragraf pembuka — apa usahanya dan apa keunikannya.
   - **Produk & Menu Andalan**: satu produk per baris berikut harga, contoh: `Kopi tubruk — Rp8.000`.
   - **Jam Buka**: satu baris, contoh: `Setiap hari 07.00–21.00 WIB`.
   - **Cara Pesan & Pembayaran**: contoh: `Datang langsung atau pesan antar via WhatsApp. Menerima QRIS.`
3. Bagian **Identitas Digital** — isi hanya yang aktif, kolom kosong tidak ditampilkan:
   - **Nomor WhatsApp** (pembeli bisa langsung chat dari situs)
   - Telepon, URL Google Maps, URL Toko Online (Shopee/Tokopedia)
4. Tambahkan **foto produk** di halaman edit (sampul + galeri).
5. Status **Terbitkan** → tampil di direktori UMKM.

## 7. Peta

Menu **Peta** mengelola titik-titik di peta interaktif desa.

1. Isi **Label** (nama titik), **Jenis** (wisata/UMKM/fasilitas), dan **Slug Entitas** (nama-pendek halaman wisata/UMKM yang ditautkan, terlihat di alamat halamannya, contoh: `pantai-Citarik`).
2. Isi **Lintang** dan **Bujur** (koordinat). Cara mudah: buka Google Maps → tekan-lama lokasi → salin dua angka yang muncul (contoh: `-7.0512, 106.5233`) → angka pertama = Lintang, kedua = Bujur.
3. Simpan — titik langsung muncul di halaman Peta situs.

## 8. Media

Menu **Media** menampilkan **semua gambar** yang pernah diunggah (perpustakaan).
Unggah gambar dilakukan dari form Wisata/UMKM/Berita, bukan dari sini. Gunakan halaman ini untuk memeriksa foto apa saja yang sudah ada.

## 9. Perangkat Desa

Menu **Perangkat Desa** mengelola daftar aparat yang tampil di halaman Pemerintahan:
- **Tambah**: isi Nama, Jabatan (misal "Kepala Desa"), dan Urutan Tampil (angka kecil tampil lebih dulu).
- **Ubah/Hapus**: langsung pada kartu masing-masing di daftar sebelah kanan.

## 10. Pengaturan

Menu **Pengaturan** berisi dua hal:

1. **Kontak & Media Sosial** — alamat kantor, telepon, email, jam layanan, dan tautan WhatsApp/Facebook/Instagram. Tampil di footer semua halaman dan halaman Kontak. Kosongkan yang belum aktif.
2. **Statistik Desa** — luas wilayah, jumlah RW/RT, penduduk per dusun, kelompok umur, pendidikan, mata pencaharian. Tampil di halaman Profil, Pemerintahan, dan Beranda. Total penduduk/KK dihitung otomatis dari data per dusun. **Perbarui minimal setahun sekali** saat ada data baru dari kecamatan/BPS.

## 11. Statistik Kunjungan & Backup

Menu **Statistik**:
- **Statistik kunjungan** situs tersedia lengkap di Cloudflare Dashboard (tombol "Buka Cloudflare Dashboard" — perlu akun Cloudflare desa, lihat `credential-checklist.md`).
- **Ekspor & Backup**: klik **"Ekspor Semua Konten (JSON)"** untuk mengunduh seluruh isi database (teks berita, UMKM, wisata, dll) sebagai satu file.

> **Rutinitas backup: unduh file ekspor ini minimal SEBULAN SEKALI** dan simpan di
> Google Drive desa / flashdisk. Backup otomatis tidak aktif — ini satu-satunya cadangan data.
> Catatan: file ekspor berisi teks/data; file foto tersimpan terpisah di Cloudflare R2.

## 12. Masalah Umum

| Masalah | Solusi |
|---|---|
| Tidak bisa masuk padahal kata sandi benar | Tunggu 15 menit (mungkin terkena pembatasan percobaan), pastikan tidak ada spasi tertinggal |
| Perubahan tidak muncul di situs | Muat ulang halaman (tarik layar ke bawah di HP / Ctrl+R). Pastikan status **Terbitkan**, bukan Draf |
| Foto tidak terunggah | Periksa koneksi internet; coba foto lain; ukuran sangat besar butuh waktu lebih lama |
| Salah hapus berita/UMKM | Tidak bisa dibatalkan — tulis ulang, atau ambil teksnya dari file backup JSON terakhir |
| Situs tidak bisa diakses sama sekali | Bukan dari panel admin — hubungi pendamping teknis (lihat `credential-checklist.md`) |

---

*Dokumen serah terima Program DIGDAYA DESA — KKNT Inovasi IPB 2026, Desa Citarik, Kec. Simpenan, Kab. Sukabumi.*
