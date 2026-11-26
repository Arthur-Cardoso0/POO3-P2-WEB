import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import Campo from '../components/Campo';
import { useAuth } from '../context/AuthContext';
import { useFormulario } from '../hooks/useFormulario';

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('E-mail inválido'),
  senha: z.string().min(1, 'Informe a senha'),
});

export default function Login() {
  const { usuario, login } = useAuth();
  const navegar = useNavigate();
  const destino = (useLocation().state as { de?: string } | null)?.de ?? '/admin';

  const form = useFormulario({ email: '', senha: '' }, loginSchema, async (dados) => {
    await login(dados.email, dados.senha);
    navegar(destino, { replace: true });
  });

  if (usuario) return <Navigate to="/admin" replace />;

  return (
    <div className="caixa-centro caixa-estreita">
      <h1>Entrar</h1>
      <p className="dica">Acesso restrito à equipe da organização.</p>
      <form className="formulario" onSubmit={form.enviar} noValidate>
        <Campo id="l-email" rotulo="E-mail" erro={form.erros.email}>
          {(p) => <input {...p} type="email" autoComplete="username" value={form.valores.email} onChange={(e) => form.definir('email', e.target.value)} />}
        </Campo>
        <Campo id="l-senha" rotulo="Senha" erro={form.erros.senha}>
          {(p) => <input {...p} type="password" autoComplete="current-password" value={form.valores.senha} onChange={(e) => form.definir('senha', e.target.value)} />}
        </Campo>
        {form.erroGeral && <p className="alerta alerta-erro" role="alert">{form.erroGeral}</p>}
        <button className="btn" type="submit" disabled={form.enviando}>
          {form.enviando ? 'Entrando…' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
