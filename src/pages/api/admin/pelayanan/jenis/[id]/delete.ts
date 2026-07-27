import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { deleteJenis, getJenisById } from '../../../../../../lib/db/pelayanan';
import { purgeCache } from '../../../../../../lib/cache/purge';

export const POST: APIRoute = async ({ params, redirect }) => {
  const env = getEnv();
  const id = Number(params.id);
  if (!env || !Number.isFinite(id)) return redirect('/admin/pelayanan/jenis');

  const existing = await getJenisById(id, env.DB);
  await deleteJenis(id, env.DB);
  if (existing) await purgeCache(['/pelayanan', `/pelayanan/${existing.slug}`]);
  return redirect('/admin/pelayanan/jenis?saved=1');
};
