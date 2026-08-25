import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import {
  decidePengajuan,
  getPengajuanById,
  normalizeWa,
  parseFields,
  updatePengajuanAdminData,
  updatePengajuanWargaData,
} from '../../../../../lib/db/pelayanan';

export const POST: APIRoute = async ({ params, request, redirect }) => {
  const env = getEnv();
  const id = Number(params.id);
  if (!env || !Number.isFinite(id)) return redirect('/admin/pelayanan');

  const existing = await getPengajuanById(id, env.DB);
  if (!existing) return redirect('/admin/pelayanan');

  const fd = await request.formData();
  const action = String(fd.get('action') ?? '');

  if (action === 'edit_warga') {
    if (existing.status === 'ditolak') return redirect(`/admin/pelayanan/${id}`);

    const jenisRow = await env.DB.prepare('SELECT fields_json FROM jenis_pelayanan WHERE id=?')
      .bind(existing.jenis_id)
      .first<{ fields_json: string }>();
    const formFields = parseFields(jenisRow?.fields_json || '[]');

    const data: Record<string, string> = {};
    for (const f of formFields) {
      data[f.key] = String(fd.get(`field_${f.key}`) ?? '').trim();
    }
    const nama = (data.nama || String(fd.get('pemohon_nama') ?? '')).trim() || existing.pemohon_nama;
    const nik = (data.nik || String(fd.get('pemohon_nik') ?? '')).trim();
    const waRaw = String(fd.get('pemohon_wa') ?? existing.pemohon_wa ?? '').trim();
    const wa = normalizeWa(waRaw);

    await updatePengajuanWargaData(
      id,
      {
        data_json: JSON.stringify(data),
        pemohon_nama: nama,
        pemohon_nik: nik,
        pemohon_wa: wa.length >= 10 ? wa : existing.pemohon_wa,
      },
      env.DB
    );
    return redirect(`/admin/pelayanan/${id}?saved=1`);
  }

  if (action === 'admin_data') {
    if (existing.status !== 'diterima') return redirect(`/admin/pelayanan/${id}`);
    const adminFields = parseFields(existing.admin_fields_json || '[]');
    const data: Record<string, string> = {};
    for (const f of adminFields) {
      data[f.key] = String(fd.get(`admin_${f.key}`) ?? '').trim();
    }
    await updatePengajuanAdminData(id, JSON.stringify(data), env.DB);
    return redirect(`/admin/pelayanan/${id}?saved=1`);
  }

  if (existing.status !== 'menunggu') return redirect(`/admin/pelayanan/${id}`);

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
