const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const azureOpenAI = require('../services/azureOpenAI');
const redisService = require('../services/redis');

const router = express.Router();

// AI service status endpoint
router.get('/status', asyncHandler(async (req, res) => {
  const isRealAI = !azureOpenAI.useMock;
  
  res.json({
    aiEnabled: isRealAI,
    service: isRealAI ? 'Azure OpenAI' : 'Enhanced Mock AI',
    message: isRealAI 
      ? 'Real AI service is active and ready!'
      : 'Using intelligent mock responses. Configure Azure OpenAI for real AI functionality.',
    features: {
      explanations: true,
      practiceQuestions: true,
      chat: true,
      learningPaths: true
    }
  });
}));

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

  // Enhanced AI chat response with better contextual understanding
  let response = generateIntelligentResponse(message, req.user.learningStyle, context);

  res.json({
    response,
    timestamp: new Date().toISOString(),
    context: [...context, { role: 'user', message }, { role: 'assistant', message: response }]
  });
}));

function generateIntelligentResponse(message, learningStyle = 'visual', context = []) {
  const lowerMessage = message.toLowerCase();
  
  // Subject detection
  const subjects = {
    math: ['math', 'algebra', 'geometry', 'calculus', 'equation', 'fraction', 'number', 'solve', 'calculate'],
    science: ['science', 'biology', 'chemistry', 'physics', 'photosynthesis', 'gravity', 'molecule', 'atom'],
    programming: ['programming', 'code', 'javascript', 'python', 'html', 'css', 'function', 'variable'],
    language: ['english', 'grammar', 'writing', 'essay', 'literature', 'reading', 'vocabulary']
  };
  
  let detectedSubject = null;
  for (const [subject, keywords] of Object.entries(subjects)) {
    if (keywords.some(keyword => lowerMessage.includes(keyword))) {
      detectedSubject = subject;
      break;
    }
  }

  // Intent detection
  if (lowerMessage.includes('help') || lowerMessage.includes('how')) {
    return generateHelpResponse(detectedSubject, learningStyle);
  }
  
  if (lowerMessage.includes('explain') || lowerMessage.includes('what is') || lowerMessage.includes('tell me about')) {
    return generateExplanationResponse(message, detectedSubject, learningStyle);
  }
  
  if (lowerMessage.includes('practice') || lowerMessage.includes('quiz') || lowerMessage.includes('test') || lowerMessage.includes('questions')) {
    return generatePracticeResponse(detectedSubject, learningStyle);
  }
  
  if (lowerMessage.includes('study') || lowerMessage.includes('learn')) {
    return generateStudyResponse(detectedSubject, learningStyle);
  }
  
  if (lowerMessage.includes('homework') || lowerMessage.includes('assignment')) {
    return generateHomeworkResponse(detectedSubject, learningStyle);
  }

  // Greeting responses
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
    return `Hello! I'm your AI tutor, ready to help you learn. As a ${learningStyle} learner, I'll tailor my explanations to your learning style. What would you like to explore today?`;
  }

  // Default contextual response
  return generateContextualResponse(message, detectedSubject, learningStyle, context);
}

function generateHelpResponse(subject, learningStyle) {
  const baseHelp = `I'm here to help you learn effectively! Here's what I can do:

🧠 **Explain Concepts**: Get detailed explanations adapted to your ${learningStyle} learning style
📝 **Practice Questions**: Generate quizzes and practice problems
🎯 **Study Strategies**: Personalized learning approaches
📚 **Homework Help**: Step-by-step problem solving guidance`;

  if (subject) {
    return `${baseHelp}

Since you mentioned ${subject}, I can specifically help you with:
• Core ${subject} concepts and principles
• Problem-solving strategies for ${subject}
• Practice questions and assessments
• Study techniques tailored for ${subject}

What specific ${subject} topic would you like to explore?`;
  }

  return `${baseHelp}

What subject or topic would you like help with today?`;
}

function generateExplanationResponse(message, subject, learningStyle) {
  const styleAdvice = {
    visual: "with diagrams, visual examples, and step-by-step breakdowns",
    auditory: "through verbal explanations, discussions, and logical reasoning",
    kinesthetic: "using hands-on examples, real-world applications, and interactive approaches",
    reading: "with detailed written explanations, structured information, and comprehensive analysis"
  };

  if (subject) {
    return `I'd be happy to explain that ${subject} concept for you! As a ${learningStyle} learner, I'll explain it ${styleAdvice[learningStyle]}.

To give you the best explanation, could you be more specific about what aspect you'd like me to explain? For example:
• The basic definition and key principles
• How it works step-by-step
• Real-world applications and examples
• How it connects to other concepts you've learned

You can also use the "Explain" feature in the AI Tutor for more detailed explanations!`;
  }

  return `I'd love to explain that for you! As a ${learningStyle} learner, I'll make sure to present the information ${styleAdvice[learningStyle]}.

Please let me know the specific topic or concept you'd like me to explain, and I'll provide a clear, engaging explanation tailored to your learning style.`;
}

function generatePracticeResponse(subject, learningStyle) {
  if (subject) {
    return `Excellent! Practice is crucial for mastering ${subject}. I can create practice questions that match your ${learningStyle} learning style.

For ${subject} practice, I can generate:
• Multiple choice questions to test understanding
• Step-by-step problem solving exercises
• Real-world application scenarios
• Concept review questions

Use the "Practice" feature to generate custom ${subject} questions, or tell me specifically what ${subject} topics you want to practice!`;
  }

  return `Great thinking! Practice is key to learning success. As a ${learningStyle} learner, I'll create practice questions that suit your learning style.

What subject or topic would you like to practice? I can generate:
• Custom quizzes and assessments
• Problem-solving exercises
• Review questions for concepts you've learned
• Challenge problems to extend your understanding

Just let me know the topic and I'll create engaging practice questions for you!`;
}

function generateStudyResponse(subject, learningStyle) {
  const studyTips = {
    visual: "Create mind maps, diagrams, and visual summaries. Use colors and charts to organize information.",
    auditory: "Read aloud, discuss concepts with others, and use rhythm or music to remember information.",
    kinesthetic: "Take breaks for movement, use hands-on activities, and study in different locations.",
    reading: "Take detailed notes, create outlines, and rewrite concepts in your own words."
  };

  if (subject) {
    return `Here are some effective study strategies for ${subject}, tailored to your ${learningStyle} learning style:

**${learningStyle.charAt(0).toUpperCase() + learningStyle.slice(1)} Learning Tips for ${subject.charAt(0).toUpperCase() + subject.slice(1)}:**
${studyTips[learningStyle]}

**General ${subject} Study Approach:**
1. Start with core concepts and build understanding gradually
2. Practice regularly with different types of problems
3. Connect new information to what you already know
4. Test your understanding with practice questions

Would you like me to create a specific study plan or practice questions for ${subject}?`;
  }

  return `I'd love to help you develop effective study strategies! As a ${learningStyle} learner, here's what works best for you:

**Your Learning Style (${learningStyle.charAt(0).toUpperCase() + learningStyle.slice(1)}) Study Tips:**
${studyTips[learningStyle]}

What subject are you studying? I can provide more specific study strategies and even create a personalized learning path for you!`;
}

function generateHomeworkResponse(subject, learningStyle) {
  if (subject) {
    return `I'm here to help you with your ${subject} homework! As a ${learningStyle} learner, I'll guide you through problems step-by-step without just giving you the answers.

Here's how I can help:
• Break down complex problems into manageable steps
• Explain concepts you're struggling with
• Provide similar practice problems
• Help you check your understanding

What specific ${subject} homework problem or concept are you working on? Share the problem and I'll help you work through it!`;
  }

  return `I'm ready to help with your homework! I'll guide you through problems step-by-step and help you understand the concepts, rather than just giving you answers.

What subject is your homework in? Once you tell me:
• Share the specific problem or topic you're working on
• I'll help break it down into manageable steps
• We'll work through it together so you truly understand
• I'll provide additional practice if needed

Remember, the goal is learning and understanding, not just getting the right answer!`;
}

function generateContextualResponse(message, subject, learningStyle, context) {
  const recentContext = context.slice(-2); // Last 2 exchanges for context
  
  let response = `I understand you're asking about "${message}". `;
  
  if (subject) {
    response += `This seems related to ${subject}. `;
  }
  
  response += `As a ${learningStyle} learner, I want to make sure I explain this in the most effective way for you.

Could you help me understand exactly what you'd like to know? For example:
• Are you looking for an explanation of a concept?
• Do you need help solving a specific problem?
• Would you like practice questions on this topic?
• Are you looking for study strategies?

The more specific you can be, the better I can tailor my help to your learning needs!`;

  return response;
}

module.exports = router;