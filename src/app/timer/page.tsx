"use client";

import React, { useState, useRef, useEffect } from "react";
import { Timer, Play, Pause, RotateCcw, Baby, Calculator } from "lucide-react";

import Header from "../components/Header";
import AuthGuard from "../components/AuthGuard";

export default function TimerPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [time, setTime] = useState(0);
  const [countedValue, setCountedValue] = useState<string>("");
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);

  // Kích hoạt rung (haptic feedback)
  const triggerVibrate = (pattern: number | number[]) => {
    if (typeof navigator !== "undefined" && "vibrate" in navigator) {
      navigator.vibrate(pattern);
    }
  };

  const toggleTimer = () => {
    if (isRunning) {
      // DỪNG LẠI
      if (timerRef.current) clearInterval(timerRef.current);
      setIsRunning(false);
      triggerVibrate(50); // Rung nhẹ khi dừng
    } else {
      // BẮT ĐẦU
      triggerVibrate(50); // Rung nhẹ khi bắt đầu
      startTimeRef.current = Date.now() - time;
      
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        
        // Tự động dừng khi đạt đúng 60 giây (60000 ms)
        if (elapsed >= 60000) {
          if (timerRef.current) clearInterval(timerRef.current);
          setTime(60000);
          setIsRunning(false);
          triggerVibrate([200, 100, 200]); // Rung mạnh báo hiệu hết 1 phút
        } else {
          setTime(elapsed);
        }
      }, 10);
      setIsRunning(true);
    }
  };

  const resetTimer = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (timerRef.current) clearInterval(timerRef.current);
    setIsRunning(false);
    setTime(0);
    setCountedValue(""); // Xóa số đếm khi reset
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Format hiển thị: MM:SS.ms
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const milliseconds = Math.floor((ms % 1000) / 10).toString().padStart(2, '0');
    return { minutes, seconds, milliseconds };
  };

  const { minutes, seconds, milliseconds } = formatTime(time);
  const timeInSeconds = time / 1000;

  // Logic tự động tính nhịp/phút
  const calculatedRate = countedValue && timeInSeconds > 0 
    ? Math.round((parseInt(countedValue) / timeInSeconds) * 60) 
    : 0;

  return (
    <>
      <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-gray-800 max-w-md mx-auto relative overflow-hidden">
        
        <Header showBack={true} title="Đếm Nhịp" icon={<Timer size={24} />} />

        {/* 1. MÀN HÌNH HIỂN THỊ THỜI GIAN */}
        <div className="flex-none pt-8 pb-4 flex flex-col items-center justify-center bg-white shadow-sm rounded-b-3xl z-10 border-b border-gray-100 transition-all">
          <div className={`text-[80px] font-black tracking-tighter leading-none flex items-baseline font-mono drop-shadow-sm transition-colors ${time >= 60000 ? 'text-red-600' : 'text-slate-800'}`}>
            <span>{minutes}</span>
            <span className="opacity-50 mx-1">:</span>
            <span>{seconds}</span>
            <span className="text-[40px] text-slate-400 ml-1">.{milliseconds}</span>
          </div>
        </div>

        {/* 2. KHU VỰC THÔNG TIN (Cuộn được nếu màn hình nhỏ) */}
        <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-4">
          
          {/* MÁY TÍNH TỰ ĐỘNG (Chỉ hiện khi đang dừng và đã có thời gian) */}
          {!isRunning && time > 0 && (
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl animate-in fade-in slide-in-from-top-2 duration-300 shadow-sm">
              <div className="flex items-center gap-2 text-blue-800 font-bold mb-3 text-sm uppercase tracking-wider">
                <Calculator size={18} /> Tính nhanh (Nội suy 60s)
              </div>
              <div className="flex gap-3">
                <input 
                  type="number" 
                  inputMode="numeric"
                  placeholder="Nhập số nhịp..."
                  value={countedValue}
                  onChange={(e) => setCountedValue(e.target.value)}
                  className="w-full bg-white border border-blue-200 p-3 rounded-xl text-center text-lg font-bold outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                />
                <div className="w-full bg-blue-600 text-white rounded-xl flex flex-col items-center justify-center p-2 shadow-inner">
                  <span className="text-[10px] font-bold opacity-80">KẾT QUẢ</span>
                  <span className="text-2xl font-black">{calculatedRate > 0 ? calculatedRate : "--"}</span>
                </div>
              </div>
              <p className="text-[11px] text-blue-600/70 text-center mt-3 italic font-medium">
                *Đếm {timeInSeconds.toFixed(1)}s nội suy ra 1 phút
              </p>
            </div>
          )}

          {/* BẢNG NGƯỠNG THỞ NHANH TRẺ EM */}
          <div className="bg-white border border-rose-100 rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-rose-50 text-rose-700 font-bold p-3 text-sm flex items-center gap-2 border-b border-rose-100">
              <Baby size={18} /> Ngưỡng Thở Nhanh Trẻ Em
            </div>
            <div className="p-4">
              <ul className="space-y-3 text-[14px] text-slate-700">
                <li className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="font-medium text-slate-600">Dưới 2 tháng tuổi:</span> 
                  <span className="font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded">≥ 60 l/p</span>
                </li>
                <li className="flex justify-between items-center border-b border-slate-50 pb-2">
                  <span className="font-medium text-slate-600">2 - 12 tháng tuổi:</span> 
                  <span className="font-black text-orange-600 bg-orange-50 px-2 py-0.5 rounded">≥ 50 l/p</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="font-medium text-slate-600">1 - 5 tuổi:</span> 
                  <span className="font-black text-amber-600 bg-amber-50 px-2 py-0.5 rounded">≥ 40 l/p</span>
                </li>
              </ul>
              <div className="mt-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <p className="text-[11px] text-slate-500 leading-relaxed text-justify font-medium">
                  <strong className="text-slate-700">Lưu ý lâm sàng:</strong> Để có kết quả chính xác nhất (đặc biệt ở trẻ sơ sinh có nhịp thở không đều), khuyến cáo đếm trọn vẹn trong 1 phút thay vì nội suy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. KHU VỰC ĐIỀU KHIỂN (Cố định dưới đáy) */}
        <div className="flex-none p-5 pt-2 flex flex-col gap-3 pb-6 bg-slate-50">
          <button
            onClick={toggleTimer}
            className={`w-full h-24 rounded-3xl flex flex-col items-center justify-center transition-all active:scale-[0.98] shadow-lg border-b-8 ${
              isRunning 
                ? "bg-red-500 hover:bg-red-600 border-red-700 text-white" 
                : "bg-[#0C9943] hover:bg-green-600 border-green-800 text-white"
            }`}
          >
            {isRunning ? (
              <div className="flex items-center gap-3">
                <Pause size={40} fill="currentColor" className="animate-pulse" />
                <span className="text-3xl font-black tracking-widest">DỪNG</span>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Play size={40} fill="currentColor" />
                <span className="text-3xl font-black tracking-widest">BẮT ĐẦU</span>
              </div>
            )}
          </button>

          <button
            onClick={resetTimer}
            disabled={time === 0}
            className={`h-14 w-full rounded-2xl flex items-center justify-center gap-2 font-bold text-base transition-all ${
              time === 0 
                ? "bg-slate-200 text-slate-400 cursor-not-allowed border-b-4 border-slate-300" 
                : "bg-slate-800 text-white active:scale-95 shadow-md border-b-4 border-slate-900"
            }`}
          >
            <RotateCcw size={18} /> LÀM MỚI (RESET)
          </button>
        </div>
        
      </div>
    </>
  );
}