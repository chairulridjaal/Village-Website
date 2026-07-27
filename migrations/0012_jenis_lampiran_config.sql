-- Lampiran dikonfigurasi per jenis surat (bukan selalu tampil di form).
-- lampiran_wajib=1 → field unggah muncul & wajib diisi (minimal 1 file).
-- lampiran_info → petunjuk teks untuk warga (apa yang di-upload).

ALTER TABLE jenis_pelayanan ADD COLUMN lampiran_wajib INTEGER NOT NULL DEFAULT 0;
ALTER TABLE jenis_pelayanan ADD COLUMN lampiran_info TEXT NOT NULL DEFAULT '';

-- Contoh: SKTM & domisili minta KTP/KK; usaha minta KTP
UPDATE jenis_pelayanan SET
  lampiran_wajib = 1,
  lampiran_info = 'Unggah fotokopi KTP dan KK (PDF/JPG/PNG, maks. 3 file).'
WHERE slug IN ('surat-keterangan-domisili', 'surat-keterangan-tidak-mampu');

UPDATE jenis_pelayanan SET
  lampiran_wajib = 1,
  lampiran_info = 'Unggah fotokopi KTP pemohon (PDF/JPG/PNG).'
WHERE slug = 'surat-keterangan-usaha';
