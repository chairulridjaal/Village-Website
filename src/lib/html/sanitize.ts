/** Allowlist HTML sanitizer for admin rich text (no DOMParser in Workers — regex based). */
const ALLOWED_TAGS = new Set([
  'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li',
  'h2', 'h3', 'a', 'img', 'span', 'div',
]);

export function sanitizeHtml(input: string): string {
  if (!input) return '';
  let html = input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, '')
    .replace(/on\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '');

  html = html.replace(/<\/?([a-zA-Z0-9]+)(\s[^>]*)?>/g, (full, tag: string, attrs = '') => {
    const name = tag.toLowerCase();
    const closing = full.startsWith('</');
    if (!ALLOWED_TAGS.has(name)) return '';
    if (closing) return `</${name}>`;
    if (name === 'br') return '<br>';
    if (name === 'a') {
      const href = extractAttr(attrs, 'href');
      if (!href || !isSafeUrl(href)) return '<a>';
      return `<a href="${escapeAttr(href)}" rel="noopener noreferrer">`;
    }
    if (name === 'img') {
      const src = extractAttr(attrs, 'src');
      const alt = extractAttr(attrs, 'alt') ?? '';
      if (!src || !isSafeUrl(src)) return '';
      return `<img src="${escapeAttr(src)}" alt="${escapeAttr(alt)}">`;
    }
    return `<${name}>`;
  });

  return html;
}

function extractAttr(attrs: string, name: string): string | null {
  const re = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i');
  const m = attrs.match(re);
  if (!m) return null;
  return m[2] ?? m[3] ?? m[4] ?? null;
}

function isSafeUrl(url: string): boolean {
  const u = url.trim();
  if (u.startsWith('/')) return !u.startsWith('//');
  if (u.startsWith('https://') || u.startsWith('http://')) return true;
  if (u.startsWith('data:image/')) return true;
  return false;
}

function escapeAttr(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
