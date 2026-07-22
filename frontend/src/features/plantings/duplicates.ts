import type { PlantedPlantResponse, PlantingStatus } from '@/api/types'

export interface PlantingGroup {
  key: string
  representative: PlantedPlantResponse
  totalQuantity: number
  plantings: PlantedPlantResponse[]
}

function groupingKey(plantId: string, nickname: string | null, status: PlantingStatus, notes: string | null): string {
  return [plantId, nickname ?? '', status, notes ?? ''].join('::')
}

// Combines plantings within a single container that represent "the same entry" - same plant,
// nickname, status, and notes - into one group, so duplicate rows (e.g. from adding the same plant
// twice before this module's create-time merge existed, or any other stragglers) collapse into a
// single card with a summed quantity. Deliberately ignores plannedDate/plantedDate: the add flows
// stamp those with "today" independent of any existing entry, so requiring an exact date match
// would defeat the merge for the most common case.
export function groupDuplicatePlantings(plantings: PlantedPlantResponse[]): PlantingGroup[] {
  const groups = new Map<string, PlantingGroup>()

  for (const planting of plantings) {
    const key = groupingKey(planting.plant.id, planting.nickname, planting.status, planting.notes)

    const existing = groups.get(key)
    if (existing) {
      existing.totalQuantity += planting.quantity
      existing.plantings.push(planting)
    } else {
      groups.set(key, { key, representative: planting, totalQuantity: planting.quantity, plantings: [planting] })
    }
  }

  return Array.from(groups.values())
}

// Finds an existing planting that a new add of the same plant/status/nickname/notes should be
// folded into (by bumping its quantity) instead of creating a new row alongside it. Container is
// matched separately since callers may or may not have it on the candidate list already. gardenId
// only comes into play when there's no container to match on - a container's garden is implied by
// the container itself, but two containerless plantings in different gardens must NOT merge.
export function findMatchingPlanting(
  plantings: PlantedPlantResponse[],
  criteria: {
    plantId: string
    containerId: string | null
    gardenId: string | null
    status: PlantingStatus
    nickname: string | null
    notes: string | null
  },
): PlantedPlantResponse | undefined {
  return plantings.find(
    (p) =>
      p.plant.id === criteria.plantId &&
      (p.containerId ?? null) === criteria.containerId &&
      (criteria.containerId !== null || (p.gardenId ?? null) === criteria.gardenId) &&
      p.status === criteria.status &&
      (p.nickname ?? null) === (criteria.nickname ?? null) &&
      (p.notes ?? null) === (criteria.notes ?? null),
  )
}
