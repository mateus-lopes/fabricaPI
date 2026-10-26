import type { Censo, Ciclo, Matricula, MatriculaNoCiclo, Trancamento } from './tipos'

/** Junta alunos e ciclos pelo código do ciclo (o "merge" do SISTEC). */
export function consolidar(
  referencia: string,
  ciclos: Ciclo[],
  matriculas: Matricula[],
  trancamentos: Trancamento[] = [],
): Censo {
  const porCodigo = new Map(ciclos.map((c) => [c.codigo, c]))
  const comCiclo: MatriculaNoCiclo[] = []
  const semCiclo: Matricula[] = []

  for (const m of matriculas) {
    const ciclo = porCodigo.get(m.codigoCiclo)
    if (ciclo) comCiclo.push({ ...m, ciclo })
    else semCiclo.push(m)
  }

  return { referencia, ciclos, matriculas: comCiclo, trancamentos, matriculasSemCiclo: semCiclo }
}
