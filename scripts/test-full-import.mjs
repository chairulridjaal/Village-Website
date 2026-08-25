import { readFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

// Bundle-free smoke: dynamic import of TS not available; call via built worker is heavy.
// Instead re-run extract + minimal field detection mirroring import flow.

import JSZip from 'jszip';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function decodeXmlEntities(s) {
  return s
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'");
}

function textFromXmlFragment(xml) {
  const parts = [];
  const re = /<(?:w:)?t(?:\s[^>]*)?>([^<]*)<\/(?:w:)?t>|<(?:w:)?tab\s*\/>|<(?:w:)?br\s*\/>|<(?:w:)?cr\s*\/>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    if (m[1] != null) parts.push(decodeXmlEntities(m[1]));
    else if (/tab/i.test(m[0])) parts.push('\t');
    else parts.push(' ');
  }
  return parts.join('').replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim();
}

function extractLines(docXml) {
  const bodyMatch = docXml.match(/<(?:w:)?body\b[^>]*>([\s\S]*)<\/(?:w:)?body>/i);
  const body = bodyMatch?.[1] ?? docXml;
  const lines = [];
  const blockRe = /<(?:w:)?(p|tbl)\b[^>]*>([\s\S]*?)<\/(?:w:)?\1>/gi;
  let block;
  while ((block = blockRe.exec(body)) !== null) {
    const kind = block[1].toLowerCase();
    const inner = block[2];
    if (kind === 'p') {
      const t = textFromXmlFragment(inner).replace(/[=]{3,}/g, ' ').replace(/\s+/g, ' ').trim();
      if (t) lines.push(t);
    } else {
      const rowRe = /<(?:w:)?tr\b[^>]*>([\s\S]*?)<\/(?:w:)?tr>/gi;
      let row;
      while ((row = rowRe.exec(inner)) !== null) {
        const cells = [];
        const cellRe = /<(?:w:)?tc\b[^>]*>([\s\S]*?)<\/(?:w:)?tc>/gi;
        let cell;
        while ((cell = cellRe.exec(row[1])) !== null) {
          const paras = [];
          const pRe = /<(?:w:)?p\b[^>]*>([\s\S]*?)<\/(?:w:)?p>/gi;
          let p;
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

function parseLabeled(line) {
  const m = line.match(/^-?\s*([^:]{2,40}?)\s*:\s*(.*)$/);
  if (!m) return null;
  if (/^nomor$/i.test(m[1].trim())) return null;
  return { label: m[1].trim(), value: m[2].trim() };
}

const files = [
  'SURAT KETERANGAN DOMISILI.docx',
  'SURAT KETERANGAN USAHA.docx',
  'SURAT KETERANGAN CATATAN KEPOLISIAN.docx',
  'SURAT KETERANGAN TIDAK MAMPU.docx',
  'SURAT KETERANGAN UMUM.docx',
];

let ok = true;
for (const name of files) {
  const buf = readFileSync(join(root, name));
  const zip = await JSZip.loadAsync(buf);
  const docXml = await zip.file('word/document.xml').async('string');
  const lines = extractLines(docXml);
  const labels = lines.map(parseLabeled).filter(Boolean);
  const hasNama = labels.some((l) => /nama/i.test(l.label));
  const hasNik = labels.some((l) => /nik/i.test(l.label));
  console.log(name, 'labels:', labels.length, 'nama:', hasNama, 'nik:', hasNik);
  if (!hasNama || !hasNik) ok = false;
}
process.exit(ok ? 0 : 1);
