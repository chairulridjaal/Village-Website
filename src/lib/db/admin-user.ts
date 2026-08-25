import {
  ADMIN_USER_SELECT,
  PERM_FLAGS,
  type AdminUserRow,
  type PermFlag,
} from '../auth/permissions';
import { hashPassword } from '../auth/session';

export type AdminListItem = Omit<AdminUserRow, 'password_hash'>;

export async function listAdmins(db: D1Database): Promise<AdminListItem[]> {
  const r = await db.prepare(
    `SELECT id, username, is_master, aktif,
      perm_konten, perm_pelayanan, perm_umkm, perm_berita,
      perm_peta, perm_media, perm_pengaturan, created_at
     FROM admin_user ORDER BY is_master DESC, username`
  ).all<AdminListItem>();
  return r.results;
}

export async function getAdminById(id: number, db: D1Database): Promise<AdminUserRow | null> {
  return db.prepare(`SELECT ${ADMIN_USER_SELECT} FROM admin_user WHERE id=?`).bind(id).first<AdminUserRow>();
}

export async function countMasters(db: D1Database, excludeId?: number): Promise<number> {
  if (excludeId != null) {
    const r = await db.prepare(
      'SELECT COUNT(*) as c FROM admin_user WHERE is_master=1 AND aktif=1 AND id!=?'
    ).bind(excludeId).first<{ c: number }>();
    return r?.c ?? 0;
  }
  const r = await db.prepare(
    'SELECT COUNT(*) as c FROM admin_user WHERE is_master=1 AND aktif=1'
  ).first<{ c: number }>();
  return r?.c ?? 0;
}

export async function createAdmin(
  data: {
    username: string;
    password: string;
    is_master: boolean;
    perms: Partial<Record<PermFlag, boolean>>;
  },
  db: D1Database
): Promise<number> {
  const username = data.username.trim();
  if (!username || data.password.length < 8) throw new Error('Data tidak valid');
  const exists = await db.prepare('SELECT id FROM admin_user WHERE username=?').bind(username).first();
  if (exists) throw new Error('Nama pengguna sudah dipakai');

  const hash = await hashPassword(data.password);
  const flags = Object.fromEntries(
    PERM_FLAGS.map((f) => [f, data.is_master || data.perms[f] ? 1 : 0])
  ) as Record<PermFlag, number>;
  if (data.is_master) {
    for (const f of PERM_FLAGS) flags[f] = 1;
  }

  const r = await db.prepare(`
    INSERT INTO admin_user (
      username, password_hash, is_master, aktif,
      perm_konten, perm_pelayanan, perm_umkm, perm_berita,
      perm_peta, perm_media, perm_pengaturan
    ) VALUES (?,?,?,1,?,?,?,?,?,?,?) RETURNING id
  `).bind(
    username, hash, data.is_master ? 1 : 0,
    flags.perm_konten, flags.perm_pelayanan, flags.perm_umkm, flags.perm_berita,
    flags.perm_peta, flags.perm_media, flags.perm_pengaturan
  ).first<{ id: number }>();
  return r!.id;
}

export async function updateAdminFlags(
  id: number,
  data: {
    is_master: boolean;
    aktif: boolean;
    perms: Partial<Record<PermFlag, boolean>>;
  },
  db: D1Database
): Promise<void> {
  const row = await getAdminById(id, db);
  if (!row) throw new Error('Akun tidak ditemukan');

  if (row.is_master && (!data.is_master || !data.aktif)) {
    const others = await countMasters(db, id);
    if (others < 1) throw new Error('Tidak bisa menonaktifkan master terakhir');
  }

  const flags = Object.fromEntries(
    PERM_FLAGS.map((f) => [f, data.is_master || data.perms[f] ? 1 : 0])
  ) as Record<PermFlag, number>;
  if (data.is_master) {
    for (const f of PERM_FLAGS) flags[f] = 1;
  }

  await db.prepare(`
    UPDATE admin_user SET
      is_master=?, aktif=?,
      perm_konten=?, perm_pelayanan=?, perm_umkm=?, perm_berita=?,
      perm_peta=?, perm_media=?, perm_pengaturan=?
    WHERE id=?
  `).bind(
    data.is_master ? 1 : 0, data.aktif ? 1 : 0,
    flags.perm_konten, flags.perm_pelayanan, flags.perm_umkm, flags.perm_berita,
    flags.perm_peta, flags.perm_media, flags.perm_pengaturan, id
  ).run();
}

export async function resetAdminPassword(id: number, password: string, db: D1Database): Promise<void> {
  if (password.length < 8) throw new Error('Kata sandi minimal 8 karakter');
  const hash = await hashPassword(password);
  await db.prepare('UPDATE admin_user SET password_hash=? WHERE id=?').bind(hash, id).run();
}

export async function countActiveAdmins(db: D1Database): Promise<number> {
  const r = await db.prepare('SELECT COUNT(*) as c FROM admin_user WHERE aktif=1').first<{ c: number }>();
  return r?.c ?? 0;
}

export async function deleteAdmin(id: number, actorId: number, db: D1Database): Promise<void> {
  if (id === actorId) throw new Error('Tidak bisa menghapus akun sendiri');
  const row = await getAdminById(id, db);
  if (!row) throw new Error('Akun tidak ditemukan');
  if (row.is_master && row.aktif) {
    const others = await countMasters(db, id);
    if (others < 1) throw new Error('Tidak bisa menghapus master terakhir');
  }
  if (row.aktif) {
    const active = await countActiveAdmins(db);
    if (active <= 1) throw new Error('Tidak bisa menghapus admin terakhir');
  }
  await db.prepare('DELETE FROM admin_user WHERE id=?').bind(id).run();
}
