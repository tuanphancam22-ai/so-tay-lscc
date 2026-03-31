"use client";

import React, { useState, useEffect, useRef } from "react";
import Header from '../components/Header';
import ImageViewer from "../components/ImageViewer";
import { Zap, RotateCcw, ClipboardCheck } from "lucide-react";

// 1. Định nghĩa kiểu dữ liệu cho câu hỏi từ Google Sheet
interface NIHSSQuestion {
  stt: string;
  eval: string;
  ques: string;
  note: string;
  un: string;
  s0: string;
  s1: string;
  s2: string;
  s3: string;
  s4: string;
}

const SHEET_ID = '1REXuH0gV0GvQG96elQ0NWODek31vLaQCNO8gnBtSdKE';
const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=NIHSS`;

export default function NIHSSPage() {
  // === STATE MANAGEMENT ===
  const [data, setData] = useState<NIHSSQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, number | 'UN'>>({});
  const [seconds, setSeconds] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [imgViewer, setImgViewer] = useState({ isOpen: false, src: '' });
  
  const sliderRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasTimerStarted = useRef(false);

  // === DATA FETCHING ===
  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(URL);
        const text = await res.text();
        const rows = text.split('\n').slice(1);
        const parsedData: NIHSSQuestion[] = rows.map(r => {
          const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
          return { 
            stt: c[0], eval: c[1], ques: c[2], note: c[3], un: c[4], 
            s0: c[5], s1: c[6], s2: c[7], s3: c[8], s4: c[9] 
          };
        });
        setData(parsedData);
      } catch (e) {
        console.error("Lỗi tải dữ liệu NIHSS:", e);
      }
    };
    fetchData();
  }, []);

  // === TIMER LOGIC ===
  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        setSeconds((prev) => prev + 1);
      }, 1000);
    } else if (timerRef.current) {
      clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isRunning]);

  const toggleTimer = () => {
    setIsRunning(!isRunning);
    hasTimerStarted.current = true;
  };

  const formatTime = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const getTimerStyles = () => {
    if (seconds >= 600) return "bg-red-500 border-red-500 text-white";
    if (seconds >= 300) return "bg-orange-500 border-orange-500 text-white";
    return "bg-blue-50 text-blue-600 border-blue-600";
  };

  // === NAVIGATION LOGIC ===
  const nextCard = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: sliderRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const prevCard = () => {
    if (sliderRef.current) {
      sliderRef.current.scrollBy({ left: -sliderRef.current.clientWidth, behavior: 'smooth' });
    }
  };

  const handleChoose = (index: number, value: number | 'UN') => {
    setAnswers(prev => ({ ...prev, [index]: value }));
    if (index < data.length - 1) {
      setTimeout(nextCard, 300);
    } else {
      setTimeout(nextCard, 300); // Chuyển sang thẻ kết quả
    }
  };

  const handleReset = () => {
    if (confirm("Bạn có chắc muốn làm lại từ đầu?")) {
      setAnswers({});
      setSeconds(0);
      setIsRunning(false);
      hasTimerStarted.current = false;
      sliderRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
    }
  };

  const calculateResult = () => {
    let total = 0;
    let unList: string[] = [];

    data.forEach((q, i) => {
      const val = answers[i];
      if (val === 'UN') unList.push(q.stt);
      else if (typeof val === 'number') total += val;
    });

    let advice = "";
    let colorHex = "#0C9943";

    if (total <= 3) advice = "Theo dõi, thảo luận thêm với chuyên gia.";
    else if (total <= 5) { advice = "Tiêu sợi huyết."; colorHex = "#2563eb"; }
    else if (total <= 24) { advice = "Tiêu sợi huyết và xem xét chụp mạch não."; colorHex = "#f97316"; }
    else { advice = "Rất nặng, nguy cơ xuất huyết cao khi dùng TSH."; colorHex = "#dc2626"; }

    return { total, unList, advice, colorHex };
  };

  return (
    <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-gray-800 max-w-md mx-auto relative overflow-hidden">
      {/* ĐỒNG BỘ HEADER MỚI */}
      <Header 
        showBack={true} 
        title="Thang điểm GCS" 
        icon={<Zap size={24} />} />
        
        <div className="flex justify-center my-2">
          <button onClick={toggleTimer} className={`px-8 py-2 text-2xl font-extrabold rounded-full border-2 transition-all shadow-sm ${getTimerStyles()}`}>
            ⏱ {formatTime(seconds)}
          </button>
        </div>

        <div className="h-1.5 bg-gray-200 w-full rounded-full overflow-hidden">
          <div className="h-full bg-[#0C9943] transition-all" style={{ width: `${data.length ? (Object.keys(answers).length / data.length) * 100 : 0}%` }}>
        </div>
      </div>

      {/* SLIDER CONTENT */}
      <div 
        ref={sliderRef} 
        onScroll={(e) => {
          const idx = Math.round((e.currentTarget.scrollLeft / e.currentTarget.clientWidth));
          if (idx >= 1 && !hasTimerStarted.current) { setIsRunning(true); hasTimerStarted.current = true; }
        }}
        className="flex grow overflow-x-auto snap-x snap-mandatory hide-scrollbar py-2"
      >
        {/* === THẺ HƯỚNG DẪN BẮT ĐẦU (INTRO CARD) === */}
        <div className="shrink-0 w-full snap-center p-4 box-border flex flex-col">
          <div className="bg-white rounded-2xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.08)] grow overflow-y-auto border-t-8 border-[#0C9943] flex flex-col">
            <h1 className="text-2xl font-black text-gray-900 mb-4 text-center">ĐÁNH GIÁ NIHSS</h1>
            <div className="bg-green-50 rounded-xl p-5 mb-6 border border-green-100 overflow-y-auto">
              <ul className="list-disc pl-5 space-y-3 text-[16px] text-gray-800 font-medium leading-relaxed marker:text-[#0C9943]">
                <li>Thực hiện đánh giá điểm từng mục theo đúng thứ tự đã liệt kê. </li>
                <li>Ghi điểm từng mục ngay lúc khám xong mỗi phần. </li>
                <li>Không quay trở lại thay đổi điểm số.</li>
                <li>Làm theo hướng dẫn & cho điểm theo những gì BN làm được, chứ không phải những gì người khám <strong>NGHĨ</strong> rằng BN có thể làm.</li>
                <li>Phải ghi điểm trong lúc khám và làm nhanh.</li>
                <li>Không nên khuyến khích, lặp lại yêu cầu làm cho BN cố gắng đặc biệt, trừ trường hợp được chỉ định.</li>
                <li>Nếu bất kỳ mục nào bị bỏ trống không đánh giá được, phải ghi giải thích rõ ràng trong bản ghi điểm. Tất cả những phần bỏ trống này phải được chuyên gia xem xét thảo luận với người khám.</li>
              </ul>
            </div>
            
            <div className="mt-auto">
              <button 
                onClick={nextCard}
                className="w-full py-4 bg-gradient-to-r from-[#0C9943] to-green-600 text-white font-extrabold text-[18px] rounded-xl shadow-md active:scale-95 transition-transform flex items-center justify-center animate-pulse"
              >
                Quẹt sang để bắt đầu <span className="ml-2 text-2xl">➔</span>    
              </button>
            </div>
          </div>
        </div>

        {/* QUESTION CARDS */}
        {data.map((q, i) => (
          <div key={i} className="shrink-0 w-full snap-center p-4 box-border">
            <div className="bg-white rounded-2xl p-5 shadow-sm h-full overflow-y-auto">
              <div className="text-lg font-black text-gray-900">{q.stt}. {q.eval}</div>
              {q.ques && !q.ques.includes('.') && <div className="text-blue-800 bg-blue-50 p-3 rounded-lg my-3 font-medium">💬 {q.ques}</div>}
              
              {q.ques.match(/\.(jpg|png)/) && (
                <button onClick={() => setImgViewer({ isOpen: true, src: q.ques })} className="w-full p-3 bg-blue-600 text-white rounded-xl my-2 font-bold">🖼 XEM HÌNH MINH HỌA</button>
              )}

              <div className="flex flex-col gap-2 mt-4">
                {q.un && (
                  <button onClick={() => handleChoose(i, 'UN')} className={`p-4 text-left border-2 border-dashed rounded-xl ${answers[i] === 'UN' ? 'bg-red-50 border-red-500 font-bold' : 'border-gray-200'}`}>
                    UN - {q.un}
                  </button>
                )}
                {[q.s0, q.s1, q.s2, q.s3, q.s4].map((txt, sIdx) => {
                  if (!txt || txt.length < 2) return null;
                  return (
                    <button key={sIdx} onClick={() => handleChoose(i, sIdx)} className={`p-4 text-left border rounded-xl transition-all ${answers[i] === sIdx ? 'bg-green-50 border-[#0C9943] font-bold ring-2 ring-[#0C9943]' : 'border-gray-100'}`}>
                      {sIdx} - {txt}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {/* RESULT CARD */}
        {data.length > 0 && (
          <div className="shrink-0 w-full snap-center p-4 box-border">
            <div className="bg-white rounded-2xl p-6 shadow-lg h-full flex flex-col items-center justify-center text-center" style={{ borderTop: `8px solid ${calculateResult().colorHex}` }}>
              <div className="text-6xl font-black mb-2" style={{ color: calculateResult().colorHex }}>
                {calculateResult().total}{calculateResult().unList.length > 0 ? '*' : ''}
              </div>
              <div className="font-bold text-gray-500 uppercase tracking-widest mb-4">Tổng điểm NIHSS</div>
              <div className="text-lg font-bold px-4 leading-tight mb-8" style={{ color: calculateResult().colorHex }}>{calculateResult().advice}</div>
              
              <button onClick={() => {
                const res = calculateResult();
                navigator.clipboard.writeText(`NIHSS: ${res.total}đ. Kết luận: ${res.advice}`);
                alert("Đã copy kết quả!");
              }} className="w-full py-4 bg-gray-800 text-white font-bold rounded-xl flex justify-center items-center gap-2">
                <ClipboardCheck size={20} /> COPY KẾT QUẢ
              </button>
              
              <button onClick={handleReset} className="mt-6 text-gray-400 flex items-center gap-1 text-sm">
                <RotateCcw size={14} /> Làm lại từ đầu
              </button>
            </div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div className="bg-white border-t p-4 flex justify-between items-center z-10">
        <button onClick={prevCard} className="px-6 py-2 bg-gray-100 rounded-lg font-bold text-gray-600">❮ TRƯỚC</button>
        <span className="text-xs font-bold text-gray-400 uppercase">{Object.keys(answers).length} / {data.length} CÂU</span>
        <button onClick={nextCard} className="px-6 py-2 bg-[#0C9943] rounded-lg font-bold text-white">TIẾP ❯</button>
      </div>

      {imgViewer.isOpen && <ImageViewer imagesStr={imgViewer.src} onClose={() => setImgViewer({ isOpen: false, src: '' })} />}
    </div>
  );
}