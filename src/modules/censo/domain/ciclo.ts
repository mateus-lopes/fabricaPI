/** Primeiro ano (4 dígitos) que aparece no nome do ciclo: "... - FEV. 2020 / DEZ. 2022" → "2020". */
export function anoDoCiclo(nome: string): string | null {
  return nome.match(/\b\d{4}\b/)?.[0] ?? null
}

/**
 * Rótulo curto para eixos de gráfico: tira a modalidade do meio.
 * "REDES - EDUCAÇÃO PRESENCIAL - FEV. 2020 / DEZ. 2022" → "REDES · FEV. 2020 / DEZ. 2022"
 */
export function rotuloCurto(nome: string): string {
  const partes = nome.split(' - ')
  if (partes.length < 3) return nome
  return `${partes[0]} · ${partes[partes.length - 1]}`
}

/** "31/12/2022 00:00" (formato do SISTEC) → "2022-12-31". Devolve null se não reconhecer. */
export function dataIso(valor: string): string | null {
  const m = valor.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})/)
  return m ? `${m[3]}-${m[2]}-${m[1]}` : null
}
