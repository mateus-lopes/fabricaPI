import type { Indicador } from './indicador'
import { situacaoMatricula } from './situacao-matricula'
import { visaoGeral } from './visao-geral'

/** Todos os indicadores exibidos no relatório, na ordem de exibição. */
export const CATALOGO: readonly Indicador[] = [...visaoGeral, ...situacaoMatricula]
