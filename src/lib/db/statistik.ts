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
  jiwa: number; l: number; p: number; kk: number; rw: string; jmlRw: number; jmlRt: number;
} {
  try {
    const v = JSON.parse(json || '{}') as Record<string, unknown>;
    const l = Number(v.l) || 0;
    const p = Number(v.p) || 0;
    const jiwaExplicit = Number(v.jiwa) || 0;
    return {
      l,
      p,
      kk: Number(v.kk) || 0,
      rw: String(v.rw ?? ''),
      jmlRw: Number(v.jmlRw) || 0,
      jmlRt: Number(v.jmlRt) || 0,
      jiwa: jiwaExplicit || l + p,
    };
  } catch {
    return { jiwa: 0, l: 0, p: 0, kk: 0, rw: '', jmlRw: 0, jmlRt: 0 };
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

/** Total penduduk from dusun rows (jiwa or L+P). */
export function totalPendudukFromStats(cats: StatKategoriWithRows[]): number {
  const dusun = cats.find((c) => c.layout === 'dusun');
  if (!dusun) return 0;
  return dusun.rows.reduce((sum, row) => sum + parseDusunValue(row.value_json).jiwa, 0);
}

/** Drop empty simple categories (all values 0) so public pages stay clean. Admin can re-add anytime. */
export function filterPublicStatCats(cats: StatKategoriWithRows[]): StatKategoriWithRows[] {
  return cats.filter((c) => {
    if (!c.rows.length) return false;
    if (c.layout === 'dusun') {
      return c.rows.some((r) => {
        const d = parseDusunValue(r.value_json);
        return d.jiwa > 0 || d.jmlRw > 0 || d.jmlRt > 0 || d.kk > 0 || d.l > 0 || d.p > 0;
      });
    }
    return c.rows.some((r) => parseSimpleValue(r.value_json) > 0);
  });
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
