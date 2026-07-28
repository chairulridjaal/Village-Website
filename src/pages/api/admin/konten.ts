import { getEnv } from '@lib/env';
import type { APIRoute } from 'astro';
import { upsertSection } from '../../../lib/db/page-section';
import { purgeCache } from '../../../lib/cache/purge';
import { sanitizeHtml } from '../../../lib/html/sanitize';

export const POST: APIRoute = async ({ request, redirect }) => {
  const env = getEnv();
  if (!env) return redirect('/admin/konten');

  const fd = await request.formData();
  const slug = fd.get('slug') as string;
  const title = (fd.get('title') as string)?.trim();
  const content_html = sanitizeHtml((fd.get('content_html') as string) ?? '');

  if (!slug || !title) return redirect(`/admin/konten/${slug}?error=1`);

  await upsertSection(slug, { title, content_html }, env.DB);

  const purgePaths = ['/', '/profil', '/potensi', '/pemerintahan'];
  await purgeCache(purgePaths);

  return redirect(`/admin/konten/${slug}?saved=1`);
};
