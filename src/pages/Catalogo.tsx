import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api/client';
import type { Categoria, Paginado, Produto } from '../api/types';
import CartaoProduto from '../components/CartaoProduto';
import Estado from '../components/Estado';
import Paginacao from '../components/Paginacao';
import { useDebounce } from '../hooks/useDebounce';
import { useFetch } from '../hooks/useFetch';

const POR_PAGINA = 8;

export default function Catalogo() {
  // Filtros ficam na URL: o link da busca pode ser compartilhado.
  const [params, setParams] = useSearchParams();
  const pagina = Number(params.get('pagina')) || 1;
  const busca = params.get('busca') ?? '';
  const categoria = params.get('categoria') ?? '';

  const [texto, setTexto] = useState(busca);
  const textoAtrasado = useDebounce(texto, 400);

  function atualizar(mudancas: Record<string, string>) {
    setParams((atual) => {
      const novo = new URLSearchParams(atual);
      for (const [chave, valor] of Object.entries(mudancas)) {
        if (valor) novo.set(chave, valor);
        else novo.delete(chave);
      }
      return novo;
    });
  }

  useEffect(() => {
    if (textoAtrasado !== busca) atualizar({ busca: textoAtrasado, pagina: '' });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [textoAtrasado]);

  const categorias = useFetch((s) => api<Categoria[]>('/categorias', { signal: s }), []);
  const produtos = useFetch(
    (s) => {
      const qs = new URLSearchParams({ pagina: String(pagina), limite: String(POR_PAGINA) });
      if (busca) qs.set('busca', busca);
      if (categoria) qs.set('categoriaId', categoria);
      return api<Paginado<Produto>>(`/produtos?${qs}`, { signal: s });
    },
    [pagina, busca, categoria],
  );

  return (
    <>
      <h1>Catálogo</h1>

      <div className="filtros">
        <input
          type="search"
          placeholder="Buscar produto…"
          aria-label="Buscar produto"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
        />
        <div className="chips" role="group" aria-label="Categorias">
          <button className={`chip${!categoria ? ' ativo' : ''}`} onClick={() => atualizar({ categoria: '', pagina: '' })}>
            Todas
          </button>
          {categorias.dados?.map((c) => (
            <button
              key={c.id}
              className={`chip${categoria === String(c.id) ? ' ativo' : ''}`}
              onClick={() => atualizar({ categoria: String(c.id), pagina: '' })}
            >
              {c.nome}
            </button>
          ))}
        </div>
      </div>

      <Estado carregando={produtos.carregando && !produtos.dados} erro={produtos.erro} onTentarNovamente={produtos.recarregar}>
        {produtos.dados && produtos.dados.itens.length === 0 ? (
          <p className="vazio">Nenhum produto encontrado.</p>
        ) : (
          <div className={`grade${produtos.carregando ? ' atualizando' : ''}`}>
            {produtos.dados?.itens.map((p) => <CartaoProduto key={p.id} produto={p} />)}
          </div>
        )}
        {produtos.dados && (
          <Paginacao
            pagina={produtos.dados.pagina}
            totalPaginas={produtos.dados.totalPaginas}
            onChange={(p) => atualizar({ pagina: p > 1 ? String(p) : '' })}
          />
        )}
      </Estado>
    </>
  );
}
