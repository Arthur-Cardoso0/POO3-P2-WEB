const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatarMoeda = (valor: number) => moeda.format(valor);

export const formatarData = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

/** Aceita "12,50" ou "12.50". Retorna NaN se inválido. */
export const paraNumero = (texto: string) => Number(texto.replace(',', '.'));

export const ROTULO_DIA = { QUARTA: 'Quarta-feira', SABADO: 'Sábado' } as const;

/** Ícone do produto enquanto ele não tem foto (o primeiro padrão que combinar com o nome vence). */
const ICONES: [RegExp, string][] = [
  [/doce de leite/, '🍮'],
  [/\bovos?\b/, '🥚'],
  [/queijo|requeijao/, '🧀'],
  [/manteiga|\bnata\b|leite/, '🥛'],
  [/\bmel\b|favo|propolis|polen/, '🍯'],
  [/cafe/, '☕'],
  [/compota|conserva|curtida/, '🫙'],
  [/pimenta|colorau/, '🌶️'],
  [/cebolinha|salsinha|coentro|manjericao|alecrim|hortela|tomilho|salvia|louro|gengibre|acafrao/, '🌿'],
  [/alho/, '🧄'],
  [/cebola/, '🧅'],
  [/milho/, '🌽'],
  [/amendoim/, '🥜'],
  [/feijao/, '🫘'],
  [/farinha|polvilho|fuba/, '🌾'],
  [/rapadura|melado|acucar/, '🍬'],
  [/alface|couve|rucula|agriao|espinafre|almeirao|repolho/, '🥬'],
  [/batata-doce/, '🍠'],
  [/mandioca|batata|inhame|\bcara\b/, '🥔'],
  [/cenoura|beterraba|rabanete/, '🥕'],
  [/abobora/, '🎃'],
  [/quiabo|jilo|maxixe|vagem|chuchu|abobrinha/, '🥒'],
  [/berinjela/, '🍆'],
  [/tomate/, '🍅'],
  [/banana/, '🍌'],
  [/laranja|mexerica/, '🍊'],
  [/limao/, '🍋'],
  [/abacate/, '🥑'],
  [/manga|mamao|pequi/, '🥭'],
  [/goiaba/, '🍐'],
  [/jabuticaba/, '🍇'],
  [/acerola/, '🍒'],
  [/maracuja/, '🍈'],
];

export function emojiDoProduto(nome: string): string {
  const texto = nome.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  return ICONES.find(([padrao]) => padrao.test(texto))?.[1] ?? '🧺';
}
