import { writeFileSync } from 'fs';
import { pathToFileURL } from 'url';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Dynamic import of TS via relative path may fail without loader;
// reimplement seed data inline by calling compiled logic after a simple port.

const KOP_IMG = '/images/kop-desa-citarik.png';

function escapeHtml(s) {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildTemplate({ title, intro, fieldRows, bodyParas }) {
  const rows = fieldRows
    .map(
      (f) =>
        `  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">${escapeHtml(f.label)}</td><td style="padding:0.15rem 0;vertical-align:top">: {{${f.key}}}</td></tr>`
    )
    .join('\n');
  const body = bodyParas
    .map((p) => `<p style="text-align:justify;margin:0.65rem 0">${p}</p>`)
    .join('\n');
  return `<div class="surat-kop" style="text-align:center;margin-bottom:0.75rem">
  <img src="${KOP_IMG}" alt="Kop Desa Citarik" style="max-width:100%;height:auto;max-height:110px;object-fit:contain" />
</div>
<div style="text-align:center;margin-bottom:1rem">
  <p style="font-weight:700;text-decoration:underline;margin:0;letter-spacing:0.02em;text-transform:uppercase">${escapeHtml(title)}</p>
  <p style="margin:0.35rem 0 0">Nomor: {{nomor_surat}}</p>
</div>
<p style="text-align:justify;margin:0.5rem 0">${intro}</p>
<table style="width:100%;margin:0.75rem 0;border-collapse:collapse">
${rows}
</table>
${body}
<table style="width:100%;margin-top:2rem;border-collapse:collapse">
  <tr>
    <td style="width:50%;vertical-align:top;padding:0"></td>
    <td style="width:50%;vertical-align:top;padding:0;text-align:center">
      <p style="margin:0">Dikeluarkan di : Citarik</p>
      <p style="margin:0">Pada tanggal : {{tanggal}}</p>
      <p style="margin:0.75rem 0 0">Kepala Desa Citarik</p>
      <p style="margin:3.25rem 0 0;font-weight:700;text-decoration:underline">H. SUMANTRI</p>
    </td>
  </tr>
</table>
<p style="font-size:0.75rem;margin-top:1.5rem;text-align:center;color:#444;line-height:1.35">
  Jl. Raya Citarik Km. 06 Kecamatan Palabuhanratu, Kabupaten Sukabumi, Kode Pos 43364<br/>
  Tlp./WA : +6285798482993 / +6285723049491 · e-mail : kantordesacitarik@yahoo.com
</p>`;
}

const baseIdentity = [
  { key: 'nama', label: 'Nama lengkap', type: 'text', required: true },
  {
    key: 'jenis_kelamin',
    label: 'Jenis kelamin',
    type: 'select',
    required: true,
    options: ['Laki-laki', 'Perempuan'],
  },
  { key: 'nik', label: 'NIK', type: 'text', required: true },
  { key: 'ttl', label: 'Tempat / tanggal lahir', type: 'text', required: true },
  { key: 'agama', label: 'Agama', type: 'text', required: true },
  { key: 'kewarganegaraan', label: 'Kewarganegaraan', type: 'text', required: true },
  { key: 'pekerjaan', label: 'Pekerjaan', type: 'text', required: true },
  { key: 'alamat', label: 'Alamat lengkap', type: 'textarea', required: true },
];

const intro =
  'Kepala Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi, dengan ini menerangkan bahwa:';

const identityKeys = new Set([
  'nama',
  'jenis_kelamin',
  'nik',
  'ttl',
  'agama',
  'kewarganegaraan',
  'status_perkawinan',
  'pekerjaan',
  'alamat',
]);

const kinds = [
  {
    kind: 'skck',
    slug: 'surat-keterangan-pengantar-skck',
    urutan: 1,
    nama: 'Surat Keterangan Pengantar SKCK',
    deskripsi: 'Pengantar pembuatan SKCK di kepolisian untuk warga Desa Citarik.',
    syarat: 'Fotokopi KTP dan KK; surat pengantar RT/RW bila diminta.',
    fields: [
      ...baseIdentity,
      {
        key: 'status_perkawinan',
        label: 'Status perkawinan',
        type: 'select',
        required: true,
        options: ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'],
      },
      { key: 'keperluan', label: 'Keperluan (mis. melamar pekerjaan)', type: 'text', required: true },
    ],
    body: [
      'Adalah Warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi yang memohon Surat Keterangan Catatan Kepolisian untuk Keperluan: <strong>{{keperluan}}</strong>.',
      'Keterangan ini kami berikan untuk melengkapi persyaratan pembuatan SKCK di Kantor Kepolisian atas dasar sepengetahuan serta pertimbangan bahwa nama tersebut benar Warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi dan pada saat ini berkelakuan baik.',
      'Demikian surat keterangan ini kami buat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.',
    ],
  },
  {
    kind: 'domisili',
    slug: 'surat-keterangan-domisili',
    urutan: 2,
    nama: 'Surat Keterangan Domisili',
    deskripsi: 'Surat keterangan bahwa pemohon berdomisili di Desa Citarik.',
    syarat: 'Fotokopi KTP dan KK; pengantar RT setempat bila diminta.',
    fields: [
      ...baseIdentity,
      { key: 'keperluan', label: 'Keperluan surat', type: 'text', required: false },
    ],
    body: [
      'Berdasarkan Laporan Ketua RT Setempat bahwa nama tersebut di atas saat ini benar berdomisili seperti yang tercantum di atas, dan keterangan ini kami berikan sebagai bukti identitas diri dari yang bersangkutan.',
      'Demikian Surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.',
    ],
  },
  {
    kind: 'tidak-mampu',
    slug: 'surat-keterangan-tidak-mampu',
    urutan: 3,
    nama: 'Surat Keterangan Tidak Mampu',
    deskripsi: 'Surat keterangan status ekonomi untuk bantuan, beasiswa, atau layanan sosial.',
    syarat: 'Fotokopi KTP dan KK; pengantar RT/RW setempat.',
    fields: [
      ...baseIdentity,
      { key: 'keperluan', label: 'Keperluan / tujuan surat', type: 'text', required: true },
    ],
    body: [
      'Adalah warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi, menerangkan bahwa berdasarkan Surat Pengantar Dari RT/RW Setempat bahwa nama tersebut di atas benar-benar keluarga tidak mampu.',
      'Keterangan ini kami berikan untuk melengkapi persyaratan: <strong>{{keperluan}}</strong>.',
      'Demikian surat keterangan tidak mampu ini dibuat untuk dapat dipergunakan sebagaimana mestinya.',
    ],
  },
  {
    kind: 'umum',
    slug: 'surat-keterangan-umum',
    urutan: 4,
    nama: 'Surat Keterangan Umum',
    deskripsi: 'Surat keterangan umum untuk keperluan administrasi warga Desa Citarik.',
    syarat: 'Fotokopi KTP dan KK.',
    fields: [
      ...baseIdentity,
      {
        key: 'keterangan',
        label: 'Isi keterangan (fakta yang diterangkan)',
        type: 'textarea',
        required: true,
      },
      { key: 'keperluan', label: 'Keperluan surat', type: 'text', required: false },
    ],
    body: [
      'Adalah warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi. Dengan ini menerangkan bahwa nama tersebut: <strong>{{keterangan}}</strong>.',
      'Demikian keterangan ini kami buat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.',
    ],
  },
  {
    kind: 'usaha',
    slug: 'surat-keterangan-usaha',
    urutan: 5,
    nama: 'Surat Keterangan Usaha',
    deskripsi: 'Surat keterangan bahwa pemohon memiliki usaha di wilayah Desa Citarik.',
    syarat: 'Fotokopi KTP; sebutkan jenis usaha dengan jelas; pengantar RT/RW bila diminta.',
    fields: [
      ...baseIdentity,
      { key: 'jenis_usaha', label: 'Jenis / bidang usaha', type: 'text', required: true },
      { key: 'keperluan', label: 'Keperluan surat', type: 'text', required: true },
    ],
    body: [
      'Berdasarkan Berita Acara Survey Lapangan dan Verifikasi dari Kasi Pemerintahan serta Pengantar dari RT/RW Setempat bahwa nama tersebut di atas mempunyai usaha di wilayah Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi di bidang: <strong>{{jenis_usaha}}</strong>.',
      'Keterangan ini kami berikan untuk: <strong>{{keperluan}}</strong>.',
      'Demikian keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.',
    ],
  },
];

function esc(s) {
  return String(s).replace(/'/g, "''");
}

const parts = [
  '-- Seed/replace 5 official letter types from Desa Citarik DOCX formats',
  '-- Kop image served from public/images/kop-desa-citarik.png',
  '',
];

for (const k of kinds) {
  const rows = k.fields
    .filter((f) => identityKeys.has(f.key))
    .map((f) => ({ key: f.key, label: f.label }));
  const template_html = buildTemplate({
    title: k.nama.toUpperCase(),
    intro,
    fieldRows: rows,
    bodyParas: k.body,
  });
  const fields_json = JSON.stringify(k.fields);
  parts.push(`-- ${k.nama}`);
  parts.push(`INSERT INTO jenis_pelayanan (slug, nama, deskripsi, syarat, fields_json, template_html, aktif, urutan, lampiran_wajib, lampiran_info)
VALUES (
  '${k.slug}',
  '${esc(k.nama)}',
  '${esc(k.deskripsi)}',
  '${esc(k.syarat)}',
  '${esc(fields_json)}',
  '${esc(template_html)}',
  1,
  ${k.urutan},
  1,
  'Unggah fotokopi KTP dan/atau KK (PDF/JPG, maks. 3 file).'
) ON CONFLICT(slug) DO UPDATE SET
  nama = excluded.nama,
  deskripsi = excluded.deskripsi,
  syarat = excluded.syarat,
  fields_json = excluded.fields_json,
  template_html = excluded.template_html,
  aktif = 1,
  urutan = excluded.urutan,
  lampiran_wajib = excluded.lampiran_wajib,
  lampiran_info = excluded.lampiran_info,
  updated_at = datetime('now');
`);
  parts.push('');
}

const out = join(dirname(fileURLToPath(import.meta.url)), '..', 'migrations', '0017_surat_docx_seed.sql');
writeFileSync(out, parts.join('\n'), 'utf8');
console.log('wrote', out, parts.join('\n').length, 'chars');
