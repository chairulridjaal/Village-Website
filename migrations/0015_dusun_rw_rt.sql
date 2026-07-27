-- RW/RT per dusun dari Laporan Tahunan Desa Citarik 2017–2018
-- (disebutkan user; total 10 RW + 50 RT = Prodeskel 2025).
-- Nama dusun dari PPT Profil Desa Citarik. Jiwa/KK per dusun tetap 0.

DELETE FROM stat_baris
WHERE kategori_id IN (SELECT id FROM stat_kategori WHERE key = 'dusun' OR layout = 'dusun');

INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT id, 'Dusun I – Cipicung',
  '{"l":0,"p":0,"kk":0,"rw":"","jmlRw":3,"jmlRt":14}', 1
FROM stat_kategori WHERE key = 'dusun' LIMIT 1;

INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT id, 'Dusun II – Cisaat',
  '{"l":0,"p":0,"kk":0,"rw":"","jmlRw":2,"jmlRt":12}', 2
FROM stat_kategori WHERE key = 'dusun' LIMIT 1;

INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT id, 'Dusun III – Tegallega',
  '{"l":0,"p":0,"kk":0,"rw":"","jmlRw":3,"jmlRt":14}', 3
FROM stat_kategori WHERE key = 'dusun' LIMIT 1;

INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT id, 'Dusun IV – Ciawun',
  '{"l":0,"p":0,"kk":0,"rw":"","jmlRw":2,"jmlRt":10}', 4
FROM stat_kategori WHERE key = 'dusun' LIMIT 1;

INSERT INTO pengaturan (key, value) VALUES (
  'stat_dusun',
  '[{"label":"Dusun I – Cipicung","l":0,"p":0,"kk":0,"jmlRw":3,"jmlRt":14},{"label":"Dusun II – Cisaat","l":0,"p":0,"kk":0,"jmlRw":2,"jmlRt":12},{"label":"Dusun III – Tegallega","l":0,"p":0,"kk":0,"jmlRw":3,"jmlRt":14},{"label":"Dusun IV – Ciawun","l":0,"p":0,"kk":0,"jmlRw":2,"jmlRt":10}]'
)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;
