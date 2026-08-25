import { spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const remote = process.argv.includes('--remote');
const locFlag = remote ? '--remote' : '--local';
const bucket = 'web-desa-citarik-media';
const dbName = 'web-desa-citarik-db';

const CT = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
};

function run(cmd, args, opts = {}) {
  const r = spawnSync(cmd, args, {
    cwd: root,
    shell: true,
    encoding: 'utf8',
    ...opts,
  });
  if (r.status !== 0) {
    console.error(r.stdout || '');
    console.error(r.stderr || '');
    throw new Error(`Command failed: ${cmd} ${args.join(' ')}`);
  }
  return r;
}

function putR2(srcRel, key) {
  const src = join(root, srcRel);
  if (!existsSync(src)) throw new Error(`Missing image: ${src}`);
  const ext = extname(src).toLowerCase();
  const contentType = CT[ext] || 'application/octet-stream';
  console.log('R2 PUT', key, locFlag);
  run('npx', [
    'wrangler',
    'r2',
    'object',
    'put',
    `${bucket}/${key}`,
    `--file=${src}`,
    `--content-type=${contentType}`,
    locFlag,
  ]);
}

function d1Json(sql) {
  const r = run('npx', [
    'wrangler',
    'd1',
    'execute',
    dbName,
    locFlag,
    '--json',
    '--command',
    sql,
  ]);
  const out = (r.stdout || '').trim();
  try {
    return JSON.parse(out);
  } catch {
    console.error('Bad D1 JSON:', out.slice(0, 500));
    throw new Error('Failed to parse wrangler d1 --json output');
  }
}

function d1File(sql) {
  const dir = join(tmpdir(), 'opencode-umkm-seed');
  mkdirSync(dir, { recursive: true });
  const f = join(dir, `seed-${Date.now()}.sql`);
  writeFileSync(f, sql, 'utf8');
  console.log('D1 execute file', f);
  run('npx', ['wrangler', 'd1', 'execute', dbName, locFlag, '--file', f], {
    stdio: 'inherit',
  });
}

function esc(s) {
  return String(s ?? '').replace(/'/g, "''");
}

/** @type {Array<{
 *  slug: string;
 *  nama: string;
 *  kategori: string;
 *  deskripsi_html: string;
 *  menu: string;
 *  jam_buka: string | null;
 *  cara_pesan: string;
 *  lokasi: string;
 *  wa_number: string | null;
 *  toko_online_url: string | null;
 *  photos: Array<{ file: string; alt: string; key: string }>;
 * }>} */
const UMKM = [
  {
    slug: 'dapurkin-snack',
    nama: 'DapurKin Snack',
    kategori: 'Kuliner',
    deskripsi_html: `<p><strong>DapurKin Snack</strong> (DK Snack) adalah UMKM binaan Satker BBP3KP Palabuhanratu yang berdiri sejak tahun 2021. Usaha ini beralamat di Kp. Gadog RT 01/RW 013, Desa Citarik, Kecamatan Palabuhanratu, Kabupaten Sukabumi.</p>
<p>Fokus utamanya olahan hasil laut: abon ikan tuna, pempek ikan tuna, serta aneka terasi (udang, ikan pepetek, dan rebon). Selain itu tersedia camilan dan minuman lokal seperti pisang mustofa, ratu wajit sirsak, dan minuman markisa—cocok untuk oleh-oleh maupun camilan harian.</p>
<p>Pemesanan dan pemasaran dilakukan secara online melalui Instagram dan WhatsApp.</p>`,
    menu: `Abon ikan tuna — harga bervariasi
Pempek ikan tuna — harga bervariasi
Terasi udang — harga bervariasi
Terasi ikan pepetek — harga bervariasi
Terasi rebon — harga bervariasi
Pisang mustofa — harga bervariasi
Ratu wajit sirsak — harga bervariasi
Minuman markisa — harga bervariasi`,
    jam_buka: 'Hubungi via WhatsApp untuk ketersediaan stok',
    cara_pesan: `Chat WhatsApp 0857-9469-5951
Instagram: @dk_snack.plara
Pembayaran dan pengiriman disepakati langsung dengan penjual`,
    lokasi: 'Kp. Gadog RT 01/RW 013, Desa Citarik, Kecamatan Palabuhanratu, Kabupaten Sukabumi',
    wa_number: '6285794695951',
    toko_online_url: 'https://www.instagram.com/dk_snack.plara/',
    photos: [
      { file: 'public/images/abon-dk.jpeg', alt: 'Abon DapurKin Snack', key: 'media/umkm/dapurkin/abon-dk.jpeg' },
      { file: 'public/images/pempek-ikan-tuna.jpg', alt: 'Pempek ikan tuna DapurKin', key: 'media/umkm/dapurkin/pempek-ikan-tuna.jpg' },
      { file: 'public/images/pisang-mustofa.jpeg', alt: 'Pisang mustofa DapurKin', key: 'media/umkm/dapurkin/pisang-mustofa.jpeg' },
      { file: 'public/images/ratu-wajit-sirsak.jpeg', alt: 'Ratu wajit sirsak DapurKin', key: 'media/umkm/dapurkin/ratu-wajit-sirsak.jpeg' },
      { file: 'public/images/minuman-markisa.jpg', alt: 'Minuman markisa DapurKin', key: 'media/umkm/dapurkin/minuman-markisa.jpg' },
    ],
  },
  {
    slug: 'adbacin-snack',
    nama: 'AdBaCin Snack',
    kategori: 'Kuliner',
    deskripsi_html: `<p><strong>AdBaCin Snack</strong> adalah UMKM binaan Satker BBP3KP Palabuhanratu yang berdiri sejak tahun 2020 dan beroperasi di Jl. Siliwangi, Palabuhanratu.</p>
<p>Usaha ini berawal dari penjualan bakso saat masa pandemi, lalu berkembang menjadi aneka camilan olahan ikan: basreng, kerupuk bakso ikan, gotteki, seblak bakso, hingga bakso frozen. Produknya mudah dijumpai secara offline, termasuk di gerai ritel seperti Yogya.</p>
<p>Cocok bagi yang mencari camilan gurih berbahan ikan dengan cita rasa khas Palabuhanratu.</p>`,
    menu: `Basreng — harga bervariasi
Kerupuk bakso ikan — harga bervariasi
Gotteki — harga bervariasi
Seblak bakso — harga bervariasi
Bakso frozen — harga bervariasi`,
    jam_buka: 'Hubungi penjual untuk jam operasional',
    cara_pesan: `Datang langsung ke lokasi di Jl. Siliwangi Palabuhanratu
Atau hubungi melalui saluran yang tertera di kemasan / gerai
Pembayaran di tempat atau sesuai kesepakatan`,
    lokasi: 'Jl. Siliwangi, Palabuhanratu, Kabupaten Sukabumi',
    wa_number: null,
    toko_online_url: null,
    photos: [
      { file: 'public/images/adbacin-snack.jpg', alt: 'Produk AdBaCin Snack', key: 'media/umkm/adbacin/adbacin-snack.jpg' },
    ],
  },
  {
    slug: 'wizard-rafsanjani',
    nama: 'Wizard Rafsanjani',
    kategori: 'Kuliner',
    deskripsi_html: `<p><strong>Wizard Rafsanjani</strong> adalah UMKM binaan Desa Citarik yang menghadirkan camilan rumahan dengan rasa renyah dan bumbu yang pas.</p>
<p>Produk andalannya meliputi popcorn, kembang goyang, dan rempeyek—cocok untuk temani santai di rumah maupun dibawa sebagai oleh-oleh dari Citarik. Harga bervariasi mengikuti jenis dan ukuran kemasan; stok dan pesanan dapat dikonfirmasi langsung ke pelaku usaha.</p>
<p>Dengan dukungan pembinaan desa, Wizard Rafsanjani turut memperkuat ekonomi lokal lewat produk camilan yang mudah dinikmati sehari-hari.</p>`,
    menu: `Popcorn — harga bervariasi
Kembang goyang — harga bervariasi
Rempeyek — harga bervariasi
Camilan lainnya — harga bervariasi sesuai kemasan`,
    jam_buka: 'Pesan sesuai ketersediaan; hubungi pelaku usaha',
    cara_pesan: `Hubungi langsung pelaku usaha Wizard Rafsanjani
Harga menyesuaikan jenis dan ukuran kemasan
Pembayaran disepakati saat pemesanan`,
    lokasi: 'Desa Citarik, Kecamatan Palabuhanratu, Kabupaten Sukabumi',
    wa_number: null,
    toko_online_url: null,
    photos: [
      { file: 'public/images/popcorn-wizard.jpg', alt: 'Popcorn Wizard Rafsanjani', key: 'media/umkm/wizard/popcorn-wizard.jpg' },
      { file: 'public/images/kembanggoyang-wizard.jpg', alt: 'Kembang goyang Wizard Rafsanjani', key: 'media/umkm/wizard/kembanggoyang-wizard.jpg' },
      { file: 'public/images/rempeyek-wizard.jpg', alt: 'Rempeyek Wizard Rafsanjani', key: 'media/umkm/wizard/rempeyek-wizard.jpg' },
    ],
  },
];

// 1) Upload all photos to R2
for (const u of UMKM) {
  for (const p of u.photos) putR2(p.file, p.key);
}

// 2) Build SQL: clear previous seed for these slugs, insert umkm + media + links
const parts = [];
parts.push(`-- Seed UMKM binaan (DapurKin, AdBaCin, Wizard Rafsanjani)`);
parts.push(
  `DELETE FROM media_link WHERE owner_type='umkm' AND owner_id IN (SELECT id FROM umkm WHERE slug IN ('dapurkin-snack','adbacin-snack','wizard-rafsanjani'));`
);
parts.push(
  `DELETE FROM media WHERE r2_key_display LIKE 'media/umkm/dapurkin/%' OR r2_key_display LIKE 'media/umkm/adbacin/%' OR r2_key_display LIKE 'media/umkm/wizard/%';`
);
parts.push(
  `DELETE FROM umkm WHERE slug IN ('dapurkin-snack','adbacin-snack','wizard-rafsanjani');`
);

for (const u of UMKM) {
  parts.push(`
INSERT INTO umkm (
  slug, nama, kategori, deskripsi_html, menu, jam_buka, cara_pesan,
  lokasi, wa_number, telepon, google_maps_url, qris_r2_key, toko_online_url, status
) VALUES (
  '${esc(u.slug)}',
  '${esc(u.nama)}',
  '${esc(u.kategori)}',
  '${esc(u.deskripsi_html)}',
  '${esc(u.menu)}',
  ${u.jam_buka ? `'${esc(u.jam_buka)}'` : 'NULL'},
  '${esc(u.cara_pesan)}',
  '${esc(u.lokasi)}',
  ${u.wa_number ? `'${esc(u.wa_number)}'` : 'NULL'},
  NULL,
  NULL,
  NULL,
  ${u.toko_online_url ? `'${esc(u.toko_online_url)}'` : 'NULL'},
  'published'
);`);

  u.photos.forEach((p, i) => {
    parts.push(`
INSERT INTO media (r2_key_display, r2_key_thumb, alt)
VALUES ('${esc(p.key)}', '${esc(p.key)}', '${esc(p.alt)}');
INSERT INTO media_link (media_id, owner_type, owner_id, role, sort)
VALUES (
  last_insert_rowid(),
  'umkm',
  (SELECT id FROM umkm WHERE slug='${esc(u.slug)}'),
  'gallery',
  ${i}
);`);
  });
}

d1File(parts.join('\n'));

const check = d1Json(
  "SELECT id, slug, nama, status FROM umkm WHERE slug IN ('dapurkin-snack','adbacin-snack','wizard-rafsanjani') ORDER BY nama;"
);
console.log(JSON.stringify(check, null, 2));
console.log('Done seed UMKM binaan', locFlag);
