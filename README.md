CS673 Software Engineering Project

Online Exam System built with HTML, CSS, JavaScript (modules), and PHP. (it is Mobile-first)

The user enters a valid Student ID, selects a subject, chooses how many questions to answer, and starts a timed multiple choice exam. Questions are loaded dynamically from JSON files in the question-bank folder, and the system randomly selects the requested amount.

Only registered students can start the exam. Valid IDs are stored in student-list/students.json.

More students can be added using the same JSON structure.

The exam is auto graded when submitted or when time runs out. Results are saved in exam-results/results.json, including student ID, timestamp, score, and  etc.

Subjects are detected automatically by list\_subjects.php. Adding a new subject only requires placing another .json file inside the question-bank folder.

Also, The .htaccess file disables browser caching, meaning every time user refreshes the page, the browser will load the newest version of the files



