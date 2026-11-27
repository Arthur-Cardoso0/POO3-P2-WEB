export type Perfil = 'ADMIN' | 'OPERADOR';
export type DiaFeira = 'QUARTA' | 'SABADO';
export type StatusPedido = 'PENDENTE' | 'CONFIRMADO' | 'ENTREGUE' | 'CANCELADO';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  perfil: Perfil;
}

export interface Categoria {
  id: number;
  nome: string;
}

export interface Produto {
  id: number;
  nome: string;
  descricao: string;
  preco: number;
  estoque: number;
  imagemUrl: string | null;
  ativo: boolean;
  categoriaId: number;
  categoria: Categoria;
}

export interface Paginado<T> {
  itens: T[];
  total: number;
  pagina: number;
  limite: number;
  totalPaginas: number;
}

export interface ItemPedido {
  produtoId: number;
  produtoNome: string;
  quantidade: number;
  precoUnitario: number;
  subtotal: number;
}

export interface Pedido {
  id: number;
  clienteNome: string;
  clienteContato: string;
  observacao: string | null;
  status: StatusPedido;
  retirada: DiaFeira;
  total: number;
  criadoEm: string;
  itens: ItemPedido[];
}

export interface Mensagem {
  id: number;
  nome: string;
  email: string;
  texto: string;
  lida: boolean;
  criadoEm: string;
}

export interface VendaPorProduto {
  produtoId: number;
  produto: string;
  quantidadeVendida: number;
  faturamento: number;
  pedidos: number;
}

export interface PedidosPorStatus {
  status: StatusPedido;
  quantidade: number;
  valorTotal: number;
}

export interface ProdutoEstoqueBaixo {
  id: number;
  nome: string;
  estoque: number;
}

export interface ItemSeparacao {
  produtoId: number;
  produto: string;
  quantidade: number;
  pedidos: number;
}
