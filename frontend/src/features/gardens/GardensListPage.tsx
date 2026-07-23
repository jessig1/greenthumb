import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import { House, MapPin, Plus, Sprout, TreeDeciduous } from 'lucide-react'
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
import { RecentIdentifications } from '@/features/ai/RecentIdentifications'

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
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">Your gardens</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setAddPlantOpen(true)}>
            Add plant
          </Button>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus data-icon="inline-start" />
            New garden
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : gardens?.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Sprout className="size-6" />
            </div>
            <div>
              <p className="font-medium">No gardens yet</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Create one to start planning what to plant where.
              </p>
            </div>
            <Button onClick={() => setCreateOpen(true)}>
              <Plus data-icon="inline-start" />
              New garden
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {gardens?.map((garden) => {
            const TypeIcon = garden.type === 'INDOOR' ? House : TreeDeciduous
            const plantCount = plantCountByGarden.get(garden.id) ?? 0
            return (
              <Link key={garden.id} to={`/gardens/${garden.id}`}>
                <Card className="h-full transition-all hover:border-primary/40 hover:shadow-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2.5">
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <TypeIcon className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1 truncate">{garden.name}</span>
                      <Badge variant="secondary">{gardenTypeLabel(garden.type)}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-1.5 text-sm text-muted-foreground">
                    {garden.description && <p className="line-clamp-2">{garden.description}</p>}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                      {(garden.city || garden.state) && (
                        <span className="flex items-center gap-1">
                          <MapPin className="size-3.5" />
                          {[garden.city, garden.state].filter(Boolean).join(', ')}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Sprout className="size-3.5" />
                        {plantCount} {plantCount === 1 ? 'plant' : 'plants'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {inventory.length > 0 && (
        <div className="flex flex-col gap-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
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

      <RecentIdentifications />

      <NewGardenWizardDialog open={createOpen} onOpenChange={setCreateOpen} />
      <QuickAddPlantDialog open={addPlantOpen} onOpenChange={setAddPlantOpen} />
    </div>
  )
}
