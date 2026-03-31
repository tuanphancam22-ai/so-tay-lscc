// File: AuthGuard.tsx
"use client";
import { useState, useEffect, ReactNode } from 'react';

interface AuthGuardProps {
  children: ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passCode, setPassCode] = useState('');
  const [isChecking, setIsChecking] = useState(true);
  const [isLoading, setIsLoading] = useState(false); // Trạng thái khi đang đợi API

  useEffect(() => {
    if (localStorage.getItem("app_unlocked") === "true") {
      setIsUnlocked(true);
    }
    setIsChecking(false);
  }, []);

  const checkPass = async () => {
    if (!passCode) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: passCode }),
      });

      if (response.ok) {
        localStorage.setItem("app_unlocked", "true");
        setIsUnlocked(true);
      } else {
        alert("Mã định danh không chính xác!");
      }
    } catch (error) {
      alert("Lỗi kết nối máy chủ!");
    } finally {
      setIsLoading(false);
    }
  };

  if (isChecking) return <div className="min-h-screen bg-white"></div>;
  if (isUnlocked) return <>{children}</>;

  return (
    <div className="fixed inset-0 bg-white z-[10000] flex flex-col items-center justify-center p-5 text-center font-sans">
      <div className="text-6xl mb-3">🔐</div>
      <h2 className="text-gray-800 text-2xl font-bold my-2">XÁC THỰC NHÂN VIÊN</h2>
      <p className="text-gray-500 text-sm mb-6">Vui lòng nhập mã định danh để vào hệ thống</p>
      
      <input
        type="password"
        value={passCode}
        onChange={(e) => setPassCode(e.target.value)}
        disabled={isLoading}
        className="w-56 p-4 border-2 border-gray-300 rounded-xl text-center text-2xl outline-none mb-6 focus:border-[#0C9943] transition-colors"
        placeholder="****"
      />
      
      <button
        onClick={checkPass}
        disabled={isLoading}
        className="bg-[#0C9943] text-white border-none py-3 px-10 rounded-xl font-bold cursor-pointer text-base active:scale-95 transition-transform disabled:bg-gray-400"
      >
        {isLoading ? "ĐANG KIỂM TRA..." : "XÁC NHẬN"}
      </button>
    </div>
  );
}