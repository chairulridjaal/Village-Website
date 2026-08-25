/**
 * Upload official surat DOCX + PDF WASM converter into R2.
 * Usage:
 *   node scripts/seed-surat-templates-r2.mjs --local
 *   node scripts/seed-surat-templates-r2.mjs --remote
 */
import { spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const remote = process.argv.includes('--remote');
const local = process.argv.includes('--local') || !remote;
const locFlag = remote ? '--remote' : '--local';
const bucket = 'web-desa-citarik-media';

const files = [
  ['public/templates/surat/surat-keterangan-domisili.docx', 'media/templates/seed/surat-keterangan-domisili.docx'],
  ['public/templates/surat/surat-keterangan-pengantar-skck.docx', 'media/templates/seed/surat-keterangan-pengantar-skck.docx'],
  ['public/templates/surat/surat-keterangan-tidak-mampu.docx', 'media/templates/seed/surat-keterangan-tidak-mampu.docx'],
  ['public/templates/surat/surat-keterangan-umum.docx', 'media/templates/seed/surat-keterangan-umum.docx'],
  ['public/templates/surat/surat-keterangan-usaha.docx', 'media/templates/seed/surat-keterangan-usaha.docx'],
  ['public/wasm/docx-to-pdf.wasm', 'media/templates/seed/docx-to-pdf.wasm'],
];

function put(srcRel, key, contentType) {
  const src = join(root, srcRel);
  if (!existsSync(src)) {
    console.error('MISSING', src);
    process.exit(1);
  }
  console.log('PUT', key, locFlag);
  const r = spawnSync(
    'npx',
    [
      'wrangler',
      'r2',
      'object',
      'put',
      `${bucket}/${key}`,
      `--file=${src}`,
      `--content-type=${contentType}`,
      locFlag,
    ],
    { cwd: root, shell: true, stdio: 'inherit' }
  );
  if (r.status !== 0) process.exit(r.status ?? 1);
}

for (const [src, key] of files) {
  const ct = key.endsWith('.wasm')
    ? 'application/wasm'
    : 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  put(src, key, ct);
}

console.log('Done.', local && !remote ? '(local)' : '(remote)');
