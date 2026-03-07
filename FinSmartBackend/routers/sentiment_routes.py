from fastapi import APIRouter, HTTPException, Query
from typing import Optional
import logging
from market_sentiment.news_engine import MarketNewsEngine

router = APIRouter()
logger = logging.getLogger(__name__)

@router.get("/market")
async def get_market_sentiment(
    limit: int = Query(20, description="Number of articles to fetch"),
    symbols: Optional[str] = Query(None, description="Comma-separated stock symbols"),
    search: Optional[str] = Query(None, description="Search term"),
    include_all: bool = Query(False, description="Include all articles in response")
):
    try:
        engine = MarketNewsEngine()
        kwargs = {}
        if symbols:
            kwargs['symbols'] = symbols
        if search:
            kwargs['search'] = search
            
        result = engine.run(
            limit=limit,
            include_all_articles=include_all,
            **kwargs
        )
        
        if 'error' in result:
             raise HTTPException(status_code=500, detail=result.get('message', 'Unknown API Error'))
             
        return result
    except Exception as e:
        logger.error(f"Sentiment analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")
