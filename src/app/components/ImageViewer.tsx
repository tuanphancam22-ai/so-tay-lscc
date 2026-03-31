"use client"; // [cite: 1]

import React, { useState, useRef } from 'react';

// Khai báo kiểu dữ liệu cho Props (Điểm khác biệt lớn nhất của .tsx)
interface ImageViewerProps {
  imagesStr: string;
  onClose: () => void;
}

export default function ImageViewer({ imagesStr, onClose }: ImageViewerProps) {
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const imgRef = useRef<HTMLImageElement>(null);

  // Các biến giữ trạng thái mượt (không kích hoạt render lại) [cite: 3]
  const transform = useRef({ scale: 1, x: 0, y: 0 });
  const start = useRef({ x: 0, y: 0, dist: 0 });
  const isZooming = useRef<boolean>(false);
  const lastTapTime = useRef<number>(0); // Dùng cho tính năng Double-tap

  if (!imagesStr) return null;
  
  // Tách chuỗi thành mảng các link ảnh [cite: 5]
  const images = imagesStr.split(/[,\s\n]+/).filter(s => s.includes('.'));
  if (images.length === 0) return null;

  const updateTransform = () => {
    if (imgRef.current) {
      const { x, y, scale } = transform.current;
      imgRef.current.style.transform = `translate(${x}px, ${y}px) scale(${scale})`; // [cite: 7]
    }
  };

  const resetTransform = () => {
    transform.current = { scale: 1, x: 0, y: 0 };
    updateTransform();
  };

  // Xử lý Touch Events có thêm định nghĩa kiểu React.TouchEvent
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Logic Double Tap để reset zoom
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTapTime.current;
    if (tapLength < 300 && tapLength > 0) {
      resetTransform();
      e.preventDefault();
      return;
    }
    lastTapTime.current = currentTime;

    if (e.touches.length === 1) {
      start.current.x = e.touches[0].clientX - transform.current.x;
      start.current.y = e.touches[0].clientY - transform.current.y; // [cite: 8]
    } else if (e.touches.length === 2) {
      isZooming.current = true;
      start.current.dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      ); // [cite: 9]
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (isZooming.current || transform.current.scale > 1) {
      // Ngăn cuộn trang web khi đang zoom [cite: 11]
      // Lưu ý: React đôi khi không cho preventDefault trên touchMove bị passive,
      // nên đã thêm CSS `touch-none` ở wrapper tổng.
    }
    
    if (e.touches.length === 1 && transform.current.scale > 1) {
      transform.current.x = e.touches[0].clientX - start.current.x;
      transform.current.y = e.touches[0].clientY - start.current.y; // [cite: 12]
    } else if (e.touches.length === 2) {
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      // Giới hạn zoom scale từ 1x đến 4x [cite: 13]
      const newScale = Math.min(Math.max(1, (dist / start.current.dist) * transform.current.scale), 4);
      transform.current.scale = newScale;
      start.current.dist = dist;
    }
    updateTransform();
  };

  const handleTouchEnd = () => {
    isZooming.current = false; // [cite: 14]
  };

  const changeSlide = (dir: number) => {
    let next = currentSlide + dir; // [cite: 15]
    if (next < 0) next = 0; // [cite: 16]
    if (next >= images.length) next = images.length - 1;
    
    setCurrentSlide(next);
    resetTransform(); // Reset zoom khi chuyển ảnh [cite: 17]
  };

  return (
    <div 
      className="fixed inset-0 bg-black/95 z-9999 flex flex-col items-center justify-center touch-none overscroll-none"
      onClick={(e) => {
        // Đóng nếu bấm vào vùng đen bên ngoài [cite: 18]
        if ((e.target as HTMLElement).id === 'viewer-bg') onClose();
      }}
      id="viewer-bg"
    >
      <div className="absolute top-4 right-4 z-50 text-gray-400 text-sm">
        {currentSlide + 1} / {images.length}
      </div>

      <div 
        className="w-full flex justify-center items-center overflow-hidden flex-grow"
        onTouchStart={handleTouchStart} // [cite: 19]
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img 
          ref={imgRef}
          src={`/${images[currentSlide].trim()}`} 
          className="max-w-[95%] max-h-[70vh] origin-center transition-transform duration-75 ease-out rounded-md"
          alt="Medical Visual"
          onError={(e) => { (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Lỗi+tải+ảnh'; }}
        />
      </div>

      {images.length > 1 && (
        <div className="absolute bottom-32 w-full flex justify-center gap-12 z-50">
          <button 
            onClick={(e) => { e.stopPropagation(); changeSlide(-1); }} 
            className={`p-4 rounded-full text-2xl font-bold border-none transition-colors ${currentSlide === 0 ? 'bg-white/10 text-gray-500' : 'bg-white/30 text-white active:bg-white/50'}`}
            disabled={currentSlide === 0}
          >
            ❮
          </button>
          <button 
            onClick={(e) => { e.stopPropagation(); changeSlide(1); }} 
            className={`p-4 rounded-full text-2xl font-bold border-none transition-colors ${currentSlide === images.length - 1 ? 'bg-white/10 text-gray-500' : 'bg-white/30 text-white active:bg-white/50'}`}
            disabled={currentSlide === images.length - 1}
          >
            ❯
          </button>
        </div>
      )}

      <button 
        onClick={onClose} // [cite: 21]
        className="absolute bottom-8 bg-gray-800 text-white font-bold py-3 px-8 rounded-full border border-gray-600 shadow-lg active:scale-95 transition-transform z-50"
      >
        ĐÓNG LẠI
      </button>
    </div>
  );
} // [cite: 22]