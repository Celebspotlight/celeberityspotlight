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

  const getBotResponse = (userMessage) => {
    const message = userMessage.toLowerCase();
    
    // Enhanced service overview
    if (message.includes('services') || message.includes('what do you offer') || message.includes('available')) {
      return "We offer 5 main services:\n\n🎥 **Personalized Videos** - Custom celebrity messages for any occasion\n🎭 **Acting Classes** - Learn from professional coaches\n📢 **Promotions** - Celebrity endorsements for your brand\n❤️ **Donations** - Celebrity support for charitable causes\n🎙️ **Podcast Requests** - Book celebrities as podcast guests\n\nWhich service interests you most?";
    }
    
    // Payment-related responses with video link
    if (message.includes('payment') || message.includes('pay') || message.includes('card') || message.includes('billing') || message.includes('bitcoin') || message.includes('crypto')) {
      return "We accept multiple payment methods including credit cards, PayPal, and Bitcoin for your convenience. If you're having payment issues or want to learn about alternative payment options, check out this helpful video: https://youtu.be/fDjDH_WAvYI?si=UMDm8bF_Y-WSvtFK";
    }
    
    // Context-aware booking responses
    if (message.includes('book') || message.includes('booking') || message.includes('how to book')) {
      let response = "To book a celebrity, ";
      if (currentPage === '/celebrities') {
        response += "simply select your preferred star on this page and click 'Book Now'. ";
      } else if (currentPage === '/personalized-videos') {
        response += "choose a celebrity from our personalized videos section and select your message type. ";
      } else if (currentPage === '/acting-classes') {
        response += "select an acting coach and choose your preferred class format. ";
      } else if (currentPage === '/promotions') {
        response += "browse our promotion packages and select the celebrity endorsement that fits your needs. ";
      } else if (currentPage === '/donations') {
        response += "choose a celebrity supporter and select your charitable cause. ";
      } else if (currentPage === '/podcast-requests') {
        response += "select a celebrity and specify your podcast details and preferred topics. ";
      } else {
        response += "visit our Celebrities page, select your preferred star, and click 'Book Now'. ";
      }
      response += "Our team will contact you within 24 hours to discuss details and pricing.";
      return response;
    }
    
    // Enhanced pricing responses
    if (message.includes('price') || message.includes('cost') || message.includes('pricing') || message.includes('expensive') || message.includes('cheap') || message.includes('how much')) {
      let response = "Celebrity booking prices vary based on the star's popularity, event type, and duration. ";
      if (currentPage === '/personalized-videos') {
        response += "Personalized videos typically range from $50-$500 depending on the celebrity. ";
      } else if (currentPage === '/acting-classes') {
        response += "Acting classes range from $100-$300 per session depending on the coach's experience. ";
      } else if (currentPage === '/promotions') {
        response += "Promotion packages range from $500-$5000+ depending on the celebrity and campaign scope. ";
      } else if (currentPage === '/donations') {
        response += "Donation campaigns vary based on the celebrity's involvement level and cause visibility. ";
      } else if (currentPage === '/podcast-requests') {
        response += "Podcast guest appearances range from $200-$2000+ depending on the celebrity and podcast reach. ";
      }
      response += "We offer competitive rates and flexible packages. Contact us for detailed quotes!";
      return response;
    }
    
    // Personalized Videos specific
    if (message.includes('personalized') || message.includes('video') || message.includes('message') || message.includes('custom')) {
      if (currentPage === '/personalized-videos') {
        return "You're in the right place! Browse our celebrities here and click on any star to order a personalized video message. Choose from birthday wishes, congratulations, motivational messages, holiday greetings, and more! Videos are typically delivered within 7 days.";
      }
      return "Our personalized video service lets you get custom messages from celebrities for any occasion! We offer birthday wishes, congratulations, motivational messages, holiday greetings, and more. Visit our Personalized Videos page to browse available stars and message types.";
    }
    
    // Acting Classes specific
    if (message.includes('acting') || message.includes('class') || message.includes('lesson') || message.includes('coach') || message.includes('learn') || message.includes('training')) {
      if (currentPage === '/acting-classes') {
        return "Perfect! You can see all our acting coaches on this page. Each coach offers different specialties like method acting, scene study, audition prep, and character development. Choose between 1-on-1 sessions or group classes. Click 'Book Class' to schedule your session!";
      }
      return "Our acting classes connect you with professional coaches for personalized instruction. We offer method acting, scene study, audition preparation, and character development. Choose between private lessons or group sessions. Visit our Acting Classes page to browse coaches and book your session.";
    }
    
    // Promotions specific
    if (message.includes('promotion') || message.includes('endorsement') || message.includes('brand') || message.includes('marketing') || message.includes('advertise')) {
      if (currentPage === '/promotions') {
        return "Great choice for brand promotion! Our celebrities can provide social media endorsements, product placements, brand ambassadorships, and campaign appearances. We offer packages for different budgets and campaign goals. Select a celebrity and promotion type to get started!";
      }
      return "Our promotion services help brands connect with celebrity endorsers for authentic marketing campaigns. We offer social media endorsements, product placements, brand ambassadorships, and event appearances. Visit our Promotions page to explore options and celebrity partners.";
    }
    
    // Donations specific
    if (message.includes('donation') || message.includes('charity') || message.includes('cause') || message.includes('fundraising') || message.includes('nonprofit')) {
      if (currentPage === '/donations') {
        return "Supporting a great cause! Our celebrities can help amplify your charitable efforts through social media campaigns, fundraising events, awareness videos, and personal endorsements. Many of our stars are passionate about giving back. Choose a celebrity who aligns with your cause!";
      }
      return "Our donation service connects charitable causes with celebrity supporters. Celebrities can help through social media campaigns, fundraising events, awareness videos, and personal endorsements. Visit our Donations page to find celebrities who support causes like yours.";
    }
    
    // Podcast specific
    if (message.includes('podcast') || message.includes('interview') || message.includes('guest') || message.includes('show') || message.includes('episode')) {
      if (currentPage === '/podcast-requests') {
        return "Excellent! You're looking to book celebrity podcast guests. Our stars can appear on your show to discuss their careers, projects, causes they support, or topics they're passionate about. Specify your podcast format, audience size, and preferred topics when booking. Most interviews can be done remotely!";
      }
      return "Our podcast request service helps you book celebrity guests for your show. Stars can discuss their careers, current projects, causes they support, or share their expertise. We accommodate various formats and can arrange remote interviews. Visit our Podcast Requests page to browse available guests.";
    }
    
    // Navigation help
    if (message.includes('navigate') || message.includes('find') || message.includes('where') || message.includes('how to get to')) {
      return `${getContextualGreeting()} Use the navigation menu to explore different sections:\n\n• **Celebrities** - Browse our talent roster\n• **Services** - Explore all our offerings\n• **About** - Learn about our company\n• **Contact** - Get in touch with us\n\nTell me what you're looking for and I'll guide you there!`;
    }
    
    // Contact and support
    if (message.includes('contact') || message.includes('support') || message.includes('help') || message.includes('problem') || message.includes('issue')) {
      return "I'm here to help! You can reach our support team at +1 (555) 123-4567 or info@celebliveaccess.com. We're available 24/7 to assist with bookings, payments, or any questions. For payment issues, this video might help: https://youtu.be/fDjDH_WAvYI?si=UMDm8bF_Y-WSvtFK";
    }
    
    // Availability and celebrities
    if (message.includes('available') || message.includes('celebrities') || message.includes('stars') || message.includes('who do you have')) {
      if (currentPage === '/celebrities') {
        return "You can see all our available celebrities right here on this page! We have actors, musicians, athletes, influencers, and content creators. Use the category filters to find exactly who you're looking for. Each celebrity offers different services - check their profiles for details!";
      }
      return "We have a diverse roster of celebrities including A-list actors, chart-topping musicians, professional athletes, social media influencers, and content creators. Each offers different services across our platform. Check our Celebrities page to see our current roster and availability.";
    }
    
    // Greeting responses
    if (message.includes('hello') || message.includes('hi') || message.includes('hey') || message.includes('good morning') || message.includes('good afternoon')) {
      return `Hello! ${getContextualGreeting()} I can help you with:\n\n• Service information and comparisons\n• Booking process and requirements\n• Pricing and payment options\n• Celebrity availability\n• Technical support\n\nWhat can I help you with today?`;
    }
    
    // Thank you responses
    if (message.includes('thank') || message.includes('thanks') || message.includes('appreciate')) {
      return "You're very welcome! I'm always here to help you navigate our celebrity booking services. If you have any other questions about our Personalized Videos, Acting Classes, Promotions, Donations, or Podcast Requests, just ask!";
    }
    
    // Default response with context and suggestions
    return `${getContextualGreeting()} I can help you with:\n\n🎥 **Personalized Videos** - Custom celebrity messages\n🎭 **Acting Classes** - Professional coaching\n📢 **Promotions** - Brand endorsements\n❤️ **Donations** - Charitable campaigns\n🎙️ **Podcast Requests** - Celebrity guests\n\nI can also assist with bookings, pricing, payments, or any other questions. What would you like to know?`;
  };

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsTyping(true);

    // Simulate bot typing delay
    setTimeout(() => {
      const botResponse = {
        id: messages.length + 2,
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
    }, 1500);
  };

  const handleQuickReply = (reply) => {
    setInputValue(reply);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      {/* Chat Window */}
      {isOpen && (
        <div className="chatbot-window">
          <div className="chatbot-header">
            <div className="bot-info">
              <div className="bot-avatar">🤖</div>
              <div>
                <h4>Celebrity Assistant</h4>
                <span className="status">Online • Context-Aware</span>
              </div>
            </div>
            <button 
              className="close-btn"
              onClick={() => setIsOpen(false)}
            >
              ✕
            </button>
          </div>

          <div className="chatbot-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender}`}
              >
                <div className="message-content">
                  {message.text.split('\n').map((line, index) => (
                    <div key={index}>
                      {line.includes('https://youtu.be/') ? (
                        <>
                          {line.split('https://youtu.be/')[0]}
                          <a 
                            href={`https://youtu.be/${line.split('https://youtu.be/')[1]}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="video-link"
                          >
                            🎥 Watch Payment Help Video
                          </a>
                          {line.split('https://youtu.be/')[1] && line.split('https://youtu.be/')[1].includes(' ') && 
                            line.split('https://youtu.be/')[1].split(' ').slice(1).join(' ')
                          }
                        </>
                      ) : (
                        line
                      )}
                    </div>
                  ))}
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

          {/* Quick Replies */}
          {messages.length <= 2 && (
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

      {/* Floating Button */}
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