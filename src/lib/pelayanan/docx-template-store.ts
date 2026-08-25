const DOCX_MAX = 8 * 1024 * 1024;
const DOCX_TYPES = new Set([
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/octet-stream',
  'application/zip',
]);

const PUBLIC_SURAT_PREFIX = '/templates/surat/';
const R2_SEED_PREFIX = 'media/templates/seed/';

export async function saveJenisDocxTemplate(
  file: File | Blob,
  slugOrId: string,
  bucket: R2Bucket,
  originalName?: string
): Promise<{ path: string } | { error: string }> {
  if (!file || file.size <= 0) return { error: 'empty' };
  if (file.size > DOCX_MAX) return { error: 'size' };
  const name = (originalName || (file instanceof File ? file.name : '') || '').toLowerCase();
  const type = file.type || '';
  if (name && !name.endsWith('.docx') && !DOCX_TYPES.has(type) && type !== '') {
    if (!DOCX_TYPES.has(type) && name && !name.endsWith('.docx')) return { error: 'type' };
  }

  const ts = Date.now();
  const rand = Math.random().toString(36).slice(2, 8);
  const safe = String(slugOrId || 'jenis')
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .slice(0, 60);
  const r2_key = `media/templates/${safe}-${ts}-${rand}.docx`;

  await bucket.put(r2_key, await file.arrayBuffer(), {
    httpMetadata: {
      contentType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    },
    customMetadata: { filename: (originalName || name || 'template.docx').slice(0, 120) },
  });

  return { path: r2_key };
}

function resolveR2Keys(path: string): string[] {
  const p = path.trim();
  if (!p) return [];

  if (p.startsWith('r2:')) {
    return [p.slice(3)];
  }
  if (p.startsWith('media/templates/')) {
    return [p];
  }

  // Legacy public path → R2 seed object
  if (p.startsWith(PUBLIC_SURAT_PREFIX) && p.endsWith('.docx')) {
    const file = p.slice(PUBLIC_SURAT_PREFIX.length);
    return [`${R2_SEED_PREFIX}${file}`];
  }
  if (p.startsWith('templates/surat/') && p.endsWith('.docx')) {
    const file = p.slice('templates/surat/'.length);
    return [`${R2_SEED_PREFIX}${file}`];
  }

  return [];
}

export async function loadTemplateBytes(
  path: string,
  opts: { bucket?: R2Bucket; origin?: string }
): Promise<ArrayBuffer | null> {
  const p = path.trim();
  if (!p) return null;

  const r2Keys = resolveR2Keys(p);
  if (opts.bucket) {
    for (const key of r2Keys) {
      const obj = await opts.bucket.get(key);
      if (obj) return obj.arrayBuffer();
    }
  }

  // Last resort: HTTP fetch of public static (may fail inside Workers)
  const urlPath = p.startsWith('/') ? p : `/${p}`;
  if (opts.origin) {
    try {
      const res = await fetch(new URL(urlPath, opts.origin).href);
      if (res.ok) return res.arrayBuffer();
    } catch {
      /* continue */
    }
  }

  try {
    const res = await fetch(urlPath);
    if (res.ok) return res.arrayBuffer();
  } catch {
    /* continue */
  }

  return null;
}

export async function loadR2Bytes(
  key: string,
  bucket: R2Bucket
): Promise<ArrayBuffer | null> {
  const obj = await bucket.get(key);
  if (!obj) return null;
  return obj.arrayBuffer();
}
