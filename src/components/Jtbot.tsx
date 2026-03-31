import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Bot, X, RefreshCw, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { cn } from '../lib/utils';

interface Message {
  role: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

export function Jtbot({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'bot',
      content: "Hello! I'm Jtbot, your Verse assistant. How can I help you learn about Crypto today?",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // Convert messages to the format expected by the Gemini Chat API
      const history = messages.slice(1).map(msg => ({
        role: msg.role === 'bot' ? 'model' : 'user',
        parts: [{ text: msg.content }]
      }));

      const response = await fetch('/api/jtbot/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          history: history
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get response from Jtbot');
      }

      const data = await response.json();

      const botMessage: Message = {
        role: 'bot',
        content: data.text || "I'm sorry, I couldn't process that. Please try again.",
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error: any) {
      console.error("Jtbot Error:", error);
      
      let errorMessage = "Oops! I'm having some trouble connecting right now. Please check your internet or try again later.";
      
      // Provide more specific feedback if possible
      if (error.message?.includes('API_KEY') || error.message?.includes('configured')) {
        errorMessage = "Jtbot is currently unavailable due to a server configuration issue. Please contact the administrator.";
      } else if (error.message?.includes('quota')) {
        errorMessage = "I'm a bit overwhelmed with requests right now. Please try again in a minute!";
      }

      setMessages(prev => [...prev, {
        role: 'bot',
        content: errorMessage,
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-[100] bg-[#0a0a0a] flex flex-col max-w-md mx-auto shadow-2xl"
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between bg-nav-bg">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-primary-button/20 flex items-center justify-center text-primary-button">
            <Bot size={24} />
          </div>
          <div>
            <h2 className="font-bold text-lg">Jtbot</h2>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
              <span className="text-xs text-text-secondary">Online</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => {
              setMessages([
                {
                  role: 'bot',
                  content: "Hello! I'm Jtbot, your Verse assistant. How can I help you learn about Crypto today?",
                  timestamp: new Date()
                }
              ]);
            }}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-text-secondary"
            title="Reset Chat"
          >
            <RefreshCw size={20} />
          </button>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth"
      >
        {messages.map((msg, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex gap-3 max-w-[85%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
            )}
          >
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
              msg.role === 'user' ? "bg-primary-button" : "bg-white/10"
            )}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={cn(
              "p-3 rounded-2xl text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-primary-button text-white rounded-tr-none" 
                : "bg-white/5 border border-white/10 rounded-tl-none"
            )}>
              <div className="markdown-body prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
              <span className="text-[10px] opacity-40 mt-1 block">
                {format(msg.timestamp, 'HH:mm')}
              </span>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex gap-3 max-w-[85%] mr-auto">
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
              <RefreshCw size={16} className="animate-spin text-primary-button" />
            </div>
            <div className="p-3 rounded-2xl bg-white/5 border border-white/10 rounded-tl-none">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-primary-button rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-primary-button rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-primary-button rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="p-4 border-t border-white/10 bg-nav-bg">
        <div className="relative flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask Jtbot anything..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-12 focus:outline-none focus:border-primary-button/50 transition-colors text-sm"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className={cn(
              "absolute right-2 p-2 rounded-lg transition-all",
              input.trim() && !isLoading 
                ? "text-primary-button hover:bg-primary-button/10" 
                : "text-text-secondary opacity-50"
            )}
          >
            <Send size={20} />
          </button>
        </div>
        <p className="text-[10px] text-center text-text-secondary mt-3 flex items-center justify-center gap-1">
          <Sparkles size={10} /> Powered by Verse AI
        </p>
      </div>
    </motion.div>
  );
}
