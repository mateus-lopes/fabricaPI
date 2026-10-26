import type { Censo, Ciclo, StatusMatricula } from './tipos'

export interface LinhaStatus {
  ciclo: Ciclo
  porStatus: Map<StatusMatricula, number>
  total: number
  /** Só existe quando a planilha de trancados foi carregada. */
  trancados?: number
  /** Em curso menos trancados: quem de fato está frequentando. */
  frequentando?: number
}

export function contar(linha: LinhaStatus, status: StatusMatricula): number {
  return linha.porStatus.get(status) ?? 0
}

/** Quantidade de alunos por status em cada ciclo, na ordem do arquivo de ciclos. Ciclos sem alunos ficam de fora. */
export function tabelaStatus(censo: Censo): LinhaStatus[] {
  const linhas = new Map<string, LinhaStatus>()

  for (const m of censo.matriculas) {
    let linha = linhas.get(m.ciclo.codigo)
    if (!linha) {
      linha = { ciclo: m.ciclo, porStatus: new Map(), total: 0 }
      linhas.set(m.ciclo.codigo, linha)
    }
    linha.porStatus.set(m.status, contar(linha, m.status) + 1)
    linha.total++
  }

  if (censo.trancamentos.length > 0) {
    const trancadosPor = new Map<string, number>()
    for (const t of censo.trancamentos) {
      const chave = `${t.curso}|${t.ano}`
      trancadosPor.set(chave, (trancadosPor.get(chave) ?? 0) + 1)
    }
    for (const linha of linhas.values()) {
      const trancados = trancadosPor.get(`${linha.ciclo.curso}|${linha.ciclo.ano}`) ?? 0
      linha.trancados = trancados
      linha.frequentando = Math.max(contar(linha, 'EM_CURSO') - trancados, 0)
    }
  }

  const ordem = new Map(censo.ciclos.map((c, i) => [c.codigo, i]))
  return [...linhas.values()].sort((a, b) => (ordem.get(a.ciclo.codigo) ?? 0) - (ordem.get(b.ciclo.codigo) ?? 0))
}
