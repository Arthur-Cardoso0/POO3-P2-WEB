import { useState } from 'react';
import { z } from 'zod';
import { api } from '../api/client';
import Campo from '../components/Campo';
import Consentimento from '../components/Consentimento';
import { useFormulario } from '../hooks/useFormulario';

const mensagemSchema = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome').max(100),
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  texto: z.string().trim().min(5, 'Escreva ao menos 5 caracteres').max(2000),
  consentimento: z.boolean().refine((v) => v, 'É necessário aceitar o aviso de privacidade'),
});

export default function Contato() {
  const [enviada, setEnviada] = useState(false);
  const form = useFormulario(
    { nome: '', email: '', texto: '', consentimento: false },
    mensagemSchema,
    async (dados) => {
      await api('/mensagens', { method: 'POST', body: dados });
      setEnviada(true);
      form.redefinir();
    },
  );

  return (
    <>
      <h1>Contato</h1>
      <p>Tem dúvidas ou quer fazer uma encomenda especial? Mande uma mensagem.</p>
      {enviada && <p className="alerta alerta-ok" role="status">Mensagem enviada! Responderemos em breve.</p>}
      <form className="formulario" onSubmit={form.enviar} noValidate>
        <Campo id="c-nome" rotulo="Nome" erro={form.erros.nome}>
          {(p) => <input {...p} value={form.valores.nome} onChange={(e) => form.definir('nome', e.target.value)} />}
        </Campo>
        <Campo id="c-email" rotulo="E-mail" erro={form.erros.email}>
          {(p) => <input {...p} type="email" value={form.valores.email} onChange={(e) => form.definir('email', e.target.value)} />}
        </Campo>
        <Campo id="c-texto" rotulo="Mensagem" erro={form.erros.texto}>
          {(p) => <textarea {...p} rows={5} value={form.valores.texto} onChange={(e) => form.definir('texto', e.target.value)} />}
        </Campo>
        <Consentimento
          marcado={form.valores.consentimento}
          erro={form.erros.consentimento}
          onChange={(v) => form.definir('consentimento', v)}
        />
        {form.erroGeral && <p className="alerta alerta-erro" role="alert">{form.erroGeral}</p>}
        <button className="btn" type="submit" disabled={form.enviando}>
          {form.enviando ? 'Enviando…' : 'Enviar mensagem'}
        </button>
      </form>
    </>
  );
}
