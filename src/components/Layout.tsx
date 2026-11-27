import { Link, NavLink, Outlet } from 'react-router-dom';
import { INFO_FEIRA, NOME_ORG } from '../config';
import { useAuth } from '../context/AuthContext';
import { useCarrinho } from '../context/CartContext';

export default function Layout() {
  const { quantidadeTotal } = useCarrinho();
  const { usuario } = useAuth();

  return (
    <>
      <header className="topo">
        <div className="container topo-conteudo">
          <Link to="/" className="marca">🌿 {NOME_ORG}</Link>
          <nav className="menu" aria-label="Principal">
            <NavLink to="/" end>Catálogo</NavLink>
            <NavLink to="/contato">Contato</NavLink>
            <NavLink to="/carrinho">
              Carrinho{quantidadeTotal > 0 && <span className="selo">{quantidadeTotal}</span>}
            </NavLink>
            <NavLink to={usuario ? '/admin' : '/login'}>{usuario ? 'Painel' : 'Entrar'}</NavLink>
          </nav>
        </div>
      </header>
      <main className="container conteudo">
        <Outlet />
      </main>
      <footer className="rodape">
        <div className="container">
          <p>{NOME_ORG} — produtos naturais direto da fazenda. {INFO_FEIRA}</p>
          <p>Site desenvolvido como projeto de extensão universitária (UNIFAN · POO III).</p>
          <p>Coletamos apenas os dados necessários para atender seu pedido ou mensagem (LGPD).</p>
        </div>
      </footer>
    </>
  );
}
