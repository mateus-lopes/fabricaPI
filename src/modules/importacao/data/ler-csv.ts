import Papa from 'papaparse'
import type { Tabela } from '../domain/tabela'

/**
 * As exportações do SISTEC/SIGAA vêm ora em UTF-8, ora em Latin-1 (Windows-1252).
 * Tenta UTF-8 estrito; se algum byte for inválido, o arquivo é Latin-1.
 */
export function decodificar(bytes: ArrayBuffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true, ignoreBOM: false }).decode(bytes)
  } catch {
    return new TextDecoder('windows-1252').decode(bytes)
  }
}

export function lerTexto(texto: string): Tabela {
  const r = Papa.parse<Record<string, string>>(texto, {
    header: true,
    skipEmptyLines: 'greedy',
    delimitersToGuess: [';', ',', '\t'],
    transformHeader: (h) => h.trim(),
  })
  return { colunas: r.meta.fields ?? [], linhas: r.data }
}

/** Lido inteiramente no navegador: o arquivo nunca é enviado a servidor algum. */
export async function lerCsv(arquivo: Blob): Promise<Tabela> {
  return lerTexto(decodificar(await arquivo.arrayBuffer()))
}
