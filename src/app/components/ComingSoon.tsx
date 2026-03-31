"use client";

import Link from 'next/link';
import { Settings } from 'lucide-react'; // Dùng icon Bánh răng quen thuộc
import Header from './Header';

interface ComingSoonProps {
  title?: string;
}

export default function ComingSoon({ title = "Tính năng đang phát triển" }: ComingSoonProps) {
  
  // Logic xử lý text thông minh hơn để không bị lủng củng
  const isGeneric = title === "Tính năng đang phát triển";
  const message = isGeneric 
    ? "Đường dẫn không tồn tại hoặc tính năng này hiện đang được xây dựng. Bác sĩ vui lòng quay lại sau nhé!"
    : `Công cụ "${title}" đang trong quá trình lập trình và chờ thẩm định dữ liệu y khoa. Bác sĩ vui lòng quay lại sau nhé!`;

  return (
    <>
      <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-gray-800 max-w-md mx-auto relative overflow-hidden">
        
        {/* Header có nút Back */}
        <Header showBack={true} title={title} />

        {/* Nội dung chính */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in-95 duration-300">
          
          {/* Icon Bánh răng xoay chậm - Chuẩn UI "Đang bảo trì/Phát triển" */}
          <div className="bg-slate-200 p-6 rounded-full mb-6 border-4 border-slate-100 shadow-inner">
            <Settings size={60} className="text-slate-600 animate-[spin_4s_linear_infinite]" strokeWidth={1.5} />
          </div>
          
          <h2 className="text-2xl font-black text-slate-800 mb-3 tracking-wide">
            ĐANG HOÀN THIỆN
          </h2>
          
          <p className="text-slate-500 text-[15px] mb-8 leading-relaxed px-4">
            {message}
          </p>

          <Link 
            href="/" 
            className="bg-[#0C9943] text-white font-bold py-3.5 px-8 rounded-xl active:scale-95 transition-transform shadow-md w-full max-w-[200px]"
          >
            VỀ TRANG CHỦ
          </Link>
          
        </div>
      </div>
    </>
  );
}