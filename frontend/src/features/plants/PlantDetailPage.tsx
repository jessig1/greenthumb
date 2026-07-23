import { Link, useLocation, useParams } from 'react-router'
import { usePlant } from './api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { lightRequirementLabel, plantCareDifficultyLabel, plantCategoryLabel, plantLifeCycleLabel } from '@/lib/labels'
import {
  ArrowLeft,
  Sun,
  Droplets,
  Thermometer,
  Layers,
  Sparkles,
  Scissors,
  AlertTriangle,
  Calendar,
  Sprout,
  CheckCircle2,
} from 'lucide-react'

function CareCard({
  icon: Icon,
  title,
  value,
  notes,
  accentColor = 'text-emerald-500',
}: {
  icon: React.ElementType
  title: string
  value?: string | null
  notes: string | null
  accentColor?: string
}) {
  if (!value && !notes) return null

  return (
    <div className="flex items-start gap-3 p-4 rounded-2xl bg-muted/30 border border-border/50 transition-all hover:bg-muted/50">
      <div className={`h-9 w-9 rounded-xl bg-background border border-border/60 shadow-xs flex items-center justify-center shrink-0 ${accentColor}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="space-y-1">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{title}</h3>
        {value && <p className="text-sm font-bold text-foreground">{value}</p>}
        {notes && <p className="text-xs text-muted-foreground leading-relaxed">{notes}</p>}
      </div>
    </div>
  )
}

interface PlantDetailNavState {
  from?: string
  fromLabel?: string
}

export function PlantDetailPage() {
  const { plantId } = useParams<{ plantId: string }>()
  const { data: plant, isLoading } = usePlant(plantId!)
  const location = useLocation()
  const { from, fromLabel } = (location.state as PlantDetailNavState | null) ?? {}

  if (isLoading) {
    return <Skeleton className="h-64 rounded-2xl" />
  }

  if (!plant) {
    return (
      <div className="text-center py-12 space-y-3">
        <p className="text-muted-foreground">Plant species not found in catalog.</p>
        <Link to="/plants" className="text-sm font-semibold text-emerald-600 hover:underline">
          Back to Plant Catalog
        </Link>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 animate-fade-in">
      {/* Back Link */}
      <Link
        to={from ?? '/plants'}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to {fromLabel ?? 'Catalog'}</span>
      </Link>

      {/* Hero Banner Card */}
      <Card className="rounded-2xl border-border/70 shadow-sm glass-card overflow-hidden">
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground">{plant.commonName}</h1>
                <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-semibold border-emerald-500/20 text-xs">
                  {plantCategoryLabel(plant.category)}
                </Badge>
                {plant.lifeCycle && (
                  <Badge variant="outline" className="text-xs font-medium">
                    {plantLifeCycleLabel(plant.lifeCycle)}
                  </Badge>
                )}
                {plant.careDifficulty && (
                  <Badge variant="outline" className="text-xs font-medium border-amber-500/30 text-amber-700 dark:text-amber-300">
                    {plantCareDifficultyLabel(plant.careDifficulty)} care
                  </Badge>
                )}
              </div>
              {plant.scientificName && (
                <p className="text-sm italic text-muted-foreground font-serif">{plant.scientificName}</p>
              )}
            </div>
          </div>
          {plant.description && <CardDescription className="text-sm pt-2 text-foreground/90 leading-relaxed">{plant.description}</CardDescription>}
        </CardHeader>
      </Card>

      {/* Care Guide Grid */}
      <Card className="rounded-2xl border-border/70 shadow-sm">
        <CardHeader className="pb-3 border-b border-border/50 bg-muted/20">
          <div className="flex items-center gap-2">
            <Sprout className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            <CardTitle className="text-lg font-bold">Growing & Care Guide</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CareCard
              icon={Sun}
              title="Light Exposure"
              value={lightRequirementLabel(plant.lightRequirement)}
              notes={plant.lightNotes}
              accentColor="text-amber-500"
            />
            <CareCard
              icon={Droplets}
              title="Watering Schedule"
              value={plant.wateringIntervalDays ? `Every ${plant.wateringIntervalDays} days` : null}
              notes={plant.wateringNotes}
              accentColor="text-blue-500"
            />
            <CareCard
              icon={Thermometer}
              title="Temperature Range"
              notes={plant.temperatureNotes}
              accentColor="text-rose-500"
            />
            <CareCard
              icon={Layers}
              title="Soil & Substrate"
              notes={plant.soilNotes}
              accentColor="text-amber-700 dark:text-amber-400"
            />
            <CareCard
              icon={Sparkles}
              title="Feeding & Fertilizer"
              notes={plant.feedingNotes}
              accentColor="text-purple-500"
            />
            <CareCard
              icon={Scissors}
              title="Pruning & Maintenance"
              notes={plant.pruningNotes}
              accentColor="text-teal-500"
            />
            <CareCard
              icon={AlertTriangle}
              title="Toxicity / Warnings"
              notes={plant.toxicityNotes}
              accentColor="text-destructive"
            />
          </div>
        </CardContent>
      </Card>

      {/* Harvest Guide Card */}
      {plant.harvestable && (
        <Card className="rounded-2xl border-border/70 shadow-sm bg-gradient-to-br from-amber-500/5 via-background to-emerald-500/5">
          <CardHeader className="pb-3 border-b border-border/50">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              <CardTitle className="text-lg font-bold">Harvest Guide</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-4 sm:p-6 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Days to Maturity</p>
                <p className="text-base font-bold text-foreground">
                  {plant.daysToMaturityMin || plant.daysToMaturityMax
                    ? `${plant.daysToMaturityMin ?? '?'}-${plant.daysToMaturityMax ?? '?'} days`
                    : 'Not specified'}
                </p>
              </div>
            </div>
            {plant.harvestNotes && (
              <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-border/40">
                {plant.harvestNotes}
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
