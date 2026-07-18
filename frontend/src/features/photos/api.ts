import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type { PhotoEntityType, PhotoResponse } from '@/api/types'

const ENTITY_PATH_SEGMENT: Record<PhotoEntityType, string> = {
  GARDEN: 'gardens',
  CONTAINER: 'containers',
  PLANTED_PLANT: 'plantings',
}

function photosPath(entityType: PhotoEntityType, entityId: string): string {
  return `/api/v1/${ENTITY_PATH_SEGMENT[entityType]}/${entityId}/photos`
}

const photosKey = (entityType: PhotoEntityType, entityId: string) => ['photos', entityType, entityId] as const

export function usePhotos(entityType: PhotoEntityType, entityId: string) {
  return useQuery({
    queryKey: photosKey(entityType, entityId),
    queryFn: () => api.get<PhotoResponse[]>(photosPath(entityType, entityId)),
  })
}

export function useUploadPhoto(entityType: PhotoEntityType, entityId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ file, caption }: { file: File; caption: string }) => {
      const formData = new FormData()
      formData.append('file', file)
      if (caption) formData.append('caption', caption)
      return api.postForm<PhotoResponse>(photosPath(entityType, entityId), formData)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: photosKey(entityType, entityId) }),
  })
}

export function useDeletePhoto(entityType: PhotoEntityType, entityId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (photoId: string) => api.delete<void>(`/api/v1/photos/${photoId}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: photosKey(entityType, entityId) }),
  })
}
