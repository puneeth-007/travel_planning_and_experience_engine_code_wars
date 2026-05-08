import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';

const ChatAssistant = ({ setItinerary, setIsProcessing }) => {
  const [messages, setMessages] = useState([
    { id: 1, role: 'assistant', text: 'Hello! I am your AI Travel Assistant. Where would you like to go today?' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    const newMessage = { id: Date.now(), role: 'user', text: userMessage };
    setMessages(prev => [...prev, newMessage]);
    setInput('');
    setIsTyping(true);
    setIsProcessing(true); // Tell the main app we are loading data

    try {
      // Small artificial delay to feel more natural
      await new Promise(resolve => setTimeout(resolve, 800));

      const response = await fetch('http://localhost:8000/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, context: {} })
      });
      const data = await response.json();
      
      setIsTyping(false);
      setIsProcessing(false);
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'assistant', text: data.reply }]);
      
      // Set the generated itinerary from the AI model response
      if (data.itinerary && Array.isArray(data.itinerary) && data.itinerary.length > 0) {
         setItinerary(data.itinerary);
      }
    } catch (error) {
      console.error('Error communicating with backend:', error);
      setIsTyping(false);
      setIsProcessing(false);
      setMessages(prev => [...prev, { id: Date.now() + 2, role: 'assistant', text: 'Sorry, I am having trouble connecting to the server.' }]);
    }
  };

  return (
    <div className="chat-container">
      <div className="chat-messages">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3 }}
              className={`message ${msg.role}`}
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}
            >
              {msg.role === 'assistant' && (
                <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '6px', borderRadius: '50%', color: 'var(--accent-color)', flexShrink: 0 }}>
                  <Bot size={18} />
                </div>
              )}
              
              <div style={{ flex: 1, marginTop: '2px' }}>
                {msg.text}
              </div>

              {msg.role === 'user' && (
                <div style={{ background: 'rgba(255, 255, 255, 0.2)', padding: '6px', borderRadius: '50%', color: 'white', flexShrink: 0 }}>
                  <User size={18} />
                </div>
              )}
            </motion.div>
          ))}
          
          {isTyping && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="message assistant"
              style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}
            >
              <div style={{ background: 'rgba(59, 130, 246, 0.15)', padding: '6px', borderRadius: '50%', color: 'var(--accent-color)', flexShrink: 0 }}>
                <Bot size={18} />
              </div>
              <div className="typing-indicator">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div ref={messagesEndRef} />
      </div>
      
      <form className="chat-input-area" onSubmit={handleSend}>
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask me to plan a trip..." 
          disabled={isTyping}
        />
        <button type="submit" className="send-btn" aria-label="Send message" disabled={isTyping}>
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};

export default ChatAssistant;
