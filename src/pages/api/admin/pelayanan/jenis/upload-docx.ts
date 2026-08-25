import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { toSlug } from '../../../../../lib/db/slug';
import {
  normalizeDocxMarkers,
  parseMarkersFromDocx,
} from '../../../../../lib/pelayanan/docx-markers';
import { saveJenisDocxTemplate } from '../../../../../lib/pelayanan/docx-template-store';

const MAX_BYTES = 8 * 1024 * 1024;

export const POST: APIRoute = async ({ request }) => {
  const env = getEnv();
  if (!env?.MEDIA_BUCKET) {
    return new Response(JSON.stringify({ error: 'server', message: 'Penyimpanan belum siap.' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let fd: FormData;
  try {
    fd = await request.formData();
  } catch {
    return new Response(JSON.stringify({ error: 'form' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const file = fd.get('docx');
  if (!(file instanceof File) || file.size <= 0) {
    return new Response(JSON.stringify({ error: 'file', message: 'Pilih file .docx.' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  if (file.size > MAX_BYTES) {
    return new Response(JSON.stringify({ error: 'size', message: 'File terlalu besar (maks. 8 MB).' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const nameHint = String(fd.get('nama') ?? file.name ?? 'jenis').replace(/\.docx$/i, '');
  const slugHint = toSlug(nameHint) || 'jenis-surat';

  try {
    const buf = await file.arrayBuffer();
    const markers = await parseMarkersFromDocx(buf);
    if (markers.wargaFields.length === 0 && markers.adminFields.length === 0) {
      return new Response(
        JSON.stringify({
          error: 'markers',
          message:
            'Tidak ada placeholder di Word. Pakai $$nama$$ untuk isian warga dan %%nomor_surat%% untuk isian admin.',
        }),
        { status: 422, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const normalized = await normalizeDocxMarkers(buf);
    const blob = new Blob([normalized], {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const saved = await saveJenisDocxTemplate(blob, slugHint, env.MEDIA_BUCKET, file.name);
    if ('error' in saved) {
      const msg =
        saved.error === 'type'
          ? 'Hanya file .docx yang didukung.'
          : saved.error === 'size'
            ? 'File terlalu besar.'
            : 'Gagal menyimpan file.';
      return new Response(JSON.stringify({ error: saved.error, message: msg }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const nama =
      markers.titleHint && markers.titleHint.length > 5
        ? markers.titleHint.replace(/\s+/g, ' ').replace(/^SURAT\s+/i, 'Surat ')
        : nameHint;

    return new Response(
      JSON.stringify({
        ok: true,
        template_docx_path: saved.path,
        nama,
        deskripsi: '',
        syarat: 'Fotokopi KTP dan KK.',
        fields: markers.wargaFields,
        admin_fields: markers.adminFields,
        template_html: '',
        warnings: [
          ...markers.warnings,
          `Terdeteksi ${markers.wargaFields.length} isian warga ($$…$$) dan ${markers.adminFields.length} isian admin (%%…%%). Ubah jenis isian bila perlu, lalu simpan.`,
        ],
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Gagal membaca dokumen.';
    return new Response(JSON.stringify({ error: 'parse', message }), {
      status: 422,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
