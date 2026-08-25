import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { setPengaturan } from '../../../lib/db/pengaturan';
import { purgeCache } from '../../../lib/cache/purge';

const KONTAK_KEYS = [
  'kontak_alamat', 'kontak_telepon', 'kontak_email', 'kontak_jam',
  'sosial_whatsapp', 'sosial_facebook', 'sosial_instagram',
  'wa_pelayanan', 'map_lat', 'map_lng', 'map_zoom',
  'kecamatan', 'kabupaten', 'footer_tagline',
];

function zipRows(fd: FormData, prefix: string, numericFields: string[]): Record<string, unknown>[] {
  const labels = fd.getAll(`${prefix}_label`) as string[];
  return labels.map((label, i) => {
    const row: Record<string, unknown> = { label };
    for (const field of numericFields) {
      const raw = (fd.getAll(`${prefix}_${field}`) as string[])[i];
      row[field] = field === 'rw' ? raw : Number(raw) || 0;
    }
    return row;
  });
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const env = getEnv();
  if (!env) return redirect('/admin/pengaturan');

  const fd = await request.formData();
  const form = fd.get('_form') as string;

  if (form === 'kontak') {
    const mapLat = Number(fd.get('map_lat'));
    const mapLng = Number(fd.get('map_lng'));
    const mapZoom = Number(fd.get('map_zoom'));
    if (fd.get('map_lat') && (Number.isNaN(mapLat) || mapLat < -90 || mapLat > 90)) return redirect('/admin/pengaturan?error=Latitude%20harus%20-90%20s%2Fd%2090');
    if (fd.get('map_lng') && (Number.isNaN(mapLng) || mapLng < -180 || mapLng > 180)) return redirect('/admin/pengaturan?error=Longitude%20harus%20-180%20s%2Fd%20180');
    if (fd.get('map_zoom') && (Number.isNaN(mapZoom) || mapZoom < 1 || mapZoom > 19)) return redirect('/admin/pengaturan?error=Zoom%20harus%201-19');
    const entries: Record<string, string> = {};
    for (const key of KONTAK_KEYS) entries[key] = ((fd.get(key) as string) ?? '').trim();
    await setPengaturan(entries, env.DB);
    await purgeCache(['/', '/profil', '/pemerintahan', '/kontak', '/umkm', '/berita', '/peta', '/potensi']);
  } else if (form === 'statistik') {
    const stat_umum = JSON.stringify({
      luas: ((fd.get('luas') as string) ?? '').trim(),
      rw: Number(fd.get('rw')) || 0,
      rt: Number(fd.get('rt')) || 0,
    });
    const stat_dusun = JSON.stringify(zipRows(fd, 'dusun', ['rw', 'jmlRw', 'l', 'p', 'kk']));
    const stat_umur = JSON.stringify(zipRows(fd, 'umur', ['value']));
    const stat_pendidikan = JSON.stringify(zipRows(fd, 'pendidikan', ['value']));
    const stat_pencaharian = JSON.stringify(zipRows(fd, 'pencaharian', ['value']));
    await setPengaturan({ stat_umum, stat_dusun, stat_umur, stat_pendidikan, stat_pencaharian }, env.DB);
    await purgeCache(['/', '/profil', '/pemerintahan']);
  }

  return redirect('/admin/pengaturan?saved=1');
};
