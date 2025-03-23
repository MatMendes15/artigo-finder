export interface Autor {
  nome: string;      
  autorId?: string;
}

export interface Artigo {
  id: string;
  titulo: string;    
  resumo?: string;   
  autores?: Autor[]; 
  ano?: number;   
  venue?: string;   
  citacoes: number;  
  url?: string;      
  referencias?: string[]; 
  favorito?: boolean; 
  doi?: string;   
}

export interface FiltrosPesquisa {
  anoInicial?: number;
  anoFinal?: number; 
  citacoesMinimas?: number;
  ordenarPor?: string;
}