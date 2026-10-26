import { z } from 'zod'
import { anoDoCiclo, dataIso, type Ciclo, type Matricula, type Trancamento } from '@/modules/censo'
import { repararStatus } from './reparos'

/**
 * Cada fonte de dados do censo é descrita aqui: de onde vem, que colunas exige e como vira entidade do domínio.
 * Para aceitar uma fonte nova, acrescente uma definição; o resto da importação não muda.
 */
export interface Fonte<T> {
  id: FonteId
  titulo: string
  sistema: 'SISTEC' | 'SIGAA'
  descricao: string
  obrigatoria: boolean
  /** Colunas exigidas, já na forma de chaveColuna(). */
  colunas: readonly string[]
  /** Recebe a linha com as chaves já canônicas. */
  mapear: (linha: Record<string, string>) => unknown
  esquema: z.ZodType<T>
}

export type FonteId = 'alunos' | 'ciclos' | 'trancados'

const texto = z.string().trim().min(1, 'vazio')

export const fonteAlunos: Fonte<Matricula> = {
  id: 'alunos',
  titulo: 'Alunos',
  sistema: 'SISTEC',
  descricao: 'Relatório de matrículas do SISTEC, com o status de cada aluno.',
  obrigatoria: true,
  colunas: ['CO_MATRICULA', 'NO_ALUNO', 'CO_CICLO_MATRICULA', 'NO_STATUS_MATRICULA'],
  mapear: (l) => ({
    codigo: l.CO_MATRICULA,
    aluno: l.NO_ALUNO,
    codigoCiclo: l.CO_CICLO_MATRICULA,
    status: repararStatus(l.NO_STATUS_MATRICULA ?? ''),
  }),
  esquema: z.object({ codigo: texto, aluno: texto, codigoCiclo: texto, status: texto }),
}

export const fonteCiclos: Fonte<Ciclo> = {
  id: 'ciclos',
  titulo: 'Ciclos de matrícula',
  sistema: 'SISTEC',
  descricao: 'Relatório de ciclos do SISTEC: cada turma de cada curso.',
  obrigatoria: true,
  colunas: ['CODIGO CICLO DE MATRICULA', 'CICLO DE MATRICULA', 'NOME DO CURSO', 'MUNICIPIO'],
  mapear: (l) => ({
    codigo: l['CODIGO CICLO DE MATRICULA'],
    nome: l['CICLO DE MATRICULA'],
    curso: l['NOME DO CURSO'],
    municipio: l.MUNICIPIO,
    ano: anoDoCiclo(l['CICLO DE MATRICULA'] ?? ''),
    fimPrevisto: dataIso(l['DATA FIM PREVISTO DO CURSO'] ?? ''),
  }),
  esquema: z.object({
    codigo: texto,
    nome: texto,
    curso: texto,
    municipio: texto,
    ano: z.string().nullable(),
    fimPrevisto: z.string().nullable(),
  }),
}

export const fonteTrancados: Fonte<Trancamento> = {
  id: 'trancados',
  titulo: 'Trancados',
  sistema: 'SIGAA',
  descricao: 'Planilha do SIGAA com os alunos de matrícula trancada. Opcional: habilita a coluna "frequentando".',
  obrigatoria: false,
  colunas: ['MATRICULA', 'CURSO'],
  mapear: (l) => ({
    matricula: l.MATRICULA,
    curso: l.CURSO?.trim().toUpperCase(),
    ano: l.MATRICULA?.trim().slice(0, 4),
  }),
  esquema: z.object({ matricula: texto, curso: texto, ano: z.string().regex(/^\d{4}$/, 'matrícula sem ano') }),
}

export const FONTES = [fonteAlunos, fonteCiclos, fonteTrancados] as const
