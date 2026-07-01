"use client";

import { useEffect, useRef, useState } from "react";
import { signInWithGoogle } from "../lib/firebase";

// 공식 구글 "G" 로고 (4색)
function GoogleIcon({ size = 20 }) {
  return (
    <svg viewBox="0 0 48 48" width={size} height={size} aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24s.92 7.54 2.56 10.78l7.97-6.19z" />
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
    </svg>
  );
}

const BENEFITS = [
  { ic: "⚖️", text: "내 사연을 재판에 올리고 광장의 판결을 받기" },
  { ic: "🍅", text: "유죄에겐 토마토를, 억울함엔 응원을" },
  { ic: "☁️", text: "캐릭터·전적·재화가 클라우드에 자동 저장" },
];

export default function LoginModal({ open, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [error, setError] = useState("");
  const dialogRef = useRef(null);
  const prevFocusRef = useRef(null);

  // 리다이렉트 진행 중에는 페이지가 곧 이동하므로 로딩 유지하되 닫기는 허용
  const busy = loading && !redirecting;
  const requestClose = () => { if (!busy) onClose?.(); };

  // 열림 상태: 상태 초기화 + 바디 스크롤 잠금 + 포커스 관리(진입/트랩/복원)
  useEffect(() => {
    if (!open) return;
    setError("");
    setLoading(false);
    setRedirecting(false);
    document.body.style.overflow = "hidden";
    prevFocusRef.current = document.activeElement;

    // 다이얼로그 내부 첫 포커스 이동
    const focusFirst = () => {
      const node = dialogRef.current;
      if (!node) return;
      const focusable = node.querySelector("button, [href], input, [tabindex]:not([tabindex='-1'])");
      (focusable || node).focus();
    };
    const t = setTimeout(focusFirst, 0);

    const onKey = (e) => {
      if (e.key === "Escape") { requestClose(); return; }
      if (e.key !== "Tab") return;
      // 포커스 트랩: Tab이 다이얼로그 밖으로 나가지 않도록 순환
      const node = dialogRef.current;
      if (!node) return;
      const items = node.querySelectorAll(
        "button:not([disabled]), [href], input:not([disabled]), [tabindex]:not([tabindex='-1'])"
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    window.addEventListener("keydown", onKey);

    return () => {
      clearTimeout(t);
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      // 트리거 요소로 포커스 복원
      if (prevFocusRef.current && prevFocusRef.current.focus) prevFocusRef.current.focus();
    };
    // requestClose는 busy를 참조하지만, 잠금/포커스 로직은 open 기준으로만 재실행
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const handleGoogle = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await signInWithGoogle();
      if (result && result.user) {
        onSuccess?.(result.user);
        return;
      }
      if (result && result.redirecting) {
        // 팝업 차단 → 리다이렉트 방식으로 전환됨 (곧 페이지 이동)
        setRedirecting(true);
        return;
      }
      // 사용자가 취소했거나 로그인되지 않음 → 초기 상태로 복귀
      setLoading(false);
    } catch (e) {
      console.error("[Login] 실패:", e);
      setError("로그인에 실패했어요. 잠시 후 다시 시도해주세요.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="토마토광장 로그인"
    >
      {/* 배경 오버레이 */}
      <button
        aria-label="닫기"
        onClick={requestClose}
        className="absolute inset-0 bg-[#0b0b16]/80 backdrop-blur-md animate-fade-in cursor-default"
      />

      {/* 모달 카드 */}
      <div ref={dialogRef} className="relative w-full max-w-md animate-modal-pop">
        {/* 토마토 광채 */}
        <div className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 h-40 w-40 rounded-full bg-tomato/30 blur-3xl animate-glow" />

        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-[#20203a] to-[#15152a] p-8 shadow-[0_30px_80px_-20px_rgba(0,0,0,.8)]">
          {/* 상단 닫기 */}
          <button
            onClick={requestClose}
            aria-label="닫기"
            disabled={busy}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white disabled:opacity-30"
          >
            ✕
          </button>

          {/* 로고 */}
          <div className="mb-5 flex flex-col items-center text-center">
            <div className="mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-tomato-light to-tomato text-3xl shadow-lg shadow-tomato/40 animate-float-y">
              🍅
            </div>
            <h2 className="text-2xl font-black text-white">토마토광장 시작하기</h2>
            <p className="mt-1.5 text-sm text-white/55">
              좋아요 대신 토마토를 던지는 AI 여론재판
            </p>
          </div>

          {/* 혜택 */}
          <ul className="mb-6 space-y-2.5">
            {BENEFITS.map((b) => (
              <li
                key={b.text}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-3.5 py-2.5"
              >
                <span className="text-lg">{b.ic}</span>
                <span className="text-[13.5px] leading-snug text-white/80">{b.text}</span>
              </li>
            ))}
          </ul>

          {/* 구글 로그인 버튼 */}
          <button
            onClick={handleGoogle}
            disabled={loading}
            className="group relative flex w-full items-center justify-center gap-3 rounded-xl bg-white px-5 py-3.5 font-semibold text-[#3c4043] shadow-lg transition hover:shadow-xl hover:brightness-[0.99] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="h-5 w-5 animate-spin rounded-full border-[2.5px] border-[#4285f4]/30 border-t-[#4285f4]" />
                {redirecting ? "Google 페이지로 이동 중..." : "로그인 중..."}
              </>
            ) : (
              <>
                <GoogleIcon size={20} />
                Google 계정으로 계속하기
              </>
            )}
          </button>

          {error && (
            <p className="mt-3 rounded-lg bg-red-500/15 px-3 py-2 text-center text-[13px] text-red-300">
              ⚠️ {error}
            </p>
          )}

          <p className="mt-5 text-center text-[11.5px] leading-relaxed text-white/40">
            계속 진행하면 토마토광장의 서비스 이용에 동의하는 것으로 간주됩니다.
            <br />
            팝업이 차단되면 자동으로 안전한 로그인 페이지로 이동해요.
          </p>
        </div>
      </div>
    </div>
  );
}
