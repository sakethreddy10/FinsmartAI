import { Link } from 'react-router-dom';
import { Activity, MessageSquare, Calculator, BarChart3, Sparkles, ArrowRight, Zap } from 'lucide-react';

const features = [
    {
        title: 'Market Sentiment',
        description: 'Real-time analysis of financial news to gauge market mood with a dynamic Fear & Greed index.',
        icon: Activity,
        color: '#58a6ff',
        bg: 'rgba(88, 166, 255, 0.08)',
        link: '/sentiment',
    },
    {
        title: 'AI Financial Assistant',
        description: 'Ask complex finance questions powered by RAG and Nvidia NIM for context-aware answers.',
        icon: MessageSquare,
        color: '#3fb950',
        bg: 'rgba(63, 185, 80, 0.08)',
        link: '/chat',
    },
    {
        title: 'Budget Planner',
        description: 'Describe income & expenses in plain English — AI categorizes and visualizes your cash flow.',
        icon: Calculator,
        color: '#f85149',
        bg: 'rgba(248, 81, 73, 0.08)',
        link: '/budget',
    },
    {
        title: 'Stock Intelligence',
        description: 'Multi-agent CrewAI research team generates professional investment analysis reports.',
        icon: BarChart3,
        color: '#a371f7',
        bg: 'rgba(163, 113, 247, 0.08)',
        link: '/stock',
    },
];

const techStack = ['Nvidia Llama 3.3', 'CrewAI', 'LangChain', 'FastAPI', 'React'];

export default function LandingPage() {
    return (
        <div className="container" style={{ paddingTop: '1rem', paddingBottom: '4rem' }}>
            {/* Hero */}
            <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 4rem' }}>
                <div className="badge badge-accent" style={{ marginBottom: '1.25rem' }}>
                    <Sparkles size={14} />
                    AI-Powered Financial Intelligence
                </div>

                <h1 style={{
                    fontSize: 'clamp(2.2rem, 5vw, 3.2rem)',
                    fontWeight: 800,
                    letterSpacing: '-0.03em',
                    lineHeight: 1.15,
                    marginBottom: '1.25rem',
                    background: 'linear-gradient(135deg, #fff 30%, #58a6ff 70%, #a371f7 100%)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                }}>
                    Your Intelligent<br />Finance Companion
                </h1>

                <p style={{
                    fontSize: '1.1rem',
                    color: 'var(--text-secondary)',
                    lineHeight: 1.7,
                    maxWidth: '560px',
                    margin: '0 auto',
                }}>
                    Gain market insights, manage budgets, and build wealth with a
                    unified suite of AI-powered tools.
                </p>
            </div>

            {/* Feature Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                gap: '1.25rem',
                marginBottom: '3.5rem',
            }}>
                {features.map((f, i) => {
                    const Icon = f.icon;
                    return (
                        <Link
                            key={i}
                            to={f.link}
                            className="glass-card"
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                                textDecoration: 'none',
                                color: 'inherit',
                                animation: `fadeIn 0.4s ease-out ${i * 0.08}s both`,
                            }}
                        >
                            <div style={{
                                width: '48px',
                                height: '48px',
                                borderRadius: 'var(--radius-md)',
                                background: f.bg,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1.25rem',
                            }}>
                                <Icon size={24} color={f.color} />
                            </div>

                            <h3 style={{
                                fontSize: '1.15rem',
                                fontWeight: 700,
                                marginBottom: '0.6rem',
                                letterSpacing: '-0.01em',
                            }}>{f.title}</h3>

                            <p style={{
                                color: 'var(--text-secondary)',
                                fontSize: '0.9rem',
                                lineHeight: 1.6,
                                flexGrow: 1,
                                marginBottom: '1.25rem',
                            }}>
                                {f.description}
                            </p>

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                color: f.color,
                                fontSize: '0.85rem',
                                fontWeight: 600,
                            }}>
                                Explore <ArrowRight size={14} />
                            </div>
                        </Link>
                    );
                })}
            </div>

            {/* Tech Stack Bar */}
            <div style={{
                textAlign: 'center',
                padding: '1.5rem 0',
                borderTop: '1px solid var(--border-color)',
            }}>
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.75rem',
                    flexWrap: 'wrap',
                }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                        <Zap size={12} /> Powered by
                    </span>
                    {techStack.map((tech, i) => (
                        <span key={i} style={{
                            fontSize: '0.78rem',
                            padding: '0.3rem 0.7rem',
                            borderRadius: '6px',
                            background: 'rgba(255,255,255,0.04)',
                            border: '1px solid var(--border-color)',
                            color: 'var(--text-secondary)',
                        }}>{tech}</span>
                    ))}
                </div>
            </div>
        </div>
    );
}
