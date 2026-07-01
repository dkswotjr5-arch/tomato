// 게임 상수 정의 모듈
// page.js에서 추출하여 재사용 가능하도록 모듈화

// ========== 맵 크기 ==========
export const MAP_W = 1600;
export const MAP_H = 1100;

// ========== 화면 목록 ==========
export const SCREENS = [
  "login-screen",
  "char-screen",
  "game-screen",
  "court-screen",
  "bath-screen",
  "shop-screen",
  "ad-screen",
  "confession-screen",
];

// ========== 마을 건물 ==========
export const BUILDINGS = [
  { id: "shop", label: "🏪 상점", x: 200, y: 180, w: 200, h: 160, color: "#2c3e50" },
  { id: "court", label: "⚖️ 재판소", x: 660, y: 140, w: 280, h: 200, color: "#8B4513" },
  { id: "bath", label: "🚿 정화소", x: 1220, y: 180, w: 200, h: 160, color: "#3498db" },
  { id: "confession", label: "⛪ 고해소", x: 970, y: 180, w: 180, h: 140, color: "#6a1b9a" },
];

// ========== 마을 장식물 ==========
export const DECOS = [
  { type: "fountain", x: 800, y: 620, r: 70 },
  { type: "tree", x: 80, y: 420 },
  { type: "tree", x: 1520, y: 420 },
  { type: "bench", x: 400, y: 720 },
  { type: "bench", x: 1200, y: 720 },
  { type: "tree", x: 400, y: 920 },
  { type: "tree", x: 1200, y: 920 },
  { type: "lamp", x: 600, y: 450 },
  { type: "lamp", x: 1000, y: 450 },
  { type: "lamp", x: 300, y: 650 },
  { type: "lamp", x: 1300, y: 650 },
  { type: "flowerbed", x: 550, y: 680, w: 100, h: 40 },
  { type: "flowerbed", x: 1050, y: 680, w: 100, h: 40 },
  { type: "fence", x: 40, y: 360, w: 80, h: 8 },
  { type: "fence", x: 40, y: 380, w: 8, h: 80 },
  { type: "fence", x: 1520, y: 360, w: 80, h: 8 },
  { type: "fence", x: 1592, y: 380, w: 8, h: 80 },
  { type: "cart", x: 620, y: 780 },
  { type: "cart", x: 980, y: 780 },
  { type: "well", x: 160, y: 580, r: 30 },
  { type: "well", x: 1440, y: 580, r: 30 },
  { type: "bush", x: 250, y: 450 },
  { type: "bush", x: 1350, y: 450 },
  { type: "bush", x: 700, y: 480 },
  { type: "bush", x: 900, y: 480 },
  { type: "scarecrow", x: 800, y: 1000 },
  { type: "signpost", x: 480, y: 550 },
  { type: "signpost", x: 1120, y: 550 },
];

// ========== NPC 채팅 내용 ==========
export const NPC_CHATS = {
  김판사: ["오늘도 평화로운 하루네요", "재판소에 한번 가볼까?", "정의는 살아있다!", "토마토 좀 던지고 싶네", "요즘 사연이 흥미롭더군"],
  박변호: ["법은 완벽하지 않지", "모두에게 변호사가 필요해", "정의를 위해!", "오늘도 좋은 하루", "사건 의뢰 받습니다"],
  최배심: ["배심원의 의무란...", "판결은 쉽지 않아", "양쪽 다 들어봐야 해", "공정하게 판단하자", "증거가 중요하지"],
  정이사: ["경영이 쉽지 않아", "주주들 압박이 심해", "성장이 최고지", "혁신이 필요해", "투자를 고민중이야"],
  최토끼: ["당근 좋아!", "깡총깡총", "토끼가 세계를 지배한다", "오늘도 뛰뛰", "간식 시간이다!"],
};

// ========== 마을 시민 NPC ==========
export const CITIZENS = [
  { x: 200, y: 620, head: "😎", body: "#e74c3c", name: "김판사", speed: 0.3, chatTimer: 0 },
  { x: 600, y: 720, head: "🤓", body: "#27ae60", name: "박변호", speed: 0.3, chatTimer: 0 },
  { x: 1000, y: 620, head: "😤", body: "#9b59b6", name: "최배심", speed: 0.3, chatTimer: 0 },
  { x: 1300, y: 800, head: "😇", body: "#f39c12", name: "정이사", speed: 0.3, chatTimer: 0 },
  { x: 900, y: 900, head: "🐰", body: "#e91e63", name: "최토끼", speed: 0.3, chatTimer: 0 },
];

// ========== 재판소 구조 ==========
export const COURT_W = 800;
export const COURT_H = 500;

export const JURY_LEFT = { x: 10, y: 380, w: 160, h: 100, color: "#c62828" };
export const JURY_CENTER = { x: 200, y: 400, w: 400, h: 90, color: "#5d4037" };
export const JURY_RIGHT = { x: 630, y: 380, w: 160, h: 100, color: "#1565c0" };
export const JURY_AREAS = [JURY_LEFT, JURY_CENTER, JURY_RIGHT];

export const DEFENDANT_SEAT = { x: 400, y: 280, r: 18 };

// ========== 재판소 NPC ==========
export const COURT_NPCS = [
  { x: 120, y: 165, r: 18, head: "🔍", body: "#c62828", name: "검사", speed: 0, vx: 0, range: [100, 140, 140, 160] },
  { x: 680, y: 165, r: 18, head: "🛡️", body: "#1565c0", name: "변호사", speed: 0, vx: 0, range: [660, 700, 140, 160] },
  { x: 400, y: 55, r: 22, head: "👑", body: "#d4af37", name: "대법관", speed: 0, vx: 0, range: [380, 420, 50, 70] },
  { x: 340, y: 240, r: 16, head: "💂", body: "#37474f", name: "경호원1", speed: 0, vx: 0, range: [320, 360, 220, 260] },
  { x: 460, y: 240, r: 16, head: "💂", body: "#37474f", name: "경호원2", speed: 0, vx: 0, range: [440, 480, 220, 260] },
];

// ========== 배심원 NPC ==========
export const JURY_NPCS = [
  { x: 50, y: 410, r: 14, head: "😠", body: "#c62828", name: "강검사", side: "guilty", chatTimer: 0 },
  { x: 90, y: 440, r: 14, head: "😤", body: "#c62828", name: "엄판사", side: "guilty", chatTimer: 0 },
  { x: 130, y: 410, r: 14, head: "😡", body: "#c62828", name: "철검사", side: "guilty", chatTimer: 0 },
  { x: 670, y: 410, r: 14, head: "🥺", body: "#1565c0", name: "온변호", side: "notGuilty", chatTimer: 0 },
  { x: 710, y: 440, r: 14, head: "😇", body: "#1565c0", name: "인판사", side: "notGuilty", chatTimer: 0 },
  { x: 750, y: 410, r: 14, head: "🤗", body: "#1565c0", name: "자변호", side: "notGuilty", chatTimer: 0 },
];

// ========== 재판 단계 시스템 ==========
export const PHASES = [
  { name: "prep", label: "재판 준비", duration: 20 },
  { name: "intro", label: "사연 소개", duration: 10 },
  { name: "trial", label: "재판 진행", duration: 60 },
  { name: "vote", label: "투표", duration: 10 },
  { name: "verdict", label: "판결", duration: 10 },
  { name: "throw", label: "투척", duration: 10 },
];

// ========== 상점 아이템 ==========
export const SHOP = [
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

// ========== 정화소 아이템 ==========
export const BATH_ITEMS = [
  { id: "soap", name: "비누", ic: "🧼", price: 10, desc: "청결도 +20" },
  { id: "towel", name: "수건", ic: "🧖", price: 20, desc: "청결도 +50" },
  { id: "shower", name: "샤워기", ic: "🚿", price: 50, desc: "청결도 +100" },
  { id: "spa", name: "스파", ic: "♨️", price: 100, desc: "청결도 MAX" },
  { id: "holywater", name: "성수", ic: "💧", price: 30, desc: "성수 +1" },
];

// ========== 기타 상수 ==========
export const CHATS = [
  "이건 좀 심각하네요...",
  "피해자에게 동정표",
  "제 경험상 유죄 같아요",
  "변호인 의견은?",
  "사정있을 수도...",
  "완전히 잘못했어요",
  "무죄입니다!",
];

// ========== 투척 존 (재판소) ==========
export const GUILTY_ZONE = { x: 10, y: 380, w: 160, h: 100 };
export const NOTGUILTY_ZONE = { x: 630, y: 380, w: 160, h: 100 };
export const CENTER_ZONE = { x: 200, y: 400, w: 400, h: 90 };

// ========== 나가기 위치 (각 건물 앞) ==========
export const EXIT_POS = {
  court: { x: 800, y: 400 },
  bath: { x: 1320, y: 420 },
  confession: { x: 1060, y: 420 },
  shop: { x: 300, y: 420 },
};
