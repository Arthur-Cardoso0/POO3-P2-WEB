import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api/client';
import type { Produto } from '../api/types';
import { ImagemProduto } from '../components/CartaoProduto';
import Estado from '../components/Estado';
import { useCarrinho } from '../context/CartContext';
import { useFetch } from '../hooks/useFetch';
import { formatarMoeda } from '../utils';

export default function ProdutoDetalhe() {
  const { id } = useParams();
  const { adicionar } = useCarrinho();
  const [quantidade, setQuantidade] = useState(1);
  const [adicionado, setAdicionado] = useState(false);
  const { dados: produto, carregando, erro, recarregar } = useFetch(
    (s) => api<Produto>(`/produtos/${id}`, { signal: s }),
    [id],
  );

  return (
    <>
      <p><Link to="/">← Voltar ao catálogo</Link></p>
      <Estado carregando={carregando} erro={erro} onTentarNovamente={recarregar}>
        {produto && (
          <div className="detalhe">
            <div className="detalhe-imagem"><ImagemProduto produto={produto} /></div>
            <div>
              <span className="etiqueta">{produto.categoria.nome}</span>
              <h1>{produto.nome}</h1>
              <p className="preco preco-grande">{formatarMoeda(produto.preco)}</p>
              <p>{produto.descricao || 'Sem descrição.'}</p>
              <p className="dica">
                {produto.estoque > 0 ? `${produto.estoque} em estoque` : 'Produto esgotado'}
              </p>
              {produto.estoque > 0 && (
                <div className="linha">
                  <label htmlFor="qtd" className="sr-only">Quantidade</label>
                  <input
                    id="qtd" type="number" min={1} max={produto.estoque} value={quantidade}
                    onChange={(e) =>
                      setQuantidade(Math.max(1, Math.min(produto.estoque, Number(e.target.value) || 1)))
                    }
                  />
                  <button
                    className="btn"
                    onClick={() => {
                      adicionar(produto, quantidade);
                      setAdicionado(true);
                    }}
                  >
                    Adicionar ao carrinho
                  </button>
                </div>
              )}
              {adicionado && (
                <p className="alerta alerta-ok" role="status">
                  Adicionado! <Link to="/carrinho">Ver carrinho</Link>
                </p>
              )}
            </div>
          </div>
        )}
      </Estado>
    </>
  );
}
