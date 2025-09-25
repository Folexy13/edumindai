const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const azureOpenAI = require('../services/azureOpenAI');
const redisService = require('../services/redis');

const router = express.Router();

// Generate personalized explanation
router.post('/generate-explanation', [
  body('topic').trim().isLength({ min: 1 }),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('learningStyle').optional().isIn(['visual', 'auditory', 'kinesthetic', 'reading'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { topic, difficulty = 'intermediate', learningStyle } = req.body;
  const userStyle = learningStyle || req.user.learningStyle || 'visual';

  // Check cache first
  const cacheKey = `explanation:${topic}:${difficulty}:${userStyle}`;
  const cached = await redisService.get(cacheKey);
  if (cached) {
    return res.json({
      ...cached,
      fromCache: true
    });
  }

  // Generate new explanation
  const explanation = await azureOpenAI.generateExplanation(topic, difficulty, userStyle);
  
  // Cache the result
  await redisService.set(cacheKey, explanation, 3600); // Cache for 1 hour

  // Update user progress
  const progress = await redisService.getUserProgress(req.user.userId);
  progress.xp += 5; // Award XP for learning
  progress.lastActivity = new Date().toISOString();
  
  if (!progress.topicsExplored) {
    progress.topicsExplored = [];
  }
  if (!progress.topicsExplored.includes(topic)) {
    progress.topicsExplored.push(topic);
    progress.xp += 10; // Bonus for new topic
  }

  await redisService.updateUserProgress(req.user.userId, progress);

  res.json(explanation);
}));

// Generate practice questions
router.post('/generate-questions', [
  body('topic').trim().isLength({ min: 1 }),
  body('count').optional().isInt({ min: 1, max: 10 }),
  body('difficulty').optional().isIn(['beginner', 'intermediate', 'advanced'])
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { topic, count = 5, difficulty = 'intermediate' } = req.body;

  // Check cache first
  const cacheKey = `questions:${topic}:${count}:${difficulty}`;
  const cached = await redisService.get(cacheKey);
  if (cached) {
    return res.json({
      ...cached,
      fromCache: true
    });
  }

  // Generate new questions
  const questions = await azureOpenAI.generatePracticeQuestions(topic, count, difficulty);
  
  // Cache the result
  await redisService.set(cacheKey, questions, 1800); // Cache for 30 minutes

  // Update user progress
  const progress = await redisService.getUserProgress(req.user.userId);
  progress.xp += 3; // Award XP for practice
  progress.lastActivity = new Date().toISOString();
  
  if (!progress.practiceTopics) {
    progress.practiceTopics = [];
  }
  if (!progress.practiceTopics.includes(topic)) {
    progress.practiceTopics.push(topic);
  }

  await redisService.updateUserProgress(req.user.userId, progress);

  res.json(questions);
}));

// Generate personalized learning path
router.post('/generate-learning-path', [
  body('subject').trim().isLength({ min: 1 }),
  body('currentLevel').optional().isIn(['beginner', 'intermediate', 'advanced']),
  body('goals').trim().isLength({ min: 5 }),
  body('timeframe').optional().trim().isLength({ min: 1 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { 
    subject, 
    currentLevel = 'intermediate', 
    goals, 
    timeframe = '4 weeks' 
  } = req.body;

  // Check cache first
  const cacheKey = `learningpath:${req.user.userId}:${subject}:${currentLevel}`;
  const cached = await redisService.get(cacheKey);
  if (cached) {
    return res.json({
      ...cached,
      fromCache: true
    });
  }

  // Generate new learning path
  const learningPath = await azureOpenAI.generateLearningPath(
    subject, 
    currentLevel, 
    goals, 
    timeframe
  );
  
  // Cache the result
  await redisService.set(cacheKey, learningPath, 7200); // Cache for 2 hours

  // Update user progress
  const progress = await redisService.getUserProgress(req.user.userId);
  progress.xp += 20; // Award XP for creating learning path
  progress.lastActivity = new Date().toISOString();
  
  if (!progress.learningPaths) {
    progress.learningPaths = [];
  }
  progress.learningPaths.push({
    subject,
    createdAt: new Date().toISOString(),
    status: 'active'
  });

  await redisService.updateUserProgress(req.user.userId, progress);

  res.json(learningPath);
}));

// Submit quiz answers and get feedback
router.post('/submit-quiz', [
  body('topic').trim().isLength({ min: 1 }),
  body('answers').isArray(),
  body('questions').isArray()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { topic, answers, questions } = req.body;

  // Calculate score
  let correct = 0;
  const results = answers.map((answer, index) => {
    const question = questions[index];
    const isCorrect = answer === question.correctAnswer;
    if (isCorrect) correct++;
    
    return {
      questionIndex: index,
      userAnswer: answer,
      correctAnswer: question.correctAnswer,
      isCorrect,
      explanation: question.explanation || 'No explanation available'
    };
  });

  const score = (correct / questions.length) * 100;
  const passed = score >= 70;

  // Update user progress
  const progress = await redisService.getUserProgress(req.user.userId);
  
  // Award XP based on performance
  const baseXP = questions.length * 2;
  const bonusXP = passed ? Math.floor(score / 10) : 0;
  progress.xp += baseXP + bonusXP;
  
  // Update quiz history
  if (!progress.quizHistory) {
    progress.quizHistory = [];
  }
  progress.quizHistory.push({
    topic,
    score,
    questionsCount: questions.length,
    correct,
    completedAt: new Date().toISOString(),
    passed
  });

  // Check for achievements
  const newAchievements = [];
  if (passed && !progress.achievements.includes('first_quiz_passed')) {
    progress.achievements.push('first_quiz_passed');
    newAchievements.push({
      id: 'first_quiz_passed',
      title: 'First Quiz Master',
      description: 'Passed your first quiz with 70% or higher!',
      xpBonus: 50
    });
    progress.xp += 50;
  }

  if (score === 100 && !progress.achievements.includes('perfect_score')) {
    progress.achievements.push('perfect_score');
    newAchievements.push({
      id: 'perfect_score',
      title: 'Perfect Score',
      description: 'Achieved 100% on a quiz!',
      xpBonus: 25
    });
    progress.xp += 25;
  }

  // Update learning streak
  const today = new Date().toDateString();
  const lastActivity = progress.lastQuizDate ? new Date(progress.lastQuizDate).toDateString() : null;
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  
  if (lastActivity === yesterday) {
    progress.learningStreak = (progress.learningStreak || 0) + 1;
  } else if (lastActivity !== today) {
    progress.learningStreak = 1;
  }
  
  progress.lastQuizDate = new Date().toISOString();
  progress.lastActivity = new Date().toISOString();

  await redisService.updateUserProgress(req.user.userId, progress);

  res.json({
    score,
    correct,
    total: questions.length,
    passed,
    results,
    feedback: {
      message: passed 
        ? `Excellent work! You scored ${score}%` 
        : `Good effort! You scored ${score}%. Keep practicing to improve!`,
      xpEarned: baseXP + bonusXP,
      newAchievements,
      currentStreak: progress.learningStreak
    }
  });
}));

// Get AI chat response
router.post('/chat', [
  body('message').trim().isLength({ min: 1 }),
  body('context').optional().isArray()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { message, context = [] } = req.body;

  // For now, provide a helpful response based on common patterns
  let response = '';
  
  if (message.toLowerCase().includes('help') || message.toLowerCase().includes('how')) {
    response = `I'm here to help you learn! I can:
    
    🧠 Explain complex topics in your preferred learning style
    📝 Generate practice questions to test your knowledge
    🎯 Create personalized learning paths based on your goals
    📊 Track your progress and suggest improvements
    
    What would you like to learn about today?`;
  } else if (message.toLowerCase().includes('explain')) {
    response = `I'd be happy to explain that for you! To provide the best explanation, I'll adapt it to your learning style (${req.user.learningStyle}). 
    
    You can also use the "Generate Explanation" feature for more detailed, AI-powered explanations on any topic.`;
  } else if (message.toLowerCase().includes('practice') || message.toLowerCase().includes('quiz')) {
    response = `Great idea! Practice is key to learning. I can generate custom practice questions on any topic you're studying. 
    
    Use the "Generate Questions" feature to get personalized quizzes that match your skill level.`;
  } else {
    response = `That's an interesting question! I'm designed to help you learn more effectively. 
    
    Try asking me to explain a concept, generate practice questions, or create a learning path for a subject you want to master.
    
    I'll adapt everything to your learning style and track your progress along the way!`;
  }

  res.json({
    response,
    timestamp: new Date().toISOString(),
    context: [...context, { role: 'user', message }, { role: 'assistant', message: response }]
  });
}));

module.exports = router;