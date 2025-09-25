import React, { useState, useEffect, useRef } from 'react';
import { useAccessibility } from '../contexts/AccessibilityContext';
import LoadingSpinner from '../components/UI/LoadingSpinner';
import api from '../services/api';
import {
  PaperAirplaneIcon,
  AcademicCapIcon,
  QuestionMarkCircleIcon,
  LightBulbIcon,
  BookOpenIcon,
  SparklesIcon,
} from '@heroicons/react/24/outline';

const AITutorPage = () => {
  const { announce } = useAccessibility();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeFeature, setActiveFeature] = useState('chat');
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    // Add welcome message
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: "Hello! I'm your AI tutor. I'm here to help you learn and understand any topic. You can ask me questions, request explanations, or even ask me to create practice questions for you. How can I help you today?",
        timestamp: new Date(),
      },
    ]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const messageToProcess = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    try {
      let response;
      
      switch (activeFeature) {
        case 'chat':
          response = await api.ai.chat({ message: messageToProcess });
          break;
        case 'explain':
          response = await api.ai.generateExplanation({ 
            topic: messageToProcess,
            difficulty: 'intermediate',
            learningStyle: 'visual'
          });
          break;
        case 'practice':
          response = await api.ai.generateQuestions({ 
            topic: messageToProcess,
            count: 3,
            difficulty: 'intermediate'
          });
          break;
        default:
          response = await api.ai.chat({ message: messageToProcess });
      }

      let content;
      if (activeFeature === 'explain') {
        content = response.data.explanation || response.data.content || 'Explanation generated successfully';
      } else if (activeFeature === 'practice') {
        content = response.data.questions || response.data.content || 'Practice questions generated successfully';
      } else {
        content = response.data.response || response.data.content || response.data.message || 'Response generated successfully';
      }

      const aiMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: content,
        timestamp: new Date(),
        feature: activeFeature,
      };

      setMessages(prev => [...prev, aiMessage]);
      announce(`AI ${activeFeature} response received`);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      let errorContent = "I apologize, but I'm having trouble processing your request right now.";
      
      // Provide helpful fallback responses based on the feature
      switch (activeFeature) {
        case 'explain':
          errorContent = `I'd love to explain "${messageToProcess}" for you! While I'm having technical difficulties, here's what I can tell you: This topic involves important concepts that you can explore through various learning resources. Try breaking it down into smaller parts and researching each component.`;
          break;
        case 'practice':
          errorContent = `I can help you practice "${messageToProcess}"! While I'm having technical difficulties generating custom questions, I recommend creating your own practice questions by: 1) Identifying key concepts, 2) Creating questions that test understanding, 3) Including multiple choice and open-ended questions.`;
          break;
        default:
          errorContent = `I'm here to help you learn about "${messageToProcess}"! While I'm having technical difficulties, I can still guide you. Try using specific features like "Explain" for detailed explanations or "Practice" for generating questions on topics you want to study.`;
      }

      const errorMessage = {
        id: (Date.now() + 1).toString(),
        type: 'ai',
        content: errorContent,
        timestamp: new Date(),
        isError: false, // Don't show as error since we're providing helpful content
      };
      setMessages(prev => [...prev, errorMessage]);
      announce('AI response provided with suggestions');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAction = async (action) => {
    setActiveFeature(action);
    let prompt = '';

    switch (action) {
      case 'explain':
        prompt = "Please explain a concept you'd like to understand better.";
        break;
      case 'practice':
        prompt = "What topic would you like to practice? I'll create some questions for you.";
        break;
      case 'help':
        prompt = "What subject or homework problem can I help you with?";
        break;
      default:
        prompt = "How can I help you learn today?";
    }

    const systemMessage = {
      id: Date.now().toString(),
      type: 'ai',
      content: prompt,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, systemMessage]);
    announce(`Switched to ${action} mode`);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        type: 'ai',
        content: "Hello! I'm your AI tutor. How can I help you learn today?",
        timestamp: new Date(),
      },
    ]);
    setActiveFeature('chat');
    announce('Chat cleared');
  };

  const formatMessage = (message) => {
    if (message.feature === 'practice' && typeof message.content === 'object') {
      return (
        <div className="space-y-3">
          <p className="font-medium">Here are some practice questions:</p>
          {message.content.questions?.map((question, index) => (
            <div key={index} className="p-3 bg-gray-50 rounded-lg">
              <p className="font-medium text-gray-900 mb-2">
                Question {index + 1}: {question.question}
              </p>
              {question.options && (
                <ul className="space-y-1 text-sm text-gray-700">
                  {question.options.map((option, optIndex) => (
                    <li key={optIndex} className="ml-4">
                      {String.fromCharCode(65 + optIndex)}) {option}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      );
    }

    return message.content;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <AcademicCapIcon className="h-8 w-8 mr-3 text-primary-600" aria-hidden="true" />
              AI Tutor
            </h1>
            <p className="mt-2 text-gray-600">
              Get personalized help, explanations, and practice questions
            </p>
          </div>
          <button
            onClick={clearChat}
            className="btn btn-outline"
            aria-label="Clear chat history"
          >
            Clear Chat
          </button>
        </div>

        {/* Feature Selection */}
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { id: 'chat', label: 'Chat', icon: SparklesIcon },
            { id: 'explain', label: 'Explain', icon: LightBulbIcon },
            { id: 'practice', label: 'Practice', icon: QuestionMarkCircleIcon },
            { id: 'help', label: 'Homework Help', icon: BookOpenIcon },
          ].map((feature) => (
            <button
              key={feature.id}
              onClick={() => handleQuickAction(feature.id)}
              className={`btn ${
                activeFeature === feature.id ? 'btn-primary' : 'btn-outline'
              } flex items-center`}
              aria-label={`Switch to ${feature.label} mode`}
            >
              <feature.icon className="h-4 w-4 mr-2" aria-hidden="true" />
              {feature.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chat Container */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 h-[600px] flex flex-col">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${
                message.type === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'user'
                    ? 'bg-primary-600 text-white'
                    : message.isError
                    ? 'bg-red-100 text-red-800 border border-red-200'
                    : 'bg-gray-100 text-gray-900'
                }`}
                role="log"
                aria-live="polite"
              >
                <div className="text-sm">
                  {typeof message.content === 'string'
                    ? message.content
                    : formatMessage(message)}
                </div>
                <div
                  className={`text-xs mt-2 ${
                    message.type === 'user'
                      ? 'text-primary-200'
                      : 'text-gray-500'
                  }`}
                >
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg px-4 py-2 flex items-center">
                <LoadingSpinner size="small" />
                <span className="ml-2 text-sm text-gray-600">
                  AI is thinking...
                </span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSendMessage} className="p-6 border-t border-gray-200">
          <div className="flex space-x-4">
            <div className="flex-1">
              <label htmlFor="message-input" className="sr-only">
                Type your message
              </label>
              <input
                ref={inputRef}
                id="message-input"
                type="text"
                placeholder={
                  activeFeature === 'explain'
                    ? 'What would you like me to explain?'
                    : activeFeature === 'practice'
                    ? 'What topic do you want to practice?'
                    : 'Ask me anything about your studies...'
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isLoading}
                className="input border-0 w-full "
                aria-describedby="message-help"
              />
              <p id="message-help" className="sr-only">
                Type your question or request for the AI tutor
              </p>
            </div>
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              className="btn btn-primary flex items-center px-4"
              aria-label="Send message"
            >
              <PaperAirplaneIcon className="h-5 w-5" aria-hidden="true" />
              <span className="sr-only">Send</span>
            </button>
          </div>

          {/* Quick suggestions */}
          <div className="mt-3 flex flex-wrap gap-2">
            {[
              'Explain photosynthesis',
              'Help with algebra homework',
              'Create math practice questions',
              'What is quantum physics?',
            ].map((suggestion) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => setInputMessage(suggestion)}
                disabled={isLoading}
                className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1 rounded-full transition-colors"
                aria-label={`Use suggestion: ${suggestion}`}
              >
                {suggestion}
              </button>
            ))}
          </div>
        </form>
      </div>

      {/* Features Info */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-medium text-blue-900 mb-2 flex items-center">
            <LightBulbIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            How to use AI Tutor
          </h3>
          <ul className="text-blue-700 space-y-1">
            <li>• Ask questions about any subject</li>
            <li>• Request step-by-step explanations</li>
            <li>• Get help with homework problems</li>
            <li>• Generate practice questions</li>
          </ul>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-medium text-green-900 mb-2 flex items-center">
            <SparklesIcon className="h-4 w-4 mr-2" aria-hidden="true" />
            AI Features
          </h3>
          <ul className="text-green-700 space-y-1">
            <li>• Personalized learning assistance</li>
            <li>• Multiple explanation styles</li>
            <li>• Interactive Q&A sessions</li>
            <li>• Adaptive difficulty levels</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AITutorPage;