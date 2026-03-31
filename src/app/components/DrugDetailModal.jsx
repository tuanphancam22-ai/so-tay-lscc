"use client";
import { useState } from "react";

export default function DrugDetailModal({ drug, onClose }) {
  // Quản lý state riêng cho máy tính truyền dịch bên trong Modal này
  const [calcInput, setCalcInput] = useState({
    w: 50, dose: "", unit: "ugkgmin", mgPerAmp: 1, ampCount: 5, vol: 500, df: 20
  });
  const [calcResult, setCalcResult] = useState(null);

  if (!drug) return null;

  const handleCalculate = () => {
    const { w, dose, unit, mgPerAmp, ampCount, vol, df } = calcInput;
    const weight = parseFloat(w) || 0;
    const doseTarget = parseFloat(dose) || 0;
    const volume = parseFloat(vol) || 0;
    const totalMg = (parseFloat(mgPerAmp) || 0) * (parseFloat(ampCount) || 0);
    const dropFactor = parseFloat(df) || 20;

    if (volume === 0 || totalMg === 0) {
      alert("Vui lòng nhập đầy đủ thông tin nồng độ!");
      return;
    }

    const conc_ug_ml = (totalMg * 1000) / volume;
    let mlh = 0;

    if (unit === "ugkgmin") mlh = (doseTarget * weight * 60) / conc_ug_ml;
    else if (unit === "ugmin") mlh = (doseTarget * 60) / conc_ug_ml;
    else if (unit === "mgh") mlh = doseTarget / (totalMg / volume);

    const gtt = (mlh * dropFactor) / 60;
    setCalcResult({ mlh: mlh.toFixed(1), gtt: Math.round(gtt) });
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex justify-center items-center backdrop-blur-sm">
      <div className="w-[95%] h-[92%] max-w-lg bg-white rounded-2xl flex flex-col overflow-hidden shadow-2xl">
        
        {/* Header Modal */}
        <div className="p-4 bg-gray-50 flex justify-between items-center border-b border-gray-200 sticky top-0 z-10">
          <span className="font-bold text-[#0C9943] text-base capitalize">{drug.hc || "Thông tin thuốc"}</span>
          <button
            onClick={onClose}
            className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold text-sm active:scale-95 transition-transform"
          >
            ĐÓNG
          </button>
        </div>

        {/* Body Modal */}
        <div className="p-4 overflow-y-auto flex-grow">
          <div className="space-y-3">
            <DetailField icon="🏥" label="Hệ BHYT" value={drug.bhyt} />
            <DetailField icon="💸" label="Hệ Viện phí" value={drug.vp} />
            <DetailField icon="✅" label="Chỉ định" value={drug.cd} />
            <DetailField icon="❌" label="Chống chỉ định" value={drug.ccd} />
            <DetailField icon="⚖️" label="Liều dùng tham khảo" value={drug.lieu} />
            <DetailField icon="🏷️" label="Nhóm thuốc" value={drug.nhom} />
          </div>

          {/* Cụm Máy Tính */}
          <div className="bg-[#eef9f1] p-4 rounded-xl mt-6 border-2 border-dashed border-[#0C9943]">
            <h3 className="text-center text-[#0C9943] font-bold text-sm mb-4 m-0">🧮 MÁY TÍNH TỐC ĐỘ TRUYỀN</h3>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <InputGroup label="Cân nặng (kg)" type="number" value={calcInput.w} onChange={(e) => setCalcInput({...calcInput, w: e.target.value})} />
              <InputGroup label="Liều đích" type="number" step="0.01" placeholder="0.1" value={calcInput.dose} onChange={(e) => setCalcInput({...calcInput, dose: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div>
                <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">Đơn vị liều</label>
                <select 
                  className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#0C9943]"
                  value={calcInput.unit} onChange={(e) => setCalcInput({...calcInput, unit: e.target.value})}
                >
                  <option value="ugkgmin">µg/kg/phút</option>
                  <option value="ugmin">µg/phút</option>
                  <option value="mgh">mg/giờ</option>
                </select>
              </div>
              <InputGroup label="Hàm lượng/ống (mg)" type="number" value={calcInput.mgPerAmp} onChange={(e) => setCalcInput({...calcInput, mgPerAmp: e.target.value})} />
            </div>

            <div className="grid grid-cols-2 gap-3 mb-3">
              <InputGroup label="Số ống pha" type="number" value={calcInput.ampCount} onChange={(e) => setCalcInput({...calcInput, ampCount: e.target.value})} />
              <InputGroup label="Tổng dịch pha (ml)" type="number" value={calcInput.vol} onChange={(e) => setCalcInput({...calcInput, vol: e.target.value})} />
            </div>

            <div className="mb-4">
              <InputGroup label="Bộ dây (giọt/ml) - Mặc định 20" type="number" value={calcInput.df} onChange={(e) => setCalcInput({...calcInput, df: e.target.value})} />
            </div>

            <button 
              onClick={handleCalculate}
              className="w-full p-3.5 bg-[#0C9943] text-white rounded-xl font-bold text-base active:scale-95 transition-transform"
            >
              TÍNH TỐC ĐỘ
            </button>

            {calcResult && (
              <div className="bg-[#0C9943] text-white p-4 rounded-xl mt-4 text-center shadow-inner">
                <div className="text-2xl font-bold">{calcResult.mlh} ml/giờ</div>
                <div className="text-base mt-1 opacity-90">≈ {calcResult.gtt} giọt/phút</div>
              </div>
            )}
            
            <p className="text-[10px] text-gray-500 mt-4 text-center">Lưu ý: Luôn kiểm tra lại nồng độ thực tế trước khi truyền.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Micro-components dùng nội bộ trong file này
const DetailField = ({ icon, label, value }) => (
  <div>
    <span className="font-bold text-[#0C9943] text-sm block mt-2">{icon} {label}:</span>
    <div className="text-[15px] mt-1 p-2 bg-gray-50 rounded-lg text-gray-800 min-h-[36px] whitespace-pre-wrap">
      {value || "---"}
    </div>
  </div>
);

const InputGroup = ({ label, ...props }) => (
  <div>
    <label className="text-[11px] font-bold text-gray-500 uppercase block mb-1">{label}</label>
    <input className="w-full p-2.5 border border-gray-300 rounded-lg text-sm bg-white outline-none focus:border-[#0C9943]" {...props} />
  </div>
);