const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { authenticateToken } = require('../middleware/auth');
const prisma = require('../services/prisma');

const router = express.Router();

// Get all courses
router.get('/courses', asyncHandler(async (req, res) => {
  try {
    const { category, level, search } = req.query;
    
    const where = {
      isPublished: true,
      ...(category && { category }),
      ...(level && { level }),
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { description: { contains: search, mode: 'insensitive' } },
          { tags: { has: search } }
        ]
      })
    };

    const courses = await prisma.course.findMany({
      where,
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        },
        lessons: {
          select: {
            id: true,
            title: true,
            duration: true
          },
          orderBy: { order: 'asc' }
        },
        _count: {
          select: {
            enrollments: true,
            lessons: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const coursesWithStats = courses.map(course => ({
      ...course,
      totalDuration: course.lessons.reduce((sum, lesson) => sum + lesson.duration, 0),
      enrollmentCount: course._count.enrollments,
      lessonCount: course._count.lessons
    }));

    res.json({
      courses: coursesWithStats
    });

  } catch (error) {
    console.error('Courses fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch courses'
    });
  }
}));

// Get course details
router.get('/courses/:courseId', asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        creator: {
          select: {
            firstName: true,
            lastName: true,
            username: true
          }
        },
        lessons: {
          orderBy: { order: 'asc' }
        },
        assessments: {
          select: {
            id: true,
            title: true,
            description: true,
            type: true,
            passingScore: true,
            timeLimit: true
          }
        },
        _count: {
          select: {
            enrollments: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    res.json({
      course: {
        ...course,
        enrollmentCount: course._count.enrollments
      }
    });

  } catch (error) {
    console.error('Course fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch course'
    });
  }
}));

// Enroll in a course
router.post('/courses/:courseId/enroll', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { courseId } = req.params;
    const userId = req.user.userId;

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId }
    });

    if (!course) {
      return res.status(404).json({
        error: 'Course not found'
      });
    }

    // Check if already enrolled
    const existingEnrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId
        }
      }
    });

    if (existingEnrollment) {
      return res.status(409).json({
        error: 'Already enrolled',
        message: 'You are already enrolled in this course'
      });
    }

    // Create enrollment
    const enrollment = await prisma.courseEnrollment.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE'
      },
      include: {
        course: {
          select: {
            title: true,
            description: true,
            thumbnail: true
          }
        }
      }
    });

    // Create achievement for enrollment
    await prisma.achievement.create({
      data: {
        type: 'ENGAGEMENT',
        title: 'Course Enrolled',
        description: `Enrolled in ${course.title}`,
        points: 10,
        userId,
        metadata: {
          courseId,
          courseName: course.title
        }
      }
    });

    res.status(201).json({
      message: 'Successfully enrolled in course',
      enrollment
    });

  } catch (error) {
    console.error('Enrollment error:', error);
    res.status(500).json({
      error: 'Failed to enroll in course'
    });
  }
}));

// Get user's enrolled courses
router.get('/my-courses', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;

    const enrollments = await prisma.courseEnrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            lessons: {
              select: {
                id: true,
                title: true,
                duration: true
              }
            },
            _count: {
              select: { lessons: true }
            }
          }
        }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    // Get lesson progress for each course
    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const completedLessons = await prisma.lessonProgress.count({
          where: {
            userId,
            lesson: {
              courseId: enrollment.courseId
            },
            completed: true
          }
        });

        const totalLessons = enrollment.course._count.lessons;
        const progress = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
          ...enrollment,
          course: {
            ...enrollment.course,
            completedLessons,
            progress: Math.round(progress)
          }
        };
      })
    );

    res.json({
      enrollments: coursesWithProgress
    });

  } catch (error) {
    console.error('My courses error:', error);
    res.status(500).json({
      error: 'Failed to fetch enrolled courses'
    });
  }
}));

// Get lesson content
router.get('/lessons/:lessonId', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.userId;

    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found'
      });
    }

    // Check if user is enrolled in the course
    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be enrolled in the course to access this lesson'
      });
    }

    // Get user's progress for this lesson
    const progress = await prisma.lessonProgress.findUnique({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      }
    });

    res.json({
      lesson: {
        ...lesson,
        userProgress: progress
      }
    });

  } catch (error) {
    console.error('Lesson fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch lesson'
    });
  }
}));

// Mark lesson as completed
router.post('/lessons/:lessonId/complete', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user.userId;
    const { timeSpent } = req.body;

    // Check if lesson exists and user is enrolled
    const lesson = await prisma.lesson.findUnique({
      where: { id: lessonId },
      include: {
        course: {
          select: {
            id: true,
            title: true
          }
        }
      }
    });

    if (!lesson) {
      return res.status(404).json({
        error: 'Lesson not found'
      });
    }

    const enrollment = await prisma.courseEnrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId
        }
      }
    });

    if (!enrollment) {
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be enrolled in the course to complete this lesson'
      });
    }

    // Create or update lesson progress
    const progress = await prisma.lessonProgress.upsert({
      where: {
        userId_lessonId: {
          userId,
          lessonId
        }
      },
      update: {
        completed: true,
        timeSpent: (timeSpent || 0),
        completedAt: new Date()
      },
      create: {
        userId,
        lessonId,
        completed: true,
        timeSpent: (timeSpent || 0),
        completedAt: new Date()
      }
    });

    // Check if this is the first lesson completion
    const completedLessonsCount = await prisma.lessonProgress.count({
      where: {
        userId,
        completed: true
      }
    });

    if (completedLessonsCount === 1) {
      // Create first lesson achievement
      await prisma.achievement.create({
        data: {
          type: 'LESSON_STREAK',
          title: 'First Lesson Complete!',
          description: 'Completed your first lesson',
          points: 15,
          userId,
          metadata: {
            lessonId,
            lessonTitle: lesson.title
          }
        }
      });

      // Update user points
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: 15
          }
        }
      });
    }

    // Update course progress
    const totalLessons = await prisma.lesson.count({
      where: { courseId: lesson.courseId }
    });

    const completedCourseLessons = await prisma.lessonProgress.count({
      where: {
        userId,
        lesson: {
          courseId: lesson.courseId
        },
        completed: true
      }
    });

    const courseProgress = totalLessons > 0 ? (completedCourseLessons / totalLessons) * 100 : 0;

    await prisma.courseEnrollment.update({
      where: {
        userId_courseId: {
          userId,
          courseId: lesson.courseId
        }
      },
      data: {
        progress: courseProgress,
        ...(courseProgress === 100 && {
          status: 'COMPLETED',
          completedAt: new Date()
        })
      }
    });

    // If course is completed, create achievement
    if (courseProgress === 100) {
      await prisma.achievement.create({
        data: {
          type: 'COURSE_COMPLETION',
          title: 'Course Completed!',
          description: `Completed ${lesson.course.title}`,
          points: 100,
          userId,
          metadata: {
            courseId: lesson.courseId,
            courseName: lesson.course.title
          }
        }
      });

      // Update user points and level
      await prisma.user.update({
        where: { id: userId },
        data: {
          points: {
            increment: 100
          }
        }
      });
    }

    res.json({
      message: 'Lesson marked as completed',
      progress,
      courseProgress: Math.round(courseProgress)
    });

  } catch (error) {
    console.error('Lesson completion error:', error);
    res.status(500).json({
      error: 'Failed to mark lesson as completed'
    });
  }
}));

// Get user's learning progress
router.get('/progress', authenticateToken, asyncHandler(async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get overall stats
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        points: true,
        level: true,
        createdAt: true
      }
    });

    const totalEnrollments = await prisma.courseEnrollment.count({
      where: { userId }
    });

    const completedCourses = await prisma.courseEnrollment.count({
      where: {
        userId,
        status: 'COMPLETED'
      }
    });

    const totalLessonsCompleted = await prisma.lessonProgress.count({
      where: {
        userId,
        completed: true
      }
    });

    const recentAchievements = await prisma.achievement.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    // Get recent activity (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const recentLessons = await prisma.lessonProgress.findMany({
      where: {
        userId,
        completed: true,
        completedAt: {
          gte: thirtyDaysAgo
        }
      },
      include: {
        lesson: {
          select: {
            title: true,
            course: {
              select: {
                title: true
              }
            }
          }
        }
      },
      orderBy: { completedAt: 'desc' },
      take: 20
    });

    res.json({
      progress: {
        user,
        stats: {
          totalEnrollments,
          completedCourses,
          totalLessonsCompleted,
          completionRate: totalEnrollments > 0 ? Math.round((completedCourses / totalEnrollments) * 100) : 0
        },
        recentAchievements,
        recentActivity: recentLessons
      }
    });

  } catch (error) {
    console.error('Progress fetch error:', error);
    res.status(500).json({
      error: 'Failed to fetch learning progress'
    });
  }
}));

module.exports = router;