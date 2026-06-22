<?php
// Folder path
$dir = __DIR__;

// Get all .json files in the folder
$files = glob($dir . "/*.json");

// Prepare response
$subjects = [];
foreach ($files as $file) {
  $subjects[] = basename($file, ".json");
}

// Return as JSON
header("Content-Type: application/json");
echo json_encode($subjects);
?>
