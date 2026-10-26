import { rotuloStatus, type Censo, type StatusConhecido } from '@/modules/censo'
import type { Indicador } from './indicador'

function porStatus(status: StatusConhecido, descricao: string): Indicador {
  return {
    id: `status-${status}`,
    titulo: rotuloStatus(status),
    grupo: 'situacao-matricula',
    descricao,
    calcular: (c: Censo) => c.matriculas.filter((m) => m.status === status).length,
    base: (c: Censo) => c.matriculas.length,
  }
}

export const situacaoMatricula: Indicador[] = [
  porStatus('EM_CURSO', 'Alunos com matrícula ativa.'),
  porStatus('CONCLUÍDA', 'Alunos que concluíram o curso.'),
  porStatus('INTEGRALIZADA', 'Alunos que integralizaram as disciplinas, mas ainda não concluíram (ex.: falta estágio ou TCC).'),
  porStatus('ABANDONO', 'Alunos que deixaram de frequentar sem formalizar a saída (evasão).'),
  porStatus('DESLIGADO', 'Alunos desligados da instituição.'),
  porStatus('TRANSF_EXT', 'Alunos transferidos para outra instituição.'),
]
