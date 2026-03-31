import "./globals.css";
import AuthGuard from "./components/AuthGuard"; // Thêm dòng này

export const metadata = {
  title: "Sổ Tay Lâm Sàng",
  description: "Khoa Cấp Cứu - BV Thiện Hạnh",
};

export default function RootLayout({ children }) {
  return (
    <html lang="vi">
      <body>
        {/* Bọc toàn bộ ứng dụng bằng AuthGuard */}
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}