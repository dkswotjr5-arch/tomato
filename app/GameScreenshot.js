"use client";

import { useEffect, useState } from "react";

export default function GameScreenshot({ type }) {
  const [frame, setFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrame((prev) => (prev + 1) % 4);
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // 1. 재판소 화면 (Courtroom Screen Simulator)
  if (type === "court") {
    return (
      <div className="w-full h-full bg-slate-900 rounded-2xl border-4 border-amber-500 overflow-hidden shadow-2xl relative font-sans text-white select-none">
        {/* HUD */}
        <div className="bg-black/80 px-4 py-2 flex justify-between items-center text-xs border-b border-white/10">
          <span className="font-bold text-amber-300">⚖️ 재판 번호 #104</span>
          <div className="flex gap-2">
            <span>🍅 <b className="text-red-400">12</b></span>
            <span>💰 <b className="text-yellow-400">450</b></span>
          </div>
        </div>

        {/* 메인 캔버스 시뮬레이터 (귀여운 캐주얼 캐릭터 및 말풍선) */}
        <div className="h-[240px] bg-gradient-to-b from-[#2c2c3a] to-[#1e1e2e] relative p-4 flex flex-col justify-between">
          
          {/* AI 배심원 및 군중 캐릭터 레이아웃 */}
          <div className="flex justify-between items-start">
            <div className="flex flex-col items-center">
              <div className="bg-blue-500 w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xl shadow-lg animate-bounce">
                😎
              </div>
              <span className="text-[10px] bg-black/60 px-1.5 py-0.5 rounded-full mt-1">배심원 멍뭉</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-purple-500 w-12 h-12 rounded-full border-2 border-amber-400 flex items-center justify-center text-2xl shadow-xl animate-pulse">
                👑
              </div>
              <span className="text-[10px] bg-amber-500/80 px-2 py-0.5 rounded-full mt-1 font-bold text-black text-center">판사 토선생</span>
            </div>

            <div className="flex flex-col items-center">
              <div className="bg-green-500 w-10 h-10 rounded-full border-2 border-white flex items-center justify-center text-xl shadow-lg">
                😈
              </div>
              <span className="text-[10px] bg-black/60 px-1.5 py-0.5 rounded-full mt-1">피고 민찌</span>
            </div>
          </div>

          {/* 중앙 말풍선 - 대화 텍스트 루프 시뮬레이션 */}
          <div className="self-center bg-white text-slate-800 text-xs py-2.5 px-4 rounded-2xl border-2 border-yellow-400 max-w-[85%] shadow-lg relative animate-float">
            {frame === 0 && "⚖️ 피고인은 밤 11시에 치킨 다리를 다 먹었습니까?"}
            {frame === 1 && "😈 전 억울합니다! 한 다리는 뼈였습니다!"}
            {frame === 2 && "😎 저건 명백한 유죄각이다! 대리 치킨 죄!"}
            {frame === 3 && "🍅 유죄 판결!! 토마토 세례를 준비하라!! 🎉"}
            <div className="absolute top-1/2 -left-2 transform -translate-y-1/2 w-0 h-0 border-t-8 border-t-transparent border-r-8 border-r-white border-b-8 border-b-transparent"></div>
          </div>

          {/* 날라다니는 토마토 효과 */}
          {frame === 3 && (
            <div className="absolute inset-0 pointer-events-none">
              <span className="absolute animate-ping text-3xl left-[40%] top-[40%]">🍅</span>
              <span className="absolute animate-bounce text-2xl left-[25%] top-[55%]">🍅</span>
              <span className="absolute animate-bounce text-3xl left-[70%] top-[35%]">🍅</span>
              <span className="absolute animate-ping text-xl left-[60%] top-[60%]">💥</span>
            </div>
          )}

          {/* 캐릭터가 던지는 모션 */}
          <div className="flex justify-center gap-1">
            <span className="text-xs bg-red-600/90 text-white px-2 py-1 rounded-full animate-pulse-slow">
              🔥 실시간 토마토 {frame === 3 ? "124개 투척중!" : "대기중"}
            </span>
          </div>
        </div>

        {/* 하단 패널 */}
        <div className="bg-slate-100 p-2.5 flex flex-col gap-2 border-t border-slate-300">
          {/* 단계 표시 및 타이머 */}
          <div className="flex justify-between items-center">
            <span className="text-xs text-indigo-700 bg-indigo-50 px-2 py-1 rounded-md border border-indigo-200 font-bold">
              {frame === 3 ? "🍅 토마토 투척 단계" : "🗳️ 투표 진행중"}
            </span>
            <span className="text-xs text-red-500 font-bold animate-pulse">⏱️ 0:12</span>
          </div>
          
          {/* 리얼 투표 버튼 */}
          <div className="flex gap-2">
            <button className="flex-1 py-2 bg-gradient-to-r from-red-500 to-red-600 hover:scale-105 active:scale-95 transition-all text-white font-bold rounded-lg text-xs shadow-md border-b-2 border-red-700 flex items-center justify-center gap-1">
              🔨 유죄 (68%)
            </button>
            <button className="flex-1 py-2 bg-gradient-to-r from-green-500 to-green-600 hover:scale-105 active:scale-95 transition-all text-white font-bold rounded-lg text-xs shadow-md border-b-2 border-green-700 flex items-center justify-center gap-1">
              ✋ 무죄 (32%)
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. 광장 화면 (Village Square Simulator)
  if (type === "town") {
    return (
      <div className="w-full h-full bg-[#1b3c10] rounded-2xl border-4 border-emerald-500 overflow-hidden shadow-2xl relative font-sans text-white select-none">
        
        {/* HUD */}
        <div className="bg-black/80 px-4 py-2 flex justify-between items-center text-xs">
          <div className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></span>
            <span className="font-bold text-slate-100">🌿 토마토광장 (채널 1)</span>
          </div>
          <div className="flex gap-2 text-yellow-300">
            <span>🛡️ Lv.5</span>
            <span>👑 칭호: 정의의 판사</span>
          </div>
        </div>

        {/* 2D 잔디밭 광장 시뮬레이터 */}
        <div className="h-[240px] bg-gradient-to-b from-[#346224] to-[#244f19] relative p-4 flex flex-col justify-end">
          
          {/* 격자 무늬 잔디 필드 (CSS 패턴 적용) */}
          <div className="absolute inset-0 opacity-10 bg-[linear-gradient(rgba(255,255,255,.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.05)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none"></div>

          {/* 중앙 화당 및 정화소 포탈 */}
          <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
            <div className="w-16 h-12 bg-sky-200/20 border-2 border-cyan-400 rounded-full flex items-center justify-center animate-pulse-slow">
              <span className="text-2xl">🚿</span>
            </div>
            <span className="text-[10px] text-cyan-300 font-bold mt-1 bg-black/40 px-1 py-0.5 rounded">🚿 정화소</span>
          </div>

          <div className="absolute top-[35%] left-[20%] flex flex-col items-center">
            <div className="w-14 h-12 bg-amber-500/20 border-2 border-amber-400 rounded-full flex items-center justify-center">
              <span className="text-xl">⚖️</span>
            </div>
            <span className="text-[10px] text-amber-300 font-bold mt-1 bg-black/40 px-1 py-0.5 rounded">🏛️ 재판소</span>
          </div>

          {/* 유저 캐릭터들 배치 */}
          <div className="absolute bottom-[20%] left-[20%] flex flex-col items-center">
            <div className="bg-amber-500 w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-lg animate-wiggle shadow-lg">
              😤
            </div>
            <span className="text-[9px] bg-black/60 px-1.5 py-0.5 rounded-full mt-1">심술쟁이</span>
          </div>

          <div className="absolute bottom-[10%] left-[45%] flex flex-col items-center">
            <div className="bg-sky-500 w-10 h-10 rounded-full border-2 border-yellow-300 flex items-center justify-center text-xl animate-float shadow-xl">
              😊
            </div>
            <span className="text-[9px] bg-rose-500 px-1.5 py-0.5 rounded-full mt-1 font-bold">✨ 나 (판사)</span>
            <div className="absolute -top-10 bg-black/80 px-2 py-1 rounded-lg border border-yellow-400 text-[10px] whitespace-nowrap">
              🗣️ 재판 진행하러 가자!
            </div>
          </div>

          <div className="absolute bottom-[25%] right-[25%] flex flex-col items-center">
            <div className="bg-red-400 w-9 h-9 rounded-full border-2 border-white flex items-center justify-center text-lg animate-bounce shadow-lg">
              🤓
            </div>
            <span className="text-[9px] bg-black/60 px-1.5 py-0.5 rounded-full mt-1">참견러</span>
          </div>

        </div>

        {/* 하단 키패드 및 조작 시뮬레이터 */}
        <div className="bg-slate-900 p-2.5 flex justify-between items-center border-t border-white/5">
          <div className="flex gap-1">
            <span className="text-[10px] bg-white/10 px-2 py-1 rounded">Enter 키로 대화</span>
            <span className="text-[10px] bg-white/10 px-2 py-1 rounded">방향키 이동</span>
          </div>
          <button className="bg-yellow-500 hover:bg-yellow-400 text-black px-3 py-1 text-xs font-bold rounded-lg transition-colors">
            🚀 빠른입장
          </button>
        </div>
      </div>
    );
  }

  // 3. 정화소 / 아이템 상점 화면 (Bath and Shop Screen Simulator)
  if (type === "shop") {
    return (
      <div className="w-full h-full bg-[#1e293b] rounded-2xl border-4 border-purple-500 overflow-hidden shadow-2xl relative font-sans text-white select-none">
        {/* HUD */}
        <div className="bg-black/80 px-4 py-2 flex justify-between items-center text-xs">
          <span className="font-bold text-purple-300">🎒 캡슐 상점 & 장비창</span>
          <span className="text-yellow-400">💰 1,200 Gold</span>
        </div>

        {/* 상점 리스트 뷰 및 정화 시뮬레이션 */}
        <div className="p-3 h-[240px] overflow-y-auto grid grid-cols-3 gap-2 bg-slate-800">
          
          <div className="bg-slate-700/60 p-2 rounded-xl border-2 border-purple-500/50 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform">
            <span className="text-3xl animate-float">🧼</span>
            <span className="text-[11px] font-bold mt-1 text-slate-100">향기 비누</span>
            <span className="text-[9px] text-yellow-400 font-semibold">10 💰</span>
            <span className="text-[9px] bg-purple-500 text-white px-1.5 py-0.5 rounded-full mt-1">구매하기</span>
          </div>

          <div className="bg-slate-700/60 p-2 rounded-xl border-2 border-red-500/50 flex flex-col items-center justify-center text-center hover:scale-105 transition-transform">
            <span className="text-3xl animate-wiggle">🍅</span>
            <span className="text-[11px] font-bold mt-1 text-slate-100">왕 토마토</span>
            <span className="text-[9px] text-yellow-400 font-semibold">무료 광고</span>
            <span className="text-[9px] bg-red-500 text-white px-1.5 py-0.5 rounded-full mt-1">획득하기</span>
          </div>

          <div className="bg-pink-900/40 p-2 rounded-xl border-2 border-pink-500 flex flex-col items-center justify-center text-center scale-105 shadow-inner">
            <span className="text-3xl animate-pulse">👑</span>
            <span className="text-[11px] font-bold mt-1 text-pink-300">황금 왕관</span>
            <span className="text-[9px] text-green-400 font-bold">보유중</span>
            <span className="text-[9px] bg-pink-500 text-white px-1.5 py-0.5 rounded-full mt-1 font-bold">장착됨</span>
          </div>

          <div className="bg-slate-700/60 p-2 rounded-xl border-2 border-slate-600 flex flex-col items-center justify-center text-center opacity-70">
            <span className="text-3xl">🎩</span>
            <span className="text-[11px] mt-1">신사의 중절모</span>
            <span className="text-[9px] text-yellow-400">150 💰</span>
          </div>

          <div className="bg-slate-700/60 p-2 rounded-xl border-2 border-slate-600 flex flex-col items-center justify-center text-center opacity-70">
            <span className="text-3xl">🕶️</span>
            <span className="text-[11px] mt-1">선글라스</span>
            <span className="text-[9px] text-yellow-400">80 💰</span>
          </div>

          <div className="bg-slate-700/60 p-2 rounded-xl border-2 border-slate-600 flex flex-col items-center justify-center text-center opacity-70">
            <span className="text-3xl">😇</span>
            <span className="text-[11px] mt-1">천사 링</span>
            <span className="text-[9px] text-yellow-400">500 💰</span>
          </div>

        </div>

        {/* 하단 한마디 */}
        <div className="bg-purple-900/80 p-2 text-center text-xs text-purple-200">
          🛀 정화소에서 씻으면 <b>캐릭터 청결도</b>가 올라갑니다!
        </div>
      </div>
    );
  }

  return null;
}
