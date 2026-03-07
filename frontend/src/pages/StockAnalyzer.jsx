import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Search, TrendingUp, Clock, BarChart3, AlertTriangle, ChevronRight, Cpu, FileText, LineChart } from 'lucide-react';

const POPULAR_STOCKS = [
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries', market: '🇮🇳 NSE' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services', market: '🇮🇳 NSE' },
    { symbol: 'INFY.NS', name: 'Infosys', market: '🇮🇳 NSE' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank', market: '🇮🇳 NSE' },
    { symbol: 'ICICIBANK.NS', name: 'ICICI Bank', market: '🇮🇳 NSE' },
    { symbol: 'HINDUNILVR.NS', name: 'Hindustan Unilever', market: '🇮🇳 NSE' },
    { symbol: 'ITC.NS', name: 'ITC Limited', market: '🇮🇳 NSE' },
    { symbol: 'SBIN.NS', name: 'State Bank of India', market: '🇮🇳 NSE' },
    { symbol: 'BHARTIARTL.NS', name: 'Bharti Airtel', market: '🇮🇳 NSE' },
    { symbol: 'WIPRO.NS', name: 'Wipro', market: '🇮🇳 NSE' },
    { symbol: 'TATAMOTORS.NS', name: 'Tata Motors', market: '🇮🇳 NSE' },
    { symbol: 'MARUTI.NS', name: 'Maruti Suzuki', market: '🇮🇳 NSE' },
    { symbol: 'SUNPHARMA.NS', name: 'Sun Pharma', market: '🇮🇳 NSE' },
    { symbol: 'TITAN.NS', name: 'Titan Company', market: '🇮🇳 NSE' },
    { symbol: 'BAJFINANCE.NS', name: 'Bajaj Finance', market: '🇮🇳 NSE' },
    { symbol: 'HCLTECH.NS', name: 'HCL Technologies', market: '🇮🇳 NSE' },
    { symbol: 'LT.NS', name: 'Larsen & Toubro', market: '🇮🇳 NSE' },
    { symbol: 'ADANIENT.NS', name: 'Adani Enterprises', market: '🇮🇳 NSE' },
    { symbol: 'ONGC.NS', name: 'ONGC', market: '🇮🇳 NSE' },
    { symbol: 'NTPC.NS', name: 'NTPC Limited', market: '🇮🇳 NSE' },
    { symbol: 'AAPL', name: 'Apple Inc.', market: '🇺🇸 NASDAQ' },
    { symbol: 'MSFT', name: 'Microsoft', market: '🇺🇸 NASDAQ' },
    { symbol: 'GOOGL', name: 'Alphabet (Google)', market: '🇺🇸 NASDAQ' },
    { symbol: 'AMZN', name: 'Amazon', market: '🇺🇸 NASDAQ' },
    { symbol: 'NVDA', name: 'NVIDIA', market: '🇺🇸 NASDAQ' },
    { symbol: 'TSLA', name: 'Tesla', market: '🇺🇸 NASDAQ' },
    { symbol: 'META', name: 'Meta Platforms', market: '🇺🇸 NASDAQ' },
    { symbol: 'JPM', name: 'JPMorgan Chase', market: '🇺🇸 NYSE' },
    { symbol: 'V', name: 'Visa Inc.', market: '🇺🇸 NYSE' },
    { symbol: 'NFLX', name: 'Netflix', market: '🇺🇸 NASDAQ' },
];

const ANALYSIS_STEPS = [
    { label: 'Research', icon: Search, desc: 'Scraping news & market data' },
    { label: 'Financial Analysis', icon: LineChart, desc: 'Computing valuations & ratios' },
    { label: 'Filing Review', icon: FileText, desc: 'Analyzing earnings & filings' },
    { label: 'Report Generation', icon: Cpu, desc: 'Writing investment recommendation' },
];

// Parse markdown into sections for structured display
function parseSections(text) {
    if (!text || text.length < 200) return null;

    // Split by markdown headers (## or #)
    const lines = text.split('\n');
    const sections = [];
    let current = { title: 'Overview', content: [] };

    for (const line of lines) {
        const h1Match = line.match(/^#\s+(.+)/);
        const h2Match = line.match(/^##\s+(.+)/);
        const h3Match = line.match(/^###\s+(.+)/);

        if (h1Match || h2Match) {
            if (current.content.length > 0 || current.title !== 'Overview') {
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
            // Simulate step progression
            stepRef.current = setInterval(() => {
                setActiveStep(p => (p < 3 ? p + 1 : p));
            }, 20000);
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
                throw new Error(err.detail || 'Analysis failed.');
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
        <div className="container">
            {/* Header */}
            <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div className="badge badge-purple" style={{ marginBottom: '1rem' }}>
                    <BarChart3 size={13} /> CrewAI + Nvidia Llama 3.3 70B
                </div>
                <h1 className="page-title" style={{ fontSize: '2.2rem' }}>Stock Intelligence Analyst</h1>
                <p className="page-subtitle" style={{ margin: '0.5rem auto 0', textAlign: 'center' }}>
                    Multi-agent AI research team for professional investment analysis.
                </p>
            </div>

            {/* Search Panel */}
            <div className="glass-card-static" style={{ maxWidth: '780px', margin: '0 auto 2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.25rem' }}>
                    <TrendingUp size={18} color="var(--accent-color)" />
                    <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>Select a Stock</span>
                </div>

                <form onSubmit={handleAnalyze} style={{ display: 'flex', gap: '0.75rem' }}>
                    <div ref={dropdownRef} style={{ flex: 1, position: 'relative' }}>
                        <div style={{ position: 'relative' }}>
                            <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
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
                                placeholder="Search stocks... (e.g. Infosys, AAPL)"
                                className="input-control"
                                style={{ paddingLeft: '38px', height: '48px' }}
                                disabled={loading}
                            />
                        </div>

                        {showDropdown && (
                            <div style={{
                                position: 'absolute', top: '100%', left: 0, right: 0,
                                maxHeight: '280px', overflowY: 'auto',
                                background: '#151d2e', border: '1px solid rgba(255,255,255,0.08)',
                                borderTop: 'none', borderRadius: '0 0 12px 12px',
                                zIndex: 50, boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
                            }}>
                                {filtered.length > 0 ? filtered.map((s) => (
                                    <div key={s.symbol} onClick={() => selectStock(s)}
                                        style={{
                                            padding: '0.6rem 0.9rem', cursor: 'pointer',
                                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                            borderBottom: '1px solid rgba(255,255,255,0.03)',
                                            transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = 'rgba(88,166,255,0.06)'}
                                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                    >
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{s.symbol}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{s.name}</div>
                                        </div>
                                        <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)' }}>{s.market}</span>
                                    </div>
                                )) : (
                                    <div style={{ padding: '1.25rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                                        No match — type a custom ticker
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading || !ticker}
                        style={{ height: '48px', padding: '0 1.75rem', whiteSpace: 'nowrap' }}>
                        {loading ? 'Analyzing...' : <><BarChart3 size={16} /> Analyze</>}
                    </button>
                </form>

                {ticker && !loading && (
                    <div className="badge badge-accent" style={{ marginTop: '0.75rem' }}>
                        <TrendingUp size={12} /> {ticker}
                    </div>
                )}
            </div>

            {/* Loading Progress */}
            {loading && (
                <div className="glass-card-static" style={{ maxWidth: '780px', margin: '0 auto 2rem', animation: 'fadeIn 0.3s ease-out' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>
                            Analyzing <span style={{ color: 'var(--accent-color)' }}>{ticker}</span>
                        </h3>
                        <span className="badge badge-warning" style={{ fontFamily: 'monospace' }}>
                            <Clock size={12} /> {fmt(elapsed)}
                        </span>
                    </div>

                    {/* Steps */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {ANALYSIS_STEPS.map((step, i) => {
                            const Icon = step.icon;
                            const isActive = i === activeStep;
                            const isDone = i < activeStep;
                            return (
                                <div key={i} style={{
                                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                                    padding: '0.7rem 0.9rem', borderRadius: 'var(--radius-sm)',
                                    background: isActive ? 'var(--accent-glow)' : 'transparent',
                                    border: isActive ? '1px solid rgba(88,166,255,0.15)' : '1px solid transparent',
                                    transition: 'all 0.3s',
                                }}>
                                    <div style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: isDone ? 'rgba(63,185,80,0.15)' : isActive ? 'var(--accent-glow)' : 'rgba(255,255,255,0.04)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        color: isDone ? 'var(--success-color)' : isActive ? 'var(--accent-color)' : 'var(--text-secondary)',
                                    }}>
                                        {isDone ? '✓' : <Icon size={16} />}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: isActive ? 'var(--accent-color)' : isDone ? 'var(--success-color)' : 'var(--text-secondary)' }}>
                                            {step.label}
                                        </div>
                                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{step.desc}</div>
                                    </div>
                                    {isActive && (
                                        <div style={{
                                            width: '14px', height: '14px', border: '2px solid var(--accent-color)',
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
                <div className="glass-card-static" style={{ maxWidth: '780px', margin: '0 auto 2rem', borderLeft: '3px solid var(--danger-color)' }}>
                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                        <AlertTriangle size={20} color="var(--danger-color)" style={{ flexShrink: 0, marginTop: 2 }} />
                        <div>
                            <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>Analysis Failed</div>
                            <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{error}</div>
                        </div>
                    </div>
                </div>
            )}

            {/* Result */}
            {result && !loading && (
                <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeSlideUp 0.5s ease-out' }}>
                    {/* Report Header */}
                    <div className="glass-card-static" style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{
                                width: '44px', height: '44px', borderRadius: 'var(--radius-md)',
                                background: 'linear-gradient(135deg, #58a6ff, #a371f7)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                            }}>
                                <BarChart3 size={22} color="#fff" />
                            </div>
                            <div>
                                <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>Investment Report</div>
                                <div style={{ color: 'var(--accent-color)', fontWeight: 600, fontSize: '0.95rem' }}>{result.company}</div>
                            </div>
                        </div>
                        <span className="badge" style={{ background: 'rgba(255,255,255,0.04)', color: 'var(--text-secondary)', border: '1px solid var(--border-color)' }}>
                            <Clock size={12} /> {new Date(result.timestamp).toLocaleString()}
                        </span>
                    </div>

                    {/* Structured Sections or Markdown Fallback */}
                    {sections ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {sections.map((sec, i) => (
                                <div key={i} className="glass-card-static" style={{ animation: `fadeIn 0.3s ease-out ${i * 0.05}s both` }}>
                                    <div style={{
                                        display: 'flex', alignItems: 'center', gap: '0.6rem',
                                        marginBottom: '1rem', paddingBottom: '0.75rem',
                                        borderBottom: '1px solid var(--border-color)',
                                    }}>
                                        <ChevronRight size={16} color="var(--accent-color)" />
                                        <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--accent-color)' }}>
                                            {sec.title}
                                        </h3>
                                    </div>
                                    <div className="report-markdown">
                                        <ReactMarkdown>{sec.content}</ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : result.analysis && result.analysis.length > 100 ? (
                        <div className="glass-card-static">
                            <div className="report-markdown">
                                <ReactMarkdown>{result.analysis}</ReactMarkdown>
                            </div>
                        </div>
                    ) : (
                        <div className="glass-card-static" style={{ textAlign: 'center', padding: '2.5rem' }}>
                            <AlertTriangle size={28} color="var(--warning-color)" style={{ marginBottom: '0.75rem' }} />
                            <h3 style={{ marginBottom: '0.5rem' }}>Partial Response</h3>
                            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1rem' }}>
                                The AI agents returned a brief summary. Try running the analysis again.
                            </p>
                            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '1rem', borderRadius: '8px', textAlign: 'left', whiteSpace: 'pre-wrap', fontSize: '0.9rem', lineHeight: 1.6 }}>
                                {result.analysis || 'No content.'}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Report Markdown Styles */}
            <style>{`
                .report-markdown { line-height: 1.75; color: rgba(240,246,252,0.88); font-size: 0.93rem; }
                .report-markdown h1, .report-markdown h2 { font-size: 1.1rem; color: var(--accent-color); margin: 1rem 0 0.5rem; }
                .report-markdown h3 { font-size: 1rem; color: var(--text-primary); margin: 0.75rem 0 0.4rem; }
                .report-markdown p { margin-bottom: 0.6rem; }
                .report-markdown strong { color: #e6edf3; }
                .report-markdown ul, .report-markdown ol { padding-left: 1.25rem; margin-bottom: 0.75rem; }
                .report-markdown li { margin-bottom: 0.25rem; }
                .report-markdown li::marker { color: var(--accent-color); }
                .report-markdown table { width: 100%; border-collapse: collapse; margin: 0.75rem 0; font-size: 0.88rem; }
                .report-markdown th { background: rgba(88,166,255,0.06); color: var(--accent-color); font-weight: 600; text-align: left; padding: 0.55rem 0.75rem; border: 1px solid rgba(255,255,255,0.06); }
                .report-markdown td { padding: 0.5rem 0.75rem; border: 1px solid rgba(255,255,255,0.04); }
                .report-markdown tr:nth-child(even) { background: rgba(255,255,255,0.015); }
                .report-markdown blockquote { border-left: 3px solid var(--purple-color); padding: 0.5rem 0.75rem; margin: 0.75rem 0; background: rgba(163,113,247,0.04); border-radius: 0 6px 6px 0; color: var(--text-secondary); }
                .report-markdown code { background: rgba(255,255,255,0.07); padding: 0.1rem 0.35rem; border-radius: 3px; font-size: 0.85em; color: #f0883e; }
                .report-markdown pre { background: rgba(0,0,0,0.3); padding: 0.75rem; border-radius: 8px; overflow-x: auto; margin: 0.75rem 0; }
                .report-markdown pre code { background: none; padding: 0; color: #e6edf3; }
                .report-markdown hr { border: none; border-top: 1px solid var(--border-color); margin: 1.25rem 0; }
            `}</style>
        </div>
    );
}

export default StockAnalyzer;
