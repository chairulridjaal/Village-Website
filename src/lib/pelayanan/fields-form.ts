import type { FormField } from '../db/pelayanan';

/** Parse field definitions from admin form (parallel arrays). */
export function fieldsFromFormData(fd: FormData): FormField[] {
  const keys = fd.getAll('field_key').map(v => String(v).trim());
  const labels = fd.getAll('field_label').map(v => String(v).trim());
  const types = fd.getAll('field_type').map(v => String(v).trim());
  const requireds = fd.getAll('field_required').map(v => String(v));
  const options = fd.getAll('field_options').map(v => String(v).trim());

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
    if (!key) key = `field_${i + 1}`;
    if (fields.some(f => f.key === key)) key = `${key}_${i + 1}`;

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
      field.options = options[i].split('|').map(s => s.trim()).filter(Boolean);
    }
    fields.push(field);
  }
  return fields;
}

export const DEFAULT_FIELDS: FormField[] = [
  { key: 'nama', label: 'Nama lengkap', type: 'text', required: true },
  { key: 'nik', label: 'NIK', type: 'text', required: true },
  { key: 'alamat', label: 'Alamat lengkap', type: 'textarea', required: true },
  { key: 'keperluan', label: 'Keperluan surat', type: 'text', required: true },
];

export const DEFAULT_TEMPLATE = `<div style="text-align:center;margin-bottom:1.5rem">
  <p style="font-weight:700;margin:0">PEMERINTAH DESA CITARIK</p>
  <p style="margin:0">Kecamatan Palabuhanratu · Kabupaten Sukabumi</p>
  <hr style="border:none;border-top:2px solid #0A3650;margin:0.75rem 0"/>
  <p style="font-weight:700;text-decoration:underline;margin:0">{{jenis_surat}}</p>
  <p style="margin:0.25rem 0 0">Nomor: {{nomor_surat}}</p>
</div>
<p>Yang bertanda tangan di bawah ini, Kepala Desa Citarik, menerangkan bahwa:</p>
<table style="width:100%;margin:1rem 0">
  <tr><td style="width:35%;padding:0.2rem 0">Nama</td><td>: {{nama}}</td></tr>
  <tr><td style="padding:0.2rem 0">NIK</td><td>: {{nik}}</td></tr>
  <tr><td style="padding:0.2rem 0">Alamat</td><td>: {{alamat}}</td></tr>
</table>
<p>Surat ini dibuat untuk keperluan: <strong>{{keperluan}}</strong>.</p>
<p>Demikian surat keterangan ini dibuat untuk dipergunakan sebagaimana mestinya.</p>
<p style="text-align:right;margin-top:2.5rem">Citarik, {{tanggal}}<br/>Kepala Desa Citarik<br/><br/><br/><br/><strong>Sumantri</strong></p>`;
