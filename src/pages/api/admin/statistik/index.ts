import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { hasPerm } from '../../../../lib/auth/permissions';
import {
  createBaris,
  createKategori,
  deleteBaris,
  deleteKategori,
  updateBaris,
  updateKategori,
  type StatLayout,
} from '../../../../lib/db/statistik';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  if (!hasPerm(locals.user, 'perm_konten')) return redirect('/admin/dasbor?error=forbidden');
  const env = getEnv();
  if (!env) return redirect('/admin/statistik-desa');

  const fd = await request.formData();
  const action = (fd.get('_action') as string) ?? '';

  try {
    if (action === 'create_kategori') {
      const label = ((fd.get('label') as string) ?? '').trim();
      const layout = ((fd.get('layout') as string) ?? 'simple') as StatLayout;
      if (!label) throw new Error('Label wajib');
      await createKategori({ label, layout: layout === 'dusun' ? 'dusun' : 'simple' }, env.DB);
    } else if (action === 'update_kategori') {
      const id = Number(fd.get('id'));
      await updateKategori(id, {
        label: ((fd.get('label') as string) ?? '').trim(),
        layout: ((fd.get('layout') as string) === 'dusun' ? 'dusun' : 'simple'),
        urutan: Number(fd.get('urutan')) || 0,
        aktif: fd.get('aktif') === '1' ? 1 : 0,
      }, env.DB);
    } else if (action === 'delete_kategori') {
      await deleteKategori(Number(fd.get('id')), env.DB);
    } else if (action === 'create_baris') {
      const kategoriId = Number(fd.get('kategori_id'));
      const layout = (fd.get('layout') as string) ?? 'simple';
      const label = ((fd.get('label') as string) ?? '').trim();
      if (!label) throw new Error('Label baris wajib');
      let valueJson = '{}';
      if (layout === 'dusun') {
        valueJson = JSON.stringify({
          l: Number(fd.get('l')) || 0,
          p: Number(fd.get('p')) || 0,
          kk: Number(fd.get('kk')) || 0,
          rw: ((fd.get('rw') as string) ?? '').trim(),
          jmlRw: Number(fd.get('jmlRw')) || 0,
        });
      } else {
        valueJson = JSON.stringify({ value: Number(fd.get('value')) || 0 });
      }
      await createBaris(kategoriId, label, valueJson, Number(fd.get('urutan')) || 0, env.DB);
    } else if (action === 'update_baris') {
      const layout = (fd.get('layout') as string) ?? 'simple';
      const label = ((fd.get('label') as string) ?? '').trim();
      let valueJson = '{}';
      if (layout === 'dusun') {
        valueJson = JSON.stringify({
          l: Number(fd.get('l')) || 0,
          p: Number(fd.get('p')) || 0,
          kk: Number(fd.get('kk')) || 0,
          rw: ((fd.get('rw') as string) ?? '').trim(),
          jmlRw: Number(fd.get('jmlRw')) || 0,
        });
      } else {
        valueJson = JSON.stringify({ value: Number(fd.get('value')) || 0 });
      }
      await updateBaris(Number(fd.get('id')), label, valueJson, Number(fd.get('urutan')) || 0, env.DB);
    } else if (action === 'delete_baris') {
      await deleteBaris(Number(fd.get('id')), env.DB);
    } else if (action === 'stat_umum') {
      const { setPengaturan, getPengaturan } = await import('../../../../lib/db/pengaturan');
      const s = await getPengaturan(env.DB);
      const prev = JSON.parse(s.stat_umum ?? '{}') as Record<string, unknown>;
      const stat_umum = JSON.stringify({
        ...prev,
        luas: ((fd.get('luas') as string) ?? '').trim(),
        rw: Number(fd.get('rw')) || 0,
        rt: Number(fd.get('rt')) || 0,
      });
      await setPengaturan({ stat_umum }, env.DB);
    }

    await purgeCache(['/', '/profil', '/pemerintahan']);
    return redirect('/admin/statistik-desa?saved=1');
  } catch (e) {
    const msg = encodeURIComponent(e instanceof Error ? e.message : 'Gagal');
    return redirect(`/admin/statistik-desa?error=${msg}`);
  }
};
