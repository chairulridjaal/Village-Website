import type { FormField } from '../db/pelayanan';

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

export const DEFAULT_TEMPLATE = `<div class="surat-doc" style="font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.5;color:#111">
<div class="surat-kop" style="text-align:center;margin-bottom:0.75rem">
  <img src="/images/kop-desa-citarik.png" alt="Kop Desa Citarik" style="max-width:100%;height:auto;max-height:110px;object-fit:contain" />
</div>
<div style="text-align:center;margin-bottom:1rem">
  <p style="font-weight:700;text-decoration:underline;margin:0;letter-spacing:0.02em;text-transform:uppercase">{{jenis_surat}}</p>
  <p style="margin:0.35rem 0 0">Nomor: {{nomor_surat}}</p>
</div>
<p style="text-align:justify;margin:0.5rem 0">Kepala Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi, dengan ini menerangkan bahwa:</p>
<table style="width:100%;margin:0.75rem 0;border-collapse:collapse">
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Nama</td><td style="padding:0.15rem 0;vertical-align:top">: {{nama}}</td></tr>
  <tr><td style="padding:0.15rem 0;vertical-align:top">NIK</td><td style="padding:0.15rem 0;vertical-align:top">: {{nik}}</td></tr>
  <tr><td style="padding:0.15rem 0;vertical-align:top">Alamat</td><td style="padding:0.15rem 0;vertical-align:top">: {{alamat}}</td></tr>
</table>
<p style="text-align:justify;margin:0.65rem 0">Surat ini dibuat untuk keperluan: <strong>{{keperluan}}</strong>.</p>
<p style="text-align:justify;margin:0.65rem 0">Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>
<table style="width:100%;margin-top:2rem;border-collapse:collapse">
  <tr>
    <td style="width:45%;vertical-align:top;padding:0"></td>
    <td style="width:55%;vertical-align:top;padding:0;text-align:center">
      <p style="margin:0">Dikeluarkan di : Citarik</p>
      <p style="margin:0">Pada tanggal : {{tanggal}}</p>
      <p style="margin:0.75rem 0 0">Kepala Desa Citarik</p>
      <p style="margin:3.25rem 0 0;font-weight:700;text-decoration:underline">H. SUMANTRI</p>
    </td>
  </tr>
</table>
</div>`;
