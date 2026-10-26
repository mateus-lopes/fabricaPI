/** Status de matrícula como o SISTEC exporta (coluna NO_STATUS_MATRICULA). */
export const STATUS_MATRICULA = [
  'EM_CURSO',
  'INTEGRALIZADA',
  'CONCLUÍDA',
  'ABANDONO',
  'DESLIGADO',
  'TRANSF_EXT',
  'TRANSF_INT',
] as const

export type StatusConhecido = (typeof STATUS_MATRICULA)[number]

/** Um status fora da lista continua sendo contado: o SISTEC pode criar novos. */
export type StatusMatricula = StatusConhecido | (string & {})

/** Ciclo de matrícula (uma turma de um curso), vindo do relatório de ciclos do SISTEC. */
export interface Ciclo {
  codigo: string
  /** Ex.: "REDES DE COMPUTADORES - EDUCAÇÃO PRESENCIAL - FEV. 2020 / DEZ. 2022" */
  nome: string
  curso: string
  municipio: string
  /** Ano de início, lido do nome do ciclo. */
  ano: string | null
  /** Data prevista de término (AAAA-MM-DD), quando informada. */
  fimPrevisto: string | null
}

/** Matrícula de um aluno, vinda do relatório de alunos do SISTEC. Sem CPF: não é necessário para o censo. */
export interface Matricula {
  codigo: string
  aluno: string
  codigoCiclo: string
  status: StatusMatricula
}

/** Aluno com matrícula trancada, vindo da planilha do SIGAA. */
export interface Trancamento {
  matricula: string
  curso: string
  /** Ano de ingresso: os 4 primeiros dígitos da matrícula. */
  ano: string
}

export interface MatriculaNoCiclo extends Matricula {
  ciclo: Ciclo
}

/** Resultado da consolidação das fontes: tudo o que os relatórios e indicadores consomem. */
export interface Censo {
  /** Data de referência do censo (AAAA-MM-DD): define quais ciclos ainda estão em andamento. */
  referencia: string
  ciclos: Ciclo[]
  matriculas: MatriculaNoCiclo[]
  trancamentos: Trancamento[]
  /** Matrículas cujo ciclo não veio no arquivo de ciclos. Exibidas como problema de qualidade, nunca descartadas em silêncio. */
  matriculasSemCiclo: Matricula[]
}

const ROTULOS: Record<StatusConhecido, string> = {
  EM_CURSO: 'Em curso',
  INTEGRALIZADA: 'Integralizada',
  CONCLUÍDA: 'Concluída',
  ABANDONO: 'Abandono',
  DESLIGADO: 'Desligado',
  TRANSF_EXT: 'Transf. externa',
  TRANSF_INT: 'Transf. interna',
}

/** Rótulo legível para os códigos do SISTEC; status desconhecido aparece como veio. */
export const rotuloStatus = (status: StatusMatricula): string => ROTULOS[status as StatusConhecido] ?? status
