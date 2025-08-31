import React, { useState, useRef, useEffect } from 'react';
import './ChatBot.css';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm your celebrity booking assistant. I can help you navigate our services, book celebrities, understand pricing, and assist with any payment questions. How can I help you today?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [currentPage, setCurrentPage] = useState('');
  const [conversationContext, setConversationContext] = useState({
    lastTopic: null,
    userInterests: [],
    askedQuestions: [],
    sessionStartTime: new Date()
  });
  const [smartSuggestions, setSmartSuggestions] = useState([]);
  const [usedSuggestions, setUsedSuggestions] = useState(new Set());
  const messagesEndRef = useRef(null);

  // Detect current page for context-aware responses
  useEffect(() => {
    const path = window.location.pathname;
    setCurrentPage(path);
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = [
    "What services do you offer?",
    "How do I book a celebrity?",
    "What's the pricing?",
    "Payment options"
  ];

  const getContextualGreeting = () => {
    switch(currentPage) {
      case '/celebrities':
        return "I see you're browsing our celebrities! I can help you find the perfect star for your event or explain the booking process.";
      case '/personalized-videos':
        return "Looking for personalized videos? I can help you understand how to order custom messages from your favorite celebrities!";
      case '/acting-classes':
        return "Interested in acting classes? I can help you find the right coach and explain our booking process for lessons.";
      case '/promotions':
        return "Exploring celebrity promotions? I can explain how to get celebrity endorsements for your brand or product!";
      case '/donations':
        return "Looking to support a cause? I can help you understand how celebrities can help promote charitable donations!";
      case '/podcast-requests':
        return "Want a celebrity on your podcast? I can guide you through our podcast guest booking process!";
      case '/about':
        return "Learning about us? I'm here to answer any questions about our services and how we connect you with celebrities.";
      case '/contact':
        return "Need to get in touch? I can help you right here, or direct you to the best contact method for your needs.";
      case '/services':
        return "Exploring our services? I can explain each offering and help you choose what's right for your needs.";
      default:
        return "Welcome to Celeb Live Access! I can help you navigate our services and find exactly what you're looking for.";
    }
  };

  // Enhanced NLP patterns for better understanding
  const analyzeUserIntent = (message) => {
    const lowerMessage = message.toLowerCase();
    const words = lowerMessage.split(' ');
    
    // Intent classification
    const intents = {
      greeting: ['hello', 'hi', 'hey', 'good morning', 'good afternoon', 'good evening'],
      booking: ['book', 'reserve', 'schedule', 'appointment', 'meeting', 'hire'],
      pricing: ['price', 'cost', 'fee', 'charge', 'expensive', 'cheap', 'affordable', 'rate'],
      services: ['service', 'offer', 'provide', 'available', 'what do you do'],
      payment: ['pay', 'payment', 'bitcoin', 'crypto', 'transaction', 'money'],
      help: ['help', 'assist', 'support', 'guide', 'explain'],
      availability: ['available', 'free', 'busy', 'schedule', 'when'],
      contact: ['contact', 'reach', 'phone', 'email', 'address'],
      thanks: ['thank', 'thanks', 'appreciate', 'grateful']
    };
    
    for (const [intent, keywords] of Object.entries(intents)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return intent;
      }
    }
    
    return 'general';
  };
  
  const updateConversationContext = (userMessage, intent, botResponse) => {
    setConversationContext(prev => ({
      ...prev,
      lastTopic: intent,
      userInterests: [...new Set([...prev.userInterests, intent])],
      askedQuestions: [...prev.askedQuestions, userMessage]
    }));
  };

  const generateSmartSuggestions = (intent, context) => {
    const suggestionMap = {
      greeting: [
        "What celebrities are available?",
        "How does the booking process work?",
        "What are your most popular services?"
      ],
      booking: [
        "What information do you need for booking?",
        "How far in advance should I book?",
        "Can I get a quote first?"
      ],
      pricing: [
        "Do you offer package deals?",
        "What payment methods do you accept?",
        "Are there any additional fees?"
      ],
      services: [
        "Tell me about personalized videos",
        "What about acting classes?",
        "Do you handle corporate events?"
      ],
      payment: [
        "Is Bitcoin payment secure?",
        "Can I pay in installments?",
        "What if I need to cancel?"
      ],
      general: [
        "Show me popular celebrities",
        "What makes your service special?",
        "How do I get started?"
      ]
    };

    return suggestionMap[intent] || suggestionMap.general;
  };

  const getBotResponse = (userMessage, intent) => {
    const responses = {
      greeting: [
        "Hello! I'm excited to help you connect with amazing celebrities. What kind of experience are you looking for?",
        "Hi there! Welcome to Celeb Live Access. I'm here to make your celebrity booking experience seamless and enjoyable.",
        "Great to meet you! I can help you with everything from finding the perfect celebrity to completing your booking."
      ],
      booking: [
        "I'd love to help you book a celebrity! First, let me know what type of event or service you're interested in. Are you looking for a meet & greet, personalized video, acting class, or something else?",
        "Booking a celebrity is easier than you might think! I can guide you through our simple process. What's the occasion and do you have any specific celebrities in mind?",
        "Perfect! Let's get your celebrity booking started. Tell me about your event - is it a birthday, corporate event, or special celebration?"
      ],
      pricing: [
        "Our pricing varies based on the celebrity and service type. Meet & greets typically start at $500, personalized videos from $200, and acting classes from $300. Would you like specific pricing for any celebrity?",
        "Great question! Pricing depends on the celebrity's popularity and the service. I can provide exact quotes once you tell me who you're interested in and what service you need.",
        "We offer competitive pricing across all our services. For the most accurate quote, I'll need to know which celebrity and service you're considering. Shall we start there?"
      ],
      services: [
        "We offer several amazing services: 🎬 Personalized Videos, 🤝 Meet & Greets, 🎭 Acting Classes, 📢 Celebrity Promotions, 💝 Charity Donations, and 🎙️ Podcast Appearances. Which interests you most?",
        "Our services are designed to create unforgettable experiences! We specialize in personalized videos, exclusive meet & greets, professional acting coaching, brand promotions, charitable partnerships, and podcast bookings.",
        "I'm excited to tell you about our services! We connect you with celebrities for personalized content, in-person meetings, professional training, marketing campaigns, charity events, and media appearances. What sounds most appealing?"
      ],
      payment: [
        "We accept multiple payment methods including credit cards, PayPal, and Bitcoin for your convenience. All transactions are secure and protected. We also offer payment plans for larger bookings. 💳\n\nFor Bitcoin payments, here's a helpful tutorial: https://youtu.be/dQw4w9WgXcQ",
        "Payment is simple and secure! We support traditional methods like cards and PayPal, plus modern options like Bitcoin. You'll receive confirmation immediately after payment.",
        "We've made payment easy with multiple options including cryptocurrency! All payments are processed securely, and you'll get instant confirmation with booking details."
      ],
      help: [
        "I'm here to help with anything you need! I can explain our services, help you choose the right celebrity, guide you through booking, answer pricing questions, or assist with payments. What would be most helpful?",
        "Absolutely! I can assist with celebrity selection, booking procedures, pricing information, payment options, or any other questions. Just let me know what you'd like to explore first.",
        "I'd be happy to help! Whether you need guidance on our services, help choosing a celebrity, booking assistance, or payment support, I'm here for you. What can I clarify?"
      ],
      availability: [
        "Celebrity availability varies, but I can check real-time schedules for you! Most of our stars can accommodate bookings within 2-4 weeks. Do you have specific dates or a particular celebrity in mind?",
        "Great question! Availability depends on the celebrity and service type. Popular stars may need more advance notice, while others might be available sooner. Shall I check availability for someone specific?",
        "I can help you check availability! Most celebrities update their schedules regularly. If you tell me who you're interested in and your preferred timeframe, I can provide current availability."
      ],
      contact: [
        "You can reach our team several ways: 📧 Email us at support@celebliveaccess.com, 📞 Call (555) 123-CELEB, or continue chatting with me right here! I can handle most questions immediately.",
        "I'm your direct line to our team! For immediate help, keep chatting with me. For complex bookings, email support@celebliveaccess.com or call our booking hotline at (555) 123-CELEB.",
        "You're already in the right place! I can answer most questions instantly. For specialized requests, our team is available at support@celebliveaccess.com or (555) 123-CELEB."
      ],
      thanks: [
        "You're very welcome! I'm here whenever you need assistance. Is there anything else I can help you with today?",
        "My pleasure! I love helping people connect with their favorite celebrities. Feel free to ask if you have any other questions!",
        "Happy to help! That's what I'm here for. Don't hesitate to reach out if you need anything else."
      ],
      general: [
        "I'd be happy to help you with that! Could you tell me a bit more about what you're looking for? Are you interested in booking a celebrity, learning about our services, or something else?",
        "That's a great question! To give you the most helpful information, could you let me know what specific aspect of our celebrity services interests you most?",
        "I want to make sure I give you exactly the information you need. Could you help me understand what you'd like to know more about?"
      ]
    };

    const responseArray = responses[intent] || responses.general;
    return responseArray[Math.floor(Math.random() * responseArray.length)];
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);
    setSmartSuggestions([]);

    // Analyze user intent
    const intent = analyzeUserIntent(inputValue);
    
    // Simulate API delay
    setTimeout(() => {
      const botResponse = getBotResponse(inputValue, intent);
      const botMessage = {
        id: Date.now() + 1,
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
      
      // Update conversation context
      updateConversationContext(inputValue, intent, botResponse);
      
      // Generate smart suggestions (filtered)
      setUsedSuggestions(currentUsed => {
        const allSuggestions = generateSmartSuggestions(intent, conversationContext);
        const filteredSuggestions = allSuggestions.filter(suggestion => !currentUsed.has(suggestion));
        setSmartSuggestions(filteredSuggestions);
        return currentUsed;
      });
    }, 1000 + Math.random() * 1000);
  };

  const handleQuickReply = (reply) => {
    // Clear suggestions immediately
    setSmartSuggestions([]);
    
    // Add user message
    const userMessage = {
      id: Date.now(),
      text: reply,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    
    // Add to used suggestions to prevent reappearing
    setUsedSuggestions(prev => {
      const newUsedSuggestions = new Set([...prev, reply]);
      
      // Process bot response after a delay
      setTimeout(() => {
        const intent = analyzeUserIntent(reply);
        const botResponse = getBotResponse(reply, intent);
        const botMessage = {
          id: Date.now() + 1,
          text: botResponse,
          sender: 'bot',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botMessage]);
        setIsTyping(false);
        
        // Update conversation context
        updateConversationContext(reply, intent, botResponse);
        
        // Generate new smart suggestions (filtered)
        const allSuggestions = generateSmartSuggestions(intent, conversationContext);
        const filteredSuggestions = allSuggestions.filter(suggestion => !newUsedSuggestions.has(suggestion));
        setSmartSuggestions(filteredSuggestions);
      }, 800 + Math.random() * 800);
      
      return newUsedSuggestions;
    });
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {isOpen && (
        <div className="chatbot-window">
          {/* Modern Header */}
          <div className="chatbot-header">
            <div className="bot-info">
              <div className="bot-avatar">
                🤖
              </div>
              <div className="bot-details">
                <h3>Celebrity Assistant</h3>
                <div className="bot-status">
                  <div className="status-indicator"></div>
                  Online now
                </div>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div className="chatbot-messages">
            {messages.map((message) => (
              <div key={message.id} className={`message ${message.sender}`}>
                <div className="message-content">
                  {message.text.includes('https://youtu.be/') ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', wordWrap: 'break-word', overflowWrap: 'break-word' }}>
                      <span>{message.text.split('https://youtu.be/')[0]}</span>
                      <a 
                        href={`https://youtu.be/${message.text.split('https://youtu.be/')[1].split(' ')[0]}`}
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="video-link"
                      >
                        🎥 Watch Payment Help Video
                      </a>
                      {message.text.split('https://youtu.be/')[1] && message.text.split('https://youtu.be/')[1].includes(' ') && 
                        <span>{message.text.split('https://youtu.be/')[1].split(' ').slice(1).join(' ')}</span>
                      }
                    </div>
                  ) : (
                    <span style={{ wordWrap: 'break-word', overflowWrap: 'break-word', whiteSpace: 'pre-wrap' }}>{message.text}</span>
                  )}
                </div>
                <div className="message-time">
                  {message.timestamp.toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="message bot typing">
                <div className="message-content">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Smart Suggestions */}
          {smartSuggestions.length > 0 && (
            <div className="quick-replies">
              <div className="suggestions-header">Suggested questions:</div>
              {smartSuggestions.map((suggestion, index) => (
                <button 
                  key={index}
                  className="quick-reply-btn" 
                  onClick={() => handleQuickReply(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
          
          {/* Default Quick Replies when no smart suggestions */}
          {smartSuggestions.length === 0 && messages.length <= 2 && (
            <div className="quick-replies">
              {quickReplies.map((reply, index) => (
                <button 
                  key={index}
                  className="quick-reply-btn"
                  onClick={() => handleQuickReply(reply)}
                >
                  {reply}
                </button>
              ))}
            </div>
          )}

          {/* Input Area */}
          <div className="chatbot-input">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message..."
              className="message-input"
            />
            <button 
              onClick={handleSendMessage}
              className="send-btn"
              disabled={!inputValue.trim()}
            >
              ➤
            </button>
          </div>
        </div>
      )}

      {/* Floating Toggle Button */}
      <button 
        className={`chatbot-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? '✕' : '💬'}
        {!isOpen && <div className="notification-dot"></div>}
      </button>
    </div>
  );
};

export default ChatBot;