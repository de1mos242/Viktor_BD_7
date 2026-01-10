const STORAGE_KEY = "questWizardState";
const PARENT_PIN = "777";

const DEFAULT_STEPS = {
  steps: [
    {
      id: "count-stars",
      title: "Шаг 1: Сосчитай звёзды",
      subtitle: "Маленькое начало",
      prompt: "Сколько будет 2 + 3?",
      input: {
        type: "number",
        placeholder: "Ответ числом",
        inputMode: "numeric",
      },
      answers: ["5", "пять"],
      hint: "Подумай про два яблока и ещё три яблока.",
      hintAfterTries: 1,
      successMessage: "Отлично! Следующая записка спрятана в шкафу под полотенцами.",
      collectToken: "3",
    },
    {
      id: "magic-word",
      title: "Шаг 2: Волшебное слово",
      subtitle: "Буквы любят порядок",
      prompt: "Слово «КОТ» без первой буквы — что останется?",
      input: {
        type: "text",
        placeholder: "Напиши слово",
        inputMode: "text",
      },
      answers: ["от"],
      hint: "Просто убери букву К.",
      hintAfterTries: 2,
      successMessage: "Супер! Посмотри подсказку возле дивана под подушкой.",
      collectToken: "8",
    },
    {
      id: "quick-count",
      title: "Шаг 3: Быстрый счёт",
      prompt: "Сколько будет 7 − 4?",
      input: {
        type: "number",
        placeholder: "Ответ числом",
        inputMode: "numeric",
      },
      answers: ["3", "три"],
      hint: "От семи убери четыре.",
      hintAfterTries: 1,
      successMessage: "Правильно! Следующая записка ждёт тебя у книжной полки.",
      collectToken: "2",
    },
    {
      id: "riddle",
      title: "Шаг 4: Загадка",
      subtitle: "Угадай предмет",
      prompt: "Я круглый, со стрелками, показываю время. Кто я?",
      input: {
        type: "text",
        placeholder: "Напиши ответ",
        inputMode: "text",
      },
      answers: ["часы", "часики"],
      hint: "Это висит на стене или стоит на столе.",
      hintAfterTries: 2,
      successMessage: "Есть! Подсказка спрятана в коробке с играми.",
      collectToken: "6",
    },
    {
      id: "rebus",
      title: "Шаг 5: Ребус",
      subtitle: "Собери слово",
      prompt: "Ребус: СЫР + КА = ? (получится одно слово)",
      input: {
        type: "text",
        placeholder: "Напиши слово",
        inputMode: "text",
      },
      answers: ["сырка", "сырок"],
      hint: "Сложи два кусочка вместе.",
      hintAfterTries: 2,
      successMessage: "Класс! Следующая записка лежит в ящике письменного стола.",
      collectToken: "4",
    },
    {
      id: "final",
      title: "Финал: общий шифр",
      subtitle: "Собери цифры",
      prompt: "Введи общий шифр из собранных цифр по порядку.",
      input: {
        type: "text",
        placeholder: "Напиши код",
        inputMode: "numeric",
      },
      answers: ["38264"],
      hint: "Посмотри строку «Собрано».",
      hintAfterTries: 1,
      successMessage: "ПОБЕДА! Главный приз спрятан в коробке в шкафу на нижней полке.",
      isFinal: true,
    },
  ],
};

const elements = {
  stepCounter: document.getElementById("stepCounter"),
  attemptsCounter: document.getElementById("attemptsCounter"),
  progressFill: document.getElementById("progressFill"),
  tokenBox: document.getElementById("tokenBox"),
  tokensValue: document.getElementById("tokensValue"),
  stepTitle: document.getElementById("stepTitle"),
  stepSubtitle: document.getElementById("stepSubtitle"),
  stepPrompt: document.getElementById("stepPrompt"),
  answerForm: document.getElementById("answerForm"),
  answerInput: document.getElementById("answerInput"),
  checkButton: document.getElementById("checkButton"),
  hintButton: document.getElementById("hintButton"),
  messageBox: document.getElementById("messageBox"),
  nextButton: document.getElementById("nextButton"),
  resetButton: document.getElementById("resetButton"),
  confetti: document.getElementById("confetti"),
};

let steps = [];
let state = getDefaultState();

function getDefaultState() {
  return {
    currentStepIndex: 0,
    attempts: {},
    solvedSteps: [],
    collectedTokens: [],
  };
}

function normalizeValue(value) {
  return value.trim().toLowerCase();
}

function stepHasToken(step) {
  return typeof step.collectToken === "string" && step.collectToken.length > 0;
}

function hasTokenSteps() {
  return steps.some(stepHasToken);
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return;
  }
  try {
    const parsed = JSON.parse(raw);
    state = {
      ...getDefaultState(),
      ...parsed,
    };
  } catch (error) {
    state = getDefaultState();
  }
}

function resetProgress() {
  localStorage.removeItem(STORAGE_KEY);
  state = getDefaultState();
  render();
}

function clampStepIndex() {
  if (state.currentStepIndex < 0) {
    state.currentStepIndex = 0;
  }
  if (state.currentStepIndex >= steps.length) {
    state.currentStepIndex = steps.length - 1;
  }
}

function renderTokens() {
  if (!hasTokenSteps()) {
    elements.tokenBox.hidden = true;
    return;
  }
  elements.tokenBox.hidden = false;
  elements.tokensValue.textContent =
    state.collectedTokens.length > 0
      ? state.collectedTokens.join("")
      : "пока ничего";
}

function setMessage(text, type) {
  elements.messageBox.textContent = text;
  elements.messageBox.className = "message";
  if (type) {
    elements.messageBox.classList.add(`message--${type}`);
  }
}

function setSuccessState(step) {
  setMessage(step.successMessage, "success");
  elements.nextButton.hidden = false;
  elements.answerInput.disabled = true;
  elements.checkButton.disabled = true;
  elements.hintButton.disabled = true;
}

function setActiveState(step) {
  elements.nextButton.hidden = true;
  elements.answerInput.disabled = false;
  elements.checkButton.disabled = false;
  elements.hintButton.disabled = false;
  elements.answerInput.value = "";
  setMessage("", null);
  updateHintButton(step);
  focusInput();
}

function focusInput() {
  setTimeout(() => elements.answerInput.focus(), 0);
}

function updateHintButton(step) {
  if (!step.hint) {
    elements.hintButton.hidden = true;
    return;
  }
  elements.hintButton.hidden = false;
  const attempts = state.attempts[step.id] || 0;
  if (typeof step.hintAfterTries === "number") {
    elements.hintButton.disabled = attempts < step.hintAfterTries;
  } else {
    elements.hintButton.disabled = false;
  }
}

function matchesAnswer(value, step) {
  const normalized = normalizeValue(value);
  const allowRegex = Boolean(step.allowRegex);
  return step.answers.some((answer) => {
    if (allowRegex) {
      try {
        const regex = new RegExp(answer, "i");
        return regex.test(normalized);
      } catch (error) {
        return false;
      }
    }
    return normalized === normalizeValue(String(answer));
  });
}

function markSolved(step) {
  if (!state.solvedSteps.includes(step.id)) {
    state.solvedSteps.push(step.id);
  }
  if (stepHasToken(step) && !state.collectedTokens.includes(step.collectToken)) {
    state.collectedTokens.push(step.collectToken);
  }
  saveState();
}

function handleCorrect(step) {
  markSolved(step);
  setSuccessState(step);
  if (step.isFinal) {
    launchConfetti();
  }
}

function handleWrong(step) {
  state.attempts[step.id] = (state.attempts[step.id] || 0) + 1;
  saveState();
  setMessage("Не совсем, попробуй ещё раз!", "error");
  updateHintButton(step);
  renderCounters();
}

function handleHint(step) {
  if (!step.hint) {
    return;
  }
  setMessage(`Подсказка: ${step.hint}`, "hint");
}

function renderCounters() {
  const stepNumber = state.currentStepIndex + 1;
  elements.stepCounter.textContent = `Шаг ${stepNumber} из ${steps.length}`;
  const attempts = state.attempts[currentStep().id] || 0;
  elements.attemptsCounter.textContent = `Попыток: ${attempts}`;
  const progress = (stepNumber / steps.length) * 100;
  elements.progressFill.style.width = `${progress}%`;
}

function renderStep() {
  const step = currentStep();
  elements.stepTitle.textContent = step.title;
  elements.stepSubtitle.textContent = step.subtitle || "";
  elements.stepSubtitle.hidden = !step.subtitle;
  elements.stepPrompt.textContent = step.prompt;
  elements.answerInput.type = step.input?.type || "text";
  elements.answerInput.placeholder = step.input?.placeholder || "";
  elements.answerInput.inputMode = step.input?.inputMode || "text";

  const solved = state.solvedSteps.includes(step.id);
  if (solved) {
    setSuccessState(step);
  } else {
    setActiveState(step);
  }
}

function render() {
  clampStepIndex();
  renderCounters();
  renderTokens();
  renderStep();
}

function currentStep() {
  return steps[state.currentStepIndex];
}

function setupEvents() {
  elements.answerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const step = currentStep();
    if (state.solvedSteps.includes(step.id)) {
      return;
    }
    if (matchesAnswer(elements.answerInput.value, step)) {
      handleCorrect(step);
    } else {
      handleWrong(step);
    }
  });

  elements.hintButton.addEventListener("click", () => {
    handleHint(currentStep());
  });

  elements.nextButton.addEventListener("click", () => {
    state.currentStepIndex = Math.min(state.currentStepIndex + 1, steps.length - 1);
    saveState();
    render();
  });

  elements.resetButton.addEventListener("click", () => {
    const pin = window.prompt("Введите PIN для сброса:");
    if (pin === null) {
      return;
    }
    if (pin.trim() === PARENT_PIN) {
      resetProgress();
    } else {
      window.alert("Неверный PIN.");
    }
  });
}

function launchConfetti() {
  elements.confetti.innerHTML = "";
  const colors = ["#7ef9ff", "#ffd166", "#ff6b6b", "#39d98a", "#9b7bff"];
  const count = 50;
  for (let i = 0; i < count; i += 1) {
    const piece = document.createElement("div");
    piece.className = "confetti-piece";
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = colors[i % colors.length];
    piece.style.animationDelay = `${Math.random() * 0.8}s`;
    piece.style.transform = `translateY(-20vh) rotate(${Math.random() * 360}deg)`;
    elements.confetti.appendChild(piece);
  }
  setTimeout(() => {
    elements.confetti.innerHTML = "";
  }, 4000);
}

async function loadSteps() {
  try {
    const response = await fetch("steps.json", { cache: "no-store" });
    if (!response.ok) {
      throw new Error("steps.json not found");
    }
    const data = await response.json();
    if (Array.isArray(data.steps) && data.steps.length > 0) {
      return data.steps;
    }
  } catch (error) {
    return DEFAULT_STEPS.steps;
  }
  return DEFAULT_STEPS.steps;
}

function handleResetQuery() {
  const params = new URLSearchParams(window.location.search);
  if (params.get("reset") === "1") {
    resetProgress();
  }
}

async function init() {
  steps = await loadSteps();
  loadState();
  clampStepIndex();
  handleResetQuery();
  setupEvents();
  render();
}

init();
