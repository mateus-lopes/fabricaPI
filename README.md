# Censo Interno IFC

Aplicação web que automatiza o Censo Interno do Instituto Federal Catarinense: recebe as planilhas exportadas do
SISTEC e do SIGAA, valida, consolida e gera os indicadores de desempenho educacional (situação das matrículas,
evasão, ciclos críticos).

Artefato do TCC *Automação de Processos e Análise de Indicadores de Desempenho Educacional* (Design Science Research),
desenvolvido na Fábrica de Software do IFC *Campus* Araquari. Sucessor do protótipo em Streamlit
([fabricaPI](https://github.com/fabricadesoftware-ifc/fabricaPI)).

## Privacidade

As planilhas têm dados pessoais (nome, CPF, data de nascimento). **Todo o processamento acontece no navegador**:
os arquivos nunca são enviados a servidor algum, e nada é gravado (fechar a aba apaga tudo). O site publicado é só
HTML/JS estático.

- Nunca versione exportações reais. A pasta `dados-reais/` está no `.gitignore` para uso local.
- Os arquivos em `public/exemplos/` são **fictícios**, gerados por `npm run dados:exemplo`.

## Comandos

| Comando | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento |
| `npm test` | Testes (Vitest) |
| `npm run typecheck` | Checagem de tipos (vue-tsc) |
| `npm run lint:deps` | Verifica as fronteiras entre módulos (dependency-cruiser) |
| `npm run ci` | Os três acima, como no CI |
| `npm run build` | Build de produção em `dist/` |
| `npm run deploy` | Build + publicação no Cloudflare (`wrangler deploy`) |
| `npm run dados:exemplo` | Regera os CSVs fictícios de `public/exemplos/` |

## Arquitetura

Monolito modular: ver [docs/arquitetura.md](docs/arquitetura.md).

```
src/
  app/            composition root: rotas, layout no padrão do portal IFC, estilos globais
  modules/
    censo/        núcleo do domínio (TS puro): ciclos, matrículas, tabela de status, ciclos críticos
    importacao/   leitura dos CSVs, validação de colunas, conversão para o domínio, estado da sessão
    indicadores/  catálogo extensível de indicadores
    relatorios/   telas de análise: gráfico, tabelas, filtros
  shared/         componentes genéricos (Caixa, Grafico) e formatação
scripts/          gerador de dados fictícios
```
