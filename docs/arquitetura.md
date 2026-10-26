# Arquitetura

Registro das decisões de arquitetura e do porquê de cada uma. Serve à Fábrica de Software (quem for manter) e à
monografia (fase de Desenvolvimento da DSR).

## Monolito modular

Um único deploy, dividido em módulos com fronteiras explícitas. Cada módulo expõe uma API pública em `index.ts`;
importar o interior de outro módulo é proibido.

```
          app (composition root)
         /        |          \
 relatorios → indicadores → censo ← importacao
        \__________________________/
                 shared
```

| Módulo | Responsabilidade | Depende de |
|---|---|---|
| `censo` | Núcleo do domínio: entidades, consolidação, tabela de status, ciclos críticos | nada |
| `importacao` | Ler CSV, validar colunas, converter linhas em entidades, guardar a sessão | `censo` |
| `indicadores` | Catálogo de indicadores calculados sobre o censo | `censo` |
| `relatorios` | Telas: gráfico, tabela por ciclo, ciclos críticos, dados filtráveis | `censo`, `indicadores`, `importacao` |
| `shared` | Componentes genéricos sem conhecimento do domínio | nada |

Dentro de cada módulo:

- `domain/`: TypeScript puro, sem Vue, Pinia nem ECharts. É onde estão as regras e os testes.
- `data/`: acesso a coisas externas (ler arquivo, decodificar).
- `ui/`: componentes Vue e estado (Pinia).

### As fronteiras são verificadas, não só combinadas

`.dependency-cruiser.cjs` transforma as regras acima em verificações que rodam no CI (`npm run lint:deps`).
Uma violação quebra o build e impede o deploy. Regras:

- `domain-sem-camadas`, `domain-sem-frameworks`: o domínio não conhece UI, dados nem frameworks.
- `modulos-so-pelo-index`: entre módulos, só pela API pública.
- `censo-e-o-nucleo`: o núcleo não depende de nenhum outro módulo.
- `echarts-so-no-grafico`: só `shared/ui/Grafico.vue` conhece a biblioteca de gráficos.
- `papaparse-so-em-data`: só a camada `data` da importação sabe ler CSV.
- `shared-nao-conhece-modulos`, `ninguem-importa-o-app`, `sem-ciclos`.

## Pontos de extensão (aberto/fechado)

| Para… | Mexa em… | Não precisa mexer em… |
|---|---|---|
| Novo indicador | um objeto que implementa `Indicador`, adicionado em `indicadores/domain/catalogo.ts` | telas, importação |
| Nova fonte de dados (ex.: outra planilha do SIGAA) | uma definição `Fonte` em `importacao/domain/fontes.ts` | leitura de CSV, validação |
| Trocar a biblioteca de gráficos | `shared/ui/Grafico.vue` | os módulos (montam só a configuração) |
| Persistência ou login no futuro | um novo módulo + Worker/D1 | o domínio |

## Processamento no navegador

**Decisão:** não há backend. Os CSVs são lidos e processados no navegador; o Cloudflare só serve arquivos estáticos.

**Por quê:** as planilhas têm dados pessoais de alunos (LGPD). Sem servidor, não existe onde vazar, nem custo nem
manutenção de infraestrutura. Consequência aceita: não há histórico entre sessões. Se for preciso comparar censos de
anos diferentes, isso entra como um módulo novo.

**Minimização de dados:** CPF e data de nascimento são lidos do arquivo, mas descartados na conversão para o domínio:
o censo não precisa deles.

## Regras de negócio, e o que mudou em relação ao Streamlit

| Regra | Streamlit (fabricaPI) | Agora |
|---|---|---|
| Ciclo crítico | indicador usava `EM_CURSO < 2`, listagem usava `< 3` | um critério só: `LIMITE_CICLO_CRITICO = 3` |
| Quais ciclos podem ser críticos | todos, então toda turma formada (0 em curso) contava | só ciclos **em andamento** na data de referência |
| Listagem de críticos | devolvia só o primeiro ciclo encontrado | devolve todos |
| Matrícula sem ciclo correspondente | sumia no `merge` (inner join) | aparece num aviso com os códigos |
| Linhas inválidas | quebravam ou sumiam | ignoradas com aviso por linha e motivo |
| Status `INTEGRALIZADA` | código esperava `INTEGRALIZADO`, mas a lista comentada no próprio código usava `INTEGRALIZADA` | `INTEGRALIZADA`. **Confirmar com uma exportação real**; status desconhecido é contado do mesmo jeito |
| Acento quebrado (`CONCLU�DA`) | corrigido só para esse valor | reparo genérico contra a lista de status |
| Codificação | sempre Latin-1 | UTF-8 estrito, com fallback para Latin-1 |

Essas diferenças são achados do estado *As-Is* e fazem parte da avaliação do artefato.

## Testes

- `censo/domain/censo.test.ts`: regras do domínio.
- `importacao/importacao.test.ts`: decodificação, validação e um teste ponta a ponta com os CSVs fictícios,
  que verifica que nenhum aluno se perde: todo registro entra no relatório ou é apontado como sem ciclo.
- `indicadores/indicadores.test.ts`, `relatorios/domain/filtros.test.ts`.

## Visualização

Gráfico de barras horizontais empilhadas (situação por ciclo), sempre acompanhado da tabela com os mesmos números.
A paleta categórica dos status tem ordem fixa e foi validada para daltonismo. A cor segue o status, então filtrar
não repinta nada. O ECharts (~600 kB) fica num chunk carregado só quando o relatório é aberto.
