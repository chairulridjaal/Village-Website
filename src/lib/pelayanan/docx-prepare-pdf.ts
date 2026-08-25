import PizZip from 'pizzip';

const NS = {
  w: 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
  r: 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
  wp: 'http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing',
  a: 'http://schemas.openxmlformats.org/drawingml/2006/main',
  pic: 'http://schemas.openxmlformats.org/drawingml/2006/picture',
};

function nextRelId(relsXml: string): string {
  let max = 0;
  for (const m of relsXml.matchAll(/\bId="rId(\d+)"/g)) {
    max = Math.max(max, Number(m[1]));
  }
  return `rId${max + 1}`;
}

function ensureImageRel(relsXml: string, target: string): { xml: string; rid: string } {
  const norm = target.replace(/^\.\//, '');
  const existing = relsXml.match(
    new RegExp(
      `<Relationship[^>]*Type="[^"]*/image"[^>]*Target="${norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^/]*/>`
    )
  );
  if (existing) {
    const id = existing[0].match(/\bId="(rId\d+)"/)?.[1];
    if (id) return { xml: relsXml, rid: id };
  }
  const byTarget = relsXml.match(
    new RegExp(`<Relationship[^>]*Target="${norm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}"[^/]*/>`)
  );
  if (byTarget?.[0].includes('/image"')) {
    const id = byTarget[0].match(/\bId="(rId\d+)"/)?.[1];
    if (id) return { xml: relsXml, rid: id };
  }
  const rid = nextRelId(relsXml);
  const rel = `<Relationship Id="${rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="${norm}"/>`;
  const xml = relsXml.includes('</Relationships>')
    ? relsXml.replace('</Relationships>', `${rel}</Relationships>`)
    : `${relsXml}${rel}`;
  return { xml, rid };
}

function parsePtSize(style: string): { cx: number; cy: number } | null {
  const w = style.match(/width:\s*([\d.]+)pt/i);
  const h = style.match(/height:\s*([\d.]+)pt/i);
  if (!w || !h) return null;
  const cx = Math.round(Number(w[1]) * 12700);
  const cy = Math.round(Number(h[1]) * 12700);
  if (!Number.isFinite(cx) || !Number.isFinite(cy) || cx <= 0 || cy <= 0) return null;
  return { cx, cy };
}

function drawingInline(rid: string, cx: number, cy: number, name = 'Kop'): string {
  return `<w:p xmlns:w="${NS.w}" xmlns:r="${NS.r}" xmlns:wp="${NS.wp}" xmlns:a="${NS.a}" xmlns:pic="${NS.pic}"><w:pPr><w:jc w:val="center"/></w:pPr><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${cx}" cy="${cy}"/><wp:docPr id="1" name="${name}"/><wp:cNvGraphicFramePr/><a:graphic><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic><pic:nvPicPr><pic:cNvPr id="0" name="${name}.png"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="${rid}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${cx}" cy="${cy}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`;
}

function resolveHeaderMediaTarget(
  headerRels: string | null,
  rId: string
): string | null {
  if (!headerRels) return null;
  const re = new RegExp(`<Relationship[^>]*\\bId="${rId}"[^>]*>`);
  const m = headerRels.match(re);
  if (!m) return null;
  const target = m[0].match(/\bTarget="([^"]+)"/)?.[1];
  if (!target) return null;
  if (target.startsWith('/')) return target.replace(/^\//, '');
  if (target.startsWith('media/')) return `word/${target}`;
  if (target.startsWith('../media/')) return `word/media/${target.slice('../media/'.length)}`;
  return `word/${target.replace(/^\.\//, '')}`;
}

function extractHeaderImageBlocks(
  headerXml: string,
  headerRels: string | null
): Array<{ mediaPath: string; cx: number; cy: number }> {
  const out: Array<{ mediaPath: string; cx: number; cy: number }> = [];

  for (const m of headerXml.matchAll(/<v:shape\b[^>]*>[\s\S]*?<\/v:shape>/gi)) {
    const block = m[0];
    const rid = block.match(/<v:imagedata\b[^>]*\br:id="(rId\d+)"/i)?.[1];
    if (!rid) continue;
    const mediaPath = resolveHeaderMediaTarget(headerRels, rid);
    if (!mediaPath) continue;
    const style = block.match(/\bstyle="([^"]*)"/i)?.[1] || '';
    const size = parsePtSize(style) || { cx: Math.round(86.25 * 12700), cy: Math.round(85.65 * 12700) };
    out.push({ mediaPath, ...size });
  }

  for (const m of headerXml.matchAll(/<w:drawing>[\s\S]*?<\/w:drawing>/gi)) {
    const block = m[0];
    const rid =
      block.match(/<a:blip\b[^>]*\br:embed="(rId\d+)"/i)?.[1] ||
      block.match(/<a:blip\b[^>]*\br:link="(rId\d+)"/i)?.[1];
    if (!rid) continue;
    const mediaPath = resolveHeaderMediaTarget(headerRels, rid);
    if (!mediaPath) continue;
    const ext = block.match(/<wp:extent\b[^>]*\bcx="(\d+)"[^>]*\bcy="(\d+)"/i);
    const cx = ext ? Number(ext[1]) : Math.round(86.25 * 12700);
    const cy = ext ? Number(ext[2]) : Math.round(85.65 * 12700);
    out.push({ mediaPath, cx, cy });
  }

  return out;
}

function headerTextParagraphs(headerXml: string): string {
  const paras: string[] = [];
  for (const m of headerXml.matchAll(/<w:p[\s>][\s\S]*?<\/w:p>/gi)) {
    const p = m[0];
    if (/<v:imagedata\b|<w:drawing\b|<w:pict\b/i.test(p) && !/<w:t[\s>]/.test(p)) {
      continue;
    }
    const texts = [...p.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi)].map((t) => t[1]);
    const joined = texts.join('').replace(/\s+/g, ' ').trim();
    if (!joined) continue;
    const bold = /<w:b\b|<w:b\s*\/>/.test(p);
    const sz = p.match(/<w:sz\b[^>]*w:val="(\d+)"/)?.[1];
    const jc = p.match(/<w:jc\b[^>]*w:val="([^"]+)"/)?.[1] || 'center';
    const rPr = [
      bold ? '<w:b/>' : '',
      sz ? `<w:sz w:val="${sz}"/><w:szCs w:val="${sz}"/>` : '<w:sz w:val="20"/><w:szCs w:val="20"/>',
      '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/>',
    ].join('');
    paras.push(
      `<w:p><w:pPr><w:jc w:val="${jc}"/><w:spacing w:after="0" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:rPr>${rPr}</w:rPr><w:t xml:space="preserve">${joined}</w:t></w:r></w:p>`
    );
  }
  return paras.join('');
}

function footerTextParagraphs(footerXml: string): string {
  const texts = [...footerXml.matchAll(/<w:t\b[^>]*>([\s\S]*?)<\/w:t>/gi)].map((t) => t[1]);
  const joined = texts.join(' ').replace(/\s+/g, ' ').trim();
  if (!joined) return '';
  return `<w:p><w:pPr><w:jc w:val="center"/><w:spacing w:before="200"/></w:pPr><w:r><w:rPr><w:sz w:val="16"/><w:szCs w:val="16"/><w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman"/></w:rPr><w:t xml:space="preserve">${joined}</w:t></w:r></w:p>`;
}

function stripHeaderFooterRefs(docXml: string): string {
  return docXml
    .replace(/<w:headerReference\b[^/]*\/>/g, '')
    .replace(/<w:footerReference\b[^/]*\/>/g, '')
    .replace(/<w:headerReference\b[^>]*>[\s\S]*?<\/w:headerReference>/g, '')
    .replace(/<w:footerReference\b[^>]*>[\s\S]*?<\/w:footerReference>/g, '');
}

function injectAtBodyStart(docXml: string, xmlFragment: string): string {
  if (!xmlFragment) return docXml;
  if (/<w:body[^>]*>/.test(docXml)) {
    return docXml.replace(/<w:body[^>]*>/, (open) => `${open}${xmlFragment}`);
  }
  return docXml;
}

function injectBeforeSectPr(docXml: string, xmlFragment: string): string {
  if (!xmlFragment) return docXml;
  if (/<w:sectPr\b/.test(docXml)) {
    return docXml.replace(/<w:sectPr\b/, (m) => `${xmlFragment}${m}`);
  }
  return docXml.replace(/<\/w:body>/, `${xmlFragment}</w:body>`);
}

/**
 * docx-to-pdf-wasm largely ignores Word headers/footers (where official kop lives).
 * Promote header image + text (and footer text) into the document body so PDF keeps the letterhead.
 */
export function prepareDocxForWasmPdf(docx: ArrayBuffer | Uint8Array): Uint8Array {
  const zip = new PizZip(docx);
  const docFile = zip.file('word/document.xml');
  if (!docFile) {
    return docx instanceof Uint8Array ? docx : new Uint8Array(docx);
  }

  let docXml = docFile.asText();
  let docRels =
    zip.file('word/_rels/document.xml.rels')?.asText() ||
    `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>`;

  const headerNames = Object.keys(zip.files)
    .filter((n) => /^word\/header\d+\.xml$/i.test(n))
    .sort();
  const footerNames = Object.keys(zip.files)
    .filter((n) => /^word\/footer\d+\.xml$/i.test(n))
    .sort();

  const prefixParts: string[] = [];
  const seenMedia = new Set<string>();

  for (const hName of headerNames) {
    const headerXml = zip.file(hName)?.asText();
    if (!headerXml) continue;
    const relName = hName.replace('word/', 'word/_rels/') + '.rels';
    const headerRels = zip.file(relName)?.asText() || null;

    for (const img of extractHeaderImageBlocks(headerXml, headerRels)) {
      if (seenMedia.has(img.mediaPath)) continue;
      if (!zip.file(img.mediaPath)) continue;
      seenMedia.add(img.mediaPath);
      const target = img.mediaPath.replace(/^word\//, '');
      const ensured = ensureImageRel(docRels, target);
      docRels = ensured.xml;
      prefixParts.push(drawingInline(ensured.rid, img.cx, img.cy, 'KopDesa'));
    }

    const textParas = headerTextParagraphs(headerXml);
    if (textParas) prefixParts.push(textParas);
  }

  let suffix = '';
  for (const fName of footerNames) {
    const footerXml = zip.file(fName)?.asText();
    if (!footerXml) continue;
    suffix += footerTextParagraphs(footerXml);
  }

  if (prefixParts.length || suffix) {
    docXml = injectAtBodyStart(docXml, prefixParts.join(''));
    docXml = injectBeforeSectPr(docXml, suffix);
    docXml = stripHeaderFooterRefs(docXml);
    zip.file('word/document.xml', docXml);
    zip.file('word/_rels/document.xml.rels', docRels);
  }

  const out = zip.generate({ type: 'uint8array', compression: 'DEFLATE' });
  return out as Uint8Array;
}
