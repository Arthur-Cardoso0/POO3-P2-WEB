import { NOME_ORG } from '../config';

interface Props {
  marcado: boolean;
  erro?: string;
  onChange: (valor: boolean) => void;
}

/** Aviso de privacidade (LGPD) exibido nos formulários públicos. */
export default function Consentimento({ marcado, erro, onChange }: Props) {
  return (
    <div className={`campo${erro ? ' campo-erro' : ''}`}>
      <p className="aviso-privacidade">
        <strong>Aviso de privacidade:</strong> usaremos seus dados somente para responder esta
        solicitação em nome de {NOME_ORG}. Não os compartilhamos com terceiros e você pode pedir a
        exclusão a qualquer momento.
      </p>
      <label className="check">
        <input type="checkbox" checked={marcado} onChange={(e) => onChange(e.target.checked)} />
        Li e concordo com o aviso de privacidade
      </label>
      {erro && <small className="msg-erro">{erro}</small>}
    </div>
  );
}
