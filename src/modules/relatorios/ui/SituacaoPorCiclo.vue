<script setup lang="ts">
import { computed, onBeforeUnmount, ref } from 'vue'
import { contar, rotuloCurto, rotuloStatus, STATUS_MATRICULA, type LinhaStatus } from '@/modules/censo'
import { formatarNumero } from '@/shared/lib/formatar'
import Grafico from '@/shared/ui/Grafico.vue'
import { corStatus } from './cores'

const props = defineProps<{ linhas: LinhaStatus[] }>()

/** Status conhecidos que aparecem nos dados, na ordem fixa, seguidos dos desconhecidos. */
const colunas = computed(() => {
  const presentes = new Set(props.linhas.flatMap((l) => [...l.porStatus.keys()]))
  const conhecidos = STATUS_MATRICULA.filter((s) => presentes.has(s))
  const outros = [...presentes].filter((s) => !(STATUS_MATRICULA as readonly string[]).includes(s)).sort()
  return [...conhecidos, ...outros]
})

const temTrancados = computed(() => props.linhas.some((l) => l.trancados !== undefined))

// Em tela estreita, o rótulo do ciclo não pode ocupar metade da largura do gráfico.
const estreita = window.matchMedia('(max-width: 600px)')
const telaEstreita = ref(estreita.matches)
const aoMudar = (e: MediaQueryListEvent) => (telaEstreita.value = e.matches)
estreita.addEventListener('change', aoMudar)
onBeforeUnmount(() => estreita.removeEventListener('change', aoMudar))

const TINTA = { primaria: '#1c1c1c', secundaria: '#555', suave: '#898781', grade: '#e2e2e2' }

const opcoes = computed(() => ({
  textStyle: { fontFamily: 'Open Sans, sans-serif', color: TINTA.secundaria },
  tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
  legend: { top: 0, left: 0, icon: 'roundRect', itemWidth: 12, itemHeight: 12, textStyle: { color: TINTA.primaria } },
  toolbox: { right: 0, feature: { saveAsImage: { title: 'Salvar imagem', name: 'situacao-por-ciclo' } } },
  grid: { top: 40, left: 8, right: 16, bottom: 8, containLabel: true },
  xAxis: {
    type: 'value',
    minInterval: 1,
    axisLabel: { color: TINTA.suave },
    splitLine: { lineStyle: { color: TINTA.grade } },
  },
  yAxis: {
    type: 'category',
    inverse: true,
    data: props.linhas.map((l) => rotuloCurto(l.ciclo.nome)),
    axisTick: { show: false },
    axisLine: { lineStyle: { color: TINTA.grade } },
    axisLabel: { color: TINTA.secundaria, width: telaEstreita.value ? 110 : 260, overflow: 'truncate' },
  },
  series: colunas.value.map((status) => ({
    name: rotuloStatus(status),
    type: 'bar',
    stack: 'total',
    barMaxWidth: 18,
    // Borda branca = espaço de 1px entre os segmentos empilhados.
    itemStyle: { color: corStatus(status), borderColor: '#fff', borderWidth: 1 },
    emphasis: { focus: 'series' },
    data: props.linhas.map((l) => contar(l, status)),
  })),
}))

const altura = computed(() => 70 + props.linhas.length * 26)
</script>

<template>
  <Grafico
    :opcoes="opcoes"
    :altura="altura"
    descricao="Gráfico de barras empilhadas com a quantidade de alunos por situação de matrícula em cada ciclo. Os mesmos números estão na tabela abaixo."
  />

  <div class="tabela-rolagem">
    <table>
      <thead>
        <tr>
          <th>Ciclo de matrícula</th>
          <th v-for="s in colunas" :key="s" class="numero">{{ rotuloStatus(s) }}</th>
          <template v-if="temTrancados">
            <th class="numero">Trancados</th>
            <th class="numero">Frequentando</th>
          </template>
          <th class="numero">Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="l in linhas" :key="l.ciclo.codigo">
          <td :title="l.ciclo.nome">{{ rotuloCurto(l.ciclo.nome) }}</td>
          <td v-for="s in colunas" :key="s" class="numero">{{ formatarNumero(contar(l, s)) }}</td>
          <template v-if="temTrancados">
            <td class="numero">{{ formatarNumero(l.trancados ?? 0) }}</td>
            <td class="numero">{{ formatarNumero(l.frequentando ?? 0) }}</td>
          </template>
          <td class="numero"><strong>{{ formatarNumero(l.total) }}</strong></td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
