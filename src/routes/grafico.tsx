import { createFileRoute, redirect } from '@tanstack/react-router'
import { SalesChart } from '@/components/SalesChart'

export const Route = createFileRoute('/grafico')({
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
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="container mx-auto p-6">
      <SalesChart />
    </div>
  )
}
