import { useMemo, useState } from 'react'
import { ArrowLeft, Camera, Layers3, Pencil, Plus, Sprout, Trash2 } from 'lucide-react'
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

const STATUS_STYLES: Record<PlantingStatus, string> = {
  PLANNED: 'bg-sky-100 text-sky-700',
  PLANTED: 'bg-emerald-100 text-emerald-700',
  HARVESTED: 'bg-amber-100 text-amber-700',
  REMOVED: 'bg-stone-100 text-stone-600',
}

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
  const groupsByStatus = useMemo(() => {
    const map = new Map<PlantingStatus, PlantingGroup[]>()
    for (const group of groups) {
      const list = map.get(group.representative.status)
      if (list) list.push(group)
      else map.set(group.representative.status, [group])
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
      deletePlanting.mutate(planting.id, { onError: (error) => toast.error(error.message) })
    }
    toast.success('Planting removed')
  }

  if (containerLoading) return <Skeleton className="h-64 rounded-3xl" />
  if (!container) return <p className="text-muted-foreground">Container not found.</p>

  return (
    <div className="flex flex-col gap-8">
      <Link
        to={`/gardens/${gardenId}`}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to garden
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-accent/85 via-card to-secondary/70 p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -bottom-20 size-56 rounded-full bg-primary/8" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <Layers3 className="size-5" />
              </span>
              <Badge variant="secondary">{containerTypeLabel(container.containerType)}</Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{container.name}</h1>
            {container.sizeDescription && <p className="mt-2 text-muted-foreground">{container.sizeDescription}</p>}
            {container.soilNotes && (
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-muted-foreground">
                <span className="font-semibold text-foreground">Soil:</span> {container.soilNotes}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={() => setEditContainerOpen(true)} aria-label="Edit container">
              <Pencil />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDeleteContainer} aria-label="Delete container">
              <Trash2 />
            </Button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Progress journal</p>
            <h2 className="section-title mt-1">Container photos</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setUploadPhotoOpen(true)}>
            <Camera />
            Add photo
          </Button>
        </div>
        <PhotoGallery photos={containerPhotos ?? []} onDelete={(photoId) => deleteContainerPhoto.mutate(photoId)} />
      </section>

      <section className="flex flex-col gap-5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Growing here</p>
            <h2 className="section-title mt-1">Plantings</h2>
          </div>
          <Button onClick={() => setAddPlantsOpen(true)}>
            <Plus />
            Add plants
          </Button>
        </div>

        {plantingsLoading ? (
          <Skeleton className="h-32 rounded-2xl" />
        ) : groups.length === 0 ? (
          <div className="surface-panel flex flex-col items-center px-5 py-10 text-center">
            <Sprout className="size-7 text-primary" />
            <p className="mt-3 font-semibold">Nothing growing here yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Plan a planting or add something already in the soil.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-7">
            {STATUS_SECTION_ORDER.filter((status) => groupsByStatus.has(status)).map((status) => (
              <div key={status} className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                  <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[status]}`}>
                    {plantingStatusLabel(status)}
                  </span>
                  <span className="text-xs text-muted-foreground">{groupsByStatus.get(status)!.length} varieties</span>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {groupsByStatus.get(status)!.map((group) => {
                    const { representative } = group
                    return (
                      <Card key={group.key} className="transition-all hover:border-primary/20 hover:shadow-md">
                        <CardHeader>
                          <CardTitle className="flex items-start justify-between gap-2">
                            <div>
                              <Link
                                to={`/plants/${representative.plant.id}`}
                                state={{
                                  from: `/gardens/${gardenId}/containers/${containerId}`,
                                  fromLabel: container.name,
                                }}
                                className="transition-colors hover:text-primary"
                              >
                                {representative.nickname ?? representative.plant.commonName}
                              </Link>
                              {representative.nickname && (
                                <p className="mt-1 text-xs font-normal text-muted-foreground">{representative.plant.commonName}</p>
                              )}
                            </div>
                            <Badge variant="secondary">×{group.totalQuantity}</Badge>
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-3 text-sm">
                          <div className="space-y-1 text-muted-foreground">
                            {representative.plannedDate && <p>Planned for {representative.plannedDate}</p>}
                            {representative.plantedDate && <p>Planted on {representative.plantedDate}</p>}
                            {representative.notes && <p className="line-clamp-2">{representative.notes}</p>}
                          </div>
                          <div className="flex flex-wrap gap-2 border-t border-border/60 pt-3">
                            <Button size="sm" variant="outline" onClick={() => setEditingGroup(group)}>Edit</Button>
                            <Button size="sm" variant="outline" onClick={() => setPhotosGroup(group)}>
                              <Camera />
                              Photos & AI
                            </Button>
                            <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleDeleteGroup(group)}>
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
      </section>

      <ContainerFormDialog open={editContainerOpen} onOpenChange={setEditContainerOpen} gardenId={gardenId!} container={container} />
      <AddPlantsDialog open={addPlantsOpen} onOpenChange={setAddPlantsOpen} containerId={containerId!} />
      <PhotoUploadDialog open={uploadPhotoOpen} onOpenChange={setUploadPhotoOpen} entityType="CONTAINER" entityId={containerId!} />
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
            for (const duplicate of editingGroup.plantings.slice(1)) deletePlanting.mutate(duplicate.id)
          }}
        />
      )}
    </div>
  )
}
