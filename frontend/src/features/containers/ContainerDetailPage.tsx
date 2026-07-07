import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useContainer, useDeleteContainer } from './api'
import { ContainerFormDialog } from './ContainerFormDialog'
import { useDeletePlanting, usePlantings } from '@/features/plantings/api'
import { PlantingFormDialog } from '@/features/plantings/PlantingFormDialog'
import type { PlantedPlantResponse } from '@/api/types'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { containerTypeLabel, plantingStatusLabel } from '@/lib/labels'

export function ContainerDetailPage() {
  const { gardenId, containerId } = useParams<{ gardenId: string; containerId: string }>()
  const navigate = useNavigate()
  const { data: container, isLoading: containerLoading } = useContainer(containerId!)
  const { data: plantings, isLoading: plantingsLoading } = usePlantings(containerId!)
  const deleteContainer = useDeleteContainer(gardenId!)
  const deletePlanting = useDeletePlanting(containerId!)

  const [editContainerOpen, setEditContainerOpen] = useState(false)
  const [createPlantingOpen, setCreatePlantingOpen] = useState(false)
  const [editingPlanting, setEditingPlanting] = useState<PlantedPlantResponse | null>(null)

  const handleDeleteContainer = () => {
    if (!container) return
    if (!window.confirm(`Delete "${container.name}"? This also deletes its plantings.`)) return
    deleteContainer.mutate(container.id, {
      onSuccess: () => {
        toast.success('Container deleted')
        navigate(`/gardens/${gardenId}`)
      },
      onError: (error) => toast.error(error.message),
    })
  }

  const handleDeletePlanting = (planting: PlantedPlantResponse) => {
    const label = planting.nickname ?? planting.plant.commonName
    if (!window.confirm(`Remove "${label}" from this container?`)) return
    deletePlanting.mutate(planting.id, {
      onSuccess: () => toast.success('Planting removed'),
      onError: (error) => toast.error(error.message),
    })
  }

  if (containerLoading) {
    return <Skeleton className="h-32" />
  }

  if (!container) {
    return <p className="text-muted-foreground">Container not found.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to={`/gardens/${gardenId}`} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to garden
      </Link>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold">{container.name}</h1>
            <Badge variant="secondary">{containerTypeLabel(container.containerType)}</Badge>
          </div>
          {container.sizeDescription && <p className="mt-1 text-muted-foreground">{container.sizeDescription}</p>}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setEditContainerOpen(true)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDeleteContainer}>
            Delete
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Plantings</h2>
          <Button onClick={() => setCreatePlantingOpen(true)}>Plan a planting</Button>
        </div>

        {plantingsLoading ? (
          <Skeleton className="h-24" />
        ) : plantings?.length === 0 ? (
          <p className="text-muted-foreground">Nothing planned here yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {plantings?.map((planting) => (
              <Card key={planting.id}>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between gap-2">
                    <Link to={`/plants/${planting.plant.id}`} className="hover:underline">
                      {planting.nickname ?? planting.plant.commonName}
                    </Link>
                    <Badge variant="secondary">{plantingStatusLabel(planting.status)}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  {planting.nickname && <p className="text-muted-foreground">{planting.plant.commonName}</p>}
                  <p>Quantity: {planting.quantity}</p>
                  {planting.plannedDate && <p>Planned for: {planting.plannedDate}</p>}
                  {planting.plantedDate && <p>Planted on: {planting.plantedDate}</p>}
                  {planting.notes && <p className="text-muted-foreground">{planting.notes}</p>}
                  <div className="mt-2 flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setEditingPlanting(planting)}>
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeletePlanting(planting)}>
                      Remove
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <ContainerFormDialog
        open={editContainerOpen}
        onOpenChange={setEditContainerOpen}
        gardenId={gardenId!}
        container={container}
      />
      <PlantingFormDialog open={createPlantingOpen} onOpenChange={setCreatePlantingOpen} containerId={containerId!} />
      {editingPlanting && (
        <PlantingFormDialog
          open={!!editingPlanting}
          onOpenChange={(open) => !open && setEditingPlanting(null)}
          containerId={containerId!}
          planting={editingPlanting}
        />
      )}
    </div>
  )
}
