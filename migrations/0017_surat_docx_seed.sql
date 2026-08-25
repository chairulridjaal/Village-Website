-- Seed/replace 5 official letter types from Desa Citarik DOCX formats
-- Kop image served from public/images/kop-desa-citarik.png

-- Surat Keterangan Pengantar SKCK
INSERT INTO jenis_pelayanan (slug, nama, deskripsi, syarat, fields_json, template_html, aktif, urutan, lampiran_wajib, lampiran_info)
VALUES (
  'surat-keterangan-pengantar-skck',
  'Surat Keterangan Pengantar SKCK',
  'Pengantar pembuatan SKCK di kepolisian untuk warga Desa Citarik.',
  'Fotokopi KTP dan KK; surat pengantar RT/RW bila diminta.',
  '[{"key":"nama","label":"Nama lengkap","type":"text","required":true},{"key":"jenis_kelamin","label":"Jenis kelamin","type":"select","required":true,"options":["Laki-laki","Perempuan"]},{"key":"nik","label":"NIK","type":"text","required":true},{"key":"ttl","label":"Tempat / tanggal lahir","type":"text","required":true},{"key":"agama","label":"Agama","type":"text","required":true},{"key":"kewarganegaraan","label":"Kewarganegaraan","type":"text","required":true},{"key":"pekerjaan","label":"Pekerjaan","type":"text","required":true},{"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true},{"key":"status_perkawinan","label":"Status perkawinan","type":"select","required":true,"options":["Belum Kawin","Kawin","Cerai Hidup","Cerai Mati"]},{"key":"keperluan","label":"Keperluan (mis. melamar pekerjaan)","type":"text","required":true}]',
  '<div class="surat-kop" style="text-align:center;margin-bottom:0.75rem">
  <img src="/images/kop-desa-citarik.png" alt="Kop Desa Citarik" style="max-width:100%;height:auto;max-height:110px;object-fit:contain" />
</div>
<div style="text-align:center;margin-bottom:1rem">
  <p style="font-weight:700;text-decoration:underline;margin:0;letter-spacing:0.02em;text-transform:uppercase">SURAT KETERANGAN PENGANTAR SKCK</p>
  <p style="margin:0.35rem 0 0">Nomor: {{nomor_surat}}</p>
</div>
<p style="text-align:justify;margin:0.5rem 0">Kepala Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi, dengan ini menerangkan bahwa:</p>
<table style="width:100%;margin:0.75rem 0;border-collapse:collapse">
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Nama lengkap</td><td style="padding:0.15rem 0;vertical-align:top">: {{nama}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Jenis kelamin</td><td style="padding:0.15rem 0;vertical-align:top">: {{jenis_kelamin}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">NIK</td><td style="padding:0.15rem 0;vertical-align:top">: {{nik}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Tempat / tanggal lahir</td><td style="padding:0.15rem 0;vertical-align:top">: {{ttl}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Agama</td><td style="padding:0.15rem 0;vertical-align:top">: {{agama}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Kewarganegaraan</td><td style="padding:0.15rem 0;vertical-align:top">: {{kewarganegaraan}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Pekerjaan</td><td style="padding:0.15rem 0;vertical-align:top">: {{pekerjaan}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Alamat lengkap</td><td style="padding:0.15rem 0;vertical-align:top">: {{alamat}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Status perkawinan</td><td style="padding:0.15rem 0;vertical-align:top">: {{status_perkawinan}}</td></tr>
</table>
<p style="text-align:justify;margin:0.65rem 0">Adalah Warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi yang memohon Surat Keterangan Catatan Kepolisian untuk Keperluan: <strong>{{keperluan}}</strong>.</p>
<p style="text-align:justify;margin:0.65rem 0">Keterangan ini kami berikan untuk melengkapi persyaratan pembuatan SKCK di Kantor Kepolisian atas dasar sepengetahuan serta pertimbangan bahwa nama tersebut benar Warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi dan pada saat ini berkelakuan baik.</p>
<p style="text-align:justify;margin:0.65rem 0">Demikian surat keterangan ini kami buat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>
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
</p>',
  1,
  1,
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


-- Surat Keterangan Domisili
INSERT INTO jenis_pelayanan (slug, nama, deskripsi, syarat, fields_json, template_html, aktif, urutan, lampiran_wajib, lampiran_info)
VALUES (
  'surat-keterangan-domisili',
  'Surat Keterangan Domisili',
  'Surat keterangan bahwa pemohon berdomisili di Desa Citarik.',
  'Fotokopi KTP dan KK; pengantar RT setempat bila diminta.',
  '[{"key":"nama","label":"Nama lengkap","type":"text","required":true},{"key":"jenis_kelamin","label":"Jenis kelamin","type":"select","required":true,"options":["Laki-laki","Perempuan"]},{"key":"nik","label":"NIK","type":"text","required":true},{"key":"ttl","label":"Tempat / tanggal lahir","type":"text","required":true},{"key":"agama","label":"Agama","type":"text","required":true},{"key":"kewarganegaraan","label":"Kewarganegaraan","type":"text","required":true},{"key":"pekerjaan","label":"Pekerjaan","type":"text","required":true},{"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true},{"key":"keperluan","label":"Keperluan surat","type":"text","required":false}]',
  '<div class="surat-kop" style="text-align:center;margin-bottom:0.75rem">
  <img src="/images/kop-desa-citarik.png" alt="Kop Desa Citarik" style="max-width:100%;height:auto;max-height:110px;object-fit:contain" />
</div>
<div style="text-align:center;margin-bottom:1rem">
  <p style="font-weight:700;text-decoration:underline;margin:0;letter-spacing:0.02em;text-transform:uppercase">SURAT KETERANGAN DOMISILI</p>
  <p style="margin:0.35rem 0 0">Nomor: {{nomor_surat}}</p>
</div>
<p style="text-align:justify;margin:0.5rem 0">Kepala Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi, dengan ini menerangkan bahwa:</p>
<table style="width:100%;margin:0.75rem 0;border-collapse:collapse">
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Nama lengkap</td><td style="padding:0.15rem 0;vertical-align:top">: {{nama}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Jenis kelamin</td><td style="padding:0.15rem 0;vertical-align:top">: {{jenis_kelamin}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">NIK</td><td style="padding:0.15rem 0;vertical-align:top">: {{nik}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Tempat / tanggal lahir</td><td style="padding:0.15rem 0;vertical-align:top">: {{ttl}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Agama</td><td style="padding:0.15rem 0;vertical-align:top">: {{agama}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Kewarganegaraan</td><td style="padding:0.15rem 0;vertical-align:top">: {{kewarganegaraan}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Pekerjaan</td><td style="padding:0.15rem 0;vertical-align:top">: {{pekerjaan}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Alamat lengkap</td><td style="padding:0.15rem 0;vertical-align:top">: {{alamat}}</td></tr>
</table>
<p style="text-align:justify;margin:0.65rem 0">Berdasarkan Laporan Ketua RT Setempat bahwa nama tersebut di atas saat ini benar berdomisili seperti yang tercantum di atas, dan keterangan ini kami berikan sebagai bukti identitas diri dari yang bersangkutan.</p>
<p style="text-align:justify;margin:0.65rem 0">Demikian Surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>
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
</p>',
  1,
  2,
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


-- Surat Keterangan Tidak Mampu
INSERT INTO jenis_pelayanan (slug, nama, deskripsi, syarat, fields_json, template_html, aktif, urutan, lampiran_wajib, lampiran_info)
VALUES (
  'surat-keterangan-tidak-mampu',
  'Surat Keterangan Tidak Mampu',
  'Surat keterangan status ekonomi untuk bantuan, beasiswa, atau layanan sosial.',
  'Fotokopi KTP dan KK; pengantar RT/RW setempat.',
  '[{"key":"nama","label":"Nama lengkap","type":"text","required":true},{"key":"jenis_kelamin","label":"Jenis kelamin","type":"select","required":true,"options":["Laki-laki","Perempuan"]},{"key":"nik","label":"NIK","type":"text","required":true},{"key":"ttl","label":"Tempat / tanggal lahir","type":"text","required":true},{"key":"agama","label":"Agama","type":"text","required":true},{"key":"kewarganegaraan","label":"Kewarganegaraan","type":"text","required":true},{"key":"pekerjaan","label":"Pekerjaan","type":"text","required":true},{"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true},{"key":"keperluan","label":"Keperluan / tujuan surat","type":"text","required":true}]',
  '<div class="surat-kop" style="text-align:center;margin-bottom:0.75rem">
  <img src="/images/kop-desa-citarik.png" alt="Kop Desa Citarik" style="max-width:100%;height:auto;max-height:110px;object-fit:contain" />
</div>
<div style="text-align:center;margin-bottom:1rem">
  <p style="font-weight:700;text-decoration:underline;margin:0;letter-spacing:0.02em;text-transform:uppercase">SURAT KETERANGAN TIDAK MAMPU</p>
  <p style="margin:0.35rem 0 0">Nomor: {{nomor_surat}}</p>
</div>
<p style="text-align:justify;margin:0.5rem 0">Kepala Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi, dengan ini menerangkan bahwa:</p>
<table style="width:100%;margin:0.75rem 0;border-collapse:collapse">
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Nama lengkap</td><td style="padding:0.15rem 0;vertical-align:top">: {{nama}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Jenis kelamin</td><td style="padding:0.15rem 0;vertical-align:top">: {{jenis_kelamin}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">NIK</td><td style="padding:0.15rem 0;vertical-align:top">: {{nik}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Tempat / tanggal lahir</td><td style="padding:0.15rem 0;vertical-align:top">: {{ttl}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Agama</td><td style="padding:0.15rem 0;vertical-align:top">: {{agama}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Kewarganegaraan</td><td style="padding:0.15rem 0;vertical-align:top">: {{kewarganegaraan}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Pekerjaan</td><td style="padding:0.15rem 0;vertical-align:top">: {{pekerjaan}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Alamat lengkap</td><td style="padding:0.15rem 0;vertical-align:top">: {{alamat}}</td></tr>
</table>
<p style="text-align:justify;margin:0.65rem 0">Adalah warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi, menerangkan bahwa berdasarkan Surat Pengantar Dari RT/RW Setempat bahwa nama tersebut di atas benar-benar keluarga tidak mampu.</p>
<p style="text-align:justify;margin:0.65rem 0">Keterangan ini kami berikan untuk melengkapi persyaratan: <strong>{{keperluan}}</strong>.</p>
<p style="text-align:justify;margin:0.65rem 0">Demikian surat keterangan tidak mampu ini dibuat untuk dapat dipergunakan sebagaimana mestinya.</p>
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
</p>',
  1,
  3,
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


-- Surat Keterangan Umum
INSERT INTO jenis_pelayanan (slug, nama, deskripsi, syarat, fields_json, template_html, aktif, urutan, lampiran_wajib, lampiran_info)
VALUES (
  'surat-keterangan-umum',
  'Surat Keterangan Umum',
  'Surat keterangan umum untuk keperluan administrasi warga Desa Citarik.',
  'Fotokopi KTP dan KK.',
  '[{"key":"nama","label":"Nama lengkap","type":"text","required":true},{"key":"jenis_kelamin","label":"Jenis kelamin","type":"select","required":true,"options":["Laki-laki","Perempuan"]},{"key":"nik","label":"NIK","type":"text","required":true},{"key":"ttl","label":"Tempat / tanggal lahir","type":"text","required":true},{"key":"agama","label":"Agama","type":"text","required":true},{"key":"kewarganegaraan","label":"Kewarganegaraan","type":"text","required":true},{"key":"pekerjaan","label":"Pekerjaan","type":"text","required":true},{"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true},{"key":"keterangan","label":"Isi keterangan (fakta yang diterangkan)","type":"textarea","required":true},{"key":"keperluan","label":"Keperluan surat","type":"text","required":false}]',
  '<div class="surat-kop" style="text-align:center;margin-bottom:0.75rem">
  <img src="/images/kop-desa-citarik.png" alt="Kop Desa Citarik" style="max-width:100%;height:auto;max-height:110px;object-fit:contain" />
</div>
<div style="text-align:center;margin-bottom:1rem">
  <p style="font-weight:700;text-decoration:underline;margin:0;letter-spacing:0.02em;text-transform:uppercase">SURAT KETERANGAN UMUM</p>
  <p style="margin:0.35rem 0 0">Nomor: {{nomor_surat}}</p>
</div>
<p style="text-align:justify;margin:0.5rem 0">Kepala Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi, dengan ini menerangkan bahwa:</p>
<table style="width:100%;margin:0.75rem 0;border-collapse:collapse">
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Nama lengkap</td><td style="padding:0.15rem 0;vertical-align:top">: {{nama}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Jenis kelamin</td><td style="padding:0.15rem 0;vertical-align:top">: {{jenis_kelamin}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">NIK</td><td style="padding:0.15rem 0;vertical-align:top">: {{nik}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Tempat / tanggal lahir</td><td style="padding:0.15rem 0;vertical-align:top">: {{ttl}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Agama</td><td style="padding:0.15rem 0;vertical-align:top">: {{agama}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Kewarganegaraan</td><td style="padding:0.15rem 0;vertical-align:top">: {{kewarganegaraan}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Pekerjaan</td><td style="padding:0.15rem 0;vertical-align:top">: {{pekerjaan}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Alamat lengkap</td><td style="padding:0.15rem 0;vertical-align:top">: {{alamat}}</td></tr>
</table>
<p style="text-align:justify;margin:0.65rem 0">Adalah warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi. Dengan ini menerangkan bahwa nama tersebut: <strong>{{keterangan}}</strong>.</p>
<p style="text-align:justify;margin:0.65rem 0">Demikian keterangan ini kami buat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>
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
</p>',
  1,
  4,
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


-- Surat Keterangan Usaha
INSERT INTO jenis_pelayanan (slug, nama, deskripsi, syarat, fields_json, template_html, aktif, urutan, lampiran_wajib, lampiran_info)
VALUES (
  'surat-keterangan-usaha',
  'Surat Keterangan Usaha',
  'Surat keterangan bahwa pemohon memiliki usaha di wilayah Desa Citarik.',
  'Fotokopi KTP; sebutkan jenis usaha dengan jelas; pengantar RT/RW bila diminta.',
  '[{"key":"nama","label":"Nama lengkap","type":"text","required":true},{"key":"jenis_kelamin","label":"Jenis kelamin","type":"select","required":true,"options":["Laki-laki","Perempuan"]},{"key":"nik","label":"NIK","type":"text","required":true},{"key":"ttl","label":"Tempat / tanggal lahir","type":"text","required":true},{"key":"agama","label":"Agama","type":"text","required":true},{"key":"kewarganegaraan","label":"Kewarganegaraan","type":"text","required":true},{"key":"pekerjaan","label":"Pekerjaan","type":"text","required":true},{"key":"alamat","label":"Alamat lengkap","type":"textarea","required":true},{"key":"jenis_usaha","label":"Jenis / bidang usaha","type":"text","required":true},{"key":"keperluan","label":"Keperluan surat","type":"text","required":true}]',
  '<div class="surat-kop" style="text-align:center;margin-bottom:0.75rem">
  <img src="/images/kop-desa-citarik.png" alt="Kop Desa Citarik" style="max-width:100%;height:auto;max-height:110px;object-fit:contain" />
</div>
<div style="text-align:center;margin-bottom:1rem">
  <p style="font-weight:700;text-decoration:underline;margin:0;letter-spacing:0.02em;text-transform:uppercase">SURAT KETERANGAN USAHA</p>
  <p style="margin:0.35rem 0 0">Nomor: {{nomor_surat}}</p>
</div>
<p style="text-align:justify;margin:0.5rem 0">Kepala Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi, dengan ini menerangkan bahwa:</p>
<table style="width:100%;margin:0.75rem 0;border-collapse:collapse">
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Nama lengkap</td><td style="padding:0.15rem 0;vertical-align:top">: {{nama}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Jenis kelamin</td><td style="padding:0.15rem 0;vertical-align:top">: {{jenis_kelamin}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">NIK</td><td style="padding:0.15rem 0;vertical-align:top">: {{nik}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Tempat / tanggal lahir</td><td style="padding:0.15rem 0;vertical-align:top">: {{ttl}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Agama</td><td style="padding:0.15rem 0;vertical-align:top">: {{agama}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Kewarganegaraan</td><td style="padding:0.15rem 0;vertical-align:top">: {{kewarganegaraan}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Pekerjaan</td><td style="padding:0.15rem 0;vertical-align:top">: {{pekerjaan}}</td></tr>
  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">Alamat lengkap</td><td style="padding:0.15rem 0;vertical-align:top">: {{alamat}}</td></tr>
</table>
<p style="text-align:justify;margin:0.65rem 0">Berdasarkan Berita Acara Survey Lapangan dan Verifikasi dari Kasi Pemerintahan serta Pengantar dari RT/RW Setempat bahwa nama tersebut di atas mempunyai usaha di wilayah Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi di bidang: <strong>{{jenis_usaha}}</strong>.</p>
<p style="text-align:justify;margin:0.65rem 0">Keterangan ini kami berikan untuk: <strong>{{keperluan}}</strong>.</p>
<p style="text-align:justify;margin:0.65rem 0">Demikian keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.</p>
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
</p>',
  1,
  5,
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

