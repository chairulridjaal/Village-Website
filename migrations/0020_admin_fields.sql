-- Admin-only fields from %%key%% markers in Word templates (filled after accept, optional blanks).
ALTER TABLE jenis_pelayanan ADD COLUMN admin_fields_json TEXT NOT NULL DEFAULT '[]';
ALTER TABLE pengajuan_pelayanan ADD COLUMN admin_data_json TEXT NOT NULL DEFAULT '{}';
