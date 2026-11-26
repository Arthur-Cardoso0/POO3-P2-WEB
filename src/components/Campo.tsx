import type { ReactNode } from 'react';

interface Props {
  rotulo: string;
  erro?: string;
  dica?: string;
  children: (ids: { id: string; 'aria-invalid': boolean; 'aria-describedby'?: string }) => ReactNode;
  id: string;
}

/** Rótulo + controle + mensagem de erro, com atributos de acessibilidade. */
export default function Campo({ rotulo, erro, dica, children, id }: Props) {
  const descricaoId = erro || dica ? `${id}-desc` : undefined;
  return (
    <div className={`campo${erro ? ' campo-erro' : ''}`}>
      <label htmlFor={id}>{rotulo}</label>
      {children({ id, 'aria-invalid': Boolean(erro), 'aria-describedby': descricaoId })}
      {(erro || dica) && (
        <small id={descricaoId} className={erro ? 'msg-erro' : 'dica'}>{erro ?? dica}</small>
      )}
    </div>
  );
}
