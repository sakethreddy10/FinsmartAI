import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { Activity, MessageSquare, Calculator, TrendingUp, BarChart3 } from 'lucide-react';

import LandingPage from './pages/LandingPage';
import MarketSentiment from './pages/MarketSentiment';
import ChatBot from './pages/ChatBot';
import BudgetPlanner from './pages/BudgetPlanner';
import StockAnalyzer from './pages/StockAnalyzer';

const navItems = [
  { path: '/sentiment', label: 'Sentiment', icon: Activity },
  { path: '/chat', label: 'AI Assistant', icon: MessageSquare },
  { path: '/budget', label: 'Budget', icon: Calculator },
  { path: '/stock', label: 'Stock AI', icon: BarChart3 },
];

function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <TrendingUp size={22} color="#58a6ff" />
          FinSmart AI
        </Link>
        <div className="nav-links">
          {navItems.map(({ path, label, icon: Icon }) => (
            <Link
              key={path}
              to={path}
              className={`nav-link ${pathname === path ? 'active' : ''}`}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <>
      <Navbar />
      <main className="page-container">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/sentiment" element={<MarketSentiment />} />
          <Route path="/chat" element={<ChatBot />} />
          <Route path="/budget" element={<BudgetPlanner />} />
          <Route path="/stock" element={<StockAnalyzer />} />
        </Routes>
      </main>
    </>
  );
}

export default App;
