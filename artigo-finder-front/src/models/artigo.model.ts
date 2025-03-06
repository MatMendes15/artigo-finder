export interface Autor {
  id: string;
  name: string;
}

export interface Artigo {
  id: string;
  titulo: string;
  abstract?: string;
  autores?: Autor[];
  ano?: number;
  venue?: string;
  citacoes: number;
  url?: string;
  referencias?: string[];
}