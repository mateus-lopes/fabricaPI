import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { consolidar, tabelaStatus, type Ciclo, type Matricula, type Trancamento } from '@/modules/censo'
import { decodificar, lerTexto } from './data/ler-csv'
import { fonteAlunos, fonteCiclos, fonteTrancados } from './domain/fontes'
import { importar } from './domain/importar'
import { repararStatus } from './domain/reparos'

const bytes = (texto: string, codificacao: BufferEncoding) => {
  const b = Buffer.from(texto, codificacao)
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer
}

describe('decodificar', () => {
  it('lê UTF-8', () => {
    expect(decodificar(bytes('CONCLUÍDA', 'utf8'))).toBe('CONCLUÍDA')
  })

  it('cai para Latin-1 quando o arquivo não é UTF-8 válido', () => {
    expect(decodificar(bytes('CÓDIGO CICLO DE MATRÍCULA', 'latin1'))).toBe('CÓDIGO CICLO DE MATRÍCULA')
  })
})

describe('repararStatus', () => {
  it('recupera status com acento destruído no arquivo', () => {
    expect(repararStatus('CONCLU�DA')).toBe('CONCLUÍDA')
  })

  it('normaliza caixa e espaços, e mantém status desconhecido', () => {
    expect(repararStatus(' em_curso ')).toBe('EM_CURSO')
    expect(repararStatus('NOVO�')).toBe('NOVO�')
  })
})

describe('importar', () => {
  it('recusa arquivo da fonte errada dizendo as colunas ausentes', () => {
    const r = importar(fonteAlunos, lerTexto('Matrícula;Nome;Curso;Status\n20240001;X;REDES;TRANCADO'))
    expect(r.registros).toHaveLength(0)
    expect(r.erros[0]).toContain('CO_CICLO_MATRICULA')
  })

  it('aceita cabeçalho sem acento ou com espaços sobrando', () => {
    const r = importar(fonteTrancados, lerTexto(' MATRICULA ;Nome;curso;Status\n20240001;X;Redes;TRANCADO'))
    expect(r.erros).toEqual([])
    expect(r.registros).toEqual([{ matricula: '20240001', curso: 'REDES', ano: '2024' }])
  })

  it('ignora linha inválida, mas avisa qual e por quê', () => {
    const texto = 'CO_MATRICULA;NO_ALUNO;CO_CICLO_MATRICULA;NO_STATUS_MATRICULA\n1;A;10;EM_CURSO\n2;B;;EM_CURSO'
    const r = importar(fonteAlunos, lerTexto(texto))
    expect(r.registros).toHaveLength(1)
    expect(r.avisos).toEqual(['Linha 3 ignorada (codigoCiclo: vazio).'])
  })
})

describe('ponta a ponta com os dados fictícios de public/exemplos', () => {
  const ler = (arquivo: string) => {
    const b = readFileSync(join(import.meta.dirname, '../../../public/exemplos', arquivo))
    return lerTexto(decodificar(b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength) as ArrayBuffer))
  }
  const ciclos = importar(fonteCiclos, ler('sistec-ciclos.csv'))
  const alunos = importar(fonteAlunos, ler('sistec-alunos.csv'))
  const trancados = importar(fonteTrancados, ler('sigaa-trancados.csv'))

  it('importa as três fontes sem erro nem linha descartada', () => {
    for (const r of [ciclos, alunos, trancados]) {
      expect(r.erros).toEqual([])
      expect(r.avisos).toEqual([])
    }
    // Ciclos vem em Latin-1: se a decodificação falhasse, os acentos estariam quebrados.
    expect((ciclos.registros as Ciclo[]).some((c) => c.curso === 'MEDICINA VETERINÁRIA')).toBe(true)
  })

  it('nenhum aluno é perdido: todo registro entra no relatório ou é apontado como sem ciclo', () => {
    const censo = consolidar(
      '2026-10-25',
      ciclos.registros as Ciclo[],
      alunos.registros as Matricula[],
      trancados.registros as Trancamento[],
    )
    expect(censo.matriculas.length + censo.matriculasSemCiclo.length).toBe(alunos.registros.length)
    expect(censo.matriculasSemCiclo).toHaveLength(2)

    const linhas = tabelaStatus(censo)
    expect(linhas.reduce((soma, l) => soma + l.total, 0)).toBe(censo.matriculas.length)
    expect(censo.matriculas.some((m) => m.status.includes('�'))).toBe(false)
  })
})
