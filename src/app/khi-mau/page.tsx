"use client";

import React, { useState } from "react";
import { Bubbles } from "lucide-react";
import Header from '../components/Header';

interface ABGResult {
  validity: { isValid: boolean; message: string; hMeasured: number; hCalc: number };
  diagnosis: string;
  details: string[];
}

export default function ABGAnalyzer() {
  // 1. Quản lý trạng thái (State)
  const [ph, setPh] = useState<string>("");
  const [pco2, setPco2] = useState<string>("");
  const [hco3, setHco3] = useState<string>("");
  const [na, setNa] = useState<string>("");
  const [cl, setCl] = useState<string>("");
  const [alb, setAlb] = useState<string>("");

  const [result, setResult] = useState<ABGResult | null>(null);

  // Hàm Reset dữ liệu (Ca mới)
  const handleReset = () => {
    setPh("");
    setPco2("");
    setHco3("");
    setNa("");
    setCl("");
    setAlb("");
    setResult(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // 2. Hàm xử lý logic cốt lõi
  const analyzeABG = () => {
    const vPh = parseFloat(ph);
    const vPco2 = parseFloat(pco2);
    const vHco3 = parseFloat(hco3);

    // Validate bắt buộc
    if (isNaN(vPh) || isNaN(vPco2) || isNaN(vHco3)) {
      alert("Vui lòng nhập đầy đủ bộ 3 chỉ số cơ bản: pH, pCO2, và HCO3-");
      return;
    }

    const detailsList: string[] = [];

    // --- BƯỚC 1: KIỂM ĐỊNH TÍNH NHẤT QUÁN ---
    const hMeasured = Math.pow(10, 9 - vPh);
    const hCalc = 24 * (vPco2 / vHco3);
    const isConsistent = Math.abs(hMeasured - hCalc) <= 5;

    // --- BƯỚC 2 & 3: XÁC ĐỊNH RỐI LOẠN NGUYÊN PHÁT (LOGIC MỚI) ---
    let primaryDisorder = "";

    if (vPh < 7.35) { 
      // A. Nhóm Toan huyết
      if (vPco2 > 45 && vHco3 < 22) primaryDisorder = "Toan hỗn hợp (Hô hấp & Chuyển hóa)";
      else if (vPco2 > 45) primaryDisorder = "Toan hô hấp";
      else if (vHco3 < 22) primaryDisorder = "Toan chuyển hóa";
      else primaryDisorder = "Toan huyết (Chưa rõ nguyên phát)"; 
    } 
    else if (vPh > 7.45) { 
      // B. Nhóm Kiềm huyết
      if (vPco2 < 35 && vHco3 > 26) primaryDisorder = "Kiềm hỗn hợp (Hô hấp & Chuyển hóa)";
      else if (vPco2 < 35) primaryDisorder = "Kiềm hô hấp";
      else if (vHco3 > 26) primaryDisorder = "Kiềm chuyển hóa";
      else primaryDisorder = "Kiềm huyết (Chưa rõ nguyên phát)";
    } 
    else { 
      // C. Nhóm pH bình thường (7.35 - 7.45)
      if (vPco2 > 45 && vHco3 > 26) {
        primaryDisorder = "Toan hô hấp mạn & Kiềm chuyển hóa kết hợp";
      } else if (vPco2 < 35 && vHco3 < 22) {
        primaryDisorder = "Kiềm hô hấp & Toan chuyển hóa kết hợp";
      } else if (vPco2 >= 35 && vPco2 <= 45 && vHco3 >= 22 && vHco3 <= 26) {
        primaryDisorder = "Bình thường";
      } else {
        // Xu hướng bù trừ khi các chỉ số lệch nhẹ nhưng chưa đến mức cực đoan > 45 hay < 22
        if (vPh <= 7.40) primaryDisorder = vPco2 > 40 ? "Toan hô hấp (Bù trừ hoàn toàn)" : "Toan chuyển hóa (Bù trừ hoàn toàn)";
        else primaryDisorder = vPco2 < 40 ? "Kiềm hô hấp (Bù trừ hoàn toàn)" : "Kiềm chuyển hóa (Bù trừ hoàn toàn)";
      }
    }

    let diagnosis = primaryDisorder.toUpperCase();

    // --- BƯỚC 4: ĐÁNH GIÁ BÙ TRỪ ---
    if (primaryDisorder.includes("Toan chuyển hóa")) {
      const pco2Exp = 1.5 * vHco3 + 8;
      detailsList.push(`Công thức Winters: pCO2 dự kiến = ${pco2Exp.toFixed(1)} ± 2`);
      if (vPco2 > pco2Exp + 2) detailsList.push("→ Kèm theo Toan hô hấp (Hỗn hợp)");
      else if (vPco2 < pco2Exp - 2) detailsList.push("→ Kèm theo Kiềm hô hấp (Hỗn hợp)");
      else detailsList.push("→ Bù trừ hô hấp phù hợp");
    } else if (primaryDisorder.includes("Kiềm chuyển hóa")) {
      const pco2Exp = 0.7 * vHco3 + 20;
      detailsList.push(`Bù trừ hô hấp: pCO2 dự kiến = ${pco2Exp.toFixed(1)} ± 5`);
      if (vPco2 > pco2Exp + 5) detailsList.push("→ Kèm theo Toan hô hấp");
      else if (vPco2 < pco2Exp - 5) detailsList.push("→ Kèm theo Kiềm hô hấp");
    } else if (primaryDisorder.includes("Toan hô hấp")) {
      const hco3Acute = 24 + (vPco2 - 40) / 10;
      const hco3Chronic = 24 + (3.5 * (vPco2 - 40)) / 10;
      detailsList.push(`Bù trừ cấp tính: HCO3- dự kiến = ${hco3Acute.toFixed(1)}`);
      detailsList.push(`Bù trừ mạn tính: HCO3- dự kiến = ${hco3Chronic.toFixed(1)}`);
    }

    // --- BƯỚC 5 & 6: ANION GAP & DELTA RATIO ---
    const vNa = parseFloat(na);
    if (!isNaN(vNa)) {
      const vCl = parseFloat(cl) || 104; 
      const vAlb = parseFloat(alb) || 40; 

      const ag = vNa - (vCl + vHco3);
      const agAdj = ag + 0.25 * (40 - vAlb);
      detailsList.push(`Anion Gap hiệu chỉnh (AG_adj) = ${agAdj.toFixed(1)} (Bình thường: 12)`);

      if (agAdj > 12 && primaryDisorder.includes("Toan chuyển hóa")) {
        diagnosis = "TOAN CHUYỂN HÓA TĂNG AG (HAGMA)";

        const deltaRatio = (agAdj - 12) / (24 - vHco3);
        let ratioMeaning = "";

        if (deltaRatio < 0.4) ratioMeaning = "HAGMA + Toan chuyển hóa không tăng AG (NAGMA)";
        else if (deltaRatio >= 0.4 && deltaRatio <= 1.0) ratioMeaning = "HAGMA (Gợi ý DKA hoặc Suy thận)";
        else if (deltaRatio > 1.0 && deltaRatio <= 2.0) ratioMeaning = "HAGMA đơn thuần (Gợi ý Lactic Acidosis)";
        else if (deltaRatio > 2.0) ratioMeaning = "HAGMA + Kiềm chuyển hóa (hoặc Toan hô hấp mạn)";

        detailsList.push(`Delta Ratio (Δ/Δ) = ${deltaRatio.toFixed(2)}`);
        detailsList.push(`Biện luận Δ/Δ: ${ratioMeaning}`);
      }
    } else {
      detailsList.push("Bỏ qua tính Anion Gap do không có chỉ số Na+");
    }

    setResult({
      validity: {
        isValid: isConsistent,
        hMeasured: parseFloat(hMeasured.toFixed(1)),
        hCalc: parseFloat(hCalc.toFixed(1)),
        message: isConsistent ? "Kết quả đồng nhất (Hợp lệ)" : "Cảnh báo: Kết quả không đồng nhất (Sai số ΔH+ > 5)",
      },
      diagnosis,
      details: detailsList,
    });

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
    }, 100);
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-gray-800 max-w-md mx-auto relative overflow-hidden">
      {/* ĐỒNG BỘ HEADER MỚI */}
      <Header 
        showBack={true} 
        title="Phân tích kiềm toan" 
        icon={<Bubbles size={24} />} 
      />

      {/* Form Nhập Liệu */}
      <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
        <div className="grid grid-cols-2 gap-5 mb-6">
          
          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">pH:</label>
            <input type="number" inputMode="decimal" placeholder="7.40" value={ph} onChange={(e) => setPh(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">pCO2 (mmHg):</label>
            <input type="number" inputMode="decimal" placeholder="40" value={pco2} onChange={(e) => setPco2(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">HCO3- (mmol/L):</label>
            <input type="number" inputMode="decimal" placeholder="24" value={hco3} onChange={(e) => setHco3(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Na+ (Natri):</label>
            <input type="number" inputMode="decimal" placeholder="140" value={na} onChange={(e) => setNa(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Cl- (Clo):</label>
            <input type="number" inputMode="decimal" placeholder="104" value={cl} onChange={(e) => setCl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
          </div>

          <div className="col-span-1">
            <label className="block text-sm font-bold text-gray-700 mb-1.5">Albumin (g/L):</label>
            <input type="number" inputMode="decimal" placeholder="40" value={alb} onChange={(e) => setAlb(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-xl text-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all" />
          </div>
          
        </div>

        {/* Các nút hành động */}
        <div className="grid grid-cols-3 gap-3">
          <button 
            onClick={handleReset}
            className="col-span-1 bg-white border-2 border-green-600 text-green-700 font-bold text-[15px] p-3 rounded-xl hover:bg-green-50 active:scale-95 transition-transform">
            Ca mới
          </button>
          <button 
            onClick={analyzeABG}
            className="col-span-2 bg-green-600 text-white font-bold text-[16px] p-3 rounded-xl shadow-md hover:bg-green-700 active:scale-95 transition-transform">
            PHÂN TÍCH NGAY
          </button>
        </div>
      </div>

      {/* Khu vực Hiển thị Kết quả */}
      {result && (
        <div className="mt-6 animate-fade-in-up">
          
          {/* Cảnh báo tính đồng nhất */}
          <div className={`p-4 rounded-xl mb-4 border-l-4 ${result.validity.isValid ? 'bg-green-50 border-green-500 text-green-800' : 'bg-yellow-100 border-yellow-500 text-yellow-800'}`}>
            <p className="font-bold text-sm">Kiểm định: {result.validity.message}</p>
            <p className="text-xs mt-1 opacity-80">[H+] đo: {result.validity.hMeasured} | [H+] tính: {result.validity.hCalc}</p>
          </div>

          {/* Chẩn đoán chính */}
          <h2 className={`text-[22px] font-black mb-4 uppercase leading-snug ${result.diagnosis === 'BÌNH THƯỜNG' ? 'text-green-600' : 'text-red-600'}`}>
            {result.diagnosis}
          </h2>

          {/* Hộp Chi tiết */}
          <div className="bg-white border border-gray-200 p-5 rounded-2xl shadow-sm space-y-3 text-gray-800 text-[15px] leading-relaxed">
            {result.details.map((detail, index) => {
              const isHighlight = detail.startsWith('→') || detail.startsWith('Biện luận');
              return (
                <div key={index} className={`flex items-start ${isHighlight ? 'text-green-700 font-semibold ml-2' : ''}`}>
                  {!isHighlight && <span className="mr-2 text-green-500 font-bold">•</span>}
                  <span>{detail}</span>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}