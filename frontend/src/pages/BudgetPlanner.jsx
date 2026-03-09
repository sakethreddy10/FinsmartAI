import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Wallet, TrendingDown, PiggyBank, Sparkles, AlertTriangle, Lightbulb, Receipt } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = [
    '#00f2fe',
    '#00ff87',
    '#ff0055',
    '#bf2ef0',
    '#ffbe0b',
    '#4facfe',
    '#ff6b6b',
    '#48dbfb',
];

export default function BudgetPlanner() {
    const [incomeText, setIncomeText] = useState('');
    const [expensesText, setExpensesText] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const handleAnalyze = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        try {
            const res = await axios.post('http://localhost:8000/api/budget/analyze', {
                income_text: incomeText,
                expenses_text: expensesText
            });
            setResult(res.data);
        } catch (err) {
            setError(err.response?.data?.detail || 'Failed to analyze budget');
        } finally {
            setLoading(false);
        }
    };

    const renderChart = () => {
        if (!result?.analysis?.expense_breakdown_by_category) return null;
        const breakdown = result.analysis.expense_breakdown_by_category;
        const labels = Object.keys(breakdown);
        const data = Object.values(breakdown);

        return (
            <Pie
                data={{
                    labels,
                    datasets: [{
                        data,
                        backgroundColor: CHART_COLORS.slice(0, labels.length),
                        borderColor: '#050505',
                        borderWidth: 3,
                    }],
                }}
                options={{
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: {
                                color: 'rgba(255,255,255,0.8)',
                                padding: 20,
                                usePointStyle: true,
                                pointStyleWidth: 12,
                                font: {
                                    size: 12,
                                    family: "'Inter', sans-serif"
                                }
                            }
                        },
                        tooltip: {
                            backgroundColor: 'rgba(16, 18, 27, 0.9)',
                            titleFont: { size: 13, family: "'Inter', sans-serif" },
                            bodyFont: { size: 14, weight: 'bold', family: "'Inter', sans-serif" },
                            padding: 12,
                            cornerRadius: 8,
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1
                        }
                    }
                }}
            />
        );
    };

    const savingsPercent = result?.analysis?.savings_percentage || 0;
    const savingsColor = savingsPercent >= 30 ? 'var(--success)' : savingsPercent >= 10 ? 'var(--warning)' : 'var(--danger)';

    return (
        <div className="container page-wrapper" style={{ maxWidth: '90%' }}>
            <div className="text-center animate-fade-1" style={{ marginBottom: '3.5rem', maxWidth: '800px', margin: '0 auto 3.5rem' }}>
                <div className="badge badge-accent mb-3">
                    <Wallet size={14} /> AI Budget Intelligence
                </div>
                <h1 className="page-title">Smart Budget Planner</h1>
                <p className="page-subtitle" style={{ margin: '0 auto' }}>
                    Describe your income and expenses naturally. Our AI will categorize your transactions, visualize your cash flow, and generate personalized financial strategies.
                </p>
            </div>

            {/* Input Section - Widened to 80-90% of screen */}
            <div className="glass-panel animate-fade-2" style={{ width: '100%', maxWidth: '1400px', margin: '0 auto 3rem', padding: '3rem' }}>
                <div className="flex-center mb-5" style={{ gap: '0.75rem', justifyContent: 'flex-start' }}>
                    <div style={{ padding: '0.6rem', background: 'rgba(0, 242, 254, 0.1)', borderRadius: '10px', color: 'var(--accent-primary)' }}>
                        <Receipt size={24} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 700 }}>Financial Data Entry</h3>
                </div>

                <form onSubmit={handleAnalyze}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', marginBottom: '2.5rem' }}>
                        <div className="input-row" style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '280px', flexShrink: 0, paddingTop: '1rem' }}>
                                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                                    <span style={{ fontSize: '1.6rem' }}>💰</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Income Sources</span>
                                </label>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                                    Enter your monthly salary, freelancing, or other earnings.
                                </p>
                            </div>
                            <textarea
                                className="input-control"
                                rows="6"
                                value={incomeText}
                                onChange={(e) => setIncomeText(e.target.value)}
                                placeholder="Example: My monthly salary is 80000 rupees. I also earned 5000 from freelance gigs this month."
                                style={{ fontSize: '1.1rem', padding: '1.5rem', flex: 1, minHeight: '160px' }}
                            />
                        </div>

                        <div className="input-row" style={{ display: 'flex', gap: '3rem', alignItems: 'flex-start' }}>
                            <div style={{ width: '280px', flexShrink: 0, paddingTop: '1rem' }}>
                                <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-primary)' }}>
                                    <span style={{ fontSize: '1.6rem' }}>🧾</span>
                                    <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Monthly Expenses</span>
                                </label>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.5rem', lineHeight: 1.4 }}>
                                    Enter rent, groceries, bills, and any other spending.
                                </p>
                            </div>
                            <textarea
                                className="input-control"
                                rows="6"
                                value={expensesText}
                                onChange={(e) => setExpensesText(e.target.value)}
                                placeholder="Example: 15000 for rent, 6000 groceries, 3000 electricity, 8000 dining out, 2000 for subscriptions."
                                style={{ fontSize: '1.1rem', padding: '1.5rem', flex: 1, minHeight: '160px' }}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        style={{ width: '100%', padding: '1.1rem', fontSize: '1.1rem' }}
                        disabled={loading || !incomeText.trim() || !expensesText.trim()}
                    >
                        {loading ? (
                            <>
                                <span style={{
                                    width: 18, height: 18,
                                    border: '2px solid rgba(0,0,0,0.2)',
                                    borderTopColor: '#050505',
                                    borderRadius: '50%',
                                    animation: 'pulse-ring 1s infinite'
                                }} />
                                Analyzing your finances...
                            </>
                        ) : (
                            <><Sparkles size={18} /> Generate Analytics & Strategy</>
                        )}
                    </button>
                </form>

                {error && (
                    <div className="mt-3 p-3 rounded" style={{ background: 'var(--danger-glow)', border: '1px solid rgba(255,0,85,0.2)', display: 'flex', gap: '0.75rem', alignItems: 'center', color: 'var(--danger)' }}>
                        <AlertTriangle size={18} />
                        <span style={{ fontWeight: 500 }}>{error}</span>
                    </div>
                )}
            </div>

            {/* Results */}
            {result && !loading && (
                <div className="animate-fade-3" style={{ maxWidth: '1100px', margin: '0 auto' }}>

                    {/* Stats KPIs */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>

                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'rgba(0, 242, 254, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Wallet size={26} color="var(--accent-primary)" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Income</div>
                                <div style={{ color: 'var(--text-primary)', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>₹{result.analysis.income?.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: 'var(--danger-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingDown size={26} color="var(--danger)" />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Expenses</div>
                                <div style={{ color: 'var(--danger)', fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>₹{result.analysis.total_expenses?.toLocaleString()}</div>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ padding: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: savingsPercent >= 20 ? 'var(--success-glow)' : 'var(--warning-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PiggyBank size={26} color={savingsColor} />
                            </div>
                            <div>
                                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Net Savings</div>
                                <div style={{ color: savingsColor, fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em' }}>₹{result.analysis.savings?.toLocaleString()}</div>
                            </div>
                        </div>

                    </div>

                    {/* Savings Goal Progress */}
                    <div className="glass-panel mb-4" style={{ padding: '1.5rem 2rem' }}>
                        <div className="flex-between mb-2">
                            <span style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.1rem' }}>Savings Rate Analysis</span>
                            <span style={{ fontWeight: 800, color: savingsColor, fontSize: '1.25rem' }}>{savingsPercent}%</span>
                        </div>
                        <div style={{ width: '100%', height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--border-light)' }}>
                            <div style={{
                                width: `${Math.min(100, Math.max(0, savingsPercent))}%`,
                                height: '100%',
                                background: `linear-gradient(90deg, ${savingsColor}, ${savingsColor}dd)`,
                                borderRadius: '6px',
                                transition: 'width 1.2s cubic-bezier(0.16, 1, 0.3, 1)'
                            }} />
                        </div>
                        <div className="flex-between mt-2" style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 500 }}>
                            <span>0% (Critical)</span>
                            <span style={{ paddingLeft: '2rem' }}>20% (Recommended Target)</span>
                            <span>50%+ (Aggressive)</span>
                        </div>
                    </div>

                    {/* Chart + Transactions Grid */}
                    <div className="dashboard-grid mb-4" style={{ alignItems: 'start' }}>

                        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
                            <div className="flex-center mb-4" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent-secondary)' }} />
                                <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Expense Distribution</h4>
                            </div>
                            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                                <div style={{ maxWidth: '300px', width: '100%', margin: '0 auto' }}>
                                    {renderChart()}
                                </div>
                            </div>
                        </div>

                        <div className="glass-panel" style={{ height: '100%', minHeight: '400px', display: 'flex', flexDirection: 'column' }}>
                            <div className="flex-center mb-4" style={{ gap: '0.5rem', justifyContent: 'flex-start' }}>
                                <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--purple)' }} />
                                <h4 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Itemized Transactions</h4>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1, overflowY: 'auto', paddingRight: '0.5rem' }}>
                                {result.expenses?.map((exp, i) => (
                                    <div key={i} style={{
                                        padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid var(--border-light)',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                                        transition: 'background 0.2s ease', cursor: 'default'
                                    }}
                                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${CHART_COLORS[i % CHART_COLORS.length]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: CHART_COLORS[i % CHART_COLORS.length], fontWeight: 800, fontSize: '1.2rem' }}>
                                                {exp.category?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{exp.category}</div>
                                                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{exp.description}</div>
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '1.05rem' }}>₹{exp.amount?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>

                    {/* AI Financial Advice */}
                    {result.advice && (
                        <div className="glass-panel" style={{ padding: '2.5rem' }}>
                            <div className="flex-center mb-4" style={{ gap: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '1.5rem', justifyContent: 'flex-start' }}>
                                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'var(--purple-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Lightbulb size={24} color="var(--purple)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.35rem', fontWeight: 800 }}>AI Strategic Advice</h3>
                                    <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Generated specifically for your financial profile</span>
                                </div>
                            </div>
                            <div className="advice-markdown">
                                <ReactMarkdown>{result.advice}</ReactMarkdown>
                            </div>
                        </div>
                    )}
                </div>
            )}

            <style>{`
                .advice-markdown { line-height: 1.8; color: var(--text-secondary); font-size: 1.05rem; }
                .advice-markdown h3 { font-size: 1.25rem; font-family: var(--font-heading); color: var(--text-primary); margin: 2rem 0 1rem; font-weight: 700; }
                .advice-markdown h3:first-child { margin-top: 0; }
                .advice-markdown p { margin-bottom: 1.25rem; }
                .advice-markdown strong { color: var(--accent-primary); font-weight: 600; }
                .advice-markdown ul, .advice-markdown ol { padding-left: 1.5rem; margin-bottom: 1.5rem; }
                .advice-markdown li { margin-bottom: 0.5rem; }
                .advice-markdown li::marker { color: var(--accent-secondary); font-weight: bold; }
            `}</style>
        </div>
    );
}
