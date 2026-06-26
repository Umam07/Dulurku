# Dulurku — Guyub Rukun Marganing Rahayu

**Dulurku** adalah platform silsilah keluarga interaktif yang bertindak sebagai titik temu digital bagi seluruh anggota keluarga besar — mulai dari sesepuh, anak, cucu, hingga cicit. Platform ini dibangun khusus untuk merawat silaturahmi, mendokumentasikan akar sejarah leluhur, serta menghidupkan kebersamaan hangat khas keluarga Jawa Timur yang kini banyak terpisah jarak di perantauan.

Bahasa Indonesia • [English Version](#english-version)

---

## 🌟 Fitur Utama

1. **Pohon Silsilah Interaktif (Interactive Family Tree)**
   - Visualisasi hirarki silsilah dinamis berbasis **SVG murni** (tanpa pustaka pihak ketiga yang berat).
   - Dilengkapi fitur **Zoom & Pan** (geser dan perbesar) yang responsif serta ramah sentuhan seluler.
   - Mendukung visualisasi relasi pernikahan (pasangan sejajar) dan keturunan ganda (*multiple children*).
   - Fitur pencarian anggota cerdas yang langsung memfokuskan layar dan memberikan efek cahaya keemasan pada node yang dicari.
   - Filter silsilah interaktif berdasarkan kota domisili atau status perantauan.

2. **Direktori Dulur (Family Directory)**
   - Daftar komprehensif seluruh kerabat dengan fungsi pencarian berbasis teks bebas.
   - Filter multivariat berdasarkan: tingkat generasi (Sesepuh, Orang Tua, Cucu, Cicit), kota domisili saat ini, dan status perantauan.
   - Tombol tambah anggota baru bagi pengelola untuk memperluas bagan keluarga secara instan.

3. **Biodata Mendalam & Slide-over Detail**
   - Mengklik setiap anggota keluarga akan memunculkan panel samping (*slide-over drawer*) yang memuat biodata lengkap: foto/inisial, tempat/tanggal lahir, kota tinggal, status perantauan, kontak (telepon & email), serta kisah biografi singkat.
   - Menampilkan visualisasi relasi keluarga inti terdekat (orang tua kandung, pasangan, saudara kandung, dan anak-anak) yang saling terhubung satu sama lain.
   - Menyediakan wadah menulis kenangan bersama atau pesan kesan bagi kerabat lain.

4. **Kalender Guyub (Family Calendar)**
   - Penanggalan interaktif bulanan untuk mengingat momen penting bersama.
   - Menandai secara otomatis hari lahir (ulang tahun) kerabat dengan ikon 🎂, ulang tahun pernikahan dengan ikon 💖, dan agenda pertemuan/arisan keluarga dengan ikon 👥.
   - Menampilkan daftar agenda mendatang (30 hari ke depan) secara kronologis lengkap dengan detail peta lokasi dan deskripsi acara.

5. **Ruang Bersama (Ruang Guyub)**
   - **Galeri Polaroid:** Galeri foto kenangan bersama yang dibingkai bergaya polaroid klasik dengan kemiringan sudut estetik dan caption tulisan tangan.
   - **Papan Wara-Wara (Pengumuman):** Media komunikasi satu arah untuk menyebarkan kabar gembira (kelahiran cicit baru), kabar duka, arisan rutin, atau rencana reuni akbar keluarga.
   - **Buku Tamu Doa Restu:** Kolom titip salam kangen, kabar singkat, atau doa restu dari para perantau yang bisa diisi kapan saja lengkap dengan avatar warna kustom.

6. **Gerbang Keamanan & Hak Akses (Privasi)**
   - Akses portal bersifat tertutup demi menjaga privasi informasi kontak dan silsilah keluarga.
   - Anggota masuk menggunakan **Kode Undangan Keluarga** bersama: `DULURGUYUB`.
   - **Mode Pengelola (Admin Mode):** Dilengkapi tombol sakelar admin untuk mengaktifkan fitur kepengurusan silsilah seperti: menambah/mengedit profil anggota keluarga, menghubungkan relasi orang tua/pernikahan secara visual, membuat wara-wara, serta menjadwalkan agenda acara kalender.

---

## 🛠️ Teknologi & Arsitektur

Platform ini dibangun dengan standar rekayasa perangkat lunak modern:
- **Core Framework:** [Next.js 15+ (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
- **Bahasa Pemrograman:** [TypeScript](https://www.typescriptlang.org/) untuk kepastian tipe data yang ketat.
- **Styling & Estetika:** [Tailwind CSS v4](https://tailwindcss.com/) dengan palet warna hangat khusus (*Terracotta, Sage Green, Sand, Warm Espresso*) yang mencerminkan suasana kekeluargaan tradisional yang premium.
- **Ikonografi:** [Lucide React](https://lucide.dev/) untuk pustaka ikon bergaya minimalis.
- **State & Data Store:** **React Context API** terintegrasi dengan **LocalStorage** browser. Seluruh perubahan data silsilah (CRUD anggota, agenda acara, pesan buku tamu, foto galeri) tersimpan secara persisten di komputer lokal tanpa memerlukan konfigurasi database cloud yang rumit di awal.

---

## 🚀 Cara Pemasangan & Menjalankan Lokal

Pastikan Anda telah memasang [Node.js](https://nodejs.org/) (versi 18 ke atas disarankan) di komputer Anda.

1. **Klon Repositori:**
   ```bash
   git clone https://github.com/Umam07/Dulurku.git
   cd Dulurku
   ```

2. **Pasang Dependensi:**
   ```bash
   npm install
   ```

3. **Jalankan Server Pengembangan:**
   ```bash
   npm run dev
   ```
   Buka browser Anda dan akses halaman [http://localhost:3000](http://localhost:3000).

4. **Kode Undangan Masuk:**
   Gunakan kode **`DULURGUYUB`** pada halaman gerbang masuk untuk mengakses dasbor.

5. **Mengaktifkan Mode Pengelola:**
   Klik tombol **"Mode Pengelola"** di bagian bawah menu samping kiri dasbor untuk mengaktifkan hak akses administratif (menambah, mengedit, atau menghapus data silsilah).

6. **Kompilasi Produksi (Build):**
   ```bash
   npm run build
   npm run start
   ```

---

## 📁 Struktur Direktori Utama

```text
Dulurku/
├── src/
│   ├── app/                # Next.js App Router (Halaman & Layout)
│   │   ├── dashboard/      # Rute Dasbor, Pohon, Direktori, Kalender, Kebersamaan
│   │   ├── globals.css     # Konfigurasi Tema Warna & Font Tailwind v4
│   │   ├── layout.tsx      # Font Google & FamilyProvider Wrapper
│   │   └── page.tsx        # Landing Gate (Input Kode Undangan)
│   ├── components/         # Komponen UI (FamilyTree, MemberDetail, AdminPanel, LayoutWrapper)
│   ├── context/            # FamilyContext (State Global & Sinkronisasi LocalStorage)
│   ├── data/               # initialData.ts (Seed Awal 4 Generasi Silsilah)
│   └── types/              # family.ts (Definisi Tipe Data TypeScript)
├── public/                 # Aset Gambar & Favicon
├── package.json            # Daftar Pustaka & Skrip NPM
└── tsconfig.json           # Konfigurasi Compiler TypeScript
```

---

## 📝 Skema Hubungan Data (Tingkat Tinggi)

Data silsilah disimpan secara relasional dan bersih untuk menghindari redudansi data:
- **`members` (Anggota):** Menyimpan biodata murni masing-masing personil (tanpa menyematkan array objek hubungan yang kompleks).
- **`relationships` (Pernikahan):** Menyimpan hubungan suami-istri antara dua ID anggota, status pernikahan (menikah/bercerai/cerai mati), serta tanggal pernikahan.
- **`parentChildRelations` (Orang Tua - Anak):** Tabel persimpangan yang memetakan hubungan orang tua ke anak (`parentId` -> `childId`). Saudara kandung dihitung secara dinamis dari kesamaan orang tua kandung.

---

<a id="english-version"></a>

# Dulurku — Family Tree & Digital Silaturahmi Hub

**Dulurku** is an interactive family tree web application designed to serve as a warm digital meeting place for large extended families — from patriarchs to grandchildren and great-grandchildren. It keeps the family bond alive, preserves ancestral history, and fosters warmth among relatives who now live far away in different cities.

## 🌟 Key Features
- **Interactive SVG Family Tree:** Features touch-friendly Zoom & Pan, smart name highlighting, spouse side-by-side positioning, and smooth generation-based connecting lines.
- **Detailed Profiles & Side-overs:** Displays contact info, birth dates, migration status, and dynamic immediate family relations (parents, spouse, siblings, children). Includes a custom guestbook memory-sharing area.
- **Family Directory:** Comprehensive search and multi-criteria filters based on cities, generations, and migration status.
- **Kalender Guyub (Family Calendar):** Month-view calendar tracking birthdays (🎂), wedding anniversaries (💖), and family arisan/gatherings (👥).
- **Ruang Bersama (Shared Space):** Features an aesthetic Polaroid-style photo gallery, a bulletin board for official news, and an interactive guestbook with custom avatar colors.
- **Privacy & Admin Tools:** Secured via the invitation passcode **`DULURGUYUB`**. Toggling **"Mode Pengelola" (Admin Mode)** unlocks inline editing, member additions, spousal/parental mapping, and event planning.

## 🛠️ Tech Stack
- **Next.js 15+ (App Router) & React 19**
- **TypeScript** for strict type safety.
- **Tailwind CSS v4** with a custom warm-heritage palette.
- **Lucide React** for minimal icons.
- **React Context API & LocalStorage** for seamless local-first persistence without needing cloud database configurations.

## 🚀 Quick Start
1. Clone repository: `git clone https://github.com/Umam07/Dulurku.git && cd Dulurku`
2. Install packages: `npm install`
3. Run dev server: `npm run dev` and open [http://localhost:3000](http://localhost:3000).
4. Enter passcode **`DULURGUYUB`** to unlock.
5. Toggle **"Mode Pengelola"** at the bottom-left sidebar to edit.
6. Build for production: `npm run build && npm run start`.
