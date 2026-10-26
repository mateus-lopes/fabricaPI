import { describe, expect, it } from 'vitest'
import { anoDoCiclo, dataIso, rotuloCurto } from './ciclo'
import { ciclosCriticos, ciclosEmAndamento } from './ciclos-criticos'
import { consolidar } from './consolidar'
import { contar, tabelaStatus } from './tabela-status'
import type { Ciclo, Matricula } from './tipos'

const ciclo = (codigo: string, curso: string, ano: string, fimPrevisto: string | null): Ciclo => ({
  codigo,
  nome: `${curso} - EDUCAÇÃO PRESENCIAL - FEV. ${ano} / DEZ. ${fimPrevisto?.slice(0, 4)}`,
  curso,
  municipio: 'ARAQUARI',
  ano,
  fimPrevisto,
})

let seq = 0
const alunos = (codigoCiclo: string, status: string, n: number): Matricula[] =>
  Array.from({ length: n }, () => ({ codigo: String(++seq), aluno: 'FULANO', codigoCiclo, status }))

const REFERENCIA = '2026-10-25'
const redes2020 = ciclo('1', 'REDES', '2020', '2022-12-31') // encerrado
const redes2025 = ciclo('2', 'REDES', '2025', '2027-12-31') // em andamento, saudável
const agro2024 = ciclo('3', 'AGRONOMIA', '2024', '2028-12-31') // em andamento, esvaziado

const matriculas = [
  ...alunos('1', 'CONCLUÍDA', 10),
  ...alunos('1', 'ABANDONO', 2),
  ...alunos('2', 'EM_CURSO', 20),
  ...alunos('3', 'EM_CURSO', 2),
  ...alunos('3', 'ABANDONO', 8),
  ...alunos('3', 'STATUS_NOVO', 1),
  ...alunos('999', 'EM_CURSO', 3), // ciclo inexistente
]

describe('consolidar', () => {
  it('liga matrícula ao ciclo e separa as órfãs em vez de descartá-las', () => {
    const censo = consolidar(REFERENCIA, [redes2020, redes2025, agro2024], matriculas)
    expect(censo.matriculas).toHaveLength(43)
    expect(censo.matriculasSemCiclo).toHaveLength(3)
    expect(censo.matriculasSemCiclo.every((m) => m.codigoCiclo === '999')).toBe(true)
  })
})

describe('tabelaStatus', () => {
  const censo = consolidar(REFERENCIA, [redes2020, redes2025, agro2024], matriculas)
  const linhas = tabelaStatus(censo)

  it('conta por status e soma o total, incluindo status desconhecidos', () => {
    const agro = linhas.find((l) => l.ciclo.codigo === '3')!
    expect(contar(agro, 'EM_CURSO')).toBe(2)
    expect(contar(agro, 'ABANDONO')).toBe(8)
    expect(contar(agro, 'STATUS_NOVO')).toBe(1)
    expect(agro.total).toBe(11)
  })

  it('mantém a ordem do arquivo de ciclos', () => {
    expect(linhas.map((l) => l.ciclo.codigo)).toEqual(['1', '2', '3'])
  })

  it('sem planilha de trancados, não inventa as colunas', () => {
    expect(linhas.every((l) => l.trancados === undefined)).toBe(true)
  })

  it('com trancados, casa por curso + ano de ingresso e calcula quem está frequentando', () => {
    const comTrancados = consolidar(REFERENCIA, [redes2025, agro2024], matriculas, [
      { matricula: '20250001', curso: 'REDES', ano: '2025' },
      { matricula: '20250002', curso: 'REDES', ano: '2025' },
      { matricula: '20240001', curso: 'AGRONOMIA', ano: '2024' },
      { matricula: '20190001', curso: 'REDES', ano: '2019' }, // sem ciclo correspondente
    ])
    const [redes, agro] = tabelaStatus(comTrancados)
    expect(redes).toMatchObject({ trancados: 2, frequentando: 18 })
    expect(agro).toMatchObject({ trancados: 1, frequentando: 1 })
  })
})

describe('ciclosCriticos', () => {
  const censo = consolidar(REFERENCIA, [redes2020, redes2025, agro2024], matriculas)

  it('turma já encerrada não é crítica, mesmo com 0 em curso', () => {
    expect(ciclosCriticos(censo).map((l) => l.ciclo.codigo)).toEqual(['3'])
  })

  it('devolve todos os críticos, não só o primeiro', () => {
    const outro = ciclo('4', 'QUÍMICA', '2025', '2028-12-31')
    const c = consolidar(REFERENCIA, [agro2024, outro], [...matriculas, ...alunos('4', 'EM_CURSO', 1)])
    expect(ciclosCriticos(c).map((l) => l.ciclo.codigo)).toEqual(['3', '4'])
  })

  it('ciclo vencido que ainda tem aluno em curso continua em andamento', () => {
    const atrasado = ciclo('5', 'REDES', '2019', '2021-12-31')
    const c = consolidar(REFERENCIA, [atrasado], alunos('5', 'EM_CURSO', 1))
    expect(ciclosEmAndamento(c)).toHaveLength(1)
    expect(ciclosCriticos(c)).toHaveLength(1)
  })
})

describe('ciclo', () => {
  const nome = 'REDES DE COMPUTADORES - EDUCAÇÃO PRESENCIAL - FEV. 2020 / DEZ. 2022'

  it('extrai o ano de início do nome', () => {
    expect(anoDoCiclo(nome)).toBe('2020')
    expect(anoDoCiclo('SEM ANO')).toBeNull()
  })

  it('encurta o nome tirando a modalidade', () => {
    expect(rotuloCurto(nome)).toBe('REDES DE COMPUTADORES · FEV. 2020 / DEZ. 2022')
  })

  it('converte a data do SISTEC para ISO', () => {
    expect(dataIso('31/12/2022 00:00')).toBe('2022-12-31')
    expect(dataIso('')).toBeNull()
  })
})
