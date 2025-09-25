const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const redisService = require('../services/redis');

const router = express.Router();

// Achievement definitions
const ACHIEVEMENTS = {
  welcome: {
    id: 'welcome',
    title: '🎉 Welcome Aboard!',
    description: 'Joined EduMind AI and started your learning journey',
    xp: 0,
    rarity: 'common'
  },
  first_course: {
    id: 'first_course',
    title: '📚 First Steps',
    description: 'Enrolled in your first course',
    xp: 25,
    rarity: 'common'
  },
  course_completed: {
    id: 'course_completed',
    title: '🎓 Course Master',
    description: 'Completed your first course',
    xp: 100,
    rarity: 'uncommon'
  },
  first_quiz_passed: {
    id: 'first_quiz_passed',
    title: '🧠 Quiz Champion',
    description: 'Passed your first quiz with 70% or higher',
    xp: 50,
    rarity: 'common'
  },
  perfect_score: {
    id: 'perfect_score',
    title: '⭐ Perfect Score',
    description: 'Achieved 100% on a quiz',
    xp: 25,
    rarity: 'rare'
  },
  learning_streak_7: {
    id: 'learning_streak_7',
    title: '🔥 Week Warrior',
    description: 'Maintained a 7-day learning streak',
    xp: 75,
    rarity: 'uncommon'
  },
  learning_streak_30: {
    id: 'learning_streak_30',
    title: '💎 Consistent Learner',
    description: 'Maintained a 30-day learning streak',
    xp: 200,
    rarity: 'epic'
  },
  level_up_5: {
    id: 'level_up_5',
    title: '🚀 Rising Star',
    description: 'Reached level 5',
    xp: 0,
    rarity: 'uncommon'
  },
  level_up_10: {
    id: 'level_up_10',
    title: '👑 Expert Learner',
    description: 'Reached level 10',
    xp: 0,
    rarity: 'rare'
  },
  knowledge_seeker: {
    id: 'knowledge_seeker',
    title: '🔍 Knowledge Seeker',
    description: 'Generated 50 AI explanations',
    xp: 100,
    rarity: 'uncommon'
  },
  quiz_master: {
    id: 'quiz_master',
    title: '🎯 Quiz Master',
    description: 'Completed 25 practice quizzes',
    xp: 150,
    rarity: 'rare'
  },
  topic_explorer: {
    id: 'topic_explorer',
    title: '🌍 Topic Explorer',
    description: 'Explored 20 different topics',
    xp: 125,
    rarity: 'uncommon'
  },
  early_bird: {
    id: 'early_bird',
    title: '🌅 Early Bird',
    description: 'Completed learning activities before 9 AM',
    xp: 25,
    rarity: 'common'
  },
  night_owl: {
    id: 'night_owl',
    title: '🦉 Night Owl',
    description: 'Completed learning activities after 10 PM',
    xp: 25,
    rarity: 'common'
  }
};

// Level calculation
const calculateLevel = (xp) => {
  // Level formula: Level = floor(sqrt(XP / 100)) + 1
  // Level 1: 0-99 XP, Level 2: 100-399 XP, Level 3: 400-899 XP, etc.
  return Math.floor(Math.sqrt(xp / 100)) + 1;
};

const getXPForNextLevel = (currentLevel) => {
  return Math.pow(currentLevel, 2) * 100;
};

// Get user achievements
router.get('/achievements', asyncHandler(async (req, res) => {
  const userProgress = await redisService.getUserProgress(req.user.userId);
  const userAchievements = userProgress.achievements || [];

  const achievementsWithDetails = userAchievements.map(achievementId => ({
    ...ACHIEVEMENTS[achievementId],
    earnedAt: new Date().toISOString() // In real app, store when earned
  }));

  const availableAchievements = Object.values(ACHIEVEMENTS).filter(
    achievement => !userAchievements.includes(achievement.id)
  );

  res.json({
    earned: achievementsWithDetails,
    available: availableAchievements.slice(0, 10), // Show next 10 available
    totalEarned: achievementsWithDetails.length,
    totalAvailable: Object.keys(ACHIEVEMENTS).length
  });
}));

// Get leaderboard
router.get('/leaderboard', asyncHandler(async (req, res) => {
  const { timeframe = 'all', limit = 10 } = req.query;
  
  // Mock leaderboard data (in real app, aggregate from all users)
  const currentUserProgress = await redisService.getUserProgress(req.user.userId);
  const currentUserLevel = calculateLevel(currentUserProgress.xp || 0);
  
  const mockLeaderboard = [
    { 
      id: req.user.userId, 
      name: req.user.name, 
      xp: currentUserProgress.xp || 0, 
      level: currentUserLevel,
      avatar: '/api/placeholder/avatar-1.jpg',
      achievements: (currentUserProgress.achievements || []).length,
      streak: currentUserProgress.learningStreak || 0
    },
    { 
      id: 'user_2', 
      name: 'Alex Chen', 
      xp: Math.max(1250, (currentUserProgress.xp || 0) + 100), 
      level: calculateLevel(Math.max(1250, (currentUserProgress.xp || 0) + 100)),
      avatar: '/api/placeholder/avatar-2.jpg',
      achievements: 12,
      streak: 15
    },
    { 
      id: 'user_3', 
      name: 'Sarah Johnson', 
      xp: Math.max(1180, (currentUserProgress.xp || 0) + 50), 
      level: calculateLevel(Math.max(1180, (currentUserProgress.xp || 0) + 50)),
      avatar: '/api/placeholder/avatar-3.jpg',
      achievements: 10,
      streak: 8
    },
    { 
      id: 'user_4', 
      name: 'Mike Rodriguez', 
      xp: Math.max(1050, (currentUserProgress.xp || 0) + 25), 
      level: calculateLevel(Math.max(1050, (currentUserProgress.xp || 0) + 25)),
      avatar: '/api/placeholder/avatar-4.jpg',
      achievements: 9,
      streak: 12
    },
    { 
      id: 'user_5', 
      name: 'Emily Davis', 
      xp: Math.max(890, (currentUserProgress.xp || 0) - 50), 
      level: calculateLevel(Math.max(890, (currentUserProgress.xp || 0) - 50)),
      avatar: '/api/placeholder/avatar-5.jpg',
      achievements: 7,
      streak: 5
    }
  ];

  // Sort by XP and add ranks
  const sortedLeaderboard = mockLeaderboard
    .sort((a, b) => b.xp - a.xp)
    .slice(0, parseInt(limit))
    .map((user, index) => ({
      ...user,
      rank: index + 1,
      isCurrentUser: user.id === req.user.userId
    }));

  // Find current user's position if not in top results
  const currentUserRank = sortedLeaderboard.findIndex(user => user.id === req.user.userId) + 1;

  res.json({
    leaderboard: sortedLeaderboard,
    currentUserRank: currentUserRank || 'Not ranked',
    timeframe,
    totalUsers: mockLeaderboard.length
  });
}));

// Get user progress and stats
router.get('/progress', asyncHandler(async (req, res) => {
  const userProgress = await redisService.getUserProgress(req.user.userId);
  
  const currentLevel = calculateLevel(userProgress.xp || 0);
  const nextLevel = currentLevel + 1;
  const currentLevelXP = Math.pow(currentLevel - 1, 2) * 100;
  const nextLevelXP = getXPForNextLevel(currentLevel);
  const progressToNext = ((userProgress.xp || 0) - currentLevelXP) / (nextLevelXP - currentLevelXP);

  // Calculate various stats
  const stats = {
    level: currentLevel,
    xp: userProgress.xp || 0,
    xpToNextLevel: nextLevelXP - (userProgress.xp || 0),
    progressToNextLevel: Math.max(0, Math.min(1, progressToNext)),
    
    // Learning stats
    coursesCompleted: (userProgress.completedCourses || []).length,
    coursesEnrolled: (userProgress.enrolledCourses || []).length,
    achievementsUnlocked: (userProgress.achievements || []).length,
    learningStreak: userProgress.learningStreak || 0,
    
    // Activity stats
    topicsExplored: (userProgress.topicsExplored || []).length,
    quizzesCompleted: (userProgress.quizHistory || []).length,
    totalStudyTime: Math.floor((userProgress.xp || 0) / 2), // Estimate study time in minutes
    averageQuizScore: userProgress.quizHistory && userProgress.quizHistory.length > 0 
      ? Math.round(userProgress.quizHistory.reduce((sum, quiz) => sum + quiz.score, 0) / userProgress.quizHistory.length)
      : 0,
    
    // Streaks and patterns
    bestStreak: Math.max(userProgress.learningStreak || 0, userProgress.bestStreak || 0),
    lastActive: userProgress.lastActivity,
    
    // Recent activity
    recentAchievements: (userProgress.achievements || []).slice(-3).map(id => ACHIEVEMENTS[id]).filter(Boolean),
    recentQuizzes: (userProgress.quizHistory || []).slice(-5)
  };

  // Check for new achievements based on current stats
  const newAchievements = [];
  
  if (stats.level >= 5 && !userProgress.achievements?.includes('level_up_5')) {
    newAchievements.push('level_up_5');
  }
  
  if (stats.level >= 10 && !userProgress.achievements?.includes('level_up_10')) {
    newAchievements.push('level_up_10');
  }
  
  if (stats.learningStreak >= 7 && !userProgress.achievements?.includes('learning_streak_7')) {
    newAchievements.push('learning_streak_7');
  }
  
  if (stats.learningStreak >= 30 && !userProgress.achievements?.includes('learning_streak_30')) {
    newAchievements.push('learning_streak_30');
  }

  // Award new achievements if any
  if (newAchievements.length > 0) {
    userProgress.achievements = [...(userProgress.achievements || []), ...newAchievements];
    
    // Award XP for achievements
    const achievementXP = newAchievements.reduce((total, achievementId) => {
      return total + (ACHIEVEMENTS[achievementId]?.xp || 0);
    }, 0);
    
    userProgress.xp = (userProgress.xp || 0) + achievementXP;
    await redisService.updateUserProgress(req.user.userId, userProgress);
    
    // Recalculate stats with new XP
    stats.xp = userProgress.xp;
    stats.level = calculateLevel(userProgress.xp);
    stats.newAchievements = newAchievements.map(id => ACHIEVEMENTS[id]);
  }

  res.json(stats);
}));

// Award manual XP (for testing/admin)
router.post('/award-xp', asyncHandler(async (req, res) => {
  const { amount, reason } = req.body;
  
  if (!amount || amount <= 0) {
    return res.status(400).json({
      error: 'Invalid XP amount'
    });
  }

  const userProgress = await redisService.getUserProgress(req.user.userId);
  const oldLevel = calculateLevel(userProgress.xp || 0);
  
  userProgress.xp = (userProgress.xp || 0) + amount;
  userProgress.lastActivity = new Date().toISOString();
  
  const newLevel = calculateLevel(userProgress.xp);
  const leveledUp = newLevel > oldLevel;

  await redisService.updateUserProgress(req.user.userId, userProgress);

  res.json({
    message: 'XP awarded successfully',
    xpAwarded: amount,
    reason: reason || 'Manual XP award',
    newXP: userProgress.xp,
    newLevel,
    leveledUp
  });
}));

// Get daily/weekly challenges
router.get('/challenges', asyncHandler(async (req, res) => {
  const userProgress = await redisService.getUserProgress(req.user.userId);
  const today = new Date().toDateString();
  
  // Mock daily challenges
  const dailyChallenges = [
    {
      id: 'daily_quiz',
      title: '📝 Daily Quiz Challenge',
      description: 'Complete 3 practice quizzes',
      target: 3,
      progress: Math.min(3, (userProgress.quizHistory || []).filter(q => 
        new Date(q.completedAt).toDateString() === today
      ).length),
      xpReward: 50,
      type: 'daily',
      expiresAt: new Date(Date.now() + 86400000).toISOString() // 24 hours
    },
    {
      id: 'daily_learning',
      title: '🧠 Knowledge Seeker',
      description: 'Generate 5 AI explanations',
      target: 5,
      progress: Math.min(5, (userProgress.topicsExplored || []).length % 5),
      xpReward: 30,
      type: 'daily',
      expiresAt: new Date(Date.now() + 86400000).toISOString()
    }
  ];

  const weeklyChallenges = [
    {
      id: 'weekly_streak',
      title: '🔥 Streak Master',
      description: 'Maintain a 7-day learning streak',
      target: 7,
      progress: Math.min(7, userProgress.learningStreak || 0),
      xpReward: 150,
      type: 'weekly',
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
    },
    {
      id: 'weekly_courses',
      title: '📚 Course Explorer',
      description: 'Enroll in 2 new courses',
      target: 2,
      progress: Math.min(2, (userProgress.enrolledCourses || []).length),
      xpReward: 100,
      type: 'weekly',
      expiresAt: new Date(Date.now() + 7 * 86400000).toISOString()
    }
  ];

  res.json({
    daily: dailyChallenges,
    weekly: weeklyChallenges,
    refreshTime: {
      daily: new Date(Date.now() + 86400000).toISOString(),
      weekly: new Date(Date.now() + 7 * 86400000).toISOString()
    }
  });
}));

module.exports = router;