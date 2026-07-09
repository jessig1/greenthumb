import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { GardensListPage } from '@/features/gardens/GardensListPage'
import { GardenDetailPage } from '@/features/gardens/GardenDetailPage'
import { ContainerDetailPage } from '@/features/containers/ContainerDetailPage'
import { PlantsListPage } from '@/features/plants/PlantsListPage'
import { PlantDetailPage } from '@/features/plants/PlantDetailPage'
import { LoginPage } from '@/features/auth/LoginPage'
import { RegisterPage } from '@/features/auth/RegisterPage'
import { ProtectedRoute } from '@/features/auth/ProtectedRoute'

export const router = createBrowserRouter([
  { path: 'login', element: <LoginPage /> },
  { path: 'register', element: <RegisterPage /> },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <AppLayout />,
        children: [
          { index: true, element: <Navigate to="/dashboard" replace /> },
          { path: 'dashboard', element: <GardensListPage /> },
          { path: 'gardens', element: <GardensListPage /> },
          { path: 'gardens/:gardenId', element: <GardenDetailPage /> },
          { path: 'gardens/:gardenId/containers/:containerId', element: <ContainerDetailPage /> },
          { path: 'plants', element: <PlantsListPage /> },
          { path: 'plants/:plantId', element: <PlantDetailPage /> },
        ],
      },
    ],
  },
])
