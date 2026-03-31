"use client";
import { useState, useEffect, useRef } from 'react';

export default function NotificationCarousel() {
  const [announcements, setAnnouncements] = useState([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const ANN_URL = `https://docs.google.com/spreadsheets/d/1REXuH0gV0GvQG96elQ0NWODek31vLaQCNO8gnBtSdKE/gviz/tq?tqx=out:csv&sheet=ThongBao`;
      try {
        const res = await fetch(ANN_URL);
        const text = await res.text();
        const rows = text.split('\n').slice(1, 6); 
        const parsed = rows.map(r => {
          const c = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/).map(v => v.replace(/^"|"$/g, '').trim());
          
          let rawImg = c[2] || "";
          if (rawImg.includes('drive.google.com')) {
            const fileIdMatch = rawImg.match(/\/d\/(.+?)\//) || rawImg.match(/id=(.+?)(&|$)/);
            if (fileIdMatch) rawImg = `https://drive.google.com/uc?id=${fileIdMatch[1]}`;
          }
          
          if (!rawImg || rawImg === "") {
            rawImg = "https://via.placeholder.com/60/eeeeee/999999?text=News";
          }

          return { title: c[0] || "Thông báo", tag: c[1] || "HOT", img: rawImg, link: c[3] || "#" };
        });
        setAnnouncements(parsed as any);
      } catch (error) {}
    };
    fetchAnnouncements();
  }, []);

  useEffect(() => {
    if (announcements.length === 0) return;
    const interval = setInterval(() => {
      if (scrollRef.current) {
        const container = scrollRef.current;
        const cards = container.children;
        if (cards.length > 0) {
          if (container.scrollLeft + container.clientWidth >= container.scrollWidth - 10) {
            container.scrollTo({ left: 0, behavior: 'smooth' });
          } else {
            container.scrollBy({ left: (cards[0] as HTMLElement).offsetWidth + 12, behavior: 'smooth' });
          }
        }
      }
    }, 4000);
    return () => clearInterval(interval);
  }, [announcements]);

  return (
    <div 
      ref={scrollRef}
      className="flex overflow-x-auto gap-3 px-3 py-3 snap-x snap-mandatory scrollbar-hide flex-none"
      style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
    >
      {announcements.length === 0 ? (
        <div className="w-full text-center text-gray-400 text-sm py-2">Đang tải tin tức...</div>
      ) : (
        announcements.map((ann: any, idx) => (
          <div key={idx} className="min-w-[90%] snap-center bg-white rounded-xl p-2 shadow-sm border-l-4 border-[#0C9943] flex items-center">
            <img src={ann.img} className="w-12 h-12 rounded-lg object-cover mr-3 flex-none" alt="News" />
            <div className="flex-grow overflow-hidden">
              <span className="bg-[#d93025] text-white text-[9px] px-1.5 py-0.5 rounded font-bold uppercase">{ann.tag}</span>
              <span className="block text-xs font-bold text-gray-800 mt-1 truncate">{ann.title}</span>
            </div>
          </div>
        ))
      )}
    </div>
  );
}