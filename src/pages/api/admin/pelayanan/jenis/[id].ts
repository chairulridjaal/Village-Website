import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { getJenisById, updateJenis } from '../../../../../lib/db/pelayanan';
import { jenisInputFromFormData } from '../../../../../lib/pelayanan/jenis-from-form';
import { purgeCache } from '../../../../../lib/cache/purge';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const env = getEnv();
  const id = Number(params.id);
  if (!env || !Number.isFinite(id)) return redirect('/admin/pelayanan/jenis');

  const existing = await getJenisById(id, env.DB);
  if (!existing) return redirect('/admin/pelayanan/jenis');

  const fd = await request.formData();
  const data = jenisInputFromFormData(fd);
  if (!data.nama) return redirect(`/admin/pelayanan/jenis/${id}?error=1`);

  await updateJenis(id, data, env.DB);
  await purgeCache(['/pelayanan', `/pelayanan/${existing.slug}`]);
  return redirect(`/admin/pelayanan/jenis/${id}?saved=1`);
};
