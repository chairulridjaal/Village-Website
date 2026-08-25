export type PengumumanStyle = 'info' | 'success' | 'warning' | 'urgent';

export interface PengumumanBanner {
  id: number;
  aktif: number;
  teks: string;
  tautan_url: string | null;
  tautan_label: string | null;
  style: PengumumanStyle;
  ends_at: string | null;
  updated_at: string;
}

export async function getPengumumanBanner(db: D1Database): Promise<PengumumanBanner | null> {
  return db.prepare('SELECT * FROM pengumuman_banner WHERE id=1').first<PengumumanBanner>();
}

/** Banner visible on homepage: aktif + (no ends_at or ends_at still in future). */
export async function getActivePengumumanForHomepage(
  db: D1Database
): Promise<PengumumanBanner | null> {
  const row = await getPengumumanBanner(db);
  if (!row || !row.aktif || !row.teks.trim()) return null;
  if (row.ends_at) {
    const end = Date.parse(row.ends_at);
    if (!Number.isNaN(end) && end <= Date.now()) return null;
  }
  return row;
}

export async function upsertPengumumanBanner(
  data: {
    aktif: boolean;
    teks: string;
    tautan_url: string | null;
    tautan_label: string | null;
    style: PengumumanStyle;
    ends_at: string | null;
  },
  db: D1Database
): Promise<void> {
  await db
    .prepare(
      `INSERT INTO pengumuman_banner (id, aktif, teks, tautan_url, tautan_label, style, ends_at, updated_at)
       VALUES (1, ?, ?, ?, ?, ?, ?, datetime('now'))
       ON CONFLICT(id) DO UPDATE SET
         aktif=excluded.aktif,
         teks=excluded.teks,
         tautan_url=excluded.tautan_url,
         tautan_label=excluded.tautan_label,
         style=excluded.style,
         ends_at=excluded.ends_at,
         updated_at=datetime('now')`
    )
    .bind(
      data.aktif ? 1 : 0,
      data.teks,
      data.tautan_url,
      data.tautan_label,
      data.style,
      data.ends_at
    )
    .run();
}
