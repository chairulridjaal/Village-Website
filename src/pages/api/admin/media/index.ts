import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { canManageMediaOwner, MEDIA_OWNER_TYPES } from '../../../../lib/auth/permissions';
import { saveMedia, deleteMedia } from '../../../../lib/media/upload';
import { linkMedia } from '../../../../lib/db/media';
import { purgeCache } from '../../../../lib/cache/purge';

const MAX_BYTES = 5 * 1024 * 1024;

export const POST: APIRoute = async ({ request, locals }) => {
  const env = getEnv();
  if (!env) return new Response('Server tidak siap', { status: 503 });

  const fd = await request.formData();
  const display = fd.get('display');
  const thumb = fd.get('thumb');
  const alt = (fd.get('alt') as string) ?? '';
  const ownerType = (fd.get('owner_type') as string | null)?.trim() || null;
  const ownerIdRaw = fd.get('owner_id') as string | null;

  if (!canManageMediaOwner(locals.user, ownerType)) {
    return new Response('Tidak punya izin mengunggah foto', { status: 403 });
  }

  if (!(display instanceof Blob) || !(thumb instanceof Blob)) {
    return new Response('Berkas gambar tidak ditemukan', { status: 400 });
  }
  if (display.size > MAX_BYTES || thumb.size > MAX_BYTES) {
    return new Response('Ukuran gambar terlalu besar (maks. 5 MB)', { status: 400 });
  }

  let id: number;
  let displayKey: string;
  let thumbKey: string;
  try {
    const saved = await saveMedia(display, thumb, alt, env.DB, env.MEDIA_BUCKET);
    id = saved.id;
    displayKey = saved.displayKey;
    thumbKey = saved.thumbKey;
  } catch (e) {
    console.error('saveMedia failed', e);
    return new Response('Gagal menyimpan gambar ke penyimpanan', { status: 500 });
  }

  if (ownerType && ownerIdRaw) {
    const ownerId = Number(ownerIdRaw);
    if (!MEDIA_OWNER_TYPES.includes(ownerType) || !Number.isFinite(ownerId) || ownerId <= 0) {
      await deleteMedia(id, env.DB, env.MEDIA_BUCKET).catch(() => {});
      return new Response('Tipe atau ID pemilik tidak valid', { status: 400 });
    }
    try {
      const { results } = await env.DB
        .prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM media_link WHERE owner_type = ? AND owner_id = ?')
        .bind(ownerType, ownerId)
        .all<{ n: number }>();
      const sort = results[0]?.n ?? 0;
      await linkMedia(id, ownerType, ownerId, 'gallery', sort, env.DB);
    } catch (e) {
      console.error('linkMedia failed', e);
      await deleteMedia(id, env.DB, env.MEDIA_BUCKET).catch(() => {});
      return new Response('Gagal menautkan foto', { status: 500 });
    }
  }

  const purge = (fd.get('purge') as string) ?? '';
  if (purge) await purgeCache(purge.split(',').map(p => p.trim()).filter(Boolean));

  return Response.json({
    id,
    url: `/api/media/${encodeURIComponent(displayKey)}`,
    thumbUrl: `/api/media/${encodeURIComponent(thumbKey)}`,
  });
};
