// API pública do módulo censo: o núcleo do domínio. Outros módulos só importam daqui.
export { rotuloStatus, STATUS_MATRICULA } from './domain/tipos'
export type {
  Censo,
  Ciclo,
  Matricula,
  MatriculaNoCiclo,
  StatusConhecido,
  StatusMatricula,
  Trancamento,
} from './domain/tipos'
export { anoDoCiclo, dataIso, rotuloCurto } from './domain/ciclo'
export { consolidar } from './domain/consolidar'
export { contar, tabelaStatus, type LinhaStatus } from './domain/tabela-status'
export { ciclosCriticos, ciclosEmAndamento, emAndamento, LIMITE_CICLO_CRITICO } from './domain/ciclos-criticos'
