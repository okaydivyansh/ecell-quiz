# ecell-quiz
a backend system for a quiz management application. The application should allow users to create quizzes, take quizzes, and view their quiz scores. You will need to implement the following functionalities:
API Documentation
================

This document describes the endpoints, inputs, and outputs of the API.

Base URL
--------
http://localhost:3000

Authentication
--------------
Some endpoints require authentication using a JWT token. Include the token in the "Authorization" header of the request.

Endpoints
---------

1. User Registration
--------------------
Register a new user.

- URL: /register
- Method: POST
- Request Body:
  - username (string, required): The username of the user.
  - password (string, required): The password of the user.
- Response:
  - 201 Created: User registered successfully.
  - 409 Conflict: Username already exists.
  - 500 Internal Server Error: An error occurred on the server.

2. User Login
-------------
Authenticate and generate a JWT token for the user.

- URL: /login
- Method: POST
- Request Body:
  - username (string, required): The username of the user.
  - password (string, required): The password of the user.
- Response:
  - 200 OK: Token generated successfully.
  - 401 Unauthorized: Invalid username or password.
  - 500 Internal Server Error: An error occurred on the server.

3. Create a Quiz
----------------
Create a new quiz.

- URL: /quizzes
- Method: POST
- Request Body:
  - title (string, required): The title of the quiz.
  - questions (array, required): An array of quiz questions, each containing:
    - question (string, required): The question text.
    - options (array, required): An array of options for the question.
    - correctAnswer (number, required): The index of the correct answer option.
- Response:
  - 201 Created: Quiz created successfully.
  - 500 Internal Server Error: An error occurred on the server.

4. Get All Quizzes
------------------
Retrieve all quizzes.

- URL: /quizzes
- Method: GET
- Response:
  - 200 OK: Array of quizzes.
  - 500 Internal Server Error: An error occurred on the server.

5. Take a Quiz
--------------
Submit answers for a quiz and calculate the score.

- URL: /quizzes/:quizId
- Method: POST
- Request Parameters:
  - quizId (string, required): The ID of the quiz to take.
- Request Body:
  - answers (array, required): An array of answers for each question in the quiz.
- Response:
  - 200 OK: Object containing the score.
  - 404 Not Found: Quiz not found.
  - 500 Internal Server Error: An error occurred on the server.

6. Get User's Quiz Scores
-------------------------
Retrieve the scores of quizzes taken by the user.

- URL: /scores
- Method: GET
- Authentication Required
- Response:
  - 200 OK: Array of scores with associated quizzes.
  - 404 Not Found: User not found.
  - 500 Internal Server Error: An error occurred on the server.

7. Get Leaderboard
------------------
Retrieve the leaderboard showing the top scores.

- URL: /leaderboard
- Method: GET
- Response:
  - 200 OK: Array of leaderboard entries.
  - 500 Internal Server Error: An error occurred on the server.
