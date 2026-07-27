-- ── Page section seed (placeholder content, Bahasa Indonesia) ──
INSERT OR IGNORE INTO page_section (slug, title, content_html, cover_alt) VALUES
  ('beranda-hero',        'Selamat Datang di Desa Citarik',      '<p>Desa Citarik berada di Kecamatan Palabuhanratu, Kabupaten Sukabumi, Jawa Barat. Profil resmi desa mengacu pada isian Prodeskel Kemendagri tahun 2025 (kode desa 3202110005).</p>', 'Panorama Desa Citarik'),
  ('beranda-sekilas',     'Sekilas Desa Citarik',                '<p>Desa Citarik, Kecamatan Palabuhanratu, Kabupaten Sukabumi, Provinsi Jawa Barat. Luas wilayah 526,38 hektar, 4 dusun, 10 RW, 50 RT, dan 13.187 jiwa (4.220 KK).</p>', NULL),
  ('profil-umum',         'Profil Umum',                      '<p>Desa Citarik terletak di Kecamatan Palabuhanratu, Kabupaten Sukabumi, Provinsi Jawa Barat (kode desa 3202110005). Berdasarkan isian Prodeskel Maret 2025, desa ini memiliki 4 dusun, 10 RW, dan 50 RT, dengan jumlah penduduk 13.187 jiwa (6.750 laki-laki, 6.437 perempuan) dari 4.220 kepala keluarga.</p>', NULL),
  ('profil-geografis',    'Kondisi Geografis',                '<p>Luas wilayah Desa Citarik tercatat 526,38 hektar (Profil Desa / PPT). Batas: utara Gunung Jayanti (Cikidang), selatan Desa Cidadap / Sungai Cimandiri (Simpenan), timur Desa Cikadu (Bantargadung), barat Desa Jayanti (Cikakak).</p>', NULL),
  ('profil-sejarah',      'Sejarah Desa',                     '<p>Menurut Profil Desa Citarik (PPT), pemerintahan desa tercatat sejak 1912. Nama berkembang dari Cihoe (sampai 1912), Kalideres (1912–1930), lalu Citarik sejak 1930. Pemekaran 2012 (Perda No. 21/2012) membentuk Desa Jayanti dari wilayah Citarik.</p>', NULL),
  ('potensi',             'Potensi Desa Citarik',                '<h2>Pariwisata</h2><p>Pantai-pantai di Desa Citarik menawarkan panorama yang memukau dengan ombak Samudra Hindia yang eksotis.</p><h2>Perikanan</h2><p>Desa Citarik memiliki potensi perikanan laut yang besar dengan hasil tangkapan ikan segar melimpah setiap harinya.</p><h2>Pertanian</h2><p>Lahan pertanian di bagian utara desa menghasilkan palawija dan sayuran berkualitas tinggi.</p>', NULL),
  ('pemerintahan-visi-misi', 'Visi & Misi Pemerintahan Desa', '<h2>Visi</h2><p>"Terwujudnya Desa Citarik yang Maju, Mandiri, dan Sejahtera Berbasis Potensi Lokal Berkelanjutan"</p><h2>Misi</h2><ol><li>Meningkatkan kualitas pelayanan publik yang transparan dan akuntabel.</li><li>Mengembangkan potensi wisata, perikanan, dan UMKM lokal secara berkelanjutan.</li><li>Memperkuat infrastruktur desa dan ketahanan lingkungan.</li><li>Meningkatkan sumber daya manusia yang berdaya saing.</li></ol>', NULL),
  ('pemerintahan-ruang-lingkup', 'Ruang Lingkup Pemerintahan', '<p>Pemerintah Desa Citarik mengelola wilayah seluas ±2.500 ha yang mencakup 5 dusun, 12 RW, dan 38 RT dengan jumlah penduduk sekitar 4.500 jiwa.</p>', NULL),
  ('pemerintahan-tugas-fungsi', 'Tugas & Fungsi', '<p>Pemerintah Desa Citarik bertugas menyelenggarakan pemerintahan desa, melaksanakan pembangunan, pembinaan kemasyarakatan, dan pemberdayaan masyarakat sesuai dengan Undang-Undang Desa No. 6 Tahun 2014.</p>', NULL);

-- ── Perangkat desa seed ──
INSERT OR IGNORE INTO perangkat_desa (nama, jabatan, urutan) VALUES
  ('(Segera Diisi)',     'Kepala Desa',          1),
  ('(Segera Diisi)',     'Sekretaris Desa',       2),
  ('(Segera Diisi)',     'Kaur Keuangan',         3),
  ('(Segera Diisi)',     'Kaur Umum',             4),
  ('(Segera Diisi)',     'Kasi Pemerintahan',     5),
  ('(Segera Diisi)',     'Kasi Kesejahteraan',    6),
  ('(Segera Diisi)',     'Kasi Pelayanan',        7);

-- ── Wisata seed ──
INSERT OR IGNORE INTO wisata (slug, nama, deskripsi_html, status) VALUES
  ('pantai-Citarik', 'Pantai Citarik', '<p>Pantai Citarik adalah destinasi wisata utama Desa Citarik dengan hamparan pasir putih dan ombak Samudra Hindia yang indah. Cocok untuk wisata keluarga, snorkeling, dan menikmati matahari terbenam.</p>', 'published'),
  ('pantai-karang-sari', 'Pantai Karang Sari', '<p>Pantai Karang Sari menawarkan keindahan batu karang alami yang tersusun indah di sepanjang garis pantai. Ideal untuk fotografi alam dan menikmati ketenangan alam pesisir.</p>', 'published');

-- ── UMKM seed ──
INSERT OR IGNORE INTO umkm (slug, nama, kategori, deskripsi_html, lokasi, wa_number, status) VALUES
  ('kerajinan-bambu-Citarik', 'Kerajinan Bambu Citarik', 'Kriya', '<p>Produk kerajinan tangan dari bambu pilihan yang diproses secara tradisional oleh warga Desa Citarik. Tersedia berbagai produk mulai dari perabot rumah tangga hingga souvenir khas desa.</p>', 'Dusun Ciawi, Desa Citarik', '6281234567890', 'published'),
  ('warung-ikan-bakar-bu-sari', 'Warung Ikan Bakar Bu Sari', 'Kuliner', '<p>Menyajikan ikan bakar segar hasil tangkapan nelayan Desa Citarik dengan bumbu khas Sunda. Buka setiap hari dari pukul 10.00 hingga 22.00 WIB.</p>', 'Tepi Pantai Citarik', '6282345678901', 'published'),
  ('kebun-sayur-pak-budi', 'Kebun Sayur Pak Budi', 'Hasil Tani', '<p>Menyediakan aneka sayuran segar organik dari kebun milik sendiri. Tersedia juga paket langganan mingguan untuk warga sekitar.</p>', 'Dusun Ciawi, Desa Citarik', NULL, 'published');

-- ── Titik peta seed ──
INSERT OR IGNORE INTO titik_peta (lat, lng, jenis, linked_slug, label) VALUES
  (-7.0508, 106.5444, 'wisata', 'pantai-Citarik', 'Pantai Citarik'),
  (-7.0650, 106.5350, 'wisata', 'pantai-karang-sari', 'Pantai Karang Sari'),
  (-7.0350, 106.5580, 'umkm', 'kerajinan-bambu-Citarik', 'Kerajinan Bambu Citarik');
