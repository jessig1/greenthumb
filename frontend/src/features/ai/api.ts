import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { api } from '@/api/client'
import type {
  IdentifyPlantResponse,
  PlanningAssistantRequest,
  PlanningAssistantResponse,
  PlantDiagnosisResponse,
  PlantIdentificationRecord,
} from '@/api/types'

const recentIdentificationsKey = ['plant-identifications', 'recent'] as const

export function useIdentifyPlant() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('file', file)
      return api.postForm<IdentifyPlantResponse>('/api/v1/ai/identify-plant', formData)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: recentIdentificationsKey }),
  })
}

export function useRecentIdentifications() {
  return useQuery({
    queryKey: recentIdentificationsKey,
    queryFn: () => api.get<PlantIdentificationRecord[]>('/api/v1/plant-identifications'),
  })
}

const diagnosesKey = (plantingId: string) => ['plantings', plantingId, 'diagnoses'] as const

export function useDiagnoses(plantingId: string) {
  return useQuery({
    queryKey: diagnosesKey(plantingId),
    queryFn: () => api.get<PlantDiagnosisResponse[]>(`/api/v1/plantings/${plantingId}/diagnoses`),
  })
}

export function useDiagnosePhoto(plantingId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (photoId: string) =>
      api.post<PlantDiagnosisResponse>(`/api/v1/plantings/${plantingId}/photos/${photoId}/diagnose`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: diagnosesKey(plantingId) }),
  })
}

export function useCareSuggestions(plantingId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => api.post<PlantDiagnosisResponse>(`/api/v1/plantings/${plantingId}/care-suggestions`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: diagnosesKey(plantingId) }),
  })
}

export function usePlanningAssistant(gardenId: string) {
  return useMutation({
    mutationFn: (request: PlanningAssistantRequest) =>
      api.post<PlanningAssistantResponse>(`/api/v1/gardens/${gardenId}/planning-assistant`, request),
  })
}
