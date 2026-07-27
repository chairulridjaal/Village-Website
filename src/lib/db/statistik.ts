export type StatLayout = 'simple' | 'dusun';

export interface StatKategori {
  id: number;
  key: string;
  label: string;
  layout: StatLayout;
  urutan: number;
  aktif: number;
  created_at: string;
  updated_at: string;
}

export interface StatBaris {
  id: number;
  kategori_id: number;
  label: string;
  value_json: string;
  urutan: number;
  created_at: string;
  updated_at: string;
}

export interface StatKategoriWithRows extends StatKategori {
  rows: StatBaris[];
}

export function parseSimpleValue(json: string): number {
  try {
    const v = JSON.parse(json || '{}') as { value?: number };
    return Number(v.value) || 0;
  } catch {
    return 0;
  }
}

export function parseDusunValue(json: string): {
  l: number; p: number; kk: number; rw: string; jmlRw: number;
} {
  try {
    const v = JSON.parse(json || '{}') as Record<string, unknown>;
    return {
      l: Number(v.l) || 0,
      p: Number(v.p) || 0,
      kk: Number(v.kk) || 0,
      rw: String(v.rw ?? ''),
      jmlRw: Number(v.jmlRw) || 0,
    };
  } catch {
    return { l: 0, p: 0, kk: 0, rw: '', jmlRw: 0 };
  }
}

function toKey(label: string): string {
  return label
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .slice(0, 40) || `kat-${Date.now()}`;
}

export async function listKategori(db: D1Database, aktifOnly = false): Promise<StatKategori[]> {
  const sql = aktifOnly
    ? 'SELECT * FROM stat_kategori WHERE aktif=1 ORDER BY urutan, id'
    : 'SELECT * FROM stat_kategori ORDER BY urutan, id';
  const r = await db.prepare(sql).all<StatKategori>();
  return r.results;
}

export async function listBaris(kategoriId: number, db: D1Database): Promise<StatBaris[]> {
  const r = await db.prepare(
    'SELECT * FROM stat_baris WHERE kategori_id=? ORDER BY urutan, id'
  ).bind(kategoriId).all<StatBaris>();
  return r.results;
}

export async function getStatistikFull(db: D1Database, aktifOnly = true): Promise<StatKategoriWithRows[]> {
  const cats = await listKategori(db, aktifOnly);
  const out: StatKategoriWithRows[] = [];
  for (const c of cats) {
    out.push({ ...c, rows: await listBaris(c.id, db) });
  }
  return out;
}

/** Total penduduk: sum L+P from first dusun-layout category, else 0. */
export function totalPendudukFromStats(cats: StatKategoriWithRows[]): number {
  const dusun = cats.find((c) => c.layout === 'dusun');
  if (!dusun) return 0;
  return dusun.rows.reduce((sum, row) => {
    const d = parseDusunValue(row.value_json);
    return sum + d.l + d.p;
  }, 0);
}

export async function createKategori(
  data: { label: string; layout: StatLayout; urutan?: number },
  db: D1Database
): Promise<number> {
  const base = toKey(data.label);
  let key = base;
  let i = 1;
  while (await db.prepare('SELECT id FROM stat_kategori WHERE key=?').bind(key).first()) {
    key = `${base}-${i++}`;
  }
  const urutan = data.urutan ?? 100;
  const r = await db.prepare(
    `INSERT INTO stat_kategori (key, label, layout, urutan, aktif) VALUES (?,?,?,?,1) RETURNING id`
  ).bind(key, data.label.trim(), data.layout, urutan).first<{ id: number }>();
  return r!.id;
}

export async function updateKategori(
  id: number,
  data: { label: string; layout: StatLayout; urutan: number; aktif: number },
  db: D1Database
): Promise<void> {
  await db.prepare(
    `UPDATE stat_kategori SET label=?, layout=?, urutan=?, aktif=?, updated_at=datetime('now') WHERE id=?`
  ).bind(data.label.trim(), data.layout, data.urutan, data.aktif, id).run();
}

export async function deleteKategori(id: number, db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM stat_baris WHERE kategori_id=?').bind(id).run();
  await db.prepare('DELETE FROM stat_kategori WHERE id=?').bind(id).run();
}

export async function createBaris(
  kategoriId: number,
  label: string,
  valueJson: string,
  urutan: number,
  db: D1Database
): Promise<number> {
  const r = await db.prepare(
    `INSERT INTO stat_baris (kategori_id, label, value_json, urutan) VALUES (?,?,?,?) RETURNING id`
  ).bind(kategoriId, label.trim(), valueJson, urutan).first<{ id: number }>();
  return r!.id;
}

export async function updateBaris(
  id: number,
  label: string,
  valueJson: string,
  urutan: number,
  db: D1Database
): Promise<void> {
  await db.prepare(
    `UPDATE stat_baris SET label=?, value_json=?, urutan=?, updated_at=datetime('now') WHERE id=?`
  ).bind(label.trim(), valueJson, urutan, id).run();
}

export async function deleteBaris(id: number, db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM stat_baris WHERE id=?').bind(id).run();
}
