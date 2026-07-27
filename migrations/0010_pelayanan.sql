-- Pelayanan desa: jenis surat (katalog + template) & pengajuan warga

CREATE TABLE IF NOT EXISTS jenis_pelayanan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  nama TEXT NOT NULL,
  deskripsi TEXT DEFAULT '',
  syarat TEXT DEFAULT '',
  fields_json TEXT NOT NULL DEFAULT '[]',
  template_html TEXT NOT NULL DEFAULT '',
  cover_r2_key TEXT,
  aktif INTEGER NOT NULL DEFAULT 1,
  urutan INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS pengajuan_pelayanan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nomor TEXT UNIQUE NOT NULL,
  jenis_id INTEGER NOT NULL,
  data_json TEXT NOT NULL DEFAULT '{}',
  pemohon_nama TEXT NOT NULL,
  pemohon_nik TEXT NOT NULL DEFAULT '',
  pemohon_wa TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'menunggu',
  alasan_tolak TEXT,
  decided_at TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (jenis_id) REFERENCES jenis_pelayanan(id)
);

CREATE INDEX IF NOT EXISTS idx_pengajuan_status ON pengajuan_pelayanan(status);
CREATE INDEX IF NOT EXISTS idx_pengajuan_jenis ON pengajuan_pelayanan(jenis_id);

-- Seed 3 jenis contoh (admin bisa ubah/tambah)
INSERT OR IGNORE INTO jenis_pelayanan (slug, nama, deskripsi, syarat, fields_json, template_html, aktif, urutan) VALUES
(
  'surat-keterangan-domisili',
  'Surat Keterangan Domisili',
  'Surat keterangan bahwa pemohon berdomisili di Desa Citarik.',
  'Fotokopi KTP dan KK (dibawa saat pengambilan surat bila diminta).',
  '[
    {"key":"nama","label":"Nama lengkap","type":"text","required":true},
    {"key":"nik","label":"NIK","type":"text","required":true},
    {"key":"tempat_lahir","label":"Tempat lahir","type":"text","required":true},
    {"key":"tanggal_lahir","label":"Tanggal lahir","type":"date","required":true},
    {"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true},
    {"key":"keperluan","label":"Keperluan surat","type":"text","required":true}
  ]',
  '<div style="text-align:center;margin-bottom:1.5rem">
  <p style="font-weight:700;margin:0">PEMERINTAH DESA CITARIK</p>
  <p style="margin:0">Kecamatan Palabuhanratu · Kabupaten Sukabumi</p>
  <hr style="border:none;border-top:2px solid #0A3650;margin:0.75rem 0"/>
  <p style="font-weight:700;text-decoration:underline;margin:0">SURAT KETERANGAN DOMISILI</p>
  <p style="margin:0.25rem 0 0">Nomor: {{nomor_surat}}</p>
</div>
<p>Yang bertanda tangan di bawah ini, Kepala Desa Citarik, Kecamatan Palabuhanratu, Kabupaten Sukabumi, menerangkan bahwa:</p>
<table style="width:100%;margin:1rem 0">
  <tr><td style="width:35%;padding:0.2rem 0">Nama</td><td>: {{nama}}</td></tr>
  <tr><td style="padding:0.2rem 0">NIK</td><td>: {{nik}}</td></tr>
  <tr><td style="padding:0.2rem 0">Tempat/Tgl. Lahir</td><td>: {{tempat_lahir}}, {{tanggal_lahir}}</td></tr>
  <tr><td style="padding:0.2rem 0">Alamat</td><td>: {{alamat}}</td></tr>
</table>
<p>Adalah benar berdomisili di wilayah Desa Citarik. Surat ini dibuat untuk keperluan: <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
<p style="text-align:right;margin-top:2.5rem">Citarik, {{tanggal}}<br/>Kepala Desa Citarik<br/><br/><br/><br/><strong>Sumantri</strong></p>',
  1, 1
),
(
  'surat-keterangan-tidak-mampu',
  'Surat Keterangan Tidak Mampu (SKTM)',
  'Surat keterangan status ekonomi untuk keperluan bantuan, beasiswa, atau layanan kesehatan.',
  'Fotokopi KTP dan KK.',
  '[
    {"key":"nama","label":"Nama lengkap","type":"text","required":true},
    {"key":"nik","label":"NIK","type":"text","required":true},
    {"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true},
    {"key":"pekerjaan","label":"Pekerjaan","type":"text","required":true},
    {"key":"keperluan","label":"Keperluan surat","type":"text","required":true}
  ]',
  '<div style="text-align:center;margin-bottom:1.5rem">
  <p style="font-weight:700;margin:0">PEMERINTAH DESA CITARIK</p>
  <p style="margin:0">Kecamatan Palabuhanratu · Kabupaten Sukabumi</p>
  <hr style="border:none;border-top:2px solid #0A3650;margin:0.75rem 0"/>
  <p style="font-weight:700;text-decoration:underline;margin:0">SURAT KETERANGAN TIDAK MAMPU</p>
  <p style="margin:0.25rem 0 0">Nomor: {{nomor_surat}}</p>
</div>
<p>Yang bertanda tangan di bawah ini, Kepala Desa Citarik, menerangkan bahwa:</p>
<table style="width:100%;margin:1rem 0">
  <tr><td style="width:35%;padding:0.2rem 0">Nama</td><td>: {{nama}}</td></tr>
  <tr><td style="padding:0.2rem 0">NIK</td><td>: {{nik}}</td></tr>
  <tr><td style="padding:0.2rem 0">Pekerjaan</td><td>: {{pekerjaan}}</td></tr>
  <tr><td style="padding:0.2rem 0">Alamat</td><td>: {{alamat}}</td></tr>
</table>
<p>Adalah benar warga Desa Citarik yang menurut sepengetahuan kami termasuk keluarga tidak mampu. Surat ini dibuat untuk keperluan: <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat ini dibuat dengan sebenar-benarnya.</p>
<p style="text-align:right;margin-top:2.5rem">Citarik, {{tanggal}}<br/>Kepala Desa Citarik<br/><br/><br/><br/><strong>Sumantri</strong></p>',
  1, 2
),
(
  'surat-keterangan-usaha',
  'Surat Keterangan Usaha',
  'Surat keterangan bahwa pemohon memiliki usaha di wilayah Desa Citarik.',
  'Fotokopi KTP; sebutkan jenis dan lokasi usaha dengan jelas.',
  '[
    {"key":"nama","label":"Nama lengkap","type":"text","required":true},
    {"key":"nik","label":"NIK","type":"text","required":true},
    {"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true},
    {"key":"nama_usaha","label":"Nama usaha","type":"text","required":true},
    {"key":"jenis_usaha","label":"Jenis usaha","type":"text","required":true},
    {"key":"alamat_usaha","label":"Alamat / lokasi usaha","type":"textarea","required":true},
    {"key":"keperluan","label":"Keperluan surat","type":"text","required":false}
  ]',
  '<div style="text-align:center;margin-bottom:1.5rem">
  <p style="font-weight:700;margin:0">PEMERINTAH DESA CITARIK</p>
  <p style="margin:0">Kecamatan Palabuhanratu · Kabupaten Sukabumi</p>
  <hr style="border:none;border-top:2px solid #0A3650;margin:0.75rem 0"/>
  <p style="font-weight:700;text-decoration:underline;margin:0">SURAT KETERANGAN USAHA</p>
  <p style="margin:0.25rem 0 0">Nomor: {{nomor_surat}}</p>
</div>
<p>Yang bertanda tangan di bawah ini, Kepala Desa Citarik, menerangkan bahwa:</p>
<table style="width:100%;margin:1rem 0">
  <tr><td style="width:35%;padding:0.2rem 0">Nama</td><td>: {{nama}}</td></tr>
  <tr><td style="padding:0.2rem 0">NIK</td><td>: {{nik}}</td></tr>
  <tr><td style="padding:0.2rem 0">Alamat</td><td>: {{alamat}}</td></tr>
  <tr><td style="padding:0.2rem 0">Nama usaha</td><td>: {{nama_usaha}}</td></tr>
  <tr><td style="padding:0.2rem 0">Jenis usaha</td><td>: {{jenis_usaha}}</td></tr>
  <tr><td style="padding:0.2rem 0">Lokasi usaha</td><td>: {{alamat_usaha}}</td></tr>
</table>
<p>Adalah benar memiliki/menjalankan usaha tersebut di wilayah Desa Citarik. Surat ini dibuat untuk keperluan: <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
<p style="text-align:right;margin-top:2.5rem">Citarik, {{tanggal}}<br/>Kepala Desa Citarik<br/><br/><br/><br/><strong>Sumantri</strong></p>',
  1, 3
);
