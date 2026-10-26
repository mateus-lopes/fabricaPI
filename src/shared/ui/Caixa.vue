<script setup lang="ts">
/** Caixa no estilo do portal do IFC: borda superior cinza e faixa de título. */
defineProps<{ titulo?: string }>()
</script>

<template>
  <section class="caixa">
    <header v-if="titulo || $slots.acoes" class="caixa__titulo">
      <h3>{{ titulo }}</h3>
      <slot name="acoes" />
    </header>
    <div class="caixa__corpo">
      <slot />
    </div>
  </section>
</template>

<style scoped>
.caixa {
  border-top: 3px solid var(--cinza-borda-caixa);
  margin-bottom: 1.5rem;
  min-width: 0;
}

.caixa__titulo {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  background: var(--cinza-caixa);
  padding: 0.7rem 0.8rem;
}

.caixa__titulo h3 {
  margin: 0;
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--verde-titulo);
}

.caixa__corpo {
  padding: 0.8rem 0;
}
</style>
