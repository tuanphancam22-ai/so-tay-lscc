"use client";
import Link from 'next/link';
import { ReactNode } from 'react';

interface MenuButtonProps {
  href: string;
  icon: ReactNode;
  title: string;
  color?: string;
}

export default function MenuButton({ href, icon, title, color = "text-[#0C9943]" }: MenuButtonProps) {
  return (
    <Link 
      href={href}
      className="flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 active:scale-95 transition-transform h-full w-full gap-2 p-2"
    >
      <div className={`${color} mb-1`}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-gray-700 text-center leading-tight px-1">
        {title}
      </span>
    </Link>
  );
}