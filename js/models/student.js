// Student.js
// Represents a student enrolled in the online exam system  

export class Student {
  constructor(id, firstName, lastName, email, attempts = 0) {
    this.id = id;
    this.firstName = firstName;
    this.lastName = lastName;
    this.email = email;
    this.attempts = attempts;
  }

  getFullName() {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  getIdAsString() {
    return this.id != null ? this.id.toString() : "";
  }

  isSameId(otherId) {
    if (otherId == null) {
      return false;
    }
    return this.getIdAsString() === otherId.toString();
  }

  incrementAttempts() {
    this.attempts += 1;
  }

  toJSON() {
    return {
      id: this.id,
      firstName: this.firstName,
      lastName: this.lastName,
      email: this.email,
      attempts: this.attempts,
    };
  }

  static fromPlain(obj) {
    if (!obj) {
      return null;
    }
    return new Student(
      obj.id,
      obj.firstName,
      obj.lastName,
      obj.email,
      obj.attempts ?? 0
    );
  }

  static findById(id, students) {
    if (!Array.isArray(students)) {
      return null;
    }
    return students.find((student) => student.isSameId(id)) || null;
  }
}
