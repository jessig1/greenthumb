import { useMemo, useState } from 'react'
import { ArrowLeft, Bot, Camera, MapPin, Pencil, Plus, Sprout, SunMedium, Trash2 } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'
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
      <dt className="text-xs font-semibold tracking-wide text-muted-foreground uppercase">{label}</dt>
      <dd className={value ? 'mt-1 text-sm font-medium' : 'mt-1 text-sm text-muted-foreground italic'}>
        {value || 'Not set'}
      </dd>
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
    () => (allPlantings ?? []).filter((planting) => planting.gardenId === gardenId),
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

  if (gardenLoading) return <Skeleton className="h-72 rounded-3xl" />
  if (!garden) return <p className="text-muted-foreground">Garden not found.</p>

  return (
    <div className="flex flex-col gap-8">
      <Link
        to="/gardens"
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to gardens
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-accent/85 via-card to-secondary/70 p-5 sm:p-7">
        <div className="pointer-events-none absolute -right-12 -bottom-20 size-56 rounded-full bg-primary/8" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-3">
              <span className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-md shadow-primary/15">
                <Sprout className="size-5" />
              </span>
              <Badge variant="secondary">{gardenTypeLabel(garden.type)}</Badge>
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{garden.name}</h1>
            {garden.description && (
              <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {garden.description}
              </p>
            )}
            <div className="mt-4 flex flex-wrap gap-3 text-xs font-medium text-muted-foreground">
              {(garden.city || garden.state) && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-primary" />
                  {[garden.city, garden.state].filter(Boolean).join(', ')}
                </span>
              )}
              {garden.lightHoursPerDay != null && (
                <span className="flex items-center gap-1.5">
                  <SunMedium className="size-3.5 text-amber-500" />
                  {garden.lightHoursPerDay} hours of light
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link to={`/gardens/${garden.id}/assistant`}>
                <Bot />
                Ask assistant
              </Link>
            </Button>
            <Button variant="outline" size="icon" onClick={() => setEditOpen(true)} aria-label="Edit garden">
              <Pencil />
            </Button>
            <Button variant="destructive" size="icon" onClick={handleDelete} aria-label="Delete garden">
              <Trash2 />
            </Button>
          </div>
        </div>
      </section>

      <Card>
        <CardContent className="grid grid-cols-2 gap-5 sm:grid-cols-3">
          <DetailRow
            label="Location"
            value={[[garden.city, garden.state].filter(Boolean).join(', '), garden.zipCode].filter(Boolean).join(' ') || null}
          />
          <DetailRow label="Climate zone" value={garden.climateZone ? climateZoneLabel(garden.climateZone) : null} />
          <DetailRow label="Garden type" value={gardenTypeLabel(garden.type)} />
        </CardContent>
        {showMoreDetails && (
          <CardContent className="grid grid-cols-2 gap-5 border-t border-border/60 pt-4 sm:grid-cols-3">
            <DetailRow label="Light source" value={garden.lightSource ? gardenLightSourceLabel(garden.lightSource) : null} />
            <DetailRow label="Light exposure" value={garden.lightExposure ? gardenLightExposureLabel(garden.lightExposure) : null} />
            <DetailRow label="Hours of light" value={garden.lightHoursPerDay != null ? `${garden.lightHoursPerDay} hrs/day` : null} />
            <DetailRow label="Last spring frost" value={garden.lastFrostDate} />
            <DetailRow label="First fall frost" value={garden.firstFrostDate} />
          </CardContent>
        )}
        <CardContent className="pt-0">
          <Button variant="ghost" size="sm" onClick={() => setShowMoreDetails((value) => !value)}>
            {showMoreDetails ? 'Hide growing details' : 'View growing details'}
          </Button>
        </CardContent>
      </Card>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">What is growing</p>
            <h2 className="section-title mt-1">Plant inventory</h2>
          </div>
          <div className="flex items-center gap-3">
            {inventory.length > 0 && <span className="hidden text-sm text-muted-foreground sm:inline">{totalQuantity} plants</span>}
            <Button size="sm" onClick={() => setAddPlantOpen(true)}>
              <Plus />
              Add plant
            </Button>
          </div>
        </div>
        {inventory.length > 0 ? (
          <Card>
            <CardContent className="py-0">
              <PlantInventoryList inventory={inventory} onRemoveTag={handleRemoveTag} />
            </CardContent>
          </Card>
        ) : (
          <div className="surface-panel flex flex-col items-center px-5 py-10 text-center">
            <Sprout className="size-7 text-primary" />
            <p className="mt-3 font-semibold">No plants here yet</p>
            <p className="mt-1 text-sm text-muted-foreground">Add one directly to this garden or place it in a container.</p>
          </div>
        )}
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Garden journal</p>
            <h2 className="section-title mt-1">Photos</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setUploadPhotoOpen(true)}>
            <Camera />
            Add photo
          </Button>
        </div>
        <PhotoGallery photos={photos ?? []} onDelete={(photoId) => deletePhoto.mutate(photoId)} />
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="eyebrow">Organize the space</p>
            <h2 className="section-title mt-1">Containers</h2>
          </div>
          <Button onClick={() => setCreateContainerOpen(true)}>
            <Plus />
            <span className="hidden sm:inline">New container</span>
            <span className="sm:hidden">New</span>
          </Button>
        </div>

        {containersLoading ? (
          <Skeleton className="h-28 rounded-2xl" />
        ) : containers?.length === 0 ? (
          <div className="surface-panel px-5 py-9 text-center text-sm text-muted-foreground">
            No containers yet. Add a raised bed, pot, or plot.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {containers?.map((container) => (
              <Link key={container.id} to={`/gardens/${garden.id}/containers/${container.id}`} className="group">
                <Card className="h-full transition-all hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2">
                      <span className="transition-colors group-hover:text-primary">{container.name}</span>
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
      </section>

      <GardenFormDialog open={editOpen} onOpenChange={setEditOpen} garden={garden} />
      <ContainerFormDialog open={createContainerOpen} onOpenChange={setCreateContainerOpen} gardenId={garden.id} />
      <QuickAddPlantDialog open={addPlantOpen} onOpenChange={setAddPlantOpen} lockedGardenId={garden.id} />
      <PhotoUploadDialog open={uploadPhotoOpen} onOpenChange={setUploadPhotoOpen} entityType="GARDEN" entityId={garden.id} />
    </div>
  )
}
