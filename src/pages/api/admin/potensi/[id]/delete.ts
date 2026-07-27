import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { hasPerm } from '../../../../../lib/auth/permissions';
import { deletePotensi, getPotensiById } from '../../../../../lib/db/potensi';
import { purgeCache } from '../../../../../lib/cache/purge';

export const POST: APIRoute = async ({ params, locals, redirect }) => {
  if (!hasPerm(locals.user, 'perm_konten')) return redirect('/admin/dasbor?error=forbidden');
  const env = getEnv();
  if (!env) return redirect('/admin/potensi');

  const id = Number(params.id);
  const existing = await getPotensiById(id, env.DB);
  if (existing) {
    await deletePotensi(id, env.DB);
    await purgeCache(['/potensi', `/potensi/${existing.slug}`]);
  }
  return redirect('/admin/potensi?saved=1');
};
