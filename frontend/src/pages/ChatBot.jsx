import React, { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Send, User, Bot, AlertCircle, Paperclip, X, FileText, CheckCircle } from 'lucide-react';

const QUICK_ACTIONS_GENERAL = [
  '💡 What is SIP and how does it work?',
  '📊 Explain mutual funds vs stocks',
  '🏦 How to start investing in India?',
  '💰 I earn 80000, spent 15000 rent, 5000 food, 3000 electricity',
];

const QUICK_ACTIONS_DOC = [
  '📋 Summarize this document',
  '📈 What are the key financial highlights?',
  '💡 What risks are mentioned?',
  '🔍 What are the main recommendations?',
];

const USER_ID = crypto.randomUUID(); // Stable per browser session (per page load)

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
    e.target.value = ''; // reset so same file can be re-uploaded
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
        // ── RAG Document Q&A mode ──
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
        // ── General Finance mode ──
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
    if (role === 'user') return { background: 'linear-gradient(135deg, #58a6ff, #3b82f6)', color: '#fff', border: 'none' };
    if (role === 'error') return { background: 'rgba(248,81,73,0.06)', color: 'var(--danger-color)', border: '1px solid rgba(248,81,73,0.1)' };
    if (role === 'success') return { background: 'rgba(46,160,67,0.08)', color: 'var(--success-color)', border: '1px solid rgba(46,160,67,0.15)' };
    if (role === 'system') return { background: 'rgba(88,166,255,0.06)', color: 'var(--text-secondary)', border: '1px solid rgba(88,166,255,0.1)', fontStyle: 'italic' };
    return { background: 'rgba(255,255,255,0.04)', color: 'var(--text-primary)', border: '1px solid var(--border-color)' };
  };

  const isUserMsg = (role) => role === 'user';

  return (
    <div className="container" style={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
        <div style={{ width: 38, height: 38, borderRadius: 'var(--radius-sm)', background: 'rgba(63,185,80,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Bot size={20} color="var(--success-color)" />
        </div>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '1.2rem', fontWeight: 700, margin: 0, lineHeight: 1.2 }}>AI Financial Assistant</h1>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
            {sessionId ? `📄 Document mode — ${uploadedFileName}` : 'Powered by Nvidia Llama 3 + RAG'}
          </span>
        </div>

        {/* Mode badge */}
        <div style={{
          padding: '0.3rem 0.8rem', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
          background: sessionId ? 'rgba(46,160,67,0.12)' : 'rgba(88,166,255,0.12)',
          color: sessionId ? 'var(--success-color)' : 'var(--accent-color)',
          border: `1px solid ${sessionId ? 'rgba(46,160,67,0.2)' : 'rgba(88,166,255,0.2)'}`,
        }}>
          {sessionId ? '📄 Document Q&A' : '💬 General Finance'}
        </div>
      </div>

      {/* ── Document Upload Bar ── */}
      {!sessionId ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !uploading && fileInputRef.current?.click()}
          style={{
            marginBottom: '0.75rem',
            padding: '0.75rem 1.25rem',
            border: `2px dashed ${isDragging ? 'var(--accent-color)' : 'var(--border-color)'}`,
            borderRadius: '10px',
            background: isDragging ? 'rgba(88,166,255,0.06)' : 'rgba(255,255,255,0.02)',
            cursor: uploading ? 'wait' : 'pointer',
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            transition: 'all 0.2s',
            color: 'var(--text-secondary)',
            fontSize: '0.85rem',
          }}
        >
          <Paperclip size={16} style={{ flexShrink: 0 }} />
          <span>
            {uploading
              ? 'Uploading & indexing document…'
              : isDragging
                ? 'Drop file here'
                : 'Upload a document to ask questions about it (PDF, TXT, CSV) — click or drag & drop'}
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
        /* Active document pill */
        <div style={{
          marginBottom: '0.75rem', padding: '0.5rem 1rem',
          background: 'rgba(46,160,67,0.08)', border: '1px solid rgba(46,160,67,0.2)',
          borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.6rem',
        }}>
          <FileText size={15} color="var(--success-color)" style={{ flexShrink: 0 }} />
          <span style={{ flex: 1, fontSize: '0.85rem', color: 'var(--success-color)', fontWeight: 500 }}>
            {uploadedFileName}
          </span>
          <CheckCircle size={14} color="var(--success-color)" />
          <button
            onClick={clearDocument}
            title="Remove document & switch to General mode"
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-secondary)', padding: '2px', display: 'flex',
              borderRadius: '4px', transition: 'color 0.15s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--danger-color)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-secondary)')}
          >
            <X size={15} />
          </button>
        </div>
      )}

      {/* ── Chat Area ── */}
      <div className="glass-card-static" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', padding: 0 }}>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {messages.map((msg, i) => {
            const isUser = isUserMsg(msg.role);
            const isErr = msg.role === 'error';

            return (
              <div
                key={i}
                style={{
                  display: 'flex', gap: '0.6rem',
                  alignSelf: isUser ? 'flex-end' : 'flex-start',
                  maxWidth: '85%',
                  animation: 'fadeIn 0.25s ease-out',
                }}
              >
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
                  fontSize: '0.9rem', lineHeight: 1.65,
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

          {/* Typing indicator */}
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
            {quickActions.map((q, i) => (
              <button
                key={i}
                onClick={() => sendMessage(q.replace(/^[^\s]+\s/, ''))}
                className="btn-ghost"
                style={{
                  fontSize: '0.78rem', padding: '0.4rem 0.75rem',
                  border: '1px solid var(--border-color)', borderRadius: '999px',
                  color: 'var(--text-secondary)', cursor: 'pointer',
                  background: 'rgba(255,255,255,0.02)', transition: 'all 0.15s',
                }}
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div style={{ padding: '0.75rem 1.25rem', borderTop: '1px solid var(--border-color)', background: 'rgba(0,0,0,0.15)' }}>
          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.6rem', alignItems: 'center' }}>
            {/* Inline upload button (clip icon) when in general mode */}
            {!sessionId && (
              <button
                type="button"
                title="Upload document"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                style={{
                  height: '44px', width: '44px', flexShrink: 0,
                  background: 'rgba(88,166,255,0.08)',
                  border: '1px solid rgba(88,166,255,0.2)',
                  borderRadius: '8px', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'var(--accent-color)', transition: 'all 0.15s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(88,166,255,0.15)')}
                onMouseLeave={(e) => (e.currentTarget.style.background = 'rgba(88,166,255,0.08)')}
              >
                <Paperclip size={16} />
              </button>
            )}
            <input
              type="text"
              className="input-control"
              placeholder={sessionId ? `Ask about ${uploadedFileName}…` : 'Ask anything about finance…'}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              style={{ flex: 1, height: '44px' }}
            />
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading || !input.trim()}
              style={{ height: '44px', padding: '0 1.25rem' }}
            >
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
        .chat-markdown hr { border: none; border-top: 1px solid var(--border-color); margin: 0.75rem 0; }
        .chat-markdown em { color: var(--text-secondary); }
      `}</style>
    </div>
  );
}
