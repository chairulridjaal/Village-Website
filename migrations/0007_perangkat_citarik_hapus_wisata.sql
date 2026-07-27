-- Perangkat resmi dari rekap PEMDES Juni 2025 (Palabuhanratu)
-- + bersihkan data wisata (fitur dihapus dari app)

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

INSERT INTO page_section (slug, title, content_html) VALUES
  ('pemerintahan-ruang-lingkup', 'Ruang Lingkup Pemerintahan',
   '<p>Pemerintah Desa Citarik dipimpin oleh Kepala Desa <strong>Sumantri</strong> (rekap PEMDES Juni 2025). Kecamatan <strong>Palabuhanratu</strong>, Kabupaten Sukabumi. Wilayah mencakup <strong>4 dusun, 10 RW, dan 50 RT</strong> dengan penduduk 13.187 jiwa (4.220 KK) menurut Prodeskel Maret 2025. BPD beranggotakan 9 orang.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

-- Hapus data wisata & pin peta jenis wisata
DELETE FROM media_link WHERE owner_type = 'wisata';
DELETE FROM titik_peta WHERE jenis = 'wisata';
DELETE FROM wisata;
