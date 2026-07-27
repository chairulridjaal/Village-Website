export type NavLocation = 'header' | 'footer';
export type NavStyle = 'link' | 'cta';

export interface NavItem {
  id: number;
  location: NavLocation;
  label: string;
  href: string;
  urutan: number;
  aktif: number;
  style: NavStyle;
  created_at: string;
  updated_at: string;
}

const FALLBACK_HEADER: Omit<NavItem, 'id' | 'created_at' | 'updated_at'>[] = [
  { location: 'header', label: 'Beranda', href: '/', urutan: 10, aktif: 1, style: 'link' },
  { location: 'header', label: 'Profil', href: '/profil', urutan: 20, aktif: 1, style: 'link' },
  { location: 'header', label: 'Pemerintahan', href: '/pemerintahan', urutan: 30, aktif: 1, style: 'link' },
  { location: 'header', label: 'Potensi', href: '/potensi', urutan: 40, aktif: 1, style: 'link' },
  { location: 'header', label: 'Pelayanan', href: '/pelayanan', urutan: 50, aktif: 1, style: 'link' },
  { location: 'header', label: 'UMKM', href: '/umkm', urutan: 60, aktif: 1, style: 'link' },
  { location: 'header', label: 'Peta', href: '/peta', urutan: 70, aktif: 1, style: 'link' },
  { location: 'header', label: 'Berita', href: '/berita', urutan: 80, aktif: 1, style: 'link' },
  { location: 'header', label: 'Kontak', href: '/kontak', urutan: 90, aktif: 1, style: 'cta' },
];

const FALLBACK_FOOTER: Omit<NavItem, 'id' | 'created_at' | 'updated_at'>[] = [
  { location: 'footer', label: 'Profil Desa', href: '/profil', urutan: 10, aktif: 1, style: 'link' },
  { location: 'footer', label: 'Potensi', href: '/potensi', urutan: 20, aktif: 1, style: 'link' },
  { location: 'footer', label: 'Pelayanan', href: '/pelayanan', urutan: 30, aktif: 1, style: 'link' },
  { location: 'footer', label: 'Direktori UMKM', href: '/umkm', urutan: 40, aktif: 1, style: 'link' },
  { location: 'footer', label: 'Peta Desa', href: '/peta', urutan: 50, aktif: 1, style: 'link' },
  { location: 'footer', label: 'Berita', href: '/berita', urutan: 60, aktif: 1, style: 'link' },
];

function isSafeHref(href: string): boolean {
  const h = href.trim();
  if (!h) return false;
  if (h.startsWith('/')) return !h.startsWith('//');
  if (h.startsWith('https://') || h.startsWith('http://')) return true;
  if (h.startsWith('mailto:') || h.startsWith('tel:')) return true;
  return false;
}

function fallback(location: NavLocation): NavItem[] {
  const fb = location === 'header' ? FALLBACK_HEADER : FALLBACK_FOOTER;
  return fb.map((item, i) => ({
    ...item,
    id: i + 1,
    created_at: '',
    updated_at: '',
  }));
}

export async function listNav(
  location: NavLocation,
  db: D1Database | null | undefined,
  aktifOnly = false
): Promise<NavItem[]> {
  if (!db) return fallback(location);
  try {
    const sql = aktifOnly
      ? 'SELECT * FROM nav_item WHERE location=? AND aktif=1 ORDER BY urutan, id'
      : 'SELECT * FROM nav_item WHERE location=? ORDER BY urutan, id';
    const r = await db.prepare(sql).bind(location).all<NavItem>();
    if (r.results.length > 0) return r.results;
  } catch {
    // table may not exist yet
  }
  return fallback(location);
}

export async function createNavItem(
  data: { location: NavLocation; label: string; href: string; urutan: number; style: NavStyle; aktif: number },
  db: D1Database
): Promise<number> {
  if (!isSafeHref(data.href)) throw new Error('URL tidak valid');
  if (data.location === 'header' && data.aktif !== 1) {
    // ok
  }
  const r = await db.prepare(
    `INSERT INTO nav_item (location, label, href, urutan, aktif, style) VALUES (?,?,?,?,?,?) RETURNING id`
  ).bind(data.location, data.label.trim(), data.href.trim(), data.urutan, data.aktif, data.style)
    .first<{ id: number }>();
  return r!.id;
}

export async function updateNavItem(
  id: number,
  data: { label: string; href: string; urutan: number; style: NavStyle; aktif: number },
  db: D1Database
): Promise<void> {
  if (!isSafeHref(data.href)) throw new Error('URL tidak valid');
  const row = await db.prepare('SELECT location FROM nav_item WHERE id=?').bind(id).first<{ location: string }>();
  if (!row) throw new Error('Item tidak ditemukan');
  if (row.location === 'header' && data.aktif === 0) {
    const active = await db.prepare(
      'SELECT COUNT(*) as c FROM nav_item WHERE location=? AND aktif=1 AND id!=?'
    ).bind('header', id).first<{ c: number }>();
    if ((active?.c ?? 0) < 1) throw new Error('Minimal satu menu header harus aktif');
  }
  await db.prepare(
    `UPDATE nav_item SET label=?, href=?, urutan=?, style=?, aktif=?, updated_at=datetime('now') WHERE id=?`
  ).bind(data.label.trim(), data.href.trim(), data.urutan, data.style, data.aktif, id).run();
}

export async function deleteNavItem(id: number, db: D1Database): Promise<void> {
  const row = await db.prepare('SELECT location, aktif FROM nav_item WHERE id=?').bind(id)
    .first<{ location: string; aktif: number }>();
  if (!row) return;
  if (row.location === 'header' && row.aktif === 1) {
    const active = await db.prepare(
      'SELECT COUNT(*) as c FROM nav_item WHERE location=? AND aktif=1 AND id!=?'
    ).bind('header', id).first<{ c: number }>();
    if ((active?.c ?? 0) < 1) throw new Error('Minimal satu menu header harus aktif');
  }
  await db.prepare('DELETE FROM nav_item WHERE id=?').bind(id).run();
}

export { isSafeHref };
