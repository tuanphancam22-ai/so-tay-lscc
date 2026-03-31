import MenuButton from './MenuButton';
import { Calculator, Stethoscope } from 'lucide-react';

export default function ClinicalTools() {
  return (
    <div className="h-full w-full grid grid-cols-2 gap-3">
      <MenuButton href="/than" icon={<Calculator size={28} strokeWidth={1.5} />} title="Tính toán Lâm sàng" />
      <MenuButton href="/tools" icon={<Stethoscope size={28} strokeWidth={1.5} />} title="Công cụ Lâm sàng" />
    </div>
  );
}