-- Official letter templates: store path to .docx (static /templates/surat/… or R2 key media/templates/…)
-- Filled letters download as real Word files (1:1 kop/font/layout).

ALTER TABLE jenis_pelayanan ADD COLUMN template_docx_path TEXT;

-- Point known slugs at seeded official DOCX under public/templates/surat/
UPDATE jenis_pelayanan SET
  template_docx_path = '/templates/surat/surat-keterangan-domisili.docx',
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-domisili';

UPDATE jenis_pelayanan SET
  template_docx_path = '/templates/surat/surat-keterangan-pengantar-skck.docx',
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-pengantar-skck';

UPDATE jenis_pelayanan SET
  template_docx_path = '/templates/surat/surat-keterangan-tidak-mampu.docx',
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-tidak-mampu';

UPDATE jenis_pelayanan SET
  template_docx_path = '/templates/surat/surat-keterangan-umum.docx',
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-umum';

UPDATE jenis_pelayanan SET
  template_docx_path = '/templates/surat/surat-keterangan-usaha.docx',
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-usaha';

-- Upsert SKCK + Umum if missing (older DBs only had 3 seeds)
INSERT INTO jenis_pelayanan (slug, nama, deskripsi, syarat, fields_json, template_html, template_docx_path, aktif, urutan, lampiran_wajib, lampiran_info)
SELECT
  'surat-keterangan-pengantar-skck',
  'Surat Keterangan Pengantar SKCK',
  'Pengantar pembuatan SKCK di kepolisian untuk warga Desa Citarik.',
  'Fotokopi KTP dan KK; surat pengantar RT/RW bila diminta.',
  '[{"key":"nama","label":"Nama lengkap","type":"text","required":true},{"key":"jenis_kelamin","label":"Jenis kelamin","type":"select","required":true,"options":["Laki-laki","Perempuan"]},{"key":"nik","label":"NIK","type":"text","required":true},{"key":"ttl","label":"Tempat / tanggal lahir","type":"text","required":true},{"key":"kewarganegaraan","label":"Kewarganegaraan","type":"text","required":true},{"key":"agama","label":"Agama","type":"text","required":true},{"key":"status_perkawinan","label":"Status perkawinan","type":"select","required":true,"options":["Belum Kawin","Kawin","Cerai Hidup","Cerai Mati"]},{"key":"pekerjaan","label":"Pekerjaan","type":"text","required":true},{"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true},{"key":"keperluan","label":"Keperluan","type":"text","required":true}]',
  '',
  '/templates/surat/surat-keterangan-pengantar-skck.docx',
  1, 1, 1,
  'Unggah fotokopi KTP dan/atau KK (PDF/JPG, maks. 3 file).'
WHERE NOT EXISTS (SELECT 1 FROM jenis_pelayanan WHERE slug = 'surat-keterangan-pengantar-skck');

INSERT INTO jenis_pelayanan (slug, nama, deskripsi, syarat, fields_json, template_html, template_docx_path, aktif, urutan, lampiran_wajib, lampiran_info)
SELECT
  'surat-keterangan-umum',
  'Surat Keterangan Umum',
  'Surat keterangan umum untuk keperluan administrasi warga Desa Citarik.',
  'Fotokopi KTP dan KK.',
  '[{"key":"nama","label":"Nama lengkap","type":"text","required":true},{"key":"jenis_kelamin","label":"Jenis kelamin","type":"select","required":true,"options":["Laki-laki","Perempuan"]},{"key":"nik","label":"NIK","type":"text","required":true},{"key":"ttl","label":"Tempat / tanggal lahir","type":"text","required":true},{"key":"agama","label":"Agama","type":"text","required":true},{"key":"kewarganegaraan","label":"Kewarganegaraan","type":"text","required":true},{"key":"pekerjaan","label":"Pekerjaan","type":"text","required":true},{"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true},{"key":"keterangan","label":"Isi keterangan","type":"textarea","required":true}]',
  '',
  '/templates/surat/surat-keterangan-umum.docx',
  1, 4, 1,
  'Unggah fotokopi KTP dan/atau KK (PDF/JPG, maks. 3 file).'
WHERE NOT EXISTS (SELECT 1 FROM jenis_pelayanan WHERE slug = 'surat-keterangan-umum');

-- Align fields_json for existing rows with DOCX placeholders
UPDATE jenis_pelayanan SET
  fields_json = '[{"key":"nama","label":"Nama lengkap","type":"text","required":true},{"key":"jenis_kelamin","label":"Jenis kelamin","type":"select","required":true,"options":["Laki-laki","Perempuan"]},{"key":"nik","label":"NIK","type":"text","required":true},{"key":"ttl","label":"Tempat / tanggal lahir","type":"text","required":true},{"key":"agama","label":"Agama","type":"text","required":true},{"key":"kewarganegaraan","label":"Kewarganegaraan","type":"text","required":true},{"key":"pekerjaan","label":"Pekerjaan","type":"text","required":true},{"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true}]',
  urutan = 2,
  aktif = 1,
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-domisili';

UPDATE jenis_pelayanan SET
  fields_json = '[{"key":"nama","label":"Nama lengkap","type":"text","required":true},{"key":"nik","label":"NIK","type":"text","required":true},{"key":"jenis_kelamin","label":"Jenis kelamin","type":"select","required":true,"options":["Laki-laki","Perempuan"]},{"key":"ttl","label":"Tempat / tanggal lahir","type":"text","required":true},{"key":"kewarganegaraan","label":"Kewarganegaraan","type":"text","required":true},{"key":"agama","label":"Agama","type":"text","required":true},{"key":"pekerjaan","label":"Pekerjaan","type":"text","required":true},{"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true},{"key":"keperluan","label":"Keperluan / tujuan surat","type":"text","required":true}]',
  urutan = 3,
  aktif = 1,
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-tidak-mampu';

UPDATE jenis_pelayanan SET
  fields_json = '[{"key":"nama","label":"Nama lengkap","type":"text","required":true},{"key":"jenis_kelamin","label":"Jenis kelamin","type":"select","required":true,"options":["Laki-laki","Perempuan"]},{"key":"nik","label":"NIK","type":"text","required":true},{"key":"ttl","label":"Tempat / tanggal lahir","type":"text","required":true},{"key":"agama","label":"Agama","type":"text","required":true},{"key":"kewarganegaraan","label":"Kewarganegaraan","type":"text","required":true},{"key":"pekerjaan","label":"Pekerjaan","type":"text","required":true},{"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true},{"key":"jenis_usaha","label":"Jenis / bidang usaha","type":"text","required":true},{"key":"keperluan","label":"Keperluan surat","type":"text","required":true}]',
  urutan = 5,
  aktif = 1,
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-usaha';
