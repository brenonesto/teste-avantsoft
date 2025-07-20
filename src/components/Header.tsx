import { Link } from '@tanstack/react-router'

export default function Header() {
  const isLoggedIn = localStorage.getItem('token')

  const handleLogout = () => {
    localStorage.removeItem('token')
    window.location.href = '/login'
  }

  return (
    <header className="p-2 flex gap-2 bg-white text-black justify-between">
      <nav className="flex flex-column justify-between w-full">
        <div className="flex flex-row">
          {isLoggedIn && (
            <>
              <div className="px-2 font-bold">
                <Link to="/clientes">Clientes</Link>
              </div>

              <div className="px-2 font-bold">
                <Link to="/grafico">Grafico</Link>
              </div>
            </>
          )}
        </div>

        {isLoggedIn ? (
          <div className="px-2 font-bold">
            <button onClick={handleLogout} className="hover:cursor-pointer">Logout</button>
          </div>
        ) : (
          <div className="px-2 font-bold">
            <Link to="/login">Login</Link>
          </div>
        )}
      </nav>
    </header>
  )
}
