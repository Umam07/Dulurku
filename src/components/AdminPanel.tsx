'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { Person, Relationship } from '@/types/family';
import { Save, ShieldCheck } from 'lucide-react';

interface AdminPanelProps {
  editPersonId?: string; // Jika disediakan, dalam mode edit
  onSuccess: () => void; // Callback sukses
}

export default function AdminPanel({ editPersonId, onSuccess }: AdminPanelProps) {
  const { 
    members, 
    relationships, 
    parentChildRelations, 
    addMember, 
    updateMember,
    addRelationship,
    deleteRelationship,
    addParentChildRelation,
    deleteParentChildRelation
  } = useFamily();

  // Form States
  const [name, setName] = useState('');
  const [nickname, setNickname] = useState('');
  const [gender, setGender] = useState<'M' | 'F'>('M');
  const [birthDate, setBirthDate] = useState('');
  const [birthPlace, setBirthPlace] = useState('');
  const [deathDate, setDeathDate] = useState('');
  const [domicile, setDomicile] = useState('');
  const [isMerantau, setIsMerantau] = useState(false);
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [generation, setGeneration] = useState(2); // Default cucu (Gen 2)

  // Relasi States
  const [fatherId, setFatherId] = useState('');
  const [motherId, setMotherId] = useState('');
  const [spouseId, setSpouseId] = useState('');
  const [marriageDate, setMarriageDate] = useState('');
  const [marriageStatus, setMarriageStatus] = useState<'married' | 'widowed' | 'divorced'>('married');

  const editMember = editPersonId ? members.find(m => m.id === editPersonId) : null;

  // Seed form jika mode edit
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    if (editMember) {
      setName(editMember.name);
      setNickname(editMember.nickname || '');
      setGender(editMember.gender);
      setBirthDate(editMember.birthDate);
      setBirthPlace(editMember.birthPlace || '');
      setDeathDate(editMember.deathDate || '');
      setDomicile(editMember.domicile);
      setIsMerantau(editMember.isMerantau);
      setPhone(editMember.phone || '');
      setEmail(editMember.email || '');
      setBio(editMember.bio || '');
      setGeneration(editMember.generation);

      // Cari Ayah & Ibu saat ini
      const parentsList = parentChildRelations.filter(pc => pc.childId === editMember.id);
      const fathers = members.filter(m => m.gender === 'M' && parentsList.map(pc => pc.parentId).includes(m.id));
      const mothers = members.filter(m => m.gender === 'F' && parentsList.map(pc => pc.parentId).includes(m.id));
      
      setFatherId(fathers[0]?.id || '');
      setMotherId(mothers[0]?.id || '');

      // Cari Pasangan & detail pernikahan
      const spouseRel = relationships.find(
        r => r.type === 'spouse' && (r.personIdA === editMember.id || r.personIdB === editMember.id)
      );
      if (spouseRel) {
        setSpouseId(spouseRel.personIdA === editMember.id ? spouseRel.personIdB : spouseRel.personIdA);
        setMarriageDate(spouseRel.marriageDate || '');
        setMarriageStatus(spouseRel.status);
      } else {
        setSpouseId('');
        setMarriageDate('');
        setMarriageStatus('married');
      }
    }
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [editPersonId, editMember, parentChildRelations, relationships, members]);

  // Saring opsi ayah & ibu potensial (harus dari generasi di atasnya)
  const potentialFathers = members.filter(
    m => m.gender === 'M' && m.id !== editPersonId && (editMember ? m.generation < editMember.generation : m.generation < generation)
  );

  const potentialMothers = members.filter(
    m => m.gender === 'F' && m.id !== editPersonId && (editMember ? m.generation < editMember.generation : m.generation < generation)
  );

  // Saring opsi pasangan (lawan jenis, generasi sama/mendekati, bukan diri sendiri)
  const potentialSpouses = members.filter(
    m => m.gender !== gender && m.id !== editPersonId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const memberData = {
      name,
      nickname: nickname || undefined,
      gender,
      birthDate,
      birthPlace: birthPlace || undefined,
      deathDate: deathDate || undefined,
      domicile,
      isMerantau,
      phone: phone || undefined,
      email: email || undefined,
      bio: bio || undefined,
      generation
    };

    let targetMemberId = editPersonId || '';

    if (editPersonId) {
      // 1. UPDATE ANGGOTA
      updateMember(editPersonId, memberData);
    } else {
      // 1. TAMBAH ANGGOTA BARU
      const newMember = addMember(memberData);
      targetMemberId = newMember.id;
    }

    // 2. SIMPAN HUBUNGAN ORANG TUA
    // Hapus relasi orang tua lama jika mode edit
    if (editPersonId) {
      const oldParents = parentChildRelations.filter(pc => pc.childId === editPersonId);
      oldParents.forEach(op => deleteParentChildRelation(op.parentId, editPersonId));
    }
    // Tambah relasi orang tua baru
    if (fatherId) {
      addParentChildRelation(fatherId, targetMemberId);
    }
    if (motherId) {
      addParentChildRelation(motherId, targetMemberId);
    }

    // 3. SIMPAN HUBUNGAN PERNIKAHAN (SPOUSE)
    // Hapus hubungan pernikahan lama jika mode edit
    if (editPersonId) {
      const oldSpouseRels = relationships.filter(
        r => r.type === 'spouse' && (r.personIdA === editPersonId || r.personIdB === editPersonId)
      );
      oldSpouseRels.forEach(osr => deleteRelationship(osr.id));
    }
    // Tambah hubungan pernikahan baru jika dipilih
    if (spouseId) {
      addRelationship({
        personIdA: targetMemberId,
        personIdB: spouseId,
        type: 'spouse',
        marriageDate: marriageDate || undefined,
        status: marriageStatus
      });
    }

    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-xs">
      {/* 1. INFORMASI DASAR */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block font-semibold text-muted mb-1">Nama Lengkap *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="Contoh: Budi Santoso"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-muted mb-1">Nama Panggilan</label>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="Contoh: Pak Budi"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-semibold text-muted mb-1">Jenis Kelamin *</label>
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value as 'M' | 'F')}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="M">Laki-laki (L)</option>
            <option value="F">Perempuan (P)</option>
          </select>
        </div>

        <div>
          <label className="block font-semibold text-muted mb-1">Tingkat Generasi *</label>
          <select
            value={generation}
            onChange={(e) => setGeneration(Number(e.target.value))}
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value={0}>Generasi 0 (Mbah/Sesepuh)</option>
            <option value={1}>Generasi 1 (Orang Tua / Bapak-Ibu)</option>
            <option value={2}>Generasi 2 (Cucu / Mas-Mbak)</option>
            <option value={3}>Generasi 3 (Cicit / Adik-Adik)</option>
          </select>
        </div>

        <div className="col-span-2 sm:col-span-1 flex items-end">
          <label className="flex items-center gap-2 cursor-pointer py-2 px-3 rounded-xl border border-border bg-background w-full">
            <input
              type="checkbox"
              checked={isMerantau}
              onChange={(e) => setIsMerantau(e.target.checked)}
              className="rounded text-primary focus:ring-primary"
            />
            <span className="font-semibold text-foreground">Status Rantau</span>
          </label>
        </div>
      </div>

      {/* 2. TANGGAL & TEMPAT LAHIR / WAFAT */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-semibold text-muted mb-1">Tanggal Lahir *</label>
          <input
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-muted mb-1">Tempat Lahir</label>
          <input
            type="text"
            value={birthPlace}
            onChange={(e) => setBirthPlace(e.target.value)}
            placeholder="Contoh: Kediri"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-stone-500 mb-1">Tanggal Wafat (Opsional)</label>
          <input
            type="date"
            value={deathDate}
            onChange={(e) => setDeathDate(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-dashed border-stone-300 dark:border-stone-700 bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-stone-400"
          />
        </div>
      </div>

      {/* 3. DOMISILI & KONTAK */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block font-semibold text-muted mb-1">Kota Domisili *</label>
          <input
            type="text"
            value={domicile}
            onChange={(e) => setDomicile(e.target.value)}
            required
            placeholder="Contoh: Surabaya"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-muted mb-1">No. HP / WhatsApp</label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Contoh: 081234567890"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>

        <div>
          <label className="block font-semibold text-muted mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Contoh: dulur@email.com"
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      </div>

      {/* 4. BIOGRAFI */}
      <div>
        <label className="block font-semibold text-muted mb-1">Kisah / Cerita Biografi Singkat</label>
        <textarea
          rows={3}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Tuliskan latar belakang, profesi, kegemaran, atau pesan keteladanan yang melekat..."
          className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
        />
      </div>

      {/* 5. HUBUNGAN KELUARGA (PARENTS & SPOUSE) */}
      <div className="border-t border-border pt-4 mt-4 space-y-4">
        <h4 className="font-semibold text-foreground uppercase tracking-wider text-[10px] text-primary flex items-center gap-1">
          <ShieldCheck className="h-4 w-4" /> Hubungan Keluarga Lanjut (Diatur Otomatis)
        </h4>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Hubungan Orang Tua */}
          <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
            <span className="font-bold text-foreground block border-b border-border pb-1.5">Hubungan Orang Tua</span>
            
            <div>
              <label className="block text-[10px] font-semibold text-muted mb-1">Ayah Kandung</label>
              <select
                value={fatherId}
                onChange={(e) => setFatherId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold focus:outline-none"
              >
                <option value="">-- Pilih Ayah (Kosong) --</option>
                {potentialFathers.map(f => (
                  <option key={f.id} value={f.id}>{f.name} (Gen {f.generation} - {f.domicile})</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[10px] font-semibold text-muted mb-1">Ibu Kandung</label>
              <select
                value={motherId}
                onChange={(e) => setMotherId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold focus:outline-none"
              >
                <option value="">-- Pilih Ibu (Kosong) --</option>
                {potentialMothers.map(m => (
                  <option key={m.id} value={m.id}>{m.name} (Gen {m.generation} - {m.domicile})</option>
                ))}
              </select>
            </div>
          </div>

          {/* Hubungan Pasangan (Spouse) */}
          <div className="p-4 rounded-2xl bg-background border border-border space-y-3">
            <span className="font-bold text-foreground block border-b border-border pb-1.5">Hubungan Pernikahan</span>
            
            <div>
              <label className="block text-[10px] font-semibold text-muted mb-1">Suami / Istri</label>
              <select
                value={spouseId}
                onChange={(e) => setSpouseId(e.target.value)}
                className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold focus:outline-none"
              >
                <option value="">-- Pilih Pasangan (Lajang) --</option>
                {potentialSpouses.map(s => (
                  <option key={s.id} value={s.id}>{s.name} (Gen {s.generation} - {s.domicile})</option>
                ))}
              </select>
            </div>

            {spouseId && (
              <div className="grid grid-cols-2 gap-2 animate-in fade-in duration-200">
                <div>
                  <label className="block text-[10px] font-semibold text-muted mb-0.5">Tanggal Nikah</label>
                  <input
                    type="date"
                    value={marriageDate}
                    onChange={(e) => setMarriageDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-semibold text-muted mb-0.5">Status Pernikahan</label>
                  <select
                    value={marriageStatus}
                    onChange={(e) => setMarriageStatus(e.target.value as 'married' | 'widowed' | 'divorced')}
                    className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-card text-foreground font-semibold"
                  >
                    <option value="married">Menikah</option>
                    <option value="widowed">Cerai Mati (Widowed)</option>
                    <option value="divorced">Bercerai (Divorced)</option>
                  </select>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 6. TOMBOL AKSI */}
      <div className="pt-4 flex justify-end gap-2 border-t border-border">
        <button
          type="button"
          onClick={onSuccess}
          className="px-4 py-2.5 rounded-xl border border-border text-muted hover:text-foreground hover:bg-background transition-all font-semibold"
        >
          Batal
        </button>
        
        <button
          type="submit"
          className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white flex items-center gap-1.5 font-bold transition-all shadow-md shadow-primary/15 cursor-pointer"
        >
          <Save className="h-4 w-4" />
          <span>Simpan Silsilah</span>
        </button>
      </div>
    </form>
  );
}
