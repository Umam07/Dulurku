**Dulurmu** — _Guyub rukun marganing rahayu._ Poros digital keluarga besar untuk menjaga silaturahmi lintas generasi dan lintas kota, di mana pun dulur merantau.

## 1. Ringkasan Produk

Dulurmu adalah website silsilah keluarga interaktif yang menjadi titik temu digital bagi seluruh anggota keluarga besar — dari sesepuh hingga cicit. Inti produk adalah **visualisasi pohon silsilah dinamis** yang bisa dijelajahi, diklik, dan diperluas, bukan sekadar diagram statis. Dilengkapi **Kalender Guyub** untuk mengingat hari lahir, hari pernikahan, dan jadwal arisan, Dulurmu menjaga keakraban keluarga khas Jawa Timur tetap hidup meski terpisah jarak.

## 2. Latar Belakang & Masalah

Seiring waktu, keturunan keluarga besar banyak yang merantau ke luar kota bahkan luar negeri. Akibatnya:

- Sepupu dan keponakan jauh mulai tidak saling mengenal.
- Akar silsilah leluhur perlahan terlupakan oleh generasi muda.
- Momen penting (kelahiran, pernikahan, arisan) sulit terkoordinasi.
- Tidak ada satu sumber kebenaran yang terjaga tentang struktur keluarga.

## 3. Tujuan & Sasaran

| Tujuan                              | Indikator Keberhasilan                          |
| ----------------------------------- | ----------------------------------------------- |
| Menjaga silaturahmi lintas generasi | Jumlah anggota aktif & frekuensi kunjungan      |
| Melestarikan silsilah leluhur       | Kelengkapan data pohon keluarga (% node terisi) |
| Memperkuat kebersamaan              | Jumlah momen yang diingat & dihadiri            |
| Mengenalkan akar pada generasi muda | Keterlibatan anggota generasi termuda           |

## 4. Target Pengguna

- **Sesepuh / penjaga silsilah** — sumber pengetahuan, mengisi & memverifikasi data.
- **Generasi produktif (perantau)** — ingin tetap terhubung walau jauh.
- **Generasi muda (cucu/cicit)** — ingin mengenal asal-usul keluarga.
- **Admin keluarga** — mengelola data, undangan, dan acara.

## 5. Fitur Utama

### 5.1 Interactive Family Tree (Inti Produk)

- **Responsive Nodes** — setiap kotak mewakili satu anggota keluarga, dapat diklik untuk membuka detail biodata.
- **Zoom & Pan** — eksplorasi mulus dari kakek buyut hingga generasi cicit.
- **Multiple Spouse & Child Support** — relasi rapi antar pasangan dan seluruh keturunannya.
- **Peta keturunan dinamis** — alur generasi dari sesepuh hingga cicit terbaru.
- **Pencarian anggota** — temukan nama dengan cepat di tengah pohon besar.

### 5.2 Biodata Anggota

- Foto, nama lengkap & nama panggilan.
- Tanggal lahir, kota domisili, status perantauan.
- Relasi: orang tua, pasangan, anak.
- Kontak (opsional, dengan kontrol privasi).
- Cerita / kenangan singkat.

### 5.3 Kalender Guyub

- Pengingat otomatis **hari lahir** anggota.
- Pengingat **hari pernikahan** / anniversary.
- Jadwal **pertemuan & arisan** keluarga.
- Notifikasi ke anggota terkait via email (integrasi WhatsApp ditunda untuk saat ini).

### 5.4 Ruang Kebersamaan (Opsional / Fase Lanjut)

- Galeri foto bersama.
- Papan pengumuman keluarga.
- Buku tamu / ucapan.

## 6. Kebutuhan Non-Fungsional

- **Nuansa ramah & hangat** — desain mencerminkan keakraban keluarga Jawa Timur.
- **Mobile-friendly** — mayoritas dulur akses lewat ponsel.
- **Privasi** — data keluarga tidak terbuka untuk publik; akses lewat undangan. Antar sesama anggota, data (termasuk kontak) saling terlihat.
- **Performa** — pohon tetap lancar walau ratusan node.
- **Multi-bahasa** — minimal Bahasa Indonesia (opsi Jawa di fase lanjut).

## 7. Model Data (Tingkat Tinggi)

| Entitas               | Atribut Utama                            |
| --------------------- | ---------------------------------------- |
| Anggota (Person)      | id, nama, foto, tgl lahir, domisili, bio |
| Relasi Pasangan       | person_a, person_b, tgl nikah, status    |
| Relasi Orang Tua–Anak | parent_id, child_id                      |
| Acara (Event)         | id, jenis, tanggal, peserta, lokasi      |

## 8. Pertimbangan Teknis

- **Visualisasi pohon:** library graph/tree interaktif (mis. D3.js, react-flow, atau dagre) dengan dukungan zoom/pan.
- **Frontend:** framework modern berbasis komponen (mis. React/Next.js).
- **Backend & Data:** basis data relasional untuk relasi keluarga + API.
- **Autentikasi:** login berbasis undangan keluarga; akses dibagikan manual oleh admin melalui grup keluarga.
- **Notifikasi:** layanan email untuk pengingat Kalender Guyub (integrasi WhatsApp ditunda).

## 9. Roadmap (Usulan Fase)

- [ ] **Fase 1 — Fondasi:** model data anggota + relasi, biodata, autentikasi undangan.
- [ ] **Fase 2 — Interactive Tree:** node responsif, zoom & pan, multiple spouse/child.
- [ ] **Fase 3 — Kalender Guyub:** pengingat lahir, pernikahan, arisan + notifikasi.
- [ ] **Fase 4 — Kebersamaan:** galeri foto, pengumuman, buku tamu.
- [ ] **Fase 5 — Penyempurnaan:** multi-bahasa, kontrol privasi lanjut, performa.

## 10. Metrik Keberhasilan

- Jumlah anggota terdaftar & aktif bulanan.
- Persentase kelengkapan pohon keluarga.
- Jumlah acara yang dibuat & dihadiri.
- Keterlibatan generasi muda (login & kontribusi).

## 11. Risiko & Mitigasi

| Risiko                             | Mitigasi                                                |
| ---------------------------------- | ------------------------------------------------------- |
| Data silsilah tidak lengkap/akurat | Peran sesepuh sebagai verifikator; kontribusi bertahap  |
| Adopsi rendah di generasi tua      | UI sederhana, bantuan onboarding via admin keluarga     |
| Kekhawatiran privasi               | Akses tertutup berbasis undangan & kontrol data pribadi |
| Pohon lambat saat data besar       | Render bertahap & lazy-loading node                     |

## 12. Keputusan & Ketentuan

- **Admin & verifikator silsilah:** dipegang sepenuhnya oleh pemilik untuk saat ini.
- **Integrasi WhatsApp:** belum diperlukan; pengingat cukup via email/aplikasi.
- **Akses & privasi:** tertutup, hanya anggota keluarga. Akses dibagikan manual oleh admin melalui grup keluarga (belum ada pendaftaran mandiri/publik).
- **Batas generasi teratas:** sampai kakek-nenek dari kedua orang tua (4 kakek-nenek sebagai akar pohon).
- **Visibilitas kontak:** data kontak terlihat oleh semua anggota keluarga (terbuka antar anggota).
- **Kontributor data:** untuk saat ini hanya dipegang oleh admin, belum ada rencana menambah peran kontributor.
