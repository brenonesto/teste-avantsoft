export interface Cliente {
  id: string
  info: {
    nomeCompleto: string
    detalhes: {
      email: string
      nascimento: string
    }
  }
  estatisticas: {
    vendas: Array<{
      data: string
      valor: number
    }>
  }
}

/**
 * Normaliza a resposta da API de clientes, garantindo que o frontend
 * receba sempre a mesma estrutura de dados, independentemente de
 * propriedades desnecessárias, duplicações ou aninhamentos excessivos.
 */
export function normalizeClientesResponse(rawResponse: unknown): Array<Cliente> {
  // A API DEVE retornar um objeto com a chave `data.clientes`, mas caso
  // não exista, retornamos um array vazio para evitar que o app quebre.
  // Utilizamos encadeamento opcional para evitar erros de acesso.
   
  const clientesBrutos = (rawResponse as any) ?? []

  // Garantimos que sempre retornaremos um array de clientes no formato padronizado.
  return clientesBrutos.map((clienteBruto: any): Cliente => {
    const info = clienteBruto?.info ?? {}
    const detalhes = info?.detalhes ?? {}

    // Prioriza o nome dentro de `info`, mas faz fallback para possíveis
    // campos duplicados.
    const nomeCompleto =
      info?.nomeCompleto || clienteBruto?.duplicado?.nomeCompleto || ""

    // Caso o email ou nascimento não exista, definimos como string vazia
    // para manter o contrato de tipos.
    const email = detalhes?.email ?? ""
    const nascimento = detalhes?.nascimento ?? ""

    // Estatísticas de vendas podem não existir ou ser um array vazio.
    const vendas = clienteBruto?.estatisticas?.vendas ?? []


    return {
      id: clienteBruto?.id ?? "",
      info: {
        nomeCompleto,
        detalhes: {
          email,
          nascimento,
        },
      },
      estatisticas: {
        vendas,
      },
    }
  })
} 