// submit.js
// Handles submission, scoring, and personalized result display
// with subject & time tracking + PHP saving

let quizStartTime = null; // Track when the exam started

export function recordQuizStartTime() {
  quizStartTime = new Date();
}

// examSession is an instance of ExamSession
// onFinalize is a callback (stopTimer) passed from quiz.js
export function handleExamSubmission(
  auto = false,
  examSession,
  onFinalize
) {
  if (!examSession) {
    console.error("No exam session provided for submission.");
    return;
  }

  if (auto) {
    // Time ran out
    examSession.markAutoSubmitted();
    if (typeof onFinalize === "function") {
      onFinalize(); // ⏱️ stop timer when auto-submitting
    }
    showResult(examSession, true);
    return;
  }

  // === Confirmation modal for manual submission ===
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal-box";

  const msg = document.createElement("p");
  msg.textContent =
    "Are you sure you want to submit your answers?";

  const buttons = document.createElement("div");
  buttons.className = "modal-buttons";

  const yesBtn = document.createElement("button");
  yesBtn.textContent = "Yes";
  yesBtn.className = "yes-btn";

  const noBtn = document.createElement("button");
  noBtn.textContent = "No";
  noBtn.className = "no-btn";

  yesBtn.addEventListener("click", () => {
    document.body.removeChild(overlay);
    if (typeof onFinalize === "function") {
      onFinalize(); // ⏱️ stop timer ONLY when user confirms
    }
    showResult(examSession, false);
  });

  noBtn.addEventListener("click", () => {
    // User canceled — do NOT stop timer
    document.body.removeChild(overlay);
  });

  buttons.appendChild(yesBtn);
  buttons.appendChild(noBtn);
  modal.appendChild(msg);
  modal.appendChild(buttons);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

async function showResult(examSession, auto) {
  // Timer is handled via onFinalize callback, nothing to clear here

  // === Calculate Score using ExamSession ===
  const { score, total } = examSession.calculateScore();
  const percentage = examSession.getPercentage();

  // === Calculate Time Taken ===
  let timeTakenText = "";
  if (quizStartTime) {
    const elapsedMs = new Date() - quizStartTime;
    const elapsedSec = Math.floor(elapsedMs / 1000);
    const min = Math.floor(elapsedSec / 60);
    const sec = elapsedSec % 60;
    timeTakenText = `Time taken: ${min} minute${
      min !== 1 ? "s" : ""
    } ${sec} second${sec !== 1 ? "s" : ""}.`;
  }

  // === Get Student Info ===
  const studentId = document
    .getElementById("student-id")
    ?.value?.trim();
  let studentName = "Student";

  if (studentId) {
    try {
      const response = await fetch(
        "./student-list/students.json"
      );
      if (response.ok) {
        const students = await response.json();
        const found = students.find(
          (s) =>
            String(s.id).trim() === String(studentId).trim()
        );
        if (found) {
          const first =
            (found.firstName || "").toString().trim();
          const last =
            (found.lastName || "").toString().trim();
          const full = `${first} ${last}`.trim();
          if (full) {
            studentName = full;
          }
        }
      }
    } catch (error) {
      console.error("Error looking up student name:", error);
    }
  }

  // === Get Subject Info ===
  const subjectSelect = document.getElementById("subject");
  let subjectName = "Subject";
  if (subjectSelect) {
    const option =
      subjectSelect.options[subjectSelect.selectedIndex];
    if (option) {
      subjectName = option.textContent || option.value;
    }
  }

  // === Show Result Screen ===
  const quizScreen = document.getElementById("quiz-screen");
  const resultScreen = document.getElementById("result-screen");
  const setupScreen = document.getElementById("setup-screen");

  if (quizScreen) {
    quizScreen.style.display = "none";
  }
  if (resultScreen) {
    resultScreen.style.display = "block";
  }

  if (resultScreen) {
    resultScreen.innerHTML = `
      <div class="result-container">
        <h2>Exam Result</h2>
        <p><strong>Student:</strong> ${studentName} (ID: ${
      studentId || "N/A"
    })</p>
        <p><strong>Subject:</strong> ${subjectName}</p>
        ${
          auto
            ? `<p>The exam was auto-submitted because time ran out.</p>`
            : `<p>${timeTakenText}</p>`
        }
        <br>
        <p><strong>Correct Answers:</strong> ${score} out of ${total}</p>
        <p><strong>Percentage:</strong> ${percentage}%</p>
        <br>
        <button id="return-btn" class="submit-btn">Take Another Exam</button>
      </div>
    `;

    // === Add Return Button Functionality ===
    const returnBtn = document.getElementById("return-btn");
    if (returnBtn) {
      returnBtn.addEventListener("click", () => {
        if (resultScreen) {
          resultScreen.style.display = "none";
        }
        if (setupScreen) {
          setupScreen.style.display = "block";
        }
      });
    }
  }

  // === Build result object for PHP ===
  const lastExamResult = {
    studentId,
    studentName,
    subjectName,
    score,
    total,
    percentage,
    autoSubmit: auto,
    timestamp: new Date().toISOString(),
    timeTaken: timeTakenText,
  };

  // === Send result to PHP for saving ===
  try {
    const response = await fetch("./result_saver.php", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lastExamResult),
    });
    const result = await response.json();
    console.log("Result saver response:", result);
  } catch (error) {
    console.error("Error saving result:", error);
  }
}