import { createBrowserRouter, Navigate } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import { GardensListPage } from '@/features/gardens/GardensListPage'
import { GardenDetailPage } from '@/features/gardens/GardenDetailPage'
import { ContainerDetailPage } from '@/features/containers/ContainerDetailPage'
import { PlantsListPage } from '@/features/plants/PlantsListPage'
import { PlantDetailPage } from '@/features/plants/PlantDetailPage'

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/gardens" replace /> },
      { path: 'gardens', element: <GardensListPage /> },
      { path: 'gardens/:gardenId', element: <GardenDetailPage /> },
      { path: 'gardens/:gardenId/containers/:containerId', element: <ContainerDetailPage /> },
      { path: 'plants', element: <PlantsListPage /> },
      { path: 'plants/:plantId', element: <PlantDetailPage /> },
    ],
  },
])
