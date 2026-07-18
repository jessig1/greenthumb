import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import type { PlantingStatus } from '@/api/types'
import { useContainer, useDeleteContainer } from './api'
import { ContainerFormDialog } from './ContainerFormDialog'
import { useDeletePlanting, usePlantings } from '@/features/plantings/api'
import { AddPlantsDialog } from '@/features/plantings/AddPlantsDialog'
import { PlantingFormDialog } from '@/features/plantings/PlantingFormDialog'
import { groupDuplicatePlantings, type PlantingGroup } from '@/features/plantings/duplicates'
import { usePhotos, useDeletePhoto } from '@/features/photos/api'
import { PhotoGallery } from '@/features/photos/PhotoGallery'
import { PhotoUploadDialog } from '@/features/photos/PhotoUploadDialog'
import { PlantDiagnosisDialog } from '@/features/ai/PlantDiagnosisDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { containerTypeLabel, plantingStatusLabel } from '@/lib/labels'

const STATUS_SECTION_ORDER: PlantingStatus[] = ['PLANNED', 'PLANTED', 'HARVESTED', 'REMOVED']

export function ContainerDetailPage() {
  const { gardenId, containerId } = useParams<{ gardenId: string; containerId: string }>()
  const navigate = useNavigate()
  const { data: container, isLoading: containerLoading } = useContainer(containerId!)
  const { data: plantings, isLoading: plantingsLoading } = usePlantings(containerId!)
  const { data: containerPhotos } = usePhotos('CONTAINER', containerId!)
  const deleteContainer = useDeleteContainer(gardenId!)
  const deletePlanting = useDeletePlanting(containerId!)
  const deleteContainerPhoto = useDeletePhoto('CONTAINER', containerId!)

  const groups = useMemo(() => groupDuplicatePlantings(plantings ?? []), [plantings])

  // Section the already-quantity-combined groups by status (e.g. two planted carrots stay one
  // "Carrot ×2" card, filed under the Planted section), in a fixed lifecycle order.
  const groupsByStatus = useMemo(() => {
    const map = new Map<PlantingStatus, PlantingGroup[]>()
    for (const group of groups) {
      const list = map.get(group.representative.status)
      if (list) {
        list.push(group)
      } else {
        map.set(group.representative.status, [group])
      }
    }
    return map
  }, [groups])

  const [editContainerOpen, setEditContainerOpen] = useState(false)
  const [addPlantsOpen, setAddPlantsOpen] = useState(false)
  const [uploadPhotoOpen, setUploadPhotoOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<PlantingGroup | null>(null)
  const [photosGroup, setPhotosGroup] = useState<PlantingGroup | null>(null)

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
          {container.soilNotes && (
            <p className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium text-foreground">Soil:</span> {container.soilNotes}
            </p>
          )}
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

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Photos</h2>
          <Button variant="outline" size="sm" onClick={() => setUploadPhotoOpen(true)}>
            Add photo
          </Button>
        </div>
        <PhotoGallery
          photos={containerPhotos ?? []}
          onDelete={(photoId) => deleteContainerPhoto.mutate(photoId)}
        />
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
          <div className="flex flex-col gap-6">
            {STATUS_SECTION_ORDER.filter((status) => groupsByStatus.has(status)).map((status) => (
              <div key={status} className="flex flex-col gap-3">
                <h3 className="text-sm font-semibold text-muted-foreground">{plantingStatusLabel(status)}</h3>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {groupsByStatus.get(status)!.map((group) => {
                    const { representative } = group
                    return (
                      <Card key={group.key}>
                        <CardHeader>
                          <CardTitle className="flex items-center justify-between gap-2">
                            <Link
                              to={`/plants/${representative.plant.id}`}
                              state={{
                                from: `/gardens/${gardenId}/containers/${containerId}`,
                                fromLabel: container?.name ?? 'container',
                              }}
                              className="hover:underline"
                            >
                              {representative.nickname ?? representative.plant.commonName}
                            </Link>
                            <Badge variant="secondary">×{group.totalQuantity}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-2 text-sm">
                          {representative.nickname && (
                            <p className="text-muted-foreground">{representative.plant.commonName}</p>
                          )}
                          {representative.plannedDate && <p>Planned for: {representative.plannedDate}</p>}
                          {representative.plantedDate && <p>Planted on: {representative.plantedDate}</p>}
                          {representative.notes && <p className="text-muted-foreground">{representative.notes}</p>}
                          <div className="mt-2 flex gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingGroup(group)}>
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setPhotosGroup(group)}>
                              Photos
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
              </div>
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
      <AddPlantsDialog open={addPlantsOpen} onOpenChange={setAddPlantsOpen} containerId={containerId!} />
      <PhotoUploadDialog
        open={uploadPhotoOpen}
        onOpenChange={setUploadPhotoOpen}
        entityType="CONTAINER"
        entityId={containerId!}
      />
      {photosGroup && (
        <PlantDiagnosisDialog
          open={!!photosGroup}
          onOpenChange={(open) => !open && setPhotosGroup(null)}
          plantingId={photosGroup.representative.id}
          plantingLabel={photosGroup.representative.nickname ?? photosGroup.representative.plant.commonName}
        />
      )}
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
