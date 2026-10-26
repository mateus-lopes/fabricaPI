const inteiro = new Intl.NumberFormat('pt-BR')
const porcentagem = new Intl.NumberFormat('pt-BR', { style: 'percent', maximumFractionDigits: 1 })

export const formatarNumero = (n: number) => inteiro.format(n)
export const formatarPorcentagem = (fracao: number) => porcentagem.format(fracao)
