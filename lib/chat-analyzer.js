import { extractKeywords } from "./arguments-builder.js";

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

  // 행동/성격 비난 (유죄 맥락)
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
    "선 넘", "선을 넘",
  ];
  for (const kw of blameKws) {
    if (lower.includes(kw.toLowerCase()) && !hasNegator(lower, kw.toLowerCase())) guiltyScore += 1;
  }

  // 동정/참작 (무죄 맥락)
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
    "걱정", "걱정했", "걱정하",
    "사랑", "사랑에서",
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

  if (side === "guilty") {
    const chats = [];
    if (kws.some((k) => k.kw === "몰래")) chats.push("몰래 한 행동은 사생활 침해입니다!");
    if (kws.some((k) => k.kw === "안 갚" || k.kw === "빚")) chats.push("빌린 돈은 갚아야 합니다!");
    if (kws.some((k) => k.kw === "거짓말")) chats.push("거짓말은 신뢰를 깹니다!");
    if (kws.some((k) => k.kw === "녹음")) chats.push("몰래 녹음은 불법입니다!");
    if (kws.some((k) => k.kw === "비밀")) chats.push("친구의 비밀을 말하는 건 배신입니다");
    if (kws.some((k) => k.kw === "층간소음")) chats.push("이웃에게 피해를 주면 안 됩니다");
    if (kws.some((k) => k.kw === "무단횡단" || k.kw === "과속")) chats.push("교통법규 위반은 위험합니다!");
    if (kws.some((k) => k.kw === "파혼")) chats.push("결혼을 일방적으로 파기하면 안 됩니다");
    if (kws.some((k) => k.kw === "독촉")) chats.push("돈을 독촉하는 건 당연한 권리입니다");
    if (kws.some((k) => k.kw === "흠집")) chats.push("흠집을 내고 숨기면 안 됩니다");
    if (kws.some((k) => k.kw === "쓰레기")) chats.push("공동 공간에 쓰레기를 버리면 안 됩니다");
    if (kws.some((k) => k.kw === "결제" || k.kw === "지갑")) chats.push("결제 안 하거나 주운 걸 안 돌려주면 절도입니다!");
    if (kws.some((k) => k.kw === "기밀" || k.kw === "내부고발")) chats.push("회사 기밀을 유출하면 안 됩니다");
    if (kws.some((k) => k.kw === "혼낸")) chats.push("남의 아이를 혼내면 안 됩니다!");
    if (kws.some((k) => k.kw === "차단")) chats.push("친구를 일방적으로 차단하면 안 됩니다");
    if (kws.some((k) => k.kw === "새치기")) chats.push("새치기는 공공질서 위반입니다");
    if (kws.some((k) => k.kw === "담배")) chats.push("베란다 흡연은 이웃에게 피해를 줍니다");
    if (kws.some((k) => k.kw === "적금")) chats.push("부모님 적금을 몰래 해지하면 안 됩니다!");
    if (kws.some((k) => k.kw === "요양원")) chats.push("부모님을 요양원에 보내는 건 효도 위반입니다");
    if (kws.some((k) => k.kw === "휴가")) chats.push("팀에 피해를 주면서 휴가를 가면 안 됩니다");
    if (kws.some((k) => k.kw === "반려견" || k.kw === "입양")) chats.push("가족의 반려견을 마음대로 보내면 안 됩니다");
    if (kws.some((k) => k.kw === "리뷰" || k.kw === "별점")) chats.push("악의적 리뷰는 사장님에게 피해를 줍니다");
    if (kws.some((k) => k.kw === "경력")) chats.push("거짓 경력으로 입사하면 안 됩니다");
    if (kws.some((k) => k.kw === "시험지")) chats.push("시험지를 몰래 보면 부정행위입니다");
    if (kws.some((k) => k.kw === "전화")) chats.push("공공장소에서 큰 소리로 통화하면 안 됩니다");
    if (kws.some((k) => k.kw === "반찬")) chats.push("반찬을 공짜로 더 달라는 건 무리합니다");
    if (kws.some((k) => k.kw === "범죄")) chats.push("친구의 범죄를 묵인하면 공범입니다!");
    if (kws.some((k) => k.kw === "약속")) chats.push("약속을 어기고 연락도 안 하면 안 됩니다");
    if (kws.some((k) => k.kw === "축의금")) chats.push("결혼식에 축의금도 안 내면 안 됩니다");
    if (kws.some((k) => k.kw === "사무용품")) chats.push("회사 물건을 개인 용도로 쓰면 안 됩니다");
    if (kws.some((k) => k.kw === "연애")) chats.push("친구의 연애에 참견하면 안 됩니다");
    if (kws.some((k) => k.kw === "과속")) chats.push("빌린 차로 과속하면 안 됩니다!");
    if (kws.some((k) => k.kw === "정원")) chats.push("이웃 아이가 망가뜨렸으면 보상해야 합니다");
    if (kws.some((k) => k.kw === "선물")) chats.push("준 선물을 돌려달라는 건 야박합니다");
    if (kws.some((k) => k.kw === "돌잔치")) chats.push("돌잔치에 빈손으로 오면 안 됩니다");
    if (kws.some((k) => k.kw === "비교")) chats.push("아이를 비교하면 안 됩니다");
    if (kws.some((k) => k.kw === "술자리")) chats.push("술자리에서 비밀을 말하면 안 됩니다");
    if (kws.some((k) => k.kw === "이사")) chats.push("친구가 도와달라는데 안 가면 안 됩니다");
    if (kws.some((k) => k.kw === "사회")) chats.push("결혼식 사회를 거절하면 안 됩니다");
    if (kws.some((k) => k.kw === "청소")) chats.push("공동 청소를 안 하면 안 됩니다");
    if (kws.some((k) => k.kw === "냄새")) chats.push("이웃에게 냄새 피해를 주면 안 됩니다");
    if (kws.some((k) => k.kw === "택배")) chats.push("대신 받은 택배를 잃어버리면 안 됩니다");
    if (kws.some((k) => k.kw === "계산")) chats.push("모임에서 계산을 안 하면 무임승차입니다");
    if (kws.some((k) => k.kw === "모임")) chats.push("모임에서 배제하면 따돌림입니다");
    if (kws.some((k) => k.kw === "공동 계좌")) chats.push("공동 계좌에서 혼자 쓰면 안 됩니다");
    if (kws.some((k) => k.kw === "용돈")) chats.push("동생 용돈을 일방적으로 끊으면 안 됩니다");
    if (kws.some((k) => k.kw === "유언" || k.kw === "상속")) chats.push("부모님의 유언을 존중해야 합니다");
    if (kws.some((k) => k.kw === "아이")) chats.push("아이를 혼자 집에 두면 안 됩니다!");
    if (kws.some((k) => k.kw === "학교" || k.kw === "선생님")) chats.push("학교에 무분별하게 항의하면 안 됩니다");
    if (kws.some((k) => k.kw === "싸움")) chats.push("아이 싸움에 어른이 개입하면 안 됩니다");
    if (kws.some((k) => k.kw === "샴푸")) chats.push("룸메이트 물건을 허락 없이 쓰면 안 됩니다");
    if (kws.some((k) => k.kw === "공동 육아")) chats.push("공동 육아에서 빠지면 안 됩니다");
    if (kws.some((k) => k.kw === "공동 구매")) chats.push("공동 구매에서 중간에 빠지면 안 됩니다");
    if (kws.some((k) => k.kw === "이직")) chats.push("동료의 이직 제안을 거절하면 배신입니다");
    if (kws.some((k) => k.kw === "주차")) chats.push("남의 주차 자리를 쓰면 안 됩니다");
    if (chats.length === 0) {
      const defaults = ["이건 명백한 유죄입니다!", "피고인이 잘못했어요", "처벌이 필요합니다", "책임을 져야 해요", "용서할 수 없어요"];
      return defaults[Math.floor(Math.random() * defaults.length)];
    }
    return chats[Math.floor(Math.random() * chats.length)];
  } else {
    const chats = [];
    if (kws.some((k) => k.kw === "몰래")) chats.push("걱정돼서 한 행동이에요. 악의는 없었습니다");
    if (kws.some((k) => k.kw === "안 갚" || k.kw === "빚")) chats.push("경제적 어려움일 수 있어요. 기다려줍시다");
    if (kws.some((k) => k.kw === "거짓말")) chats.push("불가피한 상황이었을 거예요");
    if (kws.some((k) => k.kw === "녹음")) chats.push("폭언 증거를 위한 불가피한 선택이었어요");
    if (kws.some((k) => k.kw === "비밀")) chats.push("고민을 털어놓을 사람이 필요했을 뿐이에요");
    if (kws.some((k) => k.kw === "층간소음")) chats.push("잠을 못 자는 고통을 이해해야 합니다");
    if (kws.some((k) => k.kw === "무단횡단" || k.kw === "과속")) chats.push("상대방의 잘못이 먼저였어요");
    if (kws.some((k) => k.kw === "파혼")) chats.push("마음이 없는 결혼은 더 큰 불행을 만듭니다");
    if (kws.some((k) => k.kw === "독촉")) chats.push("돈을 독촉하는 건 당연한 권리예요");
    if (kws.some((k) => k.kw === "흠집")) chats.push("미안해서 말을 못 한 것뿐이에요");
    if (kws.some((k) => k.kw === "쓰레기")) chats.push("잠깐 올려둔 것뿐이에요");
    if (kws.some((k) => k.kw === "결제" || k.kw === "지갑")) chats.push("실수였어요. 고의가 아니에요");
    if (kws.some((k) => k.kw === "기밀" || k.kw === "내부고발")) chats.push("공익을 위한 용기 있는 행동이었어요");
    if (kws.some((k) => k.kw === "혼낸")) chats.push("아이 교육을 위한 훈육이었어요");
    if (kws.some((k) => k.kw === "차단")) chats.push("개인의 선택이에요. 강제할 수 없어요");
    if (kws.some((k) => k.kw === "새치기")) chats.push("공공질서를 지키려는 정당한 행동이었어요");
    if (kws.some((k) => k.kw === "담배")) chats.push("내 집 베란다에서의 행동이에요");
    if (kws.some((k) => k.kw === "적금")) chats.push("병원비를 위한 긴급한 선택이었어요");
    if (kws.some((k) => k.kw === "요양원")) chats.push("더 안전한 선택을 한 것뿐이에요");
    if (kws.some((k) => k.kw === "휴가")) chats.push("몇 달 전부터 신청한 휴가예요");
    if (kws.some((k) => k.kw === "반려견" || k.kw === "입양")) chats.push("더 잘 키워줄 사람에게 보낸 거예요");
    if (kws.some((k) => k.kw === "리뷰" || k.kw === "별점")) chats.push("솔직한 후기는 소비자의 권리예요");
    if (kws.some((k) => k.kw === "경력")) chats.push("실제 능력은 충분해요");
    if (kws.some((k) => k.kw === "시험지")) chats.push("일부러 본 게 아니에요");
    if (kws.some((k) => k.kw === "전화")) chats.push("급한 업무 전화였어요");
    if (kws.some((k) => k.kw === "반찬")) chats.push("다른 식당은 다 주는데요");
    if (kws.some((k) => k.kw === "범죄")) chats.push("어떻게 해야 할지 몰랐을 뿐이에요");
    if (kws.some((k) => k.kw === "약속")) chats.push("급한 일이 있어서 늦었어요");
    if (kws.some((k) => k.kw === "축의금")) chats.push("경제적 사정이 어려웠어요");
    if (kws.some((k) => k.kw === "사무용품")) chats.push("사소한 물건이에요");
    if (kws.some((k) => k.kw === "연애")) chats.push("친구를 걱정해서 한 말이에요");
    if (kws.some((k) => k.kw === "과속")) chats.push("급한 일이 있어서 그랬어요");
    if (kws.some((k) => k.kw === "정원")) chats.push("아이가 한 일이에요. 너그럽게 넘어갑시다");
    if (kws.some((k) => k.kw === "선물")) chats.push("받은 게 없는데 줄 의무는 없어요");
    if (kws.some((k) => k.kw === "돌잔치")) chats.push("경제적 사정이 어려웠어요");
    if (kws.some((k) => k.kw === "비교")) chats.push("그냥 대화의 일환이었어요");
    if (kws.some((k) => k.kw === "술자리")) chats.push("술에 취한 상태에서의 실수예요");
    if (kws.some((k) => k.kw === "이사")) chats.push("정말 피곤했을 뿐이에요");
    if (kws.some((k) => k.kw === "사회")) chats.push("사람 앞에 서는 게 싫어서 그랬어요");
    if (kws.some((k) => k.kw === "청소")) chats.push("그날 일이 있어서 못 한 거예요");
    if (kws.some((k) => k.kw === "냄새")) chats.push("자기 집에서 요리하는 건 당연해요");
    if (kws.some((k) => k.kw === "택배")) chats.push("도와주려고 한 것뿐이에요");
    if (kws.some((k) => k.kw === "계산")) chats.push("정말 돈이 없었어요");
    if (kws.some((k) => k.kw === "모임")) chats.push("친한 사람과 먹고 싶었을 뿐이에요");
    if (kws.some((k) => k.kw === "공동 계좌")) chats.push("가족인데 그 정도도 안 되나요?");
    if (kws.some((k) => k.kw === "용돈")) chats.push("게임에 쓰는 걸 알고 끊은 거예요");
    if (kws.some((k) => k.kw === "유언" || k.kw === "상속")) chats.push("동생이 돌보지 않았으니 공평하게 나눈 거예요");
    if (kws.some((k) => k.kw === "아이")) chats.push("급한 일이 있어서 불가피했어요");
    if (kws.some((k) => k.kw === "학교" || k.kw === "선생님")) chats.push("아이를 위한 정당한 항의예요");
    if (kws.some((k) => k.kw === "싸움")) chats.push("아이를 보호하기 위한 것이었어요");
    if (kws.some((k) => k.kw === "샴푸")) chats.push("잠깐 쓴 것뿐이에요");
    if (kws.some((k) => k.kw === "공동 육아")) chats.push("일이 바빠서 어쩔 수 없었어요");
    if (kws.some((k) => k.kw === "공동 구매")) chats.push("형편이 안 좋아서 빠진 거예요");
    if (kws.some((k) => k.kw === "이직")) chats.push("개인의 선택이에요");
    if (kws.some((k) => k.kw === "주차")) chats.push("제 자리가 막혀서 어쩔 수 없었어요");
    if (chats.length === 0) {
      const defaults = ["사정이 있을 수 있어요", "기회를 줍시다", "참작해야 해요", "누구나 실수할 수 있죠", "용서합시다"];
      return defaults[Math.floor(Math.random() * defaults.length)];
    }
    return chats[Math.floor(Math.random() * chats.length)];
  }
}
