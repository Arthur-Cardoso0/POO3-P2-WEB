import type { ReactNode } from 'react';

interface Props {
  carregando: boolean;
  erro: string | null;
  onTentarNovamente?: () => void;
  children: ReactNode;
}

/** Mostra "carregando" na primeira carga e erro com botão de tentar de novo. */
export default function Estado({ carregando, erro, onTentarNovamente, children }: Props) {
  if (erro) {
    return (
      <div className="alerta alerta-erro" role="alert">
        <p>{erro}</p>
        {onTentarNovamente && (
          <button type="button" className="btn btn-secundario" onClick={onTentarNovamente}>
            Tentar novamente
          </button>
        )}
      </div>
    );
  }
  if (carregando) return <p className="carregando" aria-live="polite">Carregando…</p>;
  return <>{children}</>;
}
