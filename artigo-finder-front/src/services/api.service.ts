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

// Busca artigos acadêmicos baseados em uma query - adaptado para o backend Java
export async function searchArticles(query: string, limit: number = 10): Promise<Artigo[]> {
  try {
    console.log('Searching articles with query:', query);
    const encodedQuery = encodeURIComponent(query);
    
    const url = `${API_BASE_URL}/search/${encodedQuery}?limit=${limit}`;
    console.log('Request URL:', url);
    
    // Usar a função fetchWithRetry em vez de fetch diretamente
    const data = await fetchWithRetry<{artigos: Artigo[], total: number}>(url);
    
    console.log(`Found ${data.artigos?.length || 0} articles out of ${data.total}`);
    return data.artigos || [];
  } catch (error) {
    console.error('Error searching articles after retries:', error);
    throw error;
  }
}

// Função para usar filtros adicionais na busca - adaptada para o backend Java
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
    if (sortBy) params.append('sort_by', sortBy === 'ano' ? 'year' : 'citations');
    
    const url = `${API_BASE_URL}/search/${encodedQuery}?${params.toString()}`;
    console.log('Request URL with filters:', url);
    
    // Usar a função fetchWithRetry em vez de fetch diretamente
    const data = await fetchWithRetry<{artigos: Artigo[], total: number}>(url);
    
    return data.artigos || [];
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
      resumo: "This paper provides a comprehensive survey of deep learning methods and applications in various domains.",
      autores: [
        { nome: "John Smith", autorId: "a1" },
        { nome: "Maria Garcia", autorId: "a2" }
      ],
      ano: 2023,
      venue: "Journal of Machine Learning Research",
      citacoes: 345,
      url: "https://example.com/paper1"
    },
    {
      id: "2",
      titulo: "Transformer Models in Natural Language Processing",
      resumo: "This study examines the impact of transformer models in advancing natural language processing tasks.",
      autores: [
        { nome: "Alan Turing", autorId: "a3" }
      ],
      ano: 2022,
      venue: "Computational Linguistics",
      citacoes: 128,
      url: "https://example.com/paper2"
    },
    {
      id: "3",
      titulo: "Graph Neural Networks for Molecular Property Prediction",
      resumo: "A novel approach using graph neural networks for predicting molecular properties in drug discovery.",
      autores: [
        { nome: "Lisa Chen", autorId: "a4" },
        { nome: "Robert Johnson", autorId: "a5" },
        { nome: "Sarah Williams", autorId: "a6" }
      ],
      ano: 2021,
      venue: "Nature Machine Intelligence",
      citacoes: 287,
      url: "https://example.com/paper3"
    }
  ];
}