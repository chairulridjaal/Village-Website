-- Pengaturan situs: kontak, media sosial, dan statistik desa yang bisa
-- diubah admin lewat /admin/pengaturan. Nilai awal = data yang sebelumnya
-- hardcode di profil.astro/pemerintahan.astro/index.astro/Footer.astro,
-- jadi tidak ada perubahan tampilan sebelum admin mengedit.

CREATE TABLE IF NOT EXISTS pengaturan (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL DEFAULT ''
);

INSERT OR IGNORE INTO pengaturan (key, value) VALUES
  ('kontak_alamat',  'Kantor Desa Citarik, Kecamatan Simpenan, Kabupaten Sukabumi, Jawa Barat'),
  ('kontak_telepon', '(0266) 000-0000'),
  ('kontak_email',   'desacitarik@gmail.com'),
  ('kontak_jam',     'Senin-Jumat, pukul 08.00-15.00 WIB'),
  ('sosial_whatsapp', ''),
  ('sosial_facebook', ''),
  ('sosial_instagram', ''),
  ('stat_umum', '{"luas":"3.300","rw":12,"rt":62}'),
  ('stat_dusun', '[
    {"label":"Bojongkopo (I)","rw":"RW 01-02","jmlRw":2,"l":1356,"p":1330,"kk":940},
    {"label":"Sawah Garung (II)","rw":"RW 03-05","jmlRw":3,"l":1367,"p":1365,"kk":970},
    {"label":"Babakan Astana (III)","rw":"RW 06-08","jmlRw":3,"l":1582,"p":1466,"kk":1075},
    {"label":"Cimapag (IV)","rw":"RW 09-12","jmlRw":4,"l":2039,"p":1989,"kk":1370}
  ]'),
  ('stat_umur', '[
    {"label":"0-1 tahun","value":156},
    {"label":"2-5 tahun","value":815},
    {"label":"6-15 tahun","value":2250},
    {"label":"16-30 tahun","value":2844},
    {"label":"31-40 tahun","value":1743},
    {"label":"41-50 tahun","value":1716},
    {"label":"50-60 tahun","value":1490},
    {"label":"60-65 tahun","value":555},
    {"label":"66 tahun ke atas","value":925}
  ]'),
  ('stat_pendidikan', '[
    {"label":"Tamat SD/sederajat","value":4809},
    {"label":"Tamat SLTP/sederajat","value":1571},
    {"label":"Tamat SLTA/sederajat","value":1365},
    {"label":"Sekolah TK","value":972},
    {"label":"Tidak sekolah/buta huruf","value":291},
    {"label":"Tidak tamat SD","value":180},
    {"label":"Sarjana (D1-D3)","value":80},
    {"label":"Sarjana (S1)","value":200},
    {"label":"Pascasarjana (S2)","value":4}
  ]'),
  ('stat_pencaharian', '[
    {"label":"Nelayan","value":800},
    {"label":"Buruh tani","value":700},
    {"label":"Petani","value":600},
    {"label":"Pedagang","value":512},
    {"label":"Swasta","value":350},
    {"label":"PNS/TNI/Polri","value":85},
    {"label":"Lainnya (pelajar, ibu rumah tangga, dll.)","value":4915}
  ]');
