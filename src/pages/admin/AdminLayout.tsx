import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminLayout() {
  const { usuario, logout } = useAuth();
  const navegar = useNavigate();

  return (
    <>
      <div className="admin-topo">
        <h1>Painel</h1>
        <p className="dica">
          {usuario?.nome} ({usuario?.perfil === 'ADMIN' ? 'administrador' : 'operador'}){' '}
          <button
            className="btn btn-link"
            onClick={() => {
              logout();
              navegar('/');
            }}
          >
            Sair
          </button>
        </p>
      </div>
      <nav className="abas" aria-label="Painel">
        <NavLink to="/admin" end>Pedidos</NavLink>
        <NavLink to="/admin/produtos">Produtos</NavLink>
        <NavLink to="/admin/mensagens">Mensagens</NavLink>
        {usuario?.perfil === 'ADMIN' && <NavLink to="/admin/relatorios">Relatórios</NavLink>}
      </nav>
      <Outlet />
    </>
  );
}
