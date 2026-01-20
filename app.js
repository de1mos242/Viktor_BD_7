const STORAGE_KEY = "minecraftQuestState";
const PARENT_PIN = "777";

const TASKS = [
  {
    id: "bed",
    title: "1. Кровать",
    image: "images/intro-comics.png",
    answer: "подушка",
  },
  {
    id: "labyrinth-cats",
    title: "2. Лабиринт: котики",
    image: "images/task2-sofa.png",
    answer: "шуня",
  },
  {
    id: "parkour",
    title: "3. Паркур (пол — это лава)",
    image: "images/task3-floor-is-lava.png",
    answer: "лава",
  },
  {
    id: "cipher",
    title: "4. Шифр",
    image: "images/task4-treadmill.png",
    answer: "крипер крутой",
  },
  {
    id: "uno",
    title: "5. Книга Уно",
    image: "images/task5-uno.png",
    answer: "чтение",
  },
  {
    id: "chess",
    title: "6. Шахматы",
    image: "images/task6-checkmate.png",
    answer: "шах",
  },
  {
    id: "labyrinth-toys",
    title: "7. Лабиринт: игрушки",
    image: "images/task7-behind-door.png",
    answer: "10",
  },
  {
    id: "lego",
    title: "8. Лего фигурки",
    image: "images/task8-lego.png",
    answer: "лего",
  },
  {
    id: "furnace",
    title: "9. Майнкрафт печка",
    image: "images/task9-furnace.png",
    answer: "хлеб",
  },
  {
    id: "invisible-ink",
    title: "10. Невидимый код",
    image: "images/task10-invisible-ink.png",
    answer: "супер",
  },
  {
    id: "suitcase",
    title: "11. Чемодан",
    image: "images/task11-suitcase.png",
    answer: "подарок",
    codeText: "КОД: пять шесть семь",
  },
];

const STEPS = [
  ...TASKS.map((task) => ({
    id: task.id,
    type: "task",
    title: task.title,
    image: task.image,
    codeText: task.codeText,
    answers: [task.answer],
  })),
  {
    id: "final",
    type: "info",
    title: "Финал!",
    subtitle: "С днём рождения",
    prompt:
      "Мобы из Майнкрафта поздравляют тебя! Подарок ждёт рядом с чемоданом.",
    image: "images/final-happy-birthday.png",
    nextLabel: "Ура!",
  },
];

const DEFAULT_STEP_IMAGE = "images/intro-comics.png";
const TRANSITION_DURATION = 3000;
const TRANSITION_SWAP_RATIO = 0.5;
const FIREWORKS_DURATION_MS = 6000;

function getDefaultState() {
  return {
    currentStepIndex: 0,
    solvedSteps: [],
  };
}

function normalizeValue(value) {
  return value.trim().toLowerCase();
}

function createFireworks(document, window) {
  if (!document?.createElement || !document?.body || !window?.setTimeout) {
    window?.console?.warn?.(
      "Fireworks disabled: missing DOM or timer APIs.",
    );
    return {
      launch() {},
    };
  }
  let instance = null;
  let activeBursts = 0;

  function getInstance() {
    if (instance) {
      return instance;
    }
    const candidates = [
      window?.Fireworks?.default,
      window?.Fireworks?.Fireworks,
      window?.Fireworks,
      window?.fireworks?.default,
      window?.fireworks?.Fireworks,
      window?.fireworks,
    ];
    const FireworksConstructor = candidates.find(
      (candidate) => typeof candidate === "function",
    );
    if (!FireworksConstructor) {
      window?.console?.warn?.(
        "Fireworks disabled: no usable constructor on window.",
      );
      return null;
    }
    const container = document.createElement("div");
    container.className = "fireworks";
    container.setAttribute("aria-hidden", "true");
    document.body.appendChild(container);
    instance = new FireworksConstructor(container, {
      autoresize: true,
      opacity: 0.7,
      acceleration: 1.02,
      friction: 0.99,
      gravity: 1,
      particles: 160,
      trace: 3,
      explosion: 10,
    });
    return instance;
  }

  function launch() {
    const fireworks = getInstance();
    if (!fireworks) {
      window?.console?.warn?.("Fireworks launch skipped: no instance.");
      return;
    }
    fireworks.start();
    activeBursts += 1;
    window.setTimeout(() => {
      activeBursts = Math.max(activeBursts - 1, 0);
      if (activeBursts === 0) {
        fireworks.stop();
      }
    }, FIREWORKS_DURATION_MS);
  }

  return {
    launch,
  };
}

function createElements(document) {
  return {
    progressFill: document.getElementById("progressFill"),
    card: document.getElementById("card"),
    stepCode: document.getElementById("stepCode"),
    stepImage: document.getElementById("stepImage"),
    answerLabel: document.getElementById("answerLabel"),
    answerForm: document.getElementById("answerForm"),
    answerInput: document.getElementById("answerInput"),
    checkButton: document.getElementById("checkButton"),
    messageBox: document.getElementById("messageBox"),
    resetButton: document.getElementById("resetButton"),
  };
}

function createStorage(localStorage) {
  return {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch (error) {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch (error) {
        // ignore storage failures (private mode, blocked storage)
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        // ignore storage failures
      }
    },
  };
}

function createQuestApp({
  document = globalThis.document,
  window = globalThis.window,
  storage,
  timing = {},
} = {}) {
  const elements = createElements(document);
  const fireworks = createFireworks(document, window);
  const transitionDuration = timing.transitionDuration ?? TRANSITION_DURATION;
  const transitionSwapMs =
    timing.transitionSwapMs ??
    Math.round(transitionDuration * TRANSITION_SWAP_RATIO);
  const storageApi =
    storage ??
    createStorage(window?.localStorage ?? {
      getItem() {
        return null;
      },
      setItem() {},
      removeItem() {},
    });
  let state = getDefaultState();
  let isTransitioning = false;

  function saveState() {
    storageApi.set(STORAGE_KEY, JSON.stringify(state));
  }

  function loadState() {
    const raw = storageApi.get(STORAGE_KEY);
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
    storageApi.remove(STORAGE_KEY);
    state = getDefaultState();
    render();
  }

  function clampStepIndex() {
    if (state.currentStepIndex < 0) {
      state.currentStepIndex = 0;
    }
    if (state.currentStepIndex >= STEPS.length) {
      state.currentStepIndex = STEPS.length - 1;
    }
  }

  function setMessage(text, type) {
    elements.messageBox.textContent = text;
    elements.messageBox.className = "message";
    if (type) {
      elements.messageBox.classList.add(`message--${type}`);
    }
    if (text) {
      elements.messageBox.classList.add("message--visible");
    }
  }

  function setSuccessState(step) {
    setMessage("", null);
    elements.answerInput.classList.remove("card__input--error");
    elements.answerInput.removeAttribute("aria-invalid");
    elements.answerInput.disabled = true;
    elements.checkButton.disabled = true;
  }

  function setActiveState() {
    elements.answerInput.disabled = false;
    elements.checkButton.disabled = false;
    elements.answerInput.value = "";
    elements.answerInput.classList.remove("card__input--error");
    elements.answerInput.removeAttribute("aria-invalid");
    setMessage("", null);
  }

  function matchesAnswer(value, step) {
    const normalized = normalizeValue(value);
    return step.answers.some(
      (answer) => normalized === normalizeValue(String(answer)),
    );
  }

  function markSolved(step) {
    if (!state.solvedSteps.includes(step.id)) {
      state.solvedSteps.push(step.id);
    }
    saveState();
  }

  function handleCorrect(step) {
    markSolved(step);
    setSuccessState(step);
    advanceStep();
  }

  function handleWrong(step) {
    saveState();
    setMessage("Код неправильный.", "error");
    elements.answerInput.classList.add("card__input--error");
    elements.answerInput.setAttribute("aria-invalid", "true");
  }

  function renderProgress() {
    const stepNumber = state.currentStepIndex + 1;
    const progress = (stepNumber / STEPS.length) * 100;
    elements.progressFill.style.width = `${progress}%`;
  }

  function setTransitionLock(active) {
    elements.answerInput.disabled = active;
    elements.checkButton.disabled = active;
  }

  function advanceStep() {
    if (state.currentStepIndex >= STEPS.length - 1) {
      return;
    }
    if (isTransitioning) {
      return;
    }
    isTransitioning = true;
    elements.card?.classList.remove("card--transition");
    void elements.card?.offsetWidth;
    elements.card?.classList.add("card--transition");
    setTransitionLock(true);
    const nextIndex = Math.min(state.currentStepIndex + 1, STEPS.length - 1);
    window.setTimeout(() => {
      state.currentStepIndex = nextIndex;
      saveState();
      render();
    }, transitionSwapMs);
    window.setTimeout(() => {
      elements.card?.classList.remove("card--transition");
      isTransitioning = false;
      renderStep();
    }, transitionDuration);
  }

  function renderStep() {
    const step = currentStep();
    elements.stepImage.src = step.image || DEFAULT_STEP_IMAGE;
    elements.stepImage.alt = step.title;
    elements.stepImage.hidden = false;

    if (elements.stepCode) {
      if (step.codeText) {
        elements.stepCode.textContent = step.codeText;
        elements.stepCode.hidden = false;
      } else {
        elements.stepCode.textContent = "";
        elements.stepCode.hidden = true;
      }
    }

    if (step.type === "task") {
      elements.answerForm.hidden = false;
      elements.answerLabel.hidden = false;
      elements.answerInput.hidden = false;
      elements.answerInput.required = true;
      elements.checkButton.textContent = "Проверить";
      const solved = state.solvedSteps.includes(step.id);
      if (solved) {
        setSuccessState(step);
      } else {
        setActiveState();
      }
    } else {
      elements.answerForm.hidden = false;
      elements.answerLabel.hidden = true;
      elements.answerInput.hidden = true;
      elements.answerInput.required = false;
      elements.answerInput.disabled = true;
      elements.checkButton.disabled = false;
      elements.checkButton.textContent = step.nextLabel || "Дальше";
      setMessage("", null);
    }

    if (isTransitioning) {
      setTransitionLock(true);
    }
  }

  function render() {
    clampStepIndex();
    renderProgress();
    renderStep();
  }

  function currentStep() {
    return STEPS[state.currentStepIndex];
  }

  function setupEvents() {
    elements.answerForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const step = currentStep();
      if (step.type !== "task") {
        if (step.id === "final") {
          fireworks.launch();
        }
        advanceStep();
        return;
      }
      if (state.solvedSteps.includes(step.id)) {
        return;
      }
      if (matchesAnswer(elements.answerInput.value, step)) {
        handleCorrect(step);
      } else {
        handleWrong(step);
      }
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

  function handleResetQuery() {
    const params = new URLSearchParams(window.location.search);
    if (params.get("reset") === "1") {
      resetProgress();
    }
  }

  function init() {
    loadState();
    clampStepIndex();
    handleResetQuery();
    setupEvents();
    render();
  }

  return {
    init,
    getState() {
      return { ...state };
    },
    elements,
  };
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  const app = createQuestApp();
  app.init();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch((error) => {
        window?.console?.warn?.("Service worker registration failed.", error);
      });
    });
  }
}

if (typeof module !== "undefined") {
  module.exports = {
    createQuestApp,
    normalizeValue,
  };
}
