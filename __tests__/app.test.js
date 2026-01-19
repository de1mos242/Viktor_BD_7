const fs = require("fs");
const path = require("path");

describe("Minecraft Birthday Quest", () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.resetModules();
    const html = fs.readFileSync(
      path.join(__dirname, "..", "index.html"),
      "utf8",
    );
    document.documentElement.innerHTML = html;
    localStorage.clear();
  });

  test("advances to the next step on a correct answer", () => {
    require("../app.js");

    const answerInput = document.getElementById("answerInput");
    const answerForm = document.getElementById("answerForm");
    const stepTitle = document.getElementById("stepTitle");

    expect(stepTitle.textContent).toContain("1. Кровать");

    answerInput.value = "подушка";
    answerForm.dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    );

    jest.runAllTimers();

    expect(stepTitle.textContent).toContain("2. Лабиринт: котики");
  });

  test("shows an error message on a wrong answer", () => {
    require("../app.js");

    const answerInput = document.getElementById("answerInput");
    const answerForm = document.getElementById("answerForm");
    const messageBox = document.getElementById("messageBox");

    answerInput.value = "неверно";
    answerForm.dispatchEvent(
      new window.Event("submit", { bubbles: true, cancelable: true }),
    );

    expect(messageBox.textContent).toBe("Код неправильный.");
    expect(answerInput.classList.contains("card__input--error")).toBe(true);
    expect(answerInput.getAttribute("aria-invalid")).toBe("true");
  });
});
