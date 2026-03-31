"use client";
import Header from './components/Header';
import QuickAccess from './components/QuickAccess';
import ClinicalTools from './components/ClinicalTools';
import Library from './components/Library';
import Footer from './components/Footer';
import NotificationCarousel from './components/NotificationCarousel';

export default function Home() {
  return (
    // Dùng h-[100dvh] để khóa chiều cao tổng, overflow-hidden để không cuộn toàn trang
    <main className="bg-[#f0f2f5] font-sans flex flex-col h-[100dvh] overflow-hidden">
      
      {/* Lớp 1: Banner & Header (Tự động lấy chiều cao vừa đủ) */}
      <section className="flex-none">
        <Header />
        <NotificationCarousel />
      </section>

      {/* Vùng thân: Flex-1 giúp nó chiếm toàn bộ không gian còn lại. 
          Nếu màn hình QUÁ LÙN (như iPhone SE), phần thân này sẽ tự sinh ra thanh cuộn */}
      <div className="flex-1 overflow-y-auto flex flex-col px-3 pb-2 gap-3 mt-1">
        
        {/* Lớp 2: Truy cập nhanh (Cho hệ số flex dãn nhiều nhất - flex-[1.6]) */}
        <section className="flex-[1.6] min-h-[200px] flex flex-col">
          <h2 className="text-[11px] font-bold text-gray-400 uppercase mb-1.5 ml-1 flex-none">Truy cập nhanh</h2>
          <div className="flex-1">
            <QuickAccess />
          </div>
        </section>

        {/* Lớp 3: Công cụ lâm sàng (Hệ số dãn flex-1) */}
        <section className="flex-1 min-h-[150px] flex flex-col">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1 flex-none">Lâm sàng</h2>
          <div className="flex-1">
            <ClinicalTools />
          </div>
        </section>

        {/* Lớp 4: Thư viện (Hệ số dãn flex-1) */}
        <section className="flex-1 min-h-[100px] flex flex-col">
          <h2 className="text-[10px] font-bold text-gray-400 uppercase mb-1.5 ml-1 flex-none">Tra cứu</h2>
          <div className="flex-1">
            <Library />
          </div>
        </section>

      </div>

      {/* Lớp 5: Footer (Luôn bám đáy) */}
      <section className="flex-none pb-2 pt-1 bg-[#f0f2f5]">
        <Footer />
      </section>

    </main>
  );
}