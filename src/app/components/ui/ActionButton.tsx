"use client";
import { ReactNode } from 'react';

interface ActionButtonProps {
  onClick: () => void;
  icon: ReactNode;
  title: string;
  color?: string;
  disabled?: boolean;
}

export default function ActionButton({ onClick, icon, title, color = "text-[#0C9943]", disabled = false }: ActionButtonProps) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={`flex flex-col items-center justify-center bg-white rounded-2xl shadow-sm border border-gray-100 transition-transform h-full w-full gap-2 p-2 
        ${disabled ? 'opacity-50 grayscale cursor-not-allowed' : 'active:scale-95'}`}
    >
      <div className={`${color} mb-1`}>
        {icon}
      </div>
      <span className="text-sm font-semibold text-gray-700 text-center leading-tight px-1">
        {title}
      </span>
    </button>
  );
}