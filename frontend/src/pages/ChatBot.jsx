import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, AlertCircle, Paperclip, X, FileText, CheckCircle, Sparkles, MessageSquare } from 'lucide-react';

const QUICK_ACTIONS_GENERAL = [
  '💡 What is SIP and how does it work?',
  '📊 Explain mutual funds vs stocks',
  '🏦 How to start investing in India?',
  '💰 I earn 80000, spent 15000 rent, 5000 food',
];

const QUICK_ACTIONS_DOC = [
  '📋 Summarize this document',
  '📈 What are the key financial highlights?',
  '💡 What risks are mentioned?',
  '🔍 What are the main recommendations?',
];

const USER_ID = crypto.randomUUID();

export default function ChatBot() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I'm your **FinSmart AI Assistant**.\n\n- 💬 **General mode**: Ask any finance question or share your income & expenses\n- 📄 **Document mode**: Upload a PDF, TXT, or CSV to ask questions about it",
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  // Document / RAG state
  const [sessionId, setSessionId] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // ───────────────────────── File upload logic ─────────────────────────
  const processFile = async (file) => {
    if (!file) return;

    const allowed = ['application/pdf', 'text/plain', 'text/csv'];
    const allowedExt = ['.pdf', '.txt', '.csv'];
    const ext = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!allowed.includes(file.type) && !allowedExt.includes(ext)) {
      pushSystemMessage('error', `❌ Unsupported file type. Please upload a PDF, TXT, or CSV.`);
      return;
    }

    setUploading(true);
    pushSystemMessage('system', `📄 Uploading **${file.name}**…`);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('user_id', USER_ID);

    try {
      const res = await axios.post('http://localhost:8000/api/rag/ingest', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const { session_id, chunks_ingested } = res.data;
      setSessionId(session_id);
      setUploadedFileName(file.name);
      pushSystemMessage(
        'success',
        `✅ **${file.name}** indexed successfully (${chunks_ingested} chunks). You can now ask questions about this document.`
      );
    } catch (err) {
      const detail = err.response?.data?.detail || err.message;
      pushSystemMessage('error', `❌ Upload failed: ${detail}`);
    } finally {
      setUploading(false);
    }
  };

  const handleFileInput = (e) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const clearDocument = () => {
    setSessionId(null);
    setUploadedFileName(null);
    pushSystemMessage('system', '🔄 Document cleared. Back to **General Finance** mode.');
  };

  // ───────────────────────── Messaging logic ─────────────────────────
  const pushSystemMessage = (role, text) => {
    setMessages((prev) => [...prev, { role, text }]);
  };

  const sendMessage = async (userMessage) => {
    if (!userMessage.trim()) return;
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', text: userMessage.trim() }]);
    setLoading(true);

    try {
      let bot = '';

      if (sessionId) {
        const res = await axios.post('http://localhost:8000/api/rag/query', {
          question: userMessage.trim(),
          user_id: USER_ID,
          session_id: sessionId,
        });
        const data = res.data;
        bot = data.answer || 'No answer returned.';
        if (data.sources?.length) {
          bot += `\n\n---\n📎 *Sources:* ${data.sources.join(' · ')}`;
        }
      } else {
        const res = await axios.post('http://localhost:8000/api/finance_rag/query', {
          query: userMessage.trim(),
        });
        const data = res.data;
        if (data.type === 'general_finance_question' || data.type === 'general_answer') {
          bot = data.response;
        } else if (data.type === 'personal_finance_data') {
          bot = `### 📊 Financial Summary\n| Metric | Value |\n|---|---|\n| Income | ₹${data.cash_flow_summary?.total_income?.toLocaleString()} |\n| Expenses | ₹${data.cash_flow_summary?.total_expenses?.toLocaleString()} |\n| Net Savings | ₹${data.cash_flow_summary?.net_savings?.toLocaleString()} (${data.cash_flow_summary?.savings_percentage}%) |\n\n### 💡 AI Guidance\n${data.investment_guidance}`;
        } else if (data.type === 'unclear') {
          bot = data.response || "I didn't quite catch that. Could you share specific financial data or ask a clear finance question?";
        } else {
          bot = data.response || JSON.stringify(data, null, 2);
        }
      }

      setMessages((prev) => [...prev, { role: 'assistant', text: bot }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'error', text: err.response?.data?.detail || 'Failed to connect to AI engine.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  // ───────────────────────── Helpers ─────────────────────────
  const quickActions = sessionId ? QUICK_ACTIONS_DOC : QUICK_ACTIONS_GENERAL;

  const getBubbleStyle = (role) => {
    if (role === 'user') return { background: 'linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))', color: '#050505', border: 'none', boxShadow: '0 4px 15px rgba(0, 242, 254, 0.2)' };
    if (role === 'error') return { background: 'var(--danger-glow)', color: 'var(--danger)', border: '1px solid rgba(255,0,85,0.2)' };
    if (role === 'success') return { background: 'var(--success-glow)', color: 'var(--success)', border: '1px solid rgba(0,255,135,0.2)' };
    if (role === 'system') return { background: 'rgba(255,255,255,0.03)', color: 'var(--text-muted)', border: '1px solid var(--border-light)', fontStyle: 'italic' };
    return { background: 'rgba(255,255,255,0.05)', color: 'var(--text-primary)', border: '1px solid var(--border-light)', boxShadow: '0 2px 10px rgba(0,0,0,0.2)' };
  };

  const isUserMsg = (role) => role === 'user';

  return (
    <div className="container page-wrapper" style={{ height: 'calc(100vh - 20px)', display: 'flex', flexDirection: 'column', paddingTop: '6rem', paddingBottom: '2rem' }}>

      {/* ── Header ── */}
      <div className="flex-between mb-3 animate-fade-1" style={{ flexWrap: 'wrap', gap: '1rem', padding: '0 0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <div style={{ width: 44, height: 44, borderRadius: '12px', background: 'var(--success-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={22} color="var(--success)" />
          </div>
          <div>
            <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, fontFamily: 'var(--font-heading)', letterSpacing: '-0.02em' }}>Intelligence Chat</h1>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {sessionId ? `📄 Document RAG Active` : 'Powered by NVIDIA NIM & Llama 3'}
            </span>
          </div>
        </div>

        {/* Mode badge */}
        {sessionId && (
          <div className="badge" style={{
            padding: '0.4rem 1rem',
            background: 'var(--success-glow)',
            color: 'var(--success)',
            border: '1px solid rgba(0,255,135,0.3)',
          }}>
            <span><FileText size={14} style={{ marginRight: 4, display: 'inline' }} /> Document Context</span>
          </div>
        )}
      </div>

      {/* ── Document Upload Bar ── */}
      <div className="animate-fade-2">
        {!sessionId ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => !uploading && fileInputRef.current?.click()}
            style={{
              marginBottom: '1rem',
              padding: '1.25rem 2rem',
              border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-light)'}`,
              borderRadius: '16px',
              background: isDragging ? 'var(--accent-glow)' : 'rgba(255,255,255,0.02)',
              cursor: uploading ? 'wait' : 'pointer',
              display: 'flex', alignItems: 'center', gap: '1rem',
              transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
              color: 'var(--text-secondary)',
              fontSize: '0.95rem',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
          >
            <div style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: '8px', color: 'var(--text-primary)' }}>
              <Paperclip size={20} />
            </div>
            <span style={{ flex: 1 }}>
              {uploading
                ? <strong style={{ color: 'var(--accent-primary)' }}>Uploading & indexing document into Vector Store…</strong>
                : isDragging
                  ? <strong style={{ color: 'var(--accent-primary)' }}>Drop file here to index</strong>
                  : <span><strong>Upload a Document</strong> to query its contents (PDF, TXT, CSV) — click or drag & drop</span>}
            </span>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.csv"
              style={{ display: 'none' }}
              onChange={handleFileInput}
              disabled={uploading}
            />
          </div>
        ) : (
          <div style={{
            marginBottom: '1rem', padding: '1rem 1.5rem',
            background: 'var(--success-glow)', border: '1px solid rgba(0,255,135,0.2)',
            borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '0.75rem',
          }}>
            <FileText size={18} color="var(--success)" style={{ flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: '0.95rem', color: 'var(--success)', fontWeight: 600 }}>
              {uploadedFileName}
            </span>
            <CheckCircle size={18} color="var(--success)" />
            <button
              onClick={clearDocument}
              title="Remove document & switch to General mode"
              style={{
                background: 'rgba(0,0,0,0.2)', border: 'none', cursor: 'pointer',
                color: 'var(--text-secondary)', padding: '0.35rem', display: 'flex',
                borderRadius: '6px', transition: 'all 0.2s', marginLeft: '0.5rem'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'var(--danger)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.background = 'rgba(0,0,0,0.2)'; }}
            >
              <X size={16} />
            </button>
          </div>
        )}
      </div>

      {/* ── Chat Area ── */}
      <div className="glass-panel animate-fade-3" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0, border: '1px solid var(--border-light)' }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem 2rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {messages.map((msg, i) => {
            const isUser = isUserMsg(msg.role);
            const isErr = msg.role === 'error';

            return (
              <div
                key={i}
                style={{
                  display: 'flex', gap: '1rem',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  animation: 'fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                }}
              >
                {!isUser && (
                  <div style={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    background: isErr ? 'var(--danger-glow)' : 'var(--success-glow)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: isErr ? 'var(--danger)' : 'var(--success)',
                  }}>
                    {isErr ? <AlertCircle size={18} /> : <Bot size={18} />}
                  </div>
                )}

                <div style={{
                  padding: '1.1rem 1.4rem',
                  borderRadius: isUser ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                  fontSize: '1rem', lineHeight: 1.6,
                  ...getBubbleStyle(msg.role),
                }}>
                  {isUser ? msg.text : (
                    <div className="chat-markdown">
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div style={{
                    width: 36, height: 36, borderRadius: '10px', flexShrink: 0,
                    background: 'rgba(255,255,255,0.1)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-primary)',
                  }}>
                    <User size={18} />
                  </div>
                )}
              </div>
            );
          })}

          {/* Typing indicator */}
          {loading && (
            <div style={{ display: 'flex', gap: '1rem', alignSelf: 'flex-start' }}>
              <div style={{ width: 36, height: 36, borderRadius: '10px', background: 'var(--success-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--success)' }}>
                <Bot size={18} />
              </div>
              <div style={{ padding: '1rem 1.4rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-light)', borderRadius: '12px 12px 12px 2px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'pulse 1s ease-in-out infinite' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'pulse 1s ease-in-out 0.2s infinite' }} />
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-secondary)', animation: 'pulse 1s ease-in-out 0.4s infinite' }} />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* Quick Actions */}
        {messages.length <= 1 && !loading && (
          <div style={{ padding: '0 2rem 1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
            {quickActions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q.replace(/^[^\s]+\s/, ''))}
                className="btn-secondary"
                style={{
                  fontSize: '0.85rem', padding: '0.6rem 1rem',
                  borderRadius: '100px', cursor: 'pointer',
                  transition: 'all 0.2s', fontWeight: 500
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div style={{ padding: '1.25rem 2rem', borderTop: '1px solid var(--border-light)', background: 'var(--bg-dark)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                className="input-control"
                placeholder={sessionId ? `Ask about ${uploadedFileName}…` : 'Ask anything about finance…'}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                disabled={loading}
                autoFocus
                style={{ width: '100%', height: '56px', borderRadius: '100px', paddingLeft: '1.5rem', paddingRight: '1.5rem', background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', fontSize: '1.05rem' }}
              />
            </div>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !input.trim()}
              style={{ height: '56px', width: '56px', padding: 0, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <Send size={22} style={{ marginLeft: '-3px', color: '#050505' }} />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .chat-markdown p { margin: 0 0 0.6rem; }
        .chat-markdown p:last-child { margin: 0; }
        .chat-markdown strong { color: var(--accent-primary); font-weight: 600; }
        .chat-markdown h3 { font-size: 1.1rem; margin: 1rem 0 0.5rem; color: var(--text-primary); font-family: var(--font-heading); font-weight: 700; }
        .chat-markdown ul, .chat-markdown ol { padding-left: 1.5rem; margin: 0.5rem 0; }
        .chat-markdown li { margin-bottom: 0.25rem; }
        .chat-markdown table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.95rem; background: rgba(0,0,0,0.2); border-radius: 8px; overflow: hidden; }
        .chat-markdown th { text-align: left; padding: 0.6rem 0.8rem; background: rgba(0,242,254,0.08); color: var(--accent-primary); border-bottom: 1px solid var(--border-light); font-weight: 600; }
        .chat-markdown td { padding: 0.5rem 0.8rem; border-bottom: 1px solid rgba(255,255,255,0.03); }
        .chat-markdown tr:last-child td { border-bottom: none; }
        .chat-markdown code { background: rgba(255,255,255,0.05); padding: 0.15rem 0.4rem; border-radius: 4px; font-size: 0.9em; color: var(--warning); border: 1px solid var(--border-light); }
        .chat-markdown hr { border: none; border-top: 1px solid var(--border-light); margin: 1.25rem 0; }
        .chat-markdown em { color: var(--text-secondary); }
      `}</style>
    </div>
  );
}
