'use client';

import React, { useState, useEffect } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { 
  Users, 
  MapPin, 
  Compass, 
  CalendarDays,
  Bell, 
  MessageSquare,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import Link from 'next/link';

export default function DashboardPage() {
  const { 
    members, 
    events, 
    announcements, 
    guestbook 
  } = useFamily();

  const [greeting, setGreeting] = useState({ id: 'Selamat Datang', jv: 'Sugeng Rawuh' });
  const [timeStr, setTimeStr] = useState('');

  // Hitung salam Javanese dinamis berdasarkan jam
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      let jvGreet = 'Sugeng Rawuh';
      let idGreet = 'Selamat Datang';

      if (hour >= 4 && hour < 10) {
        jvGreet = 'Sugeng Enjang';
        idGreet = 'Selamat Pagi';
      } else if (hour >= 10 && hour < 15) {
        jvGreet = 'Sugeng Siang';
        idGreet = 'Selamat Siang';
      } else if (hour >= 15 && hour < 18) {
        jvGreet = 'Sugeng Sonten';
        idGreet = 'Selamat Sore';
      } else {
        jvGreet = 'Sugeng Dalu';
        idGreet = 'Selamat Malam';
      }

      setGreeting({ id: idGreet, jv: jvGreet });
      
      // format tanggal hari ini bahasa indonesia
      const options: Intl.DateTimeFormatOptions = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setTimeStr(now.toLocaleDateString('id-ID', options));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  // 1. STATS CALCULATIONS
  const totalDulur = members.length;
  
  const uniqueCities = Array.from(
    new Set(members.map(m => m.domicile).filter(Boolean))
  ).length;
  
  const totalRantau = members.filter(m => m.isMerantau).length;

  // Cari generasi dengan anggota terbanyak
  const genCounts = members.reduce((acc, curr) => {
    acc[curr.generation] = (acc[curr.generation] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const genNames = ['Sesepuh', 'Anak/Bapak-Ibu', 'Cucu/Mas-Mbak', 'Cicit/Adik-Adik'];
  let maxGenIndex = 2; // Default cucu
  let maxCount = 0;
  Object.entries(genCounts).forEach(([gen, count]) => {
    if (count > maxCount) {
      maxCount = count;
      maxGenIndex = Number(gen);
    }
  });
  const dominanGen = genNames[maxGenIndex];

  // 2. FILTER UPCOMING EVENTS (30 HARI KE DEPAN)
  const getUpcomingEvents = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentDate = now.getDate();

    return events.filter(event => {
      // Untuk event tahunan seperti ulang tahun / anniversary, kita cek bulan & tanggal saja
      const eventDate = new Date(event.date);
      const eventMonth = eventDate.getMonth();
      const eventDay = eventDate.getDate();

      // Cek jika jatuh dalam 30 hari ke depan
      const eventThisYear = new Date(now.getFullYear(), eventMonth, eventDay);
      if (eventThisYear < new Date(now.getFullYear(), currentMonth, currentDate)) {
        eventThisYear.setFullYear(now.getFullYear() + 1);
      }

      const diffTime = eventThisYear.getTime() - now.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return diffDays >= 0 && diffDays <= 30;
    }).sort((a, b) => {
      // Urutkan berdasarkan jarak hari terdekat
      const getDaysDiff = (dateStr: string) => {
        const d = new Date(dateStr);
        const ty = new Date(now.getFullYear(), d.getMonth(), d.getDate());
        if (ty < new Date(now.getFullYear(), now.getMonth(), now.getDate())) {
          ty.setFullYear(now.getFullYear() + 1);
        }
        return ty.getTime();
      };
      return getDaysDiff(a.date) - getDaysDiff(b.date);
    }).slice(0, 3); // Ambil 3 teratas
  };

  const upcomingEventsList = getUpcomingEvents();

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-3 duration-350">
      {/* Welcome Hero Card */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card p-6 md:p-8 shadow-md">
        {/* Decorative circle */}
        <div className="absolute top-[-20%] right-[-5%] w-[30%] h-[120%] rounded-full bg-primary/5 blur-2xl pointer-events-none"></div>
        <div className="absolute bottom-[-40%] left-[-10%] w-[30%] h-[120%] rounded-full bg-secondary/5 blur-2xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 z-10 relative">
          <div>
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Sparkles className="h-4 w-4 fill-primary/20" />
              <span className="text-xs font-bold font-serif italic tracking-wide">{greeting.jv}</span>
            </div>
            <h2 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
              {greeting.id}, Keluarga Besar
            </h2>
            <p className="text-muted text-sm mt-1.5 max-w-xl leading-relaxed">
              Sugeng rawuh ing portal silaturahmi silsilah keluarga kita. Tetap terhubung, bertukar kenangan hangat, dan menjaga warisan kerukunan di mana pun Anda berada.
            </p>
          </div>
          
          <div className="bg-background px-5 py-3.5 rounded-2xl border border-border flex flex-col items-start md:items-end flex-shrink-0">
            <span className="text-[10px] uppercase font-bold text-muted tracking-wider">Hari Ini</span>
            <span className="text-sm font-semibold text-foreground mt-0.5">{timeStr}</span>
          </div>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {/* Stat 1 */}
        <div className="bg-card border border-border p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
          <div className="h-10 w-10 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Users className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-muted tracking-wide uppercase">Total Dulur</span>
          <h3 className="text-3xl font-bold text-foreground mt-1 tracking-tight">{totalDulur} <span className="text-xs font-normal text-muted">anggota</span></h3>
        </div>

        {/* Stat 2 */}
        <div className="bg-card border border-border p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
          <div className="h-10 w-10 rounded-xl bg-secondary-light text-secondary flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <MapPin className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-muted tracking-wide uppercase">Kota Domisili</span>
          <h3 className="text-3xl font-bold text-foreground mt-1 tracking-tight">{uniqueCities} <span className="text-xs font-normal text-muted">kota</span></h3>
        </div>

        {/* Stat 3 */}
        <div className="bg-card border border-border p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
          <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Compass className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-muted tracking-wide uppercase">Merantau</span>
          <h3 className="text-3xl font-bold text-foreground mt-1 tracking-tight">{totalRantau} <span className="text-xs font-normal text-muted">perantau</span></h3>
        </div>

        {/* Stat 4 */}
        <div className="bg-card border border-border p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-primary/20 transition-all group">
          <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xs font-semibold text-muted tracking-wide uppercase">Generasi Dominan</span>
          <h3 className="text-xl md:text-2xl font-bold text-foreground mt-2 truncate tracking-tight">{dominanGen}</h3>
        </div>
      </div>

      {/* Main Grid: Content Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Events & Announcements (2/3 columns on large screen) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Widget: Announcements */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <h3 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Wara-Wara Keluarga (Pengumuman)
              </h3>
              <Link 
                href="/dashboard/kebersamaan" 
                className="text-xs font-semibold text-primary hover:text-primary-hover flex items-center gap-1 transition-all"
              >
                Lihat Semua <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {announcements.slice(0, 2).map((ann) => (
                <div key={ann.id} className="p-4 rounded-xl bg-background border border-border hover:border-primary/15 transition-all">
                  <div className="flex items-center justify-between mb-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
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
                    <span className="text-[10px] text-muted font-medium">{ann.date}</span>
                  </div>
                  <h4 className="font-bold text-foreground text-sm leading-snug">{ann.title}</h4>
                  <p className="text-muted text-xs mt-1.5 line-clamp-2 leading-relaxed">{ann.content}</p>
                  <span className="text-[10px] text-muted italic mt-2 block">Ditulis oleh: {ann.author}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Widget: Guestbook snippet */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
              <h3 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-secondary" />
                Salam Kangen & Doa Terbaru
              </h3>
              <Link 
                href="/dashboard/kebersamaan" 
                className="text-xs font-semibold text-secondary hover:text-secondary-hover flex items-center gap-1 transition-all"
              >
                Tulis Ucapan <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-4">
              {guestbook.slice(0, 3).map((entry) => (
                <div key={entry.id} className="flex gap-3 items-start">
                  <div className={`h-8 w-8 rounded-full ${entry.avatarColor || 'bg-stone-500'} text-white flex items-center justify-center text-xs font-bold flex-shrink-0 shadow-inner`}>
                    {entry.authorName.charAt(0)}
                  </div>
                  <div className="flex-1 bg-background p-3 rounded-2xl border border-border">
                    <div className="flex justify-between items-baseline mb-1">
                      <span className="text-xs font-bold text-foreground">{entry.authorName}</span>
                      <span className="text-[9px] text-muted font-medium">{entry.timestamp}</span>
                    </div>
                    <p className="text-muted text-xs leading-relaxed italic">"{entry.message}"</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Kalender Guyub Widget (1/3 column) */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-fit">
          <div className="flex items-center justify-between border-b border-border/50 pb-4 mb-4">
            <h3 className="text-lg font-serif font-bold text-foreground flex items-center gap-2">
              <CalendarDays className="h-5 w-5 text-accent" />
              Kalender Guyub (30 Hari)
            </h3>
            <Link 
              href="/dashboard/kalender" 
              className="text-xs font-semibold text-accent hover:text-accent/80 flex items-center gap-1 transition-all"
            >
              Kalender <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {upcomingEventsList.length > 0 ? (
              upcomingEventsList.map((evt) => {
                // Formatting tanggal ringkas
                const d = new Date(evt.date);
                const day = d.getDate();
                const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
                const month = months[d.getMonth()];
                
                // Cari nama anggota jika terasosiasi
                const person = evt.personId ? members.find(m => m.id === evt.personId) : null;

                return (
                  <div key={evt.id} className="flex gap-3.5 items-center p-3 rounded-xl hover:bg-background transition-all">
                    {/* Kotak Tanggal */}
                    <div className="h-12 w-12 rounded-xl bg-accent/10 border border-accent/20 text-accent flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-xs font-bold leading-none">{day}</span>
                      <span className="text-[9px] font-bold uppercase leading-none mt-1">{month}</span>
                    </div>
                    
                    {/* Detail Acara */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-bold text-foreground truncate">{evt.title}</h4>
                      <p className="text-[11px] text-muted truncate mt-0.5">
                        {evt.type === 'birthday' ? 'Ulang Tahun' : evt.type === 'anniversary' ? 'Ulang Tahun Pernikahan' : 'Kumpul Keluarga'}
                        {person ? `: ${person.name}` : ''}
                      </p>
                      {evt.location && (
                        <p className="text-[10px] text-muted italic mt-0.5 truncate">📍 {evt.location}</p>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 bg-background rounded-xl border border-border/50">
                <p className="text-xs text-muted">Tidak ada agenda penting dalam 30 hari ke depan.</p>
                <Link href="/dashboard/kalender" className="text-xs font-semibold text-primary mt-2 inline-block hover:underline">
                  Lihat agenda lengkap
                </Link>
              </div>
            )}
          </div>
          
          <div className="mt-6 pt-5 border-t border-border/50">
            <Link 
              href="/dashboard/pohon" 
              className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-md shadow-primary/10 transition-all cursor-pointer"
            >
              <span>Jelajahi Pohon Silsilah</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
