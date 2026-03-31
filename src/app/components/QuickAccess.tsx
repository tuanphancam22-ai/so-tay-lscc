import MenuButton from './MenuButton';
import { Brain, Bubbles, Sofa, HeartPulse, Zap } from 'lucide-react';

export default function QuickAccess() {
  return (
    <div className="h-full w-full grid grid-cols-2 grid-rows-2 gap-3">
      <MenuButton href="/gcs" icon={<Brain size={36} strokeWidth={1.5} />} title="Glasgow (GCS)" color="text-blue-600" />
      <MenuButton href="/khi-mau" icon={<Bubbles size={36} strokeWidth={1.5} />} title="Khí Máu ABG" color="text-red-500" />
      <MenuButton href="/CPR" icon={<HeartPulse size={36} strokeWidth={1.5} />} title="Trợ lý CPR" color="text-orange-500" />
      <MenuButton href="/nihss" icon={<Zap size={36} strokeWidth={1.5} />} title="NIHSS Đột quỵ" color="text-yellow-500" />
    </div>
  );
}