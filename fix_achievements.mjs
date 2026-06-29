import { readFileSync, writeFileSync } from 'fs';

const f = 'app/page.js';
let c = readFileSync(f, 'utf-8');
let changes = 0;

// ============================================================
// 버그 40: 채팅 여론 반영 안됨 - updateCourt에서 opinion 업데이트 누락
// ============================================================
const old_opinion = `    /* splat 업데이트 */
    for (let i = splat.length - 1; i >= 0; i--) { splat[i].t--; if (splat[i].t <= 0) splat.splice(i, 1); }
    updateSpeechBubbles();
  }`;
const new_opinion = `    /* splat 업데이트 */
    for (let i = splat.length - 1; i >= 0; i--) { splat[i].t--; if (splat[i].t <= 0) splat.splice(i, 1); }
    /* 여론 시각화 업데이트 (재판소에서도 실시간 반영) */
    const opinionEl = document.getElementById("court-opinion");
    if (opinionEl) {
      const total = voteCount.guilty + voteCount.notGuilty;
      const gPct = total > 0 ? Math.round((voteCount.guilty / total) * 100) : 50;
      const ngPct = total > 0 ? Math.round((voteCount.notGuilty / total) * 100) : 50;
      const phase = PHASES[courtPhaseIdx] || { name: "prep" };
      /* 투표 단계에서만 여론 표시, 그 외에는 숨김 */
      if (phase.name === "vote" || phase.name === "verdict" || phase.name === "throw") {
        opinionEl.style.display = "block";
        opinionEl.innerHTML = '<div style="display:flex;align-items:center;gap:4px;font-size:12px;">' +
          '<span style="color:#ff5252;">🔨 유죄 ' + voteCount.guilty + ' (' + gPct + '%)</span>' +
          '<div style="flex:1;height:12px;background:#333;border-radius:6px;overflow:hidden;display:flex;">' +
          '<div style="width:' + gPct + '%;background:#ff5252;transition:width 0.5s;"></div>' +
          '<div style="width:' + ngPct + '%;background:#448aff;transition:width 0.5s;"></div>' +
          '</div>' +
          '<span style="color:#448aff;">무죄 ' + voteCount.notGuilty + ' (' + ngPct + '%) ✋</span>' +
          '</div>';
      } else {
        opinionEl.style.display = "none";
      }
    }
    updateSpeechBubbles();
  }`;

if (c.includes(old_opinion)) { c = c.replace(old_opinion, new_opinion); changes++; console.log("OK: bug 40 - opinion update in updateCourt"); }
else console.log("SKIP: bug 40 - updateCourt opinion not found");

// ============================================================
// 버그 41: 투표 전에 여론 표시 - updateTown의 opinion 표시를 vote 단계로 제한
// ============================================================
const old_town_opinion = `    /* 여론 시각화 업데이트 */
    const opinionEl = document.getElementById("court-opinion");
    if (opinionEl) {
      const total = voteCount.guilty + voteCount.notGuilty;
      const gPct = total > 0 ? Math.round((voteCount.guilty / total) * 100) : 50;
      const ngPct = total > 0 ? Math.round((voteCount.notGuilty / total) * 100) : 50;
      opinionEl.innerHTML = '<div style="display:flex;align-items:center;gap:4px;font-size:12px;">' +
        '<span style="color:#ff5252;">🔨 유죄 ' + voteCount.guilty + ' (' + gPct + '%)</span>' +
        '<div style="flex:1;height:12px;background:#333;border-radius:6px;overflow:hidden;display:flex;">' +
        '<div style="width:' + gPct + '%;background:#ff5252;transition:width 0.5s;"></div>' +
        '<div style="width:' + ngPct + '%;background:#448aff;transition:width 0.5s;"></div>' +
        '</div>' +
        '<span style="color:#448aff;">무죄 ' + voteCount.notGuilty + ' (' + ngPct + '%) ✋</span>' +
        '</div>';
    }`;
const new_town_opinion = `    /* 여론 시각화는 updateCourt에서 처리 (vote/verdict/throw 단계에서만 표시) */`;

if (c.includes(old_town_opinion)) { c = c.replace(old_town_opinion, new_town_opinion); changes++; console.log("OK: bug 41 - town opinion display removed"); }
else console.log("SKIP: bug 41 - town opinion not found");

// ============================================================
// 버그 42: 토마토/금화 1분 후 지급 안됨 - loginTime 리셋 시 lastTomatoMin/lastGold10Min도 리셋
// ============================================================
const old_login = `    const merged = { ...def(), ...data, loginTime: Date.now(), lastGoldHour: data.lastGoldHour || 0 };`;
const new_login = `    const merged = { ...def(), ...data, loginTime: Date.now(), lastGoldHour: data.lastGoldHour || 0, lastTomatoMin: 0, lastGold10Min: 0 };`;

if (c.includes(old_login)) { c = c.replace(old_login, new_login); changes++; console.log("OK: bug 42 - reset timers on login"); }
else console.log("SKIP: bug 42 - login merge not found");

// ============================================================
// 버그 43: 피고인에게 토마토 던질 때 효과음 없음 - ctThrowAtDefendant에 playSound 추가
// ============================================================
const old_throw_tomato = `      toast(kind === "egg" ? "🥚 피고인에게 투척! 정의 +10" : "🍅 피고인에게 투척! 정의 +5");`;
const new_throw_tomato = `      playSound(kind === "egg" ? "splat_egg" : "splat");
      toast(kind === "egg" ? "🥚 피고인에게 투척! 정의 +10" : "🍅 피고인에게 투척! 정의 +5");`;

if (c.includes(old_throw_tomato)) { c = c.replace(old_throw_tomato, new_throw_tomato); changes++; console.log("OK: bug 43 - throw sound added"); }
else console.log("SKIP: bug 43 - throw toast not found");

// ============================================================
// 업적/칭호 시스템: HUD에 업적 버튼 추가
// ============================================================
const old_hud = `            <button id="hud-shop" className="hud-ad-btn" title="장비창">🎒</button>
            <button id="hud-ad" className="hud-ad-btn" title="광고 시청">📺</button>
            <button id="hud-logout" className="hud-ad-btn" title="로그아웃">🚪</button>`;
const new_hud = `            <button id="hud-shop" className="hud-ad-btn" title="장비창">🎒</button>
            <button id="hud-achievement" className="hud-ad-btn" title="업적">🏅</button>
            <button id="hud-ad" className="hud-ad-btn" title="광고 시청">📺</button>
            <button id="hud-logout" className="hud-ad-btn" title="로그아웃">🚪</button>`;

if (c.includes(old_hud)) { c = c.replace(old_hud, new_hud); changes++; console.log("OK: achievement button added to HUD"); }
else console.log("SKIP: HUD buttons not found");

// ============================================================
// 업적/칭호 시스템: 업적 모달 HTML 추가 (login-screen 앞에)
// ============================================================
const old_modal = `      <div id="login-screen" className="screen active">`;
const new_modal = `      <div id="achievement-screen" className="screen">
        <div className="sub-box" style={{ maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
          <h2>🏅 업적</h2>
          <div id="achievement-tabs" style={{ display: "flex", gap: "4px", marginBottom: "12px", flexWrap: "wrap" }}>
            <button data-cat="all" className="ach-tab" style={{ flex: "1", padding: "6px", background: "#3498db", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", minWidth: "80px" }}>전체</button>
            <button data-cat="court" className="ach-tab" style={{ flex: "1", padding: "6px", background: "#ecf0f1", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", minWidth: "80px" }}>⚖️ 재판소</button>
            <button data-cat="town" className="ach-tab" style={{ flex: "1", padding: "6px", background: "#ecf0f1", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", minWidth: "80px" }}>🏘️ 마을</button>
            <button data-cat="shop" className="ach-tab" style={{ flex: "1", padding: "6px", background: "#ecf0f1", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", minWidth: "80px" }}>🏪 상점</button>
            <button data-cat="bath" className="ach-tab" style={{ flex: "1", padding: "6px", background: "#ecf0f1", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", minWidth: "80px" }}>🚿 정화소</button>
            <button data-cat="confession" className="ach-tab" style={{ flex: "1", padding: "6px", background: "#ecf0f1", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", minWidth: "80px" }}>⛪ 고해소</button>
            <button data-cat="status" className="ach-tab" style={{ flex: "1", padding: "6px", background: "#ecf0f1", color: "#333", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "bold", minWidth: "80px" }}>📊 상태창</button>
          </div>
          <div id="achievement-list" style={{ display: "flex", flexDirection: "column", gap: "8px" }}></div>
          <div style={{ marginTop: "12px", borderTop: "1px solid #ddd", paddingTop: "12px" }}>
            <h3 style={{ marginBottom: "8px" }}>🏷️ 칭호</h3>
            <div id="title-list" style={{ display: "flex", flexDirection: "column", gap: "6px" }}></div>
          </div>
          <button id="achievement-exit" className="btn-cancel" style={{ marginTop: "12px" }}>나가기</button>
        </div>
      </div>
      <div id="login-screen" className="screen active">`;

if (c.includes(old_modal)) { c = c.replace(old_modal, new_modal); changes++; console.log("OK: achievement modal HTML added"); }
else console.log("SKIP: login-screen not found");

// ============================================================
// 업적/칭호 시스템: SCREENS 배열에 achievement-screen 추가
// ============================================================
const old_screens = `  const SCREENS = ["login-screen","char-screen","game-screen","court-screen","bath-screen","shop-screen","ad-screen","confession-screen"];`;
const new_screens = `  const SCREENS = ["login-screen","char-screen","game-screen","court-screen","bath-screen","shop-screen","ad-screen","confession-screen","achievement-screen"];`;

if (c.includes(old_screens)) { c = c.replace(old_screens, new_screens); changes++; console.log("OK: SCREENS updated"); }
else console.log("SKIP: SCREENS not found");

// ============================================================
// 업적/칭호 시스템: def()에 achievements, titles, equippedTitle, stats 추적 추가
// ============================================================
const old_def = `    stats: { courts: 0, votes: 0, stories: 0 }, items: [], registeredStories: [],`;
const new_def = `    stats: { courts: 0, votes: 0, stories: 0, courtVisits: 0, guiltyVotes: 0, notGuiltyVotes: 0, privateSanction: 0, consecutiveCourts: 0, townVisits: { shop: 0, bath: 0, confession: 0, court: 0 }, tomatoThrows: 0, tomatoCollected: 0, eggCollected: 0, rabbitHits: 0, shopPurchases: 0, shopVisits: 0, shopTomatoEggBought: 0, shopTomatoThrows: 0, equipAllBought: false, bathVisits: 0, bathCleanRestored: 0, holywaterBought: 0, confessionVisits: 0, confessionPersonality: 0, adWatched: 0 }, items: [], registeredStories: [],
    achievements: {}, titles: {}, equippedTitle: "",`;

if (c.includes(old_def)) { c = c.replace(old_def, new_def); changes++; console.log("OK: def() updated with achievements/titles"); }
else console.log("SKIP: def() not found");

// ============================================================
// 업적/칭호 시스템: 업적 정의 및 함수 추가 (initGame 함수 내, STORIES 배열 앞)
// ============================================================
const old_stories = `  const STORIES = [`;
const new_stories = `  /* 업적 정의 */
  const ACHIEVEMENTS = [
    // 재판소
    { id: "court_01", cat: "court", name: "안녕하세요?", desc: "재판소에 처음 입장해보기", check: (s) => s.stats.courtVisits >= 1, reward: { tomatoes: 5 }, rewardType: "item" },
    { id: "court_02", cat: "court", name: "유죄인간", desc: "투표 시 피고인에게 유죄를 투표", check: (s) => s.stats.guiltyVotes >= 1, reward: { gold: 10 }, rewardType: "item" },
    { id: "court_03", cat: "court", name: "무죄인간", desc: "투표 시 피고인에게 무죄를 투표", check: (s) => s.stats.notGuiltyVotes >= 1, reward: { gold: 10 }, rewardType: "item" },
    { id: "court_04", cat: "court", name: "사적제재", desc: "투표 결과가 나오지 않은 피고인에게 토마토를 투척", check: (s) => s.stats.privateSanction >= 1, reward: { tomatoes: 5 }, rewardType: "item" },
    { id: "court_05", cat: "court", name: "재판소 죽돌이", desc: "재판소를 나가지 않고 5회 연속 참여", check: (s) => s.stats.consecutiveCourts >= 5, reward: { title: "재판소 죽돌이" }, rewardType: "title" },
    // 마을
    { id: "town_01", cat: "town", name: "마을 주민", desc: "재판소, 상점, 정화소, 고해소 모두 방문", check: (s) => s.stats.townVisits.shop > 0 && s.stats.townVisits.bath > 0 && s.stats.townVisits.confession > 0 && s.stats.townVisits.court > 0, reward: { tomatoes: 10, eggs: 10, holywater: 5, gold: 10 }, rewardType: "item" },
    { id: "town_02", cat: "town", name: "법이 필요한 사람", desc: "마을의 무작위 사람에게 토마토를 던진 횟수가 10회 돌파", check: (s) => s.stats.tomatoThrows >= 10, reward: { title: "무법자" }, rewardType: "title" },
    { id: "town_03", cat: "town", name: "토마토 수집가", desc: "토마토 덩굴에게서 토마토 10개 획득", check: (s) => s.stats.tomatoCollected >= 10, reward: { gold: 20 }, rewardType: "item" },
    { id: "town_04", cat: "town", name: "계란 수집가", desc: "닭에게서 계란 10개 획득", check: (s) => s.stats.eggCollected >= 10, reward: { gold: 20 }, rewardType: "item" },
    { id: "town_05", cat: "town", name: "토끼 사냥꾼", desc: "10초 안에 마을의 '최토끼'에게 투척 10번 성공", check: (s) => s.stats.rabbitHits >= 10, reward: { title: "토끼 사냥꾼" }, rewardType: "title" },
    // 상점
    { id: "shop_01", cat: "shop", name: "감사합니다", desc: "상점에서 물건 처음 구매해보기", check: (s) => s.stats.shopPurchases >= 1, reward: { gold: 5 }, rewardType: "item" },
    { id: "shop_02", cat: "shop", name: "장비 수집가", desc: "상점의 모든 장비를 구매", check: (s) => SHOP.every((it) => S.items.includes(it.id)), reward: { gold: 100 }, rewardType: "item" },
    { id: "shop_03", cat: "shop", name: "누구한테 던지려고", desc: "상점에서 구매한 토마토, 계란 합계가 100개 돌파", check: (s) => s.stats.shopTomatoEggBought >= 100, reward: { title: "준비된 사람" }, rewardType: "title" },
    { id: "shop_04", cat: "shop", name: "단골 고객", desc: "상점에 방문한 횟수 10회 돌파", check: (s) => s.stats.shopVisits >= 10, reward: { title: "단골 고객" }, rewardType: "title" },
    { id: "shop_05", cat: "shop", name: "진상 손님", desc: "상점에 토마토를 던진 횟수 10회 돌파", check: (s) => s.stats.shopTomatoThrows >= 10, reward: { title: "진상 손님" }, rewardType: "title" },
    // 정화소
    { id: "bath_01", cat: "bath", name: "상쾌한 하루", desc: "정화소에 처음 방문", check: (s) => s.stats.bathVisits >= 1, reward: { gold: 5 }, rewardType: "item" },
    { id: "bath_02", cat: "bath", name: "청결한 사람", desc: "정화소에서 청결도 회복 100 돌파", check: (s) => s.stats.bathCleanRestored >= 100, reward: { gold: 20 }, rewardType: "item" },
    { id: "bath_03", cat: "bath", name: "세상을 깨끗하게", desc: "성수 10회 구매", check: (s) => s.stats.holywaterBought >= 10, reward: { holywater: 5 }, rewardType: "item" },
    // 고해소
    { id: "conf_01", cat: "confession", name: "죄사함", desc: "고해소에 처음 방문", check: (s) => s.stats.confessionVisits >= 1, reward: { gold: 5 }, rewardType: "item" },
    { id: "conf_02", cat: "confession", name: "다만 악에서 구하소서", desc: "고해소에서 회복한 인성 +100 돌파", check: (s) => s.stats.confessionPersonality >= 100, reward: { gold: 20 }, rewardType: "item" },
    { id: "conf_03", cat: "confession", name: "일흔일곱번을 잘못해도", desc: "고해소에 방문한 횟수 77번 돌파", check: (s) => s.stats.confessionVisits >= 77, reward: { title: "죄 많은 사람" }, rewardType: "title" },
    // 상태창
    { id: "stat_01", cat: "status", name: "토마토 부자", desc: "보유 토마토 100개 돌파", check: (s) => S.tomatoes >= 100, reward: { title: "토마토 부자" }, rewardType: "title" },
    { id: "stat_02", cat: "status", name: "계란 부자", desc: "보유 계란 100개 돌파", check: (s) => S.eggs >= 100, reward: { title: "계란 부자" }, rewardType: "title" },
    { id: "stat_03", cat: "status", name: "성직자", desc: "보유 성수 100개 돌파", check: (s) => S.holywater >= 100, reward: { title: "성직자" }, rewardType: "title" },
    { id: "stat_04", cat: "status", name: "부자", desc: "보유 금화 100개 돌파", check: (s) => S.gold >= 100, reward: { title: "부자" }, rewardType: "title" },
    { id: "stat_05", cat: "status", name: "청결한", desc: "청결도 50 돌파", check: (s) => S.cleanliness >= 50, reward: { title: "청결한" }, rewardType: "title" },
    { id: "stat_06", cat: "status", name: "결벽증", desc: "청결도 100 달성", check: (s) => S.cleanliness >= 100, reward: { title: "결벽증" }, rewardType: "title" },
    { id: "stat_07", cat: "status", name: "인성 파탄자", desc: "인성 -100 돌파", check: (s) => S.personality <= -100, reward: { title: "인성 파탄자" }, rewardType: "title" },
    { id: "stat_08", cat: "status", name: "사탄도 이건 좀", desc: "인성 -1000 돌파", check: (s) => S.personality <= -1000, reward: { title: "사탄" }, rewardType: "title" },
    { id: "stat_09", cat: "status", name: "좋은 사람", desc: "인성 +100 돌파", check: (s) => S.personality >= 100, reward: { title: "좋은 사람" }, rewardType: "title" },
    { id: "stat_10", cat: "status", name: "성인", desc: "인성 +1000 돌파", check: (s) => S.personality >= 1000, reward: { title: "성인" }, rewardType: "title" },
    { id: "stat_11", cat: "status", name: "정의의 사도", desc: "정의 +100 돌파", check: (s) => S.justice >= 100, reward: { title: "정의의 사도" }, rewardType: "title" },
    { id: "stat_12", cat: "status", name: "TV광", desc: "광고 시청 10회 돌파", check: (s) => s.stats.adWatched >= 10, reward: { title: "TV광" }, rewardType: "title" },
  ];

  let achievementFilter = "all";

  function checkAchievements() {
    for (const ach of ACHIEVEMENTS) {
      if (!S.achievements[ach.id] && ach.check(S)) {
        S.achievements[ach.id] = "claimable";
        toast("🏅 업적 달성: " + ach.name, 4000);
      }
    }
  }

  function claimAchievement(achId) {
    const ach = ACHIEVEMENTS.find((a) => a.id === achId);
    if (!ach || S.achievements[achId] !== "claimable") return;
    const r = ach.reward;
    if (r.tomatoes) S.tomatoes += r.tomatoes;
    if (r.eggs) S.eggs += r.eggs;
    if (r.holywater) S.holywater += r.holywater;
    if (r.gold) S.gold += r.gold;
    if (r.title) { S.titles[r.title] = true; toast("🏷️ 칭호 획득: " + r.title, 4000); }
    S.achievements[achId] = "claimed";
    save(); updateHUD();
    toast("🏅 보상 수령 완료: " + ach.name, 3000);
    renderAchievements();
  }

  function renderAchievements() {
    const listEl = document.getElementById("achievement-list"); if (!listEl) return;
    listEl.innerHTML = "";
    const filtered = achievementFilter === "all" ? ACHIEVEMENTS : ACHIEVEMENTS.filter((a) => a.cat === achievementFilter);
    for (const ach of filtered) {
      const status = S.achievements[ach.id] || "locked";
      const d = document.createElement("div");
      d.style.cssText = "display:flex;align-items:center;gap:8px;padding:10px;border-radius:8px;background:" + (status === "claimed" ? "#e8f5e9" : status === "claimable" ? "#fff9c4" : "#f5f5f5") + ";border:1px solid #ddd;";
      let rewardText = "";
      const r = ach.reward;
      if (r.tomatoes) rewardText += "🍅" + r.tomatoes + " ";
      if (r.eggs) rewardText += "🥚" + r.eggs + " ";
      if (r.holywater) rewardText += "💧" + r.holywater + " ";
      if (r.gold) rewardText += "💰" + r.gold + " ";
      if (r.title) rewardText += "🏷️" + r.title;
      let btnHtml = "";
      if (status === "claimable") btnHtml = '<button class="ach-claim" data-id="' + ach.id + '" style="padding:4px 12px;background:#f39c12;color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:bold;">보상 받기</button>';
      else if (status === "claimed") btnHtml = '<span style="color:#4caf50;font-weight:bold;">✅ 완료</span>';
      else btnHtml = '<span style="color:#999;">🔒 미달성</span>';
      d.innerHTML = '<div style="flex:1;"><div style="font-weight:bold;font-size:14px;">' + ach.name + '</div><div style="font-size:12px;color:#666;">' + ach.desc + '</div><div style="font-size:11px;color:#888;margin-top:2px;">보상: ' + rewardText + '</div></div>' + btnHtml;
      listEl.appendChild(d);
    }
    /* 보상 받기 버튼 이벤트 */
    listEl.querySelectorAll(".ach-claim").forEach((btn) => { btn.addEventListener("click", () => claimAchievement(btn.dataset.id)); });
    /* 칭호 리스트 */
    const titleEl = document.getElementById("title-list"); if (titleEl) {
      titleEl.innerHTML = "";
      const ownedTitles = Object.keys(S.titles || {});
      if (ownedTitles.length === 0) { titleEl.innerHTML = '<div style="text-align:center;color:#888;padding:10px;">보유한 칭호가 없습니다.</div>'; }
      else {
        ownedTitles.forEach((t) => {
          const equipped = S.equippedTitle === t;
          const d2 = document.createElement("div");
          d2.style.cssText = "display:flex;align-items:center;gap:8px;padding:8px;border-radius:6px;background:" + (equipped ? "#e3f2fd" : "#f5f5f5") + ";border:1px solid #ddd;";
          d2.innerHTML = '<div style="flex:1;font-weight:bold;">🏷️ ' + t + '</div>' + (equipped ? '<span style="color:#1976d2;font-weight:bold;">착용중</span>' : '<button class="title-equip" data-title="' + t + '" style="padding:4px 10px;background:#3498db;color:#fff;border:none;border-radius:6px;cursor:pointer;">착용</button>');
          titleEl.appendChild(d2);
        });
        titleEl.querySelectorAll(".title-equip").forEach((btn) => { btn.addEventListener("click", () => { S.equippedTitle = btn.dataset.title; save(); renderAchievements(); toast("🏷️ 칭호 착용: " + btn.dataset.title); }); });
        /* 칭호 해제 버튼 */
        if (S.equippedTitle) {
          const unequipBtn = document.createElement("button");
          unequipBtn.style.cssText = "width:100%;padding:6px;margin-top:8px;background:#eee;color:#666;border:none;border-radius:6px;cursor:pointer;";
          unequipBtn.textContent = "칭호 해제";
          unequipBtn.addEventListener("click", () => { S.equippedTitle = ""; save(); renderAchievements(); toast("칭호 해제"); });
          titleEl.appendChild(unequipBtn);
        }
      }
    }
  }

  const STORIES = [`;

if (c.includes(old_stories)) { c = c.replace(old_stories, new_stories); changes++; console.log("OK: achievement definitions added"); }
else console.log("SKIP: STORIES not found");

// ============================================================
// 업적 버튼 이벤트 추가 (hudShop 이벤트 근처)
// ============================================================
const old_hud_shop = `  /* 장비창 버튼 - 인벤토리 열기 */
  const hudShop = document.getElementById("hud-shop");
  if (hudShop) hudShop.addEventListener("click", () => {
    showScreen("shop-screen");
    openInventory();
  });`;
const new_hud_shop = `  /* 장비창 버튼 - 인벤토리 열기 */
  const hudShop = document.getElementById("hud-shop");
  if (hudShop) hudShop.addEventListener("click", () => {
    showScreen("shop-screen");
    openInventory();
  });

  /* 업적 버튼 */
  const hudAch = document.getElementById("hud-achievement");
  if (hudAch) hudAch.addEventListener("click", () => {
    checkAchievements();
    showScreen("achievement-screen");
    renderAchievements();
  });
  const achExit = document.getElementById("achievement-exit");
  if (achExit) achExit.addEventListener("click", () => showScreen("game-screen"));
  /* 업적 탭 버튼 */
  document.querySelectorAll(".ach-tab").forEach((tab) => {
    tab.addEventListener("click", () => {
      achievementFilter = tab.dataset.cat;
      document.querySelectorAll(".ach-tab").forEach((t) => { t.style.background = "#ecf0f1"; t.style.color = "#333"; });
      tab.style.background = "#3498db"; tab.style.color = "#fff";
      renderAchievements();
    });
  });`;

if (c.includes(old_hud_shop)) { c = c.replace(old_hud_shop, new_hud_shop); changes++; console.log("OK: achievement button events added"); }
else console.log("SKIP: hudShop event not found");

// ============================================================
// 업적 추적: 재판소 입장 시 courtVisits 증가
// ============================================================
const old_enter_court = `      CP.x = 400; CP.y = 450; CP.head = P.head; CP.body = P.body; CP.name = P.name; showScreen("court-screen");`;
const new_enter_court = `      CP.x = 400; CP.y = 450; CP.head = P.head; CP.body = P.body; CP.name = P.name;
      S.stats.courtVisits++; S.stats.consecutiveCourts++; save(); checkAchievements();
      showScreen("court-screen");`;

if (c.includes(old_enter_court)) { c = c.replace(old_enter_court, new_enter_court); changes++; console.log("OK: court visit tracking"); }
else console.log("SKIP: enter court not found");

// ============================================================
// 업적 추적: 재판소 나갈 시 consecutiveCourts 리셋
// ============================================================
const old_exit_court = `  function exitCourt() { projs.length = 0; splat.length = 0; P.x = EXIT_POS.court.x; P.y = EXIT_POS.court.y; showScreen("game-screen"); toast("마을로 나왔습니다."); }`;
const new_exit_court = `  function exitCourt() { projs.length = 0; splat.length = 0; P.x = EXIT_POS.court.x; P.y = EXIT_POS.court.y; S.stats.consecutiveCourts = 0; save(); showScreen("game-screen"); toast("마을로 나왔습니다."); }`;

if (c.includes(old_exit_court)) { c = c.replace(old_exit_court, new_exit_court); changes++; console.log("OK: exit court reset consecutive"); }
else console.log("SKIP: exitCourt not found");

// ============================================================
// 업적 추적: 투표 시 guiltyVotes/notGuiltyVotes 증가
// ============================================================
const old_vote = `    ct.voted = true;
    if (v === "guilty") voteCount.guilty++; else voteCount.notGuilty++;
    S.stats.votes++; save();`;
const new_vote = `    ct.voted = true;
    if (v === "guilty") { voteCount.guilty++; S.stats.guiltyVotes++; } else { voteCount.notGuilty++; S.stats.notGuiltyVotes++; }
    S.stats.votes++; save(); checkAchievements();`;

if (c.includes(old_vote)) { c = c.replace(old_vote, new_vote); changes++; console.log("OK: vote tracking"); }
else console.log("SKIP: vote not found");

// ============================================================
// 업적 추적: 마을에서 토마토 던질 시 tomatoThrows 증가
// ============================================================
const old_throw_tomato_town = `      if (target) { target.hitLock = 20; const personalityDelta = kind === "tomato" ? -5 : -10; S.personality = Math.max(-9999, S.personality + personalityDelta); toast(kind === "egg" ? "🥚 던짐! 인성 -10" : "🍅 던짐! 인성 -5"); } else { toast(kind === "egg" ? "🥚 던짐!" : "🍅 던짐!"); }`;
const new_throw_tomato_town = `      if (target) { target.hitLock = 20; const personalityDelta = kind === "tomato" ? -5 : -10; S.personality = Math.max(-9999, S.personality + personalityDelta); if (kind === "tomato") { S.stats.tomatoThrows++; if (target.name === "최토끼") S.stats.rabbitHits++; } toast(kind === "egg" ? "🥚 던짐! 인성 -10" : "🍅 던짐! 인성 -5"); } else { toast(kind === "egg" ? "🥚 던짐!" : "🍅 던짐!"); }`;

if (c.includes(old_throw_tomato_town)) { c = c.replace(old_throw_tomato_town, new_throw_tomato_town); changes++; console.log("OK: tomato throw tracking"); }
else console.log("SKIP: town throw not found");

// ============================================================
// 업적 추적: 토마토 덩굴에서 토마토 획득
// ============================================================
const old_tomato_collect = `          S.tomatoes++; updateHUD(); save(); toast("🍅 토마토 발견! +1"); playSound("coin");`;
const new_tomato_collect = `          S.tomatoes++; S.stats.tomatoCollected++; updateHUD(); save(); checkAchievements(); toast("🍅 토마토 발견! +1"); playSound("coin");`;

if (c.includes(old_tomato_collect)) { c = c.replace(old_tomato_collect, new_tomato_collect); changes++; console.log("OK: tomato collect tracking"); }
else console.log("SKIP: tomato collect not found");

// ============================================================
// 업적 추적: 닭에서 계란 획득
// ============================================================
const old_egg_collect = `          S.eggs++; updateHUD(); save(); toast("🥚 계란 발견! +1"); playSound("coin");`;
const new_egg_collect = `          S.eggs++; S.stats.eggCollected++; updateHUD(); save(); checkAchievements(); toast("🥚 계란 발견! +1"); playSound("coin");`;

if (c.includes(old_egg_collect)) { c = c.replace(old_egg_collect, new_egg_collect); changes++; console.log("OK: egg collect tracking"); }
else console.log("SKIP: egg collect not found");

// ============================================================
// 업적 추적: 상점 방문/구매
// ============================================================
const old_open_shop = `  function openShop() {
    const g = document.getElementById("shop-grid"); if (!g) return;
    g.innerHTML = "";`;
const new_open_shop = `  function openShop() {
    const g = document.getElementById("shop-grid"); if (!g) return;
    S.stats.shopVisits++; save(); checkAchievements();
    g.innerHTML = "";`;

if (c.includes(old_open_shop)) { c = c.replace(old_open_shop, new_open_shop); changes++; console.log("OK: shop visit tracking"); }
else console.log("SKIP: openShop not found");

// ============================================================
// 업적 추적: 상점 구매 시 shopPurchases, shopTomatoEggBought 증가
// ============================================================
const old_shop_buy = `            if (it.type === "head") { S.equippedHead = it.value; P.head = it.value; }
            if (it.type === "body") { S.equippedBody = it.value; P.body = it.value; }
            updateHUD(); save(); toast(it.name + " 장착!"); openShop();`;
const new_shop_buy = `            if (it.type === "head") { S.equippedHead = it.value; P.head = it.value; }
            if (it.type === "body") { S.equippedBody = it.value; P.body = it.value; }
            S.stats.shopPurchases++; save(); checkAchievements();
            updateHUD(); save(); toast(it.name + " 장착!"); openShop();`;

if (c.includes(old_shop_buy)) { c = c.replace(old_shop_buy, new_shop_buy); changes++; console.log("OK: shop purchase tracking"); }
else console.log("SKIP: shop buy not found");

// ============================================================
// 업적 추적: 소비 아이템 구매 시 shopTomatoEggBought 증가
// ============================================================
const old_consume_buy = `          updateHUD(); save(); openShop();
          playSound("coin");
          toast(it.name + " 구매 완료!");`;
const new_consume_buy = `          S.stats.shopPurchases++;
          if (it.id === "buy-tomato" || it.id === "buy-tomato-20") S.stats.shopTomatoEggBought += (it.id === "buy-tomato" ? 5 : 20);
          if (it.id === "buy-egg" || it.id === "buy-egg-20") S.stats.shopTomatoEggBought += (it.id === "buy-egg" ? 5 : 20);
          if (it.id === "buy-holywater") S.stats.holywaterBought++;
          save(); checkAchievements();
          updateHUD(); save(); openShop();
          playSound("coin");
          toast(it.name + " 구매 완료!");`;

if (c.includes(old_consume_buy)) { c = c.replace(old_consume_buy, new_consume_buy); changes++; console.log("OK: consume buy tracking"); }
else console.log("SKIP: consume buy not found");

// ============================================================
// 업적 추적: 정화소 방문
// ============================================================
const old_open_bath = `  function openBath() {
    const g = document.getElementById("bath-grid"); if (!g) return;
    g.innerHTML = "";`;
const new_open_bath = `  function openBath() {
    const g = document.getElementById("bath-grid"); if (!g) return;
    S.stats.bathVisits++; save(); checkAchievements();
    g.innerHTML = "";`;

if (c.includes(old_open_bath)) { c = c.replace(old_open_bath, new_open_bath); changes++; console.log("OK: bath visit tracking"); }
else console.log("SKIP: openBath not found");

// ============================================================
// 업적 추적: 정화소 청결도 회복
// ============================================================
const old_bath_buy = `        if (it.id === "spa") { S.cleanliness = 100; }
        else if (it.id === "holywater") { S.holywater += 1; }
        else { const amount = parseInt(it.desc.match(/\\+(\\d+)/)[1]); S.cleanliness = Math.min(100, S.cleanliness + amount); }`;
const new_bath_buy = `        if (it.id === "spa") { S.cleanliness = 100; S.stats.bathCleanRestored += (100 - (S.cleanliness || 0)); }
        else if (it.id === "holywater") { S.holywater += 1; S.stats.holywaterBought++; }
        else { const amount = parseInt(it.desc.match(/\\+(\\d+)/)[1]); const before = S.cleanliness || 0; S.cleanliness = Math.min(100, S.cleanliness + amount); S.stats.bathCleanRestored += (S.cleanliness - before); }
        S.stats.shopPurchases++; save(); checkAchievements();`;

if (c.includes(old_bath_buy)) { c = c.replace(old_bath_buy, new_bath_buy); changes++; console.log("OK: bath buy tracking"); }
else console.log("SKIP: bath buy not found");

// ============================================================
// 업적 추적: 고해소 방문
// ============================================================
const old_conf_complete = `        S.personality = Math.min(0, S.personality + 50);
        S.cleanliness = Math.min(0, S.cleanliness + 50);
        updateHUD(); save();`;
const new_conf_complete = `        S.personality = Math.min(0, S.personality + 50);
        S.cleanliness = Math.min(0, S.cleanliness + 50);
        S.stats.confessionVisits++; S.stats.confessionPersonality += 50; save(); checkAchievements();
        updateHUD(); save();`;

if (c.includes(old_conf_complete)) { c = c.replace(old_conf_complete, new_conf_complete); changes++; console.log("OK: confession visit tracking"); }
else console.log("SKIP: confession complete not found");

// ============================================================
// 업적 추적: 광고 시청
// ============================================================
const old_ad_complete = `        S.gold += 10; updateHUD(); save();
        showScreen("game-screen"); toast("광고 완료! +10💰");`;
const new_ad_complete = `        S.gold += 10; S.stats.adWatched++; save(); checkAchievements();
        updateHUD(); save();
        showScreen("game-screen"); toast("광고 완료! +10💰");`;

if (c.includes(old_ad_complete)) { c = c.replace(old_ad_complete, new_ad_complete); changes++; console.log("OK: ad watch tracking"); }
else console.log("SKIP: ad complete not found");

// ============================================================
// 업적 추적: 마을 방문 (enterBuilding에서)
// ============================================================
const old_enter_building = `    else if (id === "shop") { showScreen("shop-screen"); openShop(); }
    else if (id === "bath") { showScreen("bath-screen"); openBath(); }
    else if (id === "confession") { enterConfession(); }`;
const new_enter_building = `    else if (id === "shop") { S.stats.townVisits.shop++; save(); checkAchievements(); showScreen("shop-screen"); openShop(); }
    else if (id === "bath") { S.stats.townVisits.bath++; save(); checkAchievements(); showScreen("bath-screen"); openBath(); }
    else if (id === "confession") { S.stats.townVisits.confession++; save(); checkAchievements(); enterConfession(); }`;

if (c.includes(old_enter_building)) { c = c.replace(old_enter_building, new_enter_building); changes++; console.log("OK: town visit tracking"); }
else console.log("SKIP: enterBuilding not found");

// ============================================================
// 업적 추적: 재판소 입장 시 townVisits.court 증가 (enterBuilding court 부분)
// ============================================================
const old_enter_court_building = `      CP.x = 400; CP.y = 450; CP.head = P.head; CP.body = P.body; CP.name = P.name;
      S.stats.courtVisits++; S.stats.consecutiveCourts++; save(); checkAchievements();
      showScreen("court-screen");`;
const new_enter_court_building = `      CP.x = 400; CP.y = 450; CP.head = P.head; CP.body = P.body; CP.name = P.name;
      S.stats.courtVisits++; S.stats.consecutiveCourts++; S.stats.townVisits.court++; save(); checkAchievements();
      showScreen("court-screen");`;

if (c.includes(old_enter_court_building)) { c = c.replace(old_enter_court_building, new_enter_court_building); changes++; console.log("OK: court town visit tracking"); }
else console.log("SKIP: enter court building not found");

// ============================================================
// 칭호 표시: drawChars에서 이름 위에 칭호 표시
// ============================================================
const old_draw_name = `      if (ch.name) {
        const tw = Math.max(40, c.measureText(ch.name).width + 12);
        c.fillStyle = "rgba(0,0,0,.65)"; c.fillRect(ch.x - tw / 2, ch.y - r - 22, tw, 18);
        c.fillStyle = "#fff"; c.font = "bold 12px sans-serif"; c.textAlign = "center";
        c.fillText(ch.name, ch.x, ch.y - r - 9);
      }`;
const new_draw_name = `      if (ch.name) {
        /* 칭호 표시 (플레이어만) */
        if (ch === P && S.equippedTitle) {
          const ttw = Math.max(50, c.measureText(S.equippedTitle).width + 16);
          c.fillStyle = "rgba(243,156,18,.85)"; c.fillRect(ch.x - ttw / 2, ch.y - r - 42, ttw, 18);
          c.fillStyle = "#fff"; c.font = "bold 11px sans-serif"; c.textAlign = "center";
          c.fillText("🏷️ " + S.equippedTitle, ch.x, ch.y - r - 29);
        }
        const tw = Math.max(40, c.measureText(ch.name).width + 12);
        c.fillStyle = "rgba(0,0,0,.65)"; c.fillRect(ch.x - tw / 2, ch.y - r - 22, tw, 18);
        c.fillStyle = "#fff"; c.font = "bold 12px sans-serif"; c.textAlign = "center";
        c.fillText(ch.name, ch.x, ch.y - r - 9);
      }`;

if (c.includes(old_draw_name)) { c = c.replace(old_draw_name, new_draw_name); changes++; console.log("OK: title display in drawChars"); }
else console.log("SKIP: draw name not found");

// ============================================================
// 칭호 표시: 재판소 CP에도 칭호 표시
// ============================================================
const old_cp_name = `    drawChars(cctx, [CP]);
    drawSpeechBubbles(cctx);
    /* 명칭을 캐릭터 위에 표시 (가려지지 않도록) */`;
const new_cp_name = `    /* CP에 칭호 표시 */
    if (S.equippedTitle) {
      const ttw = Math.max(50, cctx.measureText(S.equippedTitle).width + 16);
      cctx.fillStyle = "rgba(243,156,18,.85)"; cctx.fillRect(CP.x - ttw / 2, CP.y - CP.r - 42, ttw, 18);
      cctx.fillStyle = "#fff"; cctx.font = "bold 11px sans-serif"; cctx.textAlign = "center";
      cctx.fillText("🏷️ " + S.equippedTitle, CP.x, CP.y - CP.r - 29);
    }
    drawChars(cctx, [CP]);
    drawSpeechBubbles(cctx);
    /* 명칭을 캐릭터 위에 표시 (가려지지 않도록) */`;

if (c.includes(old_cp_name)) { c = c.replace(old_cp_name, new_cp_name); changes++; console.log("OK: title display in court"); }
else console.log("SKIP: CP name not found");

// ============================================================
// 업적 추적: 사적제재 (투표 전 토마토 투척)
// ============================================================
const old_private_sanction = `      playSound(kind === "egg" ? "splat_egg" : "splat");
      toast(kind === "egg" ? "🥚 피고인에게 투척! 정의 +10" : "🍅 피고인에게 투척! 정의 +5");`;
const new_private_sanction = `      playSound(kind === "egg" ? "splat_egg" : "splat");
      /* 사적제재: 투표 결과 나오기 전 투척 */
      const phase = PHASES[courtPhaseIdx];
      if (phase && phase.name !== "throw") S.stats.privateSanction++;
      save(); checkAchievements();
      toast(kind === "egg" ? "🥚 피고인에게 투척! 정의 +10" : "🍅 피고인에게 투척! 정의 +5");`;

if (c.includes(old_private_sanction)) { c = c.replace(old_private_sanction, new_private_sanction); changes++; console.log("OK: private sanction tracking"); }
else console.log("SKIP: private sanction not found");

// ============================================================
// checkAchievements 호출: loop()에 주기적 체크 추가
// ============================================================
const old_loop = `  function loop() {
    checkGoldReward();
    const gs = document.getElementById("game-screen");`;
const new_loop = `  function loop() {
    checkGoldReward();
    /* 업적 주기적 체크 (5초마다) */
    if (!loop._lastAchCheck || Date.now() - loop._lastAchCheck > 5000) { loop._lastAchCheck = Date.now(); checkAchievements(); }
    const gs = document.getElementById("game-screen");`;

if (c.includes(old_loop)) { c = c.replace(old_loop, new_loop); changes++; console.log("OK: loop achievement check"); }
else console.log("SKIP: loop not found");

// ============================================================
// showScreen에 achievement-screen HUD 숨김 추가
// ============================================================
const old_show_hud = `    /* HUD 표시 제어: game-screen, court-screen에서만 표시 */
    const hud = document.getElementById("hud");
    if (hud) {
      if (id === "game-screen" || id === "court-screen") hud.style.display = "flex";
      else hud.style.display = "none";
    }`;
const new_show_hud = `    /* HUD 표시 제어: game-screen, court-screen, achievement-screen에서만 표시 */
    const hud = document.getElementById("hud");
    if (hud) {
      if (id === "game-screen" || id === "court-screen" || id === "achievement-screen") hud.style.display = "flex";
      else hud.style.display = "none";
    }`;

if (c.includes(old_show_hud)) { c = c.replace(old_show_hud, new_show_hud); changes++; console.log("OK: showScreen HUD for achievement"); }
else console.log("SKIP: showScreen HUD not found");

writeFileSync(f, c, 'utf-8');
console.log("DONE: " + changes + " changes applied");