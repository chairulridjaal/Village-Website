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
