import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import type { PlantedPlantResponse } from '@/api/types'
import { useGardens } from './api'
import { NewGardenWizardDialog } from './NewGardenWizardDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { gardenTypeLabel } from '@/lib/labels'
import { QuickAddPlantDialog } from '@/features/plantings/QuickAddPlantDialog'
import { PlantInventoryList } from '@/features/plantings/PlantInventoryList'
import { useAllPlantings, useDeleteInventoryPlanting } from '@/features/plantings/api'
import { buildPlantInventory } from '@/features/plantings/inventory'

export function GardensListPage() {
  const { data: gardens, isLoading } = useGardens()
  const { data: allPlantings } = useAllPlantings()
  const deleteInventoryPlanting = useDeleteInventoryPlanting()
  const [createOpen, setCreateOpen] = useState(false)
  const [addPlantOpen, setAddPlantOpen] = useState(false)

  const inventory = useMemo(() => buildPlantInventory(allPlantings ?? []), [allPlantings])
  const totalQuantity = inventory.reduce((sum, item) => sum + item.totalQuantity, 0)

  const plantCountByGarden = useMemo(() => {
    const counts = new Map<string, number>()
    for (const planting of allPlantings ?? []) {
      if (planting.status === 'REMOVED' || !planting.gardenId) continue
      counts.set(planting.gardenId, (counts.get(planting.gardenId) ?? 0) + planting.quantity)
    }
    return counts
  }, [allPlantings])

  const handleRemoveTag = (plantings: PlantedPlantResponse[]) => {
    for (const planting of plantings) {
      deleteInventoryPlanting.mutate(planting, {
        onError: (error: Error) => toast.error(error.message),
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Your gardens</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddPlantOpen(true)}>
            Add plant
          </Button>
          <Button onClick={() => setCreateOpen(true)}>New garden</Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : gardens?.length === 0 ? (
        <p className="text-muted-foreground">
          No gardens yet. Create one to start planning what to plant where.
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {gardens?.map((garden) => (
            <Link key={garden.id} to={`/gardens/${garden.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <span>{garden.name}</span>
                    <Badge variant="secondary">{gardenTypeLabel(garden.type)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {garden.description && <p className="line-clamp-2">{garden.description}</p>}
                  {(garden.city || garden.state) && <p>{[garden.city, garden.state].filter(Boolean).join(', ')}</p>}
                  <p>{plantCountByGarden.get(garden.id) ?? 0} plants</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {inventory.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium">Plant inventory</h2>
            <span className="text-sm text-muted-foreground">{totalQuantity} plants total</span>
          </div>
          <Card>
            <CardContent className="py-1">
              <PlantInventoryList inventory={inventory} onRemoveTag={handleRemoveTag} />
            </CardContent>
          </Card>
        </div>
      )}

      <NewGardenWizardDialog open={createOpen} onOpenChange={setCreateOpen} />
      <QuickAddPlantDialog open={addPlantOpen} onOpenChange={setAddPlantOpen} />
    </div>
  )
}
