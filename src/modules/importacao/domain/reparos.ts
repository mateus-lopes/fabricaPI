import { STATUS_MATRICULA } from '@/modules/censo'

const SUBSTITUICAO = '�'

/**
 * Algumas exportações chegam com o acento já destruído ("CONCLU�DA"): o caractere original se perdeu
 * no arquivo, não na leitura. Se o valor bate com um status conhecido trocando os acentos por �, devolve o status certo.
 */
export function repararStatus(valor: string): string {
  const v = valor.trim().toUpperCase()
  if (!v.includes(SUBSTITUICAO)) return v
  return STATUS_MATRICULA.find((s) => s.replace(/[^\x00-\x7F]/g, SUBSTITUICAO) === v) ?? v
}
