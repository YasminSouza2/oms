export interface ProdutoResponse {
  id: string;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  sku: string;
  dataCadastro: string;
}

export interface ProdutoRequest {
  nome: string;
  descricao?: string;
  preco: number;
  estoque: number;
  sku?: string;
}
