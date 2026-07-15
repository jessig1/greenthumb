export type GardenType = 'INDOOR' | 'OUTDOOR'

export type ContainerType = 'RAISED_BED' | 'POT' | 'IN_GROUND' | 'WINDOW_BOX' | 'HANGING' | 'OTHER'

export type PlantCategory = 'VEGETABLE' | 'HERB' | 'FLOWER' | 'FRUIT' | 'HOUSEPLANT' | 'OTHER'

export type LightRequirement = 'FULL_SUN' | 'PARTIAL_SHADE' | 'FULL_SHADE'

export type PlantingStatus = 'PLANNED' | 'PLANTED' | 'HARVESTED' | 'REMOVED'

export interface AppUserResponse {
  id: string
  email: string
  displayName: string | null
}

export interface RegisterRequest {
  email: string
  password: string
  displayName: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface AuthResponse {
  token: string
  user: AppUserResponse
}

export interface GardenResponse {
  id: string
  name: string
  type: GardenType
  description: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateGardenRequest {
  name: string
  type: GardenType
  description: string | null
}

export type UpdateGardenRequest = CreateGardenRequest

export interface ContainerResponse {
  id: string
  gardenId: string
  name: string
  containerType: ContainerType
  sizeDescription: string | null
  createdAt: string
}

export interface CreateContainerRequest {
  name: string
  containerType: ContainerType
  sizeDescription: string | null
}

export type UpdateContainerRequest = CreateContainerRequest

export interface PlantResponse {
  id: string
  commonName: string
  scientificName: string | null
  category: PlantCategory
  description: string | null
  lightRequirement: LightRequirement
  lightNotes: string | null
  wateringIntervalDays: number | null
  wateringNotes: string | null
  soilNotes: string | null
  feedingNotes: string | null
  pruningNotes: string | null
  harvestable: boolean
  daysToMaturityMin: number | null
  daysToMaturityMax: number | null
  harvestNotes: string | null
  imageUrl: string | null
}

export interface PlantedPlantResponse {
  id: string
  containerId: string | null
  containerName: string | null
  gardenId: string | null
  gardenName: string | null
  plant: PlantResponse
  nickname: string | null
  quantity: number
  plannedDate: string | null
  plantedDate: string | null
  status: PlantingStatus
  notes: string | null
  createdAt: string
  updatedAt: string
}

export interface CreatePlantedPlantRequest {
  plantId: string
  nickname: string | null
  quantity: number
  plannedDate: string | null
  plantedDate: string | null
  status: PlantingStatus | null
  notes: string | null
}

export interface UpdatePlantedPlantRequest {
  nickname: string | null
  quantity: number
  plannedDate: string | null
  plantedDate: string | null
  status: PlantingStatus
  notes: string | null
}

export interface QuickAddPlantingRequest {
  plantId: string
  containerId: string | null
  status: PlantingStatus
  quantity: number
}
