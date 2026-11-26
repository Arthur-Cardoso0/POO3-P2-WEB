import { API_URL } from '../config';

const TOKEN_KEY = 'token';

/** Token em localStorage: protegido por try/catch porque o storage pode estar indisponível. */
export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(TOKEN_KEY);
    } catch {
      return null;
    }
  },
  set(token: string) {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch {
      /* sem storage: o login vale só até recarregar a página */
    }
  },
  clear() {
    try {
      localStorage.removeItem(TOKEN_KEY);
    } catch {
      /* ignora */
    }
  },
};

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof ApiError) return erro.message;
  return 'Não foi possível conectar ao servidor. Tente novamente em instantes.';
}

interface Opcoes {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
  body?: unknown;
  /** Envia o token do usuário logado. */
  auth?: boolean;
  signal?: AbortSignal;
}

export async function api<T>(caminho: string, opcoes: Opcoes = {}): Promise<T> {
  const headers: Record<string, string> = {};
  if (opcoes.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opcoes.auth) {
    const token = tokenStore.get();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const resposta = await fetch(`${API_URL}${caminho}`, {
    method: opcoes.method ?? 'GET',
    headers,
    body: opcoes.body !== undefined ? JSON.stringify(opcoes.body) : undefined,
    signal: opcoes.signal,
  });

  if (resposta.status === 204) return undefined as T;

  const dados: unknown = await resposta.json().catch(() => null);
  if (!resposta.ok) {
    const corpo = (dados ?? {}) as { message?: string | string[]; code?: string };
    const mensagem = Array.isArray(corpo.message)
      ? corpo.message.join(' ')
      : (corpo.message ?? 'Erro inesperado.');
    if (resposta.status === 401 && opcoes.auth) {
      tokenStore.clear();
      window.dispatchEvent(new Event('auth:expirou'));
    }
    throw new ApiError(resposta.status, corpo.code ?? 'ERRO', mensagem);
  }
  return dados as T;
}
