const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
const url = 'mongodb://127.0.0.1:27017/quizdb';
mongoose.connect(url, { useNewUrlParser: true });

// Define the user schema and model
const userSchema = new mongoose.Schema({
  username: { type: String, unique: true },
  password: String,
});

const quizSchema = new mongoose.Schema({
  title: String,
  questions: [{
    question: String,
    options: [String],
    correctAnswer: Number,
  }],
});

const scoreSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  score: Number,
});

const User = mongoose.model('User', userSchema);
const Quiz = mongoose.model('Quiz', quizSchema);
const Score = mongoose.model('Score', scoreSchema);

app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

// User registration
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(409).json({ message: 'Username already exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// User login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find the user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare the entered password with the hashed password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate a JWT token
    const token = jwt.sign({ username: user.username }, 'secret-key');

    //res.sendFile(__dirname + '/quizcreate.html');
    res.status(200).json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
  
});

// Create a quiz
app.post('/quizzes', async (req, res) => {
  const { title, questions } = req.body;

  try {
    // Create a new quiz
    const newQuiz = new Quiz({ title, questions });
    await newQuiz.save();

    res.status(201).json({ message: 'Quiz created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get all quizzes
app.get('/quizzes', async (req, res) => {
  try {
    const quizzes = await Quiz.find();
    res.status(200).json(quizzes);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Take a quiz
app.post('/quizzes/:quizId', async (req, res) => {
  const { quizId } = req.params;
  const { answers } = req.body;

  try {
    const quiz = await Quiz.findById(quizId);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let score = 0;
    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      if (answers[i] === question.correctAnswer) {
        score++;
      }
    }

    const token = req.headers.authorization;
    const decodedToken = jwt.verify(token, 'secret-key');
    const username = decodedToken.username;
    const user = await User.findOne({ username });

    // Save the score
    const newScore = new Score({ user: user._id, quiz: quiz._id, score });
    await newScore.save();

    res.status(200).json({ score });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get user's quiz scores
app.get('/scores', async (req, res) => {
  const token = req.headers.authorization;
  const decodedToken = jwt.verify(token, 'secret-key');
  const username = decodedToken.username;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const scores = await Score.find({ user: user._id }).populate('quiz', 'title');
    res.status(200).json(scores);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Get leaderboard
app.get('/leaderboard', async (req, res) => {
  try {
    const leaderboard = await Score.aggregate([
      {
        $group: {
          _id: '$user',
          score: { $max: '$score' },
        },
      },
      { $sort: { score: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user',
        },
      },
      {
        $unwind: '$user',
      },
      {
        $project: {
          _id: 0,
          username: '$user.username',
          score: 1,
        },
      },
    ]);

    res.status(200).json(leaderboard);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
