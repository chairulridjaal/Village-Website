import type { SessionUser } from './permissions';

const SESSION_TTL_SECONDS = 60 * 60 * 8; // 8 hours

// ── PBKDF2 helpers ──────────────────────────────────────────────────────────
export async function hashPassword(password: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 },
    keyMaterial, 256
  );
  const saltHex = [...salt].map(b => b.toString(16).padStart(2, '0')).join('');
  const hashHex = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
  return `${saltHex}:${hashHex}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [saltHex, storedHash] = stored.split(':');
  if (!saltHex || !storedHash) return false;
  const salt = new Uint8Array(saltHex.match(/.{2}/g)!.map(b => parseInt(b, 16)));
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw', enc.encode(password), 'PBKDF2', false, ['deriveBits']
  );
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 100_000 },
    keyMaterial, 256
  );
  const hashHex = [...new Uint8Array(bits)].map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex === storedHash;
}

// ── KV session helpers ──────────────────────────────────────────────────────
export function generateSessionId(): string {
  return [...crypto.getRandomValues(new Uint8Array(32))]
    .map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function createSession(
  sessionId: string,
  user: SessionUser,
  kv: KVNamespace
): Promise<void> {
  await kv.put(`session:${sessionId}`, JSON.stringify(user), {
    expirationTtl: SESSION_TTL_SECONDS,
  });
}

export async function validateSession(
  sessionId: string,
  kv: KVNamespace
): Promise<SessionUser | null> {
  const raw = await kv.get(`session:${sessionId}`);
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as Partial<SessionUser> & { username?: string };
    // Legacy sessions only stored { username } — force re-login.
    if (typeof data.userId !== 'number' || !data.username || !Array.isArray(data.perms)) {
      await kv.delete(`session:${sessionId}`);
      return null;
    }
    return {
      userId: data.userId,
      username: data.username,
      is_master: Boolean(data.is_master),
      perms: data.perms,
    };
  } catch {
    return null;
  }
}

export async function deleteSession(sessionId: string, kv: KVNamespace): Promise<void> {
  await kv.delete(`session:${sessionId}`);
}

export const SESSION_COOKIE = 'dl_session';
export const SESSION_TTL = SESSION_TTL_SECONDS;
