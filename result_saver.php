<?php
// === Save Exam Results to JSON (with Student Email included) ===

header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Paths
$resultsFile = __DIR__ . "/exam-results/results.json";
$studentsFile = __DIR__ . "/student-list/students.json";

// Ensure folder exists
if (!file_exists(dirname($resultsFile))) {
  mkdir(dirname($resultsFile), 0777, true);
}

// Read JSON input
$input = json_decode(file_get_contents("php://input"), true);

if (!$input || !isset($input["studentId"])) {
  echo json_encode(["status" => "error", "message" => "Invalid data."]);
  exit;
}

// Load existing results
$existing = [];
if (file_exists($resultsFile)) {
  $existing = json_decode(file_get_contents($resultsFile), true);
  if (!is_array($existing)) $existing = [];
}

// Load student list and find matching student
$studentEmail = "unknown@example.com";
if (file_exists($studentsFile)) {
  $students = json_decode(file_get_contents($studentsFile), true);
  if (is_array($students)) {
    foreach ($students as $s) {
      if ($s["id"] == $input["studentId"]) {
        $studentEmail = $s["email"];
        break;
      }
    }
  }
}

// Format score and timestamp
$formattedScore = "{$input["score"]} out of {$input["total"]}";
$formattedTime = date("Y-m-d h:i:s A");
$cleanTime = str_replace("Time taken: ", "", $input["timeTaken"]);

// Build new record with student email
$newRecord = [
  "studentId" => $input["studentId"],
  "studentName" => $input["studentName"],
  "studentEmail" => $studentEmail,
  "subject" => $input["subjectName"],
  "score" => $formattedScore,
  "percentage" => $input["percentage"] . "%",
  "timeTaken" => $cleanTime,
  "autoSubmit" => $input["autoSubmit"] ? "Yes" : "No",
  "timestamp" => $formattedTime
];

// Append and save
$existing[] = $newRecord;

if (file_put_contents($resultsFile, json_encode($existing, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES))) {
  echo json_encode(["status" => "success", "message" => "Result saved successfully."]);
} else {
  echo json_encode(["status" => "error", "message" => "Failed to save result."]);
}
?>
