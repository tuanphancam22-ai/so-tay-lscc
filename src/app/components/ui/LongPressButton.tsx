"use client";
import React, { useState, useRef } from 'react';

interface LongPressButtonProps {
  onClick: () => void;
  colorClass: string;
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
}

export default function LongPressButton({ onClick, colorClass, label, icon, disabled = false }: LongPressButtonProps) {
  const [holding, setHolding] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const startPress = () => {
    if (disabled) return;
    setHolding(true);
    timerRef.current = setTimeout(() => {
      setHolding(false);
      onClick();
      if (window.navigator.vibrate) window.navigator.vibrate(200);
    }, 2000); 
  };

  const cancelPress = () => {
    setHolding(false);
    if (timerRef.current) clearTimeout(timerRef.current);
  };

  return (
    <div 
      className={`relative w-full h-full rounded-2xl overflow-hidden flex flex-col items-center justify-center cursor-pointer ${colorClass} ${disabled ? 'opacity-50 grayscale' : 'active:brightness-110'}`}
      onPointerDown={startPress}
      onPointerUp={cancelPress}
      onPointerLeave={cancelPress}
      onPointerCancel={cancelPress} // Bắt thêm sự kiện khi ngón tay trượt ra khỏi màn hình
      onContextMenu={(e) => {
        e.preventDefault(); // Chặn menu chuột phải
        e.stopPropagation(); // Ngăn sự kiện lan ra ngoài
        return false;
      }}
      style={{ 
        WebkitTouchCallout: 'none', // ĐẶC TRỊ: Chặn menu popup (Copy/Save) trên iOS Safari
        WebkitUserSelect: 'none',   // Chặn bôi đen text trên iOS
        userSelect: 'none',         // Chặn bôi đen text chung
        touchAction: 'manipulation' // Chặn thao tác zoom đôi (double-tap to zoom) gây lag
      }}
    >
      <div className="z-10 flex flex-col items-center pointer-events-none text-white">
        {icon}
        <span className="font-bold text-lg mt-2 text-center leading-tight">{label}</span>
        <span className="text-xs opacity-80 mt-1">(Giữ 2s)</span>
      </div>
      
      {holding && (
        <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
          <svg className="w-24 h-24 transform -rotate-90">
            <circle cx="48" cy="48" r="44" stroke="rgba(255,255,255,0.3)" strokeWidth="8" fill="none" />
            <circle cx="48" cy="48" r="44" stroke="white" strokeWidth="8" fill="none" 
              strokeDasharray="276" strokeDashoffset="276"
              style={{ animation: 'fillRing 2s linear forwards' }}
            />
          </svg>
        </div>
      )}
      <style jsx>{`
        @keyframes fillRing { to { stroke-dashoffset: 0; } }
      `}</style>
    </div>
  );
}