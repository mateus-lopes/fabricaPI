<script setup lang="ts">
import { computed, ref } from 'vue'
import { ciclosCriticos, contar, LIMITE_CICLO_CRITICO, rotuloStatus, type Censo } from '@/modules/censo'
import { formatarNumero } from '@/shared/lib/formatar'

const props = defineProps<{ censo: Censo }>()

const somenteEmCurso = ref(true)
const criticos = computed(() => ciclosCriticos(props.censo))

function alunosDo(codigoCiclo: string) {
  return props.censo.matriculas.filter(
    (m) => m.ciclo.codigo === codigoCiclo && (!somenteEmCurso.value || m.status === 'EM_CURSO'),
  )
}
</script>

<template>
  <p class="aviso aviso--info">
    Um ciclo é crítico quando está em andamento e tem menos de {{ LIMITE_CICLO_CRITICO }} alunos em curso.
  </p>

  <p v-if="criticos.length === 0" class="aviso aviso--sucesso">✓ Nenhum ciclo crítico encontrado.</p>

  <template v-else>
    <label class="alternar">
      <input v-model="somenteEmCurso" type="checkbox" />
      Listar somente os alunos em curso
    </label>

    <details v-for="l in criticos" :key="l.ciclo.codigo" class="ciclo">
      <summary>
        <span class="ciclo__nome">{{ l.ciclo.nome }}</span>
        <span class="numero">{{ formatarNumero(contar(l, 'EM_CURSO')) }} em curso de {{ formatarNumero(l.total) }}</span>
      </summary>
      <p v-if="alunosDo(l.ciclo.codigo).length === 0" class="vazio">Nenhum aluno em curso neste ciclo.</p>
      <div v-else class="tabela-rolagem">
        <table>
          <thead>
            <tr>
              <th>Matrícula</th>
              <th>Aluno</th>
              <th>Situação</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="m in alunosDo(l.ciclo.codigo)" :key="m.codigo">
              <td class="numero">{{ m.codigo }}</td>
              <td>{{ m.aluno }}</td>
              <td>{{ rotuloStatus(m.status) }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </details>
  </template>
</template>

<style scoped>
.alternar {
  display: inline-flex;
  gap: 0.4rem;
  align-items: center;
  margin: 0.5rem 0 1rem;
}

.ciclo {
  border-bottom: 1px solid var(--cinza-linha);
}

.ciclo summary {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  gap: 0.5rem;
  padding: 0.6rem 0;
  cursor: pointer;
}

.vazio {
  color: var(--texto-secundario);
  margin: 0 0 0.75rem;
}

.ciclo__nome {
  font-weight: 600;
  color: var(--verde-titulo);
}
</style>
