export type GardenType = 'INDOOR' | 'OUTDOOR'

export type GardenLightSource = 'GROW_LAMP' | 'WINDOW' | 'FULL_SUN' | 'PARTIAL_SUN' | 'OTHER'

export type GardenLightExposure =
  | 'NORTH_FACING'
  | 'SOUTH_FACING'
  | 'EAST_FACING'
  | 'WEST_FACING'
  | 'DIRECT'
  | 'INDIRECT'
  | 'OTHER'

export type ClimateZone =
  | 'ZONE_1A'
  | 'ZONE_1B'
  | 'ZONE_2A'
  | 'ZONE_2B'
  | 'ZONE_3A'
  | 'ZONE_3B'
  | 'ZONE_4A'
  | 'ZONE_4B'
  | 'ZONE_5A'
  | 'ZONE_5B'
  | 'ZONE_6A'
  | 'ZONE_6B'
  | 'ZONE_7A'
  | 'ZONE_7B'
  | 'ZONE_8A'
  | 'ZONE_8B'
  | 'ZONE_9A'
  | 'ZONE_9B'
  | 'ZONE_10A'
  | 'ZONE_10B'
  | 'ZONE_11A'
  | 'ZONE_11B'
  | 'ZONE_12A'
  | 'ZONE_12B'
  | 'ZONE_13A'
  | 'ZONE_13B'

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
  lightSource: GardenLightSource | null
  lightHoursPerDay: number | null
  lightExposure: GardenLightExposure | null
  city: string | null
  state: string | null
  zipCode: string | null
  climateZone: ClimateZone | null
  lastFrostDate: string | null
  firstFrostDate: string | null
  createdAt: string
  updatedAt: string
}

export interface CreateGardenRequest {
  name: string
  type: GardenType
  description: string | null
  lightSource: GardenLightSource | null
  lightHoursPerDay: number | null
  lightExposure: GardenLightExposure | null
  city: string | null
  state: string | null
  zipCode: string | null
  climateZone: ClimateZone | null
  lastFrostDate: string | null
  firstFrostDate: string | null
}

export type UpdateGardenRequest = CreateGardenRequest

export interface ContainerResponse {
  id: string
  gardenId: string
  name: string
  containerType: ContainerType
  sizeDescription: string | null
  soilNotes: string | null
  createdAt: string
}

export interface CreateContainerRequest {
  name: string
  containerType: ContainerType
  sizeDescription: string | null
  soilNotes: string | null
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
