import { Person, Relationship, ParentChild, FamilyEvent, Announcement, GuestbookEntry } from '../types/family';

// Generasi 0: Leluhur Utama / Sesepuh
export const initialMembers: Person[] = [
  {
    id: 'p-g0-1',
    name: 'Hardjowidjojo',
    nickname: 'Mbah Hardjo',
    gender: 'M',
    birthDate: '1938-08-15',
    birthPlace: 'Kediri',
    deathDate: '2021-11-20', // Almarhum
    domicile: 'Kediri',
    isMerantau: false,
    photoUrl: '', // Kosong akan difallback ke avatar inisial
    phone: '',
    email: '',
    bio: 'Leluhur utama keluarga besar Hardjowidjojo. Beliau adalah sosok disiplin, penyayang keluarga, dan mantan guru sekolah dasar di Kediri yang menanamkan pentingnya pendidikan bagi anak cucunya.',
    memories: [
      'Mbah Hardjo selalu mengumpulkan seluruh anak cucu di teras rumah setiap sore lebaran untuk membagikan petuah hidup.',
      'Suka sekali menyeduh kopi hitam pahit sambil mendengarkan wayang kulit di radio.'
    ],
    generation: 0
  },
  {
    id: 'p-g0-2',
    name: 'Siti Aminah',
    nickname: 'Mbah Siti',
    gender: 'F',
    birthDate: '1939-05-10',
    domicile: 'Kediri',
    isMerantau: false,
    photoUrl: '',
    phone: '081234567801',
    email: '',
    bio: 'Nenek tercinta dan pusat kehangatan keluarga besar. Sangat mahir memasak masakan tradisional Jawa Timur, terutama rawon dan pecel pincuk Kediri. Saat ini tinggal di rumah utama Kediri bersama keluarga bibi Anik.',
    memories: [
      'Masakan lodeh rebung dan sambal tumpang buatan Mbah Siti tidak pernah ada tandingannya.',
      'Selalu tersenyum hangat dan memiliki ingatan luar biasa tentang hari lahir seluruh cucu dan cicitnya.'
    ],
    generation: 0
  },

  // Generasi 1: Anak-anak Mbah Hardjo & Mbah Siti (serta Pasangannya)
  // 1. Anshori & Dewi Lestari
  {
    id: 'p-g1-1',
    name: 'Anshori',
    nickname: 'Pak Anshori',
    gender: 'M',
    birthDate: '1965-04-12',
    domicile: 'Surabaya',
    isMerantau: true,
    photoUrl: '',
    phone: '081234567811',
    email: 'anshori@email.com',
    bio: 'Anak keenam dari tujuh bersaudara Mbah Hardjo. Bekerja sebagai pensiunan pegawai BUMN di Surabaya. Sangat mengayomi adik-adiknya dan menjadi penasihat utama dalam kepengurusan arisan keluarga.',
    memories: [
      'Pak Anshori sangat gemar merawat tanaman hias di rumahnya di Surabaya.',
      'Sering membawakan oleh-oleh spiku khas Surabaya setiap kali mudik ke Kediri.'
    ],
    generation: 1
  },
  {
    id: 'p-g1-2',
    name: 'Dewi Lestari',
    nickname: 'Ibu Dewi',
    gender: 'F',
    birthDate: '1968-09-20',
    domicile: 'Surabaya',
    isMerantau: true,
    photoUrl: '',
    phone: '081234567812',
    email: 'dewi.lestari@email.com',
    bio: 'Anak kedua dari tiga bersaudara Mbah Sastro. Istri dari Pak Anshori. Aktif dalam kegiatan sosial keagamaan dan piawai merajut pakaian untuk cucu-cucunya.',
    generation: 1
  },

  // 2. Sri Wahyuni & (Alm) Joko Widodo
  {
    id: 'p-g1-3',
    name: 'Sri Wahyuni',
    nickname: 'Bu Sri',
    gender: 'F',
    birthDate: '1960-01-08',
    domicile: 'Malang',
    isMerantau: true,
    photoUrl: '',
    phone: '081234567821',
    email: 'sri.wahyuni@email.com',
    bio: 'Anak kedua dari tujuh bersaudara Mbah Hardjo. Mengelola usaha katering keluarga di Malang. Terkenal energik, ramah, dan menjadi motor penggerak setiap acara reuni besar keluarga.',
    memories: [
      'Bu Sri selalu sibuk di dapur menyiapkan konsumsi terbaik untuk seluruh kerabat.',
      'Paling suka bernyanyi campursari bersama kerabat saat kumpul keluarga.'
    ],
    generation: 1
  },
  {
    id: 'p-g1-4',
    name: 'Joko Widodo',
    nickname: 'Pak Joko',
    gender: 'M',
    birthDate: '1963-11-15',
    deathDate: '2019-03-05', // Almarhum
    domicile: 'Malang',
    isMerantau: true,
    photoUrl: '',
    phone: '',
    email: '',
    bio: 'Almarhum suami dari Bu Sri Wahyuni. Dahulu bekerja sebagai dosen teknik sipil di Malang. Sosok yang tenang, penyabar, dan sangat dihormati keponakannya.',
    generation: 1
  },

  // 3. Ahmad Hidayat & Siti Nurhaliza
  {
    id: 'p-g1-5',
    name: 'Ahmad Hidayat',
    nickname: 'Pak Ahmad',
    gender: 'M',
    birthDate: '1963-10-30',
    domicile: 'Sidoarjo',
    isMerantau: true,
    photoUrl: '',
    phone: '081234567831',
    email: 'ahmad.hidayat@email.com',
    bio: 'Anak keempat dari tujuh bersaudara Mbah Hardjo. Bekerja sebagai wirausahawan di bidang logistik di Sidoarjo. Senang berdiskusi politik dan sejarah keluarga.',
    generation: 1
  },
  {
    id: 'p-g1-6',
    name: 'Siti Nurhaliza',
    nickname: 'Bu Siti Sidoarjo',
    gender: 'F',
    birthDate: '1975-06-18',
    domicile: 'Sidoarjo',
    isMerantau: true,
    photoUrl: '',
    phone: '081234567832',
    bio: 'Istri dari Pak Ahmad Hidayat. Membantu mengelola bisnis keluarga dan aktif di komunitas pengajian.',
    generation: 1
  },

  // 4. Anik Wijayanti & Bambang Triyono
  {
    id: 'p-g1-7',
    name: 'Anik Wijayanti',
    nickname: 'Bu Anik',
    gender: 'F',
    birthDate: '1969-07-22',
    domicile: 'Kediri',
    isMerantau: false,
    photoUrl: '',
    phone: '081234567841',
    email: 'anik.wijayanti@email.com',
    bio: 'Anak bungsu (ketujuh) dari tujuh bersaudara Mbah Hardjo. Bekerja sebagai guru SMP negeri di Kediri. Dialah yang merawat Mbah Siti Aminah dan menjaga kelestarian rumah utama keluarga besar di Kediri.',
    memories: [
      'Bu Anik adalah penjaga pintu utama rumah Kediri yang selalu menyambut hangat kepulangan para perantau.',
      'Sangat telaten dalam mendokumentasikan foto-foto lama keluarga besar.'
    ],
    generation: 1
  },
  {
    id: 'p-g1-8',
    name: 'Bambang Triyono',
    nickname: 'Pak Bambang',
    gender: 'M',
    birthDate: '1975-02-14',
    domicile: 'Kediri',
    isMerantau: false,
    photoUrl: '',
    phone: '081234567842',
    bio: 'Suami dari Bu Anik Wijayanti. Bekerja di dinas pertanian Kediri. Menggemari burung kicau dan berkebun sayur di pekarangan rumah.',
    generation: 1
  },

  // Tiga Saudara Tambahan dari Pihak Ayah (untuk melengkapi 7 bersaudara)
  {
    id: 'p-g1-s1',
    name: 'Eko Santoso',
    nickname: 'Pak Eko',
    gender: 'M',
    birthDate: '1958-08-14',
    domicile: 'Kediri',
    isMerantau: false,
    photoUrl: '',
    phone: '081234567809',
    bio: 'Anak sulung dari tujuh bersaudara Mbah Hardjo. Tinggal di Kediri dekat dengan rumah utama, sangat aktif membantu kegiatan RT dan menjadi penengah jika ada musyawarah keluarga.',
    generation: 1
  },
  {
    id: 'p-g1-s2',
    name: 'Dwi Rahayu',
    nickname: 'Bu Dwi',
    gender: 'F',
    birthDate: '1961-03-22',
    domicile: 'Jakarta',
    isMerantau: true,
    photoUrl: '',
    phone: '081234567807',
    bio: 'Anak ketiga dari tujuh bersaudara Mbah Hardjo. Merantau di Jakarta bersama keluarganya dan bekerja sebagai PNS di kementerian.',
    generation: 1
  },
  {
    id: 'p-g1-s3',
    name: 'Tri Wibowo',
    nickname: 'Om Tri',
    gender: 'M',
    birthDate: '1964-11-05',
    domicile: 'Bandung',
    isMerantau: true,
    photoUrl: '',
    phone: '081234567805',
    bio: 'Anak kelima dari tujuh bersaudara Mbah Hardjo. Bekerja sebagai arsitek di Bandung, gemar berkebun, merancang lanskap, dan aktif dalam arisan regional.',
    generation: 1
  },

  // Generasi 2: Cucu-cucu Mbah Hardjo & Mbah Siti
  // Keturunan dari Budi Santoso (Sulung):
  {
    id: 'p-g2-1',
    name: 'Rudi Hermawan',
    nickname: 'Rudi',
    gender: 'M',
    birthDate: '1992-05-15',
    domicile: 'Malang',
    isMerantau: true,
    photoUrl: '',
    phone: '085712345601',
    email: 'rudi.hermawan@email.com',
    bio: 'Cucu pertama Mbah Hardjo. Bekerja sebagai manajer proyek IT di Malang. Hobi bersepeda gunung dan fotografi.',
    memories: [
      'Mas Rudi sering membantu merancang kartu undangan digital dan website keluarga.'
    ],
    generation: 2
  },
  {
    id: 'p-g2-2',
    name: 'Siska Amelia',
    nickname: 'Siska',
    gender: 'F',
    birthDate: '1994-08-22',
    domicile: 'Malang',
    isMerantau: true,
    photoUrl: '',
    phone: '085712345602',
    bio: 'Istri dari Rudi Hermawan. Bekerja sebagai apoteker dan sangat telaten mengasuh anak-anak.',
    generation: 2
  },
  {
    id: 'p-g2-3',
    name: 'Rina Wulandari',
    nickname: 'Rina',
    gender: 'F',
    birthDate: '1998-08-08',
    domicile: 'Jakarta',
    isMerantau: true,
    photoUrl: '',
    phone: '085712345603',
    email: 'rina.wulan@email.com',
    bio: 'Anak ketiga dari tiga bersaudara Pak Anshori & Ibu Dewi. Bekerja sebagai akuntan di sebuah perusahaan multinasional di Jakarta. Gemar kulineran dan traveling.',
    memories: [
      'Mbak Rina adalah perwakilan keluarga yang merantau paling jauh ke Jakarta, namun paling rajin video call dengan Mbah Siti.'
    ],
    generation: 2
  },
  {
    id: 'p-g2-4',
    name: 'Aditya Pratama',
    nickname: 'Adit',
    gender: 'M',
    birthDate: '1993-02-28',
    domicile: 'Jakarta',
    isMerantau: true,
    photoUrl: '',
    phone: '085712345604',
    bio: 'Suami dari Rina Wulandari. Bekerja sebagai analis keuangan di Jakarta.',
    generation: 2
  },

  // Keturunan dari Sri Wahyuni (Anak ke-2):
  {
    id: 'p-g2-5',
    name: 'Angga Saputra',
    nickname: 'Angga',
    gender: 'M',
    birthDate: '1993-03-18',
    domicile: 'Surabaya',
    isMerantau: true,
    photoUrl: '',
    phone: '085712345605',
    email: 'angga.saputra@email.com',
    bio: 'Cucu ketiga Mbah Hardjo. Bekerja sebagai arsitek di Surabaya. Menyukai seni musik dan mendesain interior.',
    generation: 2
  },
  {
    id: 'p-g2-6',
    name: 'Fitri Handayani',
    nickname: 'Fitri',
    gender: 'F',
    birthDate: '1995-12-05',
    domicile: 'Surabaya',
    isMerantau: true,
    photoUrl: '',
    phone: '085712345606',
    bio: 'Istri dari Angga Saputra. Bekerja sebagai guru TK di Surabaya yang penyabar dan kreatif.',
    generation: 2
  },
  {
    id: 'p-g2-7',
    name: 'Maya Indah',
    nickname: 'Maya',
    gender: 'F',
    birthDate: '1998-09-02',
    domicile: 'Yogyakarta',
    isMerantau: true,
    photoUrl: '',
    phone: '085712345607',
    email: 'maya.indah@email.com',
    bio: 'Cucu keempat Mbah Hardjo. Sedang menempuh kuliah S2 Psikologi di Universitas Gadjah Mada Yogyakarta. Aktif dalam riset psikologi perkembangan anak.',
    generation: 2
  },

  // Keturunan dari Ahmad Hidayat (Anak ke-3):
  {
    id: 'p-g2-8',
    name: 'Faisal Rahman',
    nickname: 'Faisal',
    gender: 'M',
    birthDate: '1999-07-25',
    domicile: 'Bandung',
    isMerantau: true,
    photoUrl: '',
    phone: '085712345608',
    email: 'faisal.rahman@email.com',
    bio: 'Cucu kelima Mbah Hardjo. Bekerja sebagai software engineer di sebuah startup teknologi di Bandung. Gemar merakit PC dan bermain game strategi.',
    generation: 2
  },
  {
    id: 'p-g2-9',
    name: 'Lia Kartika',
    nickname: 'Lia',
    gender: 'F',
    birthDate: '2001-01-14',
    domicile: 'Bandung',
    isMerantau: true,
    photoUrl: '',
    phone: '085712345609',
    bio: 'Istri dari Faisal Rahman. Bekerja sebagai perancang grafis lepas yang sangat berbakat.',
    generation: 2
  },
  {
    id: 'p-g2-10',
    name: 'Annisa Fitri',
    nickname: 'Annis',
    gender: 'F',
    birthDate: '2002-12-12',
    domicile: 'Surabaya',
    isMerantau: true,
    photoUrl: '',
    phone: '085712345610',
    email: 'annisa.fitri@email.com',
    bio: 'Cucu keenam Mbah Hardjo. Baru saja lulus dari Sarjana Ilmu Komunikasi Universitas Airlangga Surabaya. Sedang magang di bidang Public Relations.',
    generation: 2
  },

  // Keturunan dari Anik Wijayanti (Anak Bungsu):
  {
    id: 'p-g2-11',
    name: 'Eko Prasetyo',
    nickname: 'Eko',
    gender: 'M',
    birthDate: '2003-01-20',
    domicile: 'Kediri',
    isMerantau: false,
    photoUrl: '',
    phone: '085712345611',
    email: 'eko.prasetyo@email.com',
    bio: 'Cucu ketujuh Mbah Hardjo. Mahasiswa Universitas Brawijaya Kediri jurusan Agribisnis. Sering membantu mengurus kebun buah melon di pekarangan belakang rumah Kediri.',
    generation: 2
  },
  {
    id: 'p-g2-12',
    name: 'Dwi Cahyo',
    nickname: 'Dwi',
    gender: 'M',
    birthDate: '2006-10-05',
    domicile: 'Kediri',
    isMerantau: false,
    photoUrl: '',
    phone: '085712345612',
    bio: 'Cucu kedelapan Mbah Hardjo. Siswa SMA Negeri di Kediri. Aktif di klub basket sekolah dan sangat gemar menggambar komik jepang.',
    generation: 2
  },

  // Generasi 3: Cicit-cicit Mbah Hardjo & Mbah Siti
  // Anak dari Rudi Hermawan & Siska Amelia:
  {
    id: 'p-g3-1',
    name: 'Daffa Arya Prasetya',
    nickname: 'Daffa',
    gender: 'M',
    birthDate: '2016-10-18',
    domicile: 'Malang',
    isMerantau: true,
    photoUrl: '',
    bio: 'Cicit pertama Mbah Hardjo. Saat ini duduk di bangku SD di Malang. Gemar merakit Lego dan bermain sepak bola.',
    generation: 3
  },
  {
    id: 'p-g3-2',
    name: 'Keysha Putri Hermawan',
    nickname: 'Keysha',
    gender: 'F',
    birthDate: '2020-04-30',
    domicile: 'Malang',
    isMerantau: true,
    photoUrl: '',
    bio: 'Cicit kedua Mbah Hardjo. Balita yang sangat aktif, lincah, gemar bernyanyi lagu anak-anak, dan menari.',
    generation: 3
  },

  // Anak dari Rina Wulandari & Aditya Pratama:
  {
    id: 'p-g3-3',
    name: 'Alvaro Pratama',
    nickname: 'Alvaro',
    gender: 'M',
    birthDate: '2023-01-15',
    domicile: 'Jakarta',
    isMerantau: true,
    photoUrl: '',
    bio: 'Cicit ketiga Mbah Hardjo. Balita mungil nan ceria yang lahir di Jakarta. Sangat suka melihat video kereta api di Youtube.',
    generation: 3
  },

  // Anak dari Angga Saputra & Fitri Handayani:
  {
    id: 'p-g3-4',
    name: 'Arjuna Saputra',
    nickname: 'Juna',
    gender: 'M',
    birthDate: '2024-05-12',
    domicile: 'Surabaya',
    isMerantau: true,
    photoUrl: '',
    bio: 'Cicit keempat Mbah Hardjo. Bayi sehat yang membawa kebahagiaan baru di tengah keluarga besar di Surabaya.',
    generation: 3
  },

  // --- PIHAK IBU (MATERNAL SIDE) ---
  // Generasi 0: Kakek-Nenek dari Pihak Ibu (Maternal Roots)
  {
    id: 'p-m-g0-1',
    name: 'Sastrowardoyo',
    nickname: 'Mbah Sastro',
    gender: 'M',
    birthDate: '1941-03-18',
    domicile: 'Nganjuk',
    isMerantau: false,
    photoUrl: '',
    phone: '',
    email: '',
    bio: 'Kakek dari pihak ibu (ayah dari Ibu Dewi Lestari). Beliau adalah pensiunan dinas kehutanan (Perhutani) di Nganjuk. Penyabar, gemar menanam pohon jati, dan ahli dalam pranata mangsa (penanggalan musim Jawa).',
    memories: [
      'Mbah Sastro selalu membawa cucu-cucunya jalan-jalan ke hutan jati dekat rumah di Nganjuk setiap pagi hari raya.',
      'Senang sekali mengajarkan cara mencangkok pohon buah-buahan.'
    ],
    generation: 0
  },
  {
    id: 'p-m-g0-2',
    name: 'Martini',
    nickname: 'Mbah Martini',
    gender: 'F',
    birthDate: '1945-07-22',
    domicile: 'Nganjuk',
    isMerantau: false,
    photoUrl: '',
    phone: '081234567880',
    email: '',
    bio: 'Nenek dari pihak ibu. Pembuat batik tulis motif klasik khas Nganjukan. Sosok yang sangat lembut tutur katanya, telaten, dan selalu mendoakan keselamatan seluruh anak cucu perantaunya.',
    memories: [
      'Mbah Martini memiliki kain batik tulis buatan sendiri yang dihadiahkan kepada setiap anak mantunya.',
      'Selalu membuatkan jenang sumsum hangat setiap kali cucunya datang ke Nganjuk.'
    ],
    generation: 0
  },

  // Generasi 1: Saudara-saudara Ibu Dewi Lestari (Anak Mbah Sastro & Mbah Martini)
  // Note: Dewi Lestari sendiri (p-g1-2) sudah didefinisikan sebagai istri Pak Budi Santoso (p-g1-1)
  {
    id: 'p-m-g1-1',
    name: 'Wibowo Sastrowardoyo',
    nickname: 'Pak Wibowo',
    gender: 'M',
    birthDate: '1966-11-05',
    domicile: 'Nganjuk',
    isMerantau: false,
    photoUrl: '',
    phone: '081234567881',
    email: 'wibowo.sastro@email.com',
    bio: 'Anak sulung Mbah Sastro. Mengelola perkebunan mangga dan bawang merah di Nganjuk. Menjadi tulang punggung pengurus rumah tangga keluarga besar pihak Sastrowardoyo.',
    generation: 1
  },
  {
    id: 'p-m-g1-2',
    name: 'Retno Willis',
    nickname: 'Bu Retno',
    gender: 'F',
    birthDate: '1973-04-14',
    domicile: 'Nganjuk',
    isMerantau: false,
    photoUrl: '',
    phone: '081234567882',
    bio: 'Istri dari Pak Wibowo Sastrowardoyo. Bekerja sebagai guru matematika SMA di Nganjuk.',
    generation: 1
  },
  {
    id: 'p-m-g1-3',
    name: 'Indah Lestari',
    nickname: 'Tante Indah',
    gender: 'F',
    birthDate: '1974-08-28',
    domicile: 'Kediri',
    isMerantau: true, // Merantau dari Nganjuk ke Kediri
    photoUrl: '',
    phone: '081234567883',
    email: 'indah.lestari@email.com',
    bio: 'Anak bungsu Mbah Sastro. Bekerja sebagai bidan di rumah sakit daerah Kediri. Sangat ramah dan menjadi tempat konsultasi kesehatan seluruh keluarga.',
    generation: 1
  },
  {
    id: 'p-m-g1-4',
    name: 'Heri Prasetyo',
    nickname: 'Om Heri',
    gender: 'M',
    birthDate: '1971-02-10',
    domicile: 'Kediri',
    isMerantau: true,
    photoUrl: '',
    phone: '081234567884',
    bio: 'Suami dari Tante Indah Lestari. Bekerja sebagai supervisor di salah satu pabrik gula di Kediri.',
    generation: 1
  },

  // Generasi 2: Sepupu-sepupu Umam dari Pihak Ibu
  // Anak dari Wibowo Sastrowardoyo & Retno Willis:
  {
    id: 'p-m-g2-1',
    name: 'Bagas Sastrowardoyo',
    nickname: 'Bagas',
    gender: 'M',
    birthDate: '1998-06-12',
    domicile: 'Nganjuk',
    isMerantau: false,
    photoUrl: '',
    phone: '085812345701',
    email: 'bagas.sastro@email.com',
    bio: 'Cucu Mbah Sastro. Membantu ayahnya mengelola pertanian bawang merah modern dengan teknik penyiraman otomatis. Rekan diskusi pertanian yang cerdas.',
    generation: 2
  },
  {
    id: 'p-m-g2-2',
    name: 'Dinda Sastrowardoyo',
    nickname: 'Dinda',
    gender: 'F',
    birthDate: '2002-09-18',
    domicile: 'Malang',
    isMerantau: true, // Kuliah di Malang
    photoUrl: '',
    phone: '085812345702',
    email: 'dinda.sastro@email.com',
    bio: 'Cucu Mbah Sastro. Sedang menempuh pendidikan kedokteran di Universitas Brawijaya Malang. Bertekad menjadi dokter keluarga yang berdedikasi.',
    generation: 2
  },

  // Anak dari Indah Lestari & Heri Prasetyo:
  {
    id: 'p-m-g2-3',
    name: 'Aditya Prasetyo',
    nickname: 'Adit Nganjuk',
    gender: 'M',
    birthDate: '1999-03-24',
    domicile: 'Surabaya',
    isMerantau: true, // Kuliah/Kerja di Surabaya
    photoUrl: '',
    phone: '085812345703',
    email: 'adit.prast@email.com',
    bio: 'Cucu Mbah Sastro. Bekerja di bidang desain produk kreatif di Surabaya. Hobi menggambar sketsa bangunan tua kolonial.',
    generation: 2
  },

  // JEMBATAN KEDUA BELAH PIHAK KELUARGA (AYAH & IBU)
  // Anaknya Pak Anshori (Pihak Ayah) & Ibu Dewi Lestari (Pihak Ibu)
  {
    id: 'p-g2-umam',
    name: 'Umam',
    nickname: 'Umam',
    gender: 'M',
    birthDate: '1995-11-10',
    domicile: 'Surabaya',
    isMerantau: true, // Merantau dari Kediri/Nganjuk ke Surabaya
    photoUrl: '',
    phone: '081234567899',
    email: 'umam@email.com',
    bio: 'Cucu dari Mbah Hardjowidjojo (pihak Ayah) sekaligus cucu dari Mbah Sastrowardoyo (pihak Ibu). Anak kedua dari tiga bersaudara Pak Anshori & Ibu Dewi. Bekerja sebagai Rekayasa Perangkat Lunak di Surabaya yang merancang platform Dulurku ini untuk menyatukan seluruh kerabat lintas generasi dan lintas kota.',
    memories: [
      'Ingat sekali saat mudik lebaran, diajak Mbah Hardjo minum teh sore di teras Kediri, lalu besoknya diajak Mbah Sastro melihat kebun jati di Nganjuk.',
      'Paling suka mengumpulkan seluruh sepupu dari kedua belah pihak untuk berdiskusi teknologi dan silaturahmi digital.'
    ],
    generation: 2
  }
];

// Relasi Pernikahan (Spouse Relationships)
export const initialRelationships: Relationship[] = [
  // Generasi 0
  {
    id: 'r-g0-1',
    personIdA: 'p-g0-1',
    personIdB: 'p-g0-2',
    type: 'spouse',
    marriageDate: '1963-05-20',
    status: 'widowed' // Mbah Hardjo telah berpulang
  },
  // Generasi 1
  {
    id: 'r-g1-1',
    personIdA: 'p-g1-1',
    personIdB: 'p-g1-2',
    type: 'spouse',
    marriageDate: '1990-06-10',
    status: 'married'
  },
  {
    id: 'r-g1-2',
    personIdA: 'p-g1-4', // Alm Joko Widodo
    personIdB: 'p-g1-3', // Bu Sri Wahyuni
    type: 'spouse',
    marriageDate: '1991-09-15',
    status: 'widowed'
  },
  {
    id: 'r-g1-3',
    personIdA: 'p-g1-5',
    personIdB: 'p-g1-6',
    type: 'spouse',
    marriageDate: '1998-05-24',
    status: 'married'
  },
  {
    id: 'r-g1-4',
    personIdA: 'p-g1-8',
    personIdB: 'p-g1-7',
    type: 'spouse',
    marriageDate: '2001-11-18',
    status: 'married'
  },
  // Generasi 2
  {
    id: 'r-g2-1',
    personIdA: 'p-g2-1',
    personIdB: 'p-g2-2',
    type: 'spouse',
    marriageDate: '2015-08-08',
    status: 'married'
  },
  {
    id: 'r-g2-2',
    personIdA: 'p-g2-4',
    personIdB: 'p-g2-3',
    type: 'spouse',
    marriageDate: '2021-03-06',
    status: 'married'
  },
  {
    id: 'r-g2-3',
    personIdA: 'p-g2-5',
    personIdB: 'p-g2-6',
    type: 'spouse',
    marriageDate: '2022-02-22',
    status: 'married'
  },
    {
      id: 'r-g2-4',
      personIdA: 'p-g2-8',
      personIdB: 'p-g2-9',
      type: 'spouse',
      marriageDate: '2025-01-11',
      status: 'married'
    },
    
    // --- PERNIKAHAN PIHAK IBU ---
    {
      id: 'r-m-g0-1',
      personIdA: 'p-m-g0-1',
      personIdB: 'p-m-g0-2',
      type: 'spouse',
      marriageDate: '1966-08-12',
      status: 'married'
    },
    {
      id: 'r-m-g1-1',
      personIdA: 'p-m-g1-1',
      personIdB: 'p-m-g1-2',
      type: 'spouse',
      marriageDate: '1995-10-20',
      status: 'married'
    },
    {
      id: 'r-m-g1-2',
      personIdA: 'p-m-g1-4',
      personIdB: 'p-m-g1-3',
      type: 'spouse',
      marriageDate: '1996-05-18',
      status: 'married'
    }
  ];

// Relasi Orang Tua ke Anak (Parent-Child Relations)
export const initialParentChildRelations: ParentChild[] = [
  // Anak Mbah Hardjo & Mbah Siti
  { parentId: 'p-g0-1', childId: 'p-g1-s1' }, // Mbah Hardjo ke Pak Eko (Anak 1)
  { parentId: 'p-g0-2', childId: 'p-g1-s1' }, // Mbah Siti ke Pak Eko
  
  { parentId: 'p-g0-1', childId: 'p-g1-3' }, // Mbah Hardjo ke Bu Sri (Anak 2)
  { parentId: 'p-g0-2', childId: 'p-g1-3' }, // Mbah Siti ke Bu Sri
  
  { parentId: 'p-g0-1', childId: 'p-g1-s2' }, // Mbah Hardjo ke Bu Dwi (Anak 3)
  { parentId: 'p-g0-2', childId: 'p-g1-s2' }, // Mbah Siti ke Bu Dwi
  
  { parentId: 'p-g0-1', childId: 'p-g1-5' }, // Mbah Hardjo ke Pak Ahmad (Anak 4)
  { parentId: 'p-g0-2', childId: 'p-g1-5' }, // Mbah Siti ke Pak Ahmad
  
  { parentId: 'p-g0-1', childId: 'p-g1-s3' }, // Mbah Hardjo ke Om Tri (Anak 5)
  { parentId: 'p-g0-2', childId: 'p-g1-s3' }, // Mbah Siti ke Om Tri
  
  { parentId: 'p-g0-1', childId: 'p-g1-1' }, // Mbah Hardjo ke Pak Anshori (Anak 6 - Ayah)
  { parentId: 'p-g0-2', childId: 'p-g1-1' }, // Mbah Siti ke Pak Anshori
  
  { parentId: 'p-g0-1', childId: 'p-g1-7' }, // Mbah Hardjo ke Bu Anik (Anak 7 - Bungsu)
  { parentId: 'p-g0-2', childId: 'p-g1-7' }, // Mbah Siti ke Bu Anik

  // Anak Pak Anshori & Bu Dewi (Grandchildren Gen 2)
  { parentId: 'p-g1-1', childId: 'p-g2-1' }, // Pak Anshori ke Rudi (Anak 1)
  { parentId: 'p-g1-2', childId: 'p-g2-1' }, // Bu Dewi ke Rudi
  
  { parentId: 'p-g1-1', childId: 'p-g2-umam' }, // Pak Anshori ke Umam (Anak 2 - Saya)
  { parentId: 'p-g1-2', childId: 'p-g2-umam' }, // Bu Dewi ke Umam
  
  { parentId: 'p-g1-1', childId: 'p-g2-3' }, // Pak Anshori ke Rina (Anak 3)
  { parentId: 'p-g1-2', childId: 'p-g2-3' }, // Bu Dewi ke Rina

  // Anak Bu Sri & Pak Joko (Grandchildren Gen 2)
  { parentId: 'p-g1-3', childId: 'p-g2-5' }, // Bu Sri ke Angga
  { parentId: 'p-g1-4', childId: 'p-g2-5' }, // Pak Joko ke Angga
  
  { parentId: 'p-g1-3', childId: 'p-g2-7' }, // Bu Sri ke Maya
  { parentId: 'p-g1-4', childId: 'p-g2-7' }, // Pak Joko ke Maya

  // Anak Pak Ahmad & Bu Siti Sidoarjo (Grandchildren Gen 2)
  { parentId: 'p-g1-5', childId: 'p-g2-8' }, // Pak Ahmad ke Faisal
  { parentId: 'p-g1-6', childId: 'p-g2-8' }, // Bu Siti Sidoarjo ke Faisal

  { parentId: 'p-g1-5', childId: 'p-g2-10' }, // Pak Ahmad ke Annisa
  { parentId: 'p-g1-6', childId: 'p-g2-10' }, // Bu Siti Sidoarjo ke Annisa

  // Anak Bu Anik & Pak Bambang (Grandchildren Gen 2)
  { parentId: 'p-g1-7', childId: 'p-g2-11' }, // Bu Anik ke Eko
  { parentId: 'p-g1-8', childId: 'p-g2-11' }, // Pak Bambang ke Eko

  { parentId: 'p-g1-7', childId: 'p-g2-12' }, // Bu Anik ke Dwi
  { parentId: 'p-g1-8', childId: 'p-g2-12' }, // Pak Bambang ke Dwi

  // Anak Rudi Hermawan & Siska Amelia (Great-Grandchildren Gen 3)
  { parentId: 'p-g2-1', childId: 'p-g3-1' }, // Rudi ke Daffa
  { parentId: 'p-g2-2', childId: 'p-g3-1' }, // Siska ke Daffa

  { parentId: 'p-g2-1', childId: 'p-g3-2' }, // Rudi ke Keysha
  { parentId: 'p-g2-2', childId: 'p-g3-2' }, // Siska ke Keysha

  // Anak Rina Wulandari & Aditya Pratama (Great-Grandchildren Gen 3)
  { parentId: 'p-g2-3', childId: 'p-g3-3' }, // Rina ke Alvaro
  { parentId: 'p-g2-4', childId: 'p-g3-3' }, // Adit ke Alvaro

  // Anak Angga Saputra & Fitri Handayani (Great-Grandchildren Gen 3)
  { parentId: 'p-g2-5', childId: 'p-g3-4' }, // Angga ke Arjuna
  { parentId: 'p-g2-6', childId: 'p-g3-4' }, // Fitri ke Arjuna

  // --- RELASI ORANG TUA - ANAK PIHAK IBU ---
  // Anak Mbah Sastro & Mbah Martini (Pihak Ibu)
  { parentId: 'p-m-g0-1', childId: 'p-m-g1-1' }, // Mbah Sastro ke Pak Wibowo (Anak 1)
  { parentId: 'p-m-g0-2', childId: 'p-m-g1-1' }, // Mbah Martini ke Pak Wibowo
  { parentId: 'p-m-g0-1', childId: 'p-g1-2' }, // Mbah Sastro ke Ibu Dewi (Anak 2)
  { parentId: 'p-m-g0-2', childId: 'p-g1-2' }, // Mbah Martini ke Ibu Dewi
  { parentId: 'p-m-g0-1', childId: 'p-m-g1-3' }, // Mbah Sastro ke Tante Indah (Anak 3)
  { parentId: 'p-m-g0-2', childId: 'p-m-g1-3' }, // Mbah Martini ke Tante Indah

  // Anak Pak Wibowo & Bu Retno (Gen 2)
  { parentId: 'p-m-g1-1', childId: 'p-m-g2-1' }, // Pak Wibowo ke Bagas
  { parentId: 'p-m-g1-2', childId: 'p-m-g2-1' }, // Bu Retno ke Bagas
  { parentId: 'p-m-g1-1', childId: 'p-m-g2-2' }, // Pak Wibowo ke Dinda
  { parentId: 'p-m-g1-2', childId: 'p-m-g2-2' }, // Bu Retno ke Dinda

  // Anak Tante Indah & Om Heri (Gen 2)
  { parentId: 'p-m-g1-3', childId: 'p-m-g2-3' }, // Tante Indah ke Adit
  { parentId: 'p-m-g1-4', childId: 'p-m-g2-3' }, // Om Heri ke Adit
];

// Acara Awal Kalender Guyub
export const initialEvents: FamilyEvent[] = [
  {
    id: 'e-1',
    title: 'Ulang Tahun Mbah Siti Aminah',
    type: 'birthday',
    date: '1943-05-10',
    description: 'Hari kelahiran pusat kehangatan keluarga besar kita, Mbah Siti Aminah. Rencana kumpul keluarga sederhana dan potong tumpeng di Kediri.',
    location: 'Rumah Utama Kediri',
    personId: 'p-g0-2'
  },
  {
    id: 'e-2',
    title: 'Arisan & Kumpul Keluarga Rutin 3 Bulanan',
    type: 'gathering',
    date: '2026-07-12', // Jadwal mendatang
    description: 'Silaturahmi berkala seluruh keluarga besar. Giliran bertindak sebagai tuan rumah adalah keluarga Bu Sri Wahyuni di Malang. Harap konfirmasi kehadiran agar menu bakso khas Malang bisa dihitung dengan pas!',
    location: 'Kediaman Bu Sri Wahyuni, Perumahan Sawojajar, Malang',
  },
  {
    id: 'e-3',
    title: 'Pernikahan Emas Mbah Hardjo & Mbah Siti (Kenangan)',
    type: 'anniversary',
    date: '1963-05-20',
    description: 'Hari peringatan akad nikah leluhur utama kita. Menjadi pengingat keteladanan kesetiaan dan kebersamaan.',
    location: 'Kediri',
    personId: 'p-g0-1'
  },
  {
    id: 'e-4',
    title: 'Ulang Tahun Mas Rudi Hermawan',
    type: 'birthday',
    date: '1992-05-15',
    description: 'Hari ulang tahun cucu sulung, Rudi Hermawan. Semoga panjang umur dan sukses memimpin proyek-proyeknya!',
    location: 'Malang',
    personId: 'p-g2-1'
  },
  {
    id: 'e-5',
    title: 'Anniversary Pernikahan Rudi & Siska',
    type: 'anniversary',
    date: '2015-08-08',
    description: 'Selamat merayakan hari ulang tahun pernikahan untuk pasangan Rudi & Siska yang ke-11.',
    location: 'Malang',
    personId: 'p-g2-1'
  },
  {
    id: 'e-6',
    title: 'Ziarah Bersama Makam Mbah Hardjo & Pak Joko',
    type: 'gathering',
    date: '2026-08-20', // Ziarah tahunan menjelang kumpul besar
    description: 'Doa bersama dan nyekar di makam keluarga Kediri dan Malang. Acara dikoordinasikan oleh Bu Anik di Kediri.',
    location: 'Makam Keluarga Kediri',
  }
];

// Pengumuman Awal
export const initialAnnouncements: Announcement[] = [
  {
    id: 'a-1',
    title: 'Selamat Atas Kelahiran Cicit Baru: Arjuna Saputra!',
    content: 'Alhamdulillah, telah lahir dengan sehat cicit keempat dari keluarga besar kita, putra dari pasangan Angga Saputra & Fitri Handayani pada tanggal 12 Mei 2024 di Surabaya. Diberi nama Arjuna Saputra. Semoga menjadi anak sholeh yang berbakti pada orang tua dan berguna bagi sesama. Amin!',
    date: '2024-05-15',
    author: 'Bu Anik Wijayanti',
    category: 'kabar_gembira'
  },
  {
    id: 'a-2',
    title: 'Rencana Reuni Akbar & Syukuran Akhir Tahun 2026',
    content: 'Diberitahukan kepada seluruh dulur, baik yang menetap di Kediri maupun yang berada di perantauan (Surabaya, Malang, Sidoarjo, Bandung, Jakarta). Kita berencana mengadakan Reuni Akbar bertempat di Rumah Utama Kediri pada libur akhir tahun nanti, sekitar tanggal 25-27 Desember 2026. Mohon untuk mengosongkan jadwal pada tanggal tersebut. Detail susunan acara dan kontribusi akan segera diumumkan oleh panitia kecil (diketuai Mas Rudi). Guyub rukun selalu!',
    date: '2026-06-25',
    author: 'Pak Anshori',
    category: 'reuni'
  },
  {
    id: 'a-3',
    title: 'Update Iuran Kas Arisan Keluarga',
    content: 'Mengingatkan untuk pengurus keluarga bahwa iuran rutin kas bulanan arisan dapat disalurkan melalui transfer ke rekening Bank Jatim atas nama Bu Anik Wijayanti. Uang kas ini digunakan untuk bantuan sosial dulur yang sakit, pemeliharaan makam leluhur, serta dana operasional kumpul keluarga. Laporan keuangan bulanan dapat diakses secara terbuka melalui dokumen bersama kita. Matur nuwun.',
    date: '2026-06-20',
    author: 'Bu Anik Wijayanti',
    category: 'arisan'
  }
];

// Buku Tamu Awal
export const initialGuestbook: GuestbookEntry[] = [
  {
    id: 'g-1',
    authorName: 'Rina Wulandari (Jakarta)',
    message: 'Kangen sekali suasana sore di teras rumah Kediri sambil minum teh hangat buatan Mbah Siti. Titip peluk cium buat Mbah Siti nggih Bude Anik, semoga Mbah Siti selalu sehat wal afiat di Kediri. Insyaallah akhir tahun ini kami sekeluarga mudik lengkap membawa Alvaro!',
    timestamp: '2026-06-26 21:30',
    avatarColor: 'bg-amber-600'
  },
  {
    id: 'g-2',
    authorName: 'Faisal Rahman (Bandung)',
    message: 'Halo seluruh keluarga besar! Melaporkan dari Bandung, kondisi aman terkendali. Senang sekali ada website Dulurku ini, jadi bisa lebih gampang menghafal nama cicit-cicit baru yang kemarin pas lebaran belum sempat ketemu langsung. Top tenan!',
    timestamp: '2026-06-25 10:15',
    avatarColor: 'bg-emerald-600'
  },
  {
    id: 'g-3',
    authorName: 'Mbah Siti Aminah',
    message: 'Mbah seneng banget moco tulisan anak cucu kabeh nang kene. Mbah ndongakno muga-muga kabeh sing merantau diparingi seger waras, rejeki lancar, lan tetep eling karo dulur lan asal-usule. Mbah ngenteni tekamu nang Kediri akhir tahun yo, le, nduk.',
    timestamp: '2026-06-24 16:40',
    avatarColor: 'bg-red-600'
  },
  {
    id: 'g-4',
    authorName: 'Eko Prasetyo (Kediri)',
    message: 'Ayo dulur-dulur sing merantau podo mampir Kediri! Melon nang mburi omah pas panen akeh iki, siap dipetik bareng-bareng nek pas reuni akhir tahun nanti. Kabeh wis tak rawat karo bapak.',
    timestamp: '2026-06-23 09:00',
    avatarColor: 'bg-blue-600'
  }
];
