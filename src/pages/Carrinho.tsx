import { Link, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { api } from '../api/client';
import type { Pedido } from '../api/types';
import Campo from '../components/Campo';
import Consentimento from '../components/Consentimento';
import { ImagemProduto } from '../components/CartaoProduto';
import { useCarrinho } from '../context/CartContext';
import { useFormulario } from '../hooks/useFormulario';
import { formatarMoeda } from '../utils';
import { INFO_FEIRA } from '../config';

const pedidoSchema = z.object({
  clienteNome: z.string().trim().min(2, 'Informe seu nome').max(100),
  clienteContato: z.string().trim().min(5, 'Informe telefone ou e-mail').max(100),
  retirada: z.enum(['QUARTA', 'SABADO'], { error: 'Escolha o dia de retirada' }),
  observacao: z.string().trim().max(300, 'Máximo de 300 caracteres'),
  consentimento: z.boolean().refine((v) => v, 'É necessário aceitar o aviso de privacidade'),
});

export default function Carrinho() {
  const { itens, total, alterarQuantidade, remover, limpar } = useCarrinho();
  const navegar = useNavigate();

  const form = useFormulario(
    { clienteNome: '', clienteContato: '', retirada: '', observacao: '', consentimento: false },
    pedidoSchema,
    async (dados) => {
      const pedido = await api<Pedido>('/pedidos', {
        method: 'POST',
        body: {
          clienteNome: dados.clienteNome,
          clienteContato: dados.clienteContato,
          retirada: dados.retirada,
          observacao: dados.observacao || undefined,
          consentimento: dados.consentimento,
          itens: itens.map((i) => ({ produtoId: i.produto.id, quantidade: i.quantidade })),
        },
      });
      limpar();
      navegar('/pedido-enviado', {
        state: { id: pedido.id, total: pedido.total, retirada: pedido.retirada },
      });
    },
  );

  if (itens.length === 0) {
    return (
      <>
        <h1>Carrinho</h1>
        <p className="vazio">Seu carrinho está vazio. <Link to="/">Ver o catálogo</Link></p>
      </>
    );
  }

  return (
    <>
      <h1>Carrinho</h1>
      <ul className="lista-carrinho">
        {itens.map(({ produto, quantidade }) => (
          <li key={produto.id} className="item-carrinho">
            <div className="miniatura"><ImagemProduto produto={produto} /></div>
            <div className="item-info">
              <strong>{produto.nome}</strong>
              <span>{formatarMoeda(produto.preco)} cada</span>
            </div>
            <div className="item-acoes">
              <label className="sr-only" htmlFor={`q-${produto.id}`}>Quantidade de {produto.nome}</label>
              <input
                id={`q-${produto.id}`} type="number" min={1} max={produto.estoque} value={quantidade}
                onChange={(e) => alterarQuantidade(produto.id, Number(e.target.value) || 1)}
              />
              <strong>{formatarMoeda(produto.preco * quantidade)}</strong>
              <button className="btn btn-link" onClick={() => remover(produto.id)}>Remover</button>
            </div>
          </li>
        ))}
      </ul>
      <p className="total">Total: <strong>{formatarMoeda(total)}</strong></p>

      <h2>Finalizar pedido</h2>
      <p className="dica">{INFO_FEIRA} O pagamento é feito na retirada.</p>
      <form className="formulario" onSubmit={form.enviar} noValidate>
        <Campo id="nome" rotulo="Seu nome" erro={form.erros.clienteNome}>
          {(p) => <input {...p} value={form.valores.clienteNome} onChange={(e) => form.definir('clienteNome', e.target.value)} />}
        </Campo>
        <Campo id="contato" rotulo="Telefone ou e-mail" erro={form.erros.clienteContato}>
          {(p) => <input {...p} value={form.valores.clienteContato} onChange={(e) => form.definir('clienteContato', e.target.value)} />}
        </Campo>
        <Campo id="retirada" rotulo="Dia de retirada na feira" erro={form.erros.retirada}>
          {(p) => (
            <select {...p} value={form.valores.retirada} onChange={(e) => form.definir('retirada', e.target.value)}>
              <option value="">Selecione…</option>
              <option value="QUARTA">Quarta-feira</option>
              <option value="SABADO">Sábado</option>
            </select>
          )}
        </Campo>
        <Campo id="obs" rotulo="Observação (opcional)" erro={form.erros.observacao}>
          {(p) => <textarea {...p} rows={3} value={form.valores.observacao} onChange={(e) => form.definir('observacao', e.target.value)} />}
        </Campo>
        <Consentimento
          marcado={form.valores.consentimento}
          erro={form.erros.consentimento}
          onChange={(v) => form.definir('consentimento', v)}
        />
        {form.erroGeral && <p className="alerta alerta-erro" role="alert">{form.erroGeral}</p>}
        <button className="btn" type="submit" disabled={form.enviando}>
          {form.enviando ? 'Enviando…' : 'Enviar pedido'}
        </button>
      </form>
    </>
  );
}
