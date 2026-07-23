import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
import { Sparkles } from 'lucide-react'
import type { PlantedPlantResponse } from '@/api/types'
import { useDeleteGarden, useGarden } from './api'
import { GardenFormDialog } from './GardenFormDialog'
import { useContainers } from '@/features/containers/api'
import { ContainerFormDialog } from '@/features/containers/ContainerFormDialog'
import { PlantInventoryList } from '@/features/plantings/PlantInventoryList'
import { QuickAddPlantDialog } from '@/features/plantings/QuickAddPlantDialog'
import { useAllPlantings, useDeleteInventoryPlanting } from '@/features/plantings/api'
import { buildGardenInventory } from '@/features/plantings/inventory'
import { usePhotos, useDeletePhoto } from '@/features/photos/api'
import { PhotoGallery } from '@/features/photos/PhotoGallery'
import { PhotoUploadDialog } from '@/features/photos/PhotoUploadDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  climateZoneLabel,
  containerTypeLabel,
  gardenLightExposureLabel,
  gardenLightSourceLabel,
  gardenTypeLabel,
} from '@/lib/labels'

function DetailRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
      <dd className={value ? 'text-sm' : 'text-sm text-muted-foreground italic'}>{value || 'Not set'}</dd>
    </div>
  )
}

export function GardenDetailPage() {
  const { gardenId } = useParams<{ gardenId: string }>()
  const navigate = useNavigate()
  const { data: garden, isLoading: gardenLoading } = useGarden(gardenId!)
  const { data: containers, isLoading: containersLoading } = useContainers(gardenId!)
  const { data: allPlantings } = useAllPlantings()
  const { data: photos } = usePhotos('GARDEN', gardenId!)
  const deleteGarden = useDeleteGarden()
  const deleteInventoryPlanting = useDeleteInventoryPlanting()
  const deletePhoto = useDeletePhoto('GARDEN', gardenId!)

  const [editOpen, setEditOpen] = useState(false)
  const [createContainerOpen, setCreateContainerOpen] = useState(false)
  const [addPlantOpen, setAddPlantOpen] = useState(false)
  const [uploadPhotoOpen, setUploadPhotoOpen] = useState(false)
  const [showMoreDetails, setShowMoreDetails] = useState(false)

  const gardenPlantings = useMemo(
    () => (allPlantings ?? []).filter((p) => p.gardenId === gardenId),
    [allPlantings, gardenId],
  )
  const inventory = useMemo(() => buildGardenInventory(gardenPlantings), [gardenPlantings])
  const totalQuantity = inventory.reduce((sum, item) => sum + item.totalQuantity, 0)

  const handleRemoveTag = (plantings: PlantedPlantResponse[]) => {
    for (const planting of plantings) {
      deleteInventoryPlanting.mutate(planting, {
        onError: (error: Error) => toast.error(error.message),
      })
    }
  }

  const handleDelete = () => {
    if (!garden) return
    if (!window.confirm(`Delete "${garden.name}"? This also deletes its containers and plantings.`)) return
    deleteGarden.mutate(garden.id, {
      onSuccess: () => {
        toast.success('Garden deleted')
        navigate('/dashboard')
      },
      onError: (error) => toast.error(error.message),
    })
  }

  if (gardenLoading) {
    return <Skeleton className="h-32" />
  }

  if (!garden) {
    return <p className="text-muted-foreground">Garden not found.</p>
  }

  return (
    <div className="flex flex-col gap-6">
      <Link to="/gardens" className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to gardens
      </Link>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-tight">{garden.name}</h1>
          <Badge variant="secondary">{gardenTypeLabel(garden.type)}</Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link to={`/gardens/${garden.id}/assistant`}>
            <Button variant="outline">
              <Sparkles data-icon="inline-start" />
              Planning assistant
            </Button>
          </Link>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            Edit
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <DetailRow label="Description" value={garden.description} />
          <DetailRow
            label="Location"
            value={
              [[garden.city, garden.state].filter(Boolean).join(', '), garden.zipCode].filter(Boolean).join(' ') ||
              null
            }
          />
          <DetailRow label="Climate zone" value={garden.climateZone ? climateZoneLabel(garden.climateZone) : null} />
        </CardContent>
        {showMoreDetails && (
          <CardContent className="grid grid-cols-1 gap-4 border-t pt-4 sm:grid-cols-3">
            <DetailRow
              label="Light source"
              value={garden.lightSource ? gardenLightSourceLabel(garden.lightSource) : null}
            />
            <DetailRow
              label="Light exposure"
              value={garden.lightExposure ? gardenLightExposureLabel(garden.lightExposure) : null}
            />
            <DetailRow
              label="Hours of light/day"
              value={garden.lightHoursPerDay != null ? `${garden.lightHoursPerDay} hrs/day` : null}
            />
            <DetailRow label="Last spring frost" value={garden.lastFrostDate} />
            <DetailRow label="First fall frost" value={garden.firstFrostDate} />
          </CardContent>
        )}
        <CardContent className="pt-0">
          <Button variant="outline" size="sm" onClick={() => setShowMoreDetails((v) => !v)}>
            {showMoreDetails ? 'Hide details' : 'View more details'}
          </Button>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-medium">Plant inventory</h2>
          <div className="flex items-center gap-3">
            {inventory.length > 0 && (
              <span className="text-sm text-muted-foreground">{totalQuantity} plants total</span>
            )}
            <Button size="sm" onClick={() => setAddPlantOpen(true)}>
              Add plant
            </Button>
          </div>
        </div>
        {inventory.length > 0 ? (
          <Card>
            <CardContent className="py-1">
              <PlantInventoryList inventory={inventory} onRemoveTag={handleRemoveTag} />
            </CardContent>
          </Card>
        ) : (
          <p className="text-muted-foreground">
            No plants yet. Add one directly to this garden, or to one of its containers.
          </p>
        )}
      </div>

      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Photos</h2>
          <Button variant="outline" size="sm" onClick={() => setUploadPhotoOpen(true)}>
            Add photo
          </Button>
        </div>
        <PhotoGallery photos={photos ?? []} onDelete={(photoId) => deletePhoto.mutate(photoId)} />
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-lg font-medium">Containers</h2>
          <Button onClick={() => setCreateContainerOpen(true)}>New container</Button>
        </div>

        {containersLoading ? (
          <Skeleton className="h-24" />
        ) : containers?.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center gap-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">
                No containers yet. Add a raised bed, pot, or plot.
              </p>
              <Button size="sm" variant="outline" onClick={() => setCreateContainerOpen(true)}>
                New container
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {containers?.map((container) => (
              <Link key={container.id} to={`/gardens/${garden.id}/containers/${container.id}`}>
                <Card className="h-full transition-colors hover:bg-muted/50">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                      <span>{container.name}</span>
                      <Badge variant="secondary">{containerTypeLabel(container.containerType)}</Badge>
                    </CardTitle>
                  </CardHeader>
                  {container.sizeDescription && (
                    <CardContent className="text-sm text-muted-foreground">{container.sizeDescription}</CardContent>
                  )}
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <GardenFormDialog open={editOpen} onOpenChange={setEditOpen} garden={garden} />
      <ContainerFormDialog open={createContainerOpen} onOpenChange={setCreateContainerOpen} gardenId={garden.id} />
      <QuickAddPlantDialog open={addPlantOpen} onOpenChange={setAddPlantOpen} lockedGardenId={garden.id} />
      <PhotoUploadDialog
        open={uploadPhotoOpen}
        onOpenChange={setUploadPhotoOpen}
        entityType="GARDEN"
        entityId={garden.id}
      />
    </div>
  )
}
