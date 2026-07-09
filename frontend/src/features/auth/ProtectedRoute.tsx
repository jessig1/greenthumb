import { Navigate, Outlet } from 'react-router'
import { useAuth } from './AuthContext'
import { Skeleton } from '@/components/ui/skeleton'

export function ProtectedRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-6">
        <Skeleton className="h-32" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}
