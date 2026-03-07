import React, { useState } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Wallet, TrendingDown, PiggyBank, Sparkles, AlertTriangle, Lightbulb } from 'lucide-react';

ChartJS.register(ArcElement, Tooltip, Legend);

const CHART_COLORS = [
    'rgba(88, 166, 255, 0.85)',
    'rgba(63, 185, 80, 0.85)',
    'rgba(248, 81, 73, 0.85)',
    'rgba(163, 113, 247, 0.85)',
    'rgba(210, 153, 34, 0.85)',
    'rgba(139, 148, 158, 0.85)',
    'rgba(255, 123, 114, 0.85)',
    'rgba(88, 255, 200, 0.85)',
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
                        borderColor: 'rgba(10, 14, 23, 1)',
                        borderWidth: 2,
                    }],
                }}
                options={{
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: 'rgba(240,246,252,0.7)', padding: 14, usePointStyle: true, pointStyleWidth: 10, font: { size: 11 } }
                        }
                    }
                }}
            />
        );
    };

    const savingsPercent = result?.analysis?.savings_percentage || 0;
    const savingsColor = savingsPercent >= 30 ? 'var(--success-color)' : savingsPercent >= 10 ? 'var(--warning-color)' : 'var(--danger-color)';

    return (
        <div className="container">
            <div style={{ marginBottom: '2rem' }}>
                <div className="badge badge-danger" style={{ marginBottom: '0.75rem' }}>
                    <Wallet size={13} /> AI-Powered Budget Analysis
                </div>
                <h1 className="page-title">Budget Planner</h1>
                <p className="page-subtitle">Describe your income and expenses in plain English — AI categorizes everything and gives personalized financial advice.</p>
            </div>

            {/* Input Section */}
            <div className="glass-card-static" style={{ maxWidth: '800px', margin: '0 auto 1.5rem' }}>
                <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: '1.25rem' }}>Enter Your Financial Data</h3>
                <form onSubmit={handleAnalyze}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                💰 Describe your Income
                            </label>
                            <textarea
                                className="input-control"
                                rows="3"
                                value={incomeText}
                                onChange={(e) => setIncomeText(e.target.value)}
                                placeholder="e.g. My monthly salary is 80000 rupees, I also get 5000 freelance income"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', marginBottom: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                                🧾 Describe your Expenses
                            </label>
                            <textarea
                                className="input-control"
                                rows="3"
                                value={expensesText}
                                onChange={(e) => setExpensesText(e.target.value)}
                                placeholder="e.g. 15000 rent, 5000 groceries, 3000 electricity, 8000 dining out, 2000 Netflix and Spotify"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading || !incomeText.trim() || !expensesText.trim()}>
                        {loading ? (
                            <><span style={{ width: 14, height: 14, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' }} /> Analyzing your finances...</>
                        ) : (
                            <><Sparkles size={16} /> Analyze & Get Advice</>
                        )}
                    </button>
                </form>

                {error && (
                    <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--danger-color)', fontSize: '0.9rem' }}>
                        <AlertTriangle size={16} /> {error}
                    </div>
                )}
            </div>

            {/* Loading */}
            {loading && (
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <div style={{ width: 28, height: 28, border: '3px solid rgba(88,166,255,0.15)', borderTopColor: 'var(--accent-color)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 1rem' }} />
                    <p style={{ color: 'var(--accent-color)' }}>AI is analyzing your budget and generating personalized advice...</p>
                </div>
            )}

            {/* Results */}
            {result && !loading && (
                <div style={{ maxWidth: '900px', margin: '0 auto', animation: 'fadeSlideUp 0.4s ease-out' }}>
                    {/* Stats Row */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1rem' }}>
                        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(88,166,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <Wallet size={20} color="var(--accent-color)" />
                            </div>
                            <div>
                                <div className="stat-label" style={{ textAlign: 'left' }}>Monthly Income</div>
                                <div className="stat-value" style={{ color: 'var(--accent-color)', fontSize: '1.3rem' }}>₹{result.analysis.income?.toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: 'rgba(248,81,73,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingDown size={20} color="var(--danger-color)" />
                            </div>
                            <div>
                                <div className="stat-label" style={{ textAlign: 'left' }}>Total Expenses</div>
                                <div className="stat-value" style={{ color: 'var(--danger-color)', fontSize: '1.3rem' }}>₹{result.analysis.total_expenses?.toLocaleString()}</div>
                            </div>
                        </div>
                        <div className="stat-card" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textAlign: 'left' }}>
                            <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-sm)', background: savingsPercent >= 20 ? 'rgba(63,185,80,0.08)' : 'rgba(248,81,73,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <PiggyBank size={20} color={savingsColor} />
                            </div>
                            <div>
                                <div className="stat-label" style={{ textAlign: 'left' }}>Net Savings</div>
                                <div className="stat-value" style={{ color: savingsColor, fontSize: '1.3rem' }}>₹{result.analysis.savings?.toLocaleString()}</div>
                            </div>
                        </div>
                    </div>

                    {/* Savings Progress Bar */}
                    <div className="glass-card-static" style={{ padding: '1rem 1.5rem', marginBottom: '1rem' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.85rem' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Savings Rate</span>
                            <span style={{ fontWeight: 700, color: savingsColor }}>{savingsPercent}%</span>
                        </div>
                        <div style={{ width: '100%', height: '10px', background: 'rgba(255,255,255,0.06)', borderRadius: '5px', overflow: 'hidden' }}>
                            <div style={{ width: `${Math.min(100, Math.max(0, savingsPercent))}%`, height: '100%', background: `linear-gradient(90deg, ${savingsColor}, ${savingsColor}cc)`, borderRadius: '5px', transition: 'width 0.8s ease-out' }} />
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.35rem', fontSize: '0.72rem', color: 'var(--text-secondary)' }}>
                            <span>0%</span>
                            <span>20% ideal</span>
                            <span>50%</span>
                        </div>
                    </div>

                    {/* Chart + Transactions */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div className="glass-card-static">
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Expense Distribution</h4>
                            <div style={{ maxWidth: '220px', margin: '0 auto' }}>
                                {renderChart()}
                            </div>
                        </div>
                        <div className="glass-card-static">
                            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Transactions</h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: '260px', overflowY: 'auto' }}>
                                {result.expenses?.map((exp, i) => (
                                    <div key={i} style={{
                                        padding: '0.55rem 0.7rem', background: 'rgba(0,0,0,0.2)', borderRadius: '8px',
                                        display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem'
                                    }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: CHART_COLORS[i % CHART_COLORS.length], flexShrink: 0 }} />
                                            <div>
                                                <div style={{ fontWeight: 500 }}>{exp.category}</div>
                                                <div style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{exp.description}</div>
                                            </div>
                                        </div>
                                        <span style={{ fontWeight: 600, color: 'var(--danger-color)', whiteSpace: 'nowrap' }}>₹{exp.amount?.toLocaleString()}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* AI Financial Advice */}
                    {result.advice && (
                        <div className="glass-card-static" style={{ animation: 'fadeIn 0.4s ease-out 0.2s both' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)' }}>
                                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(163,113,247,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                    <Lightbulb size={18} color="var(--purple-color)" />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: '1.05rem', fontWeight: 700 }}>AI Financial Advice</h3>
                                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Personalized recommendations based on your budget</span>
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
                .advice-markdown { line-height: 1.75; color: rgba(240,246,252,0.85); font-size: 0.92rem; }
                .advice-markdown h3 { font-size: 1.05rem; color: var(--accent-color); margin: 1.25rem 0 0.5rem; }
                .advice-markdown h3:first-child { margin-top: 0; }
                .advice-markdown p { margin-bottom: 0.5rem; }
                .advice-markdown strong { color: #e6edf3; }
                .advice-markdown ul, .advice-markdown ol { padding-left: 1.25rem; margin-bottom: 0.6rem; }
                .advice-markdown li { margin-bottom: 0.25rem; }
                .advice-markdown li::marker { color: var(--accent-color); }
                .advice-markdown table { width: 100%; border-collapse: collapse; margin: 0.5rem 0; font-size: 0.88rem; }
                .advice-markdown th { background: rgba(88,166,255,0.06); color: var(--accent-color); font-weight: 600; text-align: left; padding: 0.5rem 0.7rem; border: 1px solid rgba(255,255,255,0.06); }
                .advice-markdown td { padding: 0.4rem 0.7rem; border: 1px solid rgba(255,255,255,0.04); }
                .advice-markdown code { background: rgba(255,255,255,0.07); padding: 0.1rem 0.3rem; border-radius: 3px; font-size: 0.85em; }
            `}</style>
        </div>
    );
}
