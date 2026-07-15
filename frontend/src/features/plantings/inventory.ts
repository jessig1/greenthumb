import type { PlantedPlantResponse, PlantResponse } from '@/api/types'

export interface InventoryTag {
  label: string
  status: PlantedPlantResponse['status']
  quantity: number
  gardenId: string | null
  containerId: string | null
  plantings: PlantedPlantResponse[]
}

export interface InventoryItem {
  plantId: string
  plantName: string
  plant: PlantResponse
  totalQuantity: number
  tags: InventoryTag[]
}

// Groups a set of plantings by their underlying catalog plant, so the same plant grown in several
// locations shows up once with a tag per location (as determined by labelFor). Plantings that
// share both a location label and a status are further combined into a single tag with a summed
// quantity, so e.g. two separate "carrot, Planted" rows collapse into one ×2 tag. REMOVED plantings
// are no longer actually in the garden, so they're excluded from the inventory and its totals.
function buildInventory(
  plantings: PlantedPlantResponse[],
  labelFor: (planting: PlantedPlantResponse) => string,
): InventoryItem[] {
  const byPlant = new Map<string, InventoryItem>()
  const tagsByKey = new Map<string, Map<string, InventoryTag>>()

  for (const planting of plantings) {
    if (planting.status === 'REMOVED') continue

    const label = labelFor(planting)
    const tagKey = `${label}::${planting.status}`

    let item = byPlant.get(planting.plant.id)
    let tags = tagsByKey.get(planting.plant.id)
    if (!item || !tags) {
      item = {
        plantId: planting.plant.id,
        plantName: planting.plant.commonName,
        plant: planting.plant,
        totalQuantity: 0,
        tags: [],
      }
      tags = new Map<string, InventoryTag>()
      byPlant.set(planting.plant.id, item)
      tagsByKey.set(planting.plant.id, tags)
    }

    item.totalQuantity += planting.quantity

    const existingTag = tags.get(tagKey)
    if (existingTag) {
      existingTag.quantity += planting.quantity
      existingTag.plantings.push(planting)
    } else {
      const tag: InventoryTag = {
        label,
        status: planting.status,
        quantity: planting.quantity,
        gardenId: planting.gardenId,
        containerId: planting.containerId,
        plantings: [planting],
      }
      tags.set(tagKey, tag)
      item.tags.push(tag)
    }
  }

  return Array.from(byPlant.values()).sort((a, b) => a.plantName.localeCompare(b.plantName))
}

// Dashboard-wide inventory: tags are labeled by garden/container since plantings can come from
// anywhere the user owns.
export function buildPlantInventory(plantings: PlantedPlantResponse[]): InventoryItem[] {
  return buildInventory(plantings, (planting) =>
    planting.gardenName && planting.containerName
      ? `${planting.gardenName} / ${planting.containerName}`
      : 'Unassigned',
  )
}

// Single-garden inventory: the garden is already implied by the page, so tags are labeled by
// container alone.
export function buildGardenInventory(plantings: PlantedPlantResponse[]): InventoryItem[] {
  return buildInventory(plantings, (planting) => planting.containerName ?? 'Unassigned')
}
