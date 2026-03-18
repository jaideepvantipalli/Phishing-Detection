import { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, User, Shield, AlertCircle, Trash2 } from 'lucide-react';
import groq from '../services/groq';
import Button from './Button';

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hello! I am PhishGuard AI. How can I help you with your security or phishing-related questions today?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  const clearHistory = () => {
    setMessages([
      { role: 'assistant', content: 'History cleared. How can I help you now?' }
    ]);
  };

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);

    try {
      const response = await groq.chat([...messages, userMessage]);
      setMessages(prev => [...prev, response]);
    } catch (err) {
      setError(err.message || 'Failed to get response');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat window */}
      {isOpen && (
        <div className="absolute bottom-20 right-0 w-[400px] h-[550px] max-w-[calc(100vw-3rem)] max-h-[calc(100vh-10rem)] bg-cyber-card border border-cyber-border rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in-up">
          {/* Header */}
          <div className="p-4 border-b border-cyber-border bg-cyber-darker flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-lg bg-cyber-accent/10">
                <Shield className="w-5 h-5 text-cyber-accent" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white leading-tight">PhishGuard AI</h3>
                <p className="text-[10px] text-cyber-accent font-medium">Security Expert</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={clearHistory}
                title="Clear Chat History"
                className="p-2 text-cyber-muted hover:text-cyber-danger transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 text-cyber-muted hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-cyber-border"
          >
            {messages.map((msg, i) => (
              <div 
                key={i} 
                className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  msg.role === 'user' ? 'bg-cyber-info/20 text-cyber-info' : 'bg-cyber-accent/20 text-cyber-accent'
                }`}>
                  {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>
                <div className={`p-3 rounded-2xl max-w-[80%] text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-cyber-info/10 text-white rounded-tr-none' 
                    : 'bg-cyber-darker text-cyber-text rounded-tl-none border border-cyber-border/50'
                }`}>
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-cyber-accent/20 text-cyber-accent flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-cyber-darker text-cyber-text p-3 rounded-2xl rounded-tl-none border border-cyber-border/50 flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-cyber-accent/50 rounded-full animate-bounce" />
                  <div className="w-1.5 h-1.5 bg-cyber-accent/50 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <div className="w-1.5 h-1.5 bg-cyber-accent/50 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            )}
            {error && (
              <div className="p-3 bg-cyber-danger/10 border border-cyber-danger/30 rounded-xl flex gap-3 text-xs text-cyber-danger">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 border-t border-cyber-border bg-cyber-darker">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                placeholder="Ask about security..."
                className="w-full bg-cyber-card border border-cyber-border rounded-xl px-4 py-3 pr-12 text-sm text-white focus:outline-none focus:border-cyber-accent/50 transition-colors"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyber-accent hover:text-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 ${
          isOpen 
            ? 'bg-cyber-card text-white border border-cyber-border' 
            : 'bg-cyber-accent text-cyber-dark hover:scale-110 active:scale-95 shadow-cyber-accent/20'
        }`}
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>
    </div>
  );
}
