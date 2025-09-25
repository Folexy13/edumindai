const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const redisService = require('../services/redis');

const router = express.Router();

// Get user profile
router.get('/profile', asyncHandler(async (req, res) => {
  const userProgress = await redisService.getUserProgress(req.user.userId);
  
  const profile = {
    id: req.user.userId,
    name: req.user.name,
    email: req.user.email,
    learningStyle: req.user.learningStyle,
    
    // Stats from progress
    level: Math.floor(Math.sqrt((userProgress.xp || 0) / 100)) + 1,
    xp: userProgress.xp || 0,
    achievements: (userProgress.achievements || []).length,
    coursesCompleted: (userProgress.completedCourses || []).length,
    learningStreak: userProgress.learningStreak || 0,
    
    // Preferences
    preferences: userProgress.preferences || {
      learningStyle: req.user.learningStyle,
      notifications: true,
      accessibility: {
        highContrast: false,
        fontSize: 'medium',
        screenReader: false
      }
    },
    
    // Activity
    joinedAt: userProgress.joinedAt || new Date().toISOString(),
    lastActive: userProgress.lastActivity
  };

  res.json(profile);
}));

// Update user preferences
router.put('/preferences', [
  body('learningStyle').optional().isIn(['visual', 'auditory', 'kinesthetic', 'reading']),
  body('notifications').optional().isBoolean(),
  body('accessibility').optional().isObject(),
  body('accessibility.highContrast').optional().isBoolean(),
  body('accessibility.fontSize').optional().isIn(['small', 'medium', 'large']),
  body('accessibility.screenReader').optional().isBoolean()
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const userProgress = await redisService.getUserProgress(req.user.userId);
  
  // Update preferences
  userProgress.preferences = {
    ...userProgress.preferences,
    ...req.body,
    updatedAt: new Date().toISOString()
  };

  await redisService.updateUserProgress(req.user.userId, userProgress);

  res.json({
    message: 'Preferences updated successfully',
    preferences: userProgress.preferences
  });
}));

// Get learning analytics
router.get('/analytics', asyncHandler(async (req, res) => {
  const userProgress = await redisService.getUserProgress(req.user.userId);
  const { timeframe = '30days' } = req.query;

  // Calculate date range
  const now = new Date();
  let startDate;
  switch (timeframe) {
    case '7days':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30days':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90days':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  // Filter activities within timeframe
  const recentQuizzes = (userProgress.quizHistory || []).filter(quiz => 
    new Date(quiz.completedAt) >= startDate
  );

  // Generate mock daily activity data
  const dailyActivity = [];
  for (let d = new Date(startDate); d <= now; d.setDate(d.getDate() + 1)) {
    const dateStr = d.toDateString();
    const dayQuizzes = recentQuizzes.filter(quiz => 
      new Date(quiz.completedAt).toDateString() === dateStr
    );
    
    dailyActivity.push({
      date: d.toISOString().split('T')[0],
      xpEarned: dayQuizzes.length * 10 + Math.floor(Math.random() * 20),
      quizzesCompleted: dayQuizzes.length,
      timeSpent: dayQuizzes.length * 15 + Math.floor(Math.random() * 60), // minutes
      topicsStudied: Math.min(dayQuizzes.length, Math.floor(Math.random() * 3) + 1)
    });
  }

  // Performance metrics
  const performanceMetrics = {
    averageQuizScore: recentQuizzes.length > 0 
      ? Math.round(recentQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / recentQuizzes.length)
      : 0,
    totalQuizzes: recentQuizzes.length,
    perfectScores: recentQuizzes.filter(quiz => quiz.score === 100).length,
    improvementTrend: recentQuizzes.length > 5 ? 'improving' : 'stable', // Mock trend
    strongestSubjects: ['JavaScript', 'Machine Learning', 'Data Science'], // Mock data
    areasForImprovement: ['Advanced Algorithms', 'System Design'] // Mock data
  };

  // Learning patterns
  const learningPatterns = {
    preferredLearningTime: 'afternoon', // Mock data
    sessionDuration: Math.round(dailyActivity.reduce((sum, day) => sum + day.timeSpent, 0) / dailyActivity.length),
    consistency: userProgress.learningStreak || 0,
    peakPerformanceDays: ['Tuesday', 'Thursday'], // Mock data
    learningStyle: req.user.learningStyle
  };

  // Goals and recommendations
  const recommendations = [
    {
      type: 'streak',
      title: 'Maintain Learning Streak',
      description: 'Keep up your daily learning habit to reach a 30-day streak',
      priority: 'high'
    },
    {
      type: 'weak_area',
      title: 'Focus on System Design',
      description: 'Your quiz scores in System Design are below average. Consider taking focused courses.',
      priority: 'medium'
    },
    {
      type: 'time_optimization',
      title: 'Optimal Study Time',
      description: 'You perform best in the afternoon. Schedule challenging topics during this time.',
      priority: 'low'
    }
  ];

  res.json({
    timeframe,
    summary: {
      totalXP: userProgress.xp || 0,
      xpGained: dailyActivity.reduce((sum, day) => sum + day.xpEarned, 0),
      timeSpent: dailyActivity.reduce((sum, day) => sum + day.timeSpent, 0),
      quizzesCompleted: recentQuizzes.length,
      currentStreak: userProgress.learningStreak || 0
    },
    dailyActivity,
    performanceMetrics,
    learningPatterns,
    recommendations
  });
}));

// Set learning goals
router.post('/goals', [
  body('type').isIn(['xp', 'courses', 'streak', 'quiz_score']),
  body('target').isInt({ min: 1 }),
  body('deadline').isISO8601(),
  body('title').trim().isLength({ min: 3, max: 100 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { type, target, deadline, title, description } = req.body;

  const userProgress = await redisService.getUserProgress(req.user.userId);
  
  if (!userProgress.goals) {
    userProgress.goals = [];
  }

  const newGoal = {
    id: `goal_${Date.now()}`,
    type,
    target,
    current: 0,
    deadline,
    title,
    description: description || '',
    createdAt: new Date().toISOString(),
    status: 'active'
  };

  userProgress.goals.push(newGoal);
  await redisService.updateUserProgress(req.user.userId, userProgress);

  res.status(201).json({
    message: 'Goal created successfully',
    goal: newGoal
  });
}));

// Get learning goals
router.get('/goals', asyncHandler(async (req, res) => {
  const userProgress = await redisService.getUserProgress(req.user.userId);
  const goals = userProgress.goals || [];

  // Update goal progress based on current stats
  const updatedGoals = goals.map(goal => {
    let current = 0;
    
    switch (goal.type) {
      case 'xp':
        current = userProgress.xp || 0;
        break;
      case 'courses':
        current = (userProgress.completedCourses || []).length;
        break;
      case 'streak':
        current = userProgress.learningStreak || 0;
        break;
      case 'quiz_score':
        const recentQuizzes = (userProgress.quizHistory || []).slice(-10);
        current = recentQuizzes.length > 0 
          ? Math.round(recentQuizzes.reduce((sum, quiz) => sum + quiz.score, 0) / recentQuizzes.length)
          : 0;
        break;
    }

    const progress = Math.min(1, current / goal.target);
    const isCompleted = current >= goal.target;
    const isExpired = new Date() > new Date(goal.deadline);

    return {
      ...goal,
      current,
      progress: Math.round(progress * 100),
      status: isCompleted ? 'completed' : isExpired ? 'expired' : 'active'
    };
  });

  res.json({
    goals: updatedGoals,
    summary: {
      active: updatedGoals.filter(g => g.status === 'active').length,
      completed: updatedGoals.filter(g => g.status === 'completed').length,
      expired: updatedGoals.filter(g => g.status === 'expired').length
    }
  });
}));

// Update mood/wellness tracking
router.post('/mood', [
  body('mood').isIn(['great', 'good', 'okay', 'stressed', 'overwhelmed']),
  body('energy').optional().isIn(['high', 'medium', 'low']),
  body('focus').optional().isIn(['excellent', 'good', 'fair', 'poor']),
  body('notes').optional().trim().isLength({ max: 500 })
], asyncHandler(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      error: 'Validation failed',
      details: errors.array()
    });
  }

  const { mood, energy = 'medium', focus = 'good', notes } = req.body;

  const userProgress = await redisService.getUserProgress(req.user.userId);
  
  if (!userProgress.moodTracking) {
    userProgress.moodTracking = [];
  }

  const moodEntry = {
    date: new Date().toISOString(),
    mood,
    energy,
    focus,
    notes: notes || '',
    sessionStart: true
  };

  userProgress.moodTracking.push(moodEntry);
  
  // Keep only last 30 entries
  if (userProgress.moodTracking.length > 30) {
    userProgress.moodTracking = userProgress.moodTracking.slice(-30);
  }

  await redisService.updateUserProgress(req.user.userId, userProgress);

  // Provide wellness recommendations based on mood
  let recommendation = '';
  switch (mood) {
    case 'stressed':
    case 'overwhelmed':
      recommendation = 'Consider taking a 5-minute break before studying. Try some deep breathing exercises.';
      break;
    case 'okay':
      recommendation = 'You might benefit from starting with an easier topic to build confidence.';
      break;
    case 'great':
    case 'good':
      recommendation = 'Great mindset for learning! This is a perfect time to tackle challenging topics.';
      break;
  }

  res.json({
    message: 'Mood logged successfully',
    recommendation,
    entry: moodEntry
  });
}));

// Get wellness insights
router.get('/wellness', asyncHandler(async (req, res) => {
  const userProgress = await redisService.getUserProgress(req.user.userId);
  const moodData = userProgress.moodTracking || [];
  
  if (moodData.length === 0) {
    return res.json({
      insights: [],
      trends: {},
      recommendations: ['Start tracking your mood to get personalized wellness insights']
    });
  }

  // Analyze recent mood trends
  const recentMoods = moodData.slice(-7); // Last 7 entries
  const moodCounts = recentMoods.reduce((counts, entry) => {
    counts[entry.mood] = (counts[entry.mood] || 0) + 1;
    return counts;
  }, {});

  const dominantMood = Object.keys(moodCounts).reduce((a, b) => 
    moodCounts[a] > moodCounts[b] ? a : b
  );

  // Generate insights
  const insights = [
    {
      type: 'mood_trend',
      title: `Your most common mood this week: ${dominantMood}`,
      description: `You've felt ${dominantMood} in ${Math.round((moodCounts[dominantMood] / recentMoods.length) * 100)}% of your recent sessions.`
    }
  ];

  // Wellness recommendations
  const recommendations = [];
  if (moodCounts.stressed || moodCounts.overwhelmed) {
    recommendations.push('Consider scheduling regular breaks during study sessions');
    recommendations.push('Try meditation or mindfulness exercises before studying');
  }
  
  if (dominantMood === 'great' || dominantMood === 'good') {
    recommendations.push('Your positive mood is great for learning! Keep up the good habits');
  }

  res.json({
    insights,
    trends: {
      dominantMood,
      moodDistribution: moodCounts,
      totalEntries: moodData.length
    },
    recommendations,
    recentEntries: recentMoods.slice(-3)
  });
}));

module.exports = router;