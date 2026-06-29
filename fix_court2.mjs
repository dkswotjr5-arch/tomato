import { readFileSync, writeFileSync } from 'fs';

const f = 'app/page.js';
let c = readFileSync(f, 'utf-8');

// === 문제 24: 고해소 멘트 겹침 해결 ===
// "죄를 고백하는 중..." 텍스트 제거
const old1 = `            <p style={{ marginTop: "12px", color: "#666", fontSize: "0.9em" }}>죄를 고백하는 중... 잠시만 기다려주세요.</p>`;
const new1 = ``;

if (c.includes(old1)) { c = c.replace(old1, new1); console.log("OK: confession static text removed"); }
else console.log("SKIP: confession static text not found");

// === 문제 25: 상점 구매 효과음 ===
const old2 = `          updateHUD(); save(); openShop();
          toast(it.name + " 구매 완료!");
        });`;
const new2 = `          updateHUD(); save(); openShop();
          playSound("coin");
          toast(it.name + " 구매 완료!");
        });`;

if (c.includes(old2)) { c = c.replace(old2, new2); console.log("OK: shop purchase sound"); }
else console.log("SKIP: shop purchase not found");

// === 문제 26, 31, 32: 채팅이 여론에 실시간 반영 ===
// doCtSend 함수에서 채팅 내용 분석하여 voteCount에 반영
const old3 = `  function doCtSend() {
    const v = document.getElementById("ct-inp").value.trim(); if (!v) return;
    if (v === "/tomato") { S.tomatoes += 100; updateHUD(); save(); toast("치트: 🍅 토마토 +100"); }
    else { addSpeechBubble(CP, v, 4000); }
    document.getElementById("ct-inp").value = "";
    globalChatMode = false; document.getElementById("ct-inp").blur();
  }`;
const new3 = `  /* 유죄 관련 키워드 */
  const GUILTY_KEYWORDS = ["유죄", "범죄", "잘못", "처벌", "벌", "유죄다", "범인", "나쁘", "혐오", "분노", "응징", "책임", "사과", "반성", "책임져", "감옥", "벌금", "징역", "처벌해", "응징해", "유죄임", "유죄다"];
  /* 무죄 관련 키워드 */
  const NOTGUILTY_KEYWORDS = ["무죄", "용서", "참작", "사정", "기회", "선처", "무죄다", "반성", "봉사", "달라졌", "변했", "인정", "이해", "동정", "안타깝", "불쌍", "무죄임", "무죄다", "용서해", "기회줘"];
  /* 배심원석 위치 (유죄: 좌측, 무죄: 우측) */
  const GUILTY_ZONE = { x: 40, y: 250, w: 320, h: 120 };
  const NOTGUILTY_ZONE = { x: 440, y: 250, w: 320, h: 120 };
  let guiltyFlash = 0; let notGuiltyFlash = 0;
  function isInGuiltyZone(x, y) { return x >= GUILTY_ZONE.x && x <= GUILTY_ZONE.x + GUILTY_ZONE.w && y >= GUILTY_ZONE.y && y <= GUILTY_ZONE.y + GUILTY_ZONE.h; }
  function isInNotGuiltyZone(x, y) { return x >= NOTGUILTY_ZONE.x && x <= NOTGUILTY_ZONE.x + NOTGUILTY_ZONE.w && y >= NOTGUILTY_ZONE.y && y <= NOTGUILTY_ZONE.y + NOTGUILTY_ZONE.h; }
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
    else {
      addSpeechBubble(CP, v, 4000);
      /* 채팅 내용 분석하여 여론 반영 */
      const score = analyzeChatOpinion(v);
      if (score !== 0) {
        const inGuilty = isInGuiltyZone(CP.x, CP.y);
        const inNotGuilty = isInNotGuiltyZone(CP.x, CP.y);
        if (score > 0) {
          /* 유죄 발언 */
          if (inGuilty) { voteCount.guilty += Math.min(3, score); guiltyFlash = 30; }
          else if (inNotGuilty) { /* 무죄석에서 유죄 발언 = 효과 없음 */ }
          else { voteCount.guilty += 1; guiltyFlash = 15; }
        } else {
          /* 무죄 발언 */
          if (inNotGuilty) { voteCount.notGuilty += Math.min(3, -score); notGuiltyFlash = 30; }
          else if (inGuilty) { /* 유죄석에서 무죄 발언 = 효과 없음 */ }
          else { voteCount.notGuilty += 1; notGuiltyFlash = 15; }
        }
      }
    }
    document.getElementById("ct-inp").value = "";
    globalChatMode = false; document.getElementById("ct-inp").blur();
  }`;

if (c.includes(old3)) { c = c.replace(old3, new3); console.log("OK: court chat opinion system"); }
else console.log("SKIP: doCtSend not found");

// === 문제 27: 재판소 상단에 마을과 같은 상태창 표시 ===
// showScreen에서 HUD 표시 제어 확인 (이미 추가됨)
// court-screen이 active일 때 HUD 표시되도록 확인
// 이미 showScreen에서 처리하고 있으므로, 초기 로딩 시에도 처리
const old4 = `  function showScreen(id) {
    /* 화면 전환 시 발사체/이펙트 비우기 (누적 방지) */
    if (id !== "court-screen") { projs.length = 0; splat.length = 0; }
    SCREENS.forEach((s) => { const el = document.getElementById(s); if (el) el.classList.remove("active"); });
    const el = document.getElementById(id); if (el) el.classList.add("active");
    /* HUD 표시 제어: game-screen, court-screen에서만 표시 */
    const hud = document.getElementById("hud");
    if (hud) {
      if (id === "game-screen" || id === "court-screen") hud.style.display = "flex";
      else hud.style.display = "none";
    }
  }`;
const new4 = `  function showScreen(id) {
    /* 화면 전환 시 발사체/이펙트 비우기 (누적 방지) */
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
  }`;

if (c.includes(old4)) { c = c.replace(old4, new4); console.log("OK: court HUD force update"); }
else console.log("SKIP: showScreen not found");

// === 문제 28: 대법관석, 검사석, 변호사석 명칭 가려짐 해결 ===
// 캐릭터를 그린 후 명칭을 다시 그리도록 renderCourt 수정
// 검사석, 변호사석, 대법관석 텍스트를 캐릭터 위에 그리기
const old5 = `    /* 검사석 (좌측) */
    cctx.fillStyle = "#c62828"; cctx.fillRect(40, 100, 160, 80);
    cctx.fillStyle = "#fff"; cctx.font = "bold 14px sans-serif"; cctx.textAlign = "center";
    cctx.fillText("🔍 검사석", 120, 145);
    /* 변호인석 (우측) */
    cctx.fillStyle = "#1565c0"; cctx.fillRect(600, 100, 160, 80);
    cctx.fillStyle = "#fff"; cctx.fillText("🛡️ 변호인석", 680, 145);
    /* 대법관석 (상단 중앙) */
    cctx.fillStyle = "#d4af37"; cctx.fillRect(320, 20, 160, 60);
    cctx.fillStyle = "#333"; cctx.font = "bold 14px sans-serif";
    cctx.fillText("👑 대법관석", 400, 55);`;
const new5 = `    /* 검사석 (좌측) */
    cctx.fillStyle = "#c62828"; cctx.fillRect(40, 100, 160, 80);
    /* 변호인석 (우측) */
    cctx.fillStyle = "#1565c0"; cctx.fillRect(600, 100, 160, 80);
    /* 대법관석 (상단 중앙) */
    cctx.fillStyle = "#d4af37"; cctx.fillRect(320, 20, 160, 60);`;

if (c.includes(old5)) { c = c.replace(old5, new5); console.log("OK: seat labels moved"); }
else console.log("SKIP: seat labels not found");

// 캐릭터 그린 후 명칭 그리기 - drawChars 호출 후에 추가
const old6 = `    drawChars(cctx, [CP]);
    drawSpeechBubbles(cctx);
    /* 재판소 발사체 렌더링 (scale 변환 내부) */`;
const new6 = `    drawChars(cctx, [CP]);
    drawSpeechBubbles(cctx);
    /* 명칭을 캐릭터 위에 표시 (가려지지 않도록) */
    cctx.fillStyle = "#fff"; cctx.font = "bold 14px sans-serif"; cctx.textAlign = "center";
    cctx.fillText("🔍 검사석", 120, 95);
    cctx.fillStyle = "#fff"; cctx.fillText("🛡️ 변호인석", 680, 95);
    cctx.fillStyle = "#333"; cctx.font = "bold 14px sans-serif";
    cctx.fillText("👑 대법관석", 400, 15);
    /* 배심원석 라벨 */
    cctx.fillStyle = "rgba(255,82,82," + (0.3 + guiltyFlash / 100) + ")"; cctx.fillRect(GUILTY_ZONE.x, GUILTY_ZONE.y, GUILTY_ZONE.w, GUILTY_ZONE.h);
    cctx.fillStyle = "rgba(68,138,255," + (0.3 + notGuiltyFlash / 100) + ")"; cctx.fillRect(NOTGUILTY_ZONE.x, NOTGUILTY_ZONE.y, NOTGUILTY_ZONE.w, NOTGUILTY_ZONE.h);
    cctx.fillStyle = "#fff"; cctx.font = "bold 12px sans-serif";
    cctx.fillText("🔨 유죄 배심원석", GUILTY_ZONE.x + GUILTY_ZONE.w / 2, GUILTY_ZONE.y - 5);
    cctx.fillText("✋ 무죄 배심원석", NOTGUILTY_ZONE.x + NOTGUILTY_ZONE.w / 2, NOTGUILTY_ZONE.y - 5);
    /* 재판소 발사체 렌더링 (scale 변환 내부) */`;

if (c.includes(old6)) { c = c.replace(old6, new6); console.log("OK: seat labels after chars + jury zones"); }
else console.log("SKIP: drawChars court not found");

// === 문제 29, 30: 배심원석 깜빡임 효과 ===
// updateCourt에서 flash 감소
const old7 = `    /* 재판소 발사체 업데이트 */`;
const new7 = `    /* 배심원석 깜빡임 효과 감소 */
    if (guiltyFlash > 0) guiltyFlash--;
    if (notGuiltyFlash > 0) notGuiltyFlash--;
    /* 재판소 발사체 업데이트 */`;

if (c.includes(old7)) { c = c.replace(old7, new7); console.log("OK: flash decay added"); }
else console.log("SKIP: updateCourt projectile not found");

writeFileSync(f, c, 'utf-8');
console.log("DONE: file saved");