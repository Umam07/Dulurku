import FamilyTree from '@/components/FamilyTree';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pohon Silsilah — Dulurku',
  description: 'Eksplorasi pohon keluarga besar secara interaktif dengan zoom, geser, pencarian nama, dan detail profil terintegrasi.',
};

export default function PohonSilsilahPage() {
  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h2 className="text-3xl font-serif font-bold text-foreground">Pohon Silsilah Keluarga</h2>
        <p className="text-muted text-sm mt-1">
          Eksplorasi hubungan keturunan keluarga besar dari kakek-nenek buyut (Generasi 0) hingga cicit-cicit terkecil (Generasi 3).
        </p>
      </div>
      
      <div className="flex-1 min-h-0">
        <FamilyTree />
      </div>
    </div>
  );
}
