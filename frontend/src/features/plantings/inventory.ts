import type { PlantedPlantResponse } from '@/api/types'

export interface InventoryTag {
  label: string
  status: PlantedPlantResponse['status']
  quantity: number
  plantings: PlantedPlantResponse[]
}

export interface InventoryItem {
  plantId: string
  plantName: string
  totalQuantity: number
  tags: InventoryTag[]
}

// Groups every planting the user owns by its underlying catalog plant, so the same plant grown in
// several gardens/containers shows up once with a tag per location. Plantings that share both a
// location and a status are further combined into a single tag with a summed quantity, so e.g. two
// separate "carrot in Kitchen2 / Hanging baskets, Planned" rows collapse into one ×2 tag. REMOVED
// plantings are no longer actually in the garden, so they're excluded from the inventory and its
// totals.
export function buildPlantInventory(plantings: PlantedPlantResponse[]): InventoryItem[] {
  const byPlant = new Map<string, InventoryItem>()
  const tagsByKey = new Map<string, Map<string, InventoryTag>>()

  for (const planting of plantings) {
    if (planting.status === 'REMOVED') continue

    const label =
      planting.gardenName && planting.containerName
        ? `${planting.gardenName} / ${planting.containerName}`
        : 'Unassigned'
    const tagKey = `${label}::${planting.status}`

    let item = byPlant.get(planting.plant.id)
    let tags = tagsByKey.get(planting.plant.id)
    if (!item || !tags) {
      item = { plantId: planting.plant.id, plantName: planting.plant.commonName, totalQuantity: 0, tags: [] }
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
      const tag: InventoryTag = { label, status: planting.status, quantity: planting.quantity, plantings: [planting] }
      tags.set(tagKey, tag)
      item.tags.push(tag)
    }
  }

  return Array.from(byPlant.values()).sort((a, b) => a.plantName.localeCompare(b.plantName))
}
