-- Point official letter templates at R2 keys (Workers cannot reliably fetch /public static paths from API handlers).
-- Objects must exist at media/templates/seed/*.docx (seeded via wrangler r2 object put or deploy script).

UPDATE jenis_pelayanan SET
  template_docx_path = 'media/templates/seed/surat-keterangan-domisili.docx',
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-domisili';

UPDATE jenis_pelayanan SET
  template_docx_path = 'media/templates/seed/surat-keterangan-pengantar-skck.docx',
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-pengantar-skck';

UPDATE jenis_pelayanan SET
  template_docx_path = 'media/templates/seed/surat-keterangan-tidak-mampu.docx',
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-tidak-mampu';

UPDATE jenis_pelayanan SET
  template_docx_path = 'media/templates/seed/surat-keterangan-umum.docx',
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-umum';

UPDATE jenis_pelayanan SET
  template_docx_path = 'media/templates/seed/surat-keterangan-usaha.docx',
  updated_at = datetime('now')
WHERE slug = 'surat-keterangan-usaha';
