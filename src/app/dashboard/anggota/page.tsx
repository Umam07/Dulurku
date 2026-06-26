'use client';

import React, { useState, useMemo } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { Person } from '@/types/family';
import { 
  Search, 
  MapPin, 
  Compass, 
  Plus, 
  UserPlus, 
  UserCheck, 
  Heart, 
  SlidersHorizontal,
  X
} from 'lucide-react';
import MemberDetail from '@/components/MemberDetail';
import AdminPanel from '@/components/AdminPanel';

export default function AnggotaPage() {
  const { members, isAdmin } = useFamily();

  // State untuk pencarian & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomicile, setSelectedDomicile] = useState('all');
  const [selectedGeneration, setSelectedGeneration] = useState('all');
  const [selectedRantau, setSelectedRantau] = useState('all');
  
  // State untuk detail & tambah anggota
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  // Daftar unik kota domisili untuk filter
  const domiciles = useMemo(() => {
    return ['all', ...Array.from(new Set(members.map(m => m.domicile).filter(Boolean)))];
  }, [members]);

  // Filter anggota berdasarkan input
  const filteredMembers = useMemo(() => {
    return members.filter(member => {
      // 1. Text Search
      const matchText = 
        member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (member.nickname && member.nickname.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.bio && member.bio.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (member.domicile && member.domicile.toLowerCase().includes(searchQuery.toLowerCase()));

      // 2. Domicile Filter
      const matchDomicile = selectedDomicile === 'all' || member.domicile === selectedDomicile;

      // 3. Generation Filter
      const matchGen = selectedGeneration === 'all' || member.generation === Number(selectedGeneration);

      // 4. Rantau Filter
      const matchRantau = 
        selectedRantau === 'all' ||
        (selectedRantau === 'rantau' && member.isMerantau) ||
        (selectedRantau === 'menetap' && !member.isMerantau);

      return matchText && matchDomicile && matchGen && matchRantau;
    });
  }, [members, searchQuery, selectedDomicile, selectedGeneration, selectedRantau]);

  const generationNames = ['Sesepuh (Mbah)', 'Bapak / Ibu (Gen 1)', 'Cucu (Mas/Mbak - Gen 2)', 'Cicit (Adik - Gen 3)'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Direktori Dulur</h2>
          <p className="text-muted text-sm mt-1">
            Daftar lengkap seluruh anggota keluarga besar. Cari, saring berdasarkan domisili, atau lihat cerita biografi mendalam mereka.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddingNew(true)}
            className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/10 transition-all cursor-pointer"
          >
            <UserPlus className="h-4.5 w-4.5" />
            <span>Tambah Anggota Baru</span>
          </button>
        )}
      </div>

      {/* Search and Filters Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Text Search input */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari berdasarkan nama lengkap, nama panggilan, kota, atau biodata..."
              className="w-full pl-10 pr-4 py-2.5 text-xs font-semibold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted" />
          </div>

          {/* Toggle filter mobile */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`sm:hidden px-4 py-2.5 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition-all cursor-pointer ${
              showFilters ? 'bg-primary-light text-primary border-primary/20' : 'border-border text-muted'
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            <span>Saring Data</span>
          </button>
        </div>

        {/* Filters Grid (Visible on desktop, collapsible on mobile) */}
        <div className={`${showFilters ? 'block' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-divider/40 sm:border-t-0 sm:pt-0`}>
          {/* Filter 1: Generasi */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Tingkat Generasi</label>
            <select
              value={selectedGeneration}
              onChange={(e) => setSelectedGeneration(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Semua Generasi</option>
              <option value="0">Generasi 0 (Sesepuh / Mbah)</option>
              <option value="1">Generasi 1 (Bapak / Ibu)</option>
              <option value="2">Generasi 2 (Cucu / Mas-Mbak)</option>
              <option value="3">Generasi 3 (Cicit / Adik-Adik)</option>
            </select>
          </div>

          {/* Filter 2: Kota Domisili */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Kota Domisili</label>
            <select
              value={selectedDomicile}
              onChange={(e) => setSelectedDomicile(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {domiciles.map(city => (
                <option key={city} value={city}>
                  {city === 'all' ? 'Semua Kota' : city}
                </option>
              ))}
            </select>
          </div>

          {/* Filter 3: Status Perantauan */}
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-muted mb-1.5">Status Rantau</label>
            <select
              value={selectedRantau}
              onChange={(e) => setSelectedRantau(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="all">Semua Status</option>
              <option value="rantau">Di Perantauan (Rantau)</option>
              <option value="menetap">Menetap di Kampung</option>
            </select>
          </div>
        </div>
      </div>

      {/* Members Grid */}
      {filteredMembers.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member) => {
            const isFemale = member.gender === 'F';
            const isDeceased = !!member.deathDate;

            return (
              <div
                key={member.id}
                onClick={() => setSelectedMemberId(member.id)}
                className="bg-card border border-border p-5 rounded-2xl shadow-sm hover:shadow-md hover:scale-101 transition-all duration-200 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  {/* Card Header: Avatar & Badges */}
                  <div className="flex justify-between items-start gap-3 mb-4">
                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-lg font-serif font-bold text-white flex-shrink-0 shadow-inner border ${
                      isDeceased 
                        ? 'bg-stone-500 border-stone-400' 
                        : isFemale 
                        ? 'bg-rose-600 border-rose-500' 
                        : 'bg-primary border-primary/90'
                    }`}>
                      {member.nickname ? member.nickname.charAt(0) : member.name.charAt(0)}
                    </div>
                    
                    <div className="flex flex-wrap gap-1.5 justify-end">
                      <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wide border ${
                        member.generation === 0 
                          ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' 
                          : member.generation === 1 
                          ? 'bg-primary-light text-primary border-primary/10' 
                          : member.generation === 2 
                          ? 'bg-secondary-light text-secondary border-secondary/15' 
                          : 'bg-accent/10 text-accent border-accent/20'
                      }`}>
                        {member.generation === 0 ? 'Mbah' : member.generation === 1 ? 'Orang Tua' : member.generation === 2 ? 'Cucu' : 'Cicit'}
                      </span>
                      
                      {member.isMerantau && !isDeceased && (
                        <span className="px-2 py-0.5 rounded bg-secondary-light border border-secondary/15 text-secondary text-[8px] font-bold uppercase tracking-wide">
                          Rantau
                        </span>
                      )}
                      
                      {isDeceased && (
                        <span className="px-2 py-0.5 rounded bg-stone-100 border border-stone-200 dark:bg-stone-800 dark:border-stone-700 text-stone-400 text-[8px] font-extrabold uppercase tracking-wide">
                          Wafat
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name & Nickname */}
                  <div>
                    <h4 className="text-sm font-bold text-foreground leading-tight truncate">
                      {member.name}
                    </h4>
                    {member.nickname && (
                      <p className="text-[10px] text-primary italic font-medium mt-0.5">
                        Panggilan: "{member.nickname}"
                      </p>
                    )}
                  </div>

                  {/* Bio Snippet */}
                  <p className="text-muted text-[11px] leading-relaxed line-clamp-2 mt-3 italic border-l border-divider/50 pl-2">
                    {member.bio || 'Belum ada deskripsi biografi singkat.'}
                  </p>
                </div>

                {/* Footer Domicile */}
                <div className="flex items-center justify-between mt-4 pt-3.5 border-t border-divider/30 text-[10px] text-muted">
                  <span className="font-semibold flex items-center gap-0.5">
                    <MapPin className="h-3.5 w-3.5 text-primary" /> {member.domicile}
                  </span>
                  
                  <span className="font-bold text-primary group hover:underline flex items-center gap-0.5">
                    Lihat Profil →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-16 bg-card border border-border rounded-3xl">
          <p className="text-sm text-muted font-medium">Tidak ada anggota keluarga yang cocok dengan kata kunci atau filter Anda.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedDomicile('all');
              setSelectedGeneration('all');
              setSelectedRantau('all');
            }}
            className="text-xs font-bold text-primary mt-2 hover:underline cursor-pointer"
          >
            Reset semua pencarian & filter
          </button>
        </div>
      )}

      {/* Modal / Overlay: Tambah Anggota Baru (Khusus Admin) */}
      {isAddingNew && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsAddingNew(false)}
            className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs animate-in fade-in"
          />
          <div className="bg-card border border-border w-full max-w-2xl rounded-3xl shadow-2xl p-6 md:p-8 z-10 relative overflow-y-auto max-h-[90vh] animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAddingNew(false)}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-background text-muted hover:text-foreground transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                <UserCheck className="h-6 w-6 text-primary" /> Tambah Anggota Baru
              </h3>
              <p className="text-muted text-xs mt-1">
                Masukkan identitas lengkap anggota baru. Hubungan orang tua dan pernikahan akan dihubungkan secara otomatis di silsilah keluarga besar.
              </p>
            </div>

            <AdminPanel 
              onSuccess={() => {
                setIsAddingNew(false);
              }} 
            />
          </div>
        </div>
      )}

      {/* Slide-over Profile Detail Panel */}
      <MemberDetail
        memberId={selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
      />
    </div>
  );
}
