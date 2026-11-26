import {
  createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode,
} from 'react';
import { api, tokenStore } from '../api/client';
import type { Usuario } from '../api/types';

interface AuthContexto {
  usuario: Usuario | null;
  carregando: boolean;
  login(email: string, senha: string): Promise<void>;
  logout(): void;
}

const Contexto = createContext<AuthContexto | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [carregando, setCarregando] = useState(() => tokenStore.get() !== null);

  // Ao abrir o site, se houver token salvo, recupera o usuário.
  useEffect(() => {
    if (!tokenStore.get()) return;
    api<Usuario>('/auth/me', { auth: true })
      .then(setUsuario)
      .catch(() => tokenStore.clear())
      .finally(() => setCarregando(false));
  }, []);

  // Token expirado detectado pelo cliente da API.
  useEffect(() => {
    const aoExpirar = () => setUsuario(null);
    window.addEventListener('auth:expirou', aoExpirar);
    return () => window.removeEventListener('auth:expirou', aoExpirar);
  }, []);

  const login = useCallback(async (email: string, senha: string) => {
    const r = await api<{ token: string; usuario: Usuario }>('/auth/login', {
      method: 'POST',
      body: { email, senha },
    });
    tokenStore.set(r.token);
    setUsuario(r.usuario);
  }, []);

  const logout = useCallback(() => {
    tokenStore.clear();
    setUsuario(null);
  }, []);

  const valor = useMemo(
    () => ({ usuario, carregando, login, logout }),
    [usuario, carregando, login, logout],
  );
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function useAuth(): AuthContexto {
  const ctx = useContext(Contexto);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de <AuthProvider>');
  return ctx;
}
