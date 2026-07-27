import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { isMaster, type PermFlag, PERM_FLAGS } from '../../../../lib/auth/permissions';
import { resetAdminPassword, updateAdminFlags } from '../../../../lib/db/admin-user';

export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  if (!isMaster(locals.user)) return redirect('/admin/dasbor?error=forbidden');
  const env = getEnv();
  if (!env) return redirect('/admin/akun');

  const id = Number(params.id);
  if (!id) return redirect('/admin/akun');

  const fd = await request.formData();
  const action = (fd.get('_action') as string) ?? 'flags';

  try {
    if (action === 'password') {
      const password = (fd.get('password') as string) ?? '';
      await resetAdminPassword(id, password, env.DB);
      return redirect('/admin/akun?saved=1');
    }

    const is_master = fd.get('is_master') === '1';
    const aktif = fd.get('aktif') === '1';
    const perms = Object.fromEntries(
      PERM_FLAGS.map((f) => [f, fd.get(f) === '1'])
    ) as Partial<Record<PermFlag, boolean>>;
    await updateAdminFlags(id, { is_master, aktif, perms }, env.DB);
    return redirect('/admin/akun?saved=1');
  } catch (e) {
    const msg = encodeURIComponent(e instanceof Error ? e.message : 'Gagal menyimpan');
    return redirect(`/admin/akun?error=${msg}`);
  }
};
