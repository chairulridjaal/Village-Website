-- CMS non-tech overhaul: multi-admin perms, custom statistik, potensi, nav, site keys.
-- Old pengaturan stat_* JSON keys are kept for one-release read fallback.

-- ── Admin roles & permissions ──────────────────────────────────────────────
ALTER TABLE admin_user ADD COLUMN is_master INTEGER NOT NULL DEFAULT 0;
ALTER TABLE admin_user ADD COLUMN aktif INTEGER NOT NULL DEFAULT 1;
ALTER TABLE admin_user ADD COLUMN perm_konten INTEGER NOT NULL DEFAULT 1;
ALTER TABLE admin_user ADD COLUMN perm_pelayanan INTEGER NOT NULL DEFAULT 1;
ALTER TABLE admin_user ADD COLUMN perm_umkm INTEGER NOT NULL DEFAULT 1;
ALTER TABLE admin_user ADD COLUMN perm_berita INTEGER NOT NULL DEFAULT 1;
ALTER TABLE admin_user ADD COLUMN perm_peta INTEGER NOT NULL DEFAULT 1;
ALTER TABLE admin_user ADD COLUMN perm_media INTEGER NOT NULL DEFAULT 1;
ALTER TABLE admin_user ADD COLUMN perm_pengaturan INTEGER NOT NULL DEFAULT 0;

-- First existing admin becomes master with full permissions.
UPDATE admin_user SET
  is_master = 1,
  aktif = 1,
  perm_konten = 1,
  perm_pelayanan = 1,
  perm_umkm = 1,
  perm_berita = 1,
  perm_peta = 1,
  perm_media = 1,
  perm_pengaturan = 1
WHERE id = (SELECT MIN(id) FROM admin_user);

-- ── Statistik Desa (custom categories) ───────────────────────────────────
CREATE TABLE IF NOT EXISTS stat_kategori (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  key TEXT UNIQUE NOT NULL,
  label TEXT NOT NULL,
  layout TEXT NOT NULL DEFAULT 'simple', -- simple | dusun
  urutan INTEGER NOT NULL DEFAULT 0,
  aktif INTEGER NOT NULL DEFAULT 1,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS stat_baris (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kategori_id INTEGER NOT NULL REFERENCES stat_kategori(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  value_json TEXT NOT NULL DEFAULT '{}',
  urutan INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_stat_baris_kategori ON stat_baris(kategori_id, urutan);

INSERT OR IGNORE INTO stat_kategori (id, key, label, layout, urutan, aktif) VALUES
  (1, 'dusun', 'Penduduk per Dusun', 'dusun', 10, 1),
  (2, 'umur', 'Golongan Umur', 'simple', 20, 1),
  (3, 'pendidikan', 'Tingkat Pendidikan', 'simple', 30, 1),
  (4, 'pencaharian', 'Mata Pencaharian', 'simple', 40, 1);

-- Seed baris from Prodeskel defaults (same as 0005/0006). Only if empty.
-- 4 dusun (Prodeskel): rincian L/P/KK per dusun belum ada di sumber → 0, admin isi nanti.
-- Total penduduk tetap di stat_umum (13.187 jiwa / 4.220 KK).
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 1, 'Dusun I', '{"l":0,"p":0,"kk":0,"rw":"","jmlRw":0}', 1
WHERE NOT EXISTS (SELECT 1 FROM stat_baris WHERE kategori_id = 1);
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 1, 'Dusun II', '{"l":0,"p":0,"kk":0,"rw":"","jmlRw":0}', 2
WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 1) = 1;
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 1, 'Dusun III', '{"l":0,"p":0,"kk":0,"rw":"","jmlRw":0}', 3
WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 1) = 2;
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 1, 'Dusun IV', '{"l":0,"p":0,"kk":0,"rw":"","jmlRw":0}', 4
WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 1) = 3;

INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 2, '0-1 tahun', '{"value":1909}', 0 WHERE NOT EXISTS (SELECT 1 FROM stat_baris WHERE kategori_id = 2);
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 2, '2-5 tahun', '{"value":3676}', 1 WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 2) = 1;
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 2, '6-15 tahun', '{"value":4111}', 2 WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 2) = 2;
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 2, '16-30 tahun', '{"value":3594}', 3 WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 2) = 3;
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 2, '31-40 tahun', '{"value":1757}', 4 WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 2) = 4;
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 2, '41-50 tahun', '{"value":1900}', 5 WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 2) = 5;
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 2, '51-60 tahun', '{"value":1351}', 6 WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 2) = 6;
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 2, '61-65 tahun', '{"value":393}', 7 WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 2) = 7;
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 2, '66 tahun ke atas', '{"value":457}', 8 WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 2) = 8;

INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 3, 'Usia 3-6 thn di TK/play group', '{"value":1068}', 0 WHERE NOT EXISTS (SELECT 1 FROM stat_baris WHERE kategori_id = 3);
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 3, 'Tamat SMA/sederajat', '{"value":6310}', 1 WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 3) = 1;

INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 4, 'Buruh tani', '{"value":963}', 0 WHERE NOT EXISTS (SELECT 1 FROM stat_baris WHERE kategori_id = 4);
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT 4, 'Buruh harian lepas', '{"value":1570}', 1 WHERE (SELECT COUNT(*) FROM stat_baris WHERE kategori_id = 4) = 1;

-- ── Potensi CMS ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS potensi (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  ringkasan TEXT DEFAULT '',
  deskripsi_html TEXT DEFAULT '',
  stats_json TEXT DEFAULT '[]',
  cover_r2_key TEXT,
  status TEXT DEFAULT 'draft',
  urutan INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO potensi (slug, nama, ringkasan, deskripsi_html, stats_json, status, urutan) VALUES
(
  'perikanan',
  'Perikanan',
  'Menurut Prodeskel 2025: empang/kolam, alat pancing, serta produksi ikan mas dan nila. Pemasaran melalui pasar, KUD, dan lumbung desa.',
  '<p>Data Prodeskel Maret 2025 mencatat produksi perikanan skala kecil di Desa Citarik: alat pancing (14 unit, ±1 ton/tahun) dan empang/kolam (3 unit, ±2 ton/tahun). Jenis ikan yang dilaporkan meliputi mas dan nila (masing-masing ±1 ton/tahun).</p><p>Pemasaran hasil perikanan menurut form dilakukan melalui pasar, KUD, tengkulak, dan lumbung desa. Terdapat juga 1 sungai dengan kondisi air keruh.</p>',
  '[{"icon":"fish","label":"Empang/kolam","value":"3 unit"},{"icon":"anchor","label":"Alat pancing","value":"14 unit"},{"icon":"package","label":"Mas & nila","value":"±2 ton/th"}]',
  'published',
  10
),
(
  'pertanian',
  'Pertanian & Perkebunan',
  'Prodeskel 2025: 773 keluarga petani, 2.330 Ha tanah sawah, padi sawah 53 Ha (±26 ton/ha), dan budidaya pisang. Peluang kemitraan pertanian terbuka.',
  '<p>Menurut isian Prodeskel Maret 2025, Desa Citarik memiliki <strong>773 keluarga petani</strong>, di antaranya 207 keluarga memiliki tanah pertanian. Luas tanah sawah tercatat 2.330 hektar, dengan komoditas padi sawah yang dilaporkan 53 Ha berproduktivitas sekitar 26 ton/ha.</p><p>Selain padi, form mencatat budidaya pisang (26 Ha, ±5 ton/ha). Pemasaran hasil tanaman pangan dan buah dilakukan antara lain melalui KUD, pengecer, dan lumbung desa.</p>',
  '[{"icon":"users","label":"Keluarga petani","value":"773"},{"icon":"wheat","label":"Padi sawah","value":"53 Ha"},{"icon":"layers","label":"Tanah sawah total","value":"2.330 Ha"}]',
  'published',
  20
),
(
  'sdm',
  'Potensi Sumber Daya Manusia',
  '8.553 warga usia 18–56 tahun bekerja, 4 dusun, 10 RW, 50 RT, BPD 9 anggota, LPMD, dan BUMDes — fondasi kelembagaan desa (Prodeskel & rekap PEMDES 2025).',
  '<p>Data kelembagaan dan tenaga kerja merujuk Prodeskel Maret 2025 serta rekap PEMDES/BPD Juni 2025. Penduduk usia 18–56 tahun yang bekerja tercatat 8.553 orang (laki-laki 4.609, perempuan 3.944).</p><h2>Kelembagaan</h2><ul><li><strong>BPD</strong> — 9 anggota (rekap BPD Juni 2025)</li><li><strong>LPMD</strong> — 1 lembaga · 12 pengurus</li><li><strong>BUMDes</strong> — 1 unit usaha desa</li><li><strong>RW / RT</strong> — 10 RW, 50 RT</li><li><strong>Kepala Dusun</strong> — 4 dusun</li></ul>',
  '[{"icon":"briefcase","label":"Usia 18–56 thn bekerja","value":"8.553"},{"icon":"users","label":"Kepala keluarga","value":"4.220"},{"icon":"user-check","label":"Penduduk total","value":"13.187"}]',
  'published',
  30
);

-- ── Public nav / footer ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS nav_item (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  location TEXT NOT NULL, -- header | footer
  label TEXT NOT NULL,
  href TEXT NOT NULL,
  urutan INTEGER NOT NULL DEFAULT 0,
  aktif INTEGER NOT NULL DEFAULT 1,
  style TEXT NOT NULL DEFAULT 'link', -- link | cta
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO nav_item (id, location, label, href, urutan, aktif, style) VALUES
  (1, 'header', 'Beranda', '/', 10, 1, 'link'),
  (2, 'header', 'Profil', '/profil', 20, 1, 'link'),
  (3, 'header', 'Pemerintahan', '/pemerintahan', 30, 1, 'link'),
  (4, 'header', 'Potensi', '/potensi', 40, 1, 'link'),
  (5, 'header', 'Pelayanan', '/pelayanan', 50, 1, 'link'),
  (6, 'header', 'UMKM', '/umkm', 60, 1, 'link'),
  (7, 'header', 'Peta', '/peta', 70, 1, 'link'),
  (8, 'header', 'Berita', '/berita', 80, 1, 'link'),
  (9, 'header', 'Kontak', '/kontak', 90, 1, 'cta'),
  (10, 'footer', 'Profil Desa', '/profil', 10, 1, 'link'),
  (11, 'footer', 'Potensi', '/potensi', 20, 1, 'link'),
  (12, 'footer', 'Pelayanan', '/pelayanan', 30, 1, 'link'),
  (13, 'footer', 'Direktori UMKM', '/umkm', 40, 1, 'link'),
  (14, 'footer', 'Peta Desa', '/peta', 50, 1, 'link'),
  (15, 'footer', 'Berita', '/berita', 60, 1, 'link');

-- ── Site settings keys ───────────────────────────────────────────────────
INSERT OR IGNORE INTO pengaturan (key, value) VALUES
  ('wa_pelayanan', ''),
  ('map_lat', '-7.009933224557312'),
  ('map_lng', '106.58103748650889'),
  ('map_zoom', '15'),
  ('kecamatan', 'Palabuhanratu'),
  ('kabupaten', 'Sukabumi'),
  ('footer_tagline', 'Situs resmi Pemerintah Desa Citarik, Kecamatan Palabuhanratu, Kabupaten Sukabumi.');
