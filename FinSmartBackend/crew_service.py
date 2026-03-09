"""Crew service wrapper for stock analysis"""
import sys
import os
import re
import asyncio
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

# Add Agent directory to path
sys.path.append(os.path.join(os.path.dirname(__file__), 'Agent'))

from agents import StockAnalysisAgents
from tasks import StockAnalysisTasks
from crewai import Crew, Process


def fix_markdown_formatting(text: str) -> str:
    """
    Fix malformed markdown from CrewAI output.
    CrewAI sometimes returns markdown tables on single lines with pipes
    but missing newlines. This function ensures proper line breaks so that
    ReactMarkdown can parse tables, headers, and lists correctly.
    """
    if not text:
        return text

    # 1. Normalize: replace literal \n with actual newlines if needed
    text = text.replace('\\n', '\n')

    # 2. Fix table rows on single lines:
    #    Pattern: "| col1 | col2 | |" without newlines
    #    Ensure each | ... | row starts on a new line
    text = re.sub(r'\s*\|\s*\|', ' |\n|', text)

    # 3. Ensure a blank line before a table starts if it's appended to a paragraph
    #    E.g. "some text. | Metric |" -> "some text.\n\n| Metric |"
    text = re.sub(r'([a-zA-Z0-9\.\?!])\s+(\|\s*[a-zA-Z])', r'\1\n\n\2', text)

    # 4. Ensure separator rows (|---|---| or |:---|) are on their own lines  
    text = re.sub(r'([^\n])\s*(\|[-:\s]+\|)', r'\1\n\2', text)

    # 5. Ensure markdown headers start on new lines
    text = re.sub(r'([^\n])(\s*#{1,4}\s)', r'\1\n\n\2', text)

    # 6. Fix "**Bold Text**" sections that should be headers
    text = re.sub(r'([^\n])\s*\*\*([A-Z][A-Za-z\s&]+)\*\*\s*', r'\1\n\n## \2\n', text)

    # 7. Ensure bullet points start on new lines
    text = re.sub(r'([^\n])\s*(- [A-Z])', r'\1\n\2', text)

    # 8. Clean up excessive whitespace/newlines
    text = re.sub(r'\n{4,}', '\n\n\n', text)

    return text.strip()


class CrewService:
    """Service for executing stock analysis crew"""
    
    def __init__(self):
        """Initialize agents and tasks"""
        self.agents = StockAnalysisAgents()
        self.tasks = StockAnalysisTasks()
        
        # Initialize agents
        self.financial_analyst = self.agents.financial_analyst()
        self.research_analyst = self.agents.research_analyst()
        self.investment_advisor = self.agents.investment_advisor()
    
    async def analyze_stock(self, company: str) -> dict:
        """
        Run stock analysis crew
        """
        try:
            # Create tasks
            research_task = self.tasks.research(self.research_analyst)
            financial_task = self.tasks.financial_analysis(self.financial_analyst)
            filings_task = self.tasks.filings_analysis(self.financial_analyst)
            recommend_task = self.tasks.recommend(self.investment_advisor)
            
            # Create crew
            crew = Crew(
                agents=[
                    self.financial_analyst,
                    self.research_analyst,
                    self.investment_advisor
                ],
                tasks=[
                    research_task,
                    financial_task,
                    filings_task,
                    recommend_task
                ],
                process=Process.sequential,
                memory=False,
                cache=False,
                max_rpm=100,
                share_crew=True,
                full_output=True,
                max_iter=15
            )
            
            # Execute crew in a thread pool (kickoff is synchronous/blocking)
            loop = asyncio.get_event_loop()
            result = await loop.run_in_executor(
                None, lambda: crew.kickoff(inputs={"company": company})
            )
            
            # Build the full report from ALL task outputs
            # Each task produces a section: Research, Financial Analysis, Filings, Recommendation
            analysis_text = ""
            section_names = [
                "Market Research & News Analysis",
                "Financial Analysis & Metrics",
                "SEC Filings & Earnings Analysis",
                "Investment Recommendation"
            ]
            
            if hasattr(result, 'tasks_output') and result.tasks_output:
                sections = []
                for i, task_output in enumerate(result.tasks_output):
                    task_raw = ""
                    if hasattr(task_output, 'raw') and task_output.raw:
                        task_raw = task_output.raw
                    elif hasattr(task_output, 'output') and task_output.output:
                        task_raw = task_output.output
                    else:
                        task_raw = str(task_output)
                    
                    if task_raw and len(task_raw.strip()) > 50:
                        header = section_names[i] if i < len(section_names) else f"Section {i+1}"
                        sections.append(f"## {header}\n\n{task_raw.strip()}")
                
                if sections:
                    analysis_text = f"# Investment Report: {company}\n\n" + "\n\n---\n\n".join(sections)
                    logger.info(f"Built report from {len(sections)} task outputs, total length={len(analysis_text)}")
            
            # Fallback to .raw if tasks_output didn't work
            if not analysis_text or len(analysis_text) < 500:
                if hasattr(result, 'raw') and result.raw and len(result.raw) > 200:
                    analysis_text = result.raw
                    logger.info(f"Using .raw fallback, length={len(analysis_text)}")
                elif not analysis_text:
                    analysis_text = str(result)
            
            # Fix markdown formatting (tables, headers, line breaks)
            analysis_text = fix_markdown_formatting(analysis_text)
            logger.info(f"Final analysis length: {len(analysis_text)} chars")
            
            return {
                "status": "success",
                "company": company,
                "analysis": analysis_text,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Stock analysis failed: {str(e)}", exc_info=True)
            return {
                "status": "error",
                "company": company,
                "message": str(e),
                "timestamp": datetime.now().isoformat()
            }
