-- Data contoh UMKM untuk demo ke pelaku UMKM.
-- Semua kolom terisi agar terlihat tampilan profil yang lengkap.
-- Nama diberi tanda "(Contoh)" supaya jelas bukan data asli.
--
-- Terapkan (lokal):    npx wrangler d1 execute web-desa-citarik-db --local  --file demo-umkm.sql
-- Terapkan (produksi): npx wrangler d1 execute web-desa-citarik-db --remote --file demo-umkm.sql
--
-- Foto sampul: unggah dulu ke R2 (ganti --local dengan --remote untuk produksi):
--   npx wrangler r2 object put web-desa-citarik-media/media/demo-kopi-Citarik-display.webp --file demo-display.webp --content-type image/webp --local
--   npx wrangler r2 object put web-desa-citarik-media/media/demo-kopi-Citarik-thumb.webp   --file demo-thumb.webp   --content-type image/webp --local
--
-- Hapus setelah demo selesai (paling mudah: tombol hapus di panel admin,
-- yang sekaligus membersihkan foto di R2), atau manual:
--   npx wrangler d1 execute web-desa-citarik-db --remote --command "DELETE FROM umkm WHERE slug='contoh-kopi-Citarik-bu-euis'; DELETE FROM titik_peta WHERE linked_slug='contoh-kopi-Citarik-bu-euis'; DELETE FROM media_link WHERE media_id IN (SELECT id FROM media WHERE r2_key_display='media/demo-kopi-Citarik-display.webp'); DELETE FROM media WHERE r2_key_display='media/demo-kopi-Citarik-display.webp';"
--   npx wrangler r2 object delete web-desa-citarik-media/media/demo-kopi-Citarik-display.webp --remote
--   npx wrangler r2 object delete web-desa-citarik-media/media/demo-kopi-Citarik-thumb.webp --remote

INSERT OR IGNORE INTO umkm
  (slug, nama, kategori, deskripsi_html, menu, jam_buka, cara_pesan, lokasi, wa_number, telepon, google_maps_url, toko_online_url, status)
VALUES
  ('contoh-kopi-Citarik-bu-euis',
   'Kopi Citarik Bu Euis (Contoh)',
   'Kuliner',
   '<p>Kedai kopi rumahan di tepi jalan utama Desa Citarik yang menyajikan kopi robusta sangrai sendiri dari kebun warga, ditemani pisang goreng dan gorengan hangat. Tempat favorit nelayan dan wisatawan untuk bersantai sambil menikmati pemandangan pesisir.</p>',
   'Kopi tubruk robusta Citarik — Rp8.000
Es kopi susu gula aren — Rp12.000
Pisang goreng keju — Rp10.000
Kopi bubuk kemasan 200gr (oleh-oleh) — Rp35.000',
   'Setiap hari pukul 07.00–21.00 WIB',
   'Datang langsung, pesan antar via WhatsApp untuk area Desa Citarik, atau beli kopi kemasan melalui toko online. Menerima pembayaran QRIS.',
   'Kampung Cibuntu RT 02/RW 05, Desa Citarik, Kec. Simpenan',
   '6281234567890',
   '0266123456',
   'https://maps.app.goo.gl/contoh-kopi-Citarik',
   'https://tokopedia.com/kopi-Citarik-contoh',
   'published');

-- Rapikan baris yang sudah terlanjur ada (INSERT OR IGNORE tidak meng-update).
UPDATE umkm SET
  deskripsi_html = '<p>Kedai kopi rumahan di tepi jalan utama Desa Citarik yang menyajikan kopi robusta sangrai sendiri dari kebun warga, ditemani pisang goreng dan gorengan hangat. Tempat favorit nelayan dan wisatawan untuk bersantai sambil menikmati pemandangan pesisir.</p>',
  menu = 'Kopi tubruk robusta Citarik — Rp8.000
Es kopi susu gula aren — Rp12.000
Pisang goreng keju — Rp10.000
Kopi bubuk kemasan 200gr (oleh-oleh) — Rp35.000',
  jam_buka = 'Setiap hari pukul 07.00–21.00 WIB',
  cara_pesan = 'Datang langsung, pesan antar via WhatsApp untuk area Desa Citarik, atau beli kopi kemasan melalui toko online. Menerima pembayaran QRIS.',
  updated_at = datetime('now')
WHERE slug = 'contoh-kopi-Citarik-bu-euis';

-- Titik di peta desa agar contoh juga muncul di halaman Peta
INSERT OR IGNORE INTO titik_peta (lat, lng, jenis, linked_slug, label) VALUES
  (-7.0405, 106.5470, 'umkm', 'contoh-kopi-Citarik-bu-euis', 'Kopi Citarik Bu Euis (Contoh)');

-- Foto sampul (objek R2 diunggah terpisah, lihat perintah di atas).
-- Foto: es kopi susu, Unsplash (lisensi bebas pakai).
INSERT INTO media (r2_key_display, r2_key_thumb, alt)
SELECT 'media/demo-kopi-Citarik-display.webp', 'media/demo-kopi-Citarik-thumb.webp',
       'Es kopi susu gula aren di Kopi Citarik Bu Euis (contoh)'
WHERE NOT EXISTS (SELECT 1 FROM media WHERE r2_key_display = 'media/demo-kopi-Citarik-display.webp');

INSERT OR IGNORE INTO media_link (media_id, owner_type, owner_id, role, sort)
SELECT m.id, 'umkm', u.id, 'gallery', 0
FROM media m, umkm u
WHERE m.r2_key_display = 'media/demo-kopi-Citarik-display.webp'
  AND u.slug = 'contoh-kopi-Citarik-bu-euis';
