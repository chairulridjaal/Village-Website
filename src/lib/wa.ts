/** Normalize phone to wa.me digits (62…). */
export function normalizeWaDigits(input: string): string {
  let d = input.replace(/\D/g, '');
  if (!d) return '';
  if (d.startsWith('0')) d = '62' + d.slice(1);
  else if (d.startsWith('8')) d = '62' + d;
  return d;
}

export function waMeLink(digitsOrUrl: string, text?: string): string | null {
  let digits = '';
  const raw = digitsOrUrl.trim();
  if (raw.includes('wa.me/')) {
    const m = raw.match(/wa\.me\/(\d+)/);
    digits = m?.[1] ?? '';
  } else {
    digits = normalizeWaDigits(raw);
  }
  if (!digits) return null;
  const base = `https://wa.me/${digits}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function waPelayananLink(
  waPelayanan: string | undefined,
  nomorPengajuan: string
): string | null {
  const text =
    `Assalamu'alaikum, saya baru mengajukan surat di website Desa Citarik.` +
    (nomorPengajuan ? ` Nomor pengajuan: ${nomorPengajuan}.` : '') +
    ` Mohon bantuannya. Terima kasih.`;
  return waMeLink(waPelayanan ?? '', text);
}
