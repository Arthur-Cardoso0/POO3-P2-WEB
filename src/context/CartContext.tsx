import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import type { Produto } from '../api/types';

export interface ItemCarrinho {
  produto: Pick<Produto, 'id' | 'nome' | 'preco' | 'estoque' | 'imagemUrl'>;
  quantidade: number;
}

interface CartContexto {
  itens: ItemCarrinho[];
  quantidadeTotal: number;
  total: number;
  adicionar(produto: Produto, quantidade?: number): void;
  alterarQuantidade(produtoId: number, quantidade: number): void;
  remover(produtoId: number): void;
  limpar(): void;
}

const CHAVE = 'carrinho';
const Contexto = createContext<CartContexto | null>(null);

function carregar(): ItemCarrinho[] {
  try {
    const texto = localStorage.getItem(CHAVE);
    return texto ? (JSON.parse(texto) as ItemCarrinho[]) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [itens, setItens] = useState<ItemCarrinho[]>(carregar);

  useEffect(() => {
    try {
      localStorage.setItem(CHAVE, JSON.stringify(itens));
    } catch {
      /* sem storage: o carrinho vale só nesta sessão */
    }
  }, [itens]);

  const adicionar = useCallback((produto: Produto, quantidade = 1) => {
    setItens((atual) => {
      const resumo = {
        id: produto.id, nome: produto.nome, preco: produto.preco,
        estoque: produto.estoque, imagemUrl: produto.imagemUrl,
      };
      const existente = atual.find((i) => i.produto.id === produto.id);
      if (!existente) {
        return [...atual, { produto: resumo, quantidade: Math.min(quantidade, produto.estoque) }];
      }
      return atual.map((i) =>
        i.produto.id === produto.id
          ? { produto: resumo, quantidade: Math.min(i.quantidade + quantidade, produto.estoque) }
          : i,
      );
    });
  }, []);

  const alterarQuantidade = useCallback((produtoId: number, quantidade: number) => {
    setItens((atual) =>
      atual.map((i) =>
        i.produto.id === produtoId
          ? { ...i, quantidade: Math.max(1, Math.min(quantidade, i.produto.estoque)) }
          : i,
      ),
    );
  }, []);

  const remover = useCallback((produtoId: number) => {
    setItens((atual) => atual.filter((i) => i.produto.id !== produtoId));
  }, []);

  const limpar = useCallback(() => setItens([]), []);

  const valor = useMemo<CartContexto>(
    () => ({
      itens,
      quantidadeTotal: itens.reduce((s, i) => s + i.quantidade, 0),
      total: itens.reduce((s, i) => s + i.quantidade * i.produto.preco, 0),
      adicionar, alterarQuantidade, remover, limpar,
    }),
    [itens, adicionar, alterarQuantidade, remover, limpar],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useCarrinho(): CartContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useCarrinho deve ser usado dentro de <CartProvider>');
  return ctx;
}
