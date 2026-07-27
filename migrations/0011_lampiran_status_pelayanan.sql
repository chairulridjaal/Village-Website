CREATE TABLE IF NOT EXISTS lampiran_pengajuan (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  pengajuan_id INTEGER NOT NULL,
  r2_key TEXT NOT NULL,
  filename TEXT NOT NULL DEFAULT '',
  content_type TEXT NOT NULL DEFAULT 'application/octet-stream',
  size_bytes INTEGER NOT NULL DEFAULT 0,
  created_at TEXT DEFAULT (datetime('now')),
  FOREIGN KEY (pengajuan_id) REFERENCES pengajuan_pelayanan(id)
);

CREATE INDEX IF NOT EXISTS idx_lampiran_pengajuan ON lampiran_pengajuan(pengajuan_id);
CREATE INDEX IF NOT EXISTS idx_pengajuan_nomor ON pengajuan_pelayanan(nomor);
