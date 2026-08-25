import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { convertToPdf, convertToHtml } from 'docx-to-pdf-wasm';
import { prepareDocxForWasmPdf } from '../src/lib/pelayanan/docx-prepare-pdf.ts';
import { fillDocxTemplate } from '../src/lib/pelayanan/docx-fill.ts';

const require = createRequire(import.meta.url);
const wasmModule = await WebAssembly.compile(
  await readFile(require.resolve('docx-to-pdf-wasm/wasm'))
);
const out = 'C:/Users/CHAIRU~1/AppData/Local/Temp/opencode';

const seed = await readFile(
  'public/templates/surat/surat-keterangan-pengantar-skck.docx'
);
const vars = {
  nomor_surat: '001',
  nama: 'Budi Santoso',
  jenis_kelamin: 'Laki-laki',
  nik: '3201010101010001',
  tempat_lahir: 'Sukabumi',
  tanggal_lahir: '1 Januari 1990',
  kewarganegaraan: 'Indonesia',
  agama: 'Islam',
  status_perkawinan: 'Kawin',
  pekerjaan: 'Swasta',
  alamat: 'Kp. Contoh RT 01/01',
  keperluan: 'Melamar pekerjaan',
};
const filled = fillDocxTemplate(seed, vars);
const prepared = prepareDocxForWasmPdf(filled);
const html = await convertToHtml(wasmModule, prepared);
const pdf = await convertToPdf(wasmModule, prepared);
await writeFile(`${out}/skck-prepared.html`, html);
await writeFile(`${out}/skck-prepared.pdf`, pdf);
const text = html
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
console.log(
  JSON.stringify(
    {
      filled: filled.length,
      prepared: prepared.length,
      pdf: pdf.length,
      imgs: (html.match(/<img/g) || []).length,
      hasDataUri: /data:image/.test(html),
      hasPemerintah: /PEMERINTAH/i.test(text),
      hasBudi: /Budi/.test(text),
      textHead: text.slice(0, 400),
    },
    null,
    2
  )
);
