import { STATUS_MATRICULA, type StatusConhecido, type StatusMatricula } from '@/modules/censo'

/**
 * Paleta categórica validada para daltonismo (scripts de validação da skill de dataviz), em ordem fixa.
 * A cor segue o status, nunca a posição: filtrar não repinta nada.
 */
const CORES: Record<StatusConhecido, string> = {
  EM_CURSO: '#2a78d6',
  INTEGRALIZADA: '#eb6834',
  CONCLUÍDA: '#1baf7a',
  ABANDONO: '#eda100',
  DESLIGADO: '#e87ba4',
  TRANSF_EXT: '#008300',
  TRANSF_INT: '#4a3aa7',
}

/** Status que o SISTEC venha a criar e ainda não está na lista. */
export const COR_OUTROS = '#898781'

export function corStatus(status: StatusMatricula): string {
  return (STATUS_MATRICULA as readonly string[]).includes(status) ? CORES[status as StatusConhecido] : COR_OUTROS
}
