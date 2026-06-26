'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { Person } from '@/types/family';
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  MapPin, 
  Map, 
  HelpCircle,
  Sparkles
} from 'lucide-react';
import MemberDetail from './MemberDetail';

// Dimensi node silsilah
const NODE_WIDTH = 150;
const NODE_HEIGHT = 76;
const SPOUSE_GAP = 190; // Jarak antar pusat pasangan
const SIBLING_GAP = 40;
const GEN_GAP = 220; // Jarak antar generasi (Y axis)

interface Position {
  x: number;
  y: number;
}

interface Edge {
  id: string;
  d: string;
  type: 'marriage' | 'parent-child';
}

export default function FamilyTree() {
  const { 
    members, 
    relationships, 
    parentChildRelations,
    isAdmin 
  } = useFamily();

  // State untuk interaksi kanvas
  const [scale, setScale] = useState(0.85);
  const [translate, setTranslate] = useState({ x: 100, y: 50 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  // State untuk pencarian & filter
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomicile, setSelectedDomicile] = useState('all');
  const [highlightRantau, setHighlightRantau] = useState(false);
  const [highlightedNodeId, setHighlightedNodeId] = useState<string | null>(null);
  
  // State untuk detail anggota
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Daftar domisili untuk filter
  const domiciles = useMemo(() => {
    return ['all', ...Array.from(new Set(members.map(m => m.domicile).filter(Boolean)))];
  }, [members]);

  // --- ALGORITMA LAYOUTING POHON KELUARGA (SVG LAYOUT SOLVER) ---
  const layoutData = useMemo(() => {
    const nodePositions: Record<string, Position> = {};
    const treeEdges: Edge[] = [];
    
    // 1. Petakan Pasangan
    const spouseMap: Record<string, string> = {};
    const marriageRelMap: Record<string, string> = {}; // personId -> relationshipId
    
    relationships.forEach(r => {
      if (r.type === 'spouse') {
        spouseMap[r.personIdA] = r.personIdB;
        spouseMap[r.personIdB] = r.personIdA;
        marriageRelMap[r.personIdA] = r.id;
        marriageRelMap[r.personIdB] = r.id;
      }
    });

    // Helper untuk mengambil anak dari satu orang / pasangan
    const getChildrenOf = (parentA: string, parentB?: string) => {
      const childrenA = parentChildRelations
        .filter(pc => pc.parentId === parentA)
        .map(pc => pc.childId);
      
      if (!parentB) return childrenA;
      
      const childrenB = parentChildRelations
        .filter(pc => pc.parentId === parentB)
        .map(pc => pc.childId);
        
      // Gabungkan anak unik dari kedua orang tua
      return Array.from(new Set([...childrenA, ...childrenB]));
    };

    // Temukan anggota teratas (Generasi 0 yang tidak memiliki orang tua)
    const roots = members.filter(m => {
      const hasParents = parentChildRelations.some(pc => pc.childId === m.id);
      return m.generation === 0 && !hasParents;
    });

    // Jika kosong, gunakan siapa pun di Gen 0
    const mainRoots = roots.length > 0 ? roots : members.filter(m => m.generation === 0);

    // Lacak X terluar untuk mencegah tabrakan pada setiap generasi
    const nextAvailableX: Record<number, number> = {};

    // Menghitung lebar sub-tree secara rekursif (untuk alokasi ruang X)
    const subTreeWidths: Record<string, number> = {};

    const calculateSubTreeWidth = (personId: string): number => {
      if (subTreeWidths[personId]) return subTreeWidths[personId];

      const spouseId = spouseMap[personId];
      const children = getChildrenOf(personId, spouseId);
      
      // Jika memiliki pasangan, hitung sebagai satu unit
      const isCouple = !!spouseId;
      const baseWidth = isCouple ? SPOUSE_GAP + NODE_WIDTH + SIBLING_GAP : NODE_WIDTH + SIBLING_GAP;

      if (children.length === 0) {
        subTreeWidths[personId] = baseWidth;
        if (spouseId) subTreeWidths[spouseId] = baseWidth;
        return baseWidth;
      }

      // Hitung total lebar anak-anak
      // Agar anak tidak dihitung ganda jika bapak/ibu diproses terpisah, kita hanya hitung dari "primary parent"
      let childrenTotalWidth = 0;
      children.forEach(childId => {
        // Jika anak memiliki pasangan, kita hanya memproses salah satunya sebagai root sub-tree anak tersebut
        const childSpouse = spouseMap[childId];
        const primaryChildId = childSpouse && members.find(m => m.id === childSpouse)?.gender === 'M' && members.find(m => m.id === childId)?.gender === 'F'
          ? childSpouse 
          : childId;
          
        if (childId === primaryChildId) {
          childrenTotalWidth += calculateSubTreeWidth(childId);
        }
      });

      const finalWidth = Math.max(baseWidth, childrenTotalWidth);
      subTreeWidths[personId] = finalWidth;
      if (spouseId) subTreeWidths[spouseId] = finalWidth;
      
      return finalWidth;
    };

    // Hitung seluruh lebar sub-tree dari root
    mainRoots.forEach(root => {
      const spouse = spouseMap[root.id];
      const primaryRoot = spouse && root.gender === 'F' ? spouse : root.id;
      if (root.id === primaryRoot) {
        calculateSubTreeWidth(root.id);
      }
    });

    // Fungsi rekursif untuk meletakkan node-node keluarga besar
    const positionFamily = (personId: string, leftX: number, y: number) => {
      const spouseId = spouseMap[personId];
      const person = members.find(m => m.id === personId);
      if (!person) return;

      const isCouple = !!spouseId;
      const spouse = spouseId ? members.find(m => m.id === spouseId) : null;
      const gen = person.generation;

      const totalWidth = subTreeWidths[personId] || NODE_WIDTH;
      const centerX = leftX + totalWidth / 2;

      // Pastikan tidak melanggar batas X terluar pada generasi ini untuk menghindari tumpang tindih
      const minAllowedX = nextAvailableX[gen] || 0;
      let adjustedCenterX = centerX;
      
      const familyWidth = isCouple ? SPOUSE_GAP : 0;
      const halfFamilyWidth = familyWidth / 2;

      // Jika koordinat kiri menabrak batas, geser ke kanan
      if (adjustedCenterX - halfFamilyWidth - NODE_WIDTH/2 < minAllowedX) {
        adjustedCenterX = minAllowedX + NODE_WIDTH/2 + halfFamilyWidth;
      }

      // Tentukan posisi
      if (isCouple && spouse) {
        // Husband di kiri, wife di kanan
        const isMaleA = person.gender === 'M';
        const husband = isMaleA ? person : spouse;
        const wife = isMaleA ? spouse : person;

        const husbandX = adjustedCenterX - SPOUSE_GAP / 2;
        const wifeX = adjustedCenterX + SPOUSE_GAP / 2;

        nodePositions[husband.id] = { x: husbandX, y };
        nodePositions[wife.id] = { x: wifeX, y };

        // Catat batas kanan terluar
        nextAvailableX[gen] = wifeX + NODE_WIDTH / 2 + SIBLING_GAP;
        
        // Buat Edge Pernikahan
        const marriageLineY = y + NODE_HEIGHT / 2;
        treeEdges.push({
          id: `edge-marriage-${marriageRelMap[person.id] || person.id}`,
          d: `M ${husbandX + NODE_WIDTH/2} ${marriageLineY} L ${wifeX - NODE_WIDTH/2} ${marriageLineY}`,
          type: 'marriage'
        });

        // Letakkan anak-anak
        const children = getChildrenOf(husband.id, wife.id);
        if (children.length > 0) {
          // Hitung total lebar anak-anak untuk mensimetriskan posisi mereka
          let childrenWidth = 0;
          const childLayoutIds: string[] = [];

          children.forEach(childId => {
            const childSpouse = spouseMap[childId];
            const primaryChildId = childSpouse && members.find(m => m.id === childSpouse)?.gender === 'M'
              ? childSpouse 
              : childId;
              
            if (childId === primaryChildId) {
              childrenWidth += subTreeWidths[childId] || (NODE_WIDTH + SIBLING_GAP);
              childLayoutIds.push(childId);
            }
          });

          // Mulai peletakan anak dari ujung kiri
          let childLeftX = adjustedCenterX - childrenWidth / 2;
          const childY = y + GEN_GAP;

          // Jalur induk utama ke cabang anak-anak
          const parentConnectorY = y + NODE_HEIGHT;
          const horizontalBarY = parentConnectorY + 35;

          // Gambar garis tegak dari tengah garis pernikahan turun sedikit
          treeEdges.push({
            id: `edge-parent-down-${husband.id}`,
            d: `M ${adjustedCenterX} ${marriageLineY} L ${adjustedCenterX} ${horizontalBarY}`,
            type: 'parent-child'
          });

          // Lacak batas horizontal kiri dan kanan untuk menghubungkan semua anak
          let minChildX = Infinity;
          let maxChildX = -Infinity;

          childLayoutIds.forEach((childId) => {
            const childWidth = subTreeWidths[childId] || NODE_WIDTH;
            
            // Letakkan anak (dan pasangannya secara rekursif)
            positionFamily(childId, childLeftX, childY);

            // Dapatkan koordinat anak yang terpasang
            const childSpouse = spouseMap[childId];
            let targetConnectX = nodePositions[childId].x;

            if (childSpouse) {
              // Jika anak berpasangan, hubungkan ke titik tengah pasangan tersebut
              targetConnectX = (nodePositions[childId].x + nodePositions[childSpouse].x) / 2;
            }

            minChildX = Math.min(minChildX, targetConnectX);
            maxChildX = Math.max(maxChildX, targetConnectX);

            // Garis tegak naik dari anak ke palang horizontal
            treeEdges.push({
              id: `edge-child-up-${childId}`,
              d: `M ${targetConnectX} ${childY} L ${targetConnectX} ${horizontalBarY}`,
              type: 'parent-child'
            });

            childLeftX += childWidth;
          });

          // Gambar palang horizontal penghubung jika ada lebih dari satu cabang anak
          if (minChildX !== Infinity && maxChildX !== -Infinity) {
            treeEdges.push({
              id: `edge-horizontal-bar-${husband.id}`,
              d: `M ${minChildX} ${horizontalBarY} L ${maxChildX} ${horizontalBarY}`,
              type: 'parent-child'
            });
          }
        }
      } else {
        // Anggota Lajang / Single Parent tanpa pasangan tercatat saat ini
        nodePositions[person.id] = { x: adjustedCenterX, y };
        nextAvailableX[gen] = adjustedCenterX + NODE_WIDTH / 2 + SIBLING_GAP;

        // Proses anak jika ada (kasus single parent)
        const children = getChildrenOf(person.id);
        if (children.length > 0) {
          let childrenWidth = 0;
          const childLayoutIds: string[] = [];

          children.forEach(childId => {
            const childSpouse = spouseMap[childId];
            const primaryChildId = childSpouse && members.find(m => m.id === childSpouse)?.gender === 'M'
              ? childSpouse 
              : childId;
              
            if (childId === primaryChildId) {
              childrenWidth += subTreeWidths[childId] || (NODE_WIDTH + SIBLING_GAP);
              childLayoutIds.push(childId);
            }
          });

          let childLeftX = adjustedCenterX - childrenWidth / 2;
          const childY = y + GEN_GAP;
          const parentConnectorY = y + NODE_HEIGHT;
          const horizontalBarY = parentConnectorY + 25;

          treeEdges.push({
            id: `edge-parent-down-${person.id}`,
            d: `M ${adjustedCenterX} ${parentConnectorY} L ${adjustedCenterX} ${horizontalBarY}`,
            type: 'parent-child'
          });

          let minChildX = Infinity;
          let maxChildX = -Infinity;

          childLayoutIds.forEach((childId) => {
            const childWidth = subTreeWidths[childId] || NODE_WIDTH;
            positionFamily(childId, childLeftX, childY);

            const childSpouse = spouseMap[childId];
            let targetConnectX = nodePositions[childId].x;
            if (childSpouse) {
              targetConnectX = (nodePositions[childId].x + nodePositions[childSpouse].x) / 2;
            }

            minChildX = Math.min(minChildX, targetConnectX);
            maxChildX = Math.max(maxChildX, targetConnectX);

            treeEdges.push({
              id: `edge-child-up-${childId}`,
              d: `M ${targetConnectX} ${childY} L ${targetConnectX} ${horizontalBarY}`,
              type: 'parent-child'
            });

            childLeftX += childWidth;
          });

          if (minChildX !== Infinity && maxChildX !== -Infinity) {
            treeEdges.push({
              id: `edge-horizontal-bar-${person.id}`,
              d: `M ${minChildX} ${horizontalBarY} L ${maxChildX} ${horizontalBarY}`,
              type: 'parent-child'
            });
          }
        }
      }
    };

    // Jalankan algoritma mulai dari root utama
    let rootStartX = 0;
    mainRoots.forEach(root => {
      const spouse = spouseMap[root.id];
      const primaryRootId = spouse && root.gender === 'F' ? spouse : root.id;
      
      if (root.id === primaryRootId) {
        const rootWidth = subTreeWidths[primaryRootId] || NODE_WIDTH;
        positionFamily(primaryRootId, rootStartX, 50);
        rootStartX += rootWidth + 80; // Tambahkan jarak antar pohon jika ada beberapa root
      }
    });

    return { positions: nodePositions, edges: treeEdges };
  }, [members, relationships, parentChildRelations]);

  // --- INTERAKSI MOUSE & TOUCH (PAN & ZOOM) ---
  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button !== 0) return; // Hanya klik kiri
    setIsDragging(true);
    setDragStart({ x: e.clientX - translate.x, y: e.clientY - translate.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setTranslate({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUpOrLeave = () => {
    setIsDragging(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    let nextScale = scale;
    if (e.deltaY < 0) {
      // Zoom In
      nextScale = Math.min(scale * zoomFactor, 2.0);
    } else {
      // Zoom Out
      nextScale = Math.max(scale / zoomFactor, 0.2);
    }
    
    // Zoom menuju kursor mouse
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const zoomTargetX = (mouseX - translate.x) / scale;
      const zoomTargetY = (mouseY - translate.y) / scale;

      setTranslate({
        x: mouseX - zoomTargetX * nextScale,
        y: mouseY - zoomTargetY * nextScale
      });
    }
    
    setScale(nextScale);
  };

  // Zoom Button Controls
  const handleZoomIn = () => setScale(s => Math.min(s * 1.2, 2.0));
  const handleZoomOut = () => setScale(s => Math.max(s / 1.2, 0.2));
  const handleReset = () => {
    setScale(0.85);
    setTranslate({ x: 100, y: 50 });
    setHighlightedNodeId(null);
  };

  // --- SEARCH & CENTERING NODE ---
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    // Cari anggota yang cocok dengan nama
    const found = members.find(
      m => m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           (m.nickname && m.nickname.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (found && layoutData.positions[found.id] && containerRef.current) {
      const pos = layoutData.positions[found.id];
      const rect = containerRef.current.getBoundingClientRect();
      
      // Hitung koordinat tengah kontainer
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Animasikan pergeseran agar node berada tepat di tengah dengan zoom 1.0
      setScale(1.1);
      setTranslate({
        x: centerX - (pos.x) * 1.1,
        y: centerY - (pos.y + NODE_HEIGHT / 2) * 1.1
      });

      setHighlightedNodeId(found.id);
      
      // Buka detail anggota secara otomatis
      setSelectedMemberId(found.id);
      
      // Hapus highlight setelah 4 detik
      setTimeout(() => {
        setHighlightedNodeId(null);
      }, 4000);
    }
  };

  // Filter anggota yang cocok dengan filter aktif
  const filteredMemberIds = useMemo(() => {
    return members.filter(m => {
      const matchDomicile = selectedDomicile === 'all' || m.domicile === selectedDomicile;
      const matchRantau = !highlightRantau || m.isMerantau;
      return matchDomicile && matchRantau;
    }).map(m => m.id);
  }, [members, selectedDomicile, highlightRantau]);

  // Render Legend Tingkatan Generasi
  const generationLegend = [
    { label: 'Sesepuh (Mbah)', color: 'border-amber-600 dark:border-amber-500 bg-amber-500/10' },
    { label: 'Bapak / Ibu', color: 'border-primary bg-primary-light' },
    { label: 'Cucu (Mas / Mbak)', color: 'border-secondary bg-secondary-light' },
    { label: 'Cicit (Adik)', color: 'border-accent/40 bg-accent/10' }
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Search & Filter Header Bar */}
      <div className="bg-card border border-border p-4 rounded-2xl shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center z-20">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama dulur (misal: Siti, Rudi)..."
            className="w-full pl-10 pr-4 py-2 text-xs font-semibold rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent transition-all"
          />
          <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-muted" />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Filter Kota */}
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold text-muted flex items-center gap-1"><MapPin className="h-3.5 w-3.5" /> Domisili:</span>
            <select
              value={selectedDomicile}
              onChange={(e) => setSelectedDomicile(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-border bg-background text-foreground font-semibold focus:outline-none focus:ring-1 focus:ring-primary"
            >
              {domiciles.map(city => (
                <option key={city} value={city}>
                  {city === 'all' ? 'Semua Kota' : city}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Rantau */}
          <button
            onClick={() => setHighlightRantau(!highlightRantau)}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-1.5 cursor-pointer ${
              highlightRantau 
                ? 'bg-secondary/15 text-secondary border-secondary/35' 
                : 'border-border text-muted hover:text-foreground hover:bg-background'
            }`}
          >
            <Map className="h-3.5 w-3.5" />
            <span>Tampilkan Perantau</span>
          </button>
        </div>
      </div>

      {/* Interactive Tree Canvas Container */}
      <div className="flex-1 border border-border rounded-3xl overflow-hidden bg-card/60 relative select-none shadow-inner">
        {/* Canvas Grid Background */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          className={`w-full h-full cursor-grab active:cursor-grabbing tree-grid-bg relative overflow-hidden`}
        >
          {/* SVG & NODES WRAPPER WITH TRANSFORM */}
          <div 
            style={{
              transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
              transformOrigin: '0 0',
              transition: isDragging ? 'none' : 'transform 0.15s cubic-bezier(0.25, 0.46, 0.45, 0.94)'
            }}
            className="absolute inset-0 pointer-events-none"
          >
            {/* SVG Connection Lines */}
            <svg 
              className="absolute overflow-visible pointer-events-none"
              style={{ width: '1px', height: '1px' }} // Dummy size, lines draw beyond boundaries
            >
              <defs>
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="6"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#CCCCCC" />
                </marker>
              </defs>
              
              {layoutData.edges.map((edge) => {
                const isMarriage = edge.type === 'marriage';
                return (
                  <path
                    key={edge.id}
                    d={edge.d}
                    fill="none"
                    stroke={isMarriage ? '#B85C38' : '#D1C7BD'}
                    strokeWidth={isMarriage ? 2.5 : 1.75}
                    strokeDasharray={isMarriage ? 'none' : 'none'}
                    className="transition-all duration-300"
                    style={{
                      opacity: 0.75
                    }}
                  />
                );
              })}
            </svg>

            {/* Render Nodes */}
            {members.map((member) => {
              const pos = layoutData.positions[member.id];
              if (!pos) return null;

              const isFemale = member.gender === 'F';
              const isDeceased = !!member.deathDate;
              
              // Cek filter aktif
              const isFilteredIn = filteredMemberIds.includes(member.id);
              
              // Penentuan warna node berdasarkan generasi
              let genStyles = 'border-primary bg-primary-light text-foreground';
              if (member.generation === 0) {
                genStyles = 'border-amber-600 dark:border-amber-500 bg-amber-500/10 text-foreground';
              } else if (member.generation === 2) {
                genStyles = 'border-secondary bg-secondary-light text-foreground';
              } else if (member.generation === 3) {
                genStyles = 'border-accent/40 bg-accent/10 text-foreground';
              }

              // Styling jika almarhum
              if (isDeceased) {
                genStyles = 'border-dashed border-stone-400 dark:border-stone-600 bg-stone-100 dark:bg-stone-800/60 text-stone-500 dark:text-stone-400';
              }

              // Highlight pencarian
              const isSearched = highlightedNodeId === member.id;
              
              return (
                <div
                  key={member.id}
                  onClick={() => setSelectedMemberId(member.id)}
                  style={{
                    left: pos.x - NODE_WIDTH / 2,
                    top: pos.y,
                    width: NODE_WIDTH,
                    height: NODE_HEIGHT,
                    opacity: isFilteredIn ? 1.0 : 0.25,
                    pointerEvents: 'auto'
                  }}
                  className={`absolute p-2.5 rounded-2xl border-2 shadow-sm hover:shadow-lg flex flex-col justify-between cursor-pointer transition-all duration-300 ${genStyles} ${
                    isSearched 
                      ? 'ring-4 ring-amber-400 animate-pulse scale-105 shadow-amber-200 dark:shadow-amber-950/20 z-30' 
                      : 'hover:scale-103'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold truncate leading-tight flex-1 pr-1">
                        {member.nickname || member.name}
                      </h4>
                      {/* Penanda Gender kecil */}
                      <span className={`text-[9px] font-bold h-3.5 w-3.5 rounded-full flex items-center justify-center flex-shrink-0 ${
                        isFemale 
                          ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400' 
                          : 'bg-blue-500/10 text-blue-500 dark:text-blue-400'
                      }`}>
                        {member.gender}
                      </span>
                    </div>
                    
                    <p className="text-[9px] text-muted truncate mt-0.5 max-w-full">
                      {member.name}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-1 pt-1.5 border-t border-divider/40 text-[9px]">
                    <span className="truncate font-semibold max-w-[70px] text-muted leading-none flex items-center gap-0.5">
                      📍 {member.domicile}
                    </span>
                    {member.isMerantau && !isDeceased && (
                      <span className="px-1 py-0.5 rounded bg-secondary/10 text-secondary dark:text-secondary-hover font-bold text-[8px] leading-none uppercase tracking-wide flex items-center gap-0.5">
                        Rantau
                      </span>
                    )}
                    {isDeceased && (
                      <span className="font-bold text-[8px] leading-none text-stone-400 uppercase">
                        Wafat
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Interactive Canvas Controls (Bottom Right) */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10 bg-card/90 backdrop-blur border border-border p-2 rounded-2xl shadow-lg">
          <button 
            onClick={handleZoomIn} 
            title="Perbesar" 
            className="p-2 rounded-xl hover:bg-background text-muted hover:text-foreground transition-all cursor-pointer"
          >
            <ZoomIn className="h-5 w-5" />
          </button>
          <button 
            onClick={handleZoomOut} 
            title="Perkecil" 
            className="p-2 rounded-xl hover:bg-background text-muted hover:text-foreground transition-all cursor-pointer"
          >
            <ZoomOut className="h-5 w-5" />
          </button>
          <button 
            onClick={handleReset} 
            title="Reset Tampilan" 
            className="p-2 rounded-xl hover:bg-background text-muted hover:text-foreground transition-all cursor-pointer"
          >
            <RotateCcw className="h-5 w-5" />
          </button>
        </div>

        {/* Floating Tree Legend (Bottom Left) */}
        <div className="hidden lg:flex absolute bottom-6 left-6 flex-col gap-1.5 bg-card/90 backdrop-blur border border-border p-3.5 rounded-2xl shadow-lg z-10 text-[10px]">
          <h5 className="font-bold text-foreground mb-1 flex items-center gap-1">
            <Sparkles className="h-3 w-3 text-primary" /> Legenda Silsilah
          </h5>
          {generationLegend.map((lg) => (
            <div key={lg.label} className="flex items-center gap-2">
              <span className={`h-3 w-6 rounded border ${lg.color}`}></span>
              <span className="text-muted font-semibold">{lg.label}</span>
            </div>
          ))}
          <div className="flex items-center gap-2 mt-0.5">
            <span className="h-3 w-6 rounded border border-dashed border-stone-400 bg-stone-100 dark:bg-stone-800"></span>
            <span className="text-muted font-semibold">Almarhum / Wafat</span>
          </div>
        </div>

        {/* Swipe instruction tooltip overlay */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-card/90 backdrop-blur border border-border shadow text-[10px] text-muted pointer-events-none">
          <HelpCircle className="h-3.5 w-3.5 text-primary" />
          <span>Gunakan mouse-drag untuk menggeser, scroll untuk zoom</span>
        </div>
      </div>

      {/* Slide-over Profile Drawer */}
      <MemberDetail
        memberId={selectedMemberId}
        onClose={() => setSelectedMemberId(null)}
      />
    </div>
  );
}
