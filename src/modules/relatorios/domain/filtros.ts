import type { MatriculaNoCiclo } from '@/modules/censo'

/** Valor vazio = sem filtro naquele campo. */
export interface Filtros {
  ciclo: string
  curso: string
  status: string
  municipio: string
}

export const SEM_FILTROS: Filtros = { ciclo: '', curso: '', status: '', municipio: '' }

const CAMPOS: Record<keyof Filtros, (m: MatriculaNoCiclo) => string> = {
  ciclo: (m) => m.ciclo.nome,
  curso: (m) => m.ciclo.curso,
  status: (m) => m.status,
  municipio: (m) => m.ciclo.municipio,
}

export function aplicarFiltros(matriculas: MatriculaNoCiclo[], filtros: Filtros): MatriculaNoCiclo[] {
  const ativos = (Object.keys(CAMPOS) as (keyof Filtros)[]).filter((k) => filtros[k] !== '')
  return matriculas.filter((m) => ativos.every((k) => CAMPOS[k](m) === filtros[k]))
}

/** Valores distintos de um campo, em ordem alfabética, para preencher o seletor. */
export function opcoes(matriculas: MatriculaNoCiclo[], campo: keyof Filtros): string[] {
  return [...new Set(matriculas.map(CAMPOS[campo]))].sort((a, b) => a.localeCompare(b, 'pt-BR'))
}
