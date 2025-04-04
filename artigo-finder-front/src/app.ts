import { searchArticles } from './services/api.service';
import type { Artigo } from './models/artigo.model';

// Estado da aplicação
let articles: Artigo[] = [];
let selectedArticle: Artigo | null = null;

// Inicialização da aplicação
export function initApp() {
  console.log('Initializing application...');
  setupEventos();
}

// Configura os eventos de interface do usuário
function setupEventos() {
  // Formulário de busca
  const searchForm = document.getElementById('search-form') as HTMLFormElement;
  searchForm?.addEventListener('submit', (e: Event) => {
    e.preventDefault();
    const searchInput = document.getElementById('search-input') as HTMLInputElement;
    const query = searchInput?.value?.trim();
    if (query) {
      performSearch(query);
    }
  });
}

// Realiza a busca de artigos
async function performSearch(query: string) {
  try {
    mostrarCarregamento(true);
    esconderErro();

    // Opção 1: Busca simples
    articles = await searchArticles(query);
    
    // Opção 2: Busca com filtros (descomente para usar)
    // articles = await procuraArtigosComFiltros(query, {
    //   limit: 20,
    //   fromYear: 2015,
    //   sortBy: 'citacoes'
    // });

    // Renderiza os resultados
    renderizaArtigos();
  } catch (error) {
    console.error('Error searching articles:', error);
    mostrarErro('Falha ao buscar artigos');
  } finally {
    mostrarCarregamento(false);
  }
}

// Renderiza a lista de artigos
function renderizaArtigos() {
  const articlesContainer = document.getElementById('articles-container');
  if (!articlesContainer) return;

  articlesContainer.innerHTML = '';

  if (articles.length === 0) {
    articlesContainer.innerHTML = '<p class="no-results">Nenhum artigo encontrado</p>';
    return;
  }

  articles.forEach(article => {
    const card = document.createElement('div');
    card.classList.add('article-card');
    card.dataset.id = article.id;

    // Adaptado para usar o campo nome em vez de name
    const authorsText = article.autores?.length
      ? article.autores.map(a => a.nome).join(', ')
      : 'Autores desconhecidos';

    card.innerHTML = `
      <h3 class="article-titulo">${article.titulo}</h3>
      <p class="article-autores">${authorsText}</p>
      <div class="article-metadata">
        <span>${article.ano || 'N/A'}</span>
        <span>${article.citacoes} citações</span>
      </div>
    `;

    card.addEventListener('click', () => mostrarDetalhesArtigo(article));

    articlesContainer.appendChild(card);
  });
}

// Exibe detalhes de um artigo
function mostrarDetalhesArtigo(article: Artigo) {
  selectedArticle = article;
  console.log('Selected article:', selectedArticle);
  const detailsPanel = document.getElementById('article-details');
  if (!detailsPanel) return;

  // Constrói HTML para detalhes do artigo - adaptado para usar os campos corretos
  detailsPanel.innerHTML = `
    <div class="article-header">
      <h2>${article.titulo}</h2>
      <button class="close-button">
        <i class="material-icons">close</i>
      </button>
    </div>
    
    ${article.autores?.length ? `<p class="autores">${article.autores.map(a => a.nome).join(', ')}</p>` : ''}
    ${article.ano ? `<p class="ano">${article.ano}</p>` : ''}
    
    <div class="metadata">
      <div class="metadata-item">
        <i class="material-icons">format_quote</i>
        <span>${article.citacoes} citações</span>
      </div>
      ${article.venue ? `
        <div class="metadata-item">
          <i class="material-icons">school</i>
          <span>${article.venue}</span>
        </div>
      ` : ''}
    </div>
    
    <h3>Resumo</h3>
    ${article.resumo ? `<p>${article.resumo}</p>` : '<p class="no-abstract">Resumo não disponível</p>'}
    
    ${article.url ? `
      <div class="actions">
        <a href="${article.url}" target="_blank" class="view-button">
          <i class="material-icons">open_in_new</i> Ver Artigo
        </a>
      </div>
    ` : ''}
  `;

  // Adiciona evento para fechar detalhes
  const closeButton = detailsPanel.querySelector('.close-button');
  if (closeButton) {
    closeButton.addEventListener('click', esconderDetalhesArtigo);
  }

  // Mostra painel de detalhes
  detailsPanel.classList.add('visible');
}

// Esconde detalhes do artigo
function esconderDetalhesArtigo() {
  selectedArticle = null;
  const detailsPanel = document.getElementById('article-details');
  if (detailsPanel) {
    detailsPanel.classList.remove('visible');
  }
}

// Mostra/esconde o spinner de carregamento
function mostrarCarregamento(show: boolean) {
  const loadingSpinner = document.getElementById('loading-spinner');
  if (loadingSpinner) {
    loadingSpinner.classList.toggle('hidden', !show);
  }
}

// Mostra mensagem de erro
function mostrarErro(message: string = 'Ocorreu um erro') {
  const errorElement = document.getElementById('search-error');
  if (errorElement) {
    const messageElement = errorElement.querySelector('p');
    if (messageElement) {
      messageElement.textContent = message;
    }
    errorElement.classList.remove('hidden');
  }
}

// Esconde mensagem de erro
function esconderErro() {
  const errorElement = document.getElementById('search-error');
  if (errorElement) {
    errorElement.classList.add('hidden');
  }
}