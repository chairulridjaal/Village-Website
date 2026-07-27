import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import {
  addLampiran,
  createPengajuan,
  getJenisBySlug,
  normalizeWa,
  parseFields,
} from '../../../lib/db/pelayanan';
import { saveLampiranBlob } from '../../../lib/media/upload';

const MAX_FILES = 3;

export const POST: APIRoute = async ({ request, redirect }) => {
  const env = getEnv();
  if (!env) return redirect('/pelayanan?error=server');

  const fd = await request.formData();
  const slug = String(fd.get('jenis_slug') ?? '').trim();
  const jenis = slug ? await getJenisBySlug(slug, env.DB) : null;
  if (!jenis || !jenis.aktif) return redirect('/pelayanan?error=server');

  const fields = parseFields(jenis.fields_json);
  const data: Record<string, string> = {};
  for (const f of fields) {
    const raw = String(fd.get(`field_${f.key}`) ?? '').trim();
    if (f.required && !raw) {
      return redirect(`/pelayanan/${slug}?error=fields`);
    }
    data[f.key] = raw;
  }

  const waRaw = String(fd.get('pemohon_wa') ?? '').trim();
  const wa = normalizeWa(waRaw);
  if (wa.length < 10 || wa.length > 15 || !wa.startsWith('62')) {
    return redirect(`/pelayanan/${slug}?error=wa`);
  }

  const nama = (data.nama || data.pemohon_nama || '').trim();
  const nik = (data.nik || data.pemohon_nik || '').trim();
  if (!nama) return redirect(`/pelayanan/${slug}?error=fields`);

  const lampiranWajib = !!jenis.lampiran_wajib;
  const files = fd.getAll('lampiran').filter((x): x is File => x instanceof File && x.size > 0);

  if (lampiranWajib && files.length === 0) {
    return redirect(`/pelayanan/${slug}?error=lampiran`);
  }
  if (files.length > MAX_FILES) {
    return redirect(`/pelayanan/${slug}?error=lampiran_count`);
  }
  // Abaikan file jika jenis tidak mewajibkan lampiran
  const toUpload = lampiranWajib ? files : [];

  try {
    const { id, nomor } = await createPengajuan(
      {
        jenis_id: jenis.id,
        data_json: JSON.stringify(data),
        pemohon_nama: nama,
        pemohon_nik: nik,
        pemohon_wa: wa,
      },
      env.DB
    );

    if (toUpload.length > 0 && env.MEDIA_BUCKET) {
      let savedCount = 0;
      for (const file of toUpload) {
        const saved = await saveLampiranBlob(file, id, env.MEDIA_BUCKET);
        if ('error' in saved) continue;
        await addLampiran(
          {
            pengajuan_id: id,
            r2_key: saved.r2_key,
            filename: saved.filename,
            content_type: saved.content_type,
            size_bytes: saved.size_bytes,
          },
          env.DB
        );
        savedCount++;
      }
      if (lampiranWajib && savedCount === 0) {
        return redirect(`/pelayanan/${slug}?error=lampiran`);
      }
    }

    return redirect(`/pelayanan/sukses?nomor=${encodeURIComponent(nomor)}`);
  } catch {
    return redirect(`/pelayanan/${slug}?error=server`);
  }
};
