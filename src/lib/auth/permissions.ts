export const PERM_FLAGS = [
  'perm_konten',
  'perm_pelayanan',
  'perm_umkm',
  'perm_berita',
  'perm_peta',
  'perm_media',
  'perm_pengaturan',
] as const;

export type PermFlag = (typeof PERM_FLAGS)[number];

export interface AdminUserRow {
  id: number;
  username: string;
  password_hash: string;
  is_master: number;
  aktif: number;
  perm_konten: number;
  perm_pelayanan: number;
  perm_umkm: number;
  perm_berita: number;
  perm_peta: number;
  perm_media: number;
  perm_pengaturan: number;
  created_at: string;
}

export interface SessionUser {
  userId: number;
  username: string;
  is_master: boolean;
  perms: PermFlag[];
}

export function permsFromRow(row: Pick<AdminUserRow, PermFlag | 'is_master'>): PermFlag[] {
  if (row.is_master) return [...PERM_FLAGS];
  return PERM_FLAGS.filter((f) => Number(row[f]) === 1);
}

export function sessionFromRow(row: AdminUserRow): SessionUser {
  return {
    userId: row.id,
    username: row.username,
    is_master: Number(row.is_master) === 1,
    perms: permsFromRow(row),
  };
}

export function hasPerm(user: SessionUser | undefined | null, flag: PermFlag): boolean {
  if (!user) return false;
  if (user.is_master) return true;
  return user.perms.includes(flag);
}

export function isMaster(user: SessionUser | undefined | null): boolean {
  return Boolean(user?.is_master);
}

export const MEDIA_OWNER_PERMS: Record<string, PermFlag> = {
  berita: 'perm_berita',
  umkm: 'perm_umkm',
  potensi: 'perm_konten',
  perangkat: 'perm_konten',
};

export const MEDIA_OWNER_TYPES = Object.keys(MEDIA_OWNER_PERMS);

export function permForAdminPath(pathname: string): PermFlag | 'master' | null {
  if (pathname.startsWith('/admin/akun') || pathname.startsWith('/api/admin/akun')) return 'master';
  if (pathname.startsWith('/admin/pengaturan') || pathname.startsWith('/api/admin/pengaturan')) return 'perm_pengaturan';
  if (pathname.startsWith('/admin/pelayanan') || pathname.startsWith('/api/admin/pelayanan')) return 'perm_pelayanan';
  if (pathname.startsWith('/admin/umkm') || pathname.startsWith('/api/admin/umkm')) return 'perm_umkm';
  if (pathname.startsWith('/admin/berita') || pathname.startsWith('/api/admin/berita')) return 'perm_berita';
  if (pathname.startsWith('/admin/peta') || pathname.startsWith('/api/admin/peta')) return 'perm_peta';
  if (pathname === '/admin/media' || pathname.startsWith('/admin/media/')) return 'perm_media';
  if (pathname.startsWith('/api/admin/media')) return null;
  if (
    pathname.startsWith('/admin/konten') ||
    pathname.startsWith('/api/admin/konten') ||
    pathname.startsWith('/admin/statistik-desa') ||
    pathname.startsWith('/api/admin/statistik') ||
    pathname.startsWith('/admin/perangkat') ||
    pathname.startsWith('/api/admin/perangkat') ||
    pathname.startsWith('/admin/menu') ||
    pathname.startsWith('/api/admin/menu') ||
    pathname.startsWith('/admin/potensi') ||
    pathname.startsWith('/api/admin/potensi')
  ) {
    return 'perm_konten';
  }
  return null;
}

export function canManageMediaOwner(
  user: SessionUser | undefined | null,
  ownerType: string | null | undefined
): boolean {
  if (!user) return false;
  if (user.is_master) return true;
  if (!ownerType) return hasPerm(user, 'perm_media');
  const need = MEDIA_OWNER_PERMS[ownerType];
  if (!need) return false;
  return hasPerm(user, need) || hasPerm(user, 'perm_media');
}

export const ADMIN_USER_SELECT = `
  id, username, password_hash, is_master, aktif,
  perm_konten, perm_pelayanan, perm_umkm, perm_berita,
  perm_peta, perm_media, perm_pengaturan, created_at
`;
