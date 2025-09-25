const { AzureOpenAI } = require("openai");

class AzureOpenAIService {
  constructor() {
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    this.apiKey = process.env.AZURE_OPENAI_API_KEY;
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || "gpt-4";

    if (!this.endpoint || !this.apiKey) {
      console.warn("Azure OpenAI credentials not found, using mock responses");
      console.warn("To enable real AI functionality, set these environment variables:");
      console.warn("- AZURE_OPENAI_ENDPOINT");
      console.warn("- AZURE_OPENAI_API_KEY");
      console.warn("- AZURE_OPENAI_DEPLOYMENT_NAME (optional, defaults to 'gpt-4')");
      this.useMock = true;
    } else {
      try {
        this.client = new AzureOpenAI({
          endpoint: this.endpoint,
          apiVersion: "2024-10-21",
          apiKey: this.apiKey,
        });
        this.useMock = false;
      } catch (error) {
        console.warn(
          "Failed to initialize Azure OpenAI, using mock responses:",
          error.message
        );
        this.useMock = true;
      }
    }
  }

  async generateExplanation(
    topic,
    difficulty = "intermediate",
    learningStyle = "visual"
  ) {
    if (this.useMock) {
      return this.getMockExplanation(topic, difficulty, learningStyle);
    }

    try {
      const prompt = this.buildExplanationPrompt(
        topic,
        difficulty,
        learningStyle
      );

      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages: [
          {
            role: "system",
            content:
              "You are an expert tutor who explains concepts clearly and adapts to different learning styles and difficulty levels.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.7,
      });

      return {
        explanation: response.choices[0].message.content,
        topic,
        difficulty,
        learningStyle,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Azure OpenAI API error:", error);
      return this.getMockExplanation(topic, difficulty, learningStyle);
    }
  }

  async generatePracticeQuestions(
    topic,
    count = 5,
    difficulty = "intermediate"
  ) {
    if (this.useMock) {
      return this.getMockQuestions(topic, count, difficulty);
    }

    try {
      const prompt = `Generate ${count} multiple-choice questions about "${topic}" at ${difficulty} difficulty level. 
      Format as JSON array with objects containing: question, options (array of 4), correctAnswer (index), explanation.`;

      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages: [
          {
            role: "system",
              content:
                "You are an educational content creator who generates engaging practice questions.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 800,
          temperature: 0.6,
        }
      );

      const content = response.choices[0].message.content;
      try {
        const questions = JSON.parse(content);
        return {
          questions,
          topic,
          difficulty,
          generatedAt: new Date().toISOString(),
        };
      } catch (parseError) {
        return this.getMockQuestions(topic, count, difficulty);
      }
    } catch (error) {
      console.error("Azure OpenAI API error:", error);
      return this.getMockQuestions(topic, count, difficulty);
    }
  }

  async generateLearningPath(subject, currentLevel, goals, timeframe) {
    if (this.useMock) {
      return this.getMockLearningPath(subject, currentLevel, goals, timeframe);
    }

    try {
      const prompt = `Create a personalized learning path for "${subject}" for a ${currentLevel} level student.
      Goals: ${goals}
      Timeframe: ${timeframe}
      Include: topics sequence, estimated time per topic, learning resources, and milestones.
      Format as JSON with structured learning modules.`;

      const response = await this.client.chat.completions.create({
        model: this.deploymentName,
        messages: [
          {
            role: "system",
            content:
              "You are a curriculum designer who creates personalized learning paths based on individual needs and goals.",
            },
            {
              role: "user",
              content: prompt,
            },
          ],
          max_tokens: 1000,
          temperature: 0.5,
        }
      );

      const content = response.choices[0].message.content;
      try {
        const learningPath = JSON.parse(content);
        return {
          ...learningPath,
          subject,
          currentLevel,
          goals,
          timeframe,
          generatedAt: new Date().toISOString(),
        };
      } catch (parseError) {
        return this.getMockLearningPath(
          subject,
          currentLevel,
          goals,
          timeframe
        );
      }
    } catch (error) {
      console.error("Azure OpenAI API error:", error);
      return this.getMockLearningPath(subject, currentLevel, goals, timeframe);
    }
  }

  buildExplanationPrompt(topic, difficulty, learningStyle) {
    const styleInstructions = {
      visual:
        "Use visual metaphors, diagrams descriptions, and spatial relationships",
      auditory: "Use rhythm, patterns, and sound-based analogies",
      kinesthetic: "Use hands-on examples and physical analogies",
      reading: "Provide detailed text with clear structure and examples",
    };

    return `Explain "${topic}" for a ${difficulty} level student who learns best through ${learningStyle} methods.
    ${styleInstructions[learningStyle] || styleInstructions.visual}
    Keep it engaging, clear, and appropriate for the difficulty level.`;
  }

  getMockExplanation(topic, difficulty, learningStyle) {
    // Enhanced explanations for common educational topics
    const explanations = {
      // Math topics
      "algebra": {
        visual: "Algebra is like a balance scale where you solve for unknown values (variables like x or y). Think of equations as puzzles where you need to keep both sides equal while finding the missing piece.",
        auditory: "Algebra involves working with equations that have unknown values. Listen to the 'rhythm' of balancing equations - what you do to one side, you must do to the other.",
        kinesthetic: "Algebra is like building with blocks where some blocks are mystery boxes (variables). You manipulate the equation by physically moving pieces to solve for the unknown.",
        reading: "Algebra is the branch of mathematics that uses letters and symbols to represent numbers and quantities in formulas and equations. It involves solving for unknown variables."
      },
      "geometry": {
        visual: "Geometry is the study of shapes, sizes, and spatial relationships. Picture triangles, circles, and squares in your mind - geometry helps us understand how these shapes relate to each other in space.",
        auditory: "Geometry involves understanding the properties of shapes through logical reasoning. Think of it as the 'language' of spatial relationships.",
        kinesthetic: "Geometry is like working with building blocks and measuring tools. You can touch and manipulate shapes to understand angles, areas, and volumes.",
        reading: "Geometry is the mathematical study of shapes, sizes, properties of space, and the relationships between different geometric figures."
      },
      "fractions": {
        visual: "Fractions represent parts of a whole, like slicing a pizza. If you cut a pizza into 8 slices and eat 3, you've eaten 3/8 of the pizza. The bottom number shows total pieces, the top shows how many you have.",
        auditory: "Fractions are spoken as 'parts out of a whole.' Listen to the rhythm: three-fourths means three parts out of four equal parts.",
        kinesthetic: "Fractions are like breaking objects into equal pieces. Use your hands to divide objects - fold paper, cut fruit, or use blocks to physically experience fractions.",
        reading: "Fractions are numerical representations of parts of a whole, written as a numerator (top number) over a denominator (bottom number), separated by a fraction bar."
      },
      
      // Science topics
      "photosynthesis": {
        visual: "Photosynthesis is like a solar-powered food factory inside plant leaves. Chloroplasts are tiny green kitchens that use sunlight, water, and carbon dioxide to cook up glucose (plant food) and release oxygen as a byproduct.",
        auditory: "Photosynthesis follows a rhythmic cycle: plants 'breathe in' carbon dioxide, 'drink' water through roots, capture sunlight, and 'exhale' oxygen while making their own food.",
        kinesthetic: "Think of photosynthesis as a hands-on cooking process. Plants gather ingredients (CO2, water, sunlight), mix them in their green 'kitchen' (chloroplasts), and produce food while releasing oxygen.",
        reading: "Photosynthesis is the biological process by which plants convert light energy, usually from the sun, into chemical energy stored in glucose, using carbon dioxide and water while releasing oxygen as a waste product."
      },
      "gravity": {
        visual: "Gravity is like an invisible force field around every object that pulls other objects toward it. Earth's gravity is like a giant magnet pulling everything downward. The more massive an object, the stronger its gravitational pull.",
        auditory: "Gravity is the universal force that makes objects 'fall' toward each other. Listen to how objects accelerate as they fall - they speed up at 9.8 meters per second each second.",
        kinesthetic: "Feel gravity by dropping objects, jumping, or doing push-ups. Your weight is actually the force of Earth's gravity pulling on your body mass.",
        reading: "Gravity is a fundamental force of nature that causes objects with mass to attract each other. On Earth, it gives weight to physical objects and causes objects to fall toward the ground."
      },
      
      // Technology topics
      "javascript": {
        visual: "JavaScript is like the director of a movie - HTML builds the set (structure), CSS designs the costumes (style), and JavaScript directs all the action and interactions on your web page.",
        auditory: "JavaScript is the 'voice' of web pages. It listens for user actions (clicks, typing) and responds with dynamic behavior, like a conversation between user and website.",
        kinesthetic: "JavaScript is like having remote controls for your webpage. You can program buttons to respond to clicks, forms to validate input, and animations to trigger based on user actions.",
        reading: "JavaScript is a programming language that enables interactive web pages and is an essential part of web applications alongside HTML and CSS. It allows developers to create dynamic content and user interfaces."
      },
      "machine learning": {
        visual: "Machine Learning is like training a digital brain using thousands of examples. Just as you learn to recognize faces by seeing many faces, ML algorithms learn patterns from data to make predictions.",
        auditory: "Machine Learning involves algorithms that 'listen' to data patterns and learn to make predictions, like how you learned language by hearing words repeatedly.",
        kinesthetic: "Think of ML as teaching a computer through practice - you feed it examples (training data), it practices finding patterns, then tests its knowledge on new problems.",
        reading: "Machine Learning is a method of data analysis that automates analytical model building, enabling computers to learn and make decisions from data without being explicitly programmed for every task."
      }
    };

    // Create practice questions if requested
    if (topic.toLowerCase().includes('practice questions') || topic.toLowerCase().includes('quiz') || topic.toLowerCase().includes('test')) {
      return this.generatePracticeQuestionExplanation(topic, difficulty, learningStyle);
    }

    // Find the best matching explanation
    const lowerTopic = topic.toLowerCase();
    let bestMatch = null;
    
    // Direct match
    if (explanations[lowerTopic]) {
      bestMatch = explanations[lowerTopic];
    } else {
      // Partial match
      for (const [key, value] of Object.entries(explanations)) {
        if (lowerTopic.includes(key) || key.includes(lowerTopic.replace(/[^a-zA-Z]/g, ''))) {
          bestMatch = value;
          break;
        }
      }
    }

    let explanation;
    if (bestMatch) {
      explanation = bestMatch[learningStyle] || bestMatch.visual;
    } else {
      // Generate a thoughtful response based on difficulty and learning style
      explanation = this.generateContextualExplanation(topic, difficulty, learningStyle);
    }

    return explanation;
  }

  generatePracticeQuestionExplanation(topic, difficulty, learningStyle) {
    const subject = topic.replace(/create|practice|questions|for|math|science|about/gi, '').trim();
    
    const strategies = {
      visual: `To create effective practice questions about ${subject}, visualize the key concepts first. Break down complex ideas into diagrams or charts, then design questions that test understanding of these visual relationships. Use multiple choice questions with diagrams, or ask students to identify patterns in visual data.`,
      auditory: `For ${subject} practice questions, focus on verbal reasoning and logical sequences. Create questions that can be read aloud clearly, use word problems that tell a story, and include questions about cause-and-effect relationships that students can discuss or explain verbally.`,
      kinesthetic: `Design hands-on practice questions for ${subject} that involve manipulation, calculation, or step-by-step processes. Include real-world scenarios where students need to apply concepts practically, and create questions that require students to show their work or explain their problem-solving process.`,
      reading: `Structure ${subject} practice questions with clear, detailed text. Include comprehensive word problems, provide written explanations for concepts, and create questions that test reading comprehension of technical material. Use varied question formats like fill-in-the-blank, essay, and detailed multiple choice.`
    };

    return strategies[learningStyle] || strategies.visual;
  }

  generateContextualExplanation(topic, difficulty, learningStyle) {
    const difficultyContext = {
      beginner: "starting with the basics and building foundational understanding",
      intermediate: "connecting key concepts and exploring practical applications",
      advanced: "analyzing complex relationships and advanced applications"
    };

    const styleApproach = {
      visual: "using diagrams, charts, and visual representations to illustrate concepts",
      auditory: "through spoken explanations, discussions, and verbal reasoning",
      kinesthetic: "with hands-on activities, practical examples, and interactive learning",
      reading: "through detailed written explanations, structured text, and comprehensive analysis"
    };

    return `Let me explain ${topic} by ${difficultyContext[difficulty]} and ${styleApproach[learningStyle]}. 

    ${topic} is an important concept that involves understanding fundamental principles and their practical applications. At the ${difficulty} level, we focus on building a solid understanding through ${learningStyle} learning methods.

    Key aspects to understand:
    1. Core Definition: What ${topic} is and why it matters
    2. Real-world Applications: How ${topic} is used practically  
    3. Problem-solving: How to apply ${topic} concepts to solve problems
    4. Connections: How ${topic} relates to other concepts you've learned

    For ${learningStyle} learners like yourself, I recommend approaching ${topic} through ${styleApproach[learningStyle]}. This will help you build a strong foundation and develop confidence in applying these concepts.`;
  }

  getMockQuestions(topic, count, difficulty) {
    // Enhanced question banks for common topics
    const questionBanks = {
      // Math questions
      algebra: {
        beginner: [
          {
            question: "If x + 5 = 12, what is the value of x?",
            options: ["5", "7", "12", "17"],
            correctAnswer: 1,
            explanation: "To solve x + 5 = 12, subtract 5 from both sides: x = 12 - 5 = 7"
          },
          {
            question: "What is the value of 3x when x = 4?",
            options: ["7", "12", "15", "21"],
            correctAnswer: 1,
            explanation: "Substitute x = 4 into 3x: 3 × 4 = 12"
          }
        ],
        intermediate: [
          {
            question: "Solve for y: 2y - 8 = 14",
            options: ["3", "6", "11", "22"],
            correctAnswer: 2,
            explanation: "Add 8 to both sides: 2y = 22, then divide by 2: y = 11"
          }
        ]
      },
      geometry: {
        beginner: [
          {
            question: "How many sides does a triangle have?",
            options: ["2", "3", "4", "5"],
            correctAnswer: 1,
            explanation: "A triangle, by definition, has exactly 3 sides and 3 angles."
          }
        ]
      },
      // Science questions
      photosynthesis: {
        beginner: [
          {
            question: "What do plants need for photosynthesis?",
            options: ["Only water", "Only sunlight", "Sunlight, water, and carbon dioxide", "Only carbon dioxide"],
            correctAnswer: 2,
            explanation: "Plants need three main ingredients for photosynthesis: sunlight (energy), water (from roots), and carbon dioxide (from air)."
          }
        ]
      },
      // Programming questions
      javascript: {
        beginner: [
          {
            question: "What does 'console.log()' do in JavaScript?",
            options: ["Creates a variable", "Prints output to the console", "Loops through code", "Defines a function"],
            correctAnswer: 1,
            explanation: "console.log() is used to print/display information in the browser's console for debugging and testing."
          }
        ]
      }
    };

    // Generate contextual questions based on topic
    const lowerTopic = topic.toLowerCase().replace(/[^a-zA-Z]/g, '');
    let questionSet = [];

    // Find matching questions
    for (const [key, value] of Object.entries(questionBanks)) {
      if (lowerTopic.includes(key) || key.includes(lowerTopic)) {
        const difficultyQuestions = value[difficulty] || value.beginner || [];
        questionSet = difficultyQuestions;
        break;
      }
    }

    // If no specific questions found, generate contextual ones
    if (questionSet.length === 0) {
      questionSet = this.generateContextualQuestions(topic, difficulty);
    }

    // Return the requested number of questions
    const selectedQuestions = [];
    for (let i = 0; i < count; i++) {
      if (questionSet.length > 0) {
        const question = questionSet[i % questionSet.length];
        selectedQuestions.push({
          ...question,
          question: i < questionSet.length ? question.question : `${question.question} (Question ${i + 1})`
        });
      } else {
        selectedQuestions.push(this.createGenericQuestion(topic, difficulty, i + 1));
      }
    }

    return {
      questions: selectedQuestions,
      topic,
      difficulty,
      generatedAt: new Date().toISOString(),
      isMock: true,
    };
  }

  generateContextualQuestions(topic, difficulty) {
    const questions = [];
    
    // Generate topic-specific questions based on common educational patterns
    if (topic.toLowerCase().includes('math') || topic.toLowerCase().includes('calculus') || topic.toLowerCase().includes('equation')) {
      questions.push({
        question: `What is a fundamental concept you should understand when studying ${topic}?`,
        options: ["Memorizing formulas", "Understanding the underlying logic", "Speed of calculation", "Using a calculator"],
        correctAnswer: 1,
        explanation: `Understanding the underlying logic is crucial for mastering ${topic}, as it helps you apply concepts to new problems.`
      });
    }

    if (topic.toLowerCase().includes('science') || topic.toLowerCase().includes('biology') || topic.toLowerCase().includes('chemistry')) {
      questions.push({
        question: `When studying ${topic}, what is the best approach to understanding complex processes?`,
        options: ["Reading once", "Breaking it down into steps", "Memorizing definitions", "Avoiding difficult parts"],
        correctAnswer: 1,
        explanation: `Breaking complex ${topic} processes into smaller, manageable steps helps build understanding systematically.`
      });
    }

    if (topic.toLowerCase().includes('programming') || topic.toLowerCase().includes('coding') || topic.toLowerCase().includes('computer')) {
      questions.push({
        question: `What is essential for learning ${topic} effectively?`,
        options: ["Only watching videos", "Practice and hands-on coding", "Reading documentation only", "Memorizing syntax"],
        correctAnswer: 1,
        explanation: `${topic} is best learned through practice and hands-on experience, as it builds problem-solving skills.`
      });
    }

    return questions.length > 0 ? questions : [this.createGenericQuestion(topic, difficulty, 1)];
  }

  createGenericQuestion(topic, difficulty, questionNum) {
    const difficultyDescriptors = {
      beginner: "basic",
      intermediate: "important", 
      advanced: "complex"
    };

    return {
      question: `What ${difficultyDescriptors[difficulty]} concept should you understand when studying ${topic}?`,
      options: [
        "Surface-level memorization",
        "Deep understanding and application", 
        "Avoiding challenging aspects",
        "Focusing only on easy parts"
      ],
      correctAnswer: 1,
      explanation: `Deep understanding and practical application are key to mastering ${topic} at the ${difficulty} level.`
    };
  }

  getMockLearningPath(subject, currentLevel, goals, timeframe) {
    return {
      title: `${subject} Learning Path`,
      description: `Personalized learning path for ${currentLevel} level student`,
      modules: [
        {
          title: `${subject} Fundamentals`,
          duration: "2 weeks",
          topics: ["Basic concepts", "Key principles", "Foundation skills"],
          resources: [
            "Interactive tutorials",
            "Practice exercises",
            "Video lessons",
          ],
        },
        {
          title: `Intermediate ${subject}`,
          duration: "3 weeks",
          topics: [
            "Advanced concepts",
            "Practical applications",
            "Problem solving",
          ],
          resources: ["Hands-on projects", "Case studies", "Peer discussions"],
        },
        {
          title: `Advanced ${subject}`,
          duration: "2 weeks",
          topics: [
            "Expert techniques",
            "Real-world applications",
            "Innovation",
          ],
          resources: [
            "Capstone project",
            "Research papers",
            "Expert interviews",
          ],
        },
      ],
      totalDuration: timeframe,
      estimatedHours: 40,
      generatedAt: new Date().toISOString(),
      isMock: true,
    };
  }
}

module.exports = new AzureOpenAIService();
