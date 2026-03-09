import { Link } from 'react-router-dom';
import { Activity, MessageSquare, Calculator, BarChart3, Sparkles, ArrowRight, Zap, Shield, Globe } from 'lucide-react';

const features = [
    {
        title: 'Market Sentiment',
        description: 'Real-time analysis of financial news to gauge market mood with a dynamic Fear & Greed index.',
        icon: Activity,
        color: 'var(--accent-secondary)',
        link: '/sentiment',
    },
    {
        title: 'AI Financial Assistant',
        description: 'Ask complex finance questions powered by RAG and advanced LLMs for context-aware answers.',
        icon: MessageSquare,
        color: 'var(--success)',
        link: '/chat',
    },
    {
        title: 'Budget Planner',
        description: 'Describe income & expenses in plain English — AI categorizes and visualizes your cash flow.',
        icon: Calculator,
        color: 'var(--warning)',
        link: '/budget',
    },
    {
        title: 'Stock Intelligence',
        description: 'Multi-agent AI research team generates professional, data-backed investment analysis reports.',
        icon: BarChart3,
        color: 'var(--purple)',
        link: '/stock',
    },
];

const techStack = ['Nvidia NIM', 'CrewAI', 'LangChain', 'FastAPI', 'React', 'MongoDB'];

export default function LandingPage() {
    return (
        <div className="container page-wrapper">
            {/* Hero Section */}
            <div className="flex-center animate-fade-1" style={{ flexDirection: 'column', textAlign: 'center', maxWidth: '800px', margin: '0 auto 5rem' }}>
                <div className="badge badge-accent mb-3">
                    <Sparkles size={14} />
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 600 }}>Next-Gen Financial Intelligence</span>
                </div>

                <h1 style={{
                    fontSize: 'clamp(3rem, 7vw, 4.5rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.1,
                    marginBottom: '1.5rem',
                }}>
                    Master your wealth with <br />
                    <span className="grad-text-accent">FinSmart AI.</span>
                </h1>

                <p style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.6,
                    maxWidth: '600px',
                    margin: '0 auto 2.5rem',
                    fontWeight: 400
                }}>
                    Gain institutional-grade market insights, manage budgets effortlessly, and build wealth with a unified suite of AI-powered tools.
                </p>

                <div className="flex-center" style={{ gap: '1rem', flexWrap: 'wrap' }}>
                    <Link to="/chat" className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        <MessageSquare size={18} /> Ask AI Assistant
                    </Link>
                    <Link to="/stock" className="btn btn-secondary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }}>
                        <BarChart3 size={18} /> Analyze Stocks
                    </Link>
                </div>

                {/* Trust indicators */}
                <div className="flex-center animate-fade-2 mt-4" style={{ gap: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                    <span className="flex-center" style={{ gap: '0.5rem' }}><Shield size={16} /> Bank-grade security</span>
                    <span className="flex-center" style={{ gap: '0.5rem' }}><Globe size={16} /> Real-time data</span>
                    <span className="flex-center" style={{ gap: '0.5rem' }}><Zap size={16} /> Instant insights</span>
                </div>
            </div>

            {/* Feature Grid */}
            <div className="dashboard-grid animate-fade-3" style={{ marginBottom: '5rem' }}>
                {features.map((f, i) => {
                    const Icon = f.icon;
                    return (
                        <Link
                            key={i}
                            to={f.link}
                            className="glass-panel"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                textDecoration: 'none',
                                color: 'inherit',
                                height: '100%',
                                gap: '1rem'
                            }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: '12px',
                                background: `rgba(255,255,255,0.03)`,
                                border: '1px solid var(--border-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: f.color
                            }}>
                                <Icon size={24} />
                            </div>

                            <h3 style={{
                                fontSize: '1.35rem',
                                color: 'var(--text-primary)',
                            }}>{f.title}</h3>

                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '1rem',
                                lineHeight: 1.6,
                                flexGrow: 1,
                            }}>
                                {f.description}
                            </p>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.5rem',
                                color: f.color,
                                fontSize: '0.95rem',
                                fontWeight: 600,
                                marginTop: '1rem'
                            }}>
                                Explore Feature <ArrowRight size={16} />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Tech Stack Footer */}
            <div className="animate-fade-4" style={{
                textAlign: 'center',
                padding: '2rem 0',
                borderTop: '1px solid var(--border-light)',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '1rem',
                    flexWrap: 'wrap',
                }}>
                    <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 500 }}>
                        <Zap size={14} color="var(--warning)" /> Proudly built with
                    </span>
                    {techStack.map((tech, i) => (
                        <span key={i} style={{
                            fontSize: '0.85rem',
                            padding: '0.4rem 1rem',
                            borderRadius: '100px',
                            background: 'rgba(255,255,255,0.02)',
                            border: '1px solid var(--border-light)',
                            color: 'var(--text-secondary)',
                            fontWeight: 500
                        }}>{tech}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
