import { Navigate, Outlet, useLocation } from 'react-router-dom';
import type { Perfil } from '../api/types';
import { useAuth } from '../context/AuthContext';

export default function RotaProtegida({ perfis }: { perfis?: Perfil[] }) {
  const { usuario, carregando } = useAuth();
  const local = useLocation();

  if (carregando) return <p className="carregando">Carregando…</p>;
  if (!usuario) return <Navigate to="/login" replace state={{ de: local.pathname }} />;
  if (perfis && !perfis.includes(usuario.perfil)) {
    return <div className="alerta alerta-erro">Você não tem permissão para acessar esta página.</div>;
  }
  return <Outlet />;
}
