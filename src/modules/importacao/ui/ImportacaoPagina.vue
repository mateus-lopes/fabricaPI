<script setup lang="ts">
import { ref } from 'vue'
import Caixa from '@/shared/ui/Caixa.vue'
import { formatarNumero } from '@/shared/lib/formatar'
import { FONTES } from '../domain/fontes'
import { useDadosStore } from './store'

const dados = useDadosStore()
const carregandoExemplos = ref(false)
const erroExemplos = ref<string | null>(null)

async function aoEscolher(fonte: (typeof FONTES)[number], evento: Event) {
  const input = evento.target as HTMLInputElement
  const arquivos = [...(input.files ?? [])].map((f) => ({ nome: f.name, conteudo: f }))
  await dados.carregar(fonte, arquivos)
  input.value = ''
}

async function usarExemplos() {
  carregandoExemplos.value = true
  erroExemplos.value = null
  try {
    await dados.carregarExemplos()
  } catch (e) {
    erroExemplos.value = e instanceof Error ? e.message : String(e)
  } finally {
    carregandoExemplos.value = false
  }
}
</script>

<template>
  <h1>Carregar arquivos</h1>
  <p>
    Envie as planilhas exportadas do SISTEC e do SIGAA. Os arquivos são lidos <strong>apenas neste navegador</strong>:
    nada é enviado para servidor algum, e tudo é apagado ao fechar ou recarregar a página.
  </p>

  <div class="acoes-topo">
    <button class="botao botao--secundario" :disabled="carregandoExemplos" @click="usarExemplos">
      {{ carregandoExemplos ? 'Carregando…' : 'Usar dados de exemplo (fictícios)' }}
    </button>
    <RouterLink v-if="dados.censo" class="botao" to="/relatorio">Ver relatório →</RouterLink>
  </div>
  <p v-if="erroExemplos" class="aviso aviso--erro">{{ erroExemplos }}</p>

  <div class="fontes">
    <Caixa v-for="fonte in FONTES" :key="fonte.id" :titulo="`${fonte.titulo} · ${fonte.sistema}`">
      <p class="descricao">
        {{ fonte.descricao }}
        <em v-if="!fonte.obrigatoria">(opcional)</em>
      </p>

      <label class="botao botao--secundario seletor">
        Escolher arquivos CSV
        <input type="file" accept=".csv,text/csv" multiple @change="aoEscolher(fonte, $event)" />
      </label>

      <ul class="arquivos">
        <li v-for="arq in dados.arquivos[fonte.id]" :key="arq.nome">
          <div class="arquivo">
            <span class="arquivo__nome">{{ arq.nome }}</span>
            <span v-if="arq.erros.length === 0" class="numero">{{ formatarNumero(arq.registros.length) }} registros</span>
            <button class="remover" :aria-label="`Remover ${arq.nome}`" @click="dados.remover(fonte.id, arq.nome)">✕</button>
          </div>
          <p v-for="erro in arq.erros" :key="erro" class="aviso aviso--erro">{{ erro }}</p>
          <details v-if="arq.avisos.length" class="aviso aviso--alerta">
            <summary>Algumas linhas foram ignoradas</summary>
            <ul>
              <li v-for="aviso in arq.avisos" :key="aviso">{{ aviso }}</li>
            </ul>
          </details>
        </li>
      </ul>
    </Caixa>
  </div>
</template>

<style scoped>
.acoes-topo {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin: 1rem 0 1.5rem;
}

.fontes {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 0 1.5rem;
}

.descricao {
  margin-top: 0;
  color: var(--texto-secundario);
}

.seletor input {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
}

.seletor:focus-within {
  outline: 2px solid var(--link);
  outline-offset: 2px;
}

.arquivos {
  list-style: none;
  padding: 0;
  margin: 0.75rem 0 0;
}

.arquivo {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.35rem 0;
  border-bottom: 1px solid var(--cinza-linha);
}

.arquivo__nome {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.remover {
  border: none;
  background: none;
  color: var(--texto-suave);
  cursor: pointer;
  padding: 0.25rem 0.4rem;
}

.remover:hover {
  color: var(--erro);
}
</style>
