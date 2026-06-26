'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFamily } from '@/context/FamilyContext';
import { KeyRound, Heart, Compass, HeartHandshake } from 'lucide-react';

export default function LandingPage() {
  const { isAuthenticated, login } = useFamily();
  const router = useRouter();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // If already authenticated, redirect to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulated network delay for premium feel
    setTimeout(() => {
      const success = login(code);
      setLoading(false);
      if (success) {
        router.push('/dashboard');
      } else {
        setError('Ngapunten (Maaf), kode undangan tidak cocok. Silakan periksa kembali atau hubungi pengelola keluarga.');
      }
    }, 800);
  };

  return (
    <main className="min-h-screen flex flex-col md:flex-row bg-background text-foreground relative overflow-hidden tree-grid-bg">
      {/* Background decoration elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-3xl"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-secondary/5 blur-3xl"></div>

      {/* Left Column: Philosophical Intro */}
      <div className="flex-1 flex flex-col justify-between p-8 md:p-16 lg:p-24 z-10">
        {/* Header */}
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold font-serif text-primary tracking-wide">Dulurku</span>
          <span className="h-1.5 w-1.5 rounded-full bg-secondary"></span>
          <span className="text-xs text-muted font-semibold uppercase tracking-wider">Portal Keluarga</span>
        </div>

        {/* Hero Section */}
        <div className="my-auto max-w-xl py-12 md:py-0">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-foreground leading-[1.1] mb-6">
            Guyub Rukun<br />
            <span className="text-primary italic font-medium">Marganing Rahayu.</span>
          </h2>
          
          <blockquote className="border-l-2 border-primary/45 pl-4 mb-8 text-muted text-sm md:text-base italic">
            "Kebersamaan yang rukun, saling menjaga silaturahmi lintas generasi dan lintas kota, adalah jalan utama menuju keselamatan dan kebahagiaan keluarga besar."
          </blockquote>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-xl bg-primary/10 text-primary mt-0.5">
                <Compass className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Silsilah Lintas Generasi</h4>
                <p className="text-muted text-xs mt-0.5">Menelusuri akar leluhur hingga generasi cicit terbaru secara interaktif.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="p-2 rounded-xl bg-secondary/10 text-secondary mt-0.5">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-foreground">Kalender Guyub & Acara</h4>
                <p className="text-muted text-xs mt-0.5">Mengingat hari lahir, hari pernikahan, arisan, dan kumpul keluarga.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-xs text-muted flex items-center gap-1.5 mt-4">
          <span>Dibuat dengan</span>
          <Heart className="h-3 w-3 text-red-500 fill-red-500 animate-pulse" />
          <span>untuk menjaga silaturahmi seluruh Dulur.</span>
        </div>
      </div>

      {/* Right Column: Invite Form Card */}
      <div className="w-full md:w-[460px] lg:w-[520px] flex flex-col justify-center p-8 md:p-16 border-t md:border-t-0 md:border-l border-border bg-card/40 backdrop-blur-sm z-10">
        <div className="max-w-md w-full mx-auto">
          <div className="bg-card border border-border p-8 md:p-10 rounded-2xl shadow-xl shadow-stone-200/50 dark:shadow-stone-950/10">
            <div className="mb-8">
              <div className="h-12 w-12 rounded-xl bg-primary-light text-primary flex items-center justify-center mb-4">
                <KeyRound className="h-6 w-6" />
              </div>
              <h3 className="text-2xl font-serif font-bold text-foreground">Gerbang Silaturahmi</h3>
              <p className="text-muted text-xs mt-1">
                Data silsilah bersifat privat. Masukkan kode undangan keluarga besar Anda untuk masuk ke dalam portal.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="invite-code" className="block text-xs font-semibold text-foreground uppercase tracking-wider mb-2">
                  Kode Undangan Keluarga
                </label>
                <input
                  id="invite-code"
                  type="text"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="Contoh: DULURGUYUB"
                  required
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal placeholder:font-medium"
                />
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/5 border border-red-500/20 text-red-600 dark:text-red-400 text-xs leading-relaxed">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white text-sm font-semibold transition-all duration-200 cursor-pointer shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                ) : (
                  <span>Masuk Guyub</span>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-border/50 text-center">
              <p className="text-[10px] text-muted leading-relaxed">
                Tip: Kode akses dibagikan secara manual oleh pengelola keluarga melalui grup obrolan Whatsapp keluarga Anda.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
