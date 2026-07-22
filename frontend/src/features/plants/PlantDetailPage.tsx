import { Link, useLocation, useParams } from 'react-router'
import { usePlant } from './api'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { lightRequirementLabel, plantCareDifficultyLabel, plantCategoryLabel, plantLifeCycleLabel } from '@/lib/labels'

function CareSection({ title, value, notes }: { title: string; value?: string | null; notes: string | null }) {
  if (!value && !notes) return null
  return (
    <div>
      <h3 className="text-sm font-medium text-muted-foreground">{title}</h3>
      {value && <p className="font-medium">{value}</p>}
      {notes && <p className="text-sm">{notes}</p>}
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
    return <Skeleton className="h-64" />
  }

  if (!plant) {
    return <p className="text-muted-foreground">Plant not found.</p>
  }

  return (
    <div className="flex flex-col gap-4">
      <Link to={from ?? '/plants'} className="text-sm text-muted-foreground hover:text-foreground">
        ← Back to {fromLabel ?? 'catalog'}
      </Link>

      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{plant.commonName}</h1>
          <Badge variant="secondary">{plantCategoryLabel(plant.category)}</Badge>
          {plant.lifeCycle && <Badge variant="outline">{plantLifeCycleLabel(plant.lifeCycle)}</Badge>}
          {plant.careDifficulty && (
            <Badge variant="outline">{plantCareDifficultyLabel(plant.careDifficulty)} care</Badge>
          )}
        </div>
        {plant.scientificName && <p className="italic text-muted-foreground">{plant.scientificName}</p>}
        {plant.description && <p className="mt-2">{plant.description}</p>}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Care guide</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <CareSection title="Light" value={lightRequirementLabel(plant.lightRequirement)} notes={plant.lightNotes} />
          <CareSection title="Temperature" notes={plant.temperatureNotes} />
          <CareSection
            title="Water"
            value={plant.wateringIntervalDays ? `Every ${plant.wateringIntervalDays} days` : null}
            notes={plant.wateringNotes}
          />
          <CareSection title="Soil" notes={plant.soilNotes} />
          <CareSection title="Feeding" notes={plant.feedingNotes} />
          <CareSection title="Pruning" notes={plant.pruningNotes} />
          <CareSection title="Toxicity / warnings" notes={plant.toxicityNotes} />
        </CardContent>
      </Card>

      {plant.harvestable && (
        <Card>
          <CardHeader>
            <CardTitle>Harvest guide</CardTitle>
          </CardHeader>
          <CardContent>
            <CareSection
              title="Days to maturity"
              value={
                plant.daysToMaturityMin || plant.daysToMaturityMax
                  ? `${plant.daysToMaturityMin ?? '?'}-${plant.daysToMaturityMax ?? '?'} days`
                  : null
              }
              notes={plant.harvestNotes}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}
