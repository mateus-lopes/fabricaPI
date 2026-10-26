<script setup lang="ts">
/**
 * Único ponto do sistema que conhece o ECharts. Os módulos montam a configuração (option)
 * e este componente desenha; trocar de biblioteca de gráficos significa reescrever só este arquivo.
 */
import { BarChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, ToolboxComponent, TooltipComponent } from 'echarts/components'
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import VChart from 'vue-echarts'

use([BarChart, PieChart, GridComponent, LegendComponent, TooltipComponent, ToolboxComponent, CanvasRenderer])

defineProps<{
  /** Configuração no formato do ECharts (https://echarts.apache.org/en/option.html). */
  opcoes: Record<string, unknown>
  altura?: number
  /** Descrição para leitores de tela; os números completos ficam na tabela ao lado. */
  descricao: string
}>()
</script>

<template>
  <div role="img" :aria-label="descricao" :style="{ height: `${altura ?? 360}px` }">
    <VChart :option="opcoes" autoresize />
  </div>
</template>
