const STORAGE_KEY = "minecraftQuestState";
const PARENT_PIN = "777";

const TASKS = [
  {
    id: "bed",
    title: "1. Кровать",
    prompt: "Найди ингредиент под своей кроватью и введи код с листика.",
    image: "images/intro-comics.png",
    answer: "подушка",
    listHint: "Под кроватью",
    hint: "Ищи прямо под кроватью.",
  },
  {
    id: "labyrinth-cats",
    title: "2. Лабиринт: котики",
    prompt:
      "Найди книжку с лабиринтами под диваном, реши нужный лабиринт и введи ответ.",
    image: "images/task2-sofa.png",
    answer: "шуня",
    listHint: "Под диваном, лабиринт с кошками",
    hint: "Под диваном спрятана книжка с лабиринтом про кошек.",
    note: "Подсказка для офлайна: страница 15, как зовут коричневую кошку.",
  },
  {
    id: "parkour",
    title: "3. Паркур (пол — это лава)",
    prompt:
      "Пройди по листикам до спальни, найди ингредиент и введи код с листика.",
    image: "images/task3-floor-is-lava.png",
    answer: "лава",
    listHint: "В коридоре, идти только по листикам",
    hint: "Нужно дойти до спальни, наступая только на листики.",
  },
  {
    id: "cipher",
    title: "4. Шифр",
    prompt:
      "Под беговой дорожкой лежит шифр. Расшифруй код и введи ответ.",
    image: "images/task4-treadmill.png",
    answer: "крипер крутой",
    listHint: "Под беговой дорожкой, шифр букв и цифр",
    hint: "Под беговой дорожкой лежит лист с шифром.",
    note: "Подсказка для офлайна: лист с задачей поменять цифры с буквами.",
  },
  {
    id: "uno",
    title: "5. Книга Уно",
    prompt:
      "В книжном шкафу лежит две книги Уно. В красной — ингредиент и код.",
    image: "images/task5-uno.png",
    answer: "чтение",
    listHint: "В красной книге Уно в шкафу",
    hint: "Посмотри красную книгу Уно в шкафу.",
  },
  {
    id: "chess",
    title: "6. Шахматы",
    prompt: "В коробке с шахматами лежит ингредиент и код.",
    image: "images/task6-checkmate.png",
    answer: "шах",
    listHint: "В коробке с шахматами",
    hint: "Открой коробку с шахматами.",
  },
  {
    id: "labyrinth-toys",
    title: "7. Лабиринт: игрушки",
    prompt:
      "Найди книжку с лабиринтами за дверью, реши нужный лабиринт и введи ответ.",
    image: "images/task7-behind-door.png",
    answer: "10",
    listHint: "Книжка за дверью, лабиринт с роботами",
    hint: "Книжка с лабиринтами прикреплена за дверью.",
    note: "Подсказка для офлайна: страница 33, сколько очков у робота.",
  },
  {
    id: "lego",
    title: "8. Лего фигурки",
    prompt:
      "Фигурки лего держат бумажки. Найди ингредиент и введи код.",
    image: "images/task8-lego.png",
    answer: "лего",
    listHint: "В комнате у фигурок лего",
    hint: "Фигурки лего держат бумажки с кодами.",
  },
  {
    id: "furnace",
    title: "9. Майнкрафт печка",
    prompt:
      "Догадайся, что получится из рецепта на картинке, и найди код в печке.",
    image: "images/task9-furnace.png",
    answer: "хлеб",
    listHint: "Печь, рецепт на картинке",
    hint: "Подумай, что получится в печке из рецепта.",
  },
  {
    id: "invisible-ink",
    title: "10. Невидимый код",
    prompt:
      "Собери торт из ингредиентов, подсвети ультрафиолетом и введи слово.",
    image: "images/task10-invisible-ink.png",
    answer: "супер",
    listHint: "На обороте торта скрытое слово",
    hint: "Посвети ультрафиолетом на торт.",
  },
  {
    id: "suitcase",
    title: "11. Чемодан",
    prompt:
      "В коридоре чемодан с кодовым замком. Прочитай код словами и введи ответ.",
    image: "images/task11-suitcase.png",
    answer: "подарок",
    listHint: "Чемодан в коридоре",
    hint: "Код замка написан словами.",
    note: "КОД: два два ноль один.",
  },
];

const STEPS = [
  ...TASKS.map((task) => ({
    id: task.id,
    type: "task",
    title: task.title,
    subtitle: "Найди ингредиент",
    prompt: task.prompt,
    image: task.image,
    hint: task.hint,
    note: task.note,
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
const TRANSITION_SWAP_MS = 700;
const FIREWORKS_DURATION_MS = 2500;

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
  let stopTimeout = null;

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
      acceleration: 1.04,
      friction: 0.98,
      gravity: 1.4,
      particles: 90,
      trace: 3,
      explosion: 6,
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
    if (stopTimeout) {
      window.clearTimeout(stopTimeout);
    }
    stopTimeout = window.setTimeout(() => fireworks.stop(), FIREWORKS_DURATION_MS);
  }

  return {
    launch,
  };
}

function createElements(document) {
  return {
    progressFill: document.getElementById("progressFill"),
    card: document.getElementById("card"),
    stepTitle: document.getElementById("stepTitle"),
    stepSubtitle: document.getElementById("stepSubtitle"),
    stepPrompt: document.getElementById("stepPrompt"),
    stepHint: document.getElementById("stepHint"),
    stepNote: document.getElementById("stepNote"),
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
  const transitionSwapMs = timing.transitionSwapMs ?? TRANSITION_SWAP_MS;
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
    setMessage("Верно!", "success");
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
    focusInput();
  }

  function focusInput() {
    if (isTransitioning) {
      return;
    }
    window.setTimeout(() => elements.answerInput.focus(), 0);
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
    elements.stepTitle.textContent = step.title;
    elements.stepSubtitle.textContent = step.subtitle || "";
    elements.stepSubtitle.hidden = !step.subtitle;
    elements.stepPrompt.textContent = step.prompt;

    elements.stepImage.src = step.image || DEFAULT_STEP_IMAGE;
    elements.stepImage.alt = step.title;
    elements.stepImage.hidden = false;

    if (step.hint) {
      elements.stepHint.textContent = `Подсказка: ${step.hint}`;
      elements.stepHint.hidden = false;
    } else {
      elements.stepHint.textContent = "";
      elements.stepHint.hidden = true;
    }

    if (step.note) {
      elements.stepNote.textContent = step.note;
      elements.stepNote.hidden = false;
    } else {
      elements.stepNote.textContent = "";
      elements.stepNote.hidden = true;
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
}

if (typeof module !== "undefined") {
  module.exports = {
    createQuestApp,
    normalizeValue,
  };
}
