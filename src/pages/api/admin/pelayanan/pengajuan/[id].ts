import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { decidePengajuan, getPengajuanById } from '../../../../../lib/db/pelayanan';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const env = getEnv();
  const id = Number(params.id);
  if (!env || !Number.isFinite(id)) return redirect('/admin/pelayanan');

  const existing = await getPengajuanById(id, env.DB);
  if (!existing) return redirect('/admin/pelayanan');
  if (existing.status !== 'menunggu') return redirect(`/admin/pelayanan/${id}`);

  const fd = await request.formData();
  const action = String(fd.get('action') ?? '');

  if (action === 'terima') {
    await decidePengajuan(id, 'diterima', null, env.DB);
    return redirect(`/admin/pelayanan/${id}?saved=1`);
  }

  if (action === 'tolak') {
    const alasan = String(fd.get('alasan_tolak') ?? '').trim();
    if (!alasan) return redirect(`/admin/pelayanan/${id}?error=alasan`);
    await decidePengajuan(id, 'ditolak', alasan, env.DB);
    return redirect(`/admin/pelayanan/${id}?saved=1`);
  }

  return redirect(`/admin/pelayanan/${id}`);
};
