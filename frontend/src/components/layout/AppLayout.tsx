import { useState, type ComponentType } from 'react'
import {
  BookOpen,
  LayoutDashboard,
  Leaf,
  LogOut,
  Plus,
  ScanLine,
  Sparkles,
} from 'lucide-react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { QuickAddPlantDialog } from '@/features/plantings/QuickAddPlantDialog'
import { IdentifyPlantDialog } from '@/features/ai/IdentifyPlantDialog'
import { cn } from '@/lib/utils'

interface NavigationItem {
  label: string
  to: string
  icon: ComponentType<{ className?: string }>
}

const navigation: NavigationItem[] = [
  { label: 'My gardens', to: '/dashboard', icon: LayoutDashboard },
  { label: 'Plant library', to: '/plants', icon: BookOpen },
]

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <Link to="/dashboard" className="group flex items-center gap-2.5" aria-label="GreenThumb home">
      <span className="flex size-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/15 transition-transform group-hover:-rotate-3 group-hover:scale-105">
        <Leaf className="size-5" />
      </span>
      {!compact && (
        <span>
          <span className="block text-lg font-semibold tracking-[-0.035em]">GreenThumb</span>
          <span className="block text-[10px] font-semibold tracking-[0.15em] text-muted-foreground uppercase">
            Garden companion
          </span>
        </span>
      )}
    </Link>
  )
}

function DesktopNavItem({ item }: { item: NavigationItem }) {
  const Icon = item.icon
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
          isActive
            ? 'bg-sidebar-accent text-sidebar-accent-foreground shadow-sm'
            : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-foreground',
        )
      }
    >
      <Icon className="size-[18px]" />
      {item.label}
    </NavLink>
  )
}

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [addPlantOpen, setAddPlantOpen] = useState(false)
  const [identifyPlantOpen, setIdentifyPlantOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const displayName = user?.displayName ?? user?.email ?? 'Gardener'
  const initial = displayName.slice(0, 1).toUpperCase()

  return (
    <div className="min-h-svh lg:grid lg:grid-cols-[17rem_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-svh flex-col border-r border-sidebar-border/80 bg-sidebar/85 px-4 py-5 backdrop-blur-xl lg:flex">
        <div className="px-2">
          <Brand />
        </div>

        <nav className="mt-9 flex flex-col gap-1" aria-label="Main navigation">
          {navigation.map((item) => (
            <DesktopNavItem key={item.to} item={item} />
          ))}
        </nav>

        <Button className="mt-5 w-full" onClick={() => setAddPlantOpen(true)}>
          <Plus />
          Quick add plant
        </Button>

        <div className="mt-7 rounded-2xl border border-primary/10 bg-gradient-to-br from-primary/12 via-accent/40 to-secondary/60 p-4">
          <div className="mb-3 flex size-9 items-center justify-center rounded-xl bg-card/80 text-primary shadow-sm">
            <Sparkles className="size-[18px]" />
          </div>
          <p className="text-sm font-semibold">Grow with confidence</p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            Scan an unknown plant and get a tailored care guide in seconds.
          </p>
          <Button className="mt-4 w-full" size="sm" onClick={() => setIdentifyPlantOpen(true)}>
            <ScanLine />
            Identify a plant
          </Button>
        </div>

        <div className="mt-auto flex items-center gap-3 rounded-2xl border border-sidebar-border/80 bg-card/55 p-2.5">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
            {initial}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{displayName}</p>
            {user?.displayName && <p className="truncate text-xs text-muted-foreground">{user.email}</p>}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={handleLogout} aria-label="Log out">
            <LogOut />
          </Button>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border/70 bg-background/88 px-4 backdrop-blur-xl lg:hidden">
          <Brand />
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" onClick={() => setIdentifyPlantOpen(true)} aria-label="Identify a plant">
              <ScanLine />
            </Button>
            <span className="ml-1 flex size-9 items-center justify-center rounded-full bg-primary/12 text-sm font-semibold text-primary">
              {initial}
            </span>
          </div>
        </header>

        <main className="mx-auto w-full max-w-6xl px-4 py-6 pb-28 sm:px-6 sm:py-8 lg:px-10 lg:py-10 lg:pb-12">
          <Outlet />
        </main>
      </div>

      <nav
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-border/80 bg-card/92 px-2 pt-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_oklch(0.25_0.03_145/0.08)] backdrop-blur-xl lg:hidden"
        aria-label="Mobile navigation"
      >
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn('flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium', isActive ? 'text-primary' : 'text-muted-foreground')
          }
        >
          <LayoutDashboard className="size-5" />
          Gardens
        </NavLink>
        <NavLink
          to="/plants"
          className={({ isActive }) =>
            cn('flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium', isActive ? 'text-primary' : 'text-muted-foreground')
          }
        >
          <BookOpen className="size-5" />
          Plants
        </NavLink>
        <button
          type="button"
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-medium text-muted-foreground"
          onClick={() => setIdentifyPlantOpen(true)}
        >
          <ScanLine className="size-5" />
          Identify
        </button>
        <button
          type="button"
          className="flex min-h-12 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-primary"
          onClick={() => setAddPlantOpen(true)}
        >
          <span className="flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md shadow-primary/20">
            <Plus className="size-4" />
          </span>
          Add plant
        </button>
      </nav>

      <QuickAddPlantDialog open={addPlantOpen} onOpenChange={setAddPlantOpen} />
      <IdentifyPlantDialog open={identifyPlantOpen} onOpenChange={setIdentifyPlantOpen} />
    </div>
  )
}
