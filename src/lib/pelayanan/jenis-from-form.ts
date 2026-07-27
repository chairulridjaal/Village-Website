import type { JenisPelayananInput } from '../db/pelayanan';
import { fieldsFromFormData } from './fields-form';

export function jenisInputFromFormData(fd: FormData): JenisPelayananInput {
  const fields = fieldsFromFormData(fd);
  return {
    nama: String(fd.get('nama') ?? '').trim(),
    deskripsi: String(fd.get('deskripsi') ?? '').trim(),
    syarat: String(fd.get('syarat') ?? '').trim(),
    fields_json: JSON.stringify(fields),
    template_html: String(fd.get('template_html') ?? ''),
    aktif: fd.get('aktif') ? 1 : 0,
    urutan: Number(fd.get('urutan') ?? 0) || 0,
    lampiran_wajib: fd.get('lampiran_wajib') ? 1 : 0,
    lampiran_info: String(fd.get('lampiran_info') ?? '').trim(),
  };
}
