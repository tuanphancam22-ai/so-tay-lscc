"use client";
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { HeartPulse, Syringe, Zap, Wind, Square } from 'lucide-react';
import LongPressButton from '../ui/LongPressButton';
import ShockOverlay from './ShockOverlay';

export default function OperationScreen({ state, dispatch, onStop, playBeep }: any) {
  const timeDisplayRef = useRef<HTMLDivElement>(null);
  const ventDisplayRef = useRef<HTMLDivElement>(null);
  const adreTimerRef = useRef<HTMLDivElement>(null);
  const adreBtnRef = useRef<HTMLDivElement>(null);
  const flashCircleRef = useRef<HTMLDivElement>(null);

  const [isShocking, setIsShocking] = useState(false);
  const [shockCountdown, setShockCountdown] = useState(10);
  
  // === LOGIC SỐC ĐIỆN ĐƯỢC VIẾT LẠI ===
  
  // 1. Quản lý đếm ngược bằng useEffect để tránh lỗi React State Update
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isShocking && shockCountdown > 0) {
      // Mỗi giây trừ đi 1
      timer = setInterval(() => {
        setShockCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isShocking && shockCountdown <= 0) {
      // Khi đếm về 0 -> Tự động kết thúc
      handleCompleteShock('Đủ 10s');
    }

    return () => clearInterval(timer);
  }, [isShocking, shockCountdown]);

  // 2. Hàm xử lý chung khi kết thúc sốc điện (Dù là tự động hay bấm nút)
  const handleCompleteShock = (reason: string) => {
    setIsShocking(false);
    dispatch({ type: 'GIVE_SHOCK' });
    dispatch({ type: 'LOG_EVENT', payload: { event: 'Sốc điện', details: `(${reason})` }});
  };

  // 3. Hàm khi bắt đầu nhấn giữ nút Sốc
  const handleShockInit = () => {
    setShockCountdown(10); // Reset đồng hồ
    setIsShocking(true);   // Bật Overlay
  };
  
  // Xử lý Tỉ lệ Ép/Thở (VD: 30:2)
  const ratioText = state.patientType === 'adult' ? '30:2' : (state.patientType === 'infant' ? '3:1' : (state.weight < 55 ? '15:1' : '30:2'));
  const ratioCompress = parseInt(ratioText.split(':')[0]);
  const ratioVent = parseInt(ratioText.split(':')[1]);
  
  const beatDurationMs = 60000 / state.rate;
  
  const reqRef = useRef<number>(0);
  const lastBeatTimeRef = useRef<number>(0);
  
  // Dùng chung count cho cả ép và bóp (giúp xử lý bóp 2 nhịp)
  const cycleStateRef = useRef({ phase: 'COMPRESS', count: 0 }); 

  const formatTimeStr = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const loop = useCallback((now: number) => {
    if (isShocking) {
      reqRef.current = requestAnimationFrame(loop);
      return; 
    }

    const elapsedTotal = now - state.startTime;
    if (timeDisplayRef.current) timeDisplayRef.current.innerText = formatTimeStr(Math.floor(elapsedTotal / 1000));

    // Logic Adrenaline
    const adreElapsed = now - state.lastAdreTime;
    const adreRemain = Math.max(0, 180000 - adreElapsed);
    if (adreTimerRef.current && adreBtnRef.current) {
      adreTimerRef.current.innerText = formatTimeStr(Math.floor(adreRemain / 1000));
      if (adreRemain <= 0) {
        adreBtnRef.current.className = "flex flex-col items-center justify-center w-full h-full bg-red-600 text-white animate-pulse";
        if (adreRemain > -50 && adreRemain <= 0) playBeep('adre'); 
      } else if (adreRemain <= 15000) {
        adreBtnRef.current.className = "flex flex-col items-center justify-center w-full h-full bg-yellow-500 text-black";
      } else {
        adreBtnRef.current.className = "flex flex-col items-center justify-center w-full h-full bg-[#0C9943] text-white";
      }
    }

    // Logic Metronome
    if (state.hasNKQ) {
      // Có NKQ: Ép liên tục, Bóp bóng đếm lùi
      if (now - lastBeatTimeRef.current >= beatDurationMs) {
        playBeep('compress'); triggerFlash();
        lastBeatTimeRef.current = now;
      }
      const ventRemain = 6 - ((elapsedTotal / 1000) % 6);
      if (ventDisplayRef.current) ventDisplayRef.current.innerText = `Bóp sau: ${ventRemain.toFixed(1)}s`;
      if (ventRemain < 0.1 && ventRemain > 0) playBeep('vent');
    } else {
      // Không NKQ: Chu kỳ Ép - Dừng bóp
      const timeSinceLastAction = now - lastBeatTimeRef.current;
      
      if (cycleStateRef.current.phase === 'COMPRESS') {
        if (ventDisplayRef.current) ventDisplayRef.current.innerText = `Ép: ${cycleStateRef.current.count}/${ratioCompress}`;
        if (timeSinceLastAction >= beatDurationMs) {
          playBeep('compress'); triggerFlash();
          cycleStateRef.current.count++;
          lastBeatTimeRef.current = now;
          
          if (cycleStateRef.current.count >= ratioCompress) {
            cycleStateRef.current.phase = 'VENT';
            cycleStateRef.current.count = 0; 
            playBeep('vent'); // Tiếng bóp bóng nhịp 1
          }
        }
      } else if (cycleStateRef.current.phase === 'VENT') {
        if (ventDisplayRef.current) ventDisplayRef.current.innerText = `BÓP BÓNG (${cycleStateRef.current.count + 1}/${ratioVent})`;
        
        // Mỗi nhịp bóp bóng cách nhau 2 giây (2000ms)
        if (timeSinceLastAction >= 2000) {
          cycleStateRef.current.count++;
          lastBeatTimeRef.current = now; 

          if (cycleStateRef.current.count >= ratioVent) {
            // Đã bóp đủ số nhịp (1 hoặc 2) -> Quay lại ép
            cycleStateRef.current.phase = 'COMPRESS';
            cycleStateRef.current.count = 0;
          } else {
            // Chưa đủ -> Bíp nhịp tiếp theo
            playBeep('vent');
          }
        }
      }
    }
    reqRef.current = requestAnimationFrame(loop);
  }, [state.startTime, state.lastAdreTime, state.hasNKQ, beatDurationMs, ratioCompress, ratioVent, isShocking, playBeep]);

  useEffect(() => {
    reqRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(reqRef.current!);
  }, [loop]);

  const triggerFlash = () => {
    if (flashCircleRef.current) {
      flashCircleRef.current.style.transform = 'scale(1.1)';
      flashCircleRef.current.style.backgroundColor = 'rgba(234, 179, 8, 0.4)';
      setTimeout(() => {
        if (flashCircleRef.current) {
          flashCircleRef.current.style.transform = 'scale(1)';
          flashCircleRef.current.style.backgroundColor = 'transparent';
        }
      }, 100);
    }
  };

  const handleGiveAdre = () => {
    dispatch({ type: 'GIVE_ADRE' });
    dispatch({ type: 'LOG_EVENT', payload: { event: 'Tiêm Adrenaline', details: `${state.adreDose}mg` }});
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-black relative overflow-hidden">
      
      {/* 1. HEADER TRẠNG THÁI (15%) */}
      <div className="h-[15%] grid grid-cols-2 gap-2 p-2">
        <div className="bg-gray-900 rounded-2xl flex flex-col items-center justify-center border border-gray-800">
          <span className="text-gray-400 text-xs font-bold mb-1">TỔNG THỜI GIAN</span>
          <div ref={timeDisplayRef} className="text-3xl font-mono text-white tracking-widest">00:00</div>
        </div>
        <div className="bg-gray-900 rounded-2xl flex flex-col items-center justify-center border border-gray-800">
          <span className="text-blue-400 text-xs font-bold uppercase mb-1">{state.hasNKQ ? 'Bóp bóng (6s)' : 'Nhịp hô hấp'}</span>
          <div ref={ventDisplayRef} className="text-xl font-bold text-white">--</div>
        </div>
      </div>

      {/* 2. METRONOME (35%) */}
      <div className="h-[35%] flex items-center justify-center relative border-y border-gray-900">
        <div className="absolute inset-0 flex items-center justify-center opacity-10">
          <HeartPulse size={180} />
        </div>
        <div ref={flashCircleRef} className="w-56 h-56 rounded-full border-8 border-yellow-500 flex flex-col items-center justify-center transition-all duration-75 shadow-[0_0_50px_rgba(234,179,8,0.2)] z-10 bg-black">
          <span className="text-gray-300 text-lg font-bold mb-[-10px]">TỐC ĐỘ</span>
          <span className="text-[90px] font-black text-yellow-400 leading-none">{state.rate}</span>
        </div>
      </div>

      {/* 3. GRID NÚT BẤM (40%) */}
      <div className="h-[40%] grid grid-cols-2 grid-rows-2 gap-3 p-3">
        <button onClick={handleGiveAdre} className="rounded-2xl overflow-hidden active:scale-95 transition-transform">
          <div ref={adreBtnRef} className="flex flex-col items-center justify-center w-full h-full bg-[#0C9943] text-white">
            <Syringe size={32} />
            <span className="font-bold text-lg mt-1 leading-tight">TIÊM ADRE</span>
            <div className="font-mono text-2xl font-black mt-1" ref={adreTimerRef}>03:00</div>
            <span className="text-[10px] bg-black/30 px-2 py-1 rounded mt-1">{state.adreDose}mg</span>
          </div>
        </button>

        <LongPressButton 
          onClick={handleShockInit} 
          colorClass="bg-orange-500" label="SỐC ĐIỆN" icon={<Zap size={32} />} 
        />
        <LongPressButton 
          onClick={() => dispatch({ type: 'TOGGLE_NKQ' })} 
          colorClass={state.hasNKQ ? "bg-blue-600" : "bg-gray-700"} 
          label={state.hasNKQ ? "ĐÃ CÓ NKQ" : "ĐẶT NKQ"} icon={<Wind size={32} />} 
        />
        <LongPressButton 
          onClick={onStop} 
          colorClass="bg-red-900 border-2 border-red-500" label="DỪNG CPR" icon={<Square size={32} fill="currentColor" />} 
        />
      </div>

      {/* 4. LIVE SUMMARY (10%) - Nằm cố định sát đáy */}
      <div className="h-[10%] flex items-center justify-around bg-gray-900 border-t border-gray-800 rounded-t-3xl px-4 flex-none">
        <div className="text-gray-400 font-bold flex items-center gap-2 text-sm uppercase">
          <Zap size={18} className="text-orange-400" /> Sốc điện: <span className="text-white text-xl">{state.shockCount}</span>
        </div>
        <div className="w-px h-6 bg-gray-700"></div>
        <div className="text-gray-400 font-bold flex items-center gap-2 text-sm uppercase">
          <Syringe size={18} className="text-[#0C9943]" /> Adrenaline: <span className="text-white text-xl">{state.adreCount}</span>
        </div>
      </div>

      {/* OVERLAY SỐC ĐIỆN */}
      {isShocking && (
        <ShockOverlay 
          countdown={shockCountdown} 
          weight={state.weight} 
          patientType={state.patientType}
          onFinishEarly={() => handleCompleteShock('Tắt sớm')} 
        />
      )}
    </div>
  );
}