import { describe, expect, it } from 'vitest'
import { consolidar } from '@/modules/censo'
import { CATALOGO } from './domain/catalogo'
import { calcularTodos } from './domain/indicador'

const censo = consolidar(
  '2026-10-25',
  [
    { codigo: '1', nome: 'A', curso: 'REDES', municipio: 'ARAQUARI', ano: '2025', fimPrevisto: '2027-12-31' },
    { codigo: '2', nome: 'B', curso: 'AGRONOMIA', municipio: 'SÃO FRANCISCO DO SUL', ano: '2020', fimPrevisto: '2024-12-31' },
  ],
  [
    { codigo: '1', aluno: 'X', codigoCiclo: '1', status: 'EM_CURSO' },
    { codigo: '2', aluno: 'Y', codigoCiclo: '1', status: 'ABANDONO' },
    { codigo: '3', aluno: 'Z', codigoCiclo: '2', status: 'CONCLUÍDA' },
    { codigo: '4', aluno: 'W', codigoCiclo: '2', status: 'CONCLUÍDA' },
  ],
)

const valor = (id: string) => calcularTodos(CATALOGO, censo).find((v) => v.indicador.id === id)!

describe('catálogo de indicadores', () => {
  it('não tem ids repetidos', () => {
    const ids = CATALOGO.map((i) => i.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('calcula os indicadores de visão geral', () => {
    expect(valor('total-alunos').valor).toBe(4)
    expect(valor('total-ciclos').valor).toBe(2)
    expect(valor('ciclos-em-andamento').valor).toBe(1)
    expect(valor('total-cursos').valor).toBe(2)
    expect(valor('total-municipios').valor).toBe(2)
  })

  it('ciclo crítico é relativo aos ciclos em andamento', () => {
    expect(valor('ciclos-criticos')).toMatchObject({ valor: 1, fracao: 1 })
  })

  it('situação da matrícula vem com a fração do total', () => {
    expect(valor('status-CONCLUÍDA')).toMatchObject({ valor: 2, fracao: 0.5 })
    expect(valor('status-EM_CURSO')).toMatchObject({ valor: 1, fracao: 0.25 })
  })
})
