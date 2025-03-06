import httpx
from typing import List, Optional
from ..models import Article, Author, SearchFilters
from ..utils.cache import Cache

# Cache simples para resultados
search_cache = Cache(max_size=100)


async def pesquisar_artigos(query: str, filters: Optional[SearchFilters] = None, limit: int = 10) -> List[Article]:
    """
    Busca artigos acadêmicos usando a Semantic Scholar API
    """
    # Construir chave de cache
    cache_key = f"search:{query}:{limit}:{filters}"
    if cache_key in search_cache:
        return search_cache[cache_key]

    # Construir parâmetros de consulta
    params = {
        "query": query,
        "limit": limit,
        "fields": "title,abstract,authors,year,venue,url,citationCount,references"  # Mudado de citations.totalCount para citationCount
    }

    # Adicionar filtros, se especificados
    if filters:
        if filters.fromYear:
            params["year"] = f">={filters.fromYear}"
        if filters.toYear:
            params["year"] = f"<={filters.toYear}" if "year" not in params else params["year"] + f",<={filters.toYear}"

    # Fazer requisição à API
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.semanticscholar.org/graph/v1/paper/search",
            params=params,
            headers={
                "Accept": "application/json"
            }
        )

        if response.status_code != 200:
            raise Exception(f"API request failed: {response.text}")

        data = response.json()
        articles = []

        for paper in data.get("data", []):
            # CORREÇÃO: Atualizado para usar citationCount diretamente
            citation_count = paper.get("citationCount", 0)

            # Processar autores
            authors = []
            for author in paper.get("authors", []):
                authors.append(Author(
                    name=author.get("name", ""),
                    authorId=author.get("authorId")
                ))

            # Processar referências
            references = []
            for ref in paper.get("references", []):
                if ref.get("paperId"):
                    references.append(ref["paperId"])

            # Criar objeto Article
            article = Article(
                id=paper.get("paperId", ""),
                title=paper.get("title", "Unknown Title"),
                abstract=paper.get("abstract"),
                authors=authors,
                year=paper.get("year"),
                url=paper.get("url"),
                citations=citation_count,
                references=references,
                venue=paper.get("venue"),
                doi=paper.get("doi")
            )

            articles.append(article)

        # Aplicar ordenação, se especificada
        if filters and filters.sortBy:
            if filters.sortBy == "year":
                articles.sort(key=lambda x: x.year if x.year else 0, reverse=True)
            elif filters.sortBy == "citations":
                articles.sort(key=lambda x: x.citations, reverse=True)

        # Aplicar filtro de citações mínimas
        if filters and filters.minCitations:
            articles = [a for a in articles if a.citations >= filters.minCitations]

        # Armazenar em cache e retornar
        search_cache[cache_key] = articles
        return articles
    """
    Busca artigos acadêmicos usando a Semantic Scholar API
    """
    # Construir chave de cache
    cache_key = f"search:{query}:{limit}:{filters}"
    if cache_key in search_cache:
        return search_cache[cache_key]

    # Construir parâmetros de consulta
    params = {
        "query": query,
        "limit": limit,
        "fields": "title,abstract,authors,year,venue,url,citations.totalCount,references"
    }

    # Adicionar filtros, se especificados
    if filters:
        if filters.fromYear:
            params["year"] = f">={filters.fromYear}"
        if filters.toYear:
            params["year"] = f"<={filters.toYear}" if "year" not in params else params["year"] + f",<={filters.toYear}"

    # Fazer requisição à API
    async with httpx.AsyncClient() as client:
        response = await client.get(
            "https://api.semanticscholar.org/graph/v1/paper/search",
            params=params,
            headers={
                "Accept": "application/json"
            }
        )

        if response.status_code != 200:
            raise Exception(f"API request failed: {response.text}")

        data = response.json()
        articles = []

        for paper in data.get("data", []):
            # Extrair informações de citações
            citation_count = 0
            if "citations" in paper and "totalCount" in paper["citations"]:
                citation_count = paper["citations"]["totalCount"]

            # Processar autores
            authors = []
            for author in paper.get("authors", []):
                authors.append(Author(
                    name=author.get("name", ""),
                    authorId=author.get("authorId")
                ))

            # Processar referências
            references = []
            for ref in paper.get("references", []):
                if ref.get("paperId"):
                    references.append(ref["paperId"])

            # Criar objeto Article
            article = Article(
                id=paper.get("paperId", ""),
                title=paper.get("title", "Unknown Title"),
                abstract=paper.get("abstract"),
                authors=authors,
                year=paper.get("year"),
                url=paper.get("url"),
                citations=citation_count,
                references=references,
                venue=paper.get("venue"),
                doi=paper.get("doi")
            )

            articles.append(article)

        # Aplicar ordenação, se especificada
        if filters and filters.sortBy:
            if filters.sortBy == "year":
                articles.sort(key=lambda x: x.year if x.year else 0, reverse=True)
            elif filters.sortBy == "citations":
                articles.sort(key=lambda x: x.citations, reverse=True)

        # Aplicar filtro de citações mínimas
        if filters and filters.minCitations:
            articles = [a for a in articles if a.citations >= filters.minCitations]

        # Armazenar em cache e retornar
        search_cache[cache_key] = articles
        return articles