import { contar, tabelaStatus, type LinhaStatus } from './tabela-status'
import type { Censo } from './tipos'

/**
 * Ciclo crítico: está em andamento e tem menos que este número de alunos em curso.
 * Na versão Streamlit o indicador usava "< 2" e a listagem "< 3"; aqui existe um único critério.
 */
export const LIMITE_CICLO_CRITICO = 3

/**
 * Em andamento na data de referência: ainda não passou do término previsto, ou ainda tem aluno em curso.
 * Sem isso, toda turma já formada (0 em curso) contaria como crítica.
 */
export function emAndamento(linha: LinhaStatus, referencia: string): boolean {
  const { fimPrevisto } = linha.ciclo
  return fimPrevisto === null || fimPrevisto >= referencia || contar(linha, 'EM_CURSO') > 0
}

/** Todos os ciclos críticos (a versão Streamlit devolvia só o primeiro encontrado). */
export function ciclosCriticos(censo: Censo, limite = LIMITE_CICLO_CRITICO): LinhaStatus[] {
  return tabelaStatus(censo).filter(
    (linha) => emAndamento(linha, censo.referencia) && contar(linha, 'EM_CURSO') < limite,
  )
}

export function ciclosEmAndamento(censo: Censo): LinhaStatus[] {
  return tabelaStatus(censo).filter((linha) => emAndamento(linha, censo.referencia))
}
