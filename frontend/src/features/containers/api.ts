import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { ContainerResponse, CreateContainerRequest, UpdateContainerRequest } from '@/api/types'

const containersKey = (gardenId: string) => ['gardens', gardenId, 'containers'] as const
const containerKey = (id: string) => ['containers', id] as const

export function useContainers(gardenId: string, enabled = true) {
  return useQuery({
    queryKey: containersKey(gardenId),
    queryFn: () => api.get<ContainerResponse[]>(`/api/v1/gardens/${gardenId}/containers`),
    enabled: enabled && Boolean(gardenId),
  })
}

export function useContainer(id: string) {
  return useQuery({
    queryKey: containerKey(id),
    queryFn: () => api.get<ContainerResponse>(`/api/v1/containers/${id}`),
  })
}

export function useCreateContainer(gardenId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: CreateContainerRequest) =>
      api.post<ContainerResponse>(`/api/v1/gardens/${gardenId}/containers`, request),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: containersKey(gardenId) }),
  })
}

export function useUpdateContainer(id: string, gardenId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (request: UpdateContainerRequest) => api.put<ContainerResponse>(`/api/v1/containers/${id}`, request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: containersKey(gardenId) })
      queryClient.invalidateQueries({ queryKey: containerKey(id) })
    },
  })
}

export function useDeleteContainer(gardenId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => api.delete<void>(`/api/v1/containers/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: containersKey(gardenId) }),
  })
}
