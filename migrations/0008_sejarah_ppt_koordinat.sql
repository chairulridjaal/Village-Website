-- Sejarah resmi dari PROFIL DESA CITARIK.ppt (bukan placeholder Loji)
INSERT INTO page_section (slug, title, content_html) VALUES
  ('profil-sejarah', 'Sejarah Desa',
   '<p>Menurut dokumen Profil Desa Citarik (PPT), desa ini sudah tercatat sebagai pemerintahan desa sejak <strong>tahun 1912</strong>, dipimpin Kepala Desa (dulu disebut Jaro).</p><p>Sampai tahun 1912 wilayah ini bernama <strong>Desa Cihoe</strong>. Kata <em>hoe</em> merujuk pada rotan—tali temali yang kuat dan mengikat kencang (tarik). Pada periode <strong>1912–1930</strong> desa bernama <strong>Kalideres</strong>. Sejak <strong>1930</strong> nama resmi menjadi <strong>Desa Citarik</strong>, sejalan dengan penamaan batas alam <strong>Kali Citarik</strong> (antara Kalideres dan Tonjong) serta pemaknaan Sunda dari Cihoe dan Kalideres yang dihubungkan dengan arti yang sama.</p><p>Pada <strong>2012</strong>, sesuai <strong>Perda Kabupaten Sukabumi Nomor 21 Tahun 2012</strong> (5 April 2012), Desa Citarik mengalami pemekaran sehingga terbentuk <strong>Desa Jayanti</strong> sebagai desa baru; Desa Citarik tetap sebagai desa induk. Penetapan batas Citarik–Jayanti dituangkan dalam Keputusan Bupati Sukabumi Nomor 141/Kep.1315-Tapem/2013 (30 Desember 2013).</p><p>Pusat pemerintahan desa berada di Dusun III, Jalan Raya Citarik Km. 06 Palabuhanratu, Kp. Legok Loa RT 001 RW 014.</p>')
ON CONFLICT(slug) DO UPDATE SET title=excluded.title, content_html=excluded.content_html, updated_at=datetime('now');

-- Alamat kantor sesuai PPT
INSERT INTO pengaturan (key, value) VALUES
  ('kontak_alamat', 'Jl. Raya Citarik Km. 06, Kp. Legok Loa RT 001/RW 014, Desa Citarik, Kecamatan Palabuhanratu, Kabupaten Sukabumi')
ON CONFLICT(key) DO UPDATE SET value=excluded.value;
