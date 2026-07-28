import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { hasPerm } from '../../../../lib/auth/permissions';
import { createPotensi } from '../../../../lib/db/potensi';
import { sanitizeHtml } from '../../../../lib/html/sanitize';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (!hasPerm(locals.user, 'perm_konten')) return redirect('/admin/dasbor?error=forbidden');
  const env = getEnv();
  if (!env) return redirect('/admin/potensi');

  const fd = await request.formData();
  const nama = ((fd.get('nama') as string) ?? '').trim();
  if (!nama) return redirect('/admin/potensi/new?error=1');

  let stats_json = ((fd.get('stats_json') as string) ?? '[]').trim() || '[]';
  const statValues = fd.getAll('stat_value').map(String);
  if (statValues.length) {
    const labels = fd.getAll('stat_label').map(String);
    const icons = fd.getAll('stat_icon').map(String);
    const arr = statValues.map((value, i) => ({
      value: value.trim(),
      label: (labels[i] ?? '').trim(),
      icon: (icons[i] ?? 'info').trim() || 'info',
    })).filter((s) => s.value || s.label);
    stats_json = JSON.stringify(arr);
  }

  const { id } = await createPotensi({
    nama,
    ringkasan: ((fd.get('ringkasan') as string) ?? '').trim(),
    deskripsi_html: sanitizeHtml((fd.get('deskripsi_html') as string) ?? ''),
    stats_json,
    status: (fd.get('status') as string) === 'published' ? 'published' : 'draft',
    urutan: Number(fd.get('urutan')) || 100,
  }, env.DB);

  await purgeCache(['/potensi']);
  return redirect(`/admin/potensi/${id}?saved=1`);
};
