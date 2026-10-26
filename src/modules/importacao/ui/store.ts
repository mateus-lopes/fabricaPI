import { defineStore } from 'pinia'
import { computed, shallowRef } from 'vue'
import { consolidar, type Censo, type Ciclo, type Matricula, type Trancamento } from '@/modules/censo'
import { lerCsv } from '../data/ler-csv'
import { fonteAlunos, fonteCiclos, fonteTrancados, type Fonte, type FonteId } from '../domain/fontes'
import { importar } from '../domain/importar'

export interface ArquivoCarregado {
  nome: string
  registros: unknown[]
  erros: string[]
  avisos: string[]
}

/**
 * Dados carregados nesta sessão. Ficam só na memória da aba: fechar ou recarregar a página apaga tudo,
 * o que é intencional (são dados pessoais de alunos).
 */
const hojeIso = () => new Date().toLocaleDateString('sv-SE') // AAAA-MM-DD no fuso local

export const useDadosStore = defineStore('dados', () => {
  const arquivos = shallowRef<Record<FonteId, ArquivoCarregado[]>>({ alunos: [], ciclos: [], trancados: [] })

  async function carregar(fonte: Fonte<unknown>, lista: { nome: string; conteudo: Blob }[]) {
    for (const { nome, conteudo } of lista) {
      const resultado = importar(fonte, await lerCsv(conteudo))
      const outros = arquivos.value[fonte.id].filter((a) => a.nome !== nome)
      arquivos.value = { ...arquivos.value, [fonte.id]: [...outros, { nome, ...resultado }] }
    }
  }

  function remover(fonte: FonteId, nome: string) {
    arquivos.value = { ...arquivos.value, [fonte]: arquivos.value[fonte].filter((a) => a.nome !== nome) }
  }

  function limpar() {
    arquivos.value = { alunos: [], ciclos: [], trancados: [] }
  }

  /** Dados sintéticos gerados por scripts/gerar-dados-sinteticos.ts, para demonstração. */
  async function carregarExemplos() {
    const baixar = async (arquivo: string) => {
      const r = await fetch(`${import.meta.env.BASE_URL}exemplos/${arquivo}`)
      if (!r.ok) throw new Error(`Não foi possível baixar ${arquivo}`)
      return [{ nome: arquivo, conteudo: await r.blob() }]
    }
    limpar()
    await carregar(fonteAlunos, await baixar('sistec-alunos.csv'))
    await carregar(fonteCiclos, await baixar('sistec-ciclos.csv'))
    await carregar(fonteTrancados, await baixar('sigaa-trancados.csv'))
  }

  const registros = <T>(fonte: FonteId) =>
    arquivos.value[fonte].filter((a) => a.erros.length === 0).flatMap((a) => a.registros as T[])

  /** Censo consolidado; null enquanto faltar alguma fonte obrigatória. */
  const censo = computed<Censo | null>(() => {
    const ciclos = registros<Ciclo>('ciclos')
    const matriculas = registros<Matricula>('alunos')
    if (ciclos.length === 0 || matriculas.length === 0) return null
    return consolidar(hojeIso(), ciclos, matriculas, registros<Trancamento>('trancados'))
  })

  return { arquivos, censo, carregar, remover, limpar, carregarExemplos }
})
