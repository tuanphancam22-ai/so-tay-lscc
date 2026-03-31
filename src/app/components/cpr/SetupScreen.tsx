"use client";
import React, { useEffect } from 'react';
import { Play, Plus, Minus } from 'lucide-react';

export default function SetupScreen({ state, dispatch, onStart }: any) {
  const update = (payload: any) => dispatch({ type: 'UPDATE_SETUP', payload });

  // Tự động tính liều Adrenaline khi đổi cân nặng hoặc đối tượng
  useEffect(() => {
    if (state.patientType === 'adult' || (state.patientType === 'child' && state.weight >= 55)) {
      update({ adreDose: 1 });
    } else {
      let dose = state.weight * 0.01;
      dose = Math.round(dose * 100) / 100; // Giữ 2 chữ số thập phân (vd: 0.25)
      if (dose <= 0) dose = 0.1; 
      update({ adreDose: dose });
    }
  }, [state.weight, state.patientType]);

  // Quy đổi liều lượng chuẩn xác
  const getAdreFractionStr = (dose: number) => {
    if (dose === 1) return '1 ống (1ml)';
    if (Math.abs(dose - 0.1) < 0.01) return '0.1ml = 1/10 ống';
    if (Math.abs(dose - 0.2) < 0.01) return '0.2ml = 1/5 ống';
    if (Math.abs(dose - 0.25) < 0.01) return '0.25ml = 1/4 ống';
    if (Math.abs(dose - 0.3) < 0.01) return '0.3ml';
    if (Math.abs(dose - 0.4) < 0.01) return '0.4ml = 2/5 ống';
    if (Math.abs(dose - 0.5) < 0.01) return '0.5ml = 1/2 ống';
    return `${dose}ml`;
  };

  // Logic tỉ lệ
  const getRatioText = () => {
    if (state.patientType === 'adult') return '30:2';
    if (state.patientType === 'infant') return '3:1';
    return state.weight < 55 ? '15:1' : '30:2';
  };

  return (
    // Dùng flex-col và h-full để không sinh ra thanh cuộn
    <div className="flex-1 flex flex-col p-4 overflow-hidden">
      
      {/* KHU VỰC NỘI DUNG (Dàn đều) */}
      <div className="flex-1 flex flex-col justify-evenly space-y-2">
        
        {/* 1. Chọn đối tượng */}
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl">
          <h2 className="text-gray-400 font-semibold mb-3 text-sm uppercase tracking-wider">Thông số bệnh nhân</h2>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'infant', label: 'Sơ sinh', sub: '<1t' },
              { id: 'child', label: 'Trẻ em', sub: '1-15t' },
              { id: 'adult', label: 'Người lớn', sub: '>15t' }
            ].map(pt => (
              <button
                key={pt.id}
                onClick={() => update({ patientType: pt.id })}
                className={`p-3 rounded-xl flex flex-col items-center justify-center border-2 transition-all ${
                  state.patientType === pt.id ? 'border-[#0C9943] bg-[#0C9943]/10 text-[#0C9943]' : 'border-gray-700 text-gray-400'
                }`}
              >
                <span className="font-bold">{pt.label}</span>
                <span className="text-xs opacity-70">{pt.sub}</span>
              </button>
            ))}
          </div>

          {/* Ẩn Cân nặng nếu là Người lớn */}
          {state.patientType !== 'adult' && (
            <div className="mt-5 flex flex-col items-center animate-in fade-in slide-in-from-top-4 duration-300">
              <label className="text-gray-400 mb-2">Cân nặng (kg)</label>
              <div className="flex items-center w-full justify-between bg-black p-2 rounded-xl border border-gray-800">
                <button 
                  className="p-3 bg-gray-800 rounded-lg active:bg-gray-700 w-14 flex justify-center"
                  onClick={() => update({ weight: Math.max(1, state.weight - 1) })}
                ><Minus size={24} /></button>
                <span className="text-4xl font-bold text-white w-20 text-center">{state.weight}</span>
                <button 
                  className="p-3 bg-gray-800 rounded-lg active:bg-gray-700 w-14 flex justify-center"
                  onClick={() => {
                    const max = state.patientType === 'infant' ? 20 : 150;
                    update({ weight: Math.min(max, state.weight + 1) });
                  }}
                ><Plus size={24} /></button>
              </div>
              <input 
                type="range" min="1" max={state.patientType === 'infant' ? 20 : 100} 
                value={state.weight} onChange={(e) => update({ weight: parseInt(e.target.value) })}
                className="w-full mt-4 accent-yellow-400 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          )}
        </div>

        {/* 2. Cấu hình CPR */}
        <div className="bg-gray-900 border border-gray-800 p-4 rounded-2xl space-y-3">
          <h2 className="text-gray-400 font-semibold text-sm uppercase tracking-wider mb-2">Tùy chọn CPR</h2>
          
          <div className="flex justify-between items-center bg-black p-3 rounded-xl border border-gray-800">
            <div>
              <div className="font-bold text-white">Tốc độ ép tim</div>
              <div className="text-xs text-gray-500">(Mặc định: 120 l/p)</div>
            </div>
            <div className="flex gap-1">
              {[100, 110, 120].map(r => (
                <button key={r} onClick={() => update({ rate: r })}
                  className={`px-3 py-2 rounded-lg font-bold text-sm ${state.rate === r ? 'bg-[#0C9943] text-white' : 'bg-gray-800 text-gray-400'}`}
                >{r}</button>
              ))}
            </div>
          </div>

          <div className="flex justify-between items-center bg-black p-3 rounded-xl border border-gray-800">
            <div className="font-bold text-white mb-2">Tỉ lệ Ép : Thở</div>
            <div className="text-yellow-300 font-mono text-xl text-center bg-gray-900 px-4 py-1 rounded-lg border border-gray-700">
              {getRatioText()}
            </div>
          </div>

          <div className="flex justify-between items-center bg-black p-3 rounded-xl border border-gray-800">
            <div className="font-bold text-white">Đã đặt Nội khí quản?</div>
            <button 
              onClick={() => dispatch({ type: 'TOGGLE_NKQ' })}
              className={`w-14 h-8 flex items-center rounded-full p-1 transition-colors ${state.hasNKQ ? 'bg-[#0C9943]' : 'bg-gray-600'}`}
            >
              <div className={`bg-white w-6 h-6 rounded-full shadow-md transform transition-transform ${state.hasNKQ ? 'translate-x-6' : ''}`} />
            </button>
          </div>

          <div className="bg-black p-3 rounded-xl border border-gray-800">
            <div className="flex justify-between items-center mb-1">
              <div className="font-bold text-white">Liều Adrenaline</div>
              <div className="text-red-400 font-bold">{state.adreDose} mg</div>
            </div>
            <div className="text-sm text-gray-400">Quy đổi: <span className="text-white font-bold">{getAdreFractionStr(state.adreDose)}</span> / lần</div>
          </div>
        </div>
      </div>

      {/* NÚT BẮT ĐẦU (Luôn nằm đáy, không đè nội dung) */}
      <div className="mt-2 flex-none">
        <button 
          onClick={onStart}
          className="w-full bg-red-600 active:bg-red-700 text-white font-black text-2xl py-6 rounded-2xl shadow-[0_0_30px_rgba(220,38,38,0.4)] flex justify-center items-center h-20 transition-transform active:scale-95"
        >
          <Play size={32} className="mr-2" fill="currentColor" />
          BẮT ĐẦU CPR
        </button>
      </div>

    </div>
  );
}