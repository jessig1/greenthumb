import { Link, Outlet } from 'react-router'

export function AppLayout() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
          <Link to="/gardens" className="text-lg font-semibold">
            🌱 GreenThumb
          </Link>
          <nav className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/gardens" className="hover:text-foreground">
              Gardens
            </Link>
            <Link to="/plants" className="hover:text-foreground">
              Plant catalog
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
