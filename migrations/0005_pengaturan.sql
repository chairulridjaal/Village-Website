-- Pengaturan situs: kontak, media sosial, dan statistik desa yang bisa
-- diubah admin lewat /admin/pengaturan. Nilai awal = data yang sebelumnya
-- hardcode di profil.astro/pemerintahan.astro/index.astro/Footer.astro,
-- jadi tidak ada perubahan tampilan sebelum admin mengedit.

CREATE TABLE IF NOT EXISTS pengaturan (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

-- Nilai awal = Prodeskel Desa Citarik Maret 2025 (lihat profil-desa-citarik.md).
-- INSERT OR IGNORE: DB yang sudah punya key tidak diubah di sini;
-- migrasi 0006_profil_prodeskel_2025.sql yang memaksa update.
INSERT OR IGNORE INTO pengaturan (key, value) VALUES
  ('kontak_alamat',  'Kantor Desa Citarik, Kecamatan Palabuhanratu, Kabupaten Sukabumi, Jawa Barat'),
  ('kontak_telepon', '(0266) 000-0000'),
  ('kontak_email',   'desacitarik@gmail.com'),
  ('kontak_jam',     'Senin-Jumat, pukul 08.00-15.00 WIB'),
  ('sosial_whatsapp', ''),
  ('sosial_facebook', ''),
  ('sosial_instagram', ''),
  ('stat_umum', '{"luas":"526,38","rw":10,"rt":50,"penduduk":13187,"laki":6750,"perempuan":6437,"kk":4220,"kepadatan":"25,05","dusun":4,"kecamatan":"Palabuhanratu","kabupaten":"Sukabumi","provinsi":"Jawa Barat","kode_desa":"3202110005","tahun":2025,"luas_sumber":"PPT Profil Desa"}'),
  ('stat_dusun', '[
    {"label":"Keseluruhan (Prodeskel 2025)","l":6750,"p":6437,"kk":4220}
  ]'),
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
  ]'),
  ('stat_pendidikan', '[
    {"label":"Usia 3-6 thn di TK/play group","value":1068},
    {"label":"Tamat SMA/sederajat","value":6310}
  ]'),
  ('stat_pencaharian', '[
    {"label":"Buruh tani","value":963},
    {"label":"Buruh harian lepas","value":1570}
  ]');
