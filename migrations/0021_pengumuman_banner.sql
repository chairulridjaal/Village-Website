-- Banner pengumuman beranda (di atas header, hanya homepage)
CREATE TABLE IF NOT EXISTS pengumuman_banner (
  id INTEGER PRIMARY KEY CHECK (id = 1),
  aktif INTEGER NOT NULL DEFAULT 0,
  teks TEXT NOT NULL DEFAULT '',
  tautan_url TEXT,
  tautan_label TEXT,
  style TEXT NOT NULL DEFAULT 'info',
  ends_at TEXT,
  updated_at TEXT DEFAULT (datetime('now'))
);

INSERT OR IGNORE INTO pengumuman_banner (id, aktif, teks, style)
VALUES (1, 0, '', 'info');
