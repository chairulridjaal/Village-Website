import JSZip from 'jszip';
import type { FieldType, FormField } from '../db/pelayanan';

export type FieldSource = 'warga' | 'admin';

export interface MarkerField extends FormField {
  source: FieldSource;
}

export interface MarkerParseResult {
  wargaFields: FormField[];
  adminFields: FormField[];
  allKeys: string[];
  titleHint: string;
  warnings: string[];
}

const WARGA_RE = /\$\$([a-zA-Z][a-zA-Z0-9_]*)\$\$/g;
const ADMIN_RE = /%%([a-zA-Z][a-zA-Z0-9_]*)%%/g;

const KEY_META: Record<
  string,
  { label: string; type: FieldType; options?: string[]; required?: boolean }
> = {
  nama: { label: 'Nama lengkap', type: 'text', required: true },
  nama_lengkap: { label: 'Nama lengkap', type: 'text', required: true },
  nik: { label: 'NIK', type: 'text', required: true },
  jenis_kelamin: {
    label: 'Jenis kelamin',
    type: 'select',
    required: true,
    options: ['Laki-laki', 'Perempuan'],
  },
  tempat_lahir: { label: 'Tempat lahir', type: 'text', required: true },
  tanggal_lahir: { label: 'Tanggal lahir', type: 'date', required: true },
  ttl: { label: 'Tempat / tanggal lahir', type: 'text', required: true },
  agama: { label: 'Agama', type: 'text', required: true },
  kewarganegaraan: { label: 'Kewarganegaraan', type: 'text', required: true },
  status_kawin: {
    label: 'Status perkawinan',
    type: 'select',
    required: true,
    options: ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'],
  },
  status_perkawinan: {
    label: 'Status perkawinan',
    type: 'select',
    required: true,
    options: ['Belum Kawin', 'Kawin', 'Cerai Hidup', 'Cerai Mati'],
  },
  pekerjaan: { label: 'Pekerjaan', type: 'text', required: true },
  alamat: { label: 'Alamat lengkap', type: 'textarea', required: true },
  keperluan: { label: 'Keperluan surat', type: 'text', required: true },
  jenis_usaha: { label: 'Jenis / bidang usaha', type: 'text', required: true },
  nama_usaha: { label: 'Nama usaha', type: 'text', required: true },
  alamat_usaha: { label: 'Alamat usaha', type: 'textarea', required: true },
  keterangan: { label: 'Isi keterangan', type: 'textarea', required: true },
  nomor_surat: { label: 'Nomor surat', type: 'text', required: false },
  tanggal_terbit: { label: 'Tanggal terbit', type: 'date', required: false },
  tanggal: { label: 'Tanggal', type: 'date', required: false },
  pejabat: { label: 'Nama pejabat penandatangan', type: 'text', required: false },
  jabatan_ttd: { label: 'Jabatan penandatangan', type: 'text', required: false },
};

export function normalizeMarkerKey(raw: string): string {
  const k = raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_|_$/g, '');
  if (k === 'nik' || k === 'no_nik' || k === 'nomor_nik') return 'nik';
  if (k === 'status_kawin') return 'status_perkawinan';
  if (k === 'nama_lengkap') return 'nama';
  return k || 'field';
}

function humanLabel(key: string): string {
  const meta = KEY_META[key];
  if (meta) return meta.label;
  return key
    .split('_')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

function fieldFromKey(key: string, source: FieldSource): FormField {
  const meta = KEY_META[key];
  const field: FormField = {
    key,
    label: humanLabel(key),
    type: meta?.type ?? (key.includes('alamat') || key.includes('keterangan') ? 'textarea' : 'text'),
    required: source === 'warga' ? (meta?.required ?? true) : false,
  };
  if (meta?.options) field.options = meta.options;
  return field;
}

function extractPlainFromDocXml(xml: string): string {
  const parts: string[] = [];
  const re = /<(?:w:)?t(?:\s[^>]*)?>([^<]*)<\/(?:w:)?t>/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(xml)) !== null) {
    parts.push(
      m[1]
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
    );
  }
  return parts.join('');
}

function uniqueKeys(keys: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const k of keys) {
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(k);
  }
  return out;
}

export function parseMarkersFromPlain(plain: string): MarkerParseResult {
  const warnings: string[] = [];
  const wargaRaw: string[] = [];
  const adminRaw: string[] = [];

  for (const m of plain.matchAll(WARGA_RE)) wargaRaw.push(normalizeMarkerKey(m[1]));
  for (const m of plain.matchAll(ADMIN_RE)) adminRaw.push(normalizeMarkerKey(m[1]));

  const wargaKeys = uniqueKeys(wargaRaw);
  const adminKeys = uniqueKeys(adminRaw);

  if (wargaKeys.length === 0 && adminKeys.length === 0) {
    warnings.push(
      'Tidak menemukan placeholder $$nama$$ (warga) atau %%nomor_surat%% (admin). Tambahkan di file Word lalu unggah ulang.'
    );
  }

  let titleHint = 'Surat Keterangan';
  const titleMatch = plain.match(/SURAT\s+KETERANGAN[^\n]{0,60}/i);
  if (titleMatch) titleHint = titleMatch[0].replace(/\s+/g, ' ').trim();

  return {
    wargaFields: wargaKeys.map((k) => fieldFromKey(k, 'warga')),
    adminFields: adminKeys.map((k) => fieldFromKey(k, 'admin')),
    allKeys: uniqueKeys([...wargaKeys, ...adminKeys]),
    titleHint,
    warnings,
  };
}

export async function parseMarkersFromDocx(
  input: ArrayBuffer | Uint8Array
): Promise<MarkerParseResult> {
  const zip = await JSZip.loadAsync(input);
  const docFile = zip.file('word/document.xml');
  if (!docFile) throw new Error('File Word tidak valid (document.xml tidak ada).');
  const xml = await docFile.async('string');
  const plain = extractPlainFromDocXml(xml);
  const result = parseMarkersFromPlain(plain);

  for (const name of ['word/header1.xml', 'word/footer1.xml', 'word/header2.xml', 'word/footer2.xml']) {
    const f = zip.file(name);
    if (!f) continue;
    const extra = parseMarkersFromPlain(extractPlainFromDocXml(await f.async('string')));
    const wargaKeys = new Set(result.wargaFields.map((x) => x.key));
    const adminKeys = new Set(result.adminFields.map((x) => x.key));
    for (const f2 of extra.wargaFields) {
      if (!wargaKeys.has(f2.key)) {
        result.wargaFields.push(f2);
        wargaKeys.add(f2.key);
      }
    }
    for (const f2 of extra.adminFields) {
      if (!adminKeys.has(f2.key)) {
        result.adminFields.push(f2);
        adminKeys.add(f2.key);
      }
    }
  }

  return result;
}

function decodeXmlText(s: string): string {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function encodeXmlText(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function normalizeMarkersInXml(xml: string): string {
  const tRe = /(<(?:w:)?t(?:\s[^>]*)?>)([^<]*)(<\/(?:w:)?t>)/g;
  const parts: Array<{ fullStart: number; fullEnd: number; open: string; text: string; close: string }> = [];
  let m: RegExpExecArray | null;
  while ((m = tRe.exec(xml)) !== null) {
    parts.push({
      fullStart: m.index,
      fullEnd: m.index + m[0].length,
      open: m[1],
      text: decodeXmlText(m[2]),
      close: m[3],
    });
  }
  if (parts.length === 0) {
    return xml
      .replace(/\$\$([a-zA-Z][a-zA-Z0-9_]*)\$\$/g, (_, raw: string) => `{${normalizeMarkerKey(raw)}}`)
      .replace(/%%([a-zA-Z][a-zA-Z0-9_]*)%%/g, (_, raw: string) => `{${normalizeMarkerKey(raw)}}`);
  }

  const joined = parts.map((p) => p.text).join('');
  type Hit = { start: number; end: number; repl: string };
  const hits: Hit[] = [];
  for (const mm of joined.matchAll(/\$\$([a-zA-Z][a-zA-Z0-9_]*)\$\$/g)) {
    hits.push({
      start: mm.index!,
      end: mm.index! + mm[0].length,
      repl: `{${normalizeMarkerKey(mm[1])}}`,
    });
  }
  for (const mm of joined.matchAll(/%%([a-zA-Z][a-zA-Z0-9_]*)%%/g)) {
    hits.push({
      start: mm.index!,
      end: mm.index! + mm[0].length,
      repl: `{${normalizeMarkerKey(mm[1])}}`,
    });
  }
  if (hits.length === 0) return xml;
  hits.sort((a, b) => b.start - a.start);

  const texts = parts.map((p) => p.text);
  const ranges: Array<{ start: number; end: number; i: number }> = [];
  let pos = 0;
  for (let i = 0; i < texts.length; i++) {
    ranges.push({ start: pos, end: pos + texts[i].length, i });
    pos += texts[i].length;
  }

  for (const hit of hits) {
    let first = -1;
    let last = -1;
    for (const r of ranges) {
      if (hit.start >= r.start && hit.start < r.end) first = r.i;
      if (hit.end > r.start && hit.end <= r.end) last = r.i;
      if (hit.end > r.start && hit.end < r.end) last = r.i;
    }
    if (first < 0 || last < 0) continue;
    const firstStart = ranges[first].start;
    const lastStart = ranges[last].start;
    const prefix = texts[first].slice(0, hit.start - firstStart);
    const suffix = texts[last].slice(hit.end - lastStart);
    texts[first] = prefix + hit.repl + (first === last ? suffix : '');
    if (first !== last) {
      for (let i = first + 1; i < last; i++) texts[i] = '';
      texts[last] = suffix;
    }
  }

  let out = '';
  let lastIdx = 0;
  for (let i = 0; i < parts.length; i++) {
    const p = parts[i];
    out += xml.slice(lastIdx, p.fullStart);
    out += p.open + encodeXmlText(texts[i]) + p.close;
    lastIdx = p.fullEnd;
  }
  out += xml.slice(lastIdx);
  return out;
}

export async function normalizeDocxMarkers(
  input: ArrayBuffer | Uint8Array
): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(input);
  const targets = [
    'word/document.xml',
    'word/header1.xml',
    'word/header2.xml',
    'word/footer1.xml',
    'word/footer2.xml',
  ];
  for (const name of targets) {
    const f = zip.file(name);
    if (!f) continue;
    const xml = await f.async('string');
    zip.file(name, normalizeMarkersInXml(xml));
  }
  const out = await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
  return out;
}
