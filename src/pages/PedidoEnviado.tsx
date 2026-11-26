import { Link, useLocation } from 'react-router-dom';
import { formatarMoeda } from '../utils';

export default function PedidoEnviado() {
  const estado = useLocation().state as { id: number; total: number } | null;
  return (
    <div className="caixa-centro">
      <h1>Pedido enviado! 🎉</h1>
      {estado && (
        <p>
          Pedido nº <strong>{estado.id}</strong> — total de <strong>{formatarMoeda(estado.total)}</strong>.
        </p>
      )}
      <p>A organização vai entrar em contato pelo telefone ou e-mail informado para combinar o pagamento e a entrega.</p>
      <Link to="/" className="btn">Voltar ao catálogo</Link>
    </div>
  );
}
