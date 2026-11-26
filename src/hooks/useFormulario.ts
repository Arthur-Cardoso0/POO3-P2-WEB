import { useState, type FormEvent } from 'react';
import type { z } from 'zod';
import { mensagemDeErro } from '../api/client';

/** Converte os erros do Zod em { campo: "primeira mensagem" }. */
function errosPorCampo(erro: z.ZodError): Record<string, string> {
  const resultado: Record<string, string> = {};
  for (const problema of erro.issues) {
    const campo = String(problema.path[0] ?? '_');
    if (!(campo in resultado)) resultado[campo] = problema.message;
  }
  return resultado;
}

/**
 * Hook próprio de formulário: guarda valores, valida com Zod ao enviar,
 * mostra erro por campo e trata o erro devolvido pela API.
 */
export function useFormulario<TForm extends object, TSaida>(
  inicial: TForm,
  schema: z.ZodType<TSaida>,
  aoEnviar: (dados: TSaida) => Promise<void>,
) {
  const [valores, setValores] = useState<TForm>(inicial);
  const [erros, setErros] = useState<Record<string, string>>({});
  const [erroGeral, setErroGeral] = useState<string | null>(null);
  const [enviando, setEnviando] = useState(false);

  function definir<K extends keyof TForm>(campo: K, valor: TForm[K]) {
    setValores((v) => ({ ...v, [campo]: valor }));
    setErros((e) => {
      if (!(campo as string in e)) return e;
      const { [campo as string]: _removido, ...resto } = e;
      return resto;
    });
  }

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setErroGeral(null);
    const resultado = schema.safeParse(valores);
    if (!resultado.success) {
      setErros(errosPorCampo(resultado.error));
      return;
    }
    setErros({});
    setEnviando(true);
    try {
      await aoEnviar(resultado.data);
    } catch (erro) {
      setErroGeral(mensagemDeErro(erro));
    } finally {
      setEnviando(false);
    }
  }

  function redefinir(novo: TForm = inicial) {
    setValores(novo);
    setErros({});
    setErroGeral(null);
  }

  return { valores, definir, erros, erroGeral, enviando, enviar, redefinir };
}
