import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Search, TrendingUp, Clock, BarChart3, AlertTriangle, ChevronRight, Cpu, FileText, LineChart, ShieldCheck } from 'lucide-react';

const POPULAR_STOCKS = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', market: '🇮🇳 NSE' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', market: '🇮🇳 NSE' },
    { symbol: 'INFY.NS', name: 'Infosys', market: '🇮🇳 NSE' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', market: '🇮🇳 NSE' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', market: '🇮🇳 NSE' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', market: '🇮🇳 NSE' },
    { symbol: 'ITC.NS', name: 'ITC Limited', market: '🇮🇳 NSE' },
    { symbol: 'SBIN.NS', name: 'State Bank of India', market: '🇮🇳 NSE' },
    { symbol: 'AAPL', name: 'Apple Inc.', market: '🇺🇸 NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft', market: '🇺🇸 NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet (Google)', market: '🇺🇸 NASDAQ' },
    { symbol: 'NVDA', name: 'NVIDIA', market: '🇺🇸 NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla', market: '🇺🇸 NASDAQ' },
    { symbol: 'V', name: 'Visa Inc.', market: '🇺🇸 NYSE' },
];

const ANALYSIS_STEPS = [
    { label: 'Data Retrieval', icon: Search, desc: 'Scraping real-time news & market feeds' },
    { label: 'Quantitative Analysis', icon: LineChart, desc: 'Computing valuations & PE ratios' },
    { label: 'Qualitative Review', icon: FileText, desc: 'Analyzing earnings call transcripts' },
    { label: 'Synthesis', icon: Cpu, desc: 'Generating final investment thesis' },
];

function parseSections(text) {
    if (!text || text.length < 200) return null;

    const lines = text.split('\n');
    const sections = [];
    let current = { title: 'Executive Summary', content: [] };

    for (const line of lines) {
        const h1Match = line.match(/^#\s+(.+)/);
        const h2Match = line.match(/^##\s+(.+)/);
        const h3Match = line.match(/^###\s+(.+)/);

        if (h1Match || h2Match) {
            if (current.content.length > 0 || current.title !== 'Executive Summary') {
                sections.push({ ...current, content: current.content.join('\n') });
            }
            current = { title: (h1Match || h2Match)[1].trim(), content: [] };
        } else if (h3Match) {
            current.content.push(line);
        } else {
            current.content.push(line);
        }
    }
    if (current.content.length > 0) {
        sections.push({ ...current, content: current.content.join('\n') });
    }

    return sections.length > 1 ? sections : null;
}

function StockAnalyzer() {
    const [ticker, setTicker] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [result, setResult] = useState(null);
    const [elapsed, setElapsed] = useState(0);
    const [activeStep, setActiveStep] = useState(0);
    const dropdownRef = useRef(null);
    const timerRef = useRef(null);
    const stepRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(e) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (loading) {
            setElapsed(0);
            setActiveStep(0);
            timerRef.current = setInterval(() => setElapsed(p => p + 1), 1000);
            stepRef.current = setInterval(() => {
                setActiveStep(p => (p < 3 ? p + 1 : p));
            }, 25000); // Slower simulated steps for realism
        } else {
            clearInterval(timerRef.current);
            clearInterval(stepRef.current);
        }
        return () => { clearInterval(timerRef.current); clearInterval(stepRef.current); };
    }, [loading]);

    const filtered = POPULAR_STOCKS.filter(s =>
        s.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const selectStock = (stock) => {
        setTicker(stock.symbol);
        setSearchQuery(`${stock.name} (${stock.symbol})`);
        setShowDropdown(false);
    };

    const handleAnalyze = async (e) => {
        e.preventDefault();
        if (!ticker) return;
        setLoading(true);
        setError(null);
        setResult(null);
        try {
            const res = await fetch('http://localhost:8000/api/portfolio/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ company: ticker })
            });
            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.detail || 'Analysis failed to execute.');
            }
            const data = await res.json();
            setResult(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const fmt = (s) => { const m = Math.floor(s / 60); return m > 0 ? `${m}m ${s % 60}s` : `${s}s`; };
    const sections = result?.analysis ? parseSections(result.analysis) : null;

    return (
        <div className="container page-wrapper">
            <div className="text-center animate-fade-1" style={{ marginBottom: '3.5rem', maxWidth: '800px', margin: '0 auto 3.5rem' }}>
                <div className="badge badge-purple mb-3">
                    <Cpu size={14} /> Multi-Agent AI Research
                </div>
                <h1 className="page-title">Stock Intelligence</h1>
                <p className="page-subtitle" style={{ margin: '0 auto' }}>
                    Deploy our elite AI research team to analyze technicals, fundamentals, and market sentiment to generate institutional-grade investment reports.
                </p>
            </div>

            {/* Search Panel */}
            <div className="glass-panel animate-fade-2" style={{ maxWidth: '800px', margin: '0 auto 2.5rem', padding: '2rem', overflow: 'visible' }}>
                <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div ref={dropdownRef} style={{ flex: 1, position: 'relative', minWidth: '250px', zIndex: 100 }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setShowDropdown(true);
                                    const v = e.target.value.trim().toUpperCase();
                                    if (v && !v.includes('(')) setTicker(v);
                                }}
                                onFocus={() => setShowDropdown(true)}
                                placeholder="Search ticker symbol (e.g., TSLA, INFY.NS)"
                                className="input-control"
                                style={{ paddingLeft: '48px', height: '56px', fontSize: '1.1rem', borderRadius: '12px' }}
                                disabled={loading}
                            />
                        </div>

                        {showDropdown && (
                            <div style={{
                                position: 'absolute', top: 'calc(100% + 8px)', left: 0, right: 0,
                                maxHeight: '320px', overflowY: 'auto',
                                background: 'rgba(5, 5, 5, 0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                                border: '1px solid var(--border-light)', borderRadius: '12px',
                                zIndex: 50, boxShadow: 'var(--shadow-lg)',
                            }}>
                                {filtered.length > 0 ? filtered.map((s) => (
                                    <div key={s.symbol} onClick={() => selectStock(s)}
                                        style={{
                                            padding: '1rem 1.25rem', cursor: 'pointer',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            borderBottom: '1px solid var(--border-light)',
                                            transition: 'background 0.2s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 700, fontSize: '1.05rem', color: 'var(--text-primary)' }}>{s.symbol}</div>
                                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>{s.name}</div>
                                        </div>
                                        <span className="badge badge-outline" style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>{s.market}</span>
                                    </div>
                                )) : (
                                    <div style={{ padding: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                        No match — press Enter to analyze custom ticker
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading || !ticker}
                        style={{ height: '56px', padding: '0 2.5rem', whiteSpace: 'nowrap', borderRadius: '12px', fontSize: '1.05rem' }}>
                        {loading ? 'Initializing Agents...' : <><BarChart3 size={18} /> Run Analysis</>}
                    </button>
                </form>
            </div>

            {/* Loading Progress */}
            {loading && (
                <div className="glass-panel animate-fade-3" style={{ maxWidth: '800px', margin: '0 auto 3rem', padding: '2rem' }}>
                    <div className="flex-between mb-4">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ width: 12, height: 12, borderRadius: '50%', background: 'var(--warning)', boxShadow: '0 0 10px var(--warning)' }} />
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                                AI Agents Analyzing <span className="grad-text-accent">{ticker}</span>
                            </h3>
                        </div>
                        <span className="badge badge-warning" style={{ fontSize: '0.9rem', padding: '0.4rem 0.75rem' }}>
                            <Clock size={14} /> {fmt(elapsed)}
                        </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: '1rem' }}>
                        {ANALYSIS_STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const isActive = i === activeStep;
                            const isDone = i < activeStep;
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '1rem',
                                    padding: '1.25rem', borderRadius: '12px',
                                    background: isActive ? 'var(--bg-input)' : 'transparent',
                                    border: isActive ? '1px solid var(--border-focus)' : '1px solid var(--border-light)',
                                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
                                    opacity: isDone || isActive ? 1 : 0.5
                                }}>
                                    <div style={{
                                        width: '40px', height: '40px', borderRadius: '10px',
                                        background: isDone ? 'var(--success-glow)' : isActive ? 'var(--accent-glow)' : 'rgba(255,255,255,0.03)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: isDone ? 'var(--success)' : isActive ? 'var(--accent-primary)' : 'var(--text-muted)',
                                    }}>
                                        {isDone ? <ShieldCheck size={20} /> : <Icon size={20} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '1.05rem', fontWeight: 600, color: isActive ? 'var(--text-primary)' : isDone ? 'var(--success)' : 'var(--text-secondary)' }}>
                                            {step.label}
                                        </div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{step.desc}</div>
                                    </div>
                                    {isActive && (
                                        <div style={{
                                            width: '20px', height: '20px', border: '3px solid var(--accent-primary)',
                                            borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                                        }} />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="glass-panel" style={{ maxWidth: '800px', margin: '0 auto 2rem', borderLeft: '4px solid var(--danger)' }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <div style={{ padding: '0.5rem', background: 'var(--danger-glow)', borderRadius: '50%', color: 'var(--danger)' }}>
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.2rem', color: 'var(--text-primary)' }}>Terminal Error</div>
                            <div style={{ fontSize: '0.95rem', color: 'var(--text-secondary)' }}>{error}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Result */}
            {result && !loading && (
                <div className="animate-fade-4" style={{ maxWidth: '1000px', margin: '0 auto' }}>

                    {/* Report Header */}
                    <div className="glass-panel mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', padding: '1.5rem 2.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
                            <div style={{
                                width: '56px', height: '56px', borderRadius: '16px',
                                background: 'linear-gradient(135deg, var(--accent-secondary), var(--purple))',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                boxShadow: '0 8px 20px rgba(191, 46, 240, 0.3)'
                            }}>
                                <FileText size={28} color="#fff" />
                            </div>
                            <div>
                                <h2 style={{ fontSize: '1.35rem', fontWeight: 800, margin: 0 }}>Comprehensive AI Report</h2>
                                <div style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '1rem', marginTop: '0.2rem' }}>
                                    Ticker: <span style={{ color: 'var(--accent-primary)', fontWeight: 700 }}>{result.company}</span>
                                </div>
                            </div>
                        </div>
                        <div className="badge badge-outline" style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', padding: '0.5rem 1rem' }}>
                            <Clock size={14} color="var(--text-secondary)" />
                            <span>{new Date(result.timestamp).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}</span>
                        </div>
                    </div>

                    {/* Report Content */}
                    {sections ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                            {sections.map((sec, i) => (
                                <div key={i} className="glass-panel" style={{ padding: '2.5rem', animation: `fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) ${i * 0.1}s forwards`, opacity: 0 }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                                        marginBottom: '1.5rem', paddingBottom: '1rem',
                                        borderBottom: '1px solid var(--border-light)',
                                    }}>
                                        <div style={{ padding: '0.4rem', background: 'var(--accent-glow)', borderRadius: '8px', color: 'var(--accent-primary)' }}>
                                            <ChevronRight size={20} />
                                        </div>
                                        <h3 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0, fontFamily: 'var(--font-heading)' }}>
                                            {sec.title}
                                        </h3>
                                    </div>
                                    <div className="report-markdown">
                                        <ReactMarkdown>{sec.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="glass-panel" style={{ padding: '3rem' }}>
                            <div className="report-markdown">
                                <ReactMarkdown>{result.analysis}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .report-markdown { line-height: 1.8; color: var(--text-secondary); font-size: 1.05rem; }
                .report-markdown h1, .report-markdown h2 { font-size: 1.4rem; color: var(--text-primary); margin: 2rem 0 1rem; font-family: var(--font-heading); font-weight: 700; }
                .report-markdown h1:first-child, .report-markdown h2:first-child { margin-top: 0; }
                .report-markdown h3 { font-size: 1.2rem; color: var(--text-primary); margin: 1.5rem 0 0.8rem; font-weight: 600; }
                .report-markdown p { margin-bottom: 1.25rem; }
                .report-markdown strong { color: var(--accent-primary); font-weight: 600; }
                .report-markdown ul, .report-markdown ol { padding-left: 1.5rem; margin-bottom: 1.5rem; }
                .report-markdown li { margin-bottom: 0.6rem; }
                .report-markdown li::marker { color: var(--accent-secondary); font-weight: bold; }
                .report-markdown table { width: 100%; border-collapse: collapse; margin: 1.5rem 0; font-size: 0.95rem; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                .report-markdown th { background: rgba(0, 242, 254, 0.08); color: var(--accent-primary); font-weight: 700; text-align: left; padding: 1rem; border-bottom: 1px solid var(--border-light); font-family: var(--font-heading); }
                .report-markdown td { padding: 1rem; border-bottom: 1px solid rgba(255,255,255,0.03); background: rgba(0,0,0,0.2); }
                .report-markdown tr:last-child td { border-bottom: none; }
                .report-markdown tr:hover td { background: rgba(255,255,255,0.02); }
                .report-markdown blockquote { border-left: 4px solid var(--purple); padding: 1rem 1.5rem; margin: 1.5rem 0; background: var(--purple-glow); border-radius: 0 8px 8px 0; color: var(--text-primary); font-style: italic; }
                .report-markdown code { background: rgba(255,255,255,0.05); padding: 0.2rem 0.5rem; border-radius: 4px; font-size: 0.9em; color: var(--warning); border: 1px solid var(--border-light); }
                .report-markdown pre { background: var(--bg-dark); padding: 1.5rem; border-radius: 12px; overflow-x: auto; margin: 1.5rem 0; border: 1px solid var(--border-light); }
                .report-markdown pre code { background: none; padding: 0; color: #a0aab2; border: none; font-size: 0.95rem; }
                .report-markdown hr { border: none; border-top: 1px solid var(--border-light); margin: 2.5rem 0; }
            `}</style>
        </div>
    );
}

export default StockAnalyzer;
