import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
import { formatTanggalId, parseData, type PengajuanWithJenis } from '../db/pelayanan';

const DATE_KEY_RE = /tanggal|tgl_|_tgl$|^ttl$/i;
const ISO_DATE_RE = /^(\d{4})-(\d{2})-(\d{2})$/;
const SLASH_DATE_RE = /^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{2,4})$/;

const EMPTY_NOMOR_GAP = '       ';

const MONTHS_ID = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

export function formatTanggalSurat(raw: string | null | undefined): string {
  if (raw == null) return '';
  const s = String(raw).trim();
  if (!s) return '';

  const iso = s.match(ISO_DATE_RE);
  if (iso) {
    const y = Number(iso[1]);
    const m = Number(iso[2]);
    const d = Number(iso[3]);
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${d} ${MONTHS_ID[m - 1]} ${y}`;
    }
  }

  const slash = s.match(SLASH_DATE_RE);
  if (slash) {
    let d = Number(slash[1]);
    let m = Number(slash[2]);
    let y = Number(slash[3]);
    if (y < 100) y += 2000;
    if (m > 12 && d <= 12) {
      const t = d;
      d = m;
      m = t;
    }
    if (m >= 1 && m <= 12 && d >= 1 && d <= 31) {
      return `${d} ${MONTHS_ID[m - 1]} ${y}`;
    }
  }

  if (/[A-Za-z]/.test(s) && !ISO_DATE_RE.test(s)) return s;

  const t = Date.parse(s);
  if (!Number.isNaN(t)) {
    return formatTanggalId(new Date(t).toISOString());
  }
  return s;
}

function formatValueForKey(key: string, value: string): string {
  const v = value == null ? '' : String(value).trim();
  if (!v) {
    if (key === 'nomor_surat' || key === 'nomor') return EMPTY_NOMOR_GAP;
    return '';
  }
  if (DATE_KEY_RE.test(key) || key === 'tanggal' || key === 'tanggal_terbit' || key === 'tanggal_lahir') {
    return formatTanggalSurat(v);
  }
  return v;
}

function mapFormatted(obj: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(obj)) {
    out[k] = formatValueForKey(k, v ?? '');
  }
  return out;
}

export function buildSuratVars(
  pengajuan: PengajuanWithJenis,
  extraAdmin?: Record<string, string>
): Record<string, string> {
  const data = mapFormatted(parseData(pengajuan.data_json));
  const adminRaw = {
    ...parseData(pengajuan.admin_data_json || '{}'),
    ...(extraAdmin ?? {}),
  };
  const admin = mapFormatted(adminRaw);

  const nomorRaw = (adminRaw.nomor_surat ?? '').trim();
  const nomorSurat = nomorRaw || EMPTY_NOMOR_GAP;

  const tanggalTerbit = (adminRaw.tanggal_terbit ?? '').trim()
    ? formatTanggalSurat(adminRaw.tanggal_terbit)
    : '';
  const tanggalGeneric = (adminRaw.tanggal ?? '').trim()
    ? formatTanggalSurat(adminRaw.tanggal)
    : tanggalTerbit;

  return {
    ...data,
    ...admin,
    nomor_surat: nomorSurat,
    nomor: nomorSurat,
    tanggal_terbit: tanggalTerbit,
    tanggal: tanggalGeneric,
    jenis_surat: pengajuan.jenis_nama,
    desa: 'Desa Citarik',
    nama: data.nama || pengajuan.pemohon_nama || '',
    nik: data.nik || pengajuan.pemohon_nik || '',
  };
}

function renderWithDelimiters(
  zip: PizZip,
  data: Record<string, string>,
  start: string,
  end: string
): PizZip {
  const doc = new Docxtemplater(zip, {
    paragraphLoop: true,
    linebreaks: true,
    delimiters: { start, end },
    nullGetter: () => '',
  });
  doc.render(data);
  return doc.getZip();
}

export function fillDocxTemplate(
  templateBytes: ArrayBuffer | Uint8Array,
  data: Record<string, string>
): Uint8Array {
  let zip = new PizZip(templateBytes);
  try {
    zip = renderWithDelimiters(zip, data, '{', '}');
  } catch (e) {
    console.error('fill { } failed', e);
    throw e;
  }
  try {
    zip = renderWithDelimiters(zip, data, '$$', '$$');
  } catch {
    /* ignore */
  }
  try {
    zip = renderWithDelimiters(zip, data, '%%', '%%');
  } catch {
    /* ignore */
  }
  const out = zip.generate({
    type: 'uint8array',
    compression: 'DEFLATE',
  });
  return out as Uint8Array;
}

export function isR2TemplatePath(path: string | null | undefined): boolean {
  if (!path) return false;
  return path.startsWith('media/templates/') || path.startsWith('r2:');
}

export function normalizeTemplatePath(path: string): string {
  if (path.startsWith('r2:')) return path.slice(3);
  return path;
}

export function safeDocxFilename(nomor: string, jenisNama: string): string {
  return safeDownloadFilename(nomor, jenisNama, 'docx');
}

export function safeDownloadFilename(
  nomor: string,
  jenisNama: string,
  ext: 'docx' | 'pdf'
): string {
  const base = `${nomor}-${jenisNama}`
    .replace(/[^\w.\- ()\u00C0-\u024F]+/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);
  return `${base || 'surat'}.${ext}`;
}
