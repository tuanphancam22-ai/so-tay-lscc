import { Zap, CheckCircle } from 'lucide-react';

interface ShockOverlayProps {
  countdown: number;
  weight: number;
  patientType: string;
  onFinishEarly: () => void;
}

export default function ShockOverlay({ countdown, weight, patientType, onFinishEarly }: ShockOverlayProps) {
  return (
    <div className="fixed inset-0 z-[9999] bg-orange-500 flex flex-col items-center justify-center animate-in fade-in zoom-in duration-300 px-4 pb-10">
      
      <div className="flex-1 flex flex-col items-center justify-center">
        <Zap size={80} className="text-white mb-4 animate-bounce" fill="currentColor" />
        <h2 className="text-5xl font-black text-white mb-6 tracking-widest text-center">SỐC ĐIỆN</h2>
        
        <div className="text-[140px] font-black text-white leading-none mb-6 drop-shadow-lg">
          {countdown}
        </div>
        
        <p className="text-xl text-white font-bold bg-black/40 px-6 py-3 rounded-xl text-center">
          Tránh xa bệnh nhân!
        </p>

        {/* CẬP NHẬT LOGIC: Chỉ hiện gợi ý liều nếu không phải người lớn VÀ cân nặng < 50kg */}
        {patientType !== 'adult' && weight < 50 && (
          <div className="mt-8 bg-black/60 p-4 rounded-xl text-center text-yellow-300 border border-yellow-500/30">
            <p className="font-bold text-lg mb-1">Gợi ý liều Trẻ em:</p>
            <p className="text-xl text-white">Lần 1: {weight * 2}J <span className="text-sm text-gray-400 font-normal">(2J/kg)</span></p>
            <p className="text-xl text-white mt-1">Lần 2: {weight * 4}J <span className="text-sm text-gray-400 font-normal">(4J/kg)</span></p>
            <p className="font-bold text-lg mb-1">(lưu ý không quá 10J/kg hoặc liều người lớn)</p>
          </div>
        )}
      </div>

      <button 
        onClick={onFinishEarly}
        className="w-full max-w-xs bg-white active:bg-gray-200 text-orange-600 font-black text-xl py-5 rounded-full shadow-2xl flex justify-center items-center transition-transform active:scale-95 border-b-4 border-gray-300"
      >
        <CheckCircle size={28} className="mr-2" />
        ĐÃ SỐC XONG
      </button>

    </div>
  );
}