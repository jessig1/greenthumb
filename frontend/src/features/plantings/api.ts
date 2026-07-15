import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type {
  CreatePlantedPlantRequest,
  PlantedPlantResponse,
  QuickAddPlantingRequest,
  UpdatePlantedPlantRequest,
} from '@/api/types'

const plantingsKey = (containerId: string) => ['containers', containerId, 'plantings'] as const
const plantingKey = (id: string) => ['plantings', id] as const
const allPlantingsKey = ['plantings', 'all'] as const

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

// Dashboard inventory: every planting the caller owns, assigned to a container or not.
export function useAllPlantings() {
  return useQuery({
    queryKey: allPlantingsKey,
    queryFn: () => api.get<PlantedPlantResponse[]>('/api/v1/plantings'),
  })
}

export function useQuickAddPlanting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: QuickAddPlantingRequest) =>
      api.post<PlantedPlantResponse>('/api/v1/plantings', request),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: allPlantingsKey })
      if (variables.containerId) {
        queryClient.invalidateQueries({ queryKey: plantingsKey(variables.containerId) })
      }
    },
  })
}

// Removes a single planting from the dashboard inventory view, regardless of whether it's
// assigned to a container - takes the whole planting so it knows which container cache (if any)
// to invalidate alongside the inventory.
export function useDeleteInventoryPlanting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (planting: PlantedPlantResponse) => api.delete<void>(`/api/v1/plantings/${planting.id}`),
    onSuccess: (_data, planting) => {
      queryClient.invalidateQueries({ queryKey: allPlantingsKey })
      if (planting.containerId) {
        queryClient.invalidateQueries({ queryKey: plantingsKey(planting.containerId) })
      }
    },
  })
}

// Updates a planting by id where the id isn't known until submit time (e.g. the add flows use
// this to bump an existing matching entry's quantity instead of creating a duplicate row).
export function useUpdateInventoryPlanting() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, request }: { id: string; request: UpdatePlantedPlantRequest }) =>
      api.put<PlantedPlantResponse>(`/api/v1/plantings/${id}`, request),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: allPlantingsKey })
      if (updated.containerId) {
        queryClient.invalidateQueries({ queryKey: plantingsKey(updated.containerId) })
      }
    },
  })
}
