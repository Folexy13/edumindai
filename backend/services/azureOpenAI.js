const { OpenAIApi } = require('@azure/openai');
const { DefaultAzureCredential } = require('@azure/identity');

class AzureOpenAIService {
  constructor() {
    this.endpoint = process.env.AZURE_OPENAI_ENDPOINT;
    this.apiKey = process.env.AZURE_OPENAI_API_KEY;
    this.deploymentName = process.env.AZURE_OPENAI_DEPLOYMENT_NAME || 'gpt-4';
    
    if (!this.endpoint || !this.apiKey) {
      console.warn('Azure OpenAI credentials not found, using mock responses');
      this.useMock = true;
    } else {
      try {
        this.client = new OpenAIApi(
          this.endpoint,
          this.apiKey ? { key: this.apiKey } : new DefaultAzureCredential()
        );
        this.useMock = false;
      } catch (error) {
        console.warn('Failed to initialize Azure OpenAI, using mock responses:', error.message);
        this.useMock = true;
      }
    }
  }

  async generateExplanation(topic, difficulty = 'intermediate', learningStyle = 'visual') {
    if (this.useMock) {
      return this.getMockExplanation(topic, difficulty, learningStyle);
    }

    try {
      const prompt = this.buildExplanationPrompt(topic, difficulty, learningStyle);
      
      const response = await this.client.getChatCompletions(
        this.deploymentName,
        {
          messages: [
            {
              role: 'system',
              content: 'You are an expert tutor who explains concepts clearly and adapts to different learning styles and difficulty levels.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          maxTokens: 500,
          temperature: 0.7
        }
      );

      return {
        explanation: response.choices[0].message.content,
        topic,
        difficulty,
        learningStyle,
        generatedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Azure OpenAI API error:', error);
      return this.getMockExplanation(topic, difficulty, learningStyle);
    }
  }

  async generatePracticeQuestions(topic, count = 5, difficulty = 'intermediate') {
    if (this.useMock) {
      return this.getMockQuestions(topic, count, difficulty);
    }

    try {
      const prompt = `Generate ${count} multiple-choice questions about "${topic}" at ${difficulty} difficulty level. 
      Format as JSON array with objects containing: question, options (array of 4), correctAnswer (index), explanation.`;

      const response = await this.client.getChatCompletions(
        this.deploymentName,
        {
          messages: [
            {
              role: 'system',
              content: 'You are an educational content creator who generates engaging practice questions.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          maxTokens: 800,
          temperature: 0.6
        }
      );

      const content = response.choices[0].message.content;
      try {
        const questions = JSON.parse(content);
        return {
          questions,
          topic,
          difficulty,
          generatedAt: new Date().toISOString()
        };
      } catch (parseError) {
        return this.getMockQuestions(topic, count, difficulty);
      }
    } catch (error) {
      console.error('Azure OpenAI API error:', error);
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

      const response = await this.client.getChatCompletions(
        this.deploymentName,
        {
          messages: [
            {
              role: 'system',
              content: 'You are a curriculum designer who creates personalized learning paths based on individual needs and goals.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          maxTokens: 1000,
          temperature: 0.5
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
          generatedAt: new Date().toISOString()
        };
      } catch (parseError) {
        return this.getMockLearningPath(subject, currentLevel, goals, timeframe);
      }
    } catch (error) {
      console.error('Azure OpenAI API error:', error);
      return this.getMockLearningPath(subject, currentLevel, goals, timeframe);
    }
  }

  buildExplanationPrompt(topic, difficulty, learningStyle) {
    const styleInstructions = {
      visual: 'Use visual metaphors, diagrams descriptions, and spatial relationships',
      auditory: 'Use rhythm, patterns, and sound-based analogies',
      kinesthetic: 'Use hands-on examples and physical analogies',
      reading: 'Provide detailed text with clear structure and examples'
    };

    return `Explain "${topic}" for a ${difficulty} level student who learns best through ${learningStyle} methods.
    ${styleInstructions[learningStyle] || styleInstructions.visual}
    Keep it engaging, clear, and appropriate for the difficulty level.`;
  }

  getMockExplanation(topic, difficulty, learningStyle) {
    const explanations = {
      'Machine Learning': 'Machine Learning is like teaching a computer to recognize patterns, similar to how you learn to recognize faces. The computer looks at many examples and finds common features to make predictions about new data.',
      'JavaScript': 'JavaScript is a programming language that brings websites to life! Think of HTML as the skeleton, CSS as the clothing, and JavaScript as the personality that makes things interactive and dynamic.',
      'Photosynthesis': 'Photosynthesis is how plants make their own food using sunlight, water, and carbon dioxide. Think of leaves as tiny solar panels that convert light energy into chemical energy (glucose) that the plant can use.'
    };

    return {
      explanation: explanations[topic] || `This is a ${difficulty} level explanation of ${topic} tailored for ${learningStyle} learners. The concept involves understanding the fundamental principles and applying them through practical examples.`,
      topic,
      difficulty,
      learningStyle,
      generatedAt: new Date().toISOString(),
      isMock: true
    };
  }

  getMockQuestions(topic, count, difficulty) {
    const sampleQuestions = [
      {
        question: `What is a key concept in ${topic}?`,
        options: ['Option A', 'Option B', 'Option C', 'Option D'],
        correctAnswer: 0,
        explanation: `This is a ${difficulty} level question about ${topic}.`
      }
    ];

    return {
      questions: Array(count).fill().map((_, i) => ({
        ...sampleQuestions[0],
        question: `${sampleQuestions[0].question} (Question ${i + 1})`
      })),
      topic,
      difficulty,
      generatedAt: new Date().toISOString(),
      isMock: true
    };
  }

  getMockLearningPath(subject, currentLevel, goals, timeframe) {
    return {
      title: `${subject} Learning Path`,
      description: `Personalized learning path for ${currentLevel} level student`,
      modules: [
        {
          title: `${subject} Fundamentals`,
          duration: '2 weeks',
          topics: ['Basic concepts', 'Key principles', 'Foundation skills'],
          resources: ['Interactive tutorials', 'Practice exercises', 'Video lessons']
        },
        {
          title: `Intermediate ${subject}`,
          duration: '3 weeks',
          topics: ['Advanced concepts', 'Practical applications', 'Problem solving'],
          resources: ['Hands-on projects', 'Case studies', 'Peer discussions']
        },
        {
          title: `Advanced ${subject}`,
          duration: '2 weeks',
          topics: ['Expert techniques', 'Real-world applications', 'Innovation'],
          resources: ['Capstone project', 'Research papers', 'Expert interviews']
        }
      ],
      totalDuration: timeframe,
      estimatedHours: 40,
      generatedAt: new Date().toISOString(),
      isMock: true
    };
  }
}

module.exports = new AzureOpenAIService();