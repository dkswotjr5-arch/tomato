import fs from 'fs';

// ============================================================
// #100: 사연 내용을 유죄/무죄 판단 가능한 내용으로 수정
// ============================================================
const aiPath = 'lib/ai-arguments.js';
// CRLF - 변환
let ai = fs.readFileSync(aiPath, 'utf8');
ai = ai.replace(/\r\n/g, '\n');

const oldStories = `const STORY_CATEGORIES = [
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
];`;

const newStories = `const STORY_CATEGORIES = [
  {
    category: "가족",
    templates: [
      "아버지가 치매 초기임에도 운전을 고집한다. 가족이 면허를 강제 반납하려 하자 아버지는 자신의 자유를 뺏는다며 분노한다. 가족이 면허 반납을 강행한 것은 정당한가?",
      "동생은 부모님을 한 번도 돌보지 않았다. 그런데 부모님이 재산 대부분을 동생에게 물려주겠다고 한다. 내가 이 유언을 막으려는 것이 정당한가?",
      "어머니가 나에게 노후 자금을 결혼 자금으로 쓰라고 강요한다. 거절하자 어머니가 불효자라고 소문을 퍼뜨렸다. 어머니의 행동은 잘못인가?",
    ],
  },
  {
    category: "연인",
    templates: [
      "애인이 나와 사귀는 도중에 다른 사람과 바람을 피웠다. 사실이 드러나자 애인은 울며 용서를 구한다. 애인의 행위는 용서할 수 없는 배신인가?",
      "애인이 내 휴대폰을 허락 없이 열어보았다. 사기를 막았다는 변명이 있지만, 내 프라이버시를 침해한 애인의 행위는 잘못인가?",
      "결혼을 앞둔 애인이 나에게 숨겨왔던 거악의 빚을 고백했다. 결혼을 파기하려는 나의 선택이 정당한가?",
    ],
  },
  {
    category: "친구",
    templates: [
      "친구가 면접에서 학력을 속여 합격했다. 회사는 그의 능력이 충분하다고 믿고 있다. 친구의 거짓말을 회사에 알리는 것이 정당한가?",
      "친한 친구가 음주운전을 했다. 사고는 없었지만 누군가 다칠 뻔했다. 친구를 경찰에 신고하는 것이 정당한가?",
    ],
  },
  {
    category: "직장",
    templates: [
      "동료가 회사 규정을 어기면서 깔끔하게 업무를 처리한다. 결과는 좋지만 규정 위반이다. 동료를 상부에 보고하는 것이 정당한가?",
      "상사가 무능하여 부서 실적이 추락하고 있다. 그가 승진하면 회사 전체에 큰 피해가 간다. 솔직하게 평가하는 것이 정당한가?",
      "나만 구조조정 정보를 미리 알게 되었다. 친한 동료에게 알려주면 그는 미리 이직을 준비할 수 있다. 정보를 공유하는 것이 잘못인가?",
    ],
  },
  {
    category: "돈",
    templates: [
      "부모님의 수술비를 마련하기 위해 불법 복제물을 판매해 돈을 벌었다. 목적은 좋았지만 수단이 불법이었다. 이 행위를 처벌해야 하는가?",
      "길에서 주운 500만 원을 1주일간 찾는 사람이 없어서 그냥 쓰기로 했다. 주인이 나중에 나타나 돈을 돌려달라고 한다. 내가 돈을 돌려주지 않는 것은 잘못인가?",
    ],
  },
  {
    category: "정의",
    templates: [
      "절도범이 훔친 돈으로 자신의 아이 수술비를 냈다. 아이의 생명을 구하려는 목적이었다. 그래도 절도는 처벌해야 하는가?",
      "학교폭력 가해자가 수년간 봉사하며 반성했다. 이제 다른 사람이 되었지만, 피해자는 과거를 공개하라고 요구한다. 피해자의 요구가 정당한가?",
    ],
  },
  {
    category: "생명",
    templates: [
      "의사가 생존 가능성 5%의 환자에게 끝까지 치료하겠다고 했다. 그 때문에 다른 구급 환자의 치료가 늦어졌다. 의사의 선택은 잘못인가?",
      "응급실에 어린아이와 유명 연구자가 동시에 왔다. 의사는 연구자를 먼저 치료했다. 아이의 부모가 의사를 고소한다. 의사의 선택은 잘못인가?",
    ],
  },
  {
    category: "AI",
    templates: [
      "기업이 AI에게 직원 채용 최종 결정을 맡겼다. AI가 인종과 성별을 차별하는 기준을 적용한 것이 드러났다. 기업의 행위는 잘못인가?",
      "AI가 만든 그림을 인간이 약간 수정한 뒤 자신의 작품이라고 저작권 등록을 했다. 이 저작권 등록은 부정한가?",
    ],
  },
  {
    category: "SNS",
    templates: [
      "유명인이 10년 전 인종차별 발언을 했다가 지금 다시 퍼졌다. 현재는 달라졌지만 광고주가 계약을 취소했다. 계약 취소는 정당한가?",
      "친구가 우울증을 암시하는 글을 올렸다가 본인은 장난이라 했다. 그런데 며칠 뒤 실제로 자해를 시도했다. 미리 알리지 않은 내가 잘못인가?",
    ],
  },
  {
    category: "교육",
    templates: [
      "학생이 장기간 부모 간병으로 공부할 시간이 없어 부정행위를 했다. 퇴학을 시키는 것이 정당한가?",
    ],
  },
  {
    category: "사회",
    templates: [
      "주민들이 노숙인을 공원에서 강제 퇴거시켰다. 노숙인은 다른 갈 곳이 없다. 주민들의 강제 퇴거 행위는 잘못인가?",
      "도시가 범죄 예방을 위해 시민 전원의 얼굴을 CCTV로 수집하기 시작했다. 이 데이터 수집은 프라이버시 침해인가?",
    ],
  },
  {
    category: "의료",
    templates: [
      "부모가 종교적 이유로 아이의 수혈을 거부하여 아이가 위험에 처했다. 의사가 부모 동의 없이 수혈을 강행했다. 의사의 행위는 정당한가?",
    ],
  },
  {
    category: "윤리",
    templates: [
      "친구의 예비 배우자가 과거 성매매를 한 사실을 알게 되었다. 친구에게 말하는 것이 정당한가?",
      "회사의 발명품을 경쟁사로 가져가서 더 잘 활용하려 한다. 이전 회사의 영업비밀을 유출하는 것이 잘못인가?",
    ],
  },
  {
    category: "현실적 고민",
    templates: [
      "친구 결혼식 날 부모님이 수술을 받았다. 나는 결혼식에 갔다. 친구가 나를 원망하며 배신자라 했다. 친구의 원망이 정당한가?",
      "오랜 꿈을 위해 해외로 떠나면서 가족을 돌보지 않게 되었다. 가족이 나를 고소하여 부양 의무 위반으로 피소했다. 가족의 소송이 정당한가?",
      "반려견 치료비 1,000만 원이 든다. 성공률 20%라 포기했다. 동물보호단체가 나를 동물학대로 고발했다. 나의 포기가 잘못인가?",
    ],
  },
];`;

if (ai.includes(oldStories)) {
  ai = ai.replace(oldStories, newStories);
  // Also update getAllStories to not filter (new stories are all guilty/not-guilty)
  ai = ai.replace(
    `export function getAllStories() {
  const neutralKeywords = [
    "누가 양보해야 하는가",
    "어디에 가야 하는가",
    "누구를 먼저 치료해야 하는가",
    "얼마 동안 찾아보고 포기해도 되는가",
  ];
  return STORY_CATEGORIES.flatMap((cat) =>
    cat.templates.filter((t) => !neutralKeywords.some((nk) => t.includes(nk)))
  );
}`,
    `export function getAllStories() {
  return STORY_CATEGORIES.flatMap((cat) => cat.templates);
}`
  );
  fs.writeFileSync(aiPath, ai, 'utf8');
  console.log('OK: ai-arguments.js stories updated (#100)');
} else {
  console.log('ERROR: Old stories not found');
}

// ============================================================
// #101: 대법관석, 검사석, 변호사석이 캐릭터에 가려지는 문제
// #102: 배심원 말풍선 크기 축소
// ============================================================
const pagePath = 'app/page.js';
let pg = fs.readFileSync(pagePath, 'utf8');

// #101: NPC 렌더링 순서 변경 - 배경(석) 먼저, NPC 나중에 그리되
// 이미 renderCourt에서 석을 먼저 그리고 NPC를 나중에 그리므로,
// 문제는 NPC 위치가 석 라벨 위에 있다는 것.
// NPC y좌표를 약간 아래로 조정하여 라벨과 겹치지 않게 함
const oldNpcs = `  const COURT_NPCS = [
    { x: 120, y: 150, r: 18, head: "🔍", body: "#c62828", name: "검사", speed: 0, vx: 0, range: [100, 140, 140, 160] },
    { x: 680, y: 150, r: 18, head: "🛡️", body: "#1565c0", name: "변호사", speed: 0, vx: 0, range: [660, 700, 140, 160] },
    { x: 400, y: 60, r: 22, head: "👑", body: "#d4af37", name: "대법관", speed: 0, vx: 0, range: [380, 420, 50, 70] },`;
const newNpcs = `  const COURT_NPCS = [
    { x: 120, y: 165, r: 18, head: "🔍", body: "#c62828", name: "검사", speed: 0, vx: 0, range: [100, 140, 140, 160] },
    { x: 680, y: 165, r: 18, head: "🛡️", body: "#1565c0", name: "변호사", speed: 0, vx: 0, range: [660, 700, 140, 160] },
    { x: 400, y: 55, r: 22, head: "👑", body: "#d4af37", name: "대법관", speed: 0, vx: 0, range: [380, 420, 50, 70] },`;

if (pg.includes(oldNpcs)) {
  pg = pg.replace(oldNpcs, newNpcs);
  console.log('OK: NPC positions adjusted (#101)');
} else {
  console.log('ERROR: Old NPC positions not found');
}

// #102: 배심원 말풍선 크기 축소
// drawSpeechBubbles에서 폰트 크기와 패딩을 줄임
// 하지만 전체 말풍선을 작게하면 다른 캐릭터 말풍선도 작아짐
// 배심원 전용 작은 말풍선을 위해 drawSpeechBubbles에 small 옵션 추가
const oldBubble = `  function addSpeechBubble(character, text, duration) {
    if (!duration) duration = 4000;
    /* 말풍선 텍스트 길이 제한 (화면 밖으로 나가지 않도록) */
    if (text && text.length > 40) text = text.slice(0, 40) + "...";
    speechBubbles.push({ character, text, createdAt: Date.now(), duration });
  }`;
const newBubble = `  function addSpeechBubble(character, text, duration, small) {
    if (!duration) duration = 4000;
    /* #102: 배심원 말풍선은 더 짧게 제한 */
    if (small && text && text.length > 25) text = text.slice(0, 25) + "...";
    else if (!small && text && text.length > 40) text = text.slice(0, 40) + "...";
    speechBubbles.push({ character, text, createdAt: Date.now(), duration, small });
  }`;

if (pg.includes(oldBubble)) {
  pg = pg.replace(oldBubble, newBubble);
  console.log('OK: addSpeechBubble updated with small param (#102)');
} else {
  console.log('ERROR: Old addSpeechBubble not found');
}

// drawSpeechBubbles에서 small 옵션 처리
const oldDraw = `    for (const bubble of bubblesToShow) {
      const ch = bubble.character; const r = ch.r || 18;
      let x = ch.x; let y = ch.y - r - 50; const text = bubble.text;
      ctx.save();
      ctx.font = 'bold 14px "Malgun Gothic",sans-serif';
      const textW = ctx.measureText(text).width;
      const padX = 14, padY = 8; const boxW = textW + padX * 2; const boxH = 24 + padY * 2;`;
const newDraw = `    for (const bubble of bubblesToShow) {
      const ch = bubble.character; const r = ch.r || 18;
      const isSmall = bubble.small;
      let x = ch.x; let y = ch.y - r - (isSmall ? 38 : 50); const text = bubble.text;
      ctx.save();
      ctx.font = isSmall ? 'bold 11px "Malgun Gothic",sans-serif' : 'bold 14px "Malgun Gothic",sans-serif';
      const textW = ctx.measureText(text).width;
      const padX = isSmall ? 8 : 14; const padY = isSmall ? 5 : 8;
      const boxW = textW + padX * 2; const boxH = (isSmall ? 18 : 24) + padY * 2;`;

if (pg.includes(oldDraw)) {
  pg = pg.replace(oldDraw, newDraw);
  console.log('OK: drawSpeechBubbles updated for small bubbles (#102)');
} else {
  console.log('ERROR: Old drawSpeechBubbles not found');
}

// 배심원 채팅 시 small=true 적용
// generateJuryChat 결과를 addSpeechBubble로 전달하는 부분들
const oldJuryChat1 = `          addSpeechBubble(jn, chat, 3500);`;
const newJuryChat1 = `          addSpeechBubble(jn, chat, 3500, true);`;

if (pg.includes(oldJuryChat1)) {
  pg = pg.replace(oldJuryChat1, newJuryChat1);
  console.log('OK: Jury chat bubbles set to small (#102)');
} else {
  console.log('ERROR: Old jury chat bubble call not found');
}

fs.writeFileSync(pagePath, pg, 'utf8');
console.log('Done!');