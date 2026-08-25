import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { isMaster, type PermFlag, PERM_FLAGS } from '../../../../lib/auth/permissions';
import { deleteAdmin, resetAdminPassword, updateAdminFlags } from '../../../../lib/db/admin-user';

export const POST: APIRoute = async ({ params, request, locals, redirect }) => {
  if (!isMaster(locals.user)) return redirect('/admin/dasbor?error=forbidden');
  const env = getEnv();
  if (!env) return redirect('/admin/akun');

  const id = Number(params.id);
  if (!id) return redirect('/admin/akun');

  const fd = await request.formData();
  const action = (fd.get('_action') as string) ?? 'flags';

  try {
    if (action === 'delete') {
      const actorId = Number((locals.user as unknown as { id: number; userId: number })?.id ?? (locals.user as unknown as { userId: number })?.userId ?? 0);
      await deleteAdmin(id, actorId || id + 999999, env.DB);
      try {
        const prefix = `sess:`;
        const list = await (env as unknown as { SESSION_KV?: { list: (opts: { prefix: string }) => Promise<{ keys: { name: string }[] }> } }).SESSION_KV?.list({ prefix });
        if (list?.keys) {
          for (const k of list.keys) {
            try {
              const v = await (env as unknown as { SESSION_KV: { get: (k: string) => Promise<string | null> } }).SESSION_KV.get(k.name);
              if (v && v.includes(`"userId":${id}`)) {
                await (env as unknown as { SESSION_KV: { delete: (k: string) => Promise<void> } }).SESSION_KV.delete(k.name);
              }
            } catch {}
          }
        }
      } catch {}
      return redirect('/admin/akun?saved=1');
    }
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
