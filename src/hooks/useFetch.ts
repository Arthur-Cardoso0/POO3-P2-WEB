import { useEffect, useState } from 'react';
import { mensagemDeErro } from '../api/client';

interface Estado<T> {
  dados: T | null;
  erro: string | null;
  carregando: boolean;
}

/**
 * Hook próprio: busca dados ao montar e sempre que `deps` mudar.
 * Cancela a requisição anterior (AbortController) e mantém os dados antigos enquanto carrega.
 */
export function useFetch<T>(
  buscar: (signal: AbortSignal) => Promise<T>,
  deps: readonly unknown[],
) {
  const [estado, setEstado] = useState<Estado<T>>({
    dados: null,
    erro: null,
    carregando: true,
  });
  const [versao, setVersao] = useState(0);

  useEffect(() => {
    const controle = new AbortController();
    setEstado((e) => ({ ...e, carregando: true, erro: null }));
    buscar(controle.signal)
      .then((dados) => setEstado({ dados, erro: null, carregando: false }))
      .catch((erro: unknown) => {
        if (controle.signal.aborted) return;
        setEstado({ dados: null, erro: mensagemDeErro(erro), carregando: false });
      });
    return () => controle.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, versao]);

  return { ...estado, recarregar: () => setVersao((v) => v + 1) };
}
