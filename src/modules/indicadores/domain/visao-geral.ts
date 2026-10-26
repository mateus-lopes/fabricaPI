import { ciclosCriticos, ciclosEmAndamento, LIMITE_CICLO_CRITICO, tabelaStatus } from '@/modules/censo'
import type { Indicador } from './indicador'

const distintos = <T>(itens: T[]) => new Set(itens).size

export const visaoGeral: Indicador[] = [
  {
    id: 'total-alunos',
    titulo: 'Alunos',
    grupo: 'visao-geral',
    descricao: 'Matrículas do SISTEC ligadas a um ciclo do arquivo de ciclos.',
    calcular: (c) => c.matriculas.length,
  },
  {
    id: 'total-ciclos',
    titulo: 'Ciclos com alunos',
    grupo: 'visao-geral',
    descricao: 'Ciclos de matrícula que têm ao menos um aluno.',
    calcular: (c) => tabelaStatus(c).length,
  },
  {
    id: 'ciclos-em-andamento',
    titulo: 'Ciclos em andamento',
    grupo: 'visao-geral',
    descricao: 'Ciclos cujo término previsto ainda não passou, ou que ainda têm aluno em curso.',
    calcular: (c) => ciclosEmAndamento(c).length,
  },
  {
    id: 'ciclos-criticos',
    titulo: 'Ciclos críticos',
    grupo: 'visao-geral',
    descricao: `Ciclos em andamento com menos de ${LIMITE_CICLO_CRITICO} alunos em curso.`,
    calcular: (c) => ciclosCriticos(c).length,
    base: (c) => ciclosEmAndamento(c).length,
  },
  {
    id: 'total-cursos',
    titulo: 'Cursos',
    grupo: 'visao-geral',
    descricao: 'Cursos distintos entre os ciclos com alunos.',
    calcular: (c) => distintos(c.matriculas.map((m) => m.ciclo.curso)),
  },
  {
    id: 'total-municipios',
    titulo: 'Municípios',
    grupo: 'visao-geral',
    descricao: 'Municípios distintos onde os ciclos são ofertados.',
    calcular: (c) => distintos(c.matriculas.map((m) => m.ciclo.municipio)),
  },
]
