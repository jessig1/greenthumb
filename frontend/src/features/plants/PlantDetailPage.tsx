import type { ComponentType } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  Droplets,
  Flower2,
  Leaf,
  Scissors,
  Sprout,
  SunMedium,
  ThermometerSun,
} from 'lucide-react'
import { Link, useLocation, useParams } from 'react-router'
import { usePlant } from './api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { lightRequirementLabel, plantCareDifficultyLabel, plantCategoryLabel, plantLifeCycleLabel } from '@/lib/labels'

function CareSection({
  icon: Icon,
  title,
  value,
  notes,
}: {
  icon: ComponentType<{ className?: string }>
  title: string
  value?: string | null
  notes: string | null
}) {
  if (!value && !notes) return null
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/25 p-4">
      <div className="flex items-center gap-2 text-primary">
        <span className="flex size-8 items-center justify-center rounded-xl bg-accent/80">
          <Icon className="size-4" />
        </span>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      </div>
      {value && <p className="mt-3 font-semibold">{value}</p>}
      {notes && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{notes}</p>}
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
    return <Skeleton className="h-96 rounded-3xl" />
  }

  if (!plant) {
    return <p className="text-muted-foreground">Plant not found.</p>
  }

  return (
    <div className="flex flex-col gap-7">
      <Link
        to={from ?? '/plants'}
        className="inline-flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Back to {fromLabel ?? 'plant library'}
      </Link>

      <section className="relative overflow-hidden rounded-3xl border border-primary/10 bg-gradient-to-br from-accent/90 via-card to-secondary/80 p-5 sm:p-8">
        <div className="pointer-events-none absolute -right-12 -bottom-20 size-64 rounded-full bg-primary/8" />
        <div className="relative grid gap-6 sm:grid-cols-[auto_1fr] sm:items-center">
          {plant.imageUrl ? (
            <img
              src={plant.imageUrl}
              alt={plant.commonName}
              className="size-28 rounded-3xl object-cover shadow-lg sm:size-36"
            />
          ) : (
            <span className="flex size-24 items-center justify-center rounded-3xl bg-primary text-primary-foreground shadow-lg shadow-primary/20 sm:size-32">
              <Leaf className="size-11 sm:size-14" />
            </span>
          )}
          <div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary">{plantCategoryLabel(plant.category)}</Badge>
              {plant.lifeCycle && <Badge variant="outline">{plantLifeCycleLabel(plant.lifeCycle)}</Badge>}
              {plant.careDifficulty && (
                <Badge variant="outline">{plantCareDifficultyLabel(plant.careDifficulty)} care</Badge>
              )}
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-[-0.04em] sm:text-5xl">{plant.commonName}</h1>
            {plant.scientificName && <p className="mt-1 italic text-muted-foreground">{plant.scientificName}</p>}
            {plant.description && (
              <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                {plant.description}
              </p>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <p className="eyebrow">Growing essentials</p>
          <h2 className="section-title mt-1">Care guide</h2>
        </div>
        <Card>
          <CardContent className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <CareSection
              icon={SunMedium}
              title="Light"
              value={lightRequirementLabel(plant.lightRequirement)}
              notes={plant.lightNotes}
            />
            <CareSection icon={ThermometerSun} title="Temperature" notes={plant.temperatureNotes} />
            <CareSection
              icon={Droplets}
              title="Water"
              value={plant.wateringIntervalDays ? `Every ${plant.wateringIntervalDays} days` : null}
              notes={plant.wateringNotes}
            />
            <CareSection icon={Sprout} title="Soil" notes={plant.soilNotes} />
            <CareSection icon={Flower2} title="Feeding" notes={plant.feedingNotes} />
            <CareSection icon={Scissors} title="Pruning" notes={plant.pruningNotes} />
            <CareSection icon={AlertTriangle} title="Toxicity & warnings" notes={plant.toxicityNotes} />
          </CardContent>
        </Card>
      </section>

      {plant.harvestable && (
        <section className="rounded-3xl border border-amber-200/70 bg-gradient-to-br from-amber-50 to-lime-50 p-5 text-foreground shadow-sm sm:p-7">
          <div className="flex items-start gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-amber-400/20 text-amber-700">
              <CalendarDays className="size-5" />
            </span>
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-amber-700 uppercase">From garden to table</p>
              <h2 className="mt-1 text-xl font-semibold">Harvest guide</h2>
              {(plant.daysToMaturityMin || plant.daysToMaturityMax) && (
                <p className="mt-3 font-semibold">
                  {plant.daysToMaturityMin ?? '?'}–{plant.daysToMaturityMax ?? '?'} days to maturity
                </p>
              )}
              {plant.harvestNotes && (
                <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">{plant.harvestNotes}</p>
              )}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}
