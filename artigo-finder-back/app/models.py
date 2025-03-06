from typing import List, Optional
from pydantic import BaseModel, Field


class Autor(BaseModel):
    name: str
    autorId: Optional[str] = None


class Artigos(BaseModel):
    id: str
    titulo: str
    abstract: Optional[str] = None
    autores: List[Autor] = []
    ano: Optional[int] = None
    url: Optional[str] = None
    citacoes: int = 0
    referencias: List[str] = []
    venue: Optional[str] = None
    doi: Optional[str] = None
    isFavorite: bool = False


class SearchFilters(BaseModel):
    fromYear: Optional[int] = None
    toYear: Optional[int] = None
    minCitations: Optional[int] = None
    sortBy: Optional[str] = None