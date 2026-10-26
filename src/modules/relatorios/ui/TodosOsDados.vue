<script setup lang="ts">
import { computed, ref } from 'vue'
import { rotuloStatus, type Censo } from '@/modules/censo'
import { formatarNumero } from '@/shared/lib/formatar'
import { aplicarFiltros, opcoes, SEM_FILTROS, type Filtros } from '../domain/filtros'

const props = defineProps<{ censo: Censo }>()

const LIMITE_LINHAS = 200

const filtros = ref<Filtros>({ ...SEM_FILTROS })
const filtrados = computed(() => aplicarFiltros(props.censo.matriculas, filtros.value))

const seletores: { campo: keyof Filtros; rotulo: string; formatar?: (v: string) => string }[] = [
  { campo: 'ciclo', rotulo: 'Ciclo de matrícula' },
  { campo: 'curso', rotulo: 'Curso' },
  { campo: 'status', rotulo: 'Situação', formatar: rotuloStatus },
  { campo: 'municipio', rotulo: 'Município' },
]
</script>

<template>
  <div class="filtros">
    <label v-for="s in seletores" :key="s.campo" class="campo">
      {{ s.rotulo }}
      <select v-model="filtros[s.campo]">
        <option value="">Todos</option>
        <option v-for="v in opcoes(censo.matriculas, s.campo)" :key="v" :value="v">{{ s.formatar?.(v) ?? v }}</option>
      </select>
    </label>
    <button class="botao botao--secundario limpar" @click="filtros = { ...SEM_FILTROS }">Limpar filtros</button>
  </div>

  <p class="resumo numero">
    {{ formatarNumero(filtrados.length) }} matrículas
    <template v-if="filtrados.length > LIMITE_LINHAS">· exibindo as primeiras {{ LIMITE_LINHAS }}</template>
  </p>

  <div class="tabela-rolagem">
    <table>
      <thead>
        <tr>
          <th>Matrícula</th>
          <th>Aluno</th>
          <th>Curso</th>
          <th>Ciclo</th>
          <th>Município</th>
          <th>Situação</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="m in filtrados.slice(0, LIMITE_LINHAS)" :key="m.codigo">
          <td class="numero">{{ m.codigo }}</td>
          <td>{{ m.aluno }}</td>
          <td>{{ m.ciclo.curso }}</td>
          <td :title="m.ciclo.nome">{{ m.ciclo.ano }}</td>
          <td>{{ m.ciclo.municipio }}</td>
          <td>{{ rotuloStatus(m.status) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.filtros {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 0.75rem;
  align-items: end;
}

.filtros select {
  width: 100%;
}

.limpar {
  justify-content: center;
}

.resumo {
  color: var(--texto-secundario);
}
</style>
