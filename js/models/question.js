// Question.js
// Represents a single exam question used in the online exam system

export class Question {
  constructor(id, question, choices, correctAnswer, subject = null) {
    this.id = id;
    this.question = question;
    this.choices = Array.isArray(choices) ? choices : [];
    this.correctAnswer = correctAnswer;
    this.subject = subject;
  }

  // Check if a given answer index is correct    
  isCorrect(answerIndex) {
    if (answerIndex == null) {
      return false;
    }
    return Number(answerIndex) === Number(this.correctAnswer);
  }

  // Get a single choice by index
  getChoice(index) {
    return this.choices[index];
  }

  // Get a shallow copy of all choices
  getAllChoices() {
    return [...this.choices];
  }

  // Short text summary (can be used for logs or review later)
  getSummary() {
    return this.question || "";
  }

  // Convert back to a plain object (if we ever need JSON-like data)
  toPlainObject() {
    return {
      id: this.id,
      question: this.question,
      choices: [...this.choices],
      correctAnswer: this.correctAnswer,
      subject: this.subject,
    };
  }

  // Helper to build a Question from a plain JSON object
  static fromPlain(obj, subjectOverride = null) {
    if (!obj) {
      return null;
    }
    const subject = subjectOverride ?? obj.subject ?? null;
    const id = obj.id ?? null;
    return new Question(
      id,
      obj.question,
      obj.choices,
      obj.correctAnswer,
      subject
    );
  }
}
