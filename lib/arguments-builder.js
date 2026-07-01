// 로컬 AI 주장 상세 생성 모듈 (검사/변호사 주장 전용)

// 키워드 추출 함수 (chat-analyzer에서 사용)
export function extractKeywords(story) {
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
    { kw: "연락처", weight: 2, type: "bad" },
    { kw: "적금", weight: 2, type: "bad" },
    { kw: "요양원", weight: 2, type: "neutral" },
    { kw: "용돈", weight: 1, type: "neutral" },
    { kw: "녹음", weight: 3, type: "bad" },
    { kw: "휴가", weight: 1, type: "neutral" },
    { kw: "이직", weight: 1, type: "neutral" },
    { kw: "빚", weight: 2, type: "bad" },
    { kw: "독촉", weight: 2, type: "bad" },
    { kw: "공동 계좌", weight: 2, type: "bad" },
    { kw: "층간소음", weight: 2, type: "bad" },
    { kw: "베란다", weight: 1, type: "neutral" },
    { kw: "담배", weight: 2, type: "bad" },
    { kw: "입양", weight: 2, type: "neutral" },
    { kw: "아파트", weight: 1, type: "neutral" },
    { kw: "무단횡단", weight: 3, type: "bad" },
    { kw: "주차", weight: 1, type: "neutral" },
    { kw: "혼낸", weight: 2, type: "bad" },
    { kw: "파혼", weight: 2, type: "bad" },
    { kw: "유언", weight: 2, type: "neutral" },
    { kw: "상속", weight: 2, type: "neutral" },
    { kw: "리뷰", weight: 1, type: "neutral" },
    { kw: "별점", weight: 1, type: "neutral" },
    { kw: "내부고발", weight: 2, type: "neutral" },
    { kw: "기밀", weight: 2, type: "bad" },
    { kw: "경력", weight: 1, type: "neutral" },
    { kw: "아이스크림", weight: 1, type: "neutral" },
    { kw: "결제", weight: 2, type: "bad" },
    { kw: "시험지", weight: 2, type: "bad" },
    { kw: "새치기", weight: 2, type: "bad" },
    { kw: "비밀", weight: 2, type: "neutral" },
    { kw: "전화", weight: 1, type: "neutral" },
    { kw: "반찬", weight: 1, type: "neutral" },
    { kw: "범죄", weight: 3, type: "bad" },
    { kw: "지갑", weight: 2, type: "neutral" },
    { kw: "싸움", weight: 2, type: "bad" },
    { kw: "학교", weight: 1, type: "neutral" },
    { kw: "선생님", weight: 1, type: "neutral" },
    { kw: "공동 구매", weight: 1, type: "neutral" },
    { kw: "약속", weight: 1, type: "neutral" },
    { kw: "샴푸", weight: 1, type: "neutral" },
    { kw: "공동 육아", weight: 1, type: "neutral" },
    { kw: "축의금", weight: 1, type: "neutral" },
    { kw: "택배", weight: 1, type: "neutral" },
    { kw: "사무용품", weight: 1, type: "neutral" },
    { kw: "연애", weight: 1, type: "neutral" },
    { kw: "쓰레기", weight: 2, type: "bad" },
    { kw: "과속", weight: 3, type: "bad" },
    { kw: "정원", weight: 1, type: "neutral" },
    { kw: "차단", weight: 1, type: "neutral" },
    { kw: "계산", weight: 1, type: "neutral" },
    { kw: "사회", weight: 1, type: "neutral" },
    { kw: "청소", weight: 1, type: "neutral" },
    { kw: "흠집", weight: 2, type: "bad" },
    { kw: "냄새", weight: 1, type: "neutral" },
    { kw: "선물", weight: 1, type: "neutral" },
    { kw: "돌잔치", weight: 1, type: "neutral" },
    { kw: "비교", weight: 1, type: "neutral" },
    { kw: "술자리", weight: 1, type: "neutral" },
    { kw: "이사", weight: 1, type: "neutral" },
    { kw: "모임", weight: 1, type: "neutral" },
    { kw: "거짓말", weight: 3, type: "bad" },
    { kw: "반려견", weight: 2, type: "neutral" },
  ];

  for (const a of actions) {
    if (lower.includes(a.kw.toLowerCase())) {
      keywords.push({ ...a });
    }
  }

  if (story.length > 30) keywords.push({ kw: "긴사연", weight: 1, type: "neutral" });

  return keywords;
}

// 사연을 분석하여 핵심 행동/상황 추출
function analyzeStoryCore(story) {
  if (!story || typeof story !== "string") return { actions: [], context: "" };
  const lower = story.toLowerCase();
  const actions = [];

  // 행동 패턴 매칭 (더 정확한 매칭을 위해 긴 패턴 우선)
  const patterns = [
    // 결제/절도 관련
    { test: () => lower.includes("결제") && lower.includes("안"), action: "결제_안함", desc: "결제를 하지 않음" },
    { test: () => lower.includes("아이스크림") || lower.includes("무인매장") || lower.includes("무인 매장"), action: "결제_안함", desc: "무인매장에서 결제 안 함" },
    { test: () => lower.includes("주웠") || lower.includes("지갑"), action: "습득물_미반환", desc: "주운 물건을 돌려주지 않음" },
    { test: () => lower.includes("훔친") || lower.includes("절도") || lower.includes("몰래 가져"), action: "절도", desc: "물건을 훔침" },
    // 사생활/프라이버시
    { test: () => lower.includes("휴대폰") && lower.includes("봤"), action: "휴대폰_확인", desc: "휴대폰을 몰래 봄" },
    { test: () => lower.includes("연락처") && lower.includes("삭제"), action: "연락처_삭제", desc: "연락처를 몰래 삭제" },
    { test: () => lower.includes("녹음"), action: "몰래_녹음", desc: "몰래 녹음" },
    { test: () => lower.includes("사진") && lower.includes("sns"), action: "사진_게시", desc: "사진을 SNS에 올림" },
    // 비밀/신뢰
    { test: () => lower.includes("비밀") && (lower.includes("말했") || lower.includes("말하")), action: "비밀_누설", desc: "비밀을 말함" },
    { test: () => lower.includes("거짓말"), action: "거짓말", desc: "거짓말을 함" },
    { test: () => lower.includes("경력") && (lower.includes("속인") || lower.includes("거짓")), action: "경력_위조", desc: "경력을 속임" },
    // 돈/재산
    { test: () => lower.includes("빌려") && lower.includes("안 갚"), action: "돈_미상환", desc: "빌린 돈을 갚지 않음" },
    { test: () => lower.includes("독촉"), action: "돈_독촉", desc: "빌려준 돈을 독촉함" },
    { test: () => lower.includes("적금") && lower.includes("해지"), action: "적금_해지", desc: "적금을 몰래 해지" },
    { test: () => lower.includes("공동 계좌") || lower.includes("공동계좌"), action: "공동계좌_사용", desc: "공동 계좌에서 혼자 돈 사용" },
    { test: () => lower.includes("사무용품") || lower.includes("회사 물건"), action: "회사물품_사용", desc: "회사 물건을 개인 용도로 사용" },
    // 가족/육아
    { test: () => (lower.includes("아이") || lower.includes("아들") || lower.includes("딸")) && lower.includes("혼자") && lower.includes("집"), action: "아이_방치", desc: "아이를 혼자 집에 둠" },
    { test: () => lower.includes("혼냈") || lower.includes("혼내"), action: "아이_훈육", desc: "아이를 혼냄" },
    { test: () => lower.includes("요양원"), action: "요양원_입소", desc: "부모님을 요양원에 모심" },
    { test: () => lower.includes("용돈") && lower.includes("끊"), action: "용돈_차단", desc: "동생 용돈을 끊음" },
    { test: () => lower.includes("유언") || lower.includes("상속"), action: "유언_위반", desc: "유언대로 상속하지 않음" },
    // 이웃/공동생활
    { test: () => lower.includes("층간소음") || (lower.includes("소리") && lower.includes("위층")), action: "층간소음_항의", desc: "층간소음에 항의" },
    { test: () => lower.includes("담배") && lower.includes("베란다"), action: "베란다_흡연", desc: "베란다에서 담배를 피움" },
    { test: () => lower.includes("쓰레기") && lower.includes("공동"), action: "쓰레기_투기", desc: "공동 공간에 쓰레기를 버림" },
    { test: () => lower.includes("청소") && lower.includes("안"), action: "청소_미참여", desc: "공동 청소에 참여하지 않음" },
    { test: () => lower.includes("냄새") && lower.includes("음식"), action: "냄새_피해", desc: "음식 냄새로 항의받음" },
    { test: () => lower.includes("반려견") || lower.includes("강아지") || lower.includes("개"), action: "반려동물_소음", desc: "반려동물 소음 문제" },
    // 교통
    { test: () => lower.includes("무단횡단"), action: "무단횡단", desc: "무단횡단 사고" },
    { test: () => lower.includes("과속"), action: "과속", desc: "과속 운전" },
    { test: () => lower.includes("주차") && lower.includes("남의"), action: "주차_위반", desc: "남의 주차 자리를 사용" },
    { test: () => lower.includes("흠집") || lower.includes("금"), action: "차량_흠집", desc: "차에 흠집을 냄" },
    // 직장
    { test: () => lower.includes("휴가") && lower.includes("강행"), action: "휴가_강행", desc: "휴가를 강행" },
    { test: () => lower.includes("내부고발") || lower.includes("기밀"), action: "내부고발", desc: "회사 문제를 외부에 알림" },
    { test: () => lower.includes("실수") && lower.includes("상사"), action: "동료_실수_고발", desc: "동료의 실수를 상사에게 말함" },
    { test: () => lower.includes("이직"), action: "이직_거절", desc: "동료의 이직 제안을 거절" },
    // 관계/사회
    { test: () => lower.includes("파혼") || lower.includes("결혼") && lower.includes("취소"), action: "파혼", desc: "결혼을 취소함" },
    { test: () => lower.includes("새치기"), action: "새치기_제지", desc: "새치기를 제지함" },
    { test: () => lower.includes("시험지") || lower.includes("부정행위"), action: "부정행위", desc: "시험 부정행위" },
    { test: () => lower.includes("리뷰") || lower.includes("별점"), action: "악성_리뷰", desc: "별점 1점 리뷰" },
    { test: () => lower.includes("전화") && lower.includes("버스"), action: "공공장소_통화", desc: "버스에서 통화" },
    { test: () => lower.includes("반찬") && lower.includes("더"), action: "반찬_요구", desc: "반찬 추가 요구" },
    { test: () => lower.includes("범죄") && lower.includes("묵인"), action: "범죄_묵인", desc: "친구의 범죄를 묵인" },
    { test: () => lower.includes("축의금") && lower.includes("안"), action: "축의금_미납", desc: "축의금을 내지 않음" },
    { test: () => lower.includes("약속") && lower.includes("늦"), action: "약속_지각", desc: "약속에 늦음" },
    { test: () => lower.includes("샴푸") || lower.includes("룸메이트"), action: "룸메이트_물건_사용", desc: "룸메이트 물건을 허락 없이 사용" },
    { test: () => lower.includes("공동 육아"), action: "공동육아_탈퇴", desc: "공동 육아에서 빠짐" },
    { test: () => lower.includes("공동 구매"), action: "공동구매_취소", desc: "공동 구매를 취소" },
    { test: () => lower.includes("선물") && lower.includes("돌려"), action: "선물_회수", desc: "준 선물을 돌려달라고 함" },
    { test: () => lower.includes("차단") && lower.includes("sns"), action: "sns_차단", desc: "친구 SNS를 차단" },
    { test: () => lower.includes("이사") && lower.includes("도와"), action: "이사_거절", desc: "이사 도와달라는 것을 거절" },
    { test: () => lower.includes("사회") && lower.includes("거절"), action: "사회_거절", desc: "결혼식 사회를 거절" },
    { test: () => lower.includes("택배"), action: "택배_분실", desc: "대신 받은 택배를 잃어버림" },
    { test: () => lower.includes("계산") && lower.includes("안"), action: "계산_미참여", desc: "모임에서 계산을 안 함" },
    { test: () => lower.includes("정원") && lower.includes("망가"), action: "정원_훼손", desc: "이웃 아이가 정원을 망가뜨림" },
    { test: () => lower.includes("돌잔치") && lower.includes("선물") && lower.includes("안"), action: "돌잔치_빈손", desc: "돌잔치에 빈손으로 감" },
    { test: () => lower.includes("비교") && lower.includes("아이"), action: "아이_비교", desc: "아이를 비교함" },
    { test: () => lower.includes("술자리") && lower.includes("비밀"), action: "술자리_비밀누설", desc: "술자리에서 비밀을 말함" },
    { test: () => lower.includes("연애") && lower.includes("반대"), action: "연애_반대", desc: "친구의 연애를 반대" },
    { test: () => lower.includes("학교") && lower.includes("불만"), action: "학교_항의", desc: "학교에 불만을 제기" },
    { test: () => lower.includes("싸움") && lower.includes("아이"), action: "아이싸움_개입", desc: "아이 싸움에 개입" },
  ];

  for (const p of patterns) {
    try {
      if (p.test()) actions.push({ action: p.action, desc: p.desc });
    } catch (e) {}
  }

  return { actions, context: story };
}

// 검사 주장 생성 (피고인 비판)
export function buildProsecutorArgs(story) {
  if (!story) return ["피고인의 행위는 명백한 잘못입니다!"];
  const { actions } = analyzeStoryCore(story);
  const args = [];

  for (const a of actions) {
    switch (a.action) {
      case "결제_안함":
        args.push("결제를 하지 않은 책임은 피할 수 없습니다.");
        args.push("실수였더라도 다시 돌아가 결제했어야 합니다.");
        args.push("금액이 적다고 책임이 사라지는 것은 아닙니다.");
        args.push("결국 대가를 지불하지 않고 물건을 가져간 것입니다.");
        break;
      case "습득물_미반환":
        args.push("주운 지갑을 돌려주지 않는 것은 절도와 다름없습니다.");
        args.push("주인이 잃어버렸다고 해서 가져도 되는 것이 아닙니다.");
        break;
      case "절도":
        args.push("물건을 훔친 것은 명백한 범죄입니다.");
        args.push("고의성이 인정되는 절도 행위입니다.");
        break;
      case "휴대폰_확인":
        args.push("상대방의 휴대폰을 몰래 보는 것은 사생활 침해입니다.");
        args.push("의심이 있다면 대화로 풀었어야 합니다.");
        break;
      case "연락처_삭제":
        args.push("상대방의 휴대폰에서 몰래 연락처를 삭제하는 것은 사생활 침해입니다.");
        args.push("통제하려는 의도가 엿보입니다.");
        break;
      case "몰래_녹음":
        args.push("동의 없이 녹음하는 것은 불법입니다.");
        args.push("증거 수집이라도 합법적인 방법이 있었습니다.");
        break;
      case "사진_게시":
        args.push("동의 없이 타인의 사진을 올리는 것은 초상권 침해입니다.");
        break;
      case "비밀_누설":
        args.push("친구의 비밀을 지키지 못한 것은 신뢰 배신입니다.");
        args.push("고민을 털어놓은 친구를 배신한 것입니다.");
        break;
      case "거짓말":
        args.push("거짓말로 얻은 것은 결국 드러나기 마련입니다.");
        args.push("신뢰를 깨뜨린 것은 피고인의 책임입니다.");
        break;
      case "경력_위조":
        args.push("경력을 속여 입사한 것은 다른 지원자에게 불공정합니다.");
        break;
      case "돈_미상환":
        args.push("빌린 돈을 갚지 않는 것은 신용 위반입니다.");
        args.push("약속한 날짜에 갚는 것이 기본입니다.");
        break;
      case "돈_독촉":
        args.push("빌려준 돈을 독촉하는 것은 정당한 권리 행사입니다.");
        break;
      case "적금_해지":
        args.push("부모님의 적금을 몰래 해지하는 것은 재산권 침해입니다.");
        break;
      case "공동계좌_사용":
        args.push("공동 계좌에서 상의 없이 돈을 쓰는 것은 배우자의 권리 침해입니다.");
        break;
      case "회사물품_사용":
        args.push("회사 물건을 개인 용도로 쓰는 것은 횡령입니다.");
        break;
      case "아이_방치":
        args.push("어린 아이를 혼자 집에 두는 것은 위험한 방치입니다.");
        args.push("아동학대에 해당할 수 있는 행위입니다.");
        break;
      case "아이_훈육":
        args.push("체벌은 시대에 맞지 않는 훈육 방식입니다.");
        args.push("공공장소에서 아이를 때리는 것은 과도합니다.");
        break;
      case "요양원_입소":
        args.push("부모님을 요양원에 보내는 것은 효도의 의무를 저버리는 것입니다.");
        break;
      case "용돈_차단":
        args.push("동생의 용돈을 일방적으로 끊는 것은 가족의 의무를 저버리는 것입니다.");
        break;
      case "유언_위반":
        args.push("부모님의 유언을 무시하는 것은 효도에 어긋납니다.");
        break;
      case "층간소음_항의":
        args.push("이웃에게 소음 피해를 주는 것은 공동생활 위반입니다.");
        break;
      case "베란다_흡연":
        args.push("베란다 흡연은 이웃의 권리를 침해합니다.");
        break;
      case "쓰레기_투기":
        args.push("공동 공간에 쓰레기를 버리는 것은 공중의 권리 침해입니다.");
        break;
      case "청소_미참여":
        args.push("공동 청소에 참여하지 않는 것은 공동체 의무 위반입니다.");
        break;
      case "냄새_피해":
        args.push("이웃에게 냄새 피해를 주는 것은 공동생활 예의 위반입니다.");
        break;
      case "반려동물_소음":
        args.push("반려동물 소음으로 이웃에게 피해를 주면 안 됩니다.");
        break;
      case "무단횡단":
        args.push("무단횡단 사고는 운전자에게도 큰 피해를 줍니다.");
        break;
      case "과속":
        args.push("과속은 타인의 생명을 위협하는 행위입니다.");
        break;
      case "주차_위반":
        args.push("남의 주차 자리를 사용하는 것은 권리 침해입니다.");
        break;
      case "차량_흠집":
        args.push("흠집을 내고 숨기는 것은 책임 회피입니다.");
        break;
      case "휴가_강행":
        args.push("팀에 피해를 주면서 휴가를 강행하는 것은 이기적입니다.");
        break;
      case "내부고발":
        args.push("회사 기밀을 외부에 유출하는 것은 중대한 위반입니다.");
        break;
      case "동료_실수_고발":
        args.push("동료의 실수를 상사에게 말하는 것은 배신입니다.");
        break;
      case "이직_거절":
        args.push("동료의 이직 제안을 거절하고 남는 것은 배신입니다.");
        break;
      case "파혼":
        args.push("결혼을 일방적으로 파기하는 것은 상대방에게 큰 피해를 줍니다.");
        break;
      case "새치기_제지":
        args.push("상황을 모르고 제지하는 것은 과도한 행동입니다.");
        break;
      case "부정행위":
        args.push("시험 부정행위는 공정성을 훼손합니다.");
        break;
      case "악성_리뷰":
        args.push("악의적 리뷰는 사장님의 장사에 직접적 피해를 줍니다.");
        break;
      case "공공장소_통화":
        args.push("공공장소에서 큰 소리로 통화하는 것은 타인에게 불편을 줍니다.");
        break;
      case "반찬_요구":
        args.push("반찬을 공짜로 더 달라는 것은 무리한 요구입니다.");
        break;
      case "범죄_묵인":
        args.push("친구의 범죄를 묵인하는 것은 공범과 다름없습니다.");
        break;
      case "축의금_미납":
        args.push("결혼식에 축의금도 안 내는 것은 인간관계의 기본을 무시합니다.");
        break;
      case "약속_지각":
        args.push("약속을 어기고 연락도 안 하는 것은 신뢰를 깨는 행위입니다.");
        break;
      case "룸메이트_물건_사용":
        args.push("룸메이트 물건을 허락 없이 쓰는 것은 사생활 침해입니다.");
        break;
      case "공동육아_탈퇴":
        args.push("공동 육아에서 빠지는 것은 다른 부모에게 부담을 줍니다.");
        break;
      case "공동구매_취소":
        args.push("공동 구매에서 중간에 빠지는 것은 신뢰를 깨는 행위입니다.");
        break;
      case "선물_회수":
        args.push("준 선물을 돌려달라는 것은 인간관계를 거래로 보는 것입니다.");
        break;
      case "sns_차단":
        args.push("친구를 일방적으로 차단하는 것은 인간관계의 기본을 무시합니다.");
        break;
      case "이사_거절":
        args.push("친구가 도와달라는데 안 가는 것은 의리가 없는 행위입니다.");
        break;
      case "사회_거절":
        args.push("결혼식 사회를 거절하는 것은 오랜 친구에 대한 배신입니다.");
        break;
      case "택배_분실":
        args.push("대신 받은 택배를 잃어버리는 것은 책임 회피입니다.");
        break;
      case "계산_미참여":
        args.push("모임에서 계산을 안 하는 것은 무임승차입니다.");
        break;
      case "정원_훼손":
        args.push("이웃 아이가 정원을 망가뜨렸다면 보상하는 것이 당연합니다.");
        break;
      case "돌잔치_빈손":
        args.push("돌잔치에 빈손으로 오는 것은 예의에 어긋납니다.");
        break;
      case "아이_비교":
        args.push("아이를 비교하는 것은 부모에게 상처를 주는 행위입니다.");
        break;
      case "술자리_비밀누설":
        args.push("술자리에서 비밀을 말하는 것은 변명의 여지가 없습니다.");
        break;
      case "연애_반대":
        args.push("친구의 연애에 참견하는 것은 선을 넘는 행위입니다.");
        break;
      case "학교_항의":
        args.push("학교에 무분별하게 불만을 제기하는 것은 선생님에게 피해를 줍니다.");
        break;
      case "아이싸움_개입":
        args.push("아이 싸움에 어른이 개입하는 것은 상황을 악화시킵니다.");
        break;
    }
  }

  // 기본 주장
  if (args.length < 3) {
    args.push("피고인의 행위는 사회적 신뢰를 훼손합니다.");
    args.push("이러한 행동은 반복될 우려가 있으며 책임을 져야 합니다.");
  }
  if (args.length < 4) {
    args.push("피해가 발생했다면 마땅히 책임을 져야 합니다.");
  }

  // 중복 제거
  return [...new Set(args)].slice(0, 5);
}

// 변호사 주장 생성 (피고인 변호)
export function buildLawyerArgs(story) {
  if (!story) return ["피고인에게는 사정이 있습니다."];
  const { actions } = analyzeStoryCore(story);
  const args = [];

  for (const a of actions) {
    switch (a.action) {
      case "결제_안함":
        args.push("고의가 아니라 단순 실수였습니다.");
        args.push("무인매장에서는 누구나 실수할 수 있습니다.");
        args.push("절도 의도가 있었다고 보기 어렵습니다.");
        args.push("금액도 크지 않았습니다.");
        args.push("충분히 참작할 사정이 있습니다.");
        break;
      case "습득물_미반환":
        args.push("주인을 찾기 어려운 상황이었습니다.");
        args.push("고의로 가로챈 것이 아닙니다.");
        break;
      case "절도":
        args.push("고의성이 없는 우발적 행동이었습니다.");
        break;
      case "휴대폰_확인":
        args.push("의심스러운 상황이 있어 불가피했습니다.");
        args.push("관계를 지키려는 마음에서였습니다.");
        break;
      case "연락처_삭제":
        args.push("관계를 지키고 싶은 마음에서 한 행동입니다.");
        args.push("악의가 아니라 걱정에서 비롯됐습니다.");
        break;
      case "몰래_녹음":
        args.push("폭언의 증거를 수집하기 위한 불가피한 선택이었습니다.");
        break;
      case "사진_게시":
        args.push("모임 사진이었으며 악의가 없었습니다.");
        break;
      case "비밀_누설":
        args.push("고민을 털어놓을 사람이 필요했을 뿐, 악의는 없었습니다.");
        args.push("누군가에게 도움을 구하고 싶었을 뿐입니다.");
        break;
      case "거짓말":
        args.push("불가피한 상황이었으며, 능력은 충분합니다.");
        break;
      case "경력_위조":
        args.push("실제 능력은 충분하며, 사소한 과장이었습니다.");
        break;
      case "돈_미상환":
        args.push("경제적 어려움으로 일시적으로 상환이 지연된 것뿐입니다.");
        break;
      case "돈_독촉":
        args.push("빌려준 돈을 돌려받는 것은 정당한 권리입니다.");
        break;
      case "적금_해지":
        args.push("부모님의 병원비를 위한 긴급한 선택이었습니다.");
        break;
      case "공동계좌_사용":
        args.push("가족인데 그 정도도 안 되나 싶었으며, 금액도 크지 않았습니다.");
        break;
      case "회사물품_사용":
        args.push("사소한 물건이며, 다들 하는 수준입니다.");
        break;
      case "아이_방치":
        args.push("급한 일이 있어서 불가피했으며, 한 시간뿐이었습니다.");
        args.push("아이가 초등학생이므로 잠깐은 괜찮다고 판단했습니다.");
        break;
      case "아이_훈육":
        args.push("아이의 교육을 위한 훈육이었으며, 사랑에서 비롯된 것입니다.");
        break;
      case "요양원_입소":
        args.push("혼자 돌볼 수 없어서 더 안전한 선택을 한 것뿐입니다.");
        break;
      case "용돈_차단":
        args.push("게임에 쓰는 것을 알고 끊은 것이며, 올바른 교육입니다.");
        break;
    }
  }

  if (args.length < 3) {
    args.push("피고인에게는 충분히 참작할 사정이 있습니다.");
    args.push("그 한 번의 실수로 피고인의 인격 전체를 매도해서는 안 됩니다.");
  }
  if (args.length < 4) {
    args.push("피고인은 깊이 반성하고 있으며 정상이 참작되어야 합니다.");
  }

  return [...new Set(args)].slice(0, 5);
}
