import { useState } from 'react';
import { api, mensagemDeErro } from '../../api/client';
import type { Mensagem, Paginado } from '../../api/types';
import Estado from '../../components/Estado';
import Paginacao from '../../components/Paginacao';
import { useFetch } from '../../hooks/useFetch';
import { formatarData } from '../../utils';

export default function AdminMensagens() {
  const [pagina, setPagina] = useState(1);
  const [erroAcao, setErroAcao] = useState<string | null>(null);
  const { dados, carregando, erro, recarregar } = useFetch(
    (s) => api<Paginado<Mensagem>>(`/mensagens?pagina=${pagina}&limite=10`, { auth: true, signal: s }),
    [pagina],
  );

  async function marcarLida(id: number) {
    setErroAcao(null);
    try {
      await api(`/mensagens/${id}/lida`, { method: 'PATCH', auth: true });
      recarregar();
    } catch (e) {
      setErroAcao(mensagemDeErro(e));
    }
  }

  return (
    <Estado carregando={carregando && !dados} erro={erro} onTentarNovamente={recarregar}>
      {erroAcao && <p className="alerta alerta-erro" role="alert">{erroAcao}</p>}
      {dados && dados.itens.length === 0 && <p className="vazio">Nenhuma mensagem.</p>}
      <ul className="lista-cartoes">
        {dados?.itens.map((m) => (
          <li key={m.id} className={`cartao-linha${m.lida ? ' lida' : ''}`}>
            <div className="cartao-linha-topo">
              <strong>{m.nome}</strong>
              <span className="dica">{formatarData(m.criadoEm)}</span>
            </div>
            <p className="dica">{m.email}</p>
            <p>{m.texto}</p>
            {!m.lida && <button className="btn btn-secundario" onClick={() => marcarLida(m.id)}>Marcar como lida</button>}
          </li>
        ))}
      </ul>
      {dados && <Paginacao pagina={dados.pagina} totalPaginas={dados.totalPaginas} onChange={setPagina} />}
    </Estado>
  );
}
