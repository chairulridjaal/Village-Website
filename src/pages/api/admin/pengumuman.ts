import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { upsertPengumumanBanner, type PengumumanStyle } from '../../../lib/db/pengumuman';
import { purgeCache } from '../../../lib/cache/purge';

const STYLES = new Set<PengumumanStyle>(['info', 'success', 'warning', 'urgent']);

function parseEndsAt(fd: FormData): string | null {
  const mode = String(fd.get('expire_mode') || 'manual').trim();
  if (mode === 'manual') return null;

  if (mode === '7' || mode === '30') {
    const days = Number(mode);
    const d = new Date();
    d.setDate(d.getDate() + days);
    d.setHours(23, 59, 59, 999);
    return d.toISOString();
  }

  if (mode === 'date') {
    const raw = String(fd.get('ends_at_date') || '').trim();
    if (!raw) return null;
    // HTML date is YYYY-MM-DD — end of that day local-ish as UTC noon+offset; use end of day UTC
    const d = new Date(`${raw}T23:59:59.999Z`);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  }

  return null;
}

export const POST: APIRoute = async ({ request, redirect }) => {
  const env = getEnv();
  if (!env) return redirect('/admin/pengumuman?error=1');

  const fd = await request.formData();
  const action = String(fd.get('_action') || 'save');

  if (action === 'off') {
    await upsertPengumumanBanner(
      {
        aktif: false,
        teks: String(fd.get('teks') || '').trim(),
        tautan_url: null,
        tautan_label: null,
        style: 'info',
        ends_at: null,
      },
      env.DB
    );
    await purgeCache(['/']);
    return redirect('/admin/pengumuman?off=1');
  }

  const teks = String(fd.get('teks') || '').trim();
  if (!teks) return redirect('/admin/pengumuman?error=teks');

  const styleRaw = String(fd.get('style') || 'info') as PengumumanStyle;
  const style = STYLES.has(styleRaw) ? styleRaw : 'info';

  let tautan_url = String(fd.get('tautan_url') || '').trim() || null;
  let tautan_label = String(fd.get('tautan_label') || '').trim() || null;
  if (tautan_url && !/^https?:\/\//i.test(tautan_url) && !tautan_url.startsWith('/')) {
    tautan_url = `https://${tautan_url}`;
  }
  if (tautan_url && !tautan_label) tautan_label = 'Selengkapnya';

  const aktif = fd.get('aktif') === '1' || fd.get('aktif') === 'on';
  const ends_at = parseEndsAt(fd);

  await upsertPengumumanBanner(
    { aktif, teks, tautan_url, tautan_label, style, ends_at },
    env.DB
  );
  await purgeCache(['/']);
  return redirect('/admin/pengumuman?saved=1');
};
