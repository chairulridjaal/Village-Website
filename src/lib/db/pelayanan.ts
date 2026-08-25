import { toSlug } from './slug';

export type FieldType = 'text' | 'textarea' | 'date' | 'number' | 'select';

export interface FormField {
  key: string;
  label: string;
  type: FieldType;
  required?: boolean;
  options?: string[];
}

export interface JenisPelayanan {
  id: number;
  slug: string;
  nama: string;
  deskripsi: string;
  syarat: string;
  fields_json: string;
  admin_fields_json: string;
  template_html: string;
  template_docx_path: string | null;
  cover_r2_key: string | null;
  aktif: number;
  urutan: number;
  lampiran_wajib: number;
  lampiran_info: string;
  created_at: string;
  updated_at: string;
}

export type JenisPelayananInput = {
  nama: string;
  deskripsi: string;
  syarat: string;
  fields_json: string;
  admin_fields_json?: string;
  template_html: string;
  template_docx_path?: string | null;
  aktif: number;
  urutan: number;
  lampiran_wajib: number;
  lampiran_info: string;
};

export type StatusPengajuan = 'menunggu' | 'diterima' | 'ditolak';

export interface PengajuanPelayanan {
  id: number;
  nomor: string;
  jenis_id: number;
  data_json: string;
  admin_data_json: string;
  pemohon_nama: string;
  pemohon_nik: string;
  pemohon_wa: string;
  status: StatusPengajuan;
  alasan_tolak: string | null;
  decided_at: string | null;
  created_at: string;
}

export interface PengajuanWithJenis extends PengajuanPelayanan {
  jenis_nama: string;
  jenis_slug: string;
  template_html: string;
  template_docx_path: string | null;
  admin_fields_json: string;
}

export function parseFields(json: string): FormField[] {
  try {
    const v = JSON.parse(json || '[]');
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function parseData(json: string): Record<string, string> {
  try {
    const v = JSON.parse(json || '{}');
    return v && typeof v === 'object' ? v as Record<string, string> : {};
  } catch {
    return {};
  }
}

export function normalizeWa(raw: string): string {
  let d = raw.replace(/\D/g, '');
  if (d.startsWith('0')) d = '62' + d.slice(1);
  if (d.startsWith('8')) d = '62' + d;
  return d;
}

export function formatTanggalId(iso?: string | null): string {
  const d = iso ? new Date(iso) : new Date();
  if (Number.isNaN(d.getTime())) return new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function fillTemplate(template: string, vars: Record<string, string>): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    const v = vars[key];
    return v != null && String(v).trim() !== '' ? String(v) : '—';
  });
}

export function buildSuratHtml(pengajuan: PengajuanWithJenis): string {
  const data = parseData(pengajuan.data_json);
  const vars: Record<string, string> = {
    ...data,
    nomor_surat: pengajuan.nomor,
    tanggal: formatTanggalId(pengajuan.decided_at ?? pengajuan.created_at),
    jenis_surat: pengajuan.jenis_nama,
    desa: 'Desa Citarik',
    nama: data.nama || pengajuan.pemohon_nama,
    nik: data.nik || pengajuan.pemohon_nik,
  };
  return fillTemplate(pengajuan.template_html, vars);
}

export function waLink(wa: string, text: string): string {
  const n = normalizeWa(wa);
  return `https://wa.me/${n}?text=${encodeURIComponent(text)}`;
}

export async function getJenisAktif(db: D1Database): Promise<JenisPelayanan[]> {
  const r = await db
    .prepare('SELECT * FROM jenis_pelayanan WHERE aktif=1 ORDER BY urutan ASC, nama ASC')
    .all<JenisPelayanan>();
  return r.results ?? [];
}

export async function getAllJenis(db: D1Database): Promise<JenisPelayanan[]> {
  const r = await db
    .prepare('SELECT * FROM jenis_pelayanan ORDER BY urutan ASC, nama ASC')
    .all<JenisPelayanan>();
  return r.results ?? [];
}

export async function getJenisBySlug(slug: string, db: D1Database): Promise<JenisPelayanan | null> {
  return db.prepare('SELECT * FROM jenis_pelayanan WHERE slug=?').bind(slug).first<JenisPelayanan>();
}

export async function getJenisById(id: number, db: D1Database): Promise<JenisPelayanan | null> {
  return db.prepare('SELECT * FROM jenis_pelayanan WHERE id=?').bind(id).first<JenisPelayanan>();
}

export async function createJenis(
  data: JenisPelayananInput,
  db: D1Database
): Promise<{ id: number; slug: string }> {
  const base = toSlug(data.nama) || 'jenis-surat';
  let slug = base;
  let i = 1;
  while (await db.prepare('SELECT id FROM jenis_pelayanan WHERE slug=?').bind(slug).first()) {
    slug = `${base}-${i++}`;
  }
  const r = await db
    .prepare(
      `INSERT INTO jenis_pelayanan
       (slug,nama,deskripsi,syarat,fields_json,admin_fields_json,template_html,template_docx_path,aktif,urutan,lampiran_wajib,lampiran_info)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?) RETURNING id`
    )
    .bind(
      slug,
      data.nama,
      data.deskripsi,
      data.syarat,
      data.fields_json,
      data.admin_fields_json ?? '[]',
      data.template_html,
      data.template_docx_path ?? null,
      data.aktif,
      data.urutan,
      data.lampiran_wajib,
      data.lampiran_info
    )
    .first<{ id: number }>();
  return { id: r!.id, slug };
}

export async function updateJenis(
  id: number,
  data: JenisPelayananInput,
  db: D1Database
): Promise<void> {
  await db
    .prepare(
      `UPDATE jenis_pelayanan SET nama=?, deskripsi=?, syarat=?, fields_json=?, admin_fields_json=?,
       template_html=?, template_docx_path=?, aktif=?, urutan=?, lampiran_wajib=?, lampiran_info=?,
       updated_at=datetime('now') WHERE id=?`
    )
    .bind(
      data.nama,
      data.deskripsi,
      data.syarat,
      data.fields_json,
      data.admin_fields_json ?? '[]',
      data.template_html,
      data.template_docx_path ?? null,
      data.aktif,
      data.urutan,
      data.lampiran_wajib,
      data.lampiran_info,
      id
    )
    .run();
}

export async function deleteJenis(id: number, db: D1Database): Promise<void> {
  const n = await db
    .prepare('SELECT COUNT(*) AS c FROM pengajuan_pelayanan WHERE jenis_id=?')
    .bind(id)
    .first<{ c: number }>();
  if ((n?.c ?? 0) > 0) {
    await db.prepare('UPDATE jenis_pelayanan SET aktif=0, updated_at=datetime("now") WHERE id=?').bind(id).run();
    return;
  }
  await db.prepare('DELETE FROM jenis_pelayanan WHERE id=?').bind(id).run();
}

async function nextNomor(db: D1Database): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `PLV-${year}-`;
  const row = await db
    .prepare(`SELECT nomor FROM pengajuan_pelayanan WHERE nomor LIKE ? ORDER BY id DESC LIMIT 1`)
    .bind(`${prefix}%`)
    .first<{ nomor: string }>();
  let seq = 1;
  if (row?.nomor) {
    const part = row.nomor.split('-').pop();
    const n = Number(part);
    if (Number.isFinite(n)) seq = n + 1;
  }
  return `${prefix}${String(seq).padStart(4, '0')}`;
}

export async function createPengajuan(
  data: {
    jenis_id: number;
    data_json: string;
    pemohon_nama: string;
    pemohon_nik: string;
    pemohon_wa: string;
  },
  db: D1Database
): Promise<{ id: number; nomor: string }> {
  const nomor = await nextNomor(db);
  const r = await db
    .prepare(
      `INSERT INTO pengajuan_pelayanan (nomor,jenis_id,data_json,pemohon_nama,pemohon_nik,pemohon_wa,status)
       VALUES (?,?,?,?,?,?, 'menunggu') RETURNING id`
    )
    .bind(nomor, data.jenis_id, data.data_json, data.pemohon_nama, data.pemohon_nik, data.pemohon_wa)
    .first<{ id: number }>();
  return { id: r!.id, nomor };
}

export async function getPengajuanById(id: number, db: D1Database): Promise<PengajuanWithJenis | null> {
  return db
    .prepare(
      `SELECT p.*, j.nama AS jenis_nama, j.slug AS jenis_slug, j.template_html, j.template_docx_path,
              j.admin_fields_json
       FROM pengajuan_pelayanan p
       JOIN jenis_pelayanan j ON j.id = p.jenis_id
       WHERE p.id=?`
    )
    .bind(id)
    .first<PengajuanWithJenis>();
}

export async function listPengajuan(
  db: D1Database,
  status?: StatusPengajuan | 'semua'
): Promise<PengajuanWithJenis[]> {
  if (status && status !== 'semua') {
    const r = await db
      .prepare(
        `SELECT p.*, j.nama AS jenis_nama, j.slug AS jenis_slug, j.template_html, j.template_docx_path,
                j.admin_fields_json
         FROM pengajuan_pelayanan p
         JOIN jenis_pelayanan j ON j.id = p.jenis_id
         WHERE p.status=?
         ORDER BY p.created_at DESC`
      )
      .bind(status)
      .all<PengajuanWithJenis>();
    return r.results ?? [];
  }
  const r = await db
    .prepare(
      `SELECT p.*, j.nama AS jenis_nama, j.slug AS jenis_slug, j.template_html, j.template_docx_path,
              j.admin_fields_json
       FROM pengajuan_pelayanan p
       JOIN jenis_pelayanan j ON j.id = p.jenis_id
       ORDER BY
         CASE p.status WHEN 'menunggu' THEN 0 WHEN 'diterima' THEN 1 ELSE 2 END,
         p.created_at DESC`
    )
    .all<PengajuanWithJenis>();
  return r.results ?? [];
}

export async function updatePengajuanAdminData(
  id: number,
  admin_data_json: string,
  db: D1Database
): Promise<void> {
  await db
    .prepare(`UPDATE pengajuan_pelayanan SET admin_data_json=? WHERE id=?`)
    .bind(admin_data_json, id)
    .run();
}

export async function updatePengajuanWargaData(
  id: number,
  data: {
    data_json: string;
    pemohon_nama: string;
    pemohon_nik: string;
    pemohon_wa?: string;
  },
  db: D1Database
): Promise<void> {
  if (data.pemohon_wa != null) {
    await db
      .prepare(
        `UPDATE pengajuan_pelayanan SET data_json=?, pemohon_nama=?, pemohon_nik=?, pemohon_wa=? WHERE id=?`
      )
      .bind(data.data_json, data.pemohon_nama, data.pemohon_nik, data.pemohon_wa, id)
      .run();
    return;
  }
  await db
    .prepare(`UPDATE pengajuan_pelayanan SET data_json=?, pemohon_nama=?, pemohon_nik=? WHERE id=?`)
    .bind(data.data_json, data.pemohon_nama, data.pemohon_nik, id)
    .run();
}

export async function countPengajuanByStatus(db: D1Database): Promise<Record<string, number>> {
  const r = await db
    .prepare(`SELECT status, COUNT(*) AS c FROM pengajuan_pelayanan GROUP BY status`)
    .all<{ status: string; c: number }>();
  const out: Record<string, number> = { menunggu: 0, diterima: 0, ditolak: 0 };
  for (const row of r.results ?? []) out[row.status] = row.c;
  return out;
}

export async function decidePengajuan(
  id: number,
  status: 'diterima' | 'ditolak',
  alasan_tolak: string | null,
  db: D1Database
): Promise<void> {
  await db
    .prepare(
      `UPDATE pengajuan_pelayanan SET status=?, alasan_tolak=?, decided_at=datetime('now') WHERE id=?`
    )
    .bind(status, alasan_tolak, id)
    .run();
}

export interface LampiranPengajuan {
  id: number;
  pengajuan_id: number;
  r2_key: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  created_at: string;
}

export async function addLampiran(
  data: {
    pengajuan_id: number;
    r2_key: string;
    filename: string;
    content_type: string;
    size_bytes: number;
  },
  db: D1Database
): Promise<number> {
  const r = await db
    .prepare(
      `INSERT INTO lampiran_pengajuan (pengajuan_id, r2_key, filename, content_type, size_bytes)
       VALUES (?,?,?,?,?) RETURNING id`
    )
    .bind(data.pengajuan_id, data.r2_key, data.filename, data.content_type, data.size_bytes)
    .first<{ id: number }>();
  return r!.id;
}

export async function listLampiran(pengajuanId: number, db: D1Database): Promise<LampiranPengajuan[]> {
  const r = await db
    .prepare('SELECT * FROM lampiran_pengajuan WHERE pengajuan_id=? ORDER BY id')
    .bind(pengajuanId)
    .all<LampiranPengajuan>();
  return r.results ?? [];
}

export async function getLampiranById(id: number, db: D1Database): Promise<LampiranPengajuan | null> {
  return db.prepare('SELECT * FROM lampiran_pengajuan WHERE id=?').bind(id).first<LampiranPengajuan>();
}

export async function getPengajuanForStatusCheck(
  nomor: string,
  wa: string,
  db: D1Database
): Promise<PengajuanWithJenis | null> {
  const n = nomor.trim().toUpperCase();
  const w = normalizeWa(wa);
  if (!n || w.length < 10) return null;
  const row = await db
    .prepare(
      `SELECT p.*, j.nama AS jenis_nama, j.slug AS jenis_slug, j.template_html
       FROM pengajuan_pelayanan p
       JOIN jenis_pelayanan j ON j.id = p.jenis_id
       WHERE UPPER(p.nomor)=?`
    )
    .bind(n)
    .first<PengajuanWithJenis>();
  if (!row) return null;
  if (normalizeWa(row.pemohon_wa) !== w) return null;
  return row;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
