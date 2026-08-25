import type { FormField, JenisPelayananInput } from '../db/pelayanan';
import { fieldsFromFormData } from './fields-form';

function adminFieldsFromFormData(fd: FormData): FormField[] {
  const keys = fd.getAll('admin_field_key').map((v) => String(v).trim());
  const labels = fd.getAll('admin_field_label').map((v) => String(v).trim());
  const types = fd.getAll('admin_field_type').map((v) => String(v).trim());
  const requireds = fd.getAll('admin_field_required').map((v) => String(v));
  const options = fd.getAll('admin_field_options').map((v) => String(v).trim());

  const fields: FormField[] = [];
  for (let i = 0; i < Math.max(keys.length, labels.length); i++) {
    const label = labels[i] || keys[i];
    if (!label) continue;
    let key = (keys[i] || label)
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '');
    if (!key) key = `admin_${i + 1}`;
    if (fields.some((f) => f.key === key)) key = `${key}_${i + 1}`;
    const type = (['text', 'textarea', 'date', 'number', 'select'].includes(types[i])
      ? types[i]
      : 'text') as FormField['type'];
    const field: FormField = {
      key,
      label,
      type,
      required: requireds[i] === '1' || requireds[i] === 'on' || requireds[i] === 'true',
    };
    if (type === 'select' && options[i]) {
      field.options = options[i].split('|').map((s) => s.trim()).filter(Boolean);
    }
    fields.push(field);
  }
  return fields;
}

export function jenisInputFromFormData(fd: FormData): JenisPelayananInput {
  const fields = fieldsFromFormData(fd);
  const adminFields = adminFieldsFromFormData(fd);
  const docxPath = String(fd.get('template_docx_path') ?? '').trim();
  return {
    nama: String(fd.get('nama') ?? '').trim(),
    deskripsi: String(fd.get('deskripsi') ?? '').trim(),
    syarat: String(fd.get('syarat') ?? '').trim(),
    fields_json: JSON.stringify(fields),
    admin_fields_json: JSON.stringify(adminFields),
    template_html: String(fd.get('template_html') ?? ''),
    template_docx_path: docxPath || null,
    aktif: fd.get('aktif') ? 1 : 0,
    urutan: Number(fd.get('urutan') ?? 0) || 0,
    lampiran_wajib: fd.get('lampiran_wajib') ? 1 : 0,
    lampiran_info: String(fd.get('lampiran_info') ?? '').trim(),
  };
}
