# FinSmart AI 🚀

**Your Ultimate Personal Finance & Market Intelligence Assistant**

FinSmart AI is a comprehensive, full-stack financial application combining cutting-edge AI technologies and algorithmic insights to simplify financial guidance. It empowers retail investors and everyday users by providing professional-grade market sentiment analysis, personalized budget planning, AI-driven stock analysis, and an intelligent Gen-AI Chatbot powered by Retrieval-Augmented Generation (RAG).

---

## 🏗️ Architecture Overview

The system follows a **decoupled full-stack architecture** with a premium **Vite + React frontend** and a highly modular **FastAPI Python backend**.

### Frontend (Vite + React SPA)
- **Framework:** React 19 powered by Vite 7 for instant HMR and optimized production builds.
- **Styling:** Custom Vanilla CSS with a premium dark-mode aesthetic, glassmorphism (translucent cards, blurred backdrops), smooth gradients, and micro-animations.
- **Data Visualization:** `Chart.js` (via `react-chartjs-2`) for dynamic Doughnut and Bar charts.
- **Routing:** `react-router-dom` v7 for seamless SPA navigation.
- **Icons:** `lucide-react` for consistent, modern iconography.
- **HTTP Client:** `axios` for API communication.

### Backend (FastAPI)
- **Framework:** FastAPI with Uvicorn, providing async request handling, automatic OpenAPI/Swagger docs, and Pydantic validation.
- **AI/LLM Stack:**
  - `Nvidia Llama 3.3 70B` via OpenAI-compatible API for all LLM inference (budget extraction, chatbot, investment guidance, sentiment analysis).
  - `CrewAI` multi-agent framework for orchestrating Financial Analyst, Research Analyst, and Investment Advisor agents.
  - `LangChain` ecosystem (`langchain-core`, `langchain-community`, `langchain-openai`, `langchain-nvidia-ai-endpoints`) for managing LLM interactions.
  - `HuggingFace sentence-transformers` for document embeddings.
  - **DataStax AstraDB** as the Vector Store for Retrieval-Augmented Generation (RAG).
- **Data Sources:** `yfinance`, Financial Datasets API, Marketaux News API.

---

## 🌟 Core Features

### 1. 📊 Market News & Sentiment Engine
Real-time analysis of stock market news to gauge aggregate market emotion.
- Fetches top financial news articles and runs them through an LLM to derive article-level sentiment scores (-1 to 1).
- Aggregates scores into a unified "Market Mood" and calculates a real-time **Fear-Greed Index**.
- Dynamic rotating gauge via CSS transforms; responsive Chart.js bar graphs splitting positive/negative sentiment.
- **Route:** `/sentiment` · **API:** `GET /api/sentiment/market`

### 2. 🤖 AI Chatbot with RAG
A conversational financial assistant that answers complex finance questions using verified enterprise data.
- Supports general financial inquiries and targeted RAG queries based on uploaded financial documents/PDFs.
- Ingests documents → creates embeddings via `langchain-huggingface` → stores in AstraDB → uses contextual retrieval for grounded responses.
- **Route:** `/chat` · **API:** `POST /api/finance_rag/query`

### 3. 💰 Personal Budget Planner
Simplifies monthly accounting through Natural Language Processing (NLP).
- Users describe income and expenses in natural language; the LLM automatically categorizes expenses (Groceries, Rent, Utilities, etc.) and computes net savings.
- Interactive React pie chart detailing cash-flow breakdown.
- **Route:** `/budget` · **API:** `POST /api/budget/analyze`

### 4. 📈 CrewAI Stock Trend Analyzer
A professional AI research desk generating comprehensive investment analysis reports.
- Input a stock ticker → CrewAI orchestrates multiple AI agents that scrape the web, pull financial data (Yahoo Finance, Financial Datasets API), compute valuation ratios, and draft professional investment recommendations.
- Multi-agent framework with Financial Analyst, Research Analyst, and Investment Advisor roles.
- Markdown-rendered investment reports.
- **Route:** `/stock` · **API:** `POST /api/portfolio/analyze`

---

## 🛠️ Project Structure

```
FinSmartProject/
├── FinSmartBackend/              # FastAPI Backend API
│   ├── main.py                   # App entrypoint, CORS, router registration
│   ├── model_loader.py           # Nvidia API-based LLM wrapper (call_llm)
│   ├── crew_service.py           # CrewAI stock analysis orchestrator
│   ├── expenses_categorizer.py   # Expense categorization logic
│   ├── investment_advisor.py     # Investment advice generation
│   ├── savings_analysis.py       # Savings computation
│   ├── models.py                 # Pydantic data models
│   ├── schemas.py                # API schemas
│   ├── Agent/                    # CrewAI agent definitions & tools
│   │   ├── agents.py             # Financial/Research/Investment agents
│   │   ├── crew.py               # Crew orchestration
│   │   ├── tasks.py              # Task definitions for the crew
│   │   └── tools.py              # Financial data tools (yfinance, APIs)
│   ├── routers/                  # API route handlers
│   │   ├── sentiment_routes.py   # Market sentiment endpoints
│   │   ├── budget_routes.py      # Budget analysis endpoints
│   │   ├── portfolio_routes.py   # Stock analysis endpoints
│   │   ├── rag_routes.py         # Document QA endpoints
│   │   └── finance_routes.py     # Finance RAG endpoints
│   ├── market_sentiment/         # Sentiment analysis engine
│   │   ├── config.py             # API keys & configuration
│   │   ├── news_engine.py        # News fetching & processing
│   │   ├── sentiment_analyzer.py # LLM-based sentiment scoring
│   │   ├── api_client.py         # External API client
│   │   ├── financial_datasets_client.py
│   │   ├── market_data_analyzer.py
│   │   └── main.py               # Sentiment module entrypoint
│   └── requirements.txt
├── frontend/                     # Vite + React Frontend
│   ├── index.html
│   ├── vite.config.js
│   ├── package.json
│   └── src/
│       ├── App.jsx               # Router & Navbar
│       ├── index.css             # Global dark theme & design system
│       ├── main.jsx              # React entrypoint
│       └── pages/
│           ├── LandingPage.jsx       # Hero landing page
│           ├── MarketSentiment.jsx    # Sentiment dashboard
│           ├── ChatBot.jsx           # AI chatbot interface
│           ├── BudgetPlanner.jsx     # Budget analysis UI
│           └── StockAnalyzer.jsx     # Stock analysis UI
├── thiru_repo/                   # Contributor module: Finance Bot & RAG
│   ├── Fin_Personal_Assitant/    # Personal finance assistant
│   ├── FinRAG/                   # Financial RAG system
│   ├── Datasets/                 # Training/reference datasets
│   └── backend/                  # Standalone backend experiments
├── shiva_repo/                   # Contributor module: Streamlit prototype
│   ├── FinSmartAI/               # Original Streamlit-based app
│   └── streamlit_app.py          # Streamlit UI
└── README.md
```

---

## ⚙️ Setup & Installation

This project requires running the **Backend API Server** and the **Frontend Dev Server** simultaneously.

### Prerequisites
- **Python 3.10+** (with pip)
- **Node.js 18+** (with npm)
- **API Keys:** Nvidia, Financial Datasets, SerpAPI, Tavily, Marketaux, AstraDB

### Step 1: Configure Environment Variables

Create a `.env` file inside `FinSmartBackend/`:
```env
NVIDIA_API_KEY=your_nvidia_api_key
FINANCIAL_DATASETS_API_KEY=your_fd_api_key
SERPAPI_API_KEY=your_serpapi_key
TAVILY_API_KEY=your_tavily_key
MARKETAUX_API_KEY=your_marketaux_key
```

### Step 2: Start the FastAPI Backend

```bash
cd FinSmartBackend

# Install dependencies (first time only)
pip install -r requirements.txt

# Start the API server (runs on http://localhost:8000)
python -m uvicorn main:app --reload
```

> **Tip:** Visit `http://localhost:8000/docs` for the interactive Swagger API documentation.

### Step 3: Start the React Frontend

```bash
cd frontend

# Install dependencies (first time only)
npm install

# Start the Vite dev server (runs on http://localhost:5173)
npm run dev
```

---

## 📝 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 19, Vite 7, Chart.js, react-chartjs-2, Lucide Icons, react-markdown, Vanilla CSS |
| **Backend** | FastAPI, Uvicorn, Pydantic, python-dotenv |
| **AI / LLM** | Nvidia Llama 3.3 70B, CrewAI, LangChain, LangChain-Nvidia, LangChain-HuggingFace |
| **Embeddings** | HuggingFace sentence-transformers, PyTorch |
| **Data Sources** | yfinance, Financial Datasets API, Marketaux News API, SerpAPI, Tavily |
| **Vector DB** | DataStax AstraDB |
| **HTTP** | Axios (frontend), Requests (backend) |

---

## 🚀 API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/` | GET | Health check |
| `/api/sentiment/market` | GET | Fetch market sentiment analysis |
| `/api/finance_rag/query` | POST | Query the finance RAG chatbot |
| `/api/budget/analyze` | POST | Analyze budget from natural language input |
| `/api/portfolio/analyze` | POST | Run CrewAI stock trend analysis |
| `/api/rag/upload` | POST | Upload documents for RAG |
| `/api/rag/query` | POST | Query uploaded documents |

---

## 🤝 Contributors

| Contributor | Module |
|---|---|
| **Shiva** (`shiva_repo/`) | Original Streamlit prototype, budget & investment modules |
| **Thiru** (`thiru_repo/`) | Finance Bot, RAG system, personal finance assistant |

---

## 📄 License

MIT
