import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { upsertPerangkat } from '../../../../lib/db/perangkat-desa';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const idRaw = fd.get('id') as string | null;
  const nama = (fd.get('nama') as string)?.trim();
  const jabatan = (fd.get('jabatan') as string)?.trim();
  const urutan = Number(fd.get('urutan')) || 0;

  if (!env || !nama || !jabatan) return redirect('/admin/perangkat?error=1');

  const id = idRaw ? Number(idRaw) : undefined;
  const resultId = await upsertPerangkat({ id, nama, jabatan, urutan }, env.DB);
  await purgeCache(['/pemerintahan']);
  if (!id && resultId) return redirect(`/admin/perangkat?edit=${resultId}&saved=1`);
  if (id) return redirect(`/admin/perangkat?edit=${id}&saved=1`);
  return redirect('/admin/perangkat?saved=1');
};
