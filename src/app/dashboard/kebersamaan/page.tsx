'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { Announcement, GuestbookEntry } from '@/types/family';
import { 
  Image as ImageIcon, 
  MessageSquare, 
  Bell, 
  Plus, 
  Trash2, 
  Send, 
  Sparkles,
  Camera,
  X
} from 'lucide-react';

interface PolaroidPhoto {
  id: string;
  url: string;
  caption: string;
  rotation: string;
}

const DEFAULT_PHOTOS: PolaroidPhoto[] = [
  {
    id: 'ph-1',
    url: 'https://images.unsplash.com/photo-1601662528567-526cd06f6582?q=80&w=600&auto=format&fit=crop',
    caption: 'Teras Rumah Utama Kediri (Sore Hari)',
    rotation: '-rotate-2'
  },
  {
    id: 'ph-2',
    url: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=600&auto=format&fit=crop',
    caption: 'Kumpul Cucu & Cicit di Malang (Reuni 2025)',
    rotation: 'rotate-1'
  },
  {
    id: 'ph-3',
    url: 'https://images.unsplash.com/photo-1590073844006-33379778ae09?q=80&w=600&auto=format&fit=crop',
    caption: 'Panen Melon di Kebun Belakang Kediri',
    rotation: '-rotate-1'
  },
  {
    id: 'ph-4',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=600&auto=format&fit=crop',
    caption: 'Foto Reuni Lebaran 2024 Bersama Mbah Siti',
    rotation: 'rotate-2'
  }
];

export default function KebersamaanPage() {
  const { 
    announcements, 
    guestbook, 
    isAdmin, 
    addAnnouncement, 
    deleteAnnouncement, 
    addGuestbook, 
    deleteGuestbook 
  } = useFamily();

  // State Tabs
  const [activeTab, setActiveTab] = useState<'gallery' | 'bulletin' | 'guestbook'>('gallery');

  // State Galeri Foto
  const [photos, setPhotos] = useState<PolaroidPhoto[]>([]);
  const [isAddingPhoto, setIsAddingPhoto] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');
  const [photoCaption, setPhotoCaption] = useState('');
  const [activePhoto, setActivePhoto] = useState<PolaroidPhoto | null>(null);

  // State Form Pengumuman
  const [isAddingAnn, setIsAddingAnn] = useState(false);
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annAuthor, setAnnAuthor] = useState('');
  const [annCategory, setAnnCategory] = useState<'reuni' | 'arisan' | 'kabar_duka' | 'kabar_gembira' | 'umum'>('umum');

  // State Form Buku Tamu
  const [guestName, setGuestName] = useState('');
  const [guestMessage, setGuestMessage] = useState('');
  const [selectedColor, setSelectedColor] = useState('bg-amber-600');

  // Load photos from localStorage or defaults
  useEffect(() => {
    const stored = localStorage.getItem('dulurku_gallery_photos');
    if (stored) {
      setPhotos(JSON.parse(stored));
    } else {
      setPhotos(DEFAULT_PHOTOS);
      localStorage.setItem('dulurku_gallery_photos', JSON.stringify(DEFAULT_PHOTOS));
    }
  }, []);

  const savePhotos = (updatedPhotos: PolaroidPhoto[]) => {
    setPhotos(updatedPhotos);
    localStorage.setItem('dulurku_gallery_photos', JSON.stringify(updatedPhotos));
  };

  // --- SUBMIT UCAPAN BUKU TAMU ---
  const handleGuestbookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !guestMessage) return;

    addGuestbook({
      authorName: guestName,
      message: guestMessage,
      avatarColor: selectedColor
    });

    // Reset Form
    setGuestName('');
    setGuestMessage('');
  };

  // --- SUBMIT PENGUMUMAN BARU (ADMIN) ---
  const handleAnnouncementSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle || !annContent || !annAuthor) return;

    addAnnouncement({
      title: annTitle,
      content: annContent,
      author: annAuthor,
      category: annCategory
    });

    // Reset Form
    setAnnTitle('');
    setAnnContent('');
    setAnnAuthor('');
    setAnnCategory('umum');
    setIsAddingAnn(false);
  };

  // --- SUBMIT FOTO BARU (ADMIN/ANY) ---
  const handlePhotoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!photoUrl || !photoCaption) return;

    // Tambah rotasi acak untuk efek polaroid estetik
    const rotations = ['-rotate-1', 'rotate-1', '-rotate-2', 'rotate-2', '-rotate-3', 'rotate-3'];
    const randomRotation = rotations[Math.floor(Math.random() * rotations.length)];

    const newPhoto: PolaroidPhoto = {
      id: `ph-${Math.random().toString(36).substr(2, 9)}`,
      url: photoUrl,
      caption: photoCaption,
      rotation: randomRotation
    };

    const updatedPhotos = [...photos, newPhoto];
    savePhotos(updatedPhotos);

    // Reset
    setPhotoUrl('');
    setPhotoCaption('');
    setIsAddingPhoto(false);
  };

  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Mencegah popup klik polaroid
    if (window.confirm('Apakah Anda yakin ingin menghapus foto kenangan ini?')) {
      const updated = photos.filter(p => p.id !== id);
      savePhotos(updated);
    }
  };

  const avatarColors = [
    { value: 'bg-amber-600', label: 'Amber' },
    { value: 'bg-emerald-600', label: 'Sage Green' },
    { value: 'bg-primary', label: 'Terracotta' },
    { value: 'bg-red-600', label: 'Ceri' },
    { value: 'bg-blue-600', label: 'Biru Samudra' },
    { value: 'bg-purple-600', label: 'Ungu Sendu' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Ruang Kebersamaan</h2>
          <p className="text-muted text-sm mt-1">
            Wadah berbagi foto kenangan, papan pengumuman keluarga resmi (wara-wara), serta kolom titip salam kangen antar dulur.
          </p>
        </div>

        {/* Dynamic Buttons based on active tab and admin role */}
        <div className="flex gap-2">
          {activeTab === 'gallery' && (
            <button
              onClick={() => setIsAddingPhoto(true)}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/10 transition-all cursor-pointer"
            >
              <Camera className="h-4.5 w-4.5" />
              <span>Unggah Foto</span>
            </button>
          )}

          {activeTab === 'bulletin' && isAdmin && (
            <button
              onClick={() => setIsAddingAnn(true)}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/10 transition-all cursor-pointer"
            >
              <Plus className="h-4.5 w-4.5" />
              <span>Buat Wara-Wara</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Controls */}
      <div className="flex border-b border-border bg-card rounded-2xl p-1 shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'gallery' 
              ? 'bg-primary text-white shadow' 
              : 'text-muted hover:text-foreground'
          }`}
        >
          <ImageIcon className="h-4 w-4" />
          <span>Galeri Polaroid</span>
        </button>
        
        <button
          onClick={() => setActiveTab('bulletin')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'bulletin' 
              ? 'bg-primary text-white shadow' 
              : 'text-muted hover:text-foreground'
          }`}
        >
          <Bell className="h-4 w-4" />
          <span>Wara-Wara ({announcements.length})</span>
        </button>
        
        <button
          onClick={() => setActiveTab('guestbook')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            activeTab === 'guestbook' 
              ? 'bg-primary text-white shadow' 
              : 'text-muted hover:text-foreground'
          }`}
        >
          <MessageSquare className="h-4 w-4" />
          <span>Buku Tamu ({guestbook.length})</span>
        </button>
      </div>

      {/* --- TAB CONTENT AREA --- */}
      <div>
        {/* Tab 1: Polaroid Gallery */}
        {activeTab === 'gallery' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 py-4">
            {photos.map((p) => (
              <div
                key={p.id}
                onClick={() => setActivePhoto(p)}
                style={{ '--r': p.rotation.replace('rotate-', '').replace('minus-', '-') } as any}
                className={`polaroid cursor-zoom-in relative ${p.rotation} select-none`}
              >
                {/* Photo Image Container */}
                <div className="aspect-[4/3] w-full bg-stone-100 overflow-hidden rounded-sm relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={p.url} 
                    alt={p.caption} 
                    className="object-cover w-full h-full filter sepia-[5%] hover:sepia-0 transition-all duration-300"
                  />
                </div>
                
                {/* Handwritten style caption */}
                <div className="pt-4 pb-1 text-center font-serif text-stone-700 dark:text-stone-300 font-medium italic text-xs md:text-sm tracking-wide truncate px-1">
                  {p.caption}
                </div>

                {/* Delete button (Visible to Admin or all) */}
                <button
                  onClick={(e) => handleDeletePhoto(p.id, e)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 hover:bg-red-600 text-white opacity-0 hover:opacity-100 group-hover:opacity-90 transition-opacity duration-200 shadow cursor-pointer"
                  title="Hapus Foto"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Announcement Bulletin */}
        {activeTab === 'bulletin' && (
          <div className="space-y-4 max-w-3xl">
            {announcements.length > 0 ? (
              announcements.map((ann) => (
                <div 
                  key={ann.id} 
                  className="bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/10 transition-all relative"
                >
                  {/* Category & Date Header */}
                  <div className="flex justify-between items-start gap-2 mb-3 text-xs">
                    <span className={`px-2.5 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider ${
                      ann.category === 'kabar_gembira' 
                        ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' 
                        : ann.category === 'reuni' 
                        ? 'bg-primary-light text-primary' 
                        : ann.category === 'arisan' 
                        ? 'bg-secondary-light text-secondary' 
                        : 'bg-stone-500/10 text-stone-600 dark:text-stone-400'
                    }`}>
                      {ann.category.replace('_', ' ')}
                    </span>
                    
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-muted font-semibold">{ann.date}</span>
                      {isAdmin && (
                        <button
                          onClick={() => deleteAnnouncement(ann.id)}
                          className="text-muted hover:text-red-600 transition-all p-0.5 rounded cursor-pointer"
                          title="Hapus Pengumuman"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Title & Content */}
                  <h3 className="text-lg font-serif font-bold text-foreground mb-2.5 leading-snug">{ann.title}</h3>
                  <p className="text-muted text-xs leading-relaxed whitespace-pre-line">{ann.content}</p>
                  
                  {/* Author footer */}
                  <div className="mt-4 pt-3.5 border-t border-divider/40 flex items-center justify-between text-[10px] text-muted">
                    <span>Tertulis oleh: <span className="font-semibold text-foreground">{ann.author}</span></span>
                    <span className="italic">Keluarga Besar Hardjowidjojo</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 bg-card border border-dashed border-border rounded-3xl">
                <p className="text-xs text-muted">Belum ada pengumuman resmi dari pengelola.</p>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Guestbook (Doa Restu) */}
        {activeTab === 'guestbook' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {/* Left side: Guestbook list (2/3 columns) */}
            <div className="lg:col-span-2 space-y-4 order-2 lg:order-1">
              {guestbook.length > 0 ? (
                guestbook.map((entry) => (
                  <div 
                    key={entry.id} 
                    className="flex gap-4 items-start bg-card border border-border p-4 rounded-2xl shadow-sm hover:border-primary/5 transition-all"
                  >
                    {/* Avatar */}
                    <div className={`h-10 w-10 rounded-full ${entry.avatarColor || 'bg-stone-500'} text-white flex items-center justify-center text-sm font-bold flex-shrink-0 shadow-inner`}>
                      {entry.authorName.charAt(0)}
                    </div>

                    {/* Message Details */}
                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="font-bold text-foreground text-sm">{entry.authorName}</span>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-muted font-semibold">{entry.timestamp}</span>
                          {isAdmin && (
                            <button
                              onClick={() => deleteGuestbook(entry.id)}
                              className="text-muted hover:text-red-600 transition-all p-0.5 rounded cursor-pointer"
                              title="Hapus Ucapan"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-muted leading-relaxed italic bg-background/30 p-3 rounded-2xl border border-divider/20">
                        "{entry.message}"
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 bg-card border border-dashed border-border rounded-3xl">
                  <p className="text-xs text-muted">Belum ada ucapan salam kangen. Jadilah yang pertama menulis!</p>
                </div>
              )}
            </div>

            {/* Right side: Write guestbook form (1/3 column) */}
            <div className="bg-card border border-border p-6 rounded-2xl shadow-sm space-y-4 order-1 lg:order-2 h-fit">
              <h3 className="text-base font-serif font-bold text-foreground flex items-center gap-1.5">
                <Sparkles className="h-4.5 w-4.5 text-primary" />
                Kirim Salam Kangen
              </h3>
              
              <form onSubmit={handleGuestbookSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-muted mb-1">Nama Pengirim *</label>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    required
                    placeholder="Contoh: Rina (Jakarta)"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-muted mb-1">Pesan Salam / Doa Restu *</label>
                  <textarea
                    rows={4}
                    value={guestMessage}
                    onChange={(e) => setGuestMessage(e.target.value)}
                    required
                    placeholder="Tuliskan ucapan kangen, doa kesehatan, atau kabar singkat Anda..."
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>

                {/* Avatar Color selector */}
                <div>
                  <label className="block font-semibold text-muted mb-1.5">Pilih Warna Avatar</label>
                  <div className="flex gap-2 flex-wrap">
                    {avatarColors.map((col) => (
                      <button
                        key={col.value}
                        type="button"
                        onClick={() => setSelectedColor(col.value)}
                        className={`h-6 w-6 rounded-full ${col.value} border-2 transition-all cursor-pointer ${
                          selectedColor === col.value 
                            ? 'border-foreground scale-110 shadow' 
                            : 'border-transparent opacity-75 hover:opacity-100'
                        }`}
                        title={col.label}
                      />
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-primary/15 cursor-pointer"
                >
                  <Send className="h-4 w-4" />
                  <span>Kirim Ucapan</span>
                </button>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* --- POPUP MODAL: ENLARGE PHOTO (GALLERY) --- */}
      {activePhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setActivePhoto(null)}
            className="absolute inset-0 bg-stone-900/80 backdrop-blur-xs animate-in fade-in"
          />
          <div className="bg-card border border-border rounded-3xl shadow-2xl p-4 md:p-6 z-10 relative max-w-3xl w-full select-none animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setActivePhoto(null)}
              className="absolute top-4 right-4 p-2 rounded-xl bg-background/80 hover:bg-background border border-border text-muted hover:text-foreground transition-all cursor-pointer z-20"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex flex-col gap-4">
              <div className="aspect-[4/3] w-full bg-stone-100 overflow-hidden rounded-2xl relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={activePhoto.url} 
                  alt={activePhoto.caption} 
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="text-center font-serif text-foreground font-bold italic text-sm md:text-base tracking-wide py-2 border-t border-divider/40">
                {activePhoto.caption}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL: ADD PHOTO (ALL USERS) --- */}
      {isAddingPhoto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsAddingPhoto(false)}
            className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs animate-in fade-in"
          />
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 z-10 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAddingPhoto(false)}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-background text-muted hover:text-foreground transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                <Camera className="h-6 w-6 text-primary" /> Bagikan Foto Kenangan
              </h3>
              <p className="text-muted text-xs mt-1">
                Tempelkan tautan (URL) foto keluarga Anda dan beri keterangan yang berkesan untuk dipajang di Galeri Polaroid.
              </p>
            </div>

            <form onSubmit={handlePhotoSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted mb-1">Tautan URL Foto *</label>
                <input
                  type="url"
                  value={photoUrl}
                  onChange={(e) => setPhotoUrl(e.target.value)}
                  required
                  placeholder="https://images.unsplash.com/... atau link foto lainnya"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Keterangan / Caption Polaroid *</label>
                <input
                  type="text"
                  value={photoCaption}
                  onChange={(e) => setPhotoCaption(e.target.value)}
                  required
                  placeholder="Contoh: Mudik Lebaran 2024 di Teras Rumah"
                  maxLength={60}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddingPhoto(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-muted hover:text-foreground hover:bg-background transition-all font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all shadow-md shadow-primary/10 cursor-pointer"
                >
                  <span>Pajang di Galeri</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- POPUP MODAL: ADD ANNOUNCEMENT (ADMIN) --- */}
      {isAddingAnn && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsAddingAnn(false)}
            className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs animate-in fade-in"
          />
          <div className="bg-card border border-border w-full max-w-lg rounded-3xl shadow-2xl p-6 md:p-8 z-10 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAddingAnn(false)}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-background text-muted hover:text-foreground transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                <Bell className="h-6 w-6 text-primary" /> Buat Wara-Wara Baru
              </h3>
              <p className="text-muted text-xs mt-1">
                Tuliskan pengumuman resmi keluarga, kabar gembira, kabar duka, atau update arisan untuk disebarkan ke seluruh dulur.
              </p>
            </div>

            <form onSubmit={handleAnnouncementSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-muted mb-1">Kategori Wara-Wara *</label>
                  <select
                    value={annCategory}
                    onChange={(e) => setAnnCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="umum">Umum</option>
                    <option value="reuni">Reuni Keluarga</option>
                    <option value="arisan">Arisan Keluarga</option>
                    <option value="kabar_gembira">Kabar Gembira</option>
                    <option value="kabar_duka">Kabar Duka</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-muted mb-1">Nama Penulis *</label>
                  <input
                    type="text"
                    value={annAuthor}
                    onChange={(e) => setAnnAuthor(e.target.value)}
                    required
                    placeholder="Contoh: Pak Anshori"
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Judul Pengumuman *</label>
                <input
                  type="text"
                  value={annTitle}
                  onChange={(e) => setAnnTitle(e.target.value)}
                  required
                  placeholder="Contoh: Rencana Reuni Akbar Desember 2026"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Isi Wara-Wara *</label>
                <textarea
                  rows={5}
                  value={annContent}
                  onChange={(e) => setAnnContent(e.target.value)}
                  required
                  placeholder="Tuliskan detail pengumuman secara lengkap dan jelas..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddingAnn(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-muted hover:text-foreground hover:bg-background transition-all font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all flex items-center gap-1 shadow-md shadow-primary/10 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Sebarkan Wara-Wara</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
