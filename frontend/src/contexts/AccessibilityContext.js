import React, { createContext, useContext, useState, useEffect } from 'react';

const AccessibilityContext = createContext();

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};

export const AccessibilityProvider = ({ children }) => {
  const [screenReaderEnabled, setScreenReaderEnabled] = useState(() => {
    return localStorage.getItem('screenReader') === 'true' || 
           window.navigator.userAgent.includes('NVDA') ||
           window.navigator.userAgent.includes('JAWS') ||
           window.speechSynthesis;
  });

  const [keyboardNavigation, setKeyboardNavigation] = useState(false);
  const [announcements, setAnnouncements] = useState([]);
  const [focusVisible, setFocusVisible] = useState(true);

  useEffect(() => {
    // Detect keyboard navigation
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        setKeyboardNavigation(true);
        document.body.classList.add('keyboard-navigation');
      }
    };

    const handleMouseDown = () => {
      setKeyboardNavigation(false);
      document.body.classList.remove('keyboard-navigation');
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('mousedown', handleMouseDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('mousedown', handleMouseDown);
    };
  }, []);

  useEffect(() => {
    localStorage.setItem('screenReader', screenReaderEnabled.toString());
  }, [screenReaderEnabled]);

  const announce = (message, priority = 'polite') => {
    const announcement = {
      id: Date.now(),
      message,
      priority,
      timestamp: new Date()
    };
    
    setAnnouncements(prev => [...prev, announcement]);
    
    // Remove announcement after it's been read
    setTimeout(() => {
      setAnnouncements(prev => prev.filter(a => a.id !== announcement.id));
    }, 5000);

    // If screen reader is enabled, also use speech synthesis as backup
    if (screenReaderEnabled && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const speakText = (text) => {
    if (window.speechSynthesis && screenReaderEnabled) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  };

  const stopSpeaking = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
  };

  const enableScreenReader = () => {
    setScreenReaderEnabled(true);
    announce('Screen reader support enabled');
  };

  const disableScreenReader = () => {
    setScreenReaderEnabled(false);
    stopSpeaking();
  };

  const toggleFocusVisible = () => {
    setFocusVisible(prev => {
      const newValue = !prev;
      if (newValue) {
        document.body.classList.add('focus-visible');
      } else {
        document.body.classList.remove('focus-visible');
      }
      return newValue;
    });
  };

  const value = {
    screenReaderEnabled,
    keyboardNavigation,
    announcements,
    focusVisible,
    announce,
    speakText,
    stopSpeaking,
    enableScreenReader,
    disableScreenReader,
    toggleFocusVisible,
    setScreenReaderEnabled
  };

  return (
    <AccessibilityContext.Provider value={value}>
      {children}
      
      {/* Live region for announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {announcements
          .filter(a => a.priority === 'polite')
          .map(a => a.message)
          .join('. ')}
      </div>
      
      <div className="sr-only" role="alert" aria-live="assertive" aria-atomic="true">
        {announcements
          .filter(a => a.priority === 'assertive')
          .map(a => a.message)
          .join('. ')}
      </div>
    </AccessibilityContext.Provider>
  );
};