import { useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { BookOpen, Camera, LogOut, Plus, Sprout } from 'lucide-react'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { QuickAddPlantDialog } from '@/features/plantings/QuickAddPlantDialog'
import { IdentifyPlantDialog } from '@/features/ai/IdentifyPlantDialog'

const NAV_LINKS = [
  { to: '/dashboard', label: 'Dashboard', icon: Sprout },
  { to: '/plants', label: 'Plant catalog', icon: BookOpen },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [addPlantOpen, setAddPlantOpen] = useState(false)
  const [identifyPlantOpen, setIdentifyPlantOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const displayName = user?.displayName ?? user?.email ?? ''
  const initial = displayName.charAt(0).toUpperCase() || '?'

  return (
    <div className="min-h-svh bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-5xl items-center gap-4 px-4">
          <Link to="/dashboard" className="flex shrink-0 items-center gap-2 font-semibold">
            <span className="flex size-7 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sprout className="size-4.5" />
            </span>
            <span className="text-lg tracking-tight">GreenThumb</span>
          </Link>

          <nav className="hidden gap-1 md:flex">
            {NAV_LINKS.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-1.5 text-sm transition-colors',
                    isActive
                      ? 'bg-accent font-medium text-accent-foreground'
                      : 'text-muted-foreground hover:text-foreground',
                  )
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              className="hidden md:inline-flex"
              onClick={() => setIdentifyPlantOpen(true)}
            >
              <Camera data-icon="inline-start" />
              Identify plant
            </Button>
            <Button size="sm" className="hidden md:inline-flex" onClick={() => setAddPlantOpen(true)}>
              <Plus data-icon="inline-start" />
              Add plant
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label="Account menu"
                  className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground outline-none transition-colors hover:bg-accent focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {initial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel className="flex flex-col">
                  <span>{user?.displayName ?? 'Account'}</span>
                  <span className="text-xs font-normal text-muted-foreground">{user?.email}</span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={handleLogout}>
                  <LogOut />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl px-4 py-6 pb-24 md:pb-10">
        <Outlet />
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-40 border-t bg-background/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
        <div className="grid h-16 grid-cols-4">
          {NAV_LINKS.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex flex-col items-center justify-center gap-1 text-xs transition-colors',
                  isActive ? 'font-medium text-primary' : 'text-muted-foreground',
                )
              }
            >
              <Icon className="size-5" />
              {label === 'Plant catalog' ? 'Catalog' : label}
            </NavLink>
          ))}
          <button
            type="button"
            onClick={() => setAddPlantOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors active:text-foreground"
          >
            <span className="flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Plus className="size-4" />
            </span>
            Add plant
          </button>
          <button
            type="button"
            onClick={() => setIdentifyPlantOpen(true)}
            className="flex flex-col items-center justify-center gap-1 text-xs text-muted-foreground transition-colors active:text-foreground"
          >
            <Camera className="size-5" />
            Identify
          </button>
        </div>
      </nav>

      <QuickAddPlantDialog open={addPlantOpen} onOpenChange={setAddPlantOpen} />
      <IdentifyPlantDialog open={identifyPlantOpen} onOpenChange={setIdentifyPlantOpen} />
    </div>
  )
}
