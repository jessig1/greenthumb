import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { useContainer, useDeleteContainer } from './api'
import { ContainerFormDialog } from './ContainerFormDialog'
import { useDeletePlanting, usePlantings } from '@/features/plantings/api'
import { AddPlantsDialog } from '@/features/plantings/AddPlantsDialog'
import { PlantingFormDialog } from '@/features/plantings/PlantingFormDialog'
import { groupDuplicatePlantings, type PlantingGroup } from '@/features/plantings/duplicates'
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

  const groups = useMemo(() => groupDuplicatePlantings(plantings ?? []), [plantings])

  const [editContainerOpen, setEditContainerOpen] = useState(false)
  const [addPlantsOpen, setAddPlantsOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<PlantingGroup | null>(null)

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

  const handleDeleteGroup = (group: PlantingGroup) => {
    const label = group.representative.nickname ?? group.representative.plant.commonName
    if (!window.confirm(`Remove "${label}" from this container?`)) return
    for (const planting of group.plantings) {
      deletePlanting.mutate(planting.id, {
        onError: (error) => toast.error(error.message),
      })
    }
    toast.success('Planting removed')
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
          <Button onClick={() => setAddPlantsOpen(true)}>Add Plants</Button>
        </div>

        {plantingsLoading ? (
          <Skeleton className="h-24" />
        ) : groups.length === 0 ? (
          <p className="text-muted-foreground">Nothing planned here yet.</p>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {groups.map((group) => {
              const { representative } = group
              return (
                <Card key={group.key}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                      <Link to={`/plants/${representative.plant.id}`} className="hover:underline">
                        {representative.nickname ?? representative.plant.commonName}
                      </Link>
                      <Badge variant="secondary">{plantingStatusLabel(representative.status)}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2 text-sm">
                    {representative.nickname && (
                      <p className="text-muted-foreground">{representative.plant.commonName}</p>
                    )}
                    <p>Quantity: {group.totalQuantity}</p>
                    {representative.plannedDate && <p>Planned for: {representative.plannedDate}</p>}
                    {representative.plantedDate && <p>Planted on: {representative.plantedDate}</p>}
                    {representative.notes && <p className="text-muted-foreground">{representative.notes}</p>}
                    <div className="mt-2 flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => setEditingGroup(group)}>
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDeleteGroup(group)}>
                        Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      <ContainerFormDialog
        open={editContainerOpen}
        onOpenChange={setEditContainerOpen}
        gardenId={gardenId!}
        container={container}
      />
      <AddPlantsDialog open={addPlantsOpen} onOpenChange={setAddPlantsOpen} containerId={containerId!} />
      {editingGroup && (
        <PlantingFormDialog
          open={!!editingGroup}
          onOpenChange={(open) => !open && setEditingGroup(null)}
          containerId={containerId!}
          planting={{ ...editingGroup.representative, quantity: editingGroup.totalQuantity }}
          onSaved={() => {
            // The dialog just saved the merged quantity onto the representative row - the other
            // rows that were folded into this group are now redundant duplicates, so drop them.
            for (const duplicate of editingGroup.plantings.slice(1)) {
              deletePlanting.mutate(duplicate.id)
            }
          }}
        />
      )}
    </div>
  )
}
