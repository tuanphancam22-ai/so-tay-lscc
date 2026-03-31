"use client";
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ReactNode } from 'react';

// Định nghĩa các tham số (props) mà Header có thể nhận
interface HeaderProps {
  title?: string;          // Tên trang con (VD: THƯ VIỆN LÂM SÀNG)
  icon?: ReactNode;        // Icon trang con
  showBack?: boolean;      // Bật/tắt nút "<- Trang chủ"
}

export default function Header({ title, icon, showBack = false }: HeaderProps) {
  
  // TRƯỜNG HỢP 1: NẾU LÀ TRANG CON (Có bật showBack)
  if (showBack) {
    return (
      <div className="flex-none bg-[#0C9943] text-white p-4 rounded-b-2xl shadow-md z-10">
        <Link href="/" className="inline-flex items-center gap-1 text-white/90 font-medium mb-3 active:scale-95 transition-transform">
          <ArrowLeft size={18} />
          <span className="text-sm">Trang chủ</span>
        </Link>
        <h2 className="text-xl font-bold uppercase tracking-wide flex items-center gap-2">
          {icon}
          {title}
        </h2>
      </div>
    );
  }

  // TRƯỜNG HỢP 2: NẾU LÀ TRANG CHỦ (Mặc định không truyền showBack)
  return (
    <header className="bg-[#0C9943] text-white text-center py-3 px-4 shadow-md rounded-b-xl z-10 flex-none">
      <h1 className="text-lg tracking-wide font-bold m-0">KHOA CẤP CỨU - BV THIỆN HẠNH</h1>
      <p className="mt-0.5 text-xs font-light opacity-90">Sổ Tay Lâm Sàng Thông Minh ver: 0.65b</p>
    </header>
  );
}