import { useState } from 'react'
import { Link, Outlet, useLocation, useNavigate } from 'react-router'
import { useAuth } from '@/features/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { QuickAddPlantDialog } from '@/features/plantings/QuickAddPlantDialog'
import { IdentifyPlantDialog } from '@/features/ai/IdentifyPlantDialog'
import { ThemeToggle } from '@/components/ThemeToggle'
import {
  LayoutDashboard,
  Sprout,
  Plus,
  LogOut,
  User,
  ScanLine,
  ChevronDown,
  Menu,
  X,
} from 'lucide-react'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [addPlantOpen, setAddPlantOpen] = useState(false)
  const [identifyPlantOpen, setIdentifyPlantOpen] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  const isActive = (path: string) => {
    if (path === '/dashboard' && (location.pathname === '/dashboard' || location.pathname === '/gardens' || location.pathname === '/')) {
      return true
    }
    return location.pathname.startsWith(path) && path !== '/dashboard'
  }

  return (
    <div className="min-h-svh bg-background text-foreground flex flex-col antialiased">
      {/* Top Glassmorphic Navigation Header */}
      <header className="glass-header">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2 group">
              <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 p-2 text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform flex items-center justify-center">
                <Sprout className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold tracking-tight text-foreground flex items-center gap-1">
                Green<span className="text-emerald-600 dark:text-emerald-400">Thumb</span>
              </span>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/dashboard')
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <Link
                to="/plants"
                className={`px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
                  isActive('/plants')
                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                }`}
              >
                <Sprout className="h-4 w-4" />
                Plant Catalog
              </Link>
            </nav>
          </div>

          {/* Desktop Right Action Controls */}
          <div className="hidden md:flex items-center gap-2.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIdentifyPlantOpen(true)}
              className="gap-1.5 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 transition-all rounded-lg"
            >
              <ScanLine className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Identify Plant</span>
            </Button>

            <Button
              size="sm"
              onClick={() => setAddPlantOpen(true)}
              className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-500 dark:hover:bg-emerald-600 text-white shadow-sm shadow-emerald-600/20 rounded-lg"
            >
              <Plus className="h-4 w-4" />
              <span>Add Plant</span>
            </Button>

            <div className="h-4 w-px bg-border/80 mx-1" />

            <ThemeToggle />

            {/* User Profile Popover */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2 px-2.5 rounded-lg hover:bg-muted/80">
                  <div className="h-7 w-7 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                    {(user?.displayName ?? user?.email ?? 'U').slice(0, 1).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate">
                    {user?.displayName ?? user?.email?.split('@')[0]}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="px-2 py-1.5 border-b mb-1">
                  <p className="text-xs font-semibold text-foreground truncate">{user?.displayName || 'Gardener'}</p>
                  <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleLogout}
                  className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive gap-2 text-xs"
                >
                  <LogOut className="h-4 w-4" />
                  Log out
                </Button>
              </PopoverContent>
            </Popover>
          </div>

          {/* Mobile Right Controls (Theme & Menu Toggle) */}
          <div className="flex md:hidden items-center gap-1.5">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Expanded Menu Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t bg-background/95 backdrop-blur-xl px-4 py-3 flex flex-col gap-2 animate-fade-in shadow-lg">
            <div className="px-2 py-1 flex items-center justify-between text-xs text-muted-foreground border-b pb-2">
              <span className="font-medium text-foreground">{user?.displayName || user?.email}</span>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="h-7 text-destructive text-xs gap-1">
                <LogOut className="h-3.5 w-3.5" />
                Logout
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setIdentifyPlantOpen(true)
                }}
                className="gap-1.5 text-emerald-700 dark:text-emerald-300 border-emerald-500/30"
              >
                <ScanLine className="h-4 w-4 text-emerald-500" />
                Identify Plant
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setMobileMenuOpen(false)
                  setAddPlantOpen(true)
                }}
                className="gap-1.5 bg-emerald-600 text-white"
              >
                <Plus className="h-4 w-4" />
                Add Plant
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content - Added pb-24 on mobile so bottom bar never obscures content */}
      <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 pb-24 md:pb-12 animate-fade-in">
        <Outlet />
      </main>

      {/* Mobile Floating Bottom Navigation Bar (iOS / Android optimized) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-xl border-t border-border/60 pb-safe pt-1.5 px-3 shadow-lg flex items-center justify-around">
        <Link
          to="/dashboard"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            isActive('/dashboard')
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <LayoutDashboard className="h-5 w-5" />
          <span className="text-[10px] tracking-tight">Gardens</span>
        </Link>

        <Link
          to="/plants"
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all ${
            isActive('/plants')
              ? 'text-emerald-600 dark:text-emerald-400 font-semibold'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Sprout className="h-5 w-5" />
          <span className="text-[10px] tracking-tight">Catalog</span>
        </Link>

        {/* Center Floating Action Button */}
        <button
          onClick={() => setAddPlantOpen(true)}
          className="relative -top-3 h-12 w-12 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/40 flex items-center justify-center hover:scale-105 active:scale-95 transition-all"
          aria-label="Add plant"
        >
          <Plus className="h-6 w-6 stroke-[2.5]" />
        </button>

        <button
          onClick={() => setIdentifyPlantOpen(true)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-muted-foreground hover:text-foreground transition-all"
        >
          <ScanLine className="h-5 w-5 text-emerald-500" />
          <span className="text-[10px] tracking-tight">AI Identify</span>
        </button>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="flex flex-col items-center gap-1 py-1 px-3 rounded-xl text-muted-foreground hover:text-foreground transition-all"
        >
          <User className="h-5 w-5" />
          <span className="text-[10px] tracking-tight">Account</span>
        </button>
      </nav>

      {/* Action Dialogs */}
      <QuickAddPlantDialog open={addPlantOpen} onOpenChange={setAddPlantOpen} />
      <IdentifyPlantDialog open={identifyPlantOpen} onOpenChange={setIdentifyPlantOpen} />
    </div>
  )
}
