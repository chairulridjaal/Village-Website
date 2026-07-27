-- Prodeskel mencatat 4 dusun, tapi rincian L/P/KK per dusun tidak ada di PDF.
-- Seed sebelumnya 1 baris "Keseluruhan" → Ruang Lingkup menampilkan 1 dusun.
-- Ganti dengan 4 baris Dusun I–IV (angka 0; admin isi di Statistik Desa).
-- Total penduduk/KK tetap dari stat_umum.

-- Hapus baris agregat lama di kategori dusun
DELETE FROM stat_baris
WHERE kategori_id IN (SELECT id FROM stat_kategori WHERE key = 'dusun' OR layout = 'dusun');

INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT id, 'Dusun I',   '{"l":0,"p":0,"kk":0,"rw":"","jmlRw":0}', 1 FROM stat_kategori WHERE key = 'dusun' LIMIT 1;
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT id, 'Dusun II',  '{"l":0,"p":0,"kk":0,"rw":"","jmlRw":0}', 2 FROM stat_kategori WHERE key = 'dusun' LIMIT 1;
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT id, 'Dusun III', '{"l":0,"p":0,"kk":0,"rw":"","jmlRw":0}', 3 FROM stat_kategori WHERE key = 'dusun' LIMIT 1;
INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT id, 'Dusun IV',  '{"l":0,"p":0,"kk":0,"rw":"","jmlRw":0}', 4 FROM stat_kategori WHERE key = 'dusun' LIMIT 1;

-- Legacy pengaturan JSON (fallback pembaca lama)
INSERT INTO pengaturan (key, value) VALUES (
  'stat_dusun',
  '[{"label":"Dusun I","l":0,"p":0,"kk":0,"rw":"","jmlRw":0},{"label":"Dusun II","l":0,"p":0,"kk":0,"rw":"","jmlRw":0},{"label":"Dusun III","l":0,"p":0,"kk":0,"rw":"","jmlRw":0},{"label":"Dusun IV","l":0,"p":0,"kk":0,"rw":"","jmlRw":0}]'
)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;
