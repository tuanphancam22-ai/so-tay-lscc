"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Search, AlertTriangle, Loader2, Pill } from "lucide-react";

// Tích hợp các Component hệ thống
import Header from '../../app/components/Header';
import Footer from "../../app/components/Footer";
import DrugDetailModal from "../../app/components/DrugDetailModal";

export default function TraCuuThuoc() {
  const [drugs, setDrugs] = useState([]);
  const [filteredDrugs, setFilteredDrugs] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDrug, setSelectedDrug] = useState(null);

  // --- 1. LẤY DỮ LIỆU TỪ GOOGLE SHEETS ---
  useEffect(() => {
    const fetchDrugs = async () => {
      const SHEET_ID = "1REXuH0gV0GvQG96elQ0NWODek31vLaQCNO8gnBtSdKE";
      const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=Thuoc`;

      try {
        const res = await fetch(URL);
        const text = await res.text();
        const rows = text.split(/\r?\n/).slice(1);
        
        const parsedDrugs = rows.map((r) => {
          const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          return {
            hc: (c[0] || "").replace(/"/g, "").trim(),
            bhyt: (c[1] || "").replace(/"/g, "").trim(),
            vp: (c[2] || "").replace(/"/g, "").trim(),
            cd: (c[3] || "").replace(/"/g, "").trim(),
            ccd: (c[4] || "").replace(/"/g, "").trim(),
            lieu: (c[5] || "").replace(/"/g, "").trim(),
            nhom: (c[6] || "").replace(/"/g, "").trim(),
          };
        }).filter((d) => d.hc || d.bhyt || d.vp)
          .sort((a, b) => (a.hc || a.bhyt).localeCompare(b.hc || b.bhyt));

        setDrugs(parsedDrugs);
        setFilteredDrugs(parsedDrugs);
        setIsLoading(false);
      } catch (error) {
        console.error("Lỗi tải dữ liệu:", error);
        setIsLoading(false);
      }
    };

    fetchDrugs();
  }, []);

  // --- 2. XỬ LÝ TÌM KIẾM ---
  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    const filtered = drugs.filter((d) =>
      (d.hc?.toLowerCase() || "").includes(lower) ||
      (d.bhyt?.toLowerCase() || "").includes(lower) ||
      (d.vp?.toLowerCase() || "").includes(lower) ||
      (d.nhom?.toLowerCase() || "").includes(lower)
    );
    setFilteredDrugs(filtered);
  }, [searchTerm, drugs]);

  return (
    <>
      <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-gray-800 max-w-md mx-auto relative overflow-hidden">
        
        {/* KHU VỰC HEADER*/}
        <Header showBack={true} title="Tra cứu thuốc" icon={<Pill size={24} />} />

        {/* THANH CÔNG CỤ (Cố định) */}
        <div className="flex-none px-4 -mt-4 z-10">
          <div className="relative shadow-lg rounded-2xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tìm hoạt chất, BHYT, nhóm..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 rounded-2xl border-none text-[15px] outline-none focus:ring-2 focus:ring-[#0C9943] transition-all bg-white"
            />
          </div>

          <div className="bg-orange-50/90 backdrop-blur-sm text-orange-900 p-3 rounded-xl text-[11px] flex items-start gap-2 border border-orange-100 mt-3 shadow-sm">
            <AlertTriangle className="w-4 h-4 shrink-0 text-orange-600 mt-0.5" />
            <p className="m-0 leading-normal italic">
              Thông báo: Dữ liệu chuyên môn đang được thẩm định. Tra cứu tên thuốc và liều lượng tham khảo.
            </p>
          </div>
        </div>

        {/* DANH SÁCH THUỐC (Cuộn) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 scroll-smooth">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-400">
              <Loader2 className="w-7 h-7 animate-spin text-[#0C9943] mb-2" />
              <span className="text-xs uppercase font-bold tracking-widest">Đang đồng bộ...</span>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {filteredDrugs.map((d, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedDrug(d)}
                  className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between active:scale-[0.98] transition-all"
                >
                  {/* Cấu trúc hiển thị thông tin thuốc mới */}
                  <div className="flex-1 overflow-hidden pr-3">
                    {/* Hoạt chất */}
                    <div className="text-[#0C9943] text-[16px] font-bold truncate capitalize mb-1.5">
                      {d.hc || "---"}
                    </div>
                    
                    {/* BHYT và Viện phí hiển thị song song/dọc gọn gàng */}
                    <div className="flex flex-col gap-1 text-[13px]">
                      <div className="text-gray-600 truncate">
                        <span className="font-semibold text-gray-700 w-[70px] inline-block">BHYT:</span>
                        {d.bhyt || "---"}
                      </div>
                      <div className="text-gray-600 truncate">
                        <span className="font-semibold text-gray-700 w-[70px] inline-block">Viện phí:</span>
                        {d.vp || "---"}
                      </div>
                    </div>

                    {/* Nhóm thuốc (Tag hiển thị nhỏ gọn ở dưới cùng) */}
                    {d.nhom && (
                      <div className="mt-2.5 inline-block bg-blue-50 text-blue-600 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider truncate max-w-full">
                        {d.nhom}
                      </div>
                    )}
                  </div>
                  
                  {/* Mũi tên điều hướng */}
                  <div className="flex-none flex items-center justify-center w-8 h-8 rounded-full bg-slate-50 text-slate-400">
                    ❯
                  </div>
                </div>
              ))}
              
              {filteredDrugs.length === 0 && (
                <div className="text-center py-10 opacity-40">
                  <Search className="w-10 h-10 mx-auto mb-2" />
                  <p className="text-sm">Không tìm thấy thuốc tương ứng</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* FOOTER HỆ THỐNG */}
        <div className="flex-none bg-slate-50/80 backdrop-blur-md pt-2">
          <Footer />
        </div>

        {/* MODAL CHI TIẾT */}
        {selectedDrug && (
          <DrugDetailModal 
            drug={selectedDrug} 
            onClose={() => setSelectedDrug(null)} 
          />
        )}
      </div>
    </>
  );
}