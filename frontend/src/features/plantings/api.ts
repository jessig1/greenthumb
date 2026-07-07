import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { CreatePlantedPlantRequest, PlantedPlantResponse, UpdatePlantedPlantRequest } from '@/api/types'

const plantingsKey = (containerId: string) => ['containers', containerId, 'plantings'] as const
const plantingKey = (id: string) => ['plantings', id] as const

export function usePlantings(containerId: string) {
  return useQuery({
    queryKey: plantingsKey(containerId),
    queryFn: () => api.get<PlantedPlantResponse[]>(`/api/v1/containers/${containerId}/plantings`),
  })
}

export function usePlanting(id: string) {
  return useQuery({
    queryKey: plantingKey(id),
    queryFn: () => api.get<PlantedPlantResponse>(`/api/v1/plantings/${id}`),
  })
}

export function useCreatePlanting(containerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreatePlantedPlantRequest) =>
      api.post<PlantedPlantResponse>(`/api/v1/containers/${containerId}/plantings`, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: plantingsKey(containerId) }),
  })
}

export function useUpdatePlanting(id: string, containerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdatePlantedPlantRequest) =>
      api.put<PlantedPlantResponse>(`/api/v1/plantings/${id}`, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: plantingsKey(containerId) })
      queryClient.invalidateQueries({ queryKey: plantingKey(id) })
    },
  })
}

export function useDeletePlanting(containerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/v1/plantings/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: plantingsKey(containerId) }),
  })
}
