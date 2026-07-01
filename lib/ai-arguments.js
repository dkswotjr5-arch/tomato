// 로컬 AI 주장 생성 모듈 - 메인 export 파일
// 다른 모듈의 함수들을 re-export하여 하나의 인터페이스 제공

import { buildProsecutorArgs, buildLawyerArgs, extractKeywords } from "./arguments-builder.js";
import { analyzeChatContext, generateJuryChatContext } from "./chat-analyzer.js";
import { STORIES } from "./stories.js";

// ============================================================
// 공개 API - app/page.js에서 사용
// ============================================================

// 검사 주장 생성 (공개 API)
export function generateProsecutorArgs(story) {
  return buildProsecutorArgs(story);
}

// 변호사 주장 생성 (공개 API)
export function generateLawyerArgs(story) {
  return buildLawyerArgs(story);
}

// 대법관 사연 소개 멘트 생성
export function generateJudgeIntro(story) {
  if (!story) return "새로운 재판을 시작하겠습니다.";
  const short = story.length > 50 ? story.slice(0, 50) + "..." : story;
  return `오늘의 사연: "${short}" 배심원 여러분의 공정한 판단을 부탁드립니다.`;
}

// 판결 멘트 생성
export function generateVerdictComment(isGuilty, voteG, voteNG) {
  if (isGuilty) {
    if (voteG > voteNG + 3) return `압도적 유죄 (${voteG} vs ${voteNG})! 정의가 승리했습니다.`;
    if (voteG === voteNG) return `동점이나 유죄로 판결 (${voteG} vs ${voteNG}).`;
    return `유죄 판결 (${voteG} vs ${voteNG}).`;
  } else {
    if (voteNG > voteG + 3) return `압도적 무죄 (${voteG} vs ${voteNG})! 참작 사유 인정.`;
    if (voteG === voteNG) return `동점이나 무죄로 판결 (${voteG} vs ${voteNG}).`;
    return `무죄 판결 (${voteG} vs ${voteNG}).`;
  }
}

// 사연을 Firestore에 저장 (학습용 히스토리)
export function buildStoryRecord(story, verdict, voteG, voteNG) {
  return {
    text: story,
    verdict: verdict ? "guilty" : "notGuilty",
    voteGuilty: voteG,
    voteNotGuilty: voteNG,
    timestamp: Date.now(),
    keywords: extractKeywords(story).map((k) => k.kw),
  };
}

// AI가 학습하여 랜덤 사연 생성
// 반환값: { title, defendant, content }
export function generateRandomStory() {
  const story = STORIES[Math.floor(Math.random() * STORIES.length)];
  return {
    title: story.title,
    defendant: story.defendant,
    content: story.content,
  };
}

// 모든 사연 목록 반환 (내용만)
export function getAllStories() {
  return STORIES.map((s) => s.content);
}

// 죄목 생성 함수
export function generateCharge(story, chatOpinions) {
  if (!story) return "알 수 없는 죄";
  const lower = story.toLowerCase();
  const charges = [];

  // 키워드 기반 죄목 매핑
  const chargeMap = [
    { kw: ["돈", "안 갚", "빌려", "빚"], charge: "사기죄" },
    { kw: ["재산", "유산", "상속", "적금"], charge: "횡령죄" },
    { kw: ["절도", "훔친", "주웠", "지갑", "결제"], charge: "절도죄" },
    { kw: ["바람", "거짓말", "속인"], charge: "사기죄" },
    { kw: ["음주운전", "운전", "과속", "무단횡단"], charge: "위험운전치상죄" },
    { kw: ["폭행", "때린", "때리", "혼낸"], charge: "폭행죄" },
    { kw: ["불법", "다운로드"], charge: "저작권위반죄" },
    { kw: ["학교폭력", "괴롭"], charge: "학교폭력치상죄" },
    { kw: ["부정행위", "커닝", "시험지"], charge: "부정행위방지법위반죄" },
    { kw: ["구조조정", "내부정보", "기밀", "내부고발"], charge: "내부자거래죄" },
    { kw: ["CCTV", "얼굴인식", "사생활"], charge: "사생활침해죄" },
    { kw: ["SNS", "발언", "리뷰", "별점"], charge: "명예훼손죄" },
    { kw: ["반려견", "치료비", "입양"], charge: "동물학대방치죄" },
    { kw: ["휴대폰", "몰래", "녹음", "연락처"], charge: "사생활침해죄" },
    { kw: ["신고"], charge: "은닉죄" },
    { kw: ["층간소음", "소음"], charge: "소음민원위반죄" },
    { kw: ["담배", "베란다"], charge: "공동주거위반죄" },
    { kw: ["파혼", "결혼"], charge: "약혼파기죄" },
    { kw: ["주차", "차량"], charge: "주차위반죄" },
    { kw: ["쓰레기"], charge: "폐기물투기죄" },
    { kw: ["흠집", "망가뜨"], charge: "재물손괴죄" },
    { kw: ["범죄", "묵인"], charge: "범인은닉죄" },
    { kw: ["경력", "면접"], charge: "경력위조죄" },
    { kw: ["공동 계좌"], charge: "횡령죄" },
    { kw: ["아이", "혼자"], charge: "아동학대죄" },
    { kw: ["새치기"], charge: "공공질서문란죄" },
    { kw: ["차단"], charge: "인간관계파괴죄" },
    { kw: ["약속"], charge: "신뢰위반죄" },
    { kw: ["축의금"], charge: "인간관계파괴죄" },
    { kw: ["사무용품"], charge: "횡령죄" },
    { kw: ["연애"], charge: "사생활침해죄" },
    { kw: ["이사"], charge: "의리위반죄" },
    { kw: ["사회"], charge: "의리위반죄" },
    { kw: ["청소"], charge: "공동체의무위반죄" },
    { kw: ["냄새"], charge: "공동주거위반죄" },
    { kw: ["택배"], charge: "물건분실죄" },
    { kw: ["계산"], charge: "무임승차죄" },
    { kw: ["모임"], charge: "따돌림죄" },
    { kw: ["용돈"], charge: "가족의무위반죄" },
    { kw: ["유언"], charge: "유언위반죄" },
    { kw: ["학교", "선생님"], charge: "업무방해죄" },
    { kw: ["싸움"], charge: "개입과잉죄" },
    { kw: ["샴푸"], charge: "사생활침해죄" },
    { kw: ["공동 육아"], charge: "공동체의무위반죄" },
    { kw: ["공동 구매"], charge: "신뢰위반죄" },
    { kw: ["이직"], charge: "의리위반죄" },
  ];

  for (const cm of chargeMap) {
    if (cm.kw.some((k) => lower.includes(k.toLowerCase()))) {
      charges.push(cm.charge);
    }
  }

  // 창의적 죄목 (사연 내용 기반, 가벼운 죄목만)
  const creativeCharges = [
    "토마토 과다 섭취죄",
    "인간관계 파괴죄",
    "신뢰 배신죄",
    "양심 훼손죄",
    "도덕적 나태죄",
    "공감능력 결여죄",
    "사회적 신뢰 남용죄",
    "인간성 상실죄",
    "배신특별법위반죄",
    "무책임죄",
    "인간관계 훼손죄",
    "도덕불감증죄",
    "약속 위반죄",
    "친목질 방해죄",
    "분위기 챙김 의무 위반죄",
    "공감 능력 미달죄",
    "인간성 일부 상실죄",
    "사회적 거리두기 실패죄",
  ];

  // 채팅 여론이 유죄 쪽이 압도적이면 더 무거운 죄목
  if (chatOpinions && chatOpinions.guilty > chatOpinions.notGuilty * 2) {
    charges.push("사회적 신뢰 파괴죄", "중도의식 결여죄");
  }

  // 키워드 매칭이 있으면 그것을 우선, 없으면 창의적 죄목
  if (charges.length > 0) {
    return charges[Math.floor(Math.random() * charges.length)];
  }
  return creativeCharges[Math.floor(Math.random() * creativeCharges.length)];
}

// Re-export from other modules
export { analyzeChatContext, generateJuryChatContext, extractKeywords };
