const stage = document.getElementById("stage");
const scene2 = document.getElementById("scene2");
const scene3 = document.getElementById("scene3");
const scene4 = document.getElementById("scene4");
const scene5 = document.getElementById("scene5");
const scene6 = document.getElementById("scene6");
const completeName = document.getElementById("completeName");
const completeRank = document.getElementById("completeRank");
const completeHomeBtn = document.getElementById("completeHomeBtn");
const collectionBtn = document.getElementById("collectionBtn");
const collectionOverlay = document.getElementById("collectionOverlay");
const collectionCloseBtn = document.getElementById("collectionCloseBtn");
const collectionGrid = document.getElementById("collectionGrid");
const acceptBtn = document.getElementById("acceptBtn");
const greetName2 = document.getElementById("greetName2");
const sealBtn = document.getElementById("sealBtn");
const replayBtn = document.getElementById("replayBtn");
const gate = document.getElementById("gate");
const gateForm = document.getElementById("gateForm");
const gateInput = document.getElementById("gateName");
const greetName = document.getElementById("greetName");
const letterText = document.querySelector(".letter-text");
const enterBtn = document.getElementById("enterBtn");
const quizProgress = document.getElementById("quizProgress");
const quizChoices = document.getElementById("quizChoices");
const quizFeedback = document.getElementById("quizFeedback");
const quizFeedbackText = document.getElementById("quizFeedbackText");
const hintBtn = document.getElementById("hintBtn");
const specimenImg = document.getElementById("specimenImg");
const specimenCard = document.getElementById("specimenCard");
const revealCard = document.getElementById("revealCard");
const nextBtn = document.getElementById("nextBtn");
const endResearchBtn = document.getElementById("endResearchBtn");
const tutorialOverlay = document.getElementById("tutorialOverlay");
const tutorialSpot = document.getElementById("tutorialSpot");
const tutorialTip = document.getElementById("tutorialTip");
const tutorialTipText = document.getElementById("tutorialTipText");
const tutorialNextBtn = document.getElementById("tutorialNextBtn");
const tutorialStepCount = document.getElementById("tutorialStepCount");
const quizFailOverlay = document.getElementById("quizFailOverlay");

// ===== 이름 입력 게이트 =====
// 이름을 제출하면 게이트(어두운 배경 + 타이틀 + 입력 폼)가 페이드아웃되고,
// .stage에서 pre-gate 클래스가 빠지면서 실링 왁스 클릭도 가능해집니다.
// 편지 화면에서 HOME을 누르면 표본실로 돌아가면서 게이트도 다시 초기 상태로
// 뜹니다(아래 replayBtn 핸들러 참고). playerName은 나중에 화면 어딘가에
// 이름을 반영하고 싶어지면 그대로 가져다 쓰면 됩니다.
let playerName = "";
gateForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = gateInput.value.trim();
  if (!name) return;
  playerName = name;
  greetName.textContent = playerName + " ";
  gate.classList.add("is-leaving");
  // 어둠(gate-scrim)이 title-wrap/gate-form(1.4s)보다 더 오래(1.7s) 페이드아웃되므로,
  // 게이트를 완전히 숨기는 시점도 그 시간에 맞춥니다. pre-gate 클래스도 이때
  // 같이 떼어내서, 실링 왁스의 펄스 링이 어둠이 완전히 사라지기 전에 미리
  // 나타나 시선을 분산시키지 않고 어둠이 다 걷힌 뒤에야 등장하도록 합니다.
  setTimeout(() => {
    gate.hidden = true;
    stage.classList.remove("pre-gate");
  }, 1700);
});

sealBtn.addEventListener("click", () => {
  stage.classList.add("is-transitioning");
  sealBtn.disabled = true;
  setTimeout(() => {
    scene2.classList.remove("is-active");
    scene3.classList.add("is-active");
    stage.classList.remove("is-transitioning");
    replayBtn.hidden = false;
  }, 620);
});

// "수락하기": 바로 퀴즈로 넘어가지 않고, 신원 확인 명패(scene4)를 한 번 더
// 보여줍니다. 이름은 게이트에서 이미 받아둔 playerName을 그대로 채웁니다.
acceptBtn.addEventListener("click", () => {
  greetName2.textContent = playerName + " ";
  scene3.classList.remove("is-active");
  scene4.classList.add("is-active");
});

// HOME 버튼: 표본실 화면으로 돌아가면서, 이름 입력 게이트도 다시 띄웁니다.
replayBtn.addEventListener("click", () => {
  scene3.classList.remove("is-active");
  scene4.classList.remove("is-active");
  scene5.classList.remove("is-active");
  scene6.classList.remove("is-active");
  scene2.classList.add("is-active");
  sealBtn.disabled = false;
  replayBtn.hidden = true;
  resetQuiz();
  // 컬렉션 팝업이 열려 있던 채로 표본실로 돌아가면, 다음에 연구 완료
  // 화면에 다시 도달했을 때 이전 상태(열림)가 그대로 남아있으므로 닫힌
  // 상태로 되돌려둡니다.
  collectionOverlay.classList.remove("is-visible");
  collectionOverlay.hidden = true;

  // 게이트를 초기 상태로 되돌립니다 (어둠 + 타이틀 + 이름 입력 폼 다시 표시).
  gateInput.value = "";
  gate.classList.remove("is-leaving");
  gate.hidden = false;
  stage.classList.add("pre-gate");
});

// ===== 화면 4: 문제 (Who am I) =====
// 18개 표본 전체를 데이터로 들고 있다가, 문제 화면에 들어갈 때마다
// buildQuizOrder()로 순서를 새로 섞어 한 문제씩 보여줍니다. 다만
// 튜토리얼이 판다 표본을 기준으로 설명하므로 첫 문제만은 항상 판다로
// 고정됩니다 — buildQuizOrder() 참고.
//
// 04.MVU-05(향유고래) 서식지, 02.MEN-06(해달) 상태 — 원본 문서(Basic_info
// docx)에 오류가 있어 한동안 원문 그대로 넣어뒀던 부분인데, 레이너스가
// 원본 문서를 수정해줘서 아래 값도 맞춰 갱신했습니다.
const SPECIMENS = [
  {
    code: "01.MVU-05",
    name: "판다",
    classKr: "포유류",
    status: "VU[취약]",
    habitat: "중국 쓰촨성, 산시성, 간쑤성 산악지대",
    detail:
      "여섯 번째 손가락처럼 보이는 돌기가 있다. 실제 손가락 뼈가 아닌 요골 종자골이 극도로 발달한 구조이다. 다른 곰에게도 이 뼈는 있지만 이처럼 발달해 엄지처럼 기능하지는 않는다. 이 덕분에 대나무 줄기를 엄지와 나머지 네 손가락과 완전히 다른 뼈에서 유사한 기능이 만들어진 것이다.",
    qImg: "./img/specimens/01-ailuropoda-q.png?v=1",
    aImg: "./img/specimens/01-ailuropoda-a-crop.png?v=1",
    hintImg: "./img/specimens/01-ailuropoda-hint-crop.png?v=1",
    mapImg: "./img/specimens/01-ailuropoda-map.png?v=1",
  },
  {
    code: "02.MEN-06",
    name: "해달",
    classKr: "포유류",
    status: "EN[위기]",
    habitat: "북태평양 연안",
    detail:
      "뒷발은 앞발과 대조적으로 크고 넓게 발달한 물갈퀴 구조이다. 수달과 달리 뒷발이 완전히 지느러미 형태에 가깝게 변형되어있다. 육지에서는 움직임이 어색하지만, 수중에서는 강력한 추진력을 만든다.",
    qImg: "./img/specimens/02-enhydra-q.png?v=1",
    aImg: "./img/specimens/02-enhydra-a-crop.png?v=1",
    hintImg: "./img/specimens/02-enhydra-hint-crop.png?v=1",
    mapImg: "./img/specimens/02-enhydra-map.png?v=1",
  },
  {
    code: "03.MCR-07",
    name: "북방털코웜뱃",
    classKr: "포유류",
    status: "CR[위급]",
    habitat: "호주 퀸즐랜드 주 에핑 포레스트 국립공원",
    detail:
      "앞발 뼈가 매우 굵고 짧으며, 발톱 뼈가 크고 두껍게 발달해 잇다. 다섯 개의 발가락 모두에 강력한 발톱이 달려 있고, 단단한 점토질 토양도 파낼 수 있는 구조이다. 어깨뼈와 쇄골이 굴착 시 충격을 분산하기 위해 특수하게 발달해있다.",
    qImg: "./img/specimens/03-lasiorhinus-q.png?v=1",
    aImg: "./img/specimens/03-lasiorhinus-a-crop.png?v=1",
    hintImg: "./img/specimens/03-lasiorhinus-hint-crop.png?v=1",
    mapImg: "./img/specimens/03-lasiorhinus-map.png?v=1",
  },
  {
    code: "04.MVU-05",
    name: "향유고래",
    classKr: "포유류",
    status: "VU[취약]",
    habitat: "전 세계의 모든 바다",
    detail:
      "앞지느러미 안쪽에는 상완골, 요골, 척골, 손목뼈, 손가락뼈가 온전히 남아있다. 겉에서는 지느러미로 보이지만 골격은 육상 포유류의 앞발 구조 그대로이다. 손가락 뼈가 5개 모두 존재하며 특히 두 번째와 세 번째 손가락 뼈의 마디수가 늘어나 지느러미를 넓게 만든다.",
    qImg: "./img/specimens/04-physeter-q.png?v=1",
    aImg: "./img/specimens/04-physeter-a-crop.png?v=1",
    hintImg: "./img/specimens/04-physeter-hint-crop.png?v=1",
    mapImg: "./img/specimens/04-physeter-map.png?v=1",
  },
  {
    code: "05.MEX-09",
    name: "태즈메이니아 주머니 늑대",
    classKr: "포유류",
    status: "EX[절멸]",
    habitat: "호주, 태즈메이니아 섬, 뉴기니",
    detail:
      "꼬리가 몸통에서 이어지는 것이 아닌 척추와 거의 일체형이다. 꼬리를 따로 흔들지 못하고 몸 전체와 같이 움직인다. 이 역시 개과 동물과 명확히 구분된다.",
    qImg: "./img/specimens/05-thylacinus-q.png?v=1",
    aImg: "./img/specimens/05-thylacinus-a-crop.png?v=1",
    hintImg: "./img/specimens/05-thylacinus-hint-crop.png?v=1",
    mapImg: "./img/specimens/05-thylacinus-map.png?v=1",
  },
  {
    code: "06.BVU-05",
    name: "키위새",
    classKr: "조류",
    status: "VU[취약]",
    habitat: "뉴질랜드",
    detail:
      "암컷의 복강 대비 알의 크기가 체중의 약 15-20%에 달한다. 인간으로 치면 6-7kg 짜리 아기를 낳는 것과 비슷한 비율이다. 알이 너무 커서 산란 직전 암컷은 먹이를 먹을 공간조차 없어 굶는 경우도 있다. 골반뼈가 이 거대한 알을 수용하기 위해 유달리 넓게 발달해 있다.",
    qImg: "./img/specimens/06-apteryx-q.png?v=1",
    aImg: "./img/specimens/06-apteryx-a-crop.png?v=1",
    hintImg: "./img/specimens/06-apteryx-hint-crop.png?v=1",
    mapImg: "./img/specimens/06-apteryx-map.png?v=1",
  },
  {
    code: "07.BLC-03",
    name: "수리부엉이",
    classKr: "조류",
    status: "LC[최소관심]",
    habitat: "유럽, 아시아 전역",
    detail:
      "눈구멍이 극도로 크고 앞을 향해 있어, 두개골 대비 눈이 차지하는 비율이 포유류와 비교할 수 없을 만큼 크다. 눈이 구형이 아닌 튜브형태로 안구가 고정되어 있어서 눈동자를 굴릴 수 없고, 대신 목을 270˚까지 돌릴 수 있는 경추 구조를 가지고 있다.",
    qImg: "./img/specimens/07-bubobubo-q.png?v=1",
    aImg: "./img/specimens/07-bubobubo-a-crop.png?v=1",
    hintImg: "./img/specimens/07-bubobubo-hint-crop.png?v=1",
    mapImg: "./img/specimens/07-bubobubo-map.png?v=1",
  },
  {
    code: "08.BVU-05",
    name: "두루미",
    classKr: "조류",
    status: "VU[취약]",
    habitat: "동아시아[한국, 일본, 중국, 러시아]",
    detail:
      "두개골은 작고 가볍지만 부리는 길고 뾰족하게 발달해 있다. 이마 위의 붉은 정수리 부분은 뼈가 아니라 피부가 직접 노출된 나출부이다. 따라서 골격에는 나타나지 않는 특징이다.",
    qImg: "./img/specimens/08-grusjaponensis-q.png?v=1",
    aImg: "./img/specimens/08-grusjaponensis-a-crop.png?v=1",
    hintImg: "./img/specimens/08-grusjaponensis-hint-crop.png?v=1",
    mapImg: "./img/specimens/08-grusjaponensis-map.png?v=1",
  },
  {
    code: "09.BEX-09",
    name: "도도새",
    classKr: "조류",
    status: "EX[절멸]",
    habitat: "모리셔스 섬",
    detail:
      "날개뼈 자체는 남아있으나, 극도로 퇴화되어있다. 날개 길이가 몸에 비해 매우 짧고, 비행에 필요한 근육이 붙을 자리가 없다. 날개뼈는 비행보다 균형유지나 구애 행동에 사용된 것으로 추정된다.",
    qImg: "./img/specimens/09-raphuscucullatus-q.png?v=1",
    aImg: "./img/specimens/09-raphuscucullatus-a-crop.png?v=1",
    hintImg: "./img/specimens/09-raphuscucullatus-hint-crop.png?v=1",
    mapImg: "./img/specimens/09-raphuscucullatus-map.png?v=1",
  },
  {
    code: "10.RLC-03",
    name: "그물무늬비단뱀",
    classKr: "파충류",
    status: "LC[최소관심]",
    habitat: "동남아시아",
    detail:
      "각각의 척추뼈는 4개의 관절돌기로 연결되어있다. 400-600개의 관절이 있고, 일반 척추동물의 척추뼈가 2개의 관절돌기로 연결되는 것과 달리, 이 표본은 4개로 연결되어 더 강인하면서도 유연한 구조이다. 각 척추뼈에 갈비뼈 한 쌍이 붙어 있어 척추뼈 수 만큼 갈비뼈 쌍도 존재한다. 갈비뼈 끝이 흉골에 연결되지 않고 자유롭게 열려 있어 흉곽이 먹이를 감쌀 때 자유롭게 확장된다.",
    qImg: "./img/specimens/10-malayopython-q.png?v=1",
    aImg: "./img/specimens/10-malayopython-a-crop.png?v=1",
    hintImg: "./img/specimens/10-malayopython-hint-crop.png?v=1",
    mapImg: "./img/specimens/10-malayopython-map.png?v=1",
  },
  {
    code: "11.RLC-03",
    name: "남생이",
    classKr: "파충류",
    status: "EN[위기]",
    habitat: "한국, 중국, 일본, 대만",
    detail:
      "척추뼈가 등딱지 안쪽 면에 완전히 융합되어 있다. 목뼈와 꼬리뼈만 자유롭게 움직일 수 있다. 남생이를 포함한 잠경아목 거북류는 목을 수직 S자로 접어 안쪽으로 집어 넣을 수 있다. 이를 가능하게 하는 경추 구조가 매우 유연하게 발달되어 있다. 일반적인 척추동물의 갈비뼈는 가늘고 둥굴게 휘어져있지만, 거북의 갈비뼈는 납작하게 펼쳐진 판 형태로 변형되어 있다. 이 판들이 서로 맞닿아 등딱지의 골격층을 형성한다.",
    qImg: "./img/specimens/11-mauremys-q.png?v=1",
    aImg: "./img/specimens/11-mauremys-a-crop.png?v=1",
    hintImg: "./img/specimens/11-mauremys-hint-crop.png?v=1",
    mapImg: "./img/specimens/11-mauremys-map.png?v=1",
  },
  {
    code: "12.REN-06",
    name: "코모도 왕 도마뱀",
    classKr: "파충류",
    status: "EN[위기]",
    habitat: "인도네시아 코모도, 린카, 플로레스 섬",
    detail:
      "포유류와 달리 흉골이 없다. 갈비뼈가 복부까지 이어지는 복늑골이 있고, 이 뼈들이 내장을 보호한다. 폐가 매우 커서 산소 저장 능력이 뛰어나고, 격렬한 활동 후 빠르게 회복할 수 있다.",
    qImg: "./img/specimens/12-varanuskomodoensis-q.png?v=1",
    aImg: "./img/specimens/12-varanuskomodoensis-a-crop.png?v=1",
    hintImg: "./img/specimens/12-varanuskomodoensis-hint-crop.png?v=1",
    mapImg: "./img/specimens/12-varanuskomodoensis-map.png?v=1",
  },
  {
    code: "13.ACR-07",
    name: "아홀로틀",
    classKr: "양서류",
    status: "CR[위급]",
    habitat: "멕시코 소치밀코 호수",
    detail:
      "사지를 절단해도 완전히 재생된다. 단순히 피부만 재생되는 것이 아닌 뼈, 연골, 근육, 신경, 혈관까지 원래와 동일하게 재생된다. 재생된 사지의 뼈는 처음에는 연골로 형성된 후 점차 골화가 진행된다. 재생 속도는 손상 정도에 따라 다르지만 다리 하나를 완전히 재생하는 데 약 수 주에서 수 개월이 걸린다.",
    qImg: "./img/specimens/13-ambystoma-q.png?v=1",
    aImg: "./img/specimens/13-ambystoma-a-crop.png?v=1",
    hintImg: "./img/specimens/13-ambystoma-hint-crop.png?v=1",
    mapImg: "./img/specimens/13-ambystoma-map.png?v=1",
  },
  {
    code: "14.ACR-07",
    name: "중국장수도롱뇽",
    classKr: "양서류",
    status: "CR[위급]",
    habitat: "중국 중부 및 남부 산악 하천",
    detail:
      "두개골이 극도로 납작하고 넓적한 형태이다. 현대 양서류보다 훨씬 원시적인 두개골 구조로, 고생대 양서류 화석과 유사한 형태를 보인다. 눈구멍이 매우 작고 두개골 위쪽에 위치해 있다. 시력이 극도로 퇴화한 대신 피부 전체로 진동과 수압 변화를 감지하는 능력이 발달하였다. 턱뼈뿐만 아니라 구개골에도 이빨이 나있다. 이빨이 작고 원뿔형이며 여러 줄로 배열되어 있다. 미끄러운 물고기와 갑각류를 놓치지 않고 잡기 위한 구조이다. 이빨 구조 자체가 고생대 양서류와 매우 유사하다.",
    qImg: "./img/specimens/14-andrias-q.png?v=1",
    aImg: "./img/specimens/14-andrias-a-crop.png?v=1",
    hintImg: "./img/specimens/14-andrias-hint-crop.png?v=1",
    mapImg: "./img/specimens/14-andrias-map.png?v=1",
  },
  {
    code: "15.AEN-06",
    name: "골리앗개구리",
    classKr: "양서류",
    status: "EN[위기]",
    habitat: "서아프리카 카메룬, 적도기니",
    detail:
      "뒷다리뼈가 몸통보다 훨씬 길고 강인하게 발달해있다. 대퇴골, 경골, 비골이 차례로 이어지며 접혔다가 폭발적으로 펴지는 구조이다. 개구리류는 발목뼈인 거골과 종골이 길게 늘어나 추가적인 다리분절로 기능한다. 즉 인간의 발목에 해당하는 뼈가 개구리에서는 하나의 다리처럼 길게 뻗어 있다. 덕분에 실질적인 도약 구간이 더 길어진다. 이 구조로 최대 3m 이상 도약이 가능하다.",
    qImg: "./img/specimens/15-conraua-q.png?v=1",
    aImg: "./img/specimens/15-conraua-a-crop.png?v=1",
    hintImg: "./img/specimens/15-conraua-hint-crop.png?v=1",
    mapImg: "./img/specimens/15-conraua-map.png?v=1",
  },
  {
    code: "16.FLC-03",
    name: "앨리게이터가아",
    classKr: "어류",
    status: "LC[최소관심]",
    habitat: "북미 미시시피강 유역, 멕시코만 연안",
    detail:
      "가노인 비늘은 단순한 피부 구조가 아니다. 비늘 아래 진피골층이 발달해있어, 비늘과 피부, 뼈가 연속적인 구조를 이루고 있다. 이 구조 전체가 회골격에 가까운 방어 체계를 형성한다. 비늘의 경도가 매우 높아 일반 칼로는 자르기 어려운 수준이다.",
    qImg: "./img/specimens/16-atractosteus-q.png?v=1",
    aImg: "./img/specimens/16-atractosteus-a-crop.png?v=1",
    hintImg: "./img/specimens/16-atractosteus-hint-crop.png?v=1",
    mapImg: "./img/specimens/16-atractosteus-map.png?v=1",
  },
  {
    code: "17.FVU-05",
    name: "줄무늬해마",
    classKr: "어류",
    status: "VU[취약]",
    habitat: "북미 대서양 연안",
    detail:
      "꼬리뼈의 단면이 정사각형이다. 대부분의 동물 꼬리는 원형 단면이지만, 이 표본은 꼬리 척추를 감싸는 뼈관이 정사각형으로 배열되어있다.",
    qImg: "./img/specimens/17-hippocampus-q.png?v=1",
    aImg: "./img/specimens/17-hippocampus-a-crop.png?v=1",
    hintImg: "./img/specimens/17-hippocampus-hint-crop.png?v=1",
    mapImg: "./img/specimens/17-hippocampus-map.png?v=1",
  },
  {
    code: "18.FCR-07",
    name: "삽코철갑상어",
    classKr: "어류",
    status: "CR[위급]",
    habitat: "북미 미시시피강, 미주리강 유역",
    detail:
      "이름의 유래 그대로 주둥이가 삽 모양으로 납작하고 넓게 발달해 있다. 주둥이를 구성하는 연골이 앞으로 뻗어 납작한 삽 형태를 이루고 있다. 이 구조로 강바닥을 훑으며 먹이를 찾는 데 특화되어 있다. 주둥이 아랫면에는 4개의 수염이 달려있다. 수염 안에 감각들이 집중되어 있으며, 이 수염으로 탁한 물속 강바닥의 먹이를 감지한다. 두개골 자체는 연골로 구성되어 있으며 포유류나 경골어류처럼 봉합된 단단한 두개골이 아니다. 두개골 전체가 하나의 연골 덩어리에 가까운 구조이다.",
    qImg: "./img/specimens/18-scaphirhynchus-q.png?v=1",
    aImg: "./img/specimens/18-scaphirhynchus-a-crop.png?v=1",
    hintImg: "./img/specimens/18-scaphirhynchus-hint-crop.png?v=1",
    mapImg: "./img/specimens/18-scaphirhynchus-map.png?v=1",
  },
];

// Fisher–Yates 셔플. 배열을 그 자리에서 섞고 그대로 반환합니다.
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// 문제 순서: 매번 새로 섞되, 튜토리얼이 판다 표본을 기준으로 설명하고
// 있으므로 첫 문제만은 항상 판다가 나오도록 고정합니다.
// 문제 화면에 아직 한 번도 들어가지 않은 시점(예: 폰트 로딩 감지처럼
// 사용자 조작 전에 먼저 실행될 수 있는 코드)에도 안전하게 참조할 수
// 있도록, 기본값을 표본 순서 그대로 채워둡니다. buildQuizOrder()가
// 실제로 문제 화면에 들어갈 때 이 값을 다시 섞습니다.
let quizOrder = SPECIMENS.map((_, i) => i);
function buildQuizOrder() {
  const pandaIndex = SPECIMENS.findIndex((s) => s.name === "판다");
  const rest = SPECIMENS.map((_, i) => i).filter((i) => i !== pandaIndex);
  shuffleArray(rest);
  quizOrder = pandaIndex === -1 ? rest : [pandaIndex, ...rest];
}

// 정답 표본을 기준으로 오답 3개를 무작위로 뽑아 선택지 4개를 만듭니다.
// 두루미·수리부엉이는 뼈만 봐도 "새"라는 게 너무 티가 나서, 이 두
// 표본만은 오답도 다른 조류로만 채워 종류만으로 답이 드러나지 않게
// 합니다. (다른 조류인 키위새·도도새는 해당하지 않습니다.)
const BIRD_ONLY_CHOICE_NAMES = new Set(["두루미", "수리부엉이"]);
function buildChoicesFor(specimen) {
  const restrictToBirds = BIRD_ONLY_CHOICE_NAMES.has(specimen.name);
  const pool = SPECIMENS.filter((s) => {
    if (s.name === specimen.name) return false;
    return restrictToBirds ? s.classKr === "조류" : true;
  });
  shuffleArray(pool);
  const wrongNames = pool.slice(0, 3).map((s) => s.name);
  const choices = shuffleArray([specimen.name, ...wrongNames]);
  return { choices, correctIndex: choices.indexOf(specimen.name) };
}

const infoDetailText = document.getElementById("infoDetailText");
const infoClass = document.getElementById("infoClass");
const infoStatus = document.getElementById("infoStatus");
const infoMapImg = document.getElementById("infoMapImg");
const infoHabitatText = document.getElementById("infoHabitatText");
const revealCode = document.getElementById("revealCode");
const revealName = document.getElementById("revealName");
const revealImg = document.getElementById("revealImg");
const hintCardImg = document.getElementById("hintCardImg");
const progressCount = document.getElementById("progressCount");
const quizChoiceBtns = Array.from(quizChoices.querySelectorAll(".quiz-choice"));

let currentIndex = 0; // SPECIMENS 배열 기준 0부터 시작 (표본 1번)

// 상세 정보 문단을 맞출 때(fitDetailText) Adobe Fonts(Typekit)가 아직
// 로딩 중이면, 폰트가 대체(fallback) 서체로 잠깐 그려진 상태를 기준으로
// 줄바꿈을 재는 바람에 실제 폰트로 바뀐 뒤 문단이 더 길어지면서(줄
// 수가 늘어나면서) "상세 정보" 라벨이 카드 밖으로 밀려 잘리는 문제가
// 있었습니다. 문서 맨 위 <head>의 Typekit 스니펫이 로딩 완료 시
// <html>의 wf-loading 클래스를 떼어내므로, 그 순간을 감지해서 지금
// 보고 있는 표본 기준으로 상세 정보를 다시 한 번 맞춥니다.
const wfLoadObserver = new MutationObserver(() => {
  if (!document.documentElement.classList.contains("wf-loading")) {
    wfLoadObserver.disconnect();
    fitDetailText(SPECIMENS[quizOrder[currentIndex]].detail);
  }
});
wfLoadObserver.observe(document.documentElement, {
  attributes: true,
  attributeFilter: ["class"],
});

// 진행바 18칸을 현재 위치 기준으로 다시 그립니다 — 문제가 바뀔 때마다 호출됩니다.
function renderProgress() {
  quizProgress.innerHTML = "";
  for (let i = 0; i < SPECIMENS.length; i++) {
    const tick = document.createElement("span");
    tick.className = "quiz-progress-tick";
    if (i < currentIndex) {
      // 지나온 문항은 결과에 따라 정답(✓)/오답 처리(✕)로 구분해서 표시합니다.
      tick.classList.add(
        questionResults[i] === "skipped" ? "is-skipped" : "is-done"
      );
    }
    if (i === currentIndex) tick.classList.add("is-current");
    quizProgress.appendChild(tick);
  }
  progressCount.textContent = currentIndex + 1 + "/" + SPECIMENS.length;
}

// 현재 인덱스의 표본 데이터로 화면(상세정보·기본정보·표본 사진·힌트·
// 정답 패널·후보 4지선다)을 전부 채우고, 문제 상태를 처음으로 되돌립니다.
// 왼쪽 칸(상세 정보 + 기본 정보 카드)이 실제로 넘치고 있는지 확인합니다.
// overflow:hidden이어도 scrollHeight는 잘리지 않은 실제 내용 높이를
// 그대로 알려주므로 비교가 가능합니다.
function colLeftOverflowing() {
  const col = document.querySelector(".who-col-left");
  return col.scrollHeight > col.clientHeight + 1;
}

// 상세 정보 본문이 카드 두 개를 합친 칸 높이를 넘으면, 줄 수나 글자
// 수로 뚝 자르는 대신 온점(문장) 단위로 끊어서 마지막 완전한 문장까지만
// 보여줍니다. 기본 정보 카드(지도·서식지 텍스트 등)가 먼저 채워진
// 뒤에 호출되어야 정확한 남은 공간을 잴 수 있습니다.
function fitDetailText(fullText) {
  infoDetailText.textContent = fullText;
  if (!colLeftOverflowing()) return;

  const sentences = fullText.match(/[^.]+\.\s*/g) || [fullText];
  let shown = "";
  for (const sentence of sentences) {
    const attempt = shown + sentence;
    infoDetailText.textContent = attempt.trim();
    if (colLeftOverflowing() && shown !== "") {
      infoDetailText.textContent = shown.trim();
      return;
    }
    shown = attempt;
  }
  infoDetailText.textContent = shown.trim();
}

// 표본 사진들(qImg/aImg/hintImg/mapImg)이 장당 1~3MB짜리 고해상도
// PNG라서, loadSpecimen()이 호출되는 그 순간에야 .src를 걸면 화면이
// 바뀌는 타이밍에 로딩 지연이 그대로 보입니다. new Image()로 미리
// 같은 URL을 한 번 요청해 두면 브라우저 캐시에 적재되어, 실제로 그
// 문제에 도달했을 때는 loadSpecimen()이 같은 URL로 .src를 다시
// 걸어도 네트워크 요청 없이 캐시에서 바로 그려집니다. quizOrder
// 기준 인덱스당 한 번만 선반영하도록 Set으로 중복 요청을 막습니다.
const preloadedQuestionIndices = new Set();
function preloadSpecimenAt(index) {
  if (index < 0 || index >= quizOrder.length) return;
  if (preloadedQuestionIndices.has(index)) return;
  preloadedQuestionIndices.add(index);
  const s = SPECIMENS[quizOrder[index]];
  [s.qImg, s.aImg, s.hintImg, s.mapImg].forEach((src) => {
    const preloadImg = new Image();
    preloadImg.src = src;
  });
}

function loadSpecimen(index) {
  const s = SPECIMENS[quizOrder[index]];

  infoClass.textContent = s.classKr;
  infoStatus.textContent = s.status;
  infoHabitatText.textContent = s.habitat;
  infoMapImg.src = s.mapImg;
  // 기본 정보 카드(위 네 줄)가 다 채워진 뒤에 상세 정보를 맞춰야, 옆
  // 카드가 차지하는 실제 높이를 반영해서 정확히 잴 수 있습니다. 지도
  // 이미지는 표본마다 새로 불러오는 파일이라 이 시점엔 아직 로딩 중일
  // 수 있어서(위 .info-map에 aspect-ratio를 걸어 대부분은 미리 방지
  // 되지만), 로드가 끝난 뒤에도 한 번 더 확인해 "상세 정보" 라벨이
  // 카드 밖으로 밀려 잘리는 일이 없도록 합니다.
  fitDetailText(s.detail);
  infoMapImg.onload = () => {
    if (currentIndex === index) fitDetailText(s.detail);
  };

  specimenImg.src = s.qImg;

  revealCode.textContent = s.code;
  revealName.textContent = s.name;
  revealImg.src = s.aImg;
  revealImg.alt = s.name + " 전신 골격 — 파란 엑스레이 톤";

  hintCardImg.src = s.hintImg;

  const { choices, correctIndex } = buildChoicesFor(s);
  quizChoiceBtns.forEach((btn, i) => {
    btn.textContent = choices[i];
    if (i === correctIndex) {
      btn.dataset.correct = "true";
    } else {
      delete btn.dataset.correct;
    }
  });

  renderProgress();
  resetQuiz();

  // 지금 문제를 푸는 동안 다음 문제 이미지를 미리 받아둡니다.
  preloadSpecimenAt(index + 1);
}

// ===== 문제 화면 튜토리얼 =====
// 피그마(Desktop - 43~47)에 있던, 문제 화면 5곳(상세·기본 정보 카드 /
// 힌트 카드 / 선택지 / 진행률 / 연구종료)을 순서대로 짚어주는
// 스포트라이트 튜토리얼입니다. 화면을 어둡게 덮고 이번 단계에서
// 설명할 요소만 밝게 남긴 뒤, 그 옆에 말풍선으로 설명과 다음 화살표를
// 보여줍니다. 화살표를 누르면 다음 단계로, 마지막 단계에서 누르면
// 튜토리얼이 닫히고 바로 문제를 풀 수 있습니다.
const TUTORIAL_STEPS = [
  {
    // 특정 요소를 가리키지 않는 도입부 멘트(피그마 시안) — selector가 없으면
    // 화면 전체를 어둡게 덮고 말풍선만 가운데에 띄웁니다.
    text: "프로젝트에 앞서 박사님께 자료를 어떻게 정리해 두었는지를 알려드리겠습니다.",
  },
  {
    // 피그마 Desktop - 42 — 정보 카드보다 먼저, 가운데 표본 사진을
    // 짚어주는 단계가 빠져 있어서 추가했습니다.
    selector: "#specimenCard",
    text: "먼저 표본을 관찰해주세요. 저희가 미처 정체를 알아내지 못한 표본들의 정체를 맞춰주시면 됩니다.",
  },
  {
    selector: ".who-col-left",
    text: "표본에 대해 기록되어 있는 부분들을 참고하실 수 있게, 옆에 정리해 두었습니다. 상세 정보와 기본 정보를 통해서 정체를 유추해주세요",
  },
  {
    selector: "#hintBtn",
    text: "그것만으로 정체를 유추하기\n어려우시다면 힌트 카드를 눌러보시면,\n전신 뼈 표본을 보실 수 있습니다.",
  },
  {
    selector: "#quizChoices",
    text: "정체를 알아내셨다면, 저희가 추려놓은 선택지 안에서 골라주시면 됩니다.",
  },
  {
    selector: ".who-progress-block",
    text: "표본 연구의 진행상황은\n여기서 확인하실 수 있습니다.",
    // 진행률 바처럼 가로로 넓은 대상은 옆(좌우)에 말풍선을 붙이면 한쪽
    // 구석에 몰려 보이므로, 위/아래로만 배치합니다.
    placement: "vertical",
  },
  {
    selector: "#endResearchBtn",
    text: "연구를 끝내실 때에는 다른\n연구원들을 위해서\n연구종료를 눌러주세요.",
  },
  {
    // 도입부 멘트와 마찬가지로 특정 요소를 가리키지 않는 마무리 멘트(피그마
    // 시안) — 화면 전체를 어둡게 덮고 말풍선만 가운데에 띄웁니다.
    text: "박사님의 연구에 우리 박물관은\n큰 기대를 걸고 있습니다!",
  },
];
let tutorialStepIndex = 0;

// 이번 단계가 가리킬 요소를 기준으로 스포트라이트와 말풍선 위치를 다시
// 잽니다. 표본마다·화면 크기마다 대상 요소의 실제 위치가 다르므로,
// 피그마처럼 고정 좌표를 쓰지 않고 매번 getBoundingClientRect()로 실측합니다.
function positionTutorialStep(tipDelayMs = 0) {
  const step = TUTORIAL_STEPS[tutorialStepIndex];
  // 새 단계로 넘어올 때마다 체크박스는 다시 빈 상태로 보여줍니다.
  tutorialNextBtn.classList.remove("is-checked");
  tutorialTipText.textContent = step.text;
  tutorialStepCount.textContent = tutorialStepIndex + 1 + "/" + TUTORIAL_STEPS.length;

  // 튜토리얼의 첫 말풍선(도입부 멘트)만 "뿅" 튕기듯 팝업으로 나타나고,
  // 그 다음 단계부터는 매번 새로 나타나는 대신 직전 자리에서 새 자리로
  // 스르륵 이동하는 모션으로 갑니다.
  const isFirstStep = tutorialStepIndex === 0;

  if (!step.selector) {
    // 특정 요소를 가리키지 않는 도입부/마무리 멘트: 스포트라이트 구멍을
    // 크기 0으로 화면 중앙에 두면(box-shadow 트릭) 화면 전체가 고르게
    // 어두워지고, 말풍선은 화면 정중앙에 띄웁니다.
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2;
    tutorialSpot.style.top = cy + "px";
    tutorialSpot.style.left = cx + "px";
    tutorialSpot.style.width = "0px";
    tutorialSpot.style.height = "0px";

    revealTutorialTip(isFirstStep, tipDelayMs, (tipRect) => ({
      left: window.innerWidth / 2 - tipRect.width / 2,
      top: window.innerHeight / 2 - tipRect.height / 2,
    }));
    return;
  }

  const target = document.querySelector(step.selector);
  if (!target) {
    endTutorial();
    return;
  }
  const rect = target.getBoundingClientRect();
  const pad = 8;
  const spotTop = rect.top - pad;
  const spotLeft = rect.left - pad;
  const spotWidth = rect.width + pad * 2;
  const spotHeight = rect.height + pad * 2;

  tutorialSpot.style.top = spotTop + "px";
  tutorialSpot.style.left = spotLeft + "px";
  tutorialSpot.style.width = spotWidth + "px";
  tutorialSpot.style.height = spotHeight + "px";

  revealTutorialTip(isFirstStep, tipDelayMs, (tipRect) => {
    const margin = 16;
    const spotRight = spotLeft + spotWidth;
    const spotBottom = spotTop + spotHeight;
    const spaceRight = window.innerWidth - spotRight;
    const spaceLeft = spotLeft;
    let left;
    let top;
    if (step.placement === "vertical") {
      // 좌우 공간과 상관없이 항상 위/아래로만 배치합니다.
      left = spotLeft + spotWidth / 2 - tipRect.width / 2;
      const spaceBelow = window.innerHeight - (spotBottom + margin);
      top =
        spaceBelow >= tipRect.height + margin
          ? spotBottom + margin
          : spotTop - tipRect.height - margin;
    } else if (spaceRight >= tipRect.width + margin) {
      // 오른쪽에 넉넉한 공간이 있으면 오른쪽에 붙입니다.
      left = spotRight + margin;
      top = spotTop + spotHeight / 2 - tipRect.height / 2;
    } else if (spaceLeft >= tipRect.width + margin) {
      // 왼쪽에 붙입니다.
      left = spotLeft - tipRect.width - margin;
      top = spotTop + spotHeight / 2 - tipRect.height / 2;
    } else {
      // 양옆 모두 좁으면(예: 진행률처럼 가로로 넓은 대상) 위/아래로 붙입니다.
      left = spotLeft + spotWidth / 2 - tipRect.width / 2;
      const spaceBelow = window.innerHeight - (spotBottom + margin);
      top =
        spaceBelow >= tipRect.height + margin
          ? spotBottom + margin
          : spotTop - tipRect.height - margin;
    }
    // 화면 밖으로 튀어나가지 않게 여백 안쪽으로 고정합니다.
    left = Math.max(margin, Math.min(left, window.innerWidth - tipRect.width - margin));
    top = Math.max(margin, Math.min(top, window.innerHeight - tipRect.height - margin));
    return { left, top };
  });
}

// 말풍선을 새 자리에 등장시킵니다. computePosition(tipRect)는 말풍선
// 크기를 재서 최종 left/top을 계산해 돌려주는 콜백입니다.
// - 첫 단계(isFirstStep): 아직 화면에 말풍선이 없으니, 크기를 재는 동안만
//   안 보이게 두고 자리가 정해지면 트랜지션 없이 바로 그 자리에 놓은 뒤
//   is-appearing 팝 애니메이션(튕기듯 등장)으로 나타냅니다. tipDelayMs는
//   이 팝업이 "뿅" 나타나는 시점만 늦춰서, 화면 전환 중 다른 요소가 자리
//   잡는 모습이 먼저 지나간 뒤에 팝 애니메이션이 또렷하게 보이도록 합니다.
// - 그 다음 단계부터(!isFirstStep): 말풍선이 이미 화면에 떠 있는 채로,
//   is-sliding 트랜지션을 걸어두고 새 위치로 바로 값을 바꿔서 직전 자리에서
//   새 자리로 스르륵 이동하는 것처럼 보이게 합니다(팝 애니메이션은 재생하지
//   않습니다).
function revealTutorialTip(isFirstStep, tipDelayMs, computePosition) {
  tutorialTip.classList.remove("is-appearing");

  if (!isFirstStep) {
    tutorialTip.classList.add("is-sliding");
    const { left, top } = computePosition(tutorialTip.getBoundingClientRect());
    tutorialTip.style.left = left + "px";
    tutorialTip.style.top = top + "px";
    return;
  }

  tutorialTip.classList.remove("is-sliding");
  tutorialTip.style.visibility = "hidden";
  tutorialTip.style.left = "0px";
  tutorialTip.style.top = "0px";
  requestAnimationFrame(() => {
    const { left, top } = computePosition(tutorialTip.getBoundingClientRect());
    const reveal = () => {
      tutorialTip.style.left = left + "px";
      tutorialTip.style.top = top + "px";
      tutorialTip.style.visibility = "visible";
      void tutorialTip.offsetWidth;
      tutorialTip.classList.add("is-appearing");
    };
    if (tipDelayMs > 0) {
      setTimeout(reveal, tipDelayMs);
    } else {
      reveal();
    }
  });
}

function startTutorial() {
  tutorialStepIndex = 0;
  // 오버레이·스포트라이트는 화면 전환과 동시에 바로 자리를 잡되,
  // 말풍선이 뿅 나타나는 것만 살짝(550ms) 늦춰서 화면 전환 중 다른
  // 요소가 자리 잡는 모습에 팝 애니메이션이 묻히지 않게 합니다.
  tutorialOverlay.hidden = false;
  positionTutorialStep(550);
}

function advanceTutorial() {
  tutorialStepIndex++;
  if (tutorialStepIndex >= TUTORIAL_STEPS.length) {
    endTutorial();
    return;
  }
  positionTutorialStep();
}

function endTutorial() {
  tutorialOverlay.hidden = true;
}

// 화살표 대신 체크박스로 "확인했다"는 느낌을 준 뒤 다음 단계로 넘어갑니다.
// 체크 애니메이션이 끝나기 전에 다시 눌러도 중복 진행되지 않도록 막습니다.
let tutorialChecking = false;
tutorialNextBtn.addEventListener("click", () => {
  if (tutorialChecking) return;
  tutorialChecking = true;
  tutorialNextBtn.classList.add("is-checked");
  setTimeout(() => {
    tutorialChecking = false;
    advanceTutorial();
  }, 650);
});
window.addEventListener("resize", () => {
  if (!tutorialOverlay.hidden) positionTutorialStep();
});

enterBtn.addEventListener("click", () => {
  scene4.classList.remove("is-active");
  scene5.classList.add("is-active");
  // 문제 화면부터는 "연구 종료" 버튼이 HOME 역할을 대신합니다 — 왼쪽 위
  // HOME 버튼과 화면 안에 이미 있는 "연구 종료" 버튼이 같은 역할로
  // 겹치지 않도록, 이 화면에서는 HOME을 숨겨둡니다.
  replayBtn.hidden = true;
  buildQuizOrder();
  currentIndex = 0;
  // 새 연구를 시작하는 시점이므로 이전 연구의 정답 집계를 초기화합니다.
  correctAnswersCount = 0;
  questionResults = new Array(SPECIMENS.length).fill(null);
  loadSpecimen(currentIndex);
  // 튜토리얼(오버레이·스포트라이트)은 화면 전환과 동시에 바로
  // 시작합니다 — 이걸 늦추면 오버레이 없이 화면 요소들만 먼저 자리
  // 잡는 모습이 그대로 눈에 들어와 버립니다. 말풍선 팝 애니메이션만
  // 늦추는 처리는 startTutorial() 안에서 합니다.
  startTutorial();
});

// "연구 종료": 문제 화면에서 HOME 버튼 대신 표본실(타이틀) 화면으로
// 돌아가는 역할을 합니다. replayBtn의 기존 리셋 로직을 그대로 재사용합니다.
endResearchBtn.addEventListener("click", () => {
  replayBtn.click();
});

// "표본실로 돌아가기": 연구 완료 화면에서 홈으로 돌아갑니다.
completeHomeBtn.addEventListener("click", () => {
  replayBtn.click();
});

// 컬렉션 팝업: 이번 연구에서 마주친 18개 표본 전체를(정답이든 오답
// 처리든 상관없이) SPECIMENS 배열 순서 그대로 정답 이미지·도감 넘버·
// 생물 명과 함께 모아 보여줍니다. 매번 다시 그릴 필요가 없으니 처음
// 열 때 한 번만 그려두고 이후에는 재사용합니다.
let collectionRendered = false;
function renderCollection() {
  if (collectionRendered) return;
  SPECIMENS.forEach((s) => {
    const item = document.createElement("div");
    item.className = "collection-item";

    const imgWrap = document.createElement("div");
    imgWrap.className = "collection-item-img-wrap";
    const img = document.createElement("img");
    img.className = "collection-item-img";
    img.src = s.aImg;
    img.alt = s.name + " 전신 골격";
    imgWrap.appendChild(img);

    const code = document.createElement("span");
    code.className = "collection-item-code";
    code.textContent = s.code;

    const name = document.createElement("span");
    name.className = "collection-item-name";
    name.textContent = s.name;

    item.append(imgWrap, code, name);
    collectionGrid.appendChild(item);
  });
  collectionRendered = true;
}

function openCollection() {
  renderCollection();
  collectionOverlay.hidden = false;
  // quizFailOverlay와 같은 방식 — hidden을 먼저 풀고 나서 한 프레임
  // 뒤에 is-visible을 붙여야 opacity 트랜지션이 확실히 재생됩니다.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      collectionOverlay.classList.add("is-visible");
    });
  });
}

function closeCollection() {
  collectionOverlay.classList.remove("is-visible");
  setTimeout(() => {
    collectionOverlay.hidden = true;
  }, 350);
}

collectionBtn.addEventListener("click", openCollection);
collectionCloseBtn.addEventListener("click", closeCollection);
// 어두운 바깥 영역(패널 밖)을 클릭해도 닫히도록 — 패널 안쪽 클릭은
// 버블링으로 여기까지 올라오지 않게 막지 않는 대신, 클릭된 지점이
// 오버레이 자기 자신일 때만(패널이 아니라) 닫히게 구분합니다.
collectionOverlay.addEventListener("click", (e) => {
  if (e.target === collectionOverlay) closeCollection();
});

// 힌트 카드: 클릭하면 표본 사진 자리는 그대로 두고, 카드 자체가 뒤집히면서
// 뒷면(하얀 면)에 힌트 이미지가 드러납니다.
let hintUsed = false;
hintBtn.addEventListener("click", () => {
  if (hintUsed) return;
  hintUsed = true;
  hintBtn.classList.add("is-flipped");
  hintBtn.disabled = true;
});

// 오답 클릭 시 "삐-" 경고음을 합성해서 재생합니다. 별도 오디오 파일 없이
// Web Audio API 오실레이터로 짧게 냅니다.
let wrongAudioCtx = null;
function playWrongBeep() {
  try {
    if (!wrongAudioCtx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      wrongAudioCtx = new AudioCtx();
    }
    if (wrongAudioCtx.state === "suspended") {
      wrongAudioCtx.resume();
    }
    const ctx = wrongAudioCtx;
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(220, now);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.18, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  } catch (err) {
    // 오디오 재생 실패는 게임 진행에 영향을 주지 않도록 무시합니다.
  }
}

// 한 문제 안에서 연달아 고른 오답 횟수(전체 18문제 누적이 아님) — 문제가
// 바뀌면 resetQuiz()에서 0으로 되돌립니다. 2회째 오답이면 그 문제는
// "오답 처리"되어 바로 다음 문제로 넘어갑니다(triggerQuizSkip 참고).
let wrongCount = 0;

// 이번 연구(18문제) 동안 결국 정답을 맞힌 문항 수 — 1차든 2차든 맞히기만
// 하면 카운트되고, 오답 처리(스킵)된 문항만 카운트에서 빠집니다.
// enterBtn 핸들러(새 연구 시작 시점)에서 0으로 초기화됩니다.
let correctAnswersCount = 0;

// 문항별 결과 기록 — 진행률 바에서 지나온 문항을 정답(✓)/오답 처리(✕)로
// 구분해서 표시하기 위한 것입니다. quizOrder와 같은 인덱스로 채워지며,
// "correct" | "skipped" | null(아직 안 지나온 문항) 중 하나입니다.
let questionResults = new Array(SPECIMENS.length).fill(null);

quizChoices.querySelectorAll(".quiz-choice").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    if (btn.dataset.correct === "true") {
      quizChoices
        .querySelectorAll(".quiz-choice")
        .forEach((b) => (b.disabled = true));
      quizFeedbackText.textContent = "";
      quizFeedback.classList.remove("is-wrong");
      // 1차든 2차든, 결국 정답을 맞혔으니 이번 문항은 정답으로 집계합니다.
      correctAnswersCount += 1;
      questionResults[currentIndex] = "correct";
      // 가운데 표본 사진 카드가 정답 공개 패널로 바뀌고, 정답 카드가
      // 부각되도록 주변(헤더·좌우 칸·하단 진행바)은 살짝 어둡게 가라앉힙니다.
      specimenCard.hidden = true;
      revealCard.hidden = false;
      scene5.classList.add("is-answered");
    } else {
      btn.classList.add("is-wrong");
      // 이미 오답으로 확인된 선택지는 다시 눌러도 같은 오답이 중복으로
      // 카운트되지 않도록 잠급니다.
      btn.disabled = true;
      // 같은 버튼을 연속으로 잘못 눌러도 흔들림이 매번 다시 재생되도록,
      // 클래스를 떼었다가 강제 리플로우 후 다시 붙입니다.
      btn.classList.remove("is-shaking");
      void btn.offsetWidth;
      btn.classList.add("is-shaking");
      playWrongBeep();

      wrongCount += 1;
      if (wrongCount >= 2) {
        // 2회째 오답 — 이 문항은 오답 처리(스킵)되어 최종 정답률에
        // 반영되지 않고(맞히지 못한 것으로 집계), 바로 다음 문항으로
        // 자동 전환됩니다.
        quizFeedbackText.textContent = "";
        quizFeedback.classList.remove("is-wrong");
        triggerQuizSkip();
        return;
      }

      // 가운데 표본 카드 위, 정해진 자리에 상자째로 살짝 떠오르며
      // 나타났다가 스르륵 사라지는 토스트로 뜹니다(CSS의
      // quiz-feedback-toast 애니메이션). 같은 문제에서 다른 오답을 또
      // 골라도 매번 새로 재생되도록, 클래스를 뗐다가 강제 리플로우 후
      // 다시 붙입니다(위 .is-shaking과 동일한 패턴).
      quizFeedbackText.textContent = "일치하지 않는 표본입니다. 다시 골라보세요.";
      quizFeedback.classList.remove("is-wrong");
      void quizFeedback.offsetWidth;
      quizFeedback.classList.add("is-wrong");
    }
  });
});

// 마지막(18번째) 문항까지 다 지나갔으면(정답이든 스킵이든) 연구 완료
// 화면(scene6)으로 넘어가고, 그 전까지는 다음 표본을 불러와 같은
// 화면에서 문제만 바뀝니다. "다음 표본" 버튼(정답을 맞혔을 때)과
// triggerQuizSkip()의 자동 전환(2회 오답으로 스킵했을 때) 양쪽에서
// 공통으로 씁니다.
function advanceOrFinish() {
  if (currentIndex >= SPECIMENS.length - 1) {
    finishRun();
    return;
  }
  currentIndex += 1;
  loadSpecimen(currentIndex);
}

// 정답률을 집계해서 연구 완료 화면을 띄웁니다. 등급(칭호) 체계는
// 복잡도에 비해 전달력이 떨어진다는 판단으로 빼고, 정답률 숫자를
// 그대로 보여주는 쪽으로 단순화했습니다 — #completeRank 자리(칭호
// 배지가 있던 자리)를 그대로 재사용합니다.
function finishRun() {
  completeName.textContent = playerName + " ";
  const accuracyPercent = Math.round(
    (correctAnswersCount / SPECIMENS.length) * 100
  );
  completeRank.textContent = "정답률 " + accuracyPercent + "%";
  scene5.classList.remove("is-active");
  scene6.classList.add("is-active");
  // 완료 화면에는 "표본실로 돌아가기" 카드 버튼이 이미 있어서 HOME
  // 버튼이 필요 없다는 피드백 반영 — 계속 숨겨둡니다.
  replayBtn.hidden = true;
}

// 한 문제에서 두 번째 오답까지 고르면, 선택지를 잠그고 화면을 어둡게
// 덮은 뒤 멘트를 짧게 보여줍니다(1단계). 그 뒤 자동으로, 정답을 맞혔을
// 때와 같은 정답 공개 카드로 넘어가 정답을 보여줍니다(2단계) — "오답
// 처리됐는데 정답이 뭐였는지도 궁금하다"는 피드백을 반영한 구성입니다.
// 정답을 맞힌 게 아니라는 걸 알 수 있게 카드에 작은 배지(.is-skipped →
// .reveal-skip-badge)를 붙이고, 그 뒤로는 "다음 표본" 버튼(nextBtn)으로
// 직접 다음 문항으로 넘어갑니다(맞혔을 때와 동일한 방식 — 서두르지
// 않고 확인할 수 있도록 자동 전환은 없습니다). 1단계에서 4초를 다
// 기다리지 않고 화면 아무 곳이나 클릭해도 바로 정답 카드로 넘어갈 수
// 있습니다.
function triggerQuizSkip() {
  questionResults[currentIndex] = "skipped";
  quizChoices.querySelectorAll(".quiz-choice").forEach((b) => (b.disabled = true));
  quizFailOverlay.hidden = false;
  // hidden을 떼자마자 곧바로 is-visible을 붙이면 트랜지션이 생략될 수
  // 있어, 한 프레임 뒤에 붙여서 opacity 트랜지션이 항상 재생되게 합니다.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      quizFailOverlay.classList.add("is-visible");
    });
  });

  // 1단계(암전 멘트)를 짧게 보여준 뒤 2단계(정답 공개 카드)로 자동
  // 전환합니다. 타임아웃과 클릭 중 먼저 일어나는 쪽 하나만 실행되도록,
  // 실행 시점에 서로를 취소합니다.
  let timer;
  const revealAnswer = () => {
    clearTimeout(timer);
    quizFailOverlay.removeEventListener("click", revealAnswer);
    quizFailOverlay.classList.remove("is-visible");
    quizFailOverlay.hidden = true;
    specimenCard.hidden = true;
    revealCard.hidden = false;
    revealCard.classList.add("is-skipped");
    scene5.classList.add("is-answered");
  };
  timer = setTimeout(revealAnswer, 1800);
  quizFailOverlay.addEventListener("click", revealAnswer);
}

nextBtn.addEventListener("click", () => {
  advanceOrFinish();
});

function resetQuiz() {
  hintUsed = false;
  hintBtn.disabled = false;
  hintBtn.classList.remove("is-flipped");
  specimenCard.hidden = false;
  revealCard.hidden = true;
  // 오답 처리(스킵)로 정답 카드를 띄웠을 때만 붙는 배지 — 다음 표본으로
  // 넘어가면 다시 깨끗한 상태로 시작합니다.
  revealCard.classList.remove("is-skipped");
  scene5.classList.remove("is-answered");
  quizFeedbackText.textContent = "";
  quizFeedback.classList.remove("is-right", "is-wrong");
  quizChoices.querySelectorAll(".quiz-choice").forEach((b) => {
    b.disabled = false;
    b.classList.remove("is-wrong", "is-shaking");
  });
  // 문제가 바뀔 때마다(또는 홈으로 돌아갈 때) 오답 횟수도 새로 셉니다.
  wrongCount = 0;
}


// ===== 이미지 앵커링(엣지투엣지 대응) =====
// .scene이 화면비에 상관없이 뷰포트 전체를 채우면서, 배경 사진(.scene-bg)은
// object-fit:cover로 화면비에 맞춰 위/아래 또는 좌/우가 크롭됩니다.
// 그런데 실링 왁스, 편지지 글 영역, 수락 버튼처럼 "사진 속 특정 지점"에
// 붙어 있어야 하는 요소들은 크롭된 만큼 화면 위 위치가 달라져야 합니다.
// 아래 두 함수는 "사진 원본 기준 좌표(0~1, CSS에 원래 있던 %값과 동일)"를
// 실제 크롭 결과에 맞는 화면 좌표(px)로 변환해줍니다.

// 특정 scene 안에서, 배경 사진이 실제로 화면에 그려지는 크기/위치를 계산합니다.
// (object-fit:cover와 동일한 계산 — 사진이 컨테이너보다 넓은 축은 꽉 채우고,
// 좁은 축은 넘치는 만큼 위/아래(또는 좌/우)가 중앙 기준으로 잘려나갑니다.)
function getImageFit(scene, zoomOpts) {
  const img = scene.querySelector(".scene-bg");
  if (!img || !img.naturalWidth) return null;
  const containerW = scene.clientWidth;
  const containerH = scene.clientHeight;
  const imgAspect = img.naturalWidth / img.naturalHeight;
  const containerAspect = containerW / containerH;
  let renderedW, renderedH, offsetX, offsetY;
  if (containerAspect > imgAspect) {
    // 화면이 사진보다 가로로 넓음 → 가로를 꽉 채우고 위/아래가 잘림
    renderedW = containerW;
    renderedH = containerW / imgAspect;
    offsetX = 0;
    offsetY = (containerH - renderedH) / 2;
  } else {
    // 화면이 사진보다 세로로 김 → 세로를 꽉 채우고 좌/우가 잘림
    renderedH = containerH;
    renderedW = containerH * imgAspect;
    offsetY = 0;
    offsetX = (containerW - renderedW) / 2;
  }

  let zoom = 1;
  let anchorX = offsetX + renderedW / 2;
  let anchorY = offsetY + renderedH / 2;

  // 초광폭 화면 보정: 사진(3:2)보다 훨씬 넓은 화면에서는 좌/우가 전혀
  // 잘리지 않아(위/아래만 잘림) 편지지가 화면 가운데 좁게 몰려 보이고
  // 오른쪽에 빈 여백만 커지는 문제가 있었습니다. zoomOpts가 주어지면
  // 화면비가 thresholdAspect를 넘어서는 만큼만 anchor(사진 속 초점)를
  // 중심으로 서서히 확대·크롭해서, 맥북 16인치 기준(약 1.55)에서는
  // zoom=1(변화 없음)을 유지하고 더 넓은 화면에서만 편지지가 화면을
  // 채우도록 만듭니다. */
  if (zoomOpts && containerAspect > zoomOpts.thresholdAspect) {
    anchorX = offsetX + zoomOpts.anchor[0] * renderedW;
    anchorY = offsetY + zoomOpts.anchor[1] * renderedH;
    const t = Math.min(
      1,
      (containerAspect - zoomOpts.thresholdAspect) /
        (zoomOpts.maxAspect - zoomOpts.thresholdAspect)
    );
    zoom = 1 + zoomOpts.maxZoom * t;

    // 안전장치: 초광폭(21:9 이상) 화면에서 확대율을 그대로 적용하면
    // 세로로 긴 편지 본문(letter-text)이 화면 위/아래로 넘쳐서 잘릴 수
    // 있습니다. heightGuard가 있으면, 확대 후 본문 높이가 화면 높이의
    // maxFillRatio를 넘지 않는 선까지만 확대율을 낮춥니다.
    if (zoomOpts.heightGuard) {
      const { fraction, maxFillRatio } = zoomOpts.heightGuard;
      const contentH0 = fraction * renderedH;
      const maxContentH = containerH * maxFillRatio;
      if (contentH0 > 0 && contentH0 * zoom > maxContentH) {
        zoom = Math.max(1, maxContentH / contentH0);
      }
    }

    const newRenderedW = renderedW * zoom;
    const newRenderedH = renderedH * zoom;
    offsetX = anchorX - zoomOpts.anchor[0] * newRenderedW;
    offsetY = anchorY - zoomOpts.anchor[1] * newRenderedH;
    renderedW = newRenderedW;
    renderedH = newRenderedH;
  }

  return { renderedW, renderedH, offsetX, offsetY, zoom, anchorX, anchorY };
}

// fx, fy: 사진 원본 기준 좌표(0~1). fw, fh를 넘기면 폭/높이도 같은 비율로 맞춥니다.
// (CSS의 기존 left/top/width/height % 값들이 바로 이 fx/fy/fw/fh 입니다 —
// 3:2 핏 박스였을 때는 박스=사진이라 %값이 곧 사진 기준 좌표였기 때문입니다.)
function placeOnImage(el, fit, fx, fy, fw, fh) {
  if (!el || !fit) return;
  el.style.left = fit.offsetX + fx * fit.renderedW + "px";
  el.style.top = fit.offsetY + fy * fit.renderedH + "px";
  if (fw != null) el.style.width = fw * fit.renderedW + "px";
  if (fh != null) el.style.height = fh * fit.renderedH + "px";
}

function updateImageAnchors() {
  // 화면 1(표본실): 실링 왁스 클릭 지점 + 클릭 시 확대 애니메이션의 중심점
  const fit2 = getImageFit(scene2);
  if (fit2) {
    placeOnImage(sealBtn, fit2, 0.518, 0.835);
    const bg2 = scene2.querySelector(".scene-bg");
    const ox = fit2.offsetX + 0.518 * fit2.renderedW;
    const oy = fit2.offsetY + 0.835 * fit2.renderedH;
    bg2.style.transformOrigin = ox + "px " + oy + "px";
  }
  // 화면 2(편지): 편지 글 영역 + 수락 버튼
  // anchor(0.48, 0.47)는 편지지 영역(0.32~0.64, 0.13~0.81)의 대략적인
  // 중심점 — 초광폭 화면에서 이 지점을 중심으로 확대되어 편지지가
  // 화면 가운데를 채웁니다. threshold 1.6(맥북 16인치 약 1.55보다 약간
  // 넓은 값)이라 승인된 맥북 화면비에서는 zoom이 걸리지 않습니다.
  const fit3 = getImageFit(scene3, {
    anchor: [0.5, 0.47],
    thresholdAspect: 1.6,
    maxAspect: 2.4,
    maxZoom: 0.35,
    heightGuard: { fraction: 0.7, maxFillRatio: 0.92 },
  });
  if (fit3) {
    // 새 편지지 사진(letter-bg-bright.jpg) 기준 카드 실측 영역은
    // 가로 27.5%~69.8%, 세로 8.3%~93.6% — 그 중심(48.65%, 51%)에 맞췄습니다.
    placeOnImage(letterText, fit3, 0.3215, 0.16, 0.33, 0.7);
    placeOnImage(acceptBtn, fit3, 0.63, 0.83);
    const bg3 = scene3.querySelector(".scene-bg");
    bg3.style.transformOrigin = fit3.anchorX + "px " + fit3.anchorY + "px";
    bg3.style.transform = fit3.zoom > 1 ? "scale(" + fit3.zoom + ")" : "none";
  }
}

// 창 크기/화면비가 바뀔 때마다 다시 계산합니다(리사이즈 중 과도한 호출은 방지).
let anchorResizeTimer;
window.addEventListener("resize", () => {
  clearTimeout(anchorResizeTimer);
  anchorResizeTimer = setTimeout(updateImageAnchors, 100);
});

// 사진이 로드된 시점에 맞춰 계산합니다(캐시로 이미 로드돼 있으면 바로 실행).
[scene2, scene3].forEach((scene) => {
  const img = scene.querySelector(".scene-bg");
  if (img.complete) {
    updateImageAnchors();
  } else {
    img.addEventListener("load", updateImageAnchors, { once: true });
  }
});
updateImageAnchors();
