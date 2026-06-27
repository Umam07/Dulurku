'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Person, 
  Relationship, 
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

  // Load state dari SQLite via API saat pertama kali dimuat
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    const loadState = async () => {
      try {
        const res = await fetch('/api/db');
        if (res.ok) {
          const syncedState = await res.json();
          setState(syncedState);
        } else {
          console.error('Failed to load family state from database API');
        }
      } catch (error) {
        console.error('API load error:', error);
      } finally {
        setIsLoaded(true);
      }
    };

    const storedAuth = localStorage.getItem(AUTH_KEY);
    if (storedAuth === 'true') {
      setIsAuthenticated(true);
    }

    const storedAdmin = localStorage.getItem(ADMIN_KEY);
    if (storedAdmin === 'true') {
      setIsAdmin(true);
    }

    loadState();
    /* eslint-enable react-hooks/set-state-in-effect */
  }, []);

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

  // CRUD Members (SQLite-Backed)
  const addMember = (newPerson: Omit<Person, 'id'>): Person => {
    const id = generateId('p');
    const person: Person = { ...newPerson, id };
    
    // Update local state optimistically
    setState(prev => ({
      ...prev,
      members: [...prev.members, person]
    }));

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addMember', payload: person })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('addMember error:', err));

    return person;
  };

  const updateMember = (id: string, updatedFields: Partial<Person>) => {
    // Update local state optimistically
    setState(prev => ({
      ...prev,
      members: prev.members.map(m => m.id === id ? { ...m, ...updatedFields } : m)
    }));

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'updateMember', payload: { id, fields: updatedFields } })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('updateMember error:', err));
  };

  const deleteMember = (id: string) => {
    // Update local state optimistically
    setState(prev => {
      const members = prev.members.filter(m => m.id !== id);
      const relationships = prev.relationships.filter(
        r => r.personIdA !== id && r.personIdB !== id
      );
      const parentChildRelations = prev.parentChildRelations.filter(
        pc => pc.parentId !== id && pc.childId !== id
      );
      const events = prev.events.filter(e => e.personId !== id);
      return { ...prev, members, relationships, parentChildRelations, events };
    });

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteMember', payload: { id } })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('deleteMember error:', err));
  };

  // CRUD Relationships (SQLite-Backed)
  const addRelationship = (newRel: Omit<Relationship, 'id'>) => {
    const exists = state.relationships.some(
      r => (r.personIdA === newRel.personIdA && r.personIdB === newRel.personIdB) ||
           (r.personIdA === newRel.personIdB && r.personIdB === newRel.personIdA)
    );
    if (exists) return;

    const id = generateId('r');
    const rel: Relationship = { ...newRel, id };
    
    // Update local state optimistically
    setState(prev => ({
      ...prev,
      relationships: [...prev.relationships, rel]
    }));

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addRelationship', payload: rel })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('addRelationship error:', err));
  };

  const deleteRelationship = (id: string) => {
    // Update local state optimistically
    setState(prev => ({
      ...prev,
      relationships: prev.relationships.filter(r => r.id !== id)
    }));

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteRelationship', payload: { id } })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('deleteRelationship error:', err));
  };

  const addParentChildRelation = (parentId: string, childId: string) => {
    const exists = state.parentChildRelations.some(
      pc => pc.parentId === parentId && pc.childId === childId
    );
    if (exists) return;

    // Update local state optimistically
    setState(prev => ({
      ...prev,
      parentChildRelations: [...prev.parentChildRelations, { parentId, childId }]
    }));

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addParentChildRelation', payload: { parentId, childId } })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('addParentChildRelation error:', err));
  };

  const deleteParentChildRelation = (parentId: string, childId: string) => {
    // Update local state optimistically
    setState(prev => ({
      ...prev,
      parentChildRelations: prev.parentChildRelations.filter(
        pc => !(pc.parentId === parentId && pc.childId === childId)
      )
    }));

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteParentChildRelation', payload: { parentId, childId } })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('deleteParentChildRelation error:', err));
  };

  // CRUD Events (SQLite-Backed)
  const addEvent = (newEvent: Omit<FamilyEvent, 'id'>) => {
    const id = generateId('e');
    const event: FamilyEvent = { ...newEvent, id };
    
    // Update local state optimistically
    setState(prev => ({
      ...prev,
      events: [...prev.events, event]
    }));

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addEvent', payload: event })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('addEvent error:', err));
  };

  const deleteEvent = (id: string) => {
    // Update local state optimistically
    setState(prev => ({
      ...prev,
      events: prev.events.filter(e => e.id !== id)
    }));

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteEvent', payload: { id } })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('deleteEvent error:', err));
  };

  // CRUD Announcements (SQLite-Backed)
  const addAnnouncement = (newAnn: Omit<Announcement, 'id' | 'date'>) => {
    const id = generateId('a');
    const date = new Date().toISOString().split('T')[0];
    const ann: Announcement = { ...newAnn, id, date };
    
    // Update local state optimistically
    setState(prev => ({
      ...prev,
      announcements: [ann, ...prev.announcements]
    }));

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addAnnouncement', payload: ann })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('addAnnouncement error:', err));
  };

  const deleteAnnouncement = (id: string) => {
    // Update local state optimistically
    setState(prev => ({
      ...prev,
      announcements: prev.announcements.filter(a => a.id !== id)
    }));

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteAnnouncement', payload: { id } })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('deleteAnnouncement error:', err));
  };

  // CRUD Guestbook (SQLite-Backed)
  const addGuestbook = (newEntry: Omit<GuestbookEntry, 'id' | 'timestamp'>) => {
    const id = generateId('g');
    const now = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const timestamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const entry: GuestbookEntry = { ...newEntry, id, timestamp };
    
    // Update local state optimistically
    setState(prev => ({
      ...prev,
      guestbook: [entry, ...prev.guestbook]
    }));

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'addGuestbook', payload: entry })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('addGuestbook error:', err));
  };

  const deleteGuestbook = (id: string) => {
    // Update local state optimistically
    setState(prev => ({
      ...prev,
      guestbook: prev.guestbook.filter(g => g.id !== id)
    }));

    // Sync to SQLite
    fetch('/api/db', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'deleteGuestbook', payload: { id } })
    })
    .then(res => res.json())
    .then(syncedState => setState(syncedState))
    .catch(err => console.error('deleteGuestbook error:', err));
  };

  // Tampilkan blank loading screen di awal sebelum state termuat dari database
  if (!isLoaded) {
    return null;
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
