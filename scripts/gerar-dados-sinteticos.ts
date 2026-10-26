/**
 * Gera planilhas FICTÍCIAS no mesmo formato das exportações do SISTEC e do SIGAA, em public/exemplos/.
 * Nenhum dado real: nomes sorteados de listas comuns e CPFs começando em 000 (inválidos de propósito).
 * Determinístico (semente fixa): rodar de novo produz os mesmos arquivos.
 *
 * Uso: npm run dados:exemplo
 */
import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const DESTINO = join(import.meta.dirname, '..', 'public', 'exemplos')

// PRNG mulberry32: aleatório, mas reproduzível.
let semente = 20261025
function aleatorio() {
  semente = (semente + 0x6d2b79f5) | 0
  let t = semente
  t = Math.imul(t ^ (t >>> 15), t | 1)
  t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296
}
const inteiro = (min: number, max: number) => min + Math.floor(aleatorio() * (max - min + 1))
const sortear = <T>(itens: readonly T[]) => itens[Math.floor(aleatorio() * itens.length)]!
function sortearPeso<T extends string>(pesos: Record<T, number>): T {
  const total = Object.values<number>(pesos).reduce((a, b) => a + b, 0)
  let r = aleatorio() * total
  for (const [chave, peso] of Object.entries<number>(pesos)) {
    r -= peso
    if (r <= 0) return chave as T
  }
  return Object.keys(pesos)[0] as T
}

const NOMES = ['ANA', 'BRUNO', 'CAMILA', 'DANIEL', 'EDUARDA', 'FELIPE', 'GABRIELA', 'HENRIQUE', 'ISABELA', 'JOÃO', 'JÚLIA', 'LUCAS', 'MARIA', 'MATHEUS', 'NICOLE', 'OTÁVIO', 'PEDRO', 'RAFAELA', 'SAMUEL', 'THAÍS', 'VINÍCIUS', 'YASMIN']
const SOBRENOMES = ['ALVES', 'BATISTA', 'CARDOSO', 'COSTA', 'FERREIRA', 'GONÇALVES', 'LIMA', 'MACHADO', 'MARTINS', 'OLIVEIRA', 'PEREIRA', 'RIBEIRO', 'ROCHA', 'SANTOS', 'SCHMIDT', 'SILVA', 'SOUZA', 'VIEIRA', 'WEBER']
const nomeFicticio = () => `${sortear(NOMES)} ${sortear(SOBRENOMES)} ${sortear(SOBRENOMES)}`
const cpfFicticio = () => `000${String(inteiro(0, 99_999_999)).padStart(8, '0')}`

interface Curso {
  nome: string
  subtipo: string
  anos: number
  municipio: string
}

const CURSOS: Curso[] = [
  { nome: 'AGRONOMIA', subtipo: 'BACHARELADO', anos: 5, municipio: 'ARAQUARI' },
  { nome: 'MEDICINA VETERINÁRIA', subtipo: 'BACHARELADO', anos: 5, municipio: 'ARAQUARI' },
  { nome: 'SISTEMAS DE INFORMAÇÃO', subtipo: 'BACHARELADO', anos: 4, municipio: 'ARAQUARI' },
  { nome: 'REDES DE COMPUTADORES', subtipo: 'TECNOLOGIA', anos: 3, municipio: 'ARAQUARI' },
  { nome: 'QUÍMICA', subtipo: 'LICENCIATURA', anos: 4, municipio: 'ARAQUARI' },
  { nome: 'TÉCNICO EM INFORMÁTICA', subtipo: 'TÉCNICO', anos: 3, municipio: 'ARAQUARI' },
  { nome: 'TÉCNICO EM AGROPECUÁRIA', subtipo: 'TÉCNICO', anos: 3, municipio: 'ARAQUARI' },
  { nome: 'TÉCNICO EM GUIA DE TURISMO', subtipo: 'TÉCNICO', anos: 2, municipio: 'SÃO FRANCISCO DO SUL' },
]

const HOJE = 2026

const ENCERRADO = { 'CONCLUÍDA': 52, INTEGRALIZADA: 8, ABANDONO: 16, DESLIGADO: 14, TRANSF_EXT: 7, TRANSF_INT: 3 }
const ANDAMENTO = { EM_CURSO: 72, ABANDONO: 12, DESLIGADO: 7, TRANSF_EXT: 6, TRANSF_INT: 3 }
// Turmas esvaziadas, para que existam ciclos críticos na demonstração.
const ESVAZIADO = { EM_CURSO: 8, ABANDONO: 55, DESLIGADO: 25, TRANSF_EXT: 12 }

const COLUNAS_CICLOS = ['UF', 'MUNICIPIO', 'NOME UNIDADE DE ENSINO', 'CÓDIGO UNIDADE DE ENSINO', 'CÓDIGO INSTITUIÇÃO', 'SUBTIPO CURSOS', 'CÓDIGO CURSO', 'NOME DO CURSO', 'CARGA HORÁRIA MÍNIMA', 'OFERTA', 'CÓDIGO CICLO DE MATRÍCULA', 'CICLO DE MATRÍCULA', 'CARGA HORÁRIA TOTAL', 'DATA INÍCIO DO CURSO', 'DATA FIM PREVISTO DO CURSO', 'MODALIDADE ENSINO', 'STATUS DO CICLO DE MATRÍCULA', 'SITUAÇÃO DO CICLO ', 'TIPO OFERTA DO CURSO', 'SITUAÇÃO SE POSSUI ESTÁGIO: SIM OU NÃO?', 'CARGA HORÁRIA ESTÁGIO', 'PROJETO PEDAGÓGICO', 'SITUAÇÃO ETEC', 'CÓDIGO DO PORTFÓLIO', 'CÓDIGO DO POLO', 'QTD DE VAGAS', 'QTD DE INSCRITOS', 'QTD DE MATRICULAS', 'DATA_CRIACAO', 'NOME_RESPONSAVEL', 'CPF']
const COLUNAS_ALUNOS = ['CO_MATRICULA', 'DATA_MATRICULA', 'CO_ALUNO', 'NO_ALUNO', 'NO_NOME_SOCIAL', 'NU_CPF', 'DT_DATA_NASCIMENTO', 'CO_CICLO_MATRICULA', 'NO_STATUS_MATRICULA', 'DATA_OCORRENCIA_SITUACAO', 'CO_USUARIO_CADASTRO', 'NU_CPF_PESSOA_FISICA', 'NO_PESSOA_FISICA', 'DT_DATA_HISTORICO', 'DS_CODIGO_AUTENTICACAO']

const ciclos: string[][] = []
const alunos: string[][] = []
const trancados: string[][] = []
let codigoCiclo = 2_680_000
let codigoMatricula = 103_700_000
let codigoAluno = 25_600_000

for (const [i, curso] of CURSOS.entries()) {
  for (let ano = 2019; ano <= 2025; ano++) {
    codigoCiclo += inteiro(3, 40)
    const fim = ano + curso.anos - 1
    const encerrado = fim < HOJE
    const nomeCiclo = `${curso.nome} - EDUCAÇÃO PRESENCIAL - FEV. ${ano} / DEZ. ${fim}`
    const vagas = curso.subtipo === 'TÉCNICO' ? 35 : 40

    let pesos: Record<string, number> = encerrado ? ENCERRADO : ANDAMENTO
    let quantidade = inteiro(18, vagas)
    // Uma turma em andamento a cada três cursos fica esvaziada: são os ciclos críticos da demonstração.
    if (!encerrado && ano === 2024 && i % 3 === 0) {
      pesos = ESVAZIADO
      quantidade = inteiro(8, 16)
    }

    ciclos.push([
      'SC', curso.municipio, 'INSTITUTO FEDERAL CATARINENSE - CAMPUS ARAQUARI', '2833', '2833', curso.subtipo,
      String(52_000 + i * 17), curso.nome, String(curso.anos * 600), '', String(codigoCiclo), nomeCiclo,
      String(curso.anos * 600 + 200), `0${inteiro(1, 9)}/02/${ano} 00:00`, `31/12/${fim} 00:00`, 'EDUCAÇÃO PRESENCIAL',
      'ATIVO', encerrado ? 'CONCLUÍDO' : 'ATIVO', '', 'NÃO', '', 'NÃO', 'NÃO', String(400_000 + i), '',
      String(vagas), String(vagas * inteiro(2, 6)), String(quantidade), `01/02/${ano} 00:00`, 'SERVIDOR FICTÍCIO', cpfFicticio(),
    ])

    for (let n = 0; n < quantidade; n++) {
      const status = sortearPeso(pesos)
      const matricula = `${ano}${String(i * 100 + n).padStart(4, '0')}`
      alunos.push([
        String(++codigoMatricula), `${ano}-03-01 00:00:00`, String(++codigoAluno), nomeFicticio(), '-', cpfFicticio(),
        `${ano - inteiro(15, 30)}-0${inteiro(1, 9)}-1${inteiro(0, 9)} 00:00:00`, String(codigoCiclo),
        // Reproduz um defeito real das exportações: acento já destruído no arquivo.
        status === 'CONCLUÍDA' && aleatorio() < 0.15 ? 'CONCLU�DA' : status,
        `${ano}-03-01 00:00:00`, '13570779', cpfFicticio(), 'SERVIDOR FICTÍCIO', `${ano}-03-23 14:36:54`, '',
      ])
      if (status === 'EM_CURSO' && aleatorio() < 0.06) trancados.push([matricula, nomeFicticio(), curso.nome, 'TRANCADO'])
    }
  }
}

// Duas matrículas cujo ciclo não está no arquivo de ciclos: o relatório deve apontar, não esconder.
for (let n = 0; n < 2; n++) {
  alunos.push([String(++codigoMatricula), '2024-03-01 00:00:00', String(++codigoAluno), nomeFicticio(), '-', cpfFicticio(), '2006-05-10 00:00:00', '9999999', 'EM_CURSO', '2024-03-01 00:00:00', '13570779', cpfFicticio(), 'SERVIDOR FICTÍCIO', '2024-03-23 14:36:54', ''])
}

const csv = (colunas: string[], linhas: string[][], aspas = false) => {
  const campo = (v: string) => (aspas ? `"${v}"` : v)
  return [colunas, ...linhas].map((l) => l.map(campo).join(';')).join('\r\n') + '\r\n'
}

mkdirSync(DESTINO, { recursive: true })
// Mesmas codificações observadas nas exportações reais: ciclos em Latin-1, alunos e trancados em UTF-8.
writeFileSync(join(DESTINO, 'sistec-ciclos.csv'), Buffer.from(csv(COLUNAS_CICLOS, ciclos), 'latin1'))
writeFileSync(join(DESTINO, 'sistec-alunos.csv'), csv(COLUNAS_ALUNOS, alunos, true), 'utf8')
writeFileSync(join(DESTINO, 'sigaa-trancados.csv'), csv(['Matrícula', 'Nome', 'Curso', 'Status'], trancados), 'utf8')

console.log(`${ciclos.length} ciclos, ${alunos.length} matrículas, ${trancados.length} trancados → ${DESTINO}`)
