import { useQuery } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { PlantCategory, PlantResponse } from '@/api/types'

export function usePlants(category?: PlantCategory) {
  return useQuery({
    queryKey: ['plants', category ?? 'all'] as const,
    queryFn: () =>
      api.get<PlantResponse[]>(`/api/v1/plants${category ? `?category=${category}` : ''}`),
  })
}

export function usePlant(id: string) {
  return useQuery({
    queryKey: ['plants', 'detail', id] as const,
    queryFn: () => api.get<PlantResponse>(`/api/v1/plants/${id}`),
  })
}
