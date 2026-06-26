export interface Person {
  id: string;
  name: string;
  nickname?: string;
  gender: 'M' | 'F';
  birthDate: string; // format: YYYY-MM-DD
  birthPlace?: string;
  deathDate?: string; // format: YYYY-MM-DD (jika sudah meninggal)
  domicile: string; // Kota domisili saat ini (contoh: Surabaya, Malang, dll.)
  isMerantau: boolean;
  photoUrl?: string; // Tautan foto profil atau avatar
  phone?: string;
  email?: string;
  bio?: string; // Kutipan ringkas atau biografi singkat
  memories?: string[]; // Kumpulan kenangan/cerita hangat
  generation: number; // 0: Kakek-Nenek Buyut (Root), 1: Anak, 2: Cucu, 3: Cicit
}

export interface Relationship {
  id: string;
  personIdA: string; // Suami / Istri A (id anggota)
  personIdB: string; // Suami / Istri B (id anggota)
  type: 'spouse';
  marriageDate?: string; // format: YYYY-MM-DD
  divorceDate?: string; // format: YYYY-MM-DD (jika bercerai)
  status: 'married' | 'widowed' | 'divorced';
}

export interface ParentChild {
  parentId: string; // id orang tua (ayah/ibu)
  childId: string; // id anak
}

export interface FamilyEvent {
  id: string;
  title: string;
  type: 'birthday' | 'anniversary' | 'gathering' | 'other';
  date: string; // format: YYYY-MM-DD atau MM-DD (jika tahunan)
  description?: string;
  location?: string;
  personId?: string; // jika terasosiasi dengan anggota tertentu (seperti ulang tahun)
}

export interface GuestbookEntry {
  id: string;
  authorName: string;
  message: string;
  timestamp: string; // format ISO String atau YYYY-MM-DD HH:mm
  avatarColor: string; // Hex color atau Tailwind class name untuk latar avatar
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  date: string; // format: YYYY-MM-DD
  author: string;
  category: 'reuni' | 'arisan' | 'kabar_duka' | 'kabar_gembira' | 'umum';
}

export interface FamilyState {
  members: Person[];
  relationships: Relationship[];
  parentChildRelations: ParentChild[];
  events: FamilyEvent[];
  announcements: Announcement[];
  guestbook: GuestbookEntry[];
}
