const BY_JABATAN: Array<{ match: RegExp; src: string }> = [
  { match: /^kepala\s*desa$/i, src: '/images/HSumantri_Kades.jpeg' },
  { match: /sekretaris/i, src: '/images/Yuspa_Sekdes.jpeg' },
  { match: /kepala\s*seksi\s*pelayanan/i, src: '/images/Wiwi_KasiPelayanan.jpeg' },
  { match: /kepala\s*urusan\s*keuangan/i, src: '/images/Rena_KaurKeu.jpeg' },
  { match: /kepala\s*urusan\s*perencanaan/i, src: '/images/Wina_KaurPerencanaan.jpeg' },
  { match: /kepala\s*dusun\s*1|kadus\s*1/i, src: '/images/ELupi_Kadus1.jpeg' },
  { match: /kepala\s*dusun\s*2|kadus\s*2/i, src: '/images/Surahman_Kadus2.jpeg' },
  { match: /kepala\s*dusun\s*3|kadus\s*3/i, src: '/images/Budiman_kadus3.jpeg' },
  { match: /kepala\s*dusun\s*4|kadus\s*4/i, src: '/images/Misbah_Kadus4.jpeg' },
];

const BY_NAMA: Array<{ match: RegExp; src: string }> = [
  { match: /sumantri/i, src: '/images/HSumantri_Kades.jpeg' },
  { match: /yuspa/i, src: '/images/Yuspa_Sekdes.jpeg' },
  { match: /wiwi/i, src: '/images/Wiwi_KasiPelayanan.jpeg' },
  { match: /rena/i, src: '/images/Rena_KaurKeu.jpeg' },
  { match: /wina/i, src: '/images/Wina_KaurPerencanaan.jpeg' },
  { match: /lupi/i, src: '/images/ELupi_Kadus1.jpeg' },
  { match: /surahman/i, src: '/images/Surahman_Kadus2.jpeg' },
  { match: /budiman/i, src: '/images/Budiman_kadus3.jpeg' },
  { match: /misbah/i, src: '/images/Misbah_Kadus4.jpeg' },
];

export function staticPerangkatPhoto(nama: string, jabatan: string): string | null {
  const j = (jabatan || '').trim();
  const n = (nama || '').trim();
  for (const row of BY_JABATAN) {
    if (row.match.test(j)) return row.src;
  }
  for (const row of BY_NAMA) {
    if (row.match.test(n)) return row.src;
  }
  return null;
}

export function perangkatAvatarSrc(
  nama: string,
  jabatan: string,
  coverUrl: string | null | undefined
): string | null {
  if (coverUrl) return coverUrl;
  return staticPerangkatPhoto(nama, jabatan);
}
