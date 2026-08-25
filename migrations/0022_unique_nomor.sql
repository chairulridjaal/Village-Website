-- Harden nomor uniqueness for race safety: concurrent ajukan should not duplicate PLV-YYYY-NNNN.
-- D1 is SQLite; UNIQUE index enforced at insert time, retry logic in createPengajuan handles violation.
CREATE UNIQUE INDEX IF NOT EXISTS idx_pengajuan_nomor_unique ON pengajuan_pelayanan(nomor);
