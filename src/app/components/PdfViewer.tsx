"use client";

export default function PdfViewer({ url, title, onClose }) {
  if (!url) return null; // Nếu không có link thì không hiện gì cả

  let finalUrl = url;
  // Xử lý link Drive tự động sang link nhúng preview
  if (url.includes('drive.google.com')) {
    const fileIdMatch = url.match(/\/d\/(.+?)\//) || url.match(/id=(.+?)(&|$)/);
    if (fileIdMatch) {
      finalUrl = `https://drive.google.com/file/d/${fileIdMatch[1]}/preview`;
    }
  } else if (url.toLowerCase().endsWith('.pdf')) {
    finalUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
  }

  return (
    <div className="fixed inset-0 bg-black/80 z-[20000] flex flex-col font-sans">
      {/* Thanh tiêu đề & Nút đóng */}
      <div className="bg-white p-3 flex justify-between items-center border-b border-gray-300 shadow-md z-[20002]">
        <span className="font-bold text-sm text-gray-800 truncate max-w-[70%]">{title || 'Đang xem tài liệu'}</span>
        <button 
          onClick={onClose} 
          className="bg-[#d93025] text-white border-none py-2 px-4 rounded-md font-bold cursor-pointer active:bg-red-800"
        >
          ĐÓNG X
        </button>
      </div>
      
      {/* Khung chứa Iframe */}
      <div className="relative flex-grow w-full bg-white">
        {/* Lớp khiên chặn góc trên bên phải (chặn nút pop-out Drive) */}
        <div className="absolute top-0 right-0 w-20 h-20 z-[20001] bg-white/0 pointer-events-auto"></div>
        <iframe src={finalUrl} className="w-full h-full border-none" />
      </div>
    </div>
  );
}