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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { containerTypeLabel, plantingStatusLabel } from '@/lib/labels'
import {
  ArrowLeft,
  Box,
  Edit3,
  Trash2,
  Camera,
  Plus,
  Sprout,
  Calendar,
  Sparkles,
} from 'lucide-react'

const STATUS_SECTION_ORDER: PlantingStatus[] = ['PLANNED', 'PLANTED', 'HARVESTED', 'REMOVED']

const STATUS_BADGE_STYLES: Record<PlantingStatus, string> = {
  PLANNED: 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30',
  PLANTED: 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/30',
  HARVESTED: 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30',
  REMOVED: 'bg-muted text-muted-foreground border-border',
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
    return <Skeleton className="h-40 rounded-2xl" />
  }

  if (!container) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-muted-foreground">Container not found.</p>
        <Link to={`/gardens/${gardenId}`} className="text-sm font-semibold text-emerald-600 hover:underline">
          Return to Garden
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Back Link */}
      <Link
        to={`/gardens/${gardenId}`}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Garden</span>
      </Link>

      {/* Container Header Banner */}
      <Card className="rounded-2xl border-border/70 shadow-sm glass-card overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <Box className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{container.name}</h1>
                <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border-emerald-500/30 text-xs">
                  {containerTypeLabel(container.containerType)}
                </Badge>
              </div>
              {container.sizeDescription && (
                <p className="text-xs text-muted-foreground font-medium pl-1">{container.sizeDescription}</p>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => setEditContainerOpen(true)} className="gap-1.5 text-xs rounded-xl">
                <Edit3 className="h-3.5 w-3.5" />
                <span>Edit</span>
              </Button>
              <Button size="sm" variant="ghost" onClick={handleDeleteContainer} className="gap-1.5 text-xs text-destructive hover:bg-destructive/10 rounded-xl">
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete</span>
              </Button>
            </div>
          </div>
        </CardHeader>

        {container.soilNotes && (
          <CardContent className="pt-0 border-t border-border/50">
            <div className="pt-3 text-xs text-muted-foreground">
              <span className="font-semibold text-foreground">Soil & Substrate Notes:</span> {container.soilNotes}
            </div>
          </CardContent>
        )}
      </Card>

      {/* Photos Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight">Container Photos</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setUploadPhotoOpen(true)} className="gap-1.5 text-xs rounded-xl border-emerald-500/30">
            <Camera className="h-3.5 w-3.5 text-emerald-500" />
            <span>Add Photo</span>
          </Button>
        </div>
        <PhotoGallery photos={containerPhotos ?? []} onDelete={(photoId) => deleteContainerPhoto.mutate(photoId)} />
      </div>

      {/* Plantings Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight">Plantings</h2>
          </div>
          <Button onClick={() => setAddPlantsOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1.5">
            <Plus className="h-4 w-4" />
            <span>Add Plants</span>
          </Button>
        </div>

        {plantingsLoading ? (
          <Skeleton className="h-28 rounded-2xl" />
        ) : groups.length === 0 ? (
          <Card className="border-dashed border-2 text-center p-8 bg-muted/20">
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              <Sprout className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">Nothing planted or planned in this container yet.</p>
              <Button size="sm" onClick={() => setAddPlantsOpen(true)} className="mt-2 bg-emerald-600 text-white text-xs">
                Add Plants Now
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {STATUS_SECTION_ORDER.filter((status) => groupsByStatus.has(status)).map((status) => (
              <div key={status} className="space-y-3">
                <div className="flex items-center gap-2 border-b pb-2">
                  <Badge variant="outline" className={`text-xs font-semibold uppercase tracking-wider ${STATUS_BADGE_STYLES[status]}`}>
                    {plantingStatusLabel(status)}
                  </Badge>
                  <span className="text-xs text-muted-foreground font-medium">
                    ({groupsByStatus.get(status)!.length} species)
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {groupsByStatus.get(status)!.map((group) => {
                    const { representative } = group
                    return (
                      <Card key={group.key} className="glass-card rounded-2xl overflow-hidden hover:border-emerald-500/40 transition-all">
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between gap-2">
                            <CardTitle className="text-base font-bold">
                              <Link
                                to={`/plants/${representative.plant.id}`}
                                state={{
                                  from: `/gardens/${gardenId}/containers/${containerId}`,
                                  fromLabel: container?.name ?? 'container',
                                }}
                                className="hover:text-emerald-600 dark:hover:text-emerald-400 hover:underline transition-colors"
                              >
                                {representative.nickname ?? representative.plant.commonName}
                              </Link>
                            </CardTitle>
                            <Badge className="bg-emerald-600 text-white font-bold text-xs shrink-0">
                              ×{group.totalQuantity}
                            </Badge>
                          </div>
                          {representative.nickname && (
                            <CardDescription className="text-xs">{representative.plant.commonName}</CardDescription>
                          )}
                        </CardHeader>

                        <CardContent className="space-y-3 text-xs text-muted-foreground">
                          {representative.plannedDate && (
                            <div className="flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-300">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              <span>Planned: {representative.plannedDate}</span>
                            </div>
                          )}
                          {representative.plantedDate && (
                            <div className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-300 font-medium">
                              <Calendar className="h-3.5 w-3.5 shrink-0" />
                              <span>Planted: {representative.plantedDate}</span>
                            </div>
                          )}
                          {representative.notes && (
                            <p className="bg-muted/40 p-2 rounded-lg italic text-[11px] border border-border/40">
                              "{representative.notes}"
                            </p>
                          )}

                          <div className="pt-2 border-t border-border/50 flex flex-wrap items-center gap-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingGroup(group)} className="h-8 text-xs rounded-lg">
                              <Edit3 className="h-3 w-3 mr-1" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => setPhotosGroup(group)} className="h-8 text-xs rounded-lg border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                              <Sparkles className="h-3 w-3 mr-1 text-emerald-500" />
                              AI Diagnostics
                            </Button>
                            <Button size="sm" variant="ghost" onClick={() => handleDeleteGroup(group)} className="h-8 text-xs text-destructive hover:bg-destructive/10 rounded-lg ml-auto">
                              <Trash2 className="h-3 w-3 mr-1" />
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

      {/* Dialogs */}
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
            for (const duplicate of editingGroup.plantings.slice(1)) {
              deletePlanting.mutate(duplicate.id)
            }
          }}
        />
      )}
    </div>
  )
}
