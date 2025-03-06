from fastapi import APIRouter, Query, HTTPException
from typing import Optional
from .models import Article, SearchFilters
from .services import article_service

router = APIRouter(prefix="/api")

# Endpoint para busca dos artigos
@router.get("/search/{query}", response_model=dict)
async def pesquisar_artigos(
    query: str,
    limit: int = Query(10, ge=1, le=50),
    from_year: Optional[int] = None,
    to_year: Optional[int] = None,
    min_citations: Optional[int] = None,
    sort_by: Optional[str] = None
):
    """
    Endpoint para busca de artigos acadêmicos
    """
    try:
        filters = None
        if any([from_year, to_year, min_citations, sort_by]):
            filters = SearchFilters(
                fromYear=from_year,
                toYear=to_year,
                minCitations=min_citations,
                sortBy=sort_by
            )
            
        articles = await article_service.pesquisar_artigos(query, filters, limit)
        
        # Retornar artigos e total
        return {
            "articles": articles,
            "total": len(articles)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))