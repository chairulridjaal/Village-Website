-- ─────────────────────────────────────────────────────────────
-- Story: Isi konten resmi Profil Desa Citarik (data nyata dari RPJMDes/Profil 2026)
-- Menggantikan konten placeholder pada 0002_seed.sql dengan data faktual.
-- Aman dijalankan berulang (idempotent) & di atas DB kosong maupun terisi.
-- ─────────────────────────────────────────────────────────────

-- ── Page sections (UPSERT: perbarui konten, pertahankan cover jika sudah ada) ──
INSERT INTO page_section (slug, title, content_html) VALUES
  ('beranda-hero', 'Selamat Datang di Desa Citarik',
   '<p>Desa Citarik adalah desa pesisir di Kecamatan Simpenan, Kabupaten Sukabumi, yang berbatasan langsung dengan Samudra Hindia. Kaya akan potensi bahari, pertanian, dan wisata alam, serta menjadi salah satu penyangga kawasan Geopark Ciletuh-Palabuhanratu.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('beranda-sekilas', 'Sekilas Desa Citarik',
   '<p>Berdiri sejak tahun 1976 sebagai hasil pemekaran dari Desa Cidadap, Desa Citarik kini berstatus Desa Maju dengan luas wilayah 3.300 hektar. Desa ini terdiri dari 4 dusun, 12 RW, dan 62 RT, dengan jumlah penduduk 12.494 jiwa (4.355 KK). Mayoritas warga bermata pencaharian di sektor pertanian, perikanan/nelayan, dan perdagangan.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('profil-umum', 'Profil Umum',
   '<p>Desa Citarik terletak di sebelah selatan Kecamatan Simpenan, Kabupaten Sukabumi, Jawa Barat, berjarak sekitar 2 km dari pusat kecamatan dan 7 km dari pusat Pemerintahan Kabupaten Sukabumi. Sebagai desa pesisir yang berbatasan dengan Samudra Hindia, Citarik dikenal sebagai lumbung padi wilayah Palabuhanratu sekaligus memiliki garis pantai untuk pengembangan wisata bahari.</p><p>Desa Citarik berstatus <strong>Desa Maju</strong> berdasarkan Indeks Desa Membangun (IDM) dan pernah meraih Juara I Program Desa Pesisir Tangguh (PDPT) tingkat Kabupaten tahun 2011-2013 serta menjadi nominator tingkat nasional.</p><ul><li><strong>Alamat:</strong> Jl. Raya Bojongkopo KM.02, Desa Citarik, Kecamatan Simpenan, Kode Pos 43361</li><li><strong>Email:</strong> desacitarik@gmail.com</li></ul>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('profil-geografis', 'Kondisi Geografis & Demografi',
   '<p>Desa Citarik memiliki luas wilayah <strong>3.300 hektar</strong> dengan iklim kemarau dan penghujan. Wilayahnya terbagi dalam 4 dusun: Bojongkopo, Babakan Astana, Sawah Garung, dan Cimapag.</p><h2>Batas Wilayah</h2><ul><li><strong>Utara:</strong> Desa Cidadap, Kecamatan Simpenan</li><li><strong>Selatan:</strong> Desa Kertajaya &amp; Desa Sangrawayang</li><li><strong>Timur:</strong> Desa Langkap Jaya &amp; Desa Cibuntu</li><li><strong>Barat:</strong> Samudera Hindia</li></ul><h2>Data Kependudukan</h2><p>Jumlah penduduk <strong>12.494 jiwa</strong> (laki-laki 6.341, perempuan 6.153) dari <strong>4.355 kepala keluarga</strong>. Mayoritas penduduk memeluk agama Islam. Mata pencaharian utama warga meliputi nelayan, petani, buruh tani, pedagang, dan wiraswasta.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('profil-sejarah', 'Sejarah Desa',
   '<p>Desa Citarik terbentuk pada tahun 1976 sebagai hasil pemekaran dari Desa Cidadap, yang saat itu masih menginduk ke Kecamatan Palabuhanratu. Pemekaran diprakarsai para tokoh masyarakat melalui rembug desa untuk meningkatkan pelayanan dan pemerataan pembangunan.</p><p>Nama <strong>Citarik</strong> berasal dari kata Belanda <em>Loge</em> yang berarti kantor atau markas pertahanan. Di pesisir desa terdapat benteng pertahanan peninggalan masa Belanda; keberadaan benteng inilah yang menjadi asal-usul penamaan Desa Citarik. Situs benteng tersebut kini menjadi salah satu daya tarik sejarah desa.</p>')
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
   '<p>Pemerintah Desa Citarik dipimpin oleh Kepala Desa <strong>Papang Suherlan</strong> untuk periode <strong>2025-2027</strong>. Pemerintahan menyelenggarakan wilayah seluas 3.300 hektar yang mencakup <strong>4 dusun, 12 RW, dan 62 RT</strong>, dengan jumlah penduduk 12.494 jiwa dari 4.355 kepala keluarga. Badan Permusyawaratan Desa (BPD) beranggotakan 9 orang yang mewakili keempat kedusunan.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('pemerintahan-tugas-fungsi', 'Tugas & Fungsi',
   '<p>Pemerintah Desa Citarik bertugas menyelenggarakan pemerintahan desa, melaksanakan pembangunan, pembinaan kemasyarakatan, dan pemberdayaan masyarakat sesuai dengan Undang-Undang Nomor 6 Tahun 2014 tentang Desa.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

-- ── Perangkat Desa (data nyata, periode 2025-2027) ──
DELETE FROM perangkat_desa;
INSERT INTO perangkat_desa (nama, jabatan, urutan) VALUES
  ('Papang Suherlan',                 'Kepala Desa',             1),
  ('Hadiansyah',                      'Sekretaris Desa',         2),
  ('Alan Abdul Malik',                'Kepala Seksi Pemerintahan', 3),
  ('Ruli Agustian, S.M.',             'Kepala Seksi Kesejahteraan', 4),
  ('Wida Sulastri',                   'Kepala Seksi Pelayanan',  5),
  ('Dini Dwi Lurian, S.H.',           'Kepala Urusan Keuangan',  6),
  ('Parastilla Az-zahra, S.I.P.',     'Kepala Urusan Umum & TU', 7),
  ('Aliefia Suci Nusantari, A.Md.Kom.', 'Kepala Urusan Perencanaan', 8),
  ('Endang Hardian, S.Kom.',          'Kepala Dusun I',          9),
  ('Gusandi, S.E.',                   'Kepala Dusun II',        10),
  ('Isep Hikmatullah',                'Kepala Dusun III',       11),
  ('Suhenda, S.E.',                   'Kepala Dusun IV',        12);

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
