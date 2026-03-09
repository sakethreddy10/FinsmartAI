import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Activity, Newspaper, TrendingUp, TrendingDown, Search, ExternalLink, BarChart3, Globe, AlertTriangle } from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

export default function MarketSentiment() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchSentiment = async (search = '') => {
        setLoading(true);
        setError(null);
        try {
            const params = search ? { search } : {};
            const response = await axios.get('http://localhost:8000/api/sentiment/market', { params });
            setData(response.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to fetch market sentiment data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchSentiment(); }, []);

    const handleSearch = (e) => { e.preventDefault(); fetchSentiment(searchTerm); };

    const renderGauge = () => {
        if (!data) return null;
        const score = data.average_sentiment_score;
        const level = data.fear_greed_index;
        let indexValue = Math.round((score + 1) * 50);
        indexValue = Math.max(0, Math.min(100, indexValue));

        // Needle angle from -90 to +90 degrees
        const needleAngle = (indexValue / 100) * 180 - 90;

        let gaugeColor = 'var(--success)';
        let gaugeGlow = 'var(--success-glow)';
        if (level.includes('Fear')) {
            gaugeColor = 'var(--danger)';
            gaugeGlow = 'var(--danger-glow)';
        } else if (level === 'Neutral') {
            gaugeColor = 'var(--warning)';
            gaugeGlow = 'var(--warning-glow)';
        }

        return (
            <div className="glass-panel" style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '2.5rem 1.5rem' }}>
                <div className="flex-center mb-3" style={{ gap: '0.5rem' }}>
                    <Activity size={18} color={gaugeColor} />
                    <h3 style={{ fontSize: '1.05rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>Fear & Greed Index</h3>
                </div>

                <div style={{ position: 'relative', width: '260px', height: '140px', margin: '1rem auto' }}>
                    {/* SVG Semi-Circle Gauge */}
                    <svg width="260" height="130" viewBox="0 0 260 130">
                        <defs>
                            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                                <stop offset="0%" stopColor="#ff0055" />
                                <stop offset="50%" stopColor="#ffbe0b" />
                                <stop offset="100%" stopColor="#00ff87" />
                            </linearGradient>
                            <filter id="glow">
                                <feGaussianBlur stdDeviation="4" result="coloredBlur" />
                                <feMerge>
                                    <feMergeNode in="coloredBlur" />
                                    <feMergeNode in="SourceGraphic" />
                                </feMerge>
                            </filter>
                        </defs>
                        {/* Background Track */}
                        <path d="M 20 120 A 110 110 0 0 1 240 120" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="24" strokeLinecap="round" />
                        {/* Gradient Fill Track */}
                        <path d="M 20 120 A 110 110 0 0 1 240 120" fill="none" stroke="url(#gaugeGradient)" strokeWidth="24" strokeLinecap="round" filter="url(#glow)" />
                    </svg>

                    {/* Needle Needle Center relative to SVG base */}
                    <div style={{
                        position: 'absolute', width: '4px', height: '90px', background: 'var(--text-primary)',
                        left: 'calc(50% - 2px)', bottom: '10px', transformOrigin: 'bottom center',
                        transform: `rotate(${needleAngle}deg)`, transition: 'transform 1.5s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        borderRadius: '4px', boxShadow: '0 0 15px rgba(0,0,0,0.8)', zIndex: 10
                    }} />
                    <div style={{ position: 'absolute', width: '20px', height: '20px', background: 'var(--text-primary)', borderRadius: '50%', bottom: '0px', left: 'calc(50% - 10px)', zIndex: 15, boxShadow: '0 0 15px rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <div style={{ width: 8, height: 8, background: 'var(--bg-dark)', borderRadius: '50%' }} />
                    </div>

                    <span style={{ position: 'absolute', left: '-5px', bottom: '0px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--danger)' }}>Fear</span>
                    <span style={{ position: 'absolute', right: '-5px', bottom: '0px', fontSize: '0.85rem', fontWeight: 700, color: 'var(--success)' }}>Greed</span>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em', fontFamily: 'var(--font-heading)', color: 'var(--text-primary)' }}>{indexValue}</div>
                    <div className="badge mt-2" style={{ background: gaugeGlow, color: gaugeColor, border: `1px solid ${gaugeColor}40`, padding: '0.4rem 1rem', fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {level}
                    </div>
                </div>

                <div style={{ marginTop: '1.5rem', fontSize: '0.95rem', color: 'var(--text-secondary)', lineHeight: 1.6, padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-light)' }}>
                    "{data.summary_note}"
                </div>
            </div>
        );
    };

    const chartData = data ? {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
            label: 'Sentiment Distribution',
            data: [data.metadata.positive_articles, data.metadata.neutral_articles, data.metadata.negative_articles],
            backgroundColor: ['rgba(0, 255, 135, 0.8)', 'rgba(160, 170, 178, 0.6)', 'rgba(255, 0, 85, 0.8)'],
            borderColor: ['#00ff87', '#a0aab2', '#ff0055'],
            borderWidth: 1, borderRadius: 8,
            barThickness: 40,
        }],
    } : null;

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: { backgroundColor: 'rgba(5, 5, 5, 0.9)', titleFont: { size: 14, family: "'Inter', sans-serif" }, bodyFont: { size: 14, weight: 'bold' }, padding: 12, cornerRadius: 8, borderColor: 'var(--border-light)', borderWidth: 1 }
        },
        scales: {
            x: { ticks: { color: 'var(--text-secondary)', font: { size: 13, family: "'Inter', sans-serif" } }, grid: { display: false }, border: { display: false } },
            y: { ticks: { color: 'var(--text-muted)', font: { size: 12 } }, grid: { color: 'var(--border-light)' }, border: { display: false } },
        },
    };

    return (
        <div className="container page-wrapper">
            <div className="flex-between mb-4 animate-fade-1" style={{ flexWrap: 'wrap', gap: '2rem' }}>
                <div>
                    <div className="badge badge-accent mb-3">
                        <Globe size={14} /> Global Market Pulse
                    </div>
                    <h1 className="page-title">Market Sentiment</h1>
                    <p className="page-subtitle" style={{ margin: 0, maxWidth: '600px' }}>
                        Real-time AI analysis of global financial news, quantifying market psychology and identifying emerging trends.
                    </p>
                </div>

                <div className="glass-panel" style={{ padding: '0.75rem', borderRadius: '100px', flex: '1 1 300px', maxWidth: '400px' }}>
                    <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                        <div style={{ position: 'relative', flex: 1 }}>
                            <Search size={18} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                            <input type="text" className="input-control" placeholder="Search specific asset or topic..." value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ width: '100%', paddingLeft: '44px', height: '48px', fontSize: '0.95rem', borderRadius: '100px', border: 'none', background: 'transparent' }} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{ height: '48px', borderRadius: '100px', padding: '0 1.5rem', whiteSpace: 'nowrap' }}>
                            Scan
                        </button>
                    </form>
                </div>
            </div>

            {loading && (
                <div className="flex-center" style={{ padding: '5rem', flexDirection: 'column', gap: '1.5rem' }}>
                    <div style={{ width: 40, height: 40, border: '3px solid var(--accent-glow)', borderTopColor: 'var(--accent-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                    <p style={{ color: 'var(--accent-primary)', fontSize: '1.1rem', fontWeight: 500 }}>Aggregating and analyzing global financial news...</p>
                </div>
            )}

            {error && (
                <div className="glass-panel mb-4" style={{ borderLeft: '4px solid var(--danger)' }}>
                    <div className="flex-center" style={{ gap: '1rem', justifyContent: 'flex-start' }}>
                        <AlertTriangle size={24} color="var(--danger)" />
                        <div>
                            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>Analysis Error</div>
                            <div style={{ color: 'var(--text-secondary)' }}>{error}</div>
                        </div>
                    </div>
                </div>
            )}

            {!loading && !error && data && (
                <div className="animate-fade-2">
                    <div className="dashboard-grid mb-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>

                        {/* Gauge Card */}
                        <div style={{ gridColumn: 'span 1' }}>
                            {renderGauge()}
                        </div>

                        {/* Metrics and Chart Column */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', gridColumn: 'span 2' }}>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
                                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
                                    <div style={{ width: 50, height: 50, borderRadius: '14px', background: 'var(--accent-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Activity size={24} color="var(--accent-primary)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Market Mood</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{data.market_mood}</div>
                                    </div>
                                </div>
                                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
                                    <div style={{ width: 50, height: 50, borderRadius: '14px', background: 'var(--purple-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <TrendingUp size={24} color="var(--purple)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sentiment Score</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{data.average_sentiment_score.toFixed(3)}</div>
                                    </div>
                                </div>
                                <div className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', padding: '1.5rem' }}>
                                    <div style={{ width: 50, height: 50, borderRadius: '14px', background: 'var(--warning-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Newspaper size={24} color="var(--warning)" />
                                    </div>
                                    <div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Articles Scanned</div>
                                        <div style={{ fontSize: '1.4rem', fontWeight: 800 }}>{data.metadata.total_articles_analyzed}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="glass-panel flex-1">
                                <h3 style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.5rem', fontWeight: 600 }}>Sentiment Distribution</h3>
                                <div style={{ height: '220px' }}>
                                    <Bar data={chartData} options={chartOptions} />
                                </div>
                            </div>

                        </div>
                    </div>

                    {/* News Feed Grid */}
                    <div className="dashboard-grid animate-fade-3">
                        {/* Bullish News */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div className="flex-center mb-4" style={{ gap: '0.75rem', justifyContent: 'flex-start' }}>
                                <div style={{ padding: '0.5rem', background: 'var(--success-glow)', borderRadius: '8px', color: 'var(--success)' }}>
                                    <TrendingUp size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Positive Movers & Catalysts</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {data.top_bullish_news.length > 0 ? data.top_bullish_news.map((news, i) => (
                                    <div key={i} style={{
                                        padding: '1.25rem',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-light)',
                                        borderLeft: '4px solid var(--success)',
                                        transition: 'background 0.2s'
                                    }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    >
                                        <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.75rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>{news.title}</div>
                                        <div className="flex-between">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{news.source}</span>
                                            </div>
                                            <span className="badge badge-success" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                                                +{news.sentiment_score.toFixed(2)}
                                            </span>
                                        </div>
                                        {news.url && (
                                            <a href={news.url} target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--success)', textDecoration: 'none', fontWeight: 600 }}>
                                                Read Article <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                )) : <div style={{ color: 'var(--text-muted)' }}>No significant positive news found.</div>}
                            </div>
                        </div>

                        {/* Bearish News */}
                        <div className="glass-panel" style={{ padding: '2rem' }}>
                            <div className="flex-center mb-4" style={{ gap: '0.75rem', justifyContent: 'flex-start' }}>
                                <div style={{ padding: '0.5rem', background: 'var(--danger-glow)', borderRadius: '8px', color: 'var(--danger)' }}>
                                    <TrendingDown size={20} />
                                </div>
                                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>Risks & Headwinds</h3>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {data.top_bearish_news.length > 0 ? data.top_bearish_news.map((news, i) => (
                                    <div key={i} style={{
                                        padding: '1.25rem',
                                        background: 'rgba(255,255,255,0.02)',
                                        borderRadius: '12px',
                                        border: '1px solid var(--border-light)',
                                        borderLeft: '4px solid var(--danger)',
                                        transition: 'background 0.2s'
                                    }}
                                        onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    >
                                        <div style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '0.75rem', lineHeight: 1.5, color: 'var(--text-primary)' }}>{news.title}</div>
                                        <div className="flex-between">
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{news.source}</span>
                                            </div>
                                            <span className="badge badge-danger" style={{ fontSize: '0.8rem', padding: '0.2rem 0.6rem' }}>
                                                {news.sentiment_score.toFixed(2)}
                                            </span>
                                        </div>
                                        {news.url && (
                                            <a href={news.url} target="_blank" rel="noopener noreferrer"
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1rem', fontSize: '0.9rem', color: 'var(--danger)', textDecoration: 'none', fontWeight: 600 }}>
                                                Read Article <ExternalLink size={14} />
                                            </a>
                                        )}
                                    </div>
                                )) : <div style={{ color: 'var(--text-muted)' }}>No significant negative news found.</div>}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
