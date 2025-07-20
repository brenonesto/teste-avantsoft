import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { normalizeClientesResponse } from '@/lib/normalizeClientes'

export function useClientes() {
  const queryClient = useQueryClient()

  const getClientes = useQuery({
    queryKey: ['clientes'],
    queryFn: async () => {
      const response = await fetch('/api/clientes')
      const data = await response.json()
      return normalizeClientesResponse(data.clientes)
    },
  })

  const addCliente = useMutation({
    mutationFn: async (cliente: any) => {
      const response = await fetch('/api/clientes', {
        method: 'POST',
        body: JSON.stringify(cliente),
      })  

      if (!response.ok) {
        throw new Error('Failed to add cliente')
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] })
    },
  })

  return {
    getClientes,
    addCliente,
  }
}