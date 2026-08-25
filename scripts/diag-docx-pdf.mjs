import { readFile, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import PizZip from 'pizzip';
import { convertToPdf, convertToHtml } from 'docx-to-pdf-wasm';

const require = createRequire(import.meta.url);
const root = 'C:/Users/Chairulridjal/Village-Website';
const out = 'C:/Users/CHAIRU~1/AppData/Local/Temp/opencode';

const wasmModule = await WebAssembly.compile(
  await readFile(require.resolve('docx-to-pdf-wasm/wasm'))
);

const seed = await readFile(
  `${root}/public/templates/surat/surat-keterangan-pengantar-skck.docx`
);
const z = new PizZip(seed);
const hdr = z.file('word/header1.xml')?.asText() || '';
const hrels = z.file('word/_rels/header1.xml.rels')?.asText() || '';
console.log('=== HEADER1 (first 2000) ===');
console.log(hdr.slice(0, 2000));
console.log('=== HEADER RELS ===');
console.log(hrels);

const filledPath = `${out}/skck-filled.docx`;
let filled;
try {
  filled = await readFile(filledPath);
  console.log('using filled', filled.length);
} catch {
  filled = seed;
  console.log('using seed');
}

const fz = new PizZip(filled);
console.log(
  'filled media',
  Object.keys(fz.files).filter((n) => n.startsWith('word/media/'))
);
console.log(
  'filled headers',
  Object.keys(fz.files).filter((n) => /header|footer/i.test(n))
);

const fhtml = await convertToHtml(wasmModule, new Uint8Array(filled));
const fpdf = await convertToPdf(wasmModule, new Uint8Array(filled));
await writeFile(`${out}/skck-filled-out.html`, fhtml);
await writeFile(`${out}/skck-filled-out.pdf`, fpdf);
const t = fhtml
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
console.log('filled html imgs', (fhtml.match(/<img/g) || []).length, 'pdf', fpdf.length);
console.log('filled text 700:', t.slice(0, 700));

function minimalDocxWithImage(pngBytes) {
  const zip = new PizZip();
  zip.file(
    '[Content_Types].xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="png" ContentType="image/png"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`
  );
  zip.file(
    '_rels/.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`
  );
  zip.file(
    'word/_rels/document.xml.rels',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/image1.png"/>
</Relationships>`
  );
  const cx = Math.round((500 / 96) * 914400);
  const cy = Math.round((120 / 96) * 914400);
  zip.file(
    'word/document.xml',
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main" xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
  <w:body>
    <w:p>
      <w:r>
        <w:drawing>
          <wp:inline distT="0" distB="0" distL="0" distR="0">
            <wp:extent cx="${cx}" cy="${cy}"/>
            <wp:docPr id="1" name="Picture 1"/>
            <a:graphic>
              <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                <pic:pic>
                  <pic:nvPicPr><pic:cNvPr id="0" name="image1.png"/><pic:cNvPicPr/></pic:nvPicPr>
                  <pic:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
                  <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr>
                </pic:pic>
              </a:graphicData>
            </a:graphic>
          </wp:inline>
        </w:drawing>
      </w:r>
    </w:p>
    <w:p><w:r><w:t>BODY TEXT AFTER IMAGE - PEMERINTAH KABUPATEN SUKABUMI</w:t></w:r></w:p>
    <w:sectPr><w:pgSz w:w="12240" w:h="20160"/><w:pgMar w:top="720" w:right="1440" w:bottom="720" w:left="1440"/></w:sectPr>
  </w:body>
</w:document>`
  );
  zip.file('word/media/image1.png', pngBytes);
  return zip.generate({ type: 'uint8array' });
}

const png = z.file('word/media/image1.png').asUint8Array();
const mini = minimalDocxWithImage(png);
const miniHtml = await convertToHtml(wasmModule, mini);
const miniPdf = await convertToPdf(wasmModule, mini);
await writeFile(`${out}/mini-body-img.html`, miniHtml);
await writeFile(`${out}/mini-body-img.pdf`, miniPdf);
console.log('=== BODY IMAGE TEST ===');
console.log({
  miniHtmlLen: miniHtml.length,
  miniPdfLen: miniPdf.length,
  imgs: (miniHtml.match(/<img/g) || []).length,
  hasDataUri: /data:image/.test(miniHtml),
  pdfBigger: miniPdf.length > 5000,
});
const miniText = miniHtml
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/src="data:[^"]+"/g, 'src=DATA')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();
console.log('mini text:', miniText.slice(0, 400));

// Move header image into body of seed and re-convert (workaround probe)
function promoteHeaderImageToBody(docxBytes) {
  const zip = new PizZip(docxBytes);
  const header = zip.file('word/header1.xml')?.asText();
  const doc = zip.file('word/document.xml')?.asText();
  if (!header || !doc) return null;

  // Extract first drawing block from header if present
  const drawMatch = header.match(/<w:drawing>[\s\S]*?<\/w:drawing>/);
  const pictMatch = header.match(/<w:pict>[\s\S]*?<\/w:pict>/);
  const block = drawMatch?.[0] || pictMatch?.[0];
  if (!block) {
    console.log('no drawing/pict in header');
    // dump what header contains
    console.log('header tags sample', [...header.matchAll(/<\/?w:[a-zA-Z]+/g)].slice(0, 40).map((m) => m[0]));
    return null;
  }

  // Ensure document rels has image
  let docRels = zip.file('word/_rels/document.xml.rels')?.asText() || '';
  const hrels = zip.file('word/_rels/header1.xml.rels')?.asText() || '';
  const imgRel = hrels.match(/Relationship[^>]+Target="media\/[^"]+"[^/]*\/>/);
  console.log('header image rel', imgRel?.[0]);

  if (imgRel && !/Target="media\//.test(docRels)) {
    const idMatch = imgRel[0].match(/Id="(rId\d+)"/);
    const targetMatch = imgRel[0].match(/Target="([^"]+)"/);
    const rid = idMatch?.[1] || 'rId99';
    const target = targetMatch?.[1] || 'media/image1.png';
    if (!docRels.includes(target)) {
      docRels = docRels.replace(
        '</Relationships>',
        `  <Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${target}"/>\n</Relationships>`
      );
      zip.file('word/_rels/document.xml.rels', docRels);
    }
    // rewrite embed id in block if needed — keep as-is if same rId
  }

  const injected = doc.replace(
    /<w:body[^>]*>/,
    (m) => `${m}<w:p><w:r>${block}</w:r></w:p>`
  );
  zip.file('word/document.xml', injected);
  return zip.generate({ type: 'uint8array' });
}

const promoted = promoteHeaderImageToBody(seed);
if (promoted) {
  const pHtml = await convertToHtml(wasmModule, promoted);
  const pPdf = await convertToPdf(wasmModule, promoted);
  await writeFile(`${out}/skck-promoted.html`, pHtml);
  await writeFile(`${out}/skck-promoted.pdf`, pPdf);
  console.log('=== PROMOTED HEADER→BODY ===');
  console.log({
    imgs: (pHtml.match(/<img/g) || []).length,
    hasData: /data:image/.test(pHtml),
    pdfLen: pPdf.length,
  });
}
