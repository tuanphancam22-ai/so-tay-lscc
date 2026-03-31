"use client"; // Bắt buộc phải có dòng này ở đầu để Next.js hiểu đây là trang có tương tác (chọn điểm, tính toán)

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import { Brain } from "lucide-react";

export default function GCS() {
  // 1. Tạo các "ngăn kéo" (State) để chứa dữ liệu thay vì lấy từ DOM
  const [data, setData] = useState([]);
  const [eScore, setEScore] = useState(4); // Mặc định E4
  const [vScore, setVScore] = useState(5); // Mặc định V5
  const [mScore, setMScore] = useState(6); // Mặc định M6

  // 2. Lấy dữ liệu từ Google Sheet khi trang vừa tải lên (thay cho window.onload)
  useEffect(() => {
    const SHEET_ID = '1REXuH0gV0GvQG96elQ0NWODek31vLaQCNO8gnBtSdKE';
    const URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=GCS`;

    const fetchData = async () => {
      try {
        const res = await fetch(URL);
        const text = await res.text();
        const rows = text.split('\n').slice(1);
        const parsedData = rows.map(r => {
          const cols = r.split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          return {
            nhom: cols[0]?.replace(/"/g, '').trim(),
            mo: cols[1]?.replace(/"/g, '').trim(),
            diem: parseInt(cols[2]?.replace(/"/g, '').trim()) || 0
          };
        }).filter(i => i.nhom);
        setData(parsedData);
      } catch (e) {
        alert("Lỗi tải dữ liệu GCS!");
      }
    };
    fetchData();
  }, []); // Dấu [] nghĩa là chỉ chạy 1 lần khi mở trang

  // 3. Logic tính toán tổng điểm và cảnh báo
  const total = eScore + vScore + mScore;
  let status = "Bình thường";
  let bgColor = "bg-green-500"; // Class màu của Tailwind

  if (total <= 8) {
    status = "⚠️ NẶNG - Đặt NKQ!";
    bgColor = "bg-red-600";
  } else if (total <= 12) {
    status = "TRUNG BÌNH";
    bgColor = "bg-yellow-500";
  }

  // Hàm lọc dữ liệu để hiển thị thẻ <option>
  const getOptions = (groupName) => {
    return data
      .filter(item => item.nhom === groupName)
      .map((item, index) => (
        <option key={index} value={item.diem}>
          {item.diem} - {item.mo}
        </option>
      ));
  };

  // 4. Giao diện (HTML kết hợp Tailwind CSS)
  return (
     <div className="flex flex-col h-[100dvh] bg-slate-50 font-sans text-gray-800 max-w-md mx-auto relative overflow-hidden">
      {/* ĐỒNG BỘ HEADER MỚI */}
      <Header 
        showBack={true} 
        title="Thang điểm GCS" 
        icon={<Brain size={24} />} 
      />

      {/* Form nhập liệu */}
      <div className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100">
        <label className="font-bold block mb-2 text-sm text-gray-700">Mắt (E):</label>
        <select 
          className="w-full p-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-[#0C9943]"
          value={eScore} 
          onChange={(e) => setEScore(parseInt(e.target.value))}
        >
          {getOptions('Mắt')}
        </select>
      </div>

      <div className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100">
        <label className="font-bold block mb-2 text-sm text-gray-700">Lời nói (V):</label>
        <select 
          className="w-full p-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-[#0C9943]"
          value={vScore} 
          onChange={(e) => setVScore(parseInt(e.target.value))}
        >
          {getOptions('Lời nói')}
        </select>
      </div>

      <div className="bg-white p-4 rounded-xl mb-4 shadow-sm border border-gray-100">
        <label className="font-bold block mb-2 text-sm text-gray-700">Vận động (M):</label>
        <select 
          className="w-full p-3 rounded-lg border border-gray-300 text-base focus:outline-none focus:border-[#0C9943]"
          value={mScore} 
          onChange={(e) => setMScore(parseInt(e.target.value))}
        >
          {getOptions('Vận động')}
        </select>
      </div>

      {/* Hộp kết quả đổi màu động */}
      <div className={`p-5 rounded-xl text-white text-center mt-6 transition-colors duration-300 shadow-md ${bgColor}`}>
        <h1 className="text-4xl font-bold m-0">{total} điểm</h1>
        <p className="mt-2 font-bold text-lg">{status}</p>
      </div>
    </div>
  );
}