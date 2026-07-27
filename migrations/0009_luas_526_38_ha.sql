-- Luas resmi: 526,38 Ha (PROFIL DESA CITARIK.ppt).
-- Angka 52.638 Ha di Prodeskel dianggap salah isian (koma digeser).

INSERT INTO pengaturan (key, value) VALUES
  ('stat_umum', '{"luas":"526,38","rw":10,"rt":50,"penduduk":13187,"laki":6750,"perempuan":6437,"kk":4220,"kepadatan":"25,05","dusun":4,"kecamatan":"Palabuhanratu","kabupaten":"Sukabumi","provinsi":"Jawa Barat","kode_desa":"3202110005","tahun":2025,"luas_sumber":"PPT Profil Desa"}')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;

INSERT INTO page_section (slug, title, content_html) VALUES
  ('profil-geografis', 'Kondisi Geografis',
   '<p>Luas wilayah Desa Citarik tercatat <strong>526,38 hektar</strong> (Profil Desa / PPT). Wilayah berada di kaki Gunung Jayanti, dengan topografi dataran rendah hingga tinggi, mayoritas lahan pertanian (sawah dan kebun). Menurut Prodeskel 2025, penggunaan lahan mencakup sawah, tanah kering, perkebunan, hutan, dan fasilitas umum.</p><h2>Batas Wilayah</h2><ul><li><strong>Utara:</strong> Alam Gunung Jayanti / kehutanan (Kec. Cikidang)</li><li><strong>Selatan:</strong> Desa Cidadap / Sungai Cimandiri (Kec. Simpenan); juga berbatasan Tonjong lewat sungai Citarik (PPT)</li><li><strong>Timur:</strong> Desa Cikadu (Kec. Bantargadung)</li><li><strong>Barat:</strong> Desa Jayanti (Kec. Cikakak)</li></ul><p>Penetapan batas didukung Perda No. 21 Tahun 2012 (pemekaran Jayanti). Suhu harian sekitar 23–30 °C; curah hujan sekitar 2.900 mm/tahun (PPT).</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('beranda-sekilas', 'Sekilas Desa Citarik',
   '<p>Desa Citarik, Kecamatan Palabuhanratu, Kabupaten Sukabumi, Provinsi Jawa Barat. Luas wilayah <strong>526,38 hektar</strong>, 4 dusun, 10 RW, 50 RT, dan 13.187 jiwa (4.220 KK) menurut Prodeskel Maret 2025.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

INSERT INTO page_section (slug, title, content_html) VALUES
  ('pemerintahan-ruang-lingkup', 'Ruang Lingkup Pemerintahan',
   '<p>Pemerintah Desa Citarik dipimpin oleh Kepala Desa <strong>Sumantri</strong> (rekap PEMDES Juni 2025). Kecamatan <strong>Palabuhanratu</strong>, Kabupaten Sukabumi. Wilayah seluas <strong>526,38 hektar</strong> mencakup <strong>4 dusun, 10 RW, dan 50 RT</strong>, dengan jumlah penduduk 13.187 jiwa dari 4.220 kepala keluarga (Prodeskel Maret 2025). BPD beranggotakan 9 orang.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');
