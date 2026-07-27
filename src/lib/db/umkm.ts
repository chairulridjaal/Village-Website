import { toSlug } from './slug';

export interface Umkm {
  id: number;
  slug: string;
  nama: string;
  kategori: string;
  deskripsi_html: string;
  menu: string | null;
  jam_buka: string | null;
  cara_pesan: string | null;
  lokasi: string | null;
  wa_number: string | null;
  telepon: string | null;
  google_maps_url: string | null;
  qris_r2_key: string | null;
  toko_online_url: string | null;
  status: 'draft' | 'published';
  created_at: string;
  updated_at: string;
}

export async function getPublishedUmkm(db: D1Database): Promise<Umkm[]> {
  const r = await db.prepare("SELECT * FROM umkm WHERE status='published' ORDER BY nama").all<Umkm>();
  return r.results;
}

export async function getUmkmBySlug(slug: string, db: D1Database): Promise<Umkm | null> {
  return db.prepare("SELECT * FROM umkm WHERE slug=? AND status='published'").bind(slug).first<Umkm>();
}

export async function getAllUmkm(db: D1Database): Promise<Umkm[]> {
  const r = await db.prepare('SELECT * FROM umkm ORDER BY updated_at DESC').all<Umkm>();
  return r.results;
}

export async function getUmkmById(id: number, db: D1Database): Promise<Umkm | null> {
  return db.prepare('SELECT * FROM umkm WHERE id=?').bind(id).first<Umkm>();
}

export async function createUmkm(
  data: Omit<Umkm, 'id' | 'slug' | 'created_at' | 'updated_at'>,
  db: D1Database
): Promise<{ id: number; slug: string }> {
  const baseSlug = toSlug(data.nama);
  let slug = baseSlug;
  let i = 1;
  while (await db.prepare('SELECT id FROM umkm WHERE slug=?').bind(slug).first()) {
    slug = `${baseSlug}-${i++}`;
  }
  const r = await db.prepare(
    `INSERT INTO umkm (slug,nama,kategori,deskripsi_html,menu,jam_buka,cara_pesan,lokasi,wa_number,telepon,google_maps_url,qris_r2_key,toko_online_url,status)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`
  ).bind(slug, data.nama, data.kategori, data.deskripsi_html, data.menu, data.jam_buka, data.cara_pesan,
         data.lokasi, data.wa_number,
         data.telepon, data.google_maps_url, data.qris_r2_key, data.toko_online_url, data.status)
   .first<{ id: number }>();
  return { id: r!.id, slug };
}

export async function updateUmkm(
  id: number,
  data: Omit<Umkm, 'id' | 'slug' | 'created_at' | 'updated_at'>,
  db: D1Database
): Promise<void> {
  await db.prepare(
    `UPDATE umkm SET nama=?,kategori=?,deskripsi_html=?,menu=?,jam_buka=?,cara_pesan=?,lokasi=?,wa_number=?,telepon=?,
     google_maps_url=?,qris_r2_key=?,toko_online_url=?,status=?,updated_at=datetime('now')
     WHERE id=?`
  ).bind(data.nama, data.kategori, data.deskripsi_html, data.menu, data.jam_buka, data.cara_pesan,
         data.lokasi, data.wa_number,
         data.telepon, data.google_maps_url, data.qris_r2_key, data.toko_online_url,
         data.status, id).run();
}

export async function deleteUmkm(id: number, db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM media_link WHERE owner_type=? AND owner_id=?').bind('umkm', id).run();
  await db.prepare('DELETE FROM umkm WHERE id=?').bind(id).run();
}
