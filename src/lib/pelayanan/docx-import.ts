import JSZip from 'jszip';
import type { FormField } from '../db/pelayanan';

export interface DocxImportResult {
  nama: string;
  deskripsi: string;
  syarat: string;
  fields: FormField[];
  template_html: string;
  warnings: string[];
}

const KOP_IMG = '/images/kop-desa-citarik.png';

const FIELD_ALIASES: Array<{ match: RegExp; key: string; label: string; type: FormField['type']; options?: string[] }> = [
  { match: /^(nama|nama\s*lengkap)$/i, key: 'nama', label: 'Nama lengkap', type: 'text' },
  { match: /^(jenis\s*kelamin|jns\.?\s*kelamin)$/i, key: 'jenis_kelamin', label: 'Jenis kelamin', type: 'select', options: ['Laki-laki', 'Perempuan'] },
  { match: /^(nomor\s*nik|nik|no\.?\s*nik)$/i, key: 'nik', label: 'NIK', type: 'text' },
  { match: /^(tempat\s*\/?\s*tgl\.?\s*,?\s*lahir|tempat\s*\/\s*tanggal\s*lahir|ttl)$/i, key: 'ttl', label: 'Tempat / tanggal lahir', type: 'text' },
  { match: /^(tempat\s*lahir)$/i, key: 'tempat_lahir', label: 'Tempat lahir', type: 'text' },
  { match: /^(tanggal\s*lahir|tgl\.?\s*lahir)$/i, key: 'tanggal_lahir', label: 'Tanggal lahir', type: 'date' },
  { match: /^(kewarganegaraan)$/i, key: 'kewarganegaraan', label: 'Kewarganegaraan', type: 'text' },
  { match: /^(agama)$/i, key: 'agama', label: 'Agama', type: 'text' },
  { match: /^(status\s*perkawinan|status\s*kawin)$/i, key: 'status_perkawinan', label: 'Status perkawinan', type: 'select', options: ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'] },
  { match: /^(pekerjaan)$/i, key: 'pekerjaan', label: 'Pekerjaan', type: 'text' },
  { match: /^(a\s*l\s*a\s*m\s*a\s*t|alamat)$/i, key: 'alamat', label: 'Alamat lengkap', type: 'textarea' },
  { match: /^(keperluan|untuk\s*keperluan)$/i, key: 'keperluan', label: 'Keperluan surat', type: 'text' },
  { match: /^(bidang\s*usaha|jenis\s*usaha|usaha)$/i, key: 'jenis_usaha', label: 'Jenis / bidang usaha', type: 'text' },
  { match: /^(nama\s*usaha)$/i, key: 'nama_usaha', label: 'Nama usaha', type: 'text' },
  { match: /^(alamat\s*usaha|lokasi\s*usaha)$/i, key: 'alamat_usaha', label: 'Alamat / lokasi usaha', type: 'textarea' },
  { match: /^(keterangan|isi\s*keterangan|status)$/i, key: 'keterangan', label: 'Isi keterangan', type: 'textarea' },
];

const KNOWN_TITLES: Array<{ match: RegExp; nama: string; deskripsi: string; syarat: string }> = [
  {
    match: /pengantar\s*skck|catatan\s*kepolisian|skck/i,
    nama: 'Surat Keterangan Pengantar SKCK',
    deskripsi: 'Pengantar pembuatan SKCK di kepolisian untuk warga Desa Citarik.',
    syarat: 'Fotokopi KTP dan KK; surat pengantar RT/RW bila diminta.',
  },
  {
    match: /domisili/i,
    nama: 'Surat Keterangan Domisili',
    deskripsi: 'Surat keterangan bahwa pemohon berdomisili di Desa Citarik.',
    syarat: 'Fotokopi KTP dan KK; pengantar RT setempat bila diminta.',
  },
  {
    match: /tidak\s*mampu|sktm/i,
    nama: 'Surat Keterangan Tidak Mampu',
    deskripsi: 'Surat keterangan status ekonomi untuk bantuan, beasiswa, atau layanan sosial.',
    syarat: 'Fotokopi KTP dan KK; pengantar RT/RW setempat.',
  },
  {
    match: /usaha/i,
    nama: 'Surat Keterangan Usaha',
    deskripsi: 'Surat keterangan bahwa pemohon memiliki usaha di wilayah Desa Citarik.',
    syarat: 'Fotokopi KTP; sebutkan jenis usaha dengan jelas; pengantar RT/RW bila diminta.',
  },
  {
    match: /surat\s*-?\s*keterangan|umum/i,
    nama: 'Surat Keterangan Umum',
    deskripsi: 'Surat keterangan umum untuk keperluan administrasi warga Desa Citarik.',
    syarat: 'Fotokopi KTP dan KK.',
  },
];

function decodeXmlEntities(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCharCode(parseInt(h, 16)));
}

function textFromXmlFragment(xml: string): string {
  const parts: string[] = [];
  const re = /<(?:w:)?t(?:\s[^>]*)?>([^<]*)<\/(?:w:)?t>|<(?:w:)?tab\s*\/>|<(?:w:)?br\s*\/>|<(?:w:)?cr\s*\/>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    if (m[1] != null) parts.push(decodeXmlEntities(m[1]));
    else if (/tab/i.test(m[0])) parts.push('\t');
    else parts.push(' ');
  }
  return parts.join('').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

function extractLines(docXml: string): string[] {
  const bodyMatch = docXml.match(/<(?:w:)?body\b[^>]*>([\s\S]*)<\/(?:w:)?body>/i);
  const body = bodyMatch?.[1] ?? docXml;
  const lines: string[] = [];

  const blockRe = /<(?:w:)?(p|tbl)\b[^>]*>([\s\S]*?)<\/(?:w:)?\1>/gi;
  let block: RegExpExecArray | null;
  while ((block = blockRe.exec(body)) !== null) {
    const kind = block[1].toLowerCase();
    const inner = block[2];
    if (kind === 'p') {
      const t = textFromXmlFragment(inner).replace(/[=]{3,}/g, ' ').replace(/\s+/g, ' ').trim();
      if (t) lines.push(t);
    } else {
      const rowRe = /<(?:w:)?tr\b[^>]*>([\s\S]*?)<\/(?:w:)?tr>/gi;
      let row: RegExpExecArray | null;
      while ((row = rowRe.exec(inner)) !== null) {
        const cells: string[] = [];
        const cellRe = /<(?:w:)?tc\b[^>]*>([\s\S]*?)<\/(?:w:)?tc>/gi;
        let cell: RegExpExecArray | null;
        while ((cell = cellRe.exec(row[1])) !== null) {
          const paras: string[] = [];
          const pRe = /<(?:w:)?p\b[^>]*>([\s\S]*?)<\/(?:w:)?p>/gi;
          let p: RegExpExecArray | null;
          while ((p = pRe.exec(cell[1])) !== null) {
            const pt = textFromXmlFragment(p[1]);
            if (pt) paras.push(pt);
          }
          const joined = paras.join(' ').replace(/\s+/g, ' ').trim();
          if (joined) cells.push(joined);
        }
        const line = cells.join(' | ').trim();
        if (line) lines.push(line);
      }
    }
  }
  return lines;
}

function normalizeLabel(raw: string): string {
  return raw
    .replace(/\s+/g, ' ')
    .replace(/[.:]+$/g, '')
    .replace(/\s*\/\s*/g, '/')
    .trim();
}

function slugify(label: string): string {
  return (
    label
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_|_$/g, '') || 'field'
  );
}

function mapField(labelRaw: string): { key: string; label: string; type: FormField['type']; options?: string[] } {
  const label = normalizeLabel(labelRaw);
  const compact = label.replace(/\s+/g, ' ');
  for (const a of FIELD_ALIASES) {
    if (a.match.test(compact)) {
      return { key: a.key, label: a.label, type: a.type, options: a.options };
    }
  }
  const key = slugify(compact);
  return { key, label: compact || key, type: 'text' };
}

function parseLabeledLine(line: string): { label: string; value: string } | null {
  const m = line.match(/^-?\s*([^:]{2,40}?)\s*:\s*(.*)$/);
  if (!m) return null;
  const label = normalizeLabel(m[1]);
  const value = m[2].trim();
  if (!label || label.length > 40) return null;
  if (/^nomor$/i.test(label)) return null;
  if (/dikeluarkan|pada tanggal|kepala desa/i.test(label)) return null;
  return { label, value };
}

function detectMeta(lines: string[]): { nama: string; deskripsi: string; syarat: string } {
  const titleLine =
    lines.find((l) => /surat\s*-?\s*keterangan/i.test(l) && l.length < 80) ||
    lines.find((l) => /skck|domisili|tidak mampu|usaha/i.test(l) && l.length < 80) ||
    'Surat Keterangan';

  for (const k of KNOWN_TITLES) {
    if (k.match.test(titleLine) || lines.some((l) => k.match.test(l) && l.length < 100)) {
      return { nama: k.nama, deskripsi: k.deskripsi, syarat: k.syarat };
    }
  }
  const cleaned = titleLine.replace(/[-–]+/g, ' ').replace(/\s+/g, ' ').trim();
  return {
    nama: cleaned || 'Surat Keterangan',
    deskripsi: `Surat keterangan resmi Desa Citarik: ${cleaned}`,
    syarat: 'Fotokopi KTP dan KK.',
  };
}

function isBodyStart(line: string): boolean {
  return /dengan ini menerangkan|menerangkan bahwa|menerangkan\s*:/i.test(line);
}

function isBodyEnd(line: string): boolean {
  return (
    /demikian|dikeluarkan\s*(di|di\s*:)|pada tanggal|kepala desa citarik|jl\.\s*raya citarik|tlp\.?\/?wa/i.test(
      line
    )
  );
}

function buildTemplate(opts: {
  title: string;
  intro: string;
  fieldRows: Array<{ key: string; label: string }>;
  bodyParas: string[];
}): string {
  const rows = opts.fieldRows
    .map(
      (f) =>
        `  <tr><td style="width:38%;padding:0.15rem 0;vertical-align:top">${escapeHtml(f.label)}</td><td style="padding:0.15rem 0;vertical-align:top">: {{${f.key}}}</td></tr>`
    )
    .join('\n');

  const body = opts.bodyParas
    .map((p) => `<p style="text-align:justify;margin:0.65rem 0">${p}</p>`)
    .join('\n');

  return `<div class="surat-doc" style="font-family:'Times New Roman',Times,serif;font-size:12pt;line-height:1.5;color:#111">
<div class="surat-kop" style="text-align:center;margin-bottom:0.75rem">
  <img src="${KOP_IMG}" alt="Kop Desa Citarik" style="max-width:100%;height:auto;max-height:110px;object-fit:contain" />
</div>
<div style="text-align:center;margin-bottom:1rem">
  <p style="font-weight:700;text-decoration:underline;margin:0;letter-spacing:0.02em;text-transform:uppercase">${escapeHtml(opts.title)}</p>
  <p style="margin:0.35rem 0 0">Nomor: {{nomor_surat}}</p>
</div>
<p style="text-align:justify;margin:0.5rem 0;text-indent:0">${opts.intro}</p>
<table style="width:100%;margin:0.75rem 0;border-collapse:collapse">
${rows}
</table>
${body}
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
<p style="font-size:9pt;margin-top:1.75rem;text-align:center;color:#444;line-height:1.35">
  Jl. Raya Citarik Km. 06 Kecamatan Palabuhanratu, Kabupaten Sukabumi, Kode Pos 43364<br/>
  Tlp./WA : +6285798482993 / +6285723049491 · e-mail : kantordesacitarik@yahoo.com
</p>
</div>`;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function replaceSampleValues(text: string, samples: Array<{ value: string; key: string }>): string {
  let out = escapeHtml(text);
  const sorted = [...samples].filter((s) => s.value && s.value.length >= 2).sort((a, b) => b.value.length - a.value.length);
  for (const s of sorted) {
    const re = new RegExp(escapeRegExp(escapeHtml(s.value)), 'gi');
    out = out.replace(re, `{{${s.key}}}`);
  }
  return out;
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function ensureCoreFields(fields: FormField[]): FormField[] {
  const keys = new Set(fields.map((f) => f.key));
  const ensure = (f: FormField) => {
    if (!keys.has(f.key)) {
      fields.push(f);
      keys.add(f.key);
    }
  };
  ensure({ key: 'nama', label: 'Nama lengkap', type: 'text', required: true });
  ensure({ key: 'nik', label: 'NIK', type: 'text', required: true });
  ensure({ key: 'alamat', label: 'Alamat lengkap', type: 'textarea', required: true });
  ensure({ key: 'keperluan', label: 'Keperluan surat', type: 'text', required: true });
  return fields;
}

export async function importJenisFromDocx(input: ArrayBuffer | Uint8Array): Promise<DocxImportResult> {
  const warnings: string[] = [];
  const zip = await JSZip.loadAsync(input);
  const docFile = zip.file('word/document.xml');
  if (!docFile) {
    throw new Error('File Word tidak valid (document.xml tidak ditemukan).');
  }
  const docXml = await docFile.async('string');
  const lines = extractLines(docXml).filter((l) => l.length > 0);
  if (lines.length === 0) {
    throw new Error('Dokumen kosong atau tidak bisa dibaca.');
  }

  const meta = detectMeta(lines);
  const fields: FormField[] = [];
  const fieldRows: Array<{ key: string; label: string }> = [];
  const samples: Array<{ value: string; key: string }> = [];
  const seenKeys = new Set<string>();

  let intro =
    'Kepala Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi, dengan ini menerangkan bahwa:';
  const bodyRaw: string[] = [];
  let inPersonBlock = false;
  let personDone = false;

  for (const line of lines) {
    if (/^nomor\s*:/i.test(line)) continue;
    if (/jl\.\s*raya citarik|tlp\.?\/?wa|e-mail\s*:/i.test(line)) continue;
    if (/yuspa hendri|h\.?\s*sumantri/i.test(line) && /kepala|sekretaris|dikeluarkan/i.test(line)) continue;

    if (isBodyStart(line) && !personDone) {
      intro = escapeHtml(line.replace(/[=]{2,}/g, '').trim());
      if (!/:$/.test(intro)) intro += ':';
      inPersonBlock = true;
      continue;
    }

    const labeled = parseLabeledLine(line);
    if (labeled && inPersonBlock && !personDone) {
      const mapped = mapField(labeled.label);
      if (!seenKeys.has(mapped.key)) {
        seenKeys.add(mapped.key);
        const field: FormField = {
          key: mapped.key,
          label: mapped.label,
          type: mapped.type,
          required: ['nama', 'nik', 'alamat'].includes(mapped.key),
        };
        if (mapped.options) field.options = mapped.options;
        fields.push(field);
        fieldRows.push({ key: mapped.key, label: mapped.label });
      }
      if (labeled.value) samples.push({ value: labeled.value, key: mapped.key });
      continue;
    }

    if (inPersonBlock && !personDone && !labeled && /desa citarik|kecamatan|kabupaten|rt\.?\s*\d|rw\.?\s*\d/i.test(line)) {
      const last = samples.filter((s) => s.key === 'alamat').pop();
      if (last) {
        last.value = `${last.value} ${line}`.trim();
      }
      continue;
    }

    if (inPersonBlock && !personDone && !labeled && line.length > 20) {
      personDone = true;
      inPersonBlock = false;
    }

    if (personDone || (!inPersonBlock && isBodyStart(line) === false && bodyRaw.length > 0)) {
      if (isBodyEnd(line) && /dikeluarkan|pada tanggal|kepala desa|jl\./i.test(line)) {
        if (/demikian/i.test(line)) {
          bodyRaw.push(line.replace(/[=]{2,}/g, '').trim());
        }
        continue;
      }
    }

    if ((personDone || (!inPersonBlock && fields.length > 0)) && !labeled) {
      if (/^surat\s*-?\s*keterangan/i.test(line) && line.length < 60) continue;
      if (/dikeluarkan\s*di|pada tanggal|kepala desa citarik\s*$/i.test(line)) continue;
      const cleaned = line.replace(/[=]{2,}/g, ' ').replace(/\s+/g, ' ').trim();
      if (cleaned.length > 15) bodyRaw.push(cleaned);
    }

    const kep = line.match(/untuk\s+keperluan\s*:?\s*(.+)$/i);
    if (kep && kep[1]) {
      const val = kep[1].replace(/[=.]+$/g, '').trim();
      if (val && !seenKeys.has('keperluan')) {
        seenKeys.add('keperluan');
        fields.push({ key: 'keperluan', label: 'Keperluan surat', type: 'text', required: true });
        fieldRows.push({ key: 'keperluan', label: 'Keperluan surat' });
        samples.push({ value: val, key: 'keperluan' });
      }
    }

    const usaha = line.match(/di\s*bidang\s*:?\s*(.+?)(?:\s*=+|$)/i);
    if (usaha && usaha[1]) {
      const val = usaha[1].replace(/[=.]+$/g, '').trim();
      if (val && !seenKeys.has('jenis_usaha')) {
        seenKeys.add('jenis_usaha');
        fields.push({ key: 'jenis_usaha', label: 'Jenis / bidang usaha', type: 'text', required: true });
        fieldRows.push({ key: 'jenis_usaha', label: 'Jenis / bidang usaha' });
        samples.push({ value: val, key: 'jenis_usaha' });
      }
    }
  }

  ensureCoreFields(fields);
  if (!fieldRows.some((f) => f.key === 'keperluan') && fields.some((f) => f.key === 'keperluan')) {
    fieldRows.push({ key: 'keperluan', label: 'Keperluan surat' });
  }
  if (fieldRows.length === 0) {
    warnings.push('Tidak menemukan baris Nama/NIK di dokumen; memakai field default.');
    for (const f of fields) fieldRows.push({ key: f.key, label: f.label });
  }

  for (const f of fields) {
    if (f.key === 'kewarganegaraan' && !samples.some((s) => s.key === f.key)) {
      samples.push({ value: 'Indonesia', key: 'kewarganegaraan' });
    }
  }

  let bodyParas = bodyRaw
    .filter((p, i, arr) => arr.indexOf(p) === i)
    .slice(0, 6)
    .map((p) => replaceSampleValues(p, samples));

  bodyParas = bodyParas.map((p) => {
    let s = p;
    if (/keperluan/i.test(s) && !/\{\{keperluan\}\}/.test(s)) {
      s = s.replace(/keperluan\s*:?\s*[^.<]{3,80}/i, 'keperluan: <strong>{{keperluan}}</strong>');
    }
    if (/di bidang/i.test(s) && !/\{\{jenis_usaha\}\}/.test(s)) {
      s = s.replace(/di bidang\s*:?\s*[^.<]{3,80}/i, 'di bidang: <strong>{{jenis_usaha}}</strong>');
    }
    return s;
  });

  if (bodyParas.length === 0) {
    bodyParas = [
      'Adalah benar warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi. Surat ini dibuat untuk keperluan: <strong>{{keperluan}}</strong>.',
      'Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.',
    ];
    warnings.push('Paragraf isi surat digenerate default karena teks narasi tidak terdeteksi.');
  } else if (!bodyParas.some((p) => /demikian/i.test(p))) {
    bodyParas.push(
      'Demikian surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.'
    );
  }

  const title =
    meta.nama
      .replace(/^surat\s*-?\s*/i, 'SURAT ')
      .toUpperCase()
      .replace(/\s+/g, ' ')
      .trim() || 'SURAT KETERANGAN';

  const template_html = buildTemplate({
    title,
    intro,
    fieldRows: fieldRows.filter((r) => r.key !== 'keperluan' || fieldRows.length <= 3),
    bodyParas,
  });

  if (!fields.some((f) => f.key === 'jenis_usaha') && /usaha/i.test(meta.nama)) {
    fields.push({ key: 'jenis_usaha', label: 'Jenis / bidang usaha', type: 'text', required: true });
  }
  if (/umum|keterangan\s*$/i.test(meta.nama) && !fields.some((f) => f.key === 'keterangan')) {
    fields.push({
      key: 'keterangan',
      label: 'Isi keterangan (mis. status, fakta yang diterangkan)',
      type: 'textarea',
      required: true,
    });
  }

  return {
    nama: meta.nama,
    deskripsi: meta.deskripsi,
    syarat: meta.syarat,
    fields,
    template_html,
    warnings,
  };
}

export function officialSuratTemplate(
  kind: 'skck' | 'domisili' | 'tidak-mampu' | 'umum' | 'usaha'
): DocxImportResult {
  const baseIdentity: FormField[] = [
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

  const specs: Record<typeof kind, DocxImportResult> = {
    skck: {
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
      template_html: '',
      warnings: [],
    },
    domisili: {
      nama: 'Surat Keterangan Domisili',
      deskripsi: 'Surat keterangan bahwa pemohon berdomisili di Desa Citarik.',
      syarat: 'Fotokopi KTP dan KK; pengantar RT setempat bila diminta.',
      fields: [...baseIdentity, { key: 'keperluan', label: 'Keperluan surat', type: 'text', required: false }],
      template_html: '',
      warnings: [],
    },
    'tidak-mampu': {
      nama: 'Surat Keterangan Tidak Mampu',
      deskripsi: 'Surat keterangan status ekonomi untuk bantuan, beasiswa, atau layanan sosial.',
      syarat: 'Fotokopi KTP dan KK; pengantar RT/RW setempat.',
      fields: [...baseIdentity, { key: 'keperluan', label: 'Keperluan / tujuan surat', type: 'text', required: true }],
      template_html: '',
      warnings: [],
    },
    umum: {
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
      template_html: '',
      warnings: [],
    },
    usaha: {
      nama: 'Surat Keterangan Usaha',
      deskripsi: 'Surat keterangan bahwa pemohon memiliki usaha di wilayah Desa Citarik.',
      syarat: 'Fotokopi KTP; sebutkan jenis usaha dengan jelas; pengantar RT/RW bila diminta.',
      fields: [
        ...baseIdentity,
        { key: 'jenis_usaha', label: 'Jenis / bidang usaha', type: 'text', required: true },
        { key: 'keperluan', label: 'Keperluan surat', type: 'text', required: true },
      ],
      template_html: '',
      warnings: [],
    },
  };

  const spec = specs[kind];
  const title = spec.nama.toUpperCase();
  const identityKeys = [
    'nama',
    'jenis_kelamin',
    'nik',
    'ttl',
    'agama',
    'kewarganegaraan',
    'status_perkawinan',
    'pekerjaan',
    'alamat',
  ] as const;
  const rows = spec.fields
    .filter((f) => (identityKeys as readonly string[]).includes(f.key))
    .map((f) => ({ key: f.key, label: f.label }));

  const bodies: Record<typeof kind, string[]> = {
    skck: [
      'Adalah Warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi yang memohon Surat Keterangan Catatan Kepolisian untuk Keperluan: <strong>{{keperluan}}</strong>.',
      'Keterangan ini kami berikan untuk melengkapi persyaratan pembuatan SKCK di Kantor Kepolisian atas dasar sepengetahuan serta pertimbangan bahwa nama tersebut benar Warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi dan pada saat ini berkelakuan baik.',
      'Demikian surat keterangan ini kami buat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.',
    ],
    domisili: [
      'Berdasarkan Laporan Ketua RT Setempat bahwa nama tersebut di atas saat ini benar berdomisili seperti yang tercantum di atas, dan keterangan ini kami berikan sebagai bukti identitas diri dari yang bersangkutan.',
      'Demikian Surat keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.',
    ],
    'tidak-mampu': [
      'Adalah warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi, menerangkan bahwa berdasarkan Surat Pengantar Dari RT/RW Setempat bahwa nama tersebut di atas benar-benar keluarga tidak mampu.',
      'Keterangan ini kami berikan untuk melengkapi persyaratan: <strong>{{keperluan}}</strong>.',
      'Demikian surat keterangan tidak mampu ini dibuat untuk dapat dipergunakan sebagaimana mestinya.',
    ],
    umum: [
      'Adalah warga Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi. Dengan ini menerangkan bahwa nama tersebut: <strong>{{keterangan}}</strong>.',
      'Demikian keterangan ini kami buat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.',
    ],
    usaha: [
      'Berdasarkan Berita Acara Survey Lapangan dan Verifikasi dari Kasi Pemerintahan serta Pengantar dari RT/RW Setempat bahwa nama tersebut di atas mempunyai usaha di wilayah Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi di bidang: <strong>{{jenis_usaha}}</strong>.',
      'Keterangan ini kami berikan untuk: <strong>{{keperluan}}</strong>.',
      'Demikian keterangan ini dibuat dengan sebenarnya untuk dipergunakan sebagaimana mestinya.',
    ],
  };

  spec.template_html = buildTemplate({
    title,
    intro:
      'Kepala Desa Citarik Kecamatan Palabuhanratu Kabupaten Sukabumi, dengan ini menerangkan bahwa:',
    fieldRows: rows,
    bodyParas: bodies[kind],
  });
  return spec;
}
