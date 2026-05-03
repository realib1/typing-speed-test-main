const startBtn = document.getElementById("start-test");
const restartBtn = document.getElementById("restart-test");
const timerElement = document.getElementById("timer");
const wpmDisplay = document.getElementById("wpm-score");
const pbWpmDisplay = document.getElementById("pb-wpm");
const accuracyDisplay = document.getElementById("accuracy-score");
const overlay = document.querySelector(".start-overlay");
const passageText = document.getElementById("passage-text");
const typingSpace = document.querySelector(".typing-test-passage");

// Restart / Try again
const tryAgain = document.getElementById("try-again");
const goAgain = document.getElementById("go-again");
const beatHighScore = document.getElementById("beat-high-score");

// Test score
const baseline = document.querySelector(".baseline-established");
const testComplete = document.querySelector(".test-complete");
const highScore = document.querySelector(".test-high-score");

// Baseline
const baselineWPM = document.getElementById("wpm-baseline-score");
const baselineAccuracy = document.getElementById("accuracy-baseline-score");
const baselineCorrectCharCount = document.getElementById("correct-baseline");
const baselineIncorrectCharCount =
  document.getElementById("incorrect-baseline");

// Test Completed
const testCompleteWPM = document.getElementById("wpm-completed-score");
const testCompleteAccuracy = document.getElementById(
  "accuracy-completed-score",
);
const testCorrectCharCount = document.getElementById("correct-test");
const testIncorrectCharCount = document.getElementById("incorrect-test");

// High score
const highScoreWPM = document.getElementById("wpm-high-score");
const highScoreAccuracy = document.getElementById("accuracy-high-score");
const highScoreCorrectCharCount = document.getElementById("correct-highscore");
const highScoreIncorrectCharCount = document.getElementById(
  "incorrect-highscore",
);

// Small Screen dropdown
const difficultySwitchBtn = document.getElementById("btn-difficulty-switch");
const modeSwitchBtn = document.getElementById("btn-mode-switch");
const difficultySwitch = document.querySelector(".difficulty-switch");
const modeSwitch = document.querySelector(".mode-switch");

const radioDifficulty = document.querySelectorAll('input[name="difficulty"]');
const radioMode = document.querySelectorAll('input[name="mode"]');

// Difficult btns
const difficultyBtns = document.querySelectorAll(".difficulty-btn");
const modeBtns = document.querySelectorAll(".mode-btn");

let timer;
let timeLeft = 60;
let isTestRunning = false;
let typedChars = 0;
let correctChars = 0;
let incorrectChars = 0;
let currentQuote = null;
let currentDifficulty = localStorage.getItem("difficulty") || "easy";
let currentMode = localStorage.getItem("mode") || "timer";

let quotes = {};

document.addEventListener("click", (e) => {
  if (
    !modeSwitchBtn.contains(e.target) &&
    e.target !== modeSwitchBtn &&
    !modeSwitch.contains(e.target)
  ) {
    modeSwitch.classList.add("mode-switch");
  }

  if (
    !difficultySwitchBtn.contains(e.target) &&
    e.target !== difficultySwitchBtn &&
    !difficultySwitch.contains(e.target)
  ) {
    difficultySwitch.classList.add("difficulty-switch");
  }
});

// Fetch quotes from the JSON file
const getQuotes = async () => {
  const quoteData = await fetch("./data.json");
  quotes = await quoteData.json();
  return quotes;
};

// Select a random quote base on difficulty from the fetched quotes, default is easy
const getRandomQuote = async (difficulty = currentDifficulty) => {
  if (!Object.keys(quotes).length) quotes = await getQuotes();
  const pool = quotes[difficulty];
  return pool[Math.floor(Math.random() * pool.length)];
};

// Load the passages from the data.json
const loadData = async () => {
  currentQuote = await getRandomQuote();
  passageText.innerHTML = currentQuote.text
    .split("")
    .map((char) => `<span>${char}</span>`)
    .join("");
};

loadData();

//   Start test
const startTest = () => {
  if (isTestRunning) return;
  isTestRunning = true;
  overlay.style.display = "none";
  if (currentMode === "timer") {
    startTimer();
  }
};

// Restart test all over
const restartTest = () => {
  clearInterval(timer);
  isTestRunning = false;
  typedChars = 0;
  correctChars = 0;
  incorrectChars = 0;
  timeLeft = 60;
  const timerPad = String(timeLeft).padStart(2, "0");
  timerElement.textContent = `0:${timerPad}`;
  wpmDisplay.textContent = `0`;
  accuracyDisplay.textContent = `100%`;

  Array.from(passageText.children).forEach((span) =>
    span.classList.remove("correct", "incorrect"),
  );
  startTest();
};

const goTryAgainTest = async () => {
  baseline.style.display = "none";
  testComplete.style.display = "none";
  highScore.style.display = "none";
  typingSpace.style.display = "block";
  await loadData();
  restartTest();
};

// Timer countdown
const startTimer = () => {
  typedChars = 0;
  correctChars = 0;
  timeLeft = 60;

  timer = setInterval(() => {
    timeLeft--;
    const timerPad = String(timeLeft).padStart(2, "0");
    timerElement.textContent = `0:${timerPad}`;
    timerElement.style.color = timeLeft <= 10 ? "red" : "yellow";

    if (timeLeft <= 0) {
      isTestRunning = false;
      clearInterval(timer);
      calculateResult();
    }
  }, 1000);
};

// Get typed characters
const keyStrokes = async (event) => {
  if (!isTestRunning) return;
  const key = event.key;
  if (key.length !== 1) return;

  const currentIndex = typedChars;
  typedChars++;
  const currentChar = currentQuote.text[currentIndex];
  if (key === currentChar) {
    correctChars++;
    passageText.children[currentIndex].classList.add("correct");
  } else {
    incorrectChars++;
    passageText.children[currentIndex].classList.add("incorrect");
  }

  updateStats();

  if (currentQuote.text.length === typedChars) {
    isTestRunning = false;
    clearInterval(timer);
    timer = 0;
    calculateResult();
  }
};

// Event listener for typing/keypress
document.addEventListener("keydown", keyStrokes);

const updateStats = () => {
  if (typedChars === 0) return;
  if (timeLeft === 60) return;
  const wpm = Math.round((correctChars / 5 / (60 - timeLeft)) * 60);
  const accuracy = Math.round((correctChars / typedChars) * 100);

  accuracyDisplay.style.color = accuracy < 100 ? "red" : "#d4d4d4";

  wpmDisplay.textContent = `${wpm}`;
  accuracyDisplay.textContent = `${accuracy}%`;

  return { wpm, accuracy };
};

// Calculate WPM and accuracy
const calculateResult = () => {
  const { wpm, accuracy } = updateStats();
  // Update personal best WPM
  const pbWPM = +(localStorage.getItem("pbWPM") || 0);

  if (wpm > pbWPM) {
    localStorage.setItem("pbWPM", wpm);
    pbWpmDisplay.textContent = `${wpm}`;
  }

  typingSpace.style.display = "none";
  if (pbWPM === 0) {
    baselineCorrectCharCount.style.color = "#03e499";
    baselineWPM.textContent = `${wpm}`;
    baselineAccuracy.textContent = `${accuracy}%`;
    baselineAccuracy.style.color = accuracy < 100 ? "red" : "#d4d4d4";
    baselineCorrectCharCount.textContent = `${correctChars}`;
    baselineIncorrectCharCount.textContent = `${incorrectChars}`;
    baselineIncorrectCharCount.style.color = "red";
    baseline.style.display = "flex";
  } else if (pbWPM >= wpm) {
    testCorrectCharCount.style.color = "#03e499";
    testCompleteWPM.textContent = `${wpm}`;
    testCompleteAccuracy.textContent = `${accuracy}%`;
    testCompleteAccuracy.style.color = accuracy < 100 ? "red" : "#d4d4d4";
    testCorrectCharCount.textContent = `${correctChars}`;
    testIncorrectCharCount.textContent = `${incorrectChars}`;
    testIncorrectCharCount.style.color = "red";
    testComplete.style.display = "flex";
  } else if (wpm > pbWPM) {
    highScoreCorrectCharCount.style.color = "#03e499";
    highScoreWPM.textContent = `${wpm}`;
    highScoreAccuracy.textContent = `${accuracy}%`;
    highScoreAccuracy.style.color = accuracy < 100 ? "red" : "#d4d4d4";
    highScoreCorrectCharCount.textContent = `${correctChars}`;
    highScoreIncorrectCharCount.textContent = `${incorrectChars}`;
    highScoreIncorrectCharCount.style.color = "red";
    highScore.style.display = "flex";
  }
};

// Choose difficulty level
difficultyBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (isTestRunning) return;
    currentDifficulty = btn.dataset.difficulty;
    localStorage.setItem("difficulty", currentDifficulty);
    difficultyBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    loadData();
  });
});

// Choose mode of typing
modeBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    if (isTestRunning) return;
    currentMode = btn.dataset.mode;
    localStorage.setItem("mode", currentMode);
    modeBtns.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
  });
});

startBtn.addEventListener("click", startTest);
restartBtn.addEventListener("click", restartTest);
tryAgain.addEventListener("click", goTryAgainTest);
goAgain.addEventListener("click", goTryAgainTest);
beatHighScore.addEventListener("click", goTryAgainTest);

difficultySwitchBtn.addEventListener("click", () => {
  difficultySwitch.classList.toggle("difficulty-switch");
});

modeSwitchBtn.addEventListener("click", () => {
  modeSwitch.classList.toggle("mode-switch");
});

difficultySwitchBtn.textContent = document.querySelector(
  'input[name="difficulty"]:checked',
).value;
modeSwitchBtn.textContent = document.querySelector(
  'input[name="mode"]:checked',
).value;

radioDifficulty.forEach((radio) =>
  radio.addEventListener("change", () => {
    const selectedDifficulty = document.querySelector(
      'input[name="difficulty"]:checked',
    ).dataset.difficulty;
    currentDifficulty = selectedDifficulty;
    localStorage.setItem("difficulty", currentDifficulty);
    difficultySwitchBtn.textContent = radio.value;
    difficultySwitch.classList.toggle("difficulty-switch");
    loadData();
  }),
);

radioMode.forEach((radio) =>
  radio.addEventListener("change", () => {
    const selectedMode = document.querySelector('input[name="mode"]:checked')
      .dataset.mode;
    currentMode = selectedMode;
    localStorage.setItem("mode", currentMode);
    modeSwitchBtn.textContent = radio.value;
    modeSwitch.classList.toggle("mode-switch");
    loadData();
  }),
);
