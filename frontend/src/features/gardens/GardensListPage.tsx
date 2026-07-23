import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { toast } from 'sonner'
import type { PlantedPlantResponse } from '@/api/types'
import { useGardens } from './api'
import { NewGardenWizardDialog } from './NewGardenWizardDialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { gardenTypeLabel } from '@/lib/labels'
import { QuickAddPlantDialog } from '@/features/plantings/QuickAddPlantDialog'
import { PlantInventoryList } from '@/features/plantings/PlantInventoryList'
import { useAllPlantings, useDeleteInventoryPlanting } from '@/features/plantings/api'
import { buildPlantInventory } from '@/features/plantings/inventory'
import { RecentIdentifications } from '@/features/ai/RecentIdentifications'
import { useAuth } from '@/features/auth/AuthContext'
import {
  Sprout,
  Plus,
  Layers,
  MapPin,
  Sun,
  ArrowRight,
  Package,
} from 'lucide-react'

export function GardensListPage() {
  const { user } = useAuth()
  const { data: gardens, isLoading } = useGardens()
  const { data: allPlantings } = useAllPlantings()
  const deleteInventoryPlanting = useDeleteInventoryPlanting()
  const [createOpen, setCreateOpen] = useState(false)
  const [addPlantOpen, setAddPlantOpen] = useState(false)

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

  const greetingTime = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 18) return 'Good afternoon'
    return 'Good evening'
  }, [])

  const handleRemoveTag = (plantings: PlantedPlantResponse[]) => {
    for (const planting of plantings) {
      deleteInventoryPlanting.mutate(planting, {
        onError: (error: Error) => toast.error(error.message),
      })
    }
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Hero Welcome & Quick Stats */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/90 via-emerald-800/80 to-teal-900/90 p-6 sm:p-8 text-white shadow-xl">
        <div className="absolute -right-10 -bottom-10 h-48 w-48 rounded-full bg-emerald-500/20 blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-200 text-xs font-medium backdrop-blur-sm">
              <Sun className="h-3.5 w-3.5 text-amber-300" />
              <span>{greetingTime}, {user?.displayName?.split(' ')[0] || 'Gardener'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Your Gardening Hub
            </h1>
            <p className="text-sm text-emerald-100/80 leading-relaxed">
              Track your plots, manage containers, and discover smart AI recommendations for optimal growth.
            </p>
          </div>

          {/* Quick Action Buttons on Hero */}
          <div className="flex flex-wrap gap-2.5">
            <Button
              onClick={() => setCreateOpen(true)}
              className="bg-white text-emerald-950 hover:bg-emerald-50 shadow-md font-semibold gap-1.5 rounded-xl text-xs sm:text-sm px-4 py-2.5"
            >
              <Plus className="h-4 w-4 text-emerald-700" />
              New Garden
            </Button>
            <Button
              variant="outline"
              onClick={() => setAddPlantOpen(true)}
              className="border-emerald-300/40 text-white hover:bg-emerald-800/50 bg-emerald-950/40 backdrop-blur-sm gap-1.5 rounded-xl text-xs sm:text-sm px-4 py-2.5"
            >
              <Sprout className="h-4 w-4 text-emerald-300" />
              Add Plant
            </Button>
          </div>
        </div>

        {/* Dashboard Overview Cards Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-emerald-700/50">
          <div className="bg-emerald-950/40 backdrop-blur-md rounded-xl p-3 border border-emerald-500/20 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-300 shrink-0">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-200/70">Gardens</p>
              <p className="text-lg font-bold text-white">{gardens?.length ?? 0}</p>
            </div>
          </div>

          <div className="bg-emerald-950/40 backdrop-blur-md rounded-xl p-3 border border-emerald-500/20 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-teal-500/20 flex items-center justify-center text-teal-300 shrink-0">
              <Sprout className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-200/70">Total Plants</p>
              <p className="text-lg font-bold text-white">{totalQuantity}</p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 bg-emerald-950/40 backdrop-blur-md rounded-xl p-3 border border-emerald-500/20 flex items-center gap-3">
            <div className="h-9 w-9 rounded-lg bg-amber-500/20 flex items-center justify-center text-amber-300 shrink-0">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs text-emerald-200/70">Unique Species</p>
              <p className="text-lg font-bold text-white">{inventory.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Gardens List Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight">Your Gardens</h2>
            <p className="text-xs text-muted-foreground">Select a garden to manage containers & plantings</p>
          </div>
          <Button variant="ghost" size="sm" onClick={() => setCreateOpen(true)} className="text-xs text-emerald-600 dark:text-emerald-400 gap-1">
            <Plus className="h-3.5 w-3.5" />
            <span>Add Garden</span>
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-2xl" />
            ))}
          </div>
        ) : gardens?.length === 0 ? (
          <Card className="border-dashed border-2 text-center p-8 bg-muted/20">
            <CardContent className="flex flex-col items-center gap-3 pt-6">
              <div className="h-12 w-12 rounded-full bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Sprout className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-semibold">No gardens registered yet</h3>
                <p className="text-xs text-muted-foreground max-w-sm">
                  Create your first outdoor plot, raised bed, or windowsill indoor collection.
                </p>
              </div>
              <Button onClick={() => setCreateOpen(true)} className="mt-2 bg-emerald-600 text-white rounded-xl gap-2">
                <Plus className="h-4 w-4" />
                Create your first garden
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {gardens?.map((garden) => {
              const plantCount = plantCountByGarden.get(garden.id) ?? 0
              return (
                <Link key={garden.id} to={`/gardens/${garden.id}`}>
                  <Card className="group h-full glass-card hover:-translate-y-1 transition-all duration-200 rounded-2xl overflow-hidden hover:border-emerald-500/50">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="text-lg font-bold group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-1">
                          {garden.name}
                        </CardTitle>
                        <Badge
                          variant="secondary"
                          className="shrink-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-medium text-xs border border-emerald-500/20"
                        >
                          {gardenTypeLabel(garden.type)}
                        </Badge>
                      </div>
                      {garden.description && (
                        <CardDescription className="line-clamp-2 text-xs pt-1">
                          {garden.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent className="pt-0 text-xs text-muted-foreground flex flex-col gap-3">
                      <div className="flex items-center justify-between border-t border-border/50 pt-3">
                        {(garden.city || garden.state) ? (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <MapPin className="h-3.5 w-3.5 text-emerald-500" />
                            <span>{[garden.city, garden.state].filter(Boolean).join(', ')}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic">No location set</span>
                        )}

                        <div className="flex items-center gap-1 font-semibold text-foreground bg-muted/60 px-2.5 py-1 rounded-lg">
                          <Sprout className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span>{plantCount} {plantCount === 1 ? 'plant' : 'plants'}</span>
                        </div>
                      </div>

                      {/* Card Footer Link Hint */}
                      <div className="flex items-center justify-end text-xs font-semibold text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                        <span>View Details</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        )}
      </div>

      {/* Plant Inventory Section */}
      {inventory.length > 0 && (
        <Card className="rounded-2xl border-border/70 shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                  <Package className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Plant Inventory</CardTitle>
                  <CardDescription className="text-xs">Summary of all active plantings across gardens</CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="font-semibold text-xs border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                {totalQuantity} plants total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <PlantInventoryList inventory={inventory} onRemoveTag={handleRemoveTag} />
          </CardContent>
        </Card>
      )}

      {/* AI Recent Identifications */}
      <RecentIdentifications />

      {/* Action Dialogs */}
      <NewGardenWizardDialog open={createOpen} onOpenChange={setCreateOpen} />
      <QuickAddPlantDialog open={addPlantOpen} onOpenChange={setAddPlantOpen} />
    </div>
  )
}
