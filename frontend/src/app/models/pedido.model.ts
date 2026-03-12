import { EnderecoResponse } from './endereco.model';

export interface ItemPedidoRequest {
  produtoId: string;
  quantidade: number;
}

export interface ItemPedidoResponse {
  id: string;
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface PedidoRequest {
  usuarioId?: string;
  enderecoCobrancaId: string;
  enderecoEntregaId: string;
  itens: ItemPedidoRequest[];
}

export interface PedidoResponse {
  id: string;
  usuarioId: string;
  usuarioNome: string;
  enderecoCobranca: EnderecoResponse;
  enderecoEntrega: EnderecoResponse;
  status: string;
  total: number;
  dataPedido: string;
  itens: ItemPedidoResponse[];
}

export interface PedidoStatusRequest {
  status: 'AGUARDANDO_PAGAMENTO' | 'PAGAMENTO_SIMULADO' | 'PENDENTE' | 'CONFIRMADO' | 'ENVIADO' | 'ENTREGUE' | 'CANCELADO';
}
