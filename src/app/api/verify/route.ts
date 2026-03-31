// File: app/api/verify/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { code } = await request.json();
  // Ưu tiên lấy mật khẩu từ biến môi trường, nếu không có mới dùng mật khẩu mặc định
  const systemPassword = process.env.NEXT_PUBLIC_APP_PASSWORD || "mat-khau-test-tren-may"; 

  if (code === systemPassword) {
    return NextResponse.json({ success: true }, { status: 200 });
  } else {
    return NextResponse.json({ success: false, message: "Mã không đúng" }, { status: 401 });
  }
}
