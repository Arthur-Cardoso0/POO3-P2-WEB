import { useState } from 'react';
import { z } from 'zod';
import { api, mensagemDeErro } from '../../api/client';
import type { Categoria, Paginado, Produto } from '../../api/types';
import Campo from '../../components/Campo';
import Estado from '../../components/Estado';
import Paginacao from '../../components/Paginacao';
import { useAuth } from '../../context/AuthContext';
import { useDebounce } from '../../hooks/useDebounce';
import { useFetch } from '../../hooks/useFetch';
import { useFormulario } from '../../hooks/useFormulario';
import { formatarMoeda, paraNumero } from '../../utils';

const produtoSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome').max(120),
  descricao: z.string().trim().max(1000, 'Máximo de 1000 caracteres'),
  preco: z.string().transform(paraNumero).pipe(z.number({ error: 'Preço inválido' }).positive('O preço deve ser maior que zero')),
  estoque: z.string().transform(paraNumero).pipe(z.number({ error: 'Estoque inválido' }).int('Use um número inteiro').min(0, 'Não pode ser negativo')),
  imagemUrl: z.string().trim().max(500),
  categoriaId: z.string().min(1, 'Escolha a categoria').transform(Number),
});

const vazio = { nome: '', descricao: '', preco: '', estoque: '0', imagemUrl: '', categoriaId: '' };

function FormProduto({
  produto, categorias, aoSalvar, aoCancelar,
}: {
  produto: Produto | null;
  categorias: Categoria[];
  aoSalvar: () => void;
  aoCancelar: () => void;
}) {
  const form = useFormulario(
    produto
      ? {
          nome: produto.nome, descricao: produto.descricao, preco: String(produto.preco),
          estoque: String(produto.estoque), imagemUrl: produto.imagemUrl ?? '',
          categoriaId: String(produto.categoriaId),
        }
      : vazio,
    produtoSchema,
    async (d) => {
      const corpo = { ...d, imagemUrl: d.imagemUrl || null };
      if (produto) await api(`/produtos/${produto.id}`, { method: 'PATCH', auth: true, body: corpo });
      else await api('/produtos', { method: 'POST', auth: true, body: corpo });
      aoSalvar();
    },
  );

  return (
    <form className="formulario painel" onSubmit={form.enviar} noValidate>
      <h2>{produto ? `Editar: ${produto.nome}` : 'Novo produto'}</h2>
      <Campo id="p-nome" rotulo="Nome" erro={form.erros.nome}>
        {(p) => <input {...p} value={form.valores.nome} onChange={(e) => form.definir('nome', e.target.value)} />}
      </Campo>
      <Campo id="p-desc" rotulo="Descrição" erro={form.erros.descricao}>
        {(p) => <textarea {...p} rows={3} value={form.valores.descricao} onChange={(e) => form.definir('descricao', e.target.value)} />}
      </Campo>
      <div className="duas-colunas">
        <Campo id="p-preco" rotulo="Preço (R$)" erro={form.erros.preco}>
          {(p) => <input {...p} inputMode="decimal" value={form.valores.preco} onChange={(e) => form.definir('preco', e.target.value)} />}
        </Campo>
        <Campo id="p-estoque" rotulo="Estoque" erro={form.erros.estoque}>
          {(p) => <input {...p} inputMode="numeric" value={form.valores.estoque} onChange={(e) => form.definir('estoque', e.target.value)} />}
        </Campo>
      </div>
      <Campo id="p-cat" rotulo="Categoria" erro={form.erros.categoriaId}>
        {(p) => (
          <select {...p} value={form.valores.categoriaId} onChange={(e) => form.definir('categoriaId', e.target.value)}>
            <option value="">Selecione…</option>
            {categorias.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
          </select>
        )}
      </Campo>
      <Campo id="p-img" rotulo="Endereço da imagem (opcional)" dica="Cole o link de uma foto já publicada na internet." erro={form.erros.imagemUrl}>
        {(p) => <input {...p} value={form.valores.imagemUrl} onChange={(e) => form.definir('imagemUrl', e.target.value)} />}
      </Campo>
      {form.erroGeral && <p className="alerta alerta-erro" role="alert">{form.erroGeral}</p>}
      <div className="linha">
        <button className="btn" type="submit" disabled={form.enviando}>{form.enviando ? 'Salvando…' : 'Salvar'}</button>
        <button className="btn btn-secundario" type="button" onClick={aoCancelar}>Cancelar</button>
      </div>
    </form>
  );
}

export default function AdminProdutos() {
  const { usuario } = useAuth();
  const ehAdmin = usuario?.perfil === 'ADMIN';
  const [pagina, setPagina] = useState(1);
  const [texto, setTexto] = useState('');
  const busca = useDebounce(texto, 400);
  const [editando, setEditando] = useState<Produto | 'novo' | null>(null);
  const [novaCategoria, setNovaCategoria] = useState('');
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const categorias = useFetch((s) => api<Categoria[]>('/categorias', { signal: s }), []);
  const { dados, carregando, erro, recarregar } = useFetch(
    (s) => {
      const qs = new URLSearchParams({ pagina: String(pagina), limite: '10' });
      if (busca) qs.set('busca', busca);
      return api<Paginado<Produto>>(`/admin/produtos?${qs}`, { auth: true, signal: s });
    },
    [pagina, busca],
  );

  async function alterarAtivo(p: Produto) {
    setErroAcao(null);
    try {
      if (p.ativo) await api(`/produtos/${p.id}`, { method: 'DELETE', auth: true });
      else await api(`/produtos/${p.id}`, { method: 'PATCH', auth: true, body: { ativo: true } });
      recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    }
  }

  async function criarCategoria() {
    const nome = novaCategoria.trim();
    if (nome.length < 2) return;
    setErroAcao(null);
    try {
      await api('/categorias', { method: 'POST', auth: true, body: { nome } });
      setNovaCategoria('');
      categorias.recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    }
  }

  if (editando) {
    return (
      <FormProduto
        produto={editando === 'novo' ? null : editando}
        categorias={categorias.dados ?? []}
        aoSalvar={() => { setEditando(null); recarregar(); }}
        aoCancelar={() => setEditando(null)}
      />
    );
  }

  return (
    <>
      <div className="linha linha-espaco">
        <input type="search" placeholder="Buscar produto…" aria-label="Buscar produto" value={texto}
          onChange={(e) => { setTexto(e.target.value); setPagina(1); }} />
        <button className="btn" onClick={() => setEditando('novo')}>+ Novo produto</button>
      </div>
      <div className="linha">
        <input placeholder="Nova categoria" aria-label="Nova categoria" value={novaCategoria}
          onChange={(e) => setNovaCategoria(e.target.value)} />
        <button className="btn btn-secundario" onClick={criarCategoria}>Adicionar categoria</button>
      </div>
      {erroAcao && <p className="alerta alerta-erro" role="alert">{erroAcao}</p>}
      <Estado carregando={carregando && !dados} erro={erro} onTentarNovamente={recarregar}>
        {dados && dados.itens.length === 0 && <p className="vazio">Nenhum produto.</p>}
        <div className="tabela-rolavel">
          <table>
            <thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Situação</th><th></th></tr></thead>
            <tbody>
              {dados?.itens.map((p) => (
                <tr key={p.id} className={p.ativo ? '' : 'inativo'}>
                  <td>{p.nome}</td><td>{p.categoria.nome}</td>
                  <td>{formatarMoeda(p.preco)}</td>
                  <td className={p.estoque <= 5 ? 'estoque-baixo' : ''}>{p.estoque}</td>
                  <td>{p.ativo ? 'Ativo' : 'Desativado'}</td>
                  <td className="acoes">
                    <button className="btn btn-link" onClick={() => setEditando(p)}>Editar</button>
                    {ehAdmin && (
                      <button className="btn btn-link" onClick={() => alterarAtivo(p)}>
                        {p.ativo ? 'Desativar' : 'Reativar'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {dados && <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} onChange={setPagina} />}
      </Estado>
    </>
  );
}
