export interface TitikPeta {
  id: number;
  lat: number;
  lng: number;
  jenis: 'umkm' | 'potensi';
  linked_slug: string;
  label: string | null;
}

export async function getAllTitikPeta(db: D1Database): Promise<TitikPeta[]> {
  const r = await db.prepare('SELECT * FROM titik_peta ORDER BY id').all<TitikPeta>();
  return r.results;
}

export async function createTitikPeta(
  data: Omit<TitikPeta, 'id'>,
  db: D1Database
): Promise<number> {
  const r = await db.prepare(
    'INSERT INTO titik_peta (lat, lng, jenis, linked_slug, label) VALUES (?, ?, ?, ?, ?) RETURNING id'
  ).bind(data.lat, data.lng, data.jenis, data.linked_slug, data.label).first<{ id: number }>();
  return r!.id;
}

export async function updateTitikPeta(
  id: number,
  data: Omit<TitikPeta, 'id'>,
  db: D1Database
): Promise<void> {
  await db.prepare(
    'UPDATE titik_peta SET lat=?, lng=?, jenis=?, linked_slug=?, label=? WHERE id=?'
  ).bind(data.lat, data.lng, data.jenis, data.linked_slug, data.label, id).run();
}

export async function deleteTitikPeta(id: number, db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM titik_peta WHERE id=?').bind(id).run();
}
