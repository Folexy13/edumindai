const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Hash password for demo users
  const hashedPassword = await bcrypt.hash('password123', 10);

  // Create demo users
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@edumind.ai' },
    update: {},
    create: {
      email: 'admin@edumind.ai',
      username: 'admin',
      firstName: 'Admin',
      lastName: 'User',
      password: hashedPassword,
      role: 'ADMIN',
      bio: 'Platform administrator',
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: 'teacher@edumind.ai' },
    update: {},
    create: {
      email: 'teacher@edumind.ai',
      username: 'teacher_sarah',
      firstName: 'Sarah',
      lastName: 'Johnson',
      password: hashedPassword,
      role: 'TEACHER',
      bio: 'Mathematics and Computer Science educator',
      school: 'Tech High School',
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: 'student@edumind.ai' },
    update: {},
    create: {
      email: 'student@edumind.ai',
      username: 'student_alex',
      firstName: 'Alex',
      lastName: 'Smith',
      password: hashedPassword,
      role: 'STUDENT',
      grade: '10th Grade',
      school: 'Tech High School',
      learningStyle: 'visual',
      points: 150,
      level: 2,
    },
  });

  console.log('👥 Demo users created');

  // Create sample courses
  const mathCourse = await prisma.course.create({
    data: {
      title: 'Algebra Fundamentals',
      description: 'Master the basics of algebra with interactive lessons and AI-powered assistance',
      category: 'Mathematics',
      level: 'beginner',
      tags: ['algebra', 'math', 'equations'],
      estimatedHours: 20,
      creatorId: teacherUser.id,
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'Introduction to Variables',
            content: 'Learn what variables are and how to use them in mathematical expressions.',
            type: 'TEXT',
            order: 1,
            duration: 30,
          },
          {
            title: 'Solving Linear Equations',
            content: 'Step-by-step guide to solving linear equations with one variable.',
            type: 'INTERACTIVE',
            order: 2,
            duration: 45,
          },
          {
            title: 'Graphing Linear Functions',
            content: 'Understand how to graph linear functions and interpret their meaning.',
            type: 'VIDEO',
            videoUrl: 'https://example.com/video1',
            order: 3,
            duration: 35,
          },
        ],
      },
      assessments: {
        create: [
          {
            title: 'Algebra Basics Quiz',
            description: 'Test your understanding of basic algebra concepts',
            type: 'QUIZ',
            questions: {
              questions: [
                {
                  id: 1,
                  question: "What is the value of x in the equation 2x + 5 = 15?",
                  type: "multiple_choice",
                  options: ["3", "5", "7", "10"],
                  correct: 1
                },
                {
                  id: 2,
                  question: "Which of the following is a linear equation?",
                  type: "multiple_choice",
                  options: ["y = x²", "y = 2x + 3", "y = x³ - 1", "y = 1/x"],
                  correct: 1
                }
              ]
            },
            passingScore: 70,
            timeLimit: 15,
          },
        ],
      },
    },
  });

  const scienceCourse = await prisma.course.create({
    data: {
      title: 'Introduction to Physics',
      description: 'Explore the fundamental concepts of physics through interactive experiments',
      category: 'Science',
      level: 'intermediate',
      tags: ['physics', 'science', 'mechanics'],
      estimatedHours: 25,
      creatorId: teacherUser.id,
      isPublished: true,
      lessons: {
        create: [
          {
            title: 'Newton\'s Laws of Motion',
            content: 'Understand the three fundamental laws that govern motion.',
            type: 'TEXT',
            order: 1,
            duration: 40,
          },
          {
            title: 'Force and Acceleration',
            content: 'Learn about the relationship between force, mass, and acceleration.',
            type: 'INTERACTIVE',
            order: 2,
            duration: 50,
          },
        ],
      },
    },
  });

  console.log('📚 Sample courses created');

  // Enroll student in courses
  await prisma.courseEnrollment.create({
    data: {
      userId: studentUser.id,
      courseId: mathCourse.id,
      progress: 25,
      status: 'ACTIVE',
    },
  });

  await prisma.courseEnrollment.create({
    data: {
      userId: studentUser.id,
      courseId: scienceCourse.id,
      progress: 10,
      status: 'ACTIVE',
    },
  });

  console.log('📝 Course enrollments created');

  // Create sample badges
  const badges = await prisma.badge.createMany({
    data: [
      {
        name: 'First Steps',
        description: 'Complete your first lesson',
        icon: '🎯',
        category: 'LEARNING',
        condition: { type: 'lesson_completion', count: 1 },
      },
      {
        name: 'Math Whiz',
        description: 'Score 100% on a math assessment',
        icon: '🧮',
        category: 'ACHIEVEMENT',
        condition: { type: 'perfect_score', subject: 'math' },
      },
      {
        name: 'Streak Master',
        description: 'Study for 7 consecutive days',
        icon: '🔥',
        category: 'STREAK',
        condition: { type: 'study_streak', days: 7 },
      },
    ],
  });

  console.log('🏆 Badges created');

  // Create sample achievements for student
  await prisma.achievement.createMany({
    data: [
      {
        type: 'LESSON_STREAK',
        title: 'Getting Started',
        description: 'Completed first lesson',
        points: 10,
        userId: studentUser.id,
      },
      {
        type: 'ENGAGEMENT',
        title: 'AI Helper',
        description: 'Used AI tutor for the first time',
        points: 15,
        userId: studentUser.id,
      },
    ],
  });

  console.log('🎉 Achievements created');

  // Create sample mood entries
  await prisma.moodEntry.createMany({
    data: [
      {
        userId: studentUser.id,
        mood: 4,
        energy: 3,
        stress: 2,
        notes: 'Feeling good about the algebra lesson',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
      },
      {
        userId: studentUser.id,
        mood: 5,
        energy: 4,
        stress: 1,
        notes: 'Great day of learning!',
        createdAt: new Date(),
      },
    ],
  });

  console.log('😊 Mood entries created');

  // Create sample AI conversation
  await prisma.aIConversation.create({
    data: {
      userId: studentUser.id,
      title: 'Help with Algebra',
      type: 'TUTOR',
      messages: {
        messages: [
          {
            role: 'user',
            content: 'I need help understanding how to solve 2x + 5 = 15',
            timestamp: new Date(),
          },
          {
            role: 'assistant',
            content: 'I\'d be happy to help you solve this equation! Let\'s break it down step by step...',
            timestamp: new Date(),
          },
        ]
      },
      context: {
        course: mathCourse.id,
        lesson: 'solving-equations',
        difficulty: 'beginner',
      },
    },
  });

  console.log('🤖 AI conversation created');

  console.log('✅ Database seeding completed successfully!');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Error during seeding:', e);
    await prisma.$disconnect();
    process.exit(1);
  });