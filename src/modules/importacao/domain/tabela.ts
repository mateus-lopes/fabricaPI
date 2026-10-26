/** Uma planilha já lida: cabeçalho e linhas como texto, sem interpretação. */
export interface Tabela {
  colunas: string[]
  linhas: Record<string, string>[]
}

/**
 * Forma canônica de um nome de coluna: sem acento, maiúscula e sem espaços nas pontas.
 * "Matrícula" e "MATRICULA " viram a mesma coluna; exportações diferentes do mesmo sistema variam nisso.
 */
export function chaveColuna(nome: string): string {
  return nome
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toUpperCase()
    .trim()
}
