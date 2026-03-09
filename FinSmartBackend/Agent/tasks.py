
from crewai import Task
from textwrap import dedent
from tools import (
    scrape_tool,
    tavily_tool,
    calculate,
    get_company_filings,
    search_internet,
    yahoo_finance_news,
    get_stock_prices,
    get_company_facts,
    get_financial_metrics,
    get_financial_statements,
    get_insider_trades,
    get_institutional_ownership,
    stock_screener,
    get_media_news,
    get_key_financial_ratios
)

class StockAnalysisTasks():
  def research(self, agent):
    return Task(description=dedent(f"""
        Collect and summarize recent news articles, press
        releases, and market analyses related to the stock and
        its industry.
        Pay special attention to any significant events, market
        sentiments, and analysts' opinions. Also include upcoming 
        events like earnings and others.
  
        Your final answer MUST be a report that includes a
        comprehensive summary of the latest news, any notable
        shifts in market sentiment, and potential impacts on 
        the stock.
        Also make sure to return the stock ticker.
        
        IMPORTANT: DO NOT include a main title like "## Market Research" at the beginning of your text. Just provide the substantive content.
        
        {self.__tip_section()}
  
        Make sure to use the most recent data as possible.
  
        Selected company by the customer: {{company}}
      """),
      expected_output="A comprehensive report summarizing latest news, market sentiment, and potential impacts on the stock.",
      tools=[
        scrape_tool,
        tavily_tool,
        search_internet,
        yahoo_finance_news,
        get_company_filings,
        get_media_news,
        get_company_facts
      ],
      agent=agent
    )
    
  def financial_analysis(self, agent): 
    return Task(description=dedent(f"""
        Conduct a COMPREHENSIVE QUANTITATIVE analysis of the stock's financial health.
        
        1. **Valuation Ratios** (Focus only on the target company, provide exact numbers):
           - P/E Ratio
           - P/S Ratio (Price-to-Sales)
           - P/B Ratio (Price-to-Book)
           - EV/EBITDA
        
        2. **Profitability Metrics**:
           - Gross Margin %
           - Operating Margin %
           - Net Profit Margin %
           - ROE (Return on Equity) %
        
        3. **Growth & Health Metrics**:
           - Revenue Growth % (YoY)
           - Earnings Growth % (YoY)
           - Current Ratio
           - Debt-to-Equity Ratio
        
        Provide the data in simple, clean markdown tables for the target company ONLY. Make sure every cell in your tables contains actual data or 'N/A'.
        
        IMPORTANT RULES:
        1. DO NOT include a main title like "## Financial Analysis" at the beginning of your text. Just provide the substantive content.
        2. If the company is PRIVATE, UNLISTED, or financial data is completely unavailable (like GROWW), DO NOT create tables filled with "N/A". Instead, write a short paragraph explaining that quantitative financial data is unavailable because it is a private entity.
        3. Only generate the tables if you have actual numerical data.

        {self.__tip_section()}

        Use the most recent quarterly and annual data.
      """),
      expected_output="A comprehensive quantitative financial analysis with detailed tables of all key metrics, ratios, growth rates, and peer comparisons.",
      tools=[
        scrape_tool,
        tavily_tool,
        calculate,
        get_company_filings,
        get_financial_metrics,
        get_financial_statements,
        get_stock_prices,
        stock_screener,
        get_key_financial_ratios
      ],
      agent=agent
    )

  def filings_analysis(self, agent):
    return Task(description=dedent(f"""
        Analyze the latest 10-Q and 10-K filings from EDGAR for
        the stock in question. 
        Focus on key sections like Management's Discussion and
        Analysis, financial statements, insider trading activity, 
        and any disclosed risks.
        Extract relevant data and insights that could influence
        the stock's future performance.

        Your final answer must be an expanded report highlighting significant findings from these filings,
        including any red flags or positive indicators for the customer.
        
        IMPORTANT RULES:
        1. DO NOT include a main title like "## SEC Filings & Earnings Analysis" at the beginning.
        2. DO NOT use bold text like "**SEC Filings & Earnings Analysis**" for the main section title. Just write the findings normally.
        3. If no SEC filings exist (e.g. if the company is private, foreign, or recently listed), simply state that no public filings are available for this entity. DO NOT invent findings.

        {self.__tip_section()}        
      """),
      expected_output="An expanded report highlighting significant findings from SEC filings, including red flags and positive indicators.",
      tools=[
        scrape_tool,
        tavily_tool,
        get_company_filings
      ],
      agent=agent
    )

  def recommend(self, agent):
    return Task(description=dedent(f"""
        Create a PROFESSIONAL INVESTMENT REPORT with comprehensive numerical data.
        
        Your report MUST include these sections with EXACT NUMBERS:
        
        ## 1. Executive Summary & Rating
        - Clear BUY/HOLD/SELL recommendation
        - Target Price (12-month) with upside/downside %
        - Risk Rating (Low/Medium/High)
        
        ## 2. Valuation Summary Table
        | Metric | Current Value | Assessment |
        |--------|---------------|------------|
        | P/E Ratio | X | Overvalued/Fair/Undervalued |
        | P/S Ratio | X | ... |
        | P/B Ratio | X | ... |
        | EV/EBITDA | X | ... |
        
        ## 3. Financial Performance Metrics
        - Revenue Growth: X%
        - Earnings Growth: X%
        - Gross Margin: X%
        - Net Margin: X%
        
        ## 4. Profitability & Returns
        - ROE: X%
        - Operating Margin: X%
        
        ## 5. Financial Health Scorecard
        | Metric | Value | Status |
        |--------|-------|--------|
        | Current Ratio | X | Healthy/Warning |
        | Debt/Equity | X | ... |
        
        ## 6. Growth Analysis
        - Revenue CAGR (3Y, 5Y)
        - Earnings CAGR (3Y, 5Y)
        - FCF Growth rate
        
        ## 7. Insider Activity & Ownership
        - Insider buying/selling (₹ value, % of holdings)
        - Top 5 institutional holders (% ownership)
        
        ## 8. Price Targets & Catalysts
        - Analyst consensus (High/Low/Mean)
        - Upcoming earnings date
        - Key catalysts (positive and negative)
        
        ## 9. Risk Factors (with impact level)
        - List 3-5 key risks with High/Medium/Low impact
        
        ## 10. Investment Thesis
        - Clear reasons to BUY/HOLD/SELL with supporting data
        
        Format EVERYTHING cleanly.
        
        IMPORTANT RULES:
        1. DO NOT include a main title like "## Investment Recommendation" at the beginning. Just jump straight into "## 1. Executive Summary".
        2. If the company is PRIVATE, UNLISTED, or financial data is completely unavailable (like GROWW): DO NOT render any of the empty tables above with "N/A". Instead, write a qualitative business overview, available private estimates, and a qualitative recommendation.
        3. ALWAYS use actual numbers if available.
        4. In the Investment Thesis section, simply provide the bullet points. DO NOT output the literal text "(3-5 bullet points)".

        {self.__tip_section()}
      """),
      expected_output="A professional investment report with comprehensive tables, metrics, ratios, and data-driven recommendations in MARKDOWN format.",
      tools=[
        scrape_tool,
        tavily_tool,
        search_internet,
        calculate,
        yahoo_finance_news,
        get_insider_trades,
        get_institutional_ownership,
        get_key_financial_ratios,
        get_financial_metrics,
        get_stock_prices
      ],
      agent=agent,
      output_file='new-blog-post.md'
    )

  def __tip_section(self):
    return "If you do your BEST WORK, I'll give you a ₹10,000 commission!"

