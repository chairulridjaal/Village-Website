import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { hasPerm } from '../../../../lib/auth/permissions';
import { createNavItem, deleteNavItem, updateNavItem, type NavLocation, type NavStyle } from '../../../../lib/db/nav';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (!hasPerm(locals.user, 'perm_konten')) return redirect('/admin/dasbor?error=forbidden');
  const env = getEnv();
  if (!env) return redirect('/admin/menu');

  const fd = await request.formData();
  const action = (fd.get('_action') as string) ?? '';

  try {
    if (action === 'create') {
      await createNavItem({
        location: ((fd.get('location') as string) === 'footer' ? 'footer' : 'header') as NavLocation,
        label: ((fd.get('label') as string) ?? '').trim(),
        href: ((fd.get('href') as string) ?? '').trim(),
        urutan: Number(fd.get('urutan')) || 100,
        style: ((fd.get('style') as string) === 'cta' ? 'cta' : 'link') as NavStyle,
        aktif: 1,
      }, env.DB);
    } else if (action === 'update') {
      await updateNavItem(Number(fd.get('id')), {
        label: ((fd.get('label') as string) ?? '').trim(),
        href: ((fd.get('href') as string) ?? '').trim(),
        urutan: Number(fd.get('urutan')) || 0,
        style: ((fd.get('style') as string) === 'cta' ? 'cta' : 'link') as NavStyle,
        aktif: fd.get('aktif') === '1' ? 1 : 0,
      }, env.DB);
    } else if (action === 'delete') {
      await deleteNavItem(Number(fd.get('id')), env.DB);
    }
    await purgeCache(['/', '/profil', '/potensi', '/umkm', '/berita', '/pelayanan', '/peta', '/kontak', '/pemerintahan']);
    return redirect('/admin/menu?saved=1');
  } catch (e) {
    const msg = encodeURIComponent(e instanceof Error ? e.message : 'Gagal');
    return redirect(`/admin/menu?error=${msg}`);
  }
};
