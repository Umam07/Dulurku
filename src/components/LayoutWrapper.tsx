'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useFamily } from '@/context/FamilyContext';
import { 
  Home, 
  Network, 
  Users, 
  Calendar, 
  Image, 
  LogOut, 
  Menu, 
  X, 
  Sun, 
  Moon, 
  ShieldAlert, 
  ShieldCheck,
  User
} from 'lucide-react';
import Link from 'next/link';

interface LayoutWrapperProps {
  children: React.ReactNode;
}

export const LayoutWrapper: React.FC<LayoutWrapperProps> = ({ children }) => {
  const { 
    isAuthenticated, 
    isAdmin, 
    toggleAdminMode, 
    logout 
  } = useFamily();
  const pathname = usePathname();
  const router = useRouter();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  // Handle Dark Mode initial state and changes
  useEffect(() => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(isDark);
  }, []);

  const toggleDarkMode = () => {
    const nextDark = !darkMode;
    setDarkMode(nextDark);
    if (nextDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  if (!isAuthenticated) {
    return null; // Don't render anything while redirecting
  }

  const navigation = [
    { name: 'Dasbor Guyub', href: '/dashboard', icon: Home },
    { name: 'Pohon Silsilah', href: '/dashboard/pohon', icon: Network },
    { name: 'Direktori Dulur', href: '/dashboard/anggota', icon: Users },
    { name: 'Kalender Guyub', href: '/dashboard/kalender', icon: Calendar },
    { name: 'Ruang Bersama', href: '/dashboard/kebersamaan', icon: Image },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
      {/* Sidebar Desktop */}
      <div className="hidden md:flex md:flex-col md:w-64 md:flex-shrink-0 border-r border-border bg-card">
        {/* Logo & Filosofi */}
        <div className="p-6 border-b border-border flex flex-col gap-1">
          <h1 className="text-2xl font-serif font-bold text-primary tracking-wide flex items-center gap-2">
             Dulurku
          </h1>
          <p className="text-[10px] italic text-muted tracking-wider uppercase">
            Guyub Rukun Marganing Rahayu
          </p>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-250 ${
                  active 
                    ? 'text-primary bg-primary-light font-semibold border-l-4 border-primary' 
                    : 'text-muted hover:text-foreground hover:bg-background'
                }`}
              >
                <item.icon className={`h-5 w-5 ${active ? 'text-primary' : 'text-muted'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Controls */}
        <div className="p-4 border-t border-border flex flex-col gap-2 bg-background/40">
          {/* Admin Mode Switcher */}
          <button
            onClick={toggleAdminMode}
            className={`flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
              isAdmin 
                ? 'bg-amber-500/10 text-amber-600 border border-amber-500/35 dark:text-amber-400' 
                : 'text-muted hover:text-foreground hover:bg-card border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              {isAdmin ? <ShieldCheck className="h-4 w-4 text-amber-500" /> : <ShieldAlert className="h-4 w-4" />}
              <span>Mode Pengelola</span>
            </div>
            <span className={`h-2 w-2 rounded-full ${isAdmin ? 'bg-amber-500 animate-pulse' : 'bg-stone-300 dark:bg-stone-700'}`}></span>
          </button>

          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-xs font-medium text-muted hover:text-foreground hover:bg-card transition-all"
          >
            <div className="flex items-center gap-2">
              {darkMode ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              <span>{darkMode ? 'Mode Terang' : 'Mode Gelap'}</span>
            </div>
          </button>

          {/* Logout */}
          <button
            onClick={logout}
            className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-xs font-medium text-red-600 hover:bg-red-500/10 transition-all dark:text-red-400"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar Portal</span>
          </button>
        </div>
      </div>

      {/* Mobile Top Navigation */}
      <div className="flex flex-col flex-1 overflow-hidden">
        <header className="md:hidden flex items-center justify-between px-6 py-4 border-b border-border bg-card">
          <div className="flex flex-col">
            <h1 className="text-xl font-serif font-bold text-primary">Dulurku</h1>
            <p className="text-[9px] italic text-muted uppercase tracking-wider">Guyub Rukun</p>
          </div>
          
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-muted hover:text-foreground hover:bg-background transition-all"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </header>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-0 top-[65px] z-50 bg-background flex flex-col border-t border-border animate-in fade-in slide-in-from-top-5 duration-200">
            <nav className="flex-1 px-6 py-6 space-y-2">
              {navigation.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-4 px-4 py-3.5 rounded-xl text-base font-medium transition-all ${
                      active 
                        ? 'text-primary bg-primary-light font-semibold border-l-4 border-primary' 
                        : 'text-muted hover:text-foreground hover:bg-card'
                    }`}
                  >
                    <item.icon className="h-6 w-6" />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            
            {/* Mobile drawer footer */}
            <div className="p-6 border-t border-border bg-card flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => {
                    toggleAdminMode();
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                    isAdmin 
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' 
                      : 'text-muted'
                  }`}
                >
                  {isAdmin ? <ShieldCheck className="h-5 w-5 text-amber-500" /> : <ShieldAlert className="h-5 w-5" />}
                  <span>Mode Pengelola: {isAdmin ? 'Aktif' : 'Nonaktif'}</span>
                </button>

                <button
                  onClick={toggleDarkMode}
                  className="p-2.5 rounded-xl bg-background border border-border text-muted hover:text-foreground transition-all"
                >
                  {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                </button>
              </div>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="flex items-center justify-center gap-2 w-full py-3 rounded-xl text-sm font-semibold text-red-600 bg-red-500/5 hover:bg-red-500/10 transition-all dark:text-red-400 border border-red-500/10"
              >
                <LogOut className="h-4 w-4" />
                <span>Keluar Portal</span>
              </button>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-background p-6 md:p-10 relative">
          {/* Admin Indicator Floating (Desktop) */}
          {isAdmin && (
            <div className="hidden md:flex absolute top-6 right-10 items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-semibold animate-bounce shadow-sm">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Anda berada dalam Mode Pengelola (Bisa Edit Silsilah)</span>
            </div>
          )}
          
          {children}
        </main>
      </div>
    </div>
  );
};
export default LayoutWrapper;
