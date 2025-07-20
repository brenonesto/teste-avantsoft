import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import type {Cliente} from '@/lib/normalizeClientes';
import { useClientes } from "@/hooks/useClientes"

// Criando o helper de colunas
const columnHelper = createColumnHelper<Cliente>()

const columns = [
  columnHelper.accessor('info.nomeCompleto', {
    header: 'Nome',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('info.detalhes.email', {
    header: 'Email',
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor('info.nomeCompleto', {
    id: 'letra',
    header: 'Letra',
    cell: (info) => {
      const nome = info.getValue()
      const set = new Set(nome.toLowerCase().replace(/^a-z/g, ''))
        for (let i=97;i<=122;i++) {
          const c = String.fromCharCode(i)
          if (!set.has(c)) return c.toUpperCase()
        }
        return '-'
    },
  }),
  columnHelper.accessor('estatisticas.vendas', {
    id: 'numeroVendas',
    header: 'Nº Vendas',
    cell: (info) => {
      const vendas = info.getValue()
      return vendas.length
    },
  }),
  columnHelper.accessor('estatisticas.vendas', {
    id: 'totalVendido',
    header: 'Total Vendido',
    cell: (info) => {
      const vendas = info.getValue()
      if (vendas.length === 0) return 'R$ 0,00'
      
      const total = vendas.reduce((acc, venda) => acc + venda.valor, 0)
      return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL'
      }).format(total)
    },
  }),
]

export function UserTable() {
  const { getClientes } = useClientes()
  const { data: clientes = [], isLoading, error } = getClientes

  // Função para calcular o total de vendas de um cliente
  const calcularTotalVendas = (cliente: Cliente) => {
    return cliente.estatisticas.vendas.reduce((acc, venda) => acc + venda.valor, 0)
  }

  // Função para calcular a média de valor por venda de um cliente
  const calcularMediaVendas = (cliente: Cliente) => {
    if (cliente.estatisticas.vendas.length === 0) return 0
    const total = calcularTotalVendas(cliente)
    return total / cliente.estatisticas.vendas.length
  }

  // Função para calcular o número de dias únicos com vendas
  const calcularDiasUnicosVendas = (cliente: Cliente) => {
    if (cliente.estatisticas.vendas.length === 0) return 0
    const datasUnicas = new Set(
      cliente.estatisticas.vendas.map(venda => {
        // Extrair apenas a data (sem horário) para comparação
        const data = new Date(venda.data)
        return data.toDateString()
      })
    )
    return datasUnicas.size
  }

  // Encontrar o cliente com maior volume de vendas
  const clienteComMaiorVenda = clientes.length > 0 
    ? clientes.reduce((max: Cliente, cliente: Cliente) => {
        const totalAtual = calcularTotalVendas(cliente)
        const totalMax = calcularTotalVendas(max)
        return totalAtual > totalMax ? cliente : max
      })
    : null

  // Encontrar o cliente com maior média de valor por venda
  const clienteComMaiorMedia = clientes.length > 0 
    ? clientes.reduce((max: Cliente, cliente: Cliente) => {
        const mediaAtual = calcularMediaVendas(cliente)
        const mediaMax = calcularMediaVendas(max)
        return mediaAtual > mediaMax ? cliente : max
      })
    : null

  // Encontrar o cliente com maior frequência de compras (dias únicos)
  const clienteComMaiorFrequencia = clientes.length > 0 
    ? clientes.reduce((max: Cliente, cliente: Cliente) => {
        const frequenciaAtual = calcularDiasUnicosVendas(cliente)
        const frequenciaMax = calcularDiasUnicosVendas(max)
        return frequenciaAtual > frequenciaMax ? cliente : max
      })
    : null

  const table = useReactTable({
    data: clientes,
    columns,
    getCoreRowModel: getCoreRowModel(),
  })

  // Função para determinar a classe CSS do cliente baseado nos destaques
  const getClienteHighlightClass = (cliente: Cliente) => {
    const isMaiorVenda = clienteComMaiorVenda && cliente.id === clienteComMaiorVenda.id
    const isMaiorMedia = clienteComMaiorMedia && cliente.id === clienteComMaiorMedia.id
    const isMaiorFrequencia = clienteComMaiorFrequencia && cliente.id === clienteComMaiorFrequencia.id

    // Verificar se o cliente tem múltiplos destaques
    const destaques = [isMaiorVenda, isMaiorMedia, isMaiorFrequencia].filter(Boolean).length

    if (destaques > 1) {
      return "bg-purple-100 hover:bg-purple-200 border-l-4 border-purple-500"
    } else if (isMaiorVenda) {
      return "bg-red-100 hover:bg-red-200 border-l-4 border-red-500"
    } else if (isMaiorMedia) {
      return "bg-blue-100 hover:bg-blue-200 border-l-4 border-blue-500"
    } else if (isMaiorFrequencia) {
      return "bg-green-100 hover:bg-green-200 border-l-4 border-green-500"
    }
    return ""
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg">Carregando clientes...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-lg text-red-600">Erro ao carregar clientes</div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <TableHead key={header.id}>
                  {header.isPlaceholder
                    ? null
                    : flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                </TableHead>
              ))}
            </TableRow>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.length ? (
            table.getRowModel().rows.map((row) => {
              return (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={getClienteHighlightClass(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              )
            })
          ) : (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                Nenhum cliente encontrado.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
      
      {/* Legenda */}
      {clientes.length > 0 && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-semibold mb-3 text-gray-700">Legenda de Destaques:</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-red-100 border-l-4 border-red-500 rounded-sm"></div>
              <span>Maior Volume de Vendas</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-blue-100 border-l-4 border-blue-500 rounded-sm"></div>
              <span>Maior Média por Venda</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-green-100 border-l-4 border-green-500 rounded-sm"></div>
              <span>Maior Frequência de Compras</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 bg-purple-100 border-l-4 border-purple-500 rounded-sm"></div>
              <span>Múltiplos Destaques</span>
            </div>
          </div>
          
          {/* Informações detalhadas dos clientes destacados */}
          <div className="mt-4 pt-3 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-gray-600">
              {clienteComMaiorVenda && (
                <div className="flex flex-col items-center justify-center">
                  <span className="font-medium text-red-700">Maior Volume:</span>
                  <br />
                  {clienteComMaiorVenda.info.nomeCompleto}
                  <br />
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(calcularTotalVendas(clienteComMaiorVenda))}
                </div>
              )}
              
              {clienteComMaiorMedia && (
                <div className="flex flex-col items-center justify-center">
                  <span className="font-medium text-blue-700">Maior Média:</span>
                  <br />
                  {clienteComMaiorMedia.info.nomeCompleto}
                  <br />
                  {new Intl.NumberFormat('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  }).format(calcularMediaVendas(clienteComMaiorMedia))} por venda
                </div>
              )}
              
              {clienteComMaiorFrequencia && (
                <div className="flex flex-col items-center justify-center">
                  <span className="font-medium text-green-700">Maior Frequência:</span>
                  <br />
                  {clienteComMaiorFrequencia.info.nomeCompleto}
                  <br />
                  {calcularDiasUnicosVendas(clienteComMaiorFrequencia)} dias únicos
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}