"use client";
import React, { useState } from 'react';
import { Copy, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';

export default function LoggingScreen({ state }: any) {
  const [showTimeline, setShowTimeline] = useState(false);
  
  const endTime = performance.now();
  const totalDuration = Math.floor((endTime - (state.startTime || endTime)) / 1000);

  const formatTimeStr = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const summaryText = `
--- TÓM TẮT CPR ---
Đối tượng: ${state.patientType} (${state.weight}kg)
Tổng thời gian: ${formatTimeStr(totalDuration)}
Tổng sốc điện: ${state.shockCount} lần
Tổng Adrenaline: ${state.adreCount} lần (Liều: ${state.adreDose}mg/lần)
`.trim();

  const fullLogText = summaryText + '\n\n--- TIMELINE ---\n' + state.logs.map((l: any) => `[${formatTimeStr(l.time)}] ${l.event} ${l.details ? `(${l.details})` : ''}`).join('\n');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Đã copy vào bộ nhớ tạm!');
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-black text-white pb-32">
      <div className="flex items-center justify-center mb-6 mt-4 text-[#0C9943]">
        <CheckCircle2 size={64} />
      </div>
      <h2 className="text-2xl font-black text-center mb-8">KẾT THÚC CẤP CỨU</h2>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5 mb-4 shadow-lg">
        <h3 className="text-yellow-400 font-bold mb-4 uppercase tracking-wider text-sm">Tóm tắt nhanh</h3>
        <div className="space-y-3">
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400">Thời gian CPR</span>
            <span className="font-bold text-xl">{formatTimeStr(totalDuration)}</span>
          </div>
          <div className="flex justify-between border-b border-gray-800 pb-2">
            <span className="text-gray-400">Sốc điện</span>
            <span className="font-bold text-xl text-orange-400">{state.shockCount} lần</span>
          </div>
          <div className="flex justify-between pb-1">
            <span className="text-gray-400">Adrenaline ({state.adreDose}mg)</span>
            <span className="font-bold text-xl text-[#0C9943]">{state.adreCount} lần</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden mb-8">
        <button 
          onClick={() => setShowTimeline(!showTimeline)}
          className="w-full p-4 flex justify-between items-center text-gray-300 font-bold bg-gray-800/50 active:bg-gray-800"
        >
          <span>Timeline chi tiết</span>
          {showTimeline ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
        {showTimeline && (
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {state.logs.map((log: any, idx: number) => (
              <div key={idx} className="flex gap-3 text-sm">
                <span className="font-mono text-gray-500 w-12 shrink-0">{formatTimeStr(log.time)}</span>
                <div>
                  <span className="font-bold text-gray-200">{log.event}</span>
                  {log.details && <span className="text-gray-400 ml-2">({log.details})</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 fixed bottom-0 left-0 right-0 p-4 bg-black border-t border-gray-900 z-10">
        <button 
          onClick={() => copyToClipboard(summaryText)}
          className="flex items-center justify-center bg-gray-800 text-white font-bold py-4 rounded-xl active:bg-gray-700"
        >
          <Copy size={20} className="mr-2" />
          Copy Tóm tắt
        </button>
        <button 
          onClick={() => copyToClipboard(fullLogText)}
          className="flex items-center justify-center bg-blue-600 text-white font-bold py-4 rounded-xl active:bg-blue-700"
        >
          <Copy size={20} className="mr-2" />
          Copy Toàn bộ
        </button>
      </div>
    </div>
  );
}