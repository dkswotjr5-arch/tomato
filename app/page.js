"use client";

import { useEffect, useRef, useState } from "react";
import { signInWithGoogle, signOutUser, subscribeAuth, handleRedirectResult } from "../lib/firebase";
import { doc, getDoc, setDoc, collection, addDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { generateProsecutorArgs, generateLawyerArgs, generateJudgeIntro, generateVerdictComment, buildStoryRecord, generateRandomStory, generateCharge, analyzeChatContext, generateJuryChatContext } from "../lib/ai-arguments";

export default function TomatoSquare() {
  const initialized = useRef(false);
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    // 리다이렉트 로그인 결과 처리 (페이지 로드 시)
    handleRedirectResult().then((result) => {
      if (result && result.user) {
        console.log("[Firebase] redirect 로그인 성공:", result.user.uid);
      }
    });

    const unsub = subscribeAuth((u) => {
      setUser(u);
      setAuthReady(true);
      if (u) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("firebase-login", { detail: u }));
        }
      } else {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("firebase-logout"));
        }
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (authReady) {
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("firebase-auth-ready"));
      }
    }
  }, [authReady]);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    initGame();
    return () => { initialized.current = false; };
  }, []);

  return (
    <>
      <div id="login-screen" className="screen active">
        <div className="login-box">
          <h1>🍅 토마토광장</h1>
          <p className="sub">좋아요 대신 토마토를 던져라!</p>
          <button id="btn-login" className="btn-glogin"><span>G</span> Google 로그인</button>
          <div id="login-loading" style={{ display: "none", textAlign: "center", marginTop: "16px" }}>
            <div style={{ fontSize: "24px", animation: "spin 1s linear infinite", display: "inline-block" }}>⏳</div>
            <p style={{ fontSize: "14px", color: "#666", marginTop: "8px" }}>로그인 중... 잠시만 기다려주세요</p>
          </div>
          <p className="hint">* Google 계정으로 로그인하세요</p>
          <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>

      <div id="char-screen" className="screen">
        <div className="char-box">
          <h2>캐릭터 생성</h2>
          <canvas id="char-preview" width="120" height="160"></canvas>
          <div className="opts">
            <input id="char-name" placeholder="닉네임 입력" maxLength="8" />
            <div className="row"><span>머리</span>
              <div className="pick" id="pick-head">
                <button data-v="😊" className="on">😊</button>
                <button data-v="😎">😎</button>
                <button data-v="🤓">🤓</button>
                <button data-v="😤">😤</button>
                <button data-v="😈">😈</button>
              </div>
            </div>
            <div className="row"><span>옷색상</span>
              <div className="pick" id="pick-body">
                <button data-v="#3498db" className="on" style={{ background: "#3498db" }}></button>
                <button data-v="#e74c3c" style={{ background: "#e74c3c" }}></button>
                <button data-v="#27ae60" style={{ background: "#27ae60" }}></button>
                <button data-v="#9b59b6" style={{ background: "#9b59b6" }}></button>
                <button data-v="#f39c12" style={{ background: "#f39c12" }}></button>
              </div>
            </div>
          </div>
          <button id="btn-create" className="btn-main">시작하기</button>
        </div>
      </div>

      <div id="game-screen" className="screen active">
        <div id="hud" style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <div className="hud-left"><span id="hud-name" className="hud-name">-</span></div>
          <div className="hud-right">
            <span className="res">🍅<b id="hud-tom">10</b></span>
            <span className="res">🥚<b id="hud-egg">10</b></span>
            <span className="res">💧<b id="hud-holywater">0</b></span>
            <span className="res">💰<b id="hud-gold">0</b></span>
            <span className="res">🧼<b id="hud-clean">0</b></span>
            <span className="res">😇<b id="hud-personality">0</b></span>
            <span className="res">⚖️<b id="hud-justice">0</b></span>
            <span className="res" id="hud-tomato-timer" title="토마토 자동지급까지 남은 시간">🍅⏱<b id="tomato-timer-text">0:60</b></span>
            <span className="res" id="hud-gold-timer" title="금화 자동지급까지 남은 시간">💰⏱<b id="gold-timer-text">0:60</b></span>
            <button id="hud-shop" className="hud-ad-btn" title="장비창">🎒</button>
            <button id="hud-ad" className="hud-ad-btn" title="광고 시청">📺</button>
            <button id="hud-logout" className="hud-ad-btn" title="로그아웃">🚪</button>
          </div>
        </div>
        <canvas id="game-canvas"></canvas>
        <div id="dialog" style={{ display: "none" }}></div>
        <div id="mobile-ctrl">
          <div className="m-dpad">
            <span className="me"></span><button id="m-up" className="m-btn">▲</button><span className="me"></span>
            <button id="m-left" className="m-btn">◀</button><span className="me"></span><button id="m-right" className="m-btn">▶</button>
            <span className="me"></span><button id="m-down" className="m-btn">▼</button><span className="me"></span>
          </div>
          <div className="m-act-col">
            <button id="m-throw" className="m-btn ma">던지기</button>
            <button id="m-enter" className="m-btn ma">입장</button>
          </div>
        </div>
        <div id="toast"></div>
        <div id="court-info-overlay" style={{ position: "absolute", top: "100px", left: "50%", transform: "translateX(-50%)", zIndex: 5, pointerEvents: "none" }}></div>
        <div id="town-chat-box" className="town-chat-box">
          <input id="town-inp" placeholder="Enter: 채팅 모드" maxLength="50" />
          <button id="town-send">전송</button>
        </div>
      </div>

      <div id="court-screen" className="screen">
        <div className="court-left-panel" style={{ marginTop: "48px" }}>
          {/* #77: 상태창을 상단으로 이동 (더 보기 좋은 위치) */}
          <div className="court-status-box" style={{ marginBottom: "8px" }}>
            <div id="court-res-box" style={{ background: "rgba(0,0,0,0.05)", borderRadius: "8px", padding: "6px 10px", display: "flex", flexWrap: "wrap", gap: "4px 8px", fontSize: "13px", color: "#333", justifyContent: "center" }}>
              <span>🍅<b id="court-hud-tom">0</b></span>
              <span>🥚<b id="court-hud-egg">0</b></span>
              <span>💧<b id="court-hud-holywater">0</b></span>
              <span>💰<b id="court-hud-gold">0</b></span>
              <span>🧼<b id="court-hud-clean">0</b></span>
              <span>😇<b id="court-hud-personality">0</b></span>
              <span>⚖️<b id="court-hud-justice">0</b></span>
            </div>
          </div>
          <div id="court-opinion" style={{ background: "rgba(0,0,0,0.7)", padding: "6px 10px", borderRadius: "8px", marginBottom: "8px" }}></div>
          <div className="court-story-box">
            <div className="story-label">📜 사연</div>
            <div className="story-text" id="ct-story"></div>
            <div className="story-actions">
              <button id="ct-register" className="btn-register">사연 등록 (100💰)</button>
              <button id="ct-list-toggle" className="btn-register">📋 접수 목록</button>
            </div>
            <div id="ct-story-list" className="story-list" style={{ display: "none" }}></div>
          </div>
          <div className="ct-phase" id="ct-phase" style={{ marginBottom: "8px" }}>대기중...</div>
          <div className="ct-timer-box" style={{ marginBottom: "8px" }}><span>남은 시간</span><b id="ct-timer">0:20</b></div>
          <button id="ct-exit" className="btn-exit" style={{ width: "100%" }}>🚪 재판소 나가기</button>
        </div>
        <div className="court-main">
        <div className="court-canvas-wrap"><canvas id="court-canvas"></canvas></div>
        <div className="court-bottom-panel">
          <div className="ct-input-box">
            <input id="ct-inp" placeholder="의견 입력..." maxLength="50" />
            <button id="ct-send">전송</button>
          </div>
          <div id="ct-vote" className="ct-vote" style={{ display: "none" }}>
            <h3>🗳️ 투표</h3>
            <div className="vote-btns">
              <button id="vote-g" className="g-btn">🔨 유죄</button>
              <button id="vote-ng" className="ng-btn">✋ 무죄</button>
            </div>
            <div id="vote-msg"></div>
          </div>
          <div id="ct-verdict" className="ct-verdict" style={{ display: "none" }}>
            <div id="vr-result" className="vr"></div>
            <div id="vr-stats"></div>
            <div id="vr-throw-hint" style={{ textAlign: "center", fontSize: "13px", color: "#666", marginTop: "8px" }}></div>
          </div>
        </div>
        </div>
      </div>

      <div id="bath-screen" className="screen">
        <div className="bath-container">
          <h2>🚿 정화소</h2>
          <canvas id="bath-canvas" width="140" height="200"></canvas>
          <p>청결도: <b id="bath-clean">0</b></p>
          <p className="shop-info">코인: <b id="bath-coins">100</b> 💰</p>
          <div className="shop-grid" id="bath-grid"></div>
          <button id="bath-exit" className="btn-cancel">나가기</button>
        </div>
      </div>

      <div id="shop-screen" className="screen">
        <div className="sub-box">
          <h2>🏪 상점</h2>
          <p className="shop-info">금화: <b id="shop-coins">0</b> 💰</p>
          <div style={{ display: "flex", gap: "8px", marginBottom: "12px" }}>
            <button id="shop-tab-equip" style={{ flex: 1, padding: "8px", background: "#3498db", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>👕 장비</button>
            <button id="shop-tab-consume" style={{ flex: 1, padding: "8px", background: "#ecf0f1", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>🍅 소비</button>
          </div>
          <div className="shop-grid" id="shop-grid"></div>
          <button id="shop-exit" className="btn-cancel">나가기</button>
        </div>
      </div>

      <div id="ad-screen" className="screen">
        <div className="sub-box ad-box">
          <div className="ad-stage" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div className="ad-title">광고 시청 중...</div>
            <iframe id="ad-video-frame" style={{ width: "90%", maxWidth: "480px", height: "270px", border: "none", borderRadius: "8px", marginBottom: "12px", display: "none" }} allow="autoplay; encrypted-media" allowFullScreen></iframe>
            <div className="ad-bar"><div id="ad-fill" className="ad-fill"></div></div>
            <div className="ad-remain"><span id="ad-sec">3</span>초</div>
          </div>
          <button id="ad-exit" className="btn-cancel hide">나가기</button>
        </div>
      </div>
      <div id="confession-screen" className="screen">
        <div className="sub-box ad-box">
          <div className="ad-stage" style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
            <div className="ad-title">🙏 고해성사 중...</div>
            <iframe id="conf-video-frame" style={{ width: "90%", maxWidth: "480px", height: "270px", border: "none", borderRadius: "8px", marginBottom: "12px", display: "none" }} allow="autoplay; encrypted-media" allowFullScreen></iframe>
            <div className="ad-bar"><div id="conf-fill" className="ad-fill"></div></div>
            <div className="ad-remain"><span id="conf-sec">15</span>초</div>

          </div>
        </div>
      </div>
    </>
  );
}

function initGame() {
  "use strict";

  const SK = "tomato_square_v8";
  const def = () => ({
    name: "", head: "😊", body: "#3498db", eggs: 10, tomatoes: 10, coins: 100,
    gold: 0, cleanliness: 0, personality: 0, holywater: 0, justice: 0,
    equippedHead: "😊", equippedBody: "#3498db",
    stats: { courts: 0, votes: 0, stories: 0 }, items: [], registeredStories: [],
    x: 800, y: 600, loginTime: Date.now(), lastGoldHour: 0, lastTomatoMin: 0, lastGold10Min: 0,
  });
  let S = def();
  let fsSaveTimer = null;
  const save = () => {
    try { localStorage.setItem(SK, JSON.stringify(S)); } catch (e) {}
    // Firestore 저장은 쓰로틀 (1초에 1회)
    if (currentUser) {
      clearTimeout(fsSaveTimer);
      fsSaveTimer = setTimeout(() => { saveUserData(); }, 1000);
    }
  };

  const STORIES = [
    "아버지가 치매 초기 진단을 받았다. 운전을 계속하고 싶어 하지만 사고가 걱정된다. 면허를 반납하도록 설득해야 하는가?",
    "동생은 부모님을 거의 돌보지 않는다. 하지만 부모님은 재산 대부분을 동생에게 물려주려 한다. 개입해야 하는가?",
    "부모님이 평생 모은 돈을 내 결혼 자금으로 쓰려 한다. 하지만 그 돈은 부모님의 노후 자금이다. 받아야 하는가?",
    "애인이 과거에 바람을 피운 적이 있다는 사실을 우연히 알게 되었다. 그 일은 나를 만나기 전의 일이었다. 신뢰를 이유로 헤어져야 하는가?",
    "결혼을 앞두고 있는데 상대는 아이를 원하고 나는 원하지 않는다. 둘 다 서로를 사랑한다. 누가 양보해야 하는가?",
    "애인이 내 휴대폰을 몰래 봤다. 하지만 그 덕분에 내가 큰 사기를 당할 뻔한 사실을 막았다. 용서해야 하는가?",
    "친구가 면접에서 거짓말을 해서 합격했다. 회사에는 도움이 될 만한 능력은 충분히 갖고 있다. 회사에 알려야 하는가?",
    "친한 친구가 음주운전을 했다. 다행히 사고는 없었다. 신고해야 하는가?",
    "동료가 회사 규정을 어기고 업무를 처리한다. 덕분에 프로젝트는 항상 성공한다. 규정을 지키게 해야 하는가?",
    "상사는 매우 무능하지만 인간적으로는 좋은 사람이다. 그가 승진하면 회사는 손해를 볼 가능성이 높다. 솔직하게 평가해야 하는가?",
    "회사가 대규모 구조조정을 앞두고 있다. 나만 미리 정보를 알게 되었다. 친한 동료에게 알려줘야 하는가?",
    "길에서 현금 500만 원이 든 가방을 주웠다. 주인을 찾기 어렵다. 얼마 동안 찾아보고 포기해도 되는가?",
    "부모님의 병원비를 마련하기 위해 불법 다운로드로 돈을 벌 수 있는 일을 제안받았다. 해야 하는가?",
    "절도범이 훔친 돈은 자신의 아이 수술비였다. 처벌은 그대로 받아야 하는가?",
    "학교폭력 가해자가 진심으로 반성하며 봉사활동을 수년간 했다. 과거를 계속 공개해야 하는가?",
    "의사가 생존 가능성이 낮은 환자를 끝까지 치료해야 하는가, 아니면 다른 환자에게 의료 자원을 써야 하는가?",
    "응급실에 환자가 두 명 동시에 왔다. 한 명은 어린아이, 다른 한 명은 사회적으로 중요한 연구자다. 누구를 먼저 치료해야 하는가?",
    "AI가 사람보다 훨씬 정확하게 판결을 내린다. 최종 판결도 AI에게 맡겨야 하는가?",
    "AI가 만든 그림이 인간 화가보다 훨씬 인기 있다. AI 작품도 저작권을 가져야 하는가?",
    "유명인이 과거에 했던 문제 발언이 다시 퍼졌다. 현재는 완전히 다른 사람이 되었다. 광고 계약을 취소해야 하는가?",
    "친구가 우울증을 암시하는 글을 올렸다. 본인은 장난이라고 한다. 주변 사람들에게 알려야 하는가?",
    "시험 부정행위를 한 학생이 있다. 하지만 그 학생은 장기간 부모의 간병을 하느라 공부할 시간이 거의 없었다. 퇴학시켜야 하는가?",
    "노숙인이 공원 벤치에서 생활한다. 주민들은 불안해한다. 강제로 퇴거시켜야 하는가?",
    "범죄 예방을 위해 도시 전체에 얼굴 인식 CCTV를 설치하려 한다. 사생활 침해를 감수해야 하는가?",
    "부모가 종교적 이유로 아이의 수혈을 거부한다. 의사는 부모 의사를 존중해야 하는가?",
    "친구가 결혼을 앞두고 있다. 예비 배우자가 과거에 성매매를 했던 사실을 알게 되었다. 말해야 하는가?",
    "내가 만든 발명품을 경쟁 회사가 훨씬 더 잘 활용할 수 있다. 회사를 옮겨야 하는가?",
    "친구 결혼식과 부모님의 수술 날짜가 겹쳤다. 어디에 가야 하는가?",
    "오랜 꿈을 이루기 위해 해외로 떠나면 가족을 몇 년 동안 돌볼 수 없다. 꿈을 선택해야 하는가?",
    "반려견 치료비는 1,000만 원이다. 치료하면 성공 확률은 20%다. 치료를 계속해야 하는가?",
  ];
  const SHOP = [
    { id: "hj", name: "판사 가발", ic: "👨‍⚖️", price: 100, type: "head", value: "👨‍⚖️" },
    { id: "hj2", name: "배심원 모자", ic: "🎩", price: 50, type: "head", value: "🎩" },
    { id: "hd", name: "악마 모자", ic: "😈", price: 80, type: "head", value: "😈" },
    { id: "ha", name: "천사 모자", ic: "😇", price: 80, type: "head", value: "😇" },
    { id: "hr", name: "토끼 모자", ic: "🐰", price: 70, type: "head", value: "🐰" },
    { id: "sl", name: "변호사 정장", ic: "👔", price: 150, type: "body", value: "#2c3e50" },
    { id: "sr", name: "빨간 정장", ic: "🟥", price: 60, type: "body", value: "#e74c3c" },
    { id: "sg", name: "초록 정장", ic: "🟩", price: 60, type: "body", value: "#27ae60" },
    { id: "sfg", name: "황금 정장", ic: "🟨", price: 400, type: "body", value: "#f39c12" },
    { id: "ge", name: "황금 계란", ic: "✨", price: 200, type: "egg", value: "golden" },
    { id: "gt", name: "황금 토마토", ic: "🌟", price: 200, type: "tomato", value: "golden" },
  ];
  const CHATS = ["이건 좀 심각하네요...", "피해자에게 동정표", "제 경험상 유죄 같아요", "변호인 의견은?", "사정있을 수도...", "완전히 잘못했어요", "무죄입니다!"];

  const SCREENS = ["login-screen","char-screen","game-screen","court-screen","bath-screen","shop-screen","ad-screen","confession-screen"];
  function showScreen(id) {
    /* 화면 전환 시 발사체/이펙트/말풍선 비우기 (누적 방지, #68) */
    speechBubbles.length = 0;
    if (id !== "court-screen") { projs.length = 0; splat.length = 0; }
    SCREENS.forEach((s) => { const el = document.getElementById(s); if (el) el.classList.remove("active"); });
    const el = document.getElementById(id); if (el) el.classList.add("active");
    /* HUD 표시 제어: game-screen, court-screen에서만 표시 */
    const hud = document.getElementById("hud");
    if (hud) {
      if (id === "game-screen" || id === "court-screen") hud.style.display = "flex";
      else hud.style.display = "none";
    }
    /* 재판소 진입 시 HUD 강제 업데이트 */
    if (id === "court-screen") updateHUD();
  }

  let toastT = null;
  function toast(m, ms = 2200) {
    const e = document.getElementById("toast"); if (!e) return;
    e.textContent = m; e.classList.add("show"); clearTimeout(toastT);
    toastT = setTimeout(() => e.classList.remove("show"), ms);
  }

  function checkGoldReward() {
    const now = Date.now();
    /* #42: loginTime이 없으면 현재 시간으로 설정 */
    if (!S.loginTime || isNaN(S.loginTime)) { S.loginTime = now; S.lastTomatoMin = 0; S.lastGold10Min = 0; S.lastGoldHour = 0; }
    const elapsedHours = Math.floor((now - S.loginTime) / (1000 * 60 * 60));
    if (elapsedHours > S.lastGoldHour) {
      const hoursPassed = elapsedHours - S.lastGoldHour;
      S.gold += hoursPassed * 10; S.lastGoldHour = elapsedHours; save(); updateHUD();
      if (hoursPassed > 0) toast("접속 보상: +" + hoursPassed * 10 + "💰");
    }
    const elapsedSec = Math.floor((now - S.loginTime) / 1000);
    const elapsedMin = Math.floor(elapsedSec / 60);
    /* #42: 토마토 1분마다 10개 지급 */
    if (elapsedMin > (S.lastTomatoMin || 0)) {
      const minsPassed = elapsedMin - (S.lastTomatoMin || 0);
      if (minsPassed > 0) { S.tomatoes += minsPassed * 10; S.lastTomatoMin = elapsedMin; save(); updateHUD(); toast("🍅 접속 보상: +" + (minsPassed * 10) + "개"); }
    }
    /* #42: 금화: 1분당 10개 지급 (토마토 보상과 별개) */
    if (elapsedMin > (S.lastGold10Min || 0)) {
      const minsPassedG = elapsedMin - (S.lastGold10Min || 0);
      if (minsPassedG > 0) { S.gold += minsPassedG * 10; S.lastGold10Min = elapsedMin; save(); updateHUD(); toast("💰 접속 보상: +" + (minsPassedG * 10) + "💰"); }
    }
    // 타이머 표시 업데이트 (#42: 0:60 대신 0:59부터 표시)
    const tomatoSecsLeft = 60 - (elapsedSec % 60);
    const goldSecsLeft = 60 - (elapsedSec % 60);
    const tomatoEl = document.getElementById("tomato-timer-text");
    const goldEl = document.getElementById("gold-timer-text");
    if (tomatoEl) {
      const s = tomatoSecsLeft === 60 ? 59 : tomatoSecsLeft;
      tomatoEl.textContent = "0:" + String(s).padStart(2, "0");
    }
    if (goldEl) {
      const s = goldSecsLeft === 60 ? 59 : goldSecsLeft;
      goldEl.textContent = "0:" + String(s).padStart(2, "0");
    }
  }

  const speechBubbles = [];
  function addSpeechBubble(character, text, duration, small) {
    if (!duration) duration = 4000;
    /* #102: 배심원 말풍선은 더 짧게 제한 */
    if (small && text && text.length > 25) text = text.slice(0, 25) + "...";
    else if (!small && text && text.length > 40) text = text.slice(0, 40) + "...";
    speechBubbles.push({ character, text, createdAt: Date.now(), duration, small });
  }
  function updateSpeechBubbles() {
    const now = Date.now();
    for (let i = speechBubbles.length - 1; i >= 0; i--) {
      if (now - speechBubbles[i].createdAt > speechBubbles[i].duration) speechBubbles.splice(i, 1);
    }
  }
  function drawSpeechBubbles(ctx) {
    /* 같은 캐릭터의 말풍선은 최신 하나만 표시 (빠른 연속 입력 시 이전 말풍선 겹침 방지) */
    const seenChars = new Map();
    const bubblesToShow = [];
    for (let i = speechBubbles.length - 1; i >= 0; i--) {
      const b = speechBubbles[i];
      const key = b.character;
      if (!seenChars.has(key)) { seenChars.set(key, true); bubblesToShow.unshift(b); }
    }
    for (const bubble of bubblesToShow) {
      const ch = bubble.character; const r = ch.r || 18;
      const isSmall = bubble.small;
      let x = ch.x; let y = ch.y - r - (isSmall ? 38 : 50); const text = bubble.text;
      ctx.save();
      ctx.font = isSmall ? 'bold 11px "Malgun Gothic",sans-serif' : 'bold 14px "Malgun Gothic",sans-serif';
      const textW = ctx.measureText(text).width;
      const padX = isSmall ? 8 : 14; const padY = isSmall ? 5 : 8;
      const boxW = textW + padX * 2; const boxH = (isSmall ? 18 : 24) + padY * 2;
      /* 말풍선이 화면 위쪽으로 잘리는 경우 아래쪽으로 배치 */
      if (y < 2) { y = ch.y + r + 10; }
      /* 말풍선이 좌우로 잘리는 경우 클램핑 */
      x = Math.max(boxW / 2 + 2, Math.min((ctx.canvas.width || 9999) - boxW / 2 - 2, x));
      const tailX = x; const tailY = y + boxH;
      /* 꼬리 방향: 위쪽에 있으면 아래로, 아래쪽에 있으면 위로 */
      const tailDir = (y < ch.y) ? 1 : -1;
      ctx.fillStyle = "rgba(255,255,240,0.97)"; ctx.strokeStyle = "#222"; ctx.lineWidth = 2;
      ctx.beginPath();
      const bx = x - boxW / 2, by = y; const radius = 12;
      ctx.moveTo(bx + radius, by); ctx.lineTo(bx + boxW - radius, by);
      ctx.quadraticCurveTo(bx + boxW, by, bx + boxW, by + radius);
      ctx.lineTo(bx + boxW, by + boxH - radius);
      ctx.quadraticCurveTo(bx + boxW, by + boxH, bx + boxW - radius, by + boxH);
      if (tailDir > 0) {
        /* 꼬리가 아래쪽: 하단 경로를 따라 꼬리 그림 */
        ctx.lineTo(tailX + 7, by + boxH); ctx.lineTo(tailX, by + boxH + 12);
        ctx.lineTo(tailX - 7, by + boxH);
        ctx.lineTo(bx + radius, by + boxH);
        ctx.quadraticCurveTo(bx, by + boxH, bx, by + boxH - radius);
        ctx.lineTo(bx, by + radius); ctx.quadraticCurveTo(bx, by, bx + radius, by);
      } else {
        /* 꼬리가 위쪽: 하단 경로를 먼저 완성한 후 상단에서 꼬리 그림 */
        ctx.lineTo(bx + radius, by + boxH);
        ctx.quadraticCurveTo(bx, by + boxH, bx, by + boxH - radius);
        ctx.lineTo(bx, by + radius);
        /* 상단 경로에서 꼬리 그림 */
        ctx.quadraticCurveTo(bx, by, bx + radius, by);
        ctx.lineTo(tailX - 7, by); ctx.lineTo(tailX, by - 12);
        ctx.lineTo(tailX + 7, by);
        ctx.lineTo(bx + boxW - radius, by);
      }
      ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#111"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(text, x, y + boxH / 2); ctx.restore();
    }
  }

  const MAP_W = 1600, MAP_H = 1100;
  const BUILDINGS = [
    { id: "shop", label: "🏪 상점", x: 200, y: 180, w: 200, h: 160, color: "#2c3e50" },
    { id: "court", label: "⚖️ 재판소", x: 660, y: 140, w: 280, h: 200, color: "#8B4513" },
    { id: "bath", label: "🚿 정화소", x: 1220, y: 180, w: 200, h: 160, color: "#3498db" },
    { id: "confession", label: "⛪ 고해소", x: 970, y: 180, w: 180, h: 140, color: "#6a1b9a" },
  ];
  const DECOS = [
    { type: "fountain", x: 800, y: 620, r: 70 }, { type: "tree", x: 80, y: 420 },
    { type: "tree", x: 1520, y: 420 }, { type: "bench", x: 400, y: 720 },
    { type: "bench", x: 1200, y: 720 }, { type: "tree", x: 400, y: 920 },
    { type: "tree", x: 1200, y: 920 },
    /* 마을 꾸미기 추가 */
    { type: "lamp", x: 600, y: 450 }, { type: "lamp", x: 1000, y: 450 },
    { type: "lamp", x: 300, y: 650 }, { type: "lamp", x: 1300, y: 650 },
    { type: "flowerbed", x: 550, y: 680, w: 100, h: 40 },
    { type: "flowerbed", x: 1050, y: 680, w: 100, h: 40 },
    { type: "fence", x: 40, y: 360, w: 80, h: 8 }, { type: "fence", x: 40, y: 380, w: 8, h: 80 },
    { type: "fence", x: 1520, y: 360, w: 80, h: 8 }, { type: "fence", x: 1592, y: 380, w: 8, h: 80 },
    { type: "cart", x: 620, y: 780 }, { type: "cart", x: 980, y: 780 },
    { type: "well", x: 160, y: 580, r: 30 }, { type: "well", x: 1440, y: 580, r: 30 },
    { type: "bush", x: 250, y: 450 }, { type: "bush", x: 1350, y: 450 },
    { type: "bush", x: 700, y: 480 }, { type: "bush", x: 900, y: 480 },
    { type: "scarecrow", x: 800, y: 1000 },
    { type: "signpost", x: 480, y: 550 }, { type: "signpost", x: 1120, y: 550 },
  ];
  /* #84: 마을 NPC 주기적 말풍선 */
  const NPC_CHATS = {
    "김판사": ["오늘도 평화로운 하루네요", "재판소에 한번 가볼까?", "정의는 살아있다!", "토마토 좀 던지고 싶네", "요즘 사연이 흥미롭더군"],
    "박변호": ["법은 완벽하지 않지", "모두에게 변호사가 필요해", "정의를 위해!", "오늘도 좋은 하루", "사건 의뢰 받습니다"],
    "최배심": ["배심원의 의무란...", "판결은 쉽지 않아", "양쪽 다 들어봐야 해", "공정하게 판단하자", "증거가 중요하지"],
    "정이사": ["경영이 쉽지 않아", "주주들 압박이 심해", "성장이 최고지", "혁신이 필요해", "투자를 고민중이야"],
    "최토끼": ["당근 좋아!", "깡총깡총", "토끼가 세계를 지배한다", "오늘도 뛰뛰", "간식 시간이다!"],
  };
  const CITIZENS = [
    { x: 200, y: 620, head: "😎", body: "#e74c3c", name: "김판사", speed: 0.3, chatTimer: 0 },
    { x: 600, y: 720, head: "🤓", body: "#27ae60", name: "박변호", speed: 0.3, chatTimer: 0 },
    { x: 1000, y: 620, head: "😤", body: "#9b59b6", name: "최배심", speed: 0.3, chatTimer: 0 },
    { x: 1300, y: 800, head: "😇", body: "#f39c12", name: "정이사", speed: 0.3, chatTimer: 0 },
    { x: 900, y: 900, head: "🐰", body: "#e91e63", name: "최토끼", speed: 0.3, chatTimer: 0 },
  ];
  CITIZENS.forEach((c) => { c.tx = c.x; c.ty = c.y; c.waitTime = 0; c.nextChat = Date.now() + (10 + Math.random() * 20) * 1000; });

  /* 재판소 구조 */
  const COURT_W = 800, COURT_H = 500;
  /* 배심원석: 좌(빨강-유죄), 중앙(회색-중립), 우(파랑-무죄) */
  const JURY_LEFT = { x: 10, y: 380, w: 160, h: 100, color: "#c62828" };
  const JURY_CENTER = { x: 200, y: 400, w: 400, h: 90, color: "#5d4037" };
  const JURY_RIGHT = { x: 630, y: 380, w: 160, h: 100, color: "#1565c0" };
  const JURY_AREAS = [JURY_LEFT, JURY_CENTER, JURY_RIGHT];
  const DEFENDANT_SEAT = { x: 400, y: 280, r: 18 };
  const COURT_NPCS = [
    { x: 120, y: 165, r: 18, head: "🔍", body: "#c62828", name: "검사", speed: 0, vx: 0, range: [100, 140, 140, 160] },
    { x: 680, y: 165, r: 18, head: "🛡️", body: "#1565c0", name: "변호사", speed: 0, vx: 0, range: [660, 700, 140, 160] },
    { x: 400, y: 55, r: 22, head: "👑", body: "#d4af37", name: "대법관", speed: 0, vx: 0, range: [380, 420, 50, 70] },
    /* #83: 경호원 NPC - 판결 전 투척 제지 */
    { x: 340, y: 240, r: 16, head: "💂", body: "#37474f", name: "경호원1", speed: 0, vx: 0, range: [320, 360, 220, 260] },
    { x: 460, y: 240, r: 16, head: "💂", body: "#37474f", name: "경호원2", speed: 0, vx: 0, range: [440, 480, 220, 260] },
  ];
  /* 배심원 NPC (#71) - 유죄 배심원 3명, 무죄 배심원 3명 */
  const JURY_NPCS = [
    { x: 50, y: 410, r: 14, head: "😠", body: "#c62828", name: "강검사", side: "guilty", chatTimer: 0 },
    { x: 90, y: 440, r: 14, head: "😤", body: "#c62828", name: "엄판사", side: "guilty", chatTimer: 0 },
    { x: 130, y: 410, r: 14, head: "😡", body: "#c62828", name: "철검사", side: "guilty", chatTimer: 0 },
    { x: 670, y: 410, r: 14, head: "🥺", body: "#1565c0", name: "온변호", side: "notGuilty", chatTimer: 0 },
    { x: 710, y: 440, r: 14, head: "😇", body: "#1565c0", name: "인판사", side: "notGuilty", chatTimer: 0 },
    { x: 750, y: 410, r: 14, head: "🤗", body: "#1565c0", name: "자변호", side: "notGuilty", chatTimer: 0 },
  ];
  /* #93: 배심원 채팅 - 사연 맥락에 맞는 내용으로 변경 */
  function generateJuryChat(side, story) {
    return generateJuryChatContext(side, story);
  }
  const CP = { x: 400, y: 450, r: 16, speed: 3.5 };
  let defendantChar = null;

  /* 재판 단계 시스템 */
  /* phases: prep(20) -> intro(10) -> trial(60) -> vote(10) -> verdict(10) -> throw(10, if guilty) -> prep(20) -> ... */
  const PHASES = [
    { name: "prep", label: "재판 준비", duration: 20 },
    { name: "intro", label: "사연 소개", duration: 10 },
    { name: "trial", label: "재판 진행", duration: 60 },
    { name: "vote", label: "투표", duration: 10 },
    { name: "verdict", label: "판결", duration: 10 },
    { name: "throw", label: "투척", duration: 10 },
  ];
  let courtPhaseIdx = 0;
  let courtPhaseTimeLeft = 20;
  let courtTimer = null;
  let lastVerdictGuilty = false;
  let voteCount = { guilty: 0, notGuilty: 0 };

  const P = {
    x: S.x || 800, y: S.y || 600, r: 18, speed: 4.2, vx: 0, vy: 0,
    head: S.equippedHead || S.head, body: S.equippedBody || S.body,
    name: S.name || "", facingDir: 0, walkFrame: 0, hitLock: 0,
  };
  const projs = [], splat = [];
  const cam = { x: 0, y: 0 };
  const keys = { up: false, down: false, left: false, right: false };
  let throwKind = "tomato";
  const ct = { voted: false, story: "", verdictShown: false, storyTitle: "", lastCharge: null };
  let courtSession = { startTime: 0, itemsUsed: { tomato: 0, egg: 0, holywater: 0, gold: 0 }, justiceBefore: 0, personalityBefore: 0 };
  let trialSummary = { chatOpinions: { guilty: 0, notGuilty: 0 }, defendantHits: { tomato: 0, egg: 0, holywater: 0, gold: 0 } };
  let myVote = null;
  const citizenBlocked = (px, py, r) => BUILDINGS.some((b) => { const cx = Math.max(b.x, Math.min(px, b.x + b.w)); const cy = Math.max(b.y, Math.min(py, b.y + b.h)); return Math.hypot(px - cx, py - cy) < (r || 14); });
  /* #88: 분수 충돌 - 아무도 들어가지 못함 */
  const fountainBlocked = (px, py, r) => { for (const d of DECOS) { if (d.type === "fountain" && Math.hypot(px - d.x, py - d.y) < d.r + (r || 14)) return true; } return false; };

  function updateCourtOpinion() {
    const opinionEl = document.getElementById("court-opinion");
    if (!opinionEl) return;
    const phase = PHASES[courtPhaseIdx] || { name: "prep" };
    /* 투표 진행 중에는 현황 숨김 (완료 후에만 표시) */
    if (phase.name === "vote") {
      opinionEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;color:#ffd54f;">🗳️ 투표 진행 중... (결과는 투표 종료 후 공개됩니다)</div>';
      return;
    }
    /* prep 단계에서는 여론 대기 표시 */
    if (phase.name === "prep") {
      opinionEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;color:#aaa;">⏳ 재판 대기 중</div>';
      return;
    }
    /* verdict 단계에서는 판결 대기 표시 (투표 결과는 verdict 종료 후 공개) */
    if (phase.name === "verdict") {
      opinionEl.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;gap:6px;font-size:12px;color:#ffd54f;">⚖️ 판결 대기 중... (결과는 판결 후 공개됩니다)</div>';
      return;
    }
    /* #74: 여론은 재판 중 채팅을 기반으로 표시 (투표 결과가 아님) */
    const totalChat = trialSummary.chatOpinions.guilty + trialSummary.chatOpinions.notGuilty;
    const gPct = totalChat > 0 ? Math.round((trialSummary.chatOpinions.guilty / totalChat) * 100) : 50;
    const ngPct = totalChat > 0 ? Math.round((trialSummary.chatOpinions.notGuilty / totalChat) * 100) : 50;
    opinionEl.innerHTML = '<div style="display:flex;align-items:center;gap:4px;font-size:12px;">' +
      '<span style="color:#ff5252;">🔨 유죄 ' + trialSummary.chatOpinions.guilty + ' (' + gPct + '%)</span>' +
      '<div style="flex:1;height:12px;background:#333;border-radius:6px;overflow:hidden;display:flex;">' +
      '<div style="width:' + gPct + '%;background:#ff5252;transition:width 0.5s;"></div>' +
      '<div style="width:' + ngPct + '%;background:#448aff;transition:width 0.5s;"></div>' +
      '</div>' +
      '<span style="color:#448aff;">무죄 ' + trialSummary.chatOpinions.notGuilty + ' (' + ngPct + '%) ✋</span>' +
      '</div>';
  }

  function updateTown() {
    if (globalChatMode) { P.vx = 0; P.vy = 0; }
    else {
      let dx = 0, dy = 0;
      if (keys.left) dx -= 1; if (keys.right) dx += 1;
      if (keys.up) dy -= 1; if (keys.down) dy += 1;
      if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
      P.vx = dx * P.speed; P.vy = dy * P.speed;
      if (dx || dy) { P.facingDir = Math.atan2(dy, dx); P.walkFrame += 0.18; }
    }
    const blocked = (px, py) => BUILDINGS.some((b) => {
      const cx = Math.max(b.x, Math.min(px, b.x + b.w));
      const cy = Math.max(b.y, Math.min(py, b.y + b.h));
      return Math.hypot(px - cx, py - cy) < P.r;
    }) || fountainBlocked(px, py, P.r);
    const nx = P.x + P.vx, ny = P.y + P.vy;
    if (!blocked(nx, P.y)) P.x = nx;
    if (!blocked(P.x, ny)) P.y = ny;
    P.x = Math.max(P.r, Math.min(MAP_W - P.r, P.x));
    P.y = Math.max(P.r, Math.min(MAP_H - P.r, P.y));
    P.hitLock = Math.max(0, P.hitLock - 1);
    const gs = document.getElementById("game-screen");
    const cvW = gs ? gs.clientWidth : window.innerWidth;
    const cvH = gs ? gs.clientHeight - 48 : window.innerHeight - 48;
    cam.x = Math.max(0, Math.min(MAP_W - cvW, P.x - cvW / 2));
    cam.y = Math.max(0, Math.min(MAP_H - cvH, P.y - cvH / 2));
    S.x = P.x; S.y = P.y;
    for (const c of CITIZENS) {
      const d = Math.hypot(c.tx - c.x, c.ty - c.y);
      if (d < 3) {
        c.tx = c.x + (Math.random() - 0.5) * 300;
        c.ty = c.y + (Math.random() - 0.5) * 300;
        c.tx = Math.max(80, Math.min(MAP_W - 80, c.tx));
        c.ty = Math.max(200, Math.min(MAP_H - 80, c.ty));
        if (citizenBlocked(c.tx, c.ty, c.r || 14) || fountainBlocked(c.tx, c.ty, c.r || 14)) { c.tx = c.x; c.ty = c.y; }
      }
      const moveX = ((c.tx - c.x) / Math.max(1, d)) * c.speed;
      const moveY = ((c.ty - c.y) / Math.max(1, d)) * c.speed;
      if (!citizenBlocked(c.x + moveX, c.y, c.r || 14) && !fountainBlocked(c.x + moveX, c.y, c.r || 14)) c.x += moveX;
      if (!citizenBlocked(c.x, c.y + moveY, c.r || 14) && !fountainBlocked(c.x, c.y + moveY, c.r || 14)) c.y += moveY;
      if (c.hitLock) c.hitLock--;
    }
    const now = Date.now();
    /* #84: NPC 주기적 말풍선 */
    for (const c of CITIZENS) {
      if (c.nextChat && now >= c.nextChat) {
        const chats = NPC_CHATS[c.name];
        if (chats) addSpeechBubble(c, chats[Math.floor(Math.random() * chats.length)], 4000);
        c.nextChat = now + (15 + Math.random() * 20) * 1000;
      }
    }
    for (let i = projs.length - 1; i >= 0; i--) {
      const p = projs[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--;
      if (p.life <= 0) { splat.push({ x: p.x, y: p.y, emoji: "💥", t: 30 }); projs.splice(i, 1); continue; }
      for (const c of CITIZENS) {
        if (Math.hypot(p.x - c.x, p.y - c.y) < P.r + 8) {
          splat.push({ x: c.x, y: c.y + 10, emoji: p.emoji, t: 30 });
          c.hitLock = 20;
          if (p.kind === "tomato") { c.tomatoStain = Math.min(20, (c.tomatoStain || 0) + 1); c.lastStainTime = Date.now(); c.stainStageApplied = 0; playSound("splat"); splat.push({ x: c.x, y: c.y, emoji: "💥", t: 25 }); }
          else if (p.kind === "egg") { c.eggStain = Math.min(20, (c.eggStain || 0) + 1); c.lastStainTime = Date.now(); c.stainStageApplied = 0; playSound("splat_egg"); splat.push({ x: c.x, y: c.y, emoji: "💥", t: 25 }); }
          else if (p.kind === "holywater") {
            if ((c.tomatoStain || 0) > 0) c.tomatoStain--;
            if ((c.eggStain || 0) > 0) c.eggStain--;
            playSound("splash");
          }
          else if (p.kind === "gold") { playSound("coin"); playSound("sparkle"); }
          projs.splice(i, 1); break;
        }
      }
    }
    for (let i = splat.length - 1; i >= 0; i--) { splat[i].t--; if (splat[i].t <= 0) splat.splice(i, 1); }

    for (const c of CITIZENS) {
      if (c.lastStainTime && (c.tomatoStain > 0 || c.eggStain > 0)) {
        const stagesPassed = Math.floor((now - c.lastStainTime) / 60000);
        if (stagesPassed > (c.stainStageApplied || 0)) {
          if (c.tomatoStain > 0 && c.tomatoStain < 20) c.tomatoStain++;
          if (c.eggStain > 0 && c.eggStain < 20) c.eggStain++;
          c.stainStageApplied = stagesPassed;
        }
      }
    }

    for (const tv of tomatoVines) {
      if (!tv.droppedTomato && now >= tv.nextDrop) {
        tv.droppedTomato = { x: tv.x + (Math.random() - 0.5) * 60, y: tv.y + (Math.random() - 0.5) * 40, t: 600 };
      }
      if (tv.droppedTomato) {
        if (Math.hypot(P.x - tv.droppedTomato.x, P.y - tv.droppedTomato.y) < P.r + 15) {
          S.tomatoes++; updateHUD(); save(); toast("🍅 토마토 발견! +1"); playSound("coin");
          tv.droppedTomato = null; tv.nextDrop = now + (30 + Math.random() * 30) * 1000;
        }
      }
    }

    for (const ck of CHICKENS) {
      if (ck.resting) {
        ck.waitTime--;
        if (ck.waitTime <= 0) {
          ck.resting = false;
          let ntx = ck.x + (Math.random() - 0.5) * 300, nty = ck.y + (Math.random() - 0.5) * 300;
          ntx = Math.max(80, Math.min(MAP_W - 80, ntx)); nty = Math.max(200, Math.min(MAP_H - 80, nty));
          /* 닭이 건물 위로 올라가지 못하도록 */
          if (!citizenBlocked(ntx, nty, 14) && !fountainBlocked(ntx, nty, 14)) { ck.tx = ntx; ck.ty = nty; }
        }
      } else {
        const d = Math.hypot(ck.tx - ck.x, ck.ty - ck.y);
        if (d < 3) {
          if (Math.random() < 0.3) { ck.resting = true; ck.waitTime = 100 + Math.random() * 200; }
          else {
            let ntx = ck.x + (Math.random() - 0.5) * 300, nty = ck.y + (Math.random() - 0.5) * 300;
            ntx = Math.max(80, Math.min(MAP_W - 80, ntx)); nty = Math.max(200, Math.min(MAP_H - 80, nty));
            if (!citizenBlocked(ntx, nty, 14) && !fountainBlocked(ntx, nty, 14)) { ck.tx = ntx; ck.ty = nty; }
          }
        } else {
          const moveX = ((ck.tx - ck.x) / Math.max(1, d)) * ck.speed;
          const moveY = ((ck.ty - ck.y) / Math.max(1, d)) * ck.speed;
          if (!citizenBlocked(ck.x + moveX, ck.y, 14) && !fountainBlocked(ck.x + moveX, ck.y, 14)) ck.x += moveX;
          if (!citizenBlocked(ck.x, ck.y + moveY, 14) && !fountainBlocked(ck.x, ck.y + moveY, 14)) ck.y += moveY;
        }
      }
      /* #85: 닭/병아리 울음소리 말풍선 */
      if (ck.nextChat && now >= ck.nextChat) {
        const sounds = CHICKEN_SOUNDS[ck.head];
        if (sounds) addSpeechBubble(ck, sounds[Math.floor(Math.random() * sounds.length)], 3000);
        ck.nextChat = now + (8 + Math.random() * 15) * 1000;
      }
      if (ck.nextEgg > 0 && !ck.droppedEgg && now >= ck.nextEgg) { ck.droppedEgg = { x: ck.x + (Math.random() - 0.5) * 30, y: ck.y + 10, t: 600 }; }
      if (ck.droppedEgg) {
        /* 플레이어만 획득 가능, 시간제한 없이 지속됨 */
        if (Math.hypot(P.x - ck.droppedEgg.x, P.y - ck.droppedEgg.y) < P.r + 12) {
          S.eggs++; updateHUD(); save(); toast("🥚 계란 발견! +1"); playSound("coin");
          ck.droppedEgg = null; ck.nextEgg = now + (30 + Math.random() * 30) * 1000;
        }
      }
      /* 닭 울음소리 (30~60초 주기) */
      if (!ck.nextCluck) ck.nextCluck = now + (30 + Math.random() * 30) * 1000;
      if (now >= ck.nextCluck) {
        playSound("cluck");
        ck.nextCluck = now + (30 + Math.random() * 30) * 1000;
      }
    }

    const courtInfoEl = document.getElementById("court-info-overlay");
    if (courtInfoEl) {
      const phase = PHASES[courtPhaseIdx] || { label: "대기" };
      const storyShort = ct.story ? (ct.story.length > 30 ? ct.story.slice(0, 30) + "..." : ct.story) : "대기 중";
      let infoHtml = '<div style="background:rgba(0,0,0,.75);color:#fff;padding:8px 16px;border-radius:10px;font-size:13px;text-align:center;">' +
        '⚖️ <b>재판소</b> | ' + phase.label + ' | "' + storyShort + '"';
      if (phase.name === "prep") {
        infoHtml += '<br/><span style="color:#ffd54f;font-weight:bold;">🚪 재판 시작 ' + courtPhaseTimeLeft + '초 전! 지금 입장 가능</span>';
      } else {
        infoHtml += '<br/><span style="color:#aaa;font-size:11px;">입장은 준비 시간에만 가능</span>';
      }
      infoHtml += '</div>';
      courtInfoEl.innerHTML = infoHtml;
    }
    /* 여론 시각화 업데이트 (공용 함수 호출) */
    updateCourtOpinion();
    updateSpeechBubbles(); save();
  }

  function updateCourt() {
    if (!globalChatMode) {
      let dx = 0, dy = 0;
      if (keys.left) dx -= 1; if (keys.right) dx += 1;
      if (keys.up) dy -= 1; if (keys.down) dy += 1;
      if (dx && dy) { dx *= 0.7071; dy *= 0.7071; }
      const nx = CP.x + dx * CP.speed;
      const ny = CP.y + dy * CP.speed;
      /* 배심원석 영역 전체(하단)에서 자유 이동 가능 */
      const inJuryZone = (px, py) => px >= 60 && px <= 740 && py >= 370 && py <= 500;
      if (inJuryZone(nx, CP.y)) CP.x = nx;
      if (inJuryZone(CP.x, ny)) CP.y = ny;
      if (!inJuryZone(CP.x, CP.y)) { CP.x = 400; CP.y = 450; }
    }
    /* 배심원석 깜빡임 효과 감소 */
    if (guiltyFlash > 0) guiltyFlash--;
    if (notGuiltyFlash > 0) notGuiltyFlash--;
    /* 재판소 발사체 업데이트 */
    for (let i = projs.length - 1; i >= 0; i--) {
      const p = projs[i];
      p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.life--;
      if (p.life <= 0) { splat.push({ x: p.x, y: p.y, emoji: "💥", t: 30 }); projs.splice(i, 1); continue; }
      /* 피고인 충돌 체크 */
      if (p.courtTarget && defendantChar) {
        if (Math.hypot(p.x - defendantChar.x, p.y - defendantChar.y) < (defendantChar.r || 18) + 8) {
          splat.push({ x: defendantChar.x, y: defendantChar.y + 10, emoji: p.emoji, t: 30 });
          splat.push({ x: defendantChar.x, y: defendantChar.y, emoji: "💥", t: 25 });
          defendantChar.hitLock = 20;
          if (p.kind === "tomato") { defendantChar.tomatoStain = Math.min(20, (defendantChar.tomatoStain || 0) + 1); defendantChar.lastStainTime = Date.now(); defendantChar.stainStageApplied = 0; playSound("splat"); trialSummary.defendantHits.tomato++; }
          else if (p.kind === "egg") { defendantChar.eggStain = Math.min(20, (defendantChar.eggStain || 0) + 1); defendantChar.lastStainTime = Date.now(); defendantChar.stainStageApplied = 0; playSound("splat_egg"); trialSummary.defendantHits.egg++; }
          else if (p.kind === "holywater") { if ((defendantChar.tomatoStain || 0) > 0) defendantChar.tomatoStain--; if ((defendantChar.eggStain || 0) > 0) defendantChar.eggStain--; playSound("splash"); trialSummary.defendantHits.holywater++; }
          else if (p.kind === "gold") { playSound("coin"); playSound("sparkle"); trialSummary.defendantHits.gold++; }
          else if (p.kind === "flower") { playSound("sparkle"); /* 꽃 투척 - 효과만 시각적 */ }
          projs.splice(i, 1); continue;
        }
      }
    }
    /* splat 업데이트 */
    for (let i = splat.length - 1; i >= 0; i--) { splat[i].t--; if (splat[i].t <= 0) splat.splice(i, 1); }
    /* 여론 시각화 업데이트 (재판소 내에서도 갱신) */
    updateCourtOpinion();
    updateSpeechBubbles();
  }

  const cv = document.getElementById("game-canvas");
  const ctx = cv.getContext("2d");

  function resizeTownCanvas() {
    const gs = document.getElementById("game-screen"); if (!gs) return;
    const w = gs.clientWidth, h = gs.clientHeight - 48;
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
  }

  function renderTown() {
    resizeTownCanvas();
    const W = cv.width, H = cv.height;
    ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.translate(-cam.x, -cam.y);
    ctx.fillStyle = "#7EC850"; ctx.fillRect(-100, -100, MAP_W + 200, MAP_H + 200);
    ctx.fillStyle = "#D2B48C"; ctx.fillRect(0, MAP_H * 0.56 - 30, MAP_W, 90);
    for (const d of DECOS) {
      if (d.type === "fountain") {
        /* #87: 분수 형태 일그러짐 수정 - 단계별로 깔끔하게 그리기 */
        ctx.fillStyle = "#78909c"; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = "#546e7a"; ctx.lineWidth = 4; ctx.stroke();
        ctx.fillStyle = "#42a5f5"; ctx.beginPath(); ctx.arc(d.x, d.y, d.r - 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.25)"; ctx.beginPath(); ctx.arc(d.x - 12, d.y - 10, d.r - 20, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.15)"; ctx.beginPath(); ctx.arc(d.x + 10, d.y + 8, d.r - 25, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#90a4ae"; ctx.fillRect(d.x - 4, d.y - d.r + 10, 8, d.r - 15);
        ctx.fillStyle = "#64b5f6"; ctx.beginPath(); ctx.arc(d.x, d.y - d.r + 6, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(100,181,246,0.6)"; ctx.beginPath(); ctx.arc(d.x - 6, d.y - d.r + 2, 5, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(d.x + 6, d.y - d.r + 2, 5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.beginPath(); ctx.arc(d.x, d.y - d.r, 3, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(d.x - 8, d.y - d.r + 8, 2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(d.x + 8, d.y - d.r + 8, 2, 0, Math.PI * 2); ctx.fill();
      } else if (d.type === "tree") {
        ctx.fillStyle = "#5d4037"; ctx.fillRect(d.x - 5, d.y, 10, 20);
        ctx.fillStyle = "#2e7d32"; ctx.beginPath(); ctx.arc(d.x, d.y - 8, 20, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1b5e20"; ctx.beginPath(); ctx.arc(d.x - 8, d.y - 12, 12, 0, Math.PI * 2); ctx.fill();
      } else if (d.type === "bench") {
        ctx.fillStyle = "#6d4c41"; ctx.fillRect(d.x - 25, d.y - 6, 50, 14);
        ctx.fillStyle = "#8d6e63"; ctx.fillRect(d.x - 22, d.y - 10, 44, 6);
      } else if (d.type === "lamp") {
        ctx.fillStyle = "#37474f"; ctx.fillRect(d.x - 2, d.y - 30, 4, 35);
        ctx.fillStyle = "#ffeb3b"; ctx.beginPath(); ctx.arc(d.x, d.y - 32, 7, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,235,59,0.3)"; ctx.beginPath(); ctx.arc(d.x, d.y - 32, 14, 0, Math.PI * 2); ctx.fill();
      } else if (d.type === "flowerbed") {
        ctx.fillStyle = "#6d4c41"; ctx.fillRect(d.x, d.y, d.w, d.h);
        ctx.fillStyle = "#e91e63"; ctx.font = "14px sans-serif"; ctx.textAlign = "center";
        for (let fx = d.x + 10; fx < d.x + d.w; fx += 20) {
          ctx.fillText("🌸", fx, d.y + d.h / 2 + 5);
        }
      } else if (d.type === "fence") {
        ctx.fillStyle = "#8d6e63"; ctx.fillRect(d.x, d.y, d.w, d.h);
        for (let fx = d.x; fx < d.x + d.w; fx += 10) {
          ctx.fillStyle = "#6d4c41"; ctx.fillRect(fx, d.y - 4, 3, d.h + 8);
        }
      } else if (d.type === "cart") {
        ctx.fillStyle = "#8d6e63"; ctx.fillRect(d.x - 18, d.y - 12, 36, 24);
        ctx.fillStyle = "#5d4037"; ctx.beginPath(); ctx.arc(d.x - 10, d.y + 12, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(d.x + 10, d.y + 12, 6, 0, Math.PI * 2); ctx.fill();
        /* #82: 카트 이모지 대신 직접 그리기 */
        ctx.fillStyle = "#5d4037"; ctx.beginPath(); ctx.arc(d.x - 10, d.y + 12, 6, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(d.x + 10, d.y + 12, 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#8d6e63"; ctx.fillRect(d.x - 14, d.y - 4, 28, 12);
        ctx.fillStyle = "#a1887f"; ctx.fillRect(d.x - 12, d.y - 2, 24, 8);
      } else if (d.type === "well") {
        ctx.fillStyle = "#5d4037"; ctx.beginPath(); ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#37474f"; ctx.beginPath(); ctx.arc(d.x, d.y, d.r - 6, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#5d4037"; ctx.fillRect(d.x - 3, d.y - d.r - 12, 6, 14);
        ctx.fillStyle = "#8d6e63"; ctx.fillRect(d.x - 12, d.y - d.r - 14, 24, 4);
        /* 물 표면 (이모지 대신 직접 그리기, #70) */
        ctx.fillStyle = "#42a5f5"; ctx.beginPath(); ctx.arc(d.x, d.y, d.r - 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "rgba(255,255,255,0.3)"; ctx.beginPath(); ctx.arc(d.x - 4, d.y - 4, d.r - 14, 0, Math.PI * 2); ctx.fill();
      } else if (d.type === "bush") {
        ctx.fillStyle = "#2e7d32"; ctx.beginPath(); ctx.arc(d.x, d.y, 16, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1b5e20"; ctx.beginPath(); ctx.arc(d.x - 6, d.y - 4, 10, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(d.x + 6, d.y - 4, 10, 0, Math.PI * 2); ctx.fill();
      } else if (d.type === "scarecrow") {
        ctx.fillStyle = "#5d4037"; ctx.fillRect(d.x - 2, d.y - 30, 4, 40);
        ctx.fillStyle = "#8d6e63"; ctx.fillRect(d.x - 18, d.y - 18, 36, 5);
        ctx.fillStyle = "#ff9800"; ctx.beginPath(); ctx.arc(d.x, d.y - 32, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#333"; ctx.font = "10px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("• •", d.x, d.y - 32); ctx.fillText("___", d.x, d.y - 26);
        ctx.font = "16px sans-serif"; ctx.fillText("🌾", d.x, d.y + 14);
      } else if (d.type === "signpost") {
        ctx.fillStyle = "#5d4037"; ctx.fillRect(d.x - 2, d.y - 20, 4, 30);
        ctx.fillStyle = "#d4af37"; ctx.fillRect(d.x - 15, d.y - 18, 30, 12);
        ctx.fillStyle = "#333"; ctx.font = "bold 8px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("→", d.x, d.y - 9);
      }
    }
    for (const b of BUILDINGS) {
      ctx.fillStyle = "rgba(0,0,0,.15)"; ctx.fillRect(b.x + 6, b.y + 6, b.w, b.h);
      ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h);
      ctx.fillStyle = "rgba(255,255,255,.15)"; ctx.fillRect(b.x, b.y, b.w, 14);
      ctx.fillStyle = "#f7e0a0"; ctx.fillRect(b.x + b.w / 2 - 18, b.y + b.h - 50, 36, 50);
      ctx.fillStyle = "rgba(255,255,255,.95)"; ctx.fillRect(b.x + 20, b.y + b.h + 8, b.w - 40, 36);
      ctx.strokeStyle = "#555"; ctx.lineWidth = 1.5; ctx.strokeRect(b.x + 20, b.y + b.h + 8, b.w - 40, 36);
      ctx.fillStyle = "#222"; ctx.font = "bold 18px sans-serif"; ctx.textAlign = "center";
      ctx.fillText(b.label, b.x + b.w / 2, b.y + b.h + 34);
      if (Math.hypot(P.x - (b.x + b.w / 2), P.y - (b.y + b.h / 2 + 30)) < 150) {
        ctx.save();
        ctx.strokeStyle = "#ffd54f"; ctx.lineWidth = 3; ctx.setLineDash([8, 4]);
        ctx.strokeRect(b.x - 4, b.y - 4, b.w + 8, b.h + 8);
        ctx.fillStyle = "rgba(0,0,0,.7)"; ctx.fillRect(b.x + b.w / 2 - 70, b.y - 35, 140, 28);
        ctx.fillStyle = "#fff"; ctx.font = "bold 14px sans-serif"; ctx.textAlign = "center";
        ctx.fillText("E키 또는 입장 버튼", b.x + b.w / 2, b.y - 14);
        ctx.restore();
      }
    }
    /* 토마토 덩굴 렌더링 (여러 개) */
    for (const tv of tomatoVines) {
      ctx.fillStyle = "#2e7d32"; ctx.beginPath(); ctx.arc(tv.x, tv.y, 30, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#1b5e20"; ctx.beginPath(); ctx.arc(tv.x - 15, tv.y - 10, 18, 0, Math.PI * 2); ctx.fill();
      ctx.font = "20px sans-serif"; ctx.textAlign = "center"; ctx.fillText("🌿", tv.x, tv.y + 5);
      if (tv.droppedTomato) {
        ctx.font = "22px sans-serif"; ctx.fillText("🍅", tv.droppedTomato.x, tv.droppedTomato.y);
      }
    }
    /* 닭 가족 렌더링 */
    drawChars(ctx, CHICKENS);
    for (const ck of CHICKENS) {
      if (ck.droppedEgg) { ctx.font = "18px sans-serif"; ctx.fillText("🥚", ck.droppedEgg.x, ck.droppedEgg.y); }
    }
    drawChars(ctx, CITIZENS); drawChars(ctx, [P]); drawSpeechBubbles(ctx);
    ctx.restore();
    for (const p of projs) {
      const sx = p.x - cam.x, sy = p.y - cam.y;
      ctx.save(); ctx.translate(sx, sy); ctx.rotate(Math.atan2(p.vy, p.vx));
      ctx.font = "22px sans-serif"; ctx.textAlign = "center"; ctx.fillText(p.emoji, 0, 0);
      ctx.restore();
    }
    for (const s of splat) {
      const sx = s.x - cam.x, sy = s.y - cam.y;
      ctx.save(); ctx.globalAlpha = s.t / 30;
      ctx.font = "22px sans-serif"; ctx.textAlign = "center"; ctx.fillText(s.emoji, sx, sy);
      ctx.restore();
    }
  }

  function drawChars(c, list) {
    for (const ch of list) {
      const r = ch.r || 18;
      c.fillStyle = "rgba(0,0,0,.2)";
      c.beginPath(); c.ellipse(ch.x, ch.y + r, r * 0.9, r * 0.45, 0, 0, Math.PI * 2); c.fill();
      c.save(); c.translate(ch.x, ch.y);
      c.fillStyle = ch.body; c.beginPath(); c.arc(0, 4, r * 1.1, 0, Math.PI * 2); c.fill();
      /* 오염 오버레이 */
      const stain = getStainOverlay(ch);
      if (stain) { c.fillStyle = stain; c.beginPath(); c.arc(0, 4, r * 1.1, 0, Math.PI * 2); c.fill(); }
      c.beginPath(); c.arc(0, -r * 0.3, (r < 16 ? 12 : 15), 0, Math.PI * 2); c.fillStyle = "rgba(255,255,255,0.85)"; c.fill();
      c.font = (r < 16 ? "20px" : "26px") + " sans-serif"; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(ch.head || "😊", 0, -r * 0.3); c.textBaseline = "alphabetic";
      if ((ch.hitLock || 0) > 0 && (ch.hitLock % 4) < 2) {
        c.strokeStyle = "#ffeb3b"; c.lineWidth = 3;
        c.beginPath(); c.arc(0, 0, r * 1.5, 0, Math.PI * 2); c.stroke();
      }
      c.restore();
      if (ch.name) {
        const tw = Math.max(40, c.measureText(ch.name).width + 12);
        c.fillStyle = "rgba(0,0,0,.65)"; c.fillRect(ch.x - tw / 2, ch.y - r - 22, tw, 18);
        c.fillStyle = "#fff"; c.font = "bold 12px sans-serif"; c.textAlign = "center";
        c.fillText(ch.name, ch.x, ch.y - r - 9);
      }
    }
  }

  const ccv = document.getElementById("court-canvas");
  const cctx = ccv ? ccv.getContext("2d") : null;

  function resizeCourtCanvas() {
    if (!ccv) return; const wrap = ccv.parentElement; if (!wrap) return;
    const w = wrap.clientWidth, h = wrap.clientHeight;
    if (ccv.width !== w || ccv.height !== h) { ccv.width = w; ccv.height = h; }
  }

  function renderCourt() {
    if (!cctx) return;
    resizeCourtCanvas();
    const W = ccv.width, H = ccv.height;
    cctx.clearRect(0, 0, W, H);
    const scale = Math.min(W / COURT_W, H / COURT_H);
    const ox = (W - COURT_W * scale) / 2; const oy = (H - COURT_H * scale) / 2;
    cctx.save(); cctx.translate(ox, oy); cctx.scale(scale, scale);
    /* #94: 재판소 내부를 더 재판소답게 개선 */
    cctx.fillStyle = "#2a2a3a"; cctx.fillRect(0, 0, COURT_W, COURT_H);
    const ts = 40;
    for (let y = 0; y < COURT_H; y += ts)
      for (let x = 0; x < COURT_W; x += ts) {
        if ((Math.floor(x / ts) + Math.floor(y / ts)) % 2 === 0) { cctx.fillStyle = "#3a3a4a"; cctx.fillRect(x, y, ts, ts); }
        else { cctx.fillStyle = "#333344"; cctx.fillRect(x, y, ts, ts); }
      }
    /* 중앙 러너(양탄자) */
    cctx.fillStyle = "#8B0000"; cctx.fillRect(340, 0, 120, COURT_H);
    cctx.fillStyle = "#a01515"; cctx.fillRect(350, 0, 100, COURT_H);
    cctx.fillStyle = "rgba(255,215,0,0.15)"; cctx.fillRect(355, 0, 90, COURT_H);
    /* 양쪽 기둥 */
    cctx.fillStyle = "#5d4037"; cctx.fillRect(20, 0, 20, COURT_H); cctx.fillRect(760, 0, 20, COURT_H);
    cctx.fillStyle = "#4e342e"; cctx.fillRect(22, 0, 16, COURT_H); cctx.fillRect(762, 0, 16, COURT_H);
    cctx.fillStyle = "#d4af37"; cctx.fillRect(18, 0, 24, 8); cctx.fillRect(758, 0, 24, 8);
    /* 천장 장식 (상단 테두리) */
    cctx.fillStyle = "#d4af37"; cctx.fillRect(0, 0, COURT_W, 6);
    cctx.fillStyle = "#b8860b"; cctx.fillRect(0, 6, COURT_W, 3);
    /* 재판소 문양 (상단 중앙) */
    cctx.font = "28px sans-serif"; cctx.textAlign = "center";
    cctx.fillText("⚖️", 400, 18);
    /* 검사석 (좌측) - 나무 테두리 추가 */
    cctx.fillStyle = "#5d4037"; cctx.fillRect(36, 96, 168, 88);
    cctx.fillStyle = "#c62828"; cctx.fillRect(40, 100, 160, 80);
    cctx.fillStyle = "rgba(255,255,255,0.1)"; cctx.fillRect(40, 100, 160, 12);
    cctx.fillStyle = "#fff"; cctx.font = "bold 11px sans-serif"; cctx.textAlign = "center";
    cctx.fillText("🔍 검사석", 120, 115);
    /* 변호사석 (우측) - 나무 테두리 추가 */
    cctx.fillStyle = "#5d4037"; cctx.fillRect(596, 96, 168, 88);
    cctx.fillStyle = "#1565c0"; cctx.fillRect(600, 100, 160, 80);
    cctx.fillStyle = "rgba(255,255,255,0.1)"; cctx.fillRect(600, 100, 160, 12);
    cctx.fillStyle = "#fff"; cctx.fillText("🛡️ 변호사석", 680, 115);
    /* 대법관석 (상단 중앙) - 더 웅장하게 */
    cctx.fillStyle = "#5d4037"; cctx.fillRect(316, 16, 168, 68);
    cctx.fillStyle = "#d4af37"; cctx.fillRect(320, 20, 160, 60);
    cctx.fillStyle = "rgba(255,255,255,0.15)"; cctx.fillRect(320, 20, 160, 10);
    cctx.fillStyle = "#5d4037"; cctx.font = "bold 12px sans-serif";
    cctx.fillText("👑 대법관석", 400, 35);
    /* 피고인석 (중앙) - 나무 울타리 추가 */
    cctx.fillStyle = "#5d4037"; cctx.fillRect(336, 236, 128, 88);
    cctx.fillStyle = "#8B4513"; cctx.fillRect(340, 240, 120, 80);
    cctx.fillStyle = "rgba(255,255,255,0.08)"; cctx.fillRect(340, 240, 120, 10);
    cctx.fillStyle = "#ffeb3b"; cctx.font = "bold 13px sans-serif";
    cctx.fillText("⚖️ 피고인석", 400, 285);
    /* 배심원석 - 좌(빨강), 중앙(갈색), 우(파랑) */
    cctx.fillStyle = JURY_LEFT.color; cctx.fillRect(JURY_LEFT.x, JURY_LEFT.y, JURY_LEFT.w, JURY_LEFT.h);
    cctx.strokeStyle = "#ff5252"; cctx.lineWidth = 2; cctx.strokeRect(JURY_LEFT.x, JURY_LEFT.y, JURY_LEFT.w, JURY_LEFT.h);
    cctx.fillStyle = "#fff"; cctx.font = "bold 12px sans-serif"; cctx.textAlign = "center";
    cctx.fillText("유죄 배심원석", JURY_LEFT.x + JURY_LEFT.w / 2, JURY_LEFT.y + 15);
    cctx.fillStyle = JURY_CENTER.color; cctx.fillRect(JURY_CENTER.x, JURY_CENTER.y, JURY_CENTER.w, JURY_CENTER.h);
    cctx.strokeStyle = "#ffd54f"; cctx.strokeRect(JURY_CENTER.x, JURY_CENTER.y, JURY_CENTER.w, JURY_CENTER.h);
    cctx.fillStyle = "#fff"; cctx.fillText("중앙 배심원석", JURY_CENTER.x + JURY_CENTER.w / 2, JURY_CENTER.y + 15);
    cctx.fillStyle = JURY_RIGHT.color; cctx.fillRect(JURY_RIGHT.x, JURY_RIGHT.y, JURY_RIGHT.w, JURY_RIGHT.h);
    cctx.strokeStyle = "#448aff"; cctx.strokeRect(JURY_RIGHT.x, JURY_RIGHT.y, JURY_RIGHT.w, JURY_RIGHT.h);
    cctx.fillStyle = "#fff"; cctx.fillText("무죄 배심원석", JURY_RIGHT.x + JURY_RIGHT.w / 2, JURY_RIGHT.y + 15);
    /* 배심원 NPC 그리기 (#71) */
    for (const jn of JURY_NPCS) {
      drawChars(cctx, [jn]);
    }
    /* NPC 그리기 */
    for (const n of COURT_NPCS) {
      const r = n.r || 18;
      cctx.fillStyle = "rgba(0,0,0,.2)";
      cctx.beginPath(); cctx.ellipse(n.x, n.y + r, r * 0.9, r * 0.45, 0, 0, Math.PI * 2); cctx.fill();
      cctx.save(); cctx.translate(n.x, n.y);
      cctx.fillStyle = n.body; cctx.beginPath(); cctx.arc(0, 4, r * 1.1, 0, Math.PI * 2); cctx.fill();
      cctx.font = (r > 19 ? "30px" : "26px") + " sans-serif"; cctx.textAlign = "center"; cctx.fillText(n.head || "😊", 0, -r * 0.3);
      cctx.restore();
      if (n.name) {
        const tw = Math.max(40, cctx.measureText(n.name).width + 12);
        cctx.fillStyle = "rgba(0,0,0,.65)"; cctx.fillRect(n.x - tw / 2, n.y - r - 22, tw, 18);
        cctx.fillStyle = "#fff"; cctx.font = "bold 12px sans-serif"; cctx.textAlign = "center";
        cctx.fillText(n.name, n.x, n.y - r - 9);
      }
    }
    if (defendantChar) {
      drawChars(cctx, [defendantChar]);
      /* #80: 피고인 금화 표시 제거 */
    }
    drawChars(cctx, [CP]);
    drawSpeechBubbles(cctx);
    /* 재판소 발사체 렌더링 */
    for (const p of projs) {
      cctx.save(); cctx.translate(p.x, p.y); cctx.rotate(Math.atan2(p.vy, p.vx));
      cctx.font = "22px sans-serif"; cctx.textAlign = "center"; cctx.fillText(p.emoji, 0, 0);
      cctx.restore();
    }
    /* splat 렌더링 */
    for (const s of splat) {
      cctx.save(); cctx.globalAlpha = s.t / 30;
      cctx.font = "22px sans-serif"; cctx.textAlign = "center"; cctx.fillText(s.emoji, s.x, s.y);
      cctx.restore();
    }
    cctx.restore();
  }

  const CONFESSION_TEXTS = [
    "용서해주세요... 정말 미안합니다",
    "제가 너무 이기적이었어요",
    "다시는 그러지 않겠습니다",
    "반성하고 있습니다, 정말로요",
    "그때는 정신이 없었습니다...",
    "제 잘못을 인정합니다",
    "마음이 아픕니다, 진심으로",
    "기회를 주세요, 달라질게요",
  ];
  const tomatoVines = [
    { x: 150, y: 950, nextDrop: Date.now() + (30 + Math.random() * 30) * 1000, droppedTomato: null },
    { x: 1450, y: 950, nextDrop: Date.now() + (30 + Math.random() * 30) * 1000, droppedTomato: null },
    { x: 150, y: 250, nextDrop: Date.now() + (30 + Math.random() * 30) * 1000, droppedTomato: null },
    { x: 1450, y: 250, nextDrop: Date.now() + (30 + Math.random() * 30) * 1000, droppedTomato: null },
    { x: 800, y: 980, nextDrop: Date.now() + (30 + Math.random() * 30) * 1000, droppedTomato: null },
  ];
  const tomatoVine = tomatoVines[0];
  /* 닭 가족 */
  const CHICKENS = [
    { x: 500, y: 800, head: "🐔", name: "수탉", speed: 0.4, resting: false, nextEgg: Date.now() + (30 + Math.random() * 30) * 1000, droppedEgg: null },
    { x: 700, y: 850, head: "🐔", name: "암탉", speed: 0.35, resting: false, nextEgg: Date.now() + (30 + Math.random() * 30) * 1000, droppedEgg: null },
    { x: 600, y: 900, head: "🐤", name: "병아리1", speed: 0.5, resting: false, nextEgg: 0, droppedEgg: null },
    { x: 800, y: 820, head: "🐤", name: "병아리2", speed: 0.5, resting: false, nextEgg: 0, droppedEgg: null },
  ];
  CHICKENS.forEach((c) => { c.tx = c.x; c.ty = c.y; c.body = "#f39c12"; c.r = 14; c.waitTime = 0; c.nextChat = Date.now() + (8 + Math.random() * 15) * 1000; });
  /* #85: 닭/병아리 울음소리 말풍선 */
  const CHICKEN_SOUNDS = {
    "🐔": ["꼬꼬꼬!", "꽥꽥!", "꼬끼오!", "코코코코!", "꼬꼬!"],
    "🐤": ["삐약!", "짹짹!", "삐빽!", "쨱쨱!", "삐약삐약!"],
  };

  /* 오염 시스템 */
  function getStainOverlay(ch) {
    const t = ch.tomatoStain || 0;
    const e = ch.eggStain || 0;
    if (t <= 0 && e <= 0) return null;
    let r = 0, g = 0, b = 0, a = 0;
    if (t > 0) {
      if (t <= 10) { r = 200; g = 30; b = 30; a = t * 0.03; }
      else { r = 80; g = 10; b = 10; a = (t - 10) * 0.04 + 0.3; }
    }
    if (e > 0) {
      if (e <= 10) { r += 200; g += 180; b += 30; a = Math.max(a, e * 0.03); }
      else { r += 40; g += 60; b += 10; a = Math.max(a, (e - 10) * 0.04 + 0.3); }
    }
    return "rgba(" + Math.min(255, r) + "," + Math.min(255, g) + "," + Math.min(255, b) + "," + Math.min(0.7, a) + ")";
  }

  /* BGM 시스템 - Web Audio API로 각 장소별 BGM 생성 */
  let audioCtx = null;
  let currentBGM = null;
  let bgmGain = null;
  let bgmTimer = null;

  function initAudio() {
    if (audioCtx) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      bgmGain = audioCtx.createGain();
      bgmGain.gain.value = 0.15;
      bgmGain.connect(audioCtx.destination);
    } catch (e) { console.warn("Audio init failed:", e); }
  }

  function stopBGM() {
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
    currentBGM = null;
  }

  /* 효과음 시스템 */
  /* #43: 첫 사용자 상호작용 시 오디오 컨텍스트 활성화 */
  function ensureAudioReady() {
    if (!audioCtx) initAudio();
    if (audioCtx && audioCtx.state === "suspended") {
      try { audioCtx.resume(); } catch (e) {}
    }
  }
  document.addEventListener("click", ensureAudioReady, { once: false });
  document.addEventListener("touchstart", ensureAudioReady, { once: false });
  document.addEventListener("keydown", ensureAudioReady, { once: false });

  function playSound(type) {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    if (audioCtx.state === "suspended") { try { audioCtx.resume(); } catch (e) {} }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain); gain.connect(audioCtx.destination);
    const t = audioCtx.currentTime;
    if (type === "splat") {
      osc.type = "sine"; osc.frequency.setValueAtTime(200, t); osc.frequency.exponentialRampToValueAtTime(80, t + 0.15);
      gain.gain.setValueAtTime(0.4, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.2);
      osc.start(t); osc.stop(t + 0.2);
    } else if (type === "splat_egg") {
      osc.type = "square"; osc.frequency.setValueAtTime(300, t); osc.frequency.exponentialRampToValueAtTime(100, t + 0.1);
      gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
      osc.start(t); osc.stop(t + 0.15);
    } else if (type === "splash") {
      osc.type = "sine"; osc.frequency.setValueAtTime(400, t); osc.frequency.linearRampToValueAtTime(800, t + 0.1); osc.frequency.exponentialRampToValueAtTime(200, t + 0.3);
      gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      osc.start(t); osc.stop(t + 0.35);
    } else if (type === "coin") {
      osc.type = "triangle"; osc.frequency.setValueAtTime(800, t); osc.frequency.setValueAtTime(1200, t + 0.08);
      gain.gain.setValueAtTime(0.3, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.start(t); osc.stop(t + 0.25);
    } else if (type === "cluck") {
      osc.type = "sawtooth"; osc.frequency.setValueAtTime(500, t); osc.frequency.setValueAtTime(600, t + 0.05); osc.frequency.setValueAtTime(400, t + 0.1); osc.frequency.setValueAtTime(500, t + 0.15);
      gain.gain.setValueAtTime(0.15, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.start(t); osc.stop(t + 0.25);
    } else if (type === "sparkle") {
      osc.type = "sine"; osc.frequency.setValueAtTime(1200, t); osc.frequency.linearRampToValueAtTime(1800, t + 0.1); osc.frequency.exponentialRampToValueAtTime(800, t + 0.3);
      gain.gain.setValueAtTime(0.2, t); gain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);
      osc.start(t); osc.stop(t + 0.35);
    }
  }

  /* 마을 BGM: 밝고 경쾌한 멜로디 (C장조) */
  const TOWN_MELODY = [
    [523, 0.4], [587, 0.4], [659, 0.4], [698, 0.4], [784, 0.8], [659, 0.4], [523, 0.8],
    [587, 0.4], [659, 0.4], [587, 0.4], [523, 0.8], [0, 0.4], [523, 0.4], [659, 0.4], [784, 0.8],
  ];
  /* 재판소 BGM: 긴장감 있는 엄숙한 멜로디 (D단조) */
  const COURT_MELODY = [
    [294, 0.6], [349, 0.6], [392, 0.6], [466, 0.8], [392, 0.4], [349, 0.8], [294, 0.6],
    [330, 0.6], [349, 0.6], [392, 0.6], [466, 0.8], [392, 0.4], [294, 1.0], [0, 0.4],
  ];
  /* 상점 BGM: 활기차고 친근한 멜로디 (F장조) */
  const VOTE_MELODY = [
    [880, 0.15], [988, 0.15], [880, 0.15], [988, 0.15], [1047, 0.2], [988, 0.15], [880, 0.2],
    [784, 0.15], [880, 0.15], [784, 0.15], [880, 0.15], [988, 0.3], [0, 0.1],
  ];
  const SHOP_MELODY = [
    [349, 0.3], [392, 0.3], [440, 0.3], [523, 0.3], [440, 0.3], [392, 0.6], [349, 0.3],
    [392, 0.3], [440, 0.3], [523, 0.3], [587, 0.6], [523, 0.3], [440, 0.6], [0, 0.3],
  ];
  /* 정화소 BGM: 잔잔하고 편안한 멜로디 (A장조) */
  const BATH_MELODY = [
    [440, 0.8], [494, 0.8], [554, 1.0], [494, 0.4], [440, 1.0], [392, 0.8],
    [440, 0.8], [494, 0.8], [554, 0.8], [659, 1.0], [554, 0.4], [440, 1.2], [0, 0.4],
  ];

  function playBGM(melody, interval) {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    stopBGM();
    let idx = 0;
    currentBGM = melody;
    const playNote = () => {
      if (!currentBGM) return;
      const [freq, dur] = melody[idx % melody.length];
      if (freq > 0) {
        const osc = audioCtx.createOscillator();
        const noteGain = audioCtx.createGain();
        osc.type = "triangle";
        osc.frequency.value = freq;
        noteGain.gain.setValueAtTime(0, audioCtx.currentTime);
        noteGain.gain.linearRampToValueAtTime(0.3, audioCtx.currentTime + 0.05);
        noteGain.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
        osc.connect(noteGain); noteGain.connect(bgmGain);
        osc.start(); osc.stop(audioCtx.currentTime + dur);
      }
      idx++;
    };
    bgmTimer = setInterval(playNote, interval || 400);
    playNote();
  }

  function playBGMForScreen(screenId) {
    if (!audioCtx) initAudio();
    if (!audioCtx) return;
    if (screenId === "game-screen") playBGM(TOWN_MELODY);
    else if (screenId === "court-screen") playBGM(COURT_MELODY);
    else if (screenId === "shop-screen") playBGM(SHOP_MELODY);
    else if (screenId === "bath-screen") playBGM(BATH_MELODY);
    else stopBGM();
  }

  /* 기존 showScreen을 래핑하여 BGM 전환 */
  const _origShowScreen = showScreen;
  showScreen = function(id) {
    _origShowScreen(id);
    playBGMForScreen(id);
  };

  let rafId = null;
  function loop() {
    checkGoldReward();
    const gs = document.getElementById("game-screen");
    const cs = document.getElementById("court-screen");
    if (gs && gs.classList.contains("active")) { updateTown(); renderTown(); }
    if (cs && cs.classList.contains("active")) { updateCourt(); renderCourt(); }
    rafId = requestAnimationFrame(loop);
  }
  rafId = requestAnimationFrame(loop);

  const keyMap = { ArrowUp: "up", KeyW: "up", ArrowDown: "down", KeyS: "down", ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right" };
  let globalChatMode = false;

  function getActiveChatInput() {
    const cs = document.getElementById("court-screen"); const gs = document.getElementById("game-screen");
    if (cs && cs.classList.contains("active")) return document.getElementById("ct-inp");
    if (gs && gs.classList.contains("active")) return document.getElementById("town-inp");
    return null;
  }
  function getActiveScreen() {
    const cs = document.getElementById("court-screen"); const gs = document.getElementById("game-screen");
    if (cs && cs.classList.contains("active")) return "court";
    if (gs && gs.classList.contains("active")) return "town";
    return null;
  }

  const onKeyDown = (e) => {
    const ae = document.activeElement;
    if (ae && (ae.tagName === "INPUT" || ae.tagName === "TEXTAREA")) return;
    if (e.code === "Enter") {
      const activeScreen = getActiveScreen();
      if (activeScreen) { e.preventDefault(); toggleGlobalChatMode(); return; }
    }
    /* 재판소 심판 단계에서 1-4번 키는 채팅 모드와 무관하게 동작 */
    const cs2 = document.getElementById("court-screen");
    const inCourt = cs2 && cs2.classList.contains("active");
    if (inCourt) {
      /* 1-4번 키는 아이템 선택만 (투척은 마우스 클릭으로만, #75) */
      if (e.key === "1") { e.preventDefault(); throwKind = "tomato"; updateThrowStatus(); toast("🍅 토마토 선택 (클릭하여 투척)"); return; }
      if (e.key === "2") { e.preventDefault(); throwKind = "egg"; updateThrowStatus(); toast("🥚 계란 선택 (클릭하여 투척)"); return; }
      if (e.key === "3") { e.preventDefault(); throwKind = "holywater"; updateThrowStatus(); toast("💧 성수 선택 (클릭하여 투척)"); return; }
      if (e.key === "4") { e.preventDefault(); throwKind = "gold"; updateThrowStatus(); toast("💰 금화 선택 (클릭하여 투척)"); return; }
    }
    /* 마을에서 아이템 선택 */
    const gs2 = document.getElementById("game-screen");
    if (gs2 && gs2.classList.contains("active") && !globalChatMode) {
      if (e.key === "1") { throwKind = "tomato"; toast("🍅 토마토 선택"); }
      if (e.key === "2") { throwKind = "egg"; toast("🥚 계란 선택"); }
      if (e.key === "3") { throwKind = "holywater"; toast("💧 성수 선택"); }
      if (e.key === "4") { throwKind = "gold"; toast("💰 금화 선택"); }
    }
    if (globalChatMode) return;
    if (keyMap[e.code]) { e.preventDefault(); keys[keyMap[e.code]] = true; }
    if (e.code === "KeyE") { e.preventDefault(); interactAction(); }
    if (e.code === "Escape") { e.preventDefault(); goBack(); }
  };
  const onKeyUp = (e) => { if (keyMap[e.code]) { e.preventDefault(); keys[keyMap[e.code]] = false; } };
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);

  const mdPad = { "m-up": "up", "m-down": "down", "m-left": "left", "m-right": "right" };
  Object.entries(mdPad).forEach(([id, k]) => {
    const el = document.getElementById(id); if (!el) return;
    const d = () => (keys[k] = true), u = () => (keys[k] = false);
    el.addEventListener("mousedown", d); el.addEventListener("mouseup", u); el.addEventListener("mouseleave", u);
    el.addEventListener("touchstart", (e) => { e.preventDefault(); d(); }, { passive: false });
    el.addEventListener("touchend", (e) => { e.preventDefault(); u(); });
  });
  const mThrow = document.getElementById("m-throw");
  const mEnter = document.getElementById("m-enter");
  if (mThrow) mThrow.addEventListener("click", () => throwProj(throwKind));
  if (mEnter) mEnter.addEventListener("click", () => interactAction());
  cv.addEventListener("mousedown", (e) => {
    const gs = document.getElementById("game-screen");
    if (!gs || !gs.classList.contains("active")) return;
    const rect = cv.getBoundingClientRect();
    const mx = e.clientX - rect.left + cam.x; const my = e.clientY - rect.top + cam.y;
    for (const c of CITIZENS) { if (Math.hypot(mx - c.x, my - c.y) < P.r + 12) { throwProj(throwKind, c); return; } }
    /* #78: 클릭한 방향으로 투척 (가상 타겟 생성) */
    throwProj(throwKind, { x: mx, y: my });
  });

  /* 던지기 로직 */
  function throwProj(kind, target) {
    /* 투척 시 오디오 컨텍스트 활성화 보장 */
    ensureAudioReady();
    /* 재판소에서는 ctThrowAtDefendant 호출 */
    const cs0 = document.getElementById("court-screen");
    if (cs0 && cs0.classList.contains("active")) {
      ctThrowAtDefendant(kind); updateThrowStatus(); return;
    }
    const cs = document.getElementById("court-screen");
    const inCourt = cs && cs.classList.contains("active");
    const inThrowPhase = inCourt && courtPhaseIdx < PHASES.length && PHASES[courtPhaseIdx].name === "throw" && lastVerdictGuilty;

    if (kind === "holywater") {
      if (S.holywater <= 0) { toast("성수 부족"); return; }
      S.holywater--;
      S.personality = Math.min(9999, S.personality + 5);
      if (target) { target.hitLock = 20; }
      updateHUD(); save();
      const tx = target ? target.x : P.x + Math.cos(P.facingDir) * 200;
      const ty = target ? target.y : P.y + Math.sin(P.facingDir) * 200;
      const d = Math.max(1, Math.hypot(tx - P.x, ty - P.y)), sp = 10;
      projs.push({ x: P.x, y: P.y, vx: ((tx - P.x) / d) * sp, vy: ((ty - P.y) / d) * sp, life: 55, emoji: "💧", kind: "holywater" });
      toast("💧 성수 던짐! 인성 +5" + (target ? " (맞은 사람 청결도 +5)" : "")); return;
    }
    if (kind === "gold") {
      if (S.gold <= 0) { toast("금화 부족"); return; }
      S.gold--;
      if (target) { target.hitLock = 20; }
      updateHUD(); save();
      const tx = target ? target.x : P.x + Math.cos(P.facingDir) * 200;
      const ty = target ? target.y : P.y + Math.sin(P.facingDir) * 200;
      const d = Math.max(1, Math.hypot(tx - P.x, ty - P.y)), sp = 10;
      projs.push({ x: P.x, y: P.y, vx: ((tx - P.x) / d) * sp, vy: ((ty - P.y) / d) * sp, life: 55, emoji: "💰", kind: "gold" });
      toast("💰 금화 던짐! 금화 -1" + (target ? " (맞은 사람 금화 +1)" : "")); return;
    }
    const key = kind === "egg" ? "eggs" : "tomatoes";
    if (S[key] <= 0) { toast(kind === "egg" ? "계란 부족" : "토마토 부족"); return; }
    S[key]--;
    if (inThrowPhase) {
      const justiceDelta = kind === "tomato" ? 5 : 10;
      S.justice = Math.min(9999, S.justice + justiceDelta);
      toast(kind === "egg" ? "🥚 투척! 정의 +10" : "🍅 투척! 정의 +5");
    } else {
      if (target) { target.hitLock = 20; const personalityDelta = kind === "tomato" ? -5 : -10; S.personality = Math.max(-9999, S.personality + personalityDelta); toast(kind === "egg" ? "🥚 던짐! 인성 -10" : "🍅 던짐! 인성 -5"); } else { toast(kind === "egg" ? "🥚 던짐!" : "🍅 던짐!"); }
    }
    updateHUD(); save();
    const tx = target ? target.x : P.x + Math.cos(P.facingDir) * 200;
    const ty = target ? target.y : P.y + Math.sin(P.facingDir) * 200;
    const d = Math.max(1, Math.hypot(tx - P.x, ty - P.y)), sp = 10;
    const emoji = kind === "egg" ? "🥚" : "🍅";
    projs.push({ x: P.x, y: P.y, vx: ((tx - P.x) / d) * sp, vy: ((ty - P.y) / d) * sp, life: 55, emoji, kind });
    /* 마을 투척 시 효과음 재생 */
    if (kind === "tomato") playSound("splat");
    else if (kind === "egg") playSound("splat_egg");
    else if (kind === "holywater") playSound("splash");
    else if (kind === "gold") { playSound("coin"); playSound("sparkle"); }
  }

  function interactAction() {
    const gs = document.getElementById("game-screen");
    if (gs && gs.classList.contains("active")) {
      let best = null, bestD = 1e9;
      for (const b of BUILDINGS) {
        const d = Math.hypot(P.x - (b.x + b.w / 2), P.y - (b.y + b.h / 2 + 30));
        if (d < bestD && d < 170) { bestD = d; best = b; }
      }
      if (best) { enterBuilding(best.id); return; }
      toast("건물 근처로 이동해주세요");
    }
  }

  function goBack() {
    const cs = document.getElementById("court-screen"); const bs = document.getElementById("bath-screen");
    if (cs && cs.classList.contains("active")) { exitCourt(); }
    else if (bs && bs.classList.contains("active")) { exitBath(); }
    else { const cfs = document.getElementById("confession-screen"); if (cfs && cfs.classList.contains("active")) return; const ss = document.getElementById("shop-screen"); if (ss && ss.classList.contains("active")) showScreen("game-screen"); }
  }

  function enterBuilding(id) {
    if (id === "court") {
      /* 4번: 재판 준비 시간(prep 단계)에만 입장 가능 */
      const phase = PHASES[courtPhaseIdx];
      if (!phase || phase.name !== "prep") {
        /* 1번: 다음 입장 가능 시간까지 남은 총 시간 계산 */
        let totalWait = courtPhaseTimeLeft;
        for (let i = courtPhaseIdx + 1; i < PHASES.length; i++) {
          totalWait += PHASES[i].duration;
        }
        toast("재판 준비 시간에만 입장 가능합니다. (다음 입장까지 약 " + totalWait + "초)");
        return;
      }
      CP.x = 400; CP.y = 450; CP.head = P.head; CP.body = P.body; CP.name = P.name;
      courtSession = { startTime: Date.now(), itemsUsed: { tomato: 0, egg: 0, holywater: 0, gold: 0 }, justiceBefore: S.justice, personalityBefore: S.personality };
      showScreen("court-screen");
    }
    else if (id === "shop") { showScreen("shop-screen"); openShop(); }
    else if (id === "bath") { showScreen("bath-screen"); openBath(); }
    else if (id === "confession") { enterConfession(); }
  }
  /* 건물별 출구 위치 (각 건물 앞) */
  const EXIT_POS = {
    court: { x: 800, y: 400 },
    bath: { x: 1320, y: 420 },
    confession: { x: 1060, y: 420 },
    shop: { x: 300, y: 420 },
  };
  function exitCourt() {
    projs.length = 0; splat.length = 0;
    P.x = EXIT_POS.court.x; P.y = EXIT_POS.court.y;
    /* 재판소 참여 요약 모달 */
    const elapsed = Math.floor((Date.now() - (courtSession.startTime || Date.now())) / 1000);
    const mm = Math.floor(elapsed / 60), ss = elapsed % 60;
    const timeStr = mm + "분 " + ss + "초";
    const items = courtSession.itemsUsed || { tomato: 0, egg: 0, holywater: 0, gold: 0 };
    const totalItems = (items.tomato || 0) + (items.egg || 0) + (items.holywater || 0) + (items.gold || 0);
    const justiceGained = S.justice - (courtSession.justiceBefore || 0);
    const personalityGained = S.personality - (courtSession.personalityBefore || 0);
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;";
    const box = document.createElement("div");
    box.style.cssText = "background:#fff;color:#333;border-radius:16px;padding:24px;min-width:340px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,.3);text-align:center;";
    let itemHtml = "";
    if (items.tomato) itemHtml += '<span style="display:inline-block;margin:2px 4px;padding:4px 10px;background:#ffebee;border-radius:8px;">🍅 토마토 ' + items.tomato + '개</span>';
    if (items.egg) itemHtml += '<span style="display:inline-block;margin:2px 4px;padding:4px 10px;background:#fffde7;border-radius:8px;">🥚 계란 ' + items.egg + '개</span>';
    if (items.holywater) itemHtml += '<span style="display:inline-block;margin:2px 4px;padding:4px 10px;background:#e3f2fd;border-radius:8px;">💧 성수 ' + items.holywater + '개</span>';
    if (items.gold) itemHtml += '<span style="display:inline-block;margin:2px 4px;padding:4px 10px;background:#fff8e1;border-radius:8px;">💰 금화 ' + items.gold + '개</span>';
    if (!itemHtml) itemHtml = '<span style="color:#999;font-size:13px;">사용한 아이템 없음</span>';
    let statusHtml = "";
    if (justiceGained > 0) statusHtml += '<span style="display:inline-block;margin:2px 4px;padding:4px 10px;background:#e8f5e9;border-radius:8px;">⚖️ 정의 +' + justiceGained + '</span>';
    if (justiceGained < 0) statusHtml += '<span style="display:inline-block;margin:2px 4px;padding:4px 10px;background:#ffebee;border-radius:8px;">⚖️ 정의 ' + justiceGained + '</span>';
    if (personalityGained > 0) statusHtml += '<span style="display:inline-block;margin:2px 4px;padding:4px 10px;background:#f3e5f5;border-radius:8px;">😇 인성 +' + personalityGained + '</span>';
    if (personalityGained < 0) statusHtml += '<span style="display:inline-block;margin:2px 4px;padding:4px 10px;background:#ffebee;border-radius:8px;">😇 인성 ' + personalityGained + '</span>';
    if (!statusHtml) statusHtml = '<span style="color:#999;font-size:13px;">변동 없음</span>';
    box.innerHTML =
      '<div style="font-size:40px;margin-bottom:8px;">⚖️</div>' +
      '<h3 style="margin-bottom:12px;color:#8B4513;">재판소 참여 결과</h3>' +
      '<div style="margin-bottom:10px;padding:8px;border-bottom:1px solid #eee;">' +
        '<div style="font-size:13px;color:#888;margin-bottom:4px;">⏱️ 재판 참여 횟수 / 시간</div>' +
        '<div style="font-size:16px;font-weight:bold;color:#333;">총 ' + S.stats.courts + '회 참여 | 이번 참여 ' + timeStr + '</div>' +
      '</div>' +
      '<div style="margin-bottom:10px;padding:8px;border-bottom:1px solid #eee;">' +
        '<div style="font-size:13px;color:#888;margin-bottom:4px;">📦 사용한 아이템 (총 ' + totalItems + '개)</div>' +
        '<div style="font-size:14px;">' + itemHtml + '</div>' +
      '</div>' +
      '<div style="margin-bottom:16px;padding:8px;">' +
        '<div style="font-size:13px;color:#888;margin-bottom:4px;">📊 얻은 상태창</div>' +
        '<div style="font-size:14px;">' + statusHtml + '</div>' +
      '</div>' +
      '<button id="court-exit-ok" style="padding:10px 24px;border:none;border-radius:8px;background:#8B4513;color:#fff;font-weight:bold;cursor:pointer;width:100%;">확인</button>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.getElementById("court-exit-ok").addEventListener("click", () => {
      document.body.removeChild(overlay);
      showScreen("game-screen");
      toast("마을로 나왔습니다.");
    });
  }
  function exitBath() { P.x = EXIT_POS.bath.x; P.y = EXIT_POS.bath.y; showScreen("game-screen"); toast("마을로 나왔습니다."); }
  let confInt = null;
  function enterConfession() {
    /* 비동기 안내 UI (게임 시간 정지 안 함) */
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;";
    const box = document.createElement("div");
    box.style.cssText = "background:#fff;color:#333;border-radius:16px;padding:24px;min-width:320px;max-width:90vw;text-align:center;box-shadow:0 8px 32px rgba(0,0,0,.3);";
    box.innerHTML = '<div style="font-size:48px;margin-bottom:12px;">⛪</div>' +
      '<h3 style="margin-bottom:8px;color:#6a1b9a;">죄 많은 사람은 오라</h3>' +
      '<p style="color:#666;font-size:14px;margin-bottom:16px;line-height:1.6;">고해소 방문 시 15초의 고해성사가 진행됩니다.<br/>15초 후 인성과 청결도가 +50 회복되고 자동으로 나가집니다.<br/><small>(단, 인성과 청결도 회복은 0을 초과할 수 없습니다)</small></p>' +
      '<div style="display:flex;gap:8px;">' +
      '<button id="conf-cancel" style="flex:1;padding:10px;border:none;border-radius:8px;background:#eee;color:#666;font-weight:bold;cursor:pointer;">취소</button>' +
      '<button id="conf-ok" style="flex:1;padding:10px;border:none;border-radius:8px;background:#6a1b9a;color:#fff;font-weight:bold;cursor:pointer;">입장</button>' +
      '</div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    const closeOverlay = () => { document.body.removeChild(overlay); };
    document.getElementById("conf-cancel").addEventListener("click", closeOverlay);
    document.getElementById("conf-ok").addEventListener("click", () => {
      closeOverlay();
    /* 고해소 영상 광고 재생 (15초) */
    const confFrame = document.getElementById("conf-video-frame");
    if (confFrame) {
      const vidIds = ["dQw4w9WgXcQ", "9bZkp7q19f0", "kJQP7kiw5Fk", "OPf0YbXqDm0", "fJ9rUzIMcZQ"];
      const vid = vidIds[Math.floor(Math.random() * vidIds.length)];
      confFrame.src = "https://www.youtube.com/embed/" + vid + "?autoplay=1&rel=0";
      confFrame.style.display = "block";
    }
    showScreen("confession-screen");
    document.getElementById("conf-fill").style.width = "0%";
    const full = document.getElementById("conf-fill"), sec = document.getElementById("conf-sec");
    let elapsed = 0; const ms = 15000, step = 100;
    if (confInt) clearInterval(confInt);
    /* 1번: 고백 텍스트 랜덤 연출 */
    const confStage = document.querySelector("#confession-screen .ad-stage");
    let confTextEl = null;
    if (confStage) {
      confTextEl = document.createElement("div");
      /* #79: 멘트를 상단에 배치하여 시간 표시와 겹치지 않게 함 */
      confTextEl.style.cssText = "position:absolute;top:10px;left:10%;right:10%;text-align:center;font-size:0.9em;color:#6a1b9a;font-weight:bold;opacity:0;transition:opacity 1s ease-in-out;padding:4px 8px;background:rgba(255,255,255,0.95);border-radius:6px;z-index:1;max-width:80%;";
      confStage.style.position = "relative";
      confStage.appendChild(confTextEl);
    }
    const showConfText = () => {
      if (!confTextEl) return;
      const txt = CONFESSION_TEXTS[Math.floor(Math.random() * CONFESSION_TEXTS.length)];
      confTextEl.textContent = "🙏 " + txt;
      confTextEl.style.opacity = "0.9";
      setTimeout(() => { if (confTextEl) confTextEl.style.opacity = "0"; }, 2500);
    };
    showConfText();
    const confTextTimer = setInterval(showConfText, 3500);
    confInt = setInterval(() => {
      elapsed += step;
      full.style.width = Math.min(100, (elapsed / ms) * 100) + "%";
      sec.textContent = Math.max(0, Math.ceil((ms - elapsed) / 1000));
      if (elapsed >= ms) {
        clearInterval(confTextTimer);
        clearInterval(confInt); confInt = null;
        clearInterval(confTextTimer);
        if (confTextEl) confTextEl.remove();
        S.personality = Math.min(0, S.personality + 50);
        S.cleanliness = Math.min(0, S.cleanliness + 50);
        updateHUD(); save();
        const confF = document.getElementById("conf-video-frame");
        if (confF) { confF.src = ""; confF.style.display = "none"; }
        P.x = EXIT_POS.confession.x; P.y = EXIT_POS.confession.y;
        showScreen("game-screen"); toast("🙏 고해성사 완료! 인성 +50, 청결도 +50 회복");
      }
    }, step);
    });
  }

  function updateHUD() {
    const el = (id) => document.getElementById(id);
    if (el("hud-name")) el("hud-name").textContent = S.name || "-";
    if (el("hud-tom")) el("hud-tom").textContent = S.tomatoes;
    if (el("hud-egg")) el("hud-egg").textContent = S.eggs;
    if (el("hud-holywater")) el("hud-holywater").textContent = S.holywater;
    if (el("hud-gold")) el("hud-gold").textContent = S.gold;
    if (el("hud-clean")) el("hud-clean").textContent = S.cleanliness;
    if (el("hud-personality")) el("hud-personality").textContent = S.personality;
    if (el("hud-justice")) el("hud-justice").textContent = S.justice;
    /* 재판소 HUD 업데이트 */
    if (el("court-hud-tom")) el("court-hud-tom").textContent = S.tomatoes;
    if (el("court-hud-egg")) el("court-hud-egg").textContent = S.eggs;
    if (el("court-hud-holywater")) el("court-hud-holywater").textContent = S.holywater;
    if (el("court-hud-gold")) el("court-hud-gold").textContent = S.gold;
    if (el("court-hud-clean")) el("court-hud-clean").textContent = S.cleanliness;
    if (el("court-hud-personality")) el("court-hud-personality").textContent = S.personality;
    if (el("court-hud-justice")) el("court-hud-justice").textContent = S.justice;
  }

  let currentUser = null;

  // Firestore에서 유저 데이터 로드 (없으면 신규 생성)
  async function loadUserData(uid) {
    try {
      const ref = doc(db, "users", uid);
      const snap = await getDoc(ref);
      if (snap.exists()) {
        const data = snap.data();
        // 로컬 S에 파이어스토어 데이터 병합
        const merged = { ...def(), ...data, loginTime: Date.now(), lastGoldHour: 0, lastTomatoMin: 0, lastGold10Min: 0 };
        S = merged;
        localStorage.setItem(SK, JSON.stringify(S));
        return true;
      } else {
        // 신규 유저: 기본값으로 문서 생성
        await setDoc(ref, { ...def(), uid });
        return false;
      }
    } catch (e) {
      console.warn("Firestore 로드 실패, 로컬 사용:", e);
      return false;
    }
  }

  // Firestore에 유저 데이터 저장
  async function saveUserData() {
    if (!currentUser) return;
    try {
      const ref = doc(db, "users", currentUser.uid);
      await setDoc(ref, { ...S, uid: currentUser.uid }, { merge: true });
    } catch (e) {
      console.warn("Firestore 저장 실패:", e);
    }
  }

  // 로딩 표시/숨김 헬퍼
  function showLoginLoading(msg) {
    const el = document.getElementById("login-loading");
    if (!el) return;
    el.style.display = "block";
    const p = el.querySelector("p");
    if (p && msg) p.textContent = msg;
    const btn = document.getElementById("btn-login");
    if (btn) btn.disabled = true;
  }
  function hideLoginLoading() {
    const el = document.getElementById("login-loading");
    if (el) el.style.display = "none";
    const btn = document.getElementById("btn-login");
    if (btn) btn.disabled = false;
  }

  const btnLogin = document.getElementById("btn-login");
  if (btnLogin) btnLogin.addEventListener("click", async () => {
    showLoginLoading("Google 로그인 팝업을 여는 중...");
    try {
      console.log("[Firebase] signInWithPopup 시작...");
      const result = await signInWithGoogle();
      if (!result || !result.user) {
        showLoginLoading("Google 로그인 페이지로 이동 중...");
        return;
      }
      const u = result.user;
      console.log("[Firebase] 로그인 성공:", u.uid, u.email);
      currentUser = u;
      showLoginLoading(u.displayName + "님 데이터 로드 중...");
      const loaded = await loadUserData(u.uid);
      S.loginTime = Date.now(); S.lastGoldHour = 0; S.lastTomatoMin = 0; S.lastGold10Min = 0;
      save();
      hideLoginLoading();
      toast(u.displayName + "님 환영합니다!");
      if (S.name) {
        P.head = S.equippedHead || S.head; P.body = S.equippedBody || S.body;
        P.name = S.name; P.x = S.x || 800; P.y = S.y || 600;
        updateHUD(); showScreen("game-screen");
      } else {
        // 닉네임 자동 채움 (이메일@ 앞부분)
        const emailName = (u.email || "").split("@")[0].slice(0, 8);
        const nameInp = document.getElementById("char-name");
        if (nameInp) nameInp.value = emailName;
        drawCharPreview(); showScreen("char-screen");
      }
    } catch (e) {
      console.error("Google 로그인 실패:", e);
      hideLoginLoading();
      toast("Google 로그인 실패: " + (e.message || "알 수 없는 오류"));
    }
  });

  // 로그아웃 버튼
  const hudLogout = document.getElementById("hud-logout");
  if (hudLogout) hudLogout.addEventListener("click", async () => {
    try {
      await saveUserData();
      await signOutUser();
      currentUser = null;
      showScreen("login-screen");
      toast("로그아웃되었습니다.");
    } catch (e) {
      console.error("로그아웃 실패:", e);
      toast("로그아웃 실패");
    }
  });

  // 인증 상태 이벤트 수신 (외부 로그인/로그아웃 동기화)
  window.addEventListener("firebase-login", async (e) => {
    currentUser = e.detail;
    await loadUserData(currentUser.uid);
    save();
  });
  window.addEventListener("firebase-logout", () => {
    currentUser = null;
    showScreen("login-screen");
    toast("로그아웃되었습니다.");
  });

  function drawCharPreview() {
    const canvas = document.getElementById("char-preview"); if (!canvas) return;
    const c = canvas.getContext("2d");
    c.clearRect(0, 0, 120, 160); c.fillStyle = "#fafafa"; c.fillRect(0, 0, 120, 160);
    c.fillStyle = S.equippedBody || S.body; c.beginPath(); c.arc(60, 85, 28, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#ffd7b5"; c.beginPath(); c.arc(60, 48, 20, 0, Math.PI * 2); c.fill();
    c.font = "32px sans-serif"; c.textAlign = "center"; c.fillText(S.equippedHead || S.head, 60, 58);
  }

  function pickBtns(cid, fn) {
    document.querySelectorAll("#" + cid + " button").forEach((b) =>
      b.addEventListener("click", () => {
        document.querySelectorAll("#" + cid + " button").forEach((x) => x.classList.remove("on"));
        b.classList.add("on"); fn(b.dataset.v);
      })
    );
  }
  pickBtns("pick-head", (v) => { S.head = v; drawCharPreview(); });
  pickBtns("pick-body", (v) => { S.body = v; drawCharPreview(); });

  const btnCreate = document.getElementById("btn-create");
  if (btnCreate) btnCreate.addEventListener("click", () => {
    const n = document.getElementById("char-name").value.trim();
    if (!n) { toast("닉네임을 입력해주세요"); return; }
    S.name = n; S.equippedHead = S.head; S.equippedBody = S.body;
    S.loginTime = Date.now(); S.lastGoldHour = 0; S.lastTomatoMin = 0; S.lastGold10Min = 0;
    if (n === "마스터") { S.gold = 10000; toast("마스터 모드: 금화 10,000 지급!"); }
    P.head = S.head; P.body = S.body; P.name = n;
    save(); updateHUD(); showScreen("game-screen");
    toast(n + "님, 토마토광장입니다!");
  });

  let shopTab = "equip";
  const CONSUME_ITEMS = [
    { id: "buy-tomato", name: "토마토 5개", ic: "🍅", price: 5, desc: "토마토 +5" },
    { id: "buy-egg", name: "계란 5개", ic: "🥚", price: 5, desc: "계란 +5" },
    { id: "buy-tomato-20", name: "토마토 20개", ic: "🍅", price: 18, desc: "토마토 +20" },
    { id: "buy-egg-20", name: "계란 20개", ic: "🥚", price: 18, desc: "계란 +20" },
  ];

  function openShop() {
    const g = document.getElementById("shop-grid"); if (!g) return;
    g.innerHTML = "";
    document.getElementById("shop-coins").textContent = S.gold;
    const tabEquip = document.getElementById("shop-tab-equip");
    const tabConsume = document.getElementById("shop-tab-consume");
    if (tabEquip) { tabEquip.style.background = shopTab === "equip" ? "#3498db" : "#ecf0f1"; tabEquip.style.color = shopTab === "equip" ? "#fff" : "#333"; }
    if (tabConsume) { tabConsume.style.background = shopTab === "consume" ? "#3498db" : "#ecf0f1"; tabConsume.style.color = shopTab === "consume" ? "#fff" : "#333"; }

    if (shopTab === "equip") {
      SHOP.forEach((it) => {
        const d = document.createElement("div"); d.className = "si";
        const owned = S.items.includes(it.id);
        const equipped = (it.type === "head" && S.equippedHead === it.value) || (it.type === "body" && S.equippedBody === it.value);
        if (equipped) d.classList.add("equipped");
        let html;
        if (equipped) html = '<div class="eq">착용중</div>';
        else if (owned) html = '<div class="ow">보유중</div>';
        else html = '<div class="pr">' + it.price + " 💰</div>";
        d.innerHTML = '<div class="ic">' + it.ic + '</div><div class="nm">' + it.name + "</div>" + html;
        d.addEventListener("click", () => {
          if (!owned) {
            if (S.gold < it.price) { toast("금화 부족"); return; }
            S.gold -= it.price; S.items.push(it.id);
            if (it.type === "head") { S.equippedHead = it.value; P.head = it.value; }
            if (it.type === "body") { S.equippedBody = it.value; P.body = it.value; }
            updateHUD(); save(); toast(it.name + " 장착!"); openShop();
          } else {
            if (it.type === "head") { S.equippedHead = it.value; P.head = it.value; }
            if (it.type === "body") { S.equippedBody = it.value; P.body = it.value; }
            save(); toast(it.name + " 착용!"); openShop();
          }
        });
        g.appendChild(d);
      });
    } else {
      CONSUME_ITEMS.forEach((it) => {
        const d = document.createElement("div"); d.className = "si";
        d.innerHTML = '<div class="ic">' + it.ic + '</div><div class="nm">' + it.name + "</div>" +
          '<div class="pr">' + it.price + ' 💰</div>' +
          '<div class="desc" style="font-size:.75em;color:#888;margin-top:2px">' + it.desc + "</div>";
        d.addEventListener("click", () => {
          if (S.gold < it.price) { toast("금화 부족"); return; }
          S.gold -= it.price;
          if (it.id === "buy-tomato") S.tomatoes += 5;
          else if (it.id === "buy-egg") S.eggs += 5;
          else if (it.id === "buy-tomato-20") S.tomatoes += 20;
          else if (it.id === "buy-egg-20") S.eggs += 20;
          else if (it.id === "buy-holywater") S.holywater += 1;
          updateHUD(); save(); openShop();
          playSound("coin");
          toast(it.name + " 구매 완료!");
        });
        g.appendChild(d);
      });
    }
  }
  const tabEquipBtn = document.getElementById("shop-tab-equip");
  const tabConsumeBtn = document.getElementById("shop-tab-consume");
  if (tabEquipBtn) tabEquipBtn.addEventListener("click", () => { shopTab = "equip"; openShop(); });
  if (tabConsumeBtn) tabConsumeBtn.addEventListener("click", () => { shopTab = "consume"; openShop(); });
  const shopExit = document.getElementById("shop-exit");
  if (shopExit) shopExit.addEventListener("click", () => showScreen("game-screen"));

  function drawBathCanvas() {
    const c = document.getElementById("bath-canvas"); if (!c) return;
    const cx = c.getContext("2d");
    cx.clearRect(0, 0, 140, 200);
    cx.fillStyle = "#e0f7fa"; cx.fillRect(0, 0, 140, 200);
    cx.fillStyle = "#3949ab"; cx.beginPath(); cx.arc(70, 140, 45, 0, Math.PI * 2); cx.fill();
    cx.fillStyle = "#7986cb"; cx.beginPath(); cx.arc(70, 140, 33, 0, Math.PI * 2); cx.fill();
    cx.fillStyle = S.equippedBody || S.body; cx.beginPath(); cx.arc(70, 100, 24, 0, Math.PI * 2); cx.fill();
    cx.font = "28px sans-serif"; cx.textAlign = "center"; cx.fillText(S.equippedHead || S.head, 70, 75);
    if (S.cleanliness < 0) {
      const dirtAlpha = Math.min(0.7, Math.abs(S.cleanliness) / 100);
      cx.fillStyle = "rgba(120,70,20," + dirtAlpha + ")"; cx.fillRect(0, 0, 140, 200);
    }
  }
  const bathExit = document.getElementById("bath-exit");
  if (bathExit) bathExit.addEventListener("click", () => exitBath());

  /* 장비창 버튼 - 인벤토리 열기 */
  const hudShop = document.getElementById("hud-shop");
  if (hudShop) hudShop.addEventListener("click", () => {
    showScreen("shop-screen");
    openInventory();
  });

  function openInventory() {
    const g = document.getElementById("shop-grid"); if (!g) return;
    g.innerHTML = "";
    document.getElementById("shop-coins").textContent = S.gold;
    const tabEquip = document.getElementById("shop-tab-equip");
    const tabConsume = document.getElementById("shop-tab-consume");
    if (tabEquip) tabEquip.style.display = "none";
    if (tabConsume) tabConsume.style.display = "none";
    const ownedItems = SHOP.filter((it) => S.items.includes(it.id));
    if (ownedItems.length === 0) {
      g.innerHTML = '<div style="text-align:center;color:#888;padding:20px;">보유한 장비가 없습니다.<br>의류상점에서 구매하세요!</div>';
      return;
    }
    ownedItems.forEach((it) => {
      const d = document.createElement("div"); d.className = "si";
      const equipped = (it.type === "head" && S.equippedHead === it.value) || (it.type === "body" && S.equippedBody === it.value);
      if (equipped) d.classList.add("equipped");
      const html = equipped ? '<div class="eq">착용중 (클릭시 벗기)</div>' : '<div class="ow">착용하기</div>';
      d.innerHTML = '<div class="ic">' + it.ic + '</div><div class="nm">' + it.name + "</div>" + html;
      d.addEventListener("click", () => {
        if (equipped) {
          /* 장비 벗기 - 원래 모습으로 */
          if (it.type === "head") { S.equippedHead = S.head; P.head = S.head; }
          if (it.type === "body") { S.equippedBody = S.body; P.body = S.body; }
          save(); toast(it.name + " 벗음!"); openInventory();
        } else {
          if (it.type === "head") { S.equippedHead = it.value; P.head = it.value; }
          if (it.type === "body") { S.equippedBody = it.value; P.body = it.value; }
          save(); toast(it.name + " 착용!"); openInventory();
        }
      });
      g.appendChild(d);
    });
  }

  /* 실제 영상 광고 - YouTube embed (게임 내 재생) */
  const AD_VIDEO_IDS = [
    "dQw4w9WgXcQ",
    "9bZkp7q19f0",
    "kJQP7kiw5Fk",
    "OPf0YbXqDm0",
    "fJ9rUzIMcZQ",
  ];
  let adInt = null;
  function openAdLink(frameId) {
    const videoId = AD_VIDEO_IDS[Math.floor(Math.random() * AD_VIDEO_IDS.length)];
    const frame = document.getElementById(frameId);
    if (frame) {
      frame.src = "https://www.youtube.com/embed/" + videoId + "?autoplay=1&rel=0";
      frame.style.display = "block";
    }
  }
  function closeAdLink(frameId) {
    const frame = document.getElementById(frameId);
    if (frame) {
      frame.src = "";
      frame.style.display = "none";
    }
  }
  const hudAd = document.getElementById("hud-ad");
  if (hudAd) hudAd.addEventListener("click", () => {
    /* 광고 배너 표시 (5초) */
    showScreen("ad-screen");
    document.getElementById("ad-fill").style.width = "0%";
    /* 광고 배너 이미지 표시 */
    const adFrame = document.getElementById("ad-video-frame");
    if (adFrame) {
      const bannerIds = ["dQw4w9WgXcQ", "9bZkp7q19f0", "kJQP7kiw5Fk", "OPf0YbXqDm0", "fJ9rUzIMcZQ"];
      const vid = bannerIds[Math.floor(Math.random() * bannerIds.length)];
      adFrame.src = "https://www.youtube.com/embed/" + vid + "?autoplay=1&rel=0";
      adFrame.style.display = "block";
    }
    const full = document.getElementById("ad-fill"), sec = document.getElementById("ad-sec");
    let elapsed = 0; const ms = 5000, step = 100;
    if (adInt) clearInterval(adInt);
    adInt = setInterval(() => {
      elapsed += step;
      full.style.width = Math.min(100, (elapsed / ms) * 100) + "%";
      sec.textContent = Math.max(0, Math.ceil((ms - elapsed) / 1000));
      if (elapsed >= ms) {
        clearInterval(adInt); adInt = null;
        const adF = document.getElementById("ad-video-frame");
        if (adF) { adF.src = ""; adF.style.display = "none"; }
        S.gold += 10; updateHUD(); save();
        showScreen("game-screen"); toast("광고 완료! +10💰");
      }
    }, step);
  });

  /* ============================================================
     재판 단계 시스템
     prep(20s) -> intro(10s) -> trial(60s) -> vote(10s) -> verdict(10s) -> throw(10s if guilty) -> prep(20s) -> ...
     ============================================================ */
  function startCourtTimer() {
    if (courtTimer) return;
    courtPhaseIdx = 0;
    courtPhaseTimeLeft = PHASES[0].duration;
    updateCourtPhaseUI();
    courtTimer = setInterval(tickCourt, 1000);
  }

  function tickCourt() {
    courtPhaseTimeLeft--;
    const phase = PHASES[courtPhaseIdx];
    updateCtTimerDisplay(courtPhaseTimeLeft);

    const cs = document.getElementById("court-screen");
    const inCourt = cs && cs.classList.contains("active");

    /* 단계별 특수 이벤트 */
    if (phase.name === "trial" && courtPhaseTimeLeft === 60) {
      if (inCourt) toast("재판 시작! 배심원은 좌/우 배심원석으로 이동하세요.", 4000);
    }
    /* prep 단계에서 피고인 알림 (60초, 30초, 10초 전) */
    if (phase.name === "prep" && S.registeredStories && S.registeredStories.length > 0) {
      if (courtPhaseTimeLeft === 60 || courtPhaseTimeLeft === 30 || courtPhaseTimeLeft === 10) {
        toast("📢 사연 등록 피고인님, " + courtPhaseTimeLeft + "초 후 재판이 시작됩니다! 재판소로 입장해주세요.", 5000);
      }
    }
    /* prep 단계에서 대법관/검사/변호사가 채팅에 반응 (#62) */
    if (phase.name === "prep" && inCourt && courtPhaseTimeLeft === phase.duration - 1) {
      addSpeechBubble(COURT_NPCS[2], "곧 재판이 시작됩니다. 배심원 여러분 환영합니다.", 5000);
      setTimeout(() => addSpeechBubble(COURT_NPCS[0], "오늘의 사건을 엄중하게 다루겠습니다.", 4000), 2000);
      setTimeout(() => addSpeechBubble(COURT_NPCS[1], "피고인의 입장도 반드시 들어야 합니다.", 4000), 4000);
    }
    /* #71: trial 단계에서 배심원 NPC가 주기적으로 채팅 */
    /* #71/#90: trial 단계에서 배심원 NPC가 주기적으로 채팅 (여론에도 반영) */
    if (phase.name === "trial" && inCourt && courtPhaseTimeLeft % 8 === 0 && courtPhaseTimeLeft < phase.duration) {
      for (const jn of JURY_NPCS) {
        const chat = generateJuryChat(jn.side, ct.story);
        setTimeout(() => {
          addSpeechBubble(jn, chat, 3500, true);
          /* #90: 배심원 채팅도 여론에 반영 */
          if (jn.side === "guilty") { trialSummary.chatOpinions.guilty++; voteCount.guilty += 1; }
          else { trialSummary.chatOpinions.notGuilty++; voteCount.notGuilty += 1; }
        }, Math.random() * 2000);
      }
    }
    /* #72: throw 단계에서 유죄 배심원 NPC가 피고인에게 토마토 투척 */
    if (phase.name === "throw" && inCourt && lastVerdictGuilty && courtPhaseTimeLeft % 2 === 0 && courtPhaseTimeLeft < phase.duration) {
      for (const jn of JURY_NPCS) {
        if (jn.side === "guilty" && defendantChar) {
          const dx = defendantChar.x - jn.x;
          const dy = defendantChar.y - jn.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const sp = 8;
          projs.push({
            x: jn.x, y: jn.y,
            vx: (dx / dist) * sp, vy: (dy / dist) * sp,
            life: 55, emoji: "🍅", kind: "tomato", courtTarget: defendantChar,
          });
        }
      }
    }
    /* #73: 무죄 판결 시 무죄 배심원 NPC가 피고인에게 꽃 투척 */
    if (phase.name === "throw" && inCourt && !lastVerdictGuilty && courtPhaseTimeLeft % 2 === 0 && courtPhaseTimeLeft < phase.duration) {
      for (const jn of JURY_NPCS) {
        if (jn.side === "notGuilty" && defendantChar) {
          const dx = defendantChar.x - jn.x;
          const dy = defendantChar.y - jn.y;
          const dist = Math.max(1, Math.hypot(dx, dy));
          const sp = 8;
          projs.push({
            x: jn.x, y: jn.y,
            vx: (dx / dist) * sp, vy: (dy / dist) * sp,
            life: 55, emoji: "🌸", kind: "flower", courtTarget: defendantChar,
          });
        }
      }
    }
    /* 투표 단계 진입 시 투표 버튼 활성화 */
    if (phase.name === "vote" && courtPhaseTimeLeft === phase.duration - 1) {
      ct.voted = false;
      voteCount = { guilty: 0, notGuilty: 0 };
      if (inCourt) {
        const voteEl = document.getElementById("ct-vote");
        if (voteEl) voteEl.style.display = "block";
        ["vote-g", "vote-ng"].forEach((id) => { const btn = document.getElementById(id); if (btn) btn.disabled = false; });
        const phaseEl = document.getElementById("ct-phase"); if (phaseEl) phaseEl.textContent = "투표 중";
        toast("🗳️ 투표 시간! 유죄/무죄를 선택하세요.", 4000);
        if (audioCtx) playBGM(VOTE_MELODY, 200);
      }
    }

    if (courtPhaseTimeLeft <= 0) {
      advancePhase();
    }
  }

  async function advancePhase() {
    const currentPhase = PHASES[courtPhaseIdx];

    /* verdict 단계 종료 시 판결 (AI 판결 멘트 사용) */
    if (currentPhase.name === "verdict") {
      lastVerdictGuilty = voteCount.guilty >= voteCount.notGuilty;
      const cs = document.getElementById("court-screen");
      const inCourt = cs && cs.classList.contains("active");
      if (inCourt) {
        const vr = document.getElementById("vr-result");
        vr.textContent = lastVerdictGuilty ? "🔨 유죄" : "✋ 무죄";
        vr.className = "vr " + (lastVerdictGuilty ? "g" : "ng");
        document.getElementById("vr-stats").innerHTML =
          '<div class="vs"><label>유죄</label><b>' + voteCount.guilty + "표</b></div>" +
          '<div class="vs"><label>무죄</label><b>' + voteCount.notGuilty + "표</b></div>";
        document.getElementById("ct-verdict").style.display = "block";
        document.getElementById("ct-vote").style.display = "none";
        // AI 판결 멘트
        const verdictComment = generateVerdictComment(lastVerdictGuilty, voteCount.guilty, voteCount.notGuilty);
        toast(verdictComment, 4000);
        addSpeechBubble(COURT_NPCS[2], verdictComment, 5000);
        // 검사/변호사 판결 반응
        if (lastVerdictGuilty) {
          setTimeout(() => addSpeechBubble(COURT_NPCS[0], "정의는 언제나 승리하는 법...", 5000), 2000);
          setTimeout(() => addSpeechBubble(COURT_NPCS[1], "다음에는 반드시 무죄를...", 4000), 4000);
        } else {
          setTimeout(() => addSpeechBubble(COURT_NPCS[1], "진실은 반드시 드러나는 법...", 5000), 2000);
          setTimeout(() => addSpeechBubble(COURT_NPCS[0], "이건 아닌데...", 4000), 4000);
        }
      }
      S.stats.courts++; save();
      /* 재판 결과 요약 모달 (3초 후 표시) */
      if (inCourt) {
        setTimeout(() => {
          /* AI가 사연 내용과 채팅 여론을 분석하여 죄목 생성 (#69) */
          const charge = generateCharge(ct.story, trialSummary.chatOpinions);
          ct.lastCharge = lastVerdictGuilty ? charge : null;
          const dh = trialSummary.defendantHits;
          const totalHits = dh.tomato + dh.egg + dh.holywater + dh.gold;
          const opinionStr = "유죄 발언 " + trialSummary.chatOpinions.guilty + "건, 무죄 발언 " + trialSummary.chatOpinions.notGuilty + "건";
          let summaryHtml = '<div style="font-size:40px;margin-bottom:8px;">📜</div>' +
            '<h3 style="margin-bottom:16px;color:#8B4513;">⚖️ 재판 결과 요약</h3>' +
            '<div style="margin-bottom:12px;padding:10px;background:' + (lastVerdictGuilty ? "#ffebee" : "#e8f5e9") + ';border-radius:10px;text-align:center;">' +
              '<div style="font-size:1.8em;font-weight:bold;color:' + (lastVerdictGuilty ? "#c62828" : "#2e7d32") + ';">' + (lastVerdictGuilty ? "🔨 유죄" : "✋ 무죄") + '</div>' +
            '</div>' +
            '<div style="margin-bottom:12px;padding:10px;background:#f5f5f5;border-radius:8px;">' +
              '<div style="font-size:13px;color:#888;margin-bottom:4px;">📋 사유</div>' +
              '<div style="font-size:14px;color:#333;">' +
                '<div style="margin-bottom:4px;">💬 채팅 여론: ' + opinionStr + '</div>' +
                '<div>🗳️ 투표 결과: 유죄 ' + voteCount.guilty + '표 vs 무죄 ' + voteCount.notGuilty + '표</div>' +
              '</div>' +
            '</div>';
          if (lastVerdictGuilty) {
            summaryHtml += '<div style="margin-bottom:12px;padding:10px;background:#fff3e0;border-radius:8px;">' +
              '<div style="font-size:13px;color:#888;margin-bottom:4px;">🔨 죄목</div>' +
              '<div style="font-size:16px;font-weight:bold;color:#e65100;">' + charge + '</div>' +
            '</div>';
          }
          summaryHtml += '<div style="margin-bottom:16px;padding:10px;background:#f5f5f5;border-radius:8px;">' +
              '<div style="font-size:13px;color:#888;margin-bottom:4px;">🎯 피고인이 맞은 투척물 (총 ' + totalHits + '개)</div>' +
              '<div style="font-size:14px;display:flex;gap:8px;justify-content:center;flex-wrap:wrap;">' +
                '<span>🍅 ' + dh.tomato + '</span>' +
                '<span>🥚 ' + dh.egg + '</span>' +
                '<span>💧 ' + dh.holywater + '</span>' +
                '<span>💰 ' + dh.gold + '</span>' +
              '</div>' +
            '</div>' +
            '<button id="trial-summary-ok" style="padding:10px 24px;border:none;border-radius:8px;background:#8B4513;color:#fff;font-weight:bold;cursor:pointer;width:100%;">확인</button>';
          const sOverlay = document.createElement("div");
          sOverlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;";
          const sBox = document.createElement("div");
          sBox.style.cssText = "background:#fff;color:#333;border-radius:16px;padding:24px;min-width:340px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,.3);text-align:center;";
          sBox.innerHTML = summaryHtml;
          sOverlay.appendChild(sBox);
          document.body.appendChild(sOverlay);
          document.getElementById("trial-summary-ok").addEventListener("click", () => { document.body.removeChild(sOverlay); });
        }, 3000);
      }
      // 사연 학습 히스토리 Firestore 저장
      try {
        if (ct.story) {
          const record = buildStoryRecord(ct.story, lastVerdictGuilty, voteCount.guilty, voteCount.notGuilty);
          await addDoc(collection(db, "courtHistory"), record);
        }
      } catch (e) { console.warn("재판 히스토리 저장 실패:", e); }
    }

    /* throw 단계 종료 시 다음 재판 준비 */
    if (currentPhase.name === "throw") {
      document.getElementById("ct-verdict").style.display = "none";
    }

    /* 다음 단계로 이동 */
    courtPhaseIdx++;
    /* #92: 무죄 판결 시에도 throw 단계 진행 (꽃 투척) */
    /* 마지막 단계 이후 처음으로 (prep) */
    if (courtPhaseIdx >= PHASES.length) {
      courtPhaseIdx = 0;
      startNewCourtTrial();
    }

    courtPhaseTimeLeft = PHASES[courtPhaseIdx].duration;
    updateCourtPhaseUI();
    updateCtTimerDisplay(courtPhaseTimeLeft);

    /* intro 단계 시작 시 대법관 사연 소개 + 사연 표시 (AI 학습) */
    if (PHASES[courtPhaseIdx].name === "intro") {
      const cs = document.getElementById("court-screen");
      const inCourt = cs && cs.classList.contains("active");
      const storyEl = document.getElementById("ct-story");
      if (storyEl) {
        const storyText = ct.story || "";
        storyEl.textContent = storyText.length > 100 ? storyText.slice(0, 100) + "..." : storyText;
      }
      // AI가 사연을 학습하여 대법관 멘트 생성
      const storyTitle = (ct.story && ct.story.length > 20) ? ct.story.slice(0, 20) + "..." : (ct.story || "사연");
      const judgeIntro = "오늘의 사연: \"" + storyTitle + "\" 양측의 주장을 들어보겠습니다.";
      if (inCourt) {
        addSpeechBubble(COURT_NPCS[2], judgeIntro, 5000);
        toast("👑 대법관: 새로운 재판이 시작되었습니다. AI가 사연을 학습합니다.", 4000);
        if (audioCtx) playBGM(COURT_MELODY, 400);
      }
      // 이번 재판의 AI 주장 미리 생성 (사연 학습)
      ct.prosecutorArgs = generateProsecutorArgs(ct.story);
      ct.lawyerArgs = generateLawyerArgs(ct.story);
    }
    /* trial 단계 시작 시 - AI가 학습한 사연으로 검사/변호사 주장 */
    if (PHASES[courtPhaseIdx].name === "trial") {
      const cs = document.getElementById("court-screen");
      const inCourt = cs && cs.classList.contains("active");
      if (inCourt) {
        addSpeechBubble(COURT_NPCS[2], "재판을 시작합니다. 검사와 변호사의 주장을 들으십시오.", 5000);
        toast("⚖️ 재판 진행 중 - AI 검사/변호사가 사연을 학습해 주장합니다", 4000);

        // 검사 주장 - 10초마다 반복 발언 (trial 단계 동안 지속)
        const procArgs = ct.prosecutorArgs || generateProsecutorArgs(ct.story);
        let procIdx = 0;
        const procTimer = setInterval(() => {
          if (PHASES[courtPhaseIdx].name !== "trial") { clearInterval(procTimer); return; }
          addSpeechBubble(COURT_NPCS[0], procArgs[procIdx % procArgs.length], 5000);
          procIdx++;
        }, 10000);
        setTimeout(() => addSpeechBubble(COURT_NPCS[0], procArgs[0], 5000), 2000);

        // 변호사 주장 - 10초마다 반복 발언 (trial 단계 동안 지속)
        const lawyerArgs = ct.lawyerArgs || generateLawyerArgs(ct.story);
        let lawIdx = 0;
        const lawTimer = setInterval(() => {
          if (PHASES[courtPhaseIdx].name !== "trial") { clearInterval(lawTimer); return; }
          addSpeechBubble(COURT_NPCS[1], lawyerArgs[lawIdx % lawyerArgs.length], 5000);
          lawIdx++;
        }, 10000);
        setTimeout(() => addSpeechBubble(COURT_NPCS[1], lawyerArgs[0], 5000), 6000);

        // 대법관 중간 코멘트 (30초, 15초)
        setTimeout(() => {
          if (PHASES[courtPhaseIdx].name === "trial") addSpeechBubble(COURT_NPCS[2], "배심원들은 양측의 주장을 잘 들어주십시오.", 4000);
        }, 30000);
        setTimeout(() => {
          if (PHASES[courtPhaseIdx].name === "trial") addSpeechBubble(COURT_NPCS[2], "곧 투표가 시작됩니다. 마음을 정해주십시오.", 4000);
        }, 45000);
      }
    }
    /* vote 단계 시작 시 */
    if (PHASES[courtPhaseIdx].name === "vote") {
      const cs = document.getElementById("court-screen");
      const inCourt = cs && cs.classList.contains("active");
      if (inCourt) {
        addSpeechBubble(COURT_NPCS[2], "투표를 시작합니다. 유죄인지 무죄인지 결정하십시오.", 5000);
        setTimeout(() => addSpeechBubble(COURT_NPCS[0], "유죄를 선택해주십시오!", 3000), 1500);
        setTimeout(() => addSpeechBubble(COURT_NPCS[1], "무죄를 선택해주십시오!", 3000), 3000);
      }
    }
    /* verdict 단계 시작 시 */
    if (PHASES[courtPhaseIdx].name === "verdict") {
      const cs = document.getElementById("court-screen");
      const inCourt = cs && cs.classList.contains("active");
      if (inCourt) {
        addSpeechBubble(COURT_NPCS[2], "판결을 내리겠습니다...", 5000);
      }
    }
    /* throw 단계 시작 시 */
    if (PHASES[courtPhaseIdx].name === "throw") {
      const cs = document.getElementById("court-screen");
      const inCourt = cs && cs.classList.contains("active");
      if (inCourt) {
        if (lastVerdictGuilty) {
          addSpeechBubble(COURT_NPCS[2], "유죄 판결! 피고인에게 토마토와 계란을 던지십시오!", 5000);
          toast("🍅 심판 시간! 1번(토마토)/2번(계란) 선택 후 피고인 클릭!", 5000);
        } else {
          addSpeechBubble(COURT_NPCS[2], "무죄 판결! 피고인에게 성수와 금화를 던지십시오!", 5000);
          toast("💧 심판 시간! 3번(성수)/4번(금화) 선택 후 피고인 클릭!", 5000);
        }
      }
    }
    /* prep 단계 시작 시 알림 + 사연 숨김 */
    if (PHASES[courtPhaseIdx].name === "prep") {
      const cs = document.getElementById("court-screen");
      const inCourt = cs && cs.classList.contains("active");
      const storyEl = document.getElementById("ct-story");
      if (storyEl) storyEl.textContent = "";
      if (inCourt) toast("⏳ 다음 재판 준비 중... " + PHASES[0].duration + "초 후 시작", 3000);
    }
  }

  function updateCourtPhaseUI() {
    const phase = PHASES[courtPhaseIdx];
    /* 재판 진행 단계 시각화 - 전체 과정을 블럭으로 표시 */
    const phaseInfo = [
      { name: "prep", label: "준비", icon: "⏳" },
      { name: "intro", label: "소개", icon: "📜" },
      { name: "trial", label: "재판", icon: "⚖️" },
      { name: "vote", label: "투표", icon: "🗳️" },
      { name: "verdict", label: "판결", icon: "🔨" },
      { name: "throw", label: "심판", icon: "🍅" },
    ];
    const phaseEl = document.getElementById("ct-phase");
    if (phaseEl) {
      const currentIdx = phaseInfo.findIndex((p) => p.name === phase.name);
      let html = '<div style="display:flex;gap:4px;align-items:center;justify-content:center;flex-wrap:wrap;">';
      phaseInfo.forEach((pi, i) => {
        const isCurrent = pi.name === phase.name;
        const isPast = currentIdx > i;
        const bg = isCurrent ? "#ffd54f" : (isPast ? "#81c784" : "#555");
        const color = isCurrent ? "#333" : "#fff";
        const display = (pi.name === "throw" && !lastVerdictGuilty && currentIdx > 4) ? "none" : "flex";
        html += '<div style="display:' + display + ';flex-direction:column;align-items:center;padding:4px 8px;background:' + bg + ';color:' + color + ';border-radius:6px;font-size:11px;min-width:48px;' + (isCurrent ? "border:2px solid #f57c00;font-weight:bold;" : "") + '">';
        html += '<div style="font-size:16px;">' + pi.icon + "</div>";
        html += "<div>" + pi.label + "</div>";
        html += "</div>";
        if (i < phaseInfo.length - 1) {
          const showArrow = !(pi.name === "verdict" && !lastVerdictGuilty);
          html += '<div style="color:' + (isPast ? "#81c784" : "#555") + ';font-size:14px;' + (showArrow ? "" : "display:none;") + '">→</div>';
        }
      });
      html += "</div>";
      phaseEl.innerHTML = html;
    }
    /* 투표/투척 단계가 아닐 때 투표/판결 패널 숨김 */
    if (phase.name !== "vote") {
      const voteEl = document.getElementById("ct-vote"); if (voteEl) voteEl.style.display = "none";
    }
    if (phase.name !== "throw") {
      const verdictEl = document.getElementById("ct-verdict"); if (verdictEl) verdictEl.style.display = "none";
      const throwStatusEl = document.getElementById("ct-throw-status"); if (throwStatusEl) throwStatusEl.style.display = "none";
    }
    if (phase.name === "throw") {
      const throwStatusEl = document.getElementById("ct-throw-status"); if (throwStatusEl) { throwStatusEl.style.display = "block"; updateThrowStatus(); }
    }
    /* 심판 단계 안내 */
    if (phase.name === "throw") {
      const hintEl = document.getElementById("vr-throw-hint");
      if (hintEl) {
        if (lastVerdictGuilty) {
          hintEl.innerHTML = "🍅 <b>1번(토마토)/2번(계란)</b> 선택 후 피고인을 클릭하여 던지세요!";
        } else {
          hintEl.innerHTML = "💧 <b>3번(성수)/4번(금화)</b> 선택 후 피고인을 클릭하여 던지세요!";
        }
      }
    }
  }

  function updateCtTimerDisplay(totalSeconds) {
    const m = Math.floor(totalSeconds / 60); const s = totalSeconds % 60;
    const timerEl = document.getElementById("ct-timer");
    if (timerEl) timerEl.textContent = m + ":" + String(s).padStart(2, "0");
  }

  function startNewCourtTrial() {
    ct.story = "";
    trialSummary = { chatOpinions: { guilty: 0, notGuilty: 0 }, defendantHits: { tomato: 0, egg: 0, holywater: 0, gold: 0 } };
    myVote = null;
    /* 매 재판마다 여론 초기화 (이전 재판의 채팅 여론 누적 방지) */
    voteCount = { guilty: 0, notGuilty: 0 };
    /* 피고인 랜덤 외모 */
    const defendantHeads = ["😰", "😱", "😤", "😭", "🥺", "😡", "😖", "🤕", "🤢", "😨", "🥵", "😈", "🤯", "😫", "😣"];
    const defendantColors = ["#757575", "#8d6e63", "#a1887f", "#616161", "#795548", "#5d4037", "#4e342e", "#9e9e9e"];
    const randHead = defendantHeads[Math.floor(Math.random() * defendantHeads.length)];
    const randColor = defendantColors[Math.floor(Math.random() * defendantColors.length)];
    if (S.registeredStories && S.registeredStories.length > 0) {
      const reg = S.registeredStories.shift();
      ct.story = typeof reg === "string" ? reg : reg.text;
      ct.storyTitle = (typeof reg === "object" && reg.title) ? reg.title : "";
      defendantChar = { x: DEFENDANT_SEAT.x, y: DEFENDANT_SEAT.y, r: DEFENDANT_SEAT.r, head: randHead, body: randColor, name: "피고인", gold: 0 };
      save();
    } else {
      /* AI가 학습하여 비슷한 사연 생성 */
      ct.story = generateRandomStory();
      ct.storyTitle = "";
      defendantChar = { x: DEFENDANT_SEAT.x, y: DEFENDANT_SEAT.y, r: DEFENDANT_SEAT.r, head: randHead, body: randColor, name: "피고인", gold: 0 };
    }
    const storyEl = document.getElementById("ct-story");
    if (storyEl) storyEl.textContent = "";
  }

  /* 사연 등록 - 제목과 내용 입력 */
  const ctRegister = document.getElementById("ct-register");
  if (ctRegister) ctRegister.addEventListener("click", () => {
    if (S.gold < 100) { toast("금화 부족! 보유: " + S.gold + "💰, 필요: 100💰, 부족: " + (100 - S.gold) + "💰"); return; }
    /* 비동기 사연 등록 UI */
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;";
    const box = document.createElement("div");
    box.style.cssText = "background:#fff;color:#333;border-radius:16px;padding:24px;min-width:360px;max-width:90vw;box-shadow:0 8px 32px rgba(0,0,0,.3);";
    box.innerHTML = '<h3 style="margin-bottom:12px;color:#e65100;">📝 사연 등록</h3>' +
      '<input id="story-title-inp" placeholder="사연 제목" maxLength="30" style="width:100%;padding:10px;border:2px solid #ddd;border-radius:8px;margin-bottom:8px;font-size:14px;" />' +
      '<textarea id="story-content-inp" placeholder="사연 내용을 입력하세요" maxLength="200" style="width:100%;padding:10px;border:2px solid #ddd;border-radius:8px;margin-bottom:12px;font-size:14px;height:80px;resize:none;" ></textarea>' +
      '<div style="display:flex;gap:8px;">' +
      '<button id="story-cancel" style="flex:1;padding:10px;border:none;border-radius:8px;background:#eee;color:#666;font-weight:bold;cursor:pointer;">취소</button>' +
      '<button id="story-submit" style="flex:1;padding:10px;border:none;border-radius:8px;background:#f39c12;color:#fff;font-weight:bold;cursor:pointer;">등록 (100💰)</button>' +
      '</div>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    const titleInp = document.getElementById("story-title-inp");
    if (titleInp) titleInp.focus();
    const closeOverlay = () => { document.body.removeChild(overlay); };
    document.getElementById("story-cancel").addEventListener("click", closeOverlay);
    document.getElementById("story-submit").addEventListener("click", () => {
      const t = document.getElementById("story-title-inp").value.trim();
      const ct2 = document.getElementById("story-content-inp").value.trim();
      if (!t || !ct2) { toast("제목과 내용을 모두 입력해주세요"); return; }
      S.gold -= 100;
      S.registeredStories.push({ title: t, text: ct2, startTime: "다음 재판", endTime: "재판 종료 시" });
      save(); updateHUD();
      toast("사연 등록 완료! (대기: " + S.registeredStories.length + "건)");
      updateStoryList();
      closeOverlay();
    });
  });

  const ctListToggle = document.getElementById("ct-list-toggle");
  if (ctListToggle) ctListToggle.addEventListener("click", () => {
    const listEl = document.getElementById("ct-story-list"); if (!listEl) return;
    if (listEl.style.display === "none") { updateStoryList(); listEl.style.display = "block"; }
    else { listEl.style.display = "none"; }
  });

  /* 사연 전문 보기 버튼 */
  const ctStoryDetail = document.getElementById("ct-story-detail");
  if (ctStoryDetail) ctStoryDetail.addEventListener("click", () => {
    if (!ct.story) { toast("현재 진행 중인 사연이 없습니다."); return; }
    const overlay = document.createElement("div");
    overlay.style.cssText = "position:fixed;inset:0;background:rgba(0,0,0,.6);z-index:99999;display:flex;align-items:center;justify-content:center;";
    const box = document.createElement("div");
    box.style.cssText = "background:#fff;color:#333;border-radius:16px;padding:24px;min-width:360px;max-width:600px;max-height:80vh;box-shadow:0 8px 32px rgba(0,0,0,.3);overflow-y:auto;";
    box.innerHTML =
      '<h3 style="margin-bottom:12px;color:#e65100;">📖 사연 전문</h3>' +
      (ct.storyTitle ? '<div style="font-size:1.2em;font-weight:bold;margin-bottom:8px;color:#333;">' + ct.storyTitle + '</div>' : '') +
      '<div style="font-size:1em;line-height:1.8;color:#555;margin-bottom:16px;white-space:pre-wrap;">' + ct.story + '</div>' +
      '<button id="story-detail-close" style="padding:10px 24px;border:none;border-radius:8px;background:#f39c12;color:#fff;font-weight:bold;cursor:pointer;width:100%;">닫기</button>';
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.getElementById("story-detail-close").addEventListener("click", () => { document.body.removeChild(overlay); });
    overlay.addEventListener("click", (e) => { if (e.target === overlay) document.body.removeChild(overlay); });
  });

  function updateStoryList() {
    const listEl = document.getElementById("ct-story-list"); if (!listEl) return;
    listEl.innerHTML = "";
    if (!S.registeredStories || S.registeredStories.length === 0) {
      listEl.innerHTML = '<div class="story-list-item"><div class="sli-text">접수된 사연이 없습니다.</div></div>';
      return;
    }
    S.registeredStories.forEach((s, i) => {
      const title = (typeof s === "object" && s.title) ? s.title : "제목 없음";
      const text = typeof s === "string" ? s : s.text;
      const st = typeof s === "string" ? "?" : s.startTime;
      const et = typeof s === "string" ? "?" : s.endTime;
      const item = document.createElement("div"); item.className = "story-list-item";
      item.innerHTML = '<div class="sli-text">' + (i+1) + ". [" + title + "] " + text + "</div>" +
        '<div class="sli-time">시작: <b>' + st + "</b> | 종료: <b>" + et + "</b></div>";
      listEl.appendChild(item);
    });
  }

  /* 재판소 채팅 */
  const ctSend = document.getElementById("ct-send");
  const ctInp = document.getElementById("ct-inp");
  if (ctSend) ctSend.addEventListener("click", doCtSend);
  if (ctInp) ctInp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); doCtSend(); } });
  /* 유죄 관련 키워드 (#81: 더 많은 워딩 추가) */
  const GUILTY_KEYWORDS = ["유죄", "범죄", "잘못", "처벌", "벌", "범인", "나쁘", "혐오", "분노", "응징", "책임", "사과", "감옥", "벌금", "징역", "처벌해", "응징해", "유죄임", "유죄다", "문제", "비난", "비판", "당연", "마땅", "죄", "죄인", "악", "거짓", "속임", "사기", "도둑", "훔친", "폭력", "위험", "해로", "위반", "불법", "부정", "반성 안", "사과 안", "인정 안"];
  /* 무죄 관련 키워드 (#81: 더 많은 워딩 추가) */
  const NOTGUILTY_KEYWORDS = ["무죄", "용서", "참작", "사정", "기회", "선처", "봉사", "달라졌", "변했", "인정", "이해", "동정", "안타깝", "불쌍", "무죄임", "무죄다", "용서해", "기회줘", "사정있", "어쩔", "어쩔 수", "힘들", "힘든", "아프", "아픈", "도와", "구해", "살려", "위로", "응원", "응원해", "괜찮", "괜찮아", "괜찮네", "별일", "별거", "그럴 수", "그럴수", "실수", "누구나", "반성", "뉘우친", "뉘우치"];
  /* #96: 배심원석 위치 (유죄: 좌측 끝, 무죄: 우측 끝) */
  const GUILTY_ZONE = { x: 10, y: 380, w: 160, h: 100 };
  const NOTGUILTY_ZONE = { x: 630, y: 380, w: 160, h: 100 };
  /* #97/#98: 중앙 배심원석 (3배 넓음, 유저 채팅 여론 반영 구역) */
  const CENTER_ZONE = { x: 200, y: 400, w: 400, h: 90 };
  let guiltyFlash = 0; let notGuiltyFlash = 0;
  function isInGuiltyZone(x, y) { return x >= GUILTY_ZONE.x && x <= GUILTY_ZONE.x + GUILTY_ZONE.w && y >= GUILTY_ZONE.y && y <= GUILTY_ZONE.y + GUILTY_ZONE.h; }
  function isInNotGuiltyZone(x, y) { return x >= NOTGUILTY_ZONE.x && x <= NOTGUILTY_ZONE.x + NOTGUILTY_ZONE.w && y >= NOTGUILTY_ZONE.y && y <= NOTGUILTY_ZONE.y + NOTGUILTY_ZONE.h; }
  /* #98: 중앙 배심원석 확인 */
  function isInCenterZone(x, y) { return x >= CENTER_ZONE.x && x <= CENTER_ZONE.x + CENTER_ZONE.w && y >= CENTER_ZONE.y && y <= CENTER_ZONE.y + CENTER_ZONE.h; }
  function analyzeChatOpinion(text) {
    if (!text) return 0;
    let score = 0;
    const lower = text.toLowerCase();
    for (const kw of GUILTY_KEYWORDS) { if (lower.includes(kw.toLowerCase())) score += 1; }
    for (const kw of NOTGUILTY_KEYWORDS) { if (lower.includes(kw.toLowerCase())) score -= 1; }
    return score;
  }
  function doCtSend() {
    const v = document.getElementById("ct-inp").value.trim(); if (!v) return;
    if (v === "/tomato") { S.tomatoes += 100; updateHUD(); save(); toast("치트: 🍅 토마토 +100"); }
    else if (v === "/egg") { S.eggs += 100; updateHUD(); save(); toast("치트: 🥚 계란 +100"); }
    else if (v === "/water") { S.holywater += 100; updateHUD(); save(); toast("치트: 💧 성수 +100"); }
    else if (v === "/gold") { S.gold += 1000; updateHUD(); save(); toast("치트: 💰 금화 +100"); }
    else {
      addSpeechBubble(CP, v, 4000);
      /* #40/#86/#98: AI가 채팅 내용과 사연 맥락을 분석하여 여론 반영 */
      const result = analyzeChatContext(v, ct.story);
      if (result.opinion !== "neutral" && result.score > 0) {
        const inGuilty = isInGuiltyZone(CP.x, CP.y);
        const inNotGuilty = isInNotGuiltyZone(CP.x, CP.y);
        const inCenter = isInCenterZone(CP.x, CP.y);
        if (result.opinion === "guilty") {
          trialSummary.chatOpinions.guilty++;
          if (inGuilty) { voteCount.guilty += Math.min(3, result.score); guiltyFlash = 30; }
          else if (inCenter) { voteCount.guilty += Math.min(2, result.score); guiltyFlash = 20; }
          else if (inNotGuilty) { /* 무죄석에서 유죄 발언 = 효과 없음 */ }
          else { voteCount.guilty += 1; guiltyFlash = 15; }
        } else {
          trialSummary.chatOpinions.notGuilty++;
          if (inNotGuilty) { voteCount.notGuilty += Math.min(3, result.score); notGuiltyFlash = 30; }
          else if (inCenter) { voteCount.notGuilty += Math.min(2, result.score); notGuiltyFlash = 20; }
          else if (inGuilty) { /* 유죄석에서 무죄 발언 = 효과 없음 */ }
          else { voteCount.notGuilty += 1; notGuiltyFlash = 15; }
        }
      }
      /* #40: 채팅 후 즉시 여론 표시 업데이트 */
      updateCourtOpinion();
    }
    document.getElementById("ct-inp").value = "";
    globalChatMode = false; document.getElementById("ct-inp").blur();
  }

  const townSend = document.getElementById("town-send");
  const townInp = document.getElementById("town-inp");
  if (townSend) townSend.addEventListener("click", doTownSend);
  if (townInp) townInp.addEventListener("keydown", (e) => { if (e.key === "Enter") { e.preventDefault(); e.stopPropagation(); doTownSend(); } });
  function doTownSend() {
    const v = document.getElementById("town-inp").value.trim(); if (!v) return;
    if (v === "/tomato") { S.tomatoes += 100; updateHUD(); save(); toast("치트: 🍅 토마토 +100"); }
    else if (v === "/egg") { S.eggs += 100; updateHUD(); save(); toast("치트: 🥚 계란 +100"); }
    else if (v === "/water") { S.holywater += 100; updateHUD(); save(); toast("치트: 💧 성수 +100"); }
    else if (v === "/gold") { S.gold += 1000; updateHUD(); save(); toast("치트: 💰 금화 +100"); }
    else { addSpeechBubble(P, v, 4000); }
    document.getElementById("town-inp").value = "";
    globalChatMode = false; document.getElementById("town-inp").blur();
  }

  function toggleGlobalChatMode() {
    globalChatMode = !globalChatMode;
    const inp = getActiveChatInput();
    if (globalChatMode) { if (inp) inp.focus(); toast("💬 채팅 모드 (Enter: 이동 모드)"); }
    else { if (inp) inp.blur(); toast("🚶 이동 모드 (Enter: 채팅 모드)"); }
  }

  /* 투표 */
  const voteG = document.getElementById("vote-g");
  const voteNG = document.getElementById("vote-ng");
  if (voteG) voteG.addEventListener("click", () => ctVote("guilty"));
  if (voteNG) voteNG.addEventListener("click", () => ctVote("not-guilty"));
    function ctVote(v) {
    /* vote 단계에서만 투표 가능 */
    if (PHASES[courtPhaseIdx].name !== "vote") { toast("투표 시간이 아닙니다."); return; }
    /* 투표 변경: 이전 투표가 있으면 취소 후 새로 투표 */
    if (myVote) {
      if (myVote === v) { toast("이미 " + (v === "guilty" ? "유죄" : "무죄") + "에 투표하셨습니다."); return; }
      /* 이전 투표 취소 */
      if (myVote === "guilty") voteCount.guilty = Math.max(0, voteCount.guilty - 1);
      else voteCount.notGuilty = Math.max(0, voteCount.notGuilty - 1);
      toast("투표를 " + (v === "guilty" ? "🔨 유죄" : "✋ 무죄") + "로 변경했습니다.");
    } else {
      S.stats.votes++; save();
    }
    myVote = v;
    if (v === "guilty") voteCount.guilty++; else voteCount.notGuilty++;
    /* 버튼 비활성화하지 않음 (변경 가능) */
    const voteMsgEl = document.getElementById("vote-msg");
    if (voteMsgEl) {
      if (v === "guilty") {
        voteMsgEl.innerHTML = '<span style="color:#c62828;font-size:1.3em;font-weight:bold;">🔨 유죄 투표 완료!</span><br/><span style="font-size:0.8em;color:#999;">투표 종료 전까지 변경 가능합니다</span>';
      } else {
        voteMsgEl.innerHTML = '<span style="color:#2e7d32;font-size:1.3em;font-weight:bold;">✋ 무죄 투표 완료!</span><br/><span style="font-size:0.8em;color:#999;">투표 종료 전까지 변경 가능합니다</span>';
      }
    }
  }

  /* 재판소 투척 버튼 */
  const ctThrowEgg = document.getElementById("ct-throw-egg");
  const ctThrowTom = document.getElementById("ct-throw-tom");
  const ctThrowHoly = document.getElementById("ct-throw-holy");
  const ctThrowGold = document.getElementById("ct-throw-gold");
  if (ctThrowEgg) ctThrowEgg.addEventListener("click", () => ctThrowAtDefendant("egg"));
  if (ctThrowTom) ctThrowTom.addEventListener("click", () => ctThrowAtDefendant("tomato"));
  if (ctThrowHoly) ctThrowHoly.addEventListener("click", () => ctThrowAtDefendant("holywater"));
  if (ctThrowGold) ctThrowGold.addEventListener("click", () => ctThrowAtDefendant("gold"));

  /* 재판소 canvas 클릭 시 피고인에게 투척 */
  if (ccv) ccv.addEventListener("mousedown", (e) => {
    const cs = document.getElementById("court-screen");
    if (!cs || !cs.classList.contains("active")) return;
    /* 재판소 내에서 언제든 피고인에게 투척 */
    ctThrowAtDefendant(throwKind);
  });
  function updateThrowStatus() {
    const el = document.getElementById("ct-throw-status");
    if (!el) return;
    const icons = { tomato: "🍅", egg: "🥚", holywater: "💧", gold: "💰" };
    const names = { tomato: "토마토", egg: "계란", holywater: "성수", gold: "금화" };
    const counts = { tomato: S.tomatoes, egg: S.eggs, holywater: S.holywater, gold: S.gold };
    el.innerHTML = '<span style="font-size:1.2em;">' + (icons[throwKind] || "🍅") + "</span> " +
      (names[throwKind] || "토마토") + " (" + (counts[throwKind] || 0) + "개) | " +
      '<small style="color:#888;">1:🍅 2:🥚 3:💧 4:💰 | 클릭하여 투척</small>';
  }
  function ctThrowAtDefendant(kind) {
    /* #83: 판결 전(throw 단계가 아닐 때) 토마토/계란 투척 시 경호원이 제지 */
    const currentPhase = PHASES[courtPhaseIdx];
    if ((kind === "tomato" || kind === "egg") && currentPhase.name !== "throw") {
      toast("💂 경호원: 판결 전에는 피고인에게 투척할 수 없습니다!");
      addSpeechBubble(COURT_NPCS[3], "판결 전에는 피고인을 보호합니다!", 3000);
      return;
    }
    /* 재판소 내에서 언제든 투척 가능 */
    /* 피고인이 없으면 자동 생성 */
    if (!defendantChar) {
      defendantChar = { x: DEFENDANT_SEAT.x, y: DEFENDANT_SEAT.y, r: DEFENDANT_SEAT.r, head: "😰", body: "#757575", name: "피고인", gold: 0 };
    }
    /* 언제든 토마토/계란/성수/금화 투척 가능 */
    if (kind === "tomato" || kind === "egg") {
      const key = kind === "egg" ? "eggs" : "tomatoes";
      if (S[key] <= 0) { toast(kind === "egg" ? "계란 부족" : "토마토 부족"); return; }
      S[key]--;
      courtSession.itemsUsed[kind] = (courtSession.itemsUsed[kind] || 0) + 1;
      const justiceDelta = kind === "tomato" ? 5 : 10;
      S.justice = Math.min(9999, S.justice + justiceDelta);
      /* 피고인에게 발사체 투척 (마을과 동일하게 projectile 생성) */
      const emoji = kind === "egg" ? "🥚" : "🍅";
      const dx = defendantChar.x - CP.x;
      const dy = defendantChar.y - CP.y;
      const dist = Math.max(1, Math.hypot(dx, dy));
      const sp = 10;
      projs.push({
        x: CP.x, y: CP.y,
        vx: (dx / dist) * sp, vy: (dy / dist) * sp,
        life: 55, emoji, kind, courtTarget: defendantChar,
      });
      defendantChar.hitLock = 20;
      /* 즉시 효과음 재생 */
      if (kind === "tomato") playSound("splat");
      else if (kind === "egg") playSound("splat_egg");
      updateHUD(); save();
      toast(kind === "egg" ? "🥚 피고인에게 투척! 정의 +10" : "🍅 피고인에게 투척! 정의 +5");
    } else if (kind === "gold" || kind === "holywater") {
      if (kind === "gold") {
        if (S.gold <= 0) { toast("금화 부족"); return; }
        S.gold--; courtSession.itemsUsed.gold = (courtSession.itemsUsed.gold || 0) + 1; S.personality = Math.min(9999, S.personality + 10);
        /* 투척된 금화는 피고인의 금화로 전환 */
        if (defendantChar) defendantChar.gold = (defendantChar.gold || 0) + 1;
        const dxg = defendantChar.x - CP.x;
        const dyg = defendantChar.y - CP.y;
        const distg = Math.max(1, Math.hypot(dxg, dyg));
        const spg = 10;
        projs.push({
          x: CP.x, y: CP.y,
          vx: (dxg / distg) * spg, vy: (dyg / distg) * spg,
          life: 55, emoji: "💰", kind: "gold", courtTarget: defendantChar,
        });
        playSound("coin"); playSound("sparkle");
        toast("💰 피고인에게 금화 투척! 인성 +10 (피고인 금화 +1)");
      } else {
        if (S.holywater <= 0) { toast("성수 부족"); return; }
        S.holywater--; courtSession.itemsUsed.holywater = (courtSession.itemsUsed.holywater || 0) + 1; S.personality = Math.min(9999, S.personality + 5);
        const dxh = defendantChar.x - CP.x;
        const dyh = defendantChar.y - CP.y;
        const disth = Math.max(1, Math.hypot(dxh, dyh));
        const sph = 10;
        projs.push({
          x: CP.x, y: CP.y,
          vx: (dxh / disth) * sph, vy: (dyh / disth) * sph,
          life: 55, emoji: "💧", kind: "holywater", courtTarget: defendantChar,
        });
        playSound("splash");
        toast("💧 피고인에게 성수 투척! 인성 +5");
      }
      updateHUD(); save();
    }
  }
  const ctExit = document.getElementById("ct-exit");
  if (ctExit) ctExit.addEventListener("click", () => exitCourt());

  /* 정화소 아이템 */
  const BATH_ITEMS = [
    { id: "soap", name: "비누", ic: "🧼", price: 10, desc: "청결도 +20" },
    { id: "towel", name: "수건", ic: "🧖", price: 20, desc: "청결도 +50" },
    { id: "shower", name: "샤워기", ic: "🚿", price: 50, desc: "청결도 +100" },
    { id: "spa", name: "스파", ic: "♨️", price: 100, desc: "청결도 MAX" },
    { id: "holywater", name: "성수", ic: "💧", price: 30, desc: "성수 +1" },
  ];

  function openBath() {
    const g = document.getElementById("bath-grid"); if (!g) return;
    g.innerHTML = "";
    document.getElementById("bath-coins").textContent = S.coins;
    document.getElementById("bath-clean").textContent = S.cleanliness;
    drawBathCanvas();
    BATH_ITEMS.forEach((it) => {
      const d = document.createElement("div"); d.className = "si";
      const html = '<div class="pr">' + it.price + " 💰</div>";
      d.innerHTML = '<div class="ic">' + it.ic + '</div><div class="nm">' + it.name + "</div>" + html +
        '<div class="desc" style="font-size:.75em;color:#888;margin-top:2px">' + it.desc + "</div>";
      d.addEventListener("click", () => {
        if (S.coins < it.price) { toast("코인 부족"); return; }
        S.coins -= it.price;
        if (it.id === "spa") { S.cleanliness = 100; }
        else if (it.id === "holywater") { S.holywater += 1; }
        else { const amount = parseInt(it.desc.match(/\+(\d+)/)[1]); S.cleanliness = Math.min(100, S.cleanliness + amount); }
        updateHUD(); save(); drawBathCanvas();
        document.getElementById("bath-clean").textContent = S.cleanliness;
        document.getElementById("bath-coins").textContent = S.coins;
        toast(it.name + " 구매! " + it.desc);
      });
      g.appendChild(d);
    });
  }

  /* 초기화 */
  updateHUD();
  startCourtTimer();
  startNewCourtTrial();
  if (S.name) {
    P.head = S.equippedHead || S.head; P.body = S.equippedBody || S.body;
    P.name = S.name; P.x = S.x || 800; P.y = S.y || 600;
    showScreen("game-screen");
  } else {
    showScreen("login-screen");
  }
}