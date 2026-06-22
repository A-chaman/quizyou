// quiz.js
// Handles quiz rendering, navigation, and timer logic

import { Question } from "./models/question.js";
import { ExamSession } from "./models/exam-session.js";
import { handleExamSubmission } from "./submit.js";

export function startQuiz(questionData, questionCount, timeLimit) {
  const quizScreen = document.getElementById("quiz-screen");

  // convert plain JSON questions into Question instances and pick random ones
  const selectedQuestions = getRandomQuestions(
    questionData,
    questionCount
  ).map((raw, index) => {
    // Attach a fallback id if missing (index-based)
    const objWithId = { id: raw.id ?? index + 1, ...raw };
    return Question.fromPlain(objWithId);
  });

  // Create an ExamSession to track questions, answers, and scoring
  const examSession = new ExamSession(selectedQuestions, timeLimit);

  let currentQuestionIndex = 0;
  let timeRemaining = timeLimit * 60;
  let timerId = null; // local timer only

  startTimer();
  renderQuestion();

  // === Randomize and pick N questions ===
  function getRandomQuestions(data, count) {
    const shuffled = [...data].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // === Timer Control ===
  function startTimer() {
    stopTimer(); // clear any existing timer just in case
    updateTimerDisplay();
    timerId = setInterval(() => {
      timeRemaining--;
      updateTimerDisplay();
      if (timeRemaining <= 0) {
        stopTimer();
        examSession.markAutoSubmitted();
        showTimeUp();
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerId !== null) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  // === Update Timer Display (turn red if <10%) ===
  function updateTimerDisplay() {
    const timerElement = document.getElementById("timer");
    if (!timerElement) return;

    const percentRemaining =
      (timeRemaining / (timeLimit * 60)) * 100;

    // Change color dynamically
    if (percentRemaining <= 10) {
      timerElement.style.color = "red"; // Critical time
    } else {
      timerElement.style.color = "#007bff"; // Default blue
    }

    timerElement.textContent = `Time left: ${formatTime(
      timeRemaining
    )}`;
  }

  // === Format time as M:SS ===
  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  }

  // === Render Question ===
  function renderQuestion() {
    const q = examSession.questions[currentQuestionIndex];
    quizScreen.innerHTML = "";

    // === Timer at Top-Right (Above Title) ===
    const timerDisplay = document.createElement("p");
    timerDisplay.id = "timer";
    timerDisplay.className = "timer-top-right"; // CSS positions top-right
    timerDisplay.textContent = `Time left: ${formatTime(
      timeRemaining
    )}`;
    quizScreen.appendChild(timerDisplay);

    // === Main Container for Question ===
    const container = document.createElement("div");

    const questionHeader = document.createElement("h2");
    questionHeader.textContent = `Question ${
      currentQuestionIndex + 1
    } of ${examSession.questions.length}`;
    container.appendChild(questionHeader);

    const questionText = document.createElement("p");
    questionText.textContent = q.question;
    container.appendChild(questionText);

    // === Choices ===
    const form = document.createElement("form");
    form.id = "question-form";

    q.choices.forEach((choice, index) => {
      const label = document.createElement("label");
      label.style.display = "block";
      label.style.marginBottom = "8px";

      const input = document.createElement("input");
      input.type = "radio";
      input.name = "answer";
      input.value = index;

      // Pre-select previously chosen answer for this question
      input.checked =
        examSession.getAnswer(currentQuestionIndex) === index;

      input.addEventListener("change", () => {
        examSession.setAnswer(currentQuestionIndex, index);
        console.log(
          "Answer saved:",
          examSession.getAllAnswers()
        );
      });

      label.appendChild(input);
      label.appendChild(document.createTextNode(" " + choice));
      form.appendChild(label);
    });

    container.appendChild(form);

    // === Navigation Buttons ===
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "nav-buttons";

    const backBtn = document.createElement("button");
    backBtn.textContent = "Back";
    backBtn.disabled = currentQuestionIndex === 0;
    backBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (currentQuestionIndex > 0) {
        currentQuestionIndex--;
        renderQuestion();
      }
    });

    const nextBtn = document.createElement("button");
    nextBtn.textContent = "Next";
    nextBtn.disabled =
      currentQuestionIndex ===
      examSession.questions.length - 1;
    nextBtn.addEventListener("click", (e) => {
      e.preventDefault();
      if (
        currentQuestionIndex <
        examSession.questions.length - 1
      ) {
        currentQuestionIndex++;
        renderQuestion();
      }
    });

    buttonContainer.appendChild(backBtn);
    buttonContainer.appendChild(nextBtn);
    container.appendChild(buttonContainer);

    // === Submit Button ===
    const submitContainer = document.createElement("div");
    submitContainer.className = "submit-container";

    const submitBtn = document.createElement("button");
    submitBtn.className = "submit-btn";
    submitBtn.textContent = "Submit";
    submitBtn.addEventListener("click", (e) => {
      e.preventDefault();
      // Timer keeps running while modal is open.
      // stopTimer is called ONLY when user confirms or time runs out.
      handleExamSubmission(false, examSession, stopTimer);
    });

    submitContainer.appendChild(submitBtn);
    container.appendChild(submitContainer);

    quizScreen.appendChild(container);
  }

  // === Auto-submit on timeout ===
  function showTimeUp() {
    // Time is already stopped in startTimer when <= 0
    handleExamSubmission(true, examSession, stopTimer);
  }
}