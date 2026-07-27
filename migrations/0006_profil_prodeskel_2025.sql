-- ─────────────────────────────────────────────────────────────
-- Ganti data profil placeholder (eks-Loji) dengan isian resmi
-- Prodeskel "Profil Desa dan Kelurahan" Desa Citarik, Maret 2025
-- Kode desa: 3202110005 · Kecamatan: Palabuhanratu
-- Sumber terstruktur: profil-desa-citarik.md
-- ─────────────────────────────────────────────────────────────

-- ── Page sections profil ──
INSERT INTO page_section (slug, title, content_html) VALUES
  ('profil-umum', 'Profil Umum',
   '<p>Desa Citarik terletak di Kecamatan Palabuhanratu, Kabupaten Sukabumi, Provinsi Jawa Barat (kode desa 3202110005). Berdasarkan isian Prodeskel Maret 2025, desa ini memiliki 4 dusun, 10 RW, dan 50 RT, dengan jumlah penduduk 13.187 jiwa (6.750 laki-laki, 6.437 perempuan) dari 4.220 kepala keluarga.</p><p>Jarak ke ibu kota kecamatan maupun ibu kota kabupaten masing-masing sekitar 6 km (±0,15 jam dengan kendaraan bermotor). Jarak ke ibu kota provinsi sekitar 150 km (±6 jam bermotor).</p><ul><li><strong>Kecamatan:</strong> Palabuhanratu</li><li><strong>Kabupaten:</strong> Sukabumi</li><li><strong>Provinsi:</strong> Jawa Barat</li><li><strong>Kode desa:</strong> 3202110005</li><li><strong>Sumber data:</strong> Profil Desa dan Kelurahan (Prodeskel), Maret 2025</li></ul>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('profil-geografis', 'Kondisi Geografis',
   '<p>Luas wilayah Desa Citarik tercatat <strong>526,38 hektar</strong> (Profil Desa / PPT). Wilayah berada di kaki Gunung Jayanti, dengan topografi dataran rendah hingga tinggi, mayoritas lahan pertanian (sawah dan kebun).</p><h2>Batas Wilayah</h2><ul><li><strong>Utara:</strong> Alam Gunung Jayanti / kehutanan (Kec. Cikidang)</li><li><strong>Selatan:</strong> Desa Cidadap / Sungai Cimandiri (Kec. Simpenan)</li><li><strong>Timur:</strong> Desa Cikadu (Kec. Bantargadung)</li><li><strong>Barat:</strong> Desa Jayanti (Kec. Cikakak)</li></ul><p>Penetapan batas didukung Perda No. 21 Tahun 2012. Suhu harian sekitar 23–30 °C; curah hujan sekitar 2.900 mm/tahun (PPT).</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('beranda-sekilas', 'Sekilas Desa Citarik',
   '<p>Desa Citarik, Kecamatan Palabuhanratu, Kabupaten Sukabumi, Provinsi Jawa Barat. Luas wilayah 526,38 hektar, 4 dusun, 10 RW, 50 RT, dan 13.187 jiwa (4.220 KK) menurut Prodeskel Maret 2025.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('beranda-hero', 'Selamat Datang di Desa Citarik',
   '<p>Desa Citarik berada di Kecamatan Palabuhanratu, Kabupaten Sukabumi, Jawa Barat. Profil resmi desa mengacu pada isian Prodeskel Kemendagri tahun 2025 (kode desa 3202110005).</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

-- ── Statistik pengaturan (demografi & wilayah) ──
-- Catatan: rincian L/P/KK per dusun tidak tersedia di PDF Prodeskel;
-- ditampilkan sebagai total desa. Pendidikan & pencaharian hanya baris
-- yang terisi di form (banyak kategori kosong di sumber).

INSERT INTO pengaturan (key, value) VALUES
  ('stat_umum', '{"luas":"526,38","rw":10,"rt":50,"penduduk":13187,"laki":6750,"perempuan":6437,"kk":4220,"kepadatan":"25,05","dusun":4,"kecamatan":"Palabuhanratu","kabupaten":"Sukabumi","provinsi":"Jawa Barat","kode_desa":"3202110005","tahun":2025,"luas_sumber":"PPT Profil Desa"}')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;

INSERT INTO pengaturan (key, value) VALUES
  ('stat_dusun', '[
    {"label":"Keseluruhan (Prodeskel 2025)","l":6750,"p":6437,"kk":4220}
  ]')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;

INSERT INTO pengaturan (key, value) VALUES
  ('stat_umur', '[
    {"label":"0-1 tahun","value":1909},
    {"label":"2-5 tahun","value":3676},
    {"label":"6-15 tahun","value":4111},
    {"label":"16-30 tahun","value":3594},
    {"label":"31-40 tahun","value":1757},
    {"label":"41-50 tahun","value":1900},
    {"label":"51-60 tahun","value":1351},
    {"label":"61-65 tahun","value":393},
    {"label":"66 tahun ke atas","value":457}
  ]')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;

INSERT INTO pengaturan (key, value) VALUES
  ('stat_pendidikan', '[
    {"label":"Usia 3-6 thn di TK/play group","value":1068},
    {"label":"Tamat SMA/sederajat","value":6310}
  ]')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;

INSERT INTO pengaturan (key, value) VALUES
  ('stat_pencaharian', '[
    {"label":"Buruh tani","value":963},
    {"label":"Buruh harian lepas","value":1570}
  ]')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;

-- Kontak alamat: kecamatan sesuai Prodeskel
INSERT INTO pengaturan (key, value) VALUES
  ('kontak_alamat', 'Kantor Desa Citarik, Kecamatan Palabuhanratu, Kabupaten Sukabumi, Jawa Barat')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;

-- Ruang lingkup pemerintahan: angka & identitas selaras profil Prodeskel
INSERT INTO page_section (slug, title, content_html) VALUES
  ('pemerintahan-ruang-lingkup', 'Ruang Lingkup Pemerintahan',
   '<p>Menurut isian Prodeskel Maret 2025, Kepala Desa (pada form) adalah <strong>H. Sumantri</strong>. Pemerintahan menyelenggarakan wilayah seluas <strong>52.638 hektar</strong> yang mencakup <strong>4 dusun, 10 RW, dan 50 RT</strong>, dengan jumlah penduduk 13.187 jiwa dari 4.220 kepala keluarga. Badan Permusyawaratan Desa (BPD) beranggotakan 9 orang. Kecamatan: Palabuhanratu, Kabupaten Sukabumi.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');
