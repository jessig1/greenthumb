import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { XIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { PlantedPlantResponse } from '@/api/types'
import { useGardens } from './api'
import { NewGardenWizardDialog } from './NewGardenWizardDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { gardenTypeLabel, plantingStatusLabel } from '@/lib/labels'
import { QuickAddPlantDialog } from '@/features/plantings/QuickAddPlantDialog'
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

  const handleRemove = (plantings: PlantedPlantResponse[]) => {
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
                {garden.description && (
                  <CardContent className="text-sm text-muted-foreground">{garden.description}</CardContent>
                )}
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
          <div className="flex flex-col gap-2">
            {inventory.map((item) => (
              <Card key={item.plantId}>
                <CardContent className="flex flex-col gap-2 py-3">
                  <div className="flex items-center justify-between gap-2">
                    <Link to={`/plants/${item.plantId}`} className="font-medium hover:underline">
                      {item.plantName}
                    </Link>
                    <Badge variant="secondary">{item.totalQuantity} total</Badge>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {item.tags.map((tag) => (
                      <div
                        key={`${tag.label}::${tag.status}`}
                        className="flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs"
                      >
                        <span>{tag.label}</span>
                        <span className="text-muted-foreground">×{tag.quantity}</span>
                        <Badge variant="secondary">{plantingStatusLabel(tag.status)}</Badge>
                        <button
                          type="button"
                          className="text-muted-foreground hover:text-foreground"
                          onClick={() => handleRemove(tag.plantings)}
                        >
                          <XIcon className="size-3" />
                          <span className="sr-only">Remove</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <NewGardenWizardDialog open={createOpen} onOpenChange={setCreateOpen} />
      <QuickAddPlantDialog open={addPlantOpen} onOpenChange={setAddPlantOpen} />
    </div>
  )
}
