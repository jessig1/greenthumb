import { Link, Outlet, useNavigate } from 'react-router'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
          <Link to="/dashboard" className="text-lg font-semibold">
            🌱 GreenThumb
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/dashboard" className="hover:text-foreground">
              Dashboard
            </Link>
            <Link to="/plants" className="hover:text-foreground">
              Plant catalog
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className="text-sm text-muted-foreground">{user?.displayName ?? user?.email}</span>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              Log out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
