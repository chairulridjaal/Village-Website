-- ─────────────────────────────────────────────────────────────
-- Story: Isi konten resmi Profil Desa Citarik (data nyata dari RPJMDes/Profil 2026)
-- Menggantikan konten placeholder pada 0002_seed.sql dengan data faktual.
-- Aman dijalankan berulang (idempotent) & di atas DB kosong maupun terisi.
-- ─────────────────────────────────────────────────────────────

-- ── Page sections (UPSERT: perbarui konten, pertahankan cover jika sudah ada) ──
-- Konten profil/beranda di bawah diselaraskan dengan Prodeskel 2025.
-- Migrasi 0006 memaksa update ulang bila DB sudah pernah di-seed nilai lama.
INSERT INTO page_section (slug, title, content_html) VALUES
  ('beranda-hero', 'Selamat Datang di Desa Citarik',
   '<p>Desa Citarik berada di Kecamatan Palabuhanratu, Kabupaten Sukabumi, Jawa Barat. Profil resmi desa mengacu pada isian Prodeskel Kemendagri tahun 2025 (kode desa 3202110005).</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('beranda-sekilas', 'Sekilas Desa Citarik',
   '<p>Desa Citarik, Kecamatan Palabuhanratu, Kabupaten Sukabumi, Provinsi Jawa Barat. Luas wilayah 526,38 hektar, 4 dusun, 10 RW, 50 RT, dan 13.187 jiwa (4.220 KK) menurut Prodeskel Maret 2025.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('profil-umum', 'Profil Umum',
   '<p>Desa Citarik terletak di Kecamatan Palabuhanratu, Kabupaten Sukabumi, Provinsi Jawa Barat (kode desa 3202110005). Berdasarkan isian Prodeskel Maret 2025, desa ini memiliki 4 dusun, 10 RW, dan 50 RT, dengan jumlah penduduk 13.187 jiwa (6.750 laki-laki, 6.437 perempuan) dari 4.220 kepala keluarga.</p><p>Jarak ke ibu kota kecamatan maupun ibu kota kabupaten masing-masing sekitar 6 km (±0,15 jam dengan kendaraan bermotor). Jarak ke ibu kota provinsi sekitar 150 km (±6 jam bermotor).</p><ul><li><strong>Kecamatan:</strong> Palabuhanratu</li><li><strong>Kabupaten:</strong> Sukabumi</li><li><strong>Provinsi:</strong> Jawa Barat</li><li><strong>Kode desa:</strong> 3202110005</li><li><strong>Sumber data:</strong> Profil Desa dan Kelurahan (Prodeskel), Maret 2025</li></ul>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('profil-geografis', 'Kondisi Geografis',
   '<p>Luas wilayah Desa Citarik tercatat <strong>526,38 hektar</strong> (Profil Desa / PPT). Wilayah berada di kaki Gunung Jayanti, dengan topografi dataran rendah hingga tinggi, mayoritas lahan pertanian.</p><h2>Batas Wilayah</h2><ul><li><strong>Utara:</strong> Alam Gunung Jayanti / kehutanan (Kec. Cikidang)</li><li><strong>Selatan:</strong> Desa Cidadap / Sungai Cimandiri (Kec. Simpenan)</li><li><strong>Timur:</strong> Desa Cikadu (Kec. Bantargadung)</li><li><strong>Barat:</strong> Desa Jayanti (Kec. Cikakak)</li></ul><p>Penetapan batas didukung Perda No. 21 Tahun 2012. Suhu harian sekitar 23–30 °C; curah hujan sekitar 2.900 mm/tahun (PPT).</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('profil-sejarah', 'Sejarah Desa',
   '<p>Menurut dokumen Profil Desa Citarik (PPT), desa ini sudah tercatat sebagai pemerintahan desa sejak <strong>tahun 1912</strong>, dipimpin Kepala Desa (dulu disebut Jaro).</p><p>Sampai tahun 1912 wilayah ini bernama <strong>Desa Cihoe</strong>. Kata <em>hoe</em> merujuk pada rotan—tali temali yang kuat dan mengikat kencang (tarik). Pada periode <strong>1912–1930</strong> desa bernama <strong>Kalideres</strong>. Sejak <strong>1930</strong> nama resmi menjadi <strong>Desa Citarik</strong>, sejalan dengan penamaan batas alam <strong>Kali Citarik</strong> (antara Kalideres dan Tonjong) serta pemaknaan Sunda dari Cihoe dan Kalideres yang dihubungkan dengan arti yang sama.</p><p>Pada <strong>2012</strong>, sesuai <strong>Perda Kabupaten Sukabumi Nomor 21 Tahun 2012</strong> (5 April 2012), Desa Citarik mengalami pemekaran sehingga terbentuk <strong>Desa Jayanti</strong> sebagai desa baru; Desa Citarik tetap sebagai desa induk. Penetapan batas Citarik–Jayanti dituangkan dalam Keputusan Bupati Sukabumi Nomor 141/Kep.1315-Tapem/2013 (30 Desember 2013).</p><p>Pusat pemerintahan desa berada di Dusun III, Jalan Raya Citarik Km. 06 Palabuhanratu, Kp. Legok Loa RT 001 RW 014.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('potensi', 'Potensi Desa Citarik',
   '<h2>Pertanian</h2><p>Sebagai lumbung padi wilayah Palabuhanratu, Desa Citarik memiliki hamparan persawahan luas yang dialiri Sungai Cidadap. Selain padi, desa menghasilkan aneka buah (mangga, rambutan, cengkeh, petai, jengkol, jeruk, dan kopi) serta kayu (jati, albasia, mahoni).</p><h2>Perikanan &amp; Kelautan</h2><p>Berbatasan dengan Samudra Hindia, Citarik memiliki potensi perikanan tangkap serta budidaya sidat (belut) di kawasan Muara Citarik. Danau Talanca seluas 20 hektar berpotensi untuk wisata air dan perikanan.</p><h2>Pariwisata</h2><p>Pantai Citarik sepanjang 4 km, pemandian air panas alami, Puncak Gelendrung untuk paralayang, serta beragam situs religi dan sejarah menjadikan Citarik bagian dari kawasan Geopark Ciletuh-Palabuhanratu.</p><h2>Sumber Daya Lain</h2><p>Terdapat pula potensi pertambangan rakyat (emas, mangan, batu kristal) dan hutan lindung desa.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('pemerintahan-visi-misi', 'Visi & Misi Pemerintahan Desa',
   '<h2>Visi</h2><p>&ldquo;Terwujudnya Desa Citarik yang Maju, Mandiri, dan Religius.&rdquo;</p><h2>Misi</h2><p><em>Rumusan misi resmi sedang dilengkapi oleh Pemerintah Desa Citarik.</em></p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('pemerintahan-ruang-lingkup', 'Ruang Lingkup Pemerintahan',
   '<p>Pemerintah Desa Citarik dipimpin oleh Kepala Desa <strong>Sumantri</strong> (rekap PEMDES Juni 2025). Kecamatan Palabuhanratu, Kabupaten Sukabumi. Wilayah seluas <strong>526,38 hektar</strong> mencakup <strong>4 dusun, 10 RW, dan 50 RT</strong>, dengan jumlah penduduk 13.187 jiwa dari 4.220 kepala keluarga (Prodeskel 2025). BPD beranggotakan 9 orang.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('pemerintahan-tugas-fungsi', 'Tugas & Fungsi',
   '<p>Pemerintah Desa Citarik bertugas menyelenggarakan pemerintahan desa, melaksanakan pembangunan, pembinaan kemasyarakatan, dan pemberdayaan masyarakat sesuai dengan Undang-Undang Nomor 6 Tahun 2014 tentang Desa.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

-- Perangkat resmi: lihat 0007_perangkat_citarik_hapus_wisata.sql (rekap PEMDES Juni 2025)
DELETE FROM perangkat_desa;
INSERT INTO perangkat_desa (nama, jabatan, urutan) VALUES
  ('Sumantri', 'Kepala Desa', 1),
  ('Yuspa Hendri, S.T.', 'Sekretaris Desa', 2),
  ('Iing Kusanedi', 'Kepala Seksi Pemerintahan', 3),
  ('Alvina Nurfadilah', 'Kepala Seksi Kesejahteraan', 4),
  ('Wiwi Parwati, S.Ap.', 'Kepala Seksi Pelayanan', 5),
  ('Andini Kusniawati, S.Ak.', 'Kepala Urusan Tata Usaha dan Umum', 6),
  ('Rena Restiawati, S.Kom.', 'Kepala Urusan Keuangan', 7),
  ('Wina Panduliana', 'Kepala Urusan Perencanaan', 8),
  ('E. Lupi Yanti Yani Dia Dara, S.Pd.', 'Kepala Dusun 1', 9),
  ('Surahman', 'Kepala Dusun 2', 10),
  ('Budiman', 'Kepala Dusun 3', 11),
  ('Misbah', 'Kepala Dusun 4', 12);

-- ── Wisata (ganti placeholder dengan potensi wisata nyata) ──
DELETE FROM wisata WHERE slug IN ('pantai-Citarik', 'pantai-karang-sari');
INSERT OR IGNORE INTO wisata (slug, nama, deskripsi_html, status) VALUES
  ('pantai-Citarik', 'Pantai Citarik',
   '<p>Garis pantai sepanjang kurang lebih 4 km di tepi Samudra Hindia. Menjadi ruang wisata bahari andalan desa dan bagian dari kawasan Geopark Ciletuh-Palabuhanratu.</p>', 'published'),
  ('danau-talanca', 'Danau Talanca',
   '<p>Danau seluas 20 hektar yang berpotensi dikembangkan untuk wisata air sekaligus kawasan perikanan.</p>', 'published'),
  ('muara-Citarik-sidat', 'Muara Citarik (Kampung Sidat)',
   '<p>Kawasan muara tempat budidaya sidat (belut) yang juga berpotensi sebagai destinasi wisata edukasi dan penelitian.</p>', 'published'),
  ('air-panas-sawah-beura', 'Pemandian Air Panas Sawah Beura',
   '<p>Sumber air panas alami di Kampung Sawah Beura yang berpotensi dikembangkan menjadi wisata pemandian air panas.</p>', 'published'),
  ('puncak-gelendrung', 'Puncak Gelendrung',
   '<p>Puncak di kawasan Gunung Rompang dengan panorama alam yang cocok untuk wisata alam dan olahraga paralayang.</p>', 'published'),
  ('situs-gunung-rompang', 'Situs Gunung Rompang',
   '<p>Situs bersejarah di Gunung Rompang yang menjadi tujuan wisata religi.</p>', 'published'),
  ('kubang-hejo', 'Kubang Hejo',
   '<p>Situs wisata religi sekaligus sumber mata air di Kampung Cibuntu.</p>', 'published'),
  ('benteng-Citarik', 'Benteng Peninggalan Belanda',
   '<p>Benteng pertahanan peninggalan masa kolonial Belanda di pesisir desa, asal-usul nama Desa Citarik (dari kata Loge).</p>', 'published');

-- ── Bersihkan data contoh (placeholder) agar tidak tayang sebagai data palsu ──
DELETE FROM umkm WHERE slug IN ('kerajinan-bambu-Citarik', 'warung-ikan-bakar-bu-sari', 'kebun-sayur-pak-budi');
DELETE FROM titik_peta WHERE linked_slug IN ('pantai-Citarik', 'pantai-karang-sari', 'kerajinan-bambu-Citarik');
-- Catatan: titik peta (koordinat GPS) diisi kemudian setelah pengambilan titik di lapangan.
