import { describe, expect, it } from 'vitest'
import type { MatriculaNoCiclo } from '@/modules/censo'
import { aplicarFiltros, opcoes, SEM_FILTROS } from './filtros'

const m = (codigo: string, curso: string, status: string, municipio = 'ARAQUARI'): MatriculaNoCiclo => ({
  codigo,
  aluno: 'X',
  codigoCiclo: curso,
  status,
  ciclo: { codigo: curso, nome: `${curso} 2024`, curso, municipio, ano: '2024', fimPrevisto: null },
})

const lista = [m('1', 'REDES', 'EM_CURSO'), m('2', 'REDES', 'ABANDONO'), m('3', 'AGRONOMIA', 'EM_CURSO', 'BLUMENAU')]

describe('filtros', () => {
  it('sem filtro devolve tudo', () => {
    expect(aplicarFiltros(lista, SEM_FILTROS)).toHaveLength(3)
  })

  it('combina filtros com E', () => {
    const r = aplicarFiltros(lista, { ...SEM_FILTROS, curso: 'REDES', status: 'EM_CURSO' })
    expect(r.map((x) => x.codigo)).toEqual(['1'])
  })

  it('lista as opções distintas em ordem alfabética', () => {
    expect(opcoes(lista, 'curso')).toEqual(['AGRONOMIA', 'REDES'])
    expect(opcoes(lista, 'municipio')).toEqual(['ARAQUARI', 'BLUMENAU'])
  })
})
