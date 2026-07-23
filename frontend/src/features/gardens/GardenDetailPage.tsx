import { useMemo, useState } from 'react'
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
import {
  ArrowLeft,
  Sparkles,
  Edit3,
  Trash2,
  MapPin,
  Sun,
  Thermometer,
  Calendar,
  Box,
  Plus,
  Camera,
  ChevronDown,
  ChevronUp,
  Package,
  ArrowRight,
} from 'lucide-react'

function DetailItem({ icon: Icon, label, value }: { icon?: React.ElementType; label: string; value: string | null }) {
  return (
    <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-muted/40 border border-border/40">
      {Icon && (
        <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
          <Icon className="h-4 w-4" />
        </div>
      )}
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
        <p className={value ? 'text-sm font-medium text-foreground' : 'text-sm text-muted-foreground italic'}>
          {value || 'Not specified'}
        </p>
      </div>
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
    return <Skeleton className="h-48 rounded-2xl" />
  }

  if (!garden) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-muted-foreground">Garden not found.</p>
        <Link to="/gardens" className="text-sm font-semibold text-emerald-600 hover:underline">
          Return to Gardens Dashboard
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/gardens"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          <span>Back to Gardens</span>
        </Link>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <Link to={`/gardens/${garden.id}/assistant`}>
            <Button
              size="sm"
              variant="outline"
              className="gap-1.5 border-emerald-500/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/10 rounded-xl text-xs font-semibold"
            >
              <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
              <span>AI Assistant</span>
            </Button>
          </Link>

          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditOpen(true)}
            className="gap-1.5 rounded-xl text-xs"
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Edit</span>
          </Button>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            className="gap-1.5 text-destructive hover:bg-destructive/10 hover:text-destructive rounded-xl text-xs"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Delete</span>
          </Button>
        </div>
      </div>

      {/* Main Garden Banner Card */}
      <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden glass-card">
        <CardHeader className="pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{garden.name}</h1>
                <Badge
                  variant="secondary"
                  className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border border-emerald-500/20 text-xs"
                >
                  {gardenTypeLabel(garden.type)}
                </Badge>
              </div>
              {garden.description && <p className="text-sm text-muted-foreground">{garden.description}</p>}
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Key Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <DetailItem
              icon={MapPin}
              label="Location"
              value={[[garden.city, garden.state].filter(Boolean).join(', '), garden.zipCode].filter(Boolean).join(' ') || null}
            />
            <DetailItem
              icon={Thermometer}
              label="Climate Zone"
              value={garden.climateZone ? climateZoneLabel(garden.climateZone) : null}
            />
            <DetailItem
              icon={Sun}
              label="Light Exposure"
              value={garden.lightExposure ? gardenLightExposureLabel(garden.lightExposure) : null}
            />
          </div>

          {/* Expandable Environmental Specifications */}
          {showMoreDetails && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-border/50 animate-fade-in">
              <DetailItem
                icon={Sun}
                label="Light Source"
                value={garden.lightSource ? gardenLightSourceLabel(garden.lightSource) : null}
              />
              <DetailItem
                icon={Sun}
                label="Sun Hours / Day"
                value={garden.lightHoursPerDay != null ? `${garden.lightHoursPerDay} hrs/day` : null}
              />
              <DetailItem
                icon={Calendar}
                label="Last Spring Frost"
                value={garden.lastFrostDate}
              />
              <DetailItem
                icon={Calendar}
                label="First Fall Frost"
                value={garden.firstFrostDate}
              />
            </div>
          )}

          <div className="flex justify-end pt-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowMoreDetails((v) => !v)}
              className="text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <span>{showMoreDetails ? 'Hide Environmental Details' : 'Show All Environmental Details'}</span>
              {showMoreDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Containers Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Box className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight">Containers & Plots</h2>
          </div>
          <Button
            size="sm"
            onClick={() => setCreateContainerOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1.5"
          >
            <Plus className="h-4 w-4" />
            <span>New Container</span>
          </Button>
        </div>

        {containersLoading ? (
          <Skeleton className="h-28 rounded-2xl" />
        ) : containers?.length === 0 ? (
          <Card className="border-dashed border-2 text-center p-6 bg-muted/20">
            <CardContent className="flex flex-col items-center gap-2 pt-4">
              <Box className="h-8 w-8 text-muted-foreground/60" />
              <p className="text-xs text-muted-foreground">No containers yet. Add a raised bed, pot, or plot to start planting.</p>
              <Button size="sm" onClick={() => setCreateContainerOpen(true)} className="mt-2 bg-emerald-600 text-white text-xs">
                Add Container
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {containers?.map((container) => (
              <Link key={container.id} to={`/gardens/${garden.id}/containers/${container.id}`}>
                <Card className="group h-full glass-card hover:-translate-y-1 transition-all rounded-2xl overflow-hidden hover:border-emerald-500/50">
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between gap-2">
                      <CardTitle className="text-base font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {container.name}
                      </CardTitle>
                      <Badge variant="outline" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-[11px] font-medium border-emerald-500/30 shrink-0">
                        {containerTypeLabel(container.containerType)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="text-xs text-muted-foreground flex flex-col justify-between gap-3">
                    <p>{container.sizeDescription || 'No size details specified'}</p>
                    <div className="flex items-center justify-end text-xs font-semibold text-emerald-600 dark:text-emerald-400 group-hover:translate-x-0.5 transition-transform gap-1">
                      <span>View Plots</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Plant Inventory */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight">Active Plantings</h2>
          </div>
          <div className="flex items-center gap-2">
            {inventory.length > 0 && (
              <Badge variant="outline" className="text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                {totalQuantity} plants total
              </Badge>
            )}
            <Button size="sm" onClick={() => setAddPlantOpen(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs gap-1.5">
              <Plus className="h-4 w-4" />
              <span>Add Plant</span>
            </Button>
          </div>
        </div>

        {inventory.length > 0 ? (
          <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <PlantInventoryList inventory={inventory} onRemoveTag={handleRemoveTag} />
            </CardContent>
          </Card>
        ) : (
          <p className="text-xs text-muted-foreground italic bg-muted/20 p-4 rounded-xl text-center border">
            No active plants in this garden yet. Add one directly or assign to a container above.
          </p>
        )}
      </div>

      {/* Garden Photo Gallery */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Camera className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <h2 className="text-xl font-bold tracking-tight">Garden Photos</h2>
          </div>
          <Button variant="outline" size="sm" onClick={() => setUploadPhotoOpen(true)} className="gap-1.5 text-xs rounded-xl border-emerald-500/30">
            <Camera className="h-3.5 w-3.5 text-emerald-500" />
            <span>Add Photo</span>
          </Button>
        </div>
        <PhotoGallery photos={photos ?? []} onDelete={(photoId) => deletePhoto.mutate(photoId)} />
      </div>

      {/* Dialogs */}
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
