import { createFileRoute } from '@tanstack/react-router'
import { LoginForm } from '@/components/login-form'
import { useLogin } from '@/hooks/useLogin'

export const Route = createFileRoute('/login')({
  component: RouteComponent,
})

function RouteComponent() {
  const { mutateAsync: login, isPending, error } = useLogin()

  const handleSubmit = async (data: { email: string; password: string }) => {
    await login(data)
    // Após login bem-sucedido redireciona para a página de clientes.
    window.location.href = '/clientes'
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm
          onSubmit={handleSubmit}
          isLoading={isPending}
          errorMessage={error instanceof Error ? error.message : undefined}
        />
      </div>
    </div>
  )
}
