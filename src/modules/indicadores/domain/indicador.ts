import type { Censo } from '@/modules/censo'

export type GrupoIndicador = 'visao-geral' | 'situacao-matricula'

/**
 * Contrato de um indicador. Para criar um novo, implemente esta interface num arquivo do catálogo
 * e acrescente-o à lista em catalogo.ts: nenhuma tela precisa ser alterada.
 */
export interface Indicador {
  id: string
  titulo: string
  grupo: GrupoIndicador
  /** Explica a regra de cálculo para quem lê o relatório. */
  descricao: string
  calcular(censo: Censo): number
  /** Quando definido, o cartão também mostra a fração relativa a este total. */
  base?(censo: Censo): number
}

export interface ValorIndicador {
  indicador: Indicador
  valor: number
  fracao: number | null
}

export function calcularTodos(indicadores: readonly Indicador[], censo: Censo): ValorIndicador[] {
  return indicadores.map((indicador) => {
    const valor = indicador.calcular(censo)
    const base = indicador.base?.(censo)
    return { indicador, valor, fracao: base ? valor / base : null }
  })
}
