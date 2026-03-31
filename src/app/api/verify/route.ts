// File: app/api/verify/route.ts
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { code } = await request.json();
    const masterPass = process.env.APP_PASSCODE;
 
    console.log("Mã nhận được:", code);
    console.log("Mã trong hệ thống:", masterPass);
    
    if (code === masterPass) {
      return NextResponse.json({ success: true }, { status: 200 });
    } else {
      return NextResponse.json({ success: false, message: "Mã không đúng" }, { status: 401 });
    }
  } catch (error) {
    return NextResponse.json({ success: false }, { status: 400 });
  }
}