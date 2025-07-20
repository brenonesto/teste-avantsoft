import { createFileRoute, redirect } from '@tanstack/react-router'
import { useState } from 'react'
import { useClientes } from '@/hooks/useClientes'
import { NewUserForm } from '@/components/NewUserForm'
import { UserTable } from '@/components/UserTable'
import { Button } from '@/components/ui/button'
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'

export const Route = createFileRoute('/clientes')({
  beforeLoad: ({ location }) => {
    const token = localStorage.getItem('token')
    if (!token) {
      throw redirect({ 
        to: '/login',
        search: {
          redirect: location.href
        } 
      })
    }
  },
  component: TanStackQueryDemo,
})

function TanStackQueryDemo() {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const { addCliente } = useClientes() 
  const { mutateAsync: createCliente, isPending: isLoading } = addCliente

  const handleAddCliente = async (cliente: any) => {
    await createCliente(cliente)
    setIsDialogOpen(false) // Fecha o dialog após criar o cliente
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl">Clientes</h1>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>Criar Cliente</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Cliente</DialogTitle>
            </DialogHeader>
            <NewUserForm handleAddCliente={handleAddCliente} isLoading={isLoading} />
          </DialogContent>
        </Dialog>
      </div>
      <UserTable />
    </div>
  )
}
