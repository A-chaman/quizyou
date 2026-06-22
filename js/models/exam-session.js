// ExamSession.js
// Represents a single exam attempt in the online exam system

export class ExamSession {
  constructor(questions, timeLimitMinutes) {
    this.questions = Array.isArray(questions) ? questions : [];
    this.timeLimitMinutes = timeLimitMinutes;
    this.answers = new Array(this.questions.length).fill(null);
    this.autoSubmitted = false;
  }

  // Record the answer for a given question index  
  setAnswer(questionIndex, answerIndex) {
    if (
      questionIndex < 0 ||
      questionIndex >= this.answers.length
    ) {
      return;
    }
    this.answers[questionIndex] =
      answerIndex != null ? Number(answerIndex) : null;
  }

  // Get the recorded answer for a question index
  getAnswer(questionIndex) {
    if (
      questionIndex < 0 ||
      questionIndex >= this.answers.length
    ) {
      return null;
    }
    return this.answers[questionIndex];
  }

  // Get a shallow copy of all answers
  getAllAnswers() {
    return [...this.answers];
  }

  // Calculate how many answers are correct and the total
  calculateScore() {
    let score = 0;
    this.questions.forEach((q, index) => {
      if (this.answers[index] === q.correctAnswer) {
        score += 1;
      }
    });
    const total = this.questions.length;
    return { score, total };
  }

  // Get the percentage score with two decimal places
  getPercentage() {
    const { score, total } = this.calculateScore();
    if (total === 0) {
      return 0;
    }
    return Number(((score / total) * 100).toFixed(2));
  }

  // Mark that this session was auto-submitted (time ran out)
  markAutoSubmitted() {
    this.autoSubmitted = true;
  }

  // Check if the exam was auto-submitted
  isAutoSubmitted() {
    return this.autoSubmitted;
  }
}
