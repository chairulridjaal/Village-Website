import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { canManageMediaOwner } from '../../../../lib/auth/permissions';
import { deleteMedia } from '../../../../lib/media/upload';
import { purgeCache } from '../../../../lib/cache/purge';

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  const env = getEnv();
  const fd = await request.formData();
  const back = (fd.get('back') as string) || '/admin/media';
  if (!env) return redirect(`${back}${back.includes('?') ? '&' : '?'}error=media`);

  const action = fd.get('_action') as string;
  const rawId = (fd.get('id') as string) ?? (fd.get('media_id') as string);
  const mediaId = Number(rawId);
  const ownerType = (fd.get('owner_type') as string | null)?.trim() || null;
  const ownerId = Number(fd.get('owner_id'));

  if (!Number.isFinite(mediaId) || mediaId <= 0) {
    return redirect(`${back}${back.includes('?') ? '&' : '?'}error=media`);
  }

  let resolvedOwner = ownerType;
  if (!resolvedOwner) {
    const link = await env.DB.prepare(
      'SELECT owner_type FROM media_link WHERE media_id = ? LIMIT 1'
    ).bind(mediaId).first<{ owner_type: string }>();
    resolvedOwner = link?.owner_type ?? null;
  }

  if (!canManageMediaOwner(locals.user, resolvedOwner)) {
    return redirect('/admin/dasbor?error=forbidden');
  }

  try {
    if (action === 'delete') {
      await deleteMedia(mediaId, env.DB, env.MEDIA_BUCKET);
    } else if (action === 'cover' && resolvedOwner && Number.isFinite(ownerId) && ownerId > 0) {
      await env.DB.prepare(`
        UPDATE media_link
        SET sort = (SELECT COALESCE(MIN(sort), 0) - 1 FROM media_link WHERE owner_type = ? AND owner_id = ?)
        WHERE media_id = ? AND owner_type = ? AND owner_id = ?
      `).bind(resolvedOwner, ownerId, mediaId, resolvedOwner, ownerId).run();
    }
  } catch (e) {
    console.error('media manage failed', action, mediaId, e);
    return redirect(`${back}${back.includes('?') ? '&' : '?'}error=media`);
  }

  const purge = (fd.get('purge') as string) ?? '';
  if (purge) await purgeCache(purge.split(',').map(p => p.trim()).filter(Boolean));

  const sep = back.includes('?') ? '&' : '?';
  return redirect(`${back}${sep}media=1`);
};
