import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { saveMedia, deleteMedia } from '../../../../lib/media/upload';
import { linkMedia } from '../../../../lib/db/media';
import { purgeCache } from '../../../../lib/cache/purge';

const MAX_BYTES = 5 * 1024 * 1024;

export const POST: APIRoute = async ({ request }) => {
  const env = getEnv();
  if (!env) return new Response('Server tidak siap', { status: 503 });

  const fd = await request.formData();
  const display = fd.get('display');
  const thumb = fd.get('thumb');
  const alt = (fd.get('alt') as string) ?? '';
  const ownerType = fd.get('owner_type') as string | null;
  const ownerIdRaw = fd.get('owner_id') as string | null;

  if (!(display instanceof Blob) || !(thumb instanceof Blob)) {
    return new Response('Berkas gambar tidak ditemukan', { status: 400 });
  }
  if (display.size > MAX_BYTES || thumb.size > MAX_BYTES) {
    return new Response('Ukuran gambar terlalu besar', { status: 400 });
  }

  const { id, displayKey, thumbKey } = await saveMedia(display, thumb, alt, env.DB, env.MEDIA_BUCKET);

  const validOwnerTypes = ['berita', 'umkm'];
  if (ownerType && ownerIdRaw) {
    const ownerId = Number(ownerIdRaw);
    if (!validOwnerTypes.includes(ownerType) || !Number.isFinite(ownerId)) {
      await deleteMedia(id, env.DB, env.MEDIA_BUCKET);
      return new Response('Tipe atau ID pemilik tidak valid', { status: 400 });
    }
    const { results } = await env.DB
      .prepare('SELECT COALESCE(MAX(sort), -1) + 1 AS n FROM media_link WHERE owner_type = ? AND owner_id = ?')
      .bind(ownerType, ownerId)
      .all<{ n: number }>();
    const sort = results[0]?.n ?? 0;
    await linkMedia(id, ownerType, ownerId, 'gallery', sort, env.DB);
  }

  const purge = (fd.get('purge') as string) ?? '';
  if (purge) await purgeCache(purge.split(',').map(p => p.trim()).filter(Boolean));

  return Response.json({
    id,
    url: `/api/media/${encodeURIComponent(displayKey)}`,
    thumbUrl: `/api/media/${encodeURIComponent(thumbKey)}`,
  });
};
