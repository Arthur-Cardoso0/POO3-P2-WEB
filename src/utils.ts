const moeda = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
export const formatarMoeda = (valor: number) => moeda.format(valor);

export const formatarData = (iso: string) =>
  new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

/** Aceita "12,50" ou "12.50". Retorna NaN se inválido. */
export const paraNumero = (texto: string) => Number(texto.replace(',', '.'));

export const ROTULO_DIA = { QUARTA: 'Quarta-feira', SABADO: 'Sábado' } as const;
