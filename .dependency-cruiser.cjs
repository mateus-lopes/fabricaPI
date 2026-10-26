// Regras de arquitetura do monolito modular, verificadas no CI.
// Se alguém criar uma dependência proibida, o CI quebra e o deploy não acontece.
/** @type {import('dependency-cruiser').IConfiguration} */
module.exports = {
  forbidden: [
    {
      name: 'domain-sem-camadas',
      comment: 'O domain é o núcleo estável: não depende de data, ui nem do app.',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/domain/' },
      to: { path: '^src/(modules/[^/]+/(data|ui)|shared/ui|app)/' },
    },
    {
      name: 'domain-sem-frameworks',
      comment: 'O domain é TypeScript puro: sem Vue, Pinia, ECharts ou parser de CSV. Assim é testável e portável.',
      severity: 'error',
      from: { path: '^src/modules/[^/]+/domain/' },
      to: {
        dependencyTypes: ['npm', 'npm-dev'],
        path: 'node_modules/(vue|@vue|pinia|vue-router|echarts|vue-echarts|zrender|papaparse)/',
      },
    },
    {
      name: 'echarts-so-no-grafico',
      comment: 'Só o wrapper shared/ui/Grafico.vue conhece o ECharts. Trocar de biblioteca = mexer num arquivo.',
      severity: 'error',
      from: { path: '^src/', pathNot: '^src/shared/ui/Grafico\\.vue$' },
      to: { dependencyTypes: ['npm'], path: 'node_modules/(echarts|vue-echarts|zrender)/' },
    },
    {
      name: 'papaparse-so-em-data',
      comment: 'Só a camada data da importação sabe ler CSV.',
      severity: 'error',
      from: { path: '^src/', pathNot: '^src/modules/importacao/data/' },
      to: { dependencyTypes: ['npm'], path: 'node_modules/papaparse/' },
    },
    {
      name: 'modulos-so-pelo-index',
      comment: 'Entre módulos, só pela API pública (index.ts). Detalhe interno de outro módulo é proibido.',
      severity: 'error',
      from: { path: '^src/modules/([^/]+)/' },
      to: {
        path: '^src/modules/',
        pathNot: ['^src/modules/$1/', '^src/modules/[^/]+/index\\.ts$'],
      },
    },
    {
      name: 'censo-e-o-nucleo',
      comment: 'censo é o núcleo do domínio: não depende de nenhum outro módulo.',
      severity: 'error',
      from: { path: '^src/modules/censo/' },
      to: { path: '^src/modules/(?!censo/)' },
    },
    {
      name: 'shared-nao-conhece-modulos',
      comment: 'shared é genérico: não pode depender de módulo nem do app.',
      severity: 'error',
      from: { path: '^src/shared/' },
      to: { path: '^src/(modules|app)/' },
    },
    {
      name: 'ninguem-importa-o-app',
      comment: 'app/ é a borda (rotas, layout, bootstrap): ninguém depende dele.',
      severity: 'error',
      from: { path: '^src/(modules|shared)/' },
      to: { path: '^src/app/' },
    },
    {
      name: 'sem-ciclos',
      comment: 'Ciclo de dependência quase sempre indica responsabilidade no lugar errado.',
      severity: 'error',
      from: {},
      to: { circular: true },
    },
    {
      name: 'nao-resolvido',
      comment: 'Import que não resolve para nenhum arquivo.',
      severity: 'error',
      from: {},
      to: { couldNotResolve: true },
    },
  ],
  options: {
    doNotFollow: { path: 'node_modules' },
    tsConfig: { fileName: 'tsconfig.json' },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      extensions: ['.ts', '.vue', '.js'],
      conditionNames: ['import', 'module', 'browser', 'default', 'types'],
      exportsFields: ['exports'],
      mainFields: ['module', 'main', 'types'],
    },
    exclude: { path: '\\.test\\.ts$' },
  },
}
