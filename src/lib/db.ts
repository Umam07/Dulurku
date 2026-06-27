import { join } from 'path';
// @ts-ignore
import { DatabaseSync } from 'node:sqlite';
import { 
  initialMembers, 
  initialRelationships, 
  initialParentChildRelations, 
  initialEvents, 
  initialAnnouncements, 
  initialGuestbook 
} from '../data/initialData';

const dbPath = join(process.cwd(), 'dulurku.db');
const db = new DatabaseSync(dbPath);

export function initDb() {
  // Buat tabel-tabel silsilah
  db.exec(`
    CREATE TABLE IF NOT EXISTS members (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      nickname TEXT,
      gender TEXT NOT NULL,
      birthDate TEXT NOT NULL,
      birthPlace TEXT,
      deathDate TEXT,
      domicile TEXT NOT NULL,
      isMerantau INTEGER NOT NULL,
      photoUrl TEXT,
      phone TEXT,
      email TEXT,
      bio TEXT,
      memories TEXT,
      generation INTEGER NOT NULL
    );

    CREATE TABLE IF NOT EXISTS relationships (
      id TEXT PRIMARY KEY,
      personIdA TEXT NOT NULL,
      personIdB TEXT NOT NULL,
      type TEXT NOT NULL,
      marriageDate TEXT,
      status TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS parent_child_relations (
      parentId TEXT NOT NULL,
      childId TEXT NOT NULL,
      PRIMARY KEY (parentId, childId)
    );

    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      type TEXT NOT NULL,
      date TEXT NOT NULL,
      description TEXT,
      location TEXT,
      personId TEXT
    );

    CREATE TABLE IF NOT EXISTS announcements (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      date TEXT NOT NULL,
      author TEXT NOT NULL,
      category TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS guestbook (
      id TEXT PRIMARY KEY,
      authorName TEXT NOT NULL,
      message TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      avatarColor TEXT
    );
  `);

  // Periksa apakah tabel members kosong, jika ya, isi dengan initialData
  const countStmt = db.prepare('SELECT COUNT(*) as count FROM members');
  const result = countStmt.get() as { count: number };
  if (result.count === 0) {
    seedDb();
  }
}

function seedDb() {
  // Isi data anggota
  const insertMember = db.prepare(`
    INSERT INTO members (id, name, nickname, gender, birthDate, birthPlace, deathDate, domicile, isMerantau, photoUrl, phone, email, bio, memories, generation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  for (const m of initialMembers) {
    insertMember.run(
      m.id,
      m.name,
      m.nickname || null,
      m.gender,
      m.birthDate,
      m.birthPlace || null,
      m.deathDate || null,
      m.domicile,
      m.isMerantau ? 1 : 0,
      m.photoUrl || null,
      m.phone || null,
      m.email || null,
      m.bio || null,
      JSON.stringify(m.memories || []),
      m.generation
    );
  }

  // Isi data pernikahan
  const insertRel = db.prepare(`
    INSERT INTO relationships (id, personIdA, personIdB, type, marriageDate, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const r of initialRelationships) {
    insertRel.run(r.id, r.personIdA, r.personIdB, r.type, r.marriageDate || null, r.status);
  }

  // Isi data relasi orang tua - anak
  const insertPC = db.prepare(`
    INSERT INTO parent_child_relations (parentId, childId)
    VALUES (?, ?)
  `);
  for (const pc of initialParentChildRelations) {
    insertPC.run(pc.parentId, pc.childId);
  }

  // Isi data acara kalender
  const insertEvent = db.prepare(`
    INSERT INTO events (id, title, type, date, description, location, personId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  for (const e of initialEvents) {
    insertEvent.run(e.id, e.title, e.type, e.date, e.description || null, e.location || null, e.personId || null);
  }

  // Isi data wara-wara/pengumuman
  const insertAnn = db.prepare(`
    INSERT INTO announcements (id, title, content, date, author, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  for (const a of initialAnnouncements) {
    insertAnn.run(a.id, a.title, a.content, a.date, a.author, a.category);
  }

  // Isi data buku tamu
  const insertGB = db.prepare(`
    INSERT INTO guestbook (id, authorName, message, timestamp, avatarColor)
    VALUES (?, ?, ?, ?, ?)
  `);
  for (const g of initialGuestbook) {
    insertGB.run(g.id, g.authorName, g.message, g.timestamp, g.avatarColor || null);
  }
}

export function getFamilyState() {
  initDb(); // Pastikan tabel & data inisial terbentuk
  
  const rawMembers = db.prepare('SELECT * FROM members').all() as any[];
  const members = rawMembers.map(m => ({
    id: m.id,
    name: m.name,
    nickname: m.nickname || undefined,
    gender: m.gender as 'M' | 'F',
    birthDate: m.birthDate,
    birthPlace: m.birthPlace || undefined,
    deathDate: m.deathDate || undefined,
    domicile: m.domicile,
    isMerantau: m.isMerantau === 1,
    photoUrl: m.photoUrl || undefined,
    phone: m.phone || undefined,
    email: m.email || undefined,
    bio: m.bio || undefined,
    memories: JSON.parse(m.memories || '[]') as string[],
    generation: m.generation
  }));

  const rawRelationships = db.prepare('SELECT * FROM relationships').all() as any[];
  const relationships = rawRelationships.map(r => ({
    id: r.id,
    personIdA: r.personIdA,
    personIdB: r.personIdB,
    type: r.type as 'spouse',
    marriageDate: r.marriageDate || undefined,
    status: r.status as 'married' | 'widowed' | 'divorced'
  }));

  const parentChildRelations = db.prepare('SELECT * FROM parent_child_relations').all() as any[];

  const rawEvents = db.prepare('SELECT * FROM events').all() as any[];
  const events = rawEvents.map(e => ({
    id: e.id,
    title: e.title,
    type: e.type as 'birthday' | 'anniversary' | 'gathering' | 'other',
    date: e.date,
    description: e.description || undefined,
    location: e.location || undefined,
    personId: e.personId || undefined
  }));

  const rawAnnouncements = db.prepare('SELECT * FROM announcements').all() as any[];
  const announcements = rawAnnouncements.map(a => ({
    id: a.id,
    title: a.title,
    content: a.content,
    date: a.date,
    author: a.author,
    category: a.category as 'reuni' | 'arisan' | 'kabar_duka' | 'kabar_gembira' | 'umum'
  }));

  const rawGuestbook = db.prepare('SELECT * FROM guestbook').all() as any[];
  const guestbook = rawGuestbook.map(g => ({
    id: g.id,
    authorName: g.authorName,
    message: g.message,
    timestamp: g.timestamp,
    avatarColor: g.avatarColor || undefined
  }));

  return {
    members,
    relationships,
    parentChildRelations,
    events,
    announcements,
    guestbook
  };
}

export function addMemberDb(m: any) {
  const insert = db.prepare(`
    INSERT INTO members (id, name, nickname, gender, birthDate, birthPlace, deathDate, domicile, isMerantau, photoUrl, phone, email, bio, memories, generation)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    m.id,
    m.name,
    m.nickname || null,
    m.gender,
    m.birthDate,
    m.birthPlace || null,
    m.deathDate || null,
    m.domicile,
    m.isMerantau ? 1 : 0,
    m.photoUrl || null,
    m.phone || null,
    m.email || null,
    m.bio || null,
    JSON.stringify(m.memories || []),
    m.generation
  );
}

export function updateMemberDb(id: string, m: any) {
  const select = db.prepare('SELECT * FROM members WHERE id = ?');
  const existing = select.get(id) as any;
  if (!existing) return;

  const name = m.name !== undefined ? m.name : existing.name;
  const nickname = m.nickname !== undefined ? m.nickname : existing.nickname;
  const gender = m.gender !== undefined ? m.gender : existing.gender;
  const birthDate = m.birthDate !== undefined ? m.birthDate : existing.birthDate;
  const birthPlace = m.birthPlace !== undefined ? m.birthPlace : existing.birthPlace;
  const deathDate = m.deathDate !== undefined ? m.deathDate : existing.deathDate;
  const domicile = m.domicile !== undefined ? m.domicile : existing.domicile;
  const isMerantau = m.isMerantau !== undefined ? (m.isMerantau ? 1 : 0) : existing.isMerantau;
  const photoUrl = m.photoUrl !== undefined ? m.photoUrl : existing.photoUrl;
  const phone = m.phone !== undefined ? m.phone : existing.phone;
  const email = m.email !== undefined ? m.email : existing.email;
  const bio = m.bio !== undefined ? m.bio : existing.bio;
  const memories = m.memories !== undefined ? JSON.stringify(m.memories) : existing.memories;
  const generation = m.generation !== undefined ? m.generation : existing.generation;

  const update = db.prepare(`
    UPDATE members 
    SET name = ?, nickname = ?, gender = ?, birthDate = ?, birthPlace = ?, deathDate = ?, domicile = ?, isMerantau = ?, photoUrl = ?, phone = ?, email = ?, bio = ?, memories = ?, generation = ?
    WHERE id = ?
  `);
  update.run(name, nickname, gender, birthDate, birthPlace, deathDate, domicile, isMerantau, photoUrl, phone, email, bio, memories, generation, id);
}

export function deleteMemberDb(id: string) {
  db.prepare('DELETE FROM members WHERE id = ?').run(id);
  db.prepare('DELETE FROM relationships WHERE personIdA = ? OR personIdB = ?').run(id, id);
  db.prepare('DELETE FROM parent_child_relations WHERE parentId = ? OR childId = ?').run(id, id);
  db.prepare('DELETE FROM events WHERE personId = ?').run(id);
}

export function addRelationshipDb(r: any) {
  const insert = db.prepare(`
    INSERT INTO relationships (id, personIdA, personIdB, type, marriageDate, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insert.run(r.id, r.personIdA, r.personIdB, r.type, r.marriageDate || null, r.status);
}

export function deleteRelationshipDb(id: string) {
  db.prepare('DELETE FROM relationships WHERE id = ?').run(id);
}

export function addParentChildRelationDb(parentId: string, childId: string) {
  const insert = db.prepare(`
    INSERT OR IGNORE INTO parent_child_relations (parentId, childId)
    VALUES (?, ?)
  `);
  insert.run(parentId, childId);
}

export function deleteParentChildRelationDb(parentId: string, childId: string) {
  const del = db.prepare('DELETE FROM parent_child_relations WHERE parentId = ? AND childId = ?');
  del.run(parentId, childId);
}

export function addEventDb(e: any) {
  const insert = db.prepare(`
    INSERT INTO events (id, title, type, date, description, location, personId)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(e.id, e.title, e.type, e.date, e.description || null, e.location || null, e.personId || null);
}

export function deleteEventDb(id: string) {
  db.prepare('DELETE FROM events WHERE id = ?').run(id);
}

export function addAnnouncementDb(a: any) {
  const insert = db.prepare(`
    INSERT INTO announcements (id, title, content, date, author, category)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  insert.run(a.id, a.title, a.content, a.date, a.author, a.category);
}

export function deleteAnnouncementDb(id: string) {
  db.prepare('DELETE FROM announcements WHERE id = ?').run(id);
}

export function addGuestbookDb(g: any) {
  const insert = db.prepare(`
    INSERT INTO guestbook (id, authorName, message, timestamp, avatarColor)
    VALUES (?, ?, ?, ?, ?)
  `);
  insert.run(g.id, g.authorName, g.message, g.timestamp, g.avatarColor || null);
}

export function deleteGuestbookDb(id: string) {
  db.prepare('DELETE FROM guestbook WHERE id = ?').run(id);
}
