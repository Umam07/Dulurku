'use client';

import React, { useState, useMemo } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { FamilyEvent } from '@/types/family';
import { 
  CalendarDays, 
  Cake, 
  Heart, 
  Users, 
  Plus, 
  Trash2, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Sparkles,
  Calendar as CalendarIcon,
  X
} from 'lucide-react';

export default function KalenderPage() {
  const { 
    events, 
    members, 
    isAdmin, 
    addEvent, 
    deleteEvent 
  } = useFamily();

  // State Kalender Bulanan
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // State Form Acara
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [title, setTitle] = useState('');
  const [type, setType] = useState<'birthday' | 'anniversary' | 'gathering' | 'other'>('gathering');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [associatedPersonId, setAssociatedPersonId] = useState('');

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Nama Bulan
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // --- KONTROL KALENDER BULANAN ---
  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  // Hitung hari-hari dalam bulan aktif untuk digambar di grid
  const calendarDays = useMemo(() => {
    const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay(); // 0 (Sun) - 6 (Sat)
    const totalDays = new Date(currentYear, currentMonth + 1, 0).getDate(); // Jumlah hari dalam bulan
    const prevTotalDays = new Date(currentYear, currentMonth, 0).getDate(); // Jumlah hari bulan lalu

    const days = [];

    // Hari dari bulan sebelumnya (padding kiri)
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      days.push({
        day: prevTotalDays - i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth - 1, prevTotalDays - i)
      });
    }

    // Hari dari bulan aktif
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        date: new Date(currentYear, currentMonth, i)
      });
    }

    // Hari dari bulan berikutnya (padding kanan ke grid 42 kotak / 6 baris)
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      days.push({
        day: i,
        isCurrentMonth: false,
        date: new Date(currentYear, currentMonth + 1, i)
      });
    }

    return days;
  }, [currentYear, currentMonth]);

  // --- PEMETAAN ACARA PADA KALENDER ---
  // Temukan acara yang jatuh pada hari tertentu
  const getEventsForDate = (dateObj: Date) => {
    const m = dateObj.getMonth();
    const d = dateObj.getDate();

    return events.filter(evt => {
      const evtDate = new Date(evt.date);
      // Untuk ultah & anniversary, kita cocokkan bulan & tanggalnya saja (tahunan)
      if (evt.type === 'birthday' || evt.type === 'anniversary') {
        return evtDate.getMonth() === m && evtDate.getDate() === d;
      }
      // Untuk acara sekali jalan seperti gathering, cocokkan tahun juga
      return evtDate.getFullYear() === dateObj.getFullYear() &&
             evtDate.getMonth() === m &&
             evtDate.getDate() === d;
    });
  };

  // --- SUBMIT ACARA BARU (ADMIN) ---
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date) return;

    addEvent({
      title,
      type,
      date,
      description: description || undefined,
      location: location || undefined,
      personId: associatedPersonId || undefined
    });

    // Reset Form
    setTitle('');
    setType('gathering');
    setDate('');
    setDescription('');
    setLocation('');
    setAssociatedPersonId('');
    setIsAddingEvent(false);
  };

  const handleDeleteEvent = (id: string) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus agenda acara ini?')) {
      deleteEvent(id);
    }
  };

  // Urutkan agenda secara kronologis untuk daftar agenda
  const sortedAgenda = useMemo(() => {
    return [...events].sort((a, b) => {
      // Bandingkan berdasarkan tanggal
      const dateA = new Date(a.date);
      const dateB = new Date(b.date);
      
      // Jika tahunan (birthday/anniversary), bandingkan berdasarkan bulan & tanggal di tahun aktif
      const activeYear = new Date().getFullYear();
      const compareA = (a.type === 'birthday' || a.type === 'anniversary')
        ? new Date(activeYear, dateA.getMonth(), dateA.getDate()).getTime()
        : dateA.getTime();
      const compareB = (b.type === 'birthday' || b.type === 'anniversary')
        ? new Date(activeYear, dateB.getMonth(), dateB.getDate()).getTime()
        : dateB.getTime();

      return compareA - compareB;
    });
  }, [events]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-serif font-bold text-foreground">Kalender Guyub</h2>
          <p className="text-muted text-sm mt-1">
            Penanggalan momen penting seluruh kerabat. Ingat hari ulang tahun sepupu, peringatan pernikahan sesepuh, hingga jadwal arisan keluarga.
          </p>
        </div>

        {isAdmin && (
          <button
            onClick={() => setIsAddingEvent(true)}
            className="px-5 py-3 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-1.5 shadow-md shadow-primary/10 transition-all cursor-pointer"
          >
            <Plus className="h-4.5 w-4.5" />
            <span>Tambah Acara Baru</span>
          </button>
        )}
      </div>

      {/* Split Layout: Calendar grid (left) & Agenda list (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Left Column: Month Grid (2/3 columns) */}
        <div className="lg:col-span-2 bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
          {/* Calendar Controller */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-primary" />
              <span>{monthNames[currentMonth]} {currentYear}</span>
            </h3>
            
            <div className="flex gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-2 rounded-xl hover:bg-background border border-border text-muted hover:text-foreground transition-all cursor-pointer"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 rounded-xl hover:bg-background border border-border text-muted hover:text-foreground transition-all cursor-pointer"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Days of Week Label */}
          <div className="grid grid-cols-7 text-center text-[10px] font-extrabold uppercase tracking-wider text-muted py-2 border-b border-divider/40">
            {['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'].map((day, idx) => (
              <span key={day} className={idx === 0 ? 'text-red-500' : ''}>{day}</span>
            ))}
          </div>

          {/* Calendar Grid Days */}
          <div className="grid grid-cols-7 gap-1 md:gap-2">
            {calendarDays.map((slot, index) => {
              const dayEvents = getEventsForDate(slot.date);
              const isToday = new Date().toDateString() === slot.date.toDateString();
              const isSunday = slot.date.getDay() === 0;

              return (
                <div
                  key={index}
                  className={`min-h-[76px] md:min-h-[90px] p-2 rounded-xl border flex flex-col justify-between transition-all ${
                    slot.isCurrentMonth 
                      ? 'bg-background/40 border-border text-foreground' 
                      : 'bg-stone-50 dark:bg-stone-900/40 border-stone-200/50 dark:border-stone-800/40 text-stone-400 dark:text-stone-600'
                  } ${
                    isToday 
                      ? 'ring-2 ring-primary/85 bg-primary-light/30' 
                      : ''
                  }`}
                >
                  {/* Day Number */}
                  <div className="flex justify-between items-start">
                    <span className={`text-xs font-bold ${
                      isSunday && slot.isCurrentMonth ? 'text-red-500' : ''
                    } ${isToday ? 'text-primary' : ''}`}>
                      {slot.day}
                    </span>
                  </div>

                  {/* Dot Indicators for Events */}
                  <div className="flex flex-col gap-1 overflow-hidden max-h-[50px]">
                    {dayEvents.map(evt => {
                      let bgClass = 'bg-stone-500';
                      if (evt.type === 'birthday') bgClass = 'bg-red-500';
                      if (evt.type === 'anniversary') bgClass = 'bg-amber-500';
                      if (evt.type === 'gathering') bgClass = 'bg-secondary';
                      
                      return (
                        <div 
                          key={evt.id} 
                          title={evt.title} 
                          className="flex items-center gap-1 min-w-0"
                        >
                          <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${bgClass}`} />
                          <span className="text-[8px] font-semibold truncate leading-none hidden md:inline text-muted group-hover:text-foreground">
                            {evt.title}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Agenda List (1/3 column) */}
        <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-5 h-[500px] md:h-[620px] flex flex-col">
          <div className="border-b border-border/50 pb-3 flex-shrink-0">
            <h3 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-primary" />
              Agenda Mendatang
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-1">
            {sortedAgenda.length > 0 ? (
              sortedAgenda.map((evt) => {
                const d = new Date(evt.date);
                const day = d.getDate();
                const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
                const month = months[d.getMonth()];
                
                const person = evt.personId ? members.find(m => m.id === evt.personId) : null;

                let icon = <CalendarIcon className="h-4 w-4" />;
                let colorClass = 'bg-stone-500/10 text-stone-600 dark:text-stone-400 border-stone-500/20';
                if (evt.type === 'birthday') {
                  icon = <Cake className="h-4 w-4" />;
                  colorClass = 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20';
                } else if (evt.type === 'anniversary') {
                  icon = <Heart className="h-4 w-4" />;
                  colorClass = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20';
                } else if (evt.type === 'gathering') {
                  icon = <Users className="h-4 w-4" />;
                  colorClass = 'bg-secondary-light text-secondary border-secondary/15';
                }

                return (
                  <div key={evt.id} className="p-4 rounded-2xl bg-background border border-border flex gap-3 items-start hover:border-primary/15 transition-all">
                    {/* Icon Badge */}
                    <div className={`p-2 rounded-xl border ${colorClass} flex-shrink-0 mt-0.5`}>
                      {icon}
                    </div>

                    <div className="flex-1 min-w-0 text-xs">
                      <div className="flex justify-between items-start gap-1">
                        <span className="font-bold text-foreground text-sm leading-tight">{evt.title}</span>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteEvent(evt.id)}
                            className="text-muted hover:text-red-600 transition-all p-0.5 rounded cursor-pointer flex-shrink-0"
                            title="Hapus Acara"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>

                      <p className="text-primary font-semibold mt-1">
                        🗓️ {day} {month} {evt.type !== 'birthday' && evt.type !== 'anniversary' ? d.getFullYear() : ''}
                      </p>
                      
                      {person && (
                        <p className="text-muted text-[11px] mt-0.5">Anggota terkait: <span className="font-semibold text-foreground">{person.name}</span></p>
                      )}

                      {evt.location && (
                        <p className="text-muted text-[11px] mt-1 italic flex items-center gap-0.5">
                          <MapPin className="h-3 w-3 text-primary flex-shrink-0" /> {evt.location}
                        </p>
                      )}

                      {evt.description && (
                        <p className="text-muted text-[11px] mt-2 leading-relaxed bg-card p-2 rounded-lg border border-border/40">
                          {evt.description}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-16 bg-background rounded-2xl border border-dashed border-border">
                <p className="text-xs text-muted">Belum ada agenda keluarga yang terdaftar.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal: Tambah Acara Baru (Khusus Admin) */}
      {isAddingEvent && isAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            onClick={() => setIsAddingEvent(false)}
            className="absolute inset-0 bg-stone-900/30 backdrop-blur-xs animate-in fade-in"
          />
          <div className="bg-card border border-border w-full max-w-md rounded-3xl shadow-2xl p-6 md:p-8 z-10 relative animate-in zoom-in-95 duration-200">
            <button 
              onClick={() => setIsAddingEvent(false)}
              className="absolute top-6 right-6 p-2 rounded-xl hover:bg-background text-muted hover:text-foreground transition-all cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mb-6">
              <h3 className="text-2xl font-serif font-bold text-foreground flex items-center gap-2">
                <CalendarIcon className="h-6 w-6 text-primary" /> Tambah Acara Baru
              </h3>
              <p className="text-muted text-xs mt-1">
                Jadwalkan agenda kumpul keluarga, arisan, reuni, atau catat hari penting keluarga besar Anda.
              </p>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-muted mb-1">Nama Acara *</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  placeholder="Contoh: Arisan Keluarga Rutin"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-muted mb-1">Jenis Acara *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  >
                    <option value="gathering">Kumpul Keluarga</option>
                    <option value="birthday">Ulang Tahun</option>
                    <option value="anniversary">Pernikahan (Anniversary)</option>
                    <option value="other">Lainnya</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-muted mb-1">Tanggal Acara *</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Anggota Keluarga Terkait (Opsional)</label>
                <select
                  value={associatedPersonId}
                  onChange={(e) => setAssociatedPersonId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">-- Pilih Anggota (Jika Ada) --</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Lokasi Acara</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Rumah Kediri"
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block font-semibold text-muted mb-1">Keterangan / Deskripsi</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tuliskan info tambahan mengenai iuran, susunan acara, dresscode, dll..."
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>

              <div className="pt-4 flex justify-end gap-2 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsAddingEvent(false)}
                  className="px-4 py-2.5 rounded-xl border border-border text-muted hover:text-foreground hover:bg-background transition-all font-semibold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-hover text-white font-bold transition-all flex items-center gap-1 shadow-md shadow-primary/10 cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Simpan Acara</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
