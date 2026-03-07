import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';
import { Activity, Newspaper, TrendingUp, TrendingDown, Search, ExternalLink, BarChart3 } from 'lucide-react';

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
            setError(err.response?.data?.detail || 'Failed to fetch market sentiment');
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
        const needleAngle = (indexValue - 50) * 1.8;

        let gaugeColor = '#3fb950';
        if (level.includes('Fear')) gaugeColor = '#f85149';
        else if (level === 'Neutral') gaugeColor = '#d29922';

        return (
            <div className="glass-card-static" style={{ textAlign: 'center' }}>
                <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Fear & Greed Index</h3>

                <div style={{ position: 'relative', width: '200px', height: '115px', margin: '0 auto' }}>
                    {/* Arc */}
                    <div style={{
                        position: 'absolute', width: '200px', height: '200px', borderRadius: '50%',
                        background: 'conic-gradient(from 180deg, #f85149 0deg, #f85149 30deg, #d29922 50deg, #d29922 70deg, #3fb950 90deg, #3fb950 180deg)',
                        clipPath: 'polygon(0 0, 100% 0, 100% 50%, 0 50%)', opacity: 0.8,
                    }} />
                    <div style={{ position: 'absolute', width: '156px', height: '156px', borderRadius: '50%', background: 'var(--bg-card)', top: '22px', left: '22px' }} />

                    {/* Needle */}
                    <div style={{
                        position: 'absolute', width: '3px', height: '75px', background: '#e6edf3',
                        left: 'calc(50% - 1.5px)', bottom: '0', transformOrigin: 'bottom center',
                        transform: `rotate(${needleAngle}deg)`, transition: 'transform 1s cubic-bezier(0.4, 0, 0.2, 1)',
                        borderRadius: '2px',
                    }} />
                    <div style={{ position: 'absolute', width: '12px', height: '12px', background: '#e6edf3', borderRadius: '50%', bottom: '-6px', left: 'calc(50% - 6px)', zIndex: 5 }} />

                    {/* Labels on arc */}
                    <span style={{ position: 'absolute', left: '-8px', bottom: '-2px', fontSize: '0.65rem', color: '#f85149' }}>Fear</span>
                    <span style={{ position: 'absolute', right: '-12px', bottom: '-2px', fontSize: '0.65rem', color: '#3fb950' }}>Greed</span>
                </div>

                <div style={{ marginTop: '0.5rem' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 800, lineHeight: 1, letterSpacing: '-0.03em' }}>{indexValue}</div>
                    <div style={{ fontSize: '0.9rem', color: gaugeColor, fontWeight: 600, marginTop: '0.25rem' }}>{level}</div>
                </div>

                <p style={{ marginTop: '1rem', fontSize: '0.85rem', fontStyle: 'italic', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    "{data.summary_note}"
                </p>
            </div>
        );
    };

    const chartData = data ? {
        labels: ['Positive', 'Neutral', 'Negative'],
        datasets: [{
            label: 'Articles',
            data: [data.metadata.positive_articles, data.metadata.neutral_articles, data.metadata.negative_articles],
            backgroundColor: ['rgba(63,185,80,0.7)', 'rgba(139,148,158,0.5)', 'rgba(248,81,73,0.7)'],
            borderColor: ['#3fb950', '#8b949e', '#f85149'],
            borderWidth: 1, borderRadius: 6,
        }],
    } : null;

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
            x: { ticks: { color: 'rgba(240,246,252,0.5)', font: { size: 12 } }, grid: { display: false }, border: { display: false } },
            y: { ticks: { color: 'rgba(240,246,252,0.3)', font: { size: 11 } }, grid: { color: 'rgba(255,255,255,0.03)' }, border: { display: false } },
        },
    };

    return (
        <div className="container">
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <div className="badge badge-accent" style={{ marginBottom: '0.75rem' }}>
                        <Activity size={13} /> Real-Time Sentiment Analysis
                    </div>
                    <h1 className="page-title">Market Sentiment</h1>
                    <p className="page-subtitle" style={{ margin: 0 }}>AI-powered analysis of financial news to gauge market emotion.</p>
                </div>
                <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.5rem' }}>
                    <div style={{ position: 'relative' }}>
                        <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', pointerEvents: 'none' }} />
                        <input type="text" className="input-control" placeholder="Search topic..." value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{ width: '220px', paddingLeft: '32px', height: '40px', fontSize: '0.88rem' }} />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ height: '40px', padding: '0 1.25rem', fontSize: '0.88rem' }}>Analyze</button>
                </form>
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '4rem' }}>
                    <div style={{ width: 28, height: 28, border: '3px solid rgba(88,166,255,0.15)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--accent-color)', fontSize: '0.95rem' }}>Analyzing market sentiment...</p>
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="glass-card-static" style={{ borderLeft: '3px solid var(--danger-color)', color: 'var(--danger-color)', marginBottom: '1.5rem' }}>
                    {error}
                </div>
            )}

            {!loading && !error && data && (
                <>
                    {/* Top Row: Gauge + Metrics + Chart */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                        {renderGauge()}

                        {/* Metrics */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            <div className="stat-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(88,166,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Activity size={20} color="var(--accent-color)" />
                                </div>
                                <div>
                                    <div className="stat-label" style={{ textAlign: 'left' }}>Market Mood</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{data.market_mood}</div>
                                </div>
                            </div>
                            <div className="stat-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(163,113,247,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <BarChart3 size={20} color="var(--purple-color)" />
                                </div>
                                <div>
                                    <div className="stat-label" style={{ textAlign: 'left' }}>Avg Score</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{data.average_sentiment_score.toFixed(4)}</div>
                                </div>
                            </div>
                            <div className="stat-card" style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(210,153,34,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Newspaper size={20} color="var(--warning-color)" />
                                </div>
                                <div>
                                    <div className="stat-label" style={{ textAlign: 'left' }}>Articles</div>
                                    <div style={{ fontSize: '1.2rem', fontWeight: 700 }}>{data.metadata.total_articles_analyzed}</div>
                                </div>
                            </div>
                        </div>

                        {/* Chart */}
                        <div className="glass-card-static" style={{ display: 'flex', flexDirection: 'column' }}>
                            <h3 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Breakdown</h3>
                            <div style={{ flex: 1, minHeight: '180px' }}>
                                <Bar data={chartData} options={chartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* News Columns */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
                        {/* Bullish */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <TrendingUp size={16} color="var(--success-color)" />
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--success-color)' }}>Top Bullish News</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {data.top_bullish_news.map((news, i) => (
                                    <div key={i} className="glass-card-static" style={{ padding: '1rem', borderLeft: '3px solid var(--success-color)' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', lineHeight: 1.4 }}>{news.title}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                            <span>{news.source}</span>
                                            <span className="badge badge-success" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                                +{news.sentiment_score.toFixed(3)}
                                            </span>
                                        </div>
                                        {news.url && (
                                            <a href={news.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--accent-color)', textDecoration: 'none' }}>
                                                Read article <ExternalLink size={11} />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Bearish */}
                        <div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                                <TrendingDown size={16} color="var(--danger-color)" />
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--danger-color)' }}>Top Bearish News</h3>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                                {data.top_bearish_news.map((news, i) => (
                                    <div key={i} className="glass-card-static" style={{ padding: '1rem', borderLeft: '3px solid var(--danger-color)' }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.4rem', lineHeight: 1.4 }}>{news.title}</div>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                                            <span>{news.source}</span>
                                            <span className="badge badge-danger" style={{ fontSize: '0.7rem', padding: '2px 6px' }}>
                                                {news.sentiment_score.toFixed(3)}
                                            </span>
                                        </div>
                                        {news.url && (
                                            <a href={news.url} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--accent-color)', textDecoration: 'none' }}>
                                                Read article <ExternalLink size={11} />
                                            </a>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
