const stage = document.getElementById("stage");
const scene2 = document.getElementById("scene2");
const scene3 = document.getElementById("scene3");
const scene4 = document.getElementById("scene4");
const scene5 = document.getElementById("scene5");
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
const hintBtn = document.getElementById("hintBtn");
const specimenImg = document.getElementById("specimenImg");
const specimenCard = document.getElementById("specimenCard");
const revealCard = document.getElementById("revealCard");
const nextBtn = document.getElementById("nextBtn");
const endResearchBtn = document.getElementById("endResearchBtn");

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
  scene2.classList.add("is-active");
  sealBtn.disabled = false;
  replayBtn.hidden = true;
  resetQuiz();

  // 게이트를 초기 상태로 되돌립니다 (어둠 + 타이틀 + 이름 입력 폼 다시 표시).
  gateInput.value = "";
  gate.classList.remove("is-leaving");
  gate.hidden = false;
  stage.classList.add("pre-gate");
});

// ===== 화면 4: 문제 (Who am I) =====
// 지금은 07.BLC-03(수리부엉이) 표본 하나만 채워둔 확인용 흐름입니다.
// 피그마 시안 기준으로 진행바는 18칸이고, 정답을 맞히면 화면 전체가
// 바뀌는 게 아니라 가운데 표본 사진(specimenCard) 자리만 정답 공개
// 패널(revealCard)로 바뀝니다.
const TOTAL_SPECIMENS = 18;
const CURRENT_INDEX = 7; // 07.BLC-03 기준, 1부터 시작
for (let i = 1; i <= TOTAL_SPECIMENS; i++) {
  const tick = document.createElement("span");
  tick.className = "quiz-progress-tick";
  if (i < CURRENT_INDEX) tick.classList.add("is-done");
  if (i === CURRENT_INDEX) tick.classList.add("is-current");
  quizProgress.appendChild(tick);
}

enterBtn.addEventListener("click", () => {
  scene4.classList.remove("is-active");
  scene5.classList.add("is-active");
  // 문제 화면부터는 "연구 종료" 버튼이 HOME 역할을 대신합니다 — 왼쪽 위
  // HOME 버튼과 화면 안에 이미 있는 "연구 종료" 버튼이 같은 역할로
  // 겹치지 않도록, 이 화면에서는 HOME을 숨겨둡니다.
  replayBtn.hidden = true;
});

// "연구 종료": 문제 화면에서 HOME 버튼 대신 표본실(타이틀) 화면으로
// 돌아가는 역할을 합니다. replayBtn의 기존 리셋 로직을 그대로 재사용합니다.
endResearchBtn.addEventListener("click", () => {
  replayBtn.click();
});

let hintUsed = false;
hintBtn.addEventListener("click", () => {
  if (hintUsed) return;
  hintUsed = true;
  specimenImg.src = "./img/specimens/07-bubobubo-hint.png";
  hintBtn.disabled = true;
  hintBtn.classList.add("is-used");
});

quizChoices.querySelectorAll(".quiz-choice").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (btn.disabled) return;
    if (btn.dataset.correct === "true") {
      quizChoices
        .querySelectorAll(".quiz-choice")
        .forEach((b) => (b.disabled = true));
      quizFeedback.textContent = "";
      quizFeedback.classList.remove("is-wrong");
      // 가운데 표본 사진 카드만 정답 공개 패널로 바뀝니다 —
      // 정보 카드·힌트·후보 목록·진행바는 그대로 유지됩니다.
      specimenCard.hidden = true;
      revealCard.hidden = false;
    } else {
      btn.classList.add("is-wrong");
      quizFeedback.textContent = "일치하지 않는 표본입니다. 다시 골라보세요.";
      quizFeedback.classList.remove("is-right");
      quizFeedback.classList.add("is-wrong");
    }
  });
});

// 다음 표본으로: 아직 08번 표본을 만들지 않아서, 지금은 HOME으로
// 되돌아가는 자리표시용 동작만 넣어둡니다.
nextBtn.addEventListener("click", () => {
  replayBtn.click();
});

function resetQuiz() {
  hintUsed = false;
  specimenImg.src = "./img/specimens/07-bubobubo-q.png";
  hintBtn.disabled = false;
  hintBtn.classList.remove("is-used");
  specimenCard.hidden = false;
  revealCard.hidden = true;
  quizFeedback.textContent = "";
  quizFeedback.classList.remove("is-right", "is-wrong");
  quizChoices.querySelectorAll(".quiz-choice").forEach((b) => {
    b.disabled = false;
    b.classList.remove("is-wrong");
  });
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
    // 가로 27.5%~69.8%, 세로 8.3%~93.6%. 레이너스 요청으로 카드 중심(48.65%)
    // 대비 왼쪽으로 4.5%p 이동 — 카드 왼쪽 여백 끝까지 바짝 붙인 값입니다.
    placeOnImage(letterText, fit3, 0.2765, 0.16, 0.33, 0.7);
    placeOnImage(acceptBtn, fit3, 0.555, 0.83);
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
