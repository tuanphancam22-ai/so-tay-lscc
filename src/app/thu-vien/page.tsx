'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import PdfViewer from '../../app/components/PdfViewer';
import AuthGuard from '../../app/components/AuthGuard';
import Header from '../../app/components/Header';
import { ArrowLeft, Search, BookOpen, Stethoscope, AlertTriangle, FileText } from 'lucide-react';

// Khai báo kiểu dữ liệu cho tài liệu
interface DocumentItem {
  name: string;
  link: string;
}

export default function LibraryPage() {
  // Trạng thái lưu trữ dữ liệu của cả 2 tab
  const [data, setData] = useState<{ phacDo: DocumentItem[]; tiepCan: DocumentItem[] }>({
    phacDo: [],
    tiepCan: []
  });
  
  const [activeTab, setActiveTab] = useState<'phacDo' | 'tiepCan'>('phacDo');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedPdf, setSelectedPdf] = useState<DocumentItem | null>(null);

  // Gọi dữ liệu từ cả 2 Sheet cùng một lúc để tiết kiệm thời gian chờ
  useEffect(() => {
    const SHEET_ID = '1REXuH0gV0GvQG96elQ0NWODek31vLaQCNO8gnBtSdKE';
    
    const fetchSheet = async (sheetName: string) => {
      const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${sheetName}`;
      const res = await fetch(URL);
      const text = await res.text();
      const rows = text.split('\n').slice(1);
      
      return rows.map(r => {
        const cols = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
        return {
          name: cols[0]?.replace(/"/g, '').trim() || '',
          link: cols[1]?.replace(/"/g, '').trim() || ''
        };
      }).filter(p => p.name && p.link);
    };

    const loadAllData = async () => {
      try {
        // Tải song song 2 sheet để tăng tốc độ
        const [phacDoData, tiepCanData] = await Promise.all([
          fetchSheet('PhacDo'),
          fetchSheet('Tiep-can')
        ]);
        
        setData({ phacDo: phacDoData, tiepCan: tiepCanData });
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải dữ liệu thư viện:", error);
        setLoading(false);
      }
    };

    loadAllData();
  }, []);

  // Tự động lọc danh sách dựa trên Tab đang chọn và Từ khóa tìm kiếm
  const filteredList = useMemo(() => {
    const currentList = activeTab === 'phacDo' ? data.phacDo : data.tiepCan;
    if (!searchQuery) return currentList;
    return currentList.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [data, activeTab, searchQuery]);

  return (
    <>
      {/* Container chính: Chiều cao fix cứng màn hình (h-screen) để tạo app-like layout */}
      <div className="h-screen bg-slate-50 flex flex-col font-sans overflow-hidden">
        
        {/* === PHẦN HEADER CỐ ĐỊNH === */}
        <Header showBack={true} title="Thư Viện Lâm Sàng" icon={<BookOpen size={24} />} />

        {/* Disclaimer nhỏ gọn, không chiếm diện tích */}
        <div className="flex-none bg-amber-50 border-b border-amber-200 p-2.5 px-4 shadow-sm">
          <div className="flex gap-2 items-start">
            <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div className="text-[11px] leading-tight text-amber-900 text-justify">
              <strong className="text-amber-700">Lưu ý:</strong> Tài liệu này chỉ mang tính chất tham khảo nội bộ. Bác sĩ lâm sàng cần dựa trên tình trạng cụ thể của bệnh nhân và các phác đồ cập nhật nhất để đưa ra quyết định điều trị. Chúng tôi miễn trừ mọi trách nhiệm pháp lý phát sinh từ việc áp dụng thông tin này.
            </div>
          </div>
        </div>

        {/* === PHẦN ĐIỀU KHIỂN (TABS & SEARCH) === */}
        <div className="flex-none px-4 pt-4 pb-2 bg-slate-50 z-10 shadow-sm">
          {/* Tabs */}
          <div className="flex bg-slate-200 p-1 rounded-xl mb-4">
            <button
              onClick={() => setActiveTab('phacDo')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'phacDo' ? 'bg-white text-[#0C9943] shadow-sm' : 'text-slate-500'
              }`}
            >
              <FileText size={18} />
              Phác đồ
            </button>
            <button
              onClick={() => setActiveTab('tiepCan')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg flex items-center justify-center gap-2 transition-all ${
                activeTab === 'tiepCan' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Stethoscope size={18} />
              Tiếp cận
            </button>
          </div>

          {/* Thanh tìm kiếm */}
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search size={18} className="text-slate-400" />
            </div>
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Tìm ${activeTab === 'phacDo' ? 'phác đồ' : 'hướng dẫn'}...`} 
              className="w-full pl-10 p-3 rounded-xl border border-slate-200 focus:border-[#0C9943] focus:ring-1 focus:ring-[#0C9943] outline-none shadow-sm transition-all text-sm"
            />
          </div>
        </div>

        {/* === KHU VỰC DANH SÁCH CÓ THỂ CUỘN (SCROLLABLE AREA) === */}
        <div className="flex-1 overflow-y-auto p-4 pt-2 space-y-2.5 pb-24">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-32 text-slate-400 gap-2">
              <div className="w-6 h-6 border-2 border-[#0C9943] border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm">Đang tải thư viện...</span>
            </div>
          ) : filteredList.length > 0 ? (
            filteredList.map((p, index) => (
              <div 
                key={index}
                onClick={() => setSelectedPdf(p)}
                className={`bg-white p-4 rounded-xl shadow-sm border-l-4 hover:shadow-md active:scale-[0.98] transition-all cursor-pointer flex justify-between items-center group ${
                  activeTab === 'phacDo' ? 'border-[#0C9943]' : 'border-blue-500'
                }`}
              >
                <span className="font-semibold text-slate-700 text-sm">{p.name}</span>
                <span className="text-slate-300 ml-2 shrink-0">➔</span>
              </div>
            ))
          ) : (
            <div className="text-center p-8 text-slate-400 text-sm bg-white rounded-xl border border-dashed border-slate-200">
              Không tìm thấy tài liệu phù hợp.
            </div>
          )}
        </div>

        {/* === TRÌNH XEM TÀI LIỆU === */}
        {selectedPdf && (
          <PdfViewer 
            url={selectedPdf.link} 
            title={selectedPdf.name} 
            onClose={() => setSelectedPdf(null)} 
          />
        )}
      </div>
    </>
  );
}