import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { hasPerm } from '../../../../lib/auth/permissions';
import { getPotensiById, updatePotensi } from '../../../../lib/db/potensi';
import { sanitizeHtml } from '../../../../lib/html/sanitize';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  if (!hasPerm(locals.user, 'perm_konten')) return redirect('/admin/dasbor?error=forbidden');
  const env = getEnv();
  if (!env) return redirect('/admin/potensi');

  const id = Number(params.id);
  const existing = await getPotensiById(id, env.DB);
  if (!existing) return redirect('/admin/potensi');

  const fd = await request.formData();
  const nama = ((fd.get('nama') as string) ?? '').trim();
  if (!nama) return redirect(`/admin/potensi/${id}?error=1`);

  await updatePotensi(id, {
    nama,
    ringkasan: ((fd.get('ringkasan') as string) ?? '').trim(),
    deskripsi_html: sanitizeHtml((fd.get('deskripsi_html') as string) ?? ''),
    stats_json: ((fd.get('stats_json') as string) ?? '[]').trim() || '[]',
    status: (fd.get('status') as string) === 'published' ? 'published' : 'draft',
    urutan: Number(fd.get('urutan')) || 0,
  }, env.DB);

  await purgeCache(['/potensi', `/potensi/${existing.slug}`]);
  return redirect(`/admin/potensi/${id}?saved=1`);
};
