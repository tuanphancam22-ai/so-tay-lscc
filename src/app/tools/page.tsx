"use client";

import { useState } from "react";
import { 
  Stethoscope, 
  Search, 
  Timer, 
  Ruler, 
  Brain, 
  Zap, 
  Eye, 
  Activity, 
  ListFilter 
} from "lucide-react";

// Import các Component hệ thống sẵn có
import Header from "../components/Header";
import AuthGuard from "../components/AuthGuard";
import MenuButton from "../components/MenuButton";

// LOGIC Y KHOA: Mảng dữ liệu phẳng (Flat List) cố định, load 0ms
const CLINICAL_TOOLS = [
  { id: "timer", title: "Đếm Mạch/Thở", href: "/timer", icon: Timer, color: "text-rose-500" },
  { id: "ruler", title: "Thước đo", href: "/thuoc-do", icon: Ruler, color: "text-slate-500" },
  { id: "gcs", title: "Glasgow (GCS)", href: "/gcs", icon: Brain, color: "text-blue-600" },
  { id: "nihss", title: "NIHSS", href: "/nihss", icon: Zap, color: "text-yellow-500" },
  { id: "pupil", title: "Soi đồng tử", href: "/dong-tu", icon: Eye, color: "text-indigo-500" },
  { id: "qsofa", title: "qSOFA", href: "/qsofa", icon: Activity, color: "text-red-600" },
  { id: "triage", title: "Phân loại Triage", href: "/triage", icon: ListFilter, color: "text-emerald-600" },
];

export default function CongCuLamSang() {
  const [searchTerm, setSearchTerm] = useState("");

  // Logic Search (Lọc realtime 0ms do array nhỏ)
  const filteredTools = CLINICAL_TOOLS.filter((tool) =>
    tool.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-gray-800 max-w-md mx-auto relative overflow-hidden">
        
        {/* === HEADER === */}
        <Header 
          showBack={true} 
          title="Công cụ Lâm sàng" 
          icon={<Stethoscope size={24} />} 
        />

        {/* === STICKY SEARCH BAR === */}
        {/* Style mượn từ trang tra-cuu-thuoc để đồng bộ UI */}
        <div className="flex-none px-4 -mt-4 z-10">
          <div className="relative shadow-lg rounded-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm nhanh công cụ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none text-[15px] outline-none focus:ring-2 focus:ring-[#0C9943] transition-all bg-white"
            />
          </div>
        </div>

        {/* === MAIN CONTENT: DANH SÁCH CÔNG CỤ === */}
        <div className="flex-1 overflow-y-auto px-4 py-5 scroll-smooth">
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-2 gap-3 pb-8">
              {filteredTools.map((tool) => {
                const IconComponent = tool.icon;
                return (
                  // Bọc thẻ div có chiều cao tối thiểu để đảm bảo nút bấm TO, dễ chạm
                  <div key={tool.id} className="min-h-[110px]">
                    <MenuButton 
                      href={tool.href} 
                      icon={<IconComponent size={36} strokeWidth={1.5} />} 
                      title={tool.title} 
                      color={tool.color} 
                    />
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-10 opacity-40">
              <Search className="w-10 h-10 mx-auto mb-2" />
              <p className="text-sm">Không tìm thấy công cụ "{searchTerm}"</p>
            </div>
          )}
        </div>
        
      </div>
    </>
  );
}