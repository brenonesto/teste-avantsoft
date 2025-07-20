import { useMemo } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { useClientes } from '@/hooks/useClientes'

export function SalesChart() {
  const { getClientes } = useClientes()
  
  const chartData = useMemo(() => {
    if (!getClientes.data) return []
    
    // Agrupar todas as vendas por data
    const vendasPorData: { [key: string]: number } = {}
    
    getClientes.data.forEach((cliente: any) => {
      if (cliente.estatisticas?.vendas) {
        cliente.estatisticas.vendas.forEach((venda: any) => {
          const data = venda.data
          const valor = venda.valor || 0
          
          if (vendasPorData[data]) {
            vendasPorData[data] += valor
          } else {
            vendasPorData[data] = valor
          }
        })
      }
    })
    
    // Converter para array e ordenar por data
    return Object.entries(vendasPorData)
      .map(([data, total]) => ({
        data: new Date(data).toLocaleDateString('pt-BR', { 
          day: '2-digit', 
          month: '2-digit' 
        }),
        total,
        dataCompleta: data
      }))
      .sort((a, b) => new Date(a.dataCompleta).getTime() - new Date(b.dataCompleta).getTime())
  }, [getClientes.data])

  const chartConfig = {
    total: {
      label: "Total de Vendas",
      color: "hsl(var(--chart-1))",
    },
  }

  if (getClientes.isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-lg">Carregando dados...</div>
        </CardContent>
      </Card>
    )
  }

  if (getClientes.error) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-lg text-red-500">Erro ao carregar dados</div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total de Vendas por Dia</CardTitle>
        <CardDescription>
          Visualização do volume de vendas realizadas diariamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="data" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <ChartTooltip 
                content={
                  <ChartTooltipContent 
                    formatter={(value) => [`R$ ${value}`]}
                  />
                }
              />
              <Bar 
                dataKey="total" 
                radius={[4, 4, 0, 0]}
                fill="var(--chart-1)"
              />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
