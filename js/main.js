// main.js
// Handles setup, validation, and starting the exam

import { startQuiz } from "./quiz.js";
import { recordQuizStartTime } from "./submit.js"; // track exam duration
import { Student } from "./models/student.js"; // Student model

// Track the currently authenticated student for this session
export let currentStudent = null;

export function getCurrentStudent() {
  return currentStudent;
}

window.addEventListener("DOMContentLoaded", () => {
  const startBtn = document.getElementById("start-btn");
  const subjectSelect = document.getElementById("subject");
  const questionCountSelect = document.getElementById("question-count");
  const timeLimitSelect = document.getElementById("time-limit");
  const studentIdInput = document.getElementById("student-id");
  const setupScreen = document.getElementById("setup-screen");
  const quizScreen = document.getElementById("quiz-screen");

  // === Load subjects dynamically from the question-bank folder ===
  loadSubjects();

  // === Start Exam button click handler ===
  startBtn.addEventListener("click", async () => {
    const studentId = studentIdInput.value.trim();

    // Validate empty input
    if (!studentId) {
      showModalMessage("Please enter your Student ID.");
      return;
    }

    // Verify student ID from JSON list and create Student instance
    const verifiedStudent = await verifyStudent(studentId);
    if (!verifiedStudent) {
      showModalMessage("Student not found. Please check your ID.");
      return;
    }
    currentStudent = verifiedStudent;

    // Get selected exam setup options
    const subject = subjectSelect.value;
    const questionCount = parseInt(questionCountSelect.value, 10);
    const timeLimit = parseInt(timeLimitSelect.value, 10);

    // Hide setup screen, show quiz screen
    setupScreen.style.display = "none";
    quizScreen.style.display = "block";

    // Start tracking exam duration
    recordQuizStartTime();

    // Load questions from the selected subject JSON file
    fetch(`question-bank/${subject}.json`)
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load question file.");
        return response.json();
      })
      .then((data) => startQuiz(data, questionCount, timeLimit))
      .catch(() => {
        showModalMessage("Error loading questions. Please try again.");
      });
  });
});

// === Verify Student ID from JSON file and return a Student object ===
async function verifyStudent(id) {
  try {
    const response = await fetch("./student-list/students.json");
    if (!response.ok) throw new Error("Failed to load student list.");
    const studentsData = await response.json();

    const studentObjects = studentsData
      .map((raw) => Student.fromPlain(raw))
      .filter((s) => s !== null);

    // Use Student helper to find matching ID
    const foundStudent = Student.findById(id, studentObjects);

    return foundStudent || null;
  } catch (error) {
    console.error("Error verifying student:", error);
    return null;
  }
}

// === Load subjects dynamically from PHP file ===
async function loadSubjects() {
  try {
    const response = await fetch("./question-bank/list_subjects.php");
    if (!response.ok) throw new Error("Failed to load subjects.");

    const subjects = await response.json();
    const subjectSelect = document.getElementById("subject");
    subjectSelect.innerHTML = ""; // Clear existing options

    // Populate dropdown
    subjects.forEach((subj) => {
      const option = document.createElement("option");
      option.value = subj.toLowerCase();
      option.textContent =
        subj.charAt(0).toUpperCase() + subj.slice(1);
      subjectSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Error loading subjects:", error);
  }
}

// === Reusable Modal Message ===
function showModalMessage(message) {
  const overlay = document.createElement("div");
  overlay.className = "modal-overlay";

  const modal = document.createElement("div");
  modal.className = "modal-box";

  const msg = document.createElement("p");
  msg.textContent = message;

  const okBtn = document.createElement("button");
  okBtn.textContent = "OK";
  okBtn.className = "ok-btn";
  okBtn.onclick = () => document.body.removeChild(overlay);

  modal.appendChild(msg);
  modal.appendChild(okBtn);
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

export { verifyStudent };
export { showModalMessage };
// Export non-DOM helper for testing only
export { verifyStudent as __test_only_verifyStudent };

