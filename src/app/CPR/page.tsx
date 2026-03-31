"use client";

import Header from '../components/Header';       // Đảm bảo đường dẫn đúng
import { HeartPulse } from 'lucide-react';
import CPRAssistant from '../components/cpr/CPRAssistant';

export default function CPRPage() {
  return (
    <div className="h-[100dvh] bg-black text-white font-sans flex flex-col max-w-md mx-auto relative overflow-hidden">
      {/* === PHẦN HEADER CỐ ĐỊNH === */}
      <Header 
        showBack={true} 
        title="Trợ lý CPR" 
        icon={<HeartPulse size={24} />} 
      />
      
      {/* === NỘI DUNG CHÍNH === */}
      <main className="flex-1 flex flex-col h-full relative">
        <CPRAssistant />
      </main>
    </div>
  );
}