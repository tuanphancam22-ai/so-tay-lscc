import MenuButton from './MenuButton';
import { BookOpen, Pill } from 'lucide-react';

export default function Library() {
  return (
    <div className="h-full w-full grid grid-cols-2 gap-3">
      <MenuButton href="/thu-vien" icon={<BookOpen size={28} strokeWidth={1.5} />} title="Thư viện" />
      <MenuButton href="/tra-cuu-thuoc" icon={<Pill size={28} strokeWidth={1.5} />} title="Tra cứu Thuốc" color="text-purple-600" />
    </div>
  );
}