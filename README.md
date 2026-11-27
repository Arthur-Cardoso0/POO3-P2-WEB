# Raízes do Cerrado — Front-end (React + TypeScript)

Interface web do projeto de extensão (POO III) para o feirante **Raízes do Cerrado** (produtos naturais de fazenda, feira às quartas e sábados). O cliente escolhe o dia de retirada ao pedir, e o painel mostra "o que levar para a feira" em cada dia. Consome a API NestJS (`POO3-P2-API`).

## Rodando

```bash
npm install
cp .env.example .env      # VITE_API_URL aponta para a API (padrão http://localhost:3333)
npm run dev               # http://localhost:3000
npm run build             # checagem de tipos + build de produção (pasta dist/)
```

A API precisa estar rodando e com `FRONTEND_URL=http://localhost:3000` no `.env` dela (CORS).

## Estrutura

- `src/api/` — cliente HTTP tipado (`api<T>()`, token JWT, `ApiError`) e tipos da API
- `src/context/` — `AuthProvider` (`useAuth`) e `CartProvider` (`useCarrinho`, salvo no localStorage)
- `src/hooks/` — hooks próprios: `useFetch` (busca com cancelamento), `useDebounce`, `useFormulario` (valores + validação Zod + erro por campo)
- `src/components/` — `Layout`, `CartaoProduto`, `Paginacao`, `Campo`, `Consentimento` (aviso LGPD), `RotaProtegida`
- `src/pages/` — parte pública (catálogo, detalhe, carrinho/pedido, contato, login) e `admin/` (pedidos, produtos, mensagens, relatórios)

## Telas

| Rota | Acesso |
|---|---|
| `/` catálogo (busca, categoria, paginação na URL) · `/produtos/:id` · `/carrinho` · `/contato` | público |
| `/login` | público |
| `/admin` (pedidos), `/admin/produtos`, `/admin/mensagens` | logado (admin ou operador) |
| `/admin/relatorios` | só ADMIN |

Layout responsivo (celular e computador), com suporte a modo escuro.

## Fotos dos produtos

Sem foto, o site mostra um ícone (emoji) escolhido pelo nome do produto. Para usar fotos reais do feirante:

1. Coloque os arquivos em `public/produtos/` (ex.: `alface.jpg`), de preferência reduzidos (até ~800 px de largura).
2. No painel, em **Produtos → Editar**, informe o caminho `/produtos/alface.jpg` no campo de imagem.

Só publique fotos que o feirante tiver feito ou autorizado.

## Publicação

Na Vercel/Netlify defina `VITE_API_URL` (endereço público da API) e `VITE_NOME_ORG` (nome da organização parceira).
Como o app usa React Router, configure o *fallback* para `index.html` (na Vercel: rewrite de `/(.*)` para `/`).
