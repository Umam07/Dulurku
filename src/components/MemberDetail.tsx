'use client';

import React, { useState } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { 
  X, 
  Phone, 
  Mail, 
  Calendar, 
  Compass, 
  Heart, 
  Trash2, 
  Edit3, 
  Plus, 
  Sparkles,
  BookOpen
} from 'lucide-react';
import AdminPanel from './AdminPanel';

interface MemberDetailProps {
  memberId: string | null;
  onClose: () => void;
}

export default function MemberDetail({ memberId, onClose }: MemberDetailProps) {
  const { 
    members, 
    relationships, 
    parentChildRelations, 
    isAdmin, 
    updateMember, 
    deleteMember 
  } = useFamily();

  const [activeTab, setActiveTab] = useState<'bio' | 'relations' | 'memories'>('bio');
  const [isEditing, setIsEditing] = useState(false);
  const [newMemory, setNewMemory] = useState('');

  const member = memberId ? members.find(m => m.id === memberId) : null;

  // Reset tab saat berganti anggota (sinkron saat render prop berubah)
  const [prevMemberId, setPrevMemberId] = useState<string | null>(memberId);
  if (memberId !== prevMemberId) {
    setPrevMemberId(memberId);
    setActiveTab('bio');
    setIsEditing(false);
  }

  if (!member) return null;

  const isFemale = member.gender === 'F';
  const isDeceased = !!member.deathDate;

  // --- MENGHITUNG RELASI KELUARGA TERDEKAT ---
  // 1. Orang Tua
  const parentIds = parentChildRelations
    .filter(pc => pc.childId === member.id)
    .map(pc => pc.parentId);
  const parents = members.filter(m => parentIds.includes(m.id));

  // 2. Pasangan (Spouse)
  const spouseId = relationships
    .filter(r => r.type === 'spouse' && (r.personIdA === member.id || r.personIdB === member.id))
    .map(r => r.personIdA === member.id ? r.personIdB : r.personIdA)[0];
  const spouse = spouseId ? members.find(m => m.id === spouseId) : null;

  // 3. Anak-anak
  const childIds = parentChildRelations
    .filter(pc => pc.parentId === member.id)
    .map(pc => pc.childId);
  const children = members.filter(m => childIds.includes(m.id));

  // 4. Saudara Kandung (Siblings)
  const siblingIds = parentIds.length > 0
    ? Array.from(new Set(
        parentChildRelations
          .filter(pc => parentIds.includes(pc.parentId) && pc.childId !== member.id)
          .map(pc => pc.childId)
      ))
    : [];
  const siblings = members.filter(m => siblingIds.includes(m.id));

  // Umur anggota (atau umur saat wafat)
  const calculateAge = () => {
    const birth = new Date(member.birthDate);
    const end = isDeceased ? new Date(member.deathDate!) : new Date();
    let age = end.getFullYear() - birth.getFullYear();
    const m = end.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && end.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const age = calculateAge();

  // Tambah cerita/kenangan baru
  const handleAddMemory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMemory.trim()) return;

    const updatedMemories = [...(member.memories || []), newMemory.trim()];
    updateMember(member.id, { memories: updatedMemories });
    setNewMemory('');
  };

  const handleDeleteMember = () => {
    if (window.confirm(`Apakah Anda yakin ingin menghapus data ${member.name} dari silsilah? Hubungan keluarga terkait juga akan ikut terhapus.`)) {
      deleteMember(member.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop overlay */}
      <div 
        onClick={onClose}
        className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
      />

      {/* Drawer content panel */}
      <div className="relative w-full max-w-md md:max-w-lg h-full bg-card border-l border-border shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300">
        
        {/* Drawer Header */}
        <div className="px-6 py-5 border-b border-border flex items-center justify-between">
          <span className="text-xs font-semibold text-muted uppercase tracking-wider">Biodata Lengkap</span>
          
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="flex items-center gap-1.5 border-r border-border pr-2 mr-1">
                <button
                  onClick={() => setIsEditing(!isEditing)}
                  className={`p-2 rounded-xl border transition-all text-xs font-semibold flex items-center gap-1.5 cursor-pointer ${
                    isEditing 
                      ? 'bg-primary text-white border-primary shadow' 
                      : 'border-border text-muted hover:text-foreground hover:bg-background'
                  }`}
                  title="Edit Profil"
                >
                  <Edit3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
                
                <button
                  onClick={handleDeleteMember}
                  className="p-2 rounded-xl border border-red-500/25 hover:bg-red-500/10 text-red-600 dark:text-red-400 transition-all cursor-pointer"
                  title="Hapus Anggota"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            )}
            
            <button 
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-background text-muted hover:text-foreground transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Profile Card & Avatar */}
        <div className="px-6 py-6 border-b border-border bg-background/20 flex gap-5 items-center">
          {/* Avatar Inisial Bulat */}
          <div className={`h-20 w-20 rounded-2xl flex-shrink-0 flex items-center justify-center text-3xl font-serif font-bold text-white shadow-inner relative overflow-hidden border ${
            isDeceased 
              ? 'bg-stone-500 border-stone-400' 
              : isFemale 
              ? 'bg-rose-600 border-rose-500' 
              : 'bg-primary border-primary/90'
          }`}>
            {member.nickname ? member.nickname.charAt(0) : member.name.charAt(0)}
            
            {/* Overlay almarhum */}
            {isDeceased && (
              <div className="absolute inset-0 bg-stone-950/20 backdrop-grayscale flex items-end justify-center pb-1">
                <span className="text-[8px] font-extrabold uppercase tracking-wide bg-stone-900/80 px-1 py-0.5 rounded text-stone-300">Wafat</span>
              </div>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl md:text-2xl font-serif font-bold text-foreground truncate leading-tight">
                {member.name}
              </h3>
              {member.nickname && (
                <span className="px-2 py-0.5 rounded-md bg-card border border-border text-[10px] font-bold text-primary italic">
                  &ldquo;{member.nickname}&rdquo;
                </span>
              )}
            </div>
            
            <p className="text-muted text-xs mt-1 leading-relaxed">
              Generasi ke-{member.generation} (
              {member.generation === 0 ? 'Sesepuh' : member.generation === 1 ? 'Bapak / Ibu' : member.generation === 2 ? 'Cucu' : 'Cicit'}
              ) • {isDeceased ? `Wafat pada usia ${age} tahun` : `${age} tahun`}
            </p>

            <div className="flex gap-2 mt-2.5">
              <span className="px-2.5 py-0.5 rounded-full border border-border text-[9px] font-semibold text-muted bg-card">
                📍 {member.domicile}
              </span>
              {member.isMerantau && !isDeceased && (
                <span className="px-2.5 py-0.5 rounded-full bg-secondary-light border border-secondary/15 text-secondary text-[9px] font-bold uppercase tracking-wider">
                  Dulur Rantau
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border bg-card">
          <button
            onClick={() => setActiveTab('bio')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'bio' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            Biografi & Kontak
          </button>
          <button
            onClick={() => setActiveTab('relations')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'relations' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            Hubungan Keluarga ({parents.length + (spouse ? 1 : 0) + siblings.length + children.length})
          </button>
          <button
            onClick={() => setActiveTab('memories')}
            className={`flex-1 py-3 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'memories' 
                ? 'border-primary text-primary font-bold' 
                : 'border-transparent text-muted hover:text-foreground'
            }`}
          >
            Kenangan ({member.memories?.length || 0})
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-background/30">
          
          {isEditing && isAdmin ? (
            /* Mode Edit Khusus Admin */
            <div className="bg-card border border-border rounded-2xl p-5 shadow-sm">
              <h4 className="font-serif font-bold text-foreground text-sm mb-4 flex items-center gap-1">
                <Sparkles className="h-4 w-4 text-primary" /> Edit Profil Anggota
              </h4>
              <AdminPanel
                editPersonId={member.id}
                onSuccess={() => setIsEditing(false)}
              />
            </div>
          ) : (
            <>
              {/* Tab: BIOGRAFI & KONTAK */}
              {activeTab === 'bio' && (
                <div className="space-y-6">
                  {/* Bio Deskripsi */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" /> Tentang Dulur
                    </h4>
                    <p className="text-sm text-foreground leading-relaxed bg-card border border-border p-4 rounded-2xl">
                      {member.bio || 'Belum ada cerita biografi singkat untuk anggota ini. Pengelola dapat menambahkan cerita biografi yang inspiratif.'}
                    </p>
                  </div>

                  {/* Biodata Detail List */}
                  <div className="bg-card border border-border rounded-2xl p-5 space-y-3.5 shadow-sm text-xs">
                    <div className="flex justify-between py-1.5 border-b border-divider/50">
                      <span className="text-muted font-medium flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Tanggal Lahir</span>
                      <span className="font-bold text-foreground">{member.birthDate} {member.birthPlace ? `(${member.birthPlace})` : ''}</span>
                    </div>
                    {isDeceased && (
                      <div className="flex justify-between py-1.5 border-b border-divider/50">
                        <span className="text-muted font-medium flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 text-stone-400" /> Tanggal Wafat</span>
                        <span className="font-bold text-stone-500">{member.deathDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between py-1.5 border-b border-divider/50">
                      <span className="text-muted font-medium flex items-center gap-1.5"><Compass className="h-3.5 w-3.5" /> Status Perantauan</span>
                      <span className={`font-bold uppercase tracking-wide ${member.isMerantau ? 'text-secondary' : 'text-primary'}`}>
                        {member.isMerantau ? 'Merantau' : 'Menetap di Kampung'}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-divider/50">
                      <span className="text-muted font-medium flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" /> No. Telepon</span>
                      <span className="font-bold text-foreground">{member.phone || '—'}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-muted font-medium flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" /> Email</span>
                      <span className="font-bold text-foreground truncate max-w-[200px]">{member.email || '—'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Tab: HUBUNGAN KELUARGA */}
              {activeTab === 'relations' && (
                <div className="space-y-6 text-xs">
                  {/* Orang Tua */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted">Orang Tua</h4>
                    {parents.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {parents.map(p => (
                          <div key={p.id} className="flex items-center justify-between p-3 rounded-xl bg-card border border-border hover:border-primary/20">
                            <span className="font-bold text-foreground">{p.nickname || p.name}</span>
                            <span className="text-[10px] text-muted font-medium uppercase">{p.gender === 'M' ? 'Ayah' : 'Ibu'}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted text-[11px] italic">Tidak ada data orang tua yang tercatat (Root/Akar pohon).</p>
                    )}
                  </div>

                  {/* Pasangan */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted">Pasangan</h4>
                    {spouse ? (
                      <div className="p-3 rounded-xl bg-card border border-border hover:border-primary/20 flex items-center justify-between">
                        <span className="font-bold text-foreground">{spouse.name}</span>
                        <span className="text-[10px] text-muted font-medium uppercase">
                          {isFemale ? 'Suami' : 'Istri'}
                        </span>
                      </div>
                    ) : (
                      <p className="text-muted text-[11px] italic">Tidak ada data pasangan yang tercatat.</p>
                    )}
                  </div>

                  {/* Saudara Kandung */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted">Saudara Kandung</h4>
                    {siblings.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {siblings.map(s => (
                          <div key={s.id} className="p-3 rounded-xl bg-card border border-border hover:border-primary/20 flex items-center justify-between">
                            <span className="font-bold text-foreground">{s.nickname || s.name}</span>
                            <span className="text-[10px] text-muted font-medium">Saudara</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted text-[11px] italic">Tidak memiliki saudara kandung dalam silsilah.</p>
                    )}
                  </div>

                  {/* Anak-anak */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold uppercase tracking-widest text-muted">Anak-Anak</h4>
                    {children.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {children.map(c => (
                          <div key={c.id} className="p-3 rounded-xl bg-card border border-border hover:border-primary/20 flex items-center justify-between">
                            <span className="font-bold text-foreground">{c.nickname || c.name}</span>
                            <span className="text-[10px] text-muted font-medium uppercase">Anak</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted text-[11px] italic">Tidak memiliki keturunan terdaftar.</p>
                    )}
                  </div>
                </div>
              )}

              {/* Tab: KENANGAN / CERITA */}
              {activeTab === 'memories' && (
                <div className="space-y-6">
                  {/* Daftar Cerita Kenangan */}
                  <div className="space-y-4">
                    {member.memories && member.memories.length > 0 ? (
                      member.memories.map((memory, i) => (
                        <div key={i} className="bg-card border border-border p-4 rounded-2xl relative shadow-sm text-xs leading-relaxed italic">
                          <span className="absolute top-3 right-4 text-3xl font-serif text-primary/15 pointer-events-none">“</span>
                          <p className="text-foreground">&ldquo;{memory}&rdquo;</p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-8 bg-card border border-border rounded-2xl">
                        <p className="text-xs text-muted">Belum ada cerita kenangan hangat untuk {member.name}.</p>
                      </div>
                    )}
                  </div>

                  {/* Form Tambah Kenangan */}
                  <form onSubmit={handleAddMemory} className="space-y-3 pt-4 border-t border-border">
                    <div>
                      <label htmlFor="new-memory" className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-2">
                        Tulis Kenangan atau Kesan Anda
                      </label>
                      <textarea
                        id="new-memory"
                        rows={3}
                        value={newMemory}
                        onChange={(e) => setNewMemory(e.target.value)}
                        placeholder="Misal: Ingat sekali waktu kecil pernah diajak memetik kelapa muda bareng..."
                        required
                        className="w-full px-4 py-3 text-xs font-semibold rounded-xl border border-border bg-card text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all placeholder:font-medium placeholder:italic"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Simpan Cerita</span>
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
