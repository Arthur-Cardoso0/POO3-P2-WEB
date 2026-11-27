import { Link, useLocation } from 'react-router-dom';
import type { DiaFeira } from '../api/types';
import { formatarMoeda, ROTULO_DIA } from '../utils';

export default function PedidoEnviado() {
  const estado = useLocation().state as { id: number; total: number; retirada: DiaFeira } | null;
  return (
    <div className="caixa-centro">
      <h1>Pedido enviado! 🎉</h1>
      {estado && (
        <p>
          Pedido nº <strong>{estado.id}</strong> — total de <strong>{formatarMoeda(estado.total)}</strong>.
        </p>
      )}
      {estado && (
        <p>
          Retirada na feira: <strong>{ROTULO_DIA[estado.retirada]}</strong>. O pagamento é feito na retirada.
        </p>
      )}
      <p>Se precisarmos confirmar algum detalhe, entraremos em contato pelo telefone ou e-mail informado.</p>
      <Link to="/" className="btn">Voltar ao catálogo</Link>
    </div>
  );
}
