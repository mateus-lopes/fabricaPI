<script setup lang="ts">
import { computed, ref } from 'vue'
import { tabelaStatus } from '@/modules/censo'
import { useDadosStore } from '@/modules/importacao'
import { PainelIndicadores } from '@/modules/indicadores'
import { formatarNumero } from '@/shared/lib/formatar'
import Caixa from '@/shared/ui/Caixa.vue'
import CiclosCriticos from './CiclosCriticos.vue'
import SituacaoPorCiclo from './SituacaoPorCiclo.vue'
import TodosOsDados from './TodosOsDados.vue'

const dados = useDadosStore()
const linhas = computed(() => (dados.censo ? tabelaStatus(dados.censo) : []))

const ABAS = [
  { id: 'situacao', titulo: 'Situação por ciclo' },
  { id: 'criticos', titulo: 'Ciclos críticos' },
  { id: 'dados', titulo: 'Todos os dados' },
] as const
const aba = ref<(typeof ABAS)[number]['id']>('situacao')

const ciclosAusentes = computed(() => new Set(dados.censo?.matriculasSemCiclo.map((m) => m.codigoCiclo)))
</script>

<template>
  <h1>Relatório do Censo Interno</h1>

  <template v-if="!dados.censo">
    <p class="aviso aviso--alerta">Para gerar o relatório, carregue ao menos os arquivos de alunos e de ciclos do SISTEC.</p>
    <RouterLink class="botao" to="/">Carregar arquivos</RouterLink>
  </template>

  <template v-else>
    <p v-if="dados.censo.matriculasSemCiclo.length" class="aviso aviso--alerta">
      {{ formatarNumero(dados.censo.matriculasSemCiclo.length) }} matrículas apontam para
      {{ formatarNumero(ciclosAusentes.size) }} ciclo(s) que não estão no arquivo de ciclos e ficaram fora do relatório.
      Códigos: {{ [...ciclosAusentes].slice(0, 10).join(', ') }}<template v-if="ciclosAusentes.size > 10">…</template>
    </p>

    <Caixa titulo="Visão geral">
      <PainelIndicadores :censo="dados.censo" grupo="visao-geral" />
    </Caixa>

    <Caixa titulo="Situação das matrículas">
      <PainelIndicadores :censo="dados.censo" grupo="situacao-matricula" />
    </Caixa>

    <div role="tablist" class="abas">
      <button
        v-for="a in ABAS"
        :key="a.id"
        role="tab"
        :aria-selected="aba === a.id"
        class="aba"
        @click="aba = a.id"
      >
        {{ a.titulo }}
      </button>
    </div>

    <div role="tabpanel" class="painel-aba">
      <SituacaoPorCiclo v-if="aba === 'situacao'" :linhas="linhas" />
      <CiclosCriticos v-else-if="aba === 'criticos'" :censo="dados.censo" />
      <TodosOsDados v-else :censo="dados.censo" />
    </div>
  </template>
</template>

<style scoped>
.abas {
  display: flex;
  flex-wrap: wrap;
  border-bottom: 3px solid var(--verde-escuro);
}

.aba {
  font: inherit;
  font-weight: 600;
  padding: 0.6rem 1rem;
  border: none;
  background: var(--cinza-caixa);
  color: var(--verde-titulo);
  cursor: pointer;
  margin-right: 2px;
}

.aba[aria-selected='true'] {
  background: var(--verde-escuro);
  color: #fff;
}

.painel-aba {
  padding: 1rem 0 2rem;
}
</style>
