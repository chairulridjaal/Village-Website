-- Jiwa per dusun: Laporan Tahunan Desa Citarik 2017–2018
-- (user). Total baris = 13.808; total Prodeskel 2025 (13.187) tetap di stat_umum.
-- L/P/KK per dusun masih tidak ada → 0.

DELETE FROM stat_baris
WHERE kategori_id IN (SELECT id FROM stat_kategori WHERE key = 'dusun' OR layout = 'dusun');

INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT id, 'Dusun I – Cipicung',
  '{"jiwa":3336,"l":0,"p":0,"kk":0,"jmlRw":3,"jmlRt":14}', 1
FROM stat_kategori WHERE key = 'dusun' LIMIT 1;

INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT id, 'Dusun II – Cisaat',
  '{"jiwa":3579,"l":0,"p":0,"kk":0,"jmlRw":2,"jmlRt":12}', 2
FROM stat_kategori WHERE key = 'dusun' LIMIT 1;

INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT id, 'Dusun III – Tegallega',
  '{"jiwa":4189,"l":0,"p":0,"kk":0,"jmlRw":3,"jmlRt":14}', 3
FROM stat_kategori WHERE key = 'dusun' LIMIT 1;

INSERT INTO stat_baris (kategori_id, label, value_json, urutan)
SELECT id, 'Dusun IV – Ciawun',
  '{"jiwa":2704,"l":0,"p":0,"kk":0,"jmlRw":2,"jmlRt":10}', 4
FROM stat_kategori WHERE key = 'dusun' LIMIT 1;

INSERT INTO pengaturan (key, value) VALUES (
  'stat_dusun',
  '[{"label":"Dusun I – Cipicung","jiwa":3336,"l":0,"p":0,"kk":0,"jmlRw":3,"jmlRt":14},{"label":"Dusun II – Cisaat","jiwa":3579,"l":0,"p":0,"kk":0,"jmlRw":2,"jmlRt":12},{"label":"Dusun III – Tegallega","jiwa":4189,"l":0,"p":0,"kk":0,"jmlRw":3,"jmlRt":14},{"label":"Dusun IV – Ciawun","jiwa":2704,"l":0,"p":0,"kk":0,"jmlRw":2,"jmlRt":10}]'
)
ON CONFLICT(key) DO UPDATE SET value = excluded.value;
