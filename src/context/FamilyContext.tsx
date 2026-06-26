'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Person, 
  Relationship, 
  ParentChild, 
  FamilyEvent, 
  Announcement, 
  GuestbookEntry,
  FamilyState 
} from '../types/family';
import { 
  initialMembers, 
  initialRelationships, 
  initialParentChildRelations, 
  initialEvents, 
  initialAnnouncements, 
  initialGuestbook 
} from '../data/initialData';

interface FamilyContextType extends FamilyState {
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (code: string) => boolean;
  logout: () => void;
  toggleAdminMode: () => void;
  
  // CRUD Anggota
  addMember: (person: Omit<Person, 'id'>) => Person;
  updateMember: (id: string, person: Partial<Person>) => void;
  deleteMember: (id: string) => void;
  
  // CRUD Relasi
  addRelationship: (rel: Omit<Relationship, 'id'>) => void;
  deleteRelationship: (id: string) => void;
  addParentChildRelation: (parentId: string, childId: string) => void;
  deleteParentChildRelation: (parentId: string, childId: string) => void;
  
  // CRUD Acara
  addEvent: (event: Omit<FamilyEvent, 'id'>) => void;
  deleteEvent: (id: string) => void;
  
  // CRUD Pengumuman
  addAnnouncement: (ann: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;
  
  // CRUD Buku Tamu
  addGuestbook: (entry: Omit<GuestbookEntry, 'id' | 'timestamp'>) => void;
  deleteGuestbook: (id: string) => void;
}

const FamilyContext = createContext<FamilyContextType | undefined>(undefined);

const STORAGE_KEY = 'dulurku_family_state_v1';
const AUTH_KEY = 'dulurku_auth_status';
const ADMIN_KEY = 'dulurku_admin_mode';
const INVITE_CODE = 'DULURGUYUB';

export const FamilyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<FamilyState>({
    members: [],
    relationships: [],
    parentChildRelations: [],
    events: [],
    announcements: [],
    guestbook: []
  });
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    try {
      const storedState = localStorage.getItem(STORAGE_KEY);
      if (storedState) {
        setState(JSON.parse(storedState));
      } else {
        // First time initialization with seed data
        const initialState: FamilyState = {
          members: initialMembers,
          relationships: initialRelationships,
          parentChildRelations: initialParentChildRelations,
          events: initialEvents,
          announcements: initialAnnouncements,
          guestbook: initialGuestbook
        };
        setState(initialState);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialState));
      }

      const storedAuth = localStorage.getItem(AUTH_KEY);
      if (storedAuth === 'true') {
        setIsAuthenticated(true);
      }

      const storedAdmin = localStorage.getItem(ADMIN_KEY);
      if (storedAdmin === 'true') {
        setIsAdmin(true);
      }
    } catch (error) {
      console.error('Failed to load family state from localStorage', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save state to localStorage whenever it changes, but only after initial load
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save family state to localStorage', error);
    }
  }, [state, isLoaded]);

  // Auth Actions
  const login = (code: string): boolean => {
    const formattedCode = code.trim().toUpperCase();
    if (formattedCode === INVITE_CODE) {
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_KEY, 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    setIsAdmin(false);
    localStorage.removeItem(AUTH_KEY);
    localStorage.removeItem(ADMIN_KEY);
  };

  const toggleAdminMode = () => {
    const nextAdminState = !isAdmin;
    setIsAdmin(nextAdminState);
    localStorage.setItem(ADMIN_KEY, String(nextAdminState));
  };

  // Helper generator ID unik
  const generateId = (prefix: string): string => {
    return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
  };

  // CRUD Members
  const addMember = (newPerson: Omit<Person, 'id'>): Person => {
    const id = generateId('p');
    const person: Person = { ...newPerson, id };
    setState(prev => ({
      ...prev,
      members: [...prev.members, person]
    }));
    return person;
  };

  const updateMember = (id: string, updatedFields: Partial<Person>) => {
    setState(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, ...updatedFields } : m)
    }));
  };

  const deleteMember = (id: string) => {
    setState(prev => {
      // Hapus anggota
      const members = prev.members.filter(m => m.id !== id);
      
      // Hapus hubungan pernikahan terkait
      const relationships = prev.relationships.filter(
        r => r.personIdA !== id && r.personIdB !== id
      );
      
      // Hapus hubungan orang tua - anak terkait
      const parentChildRelations = prev.parentChildRelations.filter(
        pc => pc.parentId !== id && pc.childId !== id
      );

      // Hapus event ulang tahun terkait jika ada
      const events = prev.events.filter(e => e.personId !== id);

      return {
        ...prev,
        members,
        relationships,
        parentChildRelations,
        events
      };
    });
  };

  // CRUD Relationships
  const addRelationship = (newRel: Omit<Relationship, 'id'>) => {
    // Cek jika sudah ada relasi serupa
    const exists = state.relationships.some(
      r => (r.personIdA === newRel.personIdA && r.personIdB === newRel.personIdB) ||
           (r.personIdA === newRel.personIdB && r.personIdB === newRel.personIdA)
    );
    if (exists) return;

    const id = generateId('r');
    const rel: Relationship = { ...newRel, id };
    setState(prev => ({
      ...prev,
      relationships: [...prev.relationships, rel]
    }));
  };

  const deleteRelationship = (id: string) => {
    setState(prev => ({
      ...prev,
      relationships: prev.relationships.filter(r => r.id !== id)
    }));
  };

  const addParentChildRelation = (parentId: string, childId: string) => {
    const exists = state.parentChildRelations.some(
      pc => pc.parentId === parentId && pc.childId === childId
    );
    if (exists) return;

    setState(prev => ({
      ...prev,
      parentChildRelations: [...prev.parentChildRelations, { parentId, childId }]
    }));
  };

  const deleteParentChildRelation = (parentId: string, childId: string) => {
    setState(prev => ({
      ...prev,
      parentChildRelations: prev.parentChildRelations.filter(
        pc => !(pc.parentId === parentId && pc.childId === childId)
      )
    }));
  };

  // CRUD Events
  const addEvent = (newEvent: Omit<FamilyEvent, 'id'>) => {
    const id = generateId('e');
    const event: FamilyEvent = { ...newEvent, id };
    setState(prev => ({
      ...prev,
      events: [...prev.events, event]
    }));
  };

  const deleteEvent = (id: string) => {
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));
  };

  // CRUD Announcements
  const addAnnouncement = (newAnn: Omit<Announcement, 'id' | 'date'>) => {
    const id = generateId('a');
    const date = new Date().toISOString().split('T')[0]; // format YYYY-MM-DD
    const ann: Announcement = { ...newAnn, id, date };
    setState(prev => ({
      ...prev,
      announcements: [ann, ...prev.announcements] // Taruh paling atas
    }));
  };

  const deleteAnnouncement = (id: string) => {
    setState(prev => ({
      ...prev,
      announcements: prev.announcements.filter(a => a.id !== id)
    }));
  };

  // CRUD Guestbook
  const addGuestbook = (newEntry: Omit<GuestbookEntry, 'id' | 'timestamp'>) => {
    const id = generateId('g');
    
    // Format waktu lokal: YYYY-MM-DD HH:mm
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    
    const entry: GuestbookEntry = { ...newEntry, id, timestamp };
    setState(prev => ({
      ...prev,
      guestbook: [entry, ...prev.guestbook] // Taruh paling atas
    }));
  };

  const deleteGuestbook = (id: string) => {
    setState(prev => ({
      ...prev,
      guestbook: prev.guestbook.filter(g => g.id !== id)
    }));
  };

  // Tampilkan blank loading screen di awal sebelum state termuat dari localStorage
  if (!isLoaded) {
    return null; // Atau spinner pemuatan sederhana
  }

  return (
    <FamilyContext.Provider
      value={{
        ...state,
        isAuthenticated,
        isAdmin,
        login,
        logout,
        toggleAdminMode,
        addMember,
        updateMember,
        deleteMember,
        addRelationship,
        deleteRelationship,
        addParentChildRelation,
        deleteParentChildRelation,
        addEvent,
        deleteEvent,
        addAnnouncement,
        deleteAnnouncement,
        addGuestbook,
        deleteGuestbook
      }}
    >
      {children}
    </FamilyContext.Provider>
  );
};

export const useFamily = () => {
  const context = useContext(FamilyContext);
  if (context === undefined) {
    throw new Error('useFamily must be used within a FamilyProvider');
  }
  return context;
};
