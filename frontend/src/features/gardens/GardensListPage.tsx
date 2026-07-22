import { useMemo, useState } from 'react'
import { ArrowRight, House, MapPin, Plus, ScanLine, Sprout, SunMedium, Trees } from 'lucide-react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import type { PlantedPlantResponse } from '@/api/types'
import { useGardens } from './api'
import { NewGardenWizardDialog } from './NewGardenWizardDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { gardenTypeLabel } from '@/lib/labels'
import { QuickAddPlantDialog } from '@/features/plantings/QuickAddPlantDialog'
import { PlantInventoryList } from '@/features/plantings/PlantInventoryList'
import { useAllPlantings, useDeleteInventoryPlanting } from '@/features/plantings/api'
import { buildPlantInventory } from '@/features/plantings/inventory'
import { RecentIdentifications } from '@/features/ai/RecentIdentifications'
import { IdentifyPlantDialog } from '@/features/ai/IdentifyPlantDialog'
import { useAuth } from '@/features/auth/AuthContext'

export function GardensListPage() {
  const { user } = useAuth()
  const { data: gardens, isLoading } = useGardens()
  const { data: allPlantings } = useAllPlantings()
  const deleteInventoryPlanting = useDeleteInventoryPlanting()
  const [createOpen, setCreateOpen] = useState(false)
  const [addPlantOpen, setAddPlantOpen] = useState(false)
  const [identifyOpen, setIdentifyOpen] = useState(false)

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

  const firstName = user?.displayName?.split(' ')[0]

  return (
    <div className="flex flex-col gap-8 sm:gap-10">
      <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-primary via-primary to-emerald-700 px-5 py-7 text-primary-foreground shadow-xl shadow-primary/10 sm:px-8 sm:py-9">
        <div className="pointer-events-none absolute -top-16 -right-12 size-52 rounded-full border border-white/10 bg-white/5" />
        <div className="pointer-events-none absolute right-24 -bottom-20 size-44 rounded-full border border-white/10" />
        <div className="relative max-w-2xl">
          <p className="mb-2 text-xs font-semibold tracking-[0.16em] text-primary-foreground/70 uppercase">
            Your garden today
          </p>
          <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">
            {firstName ? `Welcome back, ${firstName}.` : 'Welcome back.'}
          </h1>
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-primary-foreground/75 sm:text-base">
            Keep every space thriving, from the first seed to the final harvest.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Button
              className="bg-white text-primary shadow-lg shadow-black/10 hover:bg-white/90"
              onClick={() => setCreateOpen(true)}
            >
              <Plus />
              New garden
            </Button>
            <Button
              variant="outline"
              className="border-white/25 bg-white/10 text-white hover:border-white/35 hover:bg-white/15 hover:text-white"
              onClick={() => setIdentifyOpen(true)}
            >
              <ScanLine />
              Identify a plant
            </Button>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">Your spaces</p>
            <h2 className="section-title mt-1">Gardens</h2>
          </div>
          {(gardens?.length ?? 0) > 0 && (
            <Button variant="outline" size="sm" onClick={() => setCreateOpen(true)}>
              <Plus />
              <span className="hidden sm:inline">New garden</span>
              <span className="sm:hidden">New</span>
            </Button>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : gardens?.length === 0 ? (
          <div className="surface-panel flex flex-col items-center px-5 py-12 text-center">
            <span className="flex size-14 items-center justify-center rounded-2xl bg-accent text-primary">
              <Sprout className="size-7" />
            </span>
            <h3 className="mt-4 text-lg font-semibold">Start your first garden</h3>
            <p className="mt-1 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Add an indoor shelf, patio collection, raised bed, or any space where you grow.
            </p>
            <Button className="mt-5" onClick={() => setCreateOpen(true)}>
              <Plus />
              Create a garden
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {gardens?.map((garden) => {
              const GardenIcon = garden.type === 'INDOOR' ? House : Trees
              const location = [garden.city, garden.state].filter(Boolean).join(', ')
              return (
                <Link key={garden.id} to={`/gardens/${garden.id}`} className="group">
                  <Card className="relative h-full min-h-48 overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:shadow-lg hover:shadow-primary/5">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-emerald-500 to-lime-400 opacity-70" />
                    <CardContent className="flex h-full flex-col p-1">
                      <div className="flex items-start justify-between gap-4">
                        <span className="flex size-12 items-center justify-center rounded-2xl bg-accent/80 text-primary">
                          <GardenIcon className="size-6" />
                        </span>
                        <Badge variant="secondary">{gardenTypeLabel(garden.type)}</Badge>
                      </div>
                      <div className="mt-5">
                        <h3 className="text-xl font-semibold tracking-[-0.025em] transition-colors group-hover:text-primary">
                          {garden.name}
                        </h3>
                        {garden.description && (
                          <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                            {garden.description}
                          </p>
                        )}
                      </div>
                      <div className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-2 pt-5 text-xs font-medium text-muted-foreground">
                        <span className="flex items-center gap-1.5">
                          <Sprout className="size-3.5 text-primary" />
                          {plantCountByGarden.get(garden.id) ?? 0} plants
                        </span>
                        {location && (
                          <span className="flex items-center gap-1.5">
                            <MapPin className="size-3.5" />
                            {location}
                          </span>
                        )}
                        {garden.lightHoursPerDay != null && (
                          <span className="flex items-center gap-1.5">
                            <SunMedium className="size-3.5" />
                            {garden.lightHoursPerDay} hrs light
                          </span>
                        )}
                        <ArrowRight className="ml-auto size-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {inventory.length > 0 && (
        <section className="flex flex-col gap-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="eyebrow">At a glance</p>
              <h2 className="section-title mt-1">Plant inventory</h2>
            </div>
            <span className="rounded-full bg-secondary px-3 py-1.5 text-xs font-semibold text-secondary-foreground">
              {totalQuantity} plants total
            </span>
          </div>
          <Card>
            <CardContent className="py-0">
              <PlantInventoryList inventory={inventory} onRemoveTag={handleRemoveTag} />
            </CardContent>
          </Card>
        </section>
      )}

      <RecentIdentifications />

      <NewGardenWizardDialog open={createOpen} onOpenChange={setCreateOpen} />
      <QuickAddPlantDialog open={addPlantOpen} onOpenChange={setAddPlantOpen} />
      <IdentifyPlantDialog open={identifyOpen} onOpenChange={setIdentifyOpen} />
    </div>
  )
}
