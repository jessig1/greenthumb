import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { CreateGardenRequest, GardenResponse, UpdateGardenRequest } from '@/api/types'

const gardensKey = ['gardens'] as const
const gardenKey = (id: string) => ['gardens', id] as const

export function useGardens() {
  return useQuery({
    queryKey: gardensKey,
    queryFn: () => api.get<GardenResponse[]>('/api/v1/gardens'),
  })
}

export function useGarden(id: string) {
  return useQuery({
    queryKey: gardenKey(id),
    queryFn: () => api.get<GardenResponse>(`/api/v1/gardens/${id}`),
  })
}

export function useCreateGarden() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateGardenRequest) => api.post<GardenResponse>('/api/v1/gardens', request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gardensKey }),
  })
}

export function useUpdateGarden(id: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdateGardenRequest) => api.put<GardenResponse>(`/api/v1/gardens/${id}`, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gardensKey })
      queryClient.invalidateQueries({ queryKey: gardenKey(id) })
    },
  })
}

export function useDeleteGarden() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/v1/gardens/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: gardensKey }),
  })
}
