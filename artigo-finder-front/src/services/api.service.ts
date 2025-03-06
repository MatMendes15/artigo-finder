import type { Artigo } from '../models/artigo.model';

// URL direta para o backend | trocar depois para proxy
const API_BASE_URL = 'http://localhost:25000/api';

// Função utilitária para fazer requisições HTTP com retry automático

async function fetchWithRetry<T>(
  url: string, 
  options: RequestInit = {}, 
  maxRetries: number = 2,
  delay: number = 1000
): Promise<T> {
  let lastError: Error = new Error("Unknown error");
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      // Adicionar log para cada tentativa
      if (attempt > 0) {
        console.log(`Retry attempt ${attempt} for URL: ${url}`);
      }
      
      const response = await fetch(url, options);
      
      // Se não for sucesso, lançar erro
      if (!response.ok) {
        // Para erros 500, tentar novamente
        if (response.status >= 500) {
          throw new Error(`Server error: ${response.status} ${response.statusText}`);
        } else {
          // Para outros erros (400, 404, etc), abortar
          throw new Error(`API returned status: ${response.status} ${response.statusText}`);
        }
      }
      
      // Sucesso - retornar os dados
      return await response.json() as T;
    } catch (error) {
      lastError = error as Error;
      
      // Se for o último retry, ou se não for um erro 500, desistir
      if (
        attempt >= maxRetries || 
        !lastError.message.includes("Server error") || 
        !lastError.message.includes("500")
      ) {
        break;
      }
      
      // Esperar antes de tentar novamente
      console.log(`Waiting ${delay}ms before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      
      // Aumentar o delay para cada tentativa (exponential backoff)
      delay *= 1.5;
    }
  }
  
  throw lastError;
}

//Busca artigos acadêmicos baseados em uma query
export async function searchArticles(query: string, limit: number = 10): Promise<Artigo[]> {
  try {
    console.log('Searching articles with query:', query);
    const encodedQuery = encodeURIComponent(query);
    
    const url = `${API_BASE_URL}/search/${encodedQuery}?limit=${limit}`;
    console.log('Request URL:', url);
    
    // Usar a função fetchWithRetry em vez de fetch diretamente
    const data = await fetchWithRetry<{articles: Artigo[], total: number}>(url);
    
    console.log(`Found ${data.articles?.length || 0} articles out of ${data.total}`);
    return data.articles || [];
  } catch (error) {
    console.error('Error searching articles after retries:', error);
    throw error;
  }
}

// Função para usar filtros adicionais na busca
export async function procuraArtigosComFiltros(
  query: string, 
  options: {
    limit?: number;
    fromYear?: number;
    toYear?: number;
    minCitations?: number;
    sortBy?: 'ano' | 'citacoes';
  } = {}
): Promise<Artigo[]> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const { limit = 10, fromYear, toYear, minCitations, sortBy } = options;
    
    // Construa a query string com os filtros
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    
    if (fromYear) params.append('from_year', fromYear.toString());
    if (toYear) params.append('to_year', toYear.toString());
    if (minCitations) params.append('min_citations', minCitations.toString());
    if (sortBy) params.append('sort_by', sortBy);
    
    const url = `${API_BASE_URL}/search/${encodedQuery}?${params.toString()}`;
    console.log('Request URL with filters:', url);
    
    // Usar a função fetchWithRetry em vez de fetch diretamente
    const data = await fetchWithRetry<{articles: Artigo[], total: number}>(url);
    
    return data.articles || [];
  } catch (error) {
    console.error('Erro ao procurar artigos com filtros:', error);
    throw error;
  }
}

// Mock de resultados para testes sem backend
export function mockDadosPesquisa(): Artigo[] {
  return [
    {
      id: "1",
      titulo: "Deep Learning: A Comprehensive Survey",
      abstract: "This paper provides a comprehensive survey of deep learning methods and applications in various domains.",
      autores: [
        { id: "a1", name: "John Smith" },
        { id: "a2", name: "Maria Garcia" }
      ],
      ano: 2023,
      venue: "Journal of Machine Learning Research",
      citacoes: 345,
      url: "https://example.com/paper1"
    },
    {
      id: "2",
      titulo: "Transformer Models in Natural Language Processing",
      abstract: "This study examines the impact of transformer models in advancing natural language processing tasks.",
      autores: [
        { id: "a3", name: "Alan Turing" }
      ],
      ano: 2022,
      venue: "Computational Linguistics",
      citacoes: 128,
      url: "https://example.com/paper2"
    },
    {
      id: "3",
      titulo: "Graph Neural Networks for Molecular Property Prediction",
      abstract: "A novel approach using graph neural networks for predicting molecular properties in drug discovery.",
      autores: [
        { id: "a4", name: "Lisa Chen" },
        { id: "a5", name: "Robert Johnson" },
        { id: "a6", name: "Sarah Williams" }
      ],
      ano: 2021,
      venue: "Nature Machine Intelligence",
      citacoes: 287,
      url: "https://example.com/paper3"
    }
  ];
}