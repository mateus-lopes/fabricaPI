<script setup lang="ts">
import { computed } from 'vue'
import type { Censo } from '@/modules/censo'
import { formatarNumero, formatarPorcentagem } from '@/shared/lib/formatar'
import { CATALOGO } from '../domain/catalogo'
import { calcularTodos, type GrupoIndicador } from '../domain/indicador'

const props = defineProps<{ censo: Censo; grupo: GrupoIndicador }>()

const valores = computed(() =>
  calcularTodos(
    CATALOGO.filter((i) => i.grupo === props.grupo),
    props.censo,
  ),
)
</script>

<template>
  <ul class="painel">
    <li v-for="{ indicador, valor, fracao } in valores" :key="indicador.id" class="cartao" :title="indicador.descricao">
      <span class="cartao__valor numero">{{ formatarNumero(valor) }}</span>
      <span class="cartao__titulo">{{ indicador.titulo }}</span>
      <span v-if="fracao !== null" class="cartao__fracao numero">{{ formatarPorcentagem(fracao) }} do total</span>
    </li>
  </ul>
</template>

<style scoped>
.painel {
  list-style: none;
  padding: 0;
  margin: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
}

.cartao {
  display: flex;
  flex-direction: column;
  padding: 0.8rem 0.9rem;
  background: var(--cinza-caixa);
  border-top: 3px solid var(--verde-escuro);
}

.cartao__valor {
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--texto);
  line-height: 1.1;
}

.cartao__titulo {
  color: var(--verde-titulo);
  font-weight: 600;
}

.cartao__fracao {
  color: var(--texto-secundario);
  font-size: 0.85rem;
}
</style>
