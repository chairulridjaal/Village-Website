import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { createJenis } from '../../../../../lib/db/pelayanan';
import { jenisInputFromFormData } from '../../../../../lib/pelayanan/jenis-from-form';
import { purgeCache } from '../../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, redirect }) => {
  const env = getEnv();
  if (!env) return redirect('/admin/pelayanan/jenis/new?error=1');

  const fd = await request.formData();
  const data = jenisInputFromFormData(fd);
  if (!data.nama) return redirect('/admin/pelayanan/jenis/new?error=1');

  const { id } = await createJenis(data, env.DB);
  await purgeCache(['/pelayanan']);
  return redirect(`/admin/pelayanan/jenis/${id}?saved=1`);
};
