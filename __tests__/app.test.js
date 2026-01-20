const assert = require("node:assert/strict");
const { test, beforeEach } = require("node:test");

const { createQuestApp } = require("../app");

function createMockElement() {
  const handlers = {};
  return {
    textContent: "",
    classList: {
      _classes: new Set(),
      add(className) {
        this._classes.add(className);
      },
      remove(className) {
        this._classes.delete(className);
      },
      contains(className) {
        return this._classes.has(className);
      },
    },
    hidden: false,
    required: false,
    disabled: false,
    value: "",
    style: {},
    src: "",
    alt: "",
    focus() {},
    setAttribute(name, value) {
      this[name] = value;
    },
    removeAttribute(name) {
      delete this[name];
    },
    addEventListener(type, handler) {
      handlers[type] = handler;
    },
    dispatchEvent(event) {
      if (handlers[event.type]) {
        handlers[event.type](event);
      }
    },
  };
}

function createMockDocument() {
  const ids = [
    "progressFill",
    "card",
    "stepImage",
    "answerLabel",
    "answerForm",
    "answerInput",
    "checkButton",
    "messageBox",
    "resetButton",
  ];
  const elements = Object.fromEntries(
    ids.map((id) => [id, createMockElement()]),
  );
  return {
    getElementById(id) {
      return elements[id];
    },
    elements,
  };
}

function createMockWindow() {
  return {
    setTimeout,
    clearTimeout,
    location: { search: "" },
    prompt() {
      return null;
    },
    alert() {},
  };
}

beforeEach(() => {
  // ensure timers are clean between tests
});

test("advances to the next step on a correct answer", async () => {
  const document = createMockDocument();
  const window = createMockWindow();
  const app = createQuestApp({
    document,
    window,
    timing: { transitionDuration: 0, transitionSwapMs: 0 },
  });

  app.init();

  const { answerInput, answerForm, stepImage } = document.elements;

  assert.ok(stepImage.alt.includes("1. Кровать"));

  answerInput.value = "подушка";
  answerForm.dispatchEvent({
    type: "submit",
    preventDefault() {},
  });

  await new Promise((resolve) => setTimeout(resolve, 0));

  assert.ok(stepImage.alt.includes("2. Лабиринт: котики"));
});

test("shows an error message on a wrong answer", () => {
  const document = createMockDocument();
  const window = createMockWindow();
  const app = createQuestApp({
    document,
    window,
    timing: { transitionDuration: 0, transitionSwapMs: 0 },
  });

  app.init();

  const { answerInput, answerForm, messageBox } = document.elements;

  answerInput.value = "неверно";
  answerForm.dispatchEvent({
    type: "submit",
    preventDefault() {},
  });

  assert.equal(messageBox.textContent, "Код неправильный.");
  assert.equal(answerInput.classList.contains("card__input--error"), true);
  assert.equal(answerInput["aria-invalid"], "true");
});

test("enables the final action button on the last screen", () => {
  const document = createMockDocument();
  const window = createMockWindow();
  const storage = {
    get() {
      return JSON.stringify({ currentStepIndex: 11, solvedSteps: [] });
    },
    set() {},
    remove() {},
  };
  document.elements.checkButton.disabled = true;

  const app = createQuestApp({
    document,
    window,
    storage,
    timing: { transitionDuration: 0, transitionSwapMs: 0 },
  });

  app.init();

  assert.equal(document.elements.checkButton.disabled, false);
});

test("uses the fireworks default export on the final screen", () => {
  const document = createMockDocument();
  document.createElement = () => createMockElement();
  document.body = { appendChild() {} };
  const storage = {
    get() {
      return JSON.stringify({ currentStepIndex: 11, solvedSteps: [] });
    },
    set() {},
    remove() {},
  };
  let started = false;
  const window = {
    ...createMockWindow(),
    Fireworks: {
      default: function Fireworks() {
        this.start = () => {
          started = true;
        };
        this.stop = () => {};
      },
    },
  };

  const app = createQuestApp({
    document,
    window,
    storage,
    timing: { transitionDuration: 0, transitionSwapMs: 0 },
  });

  app.init();

  document.elements.answerForm.dispatchEvent({
    type: "submit",
    preventDefault() {},
  });

  assert.equal(started, true);
});

test("uses the fireworks global function on the final screen", () => {
  const document = createMockDocument();
  document.createElement = () => createMockElement();
  document.body = { appendChild() {} };
  const storage = {
    get() {
      return JSON.stringify({ currentStepIndex: 11, solvedSteps: [] });
    },
    set() {},
    remove() {},
  };
  let started = false;
  const window = {
    ...createMockWindow(),
    fireworks: function Fireworks() {
      this.start = () => {
        started = true;
      };
      this.stop = () => {};
    },
  };

  const app = createQuestApp({
    document,
    window,
    storage,
    timing: { transitionDuration: 0, transitionSwapMs: 0 },
  });

  app.init();

  document.elements.answerForm.dispatchEvent({
    type: "submit",
    preventDefault() {},
  });

  assert.equal(started, true);
});
