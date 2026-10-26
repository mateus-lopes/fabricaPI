import type { Fonte } from './fontes'
import { chaveColuna, type Tabela } from './tabela'

export interface ResultadoImportacao<T> {
  registros: T[]
  /** Impedem o uso do arquivo (ex.: coluna obrigatória ausente). */
  erros: string[]
  /** Linhas descartadas, com o motivo. O arquivo continua sendo usado. */
  avisos: string[]
}

const MAX_AVISOS = 20

/** Valida o cabeçalho e converte cada linha em entidade do domínio. Nada é descartado sem virar aviso. */
export function importar<T>(fonte: Fonte<T>, tabela: Tabela): ResultadoImportacao<T> {
  const presentes = new Set(tabela.colunas.map(chaveColuna))
  const faltando = fonte.colunas.filter((c) => !presentes.has(c))
  if (faltando.length > 0) {
    return {
      registros: [],
      erros: [`Este arquivo não parece ser de ${fonte.titulo} (${fonte.sistema}). Colunas ausentes: ${faltando.join(', ')}.`],
      avisos: [],
    }
  }

  const registros: T[] = []
  const avisos: string[] = []
  let descartadas = 0

  tabela.linhas.forEach((original, i) => {
    const linha = Object.fromEntries(Object.entries(original).map(([k, v]) => [chaveColuna(k), v]))
    const r = fonte.esquema.safeParse(fonte.mapear(linha))
    if (r.success) {
      registros.push(r.data)
      return
    }
    descartadas++
    if (avisos.length < MAX_AVISOS) {
      const motivo = r.error.issues.map((p) => `${p.path.join('.')}: ${p.message}`).join('; ')
      // +2: o cabeçalho é a linha 1 da planilha.
      avisos.push(`Linha ${i + 2} ignorada (${motivo}).`)
    }
  })

  if (descartadas > MAX_AVISOS) avisos.push(`… e mais ${descartadas - MAX_AVISOS} linhas ignoradas.`)
  return { registros, erros: [], avisos }
}
