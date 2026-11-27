import { useState } from 'react';
import { api, mensagemDeErro } from '../../api/client';
import type { DiaFeira, Paginado, Pedido, StatusPedido } from '../../api/types';
import Estado from '../../components/Estado';
import Paginacao from '../../components/Paginacao';
import { useFetch } from '../../hooks/useFetch';
import { formatarData, formatarMoeda, ROTULO_DIA } from '../../utils';

// Espelha o fluxo de status da API (a API continua sendo quem decide).
const PROXIMOS: Record<StatusPedido, StatusPedido[]> = {
  PENDENTE: ['CONFIRMADO', 'CANCELADO'],
  CONFIRMADO: ['ENTREGUE', 'CANCELADO'],
  ENTREGUE: [],
  CANCELADO: [],
};
const ROTULO_ACAO: Record<StatusPedido, string> = {
  PENDENTE: 'Pendente',
  CONFIRMADO: 'Confirmar',
  ENTREGUE: 'Marcar como entregue',
  CANCELADO: 'Cancelar',
};
const STATUS: StatusPedido[] = ['PENDENTE', 'CONFIRMADO', 'ENTREGUE', 'CANCELADO'];

export default function AdminPedidos() {
  const [pagina, setPagina] = useState(1);
  const [status, setStatus] = useState<StatusPedido | ''>('');
  const [retirada, setRetirada] = useState<DiaFeira | ''>('');
  const [aberto, setAberto] = useState<number | null>(null);
  const [erroAcao, setErroAcao] = useState<string | null>(null);

  const { dados, carregando, erro, recarregar } = useFetch(
    (s) => {
      const qs = new URLSearchParams({ pagina: String(pagina), limite: '10' });
      if (status) qs.set('status', status);
      if (retirada) qs.set('retirada', retirada);
      return api<Paginado<Pedido>>(`/pedidos?${qs}`, { auth: true, signal: s });
    },
    [pagina, status, retirada],
  );

  async function mudarStatus(pedido: Pedido, novo: StatusPedido) {
    if (novo === 'CANCELADO' && !confirm(`Cancelar o pedido nº ${pedido.id}? O estoque será devolvido.`)) return;
    setErroAcao(null);
    try {
      await api(`/pedidos/${pedido.id}/status`, { method: 'PATCH', auth: true, body: { status: novo } });
      recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    }
  }

  return (
    <>
      <div className="linha">
        <label htmlFor="f-status">Filtrar por status</label>
        <select id="f-status" value={status} onChange={(e) => { setStatus(e.target.value as StatusPedido | ''); setPagina(1); }}>
          <option value="">Todos</option>
          {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <label htmlFor="f-retirada">Dia de retirada</label>
        <select id="f-retirada" value={retirada} onChange={(e) => { setRetirada(e.target.value as DiaFeira | ''); setPagina(1); }}>
          <option value="">Todos</option>
          <option value="QUARTA">Quarta-feira</option>
          <option value="SABADO">Sábado</option>
        </select>
      </div>
      {erroAcao && <p className="alerta alerta-erro" role="alert">{erroAcao}</p>}
      <Estado carregando={carregando && !dados} erro={erro} onTentarNovamente={recarregar}>
        {dados && dados.itens.length === 0 && <p className="vazio">Nenhum pedido.</p>}
        <ul className="lista-cartoes">
          {dados?.itens.map((p) => (
            <li key={p.id} className="cartao-linha">
              <div className="cartao-linha-topo">
                <strong>Pedido nº {p.id}</strong>
                <span className={`status status-${p.status.toLowerCase()}`}>{p.status}</span>
              </div>
              <p>{p.clienteNome} · {p.clienteContato}</p>
              <p className="dica">{formatarData(p.criadoEm)} · <strong>{formatarMoeda(p.total)}</strong></p>
              <p>Retirada: <strong>{ROTULO_DIA[p.retirada]}</strong></p>
              {p.observacao && <p className="dica">Obs.: {p.observacao}</p>}
              <button className="btn btn-link" onClick={() => setAberto(aberto === p.id ? null : p.id)}>
                {aberto === p.id ? 'Ocultar itens' : `Ver itens (${p.itens.length})`}
              </button>
              {aberto === p.id && (
                <div className="tabela-rolavel">
                  <table>
                    <thead><tr><th>Produto</th><th>Qtd</th><th>Unitário</th><th>Subtotal</th></tr></thead>
                    <tbody>
                      {p.itens.map((i) => (
                        <tr key={i.produtoId}>
                          <td>{i.produtoNome}</td><td>{i.quantidade}</td>
                          <td>{formatarMoeda(i.precoUnitario)}</td><td>{formatarMoeda(i.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
              {PROXIMOS[p.status].length > 0 && (
                <div className="linha">
                  {PROXIMOS[p.status].map((s) => (
                    <button
                      key={s}
                      className={`btn${s === 'CANCELADO' ? ' btn-perigo' : ''}`}
                      onClick={() => mudarStatus(p, s)}
                    >
                      {ROTULO_ACAO[s]}
                    </button>
                  ))}
                </div>
              )}
            </li>
          ))}
        </ul>
        {dados && <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} onChange={setPagina} />}
      </Estado>
    </>
  );
}
