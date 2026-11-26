import { useState } from 'react';
import { api } from '../../api/client';
import type { PedidosPorStatus, ProdutoEstoqueBaixo, VendaPorProduto } from '../../api/types';
import Estado from '../../components/Estado';
import { useFetch } from '../../hooks/useFetch';
import { formatarMoeda } from '../../utils';

export default function AdminRelatorios() {
  const [limite, setLimite] = useState(5);
  const vendas = useFetch((s) => api<VendaPorProduto[]>('/relatorios/vendas-por-produto', { auth: true, signal: s }), []);
  const status = useFetch((s) => api<PedidosPorStatus[]>('/relatorios/pedidos-por-status', { auth: true, signal: s }), []);
  const estoque = useFetch(
    (s) => api<ProdutoEstoqueBaixo[]>(`/relatorios/estoque-baixo?limite=${limite}`, { auth: true, signal: s }),
    [limite],
  );
  const maior = Math.max(1, ...(vendas.dados ?? []).map((v) => v.faturamento));

  return (
    <>
      <section>
        <h2>Vendas por produto</h2>
        <p className="dica">Considera pedidos não cancelados.</p>
        <Estado carregando={vendas.carregando} erro={vendas.erro} onTentarNovamente={vendas.recarregar}>
          {vendas.dados?.length === 0 && <p className="vazio">Ainda não há vendas.</p>}
          <ul className="barras">
            {vendas.dados?.map((v) => (
              <li key={v.produtoId}>
                <div className="barras-topo">
                  <span>{v.produto}</span>
                  <span>{formatarMoeda(v.faturamento)} · {v.quantidadeVendida} un. · {v.pedidos} pedido(s)</span>
                </div>
                <div className="barra"><div style={{ width: `${(v.faturamento / maior) * 100}%` }} /></div>
              </li>
            ))}
          </ul>
        </Estado>
      </section>

      <section>
        <h2>Pedidos por status</h2>
        <Estado carregando={status.carregando} erro={status.erro} onTentarNovamente={status.recarregar}>
          <div className="tabela-rolavel">
            <table>
              <thead><tr><th>Status</th><th>Pedidos</th><th>Valor total</th></tr></thead>
              <tbody>
                {status.dados?.map((s) => (
                  <tr key={s.status}><td>{s.status}</td><td>{s.quantidade}</td><td>{formatarMoeda(s.valorTotal)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </Estado>
      </section>

      <section>
        <h2>Estoque baixo</h2>
        <div className="linha">
          <label htmlFor="lim">Mostrar produtos com até</label>
          <input id="lim" type="number" min={0} value={limite} onChange={(e) => setLimite(Math.max(0, Number(e.target.value) || 0))} />
          <span>unidades</span>
        </div>
        <Estado carregando={estoque.carregando && !estoque.dados} erro={estoque.erro} onTentarNovamente={estoque.recarregar}>
          {estoque.dados?.length === 0 ? <p className="vazio">Nenhum produto com estoque baixo.</p> : (
            <ul>{estoque.dados?.map((p) => <li key={p.id}>{p.nome}: <strong>{p.estoque}</strong></li>)}</ul>
          )}
        </Estado>
      </section>
    </>
  );
}
