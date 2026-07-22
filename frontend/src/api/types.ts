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

export type PlantLifeCycle = 'ANNUAL' | 'PERENNIAL' | 'BIENNIAL'

export type PlantCareDifficulty = 'EASY' | 'MEDIUM' | 'HARD'

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
  lifeCycle: PlantLifeCycle | null
  careDifficulty: PlantCareDifficulty | null
  lightRequirement: LightRequirement
  lightNotes: string | null
  temperatureNotes: string | null
  wateringIntervalDays: number | null
  wateringNotes: string | null
  soilNotes: string | null
  feedingNotes: string | null
  pruningNotes: string | null
  toxicityNotes: string | null
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

export type PhotoEntityType = 'GARDEN' | 'CONTAINER' | 'PLANTED_PLANT'

export interface PhotoResponse {
  id: string
  entityType: PhotoEntityType
  entityId: string
  url: string
  contentType: string
  caption: string | null
  createdAt: string
}

export interface IdentifyPlantResponse {
  suggestedCommonName: string | null
  suggestedScientificName: string | null
  suggestedCategory: string | null
  suggestedLifeCycle: string | null
  suggestedCareDifficulty: string | null
  light: string | null
  temperature: string | null
  soil: string | null
  watering: string | null
  fertilizer: string | null
  pruning: string | null
  pestManagement: string | null
  toxicity: string | null
  other: string | null
  notes: string | null
  matchedPlantId: string | null
  addedToCatalog: boolean
  recommendedGardenIds: string[]
  gardenFitNotes: string | null
}

export interface PlantIdentificationRecord {
  id: string
  suggestedCommonName: string | null
  suggestedScientificName: string | null
  matchedPlantId: string | null
  addedToCatalog: boolean
  createdAt: string
}

export interface PlantDiagnosisResponse {
  id: string
  plantedPlantId: string
  photoId: string | null
  resultText: string
  createdAt: string
}

export interface PlanningAssistantRequest {
  question: string
}

export interface PlanningAssistantResponse {
  answer: string
}
