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
  },
  {
    id: "labyrinth-cats",
    title: "2. Лабиринт: котики",
    prompt:
      "Найди книжку с лабиринтами под диваном, реши нужный лабиринт и введи ответ.",
    image: "images/task2-sofa.png",
    answer: "шуня",
    listHint: "Под диваном, лабиринт с кошками",
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
  },
  {
    id: "cipher",
    title: "4. Шифр",
    prompt:
      "Под беговой дорожкой лежит шифр. Расшифруй код и введи ответ.",
    image: "images/task4-treadmill.png",
    answer: "крипер крутой",
    listHint: "Под беговой дорожкой, шифр букв и цифр",
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
  },
  {
    id: "chess",
    title: "6. Шахматы",
    prompt: "В коробке с шахматами лежит ингредиент и код.",
    image: "images/task6-checkmate.png",
    answer: "шах",
    listHint: "В коробке с шахматами",
  },
  {
    id: "labyrinth-toys",
    title: "7. Лабиринт: игрушки",
    prompt:
      "Найди книжку с лабиринтами за дверью, реши нужный лабиринт и введи ответ.",
    image: "images/task7-behind-door.png",
    answer: "10",
    listHint: "Книжка за дверью, лабиринт с роботами",
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
  },
  {
    id: "furnace",
    title: "9. Майнкрафт печка",
    prompt:
      "Догадайся, что получится из рецепта на картинке, и найди код в печке.",
    image: "images/task9-furnace.png",
    answer: "хлеб",
    listHint: "Печь, рецепт на картинке",
  },
  {
    id: "invisible-ink",
    title: "10. Невидимый код",
    prompt:
      "Собери торт из ингредиентов, подсвети ультрафиолетом и введи слово.",
    image: "images/task10-invisible-ink.png",
    answer: "супер",
    listHint: "На обороте торта скрытое слово",
  },
  {
    id: "suitcase",
    title: "11. Чемодан",
    prompt:
      "В коридоре чемодан с кодовым замком. Прочитай код словами и введи ответ.",
    image: "images/task11-suitcase.png",
    answer: "подарок",
    listHint: "Чемодан в коридоре",
    note: "КОД: два два ноль один.",
  },
];

const STEPS = [
  {
    id: "intro",
    type: "info",
    title: "Крипер спрятал подарок!",
    subtitle: "Собираем ингредиенты",
    prompt:
      "Найди 9 ингредиентов по подсказкам. За каждый ингредиент есть код. Вводи код сюда!",
    image: "images/intro-comics.png",
    nextLabel: "Начать",
  },
  {
    id: "instructions",
    type: "instructions",
    title: "Где искать ингредиенты",
    subtitle: "Смотри на картинки",
    prompt:
      "Вот подсказки. Рядом с ингредиентом будет листик с кодом — это ответ.",
    image: "images/intro-comics.png",
    checklist: TASKS.map((task) => ({
      title: task.title,
      hint: `${task.listHint}. Введи: «${task.answer}».`,
      image: task.image,
    })),
    nextLabel: "Поехали",
  },
  ...TASKS.map((task) => ({
    id: task.id,
    type: "task",
    title: task.title,
    subtitle: "Найди ингредиент",
    prompt: task.prompt,
    image: task.image,
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

const elements = {
  stepCounter: document.getElementById("stepCounter"),
  attemptsCounter: document.getElementById("attemptsCounter"),
  progressFill: document.getElementById("progressFill"),
  stepTitle: document.getElementById("stepTitle"),
  stepSubtitle: document.getElementById("stepSubtitle"),
  stepPrompt: document.getElementById("stepPrompt"),
  stepNote: document.getElementById("stepNote"),
  stepImage: document.getElementById("stepImage"),
  checklist: document.getElementById("checklist"),
  answerForm: document.getElementById("answerForm"),
  answerInput: document.getElementById("answerInput"),
  checkButton: document.getElementById("checkButton"),
  messageBox: document.getElementById("messageBox"),
  nextButton: document.getElementById("nextButton"),
  resetButton: document.getElementById("resetButton"),
};

let state = getDefaultState();

function getDefaultState() {
  return {
    currentStepIndex: 0,
    attempts: {},
    solvedSteps: [],
  };
}

function normalizeValue(value) {
  return value.trim().toLowerCase();
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
}

function setSuccessState(step) {
  setMessage("Верно! Можешь нажимать «Дальше».", "success");
  elements.nextButton.hidden = false;
  elements.answerInput.disabled = true;
  elements.checkButton.disabled = true;
}

function setActiveState() {
  elements.nextButton.hidden = true;
  elements.answerInput.disabled = false;
  elements.checkButton.disabled = false;
  elements.answerInput.value = "";
  setMessage("", null);
  focusInput();
}

function focusInput() {
  setTimeout(() => elements.answerInput.focus(), 0);
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
}

function handleWrong(step) {
  state.attempts[step.id] = (state.attempts[step.id] || 0) + 1;
  saveState();
  setMessage("Почти! Попробуй ещё раз.", "error");
  renderCounters();
}

function renderCounters() {
  const stepNumber = state.currentStepIndex + 1;
  elements.stepCounter.textContent = `Шаг ${stepNumber} из ${STEPS.length}`;
  const current = currentStep();
  const attempts = state.attempts[current.id] || 0;
  elements.attemptsCounter.textContent = `Попыток: ${attempts}`;
  const progress = (stepNumber / STEPS.length) * 100;
  elements.progressFill.style.width = `${progress}%`;
}

function renderChecklist(step) {
  if (!step.checklist || step.checklist.length === 0) {
    elements.checklist.hidden = true;
    elements.checklist.innerHTML = "";
    return;
  }

  elements.checklist.hidden = false;
  elements.checklist.innerHTML = step.checklist
    .map(
      (item) => `
        <article class="checklist__item">
          <img src="${item.image}" alt="${item.title}" />
          <div>
            <h3>${item.title}</h3>
            <p>${item.hint}</p>
          </div>
        </article>
      `,
    )
    .join("");
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

  if (step.note) {
    elements.stepNote.textContent = step.note;
    elements.stepNote.hidden = false;
  } else {
    elements.stepNote.textContent = "";
    elements.stepNote.hidden = true;
  }

  renderChecklist(step);

  if (step.type === "task") {
    elements.answerForm.hidden = false;
    const solved = state.solvedSteps.includes(step.id);
    if (solved) {
      setSuccessState(step);
    } else {
      setActiveState();
    }
  } else {
    elements.answerForm.hidden = true;
    elements.nextButton.hidden = false;
    elements.nextButton.textContent = step.nextLabel || "Дальше";
    setMessage("", null);
  }
}

function render() {
  clampStepIndex();
  renderCounters();
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

  elements.nextButton.addEventListener("click", () => {
    state.currentStepIndex = Math.min(
      state.currentStepIndex + 1,
      STEPS.length - 1,
    );
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

init();
