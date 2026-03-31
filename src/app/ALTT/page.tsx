"use client";

import React, { useState, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { Calculator, RefreshCcw, AlertCircle, Droplets } from 'lucide-react';

export default function SerumOsmolarityPage() {
  // 1. Quản lý State
  const [na, setNa] = useState<string>('');
  const [glucose, setGlucose] = useState<string>('');
  const [unit, setUnit] = useState<'mmol' | 'mgdl'>('mmol');

  // 2. Logic tính toán (Tính cả ALTT và Natri hiệu chỉnh)
  const result = useMemo(() => {
    const vNa = parseFloat(na);
    const vGluRaw = parseFloat(glucose);

    if (isNaN(vNa) || isNaN(vGluRaw)) return null;

    // Quy đổi Glucose ra cả 2 hệ đơn vị để tiện tính toán
    const vGlu_mmol = unit === 'mmol' ? vGluRaw : vGluRaw / 18;
    const vGlu_mgdl = unit === 'mgdl' ? vGluRaw : vGluRaw * 18;

    // --- TÍNH ÁP LỰC THẨM THẤU ---
    const osm = (2 * vNa) + vGlu_mmol;
    
    // Phân loại ALTT
    let status = "";
    let colorClass = "";
    
    if (osm < 280) {
      status = "HẠ ÁP LỰC THẨM THẤU (NHƯỢC TRƯƠNG)";
      colorClass = "bg-blue-500";
    } else if (osm >= 280 && osm <= 295) {
      status = "ÁP LỰC THẨM THẤU BÌNH THƯỜNG";
      colorClass = "bg-[#0C9943]";
    } else if (osm > 295 && osm < 320) {
      status = "TĂNG ÁP LỰC THẨM THẤU. Lưu ý: chưa phải Hội chứng tăng áp lực thẩm thấu do tăng đường huyết (HHS)";
      colorClass = "bg-orange-500";
    } else {
      status = "TĂNG ALTT NGHIÊM TRỌNG (HHS)";
      colorClass = "bg-red-600";
    }

    // --- TÍNH NATRI HIỆU CHỈNH (Công thức Katz) ---
    // Chỉ hiệu chỉnh khi đường huyết > 100 mg/dL (~ 5.6 mmol/L)
    let correctedNa = vNa;
    let isNaCorrected = false;
    
    if (vGlu_mgdl > 100) {
      correctedNa = vNa + 0.016 * (vGlu_mgdl - 100);
      isNaCorrected = true;
    }

    return { 
      osmValue: osm.toFixed(1), 
      status, 
      colorClass,
      correctedNa: correctedNa.toFixed(1),
      isNaCorrected
    };
  }, [na, glucose, unit]);

  const handleReset = () => {
    setNa('');
    setGlucose('');
    setUnit('mmol');
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans overflow-hidden max-w-md mx-auto relative">
      <Header 
        showBack={true} 
        title="ALTT & Na+ Hiệu Chỉnh" 
        icon={<Calculator size={24} />} 
      />

      <main className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Hướng dẫn nhanh */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded-r-xl flex gap-2 items-start shadow-sm">
          <AlertCircle size={18} className="text-blue-600 shrink-0 mt-0.5" />
          <p className="text-[12px] text-blue-900 leading-tight">
            <strong>ALTT = 2xNa + Glucose</strong>. <br/>
            Tự động hiệu chỉnh <strong>Natri (Katz)</strong> khi đường huyết tăng cao nhằm tránh chẩn đoán nhầm hạ Natri máu.
          </p>
        </div>

        {/* Form nhập liệu */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5">
          <div>
            <label className="block text-sm font-bold text-gray-600 mb-2 uppercase tracking-wide">Natri máu đo được</label>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={na}
                onChange={(e) => setNa(e.target.value)}
                placeholder="VD: 128"
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-xl font-bold focus:border-[#0C9943] focus:ring-0 outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">mmol/L</span>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-gray-600 uppercase tracking-wide">Glucose máu</label>
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                  onClick={() => setUnit('mmol')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${unit === 'mmol' ? 'bg-white text-[#0C9943] shadow-sm' : 'text-gray-400'}`}
                >mMOL/L</button>
                <button 
                  onClick={() => setUnit('mgdl')}
                  className={`px-3 py-1 text-[10px] font-bold rounded-md transition-all ${unit === 'mgdl' ? 'bg-white text-[#0C9943] shadow-sm' : 'text-gray-400'}`}
                >mG/dL</button>
              </div>
            </div>
            <div className="relative">
              <input
                type="number"
                inputMode="decimal"
                value={glucose}
                onChange={(e) => setGlucose(e.target.value)}
                placeholder={unit === 'mmol' ? "VD: 35.5" : "VD: 640"}
                className="w-full p-4 bg-slate-50 border-2 border-slate-200 rounded-xl text-xl font-bold focus:border-[#0C9943] focus:ring-0 outline-none transition-all"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">{unit === 'mmol' ? 'mmol/L' : 'mg/dL'}</span>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full flex items-center justify-center gap-2 py-3 text-gray-500 font-bold text-sm hover:bg-slate-50 rounded-xl transition-colors active:scale-95"
          >
            <RefreshCcw size={16} /> CA MỚI
          </button>
        </div>

        {/* Hiển thị kết quả */}
        {result && (
          <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-300">
            {/* Card Áp lực thẩm thấu */}
            <div className={`p-5 rounded-2xl text-white shadow-lg ${result.colorClass}`}>
              <div className="text-center">
                <p className="text-sm font-bold opacity-90 uppercase tracking-widest mb-1">Áp lực thẩm thấu</p>
                <div className="text-5xl font-black mb-1">
                  {result.osmValue}
                  <span className="text-lg ml-2 opacity-80 font-bold">mOsm/kg</span>
                </div>
                <div className="h-px bg-white/20 my-3"></div>
                <p className="text-[15px] font-black uppercase leading-tight">
                  {result.status}
                </p>
              </div>
            </div>

            {/* Card Natri hiệu chỉnh */}
            <div className="bg-white border-2 border-indigo-100 p-4 rounded-2xl shadow-sm flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-indigo-50 p-3 rounded-full text-indigo-500">
                  <Droplets size={24} />
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Natri Hiệu Chỉnh</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    {result.isNaCorrected ? "Đã bù trừ do tăng Glucose" : "Glucose bình thường, không cần bù"}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-2xl font-black ${result.isNaCorrected ? 'text-indigo-600' : 'text-gray-700'}`}>
                  {result.correctedNa}
                </span>
                <span className="text-xs font-bold text-gray-400 ml-1">mmol/L</span>
              </div>
            </div>
          </div>
        )}
      </main>

      <div className="flex-none pb-4 pt-2 bg-slate-50">
        <Footer />
      </div>
    </div>
  );
}