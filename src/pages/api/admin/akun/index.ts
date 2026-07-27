import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { isMaster, type PermFlag, PERM_FLAGS } from '../../../../lib/auth/permissions';
import { createAdmin } from '../../../../lib/db/admin-user';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (!isMaster(locals.user)) return redirect('/admin/dasbor?error=forbidden');
  const env = getEnv();
  if (!env) return redirect('/admin/akun');

  const fd = await request.formData();
  const username = ((fd.get('username') as string) ?? '').trim();
  const password = (fd.get('password') as string) ?? '';
  const is_master = fd.get('is_master') === '1';
  const perms = Object.fromEntries(
    PERM_FLAGS.map((f) => [f, fd.get(f) === '1'])
  ) as Partial<Record<PermFlag, boolean>>;

  try {
    await createAdmin({ username, password, is_master, perms }, env.DB);
    return redirect('/admin/akun?saved=1');
  } catch (e) {
    const msg = encodeURIComponent(e instanceof Error ? e.message : 'Gagal membuat akun');
    return redirect(`/admin/akun?error=${msg}`);
  }
};
