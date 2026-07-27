import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { createTitikPeta } from '../../../../lib/db/titik-peta';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const lat = parseFloat(fd.get('lat') as string);
  const lng = parseFloat(fd.get('lng') as string);
  const jenis = fd.get('jenis') as 'umkm' | 'potensi';
  const linked_slug = (fd.get('linked_slug') as string)?.trim();
  const label = (fd.get('label') as string)?.trim() || null;

  if (!env || isNaN(lat) || isNaN(lng) || !jenis || !linked_slug || !['umkm', 'potensi'].includes(jenis)) {
    return redirect('/admin/peta?error=1');
  }

  await createTitikPeta({ lat, lng, jenis, linked_slug, label }, env.DB);
  await purgeCache(['/peta', '/']);
  return redirect('/admin/peta?saved=1');
};
