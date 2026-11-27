import { Link } from 'react-router-dom';
import type { Produto } from '../api/types';
import { useCarrinho } from '../context/CartContext';
import { emojiDoProduto, formatarMoeda } from '../utils';

export function ImagemProduto({ produto }: { produto: Pick<Produto, 'nome' | 'imagemUrl'> }) {
  return produto.imagemUrl ? (
    <img src={produto.imagemUrl} alt={produto.nome} loading="lazy" />
  ) : (
    <div className="sem-imagem" role="img" aria-label={`Sem foto de ${produto.nome}`}>{emojiDoProduto(produto.nome)}</div>
  );
}

export default function CartaoProduto({ produto }: { produto: Produto }) {
  const { adicionar, itens } = useCarrinho();
  const noCarrinho = itens.find((i) => i.produto.id === produto.id)?.quantidade ?? 0;
  const esgotado = produto.estoque === 0;
  const atingiuLimite = noCarrinho >= produto.estoque;

  return (
    <article className="cartao">
      <Link to={`/produtos/${produto.id}`} className="cartao-imagem">
        <ImagemProduto produto={produto} />
      </Link>
      <div className="cartao-corpo">
        <span className="etiqueta">{produto.categoria.nome}</span>
        <h3><Link to={`/produtos/${produto.id}`}>{produto.nome}</Link></h3>
        <p className="preco">{formatarMoeda(produto.preco)}</p>
        <button
          className="btn"
          disabled={esgotado || atingiuLimite}
          onClick={() => adicionar(produto)}
        >
          {esgotado ? 'Esgotado' : atingiuLimite ? 'Máximo no carrinho' : 'Adicionar ao carrinho'}
        </button>
      </div>
    </article>
  );
}
