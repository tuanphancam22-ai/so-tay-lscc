"use client";
import React, { useReducer } from 'react';
import { useWakeLock } from '../../../hooks/useWakeLock';
import { useCprAudio } from '../../../hooks/useCprAudio';
import SetupScreen from './SetupScreen';
import OperationScreen from './OperationScreen';
import LoggingScreen from './LoggingScreen';

// === 1. ĐỊNH NGHĨA KIỂU DỮ LIỆU (TYPESCRIPT) ===
type Stage = 'SETUP' | 'OPERATION' | 'LOGGING';
type PatientType = 'infant' | 'child' | 'adult';

interface AppState {
  stage: Stage;
  patientType: PatientType;
  weight: number;
  rate: 100 | 110 | 120;
  hasNKQ: boolean;
  adreDose: number;
  
  startTime: number | null;
  lastAdreTime: number | null;
  logs: { time: number; event: string; details: string }[];
  adreCount: number;
  shockCount: number;
}

// Các "Y lệnh" mà hệ thống có thể nhận
type Action = 
  | { type: 'UPDATE_SETUP'; payload: Partial<AppState> }
  | { type: 'START_CPR' }
  | { type: 'LOG_EVENT'; payload: { event: string; details: string } }
  | { type: 'GIVE_ADRE' }
  | { type: 'GIVE_SHOCK' }
  | { type: 'TOGGLE_NKQ' }
  | { type: 'STOP_CPR' };

// === 2. TRẠNG THÁI MẶC ĐỊNH KHI VÀO APP ===
const initialState: AppState = {
  stage: 'SETUP',
  patientType: 'adult',
  weight: 60,
  rate: 120,
  hasNKQ: false,
  adreDose: 1,
  
  startTime: null,
  lastAdreTime: null,
  logs: [],
  adreCount: 0,
  shockCount: 0,
};

// === 3. HÀM REDUCER (ĐIỀU PHỐI LOGIC TRUNG TÂM) ===
function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'UPDATE_SETUP': 
      return { ...state, ...action.payload };
      
    case 'START_CPR':
      return { 
        ...state, 
        stage: 'OPERATION', 
        startTime: performance.now(),
        lastAdreTime: performance.now(), // Bắt đầu đếm ngược 3 phút Adre ngay lập tức
        logs: [{ 
          time: 0, 
          event: 'BẮT ĐẦU CPR', 
          details: `BN: ${state.patientType}, Nặng: ${state.weight}kg` 
        }] 
      };
      
    case 'LOG_EVENT':
      const logTime = Math.floor((performance.now() - (state.startTime || performance.now())) / 1000);
      return { 
        ...state, 
        logs: [...state.logs, { time: logTime, ...action.payload }] 
      };
      
    case 'GIVE_ADRE':
      return { 
        ...state, 
        adreCount: state.adreCount + 1, 
        lastAdreTime: performance.now() // Reset lại đồng hồ đếm ngược Adre
      };
      
    case 'GIVE_SHOCK':
      return { ...state, shockCount: state.shockCount + 1 };
      
    case 'TOGGLE_NKQ':
      return { ...state, hasNKQ: !state.hasNKQ };
      
    case 'STOP_CPR':
      return { ...state, stage: 'LOGGING' };
      
    default: 
      return state;
  }
}

// === 4. COMPONENT ĐIỀU HƯỚNG CHÍNH ===
export default function CPRAssistant() {
  // Khởi tạo State với Reducer
  const [state, dispatch] = useReducer(reducer, initialState);
  
  // Gọi các Custom Hooks xử lý phần cứng
  const { requestWakeLock, releaseWakeLock } = useWakeLock();
  const { initAudio, playBeep } = useCprAudio();

  // Hàm xử lý khi bấm Bắt đầu
  const handleStart = async () => {
    await initAudio();       // Mở khóa âm thanh (Trình duyệt yêu cầu user phải tương tác mới cho phát tiếng)
    await requestWakeLock(); // Bật chế độ không tắt màn hình
    dispatch({ type: 'START_CPR' });
  };

  // Hàm xử lý khi bấm Dừng
  const handleStop = () => {
    dispatch({ type: 'LOG_EVENT', payload: { event: 'DỪNG CPR', details: 'Kết thúc cấp cứu' }});
    dispatch({ type: 'STOP_CPR' });
    releaseWakeLock();       // Trả lại quyền tự động tắt màn hình cho điện thoại
  };

  // Render luân phiên 3 màn hình tùy thuộc vào stage hiện tại
  return (
    <>
      {state.stage === 'SETUP' && (
        <SetupScreen 
          state={state} 
          dispatch={dispatch} 
          onStart={handleStart} 
        />
      )}
      
      {state.stage === 'OPERATION' && (
        <OperationScreen 
          state={state} 
          dispatch={dispatch} 
          onStop={handleStop} 
          playBeep={playBeep} 
        />
      )}
      
      {state.stage === 'LOGGING' && (
        <LoggingScreen 
          state={state} 
        />
      )}
    </>
  );
}