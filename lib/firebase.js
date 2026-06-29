// Firebase 초기화 및 인증 서비스
// 환경변수는 NEXT_PUBLIC_ 접두어가 있어야 클라이언트(브라우저)에서 노출됩니다.

import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut, onAuthStateChanged } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Next.js 개발 모드(HMR)에서 중복 초기화 방지
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics는 브라우저 환경에서만 지원되므로 비동기로 안전 로드
let analytics = null;
if (typeof window !== "undefined") {
  isSupported()
    .then((ok) => { if (ok) analytics = getAnalytics(app); })
    .catch(() => {});
}
export { analytics };

export const googleProvider = new GoogleAuthProvider();

// 구글 로그인 (팝업, 실패 시 리다이렉트 폴백)
import { signInWithRedirect, getRedirectResult } from "firebase/auth";

export async function signInWithGoogle() {
  try {
    return await signInWithPopup(auth, googleProvider);
  } catch (e) {
    console.warn("[Firebase] popup 실패, redirect 시도:", e.code, e.message);
    if (e.code === "auth/popup-blocked" || e.code === "auth/cancelled-popup-request" || e.code === "auth/popup-closed-by-user") {
      await signInWithRedirect(auth, googleProvider);
      return null;
    }
    throw e;
  }
}

export async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (e) {
    console.error("[Firebase] redirect 결과 처리 실패:", e);
    return null;
  }
}

// 로그아웃
export async function signOutUser() {
  return signOut(auth);
}

// 인증 상태 변화 리스너
export function subscribeAuth(cb) {
  return onAuthStateChanged(auth, cb);
}