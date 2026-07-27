import { toSlug } from './slug';

export interface Potensi {
  id: number;
  slug: string;
  nama: string;
  ringkasan: string;
  deskripsi_html: string;
  stats_json: string;
  cover_r2_key: string | null;
  status: 'draft' | 'published';
  urutan: number;
  created_at: string;
  updated_at: string;
}

export type PotensiInput = {
  nama: string;
  ringkasan: string;
  deskripsi_html: string;
  stats_json: string;
  status: 'draft' | 'published';
  urutan: number;
};

export interface PotensiStatCard {
  icon: string;
  label: string;
  value: string;
}

export function parseStatsJson(json: string): PotensiStatCard[] {
  try {
    const v = JSON.parse(json || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export async function getPublishedPotensi(db: D1Database): Promise<Potensi[]> {
  const r = await db.prepare(
    "SELECT * FROM potensi WHERE status='published' ORDER BY urutan, nama"
  ).all<Potensi>();
  return r.results;
}

export async function getPotensiBySlug(slug: string, db: D1Database): Promise<Potensi | null> {
  return db.prepare(
    "SELECT * FROM potensi WHERE slug=? AND status='published'"
  ).bind(slug).first<Potensi>();
}

export async function getAllPotensi(db: D1Database): Promise<Potensi[]> {
  const r = await db.prepare('SELECT * FROM potensi ORDER BY urutan, updated_at DESC').all<Potensi>();
  return r.results;
}

export async function getPotensiById(id: number, db: D1Database): Promise<Potensi | null> {
  return db.prepare('SELECT * FROM potensi WHERE id=?').bind(id).first<Potensi>();
}

export async function createPotensi(data: PotensiInput, db: D1Database): Promise<{ id: number; slug: string }> {
  const baseSlug = toSlug(data.nama);
  let slug = baseSlug;
  let i = 1;
  while (await db.prepare('SELECT id FROM potensi WHERE slug=?').bind(slug).first()) {
    slug = `${baseSlug}-${i++}`;
  }
  const r = await db.prepare(
    `INSERT INTO potensi (slug,nama,ringkasan,deskripsi_html,stats_json,status,urutan)
     VALUES (?,?,?,?,?,?,?) RETURNING id`
  ).bind(
    slug, data.nama, data.ringkasan, data.deskripsi_html, data.stats_json, data.status, data.urutan
  ).first<{ id: number }>();
  return { id: r!.id, slug };
}

export async function updatePotensi(id: number, data: PotensiInput, db: D1Database): Promise<void> {
  await db.prepare(
    `UPDATE potensi SET nama=?, ringkasan=?, deskripsi_html=?, stats_json=?, status=?, urutan=?,
     updated_at=datetime('now') WHERE id=?`
  ).bind(
    data.nama, data.ringkasan, data.deskripsi_html, data.stats_json, data.status, data.urutan, id
  ).run();
}

export async function deletePotensi(id: number, db: D1Database): Promise<void> {
  await db.prepare('DELETE FROM potensi WHERE id=?').bind(id).run();
}
