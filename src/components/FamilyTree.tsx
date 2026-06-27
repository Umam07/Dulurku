'use client';

import React, { useState, useRef, useMemo } from 'react';
import { useFamily } from '@/context/FamilyContext';
import { 
  Search, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  MapPin, 
  Map, 
  HelpCircle,
  Sparkles,
  User
} from 'lucide-react';
import MemberDetail from '@/components/MemberDetail';

// Dimensi node silsilah (spacious, high-end visual grid)
const NODE_WIDTH = 210;
const NODE_HEIGHT = 104;
const SPOUSE_GAP = 260; // Jarak antar pusat pasangan
const SIBLING_GAP = 60;
const GEN_GAP = 270; // Jarak antar generasi (Y axis)

interface Position {
  x: number;
  y: number;
}

interface Edge {
  id: string;
  d: string;
  type: 'marriage' | 'parent-child';
  branch?: 'paternal' | 'maternal';
}

export default function FamilyTree() {
  const { 
    members, 
    relationships, 
    parentChildRelations
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
      let childrenTotalWidth = 0;
      children.forEach(childId => {
        childrenTotalWidth += calculateSubTreeWidth(childId);
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

    // Fungsi rekursif untuk meletakkan node-node keluarga besar dengan pelacakan cabang keluarga
    const positionFamily = (personId: string, leftX: number, y: number, branch: 'paternal' | 'maternal') => {
      if (nodePositions[personId]) return;
      const spouseId = spouseMap[personId];
      if (spouseId && nodePositions[spouseId]) return;

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
          type: 'marriage',
          branch
        });

        // Letakkan anak-anak
        const children = getChildrenOf(husband.id, wife.id);
        if (children.length > 0) {
          let childrenWidth = 0;
          const childLayoutIds: string[] = [];

          children.forEach(childId => {
            childrenWidth += subTreeWidths[childId] || (NODE_WIDTH + SIBLING_GAP);
            childLayoutIds.push(childId);
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
            type: 'parent-child',
            branch
          });

          // Lacak batas horizontal kiri dan kanan untuk menghubungkan semua anak
          let minChildX = Infinity;
          let maxChildX = -Infinity;

          childLayoutIds.forEach((childId) => {
            const childWidth = subTreeWidths[childId] || NODE_WIDTH;
            
            // Letakkan anak (dan pasangannya secara rekursif)
            positionFamily(childId, childLeftX, childY, branch);

            // Dapatkan koordinat anak yang terpasang
            let targetConnectX = nodePositions[childId]?.x;

            if (!nodePositions[childId]) {
              // Jika anak belum terposisi (karena skip/ early return), gunakan estimasi
              targetConnectX = childLeftX + childWidth / 2;
            }

            minChildX = Math.min(minChildX, targetConnectX);
            maxChildX = Math.max(maxChildX, targetConnectX);

            // Garis tegak naik dari anak ke palang horizontal
            treeEdges.push({
              id: `edge-child-up-${childId}`,
              d: `M ${targetConnectX} ${childY} L ${targetConnectX} ${horizontalBarY}`,
              type: 'parent-child',
              branch
            });

            childLeftX += childWidth;
          });

          // Gambar palang horizontal penghubung jika ada lebih dari satu cabang anak
          if (minChildX !== Infinity && maxChildX !== -Infinity) {
            treeEdges.push({
              id: `edge-horizontal-bar-${husband.id}`,
              d: `M ${minChildX} ${horizontalBarY} L ${maxChildX} ${horizontalBarY}`,
              type: 'parent-child',
              branch
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
            childrenWidth += subTreeWidths[childId] || (NODE_WIDTH + SIBLING_GAP);
            childLayoutIds.push(childId);
          });

          let childLeftX = adjustedCenterX - childrenWidth / 2;
          const childY = y + GEN_GAP;
          const parentConnectorY = y + NODE_HEIGHT;
          const horizontalBarY = parentConnectorY + 25;

          treeEdges.push({
            id: `edge-parent-down-${person.id}`,
            d: `M ${adjustedCenterX} ${parentConnectorY} L ${adjustedCenterX} ${horizontalBarY}`,
            type: 'parent-child',
            branch
          });

          let minChildX = Infinity;
          let maxChildX = -Infinity;

          childLayoutIds.forEach((childId) => {
            const childWidth = subTreeWidths[childId] || NODE_WIDTH;
            positionFamily(childId, childLeftX, childY, branch);

            let targetConnectX = nodePositions[childId]?.x;
            if (!nodePositions[childId]) {
              targetConnectX = childLeftX + childWidth / 2;
            }

            minChildX = Math.min(minChildX, targetConnectX);
            maxChildX = Math.max(maxChildX, targetConnectX);

            treeEdges.push({
              id: `edge-child-up-${childId}`,
              d: `M ${targetConnectX} ${childY} L ${targetConnectX} ${horizontalBarY}`,
              type: 'parent-child',
              branch
            });

            childLeftX += childWidth;
          });

          if (minChildX !== Infinity && maxChildX !== -Infinity) {
            treeEdges.push({
              id: `edge-horizontal-bar-${person.id}`,
              d: `M ${minChildX} ${horizontalBarY} L ${maxChildX} ${horizontalBarY}`,
              type: 'parent-child',
              branch
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
        // Tentukan cabang keturunan berdasarkan ID root (paternal vs maternal)
        const branch = root.id.includes('-m-') ? 'maternal' : 'paternal';
        positionFamily(primaryRootId, rootStartX, 50, branch);
        rootStartX += rootWidth + 80; // Jarak antar pohon keluarga utama
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

  const handleCenterOnMe = () => {
    const me = members.find(m => m.id === 'p-g2-umam');
    if (me && layoutData.positions[me.id] && containerRef.current) {
      const pos = layoutData.positions[me.id];
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      setScale(1.15);
      setTranslate({
        x: centerX - pos.x * 1.15,
        y: centerY - (pos.y + NODE_HEIGHT / 2) * 1.15
      });

      setHighlightedNodeId(me.id);
      setSelectedMemberId(me.id);
      
      setTimeout(() => {
        setHighlightedNodeId(null);
      }, 4000);
    }
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
    { label: 'Sesepuh (Mbah)', color: 'border-amber-500 bg-amber-500/10' },
    { label: 'Bapak / Ibu', color: 'border-emerald-500 bg-emerald-500/10' },
    { label: 'Cucu (Mas / Mbak)', color: 'border-indigo-500 bg-indigo-500/10' },
    { label: 'Cicit (Adik)', color: 'border-rose-400 bg-rose-500/10' }
  ];

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col space-y-4 animate-in fade-in duration-300">
      {/* Search & Filter Header Bar - Glassmorphism Dock */}
      <div className="backdrop-blur-md bg-card/85 dark:bg-zinc-900/80 border border-border/80 p-4 rounded-[24px] shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_30px_-10px_rgba(0,0,0,0.3)] flex flex-col md:flex-row gap-4 justify-between items-center z-20 transition-all duration-300">
        <form onSubmit={handleSearch} className="relative w-full md:w-80 group">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama dulur (misal: Siti, Rudi)..."
            className="w-full pl-10 pr-4 py-2.5 text-xs font-bold rounded-xl border border-border/80 bg-background/50 text-foreground placeholder:text-muted/70 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary/80 transition-all shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]"
          />
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted/65 group-focus-within:text-primary transition-colors" />
        </form>

        <div className="flex flex-wrap items-center gap-4 w-full md:w-auto justify-end">
          {/* Filter Kota */}
          <div className="flex items-center gap-2.5 text-xs">
            <span className="font-bold text-muted/95 flex items-center gap-1.5"><MapPin className="h-4 w-4 text-primary/70" /> Domisili:</span>
            <select
              value={selectedDomicile}
              onChange={(e) => setSelectedDomicile(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-border/80 bg-background/50 text-foreground font-bold text-xs focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer hover:border-primary/50 transition-colors"
            >
              {domiciles.map(city => (
                <option key={city} value={city} className="bg-card font-bold text-xs text-foreground">
                  {city === 'all' ? 'Semua Kota' : city}
                </option>
              ))}
            </select>
          </div>

          {/* Toggle Rantau */}
          <button
            onClick={() => setHighlightRantau(!highlightRantau)}
            className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all duration-300 flex items-center gap-2 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] ${
              highlightRantau 
                ? 'bg-secondary/15 text-secondary border-secondary/40 shadow-inner' 
                : 'border-border/80 text-muted hover:text-foreground hover:bg-background/80 hover:border-primary/40'
            }`}
          >
            <Map className="h-4 w-4" />
            <span>Tampilkan Perantau</span>
          </button>
        </div>
      </div>

      {/* Interactive Tree Canvas Container */}
      <div className="flex-1 border border-border/80 rounded-[32px] overflow-hidden bg-card/40 dark:bg-zinc-950/20 relative select-none shadow-[inset_0_4px_30px_rgba(0,0,0,0.02)] dark:shadow-[inset_0_4px_35px_rgba(0,0,0,0.2)]">
        {/* Canvas Grid Background */}
        <div 
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUpOrLeave}
          onMouseLeave={handleMouseUpOrLeave}
          onWheel={handleWheel}
          className={`w-full h-full cursor-grab active:cursor-grabbing tree-grid-bg relative overflow-hidden transition-colors duration-300`}
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
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#94A3B8" />
                </marker>
              </defs>
              
              {layoutData.edges.map((edge) => {
                const isMarriage = edge.type === 'marriage';
                let strokeColor = '#78716C'; // default gray
                
                if (!isMarriage) {
                  // Warna garis keturunan berdasarkan cabang keluarga (Brand colors)
                  if (edge.branch === 'paternal') {
                    strokeColor = '#B85C38'; // Terracotta (Pihak Ayah)
                  } else if (edge.branch === 'maternal') {
                    strokeColor = '#556B2F'; // Olive/Sage Green (Pihak Ibu)
                  }
                } else {
                  strokeColor = '#D97706'; // Emas/Amber untuk Pernikahan
                }

                return (
                  <path
                    key={edge.id}
                    d={edge.d}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isMarriage ? 2.5 : 2.0}
                    strokeDasharray="none"
                    className="transition-all duration-300"
                    style={{
                      opacity: isMarriage ? 1.0 : 0.8
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
              const isFilteredIn = filteredMemberIds.includes(member.id);
              const isMe = member.id === 'p-g2-umam';
              
              // Premium Gen Styles (Doppelrand / Double-Bezel outer shells - High Contrast & Bright)
              let outerStyles = 'border-emerald-400 bg-emerald-100/95 dark:border-emerald-500/50 dark:bg-emerald-950/30 shadow-[0_4px_12px_rgba(16,185,129,0.12)] dark:shadow-[0_4px_25px_-5px_rgba(16,185,129,0.25)]';
              
              if (member.generation === 0) {
                // Sesepuh
                outerStyles = 'border-amber-400 bg-amber-100/95 dark:border-amber-500/50 dark:bg-amber-950/30 shadow-[0_4px_12px_rgba(245,158,11,0.12)] dark:shadow-[0_4px_25px_-5px_rgba(245,158,11,0.25)]';
              } else if (member.generation === 2) {
                // Cucu
                outerStyles = 'border-indigo-400 bg-indigo-100/95 dark:border-indigo-500/50 dark:bg-indigo-950/30 shadow-[0_4px_12px_rgba(99,102,241,0.12)] dark:shadow-[0_4px_25px_-5px_rgba(99,102,241,0.25)]';
              } else if (member.generation === 3) {
                // Cicit
                outerStyles = 'border-rose-400 bg-rose-100/95 dark:border-rose-400/50 dark:bg-rose-950/30 shadow-[0_4px_12px_rgba(244,63,94,0.12)] dark:shadow-[0_4px_25px_-5px_rgba(244,63,94,0.25)]';
              }

              // Special highlight for Developer/User (Umam)
              if (isMe) {
                outerStyles = 'border-primary bg-primary/20 dark:border-primary dark:bg-primary/30 shadow-[0_0_20px_rgba(20,184,166,0.2)] dark:shadow-[0_0_25px_rgba(20,184,166,0.45)]';
              }

              // Styling jika almarhum
              if (isDeceased) {
                outerStyles = 'border-dashed border-stone-400 bg-stone-200/80 dark:border-stone-600 dark:bg-stone-850/40 opacity-70 shadow-none';
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
                    opacity: isFilteredIn ? 1.0 : 0.3,
                    pointerEvents: 'auto'
                  }}
                  className={`absolute p-[5px] rounded-[24px] border-2 flex flex-col cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.25,0.8,0.25,1)] group hover:-translate-y-1 hover:scale-[1.02] ${outerStyles} ${
                    isSearched 
                      ? 'ring-4 ring-amber-400 dark:ring-amber-500/50 scale-105 z-30 shadow-lg' 
                      : 'hover:shadow-[0_8px_30px_rgb(0,0,0,0.06)] dark:hover:shadow-[0_8px_30px_rgb(0,0,0,0.3)]'
                  }`}
                >
                  {/* Nested Core (Doppelrand Inner Shell - Bright Solid White background in light mode) */}
                  <div className={`w-full h-full p-2.5 rounded-[18px] bg-white dark:bg-zinc-900 shadow-[inset_0_1px_1px_rgba(255,255,255,1)] dark:shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] flex flex-col justify-between transition-colors duration-300 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/90 ${
                    isDeceased ? 'bg-stone-50/90 dark:bg-stone-950/90' : ''
                  }`}>
                    <div className="min-w-0">
                      <div className="flex justify-between items-start gap-1">
                        <h4 className="text-[12px] font-bold font-serif truncate leading-tight flex-1 text-foreground tracking-wide group-hover:text-primary transition-colors">
                          {member.nickname || member.name}
                        </h4>
                        <div className="flex items-center gap-1">
                          <span className={`text-[8px] font-extrabold h-4 w-4 rounded-full border flex items-center justify-center flex-shrink-0 ${
                            isFemale 
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/25' 
                              : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/25'
                          }`}>
                            {member.gender === 'M' ? 'L' : 'P'}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-[8.5px] text-muted truncate mt-0.5 max-w-full font-bold tracking-wider uppercase scale-95 origin-left opacity-75">
                        {member.name}
                      </p>
                    </div>

                    <div className="flex justify-between items-center mt-1.5 pt-1.5 border-t border-border/60 text-[8.5px]">
                      <span className="truncate font-bold text-muted/95 leading-none flex items-center gap-0.5">
                        <MapPin className="h-3 w-3 text-muted/60" /> {member.domicile}
                      </span>
                      <div className="flex gap-1 items-center">
                        {isMe && (
                          <span className="text-[7px] font-extrabold px-1.5 py-0.5 rounded border bg-primary/20 text-primary dark:text-primary-light border-primary/30 uppercase tracking-wider animate-pulse flex items-center gap-0.5">
                            ✨ Dev
                          </span>
                        )}
                        {member.isMerantau && !isDeceased && (
                          <span className="px-1.5 py-0.5 rounded border border-secondary/25 bg-secondary-light dark:bg-secondary/10 text-secondary dark:text-secondary-hover font-bold text-[7px] leading-none uppercase tracking-wider scale-90 origin-right">
                            Rantau
                          </span>
                        )}
                        {isDeceased && (
                          <span className="font-extrabold text-[7.5px] leading-none text-stone-400 dark:text-stone-500 uppercase tracking-wider">
                            Wafat
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Floating Interactive Canvas Controls (Bottom Right) - Polished Glassmorphism */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2.5 z-10 bg-card/85 dark:bg-zinc-900/80 backdrop-blur border border-border/80 p-2.5 rounded-[20px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)]">
          <button 
            onClick={handleCenterOnMe} 
            title="Temukan Saya (Umam)" 
            className="p-2.5 rounded-xl hover:bg-primary/10 text-primary border border-primary/25 bg-primary/5 hover:scale-[1.05] active:scale-[0.95] transition-all cursor-pointer flex items-center justify-center"
          >
            <User className="h-4.5 w-4.5" />
          </button>
          <div className="h-px bg-border/80" />
          <button 
            onClick={handleZoomIn} 
            title="Perbesar" 
            className="p-2.5 rounded-xl hover:bg-background/80 hover:text-foreground text-muted transition-all active:scale-[0.93] cursor-pointer"
          >
            <ZoomIn className="h-4.5 w-4.5" />
          </button>
          <button 
            onClick={handleZoomOut} 
            title="Perkecil" 
            className="p-2.5 rounded-xl hover:bg-background/80 hover:text-foreground text-muted transition-all active:scale-[0.93] cursor-pointer"
          >
            <ZoomOut className="h-4.5 w-4.5" />
          </button>
          <button 
            onClick={handleReset} 
            title="Reset Tampilan" 
            className="p-2.5 rounded-xl hover:bg-background/80 hover:text-foreground text-muted transition-all active:scale-[0.93] cursor-pointer"
          >
            <RotateCcw className="h-4.5 w-4.5" />
          </button>
        </div>

        {/* Floating Tree Legend (Bottom Left) - Polished Glassmorphism */}
        <div className="hidden lg:flex absolute bottom-6 left-6 flex-col gap-2 bg-card/85 dark:bg-zinc-900/80 backdrop-blur border border-border/80 p-4 rounded-[20px] shadow-[0_10px_25px_-5px_rgba(0,0,0,0.06)] dark:shadow-[0_10px_30px_rgba(0,0,0,0.35)] z-10 text-[10px] w-52">
          <h5 className="font-bold text-foreground mb-1.5 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" /> Legenda Silsilah
          </h5>
          <div className="flex flex-col gap-1.5 mb-1.5 pb-1.5 border-b border-border/60">
            <span className="font-bold text-foreground/80 text-[8.5px] uppercase tracking-wider mb-1">Tingkatan Generasi</span>
            {generationLegend.map((lg) => (
              <div key={lg.label} className="flex items-center gap-2.5">
                <span className={`h-3 w-6 rounded border ${lg.color.replace('border-2', 'border')}`}></span>
                <span className="text-muted/95 font-bold">{lg.label}</span>
              </div>
            ))}
            <div className="flex items-center gap-2.5 mt-0.5">
              <span className="h-3 w-6 rounded border border-dashed border-stone-400 bg-stone-100/50 dark:bg-stone-800/40"></span>
              <span className="text-muted/95 font-bold">Almarhum / Wafat</span>
            </div>
          </div>
          <div className="flex flex-col gap-1.5">
            <span className="font-bold text-foreground/80 text-[8.5px] uppercase tracking-wider mb-1">Garis Hubungan</span>
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-6 bg-[#B85C38] rounded-full"></span>
              <span className="text-muted/95 font-bold">Keturunan Ayah (Mbah Hardjo)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-6 bg-[#556B2F] rounded-full"></span>
              <span className="text-muted/95 font-bold">Keturunan Ibu (Mbah Sastro)</span>
            </div>
            <div className="flex items-center gap-2.5">
              <span className="h-1.5 w-6 bg-[#D97706] rounded-full"></span>
              <span className="text-muted/95 font-bold">Ikatan Pernikahan (Pasutri)</span>
            </div>
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
