import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, AlertCircle, Sparkles } from 'lucide-react';

const QUICK_ACTIONS = [
  '💡 What is SIP and how does it work?',
  '📊 Explain mutual funds vs stocks',
  '🏦 How to start investing in India?',
  '💰 I earn 80000, spent 15000 rent, 5000 food, 3000 electricity',
];

export default function ChatBot() {
  const [messages, setMessages] = useState([
    { role: 'assistant', text: 'Hello! I\'m your **FinSmart AI Assistant**. Ask me finance questions or share your income & expenses for analysis.' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMessage.trim() }]);
    setLoading(true);
    try {
      const res = await axios.post('http://localhost:8000/api/finance_rag/query', { query: userMessage.trim() });
      const data = res.data;
      let bot = '';
      if (data.type === 'general_finance_question' || data.type === 'general_answer') {
        bot = data.response;
      } else if (data.type === 'personal_finance_data') {
        bot = `### 📊 Financial Summary\n| Metric | Value |\n|---|---|\n| Income | ₹${data.cash_flow_summary?.total_income?.toLocaleString()} |\n| Expenses | ₹${data.cash_flow_summary?.total_expenses?.toLocaleString()} |\n| Net Savings | ₹${data.cash_flow_summary?.net_savings?.toLocaleString()} (${data.cash_flow_summary?.savings_percentage}%) |\n\n### 💡 AI Guidance\n${data.investment_guidance}`;
      } else if (data.type === 'unclear') {
        bot = data.response || "I didn't quite catch that. Could you share specific financial data or ask a clear finance question?";
      } else {
        bot = data.response || JSON.stringify(data, null, 2);
      }
      setMessages(prev => [...prev, { role: 'assistant', text: bot }]);
    } catch (err) {
      setMessages(prev => [...prev, { role: 'error', text: err.response?.data?.detail || 'Failed to connect to AI engine.' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => { e.preventDefault(); sendMessage(input); };

  return (
    <div className="container" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
        <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', background: 'rgba(63,185,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={20} color="var(--success-color)" />
        </div>
        <div>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>AI Financial Assistant</h1>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Powered by Nvidia Llama 3 + RAG</span>
        </div>
      </div>

      {/* Chat Area */}
      <div className="glass-card-static" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, i) => {
            const isUser = msg.role === 'user';
            const isErr = msg.role === 'error';

            return (
              <div key={i} style={{ display: 'flex', gap: '0.6rem', alignSelf: isUser ? 'flex-end' : 'flex-start', maxWidth: '80%', animation: 'fadeIn 0.25s ease-out' }}>
                {!isUser && (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: isErr ? 'rgba(248,81,73,0.12)' : 'rgba(63,185,80,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isErr ? 'var(--danger-color)' : 'var(--success-color)',
                  }}>
                    {isErr ? <AlertCircle size={16} /> : <Bot size={16} />}
                  </div>
                )}
                <div style={{
                  padding: '0.75rem 1rem',
                  borderRadius: isUser ? '12px 12px 2px 12px' : '12px 12px 12px 2px',
                  background: isUser ? 'linear-gradient(135deg, #58a6ff, #3b82f6)' : isErr ? 'rgba(248,81,73,0.06)' : 'rgba(255,255,255,0.04)',
                  color: isUser ? '#fff' : isErr ? 'var(--danger-color)' : 'var(--text-primary)',
                  fontSize: '0.9rem',
                  lineHeight: 1.65,
                  border: isUser ? 'none' : `1px solid ${isErr ? 'rgba(248,81,73,0.1)' : 'var(--border-color)'}`,
                }}>
                  {isUser ? msg.text : (
                    <div className="chat-markdown">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>
                {isUser && (
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.08)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-secondary)',
                  }}>
                    <User size={16} />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div style={{ display: 'flex', gap: '0.6rem', alignSelf: 'flex-start' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(63,185,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success-color)' }}>
                <Bot size={16} />
              </div>
              <div style={{ padding: '0.75rem 1rem', background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border-color)', borderRadius: '12px 12px 12px 2px', display: 'flex', gap: '4px', alignItems: 'center' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'pulse 1s ease-in-out infinite' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'pulse 1s ease-in-out 0.2s infinite' }} />
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'pulse 1s ease-in-out 0.4s infinite' }} />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && !loading && (
          <div style={{ padding: '0 1.25rem 0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {QUICK_ACTIONS.map((q, i) => (
              <button key={i} onClick={() => sendMessage(q.replace(/^[^\s]+\s/, ''))} className="btn-ghost" style={{
                fontSize: '0.78rem', padding: '0.4rem 0.75rem',
                border: '1px solid var(--border-color)', borderRadius: '999px',
                color: 'var(--text-secondary)', cursor: 'pointer',
                background: 'rgba(255,255,255,0.02)',
                transition: 'all 0.15s'
              }}>
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.6rem' }}>
            <input
              type="text"
              className="input-control"
              placeholder="Ask anything about finance..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{ flex: 1, height: '44px' }}
            />
            <button type="submit" className="btn btn-primary" disabled={loading || !input.trim()} style={{ height: '44px', padding: '0 1.25rem' }}>
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>

      <style>{`
                .chat-markdown p { margin: 0 0 0.4rem; }
                .chat-markdown p:last-child { margin: 0; }
                .chat-markdown strong { color: #e6edf3; }
                .chat-markdown h3 { font-size: 0.95rem; margin: 0.5rem 0 0.3rem; color: var(--accent-color); }
                .chat-markdown ul, .chat-markdown ol { padding-left: 1.25rem; margin: 0.3rem 0; }
                .chat-markdown li { margin-bottom: 0.15rem; }
                .chat-markdown table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; font-size: 0.85rem; }
                .chat-markdown th { text-align: left; padding: 0.4rem 0.6rem; background: rgba(88,166,255,0.06); color: var(--accent-color); border: 1px solid rgba(255,255,255,0.06); }
                .chat-markdown td { padding: 0.35rem 0.6rem; border: 1px solid rgba(255,255,255,0.04); }
                .chat-markdown code { background: rgba(255,255,255,0.07); padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
            `}</style>
    </div>
  );
}
