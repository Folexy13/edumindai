import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAccessibility } from "../contexts/AccessibilityContext";
import LoadingSpinner from "../components/UI/LoadingSpinner";
import api from "../services/api";
import {
  BookOpenIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CheckCircleIcon,
  PlayIcon,
  QuestionMarkCircleIcon,
  AcademicCapIcon,
} from "@heroicons/react/24/outline";

const LearningPage = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const { announce } = useAccessibility();

  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [currentLesson, setCurrentLesson] = useState(null);
  const [lessonProgress, setLessonProgress] = useState({});
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizData, setQuizData] = useState(null);

  useEffect(() => {
    loadCourseData();
  }, [courseId]);

  const loadCourseData = async () => {
    try {
      const [courseResponse, progressResponse] = await Promise.all([
        api.learning.getCourse(courseId),
        api.learning.getCourseProgress(courseId),
      ]);

      setCourse(courseResponse.data);
      setLessonProgress(progressResponse.data.lessonProgress || {});

      // Set the first incomplete lesson as current, or first lesson if all complete
      const firstIncompleteLesson = courseResponse.data.lessons.find(
        (lesson) =>
          !progressResponse.data.lessonProgress?.[lesson.id]?.completed
      );
      setCurrentLesson(firstIncompleteLesson || courseResponse.data.lessons[0]);

      announce("Course loaded successfully");
    } catch (error) {
      console.error("Failed to load course:", error);
      // Use mock data for demo
      setCourse(mockCourse);
      setCurrentLesson(mockCourse.lessons[0]);
      announce("Course loaded");
    } finally {
      setLoading(false);
    }
  };

  const markLessonComplete = async (lessonId) => {
    try {
      await api.learning.completeLesson(courseId, lessonId);
      setLessonProgress((prev) => ({
        ...prev,
        [lessonId]: { completed: true, completedAt: new Date() },
      }));
      announce("Lesson marked as complete");
    } catch (error) {
      console.error("Failed to mark lesson complete:", error);
      // Mock completion for demo
      setLessonProgress((prev) => ({
        ...prev,
        [lessonId]: { completed: true, completedAt: new Date() },
      }));
      announce("Lesson completed");
    }
  };

  const navigateToLesson = (direction) => {
    const currentIndex = course.lessons.findIndex(
      (lesson) => lesson.id === currentLesson.id
    );
    let nextIndex;

    if (direction === "prev") {
      nextIndex = Math.max(0, currentIndex - 1);
    } else {
      nextIndex = Math.min(course.lessons.length - 1, currentIndex + 1);
    }

    setCurrentLesson(course.lessons[nextIndex]);
    setShowQuiz(false);
    announce(`Navigated to ${course.lessons[nextIndex].title}`);
  };

  const startQuiz = async () => {
    try {
      const response = await api.ai.generateQuestions(currentLesson.title);
      setQuizData(response.data);
      setShowQuiz(true);
      announce("Quiz started");
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      // Mock quiz for demo
      setQuizData(mockQuizData);
      setShowQuiz(true);
      announce("Quiz started");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="large" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Course not found
          </h2>
          <p className="text-gray-600">
            The requested course could not be loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate("/courses")}
          className="btn btn-outline mb-4 flex items-center"
          aria-label="Back to courses"
        >
          <ChevronLeftIcon className="h-4 w-4 mr-2" aria-hidden="true" />
          Back to Courses
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
            <p className="mt-2 text-gray-600">{course.description}</p>
          </div>
          <div className="text-sm text-gray-500">
            Lesson{" "}
            {course.lessons.findIndex((l) => l.id === currentLesson.id) + 1} of{" "}
            {course.lessons.length}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-2">
            <span className="text-gray-600">Course Progress</span>
            <span className="text-gray-600">
              {Math.round(
                (Object.keys(lessonProgress).filter(
                  (id) => lessonProgress[id].completed
                ).length /
                  course.lessons.length) *
                  100
              )}
              %
            </span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${
                  (Object.keys(lessonProgress).filter(
                    (id) => lessonProgress[id].completed
                  ).length /
                    course.lessons.length) *
                  100
                }%`,
              }}
              role="progressbar"
              aria-valuenow={Math.round(
                (Object.keys(lessonProgress).filter(
                  (id) => lessonProgress[id].completed
                ).length /
                  course.lessons.length) *
                  100
              )}
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label={`Course progress: ${Math.round(
                (Object.keys(lessonProgress).filter(
                  (id) => lessonProgress[id].completed
                ).length /
                  course.lessons.length) *
                  100
              )}%`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Lesson Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-8">
            <div className="card-header">
              <h2 className="text-lg font-semibold text-gray-900">Lessons</h2>
            </div>
            <div className="card-body">
              <nav className="space-y-2">
                {course.lessons.map((lesson, index) => (
                  <button
                    key={lesson.id}
                    onClick={() => {
                      setCurrentLesson(lesson);
                      setShowQuiz(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-colors ${
                      currentLesson.id === lesson.id
                        ? "bg-primary-50 border-primary-200 text-primary-900"
                        : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                    aria-current={
                      currentLesson.id === lesson.id ? "page" : undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 mr-3">
                          {lessonProgress[lesson.id]?.completed ? (
                            <CheckCircleIcon
                              className="h-5 w-5 text-green-500"
                              aria-hidden="true"
                            />
                          ) : (
                            <div
                              className="h-5 w-5 rounded-full border-2 border-gray-300"
                              aria-hidden="true"
                            />
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-sm font-medium">
                            {index + 1}. {lesson.title}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1">
                            {lesson.duration} min
                          </p>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {showQuiz ? (
            <QuizSection
              quizData={quizData}
              onComplete={() => {
                setShowQuiz(false);
                markLessonComplete(currentLesson.id);
              }}
              onClose={() => setShowQuiz(false)}
            />
          ) : (
            <LessonContent
              lesson={currentLesson}
              isCompleted={lessonProgress[currentLesson.id]?.completed}
              onMarkComplete={() => markLessonComplete(currentLesson.id)}
              onStartQuiz={startQuiz}
              onNavigate={navigateToLesson}
              canNavigatePrev={
                course.lessons.findIndex((l) => l.id === currentLesson.id) > 0
              }
              canNavigateNext={
                course.lessons.findIndex((l) => l.id === currentLesson.id) <
                course.lessons.length - 1
              }
            />
          )}
        </div>
      </div>
    </div>
  );
};

const LessonContent = ({
  lesson,
  isCompleted,
  onMarkComplete,
  onStartQuiz,
  onNavigate,
  canNavigatePrev,
  canNavigateNext,
}) => {
  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <BookOpenIcon
              className="h-6 w-6 mr-3 text-primary-600"
              aria-hidden="true"
            />
            {lesson.title}
          </h2>
          {isCompleted && (
            <div className="flex items-center text-green-600">
              <CheckCircleIcon className="h-5 w-5 mr-2" aria-hidden="true" />
              <span className="text-sm font-medium">Completed</span>
            </div>
          )}
        </div>
      </div>

      <div className="card-body">
        {/* Lesson Content */}
        <div className="prose max-w-none mb-8">
          {lesson.type === "video" && (
            <div className="bg-gray-100 rounded-lg p-8 text-center mb-6">
              <PlayIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">
                Video content would be displayed here
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Duration: {lesson.duration} minutes
              </p>
            </div>
          )}

          <div className="space-y-4">
            {lesson.content.split("\n").map(
              (paragraph, index) =>
                paragraph.trim() && (
                  <p key={index} className="text-gray-700 leading-relaxed">
                    {paragraph.trim()}
                  </p>
                )
            )}
          </div>

          {/* Learning Objectives */}
          {lesson.objectives && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="text-lg font-medium text-blue-900 mb-3 flex items-center">
                <AcademicCapIcon className="h-5 w-5 mr-2" aria-hidden="true" />
                Learning Objectives
              </h3>
              <ul className="space-y-2 text-blue-700">
                {lesson.objectives.map((objective, index) => (
                  <li key={index} className="flex items-start">
                    <span
                      className="flex-shrink-0 h-2 w-2 bg-blue-500 rounded-full mt-2 mr-3"
                      aria-hidden="true"
                    />
                    {objective}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Key Concepts */}
          {lesson.keyConcepts && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="text-lg font-medium text-green-900 mb-3">
                Key Concepts
              </h3>
              <div className="flex flex-wrap gap-2">
                {lesson.keyConcepts.map((concept, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800"
                  >
                    {concept}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-6 border-t border-gray-200">
          <button
            onClick={() => onNavigate("prev")}
            disabled={!canNavigatePrev}
            className="btn btn-outline flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Previous lesson"
          >
            <ChevronLeftIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            Previous
          </button>

          <div className="flex space-x-3">
            <button
              onClick={onStartQuiz}
              className="btn btn-outline flex items-center"
              aria-label="Start practice quiz"
            >
              <QuestionMarkCircleIcon
                className="h-4 w-4 mr-2"
                aria-hidden="true"
              />
              Practice Quiz
            </button>

            {!isCompleted && (
              <button
                onClick={onMarkComplete}
                className="btn btn-primary flex items-center"
                aria-label="Mark lesson as complete"
              >
                <CheckCircleIcon className="h-4 w-4 mr-2" aria-hidden="true" />
                Mark Complete
              </button>
            )}
          </div>

          <button
            onClick={() => onNavigate("next")}
            disabled={!canNavigateNext}
            className="btn btn-primary flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Next lesson"
          >
            Next
            <ChevronRightIcon className="h-4 w-4 ml-2" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};

const QuizSection = ({ quizData, onComplete, onClose }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);

  const questions = quizData?.questions || mockQuizData.questions;

  const handleAnswer = (questionIndex, answerIndex) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
  };

  const handleSubmit = () => {
    setShowResults(true);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return Math.round((correct / questions.length) * 100);
  };

  if (showResults) {
    const score = calculateScore();
    return (
      <div className="card">
        <div className="card-header">
          <h2 className="text-2xl font-bold text-gray-900">Quiz Results</h2>
        </div>
        <div className="card-body text-center">
          <div className="mb-6">
            <div
              className={`text-6xl font-bold mb-4 ${
                score >= 70 ? "text-green-500" : "text-orange-500"
              }`}
            >
              {score}%
            </div>
            <p className="text-xl text-gray-600 mb-2">
              {score >= 70 ? "Great job!" : "Keep practicing!"}
            </p>
            <p className="text-gray-500">
              You got{" "}
              {
                Object.entries(answers).filter(
                  ([index, answer]) =>
                    answer === questions[parseInt(index)].correctAnswer
                ).length
              }{" "}
              out of {questions.length} questions correct
            </p>
          </div>

          <div className="flex justify-center space-x-4">
            <button onClick={onClose} className="btn btn-outline">
              Review Lesson
            </button>
            <button onClick={onComplete} className="btn btn-primary">
              Continue Learning
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <div className="card">
      <div className="card-header">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Practice Quiz</h2>
          <button onClick={onClose} className="btn btn-outline">
            Close Quiz
          </button>
        </div>
        <div className="mt-2">
          <div className="flex items-center justify-between text-sm text-gray-500">
            <span>
              Question {currentQuestion + 1} of {questions.length}
            </span>
          </div>
          <div className="mt-2 progress-bar">
            <div
              className="progress-fill"
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
              }}
            />
          </div>
        </div>
      </div>

      <div className="card-body">
        <div className="mb-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            {question.question}
          </h3>

          <div className="space-y-3">
            {question.options.map((option, index) => (
              <label
                key={index}
                className="flex items-center p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion}`}
                  value={index}
                  checked={answers[currentQuestion] === index}
                  onChange={() => handleAnswer(currentQuestion, index)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                />
                <span className="ml-3 text-gray-700">{option}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-between">
          <button
            onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
            disabled={currentQuestion === 0}
            className="btn btn-outline disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          {currentQuestion === questions.length - 1 ? (
            <button
              onClick={handleSubmit}
              disabled={Object.keys(answers).length < questions.length}
              className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Submit Quiz
            </button>
          ) : (
            <button
              onClick={() =>
                setCurrentQuestion(
                  Math.min(questions.length - 1, currentQuestion + 1)
                )
              }
              className="btn btn-primary"
            >
              Next
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Mock data for demo purposes
const mockCourse = {
  id: "math-101",
  title: "Introduction to Algebra",
  description:
    "Learn the fundamentals of algebra including variables, equations, and problem-solving techniques.",
  lessons: [
    {
      id: "lesson-1",
      title: "What is Algebra?",
      type: "text",
      duration: 15,
      content: `Algebra is a branch of mathematics that deals with symbols and the rules for manipulating those symbols. In algebra, symbols (usually letters like x, y, and z) represent unknown quantities called variables.

The main purpose of algebra is to solve problems by finding the values of these unknown variables. This makes algebra incredibly powerful for solving real-world problems.

For example, if you know that 2x + 5 = 11, algebra gives you the tools to find that x = 3.

Algebra builds on arithmetic (addition, subtraction, multiplication, and division) but extends these concepts to work with variables and more complex expressions.`,
      objectives: [
        "Understand what algebra is and its purpose",
        "Identify variables and constants",
        "Recognize algebraic expressions",
        "Understand the relationship between algebra and arithmetic",
      ],
      keyConcepts: ["Variables", "Constants", "Expressions", "Equations"],
    },
    {
      id: "lesson-2",
      title: "Variables and Constants",
      type: "text",
      duration: 20,
      content: `In algebra, we work with two main types of elements: variables and constants.

Variables are symbols that represent unknown or changing values. They are usually represented by letters such as x, y, z, a, b, or c. The value of a variable can change depending on the context of the problem.

For example, in the expression 3x + 2, the letter x is a variable. It could represent any number, and the value of the entire expression depends on what value x has.

Constants, on the other hand, are fixed values that don't change. In the same expression 3x + 2, both 3 and 2 are constants. They always have the same value.

Understanding the difference between variables and constants is crucial for working with algebraic expressions and solving equations.`,
      objectives: [
        "Define variables and give examples",
        "Define constants and give examples",
        "Distinguish between variables and constants in expressions",
        "Use appropriate notation for variables",
      ],
      keyConcepts: ["Variables", "Constants", "Symbols", "Notation"],
    },
    {
      id: "lesson-3",
      title: "Basic Operations",
      type: "text",
      duration: 25,
      content: `Algebra uses the same basic operations as arithmetic: addition, subtraction, multiplication, and division. However, we apply these operations to expressions that contain variables.

Addition and Subtraction:
When adding or subtracting terms with the same variable, we combine the coefficients. For example:
- 3x + 5x = 8x
- 7y - 2y = 5y

Multiplication:
When multiplying terms, we multiply the coefficients and add the exponents of like variables:
- 3x × 4x = 12x²
- 2a × 5b = 10ab

Division:
When dividing terms, we divide the coefficients and subtract the exponents:
- 12x ÷ 4 = 3x
- 8x³ ÷ 2x = 4x²

These operations follow specific rules and properties that make algebraic manipulation possible and predictable.`,
      objectives: [
        "Perform addition and subtraction with algebraic terms",
        "Apply multiplication rules to algebraic expressions",
        "Use division with algebraic terms",
        "Recognize like terms and combine them properly",
      ],
      keyConcepts: [
        "Operations",
        "Like terms",
        "Coefficients",
        "Combining terms",
      ],
    },
  ],
};

const mockQuizData = {
  questions: [
    {
      question: "What is a variable in algebra?",
      options: [
        "A fixed number that never changes",
        "A symbol that represents an unknown or changing value",
        "The answer to an equation",
        "A mathematical operation",
      ],
      correctAnswer: 1,
    },
    {
      question: "In the expression 5x + 3, what is the constant?",
      options: ["x", "5", "3", "5x"],
      correctAnswer: 2,
    },
    {
      question: "What is the result of 4x + 2x?",
      options: ["6x", "8x", "6x²", "4x + 2x"],
      correctAnswer: 0,
    },
  ],
};

export default LearningPage;
