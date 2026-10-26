// API pública do módulo indicadores: catálogo extensível de indicadores do censo.
export { CATALOGO } from './domain/catalogo'
export { calcularTodos, type GrupoIndicador, type Indicador, type ValorIndicador } from './domain/indicador'
export { default as PainelIndicadores } from './ui/PainelIndicadores.vue'
