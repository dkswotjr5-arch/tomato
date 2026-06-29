// 로컬 AI 주장 생성 모듈
// 사연 텍스트를 분석해 검사(불리한 주장)와 변호사(유리한 주장)를 생성합니다.
// 외부 AI API 없이 키워드 학습 기반으로 동작합니다.

// 사연에서 키워드 추출
function extractKeywords(story) {
  if (!story || typeof story !== "string") return [];
  const keywords = [];
  const lower = story.toLowerCase();

  const actions = [
    { kw: "몰래", weight: 3, type: "bad" },
    { kw: "거절", weight: 2, type: "neutral" },
    { kw: "늦", weight: 2, type: "bad" },
    { kw: "안 갚", weight: 3, type: "bad" },
    { kw: "시끄럽", weight: 2, type: "bad" },
    { kw: "연락", weight: 1, type: "neutral" },
    { kw: "허락 없이", weight: 3, type: "bad" },
    { kw: "돌아", weight: 1, type: "neutral" },
    { kw: "손절", weight: 2, type: "bad" },
    { kw: "봤", weight: 2, type: "bad" },
    { kw: "싸해", weight: 1, type: "bad" },
    { kw: "결혼식", weight: 1, type: "neutral" },
    { kw: "회식", weight: 1, type: "neutral" },
    { kw: "룸메이트", weight: 1, type: "neutral" },
    { kw: "상사", weight: 1, type: "neutral" },
    { kw: "SNS", weight: 1, type: "neutral" },
    { kw: "소개팅", weight: 1, type: "neutral" },
    { kw: "돈", weight: 2, type: "bad" },
    { kw: "사진", weight: 1, type: "neutral" },
    { kw: "주말", weight: 1, type: "neutral" },
    { kw: "밤", weight: 1, type: "neutral" },
    { kw: "치매", weight: 2, type: "neutral" },
    { kw: "운전", weight: 1, type: "neutral" },
    { kw: "면허", weight: 1, type: "neutral" },
    { kw: "재산", weight: 2, type: "bad" },
    { kw: "유산", weight: 2, type: "bad" },
    { kw: "바람", weight: 3, type: "bad" },
    { kw: "신뢰", weight: 2, type: "neutral" },
    { kw: "아이", weight: 2, type: "neutral" },
    { kw: "양보", weight: 1, type: "neutral" },
    { kw: "휴대폰", weight: 1, type: "neutral" },
    { kw: "사기", weight: 3, type: "bad" },
    { kw: "면접", weight: 1, type: "neutral" },
    { kw: "거짓말", weight: 3, type: "bad" },
    { kw: "음주운전", weight: 3, type: "bad" },
    { kw: "신고", weight: 2, type: "neutral" },
    { kw: "규정", weight: 1, type: "neutral" },
    { kw: "무능", weight: 2, type: "bad" },
    { kw: "승진", weight: 1, type: "neutral" },
    { kw: "구조조정", weight: 2, type: "bad" },
    { kw: "현금", weight: 2, type: "neutral" },
    { kw: "주웠", weight: 2, type: "neutral" },
    { kw: "불법", weight: 3, type: "bad" },
    { kw: "절도", weight: 3, type: "bad" },
    { kw: "수술비", weight: 2, type: "neutral" },
    { kw: "학교폭력", weight: 3, type: "bad" },
    { kw: "봉사", weight: 1, type: "neutral" },
    { kw: "반성", weight: 1, type: "neutral" },
    { kw: "의사", weight: 1, type: "neutral" },
    { kw: "생존", weight: 2, type: "neutral" },
    { kw: "응급실", weight: 2, type: "neutral" },
    { kw: "AI", weight: 2, type: "neutral" },
    { kw: "판결", weight: 1, type: "neutral" },
    { kw: "저작권", weight: 2, type: "neutral" },
    { kw: "유명인", weight: 1, type: "neutral" },
    { kw: "발언", weight: 1, type: "neutral" },
    { kw: "광고", weight: 1, type: "neutral" },
    { kw: "우울증", weight: 2, type: "bad" },
    { kw: "부정행위", weight: 3, type: "bad" },
    { kw: "간병", weight: 1, type: "neutral" },
    { kw: "퇴학", weight: 2, type: "bad" },
    { kw: "노숙", weight: 2, type: "neutral" },
    { kw: "CCTV", weight: 2, type: "neutral" },
    { kw: "사생활", weight: 2, type: "neutral" },
    { kw: "수혈", weight: 2, type: "neutral" },
    { kw: "종교", weight: 1, type: "neutral" },
    { kw: "성매매", weight: 3, type: "bad" },
    { kw: "발명", weight: 1, type: "neutral" },
    { kw: "꿈", weight: 1, type: "neutral" },
    { kw: "해외", weight: 1, type: "neutral" },
    { kw: "반려견", weight: 2, type: "neutral" },
    { kw: "치료비", weight: 2, type: "neutral" },
  ];

  for (const a of actions) {
    if (lower.includes(a.kw.toLowerCase())) {
      keywords.push({ ...a });
    }
  }

  if (story.length > 30) keywords.push({ kw: "긴사연", weight: 1, type: "neutral" });

  return keywords;
}

// 검사 주장 생성 (피고인에게 불리한)
export function generateProsecutorArgs(story) {
  if (!story) return ["피고인의 행위는 명백한 잘못입니다!"];
  const kws = extractKeywords(story);
  const args = [];
  const hasBad = kws.some((k) => k.type === "bad");

  if (kws.some((k) => k.kw === "치매")) args.push("치매 초기라도 운전은 타인의 생명을 위협하는 행위입니다!");
  if (kws.some((k) => k.kw === "재산" || k.kw === "유산")) args.push("형평성에 어긋나는 유산 분배는 가족 간 갈등의 원인이 됩니다!");
  if (kws.some((k) => k.kw === "바람")) args.push("과거의 바람이든 현재든 신뢰의 근본을 무너뜨리는 행위입니다!");
  if (kws.some((k) => k.kw === "거짓말")) args.push("면접에서 거짓말로 합격한 것은 부정직한 행위이며 다른 지원자에게 불공정합니다!");
  if (kws.some((k) => k.kw === "음주운전")) args.push("음주운전은 사고가 없었어도 잠재적 살인 행위입니다!");
  if (kws.some((k) => k.kw === "불법")) args.push("어떤 이유로든 불법으로 돈을 버는 것은 범죄입니다!");
  if (kws.some((k) => k.kw === "절도")) args.push("아이 수술비라는 이유로 절도는 정당화될 수 없습니다!");
  if (kws.some((k) => k.kw === "학교폭력")) args.push("과거의 학교폭력은 피해자에게 평생 상처를 남깁니다!");
  if (kws.some((k) => k.kw === "부정행위")) args.push("부정행위는 어떤 사정이라도 용납될 수 없는 행위입니다!");
  if (kws.some((k) => k.kw === "성매매")) args.push("예비 배우자의 과거 성매매 사실은 숨겨서는 안 됩니다!");
  if (kws.some((k) => k.kw === "몰래")) args.push("피고인은 '몰래' 행동했으며, 이는 의도적인 사생활 침해입니다!");
  if (kws.some((k) => k.kw === "안 갚")) args.push("빌린 돈을 갚지 않는 것은 명백한 신용 위반입니다!");
  if (kws.some((k) => k.kw === "허락 없이")) args.push("타인의 동의 없이 행동하는 것은 권리 침해입니다!");
  if (kws.some((k) => k.kw === "구조조정")) args.push("내부 정보를 사적으로 공유하는 것은 공정성을 해칩니다!");

  if (args.length < 3) args.push("피고인의 행위는 사회적 신뢰를 훼손합니다!");
  if (args.length < 3) args.push("이러한 행동은 반복될 우려가 있으며 엄중한 처벌이 필요합니다!");
  if (hasBad && args.length < 4) args.push("피고인은 자신의 행동이 미친 영향을 인식하지 못합니다!");

  return args.slice(0, 4);
}

// 변호사 주장 생성 (피고인에게 유리한)
export function generateLawyerArgs(story) {
  if (!story) return ["피고인에게는 사정이 있습니다."];
  const kws = extractKeywords(story);
  const args = [];

  if (kws.some((k) => k.kw === "치매")) args.push("아버지의 자립심을 존중해야 하며, 단계적 운전 감소가 더 효과적입니다.");
  if (kws.some((k) => k.kw === "재산" || k.kw === "유산")) args.push("부모님의 뜻을 존중하는 것이 가족의 화목을 위한 길입니다.");
  if (kws.some((k) => k.kw === "바람")) args.push("과거의 일이며 현재 관계에서는 충실합니다. 한 번의 실수로 모든 것을 판단할 수 없습니다.");
  if (kws.some((k) => k.kw === "거짓말")) args.push("능력은 충분하며, 면접에서의 거짓말은 불가피한 상황이었습니다.");
  if (kws.some((k) => k.kw === "음주운전")) args.push("사고가 없었고, 본인도 깊이 반성하고 있습니다.");
  if (kws.some((k) => k.kw === "불법")) args.push("부모님의 생명을 구하기 위한 절박한 선택이었습니다.");
  if (kws.some((k) => k.kw === "절도")) args.push("아이의 생명을 구하기 위한 극단적 상황이었으며, 정상 참작이 필요합니다.");
  if (kws.some((k) => k.kw === "학교폭력")) args.push("수년간 봉사하며 진심으로 반성했고, 완전히 달라진 사람입니다.");
  if (kws.some((k) => k.kw === "부정행위")) args.push("장기간 간병으로 공부할 시간이 없었던 극단적 상황이었습니다.");
  if (kws.some((k) => k.kw === "성매매")) args.push("과거의 일이며 현재는 다른 사람입니다. 굳이 말할 의무가 있을까요?");
  if (kws.some((k) => k.kw === "몰래")) args.push("순간적인 호기심이었을 뿐, 악의적 의도는 없었습니다.");
  if (kws.some((k) => k.kw === "안 갚")) args.push("경제적 어려움으로 일시적으로 상환이 지연된 것뿐입니다.");
  if (kws.some((k) => k.kw === "구조조정")) args.push("친한 동료에게 미리 알려주는 것은 인간적 도리입니다.");

  if (args.length < 3) args.push("피고인에게는 충분히 참작할 사정이 있습니다.");
  if (args.length < 3) args.push("한 번의 실수로 모든 것을 판단하는 것은 옳지 않습니다.");
  if (args.length < 4) args.push("누구나 실수를 할 수 있습니다. 두 번째 기회를 주십시오.");

  return args.slice(0, 4);
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

// AI가 학습하여 비슷한 사연 생성 (문제 20)
const STORY_CATEGORIES = [
  {
    category: "가족",
    templates: [
      "아버지가 치매 초기 진단을 받았다. 운전을 계속하고 싶어 하지만 사고가 걱정된다. 면허를 반납하도록 설득해야 하는가?",
      "동생은 부모님을 거의 돌보지 않는다. 하지만 부모님은 재산 대부분을 동생에게 물려주려 한다. 개입해야 하는가?",
      "부모님이 평생 모은 돈을 내 결혼 자금으로 쓰려 한다. 하지만 그 돈은 부모님의 노후 자금이다. 받아야 하는가?",
    ],
  },
  {
    category: "연인",
    templates: [
      "애인이 과거에 바람을 피운 적이 있다는 사실을 우연히 알게 되었다. 그 일은 나를 만나기 전의 일이었다. 신뢰를 이유로 헤어져야 하는가?",
      "결혼을 앞두고 있는데 상대는 아이를 원하고 나는 원하지 않는다. 둘 다 서로를 사랑한다. 누가 양보해야 하는가?",
      "애인이 내 휴대폰을 몰래 봤다. 하지만 그 덕분에 내가 큰 사기를 당할 뻔한 사실을 막았다. 용서해야 하는가?",
    ],
  },
  {
    category: "친구",
    templates: [
      "친구가 면접에서 거짓말을 해서 합격했다. 회사에는 도움이 될 만한 능력은 충분히 갖고 있다. 회사에 알려야 하는가?",
      "친한 친구가 음주운전을 했다. 다행히 사고는 없었다. 신고해야 하는가?",
    ],
  },
  {
    category: "직장",
    templates: [
      "동료가 회사 규정을 어기고 업무를 처리한다. 덕분에 프로젝트는 항상 성공한다. 규정을 지키게 해야 하는가?",
      "상사는 매우 무능하지만 인간적으로는 좋은 사람이다. 그가 승진하면 회사는 손해를 볼 가능성이 높다. 솔직하게 평가해야 하는가?",
      "회사가 대규모 구조조정을 앞두고 있다. 나만 미리 정보를 알게 되었다. 친한 동료에게 알려줘야 하는가?",
    ],
  },
  {
    category: "돈",
    templates: [
      "길에서 현금 500만 원이 든 가방을 주웠다. 주인을 찾기 어렵다. 얼마 동안 찾아보고 포기해도 되는가?",
      "부모님의 병원비를 마련하기 위해 불법 다운로드로 돈을 벌 수 있는 일을 제안받았다. 해야 하는가?",
    ],
  },
  {
    category: "정의",
    templates: [
      "절도범이 훔친 돈은 자신의 아이 수술비였다. 처벌은 그대로 받아야 하는가?",
      "학교폭력 가해자가 진심으로 반성하며 봉사활동을 수년간 했다. 과거를 계속 공개해야 하는가?",
    ],
  },
  {
    category: "생명",
    templates: [
      "의사가 생존 가능성이 낮은 환자를 끝까지 치료해야 하는가, 아니면 다른 환자에게 의료 자원을 써야 하는가?",
      "응급실에 환자가 두 명 동시에 왔다. 한 명은 어린아이, 다른 한 명은 사회적으로 중요한 연구자다. 누구를 먼저 치료해야 하는가?",
    ],
  },
  {
    category: "AI",
    templates: [
      "AI가 사람보다 훨씬 정확하게 판결을 내린다. 최종 판결도 AI에게 맡겨야 하는가?",
      "AI가 만든 그림이 인간 화가보다 훨씬 인기 있다. AI 작품도 저작권을 가져야 하는가?",
    ],
  },
  {
    category: "SNS",
    templates: [
      "유명인이 과거에 했던 문제 발언이 다시 퍼졌다. 현재는 완전히 다른 사람이 되었다. 광고 계약을 취소해야 하는가?",
      "친구가 우울증을 암시하는 글을 올렸다. 본인은 장난이라고 한다. 주변 사람들에게 알려야 하는가?",
    ],
  },
  {
    category: "교육",
    templates: [
      "시험 부정행위를 한 학생이 있다. 하지만 그 학생은 장기간 부모의 간병을 하느라 공부할 시간이 거의 없었다. 퇴학시켜야 하는가?",
    ],
  },
  {
    category: "사회",
    templates: [
      "노숙인이 공원 벤치에서 생활한다. 주민들은 불안해한다. 강제로 퇴거시켜야 하는가?",
      "범죄 예방을 위해 도시 전체에 얼굴 인식 CCTV를 설치하려 한다. 사생활 침해를 감수해야 하는가?",
    ],
  },
  {
    category: "의료",
    templates: [
      "부모가 종교적 이유로 아이의 수혈을 거부한다. 의사는 부모 의사를 존중해야 하는가?",
    ],
  },
  {
    category: "윤리",
    templates: [
      "친구가 결혼을 앞두고 있다. 예비 배우자가 과거에 성매매를 했던 사실을 알게 되었다. 말해야 하는가?",
      "내가 만든 발명품을 경쟁 회사가 훨씬 더 잘 활용할 수 있다. 회사를 옮겨야 하는가?",
    ],
  },
  {
    category: "현실적 고민",
    templates: [
      "친구 결혼식과 부모님의 수술 날짜가 겹쳤다. 어디에 가야 하는가?",
      "오랜 꿈을 이루기 위해 해외로 떠나면 가족을 몇 년 동안 돌볼 수 없다. 꿈을 선택해야 하는가?",
      "반려견 치료비는 1,000만 원이다. 치료하면 성공 확률은 20%다. 치료를 계속해야 하는가?",
    ],
  },
];

// AI가 학습하여 랜덤 사연 생성
export function generateRandomStory() {
  const cat = STORY_CATEGORIES[Math.floor(Math.random() * STORY_CATEGORIES.length)];
  const story = cat.templates[Math.floor(Math.random() * cat.templates.length)];
  return story;
}

// 모든 사연 목록 반환
// #89: 유죄/무죄 판결이 가능한 사연만 반환 (중립적 사연 제외)
export function getAllStories() {
  const neutralKeywords = [
    "누가 양보해야 하는가",
    "어디에 가야 하는가",
    "누구를 먼저 치료해야 하는가",
    "얼마 동안 찾아보고 포기해도 되는가",
  ];
  return STORY_CATEGORIES.flatMap((cat) =>
    cat.templates.filter((t) => !neutralKeywords.some((nk) => t.includes(nk)))
  );
}

// AI가 채팅 내용과 사연 맥락을 분석하여 유죄/무죄/중립 판단 (#86)
export function analyzeChatContext(chatText, story) {
  if (!chatText) return { opinion: "neutral", score: 0 };
  const lower = chatText.toLowerCase();

  // 부정어 감지
  const negators = ["안 ", "못", "아니", "없", "아닌", "거짓", "틀린"];
  const hasNegator = (text, keyword) => {
    const idx = text.indexOf(keyword);
    if (idx === -1) return false;
    const before = text.slice(Math.max(0, idx - 10), idx);
    return negators.some((n) => before.includes(n));
  };

  let guiltyScore = 0;
  let notGuiltyScore = 0;

  // 직접적 유죄/무죄 표현
  const directGuilty = ["유죄", "처벌", "벌받", "감옥", "징역", "벌금", "죄인", "범죄", "유죄다", "유죄임"];
  const directNotGuilty = ["무죄", "용서", "선처", "면죄", "무죄다", "무죄임", "풀어줘", "놓아줘"];
  for (const kw of directGuilty) {
    if (lower.includes(kw.toLowerCase()) && !hasNegator(lower, kw.toLowerCase())) guiltyScore += 3;
  }
  for (const kw of directNotGuilty) {
    if (lower.includes(kw.toLowerCase()) && !hasNegator(lower, kw.toLowerCase())) notGuiltyScore += 3;
  }

  // 행동/성격 비난 (유죄 맥락) - #91: 다양한 어미 변형 포함
  const blameKws = [
    "잘못", "잘못했", "잘못된", "잘못하",
    "나쁘", "나빠", "나빴", "나쁜", "나쁘네", "나쁘다", "나쁘고", "나쁜지",
    "문제", "문제있", "문제다", "문제네",
    "비난", "비난받", "비난해",
    "비판", "비판받", "비판해",
    "책임", "책임져", "책임이", "책임을",
    "태만", "무책임", "이기적", "이기주의",
    "거짓말", "속임", "사기", "도둑", "훔친", "훔치",
    "폭력", "위험", "불법", "부정", "위반",
    "반성 안", "사과 안", "인정 안",
    "악", "악한", "악하",
    "혐오", "분노", "응징", "마땅", "당연",
    "범인", "범죄자",
    "죄", "죄인", "죄책",
    "유죄", "유죄다", "유죄임", "유죄네",
    "처벌", "벌", "벌받", "감옥", "징역", "벌금",
    "응징해", "처벌해", "벌줘",
    "못됐", "못된", "못하",
    "심하", "심한", "지나치", "지나친",
    "아니다", "아닌", "틀린", "틀려",
    "당연히", "마땅히",
    "비열", "비열한", "저열", "저열한",
    "파렴치", "불량", "불량한",
  ];
  for (const kw of blameKws) {
    if (lower.includes(kw.toLowerCase()) && !hasNegator(lower, kw.toLowerCase())) guiltyScore += 1;
  }

  // 동정/참작 (무죄 맥락) - #91: 다양한 어미 변형 포함
  const sympathyKws = [
    "사정", "사정이", "사정을", "사정있",
    "기회", "기회를", "기회줘", "기회다",
    "참작", "참작해", "참작해야",
    "봉사", "봉사했", "봉사하",
    "달라졌", "달라진", "변했", "변한",
    "이해", "이해해", "이해할",
    "동정", "안타깝", "안타까운", "안타깝네",
    "불쌍", "불쌍한", "불쌍하",
    "힘들", "힘든", "힘들어", "힘들었",
    "아프", "아픈", "아파", "아팠",
    "도와", "도와줘", "도와야",
    "구해", "구해줘", "살려", "살려줘",
    "위로", "위로해", "응원", "응원해",
    "괜찮", "괜찮아", "괜찮네", "괜찮다",
    "별일", "별거", "그럴 수", "그럴수",
    "실수", "실수를", "실수다",
    "누구나", "반성", "반성해", "반성하고",
    "뉘우친", "뉘우치", "뉘우쳐",
    "어쩔", "어쩔 수", "어쩔수",
    "불가피", "긴박", "절박",
    "무죄", "무죄다", "무죄임", "무죄네",
    "용서", "용서해", "용서해줘", "용서하",
    "선처", "면죄", "풀어줘", "놓아줘",
    "가능해", "가능한",
    "인정해", "인정할",
    "공감", "공감해",
    "딱하", "딱한", "딱하네",
    "억울", "억울한", "억울해",
    "미안", "미안한", "미안해",
    "고생", "고생했", "고생하",
    "희생", "희생한", "희생했",
  ];
  for (const kw of sympathyKws) {
    if (lower.includes(kw.toLowerCase()) && !hasNegator(lower, kw.toLowerCase())) notGuiltyScore += 1;
  }

  // 사연 맥락 기반 분석
  if (story) {
    const storyKeywords = extractKeywords(story);
    const badCount = storyKeywords.filter((k) => k.type === "bad").length;
    if (badCount > 2) {
      const agreeWords = ["맞아", "그래", "동의", "맞다", "그렇지", "그렇구나", "그렇네"];
      for (const aw of agreeWords) {
        if (lower.includes(aw)) guiltyScore += 1;
      }
    }
  }

  // 중립 표현
  const neutralMarkers = ["?", "모르겠", "알 수", "잘 모르", "생각이 안", "고민", "어렵다", "어려워"];
  let neutralScore = 0;
  for (const nm of neutralMarkers) {
    if (lower.includes(nm.toLowerCase())) neutralScore += 1;
  }

  if (neutralScore >= 2 && Math.abs(guiltyScore - notGuiltyScore) < 2) {
    return { opinion: "neutral", score: 0 };
  }
  if (guiltyScore > notGuiltyScore) {
    return { opinion: "guilty", score: guiltyScore - notGuiltyScore };
  } else if (notGuiltyScore > guiltyScore) {
    return { opinion: "notGuilty", score: notGuiltyScore - guiltyScore };
  }
  return { opinion: "neutral", score: 0 };
}

// #93: 사연 맥락에 맞는 배심원 채팅 생성
export function generateJuryChatContext(side, story) {
  if (!story) {
    if (side === "guilty") return "유죄입니다!";
    return "무죄입니다!";
  }
  const kws = extractKeywords(story);
  const lower = story.toLowerCase();

  if (side === "guilty") {
    const chats = [];
    if (kws.some((k) => k.kw === "치매")) chats.push("치매라도 운전은 위험합니다! 타인의 생명이 걸린 문제예요");
    if (kws.some((k) => k.kw === "재산" || k.kw === "유산")) chats.push("공평하지 않은 유산 분배는 가족을 깨뜨립니다");
    if (kws.some((k) => k.kw === "바람")) chats.push("바람은 신뢰를 깨는 행위입니다. 과거든 현재든요");
    if (kws.some((k) => k.kw === "거짓말")) chats.push("거짓말로 얻은 것은 결국 드러나기 마련입니다");
    if (kws.some((k) => k.kw === "음주운전")) chats.push("음주운전은 사고가 없어도 범죄입니다!");
    if (kws.some((k) => k.kw === "불법")) chats.push("불법으로 돈을 버는 건 어떤 이유로도 안 됩니다");
    if (kws.some((k) => k.kw === "절도")) chats.push("아이 수술비라도 절도는 정당화될 수 없어요");
    if (kws.some((k) => k.kw === "학교폭력")) chats.push("학교폭력은 피해자에게 평생 상처를 남깁니다");
    if (kws.some((k) => k.kw === "부정행위")) chats.push("부정행위는 다른 학생에게 불공정합니다");
    if (kws.some((k) => k.kw === "성매매")) chats.push("과거 성매매 사실은 숨겨서는 안 됩니다");
    if (kws.some((k) => k.kw === "구조조정")) chats.push("내부 정보를 공유하는 건 공정성을 해칩니다");
    if (kws.some((k) => k.kw === "수혈" || k.kw === "종교")) chats.push("종교적 이유로 아이 수혈을 거부하는 건 아동 학대입니다!");
    if (kws.some((k) => k.kw === "CCTV" || k.kw === "사생활")) chats.push("CCTV 설치는 사생활 침해가 너무 심합니다");
    if (kws.some((k) => k.kw === "노숙")) chats.push("노숙인 강제 퇴거는 인권 침해입니다");
    if (kws.some((k) => k.kw === "우울증")) chats.push("우울증 글을 방치하면 안 됩니다. 알려야 해요");
    if (kws.some((k) => k.kw === "반려견" || k.kw === "치료비")) chats.push("반려견 치료비가 비싸도 포기하면 안 됩니다");
    if (kws.some((k) => k.kw === "AI" || k.kw === "판결")) chats.push("AI에게 판결을 맡기는 건 위험합니다");
    if (kws.some((k) => k.kw === "저작권")) chats.push("AI 작품에 저작권을 주는 건 인간 창작자에게 불공정합니다");
    if (kws.some((k) => k.kw === "발명" || k.kw === "해외")) chats.push("가족을 두고 해외로 가는 건 이기적입니다");
    if (kws.some((k) => k.kw === "결혼식" || k.kw === "수술비")) chats.push("부모님 수술이 결혼식보다 중요합니다");
    if (kws.some((k) => k.kw === "휴대폰" || k.kw === "몰래")) chats.push("몰래 휴대폰을 보는 건 프라이버시 침해입니다");
    if (kws.some((k) => k.kw === "신고")) chats.push("음주운전은 신고해야 합니다. 방치하면 안 돼요");
    if (kws.some((k) => k.kw === "규정")) chats.push("회사 규정을 어기면 안 됩니다. 결과가 좋아도요");
    if (kws.some((k) => k.kw === "무능" || k.kw === "승진")) chats.push("무능한 상사가 승진하면 회사가 망합니다");
    if (kws.some((k) => k.kw === "현금" || k.kw === "주웠")) chats.push("주운 돈은 반드시 주인을 찾아줘야 합니다");
    if (chats.length === 0) {
      const defaults = ["이건 명백한 유죄입니다!", "피고인이 잘못했어요", "처벌이 필요합니다", "책임을 져야 해요", "용서할 수 없어요"];
      return defaults[Math.floor(Math.random() * defaults.length)];
    }
    return chats[Math.floor(Math.random() * chats.length)];
  } else {
    const chats = [];
    if (kws.some((k) => k.kw === "치매")) chats.push("아버지의 자립심을 존중해야 해요. 단계적으로 줄이면 됩니다");
    if (kws.some((k) => k.kw === "재산" || k.kw === "유산")) chats.push("부모님의 뜻을 존중하는 게 가족 화목에 좋습니다");
    if (kws.some((k) => k.kw === "바람")) chats.push("과거의 일이고 현재는 충실해요. 용서할 수 있습니다");
    if (kws.some((k) => k.kw === "거짓말")) chats.push("능력은 충분해요. 불가피한 상황이었을 겁니다");
    if (kws.some((k) => k.kw === "음주운전")) chats.push("사고가 없었고 반성하고 있어요. 기회를 줍시다");
    if (kws.some((k) => k.kw === "불법")) chats.push("부모님 생명을 구하기 위한 절박한 선택이었어요");
    if (kws.some((k) => k.kw === "절도")) chats.push("아이 생명을 구하려는 극단적 상황이었어요. 참작해야 합니다");
    if (kws.some((k) => k.kw === "학교폭력")) chats.push("수년간 봉사하며 반성했습니다. 달라진 사람이에요");
    if (kws.some((k) => k.kw === "부정행위")) chats.push("간병하느라 공부할 시간이 없었어요. 참작해야 합니다");
    if (kws.some((k) => k.kw === "성매매")) chats.push("과거의 일이고 현재는 다른 사람입니다");
    if (kws.some((k) => k.kw === "구조조정")) chats.push("친한 동료에게 알려주는 건 인간적 도리입니다");
    if (kws.some((k) => k.kw === "수혈" || k.kw === "종교")) chats.push("부모의 종교적 신념도 존중받아야 합니다");
    if (kws.some((k) => k.kw === "CCTV" || k.kw === "사생활")) chats.push("범죄 예방을 위해 어느 정도 감수할 수 있어요");
    if (kws.some((k) => k.kw === "노숙")) chats.push("노숙인에게도 거주할 권리가 있습니다");
    if (kws.some((k) => k.kw === "우울증")) chats.push("장난이라고 했으니 너무 심각하게 받지 말아요");
    if (kws.some((k) => k.kw === "반려견" || k.kw === "치료비")) chats.push("20% 확률이면 해볼 만합니다. 포기하지 마세요");
    if (kws.some((k) => k.kw === "AI" || k.kw === "판결")) chats.push("AI가 더 정확하다면 활용할 수 있습니다");
    if (kws.some((k) => k.kw === "저작권")) chats.push("AI 작품도 창작물로 인정받아야 합니다");
    if (kws.some((k) => k.kw === "발명" || k.kw === "해외")) chats.push("꿈을 위해 떠나는 건 용기 있는 선택입니다");
    if (kws.some((k) => k.kw === "결혼식" || k.kw === "수술비")) chats.push("결혼식은 또 있을 수 있지만 부모님 수술은 급해요");
    if (kws.some((k) => k.kw === "휴대폰" || k.kw === "몰래")) chats.push("사기를 막았으니 결과적으로 좋은 일이었어요");
    if (kws.some((k) => k.kw === "신고")) chats.push("친구니까 먼저 경고하고 기회를 줍시다");
    if (kws.some((k) => k.kw === "규정")) chats.push("결과가 좋으니 규정을 유연하게 적용해도 됩니다");
    if (kws.some((k) => k.kw === "무능" || k.kw === "승진")) chats.push("인간적으로 좋은 사람이니 승진시켜도 됩니다");
    if (kws.some((k) => k.kw === "현금" || k.kw === "주웠")) chats.push("주인을 찾기 어렵다면 어느 정도 기간 후 사용해도 됩니다");
    if (chats.length === 0) {
      const defaults = ["사정이 있을 수 있어요", "기회를 줍시다", "참작해야 해요", "누구나 실수할 수 있죠", "용서합시다"];
      return defaults[Math.floor(Math.random() * defaults.length)];
    }
    return chats[Math.floor(Math.random() * chats.length)];
  }
}

// AI가 사연 내용과 채팅 여론을 분석하여 적합한 죄목 생성 (#69)
// 말이 안 되는 창의적 죄목도 가능
export function generateCharge(story, chatOpinions) {
  if (!story) return "알 수 없는 죄";
  const lower = story.toLowerCase();
  const charges = [];

  // 키워드 기반 죄목 매핑
  const chargeMap = [
    { kw: ["돈", "안 갚", "빌려"], charge: "사기죄" },
    { kw: ["재산", "유산"], charge: "횡령죄" },
    { kw: ["절도", "훔친", "주웠"], charge: "절도죄" },
    { kw: ["바람", "거짓말", "속인"], charge: "사기죄" },
    { kw: ["음주운전", "운전"], charge: "위험운전치상죄" },
    { kw: ["폭행", "때린", "때리"], charge: "폭행죄" },
    { kw: ["성매매"], charge: "성매매알선죄" },
    { kw: ["불법", "다운로드"], charge: "저작권위반죄" },
    { kw: ["학교폭력", "괴롭"], charge: "학교폭력치상죄" },
    { kw: ["부정행위", "커닝"], charge: "부정행위방지법위반죄" },
    { kw: ["구조조정", "내부정보"], charge: "내부자거래죄" },
    { kw: ["면허", "치매"], charge: "무면허운전죄" },
    { kw: ["CCTV", "얼굴인식"], charge: "사생활침해죄" },
    { kw: ["수혈", "종교"], charge: "아동학대방치죄" },
    { kw: ["SNS", "발언"], charge: "명예훼손죄" },
    { kw: ["우울증"], charge: "자살방조위험죄" },
    { kw: ["노숙"], charge: "공유재산점유죄" },
    { kw: ["반려견", "치료비"], charge: "동물학대방치죄" },
    { kw: ["AI", "판결"], charge: "AI남용죄" },
    { kw: ["저작권", "그림"], charge: "저작권침해죄" },
    { kw: ["발명", "회사"], charge: "영업비밀누설죄" },
    { kw: ["꿈", "해외"], charge: "가족유기죄" },
    { kw: ["결혼식", "수술"], charge: "효도위반죄" },
    { kw: ["면접", "거짓말"], charge: "경력위조죄" },
    { kw: ["휴대폰", "몰래"], charge: "사생활침해죄" },
    { kw: ["신고"], charge: "은닉죄" },
  ];

  for (const cm of chargeMap) {
    if (cm.kw.some((k) => lower.includes(k.toLowerCase()))) {
      charges.push(cm.charge);
    }
  }

  // 창의적 죄목 (사연 내용 기반, 가벼운 죄목만, #76)
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

  // 채팅 여론이 유죄 쪽이 압도적이면 더 무거운 죄목 (가벼운 것만)
  if (chatOpinions && chatOpinions.guilty > chatOpinions.notGuilty * 2) {
    charges.push("사회적 신뢰 파괴죄", "중도의식 결여죄");
  }

  // 키워드 매칭이 있으면 그것을 우선, 없으면 창의적 죄목
  if (charges.length > 0) {
    return charges[Math.floor(Math.random() * charges.length)];
  }
  return creativeCharges[Math.floor(Math.random() * creativeCharges.length)];
}
